import { createClient } from '@supabase/supabase-js';

const rateMap = new Map();
function rateLimit(key, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const entry = rateMap.get(key) || { count: 0, start: now };
  if (now - entry.start > windowMs) { entry.count = 0; entry.start = now; }
  entry.count++;
  rateMap.set(key, entry);
  return entry.count <= limit;
}

export default async function handler(req, res) {
  if (req.query?.check === '1') {
    const result = await checkQuality(req.body?.imageUrl, req.body?.charPhotos, req.body?.templateUrl);
    return res.status(200).json(result);
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  // rate limit disabled

  const apiKey = process.env.XMODE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'XMODE_API_KEY not configured' });

  const supabaseUrl = process.env.seducecraft_SUPABASE_URL || process.env.NEXT_PUBLIC_seducecraft_SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.seducecraft_SUPABASE_SECRET_KEY || process.env.seducecraft_SUPABASE_SERVICE_ROLE_KEY || process.env.seducecraft_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_seducecraft_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_seducecraft_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const keys = Object.keys(process.env).filter(k => k.toLowerCase().includes('supabase') || k.toLowerCase().includes('xmode'));
    return res.status(500).json({ error: 'Supabase not configured on server', available: keys });
  }

  const { prompt, endUserEmail, model, n, referenceBase64, references, action, userId, name, photos } = req.body || {};
  
  // Character operations
  if (action === 'saveCharacter') {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('anon_characters').insert({ user_id: userId, name, photos }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
  if (action === 'deleteCharacter') {
    const { id } = req.body;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.from('anon_characters').delete().eq('id', id).eq('user_id', userId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }
  if (action === 'updateCharacter') {
    const { id, photos: newPhotos } = req.body;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.from('anon_characters').update({ photos: newPhotos }).eq('id', id).eq('user_id', userId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }
  if (action === 'loadCharacters') {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('anon_characters').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data || []);
  }
  if (action === 'saveGallery') {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { item } = req.body;
    const row = {
      user_id: userId,
      title: item.title || null,
      prompt: item.prompt || null,
      character_name: item.characterName || null,
      src: item.src,
      model: item.model || null,
      size: item.size || null
    };
    const { data, error } = await supabase.from('anon_gallery').insert(row).select().single();
    if (error) return res.status(500).json({ error: error.message, details: error });
    return res.status(200).json(data);
  }
  if (action === 'loadGallery') {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('anon_gallery').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    const mapped = (data || []).map(d => ({
      id: d.id,
      title: d.title,
      prompt: d.prompt,
      characterName: d.character_name,
      src: d.src,
      model: d.model,
      size: d.size,
      createdAt: new Date(d.created_at).getTime()
    }));
    return res.status(200).json(mapped);
  }
  if (action === 'deleteGallery') {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { id } = req.body;
    const { error } = await supabase.from('anon_gallery').delete().eq('id', id).eq('user_id', userId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }
  
  if (!prompt) return res.status(400).json({ error: 'prompt required' });

  const email = endUserEmail || 'anon@seducecraft.app';

  let refUrls = [];
  const base64List = Array.isArray(referenceBase64) ? referenceBase64 : (referenceBase64 ? [referenceBase64] : []);
  const supabase = createClient(supabaseUrl, supabaseKey);
  // Upload base64 first so character photos are image_1
  for (const b64 of base64List) {
    if (b64 && b64.startsWith('data:')) {
      try {
        const base64 = b64.split(',')[1];
        const mime = b64.match(/data:(.*?);/)?.[1] || 'image/jpeg';
        const buf = Buffer.from(base64, 'base64');
        const ext = mime.includes('png') ? 'png' : 'jpg';
        const fileName = `ref-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from('references').upload(fileName, buf, { contentType: mime, upsert: false });
        if (error) return res.status(500).json({ error: error.message });
        const { data } = supabase.storage.from('references').getPublicUrl(fileName);
        refUrls.push(data.publicUrl);
      } catch (e) {
        return res.status(500).json({ error: e.message });
      }
    }
  }
  // Then add URL references (template images)
  const urlRefs = Array.isArray(references) ? references : (references ? [references] : []);
  refUrls.push(...urlRefs);
  if (!refUrls.length) return res.status(400).json({ error: 'No reference' });
  const refUrl = refUrls;

  const finalPrompt = model === 'xSD5Pro' 
    ? prompt 
    : `FACE: Copy face identity from character photos only. BODY: Follow the text prompt for pose, clothing, setting. ANATOMY: If genitals visible, generate realistic anatomy - penis must have distinct glans (head), shaft, and natural skin, NOT look like a finger or thumb. Copy breast and genital shapes from template reference if present. AVOID: copying tattoos, braces, body shape from template. ${prompt}`;

  const body = {
    model: model || 'xSD4.5',
    prompt: finalPrompt,
    endUserEmail: email,
    n: Math.min(Math.max(parseInt(n) || 1, 1), 7),
    size: req.body.size || '2048x2048',
    references: Array.isArray(refUrl) ? refUrl : [refUrl],
  };
  if (model !== 'xSD5Pro') {
    body.guidanceScale = req.body.prompt?.includes('image_1') ? 10 : (req.body.guidanceScale || 10);
  }
  if (req.body.sequential && model !== 'xSD5Pro') {
    body.sequential = req.body.sequential;
    body.sequentialOptions = { maxImages: Math.min(Math.max(parseInt(n) || 1, 1), 15) };
  }

  try {
    const createRes = await fetch('https://api.xmode.ai/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!createRes.ok) {
      const err = await createRes.text();
      return res.status(createRes.status).json({ error: err });
    }
    const { requestId } = await createRes.json();
    for (let i = 0; i < 90; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const pollRes = await fetch(`https://api.xmode.ai/v1/generations/${requestId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      if (!pollRes.ok) continue;
      const data = await pollRes.json();
      if (data.status === 'succeeded') {
        const images = data.images || data.output?.images || [];
        const url = images[0]?.url || images[0] || data.output?.url;
        const cost = data.cost?.xTokens || data.cost || 1;
        return res.status(200).json({ url, requestId, images, cost });
      }
      if (data.status === 'failed' || data.status === 'expired') {
        const errDetail = data.error?.message || data.error?.code || JSON.stringify(data.error || data);
        return res.status(500).json({ error: errDetail, full: data, requestId });
      }
    }
    return res.status(504).json({ error: 'Timeout' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}


export async function checkQuality(imageUrl, charPhotos, templateUrl) {
  const key = process.env.OPENROUTER_KEY;
  if (!key) return { ok: true, error: 'no key' };
  
  const content = [
    { type: 'text', text: `You are a STRICT quality inspector for AI-generated adult images. Be harsh. Flag anything that looks wrong.

CHECK THESE ISSUES:

1. GENITALS - CRITICAL CHECK
Look carefully at any penis visible:
- REAL PENIS: rounded head (glans), distinct from shaft, natural skin folds, urethral opening
- FAKE/FINGER: smooth, no head, looks like a thumb or finger, no glans
- If the "penis" could be mistaken for a finger, FLAG IT immediately
- Check position: should be at groin, between legs, not floating or attached wrong
- Vagina: should have natural folds, not look melted or like a hole

2. HANDS AND FINGERS
- Count fingers on each hand (should be 5)
- Fingers should be separate, not fused together
- Hands should connect to wrists naturally
- If fingers look like sausages or merge into palm, FLAG IT

3. BODY PROPORTIONS
- Thighs should not be gigantic compared to body
- Legs should connect to hips naturally
- Arms should connect to shoulders
- If body looks distorted or proportions are wrong, FLAG IT

4. FACE
- Compare with character photos
- Should look like same person
- No melted features, extra eyes

SCORING - BE STRICT:
- score 1-4: serious defects (wrong genitals, extra limbs, melted)
- score 5-6: noticeable problems
- score 7-8: minor issues only
- score 9-10: clean, no issues
- anatomy_ok = false if ANY genital problem
- ok = true ONLY if score >= 7 AND no serious defects

OUTPUT JSON only:
{"ok": true/false, "score": 1-10, "issues": ["list problems"], "face_match": true/false, "face_score": 1-10, "anatomy_ok": true/false, "pose_match": true/false, "arms": 0, "legs": 0, "hands": 0}` },
    { type: 'image_url', image_url: { url: imageUrl } }
  ];
  if (charPhotos?.length) charPhotos.forEach(url => content.push({ type: 'image_url', image_url: { url } }));
  if (templateUrl) content.push({ type: 'image_url', image_url: { url: templateUrl } });
  
  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'qwen/qwen3.5-122b-a10b', messages: [{ role: 'user', content }] })
    });
    const data = await r.json();
    const text = data.choices?.[0]?.message?.content || '{}';
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch (e) {
    return { ok: true, error: e.message };
  }
}

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
    : `Use the reference image(s) only for facial identity consistency. Fully follow the following prompt for pose, body, clothing, actions, and scene: ${prompt}`;

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
    { type: 'text', text: `You are a strict but fair quality-control inspector for AI-generated images. Your output is parsed by code, so follow the output format exactly.

INPUTS:
- Image 1: the generated image to inspect
- Images 2-4: character face photos (different angles) for face comparison
- Last image: template pose reference

TASK: Inspect Image 1 for the three categories below.

1. SERIOUS DEFECTS
FIRST describe what you see, THEN judge:
- Count arms: how many arms do you see? (should be 2)
- Count legs: how many legs do you see? (should be 2)
- Count hands: how many hands? (should be 2)
- Look at EACH hand carefully: count fingers (should be 5), check if fingers are normal shape, not elongated, fused, or distorted. Pay special attention to hands touching body parts.
- Extra or missing limbs, hands, fingers, or feet
- Malformed hands: fused fingers, wrong number of fingers, distorted hand shape, fingers merging into palm
- Body parts fused together, melted, or attached in impossible places
- Severely distorted face (melted features, asymmetric eyes, extra eyes)
- Visible glitches: heavy artifacts, tearing, garbled texture patches
- Impossible body geometry

2. FACE MATCH
Compare the face in Image 1 with faces in Images 2-4:
- Does it look like the same person (face shape, eyes, nose, mouth, jawline)?
- Or does it look like the template face that was not replaced?
Ignore differences in expression, angle, lighting, makeup, hairstyle.
If face not visible, set face_match to true, face_score to 5.

3. GENITAL ANATOMY
If genitals are visible, check they look anatomically correct:
- If a penis is present, it must look like a penis: correct shape, right place, plausible proportions
- It must NOT be a hand, foot, finger, leg, or other body part
- No duplicated, fused, or malformed genitals
If no genitals visible, set anatomy_ok to true.

DO NOT FLAG: normal variations, style, lighting, minor imperfections, unusual but possible poses.

SCORING:
- score (1-10): 9-10 clean, 7-8 minor flaws, 5-6 noticeable, 3-4 serious defect, 1-2 badly broken
- face_score (1-10): 9-10 same person, 7-8 very likely, 5-6 ambiguous, 3-4 different, 1-2 clearly different
- face_match = true if face_score >= 6
- anatomy_ok = false if any genital error
- ok = true only if score >= 6 AND face_match AND anatomy_ok

OUTPUT: Return ONLY valid JSON, no markdown:
{"ok": true/false, "score": 1-10, "issues": [], "face_match": true/false, "face_score": 1-10, "anatomy_ok": true/false, "arms": 0, "legs": 0, "hands": 0}` },
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

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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
      src: item.src
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
    guidanceScale: req.body.guidanceScale || 10,
  };
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

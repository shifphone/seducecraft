import { createClient } from '@supabase/supabase-js';

function pick(...vals) { for (const v of vals) if (v && String(v).trim()) return v; return null; }

async function uploadBase64(supabase, b64) {
  const base64 = b64.split(',')[1];
  const mime = b64.match(/data:(.*?);/)?.[1] || 'image/jpeg';
  const buf = Buffer.from(base64, 'base64');
  const ext = mime.includes('png') ? 'png' : 'jpg';
  const fileName = `portrait-src-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('references').upload(fileName, buf, { contentType: mime, upsert: false });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from('references').getPublicUrl(fileName);
  return data.publicUrl;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const apiKey = process.env.XMODE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'no key' });

  const url = pick(process.env.seducecraft_SUPABASE_URL, process.env.VITE_SUPABASE_URL, process.env.SUPABASE_URL);
  const key = pick(process.env.seducecraft_SUPABASE_ANON_KEY, process.env.VITE_SUPABASE_ANON_KEY);
  if (!url || !key) return res.status(500).json({ error: 'no supabase' });
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { references, base64, n = 5 } = req.body || {};
  let refs = Array.isArray(references) ? references.filter(Boolean) : [];
  const b64s = Array.isArray(base64) ? base64.filter(b => b && b.startsWith('data:')) : [];
  for (const b of b64s) {
    try { refs.push(await uploadBase64(supabase, b)); } catch (e) { return res.status(500).json({ error: e.message }); }
  }
  if (!refs.length) return res.status(400).json({ error: 'no refs' });

  const PROMPTS = [
    `Use the reference images to preserve the exact same adult woman, her facial structure, eye color, hair, freckles and overall identity. Create a high-quality realistic photograph that looks like it was taken with a good camera in natural light, not AI-generated. Frontal view, face straight to the camera, eyes looking directly into the lens. Neutral resting expression, lips gently closed, no smile. Head and shoulders framing with comfortable space around the head. Skin: Preserve and clearly show all natural skin texture and imperfections from the references — visible pores, freckles, subtle tonal variation, mild redness, under-eye naturalness, small blemishes. No plastic skin, no smoothing, no beauty filter, no airbrushing, no poreless look. Keep exact apparent age. Lighting: Soft natural daylight or window light, slightly uneven, realistic falloff. No studio beauty lighting. Background: Simple plain light wall or softly blurred indoor background, unobtrusive. Overall: Authentic high-quality amateur or semi-pro photo look, mild natural grain, realistic micro-contrast, sharp but not over-sharpened facial details.`,
    `Use the reference images to preserve the exact same adult woman, her facial structure, eye color, hair, freckles and overall identity. Create a high-quality realistic photograph that looks like it was taken with a good camera in natural light, not AI-generated. Left three-quarter view: head turned approximately 40–45 degrees to the left, nose pointing left, left side of the face more visible. Neutral resting expression, lips gently closed, no smile. Head and shoulders framing with comfortable space around the head. Skin: Preserve and clearly show all natural skin texture and imperfections from the references — visible pores, freckles, subtle tonal variation, mild redness, under-eye naturalness, small blemishes. No plastic skin, no smoothing, no beauty filter, no airbrushing, no poreless look. Keep exact apparent age. Lighting: Soft natural daylight or window light, slightly uneven, realistic falloff. No studio beauty lighting. Background: Simple plain light wall or softly blurred indoor background, unobtrusive. Overall: Authentic high-quality amateur or semi-pro photo look, mild natural grain, realistic micro-contrast, sharp but not over-sharpened facial details.`,
    `Use the reference images to preserve the exact same adult woman, her facial structure, eye color, hair, freckles and overall identity. Create a high-quality realistic photograph that looks like it was taken with a good camera in natural light, not AI-generated. Right three-quarter view: head turned approximately 40–45 degrees to the right, nose pointing right, right side of the face more visible. Neutral resting expression, lips gently closed, no smile. Head and shoulders framing with comfortable space around the head. Skin: Preserve and clearly show all natural skin texture and imperfections from the references — visible pores, freckles, subtle tonal variation, mild redness, under-eye naturalness, small blemishes. No plastic skin, no smoothing, no beauty filter, no airbrushing, no poreless look. Keep exact apparent age. Lighting: Soft natural daylight or window light, slightly uneven, realistic falloff. No studio beauty lighting. Background: Simple plain light wall or softly blurred indoor background, unobtrusive. Overall: Authentic high-quality amateur or semi-pro photo look, mild natural grain, realistic micro-contrast, sharp but not over-sharpened facial details.`,
  ];

  async function generateOne(prompt) {
    const body = {
      model: 'xSD4.5',
      prompt,
      endUserEmail: 'portraits@seducecraft.app',
      n: 1,
      size: '1024x1024',
      references: refs,
      guidanceScale: 8,
    };
    const createRes = await fetch('https://api.xmode.ai/v1/generations', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!createRes.ok) throw new Error(await createRes.text());
    const { requestId } = await createRes.json();
    for (let i = 0; i < 45; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const poll = await fetch(`https://api.xmode.ai/v1/generations/${requestId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      if (!poll.ok) continue;
      const data = await poll.json();
      if (data.status === 'succeeded') {
        const images = data.images || data.output?.images || [];
        return images[0]?.url || images[0] || null;
      }
      if (data.status === 'failed' || data.status === 'expired') throw new Error(data.error?.message || 'failed');
    }
    throw new Error('timeout');
  }

  try {
    const results = await Promise.allSettled(PROMPTS.map(p => generateOne(p)));
    const urls = results.filter(r => r.status === 'fulfilled' && r.value).map(r => r.value);
    if (!urls.length) {
      const err = results.find(r => r.status === 'rejected')?.reason?.message || 'all failed';
      return res.status(500).json({ error: err });
    }
    return res.status(200).json({ urls });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}

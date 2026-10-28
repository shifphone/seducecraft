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

  const prompt = `Professional portrait photo of the same person, clear face fully visible, neutral expression, even soft studio lighting, sharp focus, plain neutral gray background, head and shoulders framing, photorealistic, high quality face reference for identity consistency.`;

  const body = {
    model: 'xSD4.5',
    prompt,
    endUserEmail: 'portraits@seducecraft.app',
    n: Math.min(Math.max(parseInt(n) || 5, 1), 5),
    size: '1024x1024',
    references: refs,
    guidanceScale: 8,
  };

  try {
    const createRes = await fetch('https://api.xmode.ai/v1/generations', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!createRes.ok) {
      const err = await createRes.text();
      return res.status(createRes.status).json({ error: err });
    }
    const { requestId } = await createRes.json();
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const poll = await fetch(`https://api.xmode.ai/v1/generations/${requestId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      if (!poll.ok) continue;
      const data = await poll.json();
      if (data.status === 'succeeded') {
        const images = data.images || data.output?.images || [];
        const urls = images.map(im => im?.url || im).filter(Boolean);
        return res.status(200).json({ urls, requestId });
      }
      if (data.status === 'failed' || data.status === 'expired') {
        return res.status(500).json({ error: data.error?.message || 'failed' });
      }
    }
    return res.status(504).json({ error: 'timeout' });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}

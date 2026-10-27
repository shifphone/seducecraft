import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.XMODE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'XMODE_API_KEY not configured' });

  const { prompt, endUserEmail, model = 'xW3.0s', duration = 5, ratio = '16:9', references, referenceBase64, image } = req.body || {};

  if (!prompt) return res.status(400).json({ error: 'prompt required' });

  const email = endUserEmail || 'anon@seducecraft.app';

  let refUrls = [];
  const supabaseUrl = process.env.seducecraft_SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.seducecraft_SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const base64List = Array.isArray(referenceBase64) ? referenceBase64 : (referenceBase64 ? [referenceBase64] : []);
    for (const b64 of base64List) {
      if (b64 && b64.startsWith('data:')) {
        try {
          const base64 = b64.split(',')[1];
          const mime = b64.match(/data:(.*?);/)?.[1] || 'image/jpeg';
          const buf = Buffer.from(base64, 'base64');
          const ext = mime.includes('png') ? 'png' : 'jpg';
          const fileName = `vid-ref-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error } = await supabase.storage.from('references').upload(fileName, buf, { contentType: mime, upsert: false });
          if (!error) {
            const { data } = supabase.storage.from('references').getPublicUrl(fileName);
            refUrls.push(data.publicUrl);
          }
        } catch (e) {
          console.error('Upload failed', e);
        }
      }
    }
  }

  const urlRefs = Array.isArray(references) ? references : (references ? [references] : []);
  refUrls.push(...urlRefs);

  const body = {
    model,
    prompt,
    endUserEmail: email,
    duration: Number(duration) || 5,
    ratio,
  };

  if (refUrls.length) {
    body.reference_images = refUrls;
  }
  if (image) {
    body.image = image;
  }

  try {
    const createRes = await fetch('https://api.xmode.ai/v1/videos', {
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

    for (let i = 0; i < 120; i++) {
      await new Promise(r => setTimeout(r, 3000));
      const pollRes = await fetch(`https://api.xmode.ai/v1/videos/${requestId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      if (!pollRes.ok) continue;
      const data = await pollRes.json();
      if (data.status === 'succeeded') {
        const videos = data.videos || data.output?.videos || [];
        const url = videos[0]?.url || videos[0] || data.output?.url;
        const cost = data.cost?.xTokens || data.cost || 5;
        return res.status(200).json({ url, requestId, videos, cost });
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

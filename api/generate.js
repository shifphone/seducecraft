import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.XMODE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'XMODE_API_KEY not configured' });

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in Vercel env' });
  }

  const { prompt, endUserEmail, model, referenceBase64, references } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'prompt required' });

  const email = (endUserEmail && endUserEmail.includes('@') && !endUserEmail.includes('seducecraft'))
    ? endUserEmail
    : 'shifphone@gmail.com';

  let refUrl = references;
  let uploadError = null;

  if (!refUrl && referenceBase64 && referenceBase64.startsWith('data:')) {
    try {
      const base64 = referenceBase64.split(',')[1];
      if (!base64) throw new Error('Invalid data URL');
      const mime = referenceBase64.match(/data:(.*?);/)?.[1] || 'image/jpeg';
      const buf = Buffer.from(base64, 'base64');
      const ext = mime.includes('png') ? 'png' : 'jpg';
      const fileName = `ref-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.storage
        .from('references')
        .upload(fileName, buf, { contentType: mime, upsert: false });

      if (error) {
        uploadError = `supabase: ${error.message}`;
      } else {
        const { data: urlData } = supabase.storage.from('references').getPublicUrl(fileName);
        refUrl = urlData.publicUrl;
      }
    } catch (e) {
      uploadError = e.message;
    }
  }

  if (!refUrl) {
    return res.status(400).json({ error: uploadError || 'Failed to get public URL for reference' });
  }

  const body = {
    model: model || 'xSD4.5',
    prompt,
    endUserEmail: email,
    n: 1,
    size: '2048x2048',
    references: Array.isArray(refUrl) ? refUrl : [refUrl],
  };

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
      return res.status(createRes.status).json({ error: err, refUrl });
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
        return res.status(200).json({ url, requestId });
      }
      if (data.status === 'failed' || data.status === 'expired') {
        return res.status(500).json({ error: data.error?.message || data.status, refUrl });
      }
    }
    return res.status(504).json({ error: 'Timeout' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

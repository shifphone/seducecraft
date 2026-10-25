export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.XMODE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'XMODE_API_KEY not configured' });

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
      const mime = referenceBase64.match(/data:(.*?);/)?.[1] || 'image/jpeg';
      const buf = Buffer.from(base64, 'base64');
      const form = new FormData();
      form.append('file', new Blob([buf], { type: mime }), 'ref.jpg');
      const uploadRes = await fetch('https://tmpfiles.org/api/v1/upload', { method: 'POST', body: form });
      const upText = await uploadRes.text();
      if (uploadRes.ok) {
        const up = JSON.parse(upText);
        refUrl = up?.data?.url?.replace('tmpfiles.org/', 'tmpfiles.org/dl/') || up?.data?.url;
      } else {
        uploadError = `upload ${uploadRes.status}: ${upText.slice(0, 200)}`;
      }
    } catch (e) {
      uploadError = e.message;
    }
  }

  const body = {
    model: model || 'xSD4.5',
    prompt,
    endUserEmail: email,
    n: 1,
    size: '2048x2048',
  };
  if (refUrl) body.references = refUrl;

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
      return res.status(createRes.status).json({ error: err, uploadError, refUrl });
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
        return res.status(200).json({ url, requestId, usedReference: !!refUrl, uploadError });
      }
      if (data.status === 'failed' || data.status === 'expired') {
        return res.status(500).json({ error: data.error?.message || data.status, uploadError, refUrl });
      }
    }
    return res.status(504).json({ error: 'Timeout', uploadError });
  } catch (e) {
    return res.status(500).json({ error: e.message, uploadError });
  }
}

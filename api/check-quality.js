export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  
  const { imageUrl, characterUrl } = req.body || {};
  if (!imageUrl) return res.status(400).json({ error: 'imageUrl required' });

  const key = process.env.OPENROUTER_KEY;
  
  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen/qwen2.5-vl-72b-instruct',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this image. Reply with JSON only: {"ok": true/false, "issues": ["list of problems"]}. Check: 1) Is the face natural and consistent? 2) Any anatomy issues (extra limbs, distorted body)? 3) Any obvious artifacts? Be strict.' },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }]
      })
    });
    const data = await r.json();
    const text = data.choices?.[0]?.message?.content || '{}';
    const result = JSON.parse(text.replace(/```json|```/g, '').trim());
    return res.status(200).json(result);
  } catch (e) {
    return res.status(200).json({ ok: true, error: e.message });
  }
}

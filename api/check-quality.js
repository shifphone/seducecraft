export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  
  const { imageUrl, faceUrl } = req.body || {};
  if (!imageUrl) return res.status(400).json({ error: 'imageUrl required' });

  const key = process.env.OPENROUTER_KEY;
  if (!key) return res.status(500).json({ error: 'No API key' });
  
  const content = [
    { type: 'text', text: `Analyze this generated image for quality issues. Check:
1. Face quality - is it natural, no distortions?
2. Body anatomy - any extra limbs, distorted parts, unnatural poses?
3. Artifacts - any visual glitches, weird textures, floating objects?
4. Overall realism - does it look like a real photo?

Reply with JSON only: {"ok": true/false, "score": 1-10, "issues": ["list of specific problems"], "face_ok": true/false, "body_ok": true/false}` }
  ];
  
  content.push({ type: 'image_url', image_url: { url: imageUrl } });
  if (faceUrl) {
    content[0].text += `\n\nAlso compare the face with the reference face image. Does the face match?`;
    content.push({ type: 'image_url', image_url: { url: faceUrl } });
  }

  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen/qwen3.5-122b-a10b',
        messages: [{ role: 'user', content }]
      })
    });
    const data = await r.json();
    const text = data.choices?.[0]?.message?.content || '{}';
    console.log('Quality check response:', text.slice(0, 500));
    const result = JSON.parse(text.replace(/```json|```/g, '').trim());
    return res.status(200).json({ ...result, raw: text.slice(0, 200) });
  } catch (e) {
    console.error('Quality check error:', e.message);
    return res.status(200).json({ ok: true, error: e.message });
  }
}

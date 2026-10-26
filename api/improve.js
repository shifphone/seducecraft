export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { prompt } = req.body || {};
  if (!prompt || !prompt.trim()) return res.status(400).json({ error: 'No prompt' });

  const improved = `${prompt.trim()}. Highly detailed, photorealistic, sharp focus, natural lighting, realistic skin texture, amateur smartphone photo, candid moment.`;
  return res.status(200).json({ improved });
}

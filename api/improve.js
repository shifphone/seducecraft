export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { prompt } = req.body || {};
  if (!prompt || !prompt.trim()) return res.status(400).json({ error: 'No prompt' });

  const base = prompt.trim().replace(/\.\s*(full body visible|realistic skin|soft natural|shallow depth|candid unposed|detailed fabric|accurate anatomy|Photorealistic).*$/i, '').trim();
  const extras = [
    'full body visible, natural pose',
    'realistic skin pores and texture',
    'soft natural window light',
    'shallow depth of field',
    'candid unposed moment',
    'detailed fabric and clothing folds',
    'accurate anatomy and proportions',
  ];
  const pick = extras.sort(() => Math.random() - 0.5).slice(0, 3).join(', ');
  const improved = `${base}. ${pick}. Photorealistic, sharp focus.`;
  return res.status(200).json({ improved });
}

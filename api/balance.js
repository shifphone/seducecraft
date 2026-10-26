export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.XMODE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'XMODE_API_KEY not configured' });

  try {
    const r = await fetch('https://api.xmode.ai/v1/balance', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (!r.ok) {
      const err = await r.text();
      return res.status(r.status).json({ error: err });
    }
    const data = await r.json();
    const balance = data.balance ?? data.xTokens ?? data.tokens ?? 0;
    return res.status(200).json({ balance });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

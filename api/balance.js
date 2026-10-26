export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.XMODE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'XMODE_API_KEY not configured' });

  try {
    const balanceRes = await fetch('https://api.xmode.ai/v1/balance', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (!balanceRes.ok) {
      const err = await balanceRes.text();
      return res.status(balanceRes.status).json({ error: err });
    }
    const data = await balanceRes.json();
    return res.status(200).json({ balance: data.balance || data.xTokens || data.credits || 0 });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER || 'demo';

const PACKAGES = {
  100: { credits: 100, price: 9.99 },
  500: { credits: 525, price: 39.99 },
  1000: { credits: 1100, price: 69.99 },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { action, packageId, userId } = req.body || {};

  if (action === 'packages') {
    return res.status(200).json(Object.entries(PACKAGES).map(([id, p]) => ({ id: Number(id), ...p })));
  }

  if (action === 'checkout') {
    const pkg = PACKAGES[packageId];
    if (!pkg) return res.status(400).json({ error: 'Invalid package' });
    if (PAYMENT_PROVIDER === 'demo') {
      return res.status(200).json({ demo: true, packageId, credits: pkg.credits, price: pkg.price });
    }
    return res.status(501).json({ error: 'Payment provider not configured' });
  }

  if (action === 'confirm') {
    const pkg = PACKAGES[packageId];
    if (!pkg || !userId) return res.status(400).json({ error: 'Invalid' });
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: existing } = await supabase.from('user_credits').select('credits').eq('user_id', userId).single();
    const newCredits = (existing?.credits || 0) + pkg.credits;
    await supabase.from('user_credits').upsert({ user_id: userId, credits: newCredits });
    return res.status(200).json({ ok: true, credits: newCredits });
  }

  return res.status(400).json({ error: 'Unknown action' });
}

import { createClient } from '@supabase/supabase-js';

function getClient() {
  const url = process.env.seducecraft_SUPABASE_URL || process.env.seduceraft_SUPABASE_URL || process.env.NEXT_PUBLIC_seduceraft_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.seduceraft_SUPABASE_SECRET_KEY || process.env.seducecraft_SUPABASE_SECRET_KEY || process.env.seducecraft_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.seducecraft_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 8; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const supabase = getClient();
  if (!supabase) return res.status(500).json({ error: 'supabase not configured' });

  const { action, code } = req.body || {};

  try {
    if (action === 'generate') {
      const newCode = genCode();
      const { error } = await supabase.from('anon_codes').insert({ code: newCode });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ code: newCode });
    }

    if (action === 'check') {
      const c = String(code || '').trim().toUpperCase();
      if (!c) return res.status(400).json({ ok: false, error: 'empty' });
      const { data, error } = await supabase.from('anon_codes').select('code').eq('code', c).maybeSingle();
      if (error) return res.status(500).json({ ok: false, error: error.message });
      return res.status(200).json({ ok: !!data });
    }

    return res.status(400).json({ error: 'bad action' });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}

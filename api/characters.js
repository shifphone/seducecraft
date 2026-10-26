import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabaseUrl = process.env.seducecraft_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.seducecraft_SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) return res.status(500).json({ error: 'Not configured' });
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { userId } = req.query;

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('characters').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data || []);
  }

  if (req.method === 'POST') {
    const { name, photos } = req.body;
    const { data, error } = await supabase.from('characters').insert({ user_id: userId, name, photos }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    const { error } = await supabase.from('characters').delete().eq('id', id).eq('user_id', userId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

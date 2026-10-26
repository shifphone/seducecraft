import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const supabaseUrl = process.env.seducecraft_SUPABASE_URL || process.env.NEXT_PUBLIC_seducecraft_SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.seducecraft_SUPABASE_SECRET_KEY || process.env.seducecraft_SUPABASE_SERVICE_ROLE_KEY || process.env.seducecraft_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_seducecraft_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_seducecraft_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) return res.status(500).json({ error: 'Supabase not configured' });
  
  const { base64, action, userId, name, photos } = req.body || {};
  
  // Character save
  if (action === 'saveCharacter') {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('anon_characters').insert({ user_id: userId, name, photos }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
  
  // Character load
  if (action === 'loadCharacters') {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('anon_characters').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data || []);
  }
  
  // Original upload logic
  if (!base64 || !base64.startsWith('data:')) return res.status(400).json({ error: 'base64 required' });
  
  try {
    const data = base64.split(',')[1];
    const mime = base64.match(/data:(.*?);/)?.[1] || 'image/jpeg';
    const buf = Buffer.from(data, 'base64');
    const ext = mime.includes('png') ? 'png' : 'jpg';
    const fileName = `ref-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.storage.from('references').upload(fileName, buf, { contentType: mime, upsert: false });
    if (error) return res.status(500).json({ error: error.message });
    
    const { data: urlData } = supabase.storage.from('references').getPublicUrl(fileName);
    return res.status(200).json({ url: urlData.publicUrl });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

  
  try {
    const data = base64.split(',')[1];
    const mime = base64.match(/data:(.*?);/)?.[1] || 'image/jpeg';
    const buf = Buffer.from(data, 'base64');
    const ext = mime.includes('png') ? 'png' : 'jpg';
    const fileName = `ref-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.storage.from('references').upload(fileName, buf, { contentType: mime, upsert: false });
    if (error) return res.status(500).json({ error: error.message });
    
    const { data: urlData } = supabase.storage.from('references').getPublicUrl(fileName);
    return res.status(200).json({ url: urlData.publicUrl });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

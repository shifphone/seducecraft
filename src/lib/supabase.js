import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

function isValidUrl(u) {
  try { return !!new URL(u).protocol.startsWith('http'); } catch { return false; }
}

export const supabase = (isValidUrl(supabaseUrl) && supabaseAnonKey.length > 20)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = () => !!supabase;

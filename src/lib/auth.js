import { supabase, isSupabaseConfigured } from './supabase';

export async function signInWithGoogle() {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function signOut() {
  if (!isSupabaseConfigured()) return;
  await supabase.auth.signOut();
}

export async function getSession() {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getProfile(userId) {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  return data;
}

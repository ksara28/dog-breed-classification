import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If env vars are missing, export a lightweight mock that prevents the app from
// crashing during local frontend work. This allows navigation, modals and other
// UI to function. Real auth calls will return a friendly error.
let _supabase: any;

if (!supabaseUrl || !supabaseAnonKey) {
  // Minimal mock implementation used by AuthContext and AuthModal
  const noop = async () => ({ data: null, error: { message: 'Supabase not configured' } });
  const mock = {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: (_cb: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: noop,
      signInWithPassword: noop,
      signOut: async () => ({ error: { message: 'Supabase not configured' } }),
    },
  } as any;

  // eslint-disable-next-line no-console
  console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing — using mock supabase client');

  _supabase = mock;
} else {
  _supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = _supabase;

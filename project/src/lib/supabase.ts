import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const forceMock = (import.meta.env.VITE_FORCE_MOCK_AUTH || 'false') === 'true';

// Helper: simple local user/session store used by the mock implementation
const LOCAL_USER_KEY = 'pf_local_user_v1';
function _readLocalUser() {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
function _writeLocalUser(u: any) {
  try {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(u));
  } catch (e) {}
}

// Build a mock supabase auth client that supports signUp, signInWithPassword,
// signOut, getSession, onAuthStateChange and updateUser. It's intentionally
// lightweight but compatible with the usage in this project.
function makeMock() {
  let listeners: Array<(event: string, session: any) => void> = [];

  function _emit(event: string, session: any) {
    for (const cb of listeners) {
      try { cb(event, session); } catch (e) {}
    }
  }

  return {
    auth: {
      getSession: async () => {
        const user = _readLocalUser();
        if (!user) return { data: { session: null } };
        return { data: { session: { user, access_token: 'local-token' } } };
      },
      onAuthStateChange: (cb: any) => {
        listeners.push(cb);
        const unsubscribe = () => {
          listeners = listeners.filter((c) => c !== cb);
        };
        return { data: { subscription: { unsubscribe } } };
      },
      signUp: async ({ email, password, options }: any) => {
        // create a local user record; store a simple base64 "hash" of the password
        const stored = {
          id: 'local-' + Date.now(),
          email,
          // store password as base64 to avoid plain text in localStorage
          password: typeof password === 'string' ? btoa(password) : null,
          user_metadata: (options && options.data) || {},
        };
        _writeLocalUser(stored);
        // emit SIGNED_IN event with a session-like object
        _emit('SIGNED_UP', { user: { id: stored.id, email: stored.email, user_metadata: stored.user_metadata }, access_token: 'local-token' });
        return { data: { user: { id: stored.id, email: stored.email, user_metadata: stored.user_metadata } }, error: null };
      },
      signInWithPassword: async ({ email, password }: any) => {
        const user = _readLocalUser();
        if (!user || user.email !== email) {
          return { data: null, error: { message: 'Invalid credentials (local mock)' } };
        }
        const supplied = typeof password === 'string' ? btoa(password) : null;
        if (!user.password || user.password !== supplied) {
          return { data: null, error: { message: 'Invalid credentials (local mock)' } };
        }
        const session = { user: { id: user.id, email: user.email, user_metadata: user.user_metadata }, access_token: 'local-token' };
        _emit('SIGNED_IN', session);
        return { data: { user: session.user, session }, error: null };
      },
      signOut: async () => {
        // remove local session but keep user record (so signUp persists)
        _emit('SIGNED_OUT', null);
        return { error: null };
      },
      updateUser: async ({ data }: any) => {
        const user = _readLocalUser();
        if (!user) return { data: null, error: { message: 'No local user' } };
        user.user_metadata = Object.assign({}, user.user_metadata || {}, data || {});
        _writeLocalUser(user);
        _emit('USER_UPDATED', { user, access_token: 'local-token' });
        return { data: { user }, error: null };
      },
    },
  } as any;
}

let _supabase: any;

if (forceMock) {
  // eslint-disable-next-line no-console
  console.warn('VITE_FORCE_MOCK_AUTH=true — using local mock supabase client for auth');
  _supabase = makeMock();
} else if (!supabaseUrl || !supabaseAnonKey) {
  // Minimal mock implementation used by AuthContext when env not present
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

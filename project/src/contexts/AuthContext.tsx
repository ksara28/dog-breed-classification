import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone?: string, address?: {
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: { full_name?: string; phone?: string; address?: string; city?: string; state?: string; postal_code?: string; country?: string }) => Promise<{ error: any }>;
  deleteAccount: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone?: string, address?: { address?: string; city?: string; state?: string; postal_code?: string; country?: string }) => {
    const metadata: any = { full_name: fullName };
    if (phone) metadata.phone = phone;
    if (address) {
      metadata.address = address.address ?? null;
      metadata.city = address.city ?? null;
      metadata.state = address.state ?? null;
      metadata.postal_code = address.postal_code ?? null;
      metadata.country = address.country ?? null;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (data: { full_name?: string; phone?: string; address?: string; city?: string; state?: string; postal_code?: string; country?: string }) => {
    try {
      // supabase v2 supports auth.updateUser
      if (typeof supabase.auth.updateUser === 'function') {
        const { data: updated, error } = await supabase.auth.updateUser({ data });
        return { error };
      }
      return { error: { message: 'Profile update not available in this environment' } };
    } catch (err) {
      return { error: err };
    }
  };

  const deleteAccount = async () => {
    // Deleting a user requires a secure server-side operation (service role).
    // Return a friendly error so UI can inform the user.
    return { error: { message: 'Account deletion must be performed via server-side API. Contact support.' } };
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, updateProfile, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

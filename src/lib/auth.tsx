import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle email verification success
        if (event === 'SIGNED_IN' && session) {
          const params = new URLSearchParams(window.location.search);
          const type = params.get('type');
          
          if (type === 'signup' || type === 'email') {
            // Store flag in sessionStorage to show toast after redirect
            sessionStorage.setItem('emailVerified', 'true');
          }
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    // Use production URL for email verification, fallback to current origin for development
    const isProduction = window.location.hostname !== 'localhost';
    const redirectUrl = isProduction 
      ? 'https://photo-magic-studio.vercel.app/auth/callback'
      : `${window.location.origin}/auth/callback`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    try {
      // Sign out from Supabase first (before clearing storage)
      await supabase.auth.signOut();
    } catch (error) {
      // Ignore session missing error - it's expected if already logged out
      if (error instanceof Error && !error.message.includes('Auth session missing')) {
        console.error('SignOut error:', error);
      }
    } finally {
      // Always clear state and storage, even if signOut fails
      setUser(null);
      setSession(null);
      sessionStorage.clear();
      localStorage.clear();
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
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

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  fetchProfile,
  signInWithUsername,
  signOutUser,
  signUpWithUsername,
  type AuthProfile,
} from '../lib/auth';
import { supabase } from '../lib/supabase';

interface AuthContextValue {
  user: AuthProfile | null;
  isLoading: boolean;
  login: (username: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signUp: (username: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (data.session?.user) {
        const profile = await fetchProfile(data.session.user.id);
        setUser(profile);
      }

      setIsLoading(false);
    };

    void init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (!session?.user) {
        setUser(null);
        return;
      }
      const profile = await fetchProfile(session.user.id);
      setUser(profile);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (username: string) => {
    const result = await signInWithUsername(username);
    if (result.ok) {
      setUser(result.profile);
      return { ok: true as const };
    }
    return { ok: false as const, error: result.error };
  };

  const handleSignUp = async (username: string) => {
    const result = await signUpWithUsername(username);
    if (result.ok) {
      setUser(result.profile);
      return { ok: true as const };
    }
    return { ok: false as const, error: result.error };
  };

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login: handleLogin,
        signUp: handleSignUp,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

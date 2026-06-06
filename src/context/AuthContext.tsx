import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { createAccount, login, restorePersistedSession, setSessionUser, signOut as authSignOut } from '../lib/auth';

interface AuthContextValue {
  user: string | null;
  isLoading: boolean;
  login: (username: string) => { ok: true } | { ok: false; error: string };
  signUp: (username: string) => { ok: true } | { ok: false; error: string };
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(() => restorePersistedSession());
  const [isLoading] = useState(false);

  useEffect(() => {
    const syncSession = () => {
      const restored = restorePersistedSession();
      setUser(current => (current === restored ? current : restored));
    };

    window.addEventListener('focus', syncSession);
    window.addEventListener('storage', syncSession);
    return () => {
      window.removeEventListener('focus', syncSession);
      window.removeEventListener('storage', syncSession);
    };
  }, []);

  const handleLogin = (username: string) => {
    const result = login(username);
    if (result.ok) {
      setUser(result.username);
      return { ok: true as const };
    }
    return { ok: false as const, error: result.error };
  };

  const handleSignUp = (username: string) => {
    const result = createAccount(username);
    if (result.ok) {
      setUser(result.username);
      return { ok: true as const };
    }
    return { ok: false as const, error: result.error };
  };

  const handleSignOut = () => {
    authSignOut();
    setUser(null);
  };

  // Keep session persisted whenever a user is active (only sign-out clears it).
  useEffect(() => {
    if (user) {
      setSessionUser(user);
    }
  }, [user]);

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

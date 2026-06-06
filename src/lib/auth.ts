import { seedNewUserData } from './defaults';
import { isSupabaseConfigured } from './supabase';
import { supabase } from './supabase';

const INTERNAL_AUTH_DOMAIN = 'lifeflow.personal-track.internal';

export interface AuthProfile {
  id: string;
  username: string;
}

export function normalizeUsername(username: string): string {
  return username.trim();
}

export function getUserInitials(username: string): string {
  const parts = username.trim().split(/[._-\s]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
}

function usernameToInternalEmail(username: string): string {
  return `${normalizeUsername(username).toLowerCase()}@${INTERNAL_AUTH_DOMAIN}`;
}

function deriveInternalPassword(username: string): string {
  const secret = import.meta.env.VITE_AUTH_SECRET ?? 'lifeflow-dev-secret';
  const input = `${normalizeUsername(username).toLowerCase()}:${secret}`;
  let hash = 0;

  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }

  return `Lf_${Math.abs(hash).toString(36)}_${input.length}`;
}

function getCredentials(username: string) {
  const trimmedUsername = normalizeUsername(username);
  return {
    trimmedUsername,
    internalEmail: usernameToInternalEmail(trimmedUsername),
    internalPassword: deriveInternalPassword(trimmedUsername),
  };
}

export async function fetchProfile(userId: string): Promise<AuthProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as AuthProfile;
}

async function isUsernameAvailable(username: string): Promise<boolean | null> {
  const { data, error } = await supabase.rpc('is_username_available', {
    check_username: normalizeUsername(username),
  });

  if (error) {
    console.warn('Username availability RPC unavailable, skipping pre-check', error.message);
    return null;
  }

  return Boolean(data);
}

function validateUsername(username: string): string | null {
  const trimmedUsername = normalizeUsername(username);

  if (!trimmedUsername || trimmedUsername.length < 2) {
    return 'Username must be at least 2 characters.';
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(trimmedUsername)) {
    return 'Use letters, numbers, dots, dashes, or underscores only.';
  }

  return null;
}

function configError(): string {
  return 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then redeploy.';
}

async function establishSession(username: string): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const { internalEmail, internalPassword } = getCredentials(username);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: internalEmail,
    password: internalPassword,
  });

  if (error || !data.user) {
    return {
      ok: false,
      error:
        'Could not start a session. In Supabase, turn off Authentication → Email → Confirm email, then try again.',
    };
  }

  return { ok: true, userId: data.user.id };
}

async function ensureProfileAndData(userId: string, username: string): Promise<AuthProfile | null> {
  const { trimmedUsername, internalEmail } = getCredentials(username);

  let profile = await fetchProfile(userId);

  if (!profile) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      username: trimmedUsername,
      email: internalEmail,
    });

    if (profileError && !profileError.message.toLowerCase().includes('duplicate')) {
      console.error('Profile insert failed', profileError);
      return null;
    }

    profile = await fetchProfile(userId);
  }

  if (!profile) return null;

  try {
    await seedNewUserData(userId);
  } catch (err) {
    console.error('Failed to seed user data', err);
  }

  return profile;
}

export async function signUpWithUsername(
  username: string,
): Promise<{ ok: true; profile: AuthProfile } | { ok: false; error: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: configError() };
  }

  const validationError = validateUsername(username);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const { trimmedUsername, internalEmail, internalPassword } = getCredentials(username);

  const availability = await isUsernameAvailable(trimmedUsername);
  if (availability === false) {
    return { ok: false, error: 'That username is already taken. Please choose another.' };
  }

  const { data, error } = await supabase.auth.signUp({
    email: internalEmail,
    password: internalPassword,
    options: {
      data: { username: trimmedUsername },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      const sessionResult = await establishSession(trimmedUsername);
      if (!sessionResult.ok) {
        return sessionResult;
      }
      const existingProfile = await ensureProfileAndData(sessionResult.userId, trimmedUsername);
      if (existingProfile) {
        return { ok: true, profile: existingProfile };
      }
      return { ok: false, error: 'That username exists but setup failed. Try logging in.' };
    }
    return { ok: false, error: error.message };
  }

  if (!data.user) {
    return { ok: false, error: 'Account creation failed. Please try again.' };
  }

  if (!data.session) {
    const sessionResult = await establishSession(trimmedUsername);
    if (!sessionResult.ok) {
      return sessionResult;
    }
  }

  const profile = await ensureProfileAndData(data.user.id, trimmedUsername);
  if (!profile) {
    return { ok: false, error: 'Account was created but profile setup failed. Please try logging in.' };
  }

  return { ok: true, profile };
}

export async function signInOrCreateWithUsername(
  username: string,
): Promise<{ ok: true; profile: AuthProfile } | { ok: false; error: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: configError() };
  }

  const validationError = validateUsername(username);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const { trimmedUsername, internalEmail, internalPassword } = getCredentials(username);

  const signInAttempt = await supabase.auth.signInWithPassword({
    email: internalEmail,
    password: internalPassword,
  });

  if (!signInAttempt.error && signInAttempt.data.user) {
    const profile = await ensureProfileAndData(signInAttempt.data.user.id, trimmedUsername);
    if (profile) {
      return { ok: true, profile };
    }
  }

  const availability = await isUsernameAvailable(trimmedUsername);
  if (availability === false) {
    const retrySession = await establishSession(trimmedUsername);
    if (!retrySession.ok) {
      return retrySession;
    }
    const profile = await ensureProfileAndData(retrySession.userId, trimmedUsername);
    if (profile) {
      return { ok: true, profile };
    }
    return { ok: false, error: 'That username exists but setup is incomplete. Try again in a moment.' };
  }

  return signUpWithUsername(username);
}

export async function signInWithUsername(
  username: string,
): Promise<{ ok: true; profile: AuthProfile } | { ok: false; error: string }> {
  return signInOrCreateWithUsername(username);
}

export async function signOutUser(): Promise<void> {
  await supabase.auth.signOut();
}

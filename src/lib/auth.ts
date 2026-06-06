const USERS_KEY = 'lifeflow_users';
const SESSION_KEY = 'lifeflow_session';

export function normalizeUsername(username: string): string {
  return username.trim();
}

function normalizeKey(username: string): string {
  return normalizeUsername(username).toLowerCase();
}

export function getRegisteredUsers(): string[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: string[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSessionUser(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function setSessionUser(username: string): void {
  try {
    localStorage.setItem(SESSION_KEY, username);
  } catch {
    // Ignore quota / private-mode errors; in-memory auth still works this session.
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore
  }
}

/** Restore saved session on startup. Only sign-out clears this. */
export function restorePersistedSession(): string | null {
  const session = getSessionUser();
  if (!session) return null;

  const trimmed = normalizeUsername(session);
  if (!trimmed) {
    clearSession();
    return null;
  }

  const existing = findUser(trimmed);
  if (existing) {
    setSessionUser(existing);
    return existing;
  }

  // Session survived but user list was cleared — keep the user signed in.
  return trimmed;
}

export function findUser(username: string): string | null {
  const key = normalizeKey(username);
  return getRegisteredUsers().find(user => normalizeKey(user) === key) ?? null;
}

export function createAccount(username: string): { ok: true; username: string } | { ok: false; error: string } {
  const trimmed = normalizeUsername(username);

  if (!trimmed) {
    return { ok: false, error: 'Please enter a username.' };
  }

  if (trimmed.length < 2) {
    return { ok: false, error: 'Username must be at least 2 characters.' };
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
    return { ok: false, error: 'Use letters, numbers, dots, dashes, or underscores only.' };
  }

  if (findUser(trimmed)) {
    return { ok: false, error: 'That username is already taken.' };
  }

  const users = getRegisteredUsers();
  users.push(trimmed);
  saveUsers(users);
  setSessionUser(trimmed);

  return { ok: true, username: trimmed };
}

export function login(username: string): { ok: true; username: string } | { ok: false; error: string } {
  const trimmed = normalizeUsername(username);

  if (!trimmed) {
    return { ok: false, error: 'Please enter your username.' };
  }

  const existing = findUser(trimmed);
  if (!existing) {
    return { ok: false, error: 'Username not found. Create an account first.' };
  }

  setSessionUser(existing);
  return { ok: true, username: existing };
}

export function signOut(): void {
  clearSession();
}

export function getUserInitials(username: string): string {
  const parts = username.trim().split(/[._-\s]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
}

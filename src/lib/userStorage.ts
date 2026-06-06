import { enqueueSync, flushSyncQueue, isOnline } from './offlineSync';

export function userStorageKey(username: string, section: string): string {
  return `lifeflow_${section}_${username.toLowerCase()}`;
}

export function loadUserSection<T>(username: string, section: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(userStorageKey(username, section));
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveUserSection<T>(username: string, section: string, data: T): void {
  localStorage.setItem(userStorageKey(username, section), JSON.stringify(data));
  enqueueSync(username, section, data);
  window.dispatchEvent(new Event('lifeflow-sync-queue-updated'));

  if (isOnline()) {
    void flushSyncQueue().then(() => {
      window.dispatchEvent(new Event('lifeflow-sync-queue-updated'));
    });
  }
}

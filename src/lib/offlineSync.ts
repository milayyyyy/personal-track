const SYNC_QUEUE_KEY = 'lifeflow_sync_queue';

export interface SyncQueueItem {
  id: string;
  username: string;
  section: string;
  data: unknown;
  updatedAt: number;
}

function queueKey(username: string, section: string) {
  return `${username.toLowerCase()}::${section}`;
}

export function isOnline(): boolean {
  return typeof navigator === 'undefined' ? true : navigator.onLine;
}

export function loadSyncQueue(): SyncQueueItem[] {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? (JSON.parse(raw) as SyncQueueItem[]) : [];
  } catch {
    return [];
  }
}

function persistSyncQueue(queue: SyncQueueItem[]) {
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

export function getPendingSyncCount(): number {
  return loadSyncQueue().length;
}

export function hasRemoteSync(): boolean {
  return Boolean(import.meta.env.VITE_SYNC_API_URL);
}

export function enqueueSync(username: string, section: string, data: unknown): void {
  if (!hasRemoteSync() && isOnline()) return;

  const queue = loadSyncQueue();
  const key = queueKey(username, section);
  const existingIndex = queue.findIndex(item => queueKey(item.username, item.section) === key);

  const item: SyncQueueItem = {
    id: key,
    username,
    section,
    data,
    updatedAt: Date.now(),
  };

  if (existingIndex >= 0) {
    queue[existingIndex] = item;
  } else {
    queue.push(item);
  }

  persistSyncQueue(queue);
}

export function removeFromSyncQueue(username: string, section: string): void {
  const key = queueKey(username, section);
  const queue = loadSyncQueue().filter(item => queueKey(item.username, item.section) !== key);
  persistSyncQueue(queue);
}

async function pushToRemote(item: SyncQueueItem): Promise<boolean> {
  const syncUrl = import.meta.env.VITE_SYNC_API_URL;
  if (!syncUrl) {
    return true;
  }

  try {
    const response = await fetch(syncUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: item.username,
        section: item.section,
        data: item.data,
        updatedAt: item.updatedAt,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function flushSyncQueue(): Promise<{ flushed: number; failed: number }> {
  const queue = loadSyncQueue();

  if (!isOnline()) {
    return { flushed: 0, failed: queue.length };
  }

  if (queue.length === 0) {
    return { flushed: 0, failed: 0 };
  }

  if (!hasRemoteSync()) {
    persistSyncQueue([]);
    return { flushed: queue.length, failed: 0 };
  }

  let flushed = 0;
  let failed = 0;
  const remaining: SyncQueueItem[] = [];

  for (const item of queue) {
    const success = await pushToRemote(item);
    if (success) {
      flushed += 1;
    } else {
      failed += 1;
      remaining.push(item);
    }
  }

  persistSyncQueue(remaining);
  return { flushed, failed };
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  flushSyncQueue,
  getPendingSyncCount,
  hasRemoteSync,
  isOnline,
} from '../lib/offlineSync';

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline';

interface OfflineContextValue {
  isOnline: boolean;
  pendingSyncCount: number;
  syncStatus: SyncStatus;
  syncMessage: string | null;
  retrySync: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextValue | null>(null);

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(isOnline);
  const [pendingSyncCount, setPendingSyncCount] = useState(getPendingSyncCount);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(online ? 'idle' : 'offline');
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const refreshPendingCount = useCallback(() => {
    setPendingSyncCount(getPendingSyncCount());
  }, []);

  const runSync = useCallback(async () => {
    if (!isOnline()) {
      setSyncStatus('offline');
      setSyncMessage('You are offline. Changes are saved on this device.');
      refreshPendingCount();
      return;
    }

    const pending = getPendingSyncCount();
    if (pending === 0) {
      setSyncStatus('synced');
      setSyncMessage(null);
      return;
    }

    setSyncStatus('syncing');
    setSyncMessage(`Syncing ${pending} pending change${pending === 1 ? '' : 's'}…`);

    const result = await flushSyncQueue();
    refreshPendingCount();

    if (result.failed > 0) {
      setSyncStatus('offline');
      setSyncMessage(
        `${result.flushed} synced, ${result.failed} still pending. Will retry when online.`,
      );
      return;
    }

    setSyncStatus('synced');
    if (result.flushed > 0) {
      setSyncMessage(
        hasRemoteSync()
          ? `${result.flushed} change${result.flushed === 1 ? '' : 's'} synced.`
          : 'Back online — your local changes are safe.',
      );
      window.setTimeout(() => setSyncMessage(null), 4000);
    } else {
      setSyncMessage(null);
    }
  }, [refreshPendingCount]);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      void runSync();
    };

    const handleOffline = () => {
      setOnline(false);
      setSyncStatus('offline');
      setSyncMessage('You are offline. Changes are saved on this device.');
      refreshPendingCount();
    };

    const handleStorage = () => refreshPendingCount();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('lifeflow-sync-queue-updated', handleStorage);

    if (online) {
      void runSync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('lifeflow-sync-queue-updated', handleStorage);
    };
  }, [online, refreshPendingCount, runSync]);

  return (
    <OfflineContext.Provider
      value={{
        isOnline: online,
        pendingSyncCount,
        syncStatus,
        syncMessage,
        retrySync: runSync,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}

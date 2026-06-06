import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

type SyncStatus = 'idle' | 'offline';

interface OfflineContextValue {
  isOnline: boolean;
  pendingSyncCount: number;
  syncStatus: SyncStatus;
  syncMessage: string | null;
  retrySync: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextValue | null>(null);

function readOnlineStatus(): boolean {
  return typeof navigator === 'undefined' ? true : navigator.onLine;
}

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(readOnlineStatus);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(online ? 'idle' : 'offline');
  const [syncMessage, setSyncMessage] = useState<string | null>(
    online ? null : 'You are offline. Changes will sync when you reconnect.',
  );

  const retrySync = useCallback(async () => {
    if (!readOnlineStatus()) {
      setSyncStatus('offline');
      setSyncMessage('You are offline. Changes will sync when you reconnect.');
      return;
    }

    setSyncStatus('idle');
    setSyncMessage(null);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setSyncStatus('idle');
      setSyncMessage(null);
    };

    const handleOffline = () => {
      setOnline(false);
      setSyncStatus('offline');
      setSyncMessage('You are offline. Changes will sync when you reconnect.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <OfflineContext.Provider
      value={{
        isOnline: online,
        pendingSyncCount: 0,
        syncStatus,
        syncMessage,
        retrySync,
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

import { Cloud, CloudOff, RefreshCw, Wifi } from 'lucide-react';
import { useOffline } from '../context/OfflineContext';

export default function OfflineStatusBanner() {
  const { isOnline, pendingSyncCount, syncStatus, syncMessage, retrySync } = useOffline();

  if (isOnline && syncStatus === 'idle' && pendingSyncCount === 0 && !syncMessage) {
    return null;
  }

  const isOffline = !isOnline || syncStatus === 'offline';
  const isSyncing = syncStatus === 'syncing';

  return (
    <div
      className={`px-4 py-2 text-xs flex items-center justify-between gap-3 border-b ${
        isOffline
          ? 'bg-amber-500/10 border-amber-500/20 text-amber-200'
          : isSyncing
            ? 'bg-blue-500/10 border-blue-500/20 text-blue-200'
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {isOffline ? (
          <CloudOff className="h-4 w-4 shrink-0" />
        ) : isSyncing ? (
          <RefreshCw className="h-4 w-4 shrink-0 animate-spin" />
        ) : (
          <Cloud className="h-4 w-4 shrink-0" />
        )}
        <span className="truncate">
          {syncMessage ??
            (isOffline
              ? 'Offline mode — your inputs are saved locally on this device.'
              : pendingSyncCount > 0
                ? `${pendingSyncCount} change${pendingSyncCount === 1 ? '' : 's'} waiting to sync.`
                : 'All changes are up to date.')}
        </span>
      </div>

      {isOnline && pendingSyncCount > 0 && !isSyncing && (
        <button
          type="button"
          onClick={() => void retrySync()}
          className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-700 transition-all font-semibold"
        >
          <Wifi className="h-3.5 w-3.5" />
          Sync now
        </button>
      )}
    </div>
  );
}

import { CloudOff } from 'lucide-react';
import { useOffline } from '../context/OfflineContext';

export default function OfflineStatusBanner() {
  const { isOnline, syncMessage } = useOffline();

  if (isOnline && !syncMessage) {
    return null;
  }

  return (
    <div className="px-4 py-2 text-xs flex items-center gap-2 border-b bg-amber-500/10 border-amber-500/20 text-amber-200">
      <CloudOff className="h-4 w-4 shrink-0" />
      <span className="truncate">
        {syncMessage ?? 'You are offline. Changes will sync when you reconnect.'}
      </span>
    </div>
  );
}

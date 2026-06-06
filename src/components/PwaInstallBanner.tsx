import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'lifeflow-pwa-install-dismissed';

export default function PwaInstallBanner() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && (navigator as Navigator & { standalone?: boolean }).standalone);

    setIsStandalone(Boolean(standalone));

    if (standalone || localStorage.getItem(DISMISS_KEY)) {
      return;
    }

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!visible || !promptEvent || isStandalone) {
    return null;
  }

  const handleInstall = async () => {
    await promptEvent.prompt();
    await promptEvent.userChoice;
    setVisible(false);
    setPromptEvent(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
    setPromptEvent(null);
  };

  return (
    <div className="px-4 py-3 bg-indigo-500/10 border-b border-indigo-500/20 text-indigo-100 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold">Install LifeFlow</p>
        <p className="text-[11px] text-indigo-200/80 truncate">Add to your home screen for quick access offline.</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => void handleInstall()}
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold touch-manipulation"
        >
          <Download className="h-3.5 w-3.5" />
          Install
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="p-2 rounded-lg text-indigo-200 hover:bg-indigo-500/20 touch-manipulation"
          aria-label="Dismiss install banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

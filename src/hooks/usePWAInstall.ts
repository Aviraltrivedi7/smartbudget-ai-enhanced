import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

type InstallResult = 'accepted' | 'dismissed' | 'unavailable' | 'ios';
type PWAListener = () => void;
type InstallChoice = { outcome: 'accepted' | 'dismissed'; platform: string } | { outcome: 'timeout'; platform: string };

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<PWAListener>();

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

const isIOSDevice = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);
const isStandaloneMode = () => window.matchMedia('(display-mode: standalone)').matches || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

// Register once at module load so the event is not lost while the app is showing its splash screen.
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notifyListeners();
  });
}

export const usePWAInstall = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [, forceRefresh] = useState(0);

  useEffect(() => {
    setIsIOS(isIOSDevice());
    setIsInstalled(isStandaloneMode());

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = () => setIsInstalled(isStandaloneMode());
    const handlePWAEvent = () => {
      setIsInstalled(isStandaloneMode());
      forceRefresh((value) => value + 1);
    };

    listeners.add(handlePWAEvent);
    mediaQuery.addEventListener?.('change', handleDisplayModeChange);
    window.addEventListener('pageshow', handleDisplayModeChange);

    return () => {
      listeners.delete(handlePWAEvent);
      mediaQuery.removeEventListener?.('change', handleDisplayModeChange);
      window.removeEventListener('pageshow', handleDisplayModeChange);
    };
  }, []);

  const install = useCallback(async (): Promise<InstallResult> => {
    if (isIOS) return 'ios';
    if (!deferredPrompt) return 'unavailable';

    try {
      const promptEvent = deferredPrompt;
      const promptStarted = await Promise.race([
        Promise.resolve().then(() => promptEvent.prompt()).then(() => 'started' as const).catch(() => 'error' as const),
        new Promise<'timeout'>((resolve) => window.setTimeout(() => resolve('timeout'), 1800)),
      ]);
      if (promptStarted !== 'started') {
        deferredPrompt = null;
        notifyListeners();
        return 'unavailable';
      }

      const choice = await Promise.race([
        promptEvent.userChoice,
        new Promise<InstallChoice>((resolve) => window.setTimeout(() => resolve({ outcome: 'timeout', platform: 'browser' }), 1800)),
      ]);
      deferredPrompt = null;
      notifyListeners();
      return choice.outcome === 'timeout' ? 'unavailable' : choice.outcome;
    } catch {
      deferredPrompt = null;
      notifyListeners();
      return 'unavailable';
    }
  }, [isIOS]);

  return {
    canInstall: Boolean(deferredPrompt) || isIOS,
    isInstalled,
    isIOS,
    install,
  };
};

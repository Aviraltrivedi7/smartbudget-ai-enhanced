import { Download, Share, X } from 'lucide-react';
import { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';

const DISMISS_KEY = 'dhansetu_install_prompt_dismissed';

const PWAInstallPrompt = () => {
  const { isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(() => window.localStorage.getItem(DISMISS_KEY) === 'true');
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showBrowserGuide, setShowBrowserGuide] = useState(false);

  if (isInstalled || dismissed) return null;

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, 'true');
    setDismissed(true);
  };

  const handleInstall = async () => {
    const result = await install();
    if (result === 'ios') {
      setShowIOSGuide(true);
    } else if (result === 'unavailable') {
      setShowBrowserGuide(true);
    } else if (result === 'accepted') {
      dismiss();
    }
  };

  return (
    <aside className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-2xl border border-[#aeb8ed]/45 bg-[#222d4b] p-4 text-white shadow-[0_18px_48px_rgba(24,33,58,0.28)] sm:inset-x-auto sm:right-6 sm:w-[360px]" aria-label="Install DhanSetu AI">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#dfe4ff] text-[#222d4b]"><Download className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">Keep DhanSetu one tap away</p>
          <p className="mt-1 text-xs leading-5 text-white/65">Install the private finance workspace for a faster, app-like experience.</p>
        </div>
        <button type="button" onClick={dismiss} aria-label="Dismiss install prompt" className="rounded-lg p-1 text-white/50 transition hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
      </div>
      {showIOSGuide || showBrowserGuide ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-5 text-white/75">
          <p className="font-bold text-white">{showIOSGuide ? 'Install on iPhone' : 'Install from your browser'}</p>
          <p className="mt-1">{showIOSGuide ? <>Tap the browser <Share className="mx-0.5 inline h-3.5 w-3.5 text-[#dfe4ff]" /> Share button, then choose <span className="font-semibold text-white">Add to Home Screen</span>.</> : <>Open your browser menu and choose <span className="font-semibold text-white">Install DhanSetu AI</span> or <span className="font-semibold text-white">Add to Home screen</span>.</>}</p>
          <button type="button" onClick={dismiss} className="mt-2 text-xs font-bold text-[#dfe4ff]">Got it</button>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2">
          <Button type="button" onClick={handleInstall} className="h-9 flex-1 bg-[#dfe4ff] text-xs font-bold text-[#222d4b] hover:bg-white">{isIOS ? 'How to install' : 'Install app'} <Download className="ml-2 h-3.5 w-3.5" /></Button>
          <button type="button" onClick={dismiss} className="px-2 text-xs font-semibold text-white/50 transition hover:text-white">Not now</button>
        </div>
      )}
    </aside>
  );
};

export default PWAInstallPrompt;

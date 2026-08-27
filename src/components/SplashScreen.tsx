import { useEffect, useState } from 'react';
import { ArrowUpRight, Check, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

interface SplashScreenProps {
  onComplete: () => void;
}

const SPLASH_DURATION = 1800;

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const { t } = useLanguage();
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    const startedAt = Date.now();
    const progressInterval = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextProgress = Math.min(100, Math.round((elapsed / SPLASH_DURATION) * 100));
      setProgress(nextProgress);
      if (nextProgress >= 100) {
        window.clearInterval(progressInterval);
        setFadeOut(true);
        window.setTimeout(onComplete, 280);
      }
    }, 24);

    const skipTimer = window.setTimeout(() => setShowSkip(true), 850);

    return () => {
      window.clearInterval(progressInterval);
      window.clearTimeout(skipTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setFadeOut(true);
    window.setTimeout(onComplete, 180);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#f8f7f4] px-6 transition-all duration-300 ${fadeOut ? 'scale-[1.02] opacity-0' : 'opacity-100'}`}
      role="status"
      aria-live="polite"
      aria-busy={!fadeOut}
    >
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#dfe4ff] bg-white shadow-[0_24px_80px_rgba(20,33,69,0.12)] md:grid-cols-[1.05fr_0.95fr]">
        <div className="relative flex min-h-[520px] flex-col justify-between overflow-hidden bg-[#0b1f4b] px-7 py-8 text-white sm:px-12 sm:py-12">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border border-white/10" />
          <div className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full border border-[#8795d2]/20" />
          <div className="relative z-10 flex items-center gap-3 text-sm font-semibold tracking-wide text-[#dfe4ff]">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f6c343] text-[#0b1f4b]">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            DhanSetu AI
          </div>

          <div className="relative z-10 mt-16">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#aeb9ee]">Your money, with direction</p>
            <h1 className="max-w-md text-4xl font-black leading-[0.98] tracking-[-0.05em] sm:text-6xl">Make every rupee feel intentional.</h1>
            <p className="mt-6 max-w-sm text-base leading-7 text-white/70 sm:text-lg">{t('yourPersonalFinanceAssistant')}</p>
          </div>

          <div className="relative z-10 mt-14 flex items-center gap-3 text-xs font-semibold text-white/65">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20"><Check className="h-3.5 w-3.5 text-[#f6c343]" aria-hidden="true" /></span>
            Private workspace · India-ready
          </div>
        </div>

        <div className="relative flex min-h-[520px] flex-col items-center justify-center bg-[#fffdf8] px-7 py-10 text-center sm:px-12">
          <div className="absolute right-6 top-6 h-2 w-2 rounded-full bg-[#f6c343]" />
          <img src="/pwa-assets/dhansetu-splash.png" alt="DhanSetu AI bridge mark" className="h-64 w-52 object-contain sm:h-72 sm:w-60" />
          <div className="mt-5">
            <p className="text-2xl font-black tracking-[-0.04em] text-[#0b1f4b]">DhanSetu AI</p>
            <p className="mt-2 text-sm leading-6 text-[#64748b]">A smart bridge from today’s money<br />to tomorrow’s goals.</p>
          </div>
          <div className="mt-8 w-full max-w-xs">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-[#64748b]">
              <span>Setting up your workspace</span><span>{progress}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e8eaf5]" aria-hidden="true">
              <div className="h-full rounded-full bg-[#f6c343] transition-[width] duration-100 ease-out" style={{ width: `${progress}%` }} />
            </div>
          </div>
          {showSkip && (
            <Button onClick={handleSkip} variant="ghost" className="absolute bottom-5 right-5 h-8 gap-1 text-xs font-semibold text-[#64748b] hover:bg-[#eef1ff] hover:text-[#0b1f4b]">
              Skip <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;

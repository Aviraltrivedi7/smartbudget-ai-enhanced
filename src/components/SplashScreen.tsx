import { useEffect, useState } from 'react';
import { Wallet, Sparkles, TrendingUp, IndianRupee } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const { t } = useLanguage();
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setFadeOut(true);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    // Show skip button after 1 second
    const skipTimer = setTimeout(() => {
      setShowSkip(true);
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(skipTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setFadeOut(true);
    setTimeout(onComplete, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-500 smooth-load ${fadeOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      style={{
        background: 'linear-gradient(140deg, #222d4b 0%, #3e4c91 58%, #6976cc 100%)',
        willChange: 'opacity, transform'
      }}
    >
      {/* Floating icons */}
      <div className="absolute inset-0">
        <IndianRupee className="absolute top-20 left-20 w-8 h-8 text-[#dfe4ff]/35 animate-bounce" style={{ animationDelay: '0s' }} />
        <TrendingUp className="absolute top-32 right-32 w-6 h-6 text-[#dfe4ff]/45 animate-pulse" style={{ animationDelay: '1s' }} />
        <Sparkles className="absolute bottom-40 left-40 w-7 h-7 text-[#dfe4ff]/40 animate-spin" style={{ animationDuration: '3s' }} />
        <Wallet className="absolute bottom-32 right-20 w-5 h-5 text-[#dfe4ff]/35 float-animation" />
      </div>

      <div className="relative">
        {/* Animated circles */}
        <div className="absolute inset-0 -m-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#dfe4ff]/5 rounded-full animate-ping" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-[#dfe4ff]/10 rounded-full animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#dfe4ff]/15 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        {/* Enhanced Logo */}
        <div className="relative z-10 flex h-48 w-48 items-center justify-center rounded-full border border-[#dfe4ff]/20 bg-[#dfe4ff]/15 p-7 shadow-2xl backdrop-blur-md animate-bounce-slow">
          <div className="relative flex h-full w-full items-center justify-center rounded-full bg-[#dfe4ff]/10 p-3">
            <img src="/arthora-logo.png" alt="Arthora logo" className="h-full w-full object-contain drop-shadow-lg" />
            <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#e7dcae] shadow-lg">
              <Sparkles className="h-3.5 w-3.5 text-[#222d4b]" />
            </div>
          </div>
        </div>
      </div>

      {/* App Name with enhanced styling */}
      <div className="mt-10 text-center space-y-4">
        <h1 className="text-5xl font-black uppercase tracking-[0.02em] text-white drop-shadow-lg animate-fade-in">
          <span className="bg-gradient-to-r from-white to-[#dfe4ff] bg-clip-text text-transparent">
            ARTHORA
          </span>
          <span className="ml-3 bg-gradient-to-r from-[#dfe4ff] to-white bg-clip-text text-transparent">
            AI
          </span>
        </h1>
        <p className="text-white/90 text-xl font-medium animate-fade-in-delay drop-shadow">
          {t('yourPersonalFinanceAssistant')}
        </p>
        <div className="flex items-center justify-center space-x-2 animate-fade-in-delay">
          <Sparkles className="w-4 h-4 text-[#e7dcae]" />
          <span className="text-white/80 text-sm">
            {t('language') === 'भाषा' ? 'आपका स्मार्ट वित्तीय साथी' : 'Your Smart Financial Companion'}
          </span>
          <Sparkles className="w-4 h-4 text-[#e7dcae]" />
        </div>
      </div>

      {/* Enhanced Progress bar */}
      <div className="mt-12 w-80 space-y-4">
        <div className="relative">
          <div className="w-full bg-[#dfe4ff]/20 rounded-full h-3 backdrop-blur-sm">
            <div
              className="bg-gradient-to-r from-[#aeb9ee] via-[#dfe4ff] to-[#8795d2] h-3 rounded-full transition-all duration-100 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse" />
            </div>
          </div>
          <div className="flex justify-between text-white/70 text-xs mt-2">
            <span>Loading...</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Loading dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce-dot" />
          <div className="w-3 h-3 bg-white rounded-full animate-bounce-dot animation-delay-200" />
          <div className="w-3 h-3 bg-white rounded-full animate-bounce-dot animation-delay-400" />
        </div>
      </div>

      {/* Skip button */}
      {showSkip && (
        <div className="absolute bottom-8 right-8 animate-fadeInUp">
          <Button
            onClick={handleSkip}
            variant="outline"
            className="bg-[#dfe4ff]/10 border-white/30 text-white hover:bg-[#dfe4ff]/20 backdrop-blur-sm"
          >
            Skip →
          </Button>
        </div>
      )}
    </div>
  );
};

export default SplashScreen;

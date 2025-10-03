import { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const { t } = useLanguage();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary-foreground transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative">
        {/* Animated circles */}
        <div className="absolute inset-0 -m-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/10 rounded-full animate-ping" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/20 rounded-full animate-pulse" />
        </div>

        {/* Logo */}
        <div className="relative z-10 bg-white/10 backdrop-blur-sm p-8 rounded-3xl shadow-2xl animate-bounce-slow">
          <Wallet className="w-20 h-20 text-white" strokeWidth={1.5} />
        </div>
      </div>

      {/* App Name */}
      <h1 className="mt-8 text-4xl font-bold text-white animate-fade-in">
        {t('smartBudgetAI')}
      </h1>
      <p className="mt-2 text-white/80 text-lg animate-fade-in-delay">
        {t('yourPersonalFinanceAssistant')}
      </p>

      {/* Loading indicator */}
      <div className="mt-8 flex space-x-2">
        <div className="w-2 h-2 bg-white rounded-full animate-bounce-dot" />
        <div className="w-2 h-2 bg-white rounded-full animate-bounce-dot animation-delay-200" />
        <div className="w-2 h-2 bg-white rounded-full animate-bounce-dot animation-delay-400" />
      </div>
    </div>
  );
};

export default SplashScreen;

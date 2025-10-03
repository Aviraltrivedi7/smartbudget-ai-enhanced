import { useEffect, useState } from 'react';
import { Wallet, Sparkles, TrendingUp, DollarSign } from 'lucide-react';
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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-500 smooth-load ${
        fadeOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 8s ease infinite',
        willChange: 'opacity, transform'
      }}
    >
      {/* Floating icons */}
      <div className="absolute inset-0">
        <DollarSign className="absolute top-20 left-20 w-8 h-8 text-white/30 animate-bounce" style={{ animationDelay: '0s' }} />
        <TrendingUp className="absolute top-32 right-32 w-6 h-6 text-white/40 animate-pulse" style={{ animationDelay: '1s' }} />
        <Sparkles className="absolute bottom-40 left-40 w-7 h-7 text-white/35 animate-spin" style={{ animationDuration: '3s' }} />
        <Wallet className="absolute bottom-32 right-20 w-5 h-5 text-white/30 float-animation" />
      </div>

      <div className="relative">
        {/* Animated circles */}
        <div className="absolute inset-0 -m-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/5 rounded-full animate-ping" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/10 rounded-full animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/15 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        {/* Enhanced Logo */}
        <div className="relative z-10 bg-white/15 backdrop-blur-md p-10 rounded-full shadow-2xl animate-bounce-slow border border-white/20">
          <div className="relative">
            <Wallet className="w-24 h-24 text-white drop-shadow-lg" strokeWidth={1.5} />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* App Name with enhanced styling */}
      <div className="mt-10 text-center space-y-4">
        <h1 className="text-5xl font-black text-white drop-shadow-lg animate-fade-in">
          <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Smart
          </span>
          <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
            Budget 
          </span>
          <span className="bg-gradient-to-r from-green-200 to-blue-200 bg-clip-text text-transparent">
            AI
          </span>
        </h1>
        <p className="text-white/90 text-xl font-medium animate-fade-in-delay drop-shadow">
          {t('yourPersonalFinanceAssistant')}
        </p>
        <div className="flex items-center justify-center space-x-2 animate-fade-in-delay">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span className="text-white/80 text-sm">
            {t('language') === 'भाषा' ? 'आपका स्मार्ट वित्तीय साथी' : 'Your Smart Financial Companion'}
          </span>
          <Sparkles className="w-4 h-4 text-yellow-300" />
        </div>
      </div>

      {/* Enhanced Progress bar */}
      <div className="mt-12 w-80 space-y-4">
        <div className="relative">
          <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur-sm">
            <div 
              className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 h-3 rounded-full transition-all duration-100 ease-out relative overflow-hidden"
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
            className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            Skip →
          </Button>
        </div>
      )}
    </div>
  );
};

export default SplashScreen;

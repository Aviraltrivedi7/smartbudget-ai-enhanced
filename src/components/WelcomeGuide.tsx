import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, ArrowRight, Sparkles, Target, Brain, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface WelcomeGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onFeatureSelect?: (feature: string) => void;
}

const WelcomeGuide: React.FC<WelcomeGuideProps> = ({ isOpen, onClose, onFeatureSelect }) => {
  const { t, currentLanguage } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: {
        en: "Welcome to ARTHORA AI!",
        hi: "ARTHORA AI में आपका स्वागत है!"
      },
      description: {
        en: "Your intelligent financial companion is here to help you manage money better",
        hi: "आपका बुद्धिमान वित्तीय साथी आपको पैसा बेहतर तरीके से प्रबंधित करने में मदद करने के लिए यहां है"
      },
      icon: <Sparkles className="h-12 w-12 text-yellow-500" />
    },
    {
      title: {
        en: "Track Your Expenses",
        hi: "अपने खर्च ट्रैक करें"
      },
      description: {
        en: "Add transactions with voice commands, scan bills, and categorize spending automatically",
        hi: "आवाज कमांड के साथ लेनदेन जोड़ें, बिल स्कैन करें, और खर्च को स्वचालित रूप से वर्गीकृत करें"
      },
      icon: <TrendingUp className="h-12 w-12 text-blue-500" />
    },
    {
      title: {
        en: "AI-Powered Insights",
        hi: "AI-संचालित अंतर्दृष्टि"
      },
      description: {
        en: "Get personalized financial advice and spending patterns analysis from our AI coach",
        hi: "हमारे AI कोच से व्यक्तिगत वित्तीय सलाह और खर्च पैटर्न का विश्लेषण प्राप्त करें"
      },
      icon: <Brain className="h-12 w-12 text-purple-500" />
    },
    {
      title: {
        en: "Achieve Your Goals",
        hi: "अपने लक्ष्यों को प्राप्त करें"
      },
      description: {
        en: "Set savings goals, track budget progress, and get gamified rewards for good financial habits",
        hi: "बचत लक्ष्य निर्धारित करें, बजट प्रगति ट्रैक करें, और अच्छी वित्तीय आदतों के लिए गेमिफाइड पुरस्कार प्राप्त करें"
      },
      icon: <Target className="h-12 w-12 text-green-500" />
    }
  ];

  const features = [
    {
      key: 'add-expense',
      title: {
        en: "Add First Transaction",
        hi: "पहला लेनदेन जोड़ें"
      },
      emoji: "💰"
    },
    {
      key: 'voice-entry',
      title: {
        en: "Try Voice Entry",
        hi: "आवाज एंट्री आज़माएं"
      },
      emoji: "🎤"
    },
    {
      key: 'insights',
      title: {
        en: "View AI Insights",
        hi: "AI अंतर्दृष्टि देखें"
      },
      emoji: "🧠"
    },
    {
      key: 'budget-planner',
      title: {
        en: "Plan Budget",
        hi: "बजट प्लान करें"
      },
      emoji: "📊"
    }
  ];

  const getText = (textObj: { en: string; hi: string }) => {
    return textObj[currentLanguage as 'en' | 'hi'] || textObj.en;
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFeatureSelect = (featureKey: string) => {
    onFeatureSelect?.(featureKey);
    onClose();
  };

  const currentStepData = steps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {currentStep < steps.length ? getText(currentStepData.title) : (getText({ en: "Ready to Start?", hi: "शुरू करने के लिए तैयार?" }))}
          </DialogTitle>
        </DialogHeader>

        {currentStep < steps.length ? (
          <div className="space-y-6 p-6 animate-fadeInUp">
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div 
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse" />
              </div>
            </div>

            {/* Step content */}
            <div className="text-center space-y-6 animate-scaleIn">
              <div className="flex justify-center mb-6 animate-bounceIn">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full shadow-lg">
                  {currentStepData.icon}
                </div>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed animate-fadeInUp animate-delay-200">
                {getText(currentStepData.description)}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 0}
                className="px-6"
              >
                ← {getText({ en: "Previous", hi: "पिछला" })}
              </Button>
              
              <span className="text-sm text-gray-500">
                {currentStep + 1} / {steps.length}
              </span>
              
              <Button 
                onClick={currentStep === steps.length - 1 ? () => setCurrentStep(steps.length) : nextStep}
                className="px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 button-hover-effect"
              >
                {currentStep === steps.length - 1 
                  ? getText({ en: "Get Started", hi: "शुरू करें" })
                  : getText({ en: "Next", hi: "अगला" })
                } →
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 p-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <p className="text-lg text-gray-600">
                {getText({ 
                  en: "Choose a feature to start your financial journey!",
                  hi: "अपनी वित्तीय यात्रा शुरू करने के लिए एक फीचर चुनें!" 
                })}
              </p>
            </div>

            {/* Feature selection */}
            <div className="grid grid-cols-2 gap-4 animate-fadeInUp animate-delay-300">
              {features.map((feature, index) => (
                <Card 
                  key={feature.key}
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-110 border-2 hover:border-gradient-to-r hover:from-blue-400 hover:to-purple-400 glass-card button-hover-effect animate-scaleIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleFeatureSelect(feature.key)}
                >
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="text-4xl transform hover:scale-125 transition-transform duration-200">{feature.emoji}</div>
                    <h3 className="font-semibold text-sm text-gray-700">
                      {getText(feature.title)}
                    </h3>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="px-8"
              >
                {getText({ en: "Explore Later", hi: "बाद में एक्सप्लोर करें" })}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeGuide;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/contexts/LanguageContext';

type ViewType = 'dashboard' | 'add-expense' | 'insights' | 'visualizer' | 'coach' | 'budget-planner' | 'savings-goals' | 'bill-reminder' | 'expense-chat' | 'spending-limits' | 'gamification' | 'monthly-report' | 'smart-suggestions';

interface FeatureNavigationProps {
  onNavigate: (view: ViewType) => void;
}

const FeatureNavigation: React.FC<FeatureNavigationProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  const features = [
    { id: 'expense-chat', name: `💬 ${t('expenseChat')}`, desc: 'AI se apne kharchon ka hisab poocho' },
    { id: 'spending-limits', name: `💎 ${t('spendingLimits')}`, desc: 'Har category ki limit set karo' },
    { id: 'gamification', name: `🏆 ${t('gamification')}`, desc: 'Badges jeeto aur bachat badhao' },
    { id: 'monthly-report', name: `📊 ${t('monthlyReport')}`, desc: 'Summary download karo ek click mein' },
    { id: 'smart-suggestions', name: `🧠 ${t('smartSuggestions')}`, desc: 'AI-powered badiya bachat tips' },
    { id: 'bill-reminder', name: `🔔 ${t('billReminder')}`, desc: 'Ek bhi bill miss nahi hoga ab' },
  ];

  return (
    <Card className="border-0 card-shadow">
      <CardHeader>
        <CardTitle>🚀 Mast Features - Sab Kaam Ke!</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <Button
              key={feature.id}
              variant="outline"
              className="h-auto p-4 text-left"
              onClick={() => onNavigate(feature.id as ViewType)}
            >
              <div>
                <div className="font-semibold text-sm">{feature.name}</div>
                <div className="text-xs text-gray-600 mt-1">{feature.desc}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureNavigation;

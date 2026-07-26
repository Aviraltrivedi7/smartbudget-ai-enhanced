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
    { id: 'expense-chat', name: `💬 ${t('expenseChat')}`, desc: 'Ask AI assistant about your expenses' },
    { id: 'spending-limits', name: `💎 ${t('spendingLimits')}`, desc: 'Set budget limits per category' },
    { id: 'gamification', name: `🏆 ${t('gamification')}`, desc: 'Earn badges and boost savings' },
    { id: 'monthly-report', name: `📊 ${t('monthlyReport')}`, desc: 'Download financial summary report' },
    { id: 'smart-suggestions', name: `🧠 ${t('smartSuggestions')}`, desc: 'AI-powered savings recommendations' },
    { id: 'bill-reminder', name: `🔔 ${t('billReminder')}`, desc: 'Never miss an upcoming bill payment' },
  ];

  return (
    <Card className="border-0 card-shadow">
      <CardHeader>
        <CardTitle>🚀 Key Smart Features</CardTitle>
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

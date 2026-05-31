
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingDown, TrendingUp, AlertTriangle, ThumbsUp, ArrowLeft, Languages } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/contexts/LanguageContext';
import { getCategoryTranslation } from '@/utils/languages';

interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

interface SpendingCoachProps {
  onBack: () => void;
  transactions: Transaction[];
}

const SpendingCoach: React.FC<SpendingCoachProps> = ({ onBack, transactions }) => {
  const { t, currentLanguage, setLanguage } = useLanguage();
  const [insights, setInsights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const toggleLanguage = () => {
    setLanguage(currentLanguage === 'hi' ? 'en' : 'hi');
    toast({
      title: currentLanguage === 'hi' ? "Language switched to English" : "भाषा हिंदी में बदल दी गई है",
      duration: 2000,
    });
  };

  const generateInsights = () => {
    if (transactions.length === 0) {
      setIsLoading(false);
      return;
    }

    // Get the most recent month from transactions
    const sortedTransactions = [...transactions]
      .filter(t => t.type === 'expense')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (sortedTransactions.length === 0) {
      setIsLoading(false);
      return;
    }

    const latestTx = new Date(sortedTransactions[0].date);
    const currentMonth = latestTx.getMonth();
    const currentYear = latestTx.getFullYear();

    const currentMonthExpenses = transactions.filter(t => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // Previous month (same year or previous)
    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    const lastMonthExpenses = transactions.filter(t => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });

    // Category analysis
    const categorySpending = currentMonthExpenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)[0];

    const categoryName = topCategory?.[0] || 'Other';
    const translatedCategory = getCategoryTranslation(categoryName, currentLanguage);
    const isIncreasing = currentMonthExpenses.length > lastMonthExpenses.length;

    // Generate AI-like insights
    const generatedInsights = [
      {
        type: 'warning',
        title: t('warningTitle').replace('{category}', translatedCategory),
        description: t('warningDesc').replace('{amount}', (topCategory?.[1]?.toLocaleString() || '0')),
        icon: AlertTriangle,
        color: 'bg-red-100 text-red-600'
      },
      {
        type: 'trend',
        title: t('trendTitle'),
        description: isIncreasing ? t('trendDescIncreasing') : t('trendDescGood'),
        icon: isIncreasing ? TrendingUp : TrendingDown,
        color: isIncreasing ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
      },
      {
        type: 'suggestion',
        title: t('suggestionTitle'),
        description: t('suggestionDesc')
          .replace('{category}', translatedCategory)
          .replace('{limit}', Math.floor((topCategory?.[1] || 0) * 0.8)?.toLocaleString()),
        icon: ThumbsUp,
        color: 'bg-blue-100 text-blue-600'
      }
    ];

    setInsights(generatedInsights);
    setIsLoading(false);
  };

  useEffect(() => {
    setTimeout(generateInsights, 1500); // Simulate AI processing
  }, [transactions, currentLanguage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="p-2 h-10 w-10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t('aiSpendingCoach')}
            </h1>
            <p className="text-gray-600">{t('aiSpendingCoachSubtitle')}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="gap-2 bg-white/50"
          >
            <Languages className="h-4 w-4" />
            {currentLanguage === 'hi' ? 'English' : 'हिंदी'}
          </Button>
        </div>

        {isLoading ? (
          <Card className="border-0 card-shadow">
            <CardContent className="p-8 text-center">
              <Brain className="h-12 w-12 mx-auto mb-4 animate-pulse text-purple-600" />
              <p className="text-lg">AI analyzing your spending patterns...</p>
              <div className="mt-4 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {insights.map((insight, index) => (
              <Card key={index} className="border-0 card-shadow hover:scale-105 transition-transform">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${insight.color}`}>
                      <insight.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        AI Analysis
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{insight.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="border-0 card-shadow bg-gradient-to-r from-purple-100 to-pink-100">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">{t('proTipTitle')}</h3>
            <p className="text-sm text-gray-600">
              {t('proTipDesc')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SpendingCoach;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain, TrendingUp, TrendingDown, AlertTriangle, Target, Lightbulb, Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from "@/hooks/use-toast";
import { getCategoryTranslation } from '@/utils/languages';

interface AIInsightsProps {
  onBack: () => void;
}

const AIInsights: React.FC<AIInsightsProps> = ({ onBack }) => {
  const { t, currentLanguage, setLanguage } = useLanguage();
  const { toast } = useToast();

  const toggleLanguage = () => {
    setLanguage(currentLanguage === 'hi' ? 'en' : 'hi');
    toast({
      title: currentLanguage === 'hi' ? "Language switched to English" : "भाषा हिंदी में बदल दी गई है",
      duration: 2000,
    });
  };

  // Sample AI insights data - in a real app this would come from your AI API
  // Calculate real insights from transactions
  const transactions = JSON.parse(localStorage.getItem('pocket_pal_transactions') || '[]');
  const expenses = transactions.filter((t: any) => t.type === 'expense');
  const income = transactions.filter((t: any) => t.type === 'income');

  const totalExpenses = expenses.reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  const totalIncome = income.reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const categoryTotals = expenses.reduce((acc: any, t: any) => {
    acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    return acc;
  }, {});

  const topCategories = Object.entries(categoryTotals)
    .map(([name, amount]: [string, any]) => ({
      name,
      amount,
      percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  const spendingCategory = topCategories[0]?.name || 'Expenses';
  const spendingCategoryTranslated = getCategoryTranslation(spendingCategory, currentLanguage);

  const insights = {
    spendingIncrease: {
      category: spendingCategoryTranslated,
      percentage: 12,
      amount: topCategories[0]?.amount || 0,
      previousMonth: (topCategories[0]?.amount || 0) * 0.88
    },
    prediction: {
      nextMonth: totalExpenses * 1.05,
      confidence: 88
    },
    topCategories,
    suggestions: [
      {
        type: 'warning',
        title: currentLanguage === 'hi'
          ? t('spendingIncreaseHi').replace('{timePeriod}', t('thisMonth')).replace('{category}', spendingCategoryTranslated)
          : t('spendingIncrease').replace('{timePeriod}', t('thisMonth').toLowerCase()).replace('{category}', spendingCategoryTranslated),
        description: t('thisMonthValue').replace('{amount}', (topCategories[0]?.amount || 0).toLocaleString()),
        potential_savings: (topCategories[0]?.amount || 0) * 0.15
      },
      {
        type: 'tip',
        title: t('smartSavingsTip'),
        description: savingsRate < 25 ? t('savingsTipLow') : t('savingsTipHigh'),
        potential_savings: totalExpenses * 0.08
      },
      {
        type: 'goal',
        title: t('monthlyGoal'),
        description: t('monthlyGoalDesc').replace('{amount}', (totalIncome * 0.25).toLocaleString()),
        potential_savings: 0
      }
    ],
    patterns: [
      t('largestExpensePattern')
        .replace('{category}', spendingCategoryTranslated)
        .replace('{percentage}', (topCategories[0]?.percentage || 0).toString()),
      t('savingsRatePattern').replace('{percentage}', savingsRate.toFixed(1)),
      totalExpenses > totalIncome ? t('expenseControlWarning') : t('expenseControlSuccess')
    ]
  };

  const getIconForSuggestionType = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'tip':
        return <Lightbulb className="h-5 w-5 text-blue-500" />;
      case 'goal':
        return <Target className="h-5 w-5 text-green-500" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {t('aiInsightsTitle')}
            </h1>
            <p className="text-gray-600">{t('aiInsightsSubtitle')}</p>
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

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Spending Alert */}
          <Card className="border-0 card-shadow bg-gradient-to-r from-orange-50 to-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <TrendingUp className="h-5 w-5" />
                {t('spendingAlert')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-lg font-semibold">
                  {currentLanguage === 'hi'
                    ? t('spendingIncreaseHi').replace('{timePeriod}', t('thisMonth')).replace('{category}', insights.spendingIncrease.category)
                    : t('spendingIncrease').replace('{timePeriod}', t('thisMonth').toLowerCase()).replace('{category}', insights.spendingIncrease.category)
                  }
                </p>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{t('thisMonthValue').replace('{amount}', insights.spendingIncrease.amount.toLocaleString())}</span>
                  <span>{t('lastMonthValue').replace('{amount}', insights.spendingIncrease.previousMonth.toLocaleString())}</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Prediction */}
          <Card className="border-0 card-shadow bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Brain className="h-5 w-5" />
                {t('nextMonthPrediction')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-2xl font-bold text-blue-600">
                  ₹{insights.prediction.nextMonth.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  {t('predictedTotalExpenses')}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {t('confidence').replace('{score}', insights.prediction.confidence.toString())}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card className="border-0 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              {t('topSpendingCategories')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.topCategories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{getCategoryTranslation(category.name, currentLanguage)}</span>
                    <span className="font-semibold">₹{category.amount.toLocaleString()}</span>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                  <p className="text-xs text-gray-500">{t('totalExpensesStat').replace('{percentage}', category.percentage.toString())}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        <Card className="border-0 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              {t('smartSuggestions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.suggestions.map((suggestion, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    {getIconForSuggestionType(suggestion.type)}
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{suggestion.title}</h4>
                      <p className="text-gray-600 text-sm mb-2">{suggestion.description}</p>
                      {suggestion.potential_savings > 0 && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Potential savings: ₹{suggestion.potential_savings.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Spending Patterns */}
        <Card className="border-0 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              {t('spendingPatterns')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.patterns.map((pattern, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <p className="text-gray-700">{pattern}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="border-0 card-shadow bg-gradient-to-r from-green-50 to-blue-50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
          <CardContent className="p-8 relative z-10">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-black text-gray-800 drop-shadow-sm">{t('financialHealthScore')}</h3>
              <div className="relative inline-block mt-4">
                <div className="text-6xl font-black text-green-600 animate-glow">
                  {Math.min(100, Math.max(0, Math.round(savingsRate + 50)))}
                </div>
                <div className="text-sm font-bold text-gray-500 mt-2">{t('outOf100')}</div>
              </div>
              <p className="text-gray-600 text-lg">
                {savingsRate > 20 ? t('healthScoreExcellent') : t('healthScoreGood')}
              </p>
              <div className="flex justify-center gap-3 mt-6">
                <Badge className="bg-green-100 text-green-800 px-4 py-1 text-sm border-0 animate-bounceIn animate-delay-100">
                  {savingsRate > 10 ? t('healthySavings') : t('lowSavings')}
                </Badge>
                <Badge className="bg-blue-100 text-blue-800 px-4 py-1 text-sm border-0 animate-bounceIn animate-delay-200">
                  {t('aiAnalyzed')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIInsights;

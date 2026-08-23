
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain, TrendingUp, TrendingDown, AlertTriangle, Target, Lightbulb, Languages, ChevronRight, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from "@/hooks/use-toast";
import { getCategoryTranslation } from '@/utils/languages';

interface AIInsightsProps {
  onBack: () => void;
  onOpenCoach?: (prompt: string) => void;
}

interface InsightTransaction {
  type: 'income' | 'expense';
  amount: number | string;
  category: string;
}

const AIInsights: React.FC<AIInsightsProps> = ({ onBack, onOpenCoach }) => {
  const { t, currentLanguage, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [activePrompt, setActivePrompt] = React.useState<number | null>(null);

  const toggleLanguage = () => {
    setLanguage(currentLanguage === 'hi' ? 'en' : 'hi');
    toast({
      title: currentLanguage === 'hi' ? "Language switched to English" : "भाषा हिंदी में बदल दी गई है",
      duration: 2000,
    });
  };

  // Sample AI insights data - in a real app this would come from your AI API
  // Calculate real insights from transactions
  const transactions: InsightTransaction[] = JSON.parse(localStorage.getItem('pocket_pal_transactions') || '[]');
  const expenses = transactions.filter((transaction) => transaction.type === 'expense');
  const income = transactions.filter((transaction) => transaction.type === 'income');

  const totalExpenses = expenses.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const totalIncome = income.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const categoryTotals = expenses.reduce<Record<string, number>>((acc, transaction) => {
    acc[transaction.category] = (acc[transaction.category] || 0) + Number(transaction.amount);
    return acc;
  }, {});

  const topCategories = Object.entries(categoryTotals)
    .map(([name, amount]) => ({
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

  const smartPrompts = [
    {
      label: 'Spending lens',
      title: 'Find my biggest spending lever',
      prompt: 'Where am I spending the most, and what is one realistic change I can make this week?',
      insight: `DhanSetu will compare your ${spendingCategoryTranslated.toLowerCase()} activity with your overall spend and suggest a low-friction next step.`,
    },
    {
      label: 'Savings move',
      title: 'Build a realistic savings target',
      prompt: 'How much can I realistically save next month without feeling restricted?',
      insight: `Your current savings rate is ${Math.max(0, savingsRate).toFixed(1)}%. The coach can turn that into a clear rupee target and weekly checkpoints.`,
    },
    {
      label: 'Budget check',
      title: 'Give me a 7-day budget reset',
      prompt: 'Create a simple seven-day spending reset based on my recent transactions.',
      insight: 'The coach will focus on one category, one guardrail, and one small habit instead of overwhelming you with rules.',
    },
    {
      label: 'Future view',
      title: 'Plan for my next big expense',
      prompt: 'Help me prepare for my next large expense without breaking my monthly plan.',
      insight: 'DhanSetu can map the expense against your current cash flow and suggest a calmer timeline.',
    },
  ];

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
    <div className="min-h-screen bg-[#f8f7f4] p-4">
      <div className="mx-auto max-w-7xl space-y-6 px-0 sm:px-2 lg:px-4">
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

        {/* Interactive Smart Prompts */}
        <section className="premium-card border-0 p-0 shadow-none">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Ask smarter</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Turn an insight into a next move.</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Choose a prompt to unpack your money pattern, then send it straight to the transaction-aware coach.</p>
            </div>
            {onOpenCoach && <Button type="button" onClick={() => onOpenCoach('Give me a calm, actionable summary of my current spending.')} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#222d4b] font-bold text-white hover:bg-[#3e4c91]"><MessageCircle className="h-4 w-4" /> Open coach</Button>}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {smartPrompts.map((item, index) => {
              const isActive = activePrompt === index;
              return (
                <div key={item.label} className={`rounded-2xl border bg-white p-4 text-left transition duration-200 ${isActive ? 'border-[#aeb8ed] shadow-[0_14px_30px_rgba(34,45,75,0.1)]' : 'border-[#e7e8ee] hover:-translate-y-0.5 hover:border-[#cbd2f0] hover:shadow-[0_10px_24px_rgba(34,45,75,0.06)]'}`}>
                  <button type="button" onClick={() => setActivePrompt(isActive ? null : index)} className="w-full text-left">
                    <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#5867bb]">{item.label}</p><h3 className="mt-2 text-sm font-bold text-slate-800">{item.title}</h3></div><ChevronRight className={`mt-1 h-4 w-4 shrink-0 text-slate-300 transition-transform ${isActive ? 'rotate-90 text-[#5867bb]' : ''}`} /></div>
                    <p className="mt-2 text-xs leading-5 text-slate-500">{item.prompt}</p>
                  </button>
                  {isActive && <div className="mt-4 border-t border-slate-100 pt-3"><p className="text-xs leading-5 text-slate-500">{item.insight}</p>{onOpenCoach && <Button type="button" variant="outline" onClick={() => onOpenCoach(item.prompt)} className="mt-3 h-9 rounded-lg border-[#dfe4ff] px-3 text-xs font-bold text-[#5867bb] hover:bg-[#eef0fb]">Ask DhanSetu <ArrowLeft className="ml-1 h-3.5 w-3.5 rotate-180" /></Button>}</div>}
                </div>
              );
            })}
          </div>
        </section>

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

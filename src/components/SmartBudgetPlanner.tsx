
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Target, AlertTriangle, CheckCircle, TrendingUp, PieChart, Brain } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/contexts/LanguageContext';

interface SmartBudgetPlannerProps {
  onBack: () => void;
  transactions: any[];
}

interface BudgetCategory {
  name: string;
  allocated: number;
  spent: number;
  percentage: number;
  color: string;
  icon: string;
}

const SmartBudgetPlanner: React.FC<SmartBudgetPlannerProps> = ({ onBack, transactions = [] }) => {
  const { t } = useLanguage();
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // We define labels here but use keys for dynamic mapping if needed, 
  // but for simplicity we rely on the logic that category names might match translation keys or just be English defaults.
  // The 'name' here is used for logic. Display name should be translated.
  const defaultBudgetRules = [
    { name: 'Rent', percentage: 30, color: 'bg-blue-500', icon: '🏠' },
    { name: 'Food', percentage: 20, color: 'bg-green-500', icon: '🍽️' },
    { name: 'Travel', percentage: 10, color: 'bg-yellow-500', icon: '🚗' },
    { name: 'Entertainment', percentage: 10, color: 'bg-purple-500', icon: '🎬' },
    { name: 'Shopping', percentage: 10, color: 'bg-pink-500', icon: '🛍️' },
    { name: 'Savings', percentage: 20, color: 'bg-emerald-500', icon: '💰' }
  ];

  useEffect(() => {
    const totalIncome = (transactions || [])
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const initialIncome = totalIncome > 0 ? totalIncome : 50000;
    setMonthlyIncome(initialIncome.toString());
    generateBudgetPlan(initialIncome);
  }, [transactions]);

  const generateBudgetPlan = (income: number) => {
    // Calculate current spending by category
    const currentSpending = (transactions || [])
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
        return acc;
      }, {} as Record<string, number>);

    const budget = defaultBudgetRules.map(rule => {
      const allocated = Math.round(income * (rule.percentage / 100));
      const spent = currentSpending[rule.name] || 0;

      return {
        name: rule.name,
        allocated,
        spent,
        percentage: rule.percentage,
        color: rule.color,
        icon: rule.icon
      };
    });

    setBudgetCategories(budget);
    setShowRecommendations(true);
  };

  const getBudgetStatus = (category: BudgetCategory) => {
    const usagePercentage = category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0;

    if (usagePercentage <= 70) return { status: 'good', color: 'text-green-600', icon: CheckCircle };
    if (usagePercentage <= 90) return { status: 'warning', color: 'text-yellow-600', icon: AlertTriangle };
    return { status: 'over', color: 'text-red-600', icon: AlertTriangle };
  };

  const totalAllocated = budgetCategories.reduce((sum, cat) => sum + cat.allocated, 0);
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
  const remainingBudget = totalAllocated - totalSpent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 p-4">
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
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              {t('smartBudgetPlanner')} 🎯
            </h1>
            <p className="text-gray-600 flex items-center gap-2 font-medium">
              <Brain className="h-4 w-4 text-blue-500" />
              {t('budgetSubtitle')}
            </p>
          </div>
        </div>

        {/* Income Input */}
        <Card className="border-0 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              {t('monthlyIncomeLabel')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="income">{t('monthlyIncomeLabel')}</Label>
                <div className="flex gap-4 mt-2">
                  <Input
                    id="income"
                    type="number"
                    placeholder={t('enterIncomePlaceholder')}
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    className="text-lg"
                  />
                  <Button
                    onClick={() => {
                      const income = parseFloat(monthlyIncome);
                      if (!isNaN(income) && income > 0) {
                        generateBudgetPlan(income);
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]"
                  >
                    {t('calculate')}
                  </Button>
                </div>
              </div>

              {showRecommendations && (
                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg animate-fadeIn">
                  <p className="text-sm text-blue-700 whitespace-pre-line">
                    {t('budgetCoachTip')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Budget Overview */}
        {showRecommendations && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-0 card-shadow bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm opacity-80">{t('totalBudget')}</p>
                    <p className="text-2xl font-bold">₹{totalAllocated.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 card-shadow bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm opacity-80">{t('totalSpent')}</p>
                    <p className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className={cn(
                "border-0 card-shadow text-white",
                remainingBudget >= 0
                  ? "bg-gradient-to-r from-emerald-500 to-green-500"
                  : "bg-gradient-to-r from-red-500 to-pink-500"
              )}>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm opacity-80">{t('remaining')}</p>
                    <p className="text-2xl font-bold">₹{Math.abs(remainingBudget).toLocaleString()}</p>
                    {remainingBudget < 0 && <p className="text-xs">{t('overBudget')}</p>}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Budget Categories */}
            <Card className="border-0 card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  {t('budgetBreakdown')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgetCategories.map((category, index) => {
                    const status = getBudgetStatus(category);
                    const usagePercentage = Math.min(category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0, 100);
                    const StatusIcon = status.icon;

                    return (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{category.icon}</span>
                            <div>
                              <h4 className="font-semibold">{t(category.name.toLowerCase()) || category.name}</h4>
                              <p className="text-sm text-gray-600">{category.percentage}% of income</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <StatusIcon className={cn("h-4 w-4", status.color)} />
                              <span className="font-semibold">
                                ₹{category.spent.toLocaleString()} / ₹{category.allocated.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {usagePercentage.toFixed(1)}% used
                            </p>
                          </div>
                        </div>

                        <Progress
                          value={usagePercentage}
                          className="h-2"
                        />

                        {category.spent > category.allocated && (
                          <p className="text-xs text-red-600 mt-1">
                            ⚠️ {t('overBudget')} ₹{(category.spent - category.allocated).toLocaleString()}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="border-0 card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {t('smartRecommendations')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgetCategories
                    .filter(cat => cat.allocated > 0 && (cat.spent / cat.allocated) > 0.8)
                    .map((category, index) => (
                      <div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-yellow-800">
                              {t(category.name.toLowerCase()) || category.name} {t('budgetAlert')}
                            </h4>
                            <p className="text-sm text-yellow-700">
                              {t('budgetUsageWarning')
                                .replace('{percentage}', ((category.spent / category.allocated) * 100).toFixed(1))
                                .replace('{category}', t(category.name.toLowerCase()) || category.name)
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-800">{t('budgetTipsTitle')}</h4>
                        <ul className="text-sm text-blue-700 space-y-1 mt-1">
                          <li>{t('budgetTip1')}</li>
                          <li>{t('budgetTip2')}</li>
                          <li>{t('budgetTip3')}</li>
                          <li>{t('budgetTip4')}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default SmartBudgetPlanner;

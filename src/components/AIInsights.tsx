
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain, TrendingUp, TrendingDown, AlertTriangle, Target, Lightbulb } from 'lucide-react';

interface AIInsightsProps {
  onBack: () => void;
}

const AIInsights: React.FC<AIInsightsProps> = ({ onBack }) => {
  // Sample AI insights data - in a real app this would come from your AI API
  const insights = {
    spendingIncrease: {
      category: 'Food',
      percentage: 30,
      amount: 2850,
      previousMonth: 2200
    },
    prediction: {
      nextMonth: 12000,
      confidence: 85
    },
    topCategories: [
      { name: 'Rent', amount: 15000, percentage: 75 },
      { name: 'Food', amount: 3350, percentage: 17 },
      { name: 'Travel', amount: 820, percentage: 4 },
      { name: 'Entertainment', amount: 600, percentage: 3 }
    ],
    suggestions: [
      {
        type: 'warning',
        title: 'High Food Spending',
        description: 'You spent 30% more on food this month. Consider meal planning to reduce costs.',
        potential_savings: 850
      },
      {
        type: 'tip',
        title: 'Travel Optimization',
        description: 'Try using public transport or carpooling to reduce travel expenses.',
        potential_savings: 200
      },
      {
        type: 'goal',
        title: 'Savings Goal',
        description: 'You\'re on track to save ₹40,000 this month. Keep up the good work!',
        potential_savings: 0
      }
    ],
    patterns: [
      'You tend to spend more on weekends',
      'Food expenses peak during the middle of the month',
      'Your entertainment spending is consistent month-to-month'
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
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Insights
            </h1>
            <p className="text-gray-600">Powered by intelligent financial analysis</p>
          </div>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Spending Alert */}
          <Card className="border-0 card-shadow bg-gradient-to-r from-orange-50 to-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <TrendingUp className="h-5 w-5" />
                Spending Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-lg font-semibold">
                  You spent <span className="text-orange-600">30% more</span> on Food this month
                </p>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>This month: ₹{insights.spendingIncrease.amount.toLocaleString()}</span>
                  <span>Last month: ₹{insights.spendingIncrease.previousMonth.toLocaleString()}</span>
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
                Next Month Prediction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-2xl font-bold text-blue-600">
                  ₹{insights.prediction.nextMonth.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Predicted total expenses
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {insights.prediction.confidence}% confidence
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
              Top Spending Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.topCategories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category.name}</span>
                    <span className="font-semibold">₹{category.amount.toLocaleString()}</span>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                  <p className="text-xs text-gray-500">{category.percentage}% of total expenses</p>
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
              Smart Suggestions
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
                          Potential savings: ₹{suggestion.potential_savings}
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
              Spending Patterns
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
        <Card className="border-0 card-shadow bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-6">
            <div className="text-center space-y-3">
              <h3 className="text-xl font-bold text-gray-800">Financial Health Score</h3>
              <div className="text-4xl font-bold text-green-600">82/100</div>
              <p className="text-gray-600">
                You're doing well! Focus on reducing food expenses to improve your score.
              </p>
              <div className="flex justify-center gap-2 mt-4">
                <Badge className="bg-green-100 text-green-800">Good Savings Rate</Badge>
                <Badge className="bg-yellow-100 text-yellow-800">Watch Food Spending</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIInsights;

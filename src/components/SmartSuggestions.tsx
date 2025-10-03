import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

interface Suggestion {
  id: string;
  type: 'warning' | 'tip' | 'achievement';
  title: string;
  description: string;
  action?: string;
  icon: string;
}

interface SmartSuggestionsProps {
  onBack: () => void;
  transactions: Transaction[];
}

const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({ onBack, transactions }) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    generateSmartSuggestions();
  }, [transactions]);

  const generateSmartSuggestions = () => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');
    
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    // Category analysis
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const newSuggestions: Suggestion[] = [];

    // High spending in specific categories
    Object.entries(categoryTotals).forEach(([category, amount]) => {
      if (amount > 2000) {
        newSuggestions.push({
          id: `high-${category}`,
          type: 'warning',
          title: `${category} में ज्यादा खर्च!`,
          description: `आपने ${category} में ₹${amount.toLocaleString()} खर्च किया है। इसे कम करने की कोशिश करें।`,
          icon: '⚠️',
          action: 'Set a limit for this category'
        });
      }
    });

    // Positive savings
    if (totalIncome > totalExpense) {
      newSuggestions.push({
        id: 'good-savings',
        type: 'achievement',
        title: 'बहुत बढ़िया! 🎉',
        description: `आपने ₹${(totalIncome - totalExpense).toLocaleString()} बचाए हैं इस महीने!`,
        icon: '💰',
      });
    }

    // Spending suggestions based on patterns
    const foodExpenses = expenses.filter(t => t.category === 'Food');
    if (foodExpenses.length > 0) {
      const avgFoodExpense = foodExpenses.reduce((sum, t) => sum + t.amount, 0) / foodExpenses.length;
      if (avgFoodExpense > 500) {
        newSuggestions.push({
          id: 'food-suggestion',
          type: 'tip',
          title: 'खाने का खर्च कम करें 🍜',
          description: `आपका average food expense ₹${avgFoodExpense.toFixed(0)} है। Home cooking try करें!`,
          icon: '🍳',
          action: 'Plan weekly meals'
        });
      }
    }

    // Entertainment spending
    const entertainmentTotal = categoryTotals['Entertainment'] || 0;
    if (entertainmentTotal > 1000) {
      newSuggestions.push({
        id: 'entertainment-tip',
        type: 'tip',
        title: 'Entertainment Budget',
        description: `Entertainment में ₹${entertainmentTotal.toLocaleString()} spent। Free activities भी try करें!`,
        icon: '🎬',
        action: 'Find free entertainment options'
      });
    }

    // Travel expenses
    const travelTotal = categoryTotals['Travel'] || 0;
    if (travelTotal > 800) {
      newSuggestions.push({
        id: 'travel-tip',
        type: 'tip',
        title: 'Travel Smart 🚗',
        description: `Travel में ₹${travelTotal.toLocaleString()}। Public transport या carpooling consider करें।`,
        icon: '🚌',
        action: 'Use public transport more'
      });
    }

    // General financial tips
    newSuggestions.push({
      id: 'emergency-fund',
      type: 'tip',
      title: 'Emergency Fund बनाएं',
      description: 'कम से कम 3-6 महीने का खर्च emergency fund में रखें।',
      icon: '🛡️',
      action: 'Start saving for emergencies'
    });

    newSuggestions.push({
      id: 'investment-tip',
      type: 'tip',
      title: 'Investment शुरू करें',
      description: 'SIP के through mutual funds में invest करना शुरू करें।',
      icon: '📈',
      action: 'Learn about SIP investments'
    });

    // Budgeting tips
    if (expenses.length > 5) {
      newSuggestions.push({
        id: 'budget-tip',
        type: 'tip',
        title: '50-30-20 Rule Follow करें',
        description: '50% needs, 30% wants, 20% savings का rule follow करें।',
        icon: '📊',
        action: 'Apply 50-30-20 budgeting'
      });
    }

    setSuggestions(newSuggestions);
  };

  const handleActionClick = (suggestion: Suggestion) => {
    toast({
      title: "Great Choice! 👍",
      description: `"${suggestion.action}" को implement करने के लिए planning करें।`,
    });
  };

  const getSuggestionStyle = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'achievement':
        return 'border-l-4 border-green-500 bg-green-50';
      case 'tip':
        return 'border-l-4 border-blue-500 bg-blue-50';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-50 p-4">
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              🧠 Smart Suggestions
            </h1>
            <p className="text-gray-600">AI-powered financial insights</p>
          </div>
        </div>

        {/* AI Insights Summary */}
        <Card className="border-0 card-shadow bg-gradient-to-r from-indigo-100 to-cyan-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <BarChart className="h-12 w-12 text-indigo-600" />
              <div>
                <h2 className="text-xl font-bold">AI Analysis Complete</h2>
                <p className="text-gray-600">
                  आपके {transactions.length} transactions का analysis करके {suggestions.length} personalized suggestions तैयार किए गए हैं।
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suggestions List */}
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id} className={`border-0 card-shadow ${getSuggestionStyle(suggestion.type)}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{suggestion.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{suggestion.title}</h3>
                    <p className="text-gray-700 mb-4">{suggestion.description}</p>
                    {suggestion.action && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleActionClick(suggestion)}
                        className="text-sm"
                      >
                        {suggestion.action}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Tips */}
        <Card className="border-0 card-shadow">
          <CardHeader>
            <CardTitle>💡 Quick Money Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl">📱</span>
                  <div>
                    <h4 className="font-medium">Digital Payments Track करें</h4>
                    <p className="text-sm text-gray-600">UPI और card payments को भी record करना न भूलें।</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">🎯</span>
                  <div>
                    <h4 className="font-medium">Monthly Goals Set करें</h4>
                    <p className="text-sm text-gray-600">हर महीने savings का target रखें।</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl">📝</span>
                  <div>
                    <h4 className="font-medium">Daily Expense Habit</h4>
                    <p className="text-sm text-gray-600">रोज़ का खर्च same day record करें।</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">💳</span>
                  <div>
                    <h4 className="font-medium">Subscription Review</h4>
                    <p className="text-sm text-gray-600">Monthly subscriptions को regularly check करें।</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SmartSuggestions;

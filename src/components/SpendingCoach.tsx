
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingDown, TrendingUp, AlertTriangle, ThumbsUp, ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

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
  const [insights, setInsights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const generateInsights = () => {
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth - 1;
    
    const currentMonthExpenses = transactions.filter(t => 
      t.type === 'expense' && new Date(t.date).getMonth() === currentMonth
    );
    
    const lastMonthExpenses = transactions.filter(t => 
      t.type === 'expense' && new Date(t.date).getMonth() === lastMonth
    );

    // Category analysis
    const categorySpending = currentMonthExpenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)[0];

    // Generate AI-like insights
    const generatedInsights = [
      {
        type: 'warning',
        title: `Tu ${topCategory?.[0]} pe zyada udane laga hai bhai 😅`,
        description: `₹${topCategory?.[1]?.toLocaleString()} spent this month`,
        icon: AlertTriangle,
        color: 'bg-red-100 text-red-600'
      },
      {
        type: 'trend',
        title: 'Last 3 months spending pattern dekh',
        description: currentMonthExpenses.length > lastMonthExpenses.length ? 
          'Expenses are increasing trend mein hai' : 'Good control maintain kar raha hai',
        icon: currentMonthExpenses.length > lastMonthExpenses.length ? TrendingUp : TrendingDown,
        color: currentMonthExpenses.length > lastMonthExpenses.length ? 
          'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
      },
      {
        type: 'suggestion',
        title: 'Smart suggestion for you',
        description: `Try to limit ${topCategory?.[0]} expenses to ₹${Math.floor((topCategory?.[1] || 0) * 0.8)?.toLocaleString()} next month`,
        icon: ThumbsUp,
        color: 'bg-blue-100 text-blue-600'
      }
    ];

    setInsights(generatedInsights);
    setIsLoading(false);
  };

  useEffect(() => {
    setTimeout(generateInsights, 1500); // Simulate AI processing
  }, [transactions]);

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
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🧠 AI Spending Coach
            </h1>
            <p className="text-gray-600">Your personal financial advisor</p>
          </div>
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
            <h3 className="font-semibold mb-2">💡 Pro Tip</h3>
            <p className="text-sm text-gray-600">
              Keep logging your expenses regularly for better AI insights. The more data, the smarter recommendations!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SpendingCoach;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

interface BudgetProgressProps {
  onBack: () => void;
  transactions: Transaction[];
}

const BudgetProgress: React.FC<BudgetProgressProps> = ({ onBack, transactions }) => {
  const [budgets, setBudgets] = useState<Record<string, number>>({
    Food: 5000,
    Travel: 2000,
    Entertainment: 1500,
    Rent: 15000,
    Shopping: 3000
  });
  
  const [newBudget, setNewBudget] = useState({ category: '', amount: '' });
  const { toast } = useToast();

  const getCategorySpending = () => {
    const spending = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
    
    return Object.entries(budgets).map(([category, budget]) => {
      const spent = spending[category] || 0;
      const percentage = Math.min((spent / budget) * 100, 100);
      const remaining = Math.max(budget - spent, 0);
      
      let status = '🟢';
      let statusText = 'Good';
      let statusColor = 'bg-green-100 text-green-600';
      
      if (percentage > 90) {
        status = '🔴';
        statusText = 'Danger';
        statusColor = 'bg-red-100 text-red-600';
      } else if (percentage > 70) {
        status = '🟠';
        statusText = 'Warning';
        statusColor = 'bg-orange-100 text-orange-600';
      }
      
      return {
        category,
        budget,
        spent,
        remaining,
        percentage,
        status,
        statusText,
        statusColor
      };
    });
  };

  const addBudget = () => {
    if (newBudget.category && newBudget.amount) {
      setBudgets(prev => ({
        ...prev,
        [newBudget.category]: parseInt(newBudget.amount)
      }));
      setNewBudget({ category: '', amount: '' });
      
      toast({
        title: "🎯 Budget Added!",
        description: `₹${newBudget.amount} budget set for ${newBudget.category}`,
      });
    }
  };

  const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, color = '#3b82f6' }: any) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold">{Math.round(percentage)}%</div>
            <div className="text-xs text-gray-500">Used</div>
          </div>
        </div>
      </div>
    );
  };

  const budgetData = getCategorySpending();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              🎯 Budget Progress Tracker
            </h1>
            <p className="text-gray-600">Monitor your spending against set budgets</p>
          </div>
        </div>

        {/* Add New Budget */}
        <Card className="border-0 card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Set New Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Shopping, Bills"
                  value={newBudget.category}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, category: e.target.value }))}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="amount">Budget Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="5000"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addBudget} className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
                  Add Budget
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgetData.map((item, index) => (
            <Card key={index} className="border-0 card-shadow hover:scale-105 transition-transform">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{item.category}</CardTitle>
                  <Badge className={item.statusColor}>
                    {item.status} {item.statusText}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <CircularProgress 
                    percentage={item.percentage}
                    color={item.percentage > 90 ? '#ef4444' : item.percentage > 70 ? '#f59e0b' : '#10b981'}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-medium">₹{item.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Spent:</span>
                    <span className="font-medium text-red-600">₹{item.spent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Remaining:</span>
                    <span className="font-medium text-green-600">₹{item.remaining.toLocaleString()}</span>
                  </div>
                </div>

                {item.percentage > 90 && (
                  <div className="p-3 bg-red-50 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600 font-medium">
                      Budget exceeded! Consider reducing spending.
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Monthly Summary */}
        <Card className="border-0 card-shadow bg-gradient-to-r from-blue-100 to-purple-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Budget Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  ₹{budgetData.reduce((sum, item) => sum + item.budget, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Budget</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  ₹{budgetData.reduce((sum, item) => sum + item.spent, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  ₹{budgetData.reduce((sum, item) => sum + item.remaining, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Remaining</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BudgetProgress;

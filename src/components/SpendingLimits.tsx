
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Bell, Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

interface SpendingLimit {
  id: string;
  category: string;
  limit: number;
  period: 'week' | 'month';
  spent: number;
}

interface SpendingLimitsProps {
  onBack: () => void;
  transactions: Transaction[];
}

const SpendingLimits: React.FC<SpendingLimitsProps> = ({ onBack, transactions }) => {
  const [limits, setLimits] = useState<SpendingLimit[]>([
    { id: '1', category: 'Food', limit: 2000, period: 'month', spent: 0 },
    { id: '2', category: 'Travel', limit: 500, period: 'week', spent: 0 },
    { id: '3', category: 'Entertainment', limit: 1000, period: 'month', spent: 0 },
  ]);
  const [newCategory, setNewCategory] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [newPeriod, setNewPeriod] = useState<'week' | 'month'>('month');
  const { toast } = useToast();

  const categories = ['Food', 'Travel', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Utilities', 'Other'];

  useEffect(() => {
    // Calculate spent amounts based on transactions
    const updatedLimits = limits.map(limit => {
      const categoryExpenses = transactions.filter(t => 
        t.type === 'expense' && t.category === limit.category
      );
      
      const spent = categoryExpenses.reduce((sum, t) => sum + t.amount, 0);
      return { ...limit, spent };
    });
    
    setLimits(updatedLimits);
    
    // Check for limit breaches and show alerts
    updatedLimits.forEach(limit => {
      const percentage = (limit.spent / limit.limit) * 100;
      if (percentage >= 90) {
        toast({
          title: "🚨 Spending Alert!",
          description: `आपका ${limit.category} limit ${percentage.toFixed(0)}% हो गया है! (₹${limit.spent.toLocaleString()}/₹${limit.limit.toLocaleString()})`,
          variant: "destructive",
        });
      }
    });
  }, [transactions]);

  const addNewLimit = () => {
    if (!newCategory || !newLimit) {
      toast({
        title: "गलत जानकारी",
        description: "कृपया category और limit दोनों भरें।",
        variant: "destructive",
      });
      return;
    }

    const existingLimit = limits.find(l => l.category === newCategory);
    if (existingLimit) {
      toast({
        title: "Already Exists",
        description: "इस category का limit पहले से मौजूद है।",
        variant: "destructive",
      });
      return;
    }

    const newLimitObj: SpendingLimit = {
      id: Date.now().toString(),
      category: newCategory,
      limit: Number(newLimit),
      period: newPeriod,
      spent: 0,
    };

    setLimits(prev => [...prev, newLimitObj]);
    setNewCategory('');
    setNewLimit('');
    
    toast({
      title: "Limit Added! 💎",
      description: `${newCategory} के लिए ₹${Number(newLimit).toLocaleString()}/${newPeriod} limit set किया गया।`,
    });
  };

  const deleteLimit = (id: string) => {
    setLimits(prev => prev.filter(l => l.id !== id));
    toast({
      title: "Limit Removed",
      description: "Spending limit हटा दिया गया।",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4">
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              💎 Spending Limits
            </h1>
            <p className="text-gray-600">अपने खर्च को control में रखें</p>
          </div>
        </div>

        {/* Add New Limit */}
        <Card className="border-0 card-shadow">
          <CardHeader>
            <CardTitle>नया Limit Add करें</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="limit">Limit Amount (₹)</Label>
                <Input
                  type="number"
                  placeholder="2000"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="period">Period</Label>
                <select
                  value={newPeriod}
                  onChange={(e) => setNewPeriod(e.target.value as 'week' | 'month')}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="week">Per Week</option>
                  <option value="month">Per Month</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={addNewLimit} className="w-full financial-gradient">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Limit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Limits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {limits.map(limit => {
            const percentage = Math.min((limit.spent / limit.limit) * 100, 100);
            const isOverLimit = limit.spent > limit.limit;
            const isNearLimit = percentage >= 80;
            
            return (
              <Card key={limit.id} className={`border-0 card-shadow ${isOverLimit ? 'border-l-4 border-red-500' : isNearLimit ? 'border-l-4 border-yellow-500' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{limit.category}</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteLimit(limit.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Spent: ₹{limit.spent.toLocaleString()}</span>
                      <span>Limit: ₹{limit.limit.toLocaleString()}/{limit.period}</span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className={`h-3 ${isOverLimit ? 'bg-red-100' : isNearLimit ? 'bg-yellow-100' : 'bg-green-100'}`}
                    />
                    <div className="flex justify-between items-center text-sm">
                      <span className={`font-medium ${isOverLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-green-600'}`}>
                        {percentage.toFixed(1)}% used
                      </span>
                      {isOverLimit && (
                        <span className="text-red-600 flex items-center gap-1">
                          <Bell className="h-4 w-4" />
                          Over Limit!
                        </span>
                      )}
                      {isNearLimit && !isOverLimit && (
                        <span className="text-yellow-600 flex items-center gap-1">
                          <Bell className="h-4 w-4" />
                          Near Limit
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SpendingLimits;

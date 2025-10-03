
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, Activity, Target, Zap } from 'lucide-react';

interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

interface FinancialVisualizerProps {
  transactions: Transaction[];
}

const FinancialVisualizer: React.FC<FinancialVisualizerProps> = ({ transactions }) => {
  const [activeView, setActiveView] = useState<'trend' | 'comparison' | 'radar'>('trend');

  const generateTrendData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayTransactions = transactions.filter(t => t.date === date);
      const income = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expenses = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        income,
        expenses,
        net: income - expenses
      };
    });
  };

  const generateRadarData = () => {
    const categories = ['Food', 'Travel', 'Rent', 'Entertainment', 'Shopping', 'Healthcare'];
    const categoryTotals = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const maxAmount = Math.max(...Object.values(categoryTotals));
    
    return categories.map(category => ({
      category,
      amount: categoryTotals[category] || 0,
      fullMark: maxAmount
    }));
  };

  const trendData = generateTrendData();
  const radarData = generateRadarData();

  const chartConfig = {
    income: {
      label: "Income",
      color: "hsl(var(--primary))",
    },
    expenses: {
      label: "Expenses",
      color: "hsl(var(--destructive))",
    },
    net: {
      label: "Net",
      color: "#8b5cf6",
    },
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card className="border-0 card-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Advanced Analytics</span>
            </div>
            <div className="flex gap-2 ml-auto">
              <Button
                variant={activeView === 'trend' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('trend')}
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Trend
              </Button>
              <Button
                variant={activeView === 'comparison' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('comparison')}
              >
                <Target className="h-4 w-4 mr-1" />
                Compare
              </Button>
              <Button
                variant={activeView === 'radar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('radar')}
              >
                <Zap className="h-4 w-4 mr-1" />
                Radar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visualization Area */}
      <Card className="border-0 card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {activeView === 'trend' && 'Weekly Trend Analysis'}
            {activeView === 'comparison' && 'Income vs Expenses Comparison'}
            {activeView === 'radar' && 'Category Spending Radar'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeView === 'trend' && (
            <ChartContainer config={chartConfig} className="h-[400px]">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']}
                />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="var(--color-income)"
                  strokeWidth={3}
                  dot={{ fill: "var(--color-income)", strokeWidth: 2, r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="var(--color-expenses)"
                  strokeWidth={3}
                  dot={{ fill: "var(--color-expenses)", strokeWidth: 2, r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="net" 
                  stroke="var(--color-net)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "var(--color-net)", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          )}

          {activeView === 'comparison' && (
            <ChartContainer config={chartConfig} className="h-[400px]">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stackId="1"
                  stroke="var(--color-income)"
                  fill="var(--color-income)"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stackId="2"
                  stroke="var(--color-expenses)"
                  fill="var(--color-expenses)"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ChartContainer>
          )}

          {activeView === 'radar' && (
            <ChartContainer config={chartConfig} className="h-[400px]">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis />
                <Radar
                  name="Spending"
                  dataKey="amount"
                  stroke="var(--color-primary)"
                  fill="var(--color-primary)"
                  fillOpacity={0.3}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
                />
              </RadarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Weekly Growth</p>
                <p className="text-2xl font-bold text-blue-600">+12%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Savings Rate</p>
                <p className="text-2xl font-bold text-green-600">65%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Efficiency Score</p>
                <p className="text-2xl font-bold text-purple-600">8.5/10</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialVisualizer;

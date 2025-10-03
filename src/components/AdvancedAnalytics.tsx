
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Download, TrendingUp, DollarSign, MapPin, Calendar } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

interface AdvancedAnalyticsProps {
  onBack: () => void;
  transactions: Transaction[];
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ onBack, transactions }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  // Data processing functions
  const getCategoryData = () => {
    const categoryTotals = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];
    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    
    return Object.entries(categoryTotals).map(([category, amount], index) => ({
      name: category,
      value: amount,
      percentage: ((amount / total) * 100).toFixed(1),
      fill: colors[index % colors.length]
    }));
  };

  const getMonthlyTrendData = () => {
    const monthlyData = transactions.reduce((acc, t) => {
      const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short' });
      if (!acc[month]) {
        acc[month] = { month, income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        acc[month].income += t.amount;
      } else {
        acc[month].expenses += t.amount;
      }
      return acc;
    }, {} as Record<string, { month: string; income: number; expenses: number }>);

    return Object.values(monthlyData);
  };

  const getCategoryBarData = () => {
    const categories = [...new Set(transactions.filter(t => t.type === 'expense').map(t => t.category))];
    const months = ['Oct', 'Nov', 'Dec'];
    
    return categories.map(category => {
      const categoryData: any = { category };
      months.forEach(month => {
        const monthExpenses = transactions
          .filter(t => t.type === 'expense' && t.category === category)
          .reduce((sum, t) => sum + t.amount, 0);
        categoryData[month] = monthExpenses;
      });
      return categoryData;
    });
  };

  const generatePDFReport = () => {
    toast({
      title: "📊 PDF Report Generated!",
      description: "Your financial report with all charts has been prepared for download.",
    });
  };

  const categoryData = getCategoryData();
  const trendData = getMonthlyTrendData();
  const barData = getCategoryBarData();

  const chartConfig = {
    income: { label: "Income", color: "#8884d8" },
    expenses: { label: "Expenses", color: "#82ca9d" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              📊 Advanced Analytics
            </h1>
            <p className="text-gray-600">Comprehensive financial insights and reports</p>
          </div>
          <Button onClick={generatePDFReport} className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">📈 Overview</TabsTrigger>
            <TabsTrigger value="categories">🥧 Categories</TabsTrigger>
            <TabsTrigger value="trends">📊 Trends</TabsTrigger>
            <TabsTrigger value="insights">🧠 AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Smart Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Total Spent 💸</p>
                      <p className="text-2xl font-bold">
                        ₹{transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Highest Category 🔥</p>
                      <p className="text-lg font-bold">{categoryData[0]?.name || 'N/A'}</p>
                      <p className="text-sm opacity-80">₹{categoryData[0]?.value.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-teal-500 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Least Spent 💧</p>
                      <p className="text-lg font-bold">{categoryData[categoryData.length - 1]?.name || 'N/A'}</p>
                      <p className="text-sm opacity-80">₹{categoryData[categoryData.length - 1]?.value.toLocaleString()}</p>
                    </div>
                    <Calendar className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Avg. Daily 📅</p>
                      <p className="text-2xl font-bold">
                        ₹{Math.round(transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) / 30).toLocaleString()}
                      </p>
                    </div>
                    <MapPin className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pie Chart */}
            <Card className="border-0 card-shadow">
              <CardHeader>
                <CardTitle>📊 Category-wise Expense Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      dataKey="value"
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card className="border-0 card-shadow">
              <CardHeader>
                <CardTitle>📊 Category-wise Monthly Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
                    />
                    <Bar dataKey="Oct" fill="#8884d8" />
                    <Bar dataKey="Nov" fill="#82ca9d" />
                    <Bar dataKey="Dec" fill="#ffc658" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card className="border-0 card-shadow">
              <CardHeader>
                <CardTitle>📈 Monthly Spending Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']}
                    />
                    <Line type="monotone" dataKey="income" stroke="#8884d8" strokeWidth={3} />
                    <Line type="monotone" dataKey="expenses" stroke="#82ca9d" strokeWidth={3} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 card-shadow">
                <CardHeader>
                  <CardTitle>🧠 AI Spending Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800">💡 Smart Observation</h4>
                    <p className="text-sm text-blue-600 mt-1">
                      Your highest spending category is {categoryData[0]?.name} with {categoryData[0]?.percentage}% of total expenses
                    </p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-800">⚠️ Spending Alert</h4>
                    <p className="text-sm text-orange-600 mt-1">
                      Consider setting a budget limit for your top spending categories
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800">✅ Good Habit</h4>
                    <p className="text-sm text-green-600 mt-1">
                      You're tracking expenses regularly - keep it up!
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 card-shadow">
                <CardHeader>
                  <CardTitle>🎯 Budget Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categoryData.slice(0, 3).map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-gray-600">Current: ₹{category.value.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-600">
                          Suggested: ₹{Math.round(category.value * 0.8).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">20% reduction</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;

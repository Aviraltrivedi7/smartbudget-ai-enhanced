import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Area, AreaChart } from 'recharts';
import { Plus, TrendingUp, DollarSign, PieChart as PieChartIcon, Calendar, Brain, BarChart3, LineChart as LineChartIcon, MessageCircle, Target, Trophy, Bell, MapPin, Camera, Mic, HelpCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/contexts/LanguageContext';
import { getCategoryTranslation } from '@/utils/languages';

interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

interface DashboardProps {
  transactions?: Transaction[];
  onNavigate?: (view: 'dashboard' | 'add-expense' | 'insights' | 'coach' | 'budget-planner' | 'savings-goals' | 'visualizer' | 'bill-reminder' | 'spending-coach' | 'geo-map' | 'bill-scanner' | 'voice-entry' | 'advanced-analytics' | 'budget-progress' | 'money-monster' | 'calendar-tracker') => void;
  onShowWelcomeGuide?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  transactions: propTransactions, 
  onNavigate,
  onShowWelcomeGuide
}) => {
  const { t, currentLanguage } = useLanguage();
  const [selectedMonth, setSelectedMonth] = useState('january-2025');
  const [chartView, setChartView] = useState<'pie' | 'bar' | 'trend'>('pie');

  // Use prop transactions or fallback to default data
  const transactions: Transaction[] = propTransactions || [
    { id: '1', title: 'Salary', amount: 0, category: 'Income', date: '2024-11-01', type: 'income' },
    { id: '2', title: 'McDonald\'s', amount: 0, category: 'Food', date: '2024-11-02', type: 'expense' },
    { id: '3', title: 'Uber', amount: 0, category: 'Travel', date: '2024-11-03', type: 'expense' },
    { id: '4', title: 'Rent', amount: 0, category: 'Rent', date: '2024-11-04', type: 'expense' },
    { id: '5', title: 'Grocery', amount: 0, category: 'Food', date: '2024-11-05', type: 'expense' },
    { id: '6', title: 'Movie Tickets', amount: 0, category: 'Entertainment', date: '2024-11-06', type: 'expense' },
    { id: '7', title: 'Freelance', amount: 0, category: 'Income', date: '2024-11-07', type: 'income' },
  ];

  const calculateTotals = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expenses, balance: income - expenses };
  };

  const getCategoryData = () => {
    const categoryTotals = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const colors = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    
    return Object.entries(categoryTotals).map(([category, amount], index) => ({
      name: getCategoryTranslation(category, currentLanguage),
      value: amount,
      fill: colors[index % colors.length]
    }));
  };

  const getTrendData = () => {
    const dailyData = transactions.reduce((acc, t) => {
      const date = new Date(t.date).getDate();
      if (!acc[date]) {
        acc[date] = { day: date, income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        acc[date].income += t.amount;
      } else {
        acc[date].expenses += t.amount;
      }
      return acc;
    }, {} as Record<number, { day: number; income: number; expenses: number }>);

    return Object.values(dailyData).sort((a, b) => a.day - b.day);
  };

  const { income, expenses, balance } = calculateTotals();
  const categoryData = getCategoryData();
  const trendData = getTrendData();

  const chartConfig = {
    income: {
      label: "Income",
      color: "hsl(var(--primary))",
    },
    expenses: {
      label: "Expenses", 
      color: "hsl(var(--destructive))",
    },
  };

  const renderChart = () => {
    switch (chartView) {
      case 'bar':
        return (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
              />
              <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        );
      case 'trend':
        return (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
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
        );
      default:
        return (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4 animated-bg">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 animate-slideInTop">
            <div className="flex items-center justify-center gap-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-glow float-animation">
                SmartBudget AI
              </h1>
              {onShowWelcomeGuide && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShowWelcomeGuide}
                  className="ml-2 p-2 h-8 w-8 rounded-full"
                  title={currentLanguage === 'hi' ? 'मदद गाइड देखें' : 'View Help Guide'}
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-gray-600">{t('yourFinancialCompanion')}</p>
        </div>

        {/* Month Selector */}
        <Card className="glass-effect border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                <span className="font-medium">{t('selectMonth')}</span>
              </div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('selectMonth')} />
                </SelectTrigger>
                <SelectContent className="max-h-64 overflow-y-auto">
                  {/* 2025 */}
                  <SelectItem value="january-2025">{t('january')} 2025</SelectItem>
                  <SelectItem value="february-2025">{t('february')} 2025</SelectItem>
                  <SelectItem value="march-2025">{t('march')} 2025</SelectItem>
                  <SelectItem value="april-2025">{t('april')} 2025</SelectItem>
                  <SelectItem value="may-2025">{t('may')} 2025</SelectItem>
                  <SelectItem value="june-2025">{t('june')} 2025</SelectItem>
                  <SelectItem value="july-2025">{t('july')} 2025</SelectItem>
                  <SelectItem value="august-2025">{t('august')} 2025</SelectItem>
                  <SelectItem value="september-2025">{t('september')} 2025</SelectItem>
                  <SelectItem value="october-2025">{t('october')} 2025</SelectItem>
                  <SelectItem value="november-2025">{t('november')} 2025</SelectItem>
                  <SelectItem value="december-2025">{t('december')} 2025</SelectItem>
                  
                  {/* 2026 */}
                  <SelectItem value="january-2026">{t('january')} 2026</SelectItem>
                  <SelectItem value="february-2026">{t('february')} 2026</SelectItem>
                  <SelectItem value="march-2026">{t('march')} 2026</SelectItem>
                  <SelectItem value="april-2026">{t('april')} 2026</SelectItem>
                  <SelectItem value="may-2026">{t('may')} 2026</SelectItem>
                  <SelectItem value="june-2026">{t('june')} 2026</SelectItem>
                  <SelectItem value="july-2026">{t('july')} 2026</SelectItem>
                  <SelectItem value="august-2026">{t('august')} 2026</SelectItem>
                  <SelectItem value="september-2026">{t('september')} 2026</SelectItem>
                  <SelectItem value="october-2026">{t('october')} 2026</SelectItem>
                  <SelectItem value="november-2026">{t('november')} 2026</SelectItem>
                  <SelectItem value="december-2026">{t('december')} 2026</SelectItem>
                  
                  {/* 2027 */}
                  <SelectItem value="january-2027">{t('january')} 2027</SelectItem>
                  <SelectItem value="february-2027">{t('february')} 2027</SelectItem>
                  <SelectItem value="march-2027">{t('march')} 2027</SelectItem>
                  <SelectItem value="april-2027">{t('april')} 2027</SelectItem>
                  <SelectItem value="may-2027">{t('may')} 2027</SelectItem>
                  <SelectItem value="june-2027">{t('june')} 2027</SelectItem>
                  <SelectItem value="july-2027">{t('july')} 2027</SelectItem>
                  <SelectItem value="august-2027">{t('august')} 2027</SelectItem>
                  <SelectItem value="september-2027">{t('september')} 2027</SelectItem>
                  <SelectItem value="october-2027">{t('october')} 2027</SelectItem>
                  <SelectItem value="november-2027">{t('november')} 2027</SelectItem>
                  <SelectItem value="december-2027">{t('december')} 2027</SelectItem>
                  
                  {/* 2028 */}
                  <SelectItem value="january-2028">{t('january')} 2028</SelectItem>
                  <SelectItem value="february-2028">{t('february')} 2028</SelectItem>
                  <SelectItem value="march-2028">{t('march')} 2028</SelectItem>
                  <SelectItem value="april-2028">{t('april')} 2028</SelectItem>
                  <SelectItem value="may-2028">{t('may')} 2028</SelectItem>
                  <SelectItem value="june-2028">{t('june')} 2028</SelectItem>
                  <SelectItem value="july-2028">{t('july')} 2028</SelectItem>
                  <SelectItem value="august-2028">{t('august')} 2028</SelectItem>
                  <SelectItem value="september-2028">{t('september')} 2028</SelectItem>
                  <SelectItem value="october-2028">{t('october')} 2028</SelectItem>
                  <SelectItem value="november-2028">{t('november')} 2028</SelectItem>
                  <SelectItem value="december-2028">{t('december')} 2028</SelectItem>
                  
                  {/* 2029 */}
                  <SelectItem value="january-2029">{t('january')} 2029</SelectItem>
                  <SelectItem value="february-2029">{t('february')} 2029</SelectItem>
                  <SelectItem value="march-2029">{t('march')} 2029</SelectItem>
                  <SelectItem value="april-2029">{t('april')} 2029</SelectItem>
                  <SelectItem value="may-2029">{t('may')} 2029</SelectItem>
                  <SelectItem value="june-2029">{t('june')} 2029</SelectItem>
                  <SelectItem value="july-2029">{t('july')} 2029</SelectItem>
                  <SelectItem value="august-2029">{t('august')} 2029</SelectItem>
                  <SelectItem value="september-2029">{t('september')} 2029</SelectItem>
                  <SelectItem value="october-2029">{t('october')} 2029</SelectItem>
                  <SelectItem value="november-2029">{t('november')} 2029</SelectItem>
                  <SelectItem value="december-2029">{t('december')} 2029</SelectItem>
                  
                  {/* 2030 */}
                  <SelectItem value="january-2030">{t('january')} 2030</SelectItem>
                  <SelectItem value="february-2030">{t('february')} 2030</SelectItem>
                  <SelectItem value="march-2030">{t('march')} 2030</SelectItem>
                  <SelectItem value="april-2030">{t('april')} 2030</SelectItem>
                  <SelectItem value="may-2030">{t('may')} 2030</SelectItem>
                  <SelectItem value="june-2030">{t('june')} 2030</SelectItem>
                  <SelectItem value="july-2030">{t('july')} 2030</SelectItem>
                  <SelectItem value="august-2030">{t('august')} 2030</SelectItem>
                  <SelectItem value="september-2030">{t('september')} 2030</SelectItem>
                  <SelectItem value="october-2030">{t('october')} 2030</SelectItem>
                  <SelectItem value="november-2030">{t('november')} 2030</SelectItem>
                  <SelectItem value="december-2030">{t('december')} 2030</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Balance Cards with Enhanced Visuals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeInUp animate-delay-300">
          <Card className="financial-gradient text-white border-0 card-shadow hover:scale-105 transition-transform duration-300 animate-scaleIn animate-delay-100 animate-wiggle">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {t('totalBalance')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{balance.toLocaleString()}</div>
              <p className="text-sm opacity-80 mt-1">{t('incomeMinusExpenses')}</p>
              <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white/60 rounded-full" style={{ width: '75%' }} />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 card-shadow hover:scale-105 transition-transform duration-300 animate-scaleIn animate-delay-200 animate-wiggle">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {t('totalIncome')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{income.toLocaleString()}</div>
              <p className="text-sm opacity-80 mt-1">{t('thisMonth')}</p>
              <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white/60 rounded-full animate-pulse" style={{ width: '90%' }} />
              </div>
            </CardContent>
          </Card>
          
          <Card className="expense-gradient text-white border-0 card-shadow hover:scale-105 transition-transform duration-300 animate-scaleIn animate-delay-300 animate-wiggle">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {t('totalExpenses')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{expenses.toLocaleString()}</div>
              <p className="text-sm opacity-80 mt-1">{t('thisMonth')}</p>
              <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white/60 rounded-full" style={{ width: '65%' }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slideInLeft animate-delay-500">
          {/* Interactive Chart */}
          <Card className="border-0 card-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  {t('financialVisualization')}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={chartView === 'pie' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartView('pie')}
                  >
                    <PieChartIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={chartView === 'bar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartView('bar')}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={chartView === 'trend' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartView('trend')}
                  >
                    <LineChartIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderChart()}
            </CardContent>
          </Card>

          {/* Recent Transactions with Visual Enhancements */}
          <Card className="border-0 card-shadow">
            <CardHeader>
              <CardTitle>{t('recentTransactions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {transactions.slice(-5).reverse().map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg hover:shadow-md transition-all duration-300 hover:scale-105 glass-card animate-fadeInUp" style={{ animationDelay: `${Math.random() * 0.5}s` }}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        transaction.type === 'income' ? "bg-green-100" : "bg-red-100"
                      )}>
                        {transaction.type === 'income' ? 
                          <TrendingUp className="h-5 w-5 text-green-600" /> : 
                          <DollarSign className="h-5 w-5 text-red-600" />
                        }
                      </div>
                      <div>
                        <p className="font-medium">{transaction.title}</p>
                        <p className="text-sm text-gray-600">{getCategoryTranslation(transaction.category, currentLanguage)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "font-semibold text-lg",
                        transaction.type === 'income' ? "text-green-600" : "text-red-600"
                      )}>
                        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Action Buttons with New Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slideInBottom animate-delay-500">
          <Button 
            onClick={() => onNavigate?.('add-expense')}
            className="financial-gradient text-white border-0 px-6 py-4 text-lg font-medium hover:opacity-90 transition-all duration-300 hover:scale-105 button-hover-effect animate-bounceIn animate-delay-100"
          >
            <Plus className="mr-2 h-5 w-5" />
            {t('addTransaction')}
          </Button>
          
          <Button 
            onClick={() => onNavigate?.('calendar-tracker')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 px-6 py-4 text-lg font-medium hover:opacity-90 transition-all duration-300 hover:scale-105 button-hover-effect animate-bounceIn animate-delay-200"
          >
            <Calendar className="mr-2 h-5 w-5" />
            📅 {t('calendarTracker')}
          </Button>
          
          <Button 
            onClick={() => onNavigate?.('advanced-analytics')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-6 py-4 text-lg font-medium hover:opacity-90 transition-all duration-300 hover:scale-105 button-hover-effect animate-bounceIn animate-delay-300"
          >
            <PieChartIcon className="mr-2 h-5 w-5" />
            📊 {t('advancedAnalytics')}
          </Button>
          
          
          <Button 
            onClick={() => onNavigate?.('budget-progress')}
            className="bg-gradient-to-r from-green-600 to-teal-600 text-white border-0 px-6 py-4 text-lg font-medium hover:opacity-90 transition-all duration-300 hover:scale-105 button-hover-effect animate-bounceIn animate-delay-100"
          >
            <Target className="mr-2 h-5 w-5" />
            🎯 {t('budgetProgress')}
          </Button>
          
          <Button 
            onClick={() => onNavigate?.('money-monster')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-6 py-4 text-lg font-medium hover:opacity-90 transition-all duration-300 hover:scale-105"
          >
            <Trophy className="mr-2 h-5 w-5" />
            👹 {t('moneyMonster')}
          </Button>
          
          <Button 
            onClick={() => onNavigate?.('spending-coach')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-6 py-4 text-lg font-medium hover:opacity-90 transition-all duration-300 hover:scale-105"
          >
            <Brain className="mr-2 h-5 w-5" />
            🧠 {t('aiSpendingCoach')}
          </Button>
          
          <Button 
            onClick={() => onNavigate?.('geo-map')}
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white border-0 px-6 py-4 text-lg font-medium hover:opacity-90 transition-all duration-300 hover:scale-105"
          >
            <MapPin className="mr-2 h-5 w-5" />
            📍 {t('geoHeatmap')}
          </Button>
          
          <Button 
            onClick={() => onNavigate?.('bill-scanner')}
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white border-0 px-6 py-4 text-lg font-medium hover:opacity-90 transition-all duration-300 hover:scale-105"
          >
            <Camera className="mr-2 h-5 w-5" />
            📷 {t('billScanner')}
          </Button>
          
          <Button 
            onClick={() => onNavigate?.('voice-entry')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-6 py-4 text-lg font-medium hover:opacity-90 transition-all duration-300 hover:scale-105"
          >
            <Mic className="mr-2 h-5 w-5" />
            🎤 {t('voiceEntry')}
          </Button>
          
          <Button 
            onClick={() => onNavigate?.('bill-reminder')}
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white border-0 px-6 py-4 text-lg font-medium hover:opacity-90 transition-all duration-300 hover:scale-105"
          >
            <Bell className="mr-2 h-5 w-5" />
            {t('billReminders')}
          </Button>
          
          <Button 
            onClick={() => onNavigate?.('coach')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 px-6 py-4 text-lg font-medium hover:opacity-90 transition-all duration-300 hover:scale-105"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            {t('aiFinanceCoach')}
          </Button>
          
          <Button 
            onClick={() => onNavigate?.('budget-planner')}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 px-6 py-4 text-lg font-medium hover:opacity-90 transition-all duration-300 hover:scale-105"
          >
            <Target className="mr-2 h-5 w-5" />
            {t('smartBudgetPlanner')}
          </Button>
          
          <Button 
            onClick={() => onNavigate?.('savings-goals')}
            className="bg-gradient-to-r from-pink-600 to-purple-600 text-white border-0 px-6 py-4 text-lg font-medium hover:opacity-90 transition-all duration-300 hover:scale-105"
          >
            <Trophy className="mr-2 h-5 w-5" />
            {t('savingsGoals')}
          </Button>
          
          <Button 
            onClick={() => onNavigate?.('insights')}
            variant="outline" 
            className="px-6 py-4 text-lg font-medium border-2 hover:bg-blue-50 transition-all duration-300 hover:scale-105"
          >
            <Brain className="mr-2 h-5 w-5" />
            {t('viewAIInsights')}
          </Button>
          
          <Button 
            onClick={() => onNavigate?.('visualizer')}
            variant="outline" 
            className="px-6 py-4 text-lg font-medium border-2 hover:bg-purple-50 transition-all duration-300 hover:scale-105"
          >
            <BarChart3 className="mr-2 h-5 w-5" />
            {t('advancedVisualizer')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Area, AreaChart } from 'recharts';
import { Plus, TrendingUp, IndianRupee, PieChart as PieChartIcon, Calendar, Brain, BarChart3, LineChart as LineChartIcon, MessageCircle, Target, Trophy, Bell, MapPin, Camera, Mic, HelpCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/contexts/LanguageContext';
import { getCategoryTranslation } from '@/utils/languages';
import { useAuth } from '@/contexts/AuthContext';
import { transactionService, Transaction } from '@/services/transactionService';
import { socketService } from '@/services/socketService';
import { toast } from 'sonner';
import MonthYearPicker from './MonthYearPicker';

interface DashboardProps {
  transactions?: any[];
  onNavigate?: (view: 'dashboard' | 'add-expense' | 'insights' | 'coach' | 'budget-planner' | 'savings-goals' | 'visualizer' | 'bill-reminder' | 'spending-coach' | 'geo-map' | 'bill-scanner' | 'voice-entry' | 'advanced-analytics' | 'budget-progress' | 'money-monster' | 'calendar-tracker') => void;
  onShowWelcomeGuide?: () => void;
}

const Dashboard: React.FC<DashboardProps> = memo(({
  transactions: propTransactions,
  onNavigate,
  onShowWelcomeGuide
}) => {
  const { t, currentLanguage } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('january-2026');
  const [chartView, setChartView] = useState<'pie' | 'bar' | 'trend'>('pie');
  const [isLoaded, setIsLoaded] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  // Load transactions from prop or localStorage
  useEffect(() => {
    if (propTransactions && propTransactions.length >= 0) {
      setTransactions(propTransactions as Transaction[]);
      setIsLoaded(true);
    } else {
      // Load from localStorage if no prop transactions
      const loadFromStorage = () => {
        const stored = localStorage.getItem('pocket_pal_transactions');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setTransactions(parsed);
          } catch (error) {
            console.error('Error loading transactions:', error);
            setTransactions([]);
          }
        }
        setIsLoaded(true);
      };
      loadFromStorage();
    }
  }, [propTransactions]);

  // Setup backend connection and real-time updates
  useEffect(() => {
    const initializeBackend = async () => {
      setConnectionStatus('checking');

      // Check backend connectivity
      const isBackendAvailable = await checkBackendConnection();

      if (isBackendAvailable && isAuthenticated) {
        setConnectionStatus('connected');
        await loadTransactions();
        setupRealTimeUpdates();
      } else if (!isAuthenticated) {
        setConnectionStatus('unauthenticated');
      } else {
        setConnectionStatus('offline');
      }
    };

    initializeBackend();

    // Cleanup
    return () => {
      if (socketService.isConnected()) {
        socketService.off('transaction_added', handleTransactionAdded);
        socketService.off('transaction_updated', handleTransactionUpdated);
        socketService.off('transaction_deleted', handleTransactionDeleted);
      }
    };
  }, [isAuthenticated]);

  // Check backend connection
  const checkBackendConnection = async (): Promise<boolean> => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL?.replace('/api', '/health') || 'http://localhost:5000/health', {
        method: 'GET',
        timeout: 3000,
      } as any);
      return response.ok;
    } catch {
      return false;
    }
  };

  // Load transactions from backend
  const loadTransactions = async () => {
    if (!isAuthenticated) return;

    setIsLoadingData(true);
    try {
      const response = await transactionService.getTransactions({ limit: 100 });
      if (response.success && response.data) {
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Setup real-time updates
  const setupRealTimeUpdates = () => {
    if (socketService.isConnected()) {
      socketService.on('transaction_added', handleTransactionAdded);
      socketService.on('transaction_updated', handleTransactionUpdated);
      socketService.on('transaction_deleted', handleTransactionDeleted);
      socketService.on('stats_updated', handleStatsUpdated);
    }
  };

  // Real-time event handlers
  const handleTransactionAdded = useCallback((newTransaction: Transaction) => {
    setTransactions(prev => [newTransaction, ...prev]);
    toast.success('💰 New transaction added!');
  }, []);

  const handleTransactionUpdated = useCallback((updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t =>
      t.id === updatedTransaction.id ? updatedTransaction : t
    ));
    toast.success('✏️ Transaction updated!');
  }, []);

  const handleTransactionDeleted = useCallback((deletedId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== deletedId));
    toast.success('🗑️ Transaction deleted!');
  }, []);

  const handleStatsUpdated = useCallback((stats: any) => {
    // Could update cached stats here
    console.log('📊 Stats updated:', stats);
  }, []);

  // Demo data for offline/unauthenticated users - Starting with empty transactions
  const getDemoTransactions = (): Transaction[] => [
    // No demo transactions - all amounts start at 0
    // Users can add their own transactions using the "Add Transaction" button
  ];


  // Filter transactions based on selected month
  const filteredTransactions = useMemo(() => {
    const months = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];

    return transactions.filter(t => {
      try {
        const date = new Date(t.date);
        const monthName = months[date.getMonth()];
        const year = date.getFullYear().toString();
        return `${monthName}-${year}` === selectedMonth;
      } catch (e) {
        return false;
      }
    });
  }, [transactions, selectedMonth]);

  // Memoize expensive calculations for better performance
  const { income, expenses, balance } = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Balance can never be negative - minimum 0
    return { income, expenses, balance: Math.max(0, income - expenses) };
  }, [filteredTransactions]);

  const categoryData = useMemo(() => {
    const categoryTotals = filteredTransactions
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
  }, [filteredTransactions, currentLanguage]);

  const trendData = useMemo(() => {
    const dailyData = filteredTransactions.reduce((acc, t) => {
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
  }, [filteredTransactions]);

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

  const renderChart = useCallback(() => {
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
  }, [chartView, categoryData, trendData, chartConfig]);

  // Skeleton loader component
  const SkeletonCard = ({ className = "", height = "h-32" }: { className?: string; height?: string }) => (
    <div className={cn("bg-white/80 backdrop-blur-sm rounded-xl border shadow-sm animate-pulse", className)}>
      <div className={cn("bg-gray-200 rounded-lg", height)} />
    </div>
  );

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4 animated-bg relative">
        <div className="max-w-6xl mx-auto space-y-6 relative z-10">
          {/* Header skeleton */}
          <div className="text-center space-y-4">
            <div className="h-12 w-80 bg-gray-200 rounded-lg mx-auto animate-pulse" />
            <div className="h-6 w-96 bg-gray-200 rounded-lg mx-auto animate-pulse" />
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} height="h-24" />
            ))}
          </div>

          {/* Chart skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonCard height="h-80" />
            <SkeletonCard height="h-80" />
          </div>

          {/* Action buttons skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} height="h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4 animated-bg relative">
      {/* Reduced floating particles for better performance */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`floating-${i}`}
            className="absolute w-1.5 h-1.5 bg-blue-400/10 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 1}s`,
              animationDuration: `${5 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto space-y-6 relative z-10 animate-fadeInUp">
        {/* Enhanced Header */}
        <div className="text-center space-y-4 animate-slideInTop">
          <div className="flex items-center justify-center gap-4">
            <h1 className="text-5xl font-black bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent float-animation drop-shadow-sm whitespace-nowrap flex-shrink-0">
              SmartBudget AI
            </h1>
            {onShowWelcomeGuide && (
              <Button
                variant="outline"
                size="sm"
                onClick={onShowWelcomeGuide}
                className="ml-2 p-2 h-10 w-10 rounded-full button-hover-effect animate-heartbeat hover:animate-none"
                title={currentLanguage === 'hi' ? 'मदद गाइड देखें' : 'View Help Guide'}
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 text-sm">
            <p className="text-gray-600 font-medium">{t('yourAIFinanceCompanion')}</p>
            {/* Connection Status Indicator */}
            <div className="flex items-center gap-1">
              <div className={cn(
                "w-2 h-2 rounded-full",
                connectionStatus === 'connected' ? "bg-green-500 animate-pulse" :
                  connectionStatus === 'offline' ? "bg-red-500" :
                    connectionStatus === 'unauthenticated' ? "bg-yellow-500" :
                      "bg-gray-400 animate-pulse"
              )} />
              <span className={cn(
                "text-xs font-medium",
                connectionStatus === 'connected' ? "text-green-600" :
                  connectionStatus === 'offline' ? "text-red-600" :
                    connectionStatus === 'unauthenticated' ? "text-yellow-600" :
                      "text-gray-500"
              )}>
                {connectionStatus === 'connected' ? '🔗 Live Data' :
                  connectionStatus === 'offline' ? '📱 Demo Mode' :
                    connectionStatus === 'unauthenticated' ? '👤 Demo Mode' :
                      '⏳ Connecting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Month Selector */}
        <Card className="glass-effect border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                <span className="font-medium">{t('selectMonth')}</span>
              </div>
              <MonthYearPicker value={selectedMonth} onChange={setSelectedMonth} />
            </div>
          </CardContent>
        </Card>

        {/* Balance Cards with Enhanced Visuals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeInUp animate-delay-300">
          <Card className="financial-gradient text-white border-0 card-shadow hover:scale-105 transition-all duration-500 animate-scaleIn animate-delay-100 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="pb-2">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold tracking-tight text-white uppercase">
                  {t('netBalance')} ⚖️
                </CardTitle>
                <div className="p-2 bg-white/20 rounded-lg animate-spin-slow">
                  <PieChartIcon className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white animate-fadeInScale">₹{balance.toLocaleString()}</div>
              <p className="text-xs font-bold text-white/90 mt-1">{t('netBalanceSubtitle')}</p>
              <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white/80 rounded-full transition-all duration-1000 ease-out" style={{ width: '75%' }} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0 card-shadow hover:scale-105 transition-all duration-500 animate-scaleIn animate-delay-200 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="pb-2">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold tracking-tight text-white uppercase">
                  {t('totalIncome')} 💰
                </CardTitle>
                <div className="p-2 bg-white/20 rounded-lg animate-bounce">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white animate-fadeInScale">₹{income.toLocaleString()}</div>
              <p className="text-xs font-bold text-white/90 mt-1">{t('totalIncomeSubtitle')}</p>
              <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white/80 rounded-full animate-progress-flow transition-all duration-1000 ease-out" style={{ width: '90%' }} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-500 to-orange-600 text-white border-0 card-shadow hover:scale-105 transition-all duration-500 animate-scaleIn animate-delay-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="pb-2">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold tracking-tight text-white uppercase">
                  {t('totalExpenses')} 💸
                </CardTitle>
                <div className="p-2 bg-white/20 rounded-lg animate-pulse">
                  <IndianRupee className="h-4 w-4 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white animate-fadeInScale">₹{expenses.toLocaleString()}</div>
              <p className="text-xs font-bold text-white/90 mt-1">{t('totalExpensesSubtitle')}</p>
              <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white/80 rounded-full transition-all duration-1000 ease-out" style={{ width: '65%' }} />
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
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg hover:shadow-md transition-all duration-300 hover:scale-105 glass-card animate-fadeInUp" style={{ animationDelay: `${Math.random() * 0.5}s` }}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        transaction.type === 'income' ? "bg-green-100" : "bg-red-100"
                      )}>
                        {transaction.type === 'income' ?
                          <TrendingUp className="h-5 w-5 text-green-600" /> :
                          <IndianRupee className="h-5 w-5 text-red-600" />
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
                      <p className="text-xs text-gray-500">
                        {(() => {
                          try {
                            return new Date(transaction.date).toLocaleDateString();
                          } catch (e) {
                            return transaction.date;
                          }
                        })()}
                      </p>
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
});

export default Dashboard;

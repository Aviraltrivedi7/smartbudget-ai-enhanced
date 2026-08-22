import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  ChevronRight,
  CircleHelp,
  CreditCard,
  IndianRupee,
  Lightbulb,
  Minus,
  Plus,
  ScanLine,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Wallet,
  Waves,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getCategoryTranslation } from '@/utils/languages';
import { transactionService, Transaction } from '@/services/transactionService';
import { socketService } from '@/services/socketService';
import MonthYearPicker from './MonthYearPicker';
import { cn } from '@/lib/utils';

interface DashboardProps {
  transactions?: Transaction[];
  onNavigate?: (view: string) => void;
  onShowWelcomeGuide?: () => void;
}

const chartColors = ['#0d9488', '#f59e0b', '#f97316', '#a78bfa', '#38bdf8', '#fb7185'];

const currency = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;

const Dashboard: React.FC<DashboardProps> = memo(({ transactions: propTransactions, onNavigate, onShowWelcomeGuide }) => {
  const { t, currentLanguage } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const now = new Date();
    return `${months[now.getMonth()]}-${now.getFullYear()}`;
  });
  const [chartView, setChartView] = useState<'trend' | 'categories'>('trend');
  const [isLoaded, setIsLoaded] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  useEffect(() => {
    if (propTransactions) {
      setTransactions(propTransactions);
      setIsLoaded(true);
      return;
    }

    try {
      const stored = localStorage.getItem('pocket_pal_transactions');
      setTransactions(stored ? JSON.parse(stored) : []);
    } catch {
      setTransactions([]);
    }
    setIsLoaded(true);
  }, [propTransactions]);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL?.replace('/api', '/health') || 'http://localhost:5000/health', {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const loadTransactions = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await transactionService.getTransactions({ limit: 100 });
      if (response.success && response.data) setTransactions(response.data.transactions);
    } catch {
      toast.error('Unable to sync transactions right now');
    }
  }, [isAuthenticated]);

  const handleTransactionAdded = useCallback((transaction: Transaction) => {
    setTransactions((previous) => [transaction, ...previous]);
  }, []);
  const handleTransactionUpdated = useCallback((transaction: Transaction) => {
    setTransactions((previous) => previous.map((item) => item.id === transaction.id ? transaction : item));
  }, []);
  const handleTransactionDeleted = useCallback((id: string) => {
    setTransactions((previous) => previous.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    let mounted = true;
    const initialize = async () => {
      const available = await checkBackendConnection();
      if (!mounted) return;
      setConnectionStatus(available && isAuthenticated ? 'connected' : available ? 'ready' : 'offline');
      if (available && isAuthenticated) await loadTransactions();
    };
    initialize();

    if (socketService.isConnected()) {
      socketService.on('transaction_added', handleTransactionAdded);
      socketService.on('transaction_updated', handleTransactionUpdated);
      socketService.on('transaction_deleted', handleTransactionDeleted);
    }
    return () => {
      mounted = false;
      if (socketService.isConnected()) {
        socketService.off('transaction_added', handleTransactionAdded);
        socketService.off('transaction_updated', handleTransactionUpdated);
        socketService.off('transaction_deleted', handleTransactionDeleted);
      }
    };
  }, [handleTransactionAdded, handleTransactionDeleted, handleTransactionUpdated, isAuthenticated, loadTransactions]);

  const filteredTransactions = useMemo(() => {
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const matched = transactions.filter((item) => {
      const date = new Date(item.date);
      return `${months[date.getMonth()]}-${date.getFullYear()}` === selectedMonth;
    });
    return matched.length ? matched : transactions;
  }, [selectedMonth, transactions]);

  const totals = useMemo(() => {
    const income = filteredTransactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const expenses = filteredTransactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return { income, expenses, balance: Math.max(0, income - expenses) };
  }, [filteredTransactions]);

  const categoryData = useMemo(() => {
    const byCategory = filteredTransactions.filter((item) => item.type === 'expense').reduce<Record<string, number>>((result, item) => {
      result[item.category] = (result[item.category] || 0) + Number(item.amount || 0);
      return result;
    }, {});
    return Object.entries(byCategory).filter(([, amount]) => amount > 0).map(([category, amount], index) => ({
      name: getCategoryTranslation(category, currentLanguage),
      value: amount,
      fill: chartColors[index % chartColors.length],
    }));
  }, [currentLanguage, filteredTransactions]);

  const trendData = useMemo(() => {
    const byDay = filteredTransactions.reduce<Record<number, { day: number; income: number; expenses: number }>>((result, item) => {
      const day = new Date(item.date).getDate();
      result[day] ||= { day, income: 0, expenses: 0 };
      result[day][item.type === 'income' ? 'income' : 'expenses'] += Number(item.amount || 0);
      return result;
    }, {});
    return Object.values(byDay).sort((a, b) => a.day - b.day);
  }, [filteredTransactions]);

  const recentTransactions = filteredTransactions.slice(0, 5);
  const expenseRatio = totals.income ? Math.min(100, Math.round((totals.expenses / totals.income) * 100)) : 0;

  if (!isLoaded) {
    return <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-10"><div className="h-48 animate-pulse rounded-[2rem] bg-white/70" /><div className="grid gap-4 md:grid-cols-3"><div className="h-32 animate-pulse rounded-3xl bg-white/70" /><div className="h-32 animate-pulse rounded-3xl bg-white/70" /><div className="h-32 animate-pulse rounded-3xl bg-white/70" /></div></div>;
  }

  const statusLabel = connectionStatus === 'connected' ? 'Live sync' : connectionStatus === 'offline' ? 'Offline mode' : 'Local workspace';

  return (
    <div className="mx-auto max-w-7xl space-y-7 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
      <section className="hero-panel relative overflow-hidden rounded-[2rem] px-6 py-7 text-white shadow-[0_24px_70px_rgba(15,23,42,0.2)] sm:px-9 sm:py-9">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-teal-100/80">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5"><span className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_14px_#5eead4]" />{statusLabel}</span>
              <span className="text-white/40">/</span>
              <span>Personal finance OS</span>
            </div>
            <p className="mb-2 text-sm font-medium text-white/60">{t('yourAIFinanceCompanion') || 'Your intelligent money companion'}</p>
            <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Make every rupee feel intentional.</h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-white/65 sm:text-base">See the signal behind your spending, stay ahead of your goals, and build a calmer relationship with money.</p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <button onClick={onShowWelcomeGuide} className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"><CircleHelp className="h-4 w-4" /> Quick tour</button>
            <button onClick={() => onNavigate?.('add-expense')} className="inline-flex items-center gap-2 rounded-2xl bg-[#b9fbc0] px-5 py-3 text-sm font-bold text-[#102b29] shadow-lg shadow-teal-950/20 transition hover:-translate-y-0.5 hover:bg-white active:scale-[0.98]"><Plus className="h-4 w-4" /> Add transaction</button>
          </div>
        </div>
        <div className="relative z-10 mt-9 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm text-white/70"><CalendarDays className="h-4 w-4 text-teal-200" /><span>Viewing</span><MonthYearPicker value={selectedMonth} onChange={setSelectedMonth} /></div>
          <div className="flex items-center gap-2 text-xs text-white/45"><Waves className="h-4 w-4" /> Updated just now</div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Net balance" value={currency(totals.balance)} note="Available after expenses" icon={Wallet} tone="dark" trend="+12.8%" />
        <MetricCard label="Total income" value={currency(totals.income)} note="This month" icon={ArrowDownRight} tone="mint" trend="+8.4%" />
        <MetricCard label="Total expenses" value={currency(totals.expenses)} note={`${expenseRatio}% of income used`} icon={ArrowUpRight} tone="sand" trend={expenseRatio ? `${expenseRatio}%` : '0%'} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
        <div className="premium-card min-h-[410px] p-5 sm:p-7">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div><p className="eyebrow">Cash flow</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Your money, in motion</h2><p className="mt-1 text-sm text-slate-500">Income versus expenses across the selected month.</p></div>
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1"><ChartToggle active={chartView === 'trend'} onClick={() => setChartView('trend')}>Trend</ChartToggle><ChartToggle active={chartView === 'categories'} onClick={() => setChartView('categories')}>Categories</ChartToggle></div>
          </div>
          <div className="h-[285px] w-full">
            {chartView === 'trend' ? (
              trendData.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData} margin={{ top: 10, right: 6, left: -22, bottom: 0 }}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0d9488" stopOpacity={0.28} /><stop offset="100%" stopColor="#0d9488" stopOpacity={0} /></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fb923c" stopOpacity={0.2} /><stop offset="100%" stopColor="#fb923c" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#e7eceb" strokeDasharray="3 3" /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(value) => `₹${value >= 1000 ? `${value / 1000}k` : value}`} /><Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 12px 30px rgba(15,23,42,.12)' }} formatter={(value: number, name: string) => [currency(value), name === 'income' ? 'Income' : 'Expenses']} /><Area type="monotone" dataKey="income" stroke="#0d9488" strokeWidth={3} fill="url(#incomeFill)" /><Area type="monotone" dataKey="expenses" stroke="#fb923c" strokeWidth={2.5} fill="url(#expenseFill)" /></AreaChart></ResponsiveContainer> : <EmptyChart label="Add a few transactions to see your cash flow." />
            ) : (
              categoryData.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={categoryData} margin={{ top: 10, right: 6, left: -22, bottom: 0 }}><CartesianGrid vertical={false} stroke="#e7eceb" strokeDasharray="3 3" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(value) => `₹${value >= 1000 ? `${value / 1000}k` : value}`} /><Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0' }} formatter={(value: number) => [currency(value), 'Spent']} /><Bar dataKey="value" radius={[8, 8, 3, 3]}>{categoryData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}</Bar></BarChart></ResponsiveContainer> : <EmptyChart label="Categories will appear once you log spending." />
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-slate-500"><span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-teal-600" />Income</span><span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-orange-400" />Expenses</span><span className="ml-auto text-slate-400">Tap chart to explore</span></div>
        </div>

        <div className="premium-card p-5 sm:p-7">
          <div className="flex items-start justify-between"><div><p className="eyebrow">Spending pulse</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Where it goes</h2></div><div className="rounded-xl bg-teal-50 p-2.5 text-teal-700"><BarChart3 className="h-5 w-5" /></div></div>
          <div className="relative mx-auto mt-5 h-52 w-52">{categoryData.length ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} dataKey="value" innerRadius={64} outerRadius={88} paddingAngle={4} stroke="none">{categoryData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}</Pie></PieChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center rounded-full border-[18px] border-slate-100"><div className="text-center"><p className="text-2xl font-semibold text-slate-900">0%</p><p className="text-xs text-slate-400">tracked</p></div></div>}<div className="pointer-events-none absolute inset-0 flex items-center justify-center"><div className="text-center"><p className="text-2xl font-semibold tracking-tight text-slate-950">{currency(totals.expenses)}</p><p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">spent</p></div></div></div>
          <div className="mt-4 space-y-3">{categoryData.length ? categoryData.slice(0, 4).map((category) => <div key={category.name} className="flex items-center justify-between text-sm"><span className="flex min-w-0 items-center gap-2.5 text-slate-600"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: category.fill }} />{category.name}</span><span className="font-semibold text-slate-900">{currency(category.value)}</span></div>) : <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-5 text-slate-500">Your spending breakdown will become more useful as you add transactions.</p>}</div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="premium-card p-5 sm:p-7"><div className="mb-5 flex items-center justify-between"><div><p className="eyebrow">Activity</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Recent transactions</h2></div><button onClick={() => onNavigate?.('calendar-tracker')} className="inline-flex items-center gap-1 text-sm font-bold text-teal-700 transition hover:text-teal-900">View all <ChevronRight className="h-4 w-4" /></button></div>{recentTransactions.length ? <div className="divide-y divide-slate-100">{recentTransactions.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} currentLanguage={currentLanguage} />)}</div> : <EmptyActivity onAdd={() => onNavigate?.('add-expense')} />}</div>
        <div className="relative overflow-hidden rounded-[1.75rem] bg-[#102b29] p-6 text-white shadow-[0_18px_45px_rgba(16,43,41,0.18)] sm:p-7"><div className="absolute -right-14 -top-14 h-40 w-40 rounded-full border-[22px] border-teal-300/10" /><div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full border-[28px] border-orange-200/10" /><div className="relative z-10"><div className="mb-10 flex items-center justify-between"><div className="rounded-xl bg-white/10 p-2.5"><Sparkles className="h-5 w-5 text-teal-200" /></div><span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-100/70">AI insight</span></div><p className="text-sm font-medium text-teal-100/65">One small shift, big impact</p><h3 className="mt-3 text-2xl font-semibold leading-tight tracking-tight">Your next best move is consistency, not restriction.</h3><p className="mt-4 text-sm leading-6 text-white/55">Keep logging for seven days and SmartBudget will surface a clearer pattern in your spending.</p><button onClick={() => onNavigate?.('insights')} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#102b29] transition hover:-translate-y-0.5">Explore insights <ChevronRight className="h-4 w-4" /></button></div></div>
      </section>

      <section><div className="mb-4 flex items-end justify-between"><div><p className="eyebrow">Shortcuts</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Make progress in a tap</h2></div><p className="hidden text-sm text-slate-500 sm:block">Your most useful money tools, curated.</p></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Shortcut icon={Target} title="Budget planner" description="Set a calmer monthly plan" onClick={() => onNavigate?.('budget-planner')} tone="teal" /><Shortcut icon={Trophy} title="Savings goals" description="Turn intent into milestones" onClick={() => onNavigate?.('savings-goals')} tone="violet" /><Shortcut icon={ScanLine} title="Scan a bill" description="Capture the details instantly" onClick={() => onNavigate?.('bill-scanner')} tone="orange" /><Shortcut icon={Lightbulb} title="AI finance coach" description="Get a smarter next step" onClick={() => onNavigate?.('coach')} tone="blue" /></div></section>
    </div>
  );
});

const MetricCard = ({ label, value, note, icon: Icon, tone, trend }: { label: string; value: string; note: string; icon: React.ElementType; tone: 'dark' | 'mint' | 'sand'; trend: string }) => <div className={cn('metric-card group', tone === 'dark' && 'metric-card-dark', tone === 'mint' && 'metric-card-mint', tone === 'sand' && 'metric-card-sand')}><div className="flex items-start justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-60">{label}</p><p className="mt-5 text-3xl font-semibold tracking-[-0.045em]">{value}</p></div><div className="rounded-xl bg-white/15 p-2.5"><Icon className="h-5 w-5" /></div></div><div className="mt-7 flex items-center justify-between text-xs font-semibold"><span className="opacity-60">{note}</span><span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1"><TrendingUp className="h-3 w-3" />{trend}</span></div></div>;

const ChartToggle = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => <button onClick={onClick} className={cn('rounded-lg px-3 py-1.5 text-xs font-bold transition', active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900')}>{children}</button>;

const TransactionRow = ({ transaction, currentLanguage }: { transaction: Transaction; currentLanguage: string }) => <div className="flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"><div className="flex min-w-0 items-center gap-3"><div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', transaction.type === 'income' ? 'bg-teal-50 text-teal-700' : 'bg-orange-50 text-orange-600')}>{transaction.type === 'income' ? <ArrowDownRight className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}</div><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-800">{transaction.title}</p><p className="mt-0.5 truncate text-xs text-slate-400">{getCategoryTranslation(transaction.category, currentLanguage)} · {new Date(transaction.date).toLocaleDateString()}</p></div></div><p className={cn('shrink-0 text-sm font-bold', transaction.type === 'income' ? 'text-teal-700' : 'text-slate-900')}>{transaction.type === 'income' ? '+' : '-'}{currency(transaction.amount)}</p></div>;

const Shortcut = ({ icon: Icon, title, description, onClick, tone }: { icon: React.ElementType; title: string; description: string; onClick: () => void; tone: 'teal' | 'violet' | 'orange' | 'blue' }) => <button onClick={onClick} className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-[0_5px_20px_rgba(15,23,42,0.035)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)]"><div className={cn('rounded-xl p-3', tone === 'teal' && 'bg-teal-50 text-teal-700', tone === 'violet' && 'bg-violet-50 text-violet-700', tone === 'orange' && 'bg-orange-50 text-orange-600', tone === 'blue' && 'bg-sky-50 text-sky-700')}><Icon className="h-5 w-5" /></div><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-slate-800">{title}</span><span className="mt-0.5 block text-xs text-slate-400">{description}</span></span><ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" /></button>;

const EmptyChart = ({ label }: { label: string }) => <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center text-sm text-slate-400"><Minus className="mr-2 h-4 w-4" />{label}</div>;
const EmptyActivity = ({ onAdd }: { onAdd: () => void }) => <div className="flex min-h-[190px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center"><div className="mb-3 rounded-xl bg-white p-3 text-slate-400 shadow-sm"><IndianRupee className="h-5 w-5" /></div><p className="text-sm font-semibold text-slate-700">Your money story starts here.</p><p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">Add your first transaction and we’ll turn it into a useful signal.</p><button onClick={onAdd} className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-teal-700">Add transaction <Plus className="h-3.5 w-3.5" /></button></div>;

export default Dashboard;

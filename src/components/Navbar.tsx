import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  FileDown,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Plus,
  ScanLine,
  Settings,
  Sparkles,
  Sun,
  Target,
  Trophy,
  UserRound,
  Wallet,
  X,
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth?: () => void;
}

const primaryItems = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'insights', label: 'AI insights', icon: Sparkles },
  { id: 'visualizer', label: 'Analytics', icon: BarChart3 },
  { id: 'calendar-tracker', label: 'Transactions', icon: CalendarDays },
];

const toolItems = [
  { id: 'budget-planner', label: 'Budget planner', icon: Target },
  { id: 'savings-goals', label: 'Savings goals', icon: Trophy },
  { id: 'monthly-report', label: 'Reports & exports', icon: FileDown },
  { id: 'bill-scanner', label: 'Scan a bill', icon: ScanLine },
];

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currentLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const isHindi = currentLanguage === 'hi';
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || (isHindi ? 'उपयोगकर्ता' : 'Guest user');
  const initials = displayName.slice(0, 2).toUpperCase();

  const navigate = (view: string) => {
    onNavigate(view);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    toast.success(isHindi ? 'साइन आउट हो गया' : 'Signed out successfully');
  };

  const renderItem = (item: typeof primaryItems[number]) => {
    const Icon = item.icon;
    const active = currentView === item.id;
    return <button key={item.id} onClick={() => navigate(item.id)} className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}><Icon className="h-[18px] w-[18px]" /><span>{isHindi && item.id === 'dashboard' ? 'डैशबोर्ड' : item.label}</span>{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#aeb8ed]" />}</button>;
  };

  return <>
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col bg-[#222d4b] text-white lg:flex">
      <div className="flex h-full flex-col px-5 py-6">
        <button onClick={() => navigate('dashboard')} className="mb-11 flex items-center gap-3 text-left"><span className="brand-mark"><Wallet className="h-5 w-5" /></span><span><span className="block text-[17px] font-semibold tracking-[-0.03em]">SmartBudget<span className="text-[#dfe4ff]">.</span></span><span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.19em] text-white/35">Financial intelligence</span></span></button>
        <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Workspace</div>
        <nav className="space-y-1">{primaryItems.map(renderItem)}</nav>
        <div className="mb-3 mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Tools</div>
        <nav className="space-y-1">{toolItems.map(renderItem)}</nav>
        <div className="mt-auto space-y-1 border-t border-white/10 pt-5"><button onClick={() => toast.info('Notifications are all caught up')} className="sidebar-link"><Bell className="h-[18px] w-[18px]" /><span>Notifications</span><span className="ml-auto h-1.5 w-1.5 rounded-full bg-orange-300" /></button><button onClick={() => toast.info('Settings are coming soon')} className="sidebar-link"><Settings className="h-[18px] w-[18px]" /><span>Settings</span></button><button onClick={toggleTheme} className="sidebar-link"><span className="flex h-[18px] w-[18px] items-center justify-center">{theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</span><span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span></button></div>
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dfe4ff] text-xs font-extrabold text-[#222d4b]">{initials}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-white/90">{displayName}</p><p className="mt-0.5 text-[10px] text-white/40">Personal workspace</p></div><button onClick={handleLogout} className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white" aria-label="Sign out"><LogOut className="h-4 w-4" /></button></div>
      </div>
    </aside>

    <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-[#e7e8ee] bg-[#f8f7f4]/90 px-4 backdrop-blur-xl lg:hidden"><button onClick={() => setIsOpen(true)} className="rounded-xl p-2 text-slate-700 hover:bg-white"><Menu className="h-5 w-5" /></button><button onClick={() => navigate('dashboard')} className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#222d4b] text-[#dfe4ff]"><Wallet className="h-4 w-4" /></span><span className="text-sm font-bold tracking-tight text-slate-900">SmartBudget<span className="text-[#5867bb]">.</span></span></button><button onClick={() => navigate('add-expense')} className="rounded-xl bg-[#222d4b] p-2.5 text-white"><Plus className="h-4 w-4" /></button></header>

    {isOpen && <div className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-sm lg:hidden" onClick={() => setIsOpen(false)}><div className="h-full w-[min(320px,86vw)] bg-[#222d4b] p-5 text-white shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="mb-10 flex items-center justify-between"><span className="text-lg font-semibold">SmartBudget<span className="text-[#dfe4ff]">.</span></span><button onClick={() => setIsOpen(false)} className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button></div><div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Workspace</div><nav className="space-y-1">{primaryItems.map(renderItem)}</nav><div className="mb-3 mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Tools</div><nav className="space-y-1">{toolItems.map(renderItem)}</nav><div className="mt-9 space-y-1 border-t border-white/10 pt-5"><button onClick={() => toast.info('Notifications are all caught up')} className="sidebar-link"><Bell className="h-[18px] w-[18px]" /><span>Notifications</span></button><button onClick={() => toast.info('Settings are coming soon')} className="sidebar-link"><Settings className="h-[18px] w-[18px]" /><span>Settings</span></button><button onClick={toggleTheme} className="sidebar-link">{theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}<span>Appearance</span></button></div><div className="mt-10 flex items-center gap-3 border-t border-white/10 pt-5"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dfe4ff] text-xs font-extrabold text-[#222d4b]">{initials}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{displayName}</p><p className="text-[10px] text-white/40">Personal workspace</p></div><button onClick={handleLogout} className="rounded-lg p-2 text-white/50 hover:text-white"><LogOut className="h-4 w-4" /></button></div></div></div>}

    <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-[0_16px_40px_rgba(31,43,72,0.12)] backdrop-blur-xl lg:hidden">{primaryItems.slice(0, 4).map((item) => { const Icon = item.icon; const active = currentView === item.id; return <button key={item.id} onClick={() => navigate(item.id)} className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-bold ${active ? 'bg-teal-50 text-teal-700' : 'text-slate-400'}`}><Icon className="h-4 w-4" /><span>{item.id === 'dashboard' ? 'Home' : item.id === 'insights' ? 'AI' : item.id === 'visualizer' ? 'Stats' : 'Activity'}</span></button>; })}<button onClick={() => navigate('add-expense')} className="-mt-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#222d4b] text-white shadow-lg shadow-indigo-950/20"><Plus className="h-5 w-5" /></button></nav>
  </>;
};

export default Navbar;

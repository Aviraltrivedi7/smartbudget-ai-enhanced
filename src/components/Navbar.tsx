import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import {
  BarChart3,
  Bell,
  CalendarDays,
  FileDown,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Moon,
  Plus,
  ScanLine,
  Settings,
  Sparkles,
  Sun,
  Target,
  Trophy,
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const renderItem = (item: typeof primaryItems[number]) => {
    const Icon = item.icon;
    const active = currentView === item.id;
    return (
      <button key={item.id} onClick={() => navigate(item.id)} className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}>
        <Icon className="h-[18px] w-[18px]" />
        <span>{isHindi && item.id === 'dashboard' ? 'डैशबोर्ड' : item.label}</span>
        {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#aeb8ed]" />}
      </button>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-[#e7e8ee] bg-[#f8f7f4]/95 px-4 backdrop-blur-xl sm:px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isOpen}
            className="group flex h-10 w-10 items-center justify-center rounded-xl border border-[#e7e8ee] bg-white text-[#5867bb] shadow-[0_4px_16px_rgba(31,43,72,0.05)] transition hover:-translate-y-0.5 hover:border-[#aeb8ed] hover:bg-[#eef0fb]"
          >
            <MoreHorizontal className="h-5 w-5 transition group-hover:scale-110" />
          </button>
          <button onClick={() => navigate('dashboard')} className="flex items-center gap-2.5 text-left">
            <span className="brand-mark"><Wallet className="h-5 w-5" /></span>
            <span>
              <span className="block text-[16px] font-semibold tracking-[-0.03em] text-[#222d4b]">SmartBudget<span className="text-[#5867bb]">.</span></span>
              <span className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:block">Financial intelligence</span>
            </span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full bg-[#eef0eb] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#667080] md:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#5867bb]" />Workspace ready</span>
          <button onClick={() => navigate('add-expense')} className="inline-flex items-center gap-2 rounded-xl bg-[#222d4b] px-3.5 py-2.5 text-xs font-bold text-white shadow-[0_8px_20px_rgba(34,45,75,0.16)] transition hover:-translate-y-0.5 hover:bg-[#3e4c91]"><Plus className="h-4 w-4" /><span className="hidden sm:inline">Add transaction</span></button>
        </div>
      </header>

      <div className={`fixed inset-0 z-[60] transition-opacity duration-200 ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`} aria-hidden={!isOpen}>
        <div className="absolute inset-0 bg-[#18213a]/35 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
        <aside role="dialog" aria-modal="true" aria-label="SmartBudget navigation" className={`absolute inset-y-0 left-0 flex min-h-0 w-[min(320px,88vw)] flex-col bg-[#222d4b] text-white shadow-[18px_0_55px_rgba(24,33,58,0.22)] transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
            <button onClick={() => navigate('dashboard')} className="flex items-center gap-3 text-left">
              <span className="brand-mark"><Wallet className="h-5 w-5" /></span>
              <span><span className="block text-[17px] font-semibold tracking-[-0.03em]">SmartBudget<span className="text-[#dfe4ff]">.</span></span><span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">Financial intelligence</span></span>
            </button>
            <button onClick={() => setIsOpen(false)} aria-label="Close navigation menu" className="rounded-xl p-2 text-white/70 transition hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>
          </div>

          <div className="drawer-scroll min-h-0 flex-1 overflow-y-auto px-5 py-6">
            <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Workspace</div>
            <nav className="space-y-1">{primaryItems.map(renderItem)}</nav>
            <div className="mb-3 mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Tools</div>
            <nav className="space-y-1">{toolItems.map(renderItem)}</nav>
            <div className="mt-9 space-y-1 border-t border-white/10 pt-5">
              <button onClick={() => toast.info('Notifications are all caught up')} className="sidebar-link"><Bell className="h-[18px] w-[18px]" /><span>Notifications</span><span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#bf7864]" /></button>
              <button onClick={() => toast.info('Settings are coming soon')} className="sidebar-link"><Settings className="h-[18px] w-[18px]" /><span>Settings</span></button>
              <button onClick={toggleTheme} className="sidebar-link"><span className="flex h-[18px] w-[18px] items-center justify-center">{theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</span><span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span></button>
            </div>
          </div>

          <div className="shrink-0 border-t border-white/10 px-5 py-5">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dfe4ff] text-xs font-extrabold text-[#222d4b]">{initials}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-white/95">{displayName}</p><p className="mt-0.5 text-[10px] text-white/60">Personal workspace</p></div><button onClick={async () => { await logout(); setIsOpen(false); toast.success(isHindi ? 'साइन आउट हो गया' : 'Signed out successfully'); }} className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white" aria-label="Sign out"><LogOut className="h-4 w-4" /></button></div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Navbar;

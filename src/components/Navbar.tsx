import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { appConfig } from '@/config/appConfig';
import { toast } from 'sonner';
import { markBudgetAlertsRead, readBudgetAlerts, requestBudgetNotificationPermission, unreadBudgetAlertCount } from '@/utils/budgetAlerts.js';
import {
  BarChart3,
  Bell,
  CalendarDays,
  FileDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ArrowUpRight,
  History,
  Trash2,
  Moon,
  Plus,
  ScanLine,
  Settings,
  Sparkles,
  Sun,
  Target,
  Trophy,
  X,
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth?: () => void;
  onOpenTransactionModal?: () => void;
  onOpenCoachOverlay?: () => void;
  onOpenBudgetPlanner?: () => void;
}

const primaryItems = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'insights', label: 'Money notes', icon: Sparkles },
  { id: 'visualizer', label: 'Trends', icon: BarChart3 },
  { id: 'calendar-tracker', label: 'Transactions', icon: CalendarDays },
];

const RECENT_SEARCHES_KEY = 'smartbudget_recent_searches';

const toolItems = [
  { id: 'budget-planner', label: 'Plan my month', icon: Target },
  { id: 'savings-goals', label: 'Goals', icon: Trophy },
  { id: 'monthly-report', label: 'Reports', icon: FileDown },
  { id: 'bill-scanner', label: 'Scan a bill', icon: ScanLine },
];

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenTransactionModal, onOpenCoachOverlay, onOpenBudgetPlanner }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currentLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [unreadAlerts, setUnreadAlerts] = useState(() => unreadBudgetAlertCount());
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = window.localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const isHindi = currentLanguage === 'hi';
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || (isHindi ? 'उपयोगकर्ता' : 'Guest user');
  const initials = displayName.slice(0, 2).toUpperCase();
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredPrimaryItems = useMemo(() => primaryItems.filter((item) => `${item.label} ${item.id}`.toLowerCase().includes(normalizedQuery)), [normalizedQuery]);
  const filteredToolItems = useMemo(() => toolItems.filter((item) => `${item.label} ${item.id}`.toLowerCase().includes(normalizedQuery)), [normalizedQuery]);
  const utilityMatches = {
    notifications: !normalizedQuery || ['notifications', 'notification', 'alerts'].some((alias) => alias.includes(normalizedQuery) || normalizedQuery.includes(alias)),
    settings: !normalizedQuery || ['settings', 'preferences'].some((alias) => alias.includes(normalizedQuery) || normalizedQuery.includes(alias)),
    theme: !normalizedQuery || ['dark mode', 'light mode', 'appearance', 'theme'].some((alias) => alias.includes(normalizedQuery) || normalizedQuery.includes(alias)),
  };
  const hasResults = filteredPrimaryItems.length > 0 || filteredToolItems.length > 0 || Object.values(utilityMatches).some(Boolean);
  const quickActions = [
    { id: 'add-expense', label: 'Add a transaction', description: 'Log income or an expense', icon: Plus },
    { id: 'coach', label: 'Ask DhanSetu', description: 'Talk through a money decision', icon: Sparkles },
  ];

  const recordSearch = (value: string) => {
    const nextValue = value.trim();
    if (!nextValue) return;
    setRecentSearches((current) => {
      const next = [nextValue, ...current.filter((item) => item.toLowerCase() !== nextValue.toLowerCase())].slice(0, 5);
      window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const navigate = (view: string) => {
    onNavigate(view);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || !normalizedQuery) return;
    const firstMatch = [...filteredPrimaryItems, ...filteredToolItems][0];
    if (firstMatch) {
      recordSearch(normalizedQuery);
      navigate(firstMatch.id);
    }
  };

  useEffect(() => {
    const syncBudgetAlerts = () => setUnreadAlerts(unreadBudgetAlertCount());
    window.addEventListener('dhansetu:budget-alerts', syncBudgetAlerts);
    window.addEventListener('storage', syncBudgetAlerts);
    return () => {
      window.removeEventListener('dhansetu:budget-alerts', syncBudgetAlerts);
      window.removeEventListener('storage', syncBudgetAlerts);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen(true);
        window.setTimeout(() => searchInputRef.current?.focus(), 0);
      }
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNotifications = async () => {
    const alerts = readBudgetAlerts().filter((alert) => !alert.read);
    if (!alerts.length) {
      toast.info('Notifications are all caught up');
      return;
    }
    const permission = await requestBudgetNotificationPermission();
    const latest = alerts[0];
    toast.warning(`${alerts.length} budget alert${alerts.length > 1 ? 's' : ''}`, { description: `${latest.category} is ${latest.overagePercent}% over its limit. Review Budget watch on the dashboard.` });
    if (permission === 'granted') toast.success('Browser alerts enabled for future budget limits');
    markBudgetAlertsRead();
    setUnreadAlerts(0);
  };

  const highlightLabel = (label: string) => {
    if (!normalizedQuery) return label;
    const start = label.toLowerCase().indexOf(normalizedQuery);
    if (start < 0) return label;
    return <>{label.slice(0, start)}<mark className="rounded bg-[#aeb8ed]/25 px-0.5 text-[#f5f6ff]">{label.slice(start, start + normalizedQuery.length)}</mark>{label.slice(start + normalizedQuery.length)}</>;
  };

  const renderItem = (item: typeof primaryItems[number]) => {
    const Icon = item.icon;
    const active = currentView === item.id;
    return (
      <button key={item.id} onClick={() => { if (item.id === 'budget-planner' && onOpenBudgetPlanner) { onOpenBudgetPlanner(); setIsOpen(false); setSearchQuery(''); return; } if (normalizedQuery) recordSearch(normalizedQuery); navigate(item.id); }} className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}>
        <Icon className="h-[18px] w-[18px]" />
        <span>{isHindi && item.id === 'dashboard' ? 'डैशबोर्ड' : highlightLabel(item.label)}</span>
        {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#aeb8ed]" />}
      </button>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-[72px] items-center border-b border-[#e7e8ee] bg-[#f8f7f4]/95 backdrop-blur-xl lg:pl-[288px]">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={isOpen}
              className="group flex h-10 w-10 items-center justify-center rounded-xl border border-[#e7e8ee] bg-white text-[#5867bb] shadow-[0_4px_16px_rgba(31,43,72,0.05)] transition hover:-translate-y-0.5 hover:border-[#aeb8ed] hover:bg-[#eef0fb] lg:hidden"
            >
              <Menu className="h-5 w-5 transition group-hover:scale-110" />
            </button>
            <button onClick={() => navigate('dashboard')} className="flex items-center gap-2.5 text-left lg:hidden">
              <span className="brand-mark"><img src="/dhansetu-logo.png" alt="DhanSetu AI logo" className="h-7 w-7 object-contain" /></span>
              <span>
                <span className="block text-[16px] font-semibold tracking-[-0.03em] text-[#222d4b]">DhanSetu<span className="text-[#5867bb]">.</span> <span className="text-[13px] font-bold tracking-[-0.01em]">AI</span></span>
                <span className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:block">Aapke paiso ka smart saathi</span>
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            {appConfig.isDemoMode && <span title="Demo data stays in this browser" className={`hidden items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] md:flex ${user ? 'bg-[#eef0eb] text-[#667080]' : 'border border-[#ead8bd] bg-[#fff7ed] text-[#9a6844]'}`}><span className={`h-1.5 w-1.5 rounded-full ${user ? 'bg-[#5867bb]' : 'bg-[#bf7864]'}`} />{user ? 'Workspace ready' : 'Demo mode · local data'}</span>}
            <button onClick={() => onOpenTransactionModal ? onOpenTransactionModal() : navigate('add-expense')} className="inline-flex items-center gap-2 rounded-xl bg-[#222d4b] px-3.5 py-2.5 text-xs font-bold text-white shadow-[0_8px_20px_rgba(34,45,75,0.16)] transition hover:-translate-y-0.5 hover:bg-[#3e4c91]"><Plus className="h-4 w-4" /><span className="hidden sm:inline">Add transaction</span></button>
          </div>
        </div>
      </header>

      <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
        <div className={`absolute inset-0 bg-[#18213a]/35 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${isOpen ? 'pointer-events-auto opacity-100' : 'opacity-0'}`} onClick={() => setIsOpen(false)} />
        <aside role="navigation" aria-label="DhanSetu AI navigation" className={`pointer-events-none absolute inset-y-0 left-0 flex h-dvh max-h-dvh min-h-0 w-[min(360px,92vw)] flex-col overflow-hidden bg-white text-[#222d4b] shadow-[24px_0_70px_rgba(31,43,72,0.12)] transition-transform duration-300 ease-out lg:pointer-events-auto lg:w-[288px] ${isOpen ? 'pointer-events-auto translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
          <div className="flex items-center justify-between border-b border-[#e7e8ee] px-6 py-5">
            <button onClick={() => navigate('dashboard')} className="flex items-center gap-3 text-left">
              <span className="brand-mark flex h-10 w-10 items-center justify-center rounded-2xl border border-[#dfe4ff] bg-[#eef0fb] shadow-inner shadow-[#dfe4ff]/50"><img src="/dhansetu-logo.png" alt="DhanSetu AI logo" className="h-7 w-7 object-contain" /></span>
              <span><span className="block text-[17px] font-semibold tracking-[-0.03em]">DhanSetu<span className="text-[#5867bb]">.</span> <span className="text-[13px] font-bold tracking-[-0.01em] text-[#5867bb]">AI</span></span><span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#8993aa]">Aapke paiso ka smart saathi</span></span>
            </button>
            <button onClick={() => setIsOpen(false)} aria-label="Close navigation menu" className="rounded-xl p-2 text-[#77839a] transition hover:bg-[#f4f6fb] hover:text-[#222d4b] lg:hidden"><X className="h-5 w-5" /></button>
          </div>
          <div className="border-b border-[#e7e8ee] bg-[#fbfcfe] px-6 py-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8993aa]" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Find a page..."
                aria-label="Search navigation"
                autoComplete="off"
                className="w-full rounded-2xl border border-[#e1e5f0] bg-white py-3 pl-11 pr-10 text-sm text-[#222d4b] outline-none placeholder:text-[#9aa4b8] shadow-[0_4px_14px_rgba(31,43,72,0.04)] transition focus:border-[#aeb8ed] focus:bg-[#fbfcfe]"
              />
              {searchQuery && <button onClick={() => { setSearchQuery(''); searchInputRef.current?.focus(); }} aria-label="Clear navigation search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[#8993aa] hover:bg-[#f4f6fb] hover:text-[#222d4b]"><X className="h-4 w-4" /></button>}
            </div>
          </div>

          <div aria-label="Workspace and tools navigation" tabIndex={0} className="drawer-scroll min-h-0 flex-1 touch-pan-y overflow-x-hidden overflow-y-auto overscroll-contain px-5 pb-12 pt-5 outline-none [scrollbar-gutter:stable]">
            {!normalizedQuery && <div className="mb-7">
              <div className="mb-3 flex items-center justify-between px-2"><span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8993aa]">Start here</span><span className="rounded-full border border-[#e1e5f0] bg-[#f8f9fc] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#9aa4b8]">Quick picks</span></div>
              <div className="space-y-2">
                {quickActions.map((action) => { const Icon = action.icon; return <button key={action.id} onClick={() => { if (action.id === 'add-expense' && onOpenTransactionModal) { onOpenTransactionModal(); setIsOpen(false); setSearchQuery(''); return; } if (action.id === 'coach' && onOpenCoachOverlay) { onOpenCoachOverlay(); setIsOpen(false); setSearchQuery(''); return; } navigate(action.id); }} className="group flex w-full items-center gap-3 rounded-2xl border border-[#e7e8ee] bg-[#fbfcfe] px-3.5 py-3 text-left transition hover:-translate-y-0.5 hover:border-[#aeb8ed] hover:bg-[#f4f6fb]"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef0fb] text-[#5867bb]"><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-[#344052]">{action.label}</span><span className="mt-0.5 block truncate text-[10px] text-[#8993aa]">{action.description}</span></span><ArrowUpRight className="h-4 w-4 text-[#b0b8c8] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#5867bb]" /></button>; })}
              </div>
            </div>}
            {!normalizedQuery && recentSearches.length > 0 && <div className="mb-7">
              <div className="mb-3 flex items-center justify-between px-3"><span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8993aa]"><History className="h-3.5 w-3.5" /> Recent searches</span><button onClick={() => { setRecentSearches([]); window.localStorage.removeItem(RECENT_SEARCHES_KEY); }} className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#9aa4b8] transition hover:text-[#5867bb]"><Trash2 className="h-3 w-3" /> Clear</button></div>
              <div className="flex flex-wrap gap-2 px-1">{recentSearches.map((recent) => <button key={recent} onClick={() => { setSearchQuery(recent); window.setTimeout(() => searchInputRef.current?.focus(), 0); }} className="max-w-full truncate rounded-full border border-[#e1e5f0] bg-[#fbfcfe] px-3 py-1.5 text-[11px] font-semibold text-[#77839a] transition hover:border-[#aeb8ed] hover:bg-[#f4f6fb] hover:text-[#222d4b]">{recent}</button>)}</div>
            </div>}
            {filteredPrimaryItems.length > 0 && <section className="mb-7"><div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8993aa]">Your money</div><nav className="space-y-1 rounded-3xl border border-[#e7e8ee] bg-[#f8f9fc] p-2">{filteredPrimaryItems.map(renderItem)}</nav></section>}
            {filteredToolItems.length > 0 && <section><div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8993aa]">Tools for the month</div><nav className="space-y-1 rounded-3xl border border-[#e7e8ee] bg-[#f8f9fc] p-2">{filteredToolItems.map(renderItem)}</nav></section>}
            {!hasResults && <div className="rounded-2xl border border-[#e7e8ee] bg-[#fbfcfe] px-4 py-5 text-center"><Search className="mx-auto h-5 w-5 text-[#9aa4b8]" /><p className="mt-3 text-sm font-semibold text-[#344052]">No navigation found</p><p className="mt-1 text-xs leading-5 text-[#8993aa]">Try a different keyword or clear your search.</p><button onClick={() => setSearchQuery('')} className="mt-4 rounded-lg bg-[#eef0fb] px-3 py-2 text-xs font-bold text-[#5867bb]">Clear search</button></div>}
          </div>
          <div className="shrink-0 border-t border-[#e7e8ee] bg-white px-5 py-4 shadow-[0_-14px_30px_rgba(31,43,72,0.06)]">
            {(utilityMatches.notifications || utilityMatches.settings || utilityMatches.theme) && <div className="space-y-1">
              {utilityMatches.notifications && <button onClick={handleNotifications} className="sidebar-link rounded-xl border border-transparent !gap-3 !px-3 !py-2 !text-[13px] !leading-5 hover:border-[#e1e5f0] hover:bg-[#f4f6fb]"><Bell className="h-4 w-4" /><span>Notifications</span>{unreadAlerts > 0 ? <span className="ml-auto min-w-5 rounded-full bg-[#bf7864] px-1.5 py-0.5 text-center text-[10px] font-extrabold text-white">{unreadAlerts > 9 ? '9+' : unreadAlerts}</span> : <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#c5cce5]" />}</button>}
              {utilityMatches.settings && <button onClick={() => toast.info('Settings are coming soon')} className="sidebar-link rounded-xl border border-transparent !gap-3 !px-3 !py-2 !text-[13px] !leading-5 hover:border-[#e1e5f0] hover:bg-[#f4f6fb]"><Settings className="h-4 w-4" /><span>Settings</span></button>}
              {utilityMatches.theme && <button onClick={toggleTheme} className="sidebar-link rounded-xl border border-transparent !gap-3 !px-3 !py-2 !text-[13px] !leading-5 hover:border-[#e1e5f0] hover:bg-[#f4f6fb]"><span className="flex h-4 w-4 items-center justify-center">{theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}</span><span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span></button>}
            </div>}
            <div className="mt-2 border-t border-[#e7e8ee] pt-2">
              <div className="flex items-center gap-2.5 rounded-xl border border-[#e7e8ee] bg-[#fbfcfe] p-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dfe4ff] text-[11px] font-extrabold text-[#222d4b]">{initials}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-[#344052]">{displayName}</p><p className="mt-0.5 text-[10px] text-[#8993aa]">Personal workspace</p></div><button onClick={async () => { await logout(); setIsOpen(false); toast.success(isHindi ? 'साइन आउट हो गया' : 'Signed out successfully'); }} className="rounded-lg p-1 text-[#8993aa] transition hover:bg-[#f4f6fb] hover:text-[#222d4b]" aria-label="Sign out"><LogOut className="h-4 w-4" /></button></div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Navbar;

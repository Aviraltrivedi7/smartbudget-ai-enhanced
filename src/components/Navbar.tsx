import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  Search,
  Command,
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
  { id: 'insights', label: 'AI insights', icon: Sparkles },
  { id: 'visualizer', label: 'Analytics', icon: BarChart3 },
  { id: 'calendar-tracker', label: 'Transactions', icon: CalendarDays },
];

const RECENT_SEARCHES_KEY = 'smartbudget_recent_searches';

const toolItems = [
  { id: 'budget-planner', label: 'Budget planner', icon: Target },
  { id: 'savings-goals', label: 'Savings goals', icon: Trophy },
  { id: 'monthly-report', label: 'Reports & exports', icon: FileDown },
  { id: 'bill-scanner', label: 'Scan a bill', icon: ScanLine },
];

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenTransactionModal, onOpenCoachOverlay, onOpenBudgetPlanner }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currentLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
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
    { id: 'add-expense', label: 'Add transaction', description: 'Log income or an expense', icon: Plus },
    { id: 'coach', label: 'Ask AI coach', description: 'Get a smarter next step', icon: Sparkles },
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
      <header className="sticky top-0 z-40 flex h-[72px] items-center border-b border-[#e7e8ee] bg-[#f8f7f4]/95 px-4 backdrop-blur-xl sm:px-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
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
            <span className="brand-mark"><img src="/arthora-logo.png" alt="Arthora logo" className="h-7 w-7 object-contain" /></span>
            <span>
              <span className="block text-[16px] font-semibold tracking-[-0.03em] text-[#222d4b]">ARTHORA<span className="text-[#5867bb]">.</span></span>
              <span className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:block">Financial intelligence</span>
            </span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full bg-[#eef0eb] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#667080] md:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#5867bb]" />Workspace ready</span>
          <button onClick={() => onOpenTransactionModal ? onOpenTransactionModal() : navigate('add-expense')} className="inline-flex items-center gap-2 rounded-xl bg-[#222d4b] px-3.5 py-2.5 text-xs font-bold text-white shadow-[0_8px_20px_rgba(34,45,75,0.16)] transition hover:-translate-y-0.5 hover:bg-[#3e4c91]"><Plus className="h-4 w-4" /><span className="hidden sm:inline">Add transaction</span></button>
        </div>
        </div>
      </header>

      <div className={`fixed inset-0 z-[60] overflow-hidden transition-opacity duration-200 ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`} aria-hidden={!isOpen}>
        <div className="absolute inset-0 bg-[#18213a]/35 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
        <aside role="dialog" aria-modal="true" aria-label="Arthora navigation" className={`absolute inset-y-0 left-0 flex h-dvh max-h-dvh min-h-0 w-[min(320px,88vw)] flex-col overflow-hidden bg-[#222d4b] text-white shadow-[18px_0_55px_rgba(24,33,58,0.22)] transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
            <button onClick={() => navigate('dashboard')} className="flex items-center gap-3 text-left">
              <span className="brand-mark"><img src="/arthora-logo.png" alt="Arthora logo" className="h-7 w-7 object-contain" /></span>
              <span><span className="block text-[17px] font-semibold tracking-[-0.03em]">ARTHORA<span className="text-[#dfe4ff]">.</span></span><span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">Financial intelligence</span></span>
            </button>
            <button onClick={() => setIsOpen(false)} aria-label="Close navigation menu" className="rounded-xl p-2 text-white/70 transition hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>
          </div>
          <div className="border-b border-white/10 px-5 py-4">
            <div className="mb-2.5 flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Command center</span>
              <kbd className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-white/45"><Command className="h-3 w-3" />K</kbd>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search anything..."
                aria-label="Search navigation"
                autoComplete="off"
                className="w-full rounded-xl border border-white/10 bg-white/10 py-2.5 pl-10 pr-10 text-sm text-white outline-none placeholder:text-white/50 transition focus:border-[#aeb8ed] focus:bg-white/15"
              />
              {searchQuery && <button onClick={() => { setSearchQuery(''); searchInputRef.current?.focus(); }} aria-label="Clear navigation search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>}
            </div>
            {!normalizedQuery && <p className="mt-2 px-1 text-[11px] leading-5 text-white/40">Jump anywhere in your financial workspace. <span className="text-white/55">Swipe or scroll to explore.</span></p>}
          </div>

          <div aria-label="Workspace and tools navigation" tabIndex={0} className="drawer-scroll min-h-0 flex-1 touch-pan-y overflow-x-hidden overflow-y-auto overscroll-contain px-5 pb-10 pt-6 outline-none [scrollbar-gutter:stable]">
            {!normalizedQuery && recentSearches.length > 0 && <div className="mb-7">
              <div className="mb-3 flex items-center justify-between px-3"><span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50"><History className="h-3.5 w-3.5" /> Recent searches</span><button onClick={() => { setRecentSearches([]); window.localStorage.removeItem(RECENT_SEARCHES_KEY); }} className="inline-flex items-center gap-1 text-[10px] font-semibold text-white/35 transition hover:text-white/70"><Trash2 className="h-3 w-3" /> Clear</button></div>
              <div className="flex flex-wrap gap-2 px-1">{recentSearches.map((recent) => <button key={recent} onClick={() => { setSearchQuery(recent); window.setTimeout(() => searchInputRef.current?.focus(), 0); }} className="max-w-full truncate rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/65 transition hover:border-[#aeb8ed]/50 hover:bg-white/10 hover:text-white">{recent}</button>)}</div>
            </div>}
            {!normalizedQuery && <div className="mb-7">
              <div className="mb-3 flex items-center justify-between px-3"><span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Quick actions</span><span className="text-[10px] text-white/35">Suggested</span></div>
              <div className="space-y-2">
                {quickActions.map((action) => { const Icon = action.icon; return <button key={action.id} onClick={() => { if (action.id === 'add-expense' && onOpenTransactionModal) { onOpenTransactionModal(); setIsOpen(false); setSearchQuery(''); return; } if (action.id === 'coach' && onOpenCoachOverlay) { onOpenCoachOverlay(); setIsOpen(false); setSearchQuery(''); return; } navigate(action.id); }} className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3 text-left transition hover:-translate-y-0.5 hover:border-[#aeb8ed]/50 hover:bg-white/10"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#aeb8ed]/15 text-[#dfe4ff]"><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-white/90">{action.label}</span><span className="mt-0.5 block truncate text-[10px] text-white/45">{action.description}</span></span><ArrowUpRight className="h-4 w-4 text-white/30 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#dfe4ff]" /></button>; })}
              </div>
            </div>}
            {filteredPrimaryItems.length > 0 && <><div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Workspace</div><nav className="space-y-1">{filteredPrimaryItems.map(renderItem)}</nav></>}
            {filteredToolItems.length > 0 && <><div className="mb-3 mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Tools</div><nav className="space-y-1">{filteredToolItems.map(renderItem)}</nav></>}
            {!hasResults && <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center"><Search className="mx-auto h-5 w-5 text-white/50" /><p className="mt-3 text-sm font-semibold text-white/85">No navigation found</p><p className="mt-1 text-xs leading-5 text-white/55">Try a different keyword or clear your search.</p><button onClick={() => setSearchQuery('')} className="mt-4 rounded-lg bg-[#dfe4ff] px-3 py-2 text-xs font-bold text-[#222d4b]">Clear search</button></div>}
          </div>
          <div className="shrink-0 border-t border-white/10 bg-[#222d4b] px-4 py-3">
            {(utilityMatches.notifications || utilityMatches.settings || utilityMatches.theme) && <div className="space-y-0.5">
              {utilityMatches.notifications && <button onClick={() => toast.info('Notifications are all caught up')} className="sidebar-link !gap-2 !px-2.5 !py-1.5 !text-[13px] !leading-5"><Bell className="h-4 w-4" /><span>Notifications</span><span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#bf7864]" /></button>}
              {utilityMatches.settings && <button onClick={() => toast.info('Settings are coming soon')} className="sidebar-link !gap-2 !px-2.5 !py-1.5 !text-[13px] !leading-5"><Settings className="h-4 w-4" /><span>Settings</span></button>}
              {utilityMatches.theme && <button onClick={toggleTheme} className="sidebar-link !gap-2 !px-2.5 !py-1.5 !text-[13px] !leading-5"><span className="flex h-4 w-4 items-center justify-center">{theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}</span><span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span></button>}
            </div>}
            <div className="mt-2 border-t border-white/10 pt-2">
              <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dfe4ff] text-[11px] font-extrabold text-[#222d4b]">{initials}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-white/95">{displayName}</p><p className="mt-0.5 text-[10px] text-white/60">Personal workspace</p></div><button onClick={async () => { await logout(); setIsOpen(false); toast.success(isHindi ? 'साइन आउट हो गया' : 'Signed out successfully'); }} className="rounded-lg p-1 text-white/60 transition hover:bg-white/10 hover:text-white" aria-label="Sign out"><LogOut className="h-4 w-4" /></button></div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Navbar;

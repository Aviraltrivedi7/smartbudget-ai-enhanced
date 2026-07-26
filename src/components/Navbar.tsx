import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  User, 
  LogOut, 
  Wallet, 
  LayoutDashboard, 
  Brain, 
  PieChart, 
  Sparkles,
  Calendar
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: any) => void;
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currentLanguage } = useLanguage();
  const isHindi = currentLanguage === 'hi';

  const navItems = [
    { id: 'dashboard', label: isHindi ? 'डैशबोर्ड' : 'Dashboard', icon: LayoutDashboard },
    { id: 'insights', label: isHindi ? 'AI अंतर्दृष्टि' : 'AI Insights', icon: Brain },
    { id: 'visualizer', label: isHindi ? 'एनालिटिक्स' : 'Analytics', icon: PieChart },
    { id: 'calendar-tracker', label: isHindi ? 'कैलेंडर' : 'Calendar', icon: Calendar },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('dashboard')} 
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
                SmartBudget
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-700">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5 hidden sm:block">
              {isHindi ? 'स्मार्ट वित्तीय ट्रैकर' : 'Smart Financial Intelligence'}
            </p>
          </div>
        </div>

        {/* Quick Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Add Expense Button */}
          <Button
            onClick={() => onNavigate('add-expense')}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 rounded-xl px-3.5 flex items-center gap-1.5 font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{isHindi ? 'ट्रांजेक्शन जोड़ें' : 'Add Expense'}</span>
          </Button>

        </div>
      </div>
    </header>
  );
};

export default Navbar;

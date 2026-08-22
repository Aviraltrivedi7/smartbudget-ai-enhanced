
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/hooks/useTransactions';
import AuthModal from '@/components/AuthModal';
import Dashboard from '@/components/Dashboard';
import AddExpense from '@/components/AddExpense';
import AIFinanceCoach from '@/components/AIFinanceCoach';
import SavingsGoals from '@/components/SavingsGoals';
import SmartBudgetPlanner from '@/components/SmartBudgetPlanner';
import FinancialVisualizer from '@/components/FinancialVisualizer';
import AIInsights from '@/components/AIInsights';
import BillReminder from '@/components/BillReminder';
import ExpenseChat from '@/components/ExpenseChat';
import SpendingLimits from '@/components/SpendingLimits';
import Gamification from '@/components/Gamification';
import MonthlyReport from '@/components/MonthlyReport';
import SmartSuggestions from '@/components/SmartSuggestions';
import LanguageSelector from '@/components/LanguageSelector';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import SpendingCoach from '@/components/SpendingCoach';
import GeoFinanceMap from '@/components/GeoFinanceMap';
import BillScanner from '@/components/BillScanner';
import VoiceTransactionEntry from '@/components/VoiceTransactionEntry';
import AdvancedAnalytics from '@/components/AdvancedAnalytics';
import BudgetProgress from '@/components/BudgetProgress';
import MoneyMonster from '@/components/MoneyMonster';
import CalendarExpenseTracker from '@/components/CalendarExpenseTracker';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Navbar from '@/components/Navbar';
import WelcomeGuide from '@/components/WelcomeGuide';

type ViewType = 'dashboard' | 'add-expense' | 'insights' | 'visualizer' | 'coach' | 'budget-planner' | 'savings-goals' | 'bill-reminder' | 'expense-chat' | 'spending-limits' | 'gamification' | 'monthly-report' | 'smart-suggestions' | 'spending-coach' | 'geo-map' | 'bill-scanner' | 'voice-entry' | 'advanced-analytics' | 'budget-progress' | 'money-monster' | 'calendar-tracker';

interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

const Index = () => {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { transactions, addTransaction: addTransactionToDb, importTransactions } = useTransactions();
  const { currentLanguage } = useLanguage();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(() => {
    // Show guide if user hasn't seen it before
    return !localStorage.getItem('hasSeenWelcomeGuide');
  });
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAddTransaction = (newTransaction: {
    title: string;
    amount: number;
    category: string;
    date: Date;
    type: 'expense' | 'income';
  }) => {
    addTransactionToDb({
      title: newTransaction.title,
      amount: newTransaction.amount,
      category: newTransaction.category,
      date: newTransaction.date.toISOString().split('T')[0],
      type: newTransaction.type,
    });
  };

  const handleWelcomeGuideClose = () => {
    setShowWelcomeGuide(false);
    localStorage.setItem('hasSeenWelcomeGuide', 'true');
  };

  const handleFeatureSelect = (feature: string) => {
    setCurrentView(feature as ViewType);
    localStorage.setItem('hasSeenWelcomeGuide', 'true');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'calendar-tracker':
        return (
          <CalendarExpenseTracker
            onBack={() => setCurrentView('dashboard')}
            transactions={transactions}
          />
        );
      case 'add-expense':
        return (
          <AddExpense
            onBack={() => setCurrentView('dashboard')}
            onSave={handleAddTransaction}
          />
        );
      case 'insights':
        return (
          <AIInsights
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'coach':
        return (
          <AIFinanceCoach
            onBack={() => setCurrentView('dashboard')}
            transactions={transactions}
          />
        );
      case 'budget-planner':
        return (
          <SmartBudgetPlanner
            onBack={() => setCurrentView('dashboard')}
            transactions={transactions}
          />
        );
      case 'savings-goals':
        return (
          <SavingsGoals
            onBack={() => setCurrentView('dashboard')}
            transactions={transactions}
          />
        );
      case 'bill-reminder':
        return (
          <BillReminder
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'expense-chat':
        return (
          <ExpenseChat
            onBack={() => setCurrentView('dashboard')}
            transactions={transactions}
          />
        );
      case 'spending-limits':
        return (
          <SpendingLimits
            onBack={() => setCurrentView('dashboard')}
            transactions={transactions}
          />
        );
      case 'gamification':
        return (
          <Gamification
            onBack={() => setCurrentView('dashboard')}
            transactions={transactions}
          />
        );
      case 'monthly-report':
        return (
          <MonthlyReport
            onBack={() => setCurrentView('dashboard')}
            transactions={transactions}
            onImport={importTransactions}
          />
        );
      case 'smart-suggestions':
        return (
          <SmartSuggestions
            onBack={() => setCurrentView('dashboard')}
            transactions={transactions}
          />
        );
      case 'visualizer':
        return (
          <div className="min-h-screen bg-background p-4">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="p-2 bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  >
                    ←
                  </button>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Financial Visualizer
                    </h1>
                    <p className="text-muted-foreground">Advanced digital analytics and insights</p>
                  </div>
                </div>
              </div>
              <FinancialVisualizer transactions={transactions} />
            </div>
          </div>
        );
      case 'spending-coach':
        return (
          <SpendingCoach
            onBack={() => setCurrentView('dashboard')}
            transactions={transactions}
          />
        );
      case 'geo-map':
        return (
          <GeoFinanceMap
            onBack={() => setCurrentView('dashboard')}
            transactions={transactions}
          />
        );
      case 'bill-scanner':
        return (
          <BillScanner
            onBack={() => setCurrentView('dashboard')}
            onSave={handleAddTransaction}
          />
        );
      case 'voice-entry':
        return (
          <VoiceTransactionEntry
            onBack={() => setCurrentView('dashboard')}
            onSave={handleAddTransaction}
          />
        );
      case 'advanced-analytics':
        return (
          <AdvancedAnalytics
            onBack={() => setCurrentView('dashboard')}
            transactions={transactions}
          />
        );
      case 'budget-progress':
        return (
          <BudgetProgress
            onBack={() => setCurrentView('dashboard')}
            transactions={transactions}
          />
        );
      case 'money-monster':
        return (
          <MoneyMonster
            onBack={() => setCurrentView('dashboard')}
            transactions={transactions}
          />
        );
      default:
        return (
          <DashboardWithNavigation
            transactions={transactions}
            onNavigate={setCurrentView}
            onShowWelcomeGuide={() => setShowWelcomeGuide(true)}
          />
        );
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[#f6f7f8] text-slate-900 smooth-load">
        <Navbar
          currentView={currentView}
          onNavigate={setCurrentView}
        />
        <div className="min-h-screen lg:pl-64">
          <main className="pb-24 lg:pb-12">
            {renderCurrentView()}
          </main>
          <Footer />
        </div>
        <WelcomeGuide
          isOpen={showWelcomeGuide}
          onClose={handleWelcomeGuideClose}
          onFeatureSelect={handleFeatureSelect}
        />
      </div>
    </ThemeProvider>
  );
};

// Enhanced Dashboard component with navigation
const DashboardWithNavigation: React.FC<{
  transactions: Transaction[];
  onNavigate: (view: ViewType) => void;
  onShowWelcomeGuide: () => void;
}> = ({ transactions, onNavigate, onShowWelcomeGuide }) => {
  return <Dashboard onNavigate={onNavigate} transactions={transactions} onShowWelcomeGuide={onShowWelcomeGuide} />;
};

export default Index;

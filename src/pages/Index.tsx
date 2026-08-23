
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/hooks/useTransactions';
import AuthModal from '@/components/AuthModal';
import Dashboard from '@/components/Dashboard';
import AddExpense from '@/components/AddExpense';
import AddTransactionDialog from '@/components/AddTransactionDialog';
import AIFinanceCoach from '@/components/AIFinanceCoach';
import CoachPromptDialog from '@/components/CoachPromptDialog';
import SavingsGoals from '@/components/SavingsGoals';
import SmartBudgetPlanner from '@/components/SmartBudgetPlanner';
import BudgetPlannerDialog from '@/components/BudgetPlannerDialog';
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
import FloatingCoachButton from '@/components/FloatingCoachButton';
import TransactionDetailsDialog from '@/components/TransactionDetailsDialog';
import { LocalTransaction } from '@/hooks/useTransactions';

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
  const { transactions, addTransaction: addTransactionToDb, updateTransaction, deleteTransaction, importTransactions } = useTransactions();
  const { currentLanguage } = useLanguage();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(() => {
    // Show guide if user hasn't seen it before
    return !localStorage.getItem('hasSeenWelcomeGuide');
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isCoachPromptOpen, setIsCoachPromptOpen] = useState(false);
  const [isBudgetPlannerOpen, setIsBudgetPlannerOpen] = useState(false);
  const [coachInitialPrompt, setCoachInitialPrompt] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<LocalTransaction | null>(null);

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
            onOpenCoach={(prompt) => {
              setCoachInitialPrompt(prompt);
              setCurrentView('coach');
            }}
          />
        );
      case 'coach':
        return (
          <AIFinanceCoach
            key={coachInitialPrompt || 'coach'}
            onBack={() => { setCoachInitialPrompt(''); setCurrentView('dashboard'); }}
            transactions={transactions}
            initialPrompt={coachInitialPrompt}
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
            onOpenBudgetPlanner={() => setIsBudgetPlannerOpen(true)}
            onTransactionSelect={setSelectedTransaction}
          />
        );
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-slate-900 smooth-load">
        <Navbar
          currentView={currentView}
          onNavigate={setCurrentView}
          onOpenTransactionModal={() => setIsTransactionModalOpen(true)}
          onOpenCoachOverlay={() => setIsCoachPromptOpen(true)}
          onOpenBudgetPlanner={() => setIsBudgetPlannerOpen(true)}
        />
        <div className="min-h-screen">
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
        {currentView !== 'coach' && <FloatingCoachButton onClick={() => { setCoachInitialPrompt(''); setCurrentView('coach'); }} />}
        <AddTransactionDialog
          open={isTransactionModalOpen}
          onOpenChange={setIsTransactionModalOpen}
          onSave={handleAddTransaction}
        />
        <BudgetPlannerDialog
          open={isBudgetPlannerOpen}
          onOpenChange={setIsBudgetPlannerOpen}
          transactions={transactions}
          onConfirmIncome={(income) => localStorage.setItem('arthora_budget_income', String(income))}
          onOpenFullPlanner={() => {
            setIsBudgetPlannerOpen(false);
            setCurrentView('budget-planner');
          }}
        />
        <TransactionDetailsDialog
          open={Boolean(selectedTransaction)}
          transaction={selectedTransaction}
          onOpenChange={(open) => { if (!open) setSelectedTransaction(null); }}
          onUpdate={updateTransaction}
          onDelete={deleteTransaction}
        />
        <CoachPromptDialog
          open={isCoachPromptOpen}
          onOpenChange={setIsCoachPromptOpen}
          onSubmitPrompt={(prompt) => {
            setCoachInitialPrompt(prompt);
            setIsCoachPromptOpen(false);
            setCurrentView('coach');
          }}
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
  onOpenBudgetPlanner: () => void;
  onTransactionSelect: (transaction: LocalTransaction) => void;
}> = ({ transactions, onNavigate, onShowWelcomeGuide, onOpenBudgetPlanner, onTransactionSelect }) => {
  return <Dashboard onNavigate={onNavigate} transactions={transactions} onShowWelcomeGuide={onShowWelcomeGuide} onOpenBudgetPlanner={onOpenBudgetPlanner} onTransactionSelect={onTransactionSelect} />;
};

export default Index;

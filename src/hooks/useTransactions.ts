import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

export interface LocalTransaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
  description?: string;
  location?: string;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<LocalTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Default transactions for offline/demo mode
  const defaultTransactions: LocalTransaction[] = [
    { id: '1', title: 'Monthly Salary', amount: 75000, category: 'Income', date: '2026-07-01', type: 'income', description: 'Tech Corp Salary' },
    { id: '2', title: 'House Rent', amount: 18000, category: 'Rent', date: '2026-07-02', type: 'expense', description: 'Apartment Rent' },
    { id: '3', title: 'Supermarket Groceries', amount: 4500, category: 'Food', date: '2026-07-05', type: 'expense', description: 'Monthly Essentials' },
    { id: '4', title: 'Electricity & WiFi', amount: 2400, category: 'Utilities', date: '2026-07-08', type: 'expense', description: 'Utilities Payment' },
    { id: '5', title: 'Freelance Project', amount: 18500, category: 'Income', date: '2026-07-12', type: 'income', description: 'UI Design Consulting' },
    { id: '6', title: 'Dining Out', amount: 3200, category: 'Food', date: '2026-07-15', type: 'expense', description: 'Weekend Dinner' },
    { id: '7', title: 'Uber & Transport', amount: 1800, category: 'Travel', date: '2026-07-18', type: 'expense', description: 'Commute' },
    { id: '8', title: 'Shopping & Apparel', amount: 5100, category: 'Shopping', date: '2026-07-22', type: 'expense', description: 'Summer Wear' },
  ];

  // Load transactions from local storage
  const loadLocalTransactions = () => {
    const stored = localStorage.getItem('pocket_pal_transactions');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // If stored data is empty or has zero amounts from old demo, reset to new default
        if (Array.isArray(parsed) && parsed.length > 0) {
          const totalAmt = parsed.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);
          if (totalAmt > 0) {
            return parsed;
          }
        }
      } catch (error) {
        console.error('Error parsing stored transactions:', error);
      }
    }
    return defaultTransactions;
  };

  // Save transactions to local storage
  const saveToLocalStorage = (transactions: LocalTransaction[]) => {
    localStorage.setItem('pocket_pal_transactions', JSON.stringify(transactions));
  };

  // Convert database transaction to local transaction format
  const dbToLocal = (dbTransaction: Transaction): LocalTransaction => ({
    id: dbTransaction.id,
    title: dbTransaction.title,
    amount: dbTransaction.amount,
    category: dbTransaction.category_name || 'Other',
    date: dbTransaction.date,
    type: dbTransaction.transaction_type,
    description: dbTransaction.description || undefined,
    location: dbTransaction.location || undefined,
  });

  // Convert local transaction to database format
  const localToDb = (localTransaction: Partial<LocalTransaction>, userId: string): TransactionInsert => ({
    user_id: userId,
    title: localTransaction.title!,
    amount: localTransaction.amount!,
    category_name: localTransaction.category,
    transaction_type: localTransaction.type!,
    date: localTransaction.date!,
    description: localTransaction.description,
    location: localTransaction.location,
  });

  // Fetch transactions from database
  const fetchTransactions = async () => {
    if (!user) {
      // Load from local storage for offline mode
      const localTransactions = loadLocalTransactions();
      setTransactions(localTransactions);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      const localTransactions = data?.map(dbToLocal) || [];
      setTransactions(localTransactions);
      
      // Also save to local storage as backup
      saveToLocalStorage(localTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Fallback to local storage
      const localTransactions = loadLocalTransactions();
      setTransactions(localTransactions);
      
      toast({
        title: "Offline Mode",
        description: "Using cached data. Connect to internet for sync.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add new transaction
  const addTransaction = async (newTransaction: Omit<LocalTransaction, 'id'>) => {
    const localTransaction: LocalTransaction = {
      ...newTransaction,
      id: Date.now().toString(),
    };

    // Update local state immediately
    const updatedTransactions = [localTransaction, ...transactions];
    setTransactions(updatedTransactions);
    saveToLocalStorage(updatedTransactions);

    // Sync to database if user is logged in
    if (user) {
      try {
        const dbTransaction = localToDb(localTransaction, user.id);
        const { error } = await supabase
          .from('transactions')
          .insert([dbTransaction]);

        if (error) throw error;

        toast({
          title: "Transaction Added",
          description: `${newTransaction.type === 'expense' ? 'Expense' : 'Income'} of ₹${newTransaction.amount.toLocaleString()} added successfully.`,
        });
      } catch (error) {
        console.error('Error adding transaction to database:', error);
        toast({
          title: "Saved Locally",
          description: "Transaction saved locally. Will sync when online.",
        });
      }
    } else {
      toast({
        title: "Transaction Added",
        description: `${newTransaction.type === 'expense' ? 'Expense' : 'Income'} of ₹${newTransaction.amount.toLocaleString()} added successfully.`,
      });
    }
  };

  // Update transaction
  const updateTransaction = async (id: string, updates: Partial<LocalTransaction>) => {
    const updatedTransactions = transactions.map(t => 
      t.id === id ? { ...t, ...updates } : t
    );
    
    setTransactions(updatedTransactions);
    saveToLocalStorage(updatedTransactions);

    // Sync to database if user is logged in
    if (user) {
      try {
        const dbUpdates: TransactionUpdate = {
          title: updates.title,
          amount: updates.amount,
          category_name: updates.category,
          transaction_type: updates.type,
          date: updates.date,
          description: updates.description,
          location: updates.location,
        };

        const { error } = await supabase
          .from('transactions')
          .update(dbUpdates)
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: "Transaction Updated",
          description: "Transaction updated successfully.",
        });
      } catch (error) {
        console.error('Error updating transaction:', error);
        toast({
          title: "Updated Locally",
          description: "Changes saved locally. Will sync when online.",
        });
      }
    }
  };

  // Delete transaction
  const deleteTransaction = async (id: string) => {
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);
    saveToLocalStorage(updatedTransactions);

    // Sync to database if user is logged in
    if (user) {
      try {
        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: "Transaction Deleted",
          description: "Transaction deleted successfully.",
        });
      } catch (error) {
        console.error('Error deleting transaction:', error);
        toast({
          title: "Deleted Locally",
          description: "Transaction deleted locally. Will sync when online.",
        });
      }
    }
  };

  // Sync local data with database
  const syncTransactions = async () => {
    if (!user) return;

    try {
      // Get all local transactions
      const localTransactions = loadLocalTransactions();
      
      // Get all database transactions
      const { data: dbTransactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Find transactions that exist locally but not in database
      const dbIds = new Set(dbTransactions?.map(t => t.id) || []);
      const transactionsToUpload = localTransactions.filter(t => !dbIds.has(t.id));

      // Upload missing transactions
      if (transactionsToUpload.length > 0) {
        const dbInserts = transactionsToUpload.map(t => localToDb(t, user.id));
        const { error: uploadError } = await supabase
          .from('transactions')
          .insert(dbInserts);

        if (uploadError) throw uploadError;
      }

      // Refresh transactions from database
      await fetchTransactions();

      toast({
        title: "Sync Complete",
        description: `${transactionsToUpload.length} transactions synced to cloud.`,
      });
    } catch (error) {
      console.error('Error syncing transactions:', error);
      toast({
        title: "Sync Failed",
        description: "Could not sync with cloud. Data remains local.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    syncTransactions,
    refetch: fetchTransactions,
  };
};
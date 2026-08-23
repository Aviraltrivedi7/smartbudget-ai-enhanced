import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { transactionService, Transaction as ApiTransaction } from '@/services/transactionService';

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

interface ApiCategory { name?: string; }
interface ApiTransactionRecord extends Omit<ApiTransaction, 'category'> {
  category: string | ApiCategory;
}

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

const readLocalTransactions = (): LocalTransaction[] => {
  try {
    const stored = localStorage.getItem('pocket_pal_transactions');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const totalAmount = parsed.reduce((sum: number, item: { amount?: number | string }) => sum + (Number(item.amount) || 0), 0);
        if (totalAmount > 0) return parsed as LocalTransaction[];
      }
    }
  } catch (error) {
    console.error('Error parsing cached transactions:', error);
  }
  return defaultTransactions;
};

const saveLocalTransactions = (transactions: LocalTransaction[]) => {
  localStorage.setItem('pocket_pal_transactions', JSON.stringify(transactions));
};

const dbToLocal = (transaction: ApiTransactionRecord): LocalTransaction => ({
  id: transaction.id || `${Date.now()}`,
  title: transaction.title,
  amount: Number(transaction.amount),
  category: typeof transaction.category === 'string' ? transaction.category : transaction.category?.name || 'Other',
  date: transaction.date,
  type: transaction.type,
  description: transaction.description,
  location: transaction.location?.name,
});

const toApiTransaction = (transaction: Omit<LocalTransaction, 'id'>) => ({
  title: transaction.title,
  amount: Number(transaction.amount),
  category: transaction.category,
  type: transaction.type,
  date: transaction.date,
  description: transaction.description,
  location: transaction.location ? { name: transaction.location, coordinates: [0, 0] as [number, number] } : undefined,
});

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<LocalTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      const localTransactions = readLocalTransactions();
      setTransactions(localTransactions);
      saveLocalTransactions(localTransactions);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await transactionService.getTransactions({ page: 1, limit: 100 });
      const remoteData = response.data as { transactions?: ApiTransactionRecord[] } | undefined;
      if (!response.success || !remoteData?.transactions) throw new Error(response.message || 'Could not load transactions');
      const remoteTransactions = remoteData.transactions.map(dbToLocal);
      setTransactions(remoteTransactions);
      saveLocalTransactions(remoteTransactions);
    } catch (error) {
      console.error('Backend transaction fetch failed:', error);
      const localTransactions = readLocalTransactions();
      setTransactions(localTransactions);
      toast({ title: 'Offline Mode', description: 'Backend unavailable. Using cached transactions.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast, user]);

  useEffect(() => {
    void fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (newTransaction: Omit<LocalTransaction, 'id'>) => {
    const optimistic: LocalTransaction = { ...newTransaction, id: `local-${Date.now()}` };
    setTransactions((current) => {
      const updated = [optimistic, ...current];
      saveLocalTransactions(updated);
      return updated;
    });

    if (!user) {
      toast({ title: 'Transaction Added', description: `${newTransaction.type === 'expense' ? 'Expense' : 'Income'} of ₹${newTransaction.amount.toLocaleString()} added locally.` });
      return;
    }

    try {
      const response = await transactionService.createTransaction(toApiTransaction(newTransaction));
      if (!response.success || !response.data) throw new Error(response.message || 'Could not save transaction');
      const saved = dbToLocal(response.data as ApiTransactionRecord);
      setTransactions((current) => {
        const updated = [saved, ...current.filter((item) => item.id !== optimistic.id)];
        saveLocalTransactions(updated);
        return updated;
      });
      toast({ title: 'Transaction Synced', description: 'Saved securely to your DhanSetu workspace.' });
    } catch (error) {
      console.error('Backend transaction create failed:', error);
      toast({ title: 'Saved Locally', description: 'Backend unavailable. This transaction remains in your local queue.' });
    }
  };

  const updateTransaction = async (id: string, updates: Partial<LocalTransaction>) => {
    setTransactions((current) => {
      const updated = current.map((transaction) => transaction.id === id ? { ...transaction, ...updates } : transaction);
      saveLocalTransactions(updated);
      return updated;
    });
    if (!user || id.startsWith('local-')) return;

    try {
      const response = await transactionService.updateTransaction(id, {
        title: updates.title,
        amount: updates.amount,
        category: updates.category,
        type: updates.type,
        date: updates.date,
        description: updates.description,
      });
      if (!response.success) throw new Error(response.message || 'Could not update transaction');
      toast({ title: 'Transaction Synced', description: 'Your changes are saved to the backend.' });
    } catch (error) {
      console.error('Backend transaction update failed:', error);
      toast({ title: 'Updated Locally', description: 'Backend unavailable. The local copy was updated.' });
    }
  };

  const deleteTransaction = async (id: string) => {
    setTransactions((current) => {
      const updated = current.filter((transaction) => transaction.id !== id);
      saveLocalTransactions(updated);
      return updated;
    });
    if (!user || id.startsWith('local-')) return;

    try {
      const response = await transactionService.deleteTransaction(id);
      if (!response.success) throw new Error(response.message || 'Could not delete transaction');
      toast({ title: 'Transaction Synced', description: 'The transaction was removed from your backend workspace.' });
    } catch (error) {
      console.error('Backend transaction delete failed:', error);
      toast({ title: 'Deleted Locally', description: 'Backend unavailable. The local copy was removed.' });
    }
  };

  const importTransactions = async (incoming: Omit<LocalTransaction, 'id'>[]) => {
    const imported = incoming.map((transaction, index) => ({ ...transaction, id: `import-${Date.now()}-${index}` }));
    setTransactions((current) => {
      const updated = [...imported, ...current];
      saveLocalTransactions(updated);
      return updated;
    });

    if (!user || imported.length === 0) return;
    try {
      const response = await transactionService.bulkCreateTransactions(imported.map(({ id: _id, ...transaction }) => toApiTransaction(transaction)));
      if (!response.success) throw new Error(response.message || 'Could not import transactions');
      await fetchTransactions();
      toast({ title: 'Import Synced', description: `${imported.length} transactions were sent to your backend workspace.` });
    } catch (error) {
      console.error('Backend transaction import failed:', error);
      toast({ title: 'Imported Locally', description: 'Backend unavailable. Imported rows remain in local storage.' });
    }
  };

  const syncTransactions = async () => {
    if (!user) return;
    try {
      const localTransactions = readLocalTransactions();
      if (localTransactions.length > 0) {
        await transactionService.bulkCreateTransactions(localTransactions.map(({ id: _id, ...transaction }) => toApiTransaction(transaction)));
      }
      await fetchTransactions();
      toast({ title: 'Sync Complete', description: 'Your local queue was sent to the backend.' });
    } catch (error) {
      console.error('Backend transaction sync failed:', error);
      toast({ title: 'Sync Failed', description: 'Could not sync right now. Your local data is safe.', variant: 'destructive' });
    }
  };

  return { transactions, loading, addTransaction, updateTransaction, deleteTransaction, importTransactions, syncTransactions, refetch: fetchTransactions };
};

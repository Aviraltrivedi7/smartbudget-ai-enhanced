import { apiRequest } from '@/lib/api';
import insforge, { isInsForgeConfigured } from '@/lib/insforge';

export interface Transaction {
  id?: string;
  title: string;
  amount: number;
  category: string;
  subcategory?: string;
  type: 'income' | 'expense';
  date: string;
  description?: string;
  paymentMethod?: string;
  tags?: string[];
  location?: {
    name: string;
    coordinates: [number, number];
  };
  receipt?: string;
  isRecurring?: boolean;
  recurringDetails?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    endDate?: string;
  };
  aiGenerated?: boolean;
  confidence?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransactionStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
}

export interface TransactionFilters {
  type?: 'income' | 'expense';
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
}

type InsForgeTransactionRow = {
  id: string;
  user_id: string;
  title: string;
  amount: number | string;
  category: string;
  subcategory?: string | null;
  type: 'income' | 'expense';
  date: string;
  description?: string | null;
  payment_method?: string | null;
  tags?: string[] | null;
  location?: { name?: string; coordinates?: [number, number] } | null;
  receipt?: string | null;
  is_recurring?: boolean | null;
  recurring_details?: Transaction['recurringDetails'] | null;
  ai_generated?: boolean | null;
  confidence?: number | string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type ServiceResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
};

const failure = <T = never>(message: string, error?: unknown): ServiceResponse<T> => ({
  success: false,
  message,
  error: error instanceof Error ? error.message : String(error || message),
});

const asRow = (value: unknown): InsForgeTransactionRow => value as InsForgeTransactionRow;

const fromInsForgeRow = (value: unknown): Transaction => {
  const row = asRow(value);
  return {
    id: row.id,
    title: row.title,
    amount: Number(row.amount),
    category: row.category || 'Other',
    subcategory: row.subcategory || undefined,
    type: row.type,
    date: row.date,
    description: row.description || undefined,
    paymentMethod: row.payment_method || undefined,
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    location: row.location?.name ? {
      name: row.location.name,
      coordinates: row.location.coordinates || [0, 0],
    } : undefined,
    receipt: row.receipt || undefined,
    isRecurring: Boolean(row.is_recurring),
    recurringDetails: row.recurring_details || undefined,
    aiGenerated: Boolean(row.ai_generated),
    confidence: row.confidence === null || row.confidence === undefined ? undefined : Number(row.confidence),
    createdAt: row.created_at || undefined,
    updatedAt: row.updated_at || undefined,
  };
};

const toInsForgeRow = (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>, userId: string) => ({
  user_id: userId,
  title: transaction.title,
  amount: Number(transaction.amount),
  category: transaction.category || 'Other',
  subcategory: transaction.subcategory || null,
  type: transaction.type,
  date: transaction.date,
  description: transaction.description || null,
  payment_method: transaction.paymentMethod || null,
  tags: transaction.tags || [],
  location: transaction.location || null,
  receipt: transaction.receipt || null,
  is_recurring: Boolean(transaction.isRecurring),
  recurring_details: transaction.recurringDetails || null,
  ai_generated: Boolean(transaction.aiGenerated),
  confidence: transaction.confidence ?? null,
});

const csvEscape = (value: unknown) => {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

class TransactionService {
  private async getInsForgeUserId() {
    if (!insforge) throw new Error('InsForge is not configured');
    const { data, error } = await insforge.auth.getCurrentUser();
    if (error || !data.user?.id) throw new Error(error?.message || 'Please sign in before managing transactions');
    return data.user.id;
  }

  private async getInsForgeTransactions(filters: TransactionFilters = {}): Promise<ServiceResponse<{ transactions: Transaction[]; total: number; page: number; totalPages: number }>> {
    if (!insforge) return failure('InsForge is not configured');
    try {
      const page = Math.max(1, filters.page || 1);
      const limit = Math.min(1000, Math.max(1, filters.limit || 100));
      const offset = (page - 1) * limit;
      let query = insforge.database
        .from('transactions')
        .select('*', { count: 'exact' })
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters.type) query = query.eq('type', filters.type);
      if (filters.category) query = query.eq('category', filters.category);
      if (filters.dateFrom) query = query.gte('date', filters.dateFrom);
      if (filters.dateTo) query = query.lte('date', filters.dateTo);
      if (filters.minAmount !== undefined) query = query.gte('amount', filters.minAmount);
      if (filters.maxAmount !== undefined) query = query.lte('amount', filters.maxAmount);
      if (filters.tags?.length) query = query.contains('tags', filters.tags);
      if (filters.search?.trim()) {
        const search = filters.search.trim().replace(/[(),]/g, ' ');
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error, count } = await query;
      if (error) return failure('Unable to load transactions from InsForge.', error);
      const transactions = (data || []).map(fromInsForgeRow);
      const total = count ?? transactions.length;
      return {
        success: true,
        message: 'Transactions loaded from your live DhanSetu workspace.',
        data: { transactions, total, page, totalPages: Math.max(1, Math.ceil(total / limit)) },
      };
    } catch (error) {
      return failure('Unable to load transactions from InsForge.', error);
    }
  }

  async getTransactions(filters: TransactionFilters = {}) {
    if (isInsForgeConfigured) return this.getInsForgeTransactions(filters);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) value.forEach(v => queryParams.append(key, v));
          else queryParams.append(key, value.toString());
        }
      });
      return await apiRequest<{ transactions: Transaction[]; total: number; page: number; totalPages: number }>(`/transactions?${queryParams.toString()}`, { method: 'GET', requireAuth: true });
    } catch (error) {
      return failure('Failed to fetch transactions', error);
    }
  }

  async getTransaction(id: string) {
    if (isInsForgeConfigured && insforge) {
      try {
        const { data, error } = await insforge.database.from('transactions').select('*').eq('id', id).maybeSingle();
        if (error || !data) return failure('Unable to load this transaction.', error);
        return { success: true, message: 'Transaction loaded.', data: fromInsForgeRow(data) };
      } catch (error) {
        return failure('Unable to load this transaction.', error);
      }
    }
    try {
      return await apiRequest<Transaction>(`/transactions/${id}`, { method: 'GET', requireAuth: true });
    } catch (error) {
      return failure('Failed to fetch transaction', error);
    }
  }

  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) {
    if (isInsForgeConfigured && insforge) {
      try {
        const userId = await this.getInsForgeUserId();
        const { data, error } = await insforge.database.from('transactions').insert(toInsForgeRow(transaction, userId)).select('*').single();
        if (error || !data) return failure('Unable to save transaction to InsForge.', error);
        return { success: true, message: 'Transaction saved to your live workspace.', data: fromInsForgeRow(data) };
      } catch (error) {
        return failure('Unable to save transaction to InsForge.', error);
      }
    }
    try {
      return await apiRequest<Transaction>('/transactions', { method: 'POST', body: transaction, requireAuth: true });
    } catch (error) {
      return failure('Failed to create transaction', error);
    }
  }

  async updateTransaction(id: string, transaction: Partial<Transaction>) {
    if (isInsForgeConfigured && insforge) {
      try {
        const updates: Record<string, unknown> = {};
        if (transaction.title !== undefined) updates.title = transaction.title;
        if (transaction.amount !== undefined) updates.amount = Number(transaction.amount);
        if (transaction.category !== undefined) updates.category = transaction.category;
        if (transaction.subcategory !== undefined) updates.subcategory = transaction.subcategory;
        if (transaction.type !== undefined) updates.type = transaction.type;
        if (transaction.date !== undefined) updates.date = transaction.date;
        if (transaction.description !== undefined) updates.description = transaction.description;
        if (transaction.paymentMethod !== undefined) updates.payment_method = transaction.paymentMethod;
        if (transaction.tags !== undefined) updates.tags = transaction.tags;
        if (transaction.location !== undefined) updates.location = transaction.location;
        if (transaction.isRecurring !== undefined) updates.is_recurring = transaction.isRecurring;
        if (transaction.recurringDetails !== undefined) updates.recurring_details = transaction.recurringDetails;
        if (transaction.aiGenerated !== undefined) updates.ai_generated = transaction.aiGenerated;
        if (transaction.confidence !== undefined) updates.confidence = transaction.confidence;
        const { data, error } = await insforge.database.from('transactions').update(updates).eq('id', id).select('*').single();
        if (error || !data) return failure('Unable to update this InsForge transaction.', error);
        return { success: true, message: 'Transaction updated in your live workspace.', data: fromInsForgeRow(data) };
      } catch (error) {
        return failure('Unable to update this InsForge transaction.', error);
      }
    }
    try {
      return await apiRequest<Transaction>(`/transactions/${id}`, { method: 'PUT', body: transaction, requireAuth: true });
    } catch (error) {
      return failure('Failed to update transaction', error);
    }
  }

  async deleteTransaction(id: string) {
    if (isInsForgeConfigured && insforge) {
      try {
        const { error } = await insforge.database.from('transactions').delete().eq('id', id);
        if (error) return failure('Unable to delete this InsForge transaction.', error);
        return { success: true, message: 'Transaction deleted from your live workspace.' };
      } catch (error) {
        return failure('Unable to delete this InsForge transaction.', error);
      }
    }
    try {
      return await apiRequest(`/transactions/${id}`, { method: 'DELETE', requireAuth: true });
    } catch (error) {
      return failure('Failed to delete transaction', error);
    }
  }

  async bulkCreateTransactions(transactions: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[]) {
    if (isInsForgeConfigured && insforge) {
      if (transactions.length === 0) return { success: true, message: 'No transactions to import.', data: { created: [], failed: [] } };
      try {
        const userId = await this.getInsForgeUserId();
        const { data, error } = await insforge.database.from('transactions').insert(transactions.map(transaction => toInsForgeRow(transaction, userId))).select('*');
        if (error) return failure('Unable to import transactions into InsForge.', error);
        return { success: true, message: 'Transactions imported into your live workspace.', data: { created: (data || []).map(fromInsForgeRow), failed: [] } };
      } catch (error) {
        return failure('Unable to import transactions into InsForge.', error);
      }
    }
    try {
      return await apiRequest<{ created: Transaction[]; failed: unknown[] }>('/transactions/bulk-import', { method: 'POST', body: { transactions }, requireAuth: true });
    } catch (error) {
      return failure('Failed to create transactions', error);
    }
  }

  async getTransactionStats(filters: Omit<TransactionFilters, 'page' | 'limit'> = {}) {
    if (isInsForgeConfigured) {
      const response = await this.getInsForgeTransactions({ ...filters, page: 1, limit: 1000 });
      if (!response.success || !response.data) return response as ServiceResponse<TransactionStats>;
      const rows = response.data.transactions;
      const totalIncome = rows.filter(item => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
      const totalExpenses = rows.filter(item => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
      const expenseByCategory = new Map<string, number>();
      rows.filter(item => item.type === 'expense').forEach(item => expenseByCategory.set(item.category, (expenseByCategory.get(item.category) || 0) + item.amount));
      const categoryBreakdown = [...expenseByCategory.entries()].map(([category, amount]) => ({ category, amount, percentage: totalExpenses ? (amount / totalExpenses) * 100 : 0 })).sort((a, b) => b.amount - a.amount);
      const monthly = new Map<string, { income: number; expenses: number }>();
      rows.forEach(item => {
        const month = item.date.slice(0, 7);
        const current = monthly.get(month) || { income: 0, expenses: 0 };
        if (item.type === 'income') current.income += item.amount;
        else current.expenses += item.amount;
        monthly.set(month, current);
      });
      return { success: true, message: 'Live transaction statistics calculated.', data: { totalIncome, totalExpenses, balance: totalIncome - totalExpenses, transactionCount: rows.length, categoryBreakdown, monthlyTrend: [...monthly.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, values]) => ({ month, ...values })) } };
    }
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') queryParams.append(key, Array.isArray(value) ? value.join(',') : value.toString());
      });
      return await apiRequest<TransactionStats>(`/transactions/stats?${queryParams.toString()}`, { method: 'GET', requireAuth: true });
    } catch (error) {
      return failure('Failed to fetch transaction statistics', error);
    }
  }

  async exportTransactions(format: 'csv' | 'excel' | 'pdf', filters: TransactionFilters = {}) {
    if (isInsForgeConfigured) {
      const response = await this.getInsForgeTransactions({ ...filters, page: 1, limit: 1000 });
      if (!response.success || !response.data) return response as ServiceResponse<{ downloadUrl: string }>;
      const headers = ['Title', 'Amount', 'Category', 'Type', 'Date', 'Description', 'Payment Method'];
      const lines = [headers.join(','), ...response.data.transactions.map(item => [item.title, item.amount, item.category, item.type, item.date, item.description, item.paymentMethod].map(csvEscape).join(','))];
      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
      return { success: true, message: `${format.toUpperCase()} export prepared in your browser.`, data: { downloadUrl: URL.createObjectURL(blob) } };
    }
    try {
      const queryParams = new URLSearchParams({ format });
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) value.forEach(v => queryParams.append(key, v));
          else queryParams.append(key, value.toString());
        }
      });
      return await apiRequest<{ downloadUrl: string }>(`/transactions/export?${queryParams.toString()}`, { method: 'GET', requireAuth: true });
    } catch (error) {
      return failure('Failed to export transactions', error);
    }
  }

  async aiCategorizeTransaction(description: string, amount: number) {
    if (isInsForgeConfigured) return failure('AI categorization is not configured for the InsForge workspace yet.');
    try {
      return await apiRequest<{ category: string; subcategory?: string; confidence: number; tags?: string[] }>('/ai/categorize-transaction', { method: 'POST', body: { description, amount }, requireAuth: true });
    } catch (error) {
      return failure('Failed to categorize transaction', error);
    }
  }

  async scanReceipt(receiptImage: File) {
    if (isInsForgeConfigured) return failure('Receipt scanning is handled by the local bill-scanner flow in this build.');
    try {
      const formData = new FormData();
      formData.append('receipt', receiptImage);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/transactions/scan-receipt`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }, body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
      return { success: true, message: data.message || 'Receipt scanned successfully', data: data.data || data };
    } catch (error: unknown) {
      return failure('Failed to scan receipt', error);
    }
  }
}

export const transactionService = new TransactionService();
export default transactionService;

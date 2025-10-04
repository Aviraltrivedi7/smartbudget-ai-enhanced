import { apiRequest } from '@/lib/api';

// Transaction Types
export interface Transaction {
  id?: string;
  title: string;
  amount: number;
  category: string;
  subcategory?: string;
  type: 'income' | 'expense';
  date: string;
  description?: string;
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

class TransactionService {
  // Get all transactions with filters
  async getTransactions(filters: TransactionFilters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const response = await apiRequest<{
        transactions: Transaction[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/transactions?${queryParams.toString()}`, {
        method: 'GET',
        requireAuth: true,
      });

      return response;
    } catch (error) {
      console.error('Get transactions error:', error);
      return {
        success: false,
        message: 'Failed to fetch transactions',
        error: 'Network error occurred',
      };
    }
  }

  // Get single transaction by ID
  async getTransaction(id: string) {
    try {
      const response = await apiRequest<Transaction>(`/transactions/${id}`, {
        method: 'GET',
        requireAuth: true,
      });

      return response;
    } catch (error) {
      console.error('Get transaction error:', error);
      return {
        success: false,
        message: 'Failed to fetch transaction',
        error: 'Network error occurred',
      };
    }
  }

  // Create new transaction
  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const response = await apiRequest<Transaction>('/transactions', {
        method: 'POST',
        body: transaction,
        requireAuth: true,
      });

      return response;
    } catch (error) {
      console.error('Create transaction error:', error);
      return {
        success: false,
        message: 'Failed to create transaction',
        error: 'Network error occurred',
      };
    }
  }

  // Update existing transaction
  async updateTransaction(id: string, transaction: Partial<Transaction>) {
    try {
      const response = await apiRequest<Transaction>(`/transactions/${id}`, {
        method: 'PUT',
        body: transaction,
        requireAuth: true,
      });

      return response;
    } catch (error) {
      console.error('Update transaction error:', error);
      return {
        success: false,
        message: 'Failed to update transaction',
        error: 'Network error occurred',
      };
    }
  }

  // Delete transaction
  async deleteTransaction(id: string) {
    try {
      const response = await apiRequest(`/transactions/${id}`, {
        method: 'DELETE',
        requireAuth: true,
      });

      return response;
    } catch (error) {
      console.error('Delete transaction error:', error);
      return {
        success: false,
        message: 'Failed to delete transaction',
        error: 'Network error occurred',
      };
    }
  }

  // Bulk create transactions
  async bulkCreateTransactions(transactions: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[]) {
    try {
      const response = await apiRequest<{ 
        created: Transaction[];
        failed: any[];
      }>('/transactions/bulk', {
        method: 'POST',
        body: { transactions },
        requireAuth: true,
      });

      return response;
    } catch (error) {
      console.error('Bulk create transactions error:', error);
      return {
        success: false,
        message: 'Failed to create transactions',
        error: 'Network error occurred',
      };
    }
  }

  // Get transaction statistics
  async getTransactionStats(filters: Omit<TransactionFilters, 'page' | 'limit'> = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const response = await apiRequest<TransactionStats>(`/transactions/stats?${queryParams.toString()}`, {
        method: 'GET',
        requireAuth: true,
      });

      return response;
    } catch (error) {
      console.error('Get transaction stats error:', error);
      return {
        success: false,
        message: 'Failed to fetch transaction statistics',
        error: 'Network error occurred',
      };
    }
  }

  // Export transactions
  async exportTransactions(format: 'csv' | 'excel' | 'pdf', filters: TransactionFilters = {}) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('format', format);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const response = await apiRequest<{ downloadUrl: string }>(`/transactions/export?${queryParams.toString()}`, {
        method: 'GET',
        requireAuth: true,
      });

      return response;
    } catch (error) {
      console.error('Export transactions error:', error);
      return {
        success: false,
        message: 'Failed to export transactions',
        error: 'Network error occurred',
      };
    }
  }

  // AI categorization
  async aiCategorizeTransaction(description: string, amount: number) {
    try {
      const response = await apiRequest<{
        category: string;
        subcategory?: string;
        confidence: number;
        tags?: string[];
      }>('/ai/categorize-transaction', {
        method: 'POST',
        body: { description, amount },
        requireAuth: true,
      });

      return response;
    } catch (error) {
      console.error('AI categorize transaction error:', error);
      return {
        success: false,
        message: 'Failed to categorize transaction',
        error: 'Network error occurred',
      };
    }
  }

  // OCR receipt scanning
  async scanReceipt(receiptImage: File) {
    try {
      const formData = new FormData();
      formData.append('receipt', receiptImage);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/transactions/scan-receipt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        message: data.message || 'Receipt scanned successfully',
        data: data.data || data,
      };

    } catch (error: any) {
      console.error('Scan receipt error:', error);
      return {
        success: false,
        message: 'Failed to scan receipt',
        error: error.message || 'Network error occurred',
      };
    }
  }
}

// Export singleton instance
export const transactionService = new TransactionService();
export default transactionService;
import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const demoTransactionsByUser = new Map();

const getTransactionsForUser = (req) => {
  const userId = String(req.userId || 'guest');
  if (!demoTransactionsByUser.has(userId)) demoTransactionsByUser.set(userId, []);
  return demoTransactionsByUser.get(userId);
};

const generateId = (transactions) => {
  const numericIds = transactions.map((transaction) => Number(transaction.id)).filter(Number.isFinite);
  return String((numericIds.length ? Math.max(...numericIds) : 0) + 1);
};

const sendValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  return true;
};

const filterTransactions = (transactions, filters = {}) => {
  const { type, category, dateFrom, dateTo, startDate, endDate, search, minAmount, maxAmount } = filters;
  const normalizedStart = dateFrom || startDate;
  const normalizedEnd = dateTo || endDate;
  let filtered = [...transactions];

  if (type) filtered = filtered.filter((transaction) => transaction.type === type);
  if (category) filtered = filtered.filter((transaction) => String(transaction.category || '').toLowerCase().includes(String(category).toLowerCase()));
  if (search) {
    const searchTerm = String(search).toLowerCase();
    filtered = filtered.filter((transaction) => [transaction.title, transaction.description, transaction.category].some((value) => String(value || '').toLowerCase().includes(searchTerm)));
  }
  if (minAmount !== undefined && minAmount !== '') filtered = filtered.filter((transaction) => Number(transaction.amount) >= Number(minAmount));
  if (maxAmount !== undefined && maxAmount !== '') filtered = filtered.filter((transaction) => Number(transaction.amount) <= Number(maxAmount));
  if (normalizedStart) filtered = filtered.filter((transaction) => new Date(transaction.date) >= new Date(String(normalizedStart)));
  if (normalizedEnd) {
    const end = new Date(String(normalizedEnd));
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(normalizedEnd))) end.setHours(23, 59, 59, 999);
    filtered = filtered.filter((transaction) => new Date(transaction.date) <= end);
  }

  return filtered;
};

const monthKey = (date) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? 'unknown' : parsed.toISOString().slice(0, 7);
};

const csvCell = (value) => {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const buildCsv = (transactions) => {
  const headers = ['Date', 'Title', 'Category', 'Type', 'Amount', 'Description'];
  const rows = transactions.map((transaction) => [transaction.date, transaction.title, transaction.category, transaction.type, transaction.amount, transaction.description || '']);
  return [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
};

router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const pageNumber = Number(page);
    const pageSize = Number(limit);
    if (!Number.isInteger(pageNumber) || pageNumber < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
      return res.status(400).json({ success: false, message: 'Page and limit must be valid positive integers; limit cannot exceed 100' });
    }

    const filtered = filterTransactions(getTransactionsForUser(req), req.query);
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const startIndex = (pageNumber - 1) * pageSize;
    const transactions = filtered.slice(startIndex, startIndex + pageSize);

    return res.json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: { transactions, total: filtered.length, page: pageNumber, totalPages: Math.ceil(filtered.length / pageSize) },
    });
  } catch (error) {
    console.error('Get demo transactions error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching transactions' });
  }
});

router.get('/stats', (req, res) => {
  const transactions = filterTransactions(getTransactionsForUser(req), req.query);
  const totalIncome = transactions.filter((transaction) => transaction.type === 'income').reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const totalExpenses = transactions.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const categoryTotals = transactions.filter((transaction) => transaction.type === 'expense').reduce((totals, transaction) => {
    totals[transaction.category] = (totals[transaction.category] || 0) + Number(transaction.amount);
    return totals;
  }, {});
  const categoryBreakdown = Object.entries(categoryTotals).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalExpenses > 0 ? Number(((Number(amount) / totalExpenses) * 100).toFixed(2)) : 0,
  })).sort((a, b) => b.amount - a.amount);
  const monthlyTotals = transactions.reduce((totals, transaction) => {
    const key = monthKey(transaction.date);
    if (key === 'unknown') return totals;
    if (!totals[key]) totals[key] = { month: key, income: 0, expenses: 0 };
    totals[key][transaction.type === 'income' ? 'income' : 'expenses'] += Number(transaction.amount);
    return totals;
  }, {});

  return res.json({
    success: true,
    message: 'Transaction statistics retrieved successfully',
    data: {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      transactionCount: transactions.length,
      categoryBreakdown,
      monthlyTrend: Object.values(monthlyTotals).sort((a, b) => a.month.localeCompare(b.month)),
    },
  });
});

router.get('/export', (req, res) => {
  const format = String(req.query.format || 'csv').toLowerCase();
  if (format !== 'csv') return res.status(400).json({ success: false, message: 'Only CSV export is currently supported' });
  const csv = buildCsv(filterTransactions(getTransactionsForUser(req), req.query));
  return res.json({ success: true, message: 'Transactions exported successfully', data: { downloadUrl: `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}` } });
});

router.post('/scan-receipt', (_req, res) => res.status(503).json({
  success: false,
  message: 'Receipt OCR is not configured in demo mode. Add the transaction manually or configure an approved OCR provider.',
}));

router.get('/:id([0-9]+)', (req, res) => {
  const transaction = getTransactionsForUser(req).find((item) => item.id === req.params.id);
  if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
  return res.json({ success: true, message: 'Transaction retrieved successfully', data: transaction });
});

router.post('/', [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('date').optional().isISO8601().withMessage('Date must be valid'),
], (req, res) => {
  if (sendValidationErrors(req, res)) return;
  const transactions = getTransactionsForUser(req);
  const newTransaction = {
    id: generateId(transactions),
    ...req.body,
    amount: Number(req.body.amount),
    date: req.body.date || new Date().toISOString().split('T')[0],
    aiGenerated: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  transactions.push(newTransaction);
  req.app.get('io')?.to(`user_${req.userId || 'guest'}`).emit('transaction_added', newTransaction);
  return res.status(201).json({ success: true, message: 'Transaction created successfully', data: newTransaction });
});

router.put('/:id([0-9]+)', [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('date').optional().isISO8601().withMessage('Date must be valid'),
], (req, res) => {
  if (sendValidationErrors(req, res)) return;
  const transactions = getTransactionsForUser(req);
  const index = transactions.findIndex((transaction) => transaction.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Transaction not found' });
  const updatedTransaction = {
    ...transactions[index],
    ...req.body,
    amount: req.body.amount === undefined ? transactions[index].amount : Number(req.body.amount),
    updatedAt: new Date().toISOString(),
  };
  transactions[index] = updatedTransaction;
  req.app.get('io')?.to(`user_${req.userId || 'guest'}`).emit('transaction_updated', updatedTransaction);
  return res.json({ success: true, message: 'Transaction updated successfully', data: updatedTransaction });
});

router.delete('/:id([0-9]+)', (req, res) => {
  const transactions = getTransactionsForUser(req);
  const index = transactions.findIndex((transaction) => transaction.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Transaction not found' });
  transactions.splice(index, 1);
  req.app.get('io')?.to(`user_${req.userId || 'guest'}`).emit('transaction_deleted', { id: req.params.id });
  return res.json({ success: true, message: 'Transaction deleted successfully' });
});

router.post('/bulk-import', [
  body('transactions').isArray({ min: 1 }).withMessage('Transactions array is required'),
], (req, res) => {
  if (sendValidationErrors(req, res)) return;
  const transactions = getTransactionsForUser(req);
  const created = [];
  const failed = [];

  req.body.transactions.forEach((input, index) => {
    const amount = Number(input?.amount);
    const type = input?.type;
    const title = String(input?.title || '').trim();
    const category = String(input?.category || '').trim();
    const date = input?.date || new Date().toISOString().split('T')[0];
    const validDate = !Number.isNaN(new Date(date).getTime());
    if (!title || !category || !Number.isFinite(amount) || amount <= 0 || !['income', 'expense'].includes(type) || !validDate) {
      failed.push({ index, message: 'Each row needs a title, positive amount, category, valid type, and valid date' });
      return;
    }
    const imported = {
      id: generateId([...transactions, ...created]),
      ...input,
      title,
      category,
      type,
      amount,
      date,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    created.push(imported);
  });

  transactions.push(...created);
  return res.status(created.length ? 201 : 400).json({
    success: created.length > 0,
    message: `Imported ${created.length} transactions${failed.length ? `; ${failed.length} failed` : ''}`,
    data: { created, failed },
  });
});

export default router;

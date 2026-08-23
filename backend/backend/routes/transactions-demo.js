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

router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 100, type, category, dateFrom, dateTo, search, minAmount, maxAmount } = req.query;
    let filtered = [...getTransactionsForUser(req)];

    if (type) filtered = filtered.filter((transaction) => transaction.type === type);
    if (category) filtered = filtered.filter((transaction) => transaction.category.toLowerCase().includes(String(category).toLowerCase()));
    if (search) filtered = filtered.filter((transaction) => transaction.title.toLowerCase().includes(String(search).toLowerCase()) || transaction.description?.toLowerCase().includes(String(search).toLowerCase()));
    if (minAmount) filtered = filtered.filter((transaction) => transaction.amount >= Number(minAmount));
    if (maxAmount) filtered = filtered.filter((transaction) => transaction.amount <= Number(maxAmount));
    if (dateFrom) filtered = filtered.filter((transaction) => new Date(transaction.date) >= new Date(String(dateFrom)));
    if (dateTo) filtered = filtered.filter((transaction) => new Date(transaction.date) <= new Date(String(dateTo)));

    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const pageNumber = Number(page);
    const pageSize = Number(limit);
    const startIndex = (pageNumber - 1) * pageSize;
    const transactions = filtered.slice(startIndex, startIndex + pageSize);

    res.json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: { transactions, total: filtered.length, page: pageNumber, totalPages: Math.ceil(filtered.length / pageSize) },
    });
  } catch (error) {
    console.error('Get demo transactions error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching transactions' });
  }
});

router.get('/stats', (req, res) => {
  const transactions = getTransactionsForUser(req);
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
  }));

  res.json({
    success: true,
    message: 'Transaction statistics retrieved successfully',
    data: {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      transactionCount: transactions.length,
      categoryBreakdown,
      monthlyTrend: [],
    },
  });
});

router.get('/:id([0-9]+)', (req, res) => {
  const transaction = getTransactionsForUser(req).find((item) => item.id === req.params.id);
  if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
  res.json({ success: true, message: 'Transaction retrieved successfully', data: transaction });
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
  res.status(201).json({ success: true, message: 'Transaction created successfully', data: newTransaction });
});

router.put('/:id([0-9]+)', [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
], (req, res) => {
  if (sendValidationErrors(req, res)) return;
  const transactions = getTransactionsForUser(req);
  const index = transactions.findIndex((transaction) => transaction.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Transaction not found' });
  const updatedTransaction = { ...transactions[index], ...req.body, amount: req.body.amount === undefined ? transactions[index].amount : Number(req.body.amount), updatedAt: new Date().toISOString() };
  transactions[index] = updatedTransaction;
  req.app.get('io')?.to(`user_${req.userId || 'guest'}`).emit('transaction_updated', updatedTransaction);
  res.json({ success: true, message: 'Transaction updated successfully', data: updatedTransaction });
});

router.delete('/:id([0-9]+)', (req, res) => {
  const transactions = getTransactionsForUser(req);
  const index = transactions.findIndex((transaction) => transaction.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Transaction not found' });
  transactions.splice(index, 1);
  req.app.get('io')?.to(`user_${req.userId || 'guest'}`).emit('transaction_deleted', { id: req.params.id });
  res.json({ success: true, message: 'Transaction deleted successfully' });
});

router.post('/bulk-import', [
  body('transactions').isArray({ min: 1 }).withMessage('Transactions array is required'),
], (req, res) => {
  if (sendValidationErrors(req, res)) return;
  const transactions = getTransactionsForUser(req);
  const imported = req.body.transactions.map((transaction) => ({
    id: generateId([...transactions, ...req.body.transactions]),
    ...transaction,
    amount: Number(transaction.amount),
    date: transaction.date || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  transactions.push(...imported);
  res.status(201).json({ success: true, message: `Imported ${imported.length} transactions`, data: { successful: imported.map((transaction) => transaction.id), failed: [], total: imported.length } });
});

export default router;

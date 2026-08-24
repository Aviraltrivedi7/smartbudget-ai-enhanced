import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import multer from 'multer';

const router = express.Router();
const receiptUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    callback(null, /^image\/(jpeg|png|webp|heic)$/i.test(file.mimetype));
  },
});

const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const transactionToExportRow = (transaction) => ({
  title: transaction.title,
  amount: transaction.amount,
  type: transaction.type,
  category: transaction.category?.name || 'Other',
  date: transaction.date instanceof Date ? transaction.date.toISOString().slice(0, 10) : transaction.date,
  description: transaction.description || '',
  paymentMethod: transaction.paymentMethod || '',
});

const buildCsv = (transactions) => {
  const headers = ['title', 'amount', 'type', 'category', 'date', 'description', 'paymentMethod'];
  return [headers, ...transactions.map(transactionToExportRow).map((row) => headers.map((header) => row[header]))]
    .map((row) => row.map(csvCell).join(','))
    .join('\n');
};

const CATEGORY_ALIASES = {
  food: ['Food', 'Food & Dining'],
  rent: ['Rent', 'Housing', 'Rental'],
  utilities: ['Utilities'],
  travel: ['Travel', 'Transportation'],
  savings: ['Savings', 'Savings / Buffer', 'Investments'],
  other: ['Other', 'Other Income'],
};

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
const categoryPatternFor = (label) => {
  const normalized = String(label || '').trim().toLowerCase();
  const candidates = [...new Set([String(label || '').trim(), ...(CATEGORY_ALIASES[normalized] || [])])].filter(Boolean);
  return `^(?:${candidates.map(escapeRegex).join('|')})$`;
};

const findCategory = async (userId, type, label, { createFallback = false } = {}) => {
  const normalizedLabel = String(label || '').trim();
  const selector = /^[0-9a-fA-F]{24}$/.test(normalizedLabel)
    ? { _id: normalizedLabel }
    : { name: { $regex: categoryPatternFor(normalizedLabel), $options: 'i' } };
  const category = await Category.findOne({
    ...selector,
    $or: [{ userId }, { isDefault: true, userId: null }],
    type,
    isActive: true,
  });
  if (category || !createFallback) return category;

  const normalized = normalizedLabel;
  if (!['other', 'savings', 'savings / buffer'].includes(normalized.toLowerCase())) return null;
  return Category.create({
    name: normalized,
    icon: normalized.toLowerCase().startsWith('saving') ? '🎯' : '📦',
    color: normalized.toLowerCase().startsWith('saving') ? '#5867bb' : '#8a94a6',
    type,
    userId,
    isDefault: false,
    metadata: { aliases: CATEGORY_ALIASES[normalized.toLowerCase()] || [] },
  });
};

const findCategoryIds = async (userId, label) => {
  const normalizedLabel = String(label || '').trim();
  const selector = /^[0-9a-fA-F]{24}$/.test(normalizedLabel)
    ? { _id: normalizedLabel }
    : { name: { $regex: categoryPatternFor(normalizedLabel), $options: 'i' } };
  const categories = await Category.find({
    ...selector,
    $or: [{ userId }, { isDefault: true, userId: null }],
    isActive: true,
  }).select('_id').lean();
  return categories.map((category) => category._id);
};

// @desc    Get all transactions for user
// @route   GET /api/transactions
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
  query('dateFrom').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  query('dateTo').optional().isISO8601().withMessage('End date must be valid ISO date'),
  query('minAmount').optional().isFloat({ min: 0 }).withMessage('Minimum amount must be valid'),
  query('maxAmount').optional().isFloat({ min: 0 }).withMessage('Maximum amount must be valid'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 20,
      type,
      category,
      startDate,
      endDate,
      dateFrom,
      dateTo,
      search,
      minAmount,
      maxAmount,
      paymentMethod,
      tags,
      sort = '-date'
    } = req.query;

    const normalizedStartDate = startDate || dateFrom;
    const normalizedEndDate = endDate || dateTo;

    // Build filters using the same names and semantics as the frontend service.
    const filters = {};
    if (type) filters.type = type;
    if (category) {
      filters.categoryIds = await findCategoryIds(req.userId, category);
      if (filters.categoryIds.length === 0) filters.categoryIds = [null];
    }
    if (normalizedStartDate || normalizedEndDate) {
      if (normalizedStartDate) filters.startDate = normalizedStartDate;
      if (normalizedEndDate) filters.endDate = normalizedEndDate;
    }
    if (minAmount !== undefined || maxAmount !== undefined) {
      if (minAmount !== undefined) filters.minAmount = parseFloat(minAmount);
      if (maxAmount !== undefined) filters.maxAmount = parseFloat(maxAmount);
    }
    if (paymentMethod) filters.paymentMethod = paymentMethod;
    if (search) filters.search = search;
    if (tags) filters.tags = Array.isArray(tags) ? tags : [tags];

    // Pagination options
    const options = {
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
      sort: sort
    };

    const transactions = await Transaction.findWithFilters(req.userId, filters, options);
    const totalTransactions = await Transaction.countDocuments(Transaction.buildFilterQuery(req.userId, filters));
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const totalPages = Math.ceil(totalTransactions / pageSize);

    res.json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: {
        transactions,
        total: totalTransactions,
        page: pageNumber,
        totalPages,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalTransactions,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1
        }
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching transactions'
    });
  }
});

// @desc    Get transaction statistics (compatibility endpoint for the frontend)
// @route   GET /api/transactions/stats
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const startDate = req.query.startDate || req.query.dateFrom || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = req.query.endDate || req.query.dateTo || new Date();
    const type = req.query.type;
    if (type && !['income', 'expense'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Type must be income or expense' });
    }
    const analyticsFilters = type ? { type } : {};
    let categoryIds;
    if (req.query.category) {
      categoryIds = await findCategoryIds(req.userId, req.query.category);
      if (categoryIds.length === 0) categoryIds = [null];
      analyticsFilters.category = { $in: categoryIds };
    }
    const analytics = await Transaction.getAnalytics(req.userId, startDate, endDate, analyticsFilters);
    const categoryAnalytics = type === 'income' ? [] : await Transaction.getCategoryAnalytics(req.userId, startDate, endDate, 'expense', categoryIds ? { category: { $in: categoryIds } } : {});
    const totals = analytics.reduce((acc, item) => {
      if (item._id === 'income') {
        acc.totalIncome = item.totalAmount;
      } else if (item._id === 'expense') {
        acc.totalExpenses = item.totalAmount;
      }
      return acc;
    }, { totalIncome: 0, totalExpenses: 0 });
    const balance = totals.totalIncome - totals.totalExpenses;
    const categoryBreakdown = categoryAnalytics.map((item) => ({
      category: item.categoryName || 'Other',
      amount: Number(item.totalAmount || 0),
      percentage: totals.totalExpenses > 0 ? Number(((Number(item.totalAmount || 0) / totals.totalExpenses) * 100).toFixed(2)) : 0,
    }));
    const monthlyTrendMap = new Map();
    analytics.forEach((item) => {
      (item.monthlyData || []).forEach((month) => {
        const monthKey = `${month.year}-${String(month.month).padStart(2, '0')}`;
        const current = monthlyTrendMap.get(monthKey) || { month: monthKey, income: 0, expenses: 0 };
        current[item._id === 'income' ? 'income' : 'expenses'] += Number(month.total || 0);
        monthlyTrendMap.set(monthKey, current);
      });
    });
    const monthlyTrend = [...monthlyTrendMap.values()].sort((a, b) => a.month.localeCompare(b.month));
    res.json({
      success: true,
      message: 'Transaction statistics retrieved successfully',
      data: {
        totalIncome: Number(totals.totalIncome || 0),
        totalExpenses: Number(totals.totalExpenses || 0),
        balance: Number(balance || 0),
        transactionCount: analytics.reduce((sum, item) => sum + (item.totalCount || 0), 0),
        categoryBreakdown,
        monthlyTrend,
      },
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching transaction statistics' });
  }
});

// @desc    Export the user's transactions
// @route   GET /api/transactions/export
// @access  Private
router.get('/export', async (req, res) => {
  try {
    const format = String(req.query.format || 'csv').toLowerCase();
    if (format !== 'csv') {
      return res.status(400).json({ success: false, message: 'Only CSV export is currently supported' });
    }

    const filters = {};
    const type = req.query.type;
    const category = req.query.category;
    const startDate = req.query.dateFrom || req.query.startDate;
    const endDate = req.query.dateTo || req.query.endDate;
    if (type) filters.type = type;
    if (category) {
      filters.categoryIds = await findCategoryIds(req.userId, category);
      if (filters.categoryIds.length === 0) filters.categoryIds = [null];
    }
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    const transactions = await Transaction.findWithFilters(req.userId, filters, { limit: 10000, sort: '-date' });
    const csv = buildCsv(transactions);
    return res.json({
      success: true,
      message: 'Transactions exported successfully',
      data: { downloadUrl: `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}` },
    });
  } catch (error) {
    console.error('Export transactions error:', error);
    return res.status(500).json({ success: false, message: 'Server error while exporting transactions' });
  }
});

// @desc    Accept a receipt upload only when an OCR provider is configured
// @route   POST /api/transactions/scan-receipt
// @access  Private
router.post('/scan-receipt', receiptUpload.single('receipt'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'A JPEG, PNG, WEBP, or HEIC receipt image is required' });
  }
  return res.status(503).json({
    success: false,
    message: 'Receipt OCR is not configured on this deployment. Add an approved OCR provider before scanning receipts.',
  });
});

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
router.get('/:id([0-9a-fA-F]{24})', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.userId,
      isDeleted: false
    })
    .populate('category', 'name icon color type')
    .populate('budget', 'name amount period')
    .populate('goal', 'title targetAmount currentAmount');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching transaction'
    });
  }
});

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
router.post('/', [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('paymentMethod').optional().isIn(['cash', 'card', 'bank_transfer', 'upi', 'wallet', 'other']).withMessage('Invalid payment method'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('location').optional().isObject().withMessage('Location must be an object'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      amount,
      type,
      category,
      date,
      description,
      paymentMethod,
      tags,
      location,
      currency,
      exchangeRate,
      recurring
    } = req.body;

    // Accept a Mongo category ID or a frontend display label/alias.
    const categoryDoc = await findCategory(req.userId, type, category, { createFallback: true });

    if (!categoryDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category for this transaction type'
      });
    }

    // Create transaction
    const transaction = new Transaction({
      userId: req.userId,
      title,
      amount: parseFloat(amount),
      type,
      category: categoryDoc._id,
      date: new Date(date),
      description,
      paymentMethod,
      tags,
      location,
      currency: currency || 'INR',
      exchangeRate: exchangeRate || 1,
      recurring: recurring || { isRecurring: false },
      metadata: {
        source: 'manual',
        confidence: 1
      }
    });

    await transaction.save();

    // Update category usage
    await categoryDoc.updateUsage(parseFloat(amount));

    // Add points to user for logging transaction
    const user = await User.findById(req.userId);
    if (user) {
      await user.addPoints(5, 'Transaction logged');
    }

    // Populate transaction for response
    await transaction.populate('category', 'name icon color type');

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });

  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating transaction'
    });
  }
});

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
router.put('/:id([0-9a-fA-F]{24})', [
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be less than 200 characters'),
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
      body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('paymentMethod').optional().isIn(['cash', 'card', 'bank_transfer', 'upi', 'wallet', 'other']).withMessage('Invalid payment method'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.userId,
      isDeleted: false
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const updates = req.body;

    // If category is being updated, resolve either a category ID or its display name.
    if (updates.category) {
      const type = updates.type || transaction.type;
      const categoryDoc = await findCategory(req.userId, type, updates.category, { createFallback: true });

      if (!categoryDoc) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category for this transaction type'
        });
      }
      updates.category = categoryDoc._id;
    }

    // Update transaction
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        if (key === 'amount') {
          transaction[key] = parseFloat(updates[key]);
        } else if (key === 'date') {
          transaction[key] = new Date(updates[key]);
        } else {
          transaction[key] = updates[key];
        }
      }
    });

    await transaction.save();
    await transaction.populate('category', 'name icon color type');

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction
    });

  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating transaction'
    });
  }
});

// @desc    Delete transaction (soft delete)
// @route   DELETE /api/transactions/:id
// @access  Private
router.delete('/:id([0-9a-fA-F]{24})', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.userId,
      isDeleted: false
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await transaction.softDelete();

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });

  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting transaction'
    });
  }
});

// @desc    Get transaction analytics
// @route   GET /api/transactions/analytics/overview
// @access  Private
router.get('/analytics/overview', [
  query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const startDate = req.query.startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = req.query.endDate || new Date();

    // Get basic analytics
    const analytics = await Transaction.getAnalytics(req.userId, startDate, endDate);
    
    // Get category breakdown
    const categoryAnalytics = await Transaction.getCategoryAnalytics(req.userId, startDate, endDate, 'expense');

    // Get recent transactions
    const recentTransactions = await Transaction.find({
      userId: req.userId,
      isDeleted: false,
      status: 'completed'
    })
    .populate('category', 'name icon color')
    .sort({ createdAt: -1 })
    .limit(5);

    // Calculate totals
    const totals = analytics.reduce((acc, item) => {
      if (item._id === 'income') {
        acc.totalIncome = item.totalAmount;
        acc.incomeCount = item.totalCount;
      } else if (item._id === 'expense') {
        acc.totalExpenses = item.totalAmount;
        acc.expenseCount = item.totalCount;
      }
      return acc;
    }, { totalIncome: 0, totalExpenses: 0, incomeCount: 0, expenseCount: 0 });

    const balance = totals.totalIncome - totals.totalExpenses;
    const savingsRate = totals.totalIncome > 0 ? ((balance / totals.totalIncome) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalIncome: totals.totalIncome,
          totalExpenses: totals.totalExpenses,
          balance: balance,
          savingsRate: parseFloat(savingsRate),
          transactionCount: totals.incomeCount + totals.expenseCount
        },
        monthlyData: analytics,
        categoryBreakdown: categoryAnalytics,
        recentTransactions,
        dateRange: { startDate, endDate }
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics'
    });
  }
});

// @desc    Get spending trends
// @route   GET /api/transactions/analytics/trends
// @access  Private
router.get('/analytics/trends', async (req, res) => {
  try {
    const { period = '6months' } = req.query;
    
    let months = 6;
    if (period === '3months') months = 3;
    else if (period === '12months') months = 12;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const trends = await Transaction.aggregate([
      {
        $match: {
          userId: req.userId,
          date: { $gte: startDate },
          isDeleted: false,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$baseAmount' },
          count: { $sum: 1 },
          avg: { $avg: '$baseAmount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      success: true,
      data: { trends }
    });

  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trends'
    });
  }
});

// @desc    Bulk import transactions
// @route   POST /api/transactions/bulk-import
// @access  Private
router.post('/bulk-import', [
  body('transactions').isArray({ min: 1 }).withMessage('Transactions array is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { transactions: importTransactions } = req.body;
    const created = [];
    const failed = [];

    for (let i = 0; i < importTransactions.length; i += 1) {
      const txn = importTransactions[i] || {};
      try {
        const amount = Number(txn.amount);
        const title = String(txn.title || '').trim();
        const type = txn.type;
        const date = txn.date ? new Date(txn.date) : new Date();
        if (!title || !Number.isFinite(amount) || amount <= 0 || !['income', 'expense'].includes(type) || Number.isNaN(date.getTime())) {
          failed.push({ index: i, transaction: txn, error: 'Each row needs a title, positive amount, valid type, and valid date' });
          continue;
        }

        let categoryDoc = txn.category ? await findCategory(req.userId, type, txn.category) : null;
        if (!categoryDoc) {
          const suggestedCategories = await Category.suggestCategory(title, txn.description, amount, type);
          categoryDoc = suggestedCategories[0] || null;
        }
        if (!categoryDoc) {
          failed.push({ index: i, transaction: txn, error: 'No suitable category found' });
          continue;
        }

        const transaction = new Transaction({
          userId: req.userId,
          title,
          amount,
          type,
          category: categoryDoc._id,
          date,
          description: txn.description,
          paymentMethod: txn.paymentMethod || 'other',
          tags: Array.isArray(txn.tags) ? txn.tags : [],
          metadata: { source: 'import', confidence: 0.8, importDetails: { importId: `${Date.now()}-${i}`, originalData: txn } },
        });
        await transaction.save();
        await transaction.populate('category', 'name icon color type');
        created.push(transaction);
      } catch (error) {
        failed.push({ index: i, transaction: txn, error: error.message });
      }
    }

    if (created.length > 0) {
      const user = await User.findById(req.userId);
      if (user) await user.addPoints(created.length * 2, 'Bulk import');
    }

    return res.status(created.length ? 201 : 400).json({
      success: created.length > 0,
      message: `Import completed. ${created.length} created, ${failed.length} failed.`,
      data: { created, failed },
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during bulk import'
    });
  }
});

export default router;
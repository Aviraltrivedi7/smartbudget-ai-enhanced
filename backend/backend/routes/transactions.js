import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Get all transactions for user
// @route   GET /api/transactions
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
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

    const {
      page = 1,
      limit = 20,
      type,
      category,
      startDate,
      endDate,
      search,
      minAmount,
      maxAmount,
      paymentMethod,
      tags,
      sort = '-date'
    } = req.query;

    // Build filters
    const filters = {};
    if (type) filters.type = type;
    if (category) filters.category = category;
    if (startDate || endDate) {
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
    }
    if (minAmount || maxAmount) {
      if (minAmount) filters.minAmount = parseFloat(minAmount);
      if (maxAmount) filters.maxAmount = parseFloat(maxAmount);
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
    const totalTransactions = await Transaction.countDocuments({
      userId: req.userId,
      isDeleted: false
    });

    const totalPages = Math.ceil(totalTransactions / parseInt(limit));

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalTransactions,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
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

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
router.get('/:id', async (req, res) => {
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
      data: { transaction }
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
  body('category').isMongoId().withMessage('Valid category ID is required'),
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

    // Verify category belongs to user or is default
    const categoryDoc = await Category.findOne({
      _id: category,
      $or: [
        { userId: req.userId },
        { isDefault: true, userId: null }
      ],
      type: type,
      isActive: true
    });

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
      category,
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
      data: { transaction }
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
router.put('/:id', [
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be less than 200 characters'),
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').optional().isMongoId().withMessage('Valid category ID is required'),
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

    // If category is being updated, verify it's valid
    if (updates.category) {
      const type = updates.type || transaction.type;
      const categoryDoc = await Category.findOne({
        _id: updates.category,
        $or: [
          { userId: req.userId },
          { isDefault: true, userId: null }
        ],
        type: type,
        isActive: true
      });

      if (!categoryDoc) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category for this transaction type'
        });
      }
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
      data: { transaction }
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
router.delete('/:id', async (req, res) => {
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
  body('transactions.*.title').trim().isLength({ min: 1 }).withMessage('Each transaction must have a title'),
  body('transactions.*.amount').isFloat({ min: 0.01 }).withMessage('Each transaction must have a valid amount'),
  body('transactions.*.type').isIn(['income', 'expense']).withMessage('Each transaction must have a valid type'),
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
    const results = {
      successful: [],
      failed: [],
      total: importTransactions.length
    };

    for (let i = 0; i < importTransactions.length; i++) {
      try {
        const txn = importTransactions[i];
        
        // Find or suggest category
        let categoryId = txn.category;
        if (!categoryId) {
          const suggestedCategories = await Category.suggestCategory(
            txn.title, 
            txn.description, 
            txn.amount, 
            txn.type
          );
          categoryId = suggestedCategories.length > 0 ? suggestedCategories[0]._id : null;
        }

        if (!categoryId) {
          results.failed.push({
            index: i,
            transaction: txn,
            error: 'No suitable category found'
          });
          continue;
        }

        const transaction = new Transaction({
          userId: req.userId,
          title: txn.title,
          amount: parseFloat(txn.amount),
          type: txn.type,
          category: categoryId,
          date: txn.date ? new Date(txn.date) : new Date(),
          description: txn.description,
          paymentMethod: txn.paymentMethod || 'other',
          metadata: {
            source: 'import',
            confidence: 0.8,
            importDetails: {
              importId: new Date().getTime().toString(),
              originalData: txn
            }
          }
        });

        await transaction.save();
        results.successful.push(transaction._id);

      } catch (error) {
        results.failed.push({
          index: i,
          transaction: importTransactions[i],
          error: error.message
        });
      }
    }

    // Award points for bulk import
    if (results.successful.length > 0) {
      const user = await User.findById(req.userId);
      if (user) {
        await user.addPoints(results.successful.length * 2, 'Bulk import');
      }
    }

    res.json({
      success: true,
      message: `Import completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
      data: results
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
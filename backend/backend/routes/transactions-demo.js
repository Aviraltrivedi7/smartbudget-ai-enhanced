import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Demo transactions storage (in-memory) - Starting with empty data
let demoTransactions = [
  // No initial transactions - all amounts start at 0
  // Users can add their own transactions
];

// Generate new ID
const generateId = () => {
  return (demoTransactions.length + 1).toString();
};

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private (demo)
router.get('/', (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 100, 
      type, 
      category, 
      dateFrom, 
      dateTo,
      search,
      minAmount,
      maxAmount 
    } = req.query;

    let filteredTransactions = [...demoTransactions];

    // Apply filters
    if (type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === type);
    }

    if (category) {
      filteredTransactions = filteredTransactions.filter(t => 
        t.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (search) {
      filteredTransactions = filteredTransactions.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (minAmount) {
      filteredTransactions = filteredTransactions.filter(t => t.amount >= Number(minAmount));
    }

    if (maxAmount) {
      filteredTransactions = filteredTransactions.filter(t => t.amount <= Number(maxAmount));
    }

    // Apply date filters
    if (dateFrom) {
      filteredTransactions = filteredTransactions.filter(t => 
        new Date(t.date) >= new Date(dateFrom)
      );
    }

    if (dateTo) {
      filteredTransactions = filteredTransactions.filter(t => 
        new Date(t.date) <= new Date(dateTo)
      );
    }

    // Sort by date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + Number(limit);
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    console.log(`📊 Retrieved ${paginatedTransactions.length} demo transactions`);

    res.json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: {
        transactions: paginatedTransactions,
        total: filteredTransactions.length,
        page: Number(page),
        totalPages: Math.ceil(filteredTransactions.length / limit)
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

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private (demo)
router.get('/:id', (req, res) => {
  try {
    const transaction = demoTransactions.find(t => t.id === req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    console.log(`📋 Retrieved demo transaction: ${transaction.title}`);

    res.json({
      success: true,
      message: 'Transaction retrieved successfully',
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
// @access  Private (demo)
router.post('/', [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('date').optional().isISO8601().withMessage('Date must be valid')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const newTransaction = {
      id: generateId(),
      ...req.body,
      date: req.body.date || new Date().toISOString().split('T')[0],
      aiGenerated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    demoTransactions.push(newTransaction);

    console.log(`➕ Created demo transaction: ${newTransaction.title} - ₹${newTransaction.amount}`);

    // Emit socket event for real-time update (if io is available)
    if (req.app.get('io')) {
      req.app.get('io').emit('transaction_added', newTransaction);
    }

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: newTransaction
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
// @access  Private (demo)
router.put('/:id', [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('amount').optional().isNumeric().withMessage('Amount must be a number'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const transactionIndex = demoTransactions.findIndex(t => t.id === req.params.id);

    if (transactionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Update transaction
    const updatedTransaction = {
      ...demoTransactions[transactionIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    demoTransactions[transactionIndex] = updatedTransaction;

    console.log(`✏️ Updated demo transaction: ${updatedTransaction.title}`);

    // Emit socket event for real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('transaction_updated', updatedTransaction);
    }

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: updatedTransaction
    });

  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating transaction'
    });
  }
});

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private (demo)
router.delete('/:id', (req, res) => {
  try {
    const transactionIndex = demoTransactions.findIndex(t => t.id === req.params.id);

    if (transactionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const deletedTransaction = demoTransactions[transactionIndex];
    demoTransactions.splice(transactionIndex, 1);

    console.log(`🗑️ Deleted demo transaction: ${deletedTransaction.title}`);

    // Emit socket event for real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('transaction_deleted', { id: req.params.id });
    }

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

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
// @access  Private (demo)
router.get('/stats', (req, res) => {
  try {
    const income = demoTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = demoTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;

    // Category breakdown
    const categoryBreakdown = demoTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        if (!acc[t.category]) {
          acc[t.category] = 0;
        }
        acc[t.category] += t.amount;
        return acc;
      }, {});

    const categoryData = Object.entries(categoryBreakdown).map(([category, amount]) => ({
      category,
      amount,
      percentage: ((amount / expenses) * 100).toFixed(2)
    }));

    console.log(`📈 Generated demo stats: Income ₹${income}, Expenses ₹${expenses}`);

    res.json({
      success: true,
      message: 'Transaction statistics retrieved successfully',
      data: {
        totalIncome: income,
        totalExpenses: expenses,
        balance,
        transactionCount: demoTransactions.length,
        categoryBreakdown: categoryData,
        monthlyTrend: [] // Could add monthly trend data here
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

export default router;
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Transaction title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  type: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: {
      values: ['income', 'expense'],
      message: 'Type must be either income or expense'
    },
    index: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
    index: true
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: [100, 'Subcategory cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  date: {
    type: Date,
    required: [true, 'Transaction date is required'],
    index: true
  },
  location: {
    type: {
      name: String,
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      },
      placeId: String // Google Places ID
    },
    default: null
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'upi', 'wallet', 'other'],
    default: 'other'
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']
  },
  exchangeRate: {
    type: Number,
    default: 1,
    min: [0, 'Exchange rate must be positive']
  },
  baseAmount: {
    type: Number, // Amount in user's base currency
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  receipt: {
    url: String,
    filename: String,
    mimetype: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  },
  recurring: {
    isRecurring: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      required: function() { return this.recurring.isRecurring; }
    },
    interval: {
      type: Number,
      min: 1,
      default: 1
    },
    endDate: Date,
    nextDate: Date,
    parentTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    }
  },
  budget: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget'
  },
  goal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SavingsGoal'
  },
  metadata: {
    source: {
      type: String,
      enum: ['manual', 'import', 'api', 'recurring', 'ai_categorized'],
      default: 'manual'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 1
    },
    aiSuggestions: [{
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
      },
      confidence: Number,
      reason: String
    }],
    importDetails: {
      importId: String,
      originalData: mongoose.Schema.Types.Mixed
    }
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'disputed'],
    default: 'completed'
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  attachments: [{
    url: String,
    filename: String,
    mimetype: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  version: { type: Number, default: 1 }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1, date: -1 });
transactionSchema.index({ userId: 1, 'recurring.isRecurring': 1 });
transactionSchema.index({ userId: 1, status: 1 });
transactionSchema.index({ date: -1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ 'recurring.nextDate': 1 });

// Text search index
transactionSchema.index({
  title: 'text',
  description: 'text',
  'location.name': 'text',
  tags: 'text',
  notes: 'text'
});

// Compound index for analytics queries
transactionSchema.index({ 
  userId: 1, 
  type: 1, 
  date: -1, 
  category: 1 
});

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: this.currency || 'INR',
    minimumFractionDigits: 2
  });
  return formatter.format(this.amount);
});

// Virtual for category details
transactionSchema.virtual('categoryDetails', {
  ref: 'Category',
  localField: 'category',
  foreignField: '_id',
  justOne: true
});

// Virtual for user details
transactionSchema.virtual('userDetails', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware
transactionSchema.pre('save', function(next) {
  // Calculate base amount if currency is different
  if (this.currency !== 'INR') {
    this.baseAmount = this.amount * (this.exchangeRate || 1);
  } else {
    this.baseAmount = this.amount;
  }
  
  // Set up recurring transaction next date
  if (this.recurring.isRecurring && !this.recurring.nextDate) {
    this.recurring.nextDate = this.calculateNextRecurringDate();
  }
  
  // Update version
  if (this.isModified() && !this.isNew) {
    this.version += 1;
  }
  
  next();
});

// Instance method to calculate next recurring date
transactionSchema.methods.calculateNextRecurringDate = function() {
  if (!this.recurring.isRecurring) return null;
  
  const currentDate = new Date(this.date);
  const interval = this.recurring.interval || 1;
  
  switch (this.recurring.frequency) {
    case 'daily':
      return new Date(currentDate.setDate(currentDate.getDate() + interval));
    case 'weekly':
      return new Date(currentDate.setDate(currentDate.getDate() + (7 * interval)));
    case 'monthly':
      return new Date(currentDate.setMonth(currentDate.getMonth() + interval));
    case 'yearly':
      return new Date(currentDate.setFullYear(currentDate.getFullYear() + interval));
    default:
      return null;
  }
};

// Instance method to create recurring transaction
transactionSchema.methods.createRecurringTransaction = async function() {
  if (!this.recurring.isRecurring || !this.recurring.nextDate) return null;
  
  const Transaction = this.constructor;
  
  const recurringTransaction = new Transaction({
    userId: this.userId,
    title: this.title,
    amount: this.amount,
    type: this.type,
    category: this.category,
    subcategory: this.subcategory,
    description: this.description,
    date: new Date(this.recurring.nextDate),
    paymentMethod: this.paymentMethod,
    currency: this.currency,
    tags: this.tags,
    recurring: {
      ...this.recurring.toObject(),
      parentTransactionId: this.recurring.parentTransactionId || this._id
    },
    metadata: {
      ...this.metadata,
      source: 'recurring'
    }
  });
  
  await recurringTransaction.save();
  
  // Update this transaction's next date
  this.recurring.nextDate = this.calculateNextRecurringDate();
  await this.save();
  
  return recurringTransaction;
};

// Static method for advanced analytics
transactionSchema.statics.getAnalytics = async function(userId, startDate, endDate, filters = {}) {
  const matchStage = {
    userId: new mongoose.Types.ObjectId(userId),
    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    isDeleted: false,
    status: 'completed',
    ...filters
  };
  
  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          type: '$type',
          month: { $month: '$date' },
          year: { $year: '$date' }
        },
        totalAmount: { $sum: '$baseAmount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$baseAmount' },
        transactions: { $push: '$$ROOT' }
      }
    },
    {
      $group: {
        _id: '$_id.type',
        monthlyData: {
          $push: {
            month: '$_id.month',
            year: '$_id.year',
            total: '$totalAmount',
            count: '$count',
            average: '$avgAmount'
          }
        },
        totalAmount: { $sum: '$totalAmount' },
        totalCount: { $sum: '$count' }
      }
    }
  ]);
};

// Static method for category-wise spending
transactionSchema.statics.getCategoryAnalytics = async function(userId, startDate, endDate, type = 'expense') {
  return await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        type: type,
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        isDeleted: false,
        status: 'completed'
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryInfo'
      }
    },
    {
      $unwind: '$categoryInfo'
    },
    {
      $group: {
        _id: '$category',
        categoryName: { $first: '$categoryInfo.name' },
        categoryIcon: { $first: '$categoryInfo.icon' },
        categoryColor: { $first: '$categoryInfo.color' },
        totalAmount: { $sum: '$baseAmount' },
        transactionCount: { $sum: 1 },
        avgAmount: { $avg: '$baseAmount' },
        transactions: { $push: '$$ROOT' }
      }
    },
    {
      $sort: { totalAmount: -1 }
    }
  ]);
};

// Static method to find transactions with filters
transactionSchema.statics.findWithFilters = function(userId, filters = {}, options = {}) {
  const query = { userId, isDeleted: false };
  
  // Add filters
  if (filters.type) query.type = filters.type;
  if (filters.category) query.category = filters.category;
  if (filters.paymentMethod) query.paymentMethod = filters.paymentMethod;
  if (filters.status) query.status = filters.status;
  
  // Date range
  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) query.date.$gte = new Date(filters.startDate);
    if (filters.endDate) query.date.$lte = new Date(filters.endDate);
  }
  
  // Amount range
  if (filters.minAmount || filters.maxAmount) {
    query.baseAmount = {};
    if (filters.minAmount) query.baseAmount.$gte = parseFloat(filters.minAmount);
    if (filters.maxAmount) query.baseAmount.$lte = parseFloat(filters.maxAmount);
  }
  
  // Text search
  if (filters.search) {
    query.$text = { $search: filters.search };
  }
  
  // Tags
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }
  
  return this.find(query, null, options)
    .populate('category', 'name icon color type')
    .populate('budget', 'name amount period')
    .populate('goal', 'title targetAmount currentAmount')
    .sort(options.sort || { date: -1, createdAt: -1 });
};

// Soft delete method
transactionSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Restore method
transactionSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  return this.save();
};

export default mongoose.model('Transaction', transactionSchema);
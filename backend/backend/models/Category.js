import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  icon: {
    type: String,
    required: [true, 'Category icon is required'],
    default: '📦'
  },
  color: {
    type: String,
    required: [true, 'Category color is required'],
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color'],
    default: '#6b7280'
  },
  type: {
    type: String,
    required: [true, 'Category type is required'],
    enum: {
      values: ['income', 'expense'],
      message: 'Type must be either income or expense'
    },
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // null for default system categories
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  isDefault: {
    type: Boolean,
    default: false,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  subcategories: [{
    name: String,
    icon: String,
    color: String,
    description: String
  }],
  budget: {
    monthlyLimit: {
      type: Number,
      min: 0,
      default: null
    },
    yearlyLimit: {
      type: Number,
      min: 0,
      default: null
    },
    alertThreshold: {
      type: Number,
      min: 0,
      max: 100,
      default: 80
    }
  },
  metadata: {
    keywords: [String], // For AI categorization
    patterns: [String], // Common transaction patterns
    aliases: [String], // Alternative names
    sortOrder: {
      type: Number,
      default: 0
    }
  },
  usage: {
    transactionCount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    lastUsed: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
categorySchema.index({ type: 1, userId: 1 });
categorySchema.index({ isDefault: 1, type: 1 });
categorySchema.index({ isActive: 1, type: 1 });
categorySchema.index({ name: 'text', description: 'text', 'metadata.keywords': 'text' });

// Virtual for transaction count
categorySchema.virtual('transactions', {
  ref: 'Transaction',
  localField: '_id',
  foreignField: 'category'
});

// Static method to get default categories
categorySchema.statics.getDefaultCategories = function() {
  return [
    // Expense categories
    { name: 'Food & Dining', icon: '🍽️', color: '#ff6b6b', type: 'expense', isDefault: true, keywords: ['food', 'restaurant', 'dining', 'meal', 'grocery'] },
    { name: 'Transportation', icon: '🚗', color: '#4ecdc4', type: 'expense', isDefault: true, keywords: ['transport', 'uber', 'taxi', 'bus', 'fuel', 'petrol'] },
    { name: 'Entertainment', icon: '🎬', color: '#45b7d1', type: 'expense', isDefault: true, keywords: ['movie', 'game', 'entertainment', 'fun', 'leisure'] },
    { name: 'Shopping', icon: '🛒', color: '#f7931e', type: 'expense', isDefault: true, keywords: ['shopping', 'clothes', 'amazon', 'flipkart', 'purchase'] },
    { name: 'Healthcare', icon: '🏥', color: '#6c5ce7', type: 'expense', isDefault: true, keywords: ['medical', 'doctor', 'hospital', 'medicine', 'health'] },
    { name: 'Education', icon: '📚', color: '#00b894', type: 'expense', isDefault: true, keywords: ['education', 'course', 'book', 'school', 'college'] },
    { name: 'Utilities', icon: '⚡', color: '#ffeaa7', type: 'expense', isDefault: true, keywords: ['electricity', 'water', 'gas', 'internet', 'phone'] },
    { name: 'Housing', icon: '🏠', color: '#fd79a8', type: 'expense', isDefault: true, keywords: ['rent', 'mortgage', 'home', 'house', 'apartment'] },
    { name: 'Insurance', icon: '🛡️', color: '#636e72', type: 'expense', isDefault: true, keywords: ['insurance', 'premium', 'policy', 'coverage'] },
    { name: 'Personal Care', icon: '💄', color: '#e17055', type: 'expense', isDefault: true, keywords: ['salon', 'cosmetics', 'grooming', 'beauty'] },
    { name: 'Gifts & Donations', icon: '🎁', color: '#fd79a8', type: 'expense', isDefault: true, keywords: ['gift', 'donation', 'charity', 'present'] },
    { name: 'Travel', icon: '✈️', color: '#00b894', type: 'expense', isDefault: true, keywords: ['travel', 'vacation', 'trip', 'hotel', 'flight'] },
    
    // Income categories
    { name: 'Salary', icon: '💼', color: '#00b894', type: 'income', isDefault: true, keywords: ['salary', 'wage', 'payroll', 'income'] },
    { name: 'Freelance', icon: '💻', color: '#0984e3', type: 'income', isDefault: true, keywords: ['freelance', 'contract', 'consulting', 'gig'] },
    { name: 'Business', icon: '🏢', color: '#6c5ce7', type: 'income', isDefault: true, keywords: ['business', 'profit', 'revenue', 'sales'] },
    { name: 'Investments', icon: '📈', color: '#e17055', type: 'income', isDefault: true, keywords: ['investment', 'dividend', 'interest', 'returns'] },
    { name: 'Rental', icon: '🏠', color: '#fd79a8', type: 'income', isDefault: true, keywords: ['rent', 'rental', 'property', 'lease'] },
    { name: 'Gifts', icon: '🎁', color: '#fdcb6e', type: 'income', isDefault: true, keywords: ['gift', 'bonus', 'reward', 'prize'] },
    { name: 'Other Income', icon: '💰', color: '#55a3ff', type: 'income', isDefault: true, keywords: ['other', 'miscellaneous', 'extra'] }
  ];
};

// Static method to create default categories for a user
categorySchema.statics.createDefaultCategoriesForUser = async function(userId) {
  const defaultCategories = this.getDefaultCategories();
  const userCategories = defaultCategories.map(cat => ({
    ...cat,
    userId: userId,
    metadata: {
      keywords: cat.keywords || [],
      sortOrder: 0
    }
  }));
  
  return await this.insertMany(userCategories);
};

// Static method to get categories for a user (including defaults)
categorySchema.statics.getCategoriesForUser = function(userId, type = null) {
  const query = {
    $or: [
      { userId: userId },
      { isDefault: true, userId: null }
    ],
    isActive: true
  };
  
  if (type) {
    query.type = type;
  }
  
  return this.find(query)
    .sort({ type: 1, 'metadata.sortOrder': 1, name: 1 });
};

// Method to update usage statistics
categorySchema.methods.updateUsage = async function(amount) {
  this.usage.transactionCount += 1;
  this.usage.totalAmount += amount;
  this.usage.lastUsed = new Date();
  return await this.save();
};

// Static method for AI categorization
categorySchema.statics.suggestCategory = function(title, description = '', amount = 0, type = 'expense') {
  const searchText = `${title} ${description}`.toLowerCase();
  
  return this.find({
    type: type,
    isActive: true,
    $or: [
      { 'metadata.keywords': { $in: [new RegExp(searchText.split(' ').join('|'), 'i')] } },
      { name: { $regex: searchText, $options: 'i' } },
      { 'metadata.aliases': { $in: [new RegExp(searchText.split(' ').join('|'), 'i')] } }
    ]
  })
  .sort({ 'usage.transactionCount': -1, 'usage.lastUsed': -1 })
  .limit(3);
};

// Pre-save middleware to set metadata
categorySchema.pre('save', function(next) {
  if (!this.metadata) {
    this.metadata = {
      keywords: [],
      patterns: [],
      aliases: [],
      sortOrder: 0
    };
  }
  next();
});

export default mongoose.model('Category', categorySchema);
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  avatar: {
    type: String,
    default: null
  },
  phoneNumber: {
    type: String,
    default: null,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  preferences: {
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'hi']
    },
    theme: {
      type: String,
      default: 'system',
      enum: ['light', 'dark', 'system']
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      budgetAlerts: { type: Boolean, default: true },
      billReminders: { type: Boolean, default: true },
      weeklyReports: { type: Boolean, default: true }
    },
    privacy: {
      profileVisible: { type: Boolean, default: false },
      shareAnalytics: { type: Boolean, default: true }
    }
  },
  gamification: {
    level: { type: Number, default: 1 },
    totalPoints: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActivityDate: { type: Date, default: Date.now },
    achievements: [{ 
      type: String,
      achievedAt: { type: Date, default: Date.now }
    }],
    badges: [{
      name: String,
      description: String,
      icon: String,
      earnedAt: { type: Date, default: Date.now }
    }]
  },
  subscription: {
    plan: {
      type: String,
      default: 'free',
      enum: ['free', 'premium', 'pro']
    },
    startDate: Date,
    endDate: Date,
    isActive: { type: Boolean, default: true }
  },
  security: {
    twoFactorEnabled: { type: Boolean, default: false },
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerificationToken: String,
    emailVerified: { type: Boolean, default: false },
    emailVerifiedAt: Date
  },
  isActive: { type: Boolean, default: true },
  lastActiveAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ 'security.passwordResetToken': 1 });
userSchema.index({ 'security.emailVerificationToken': 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastActiveAt: -1 });

// Virtual for user's full profile
userSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    email: this.email,
    fullName: this.fullName,
    avatar: this.avatar,
    phoneNumber: this.phoneNumber,
    preferences: this.preferences,
    gamification: this.gamification,
    subscription: this.subscription,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if it has been modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update lastActiveAt on save
userSchema.pre('save', function(next) {
  this.lastActiveAt = new Date();
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to generate password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token and save to database
  this.security.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  // Set expiration (10 minutes)
  this.security.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

// Instance method to generate email verification token
userSchema.methods.createEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.security.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  return verificationToken;
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.security.lockUntil && this.security.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { 'security.lockUntil': 1 },
      $set: { 'security.loginAttempts': 1 }
    });
  }
  
  const updates = { $inc: { 'security.loginAttempts': 1 } };
  
  // If we hit max attempts and account isn't locked, lock account
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours
  
  if (this.security.loginAttempts + 1 >= maxAttempts && !this.security.lockUntil) {
    updates.$set = { 'security.lockUntil': Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { 
      'security.loginAttempts': 1,
      'security.lockUntil': 1 
    }
  });
};

// Method to update user activity and streak
userSchema.methods.updateActivity = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActivity = new Date(this.gamification.lastActivityDate);
  lastActivity.setHours(0, 0, 0, 0);
  
  const timeDiff = today.getTime() - lastActivity.getTime();
  const daysDiff = timeDiff / (1000 * 3600 * 24);
  
  if (daysDiff === 1) {
    // Consecutive day - increment streak
    this.gamification.streak += 1;
  } else if (daysDiff > 1) {
    // Missed days - reset streak
    this.gamification.streak = 1;
  }
  // If daysDiff === 0, it's the same day, don't change streak
  
  this.gamification.lastActivityDate = new Date();
  await this.save();
};

// Method to add points and check for level up
userSchema.methods.addPoints = async function(points, reason = 'Activity') {
  this.gamification.totalPoints += points;
  
  // Simple level calculation: every 1000 points = 1 level
  const newLevel = Math.floor(this.gamification.totalPoints / 1000) + 1;
  const oldLevel = this.gamification.level;
  
  if (newLevel > oldLevel) {
    this.gamification.level = newLevel;
    
    // Award level up badge
    this.gamification.badges.push({
      name: `Level ${newLevel}`,
      description: `Reached level ${newLevel}!`,
      icon: '🎉',
      earnedAt: new Date()
    });
  }
  
  await this.save();
  return { pointsAdded: points, newLevel, leveledUp: newLevel > oldLevel };
};

export default mongoose.model('User', userSchema);
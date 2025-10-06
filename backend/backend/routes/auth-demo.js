import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Demo users storage (in-memory for demo)
const demoUsers = new Map();

// Demo user data
const createDemoUser = (email, fullName) => ({
  id: `demo-${Date.now()}`,
  email,
  fullName,
  avatar: '',
  isVerified: true,
  preferences: {
    currency: 'INR',
    language: 'en',
    notifications: true,
    theme: 'light'
  },
  stats: {
    totalTransactions: Math.floor(Math.random() * 50) + 10,
    totalIncome: Math.floor(Math.random() * 100000) + 50000,
    totalExpenses: Math.floor(Math.random() * 50000) + 20000,
    currentStreak: Math.floor(Math.random() * 30) + 1
  },
  gamification: {
    level: Math.floor(Math.random() * 10) + 1,
    xp: Math.floor(Math.random() * 5000) + 100,
    badges: ['early_adopter', 'saver', 'consistent_tracker'],
    achievements: ['first_transaction', 'weekly_budget', 'savings_goal_reached']
  }
});

// Generate JWT token (demo version)
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET || 'demo-secret-key', 
    { expiresIn: '24h' }
  );
};

// @desc    Register user (Demo)
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullName').trim().isLength({ min: 2 }).withMessage('Full name is required'),
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

    const { email, password, fullName } = req.body;

    // Check if user already exists
    if (demoUsers.has(email)) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create demo user
    const user = createDemoUser(email, fullName);
    demoUsers.set(email, { ...user, password }); // Store password for demo

    // Generate token
    const token = generateToken(user.id);

    console.log(`📝 Demo user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @desc    Login user (Demo)
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
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

    const { email, password } = req.body;

    // For demo, accept any email/password combination or create new user
    let storedUser = demoUsers.get(email);
    
    if (!storedUser) {
      // Create demo user on first login
      const newUser = createDemoUser(email, email.split('@')[0]);
      demoUsers.set(email, { ...newUser, password });
      storedUser = demoUsers.get(email);
      console.log(`👤 New demo user created: ${email}`);
    }

    // Remove password from response
    const { password: _, ...user } = storedUser;

    // Generate token
    const token = generateToken(user.id);

    console.log(`✅ Demo login successful: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @desc    Get current user profile (Demo)
// @route   GET /api/auth/me
// @access  Private (but demo version)
router.get('/me', (req, res) => {
  try {
    // For demo, we'll create a default user if no auth
    const demoUser = createDemoUser('demo@smartbudget.ai', 'Demo User');

    res.json({
      success: true,
      message: 'User profile retrieved',
      data: demoUser
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Logout user (Demo)
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', (req, res) => {
  try {
    console.log('👋 Demo user logged out');
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

// @desc    Change password (Demo)
// @route   POST /api/auth/change-password
// @access  Private
router.post('/change-password', [
  body('oldPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
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

    console.log('🔒 Demo password changed');

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
});

// @desc    Reset password (Demo)
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
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

    console.log(`📧 Demo password reset for: ${req.body.email}`);

    res.json({
      success: true,
      message: 'Password reset email sent (demo mode)'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
});

export default router;
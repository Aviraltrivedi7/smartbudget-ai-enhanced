import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

const router = express.Router();
export const demoUsers = new Map();
export const getDemoUserById = (userId) => [...demoUsers.values()].find((user) => user.id === userId) || null;
const accessSecret = () => process.env.JWT_SECRET || 'demo-secret-key';
const refreshSecret = () => process.env.JWT_REFRESH_SECRET || accessSecret();

const createDemoUser = (email, fullName) => ({
  id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  email,
  fullName,
  avatar: '',
  isVerified: true,
  preferences: { currency: 'INR', language: 'en', notifications: true, theme: 'light' },
  stats: { totalTransactions: 0, totalIncome: 0, totalExpenses: 0, currentStreak: 0 },
  gamification: { level: 1, xp: 0, badges: [], achievements: [] },
});

const publicUser = ({ password: _password, ...user }) => user;
const issueTokens = (userId) => ({
  token: jwt.sign({ userId }, accessSecret(), { expiresIn: '24h' }),
  refreshToken: jwt.sign({ userId, type: 'refresh' }, refreshSecret(), { expiresIn: '7d' }),
});

const tokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  return authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
};

const userFromRequest = (req) => {
  const token = tokenFromRequest(req);
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, accessSecret());
    return getDemoUserById(decoded.userId);
  } catch {
    return null;
  }
};

const sendValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  return true;
};

const profileValidators = [
  body('fullName').optional().trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('phoneNumber').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date required'),
];

router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullName').trim().isLength({ min: 2 }).withMessage('Full name is required'),
], (req, res) => {
  if (sendValidationErrors(req, res)) return;
  const { email, password, fullName } = req.body;
  if (demoUsers.has(email)) return res.status(400).json({ success: false, message: 'User already exists with this email' });
  const user = createDemoUser(email, fullName);
  demoUsers.set(email, { ...user, password });
  const tokens = issueTokens(user.id);
  return res.status(201).json({ success: true, message: 'User registered successfully', data: { user, ...tokens } });
});

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], (req, res) => {
  if (sendValidationErrors(req, res)) return;
  const { email, password } = req.body;
  let storedUser = demoUsers.get(email);
  if (!storedUser) {
    const newUser = createDemoUser(email, email.split('@')[0]);
    demoUsers.set(email, { ...newUser, password });
    storedUser = demoUsers.get(email);
  }
  if (storedUser.password !== password) return res.status(401).json({ success: false, message: 'Invalid email or password' });
  const tokens = issueTokens(storedUser.id);
  return res.json({ success: true, message: 'Login successful', data: { user: publicUser(storedUser), ...tokens } });
});

router.get('/me', (req, res) => {
  const user = userFromRequest(req) || createDemoUser('demo@dhansetu.ai', 'Demo User');
  return res.json({ success: true, message: 'User profile retrieved', data: { user: publicUser(user) } });
});

const updateProfile = (req, res) => {
  if (sendValidationErrors(req, res)) return;
  const user = userFromRequest(req);
  if (!user) return res.status(401).json({ success: false, message: 'Valid demo login is required' });
  const allowed = ['fullName', 'phoneNumber', 'dateOfBirth', 'avatar'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  });
  return res.json({ success: true, message: 'Profile updated successfully', data: publicUser(user) });
};
router.put('/profile', profileValidators, updateProfile);

const changePassword = (req, res) => {
  const currentPassword = req.body.currentPassword || req.body.oldPassword;
  const newPassword = req.body.newPassword;
  if (!currentPassword || typeof currentPassword !== 'string') return res.status(400).json({ success: false, message: 'Current password is required' });
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
  const user = userFromRequest(req);
  if (!user) return res.status(401).json({ success: false, message: 'Valid demo login is required' });
  if (user.password !== currentPassword) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  user.password = newPassword;
  return res.json({ success: true, message: 'Password changed successfully' });
};
router.post('/change-password', changePassword);
router.put('/change-password', changePassword);

router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) return res.status(401).json({ success: false, message: 'Refresh token required' });
  try {
    const decoded = jwt.verify(refreshToken, refreshSecret());
    if (decoded.type !== 'refresh') return res.status(401).json({ success: false, message: 'Invalid token type' });
    const user = getDemoUserById(decoded.userId);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    return res.json({ success: true, message: 'Token refreshed successfully', data: issueTokens(user.id) });
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
});

router.post('/logout', (_req, res) => res.json({ success: true, message: 'Logged out successfully' }));
router.post('/reset-password', [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')], (req, res) => {
  if (sendValidationErrors(req, res)) return;
  return res.json({ success: true, message: 'Password reset email sent (demo mode)' });
});

export default router;

import express from 'express';
import { getDemoUserById } from './auth-demo.js';

const router = express.Router();
const profiles = new Map();
const allowedFields = ['fullName', 'phoneNumber', 'dateOfBirth', 'avatar'];
const publicProfile = (profile) => {
  const { password: _password, ...safeProfile } = profile;
  return safeProfile;
};

const getProfile = (req) => {
  const userId = String(req.userId || 'guest');
  if (!profiles.has(userId)) {
    const authUser = getDemoUserById(userId);
    profiles.set(userId, authUser || {
      id: userId,
      email: userId === 'guest' ? 'guest@dhansetu.ai' : `${userId}@demo.dhansetu.ai`,
      fullName: userId === 'guest' ? 'Guest User' : 'Demo User',
      avatar: '',
      preferences: { currency: 'INR', language: 'en', notifications: true, theme: 'light' },
    });
  }
  return profiles.get(userId);
};

router.get('/profile', (req, res) => res.json({ success: true, message: 'User profile retrieved', data: publicProfile(getProfile(req)) }));
router.put('/profile', (req, res) => {
  const profile = getProfile(req);
  const updates = Object.fromEntries(allowedFields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]));
  if (updates.fullName !== undefined && (typeof updates.fullName !== 'string' || updates.fullName.trim().length < 2)) {
    return res.status(400).json({ success: false, message: 'Full name must be at least 2 characters' });
  }
  if (Object.keys(updates).length === 0) return res.status(400).json({ success: false, message: 'No supported profile fields supplied' });
  Object.assign(profile, updates);
  const authUser = getDemoUserById(String(req.userId || 'guest'));
  if (authUser) Object.assign(authUser, updates);
  return res.json({ success: true, message: 'Profile updated successfully', data: publicProfile(profile) });
});

export default router;

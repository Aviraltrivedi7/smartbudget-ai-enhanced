import express from 'express';
import User from '../models/User.js';

const router = express.Router();
const profileFields = ['fullName', 'phoneNumber', 'dateOfBirth', 'avatar'];

const getUserId = (req) => req.userId || req.user?.id || req.user?._id;
const serializeUser = (user) => {
  const result = user?.toObject ? user.toObject() : { ...user };
  delete result.password;
  delete result.__v;
  return result;
};

const updateProfile = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });
    const updates = Object.fromEntries(profileFields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]));
    if (updates.fullName !== undefined && (typeof updates.fullName !== 'string' || updates.fullName.trim().length < 2)) {
      return res.status(400).json({ success: false, message: 'Full name must be at least 2 characters' });
    }
    if (Object.keys(updates).length === 0) return res.status(400).json({ success: false, message: 'No supported profile fields supplied' });

    const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, message: 'Profile updated successfully', data: serializeUser(user) });
  } catch (error) {
    console.error('Update user profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error while updating profile' });
  }
};

router.get('/profile', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, message: 'User profile retrieved', data: serializeUser(user) });
  } catch (error) {
    console.error('Get user profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching profile' });
  }
});

router.put('/profile', updateProfile);

export default router;

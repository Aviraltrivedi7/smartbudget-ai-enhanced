import express from 'express';
import Category from '../models/Category.js';

const router = express.Router();

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({
      $or: [
        { userId: req.user.id },
        { isDefault: true }
      ]
    }).sort({ name: 1 });
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/categories - Create new category
router.post('/', async (req, res) => {
  try {
    const category = new Category({
      ...req.body,
      userId: req.user.id,
      isDefault: false
    });
    
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: 'Invalid category data', error: error.message });
  }
});

export default router;
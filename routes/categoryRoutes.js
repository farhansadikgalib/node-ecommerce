const express = require('express');
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryTree
} = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllCategories);
router.get('/tree', getCategoryTree);
router.get('/:id', getCategoryById);

// Protected routes
router.post('/', authMiddleware, createCategory);
router.put('/:id', authMiddleware, updateCategory);
router.delete('/:id', authMiddleware, deleteCategory);

module.exports = router;

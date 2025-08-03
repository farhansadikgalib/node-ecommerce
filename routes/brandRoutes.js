const express = require('express');
const router = express.Router();
const {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand
} = require('../controllers/brandController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllBrands);
router.get('/:id', getBrandById);

// Protected routes
router.post('/', authMiddleware, createBrand);
router.put('/:id', authMiddleware, updateBrand);
router.delete('/:id', authMiddleware, deleteBrand);

module.exports = router;

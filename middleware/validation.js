const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// Product validation rules
const validateProduct = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  
  body('brand.brandId')
    .notEmpty()
    .withMessage('Brand ID is required')
    .isMongoId()
    .withMessage('Invalid brand ID'),
  
  body('category.categoryId')
    .notEmpty()
    .withMessage('Category ID is required')
    .isMongoId()
    .withMessage('Invalid category ID'),
  
  body('seller.sellerId')
    .notEmpty()
    .withMessage('Seller ID is required')
    .isMongoId()
    .withMessage('Invalid seller ID'),
  
  body('price.basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  
  body('stock.total')
    .isInt({ min: 0 })
    .withMessage('Stock total must be a non-negative integer'),
  
  body('images')
    .isArray({ min: 1 })
    .withMessage('At least one image is required'),
  
  body('images.*')
    .isURL()
    .withMessage('Each image must be a valid URL'),
  
  handleValidationErrors
];

const validateProductUpdate = [
  body('title')
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  
  body('brand.brandId')
    .optional()
    .isMongoId()
    .withMessage('Invalid brand ID'),
  
  body('category.categoryId')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
  
  body('price.basePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  
  body('stock.total')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock total must be a non-negative integer'),
  
  handleValidationErrors
];

// Brand validation rules
const validateBrand = [
  body('name')
    .notEmpty()
    .withMessage('Brand name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Brand name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('logo')
    .optional()
    .isURL()
    .withMessage('Logo must be a valid URL'),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Website must be a valid URL'),
  
  handleValidationErrors
];

// Category validation rules
const validateCategory = [
  body('name')
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
  
  body('parentCategory')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent category ID'),
  
  handleValidationErrors
];

// Review validation rules
const validateReview = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('title')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Title must not exceed 100 characters'),
  
  body('comment')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comment must not exceed 1000 characters'),
  
  handleValidationErrors
];

// ID parameter validation
const validateObjectId = [
  param('id')
    .custom((value) => {
      if (value.match(/^[0-9a-fA-F]{24}$/)) {
        return true;
      }
      // Allow slug format (letters, numbers, hyphens)
      if (value.match(/^[a-z0-9-]+$/)) {
        return true;
      }
      throw new Error('Invalid ID format');
    }),
  handleValidationErrors
];

// Query validation for pagination
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

module.exports = {
  validateProduct,
  validateProductUpdate,
  validateBrand,
  validateCategory,
  validateReview,
  validateObjectId,
  validatePagination,
  handleValidationErrors
};

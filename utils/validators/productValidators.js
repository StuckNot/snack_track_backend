const { body, param, query } = require('express-validator');

/**
 * 🔍 PRODUCT VALIDATION RULES
 * Validation rules for product-related endpoints
 */

/**
 * Product Creation Validation
 */
const validateProductCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-'&.()]+$/)
    .withMessage('Product name contains invalid characters'),
    
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Brand name must be less than 50 characters'),
    
  body('barcode')
    .optional()
    .matches(/^\d{8,14}$/)
    .withMessage('Barcode must be 8-14 digits'),
    
  body('category_id')
    .optional()
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
    
  body('ingredients')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Ingredients list must be less than 1000 characters'),
    
  body('serving_size')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Serving size must be less than 50 characters'),
    
  body('image_url')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL')
];

/**
 * Product Update Validation
 */
const validateProductUpdate = [
  param('id')
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
    
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
    
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Brand name must be less than 50 characters'),
    
  body('category_id')
    .optional()
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
    
  body('ingredients')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Ingredients list must be less than 1000 characters')
];

/**
 * Barcode Scanning Validation
 */
const validateBarcodeScanning = [
  body('barcode')
    .notEmpty()
    .withMessage('Barcode is required')
    .matches(/^\d{8,14}$/)
    .withMessage('Barcode must be 8-14 digits')
    .custom((value) => {
      // Check for common invalid barcodes
      const invalidBarcodes = ['0000000000000', '1111111111111'];
      if (invalidBarcodes.includes(value)) {
        throw new Error('Invalid barcode format');
      }
      return true;
    })
];

/**
 * Product Search Validation
 */
const validateProductSearch = [
  query('q')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters')
    .trim()
    .escape(),
    
  query('category')
    .optional()
    .isUUID()
    .withMessage('Category must be a valid UUID'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
    
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be non-negative'),
    
  query('sort')
    .optional()
    .isIn(['name', 'created_at', 'updated_at', 'health_score'])
    .withMessage('Sort field must be one of: name, created_at, updated_at, health_score'),
    
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be either asc or desc')
];

/**
 * Nutrition Facts Validation
 */
const validateNutritionFacts = [
  body('calories')
    .optional()
    .isFloat({ min: 0, max: 2000 })
    .withMessage('Calories must be between 0 and 2000'),
    
  body('protein')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Protein must be between 0 and 100 grams'),
    
  body('carbs')
    .optional()
    .isFloat({ min: 0, max: 200 })
    .withMessage('Carbohydrates must be between 0 and 200 grams'),
    
  body('fat')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Fat must be between 0 and 100 grams'),
    
  body('saturated_fat')
    .optional()
    .isFloat({ min: 0, max: 50 })
    .withMessage('Saturated fat must be between 0 and 50 grams'),
    
  body('trans_fat')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Trans fat must be between 0 and 10 grams'),
    
  body('fiber')
    .optional()
    .isFloat({ min: 0, max: 50 })
    .withMessage('Fiber must be between 0 and 50 grams'),
    
  body('sugar')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Sugar must be between 0 and 100 grams'),
    
  body('sodium')
    .optional()
    .isFloat({ min: 0, max: 5000 })
    .withMessage('Sodium must be between 0 and 5000 mg'),
    
  body('cholesterol')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Cholesterol must be between 0 and 1000 mg'),
    
  body('serving_size_g')
    .optional()
    .isFloat({ min: 1, max: 1000 })
    .withMessage('Serving size must be between 1 and 1000 grams')
];

/**
 * Product ID Validation
 */
const validateProductId = [
  param('id')
    .isUUID()
    .withMessage('Product ID must be a valid UUID')
];

/**
 * Image Upload Validation
 */
const validateImageUpload = [
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Image description must be less than 200 characters'),
    
  // Custom validation for file (handled by multer middleware)
  body('imageType')
    .optional()
    .isIn(['product', 'nutrition_label', 'ingredient_list'])
    .withMessage('Image type must be one of: product, nutrition_label, ingredient_list')
];

/**
 * Category Validation
 */
const validateCategory = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z0-9\s&-]+$/)
    .withMessage('Category name contains invalid characters'),
    
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Category description must be less than 200 characters'),
    
  body('icon')
    .optional()
    .isLength({ min: 1, max: 10 })
    .withMessage('Category icon must be 1-10 characters'),
    
  body('parent_id')
    .optional()
    .isUUID()
    .withMessage('Parent category ID must be a valid UUID')
];

/**
 * Assessment History Validation
 */
const validateAssessmentHistory = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be non-negative'),
    
  query('recommendation')
    .optional()
    .isIn(['excellent', 'good', 'moderate', 'avoid'])
    .withMessage('Recommendation filter must be one of: excellent, good, moderate, avoid'),
    
  query('date_from')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid ISO date'),
    
  query('date_to')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid ISO date')
];

/**
 * Bulk Operations Validation
 */
const validateBulkProductIds = [
  body('product_ids')
    .isArray({ min: 1, max: 10 })
    .withMessage('Product IDs must be an array with 1-10 items'),
    
  body('product_ids.*')
    .isUUID()
    .withMessage('Each product ID must be a valid UUID')
];

/**
 * Custom Validators
 */
const customValidators = {
  /**
   * Validate barcode check digit
   */
  validateBarcodeCheckDigit: (barcode) => {
    if (barcode.length < 8) return false;
    
    const digits = barcode.split('').map(Number);
    let sum = 0;
    
    for (let i = 0; i < digits.length - 1; i++) {
      sum += digits[i] * (i % 2 === 0 ? 1 : 3);
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === digits[digits.length - 1];
  },
  
  /**
   * Validate nutrition facts completeness
   */
  validateNutritionCompleteness: (nutritionFacts) => {
    const requiredFields = ['calories', 'protein', 'carbs', 'fat'];
    const presentFields = requiredFields.filter(field => 
      nutritionFacts[field] !== null && nutritionFacts[field] !== undefined
    );
    
    return presentFields.length >= 2; // At least 2 required fields
  },
  
  /**
   * Validate ingredient list format
   */
  validateIngredientList: (ingredients) => {
    if (!ingredients || typeof ingredients !== 'string') return false;
    
    // Check for basic ingredients format (comma-separated)
    const ingredientList = ingredients.split(',').map(i => i.trim());
    return ingredientList.length > 0 && ingredientList.every(i => i.length > 0);
  }
};

module.exports = {
  validateProductCreation,
  validateProductUpdate,
  validateBarcodeScanning,
  validateProductSearch,
  validateNutritionFacts,
  validateProductId,
  validateImageUpload,
  validateCategory,
  validateAssessmentHistory,
  validateBulkProductIds,
  customValidators
};
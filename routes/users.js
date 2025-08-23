const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { body } = require('express-validator');

// Import middleware
const { auth } = require('../middlewares/auth');
const { adminAuth } = require('../middlewares/adminAuth');
const upload = require('../middlewares/upload');

/**
 * 🔐 AUTHENTICATION ROUTES
 */

// POST /api/users/register
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('age')
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage('Age must be between 13 and 120'),
  body('height')
    .optional()
    .isFloat({ min: 50, max: 300 })
    .withMessage('Height must be between 50 and 300 cm'),
  body('weight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight must be between 20 and 500 kg'),
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  body('dietary_preferences')
    .optional()
    .isIn(['veg', 'vegan', 'keto', 'paleo', 'gluten_free', 'dairy_free', 'none'])
    .withMessage('Invalid dietary preference'),
  body('health_goals')
    .optional()
    .isIn(['lose_weight', 'gain_muscle', 'maintain', 'improve_health'])
    .withMessage('Invalid health goal'),
  body('activity_level')
    .optional()
    .isIn(['sedentary', 'light', 'moderate', 'active', 'very_active'])
    .withMessage('Invalid activity level'),
  body('allergies')
    .optional()
    .isArray()
    .withMessage('Allergies must be an array')
], userController.register);

// POST /api/users/login
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], userController.login);

/**
 * 👤 PROFILE MANAGEMENT ROUTES (Protected)
 */

// GET /api/users/profile
router.get('/profile', auth, userController.getProfile);

// PUT /api/users/profile
router.put('/profile', [
  auth,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('age')
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage('Age must be between 13 and 120'),
  body('height')
    .optional()
    .isFloat({ min: 50, max: 300 })
    .withMessage('Height must be between 50 and 300 cm'),
  body('weight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight must be between 20 and 500 kg'),
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  body('dietary_preferences')
    .optional()
    .isIn(['veg', 'vegan', 'keto', 'paleo', 'gluten_free', 'dairy_free', 'none'])
    .withMessage('Invalid dietary preference'),
  body('health_goals')
    .optional()
    .isIn(['lose_weight', 'gain_muscle', 'maintain', 'improve_health'])
    .withMessage('Invalid health goal'),
  body('activity_level')
    .optional()
    .isIn(['sedentary', 'light', 'moderate', 'active', 'very_active'])
    .withMessage('Invalid activity level'),
  body('allergies')
    .optional()
    .isArray()
    .withMessage('Allergies must be an array'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
], userController.updateProfile);

// POST /api/users/change-password
router.post('/change-password', [
  auth,
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
], userController.changePassword);

/**
 * 🏥 HEALTH ANALYSIS ROUTES (Protected)
 */

// GET /api/users/health-analysis
router.get('/health-analysis', auth, userController.getHealthAnalysis);

// GET /api/users/health-metrics
router.get('/health-metrics', auth, userController.getHealthMetrics);

/**
 * 🎯 COMPATIBILITY ROUTES (Protected)
 */

// POST /api/users/check-compatibility
router.post('/check-compatibility', [
  auth,
  body('ingredients')
    .isArray({ min: 1 })
    .withMessage('Ingredients array is required and must not be empty')
], userController.checkProductCompatibility);

/**
 * 🔍 SEARCH & DISCOVERY ROUTES (Protected)
 */

// GET /api/users/search
router.get('/search', auth, userController.searchUsers);

/**
 * 📊 ANALYTICS ROUTES (Admin Protected)
 */

// GET /api/users/analytics
router.get('/analytics', adminAuth, userController.getAnalytics);

/**
 * 📱 UTILITY ROUTES (Protected)
 */

// POST /api/users/upload-profile-picture
router.post('/upload-profile-picture', 
  auth, 
  upload.single('profilePicture'), 
  userController.uploadProfilePicture
);

// POST /api/users/deactivate
router.post('/deactivate', auth, userController.deactivateAccount);

/**
 * 📄 PUBLIC ROUTES
 */

// GET /api/users/health-tips
router.get('/health-tips', (req, res) => {
  res.json({
    success: true,
    message: 'Health tips retrieved successfully',
    data: {
      tips: [
        'Drink at least 8 glasses of water daily',
        'Include protein in every meal',
        'Aim for 7-9 hours of sleep per night',
        'Exercise for at least 30 minutes daily',
        'Eat a variety of colorful fruits and vegetables'
      ],
      lastUpdated: new Date()
    }
  });
});

// GET /api/users/dietary-preferences
router.get('/dietary-preferences', (req, res) => {
  res.json({
    success: true,
    message: 'Dietary preferences retrieved successfully',
    data: {
      preferences: [
        { value: 'veg', label: 'Vegetarian', description: 'No meat, fish, or poultry' },
        { value: 'vegan', label: 'Vegan', description: 'No animal products' },
        { value: 'keto', label: 'Ketogenic', description: 'High fat, low carb' },
        { value: 'paleo', label: 'Paleo', description: 'Whole foods, no processed items' },
        { value: 'gluten_free', label: 'Gluten Free', description: 'No gluten-containing grains' },
        { value: 'dairy_free', label: 'Dairy Free', description: 'No dairy products' },
        { value: 'none', label: 'No Restrictions', description: 'No dietary restrictions' }
      ]
    }
  });
});

module.exports = router;
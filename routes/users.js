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

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*\\W).{8,}$"
 *                 example: "SecurePass123!"
 *               age:
 *                 type: integer
 *                 minimum: 13
 *                 maximum: 120
 *                 example: 25
 *               height:
 *                 type: number
 *                 minimum: 50
 *                 maximum: 300
 *                 example: 175
 *               weight:
 *                 type: number
 *                 minimum: 20
 *                 maximum: 500
 *                 example: 70
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *                 example: "Male"
 *               dietary_preferences:
 *                 type: string
 *                 enum: [veg, vegan, keto, paleo, gluten_free, dairy_free, none]
 *                 example: "veg"
 *               health_goals:
 *                 type: string
 *                 enum: [lose_weight, gain_muscle, maintain, improve_health]
 *                 example: "lose_weight"
 *               activity_level:
 *                 type: string
 *                 enum: [sedentary, light, moderate, active, very_active]
 *                 example: "moderate"
 *               allergies:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["nuts", "dairy"]
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         token:
 *                           type: string
 *                           description: JWT authentication token
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/)
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

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 example: "SecurePass123!"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         token:
 *                           type: string
 *                           description: JWT authentication token
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve current user's profile information
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/profile', auth, userController.getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update current user's profile information
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "John Smith"
 *               age:
 *                 type: integer
 *                 minimum: 13
 *                 maximum: 120
 *                 example: 26
 *               height:
 *                 type: number
 *                 minimum: 50
 *                 maximum: 300
 *                 example: 180
 *               weight:
 *                 type: number
 *                 minimum: 20
 *                 maximum: 500
 *                 example: 75
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *                 example: "Male"
 *               dietary_preferences:
 *                 type: string
 *                 enum: [veg, vegan, keto, paleo, gluten_free, dairy_free, none]
 *                 example: "keto"
 *               health_goals:
 *                 type: string
 *                 enum: [lose_weight, gain_muscle, maintain, improve_health]
 *                 example: "gain_muscle"
 *               activity_level:
 *                 type: string
 *                 enum: [sedentary, light, moderate, active, very_active]
 *                 example: "active"
 *               allergies:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["shellfish"]
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/profile', [
  auth,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
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
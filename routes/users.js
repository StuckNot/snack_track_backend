const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { body } = require('express-validator');

// Import middleware
const { authenticateToken: auth } = require('../middlewares/authMiddleware');
const { authenticateAdmin: adminAuth } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const { validateRequest } = require('../middlewares/validationMiddleware');

// Import validators
const { 
  validateUserRegistration, 
  validateUserLogin, 
  validateProfileUpdate,
  validatePasswordChange 
} = require('../utils/validators/userValidators');

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
router.post('/register', validateUserRegistration, userController.register);

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
router.post('/login', validateUserLogin, userController.login);

/**
 * 📧 EMAIL VERIFICATION ROUTES
 */

/**
 * @swagger
 * /api/users/verify-email:
 *   get:
 *     summary: Verify email address
 *     description: Verify user's email address using the token sent via email
 *     tags: [Authentication]
 *     parameters:
 *       - name: token
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
 *         example: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/verify-email', userController.verifyEmail);

/**
 * @swagger
 * /api/users/resend-verification:
 *   post:
 *     summary: Resend verification email
 *     description: Resend email verification link to user's email address
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Email already verified or user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/resend-verification', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], userController.resendVerification);

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
  validateProfileUpdate
], userController.updateProfile);

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     summary: Change user password
 *     description: Change current user's password with current password verification
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "OldPassword123!"
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*\\W).{8,}$"
 *                 example: "NewSecurePass123!"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid current password or validation error
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
router.put('/change-password', [
  auth,
  validatePasswordChange
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
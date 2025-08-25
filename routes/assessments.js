const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validationMiddleware');
const { body, query, param } = require('express-validator');

/**
 * 🔍 PRODUCT ASSESSMENT ROUTES
 * Routes for health assessment functionality
 */

/**
 * @swagger
 * /api/assessments:
 *   post:
 *     summary: Create new health assessment
 *     description: Creates a new health assessment for a product with AI-powered analysis
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - scan_method
 *             properties:
 *               product_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the product to assess
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               scan_method:
 *                 type: string
 *                 enum: [barcode, image, manual, search]
 *                 description: Method used to identify the product
 *                 example: "barcode"
 *               scan_location:
 *                 type: string
 *                 maxLength: 100
 *                 description: Optional location where scan was performed
 *                 example: "Grocery Store Aisle 5"
 *     responses:
 *       201:
 *         description: Assessment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Assessment'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - invalid token
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.post('/', 
  authenticateToken,
  [
    body('product_id')
      .isUUID()
      .withMessage('Valid product ID is required'),
    body('scan_method')
      .isIn(['barcode', 'image', 'manual', 'search'])
      .withMessage('Valid scan method is required'),
    body('scan_location')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Scan location must be less than 100 characters')
  ],
  validateRequest,
  assessmentController.createAssessment
);

/**
 * @swagger
 * /api/assessments/{id}:
 *   get:
 *     summary: Get assessment by ID
 *     description: Retrieves a specific assessment with detailed health analysis
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assessment ID
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Assessment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Assessment'
 *       401:
 *         description: Unauthorized - invalid token
 *       404:
 *         description: Assessment not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id',
  authenticateToken,
  [
    param('id')
      .isUUID()
      .withMessage('Valid assessment ID is required')
  ],
  validateRequest,
  assessmentController.getAssessmentById
);

/**
 * @swagger
 * /api/assessments/{id}:
 *   put:
 *     summary: Update assessment with user feedback
 *     description: Allows users to add rating and notes to their assessments
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assessment ID
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: User rating for the assessment accuracy
 *                 example: 4
 *               user_notes:
 *                 type: string
 *                 maxLength: 500
 *                 description: User notes about the product or assessment
 *                 example: "Great taste but too much sugar for my diet"
 *     responses:
 *       200:
 *         description: Assessment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Assessment'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - invalid token
 *       404:
 *         description: Assessment not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id',
  authenticateToken,
  [
    param('id')
      .isUUID()
      .withMessage('Valid assessment ID is required'),
    body('user_rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('user_notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Notes must be less than 500 characters')
  ],
  validateRequest,
  assessmentController.updateAssessment
);

/**
 * @swagger
 * /api/assessments/user/history:
 *   get:
 *     summary: Get user's assessment history
 *     description: Retrieves paginated list of user's past assessments with filtering options
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of assessments to return
 *         example: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of assessments to skip
 *         example: 0
 *       - in: query
 *         name: recommendation
 *         schema:
 *           type: string
 *           enum: [excellent, good, moderate, avoid]
 *         description: Filter by recommendation type
 *         example: "good"
 *     responses:
 *       200:
 *         description: Assessment history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     assessments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Assessment'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 150
 *                         limit:
 *                           type: integer
 *                           example: 20
 *                         offset:
 *                           type: integer
 *                           example: 0
 *                         has_more:
 *                           type: boolean
 *                           example: true
 *       401:
 *         description: Unauthorized - invalid token
 *       500:
 *         description: Internal server error
 */
router.get('/user/history',
  authenticateToken,
  [
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
      .withMessage('Invalid recommendation filter')
  ],
  validateRequest,
  assessmentController.getUserHistory
);

/**
 * @swagger
 * /api/assessments/user/stats:
 *   get:
 *     summary: Get user's assessment statistics
 *     description: Retrieves aggregated statistics about user's assessment patterns
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_assessments:
 *                       type: integer
 *                       example: 150
 *                     avg_health_score:
 *                       type: number
 *                       example: 72.5
 *                     recommendation_breakdown:
 *                       type: object
 *                       properties:
 *                         excellent:
 *                           type: integer
 *                           example: 25
 *                         good:
 *                           type: integer
 *                           example: 45
 *                         moderate:
 *                           type: integer
 *                           example: 60
 *                         avoid:
 *                           type: integer
 *                           example: 20
 *                     recent_trends:
 *                       type: object
 *                       properties:
 *                         improving:
 *                           type: boolean
 *                           example: true
 *                         score_change:
 *                           type: number
 *                           example: 5.2
 *       401:
 *         description: Unauthorized - invalid token
 *       500:
 *         description: Internal server error
 */
router.get('/user/stats',
  authenticateToken,
  assessmentController.getUserStats
);

/**
 * @swagger
 * /api/assessments/{id}:
 *   delete:
 *     summary: Delete assessment
 *     description: Removes an assessment from user's history
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assessment ID
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Assessment deleted successfully
 *         content:
 *           application/json:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Assessment deleted successfully"
 *       401:
 *         description: Unauthorized - invalid token
 *       404:
 *         description: Assessment not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id',
  authenticateToken,
  [
    param('id')
      .isUUID()
      .withMessage('Valid assessment ID is required')
  ],
  validateRequest,
  assessmentController.deleteAssessment
);

/**
 * @swagger
 * /api/assessments/bulk:
 *   post:
 *     summary: Create bulk assessments
 *     description: Creates multiple assessments in a single request for batch processing
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_ids
 *               - scan_method
 *             properties:
 *               product_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 minItems: 1
 *                 maxItems: 10
 *                 description: Array of product IDs to assess (max 10)
 *                 example: ["550e8400-e29b-41d4-a716-446655440000", "550e8400-e29b-41d4-a716-446655440001"]
 *               scan_method:
 *                 type: string
 *                 enum: [barcode, image, manual, search]
 *                 description: Method used to identify products
 *                 example: "barcode"
 *               scan_location:
 *                 type: string
 *                 maxLength: 100
 *                 description: Optional location where scans were performed
 *                 example: "Grocery Store Shopping Cart"
 *     responses:
 *       201:
 *         description: Bulk assessments created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     assessments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Assessment'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total_processed:
 *                           type: integer
 *                           example: 10
 *                         successful:
 *                           type: integer
 *                           example: 8
 *                         failed:
 *                           type: integer
 *                           example: 2
 *                         avg_health_score:
 *                           type: number
 *                           example: 68.5
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - invalid token
 *       500:
 *         description: Internal server error
 */
router.post('/bulk',
  authenticateToken,
  [
    body('product_ids')
      .isArray({ min: 1, max: 10 })
      .withMessage('Product IDs array is required (max 10 items)'),
    body('product_ids.*')
      .isUUID()
      .withMessage('All product IDs must be valid UUIDs'),
    body('scan_method')
      .isIn(['barcode', 'image', 'manual', 'search'])
      .withMessage('Valid scan method is required')
  ],
  validateRequest,
  assessmentController.bulkAssessment
);

module.exports = router;
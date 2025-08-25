const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, optionalAuth } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validationMiddleware');
const { body, query, param } = require('express-validator');

/**
 * @swagger
 * /api/products/scan/barcode:
 *   post:
 *     summary: Scan Product by Barcode
 *     description: Scan a product using its barcode to get nutritional information and health assessment
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - barcode
 *             properties:
 *               barcode:
 *                 type: string
 *                 pattern: '^\\d{8,14}$'
 *                 description: Product barcode (8-14 digits)
 *                 example: "1234567890123"
 *     responses:
 *       200:
 *         description: Product scanned successfully
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
 *                         product:
 *                           $ref: '#/components/schemas/Product'
 *                         assessment:
 *                           $ref: '#/components/schemas/Assessment'
 *       400:
 *         description: Invalid barcode format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Valid token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/scan/barcode',
  authenticateToken,
  [
    body('barcode')
      .notEmpty()
      .withMessage('Barcode is required')
      .matches(/^\d{8,14}$/)
      .withMessage('Barcode must be 8-14 digits')
  ],
  validateRequest,
  productController.scanBarcode.bind(productController)
);

/**
 * @swagger
 * /api/products/scan/image:
 *   post:
 *     summary: Scan Product by Image
 *     description: Upload a product image to identify the product and get health assessment
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Product image file (JPEG, PNG, WebP)
 *                 maxLength: 10485760
 *     responses:
 *       200:
 *         description: Product image processed successfully
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
 *                         product:
 *                           $ref: '#/components/schemas/Product'
 *                         assessment:
 *                           $ref: '#/components/schemas/Assessment'
 *                         confidence:
 *                           type: number
 *                           description: AI confidence score (0-1)
 *                           example: 0.95
 *       400:
 *         description: Invalid image file or format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Valid token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       413:
 *         description: Image file too large (max 10MB)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/scan/image',
  authenticateToken,
  productController.uploadMiddleware,
  productController.scanImage.bind(productController)
);

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Search Products
 *     description: Search for products by name, brand, or category
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: q
 *         in: query
 *         description: Search query string
 *         required: false
 *         schema:
 *           type: string
 *           minLength: 2
 *           example: "protein bar"
 *       - name: category
 *         in: query
 *         description: Filter by product category
 *         required: false
 *         schema:
 *           type: string
 *           example: "snacks"
 *       - name: brand
 *         in: query
 *         description: Filter by brand name
 *         required: false
 *         schema:
 *           type: string
 *           example: "Clif Bar"
 *       - name: limit
 *         in: query
 *         description: Number of results to return
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *       - name: offset
 *         in: query
 *         description: Number of results to skip
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *     responses:
 *       200:
 *         description: Products found successfully
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
 *                         products:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Product'
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                               example: 150
 *                             limit:
 *                               type: integer
 *                               example: 20
 *                             offset:
 *                               type: integer
 *                               example: 0
 *                             hasMore:
 *                               type: boolean
 *                               example: true
 *       400:
 *         description: Invalid search parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/search',
  optionalAuth,
  [
    query('q')
      .optional()
      .isLength({ min: 2 })
      .withMessage('Search query must be at least 2 characters'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be non-negative')
  ],
  validateRequest,
  productController.searchProducts.bind(productController)
);

/**
 * @swagger
 * /api/products/history:
 *   get:
 *     summary: Get User's Scan History
 *     description: Retrieve user's product scanning history with optional filtering
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Number of results to return
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - name: offset
 *         in: query
 *         description: Number of results to skip
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *       - name: recommendation
 *         in: query
 *         description: Filter by health recommendation
 *         required: false
 *         schema:
 *           type: string
 *           enum: [excellent, good, moderate, avoid]
 *           example: "good"
 *       - name: scan_method
 *         in: query
 *         description: Filter by scan method
 *         required: false
 *         schema:
 *           type: string
 *           enum: [barcode, image, manual, search]
 *           example: "barcode"
 *       - name: date_from
 *         in: query
 *         description: Filter scans from this date (ISO 8601)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *       - name: date_to
 *         in: query
 *         description: Filter scans to this date (ISO 8601)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-12-31"
 *     responses:
 *       200:
 *         description: Scan history retrieved successfully
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
 *                         scans:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               product:
 *                                 $ref: '#/components/schemas/Product'
 *                               assessment:
 *                                 $ref: '#/components/schemas/Assessment'
 *                               scan_method:
 *                                 type: string
 *                                 enum: [barcode, image, manual, search]
 *                               scanned_at:
 *                                 type: string
 *                                 format: date-time
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                               example: 45
 *                             limit:
 *                               type: integer
 *                               example: 20
 *                             offset:
 *                               type: integer
 *                               example: 0
 *                             hasMore:
 *                               type: boolean
 *                               example: true
 *       401:
 *         description: Unauthorized - Valid token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/history',
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
  productController.getUserScanHistory.bind(productController)
);

/**
 * @swagger
 * /api/products/stats:
 *   get:
 *     summary: Get User's Assessment Statistics
 *     description: Get comprehensive statistics about user's product assessments and health patterns
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: period
 *         in: query
 *         description: Time period for statistics
 *         required: false
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year, all]
 *           default: "month"
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
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
 *                         totalScans:
 *                           type: integer
 *                           example: 127
 *                         healthDistribution:
 *                           type: object
 *                           properties:
 *                             excellent:
 *                               type: integer
 *                               example: 23
 *                             good:
 *                               type: integer
 *                               example: 45
 *                             moderate:
 *                               type: integer
 *                               example: 38
 *                             avoid:
 *                               type: integer
 *                               example: 21
 *                         averageHealthScore:
 *                           type: number
 *                           example: 7.2
 *                         topCategories:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               category:
 *                                 type: string
 *                                 example: "snacks"
 *                               count:
 *                                 type: integer
 *                                 example: 34
 *                         scanMethodDistribution:
 *                           type: object
 *                           properties:
 *                             barcode:
 *                               type: integer
 *                               example: 89
 *                             image:
 *                               type: integer
 *                               example: 23
 *                             search:
 *                               type: integer
 *                               example: 15
 *                         weeklyTrend:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               week:
 *                                 type: string
 *                                 example: "2024-W01"
 *                               scans:
 *                                 type: integer
 *                                 example: 12
 *                               avgScore:
 *                                 type: number
 *                                 example: 6.8
 *       401:
 *         description: Unauthorized - Valid token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stats',
  authenticateToken,
  productController.getUserAssessmentStats.bind(productController)
);

/**
 * @swagger
 * /api/products/categories:
 *   get:
 *     summary: Get Product Categories
 *     description: Retrieve all available product categories with counts
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
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
 *                         categories:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "snacks"
 *                               name:
 *                                 type: string
 *                                 example: "Snacks"
 *                               description:
 *                                 type: string
 *                                 example: "Snack foods and treats"
 *                               productCount:
 *                                 type: integer
 *                                 example: 1247
 *                               icon:
 *                                 type: string
 *                                 example: "🍿"
 */
router.get('/categories',
  optionalAuth,
  productController.getCategories.bind(productController)
);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get Product by ID
 *     description: Retrieve detailed information about a specific product
 *     tags: [Products]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Product UUID
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Product retrieved successfully
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
 *                         product:
 *                           $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid product ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id',
  optionalAuth,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid product ID format')
  ],
  validateRequest,
  productController.getProductById.bind(productController)
);

/**
 * @swagger
 * /api/products/{id}/assessment:
 *   get:
 *     summary: Get Personalized Product Assessment
 *     description: Get a personalized health assessment for a product based on user's dietary preferences and health goals
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Product UUID
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Personalized assessment generated successfully
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
 *                         assessment:
 *                           $ref: '#/components/schemas/Assessment'
 *                         product:
 *                           $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid product ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Valid token required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id/assessment',
  authenticateToken,
  [
    param('id')
      .isUUID()
      .withMessage('Invalid product ID format')
  ],
  validateRequest,
  productController.getPersonalizedAssessment.bind(productController)
);

module.exports = router;
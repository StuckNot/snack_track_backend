const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./users');
const productRoutes = require('./productRoutes');
const assessmentRoutes = require('./assessments');

/**
 * 🚀 API ROUTE CONFIGURATION
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health Check
 *     description: Check if the API is running and healthy
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "SnackTrack API is running successfully"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 environment:
 *                   type: string
 *                   example: "development"
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SnackTrack API is running successfully',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * @swagger
 * /api:
 *   get:
 *     summary: API Documentation
 *     description: Get API information and available endpoints
 *     tags: [General]
 *     responses:
 *       200:
 *         description: API documentation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Welcome to SnackTrack API"
 *                 documentation:
 *                   type: object
 *                   description: Available API endpoints
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to SnackTrack API',
    documentation: {
      baseUrl: `${req.protocol}://${req.get('host')}/api`,
      endpoints: {
        users: {
          register: 'POST /api/users/register',
          login: 'POST /api/users/login',
          profile: 'GET /api/users/profile',
          healthTips: 'GET /api/users/health-tips',
          dietaryPreferences: 'GET /api/users/dietary-preferences'
        },
        products: {
          scanBarcode: 'POST /api/products/scan/barcode',
          scanImage: 'POST /api/products/scan/image',
          search: 'GET /api/products/search',
          getProduct: 'GET /api/products/:id',
          getAssessment: 'GET /api/products/:id/assessment',
          history: 'GET /api/products/history',
          stats: 'GET /api/products/stats',
          categories: 'GET /api/products/categories'
        },
        assessments: {
          create: 'POST /api/assessments',
          getById: 'GET /api/assessments/:id',
          update: 'PUT /api/assessments/:id',
          history: 'GET /api/assessments/user/history',
          stats: 'GET /api/assessments/user/stats',
          delete: 'DELETE /api/assessments/:id',
          bulk: 'POST /api/assessments/bulk'
        },
        health: 'GET /api/health'
      }
    }
  });
});

// Mount route modules
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/assessments', assessmentRoutes);

module.exports = router;
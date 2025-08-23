const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./users');
// const productRoutes = require('./products');
// const assessmentRoutes = require('./assessments');

/**
 * 🚀 API ROUTE CONFIGURATION
 */

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SnackTrack API is running successfully',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation endpoint
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
        health: 'GET /api/health'
      }
    }
  });
});

// Mount route modules
router.use('/users', userRoutes);
// router.use('/products', productRoutes);
// router.use('/assessments', assessmentRoutes);

module.exports = router;
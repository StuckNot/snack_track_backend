const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

// 📄 Swagger imports
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

/**
 * 🛡️ SECURITY MIDDLEWARE
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

/**
 * 🌐 CORS CONFIGURATION
 */
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [])
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/**
 * 📊 LOGGING & COMPRESSION
 */
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(compression());

/**
 * 📥 BODY PARSING MIDDLEWARE
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * 📁 STATIC FILE SERVING
 */
app.use('/uploads', express.static('uploads'));

/**
 * 📖 SWAGGER DOCUMENTATION
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SnackTrack API',
      version: '1.0.0',
      description: 'API documentation for SnackTrack backend',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://snack-track-backend.onrender.com'
          : 'http://localhost:5000',
      },
    ],
  },
  apis: ['./routes/*.js'], // <-- yaha tum apne route files ka path daal sakte ho
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * 🚀 API ROUTES
 */
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

/**
 * 📄 ROOT ENDPOINT
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to SnackTrack API! 🥗',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/api/health'
  });
});

/**
 * ❌ ERROR HANDLING MIDDLEWARE
 */

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: {
      api: '/api',
      health: '/api/health',
      users: '/api/users',
      docs: '/api-docs'
    }
  });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error('❌ Error:', error);

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 10MB.'
    });
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Unexpected file field.'
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(error.errors).map(err => err.message)
    });
  }

  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.errors.map(err => err.message)
    });
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry',
      errors: error.errors.map(err => `${err.path} already exists`)
    });
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid reference',
      error: 'The referenced record does not exist'
    });
  }

  if (error.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      success: false,
      message: 'Database connection error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Service temporarily unavailable'
    });
  }

  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

module.exports = app;

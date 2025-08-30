const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

/**
 *  SWAGGER CONFIGURATION
 * API Documentation setup for SnackTrack
 */

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SnackTrack API',
      version: '1.0.0',
      description: 'AI-powered food health assessment API',
      contact: {
        name: 'SnackTrack Team',
        email: 'support@snacktrack.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.snacktrack.com' 
          : `http://localhost:${process.env.PORT || 5000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in the format: Bearer <token>',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique user identifier',
            },
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'Full name of the user',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john.doe@example.com',
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'User password (minimum 8 characters)',
              example: 'SecurePass123!',
            },
            dietary_preferences: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'User dietary preferences',
              example: ['vegetarian', 'gluten-free'],
            },
            health_goals: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'User health goals',
              example: ['weight-loss', 'muscle-gain'],
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
          },
        },
        Product: {
          type: 'object',
          required: ['name'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique product identifier',
            },
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'Product name',
              example: 'Organic Granola Bar',
            },
            brand: {
              type: 'string',
              maxLength: 50,
              description: 'Product brand',
              example: 'Nature Valley',
            },
            barcode: {
              type: 'string',
              pattern: '^\\d{8,14}$',
              description: 'Product barcode (8-14 digits)',
              example: '1234567890123',
            },
            ingredients: {
              type: 'string',
              maxLength: 1000,
              description: 'Product ingredients list',
              example: 'Oats, honey, almonds, dried fruits',
            },
            nutrition_facts: {
              type: 'object',
              properties: {
                calories: { type: 'number', example: 150 },
                protein: { type: 'number', example: 4 },
                carbs: { type: 'number', example: 25 },
                fat: { type: 'number', example: 5 },
                fiber: { type: 'number', example: 3 },
                sugar: { type: 'number', example: 8 },
                sodium: { type: 'number', example: 85 },
              },
            },
            health_score: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'AI-calculated health score (0-100)',
              example: 75,
            },
          },
        },
        Assessment: {
          type: 'object',
          required: ['product_id', 'scan_method'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique assessment identifier',
            },
            product_id: {
              type: 'string',
              format: 'uuid',
              description: 'Product being assessed',
            },
            user_id: {
              type: 'string',
              format: 'uuid',
              description: 'User who performed the assessment',
            },
            scan_method: {
              type: 'string',
              enum: ['barcode', 'image', 'manual', 'search'],
              description: 'Method used to identify the product',
              example: 'barcode',
            },
            health_assessment: {
              type: 'object',
              properties: {
                overall_score: { type: 'number', minimum: 0, maximum: 100 },
                nutritional_balance: { type: 'number', minimum: 0, maximum: 100 },
                ingredient_quality: { type: 'number', minimum: 0, maximum: 100 },
                processing_level: { type: 'string', enum: ['minimal', 'moderate', 'high'] },
                allergen_warnings: { type: 'array', items: { type: 'string' } },
                health_benefits: { type: 'array', items: { type: 'string' } },
                health_concerns: { type: 'array', items: { type: 'string' } },
              },
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Assessment creation timestamp',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Validation failed',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                  value: { type: 'string' },
                },
              },
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              description: 'Success message',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './app.js',
  ],
};

const specs = swaggerJsdoc(options);

const swaggerOptions = {
  explorer: true,
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #2c5aa0; }
  `,
  customSiteTitle: 'SnackTrack API Documentation',
  customfavIcon: '/favicon.ico',
};

module.exports = {
  specs,
  swaggerUi,
  swaggerOptions,
};
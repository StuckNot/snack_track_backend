const { validationResult } = require('express-validator');
const DOMPurify = require('isomorphic-dompurify');

/**
 * 🔍 VALIDATION MIDDLEWARE
 * Middleware for request validation using express-validator
 */

/**
 * Validate request and return errors if any
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

/**
 * Custom validation helpers
 */
const customValidations = {
  /**
   * Check if barcode format is valid
   */
  isValidBarcode: (value) => {
    return /^\d{8,14}$/.test(value);
  },

  /**
   * Check if email domain is allowed
   */
  isAllowedEmailDomain: (email) => {
    // Add any email domain restrictions here if needed
    return true;
  },

  /**
   * Check if password meets strength requirements
   */
  isStrongPassword: (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/.test(password);
  },

  /**
   * Check if health goal is valid
   */
  isValidHealthGoal: (goal) => {
    const validGoals = ['lose_weight', 'gain_muscle', 'maintain', 'improve_health'];
    return validGoals.includes(goal);
  },

  /**
   * Check if dietary preference is valid
   */
  isValidDietaryPreference: (preference) => {
    const validPreferences = ['veg', 'vegan', 'keto', 'paleo', 'gluten_free', 'dairy_free', 'none'];
    return validPreferences.includes(preference);
  },

  /**
   * Check if activity level is valid
   */
  isValidActivityLevel: (level) => {
    const validLevels = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
    return validLevels.includes(level);
  }
};

/**
 * Enhanced XSS Protection - Sanitize input data
 */
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        // Use DOMPurify for comprehensive XSS protection
        req.body[key] = DOMPurify.sanitize(req.body[key], {
          ALLOWED_TAGS: [], // Strip all HTML tags
          ALLOWED_ATTR: [] // Strip all attributes
        }).trim();
      } else if (Array.isArray(req.body[key])) {
        // Sanitize array elements if they are strings
        req.body[key] = req.body[key].map(item => 
          typeof item === 'string' 
            ? DOMPurify.sanitize(item, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim()
            : item
        );
      }
    }
  }
  next();
};

/**
 * Scalable Rate Limiting using Redis (for production)
 * Falls back to in-memory for development
 */
let redisClient = null;

// Try to initialize Redis client
try {
  const redis = require('redis');
  if (process.env.REDIS_URL || process.env.NODE_ENV === 'production') {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    redisClient.on('error', (err) => {
      console.warn('⚠️ Redis connection failed, falling back to in-memory rate limiting:', err.message);
      redisClient = null;
    });
  }
} catch (error) {
  console.warn('⚠️ Redis not available, using in-memory rate limiting');
}

const checkRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  // In-memory fallback for development
  const memoryStore = new Map();
  
  return async (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      if (redisClient && redisClient.isReady) {
        // Use Redis for scalable rate limiting
        const key = `rate_limit:${clientId}`;
        const current = await redisClient.incr(key);
        
        if (current === 1) {
          await redisClient.expire(key, Math.ceil(windowMs / 1000));
        }
        
        if (current > maxRequests) {
          const ttl = await redisClient.ttl(key);
          return res.status(429).json({
            success: false,
            message: 'Too many requests. Please try again later.',
            retryAfter: ttl
          });
        }
      } else {
        // Fallback to in-memory rate limiting
        if (!memoryStore.has(clientId)) {
          memoryStore.set(clientId, { count: 1, resetTime: now + windowMs });
          return next();
        }
        
        const clientData = memoryStore.get(clientId);
        
        if (now > clientData.resetTime) {
          memoryStore.set(clientId, { count: 1, resetTime: now + windowMs });
          return next();
        }
        
        if (clientData.count >= maxRequests) {
          return res.status(429).json({
            success: false,
            message: 'Too many requests. Please try again later.',
            retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
          });
        }
        
        clientData.count++;
      }
      
      next();
    } catch (error) {
      // If rate limiting fails, log error but don't block request
      console.error('Rate limiting error:', error);
      next();
    }
  };
};

module.exports = {
  validateRequest,
  customValidations,
  sanitizeInput,
  checkRateLimit
};
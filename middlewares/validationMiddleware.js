const { validationResult } = require('express-validator');

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
 * Sanitize input data
 */
const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS from string inputs
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        // Basic XSS prevention
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<[^>]*>?/gm, '')
          .trim();
      }
    }
  }
  next();
};

/**
 * Rate limiting validation
 */
const checkRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requests.has(clientId)) {
      requests.set(clientId, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const clientData = requests.get(clientId);
    
    if (now > clientData.resetTime) {
      requests.set(clientId, { count: 1, resetTime: now + windowMs });
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
    next();
  };
};

module.exports = {
  validateRequest,
  customValidations,
  sanitizeInput,
  checkRateLimit
};
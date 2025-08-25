const winston = require('winston');
const path = require('path');

/**
 * 📊 ENHANCED LOGGING SERVICE
 * Comprehensive logging with different levels and structured output
 */

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += ` | Meta: ${JSON.stringify(meta)}`;
    }
    
    // Add stack trace for errors
    if (stack) {
      log += `\nStack: ${stack}`;
    }
    
    return log;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { 
    service: 'snacktrack-api',
    version: process.env.API_VERSION || '1.0.0'
  },
  transports: [
    // Console logging for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    
    // File logging for all levels
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Separate error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Security events log
    new winston.transports.File({
      filename: path.join(logsDir, 'security.log'),
      level: 'warn',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log incoming request
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.userId || 'anonymous',
    requestId: req.id || 'unknown'
  });
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - start;
    
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.userId || 'anonymous',
      requestId: req.id || 'unknown'
    });
    
    originalEnd.apply(res, args);
  };
  
  next();
};

/**
 * Error logging middleware
 */
const errorLogger = (err, req, res, next) => {
  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: req.user?.userId || 'anonymous',
    requestId: req.id || 'unknown'
  });
  
  next(err);
};

/**
 * Security event logger
 */
const securityLogger = {
  logFailedLogin: (email, ip, reason) => {
    logger.warn('Failed login attempt', {
      event: 'failed_login',
      email,
      ip,
      reason,
      timestamp: new Date().toISOString()
    });
  },
  
  logSuccessfulLogin: (userId, email, ip) => {
    logger.info('Successful login', {
      event: 'successful_login',
      userId,
      email,
      ip,
      timestamp: new Date().toISOString()
    });
  },
  
  logUnauthorizedAccess: (req, reason) => {
    logger.warn('Unauthorized access attempt', {
      event: 'unauthorized_access',
      method: req.method,
      url: req.url,
      ip: req.ip,
      reason,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  },
  
  logRateLimitExceeded: (ip, endpoint) => {
    logger.warn('Rate limit exceeded', {
      event: 'rate_limit_exceeded',
      ip,
      endpoint,
      timestamp: new Date().toISOString()
    });
  },
  
  logSuspiciousActivity: (userId, activity, details) => {
    logger.warn('Suspicious activity detected', {
      event: 'suspicious_activity',
      userId,
      activity,
      details,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Business logic logger for important events
 */
const businessLogger = {
  logUserRegistration: (userId, email) => {
    logger.info('New user registered', {
      event: 'user_registration',
      userId,
      email,
      timestamp: new Date().toISOString()
    });
  },
  
  logProductScan: (userId, productId, scanMethod, recommendation) => {
    logger.info('Product scanned', {
      event: 'product_scan',
      userId,
      productId,
      scanMethod,
      recommendation,
      timestamp: new Date().toISOString()
    });
  },
  
  logHealthAssessment: (userId, productId, healthScore, recommendation) => {
    logger.info('Health assessment generated', {
      event: 'health_assessment',
      userId,
      productId,
      healthScore,
      recommendation,
      timestamp: new Date().toISOString()
    });
  },
  
  logApiError: (endpoint, error, userId) => {
    logger.error('API error occurred', {
      event: 'api_error',
      endpoint,
      error: error.message,
      userId,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  logger,
  requestLogger,
  errorLogger,
  securityLogger,
  businessLogger
};
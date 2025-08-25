const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * 🔐 AUTHENTICATION MIDDLEWARE
 * Middleware for JWT token authentication
 */

/**
 * Required authentication - user must be logged in
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID from token
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated.'
      });
    }

    // Add user info to request object
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token expired.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication error.'
    });
  }
};

/**
 * Optional authentication - token not required but will be processed if present
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // No token provided, continue without user info
      req.user = null;
      return next();
    }

    // Token provided, try to authenticate
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (user && user.is_active) {
      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // If token is invalid, continue without user info
    req.user = null;
    next();
  }
};

/**
 * Admin authentication - user must be admin
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    // First authenticate the token
    await new Promise((resolve, reject) => {
      authenticateToken(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
        requiredRole: 'admin',
        userRole: req.user.role
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  authenticateAdmin
};
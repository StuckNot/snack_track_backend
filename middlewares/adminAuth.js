const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * 🔐 ADMIN AUTHENTICATION MIDDLEWARE
 * Verifies that the user is authenticated AND has admin privileges
 */
const adminAuth = async (req, res, next) => {
  try {
    // First check if user is authenticated (basic auth check)
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch full user details including role
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not found.'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Account is deactivated.'
      });
    }

    // 🚨 CRITICAL: Check if user has admin role
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
        requiredRole: 'admin',
        userRole: user.role
      });
    }

    // Add user info to request for use in controller
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

    console.error('❌ Admin Auth Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

module.exports = { adminAuth };
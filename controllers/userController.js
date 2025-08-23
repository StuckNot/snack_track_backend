const userService = require('../services/userService');
const { validationResult } = require('express-validator');

class UserController {
  /**
   * 🔐 AUTHENTICATION ENDPOINTS
   */
  async register(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const result = await userService.register(req.body);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;
      const result = await userService.login(email, password);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 👤 PROFILE MANAGEMENT ENDPOINTS
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.userId; // From auth middleware
      const profile = await userService.getUserProfile(userId);
      
      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: profile
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user.userId;
      const updatedProfile = await userService.updateUserProfile(userId, req.body);
      
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user.userId;
      const { currentPassword, newPassword } = req.body;
      
      const result = await userService.changePassword(userId, currentPassword, newPassword);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 🏥 HEALTH ANALYSIS ENDPOINTS
   */
  async getHealthAnalysis(req, res) {
    try {
      const userId = req.user.userId;
      const analysis = await userService.getHealthAnalysis(userId);
      
      res.status(200).json({
        success: true,
        message: 'Health analysis retrieved successfully',
        data: analysis
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 🔍 SEARCH & DISCOVERY ENDPOINTS
   */
  async searchUsers(req, res) {
    try {
      const filters = {
        health_goal: req.query.health_goal,
        dietary_preference: req.query.dietary_preference,
        allergy: req.query.allergy,
        limit: parseInt(req.query.limit) || 10,
        offset: parseInt(req.query.offset) || 0
      };

      const result = await userService.searchUsers(filters);
      
      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 📊 ANALYTICS ENDPOINTS (Admin only)
   */
  async getAnalytics(req, res) {
    try {
      // This endpoint would typically require admin authentication
      const analytics = await userService.getUserAnalytics();
      
      res.status(200).json({
        success: true,
        message: 'Analytics retrieved successfully',
        data: analytics
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 🎯 HEALTH COMPATIBILITY ENDPOINTS
   */
  async checkProductCompatibility(req, res) {
    try {
      const userId = req.user.userId;
      const { ingredients } = req.body;
      
      const user = await userService.getUserProfile(userId);
      
      // Check allergy compatibility
      const allergyCheck = ingredients.map(ingredient => ({
        ingredient,
        hasAllergy: user.hasAllergy ? user.hasAllergy(ingredient) : false
      }));
      
      // Check dietary compatibility
      const dietaryCompatible = user.isCompatibleWith ? user.isCompatibleWith(ingredients) : true;
      
      res.status(200).json({
        success: true,
        message: 'Compatibility check completed',
        data: {
          allergyChecks: allergyCheck,
          dietaryCompatible,
          overallCompatible: !allergyCheck.some(check => check.hasAllergy) && dietaryCompatible,
          dietaryRestrictions: user.dietaryRestrictions || []
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 📈 HEALTH METRICS ENDPOINTS
   */
  async getHealthMetrics(req, res) {
    try {
      const userId = req.user.userId;
      const user = await userService.getUserProfile(userId);
      
      const metrics = {
        bmi: user.BMI || user.calculateBMI?.(),
        bmiCategory: user.bmiCategory || user.getBMICategory?.(),
        dailyCalories: user.dailyCalories || user.calculateDailyCalories?.(),
        idealWeightRange: user.idealWeightRange || user.getIdealWeightRange?.(),
        calculatedAge: user.calculatedAge || user.calculateAge?.()
      };
      
      res.status(200).json({
        success: true,
        message: 'Health metrics retrieved successfully',
        data: metrics
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 📱 UTILITY ENDPOINTS
   */
  async uploadProfilePicture(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      const userId = req.user.userId;
      const imageUrl = `/uploads/images/${req.file.filename}`;
      
      const updatedProfile = await userService.updateUserProfile(userId, {
        profile_picture: imageUrl
      });
      
      res.status(200).json({
        success: true,
        message: 'Profile picture uploaded successfully',
        data: {
          profile_picture: imageUrl,
          user: updatedProfile
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deactivateAccount(req, res) {
    try {
      const userId = req.user.userId;
      
      const updatedProfile = await userService.updateUserProfile(userId, {
        is_active: false
      });
      
      res.status(200).json({
        success: true,
        message: 'Account deactivated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new UserController();
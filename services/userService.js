const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserService {
  /**
   * 🔐 USER AUTHENTICATION METHODS
   */
  async register(userData) {
    try {
      // Check if user already exists
      console.log("0");
      const existingUser = await User.findByEmail(userData.email);
      console.log("1");
      if (existingUser) {
        throw new Error('User already exists with this email');
      }
        console.log("2");
      // Create new user (password will be hashed in beforeCreate hook)
      const user = await User.create(userData);
      
      // Generate JWT token
      const token = this.generateToken(user.id);
      console.log("3");
      return {
        user: user.toSafeObject(),
        token
      };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
      console.log("4");
    }
  }

  async login(email, password) {
    try {
      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Validate password
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await user.update({ last_login: new Date() });

      // Generate JWT token
      const token = this.generateToken(user.id);

      return {
        user: user.toSafeObject(),
        token
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
  }

  /**
   * 👤 USER PROFILE METHODS
   */
  async getUserProfile(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user.toSafeObject();
    } catch (error) {
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  async updateUserProfile(userId, updateData) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update user (BMI and other calculations will happen in beforeUpdate hook)
      await user.update(updateData);
      
      return user.toSafeObject();
    } catch (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate current password
      const isValidPassword = await user.validatePassword(currentPassword);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Update password (will be hashed in beforeUpdate hook)
      await user.update({ password: newPassword });
      
      return { message: 'Password updated successfully' };
    } catch (error) {
      throw new Error(`Failed to change password: ${error.message}`);
    }
  }

  /**
   * 🏥 HEALTH ANALYSIS METHODS
   */
  async getHealthAnalysis(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return {
        basicInfo: user.toHealthProfile(),
        recommendations: this.generateHealthRecommendations(user),
        riskFactors: this.analyzeRiskFactors(user),
        nutritionTargets: this.calculateNutritionTargets(user)
      };
    } catch (error) {
      throw new Error(`Failed to get health analysis: ${error.message}`);
    }
  }

  generateHealthRecommendations(user) {
    const recommendations = [];
    const bmi = user.calculateBMI();
    const bmiCategory = user.getBMICategory();

    // BMI-based recommendations
    if (bmiCategory === 'Underweight') {
      recommendations.push('Consider consulting a nutritionist for healthy weight gain strategies');
      recommendations.push('Focus on nutrient-dense, calorie-rich foods');
    } else if (bmiCategory === 'Overweight' || bmiCategory === 'Obese') {
      recommendations.push('Consider a balanced diet with calorie deficit for healthy weight loss');
      recommendations.push('Increase physical activity gradually');
    }

    // Activity level recommendations
    if (user.activity_level === 'sedentary') {
      recommendations.push('Try to incorporate at least 150 minutes of moderate exercise per week');
      recommendations.push('Start with short walks and gradually increase activity');
    }

    // Health goal specific recommendations
    if (user.health_goals === 'lose_weight') {
      recommendations.push('Focus on creating a sustainable calorie deficit');
      recommendations.push('Prioritize protein intake to maintain muscle mass');
    } else if (user.health_goals === 'gain_muscle') {
      recommendations.push('Ensure adequate protein intake (1.6-2.2g per kg body weight)');
      recommendations.push('Include resistance training in your routine');
    }

    return recommendations;
  }

  analyzeRiskFactors(user) {
    const risks = [];
    const bmi = user.calculateBMI();

    if (bmi && bmi >= 30) {
      risks.push({ factor: 'Obesity', level: 'High', description: 'BMI indicates obesity, increasing risk of chronic diseases' });
    } else if (bmi && bmi >= 25) {
      risks.push({ factor: 'Overweight', level: 'Moderate', description: 'BMI indicates overweight, monitor for health complications' });
    }

    if (user.activity_level === 'sedentary') {
      risks.push({ factor: 'Sedentary Lifestyle', level: 'Moderate', description: 'Low activity increases risk of cardiovascular disease' });
    }

    if (user.age >= 40) {
      risks.push({ factor: 'Age', level: 'Low', description: 'Regular health screenings recommended' });
    }

    return risks;
  }

  calculateNutritionTargets(user) {
    const dailyCalories = user.calculateDailyCalories();
    if (!dailyCalories) return null;

    // Macronutrient distribution based on health goals
    let proteinPercent, carbPercent, fatPercent;

    switch (user.health_goals) {
      case 'lose_weight':
        proteinPercent = 0.30;
        carbPercent = 0.35;
        fatPercent = 0.35;
        break;
      case 'gain_muscle':
        proteinPercent = 0.25;
        carbPercent = 0.45;
        fatPercent = 0.30;
        break;
      default:
        proteinPercent = 0.20;
        carbPercent = 0.50;
        fatPercent = 0.30;
    }

    return {
      calories: dailyCalories,
      protein: Math.round((dailyCalories * proteinPercent) / 4), // 4 cal per gram
      carbs: Math.round((dailyCalories * carbPercent) / 4),
      fat: Math.round((dailyCalories * fatPercent) / 9), // 9 cal per gram
      fiber: user.gender === 'Male' ? 38 : 25, // grams per day
      water: Math.round(user.weight * 35) // ml per kg body weight
    };
  }

  /**
   * 🔍 SEARCH & FILTER METHODS
   */
  async searchUsers(filters = {}) {
    try {
      const { health_goal, dietary_preference, allergy, limit = 10, offset = 0 } = filters;
      
      // Build dynamic WHERE clause with all filters applied at database level
      const whereClause = { is_active: true };
      
      // Add health goal filter
      if (health_goal) {
        whereClause.health_goals = health_goal;
      }
      
      // Add dietary preference filter
      if (dietary_preference) {
        whereClause.dietary_preferences = dietary_preference;
      }
      
      // Add allergy filter using array containment
      if (allergy) {
        whereClause.allergies = {
          [User.sequelize.Op.contains]: [allergy.toLowerCase()]
        };
      }

      // Execute single optimized query with all filters
      const { count, rows } = await User.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']], // Most recent users first
        attributes: { exclude: ['password'] } // Security: never return password
      });
      
      return {
        users: rows.map(user => user.toPublicObject()),
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < count
      };
    } catch (error) {
      throw new Error(`Failed to search users: ${error.message}`);
    }
  }

  /**
   * 📊 ANALYTICS METHODS
   */
  async getUserAnalytics() {
    try {
      const stats = await User.getUserStats();
      
      return {
        overview: {
          totalUsers: stats.total,
          activeUsers: stats.active,
          verifiedUsers: stats.verified,
          verificationRate: stats.total > 0 ? ((stats.verified / stats.total) * 100).toFixed(2) + '%' : '0.00%'
        },
        demographics: {
          gender: stats.genderDistribution,
          healthGoals: stats.healthGoalDistribution
        },
        trends: await this.calculateUserTrends()
      };
    } catch (error) {
      throw new Error(`Failed to get user analytics: ${error.message}`);
    }
  }

  async calculateUserTrends() {
    // This would typically involve time-series analysis
    // For demo purposes, returning mock trend data
    return {
      newUsersThisMonth: 45,
      averageBMI: 24.2,
      popularDietaryPreference: 'veg',
      mostCommonHealthGoal: 'maintain'
    };
  }
}

module.exports = new UserService();
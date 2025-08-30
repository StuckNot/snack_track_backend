'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * 🔗 ASSOCIATIONS - Define relationships with other models
     */
    static associate(models) {
      // User has many product assessments
      User.hasMany(models.UserProductAssessment, {
        foreignKey: 'user_id',
        as: 'assessments'
      });

      // User has many favorites
      User.hasMany(models.UserFavorite, {
        foreignKey: 'user_id',
        as: 'favorites'
      });

      // User can favorite many products (many-to-many through UserFavorite)
      User.belongsToMany(models.Product, {
        through: models.UserFavorite,
        foreignKey: 'user_id',
        otherKey: 'product_id',
        as: 'favoriteProducts'
      });
    }

    /**
     * 🔐 PASSWORD MANAGEMENT METHODS
     */
    async validatePassword(password) {
      return bcrypt.compare(password, this.password);
    }

    static validatePasswordStrength(password) {
      const minLength = 8;
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasNonalphas = /\W/.test(password);

      if (password.length < minLength) {
        throw new Error('Password must be at least 8 characters long');
      }
      if (!hasUpperCase) {
        throw new Error('Password must contain at least one uppercase letter');
      }
      if (!hasLowerCase) {
        throw new Error('Password must contain at least one lowercase letter');
      }
      if (!hasNumbers) {
        throw new Error('Password must contain at least one number');
      }
      if (!hasNonalphas) {
        throw new Error('Password must contain at least one special character');
      }
      
      return true;
    }

    /**
     * 📊 HEALTH CALCULATION METHODS
     */
    calculateBMI() {
      if (this.height && this.weight) {
        const heightInMeters = this.height / 100;
        const bmi = this.weight / (heightInMeters * heightInMeters);
        return parseFloat(bmi.toFixed(2));
      }
      return null;
    }

    getBMICategory() {
      const bmi = this.BMI || this.calculateBMI();
      if (!bmi) return 'Unknown';
      if (bmi < 18.5) return 'Underweight';
      if (bmi < 25) return 'Normal';
      if (bmi < 30) return 'Overweight';
      return 'Obese';
    }

    calculateDailyCalories() {
      if (!this.age || !this.weight || !this.height || !this.gender) return null;

      // Mifflin-St Jeor Equation
      let bmr;
      if (this.gender === 'Male') {
        bmr = 10 * this.weight + 6.25 * this.height - 5 * this.age + 5;
      } else if (this.gender === 'Female') {
        bmr = 10 * this.weight + 6.25 * this.height - 5 * this.age - 161;
      } else {
        // Use average for 'Other'
        bmr = 10 * this.weight + 6.25 * this.height - 5 * this.age - 78;
      }

      // Activity level multipliers
      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
      };

      const multiplier = activityMultipliers[this.activity_level] || 1.55;
      return Math.round(bmr * multiplier);
    }

    getIdealWeightRange() {
      if (!this.height) return null;
      
      const heightInMeters = this.height / 100;
      const minWeight = 18.5 * heightInMeters * heightInMeters;
      const maxWeight = 24.9 * heightInMeters * heightInMeters;
      
      return {
        min: Math.round(minWeight * 10) / 10,
        max: Math.round(maxWeight * 10) / 10
      };
    }

    /**
     * 📅 AGE CALCULATION METHOD
     */
    calculateAge() {
      if (!this.date_of_birth) return this.age;
      
      const today = new Date();
      const birthDate = new Date(this.date_of_birth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    }

    /**
     * 🥗 ALLERGY & DIETARY METHODS
     */
    hasAllergy(ingredient) {
      if (!this.allergies || this.allergies.length === 0) return false;
      
      return this.allergies.some(allergy => 
        ingredient.toLowerCase().includes(allergy.toLowerCase()) ||
        allergy.toLowerCase().includes(ingredient.toLowerCase())
      );
    }

    isCompatibleWith(ingredients) {
      if (this.dietary_preferences === 'none') return true;
      
      const ingredientText = ingredients.join(' ').toLowerCase();
      
      const restrictions = {
        veg: ['meat', 'chicken', 'beef', 'pork', 'fish', 'seafood'],
        vegan: ['meat', 'chicken', 'beef', 'pork', 'fish', 'seafood', 'milk', 'egg', 'honey', 'cheese', 'butter', 'yogurt'],
        keto: [], // Will check carbs in nutrition facts
        paleo: ['grain', 'wheat', 'rice', 'corn', 'legume', 'bean', 'dairy'],
        gluten_free: ['wheat', 'gluten', 'barley', 'rye', 'malt'],
        dairy_free: ['milk', 'cheese', 'butter', 'yogurt', 'cream', 'lactose']
      };

      const forbidden = restrictions[this.dietary_preferences] || [];
      return !forbidden.some(item => ingredientText.includes(item));
    }

    getDietaryRestrictions() {
      const restrictions = [];
      
      if (this.allergies && this.allergies.length > 0) {
        restrictions.push(...this.allergies.map(allergy => `Allergic to ${allergy}`));
      }
      
      if (this.dietary_preferences !== 'none') {
        restrictions.push(this.dietary_preferences.replace('_', ' ').toUpperCase());
      }
      
      return restrictions;
    }

    /**
     * 🏥 HEALTH CONDITIONS METHODS
     */
    hasHealthCondition(condition) {
      if (!this.health_conditions || this.health_conditions.length === 0) return false;
      return this.health_conditions.includes(condition.toLowerCase());
    }

    getDietaryRestrictionsForConditions() {
      const restrictions = [];
      
      if (this.hasHealthCondition('diabetes')) {
        restrictions.push('Limit sugar and refined carbs');
      }
      if (this.hasHealthCondition('hypertension')) {
        restrictions.push('Limit sodium intake');
      }
      if (this.hasHealthCondition('heart_disease')) {
        restrictions.push('Limit saturated fats and trans fats');
      }
      if (this.hasHealthCondition('kidney_disease')) {
        restrictions.push('Limit protein and sodium');
      }
      
      return restrictions;
    }

    getMedicationInteractions() {
      const interactions = [];
      
      if (this.medications && this.medications.length > 0) {
        // Common medication-food interactions
        if (this.medications.includes('warfarin')) {
          interactions.push('Limit vitamin K rich foods');
        }
        if (this.medications.includes('insulin')) {
          interactions.push('Monitor carbohydrate intake');
        }
        // Add more medication interactions as needed
      }
      
      return interactions;
    }

    /**
     * 🔒 DATA PRIVACY & SAFETY METHODS
     */
    toSafeObject() {
      const { password, ...safeUser } = this.toJSON();
      return {
        ...safeUser,
        bmiCategory: this.getBMICategory(),
        dailyCalories: this.calculateDailyCalories(),
        idealWeightRange: this.getIdealWeightRange(),
        calculatedAge: this.calculateAge(),
        dietaryRestrictions: this.getDietaryRestrictions()
      };
    }

    toPublicObject() {
      return {
        id: this.id,
        name: this.name,
        profile_picture: this.profile_picture,
        created_at: this.created_at
      };
    }

    toHealthProfile() {
      return {
        id: this.id,
        age: this.calculateAge(),
        gender: this.gender,
        height: this.height,
        weight: this.weight,
        BMI: this.BMI,
        bmiCategory: this.getBMICategory(),
        allergies: this.allergies,
        dietary_preferences: this.dietary_preferences,
        health_goals: this.health_goals,
        activity_level: this.activity_level,
        dailyCalories: this.calculateDailyCalories()
      };
    }

    //SECURITY METHODS
    isAccountLocked() {
      return this.account_locked_until && new Date() < this.account_locked_until;
    }

    incrementFailedLoginAttempts() {
      this.failed_login_attempts += 1;
      
      // Lock account after 5 failed attempts for 30 minutes
      if (this.failed_login_attempts >= 5) {
        this.account_locked_until = new Date(Date.now() + 30 * 60 * 1000);
      }
    }

    resetFailedLoginAttempts() {
      this.failed_login_attempts = 0;
      this.account_locked_until = null;
    }

    generatePasswordResetToken() {
      const crypto = require('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      this.password_reset_token = token;
      this.password_reset_expires = new Date(Date.now() + 3600000); // 1 hour
      return token;
    }

    generateEmailVerificationToken() {
      const crypto = require('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      this.email_verification_token = token;
      return token;
    }

    /**
     * 📊 ENHANCED HEALTH METHODS
     */
    getEffectiveDailyCalories() {
      return this.daily_calorie_goal || this.calculateDailyCalories();
    }

    getHealthRiskFactors() {
      const risks = [];
      
      const bmi = this.calculateBMI();
      if (bmi && bmi > 30) risks.push('Obesity');
      if (bmi && bmi < 18.5) risks.push('Underweight');
      
      if (this.hasHealthCondition('diabetes')) risks.push('Diabetes');
      if (this.hasHealthCondition('hypertension')) risks.push('High Blood Pressure');
      if (this.hasHealthCondition('heart_disease')) risks.push('Heart Disease');
      
      return risks;
    }

    //LOCALIZATION METHODS
    getLocalizedHealthProfile() {
      const profile = this.toHealthProfile();
      
      // Add localization based on country/language
      if (this.country === 'US') {
        profile.heightUnit = 'feet/inches';
        profile.weightUnit = 'lbs';
      } else {
        profile.heightUnit = 'cm';
        profile.weightUnit = 'kg';
      }
      
      return profile;
    }

    //STATIC QUERY METHODS
static async findByEmail(email) {
  console.log("findByEmail called with:", email);

  try {
    const user = await this.findOne({
      where: { email: String(email).toLowerCase().trim() }
    });
    console.log("findOne result:", user ? user.id : null);
    return user;
  } catch (err) {
    console.error("findOne error:", err.message);
    console.error(err.stack);
    throw err; // rethrow so service sees it
  }
}

    static async findActiveUsers() {
      return await this.findAll({
        where: { is_active: true }
      });
    }

    static async findByHealthGoal(goal) {
      return await this.findAll({
        where: { health_goals: goal }
      });
    }

    static async findUsersWithAllergy(allergy) {
      return await this.findAll({
        where: {
          allergies: {
            [sequelize.Op.contains]: [allergy.toLowerCase()]
          }
        }
      });
    }

    static async getUserStats() {
      const totalUsers = await this.count();
      const activeUsers = await this.count({ where: { is_active: true } });
      const verifiedUsers = await this.count({ where: { email_verified: true } });
      
      const genderStats = await this.findAll({
        attributes: [
          'gender',
          [sequelize.fn('COUNT', sequelize.col('gender')), 'count']
        ],
        group: 'gender'
      });

      const healthGoalStats = await this.findAll({
        attributes: [
          'health_goals',
          [sequelize.fn('COUNT', sequelize.col('health_goals')), 'count']
        ],
        group: 'health_goals'
      });

      return {
        total: totalUsers,
        active: activeUsers,
        verified: verifiedUsers,
        genderDistribution: genderStats,
        healthGoalDistribution: healthGoalStats
      };
    }
  }

  /**
   * 📋 MODEL DEFINITION - Database Schema
   */
  User.init({
    // Identity Fields
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100],
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100],
        notEmpty: true
      }
    },

    // Physical Characteristics
    age: {
      type: DataTypes.INTEGER,
      validate: {
        min: 13,
        max: 120
      }
    },
    gender: {
      type: DataTypes.ENUM('Male', 'Female', 'Other'),
      allowNull: true
    },
    height: {
      type: DataTypes.FLOAT,
      comment: 'Height in centimeters',
      validate: {
        min: 50,
        max: 300
      }
    },
    weight: {
      type: DataTypes.FLOAT,
      comment: 'Weight in kilograms',
      validate: {
        min: 20,
        max: 500
      }
    },
    BMI: {
      type: DataTypes.FLOAT,
       field: 'BMI' ,
      comment: 'Body Mass Index - auto calculated'
    },

    // Health & Dietary Information
    allergies: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of allergy strings ["nuts", "dairy"]'
    },
    health_conditions: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of health conditions ["diabetes", "hypertension", "heart_disease"]'
    },
    medications: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of current medications that may affect dietary choices'
    },
    dietary_preferences: {
      type: DataTypes.ENUM('veg', 'vegan', 'keto', 'paleo', 'gluten_free', 'dairy_free', 'none'),
      defaultValue: 'none'
    },
    health_goals: {
      type: DataTypes.ENUM('lose_weight', 'gain_muscle', 'maintain', 'improve_health'),
      defaultValue: 'maintain'
    },
    activity_level: {
      type: DataTypes.ENUM('sedentary', 'light', 'moderate', 'active', 'very_active'),
      defaultValue: 'moderate'
    },

    // User Preferences & Settings
    notification_preferences: {
      type: DataTypes.JSON,
      defaultValue: {
        email_notifications: true,
        push_notifications: true,
        weekly_reports: true,
        allergy_alerts: true
      },
      comment: 'User notification preferences'
    },
    privacy_settings: {
      type: DataTypes.JSON,
      defaultValue: {
        profile_visibility: 'private',
        share_health_data: false,
        allow_analytics: true
      },
      comment: 'User privacy preferences'
    },
    daily_calorie_goal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 800,
        max: 5000
      },
      comment: 'Custom daily calorie goal (overrides calculated value)'
    },

    // Security & Authentication
    email_verification_token: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Token for email verification'
    },
    password_reset_token: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Token for password reset'
    },
    password_reset_expires: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Expiration time for password reset token'
    },
    failed_login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Track failed login attempts for security'
    },
    account_locked_until: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Account lock timestamp for security'
    },
    
    // Enhanced Profile Fields
    country: {
      type: DataTypes.STRING(2),
      allowNull: true,
      validate: {
        len: [2, 2]
      },
      comment: 'ISO country code for localization'
    },
    timezone: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'User timezone for proper scheduling'
    },
    language_preference: {
      type: DataTypes.STRING(5),
      defaultValue: 'en',
      comment: 'User language preference (ISO 639-1)'
    },

    // Additional Fields
    date_of_birth: {
      type: DataTypes.DATE,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      validate: {
        len: [10, 15]
      }
    },
    profile_picture: {
      type: DataTypes.STRING,
      comment: 'URL to profile image'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    last_login: {
      type: DataTypes.DATE
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user',
      comment: 'User role for access control'
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    
    /**
     * 🪝 MODEL HOOKS - Automatic Processing
     */
    hooks: {
      beforeCreate: async (user) => {
        // 1. Hash password
        if (user.password) {
          User.validatePasswordStrength(user.password);
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }

        // 2. Calculate BMI
        if (user.height && user.weight) {
          user.BMI = user.calculateBMI();
        }

        // 3. Calculate age from date of birth
        if (user.date_of_birth && !user.age) {
          user.age = user.calculateAge();
        }

        // 4. Normalize email
        if (user.email) {
          user.email = user.email.toLowerCase().trim();
        }

        // 5. Normalize allergies
        if (user.allergies && Array.isArray(user.allergies)) {
          user.allergies = user.allergies.map(allergy => 
            allergy.toLowerCase().trim()
          );
        }

        // 6. Normalize health conditions
        if (user.health_conditions && Array.isArray(user.health_conditions)) {
          user.health_conditions = user.health_conditions.map(condition => 
            condition.toLowerCase().trim()
          );
        }

        // 7. Normalize medications
        if (user.medications && Array.isArray(user.medications)) {
          user.medications = user.medications.map(medication => 
            medication.toLowerCase().trim()
          );
        }

        // 8. Generate email verification token
        if (!user.email_verified) {
          user.generateEmailVerificationToken();
        }

        // 9. Set default country if not provided (could be detected from IP)
        if (!user.country) {
          user.country = 'US'; // Default, could be determined by geolocation
        }
      },

      beforeUpdate: async (user) => {
        // 1. Hash password if changed
        if (user.changed('password')) {
          User.validatePasswordStrength(user.password);
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }

        // 2. Recalculate BMI if height or weight changed
        if (user.changed('height') || user.changed('weight')) {
          if (user.height && user.weight) {
            user.BMI = user.calculateBMI();
          }
        }

        // 3. Update age if date_of_birth changed
        if (user.changed('date_of_birth')) {
          user.age = user.calculateAge();
        }

        // 4. Normalize email if changed
        if (user.changed('email')) {
          user.email = user.email.toLowerCase().trim();
          user.email_verified = false; // Reset verification status
          user.generateEmailVerificationToken();
        }

        // 5. Normalize health data if changed
        if (user.changed('allergies') && user.allergies && Array.isArray(user.allergies)) {
          user.allergies = user.allergies.map(allergy => 
            allergy.toLowerCase().trim()
          );
        }

        if (user.changed('health_conditions') && user.health_conditions && Array.isArray(user.health_conditions)) {
          user.health_conditions = user.health_conditions.map(condition => 
            condition.toLowerCase().trim()
          );
        }

        if (user.changed('medications') && user.medications && Array.isArray(user.medications)) {
          user.medications = user.medications.map(medication => 
            medication.toLowerCase().trim()
          );
        }
      },

      afterCreate: async (user) => {
        console.log(`✅ New user registered: ${user.email}`);
        // Here you could:
        // - Send welcome email
        // - Create user preferences record
        // - Log analytics event
      }
    }
  });

  return User;
};
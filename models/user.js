'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * 🔗 ASSOCIATIONS - Define relationships with other models
     */
    static associate(models) {
      // User has many product assessments (will be uncommented when we create the model)
      // User.hasMany(models.UserProductAssessment, {
      //   foreignKey: 'user_id',
      //   as: 'assessments'
      // });

      // Future associations (when we build them)
      // User.belongsToMany(models.Product, {
      //   through: 'UserFavorites',
      //   foreignKey: 'user_id',
      //   as: 'favorites'
      // });
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

    /**
     * 🔍 STATIC QUERY METHODS
     */
    static async findByEmail(email) {
      return await this.findOne({
        where: { email: email.toLowerCase().trim() }
      });
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
      comment: 'Body Mass Index - auto calculated'
    },

    // Health & Dietary Information
    allergies: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of allergy strings ["nuts", "dairy"]'
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
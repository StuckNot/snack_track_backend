'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class NutritionFact extends Model {
    /**
     * ASSOCIATIONS
     */
    static associate(models) {
      // NutritionFact belongs to a product
      NutritionFact.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
    }

    /**
     * NUTRITION ANALYSIS METHODS
     */
    calculateHealthScore() {
      let score = 50; // Base score
      
      // Positive factors (increase score)
      if (this.protein > 10) score += 15;
      if (this.fiber > 3) score += 15;
      if (this.sodium < 140) score += 10;
      if (this.sugar < 5) score += 10;
      
      // Negative factors (decrease score)
      if (this.sugar > 15) score -= 20;
      if (this.sodium > 600) score -= 25;
      if (this.saturated_fat > 5) score -= 15;
      if (this.trans_fat > 0) score -= 30;
      
      return Math.max(0, Math.min(100, score));
    }

    getNutritionDensity() {
      if (!this.calories || this.calories === 0) return 0;
      
      // Calculate nutrition density based on beneficial nutrients per calorie
      const beneficialNutrients = (this.protein || 0) + (this.fiber || 0) + (this.vitamin_c || 0);
      return (beneficialNutrients / this.calories * 100).toFixed(2);
    }

    getWHOSodiumRating() {
      if (this.sodium <= 120) return 'Low';
      if (this.sodium <= 600) return 'Medium';
      return 'High';
    }

    getFDAsugarRating() {
      if (this.sugar <= 5) return 'Low';
      if (this.sugar <= 15) return 'Medium';
      return 'High';
    }

    /**
     * CATEGORIZATION METHODS
     */
    isKeto() {
      const netCarbs = (this.carbs || 0) - (this.fiber || 0);
      return netCarbs <= 5; // 5g net carbs or less
    }

    isLowCalorie() {
      return this.calories <= 40; // FDA definition
    }

    isHighProtein() {
      return this.protein >= 10; // 10g+ protein per serving
    }

    isHighFiber() {
      return this.fiber >= 3; // 3g+ fiber per serving
    }

    /**
     * COMPARISON METHODS
     */
    compareWith(otherNutrition) {
      return {
        calories: this.calories - otherNutrition.calories,
        protein: this.protein - otherNutrition.protein,
        carbs: this.carbs - otherNutrition.carbs,
        fat: this.fat - otherNutrition.fat,
        sodium: this.sodium - otherNutrition.sodium,
        sugar: this.sugar - otherNutrition.sugar
      };
    }

    /**
     * DATA FORMATTING METHODS
     */
    toSummary() {
      return {
        id: this.id,
        calories: this.calories,
        macronutrients: {
          protein: this.protein,
          carbs: this.carbs,
          fat: this.fat
        },
        highlights: {
          isHighProtein: this.isHighProtein(),
          isHighFiber: this.isHighFiber(),
          isKeto: this.isKeto(),
          isLowCalorie: this.isLowCalorie()
        },
        ratings: {
          sodium: this.getWHOSodiumRating(),
          sugar: this.getFDAsugarRating(),
          healthScore: this.calculateHealthScore()
        }
      };
    }
  }

  NutritionFact.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    
    // Basic Nutrition (per serving)
    calories: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: 0,
        max: 2000
      }
    },
    serving_size_g: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Serving size in grams'
    },
    
    // Macronutrients (grams)
    protein: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { min: 0 }
    },
    carbs: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { min: 0 }
    },
    fat: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { min: 0 }
    },
    saturated_fat: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { min: 0 }
    },
    trans_fat: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { min: 0 }
    },
    
    // Micronutrients & Others (grams/milligrams)
    fiber: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { min: 0 }
    },
    sugar: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { min: 0 }
    },
    sodium: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { min: 0 },
      comment: 'Sodium in milligrams'
    },
    cholesterol: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: { min: 0 },
      comment: 'Cholesterol in milligrams'
    },
    
    // Vitamins & Minerals (% daily value)
    vitamin_c: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Vitamin C % daily value'
    },
    calcium: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Calcium % daily value'
    },
    iron: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Iron % daily value'
    },
    
    // Calculated fields
    health_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      },
      comment: 'Calculated health score 0-100'
    },
    
    // Data quality
    data_quality: {
      type: DataTypes.ENUM('complete', 'partial', 'estimated'),
      defaultValue: 'partial',
      comment: 'Quality of nutrition data'
    },
    verified_by: {
      type: DataTypes.ENUM('api', 'admin', 'community', 'none'),
      defaultValue: 'none'
    }
  }, {
    sequelize,
    modelName: 'NutritionFact',
    tableName: 'nutrition_facts',
    
    hooks: {
      beforeSave: async (nutrition) => {
        // Auto-calculate health score before saving
        nutrition.health_score = nutrition.calculateHealthScore();
      }
    },
    
    indexes: [
      { fields: ['product_id'] },
      { fields: ['health_score'] },
      { fields: ['calories'] }
    ]
  });

  return NutritionFact;
};
'use strict';
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  class Product extends Model {
    /**
     * ASSOCIATIONS
     */
    static associate(models) {
      // Product has one nutrition profile
      Product.hasOne(models.NutritionFact, {
        foreignKey: 'product_id',
        as: 'nutrition'
      });

      // Product has many user assessments
      Product.hasMany(models.UserProductAssessment, {
        foreignKey: 'product_id',
        as: 'assessments'
      });

      // Product belongs to a category
      Product.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category'
      });

      // Product has many ingredients
      Product.hasMany(models.Ingredient, {
        foreignKey: 'product_id',
        as: 'ingredientList'
      });

      // Product has many favorites
      Product.hasMany(models.UserFavorite, {
        foreignKey: 'product_id',
        as: 'favorites'
      });

      // Product can be favorited by many users (many-to-many through UserFavorite)
      Product.belongsToMany(models.User, {
        through: models.UserFavorite,
        foreignKey: 'product_id',
        otherKey: 'user_id',
        as: 'favoritedByUsers'
      });
    }

    /**
     * HEALTH ASSESSMENT METHODS
     */
    calculateHealthScore() {
      if (!this.nutrition) return null;
      
      let score = 50; // Base score
      
      // Positive factors (increase score)
      if (this.nutrition.protein > 10) score += 15;
      if (this.nutrition.fiber > 3) score += 15;
      if (this.nutrition.sodium < 140) score += 10;
      
      // Negative factors (decrease score)
      if (this.nutrition.sugar > 15) score -= 20;
      if (this.nutrition.sodium > 600) score -= 25;
      if (this.nutrition.fat > 20) score -= 15;
      
      return Math.max(0, Math.min(100, score));
    }

    isHighInSodium() {
      return this.nutrition?.sodium > 600; // mg per serving
    }

    isHighInSugar() {
      return this.nutrition?.sugar > 15; // g per serving
    }

    isHighProtein() {
      return this.nutrition?.protein > 10; // g per serving
    }

    isHighFiber() {
      return this.nutrition?.fiber > 3; // g per serving
    }

    /**
     * CATEGORIZATION METHODS
     */
    getHealthCategory() {
      const score = this.calculateHealthScore();
      if (score >= 80) return 'Excellent';
      if (score >= 60) return 'Good';
      if (score >= 40) return 'Moderate';
      return 'Poor';
    }

    /**
     * DATA FORMATTING METHODS
     */
    toPublicObject() {
      const { createdAt, updatedAt, ...publicProduct } = this.toJSON();
      return {
        ...publicProduct,
        healthScore: this.calculateHealthScore(),
        healthCategory: this.getHealthCategory(),
        nutritionHighlights: {
          highProtein: this.isHighProtein(),
          highFiber: this.isHighFiber(),
          highSodium: this.isHighInSodium(),
          highSugar: this.isHighInSugar()
        }
      };
    }

    /**
     * STATIC SEARCH METHODS
     */
    static async findByBarcode(barcode) {
      return await this.findOne({
        where: { barcode },
        include: [
          { model: sequelize.models.NutritionFact, as: 'nutrition' },
          { model: sequelize.models.Category, as: 'category' }
        ]
      });
    }

    static async searchProducts(query, options = {}) {
      const { limit = 20, offset = 0, category } = options;
      const whereClause = {};
      
      if (query) {
        whereClause[sequelize.Op.or] = [
          { name: { [sequelize.Op.iLike]: `%${query}%` } },
          { brand: { [sequelize.Op.iLike]: `%${query}%` } }
        ];
      }
      
      if (category) {
        whereClause.category_id = category;
      }

      return await this.findAndCountAll({
        where: whereClause,
        include: [
          { model: sequelize.models.NutritionFact, as: 'nutrition' },
          { model: sequelize.models.Category, as: 'category' }
        ],
        limit,
        offset,
        order: [['name', 'ASC']]
      });
    }
  }

  Product.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255]
      }
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    barcode: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: true,
      validate: {
        len: [8, 50]
      }
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    ingredients: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Comma-separated ingredient list'
    },
    serving_size: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'e.g., "1 cup (240ml)", "30g"'
    },
    data_source: {
      type: DataTypes.ENUM('api', 'manual', 'ocr', 'user_upload'),
      defaultValue: 'manual',
      comment: 'Source of product data'
    },
    verification_status: {
      type: DataTypes.ENUM('pending', 'verified', 'flagged'),
      defaultValue: 'pending'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    indexes: [
      { fields: ['barcode'] },
      { fields: ['name'] },
      { fields: ['brand'] },
      { fields: ['category_id'] }
    ]
  });

  return Product;
};
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Ingredient extends Model {
    /**
     * 🔗 ASSOCIATIONS
     */
    static associate(models) {
      // Ingredient belongs to a product
      Ingredient.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
    }

    /**
     * 🔍 UTILITY METHODS
     */
    isCommonAllergen() {
      const commonAllergens = [
        'milk', 'eggs', 'fish', 'shellfish', 'tree nuts', 'peanuts', 
        'wheat', 'soybeans', 'sesame'
      ];
      
      return commonAllergens.some(allergen => 
        this.name.toLowerCase().includes(allergen.toLowerCase())
      );
    }

    /**
     * 🔍 STATIC METHODS
     */
    static async findByProduct(productId) {
      return await this.findAll({
        where: { product_id: productId },
        order: [['order_index', 'ASC'], ['name', 'ASC']]
      });
    }

    static async findAllergens(productId) {
      return await this.findAll({
        where: { 
          product_id: productId,
          is_allergen: true 
        }
      });
    }

    static async searchByName(name) {
      return await this.findAll({
        where: {
          name: {
            [sequelize.Op.iLike]: `%${name}%`
          }
        },
        include: [{ model: sequelize.models.Product, as: 'product' }]
      });
    }
  }

  Ingredient.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 200]
      }
    },
    is_allergen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this ingredient is a known allergen'
    },
    order_index: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Order of ingredient in the list (by weight/amount)'
    },
    percentage: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      },
      comment: 'Percentage of this ingredient in the product (if available)'
    },
    allergen_type: {
      type: DataTypes.ENUM(
        'milk', 'eggs', 'fish', 'shellfish', 'tree_nuts', 'peanuts', 
        'wheat', 'soybeans', 'sesame', 'other'
      ),
      allowNull: true,
      comment: 'Type of allergen if is_allergen is true'
    }
  }, {
    sequelize,
    modelName: 'Ingredient',
    tableName: 'ingredients',
    
    hooks: {
      beforeSave: async (ingredient) => {
        // Auto-detect common allergens
        if (!ingredient.is_allergen) {
          ingredient.is_allergen = ingredient.isCommonAllergen();
        }
        
        // Normalize ingredient name
        ingredient.name = ingredient.name.trim().toLowerCase();
      }
    },
    
    indexes: [
      { fields: ['product_id'] },
      { fields: ['name'] },
      { fields: ['is_allergen'] },
      { fields: ['allergen_type'] }
    ]
  });

  return Ingredient;
};
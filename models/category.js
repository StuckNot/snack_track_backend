'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Category extends Model {
    /**
     * ASSOCIATIONS
     */
    static associate(models) {
      // Category has many products
      Category.hasMany(models.Product, {
        foreignKey: 'category_id',
        as: 'products'
      });

      // Self-referencing for subcategories
      Category.hasMany(models.Category, {
        foreignKey: 'parent_id',
        as: 'subcategories'
      });

      Category.belongsTo(models.Category, {
        foreignKey: 'parent_id',
        as: 'parent'
      });
    }

    /**
     * STATIC METHODS
     */
    static async getMainCategories() {
      return await this.findAll({
        where: { parent_id: null },
        include: [{ model: this, as: 'subcategories' }]
      });
    }
  }

  Category.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Icon identifier'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'categories'
  });

  return Category;
};
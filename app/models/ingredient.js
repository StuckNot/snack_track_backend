const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Ingredient = sequelize.define('Ingredient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  product_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_allergen: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'ingredients',
  timestamps: true,
});

module.exports = Ingredient;
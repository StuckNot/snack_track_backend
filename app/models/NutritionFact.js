
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Product = require('./Product'); 

const NutritionFact = sequelize.define('NutritionFact', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  product_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Product,
      key: 'id',
    },
    unique: true, 
  },
  calories: {
    type: DataTypes.FLOAT,
  },
  protein: {
    type: DataTypes.FLOAT, 
  },
  fat: {
    type: DataTypes.FLOAT, 
  },
  carbs: {
    type: DataTypes.FLOAT, 
  },
  fiber: {
    type: DataTypes.FLOAT, 
  },
  sugar: {
    type: DataTypes.FLOAT, 
  },
  sodium: {
    type: DataTypes.FLOAT, 
  },
  health_score: {
    type: DataTypes.INTEGER,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'nutrition_facts',
  timestamps: false, 
  underscored: true, 
});
module.exports = NutritionFact;

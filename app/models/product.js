const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,   // required
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Categories',  // assumes Categories table exists
      key: 'id',
    },
  },
  barcode: {
    type: DataTypes.STRING,
    unique: true,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  source: {
    type: DataTypes.STRING,  // e.g., "API" or "manual entry"
    allowNull: true,
  },
}, {
  tableName: 'products',
  timestamps: true,   // adds createdAt & updatedAt automatically
});

module.exports = Product;
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class UserFavorite extends Model {
    /**
     * 🔗 ASSOCIATIONS
     */
    static associate(models) {
      // UserFavorite belongs to a user
      UserFavorite.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });

      // UserFavorite belongs to a product
      UserFavorite.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
    }

    /**
     * 🔍 UTILITY METHODS
     */
    toSummary() {
      return {
        id: this.id,
        user_id: this.user_id,
        product_id: this.product_id,
        notes: this.notes,
        rating: this.rating,
        addedAt: this.createdAt,
        product: this.product ? {
          id: this.product.id,
          name: this.product.name,
          brand: this.product.brand,
          image_url: this.product.image_url
        } : null
      };
    }

    /**
     * 🔍 STATIC METHODS
     */
    static async getUserFavorites(userId, options = {}) {
      const { limit = 20, offset = 0, category } = options;
      const whereClause = { user_id: userId };

      const includeClause = [
        {
          model: sequelize.models.Product,
          as: 'product',
          include: [
            { model: sequelize.models.NutritionFact, as: 'nutrition' },
            { model: sequelize.models.Category, as: 'category' }
          ]
        }
      ];

      // Filter by category if specified
      if (category) {
        includeClause[0].where = { category_id: category };
      }

      return await this.findAndCountAll({
        where: whereClause,
        include: includeClause,
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });
    }

    static async addToFavorites(userId, productId, data = {}) {
      const { notes, rating } = data;
      
      // Check if already exists
      const existing = await this.findOne({
        where: { user_id: userId, product_id: productId }
      });

      if (existing) {
        // Update existing favorite
        return await existing.update({ notes, rating });
      }

      // Create new favorite
      return await this.create({
        user_id: userId,
        product_id: productId,
        notes,
        rating
      });
    }

    static async removeFromFavorites(userId, productId) {
      return await this.destroy({
        where: { user_id: userId, product_id: productId }
      });
    }

    static async isFavorite(userId, productId) {
      const favorite = await this.findOne({
        where: { user_id: userId, product_id: productId }
      });
      return !!favorite;
    }

    static async getFavoritesByCategory(userId) {
      return await this.findAll({
        where: { user_id: userId },
        include: [
          {
            model: sequelize.models.Product,
            as: 'product',
            include: [
              { model: sequelize.models.Category, as: 'category' }
            ]
          }
        ],
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('UserFavorite.id')), 'count'],
          [sequelize.col('product.category.name'), 'category_name']
        ],
        group: ['product.category.id', 'product.category.name']
      });
    }

    static async getUserFavoriteStats(userId) {
      const totalFavorites = await this.count({ where: { user_id: userId } });
      
      const ratingStats = await this.findAll({
        where: { user_id: userId, rating: { [sequelize.Op.not]: null } },
        attributes: [
          [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
          [sequelize.fn('COUNT', sequelize.col('rating')), 'ratedCount']
        ]
      });

      const categoryStats = await this.getFavoritesByCategory(userId);

      return {
        totalFavorites,
        averageRating: ratingStats[0]?.get('averageRating') || 0,
        ratedCount: ratingStats[0]?.get('ratedCount') || 0,
        favoritesByCategory: categoryStats
      };
    }
  }

  UserFavorite.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
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
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'User notes about why they favorited this product'
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      },
      comment: 'User rating for this product (1-5 stars)'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether this favorite is active (for soft delete)'
    }
  }, {
    sequelize,
    modelName: 'UserFavorite',
    tableName: 'user_favorites',
    
    indexes: [
      { fields: ['user_id'] },
      { fields: ['product_id'] },
      { fields: ['user_id', 'product_id'], unique: true }, // Prevent duplicates
      { fields: ['rating'] },
      { fields: ['createdAt'] }
    ]
  });

  return UserFavorite;
};
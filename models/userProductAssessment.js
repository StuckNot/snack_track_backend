'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class UserProductAssessment extends Model {
    /**
     * 🔗 ASSOCIATIONS
     */
    static associate(models) {
      // Assessment belongs to a user
      UserProductAssessment.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });

      // Assessment belongs to a product
      UserProductAssessment.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
    }

    /**
     * 🎯 ASSESSMENT ANALYSIS METHODS
     */
    getRecommendationIcon() {
      switch (this.recommendation) {
        case 'excellent': return '🟢';
        case 'good': return '🔵';
        case 'moderate': return '🟡';
        case 'avoid': return '🔴';
        default: return '⚪';
      }
    }

    getRiskLevel() {
      if (this.allergy_warnings?.length > 0) return 'high';
      if (this.recommendation === 'avoid') return 'medium';
      if (this.recommendation === 'moderate') return 'low';
      return 'none';
    }

    /**
     * 📊 DATA FORMATTING METHODS
     */
    toSummary() {
      return {
        id: this.id,
        recommendation: this.recommendation,
        recommendationIcon: this.getRecommendationIcon(),
        personalizedScore: this.personalized_score,
        riskLevel: this.getRiskLevel(),
        allergyWarnings: this.allergy_warnings || [],
        dietaryCompatible: this.dietary_compatible,
        scanDate: this.createdAt
      };
    }

    toDetailedReport() {
      return {
        ...this.toJSON(),
        analysis: {
          recommendationIcon: this.getRecommendationIcon(),
          riskLevel: this.getRiskLevel(),
          summary: this.assessment_summary,
          recommendations: this.health_recommendations || []
        }
      };
    }

    /**
     * 🔍 STATIC QUERY METHODS
     */
    static async getUserHistory(userId, options = {}) {
      const { limit = 20, offset = 0, recommendation } = options;
      const whereClause = { user_id: userId };
      
      if (recommendation) {
        whereClause.recommendation = recommendation;
      }

      return await this.findAndCountAll({
        where: whereClause,
        include: [
          { 
            model: sequelize.models.Product, 
            as: 'product',
            include: [
              { model: sequelize.models.NutritionFact, as: 'nutrition' }
            ]
          }
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });
    }

    static async getRecommendationStats(userId) {
      const stats = await this.findAll({
        where: { user_id: userId },
        attributes: [
          'recommendation',
          [sequelize.fn('COUNT', sequelize.col('recommendation')), 'count']
        ],
        group: 'recommendation'
      });

      return stats.reduce((acc, stat) => {
        acc[stat.recommendation] = parseInt(stat.get('count'));
        return acc;
      }, {});
    }
  }

  UserProductAssessment.init({
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
      }
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    
    // Assessment Results
    recommendation: {
      type: DataTypes.ENUM('excellent', 'good', 'moderate', 'avoid'),
      allowNull: false,
      comment: 'Overall recommendation for this user'
    },
    personalized_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 100
      },
      comment: 'Personalized health score (0-100)'
    },
    
    // Health Analysis
    allergy_warnings: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of allergy warnings for this user'
    },
    dietary_compatible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      comment: 'Whether product matches user dietary preferences'
    },
    health_impact: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Detailed health impact analysis'
    },
    
    // Detailed Assessment
    assessment_summary: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Human-readable assessment summary'
    },
    health_recommendations: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of personalized health recommendations'
    },
    nutrition_alignment: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'How product aligns with user nutrition goals'
    },
    
    // Scan Context
    scan_method: {
      type: DataTypes.ENUM('barcode', 'image', 'manual', 'search'),
      allowNull: false,
      comment: 'How the product was scanned/identified'
    },
    scan_location: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Where the scan took place (optional)'
    },
    
    // User Feedback
    user_rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      },
      comment: 'User rating of the assessment (1-5 stars)'
    },
    user_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'User notes about this product'
    },
    
    // Data Quality
    assessment_version: {
      type: DataTypes.STRING(10),
      defaultValue: '1.0',
      comment: 'Version of assessment algorithm used'
    },
    confidence_score: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: 0,
        max: 1
      },
      comment: 'Confidence in assessment accuracy (0-1)'
    }
  }, {
    sequelize,
    modelName: 'UserProductAssessment',
    tableName: 'user_product_assessments',
    
    indexes: [
      { fields: ['user_id'] },
      { fields: ['product_id'] },
      { fields: ['recommendation'] },
      { fields: ['user_id', 'product_id'] },
      { fields: ['createdAt'] }
    ]
  });

  return UserProductAssessment;
};
const ProductAssessmentService = require('../services/productAssessmentService');
const HealthAnalyticsService = require('../services/healthAnalyticsService');
const { UserProductAssessment, Product, NutritionFact, User } = require('../models');

class AssessmentController {
  constructor() {
    this.assessmentService = new ProductAssessmentService();
  }

  /**
   * 📝 CREATE NEW ASSESSMENT
   * POST /api/assessments
   */
  async createAssessment(req, res) {
    try {
      const { product_id, scan_method, scan_location } = req.body;
      const userId = req.user.userId;

      // Verify product exists
      const product = await Product.findByPk(product_id, {
        include: [{ model: NutritionFact, as: 'nutrition' }]
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Generate assessment
      const assessment = await this.assessmentService.assessProductForUser(product, userId);

      res.status(201).json({
        success: true,
        message: 'Assessment created successfully',
        data: {
          assessment: assessment.toDetailedReport(),
          product: product.toPublicObject()
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 🔍 GET ASSESSMENT BY ID
   * GET /api/assessments/:id
   */
  async getAssessmentById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const assessment = await UserProductAssessment.findOne({
        where: { 
          id, 
          user_id: userId // Ensure user can only access their own assessments
        },
        include: [
          { 
            model: Product, 
            as: 'product',
            include: [{ model: NutritionFact, as: 'nutrition' }]
          }
        ]
      });

      if (!assessment) {
        return res.status(404).json({
          success: false,
          message: 'Assessment not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Assessment retrieved successfully',
        data: {
          assessment: assessment.toDetailedReport(),
          product: assessment.product.toPublicObject()
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * ✏️ UPDATE ASSESSMENT (User Feedback)
   * PUT /api/assessments/:id
   */
  async updateAssessment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const { user_rating, user_notes } = req.body;

      const assessment = await UserProductAssessment.findOne({
        where: { id, user_id: userId }
      });

      if (!assessment) {
        return res.status(404).json({
          success: false,
          message: 'Assessment not found'
        });
      }

      await assessment.update({
        user_rating: user_rating || assessment.user_rating,
        user_notes: user_notes || assessment.user_notes
      });

      res.status(200).json({
        success: true,
        message: 'Assessment updated successfully',
        data: assessment.toDetailedReport()
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 📈 GET USER'S ASSESSMENT HISTORY
   * GET /api/assessments/user/history
   */
  async getUserHistory(req, res) {
    try {
      const userId = req.user.userId;
      const { 
        limit = 20, 
        offset = 0, 
        recommendation 
      } = req.query;

      const options = {
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      if (recommendation) {
        options.recommendation = recommendation;
      }

      const result = await this.assessmentService.getUserAssessmentHistory(userId, options);

      const history = result.rows.map(assessment => ({
        ...assessment.toSummary(),
        product: assessment.product.toPublicObject()
      }));

      res.status(200).json({
        success: true,
        message: 'Assessment history retrieved successfully',
        data: {
          history,
          total: result.count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < result.count
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 📊 GET USER'S ASSESSMENT STATISTICS
   * GET /api/assessments/user/stats
   */
  async getUserStats(req, res) {
    try {
      const userId = req.user.userId;

      const stats = await HealthAnalyticsService.getUserAssessmentStats(userId);
      const totalScans = Object.values(stats).reduce((sum, count) => sum + count, 0);

      res.status(200).json({
        success: true,
        message: 'Assessment statistics retrieved successfully',
        data: {
          totalScans,
          recommendations: stats,
          healthScore: HealthAnalyticsService.calculateOverallHealthScore(stats),
          insights: HealthAnalyticsService.generateHealthInsights(stats, totalScans),
          breakdown: {
            excellentPercentage: totalScans > 0 ? Math.round(((stats.excellent || 0) / totalScans) * 100) : 0,
            goodPercentage: totalScans > 0 ? Math.round(((stats.good || 0) / totalScans) * 100) : 0,
            moderatePercentage: totalScans > 0 ? Math.round(((stats.moderate || 0) / totalScans) * 100) : 0,
            avoidPercentage: totalScans > 0 ? Math.round(((stats.avoid || 0) / totalScans) * 100) : 0
          }
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 🗑️ DELETE ASSESSMENT
   * DELETE /api/assessments/:id
   */
  async deleteAssessment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const assessment = await UserProductAssessment.findOne({
        where: { id, user_id: userId }
      });

      if (!assessment) {
        return res.status(404).json({
          success: false,
          message: 'Assessment not found'
        });
      }

      await assessment.destroy();

      res.status(200).json({
        success: true,
        message: 'Assessment deleted successfully'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 📦 BULK ASSESSMENT OPERATIONS
   * POST /api/assessments/bulk
   */
  async bulkAssessment(req, res) {
    try {
      const { product_ids, scan_method } = req.body;
      const userId = req.user.userId;

      const assessments = [];
      const errors = [];

      for (const product_id of product_ids) {
        try {
          const product = await Product.findByPk(product_id, {
            include: [{ model: NutritionFact, as: 'nutrition' }]
          });

          if (!product) {
            errors.push({ product_id, error: 'Product not found' });
            continue;
          }

          const assessment = await this.assessmentService.assessProductForUser(product, userId);
          assessments.push({
            assessment: assessment.toSummary(),
            product: product.toPublicObject()
          });

        } catch (error) {
          errors.push({ product_id, error: error.message });
        }
      }

      res.status(200).json({
        success: true,
        message: `Bulk assessment completed. ${assessments.length} successful, ${errors.length} failed.`,
        data: {
          assessments,
          errors,
          summary: {
            total: product_ids.length,
            successful: assessments.length,
            failed: errors.length
          }
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AssessmentController();
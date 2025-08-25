const ProductAssessmentService = require('../services/productAssessmentService');
const HealthAnalyticsService = require('../services/healthAnalyticsService');
const { Product, NutritionFact, UserProductAssessment, Category } = require('../models');
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

class ProductController {
  constructor() {
    this.assessmentService = new ProductAssessmentService();
  }

  /**
   * 🔍 BARCODE SCANNING ENDPOINT
   * POST /api/products/scan/barcode
   */
  async scanBarcode(req, res) {
    try {
      const { barcode } = req.body;
      const userId = req.user.userId;

      if (!barcode) {
        return res.status(400).json({
          success: false,
          message: 'Barcode is required'
        });
      }

      // Validate barcode format (basic validation)
      if (!/^\d{8,14}$/.test(barcode)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid barcode format'
        });
      }

      const result = await this.assessmentService.scanBarcode(barcode, userId);

      res.status(200).json({
        success: true,
        message: 'Product scanned successfully',
        data: result
      });

    } catch (error) {
      if (error.message.includes('Product not found')) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in our database or external sources',
          suggestion: 'Try manual entry or upload a product image'
        });
      }

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 📱 IMAGE SCANNING ENDPOINT
   * POST /api/products/scan/image
   */
  async scanImage(req, res) {
    try {
      const userId = req.user.userId;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Image file is required'
        });
      }

      // Import OCR service
      const ocrService = require('../services/ocrService');

      // Extract nutrition facts from image
      const ocrResult = await ocrService.extractNutritionFacts(req.file.buffer);

      if (!ocrResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Failed to extract nutrition facts from image',
          error: ocrResult.error,
          suggestion: 'Try taking a clearer photo of the nutrition label'
        });
      }

      // Create product from OCR data
      const productData = {
        name: ocrResult.productName || 'Unknown Product (OCR)',
        ingredients: ocrResult.ingredients || null,
        serving_size: ocrResult.nutritionData.serving_size || null,
        data_source: 'ocr',
        verification_status: 'pending'
      };

      // Save product to database
      const product = await Product.create(productData);

      // Save nutrition facts
      await NutritionFact.create({
        ...ocrResult.nutritionData,
        product_id: product.id,
        data_quality: ocrResult.confidence > 70 ? 'good' : 'partial',
        verified_by: 'ocr'
      });

      // Reload product with nutrition data
      const productWithNutrition = await Product.findByPk(product.id, {
        include: [{ model: NutritionFact, as: 'nutrition' }]
      });

      // Generate personalized assessment
      const assessment = await this.assessmentService.assessProductForUser(productWithNutrition, userId);

      res.status(200).json({
        success: true,
        message: 'Product scanned successfully from image',
        data: {
          product: productWithNutrition.toPublicObject(),
          assessment: assessment.toDetailedReport(),
          ocr: {
            confidence: ocrResult.confidence,
            rawText: ocrResult.rawText,
            provider: ocrResult.provider
          }
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        suggestion: 'Try scanning the barcode instead or ensure the nutrition label is clearly visible'
      });
    }
  }

  /**
   * 🔍 PRODUCT SEARCH ENDPOINT
   * GET /api/products/search
   */
  async searchProducts(req, res) {
    try {
      const { q: query, category, limit = 20, offset = 0 } = req.query;

      if (!query && !category) {
        return res.status(400).json({
          success: false,
          message: 'Search query or category is required'
        });
      }

      const result = await Product.searchProducts(query, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        category
      });

      const products = result.rows.map(product => product.toPublicObject());

      res.status(200).json({
        success: true,
        message: 'Products retrieved successfully',
        data: {
          products,
          total: result.count,
          limit: parseInt(limit),
          offset: parseInt(offset)
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
   * 📊 GET PRODUCT DETAILS
   * GET /api/products/:id
   */
  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const product = await Product.findByPk(id, {
        include: [
          { model: NutritionFact, as: 'nutrition' },
          { model: Category, as: 'category' }
        ]
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      let assessment = null;
      if (userId) {
        assessment = await UserProductAssessment.findOne({
          where: { user_id: userId, product_id: id }
        });
      }

      res.status(200).json({
        success: true,
        message: 'Product retrieved successfully',
        data: {
          product: product.toPublicObject(),
          userAssessment: assessment ? assessment.toSummary() : null
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
   * 🎯 GET PERSONALIZED ASSESSMENT
   * GET /api/products/:id/assessment
   */
  async getProductAssessment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const product = await Product.findByPk(id, {
        include: [{ model: NutritionFact, as: 'nutrition' }]
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const assessment = await this.assessmentService.assessProductForUser(product, userId);

      res.status(200).json({
        success: true,
        message: 'Assessment retrieved successfully',
        data: {
          product: product.toPublicObject(),
          assessment: assessment.toDetailedReport()
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
   * 🎯 GET PERSONALIZED ASSESSMENT (Alternative endpoint)
   * GET /api/products/:id/personalized-assessment
   */
  async getPersonalizedAssessment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const product = await Product.findByPk(id, {
        include: [{ model: NutritionFact, as: 'nutrition' }]
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const assessment = await this.assessmentService.assessProductForUser(product, userId);

      res.status(200).json({
        success: true,
        message: 'Personalized assessment retrieved successfully',
        data: {
          product: product.toPublicObject(),
          assessment: assessment.toDetailedReport()
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
   * 📈 GET USER SCAN HISTORY
   * GET /api/products/history
   */
  async getUserScanHistory(req, res) {
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
        message: 'Scan history retrieved successfully',
        data: {
          history,
          total: result.count,
          limit: parseInt(limit),
          offset: parseInt(offset)
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
   * 📊 GET USER ASSESSMENT STATS
   * GET /api/products/stats
   */
  async getUserAssessmentStats(req, res) {
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
          insights: HealthAnalyticsService.generateHealthInsights(stats, totalScans)
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
   * PUT /api/products/assessments/:id
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
   * 📋 GET CATEGORIES
   * GET /api/products/categories
   */
  async getCategories(req, res) {
    try {
      const categories = await Category.getMainCategories();

      res.status(200).json({
        success: true,
        message: 'Categories retrieved successfully',
        data: { categories }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

// Export controller with multer middleware
const productController = new ProductController();
productController.uploadMiddleware = upload.single('image');

module.exports = productController;
const { Product, NutritionFact, UserProductAssessment, User } = require('../models');
const axios = require('axios');

class ProductAssessmentService {
  constructor() {
    this.nutritionApis = {
      openfoodfacts: 'https://world.openfoodfacts.org/api/v0/product',
      edamam: process.env.EDAMAM_API_URL,
      usda: process.env.USDA_API_URL
    };
  }

  /**
   * 🔍 BARCODE SCANNING & PRODUCT LOOKUP
   */
  async scanBarcode(barcode, userId) {
    try {
      // 1. Check if product exists in our database
      let product = await Product.findByBarcode(barcode);
      
      if (!product) {
        // 2. Fetch from external APIs
        product = await this.fetchProductFromAPI(barcode);
        
        if (!product) {
          throw new Error('Product not found in any database');
        }
      }

      // 3. Generate personalized assessment
      const assessment = await this.assessProductForUser(product, userId);
      
      return {
        product: product.toPublicObject(),
        assessment: assessment.toDetailedReport(),
        source: product.data_source
      };
    } catch (error) {
      throw new Error(`Barcode scan failed: ${error.message}`);
    }
  }

  /**
   * 🌐 EXTERNAL API INTEGRATION
   */
  async fetchProductFromAPI(barcode) {
    try {
      // Try OpenFoodFacts first (free and comprehensive)
      const openFoodData = await this.fetchFromOpenFoodFacts(barcode);
      
      if (openFoodData) {
        return await this.createProductFromAPIData(openFoodData, 'api');
      }

      // Fallback to other APIs if needed
      // const edamamData = await this.fetchFromEdamam(barcode);
      // const usdaData = await this.fetchFromUSDA(barcode);
      
      return null;
    } catch (error) {
      console.error('API fetch error:', error);
      return null;
    }
  }

  async fetchFromOpenFoodFacts(barcode) {
    try {
      const response = await axios.get(`${this.nutritionApis.openfoodfacts}/${barcode}.json`, {
        timeout: 5000,
        headers: {
          'User-Agent': 'SnackTrack-App/1.0'
        }
      });

      if (response.data.status === 1 && response.data.product) {
        return this.normalizeOpenFoodFactsData(response.data.product);
      }
      
      return null;
    } catch (error) {
      console.error('OpenFoodFacts API error:', error);
      return null;
    }
  }

  normalizeOpenFoodFactsData(apiProduct) {
    const nutriments = apiProduct.nutriments || {};
    
    return {
      product: {
        name: apiProduct.product_name || 'Unknown Product',
        brand: apiProduct.brands?.split(',')[0]?.trim() || null,
        barcode: apiProduct.code,
        image_url: apiProduct.image_url,
        ingredients: apiProduct.ingredients_text,
        serving_size: apiProduct.serving_size,
        data_source: 'api'
      },
      nutrition: {
        calories: nutriments.energy_kcal_100g || nutriments.energy_kcal,
        protein: nutriments.proteins_100g || nutriments.proteins,
        carbs: nutriments.carbohydrates_100g || nutriments.carbohydrates,
        fat: nutriments.fat_100g || nutriments.fat,
        saturated_fat: nutriments['saturated-fat_100g'] || nutriments['saturated-fat'],
        fiber: nutriments.fiber_100g || nutriments.fiber,
        sugar: nutriments.sugars_100g || nutriments.sugars,
        sodium: nutriments.sodium_100g || nutriments.sodium,
        serving_size_g: parseFloat(apiProduct.serving_quantity) || 100
      }
    };
  }

  async createProductFromAPIData(normalizedData, source) {
    try {
      // Create product
      const product = await Product.create({
        ...normalizedData.product,
        data_source: source,
        verification_status: 'pending'
      });

      // Create nutrition facts
      await NutritionFact.create({
        ...normalizedData.nutrition,
        product_id: product.id,
        data_quality: 'partial',
        verified_by: 'api'
      });

      // Reload with associations
      return await Product.findByPk(product.id, {
        include: [
          { model: NutritionFact, as: 'nutrition' }
        ]
      });
    } catch (error) {
      throw new Error(`Failed to save product: ${error.message}`);
    }
  }

  /**
   * 🎯 PERSONALIZED HEALTH ASSESSMENT
   */
  async assessProductForUser(product, userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if assessment already exists
      let assessment = await UserProductAssessment.findOne({
        where: { user_id: userId, product_id: product.id }
      });

      if (assessment) {
        return assessment; // Return existing assessment
      }

      // Generate new assessment
      const assessmentData = await this.generatePersonalizedAssessment(product, user);
      
      assessment = await UserProductAssessment.create({
        user_id: userId,
        product_id: product.id,
        scan_method: 'barcode',
        assessment_version: '1.0',
        ...assessmentData
      });

      return assessment;
    } catch (error) {
      throw new Error(`Assessment failed: ${error.message}`);
    }
  }

  async generatePersonalizedAssessment(product, user) {
    const nutrition = product.nutrition;
    if (!nutrition) {
      throw new Error('Product nutrition data not available');
    }

    // 1. Base health score from nutrition
    let score = nutrition.calculateHealthScore();
    
    // 2. Check allergies
    const allergyWarnings = this.checkAllergies(product, user);
    if (allergyWarnings.length > 0) {
      score -= 30; // Heavy penalty for allergies
    }

    // 3. Check dietary compatibility
    const dietaryCompatible = this.checkDietaryCompatibility(product, user);
    if (!dietaryCompatible) {
      score -= 20;
    }

    // 4. Personalize based on health goals
    score = this.adjustForHealthGoals(score, nutrition, user);

    // 5. Generate recommendation
    const recommendation = this.getRecommendation(score, allergyWarnings.length > 0);

    // 6. Generate health recommendations
    const healthRecommendations = this.generateHealthRecommendations(product, user, nutrition);

    // 7. Create assessment summary
    const assessmentSummary = this.generateAssessmentSummary(product, user, score, allergyWarnings, dietaryCompatible);

    return {
      recommendation,
      personalized_score: Math.max(0, Math.min(100, Math.round(score))),
      allergy_warnings: allergyWarnings,
      dietary_compatible: dietaryCompatible,
      health_recommendations: healthRecommendations,
      assessment_summary: assessmentSummary,
      confidence_score: 0.85 // Default confidence
    };
  }

  checkAllergies(product, user) {
    const warnings = [];
    const ingredients = product.ingredients?.toLowerCase() || '';
    
    if (user.allergies && user.allergies.length > 0) {
      user.allergies.forEach(allergy => {
        if (user.hasAllergy(allergy) && ingredients.includes(allergy.toLowerCase())) {
          warnings.push({
            allergen: allergy,
            severity: 'high',
            message: `Contains ${allergy} - avoid this product`
          });
        }
      });
    }
    
    return warnings;
  }

  checkDietaryCompatibility(product, user) {
    if (!product.ingredients) return true;
    
    const ingredients = product.ingredients.toLowerCase().split(',').map(i => i.trim());
    return user.isCompatibleWith(ingredients);
  }

  adjustForHealthGoals(score, nutrition, user) {
    switch (user.health_goals) {
      case 'lose_weight':
        // Prefer lower calorie, higher protein
        if (nutrition.calories > 300) score -= 10;
        if (nutrition.protein > 15) score += 10;
        if (nutrition.sugar > 10) score -= 15;
        break;
        
      case 'gain_muscle':
        // Prefer higher protein
        if (nutrition.protein > 20) score += 15;
        if (nutrition.protein < 5) score -= 10;
        break;
        
      case 'improve_health':
        // Prefer whole foods, less processed
        if (nutrition.fiber > 5) score += 10;
        if (nutrition.sodium > 400) score -= 10;
        break;
    }
    
    return score;
  }

  getRecommendation(score, hasAllergies) {
    if (hasAllergies) return 'avoid';
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'moderate';
    return 'avoid';
  }

  generateHealthRecommendations(product, user, nutrition) {
    const recommendations = [];
    
    // Allergy recommendations
    if (user.allergies && user.allergies.length > 0) {
      recommendations.push({
        type: 'safety',
        message: 'Always check ingredients for your known allergens',
        priority: 'high'
      });
    }

    // Nutrition-based recommendations
    if (nutrition.sodium > 600) {
      recommendations.push({
        type: 'nutrition',
        message: 'High sodium content - consider limiting portion size',
        priority: 'medium'
      });
    }

    if (nutrition.sugar > 15) {
      recommendations.push({
        type: 'nutrition',
        message: 'High sugar content - consume in moderation',
        priority: 'medium'
      });
    }

    // Goal-specific recommendations
    if (user.health_goals === 'lose_weight' && nutrition.calories > 200) {
      recommendations.push({
        type: 'goal',
        message: 'Consider smaller portions to align with weight loss goals',
        priority: 'medium'
      });
    }

    return recommendations;
  }

  generateAssessmentSummary(product, user, score, allergyWarnings, dietaryCompatible) {
    let summary = `Health Score: ${Math.round(score)}/100. `;
    
    if (allergyWarnings.length > 0) {
      summary += `⚠️ ALLERGY WARNING: Contains ingredients you're allergic to. `;
    }
    
    if (!dietaryCompatible) {
      summary += `❌ Not compatible with your ${user.dietary_preferences} dietary preference. `;
    }
    
    if (score >= 80) {
      summary += `✅ Excellent choice for your health profile!`;
    } else if (score >= 60) {
      summary += `👍 Good option with some nutritional benefits.`;
    } else if (score >= 40) {
      summary += `⚠️ Moderate choice - consume in moderation.`;
    } else {
      summary += `❌ Consider avoiding this product.`;
    }
    
    return summary;
  }

  /**
   * 📱 IMAGE SCANNING (OCR) - Future Enhancement
   */
  async scanProductImage(imageBuffer, userId) {
    // TODO: Implement OCR for nutrition label scanning
    // This would use services like Google Vision API or AWS Textract
    throw new Error('Image scanning not yet implemented');
  }

  /**
   * 📊 ASSESSMENT ANALYTICS
   */
  async getUserAssessmentHistory(userId, options = {}) {
    return await UserProductAssessment.getUserHistory(userId, options);
  }

  async getUserAssessmentStats(userId) {
    return await UserProductAssessment.getRecommendationStats(userId);
  }
}

module.exports = ProductAssessmentService;
const { NutritionFacts, UserProductAssessment } = require('../models');

class HealthAssessmentService {
  /**
   * Assess a product's health impact for a specific user
   * @param {Object} user - User object with health profile
   * @param {Object} product - Product object with nutrition facts
   * @returns {Object} Assessment result with score and recommendations
   */
  static async assessProduct(user, product) {
    try {
      // Get nutrition facts for the product
      const nutritionFacts = await NutritionFacts.findOne({
        where: { product_id: product.id }
      });

      if (!nutritionFacts) {
        throw new Error('Nutrition facts not available for this product');
      }

      // Calculate health score based on user's conditions
      const assessment = this.calculateHealthScore(user, nutritionFacts);
      
      // Generate personalized recommendations
      const recommendations = this.generateRecommendations(user, nutritionFacts, assessment);

      // Save assessment to database
      const savedAssessment = await UserProductAssessment.create({
        user_id: user.id,
        product_id: product.id,
        health_score: assessment.score,
        assessment_data: {
          breakdown: assessment.breakdown,
          recommendations: recommendations,
          flags: assessment.flags
        },
        recommendations: recommendations.summary
      });

      return {
        score: assessment.score,
        grade: this.getHealthGrade(assessment.score),
        breakdown: assessment.breakdown,
        recommendations: recommendations,
        flags: assessment.flags,
        assessmentId: savedAssessment.id
      };

    } catch (error) {
      console.error('Error assessing product:', error);
      throw error;
    }
  }

  /**
   * Calculate health score based on user conditions and nutrition facts
   */
  static calculateHealthScore(user, nutrition) {
    let score = 100; // Start with perfect score
    const breakdown = {};
    const flags = [];

    // Analyze calories per serving
    const caloriesScore = this.analyzeCalories(nutrition.calories, user.activity_level);
    score -= caloriesScore.penalty;
    breakdown.calories = caloriesScore;

    // Analyze sodium content
    const sodiumScore = this.analyzeSodium(nutrition.sodium, user.health_conditions);
    score -= sodiumScore.penalty;
    breakdown.sodium = sodiumScore;
    if (sodiumScore.flag) flags.push(sodiumScore.flag);

    // Analyze sugar content
    const sugarScore = this.analyzeSugar(nutrition.sugar, nutrition.added_sugar, user.health_conditions);
    score -= sugarScore.penalty;
    breakdown.sugar = sugarScore;
    if (sugarScore.flag) flags.push(sugarScore.flag);

    // Analyze fat content
    const fatScore = this.analyzeFat(nutrition.fat, nutrition.saturated_fat, nutrition.trans_fat, user.health_conditions);
    score -= fatScore.penalty;
    breakdown.fat = fatScore;
    if (fatScore.flag) flags.push(fatScore.flag);

    // Analyze protein content (positive factor)
    const proteinScore = this.analyzeProtein(nutrition.protein, user.fitness_goals);
    score += proteinScore.bonus;
    breakdown.protein = proteinScore;

    // Analyze fiber content (positive factor)
    const fiberScore = this.analyzeFiber(nutrition.fiber);
    score += fiberScore.bonus;
    breakdown.fiber = fiberScore;

    // Ensure score stays within bounds
    score = Math.max(0, Math.min(100, Math.round(score)));

    return { score, breakdown, flags };
  }

  static analyzeCalories(calories, activityLevel) {
    const activityMultipliers = {
      'sedentary': 1800,
      'lightly_active': 2000,
      'moderately_active': 2200,
      'very_active': 2400,
      'extremely_active': 2600
    };

    const dailyCalorieTarget = activityMultipliers[activityLevel] || 2000;
    const caloriePercentage = (calories / dailyCalorieTarget) * 100;

    let penalty = 0;
    let message = '';

    if (caloriePercentage > 15) {
      penalty = 15;
      message = 'Very high calorie content for a single serving';
    } else if (caloriePercentage > 10) {
      penalty = 8;
      message = 'High calorie content';
    } else if (caloriePercentage > 7) {
      penalty = 3;
      message = 'Moderate calorie content';
    } else {
      message = 'Reasonable calorie content';
    }

    return {
      value: calories,
      percentage: Math.round(caloriePercentage),
      penalty,
      message,
      recommendation: penalty > 8 ? 'Consider smaller portions or less frequent consumption' : null
    };
  }

  static analyzeSodium(sodium, healthConditions) {
    const dailySodiumLimit = 2300; // mg per day (FDA recommendation)
    const sodiumPercentage = (sodium / dailySodiumLimit) * 100;

    let penalty = 0;
    let message = '';
    let flag = null;

    // Check for hypertension
    const hasHypertension = healthConditions && healthConditions.includes('hypertension');
    const hypertensionLimit = hasHypertension ? 1500 : dailySodiumLimit;

    if (sodium > 400) {
      penalty = hasHypertension ? 25 : 15;
      message = 'Very high sodium content';
      flag = hasHypertension ? 'CRITICAL: High sodium - not recommended for hypertension' : 'HIGH_SODIUM';
    } else if (sodium > 240) {
      penalty = hasHypertension ? 15 : 8;
      message = 'High sodium content';
      flag = hasHypertension ? 'CAUTION: High sodium for hypertension' : null;
    } else if (sodium > 140) {
      penalty = hasHypertension ? 8 : 3;
      message = 'Moderate sodium content';
    } else {
      message = 'Low sodium content';
    }

    return {
      value: sodium,
      percentage: Math.round((sodium / hypertensionLimit) * 100),
      penalty,
      message,
      flag,
      recommendation: penalty > 10 ? 'Look for low-sodium alternatives' : null
    };
  }

  static analyzeSugar(totalSugar, addedSugar, healthConditions) {
    const dailySugarLimit = 50; // g per day (WHO recommendation)
    const addedSugarLimit = 25; // g per day for added sugars

    let penalty = 0;
    let message = '';
    let flag = null;

    // Check for diabetes
    const hasDiabetes = healthConditions && healthConditions.includes('diabetes');
    
    const relevantSugar = addedSugar || totalSugar;
    const limit = addedSugar ? addedSugarLimit : dailySugarLimit;

    if (relevantSugar > 15) {
      penalty = hasDiabetes ? 30 : 20;
      message = 'Very high sugar content';
      flag = hasDiabetes ? 'CRITICAL: High sugar - not recommended for diabetes' : 'HIGH_SUGAR';
    } else if (relevantSugar > 10) {
      penalty = hasDiabetes ? 20 : 12;
      message = 'High sugar content';
      flag = hasDiabetes ? 'CAUTION: High sugar for diabetes' : null;
    } else if (relevantSugar > 5) {
      penalty = hasDiabetes ? 10 : 5;
      message = 'Moderate sugar content';
    } else {
      message = 'Low sugar content';
    }

    return {
      total: totalSugar,
      added: addedSugar,
      percentage: Math.round((relevantSugar / limit) * 100),
      penalty,
      message,
      flag,
      recommendation: penalty > 15 ? 'Consider sugar-free alternatives' : null
    };
  }

  static analyzeFat(totalFat, saturatedFat, transFat, healthConditions) {
    let penalty = 0;
    let message = '';
    let flag = null;

    // Check for heart disease
    const hasHeartDisease = healthConditions && healthConditions.includes('heart_disease');

    // Analyze trans fat (always bad)
    if (transFat > 0) {
      penalty += hasHeartDisease ? 25 : 15;
      flag = 'CONTAINS_TRANS_FAT';
    }

    // Analyze saturated fat
    if (saturatedFat > 5) {
      penalty += hasHeartDisease ? 15 : 10;
      message = 'High saturated fat content';
      if (hasHeartDisease) flag = 'CAUTION: High saturated fat for heart disease';
    } else if (saturatedFat > 3) {
      penalty += hasHeartDisease ? 8 : 5;
      message = 'Moderate saturated fat content';
    }

    // Total fat analysis
    if (totalFat > 15) {
      penalty += 5;
      if (!message) message = 'High total fat content';
    }

    if (!message) message = 'Reasonable fat content';

    return {
      total: totalFat,
      saturated: saturatedFat,
      trans: transFat,
      penalty,
      message,
      flag,
      recommendation: penalty > 15 ? 'Look for lower-fat alternatives' : null
    };
  }

  static analyzeProtein(protein, fitnessGoals) {
    let bonus = 0;
    let message = '';

    const isHighProteinGoal = fitnessGoals && (
      fitnessGoals.includes('muscle_gain') || 
      fitnessGoals.includes('weight_loss')
    );

    if (protein > 10) {
      bonus = isHighProteinGoal ? 8 : 5;
      message = 'Excellent protein content';
    } else if (protein > 5) {
      bonus = isHighProteinGoal ? 5 : 3;
      message = 'Good protein content';
    } else if (protein > 2) {
      bonus = 2;
      message = 'Moderate protein content';
    } else {
      message = 'Low protein content';
    }

    return {
      value: protein,
      bonus,
      message,
      recommendation: bonus > 5 ? 'Great protein source for your goals' : null
    };
  }

  static analyzeFiber(fiber) {
    let bonus = 0;
    let message = '';

    if (fiber > 5) {
      bonus = 8;
      message = 'Excellent fiber content';
    } else if (fiber > 3) {
      bonus = 5;
      message = 'Good fiber content';
    } else if (fiber > 1) {
      bonus = 2;
      message = 'Moderate fiber content';
    } else {
      message = 'Low fiber content';
    }

    return {
      value: fiber,
      bonus,
      message,
      recommendation: bonus > 5 ? 'Great source of dietary fiber' : null
    };
  }

  /**
   * Generate personalized recommendations
   */
  static generateRecommendations(user, nutrition, assessment) {
    const recommendations = {
      summary: [],
      detailed: [],
      alternatives: [],
      portionAdvice: null
    };

    // Generate recommendations based on flags
    assessment.flags.forEach(flag => {
      switch (flag) {
        case 'CRITICAL: High sodium - not recommended for hypertension':
          recommendations.summary.push('⚠️ Not recommended due to high sodium');
          recommendations.detailed.push('This product contains high sodium levels that may worsen hypertension');
          recommendations.alternatives.push('Look for "low sodium" or "no salt added" versions');
          break;
        case 'CRITICAL: High sugar - not recommended for diabetes':
          recommendations.summary.push('⚠️ Not recommended due to high sugar');
          recommendations.detailed.push('High sugar content can cause blood glucose spikes');
          recommendations.alternatives.push('Consider sugar-free or naturally sweetened alternatives');
          break;
        case 'CONTAINS_TRANS_FAT':
          recommendations.summary.push('⚠️ Contains harmful trans fats');
          recommendations.detailed.push('Trans fats increase risk of heart disease');
          recommendations.alternatives.push('Choose products with 0g trans fat');
          break;
      }
    });

    // Positive recommendations
    if (assessment.breakdown.protein?.bonus > 5) {
      recommendations.summary.push('✅ Good protein source');
    }
    if (assessment.breakdown.fiber?.bonus > 5) {
      recommendations.summary.push('✅ High in fiber');
    }

    // Portion advice based on score
    if (assessment.score < 50) {
      recommendations.portionAdvice = 'Consider very small portions or occasional consumption only';
    } else if (assessment.score < 70) {
      recommendations.portionAdvice = 'Enjoy in moderation as part of a balanced diet';
    } else {
      recommendations.portionAdvice = 'Can be enjoyed as part of a healthy diet';
    }

    return recommendations;
  }

  /**
   * Convert numeric score to letter grade
   */
  static getHealthGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Get user's previous assessments
   */
  static async getUserAssessments(userId, limit = 10) {
    return await UserProductAssessment.findAll({
      where: { user_id: userId },
      order: [['createdAt', 'DESC']],
      limit,
      include: ['product']
    });
  }
}

module.exports = HealthAssessmentService;
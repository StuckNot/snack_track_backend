const { UserProductAssessment } = require('../models');

/**
 * 🏥 HEALTH ANALYTICS SERVICE
 * Shared service to eliminate code duplication between controllers
 */
class HealthAnalyticsService {
  
  /**
   * Calculate overall health score from recommendation stats
   */
  static calculateOverallHealthScore(stats) {
    const weights = {
      excellent: 100,
      good: 75,
      moderate: 50,
      avoid: 25
    };

    let totalWeightedScore = 0;
    let totalScans = 0;

    Object.entries(stats).forEach(([recommendation, count]) => {
      const weight = weights[recommendation] || 0;
      totalWeightedScore += weight * count;
      totalScans += count;
    });

    return totalScans > 0 ? Math.round(totalWeightedScore / totalScans) : 0;
  }

  /**
   * Generate health insights based on user statistics
   */
  static generateHealthInsights(stats, totalScans) {
    const insights = [];

    if (totalScans === 0) {
      insights.push({
        type: 'suggestion',
        message: 'Start scanning products to get personalized health insights!',
        icon: '🎯'
      });
      return insights;
    }

    const excellentPercent = ((stats.excellent || 0) / totalScans) * 100;
    const goodPercent = ((stats.good || 0) / totalScans) * 100;
    const avoidPercent = ((stats.avoid || 0) / totalScans) * 100;

    if (excellentPercent > 60) {
      insights.push({
        type: 'positive',
        message: 'Great job! Most of your food choices are excellent for your health.',
        icon: '🌟'
      });
    }

    if (goodPercent + excellentPercent > 70) {
      insights.push({
        type: 'positive',
        message: 'You\'re making healthy choices! Keep up the good work.',
        icon: '👍'
      });
    }

    if (avoidPercent > 30) {
      insights.push({
        type: 'warning',
        message: 'Consider avoiding products with allergy warnings or poor nutrition scores.',
        icon: '⚠️'
      });
    }

    if (avoidPercent > 50) {
      insights.push({
        type: 'alert',
        message: 'Many of your scanned products aren\'t ideal for your health goals. Consider healthier alternatives.',
        icon: '🚨'
      });
    }

    if (totalScans >= 50) {
      insights.push({
        type: 'achievement',
        message: `You've scanned ${totalScans} products! You're building healthy habits.`,
        icon: '🏆'
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: 'neutral',
        message: 'Keep scanning products to get more personalized insights.',
        icon: '📊'
      });
    }

    return insights;
  }

  /**
   * Get user assessment statistics
   */
  static async getUserAssessmentStats(userId) {
    return await UserProductAssessment.getRecommendationStats(userId);
  }

  /**
   * Get user assessment history with options
   */
  static async getUserAssessmentHistory(userId, options = {}) {
    return await UserProductAssessment.getUserHistory(userId, options);
  }
}

module.exports = HealthAnalyticsService;
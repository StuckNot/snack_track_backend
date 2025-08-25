/**
 * 🏥 HEALTH SERVICE
 * Service for health calculations and recommendations
 */
class HealthService {
  constructor() {
    this.bmrFormulas = {
      mifflinStJeor: this.calculateMifflinStJeor.bind(this),
      harrisBenedict: this.calculateHarrisBenedict.bind(this),
      katchMcArdle: this.calculateKatchMcArdle.bind(this)
    };

    this.activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
  }

  /**
   * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation
   */
  calculateMifflinStJeor(weight, height, age, gender) {
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    return gender === 'Male' ? bmr + 5 : bmr - 161;
  }

  /**
   * Calculate BMR using Harris-Benedict equation
   */
  calculateHarrisBenedict(weight, height, age, gender) {
    if (gender === 'Male') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  }

  /**
   * Calculate BMR using Katch-McArdle equation (requires body fat percentage)
   */
  calculateKatchMcArdle(weight, bodyFatPercentage) {
    const leanBodyMass = weight * (1 - bodyFatPercentage / 100);
    return 370 + (21.6 * leanBodyMass);
  }

  /**
   * Calculate Total Daily Energy Expenditure (TDEE)
   */
  calculateTDEE(bmr, activityLevel) {
    const multiplier = this.activityMultipliers[activityLevel] || 1.2;
    return Math.round(bmr * multiplier);
  }

  /**
   * Calculate daily calorie needs based on health goals
   */
  calculateCalorieNeeds(user) {
    if (!user.weight || !user.height || !user.age) {
      return null;
    }

    const bmr = this.calculateMifflinStJeor(user.weight, user.height, user.age, user.gender);
    const tdee = this.calculateTDEE(bmr, user.activity_level);

    switch (user.health_goals) {
      case 'lose_weight':
        return Math.round(tdee * 0.8); // 20% deficit
      case 'gain_muscle':
        return Math.round(tdee * 1.1); // 10% surplus
      case 'maintain':
        return tdee;
      case 'improve_health':
        return tdee;
      default:
        return tdee;
    }
  }

  /**
   * Calculate macronutrient distribution
   */
  calculateMacros(calories, healthGoal) {
    let proteinPercent, carbPercent, fatPercent;

    switch (healthGoal) {
      case 'lose_weight':
        proteinPercent = 0.30;
        carbPercent = 0.35;
        fatPercent = 0.35;
        break;
      case 'gain_muscle':
        proteinPercent = 0.25;
        carbPercent = 0.45;
        fatPercent = 0.30;
        break;
      case 'improve_health':
        proteinPercent = 0.20;
        carbPercent = 0.50;
        fatPercent = 0.30;
        break;
      default:
        proteinPercent = 0.20;
        carbPercent = 0.50;
        fatPercent = 0.30;
    }

    return {
      protein: Math.round((calories * proteinPercent) / 4), // 4 cal per gram
      carbs: Math.round((calories * carbPercent) / 4),
      fat: Math.round((calories * fatPercent) / 9), // 9 cal per gram
      proteinCalories: Math.round(calories * proteinPercent),
      carbCalories: Math.round(calories * carbPercent),
      fatCalories: Math.round(calories * fatPercent)
    };
  }

  /**
   * Calculate ideal weight range
   */
  calculateIdealWeight(height, gender) {
    // Using Devine formula and healthy BMI range
    const heightInches = height / 2.54;
    
    // Devine formula
    let idealWeight;
    if (gender === 'Male') {
      idealWeight = 50 + 2.3 * (heightInches - 60);
    } else {
      idealWeight = 45.5 + 2.3 * (heightInches - 60);
    }

    // Healthy BMI range (18.5-24.9)
    const minWeight = Math.round(18.5 * Math.pow(height / 100, 2));
    const maxWeight = Math.round(24.9 * Math.pow(height / 100, 2));

    return {
      ideal: Math.round(idealWeight),
      min: minWeight,
      max: maxWeight,
      range: `${minWeight}-${maxWeight} kg`
    };
  }

  /**
   * Assess health risks based on user profile
   */
  assessHealthRisks(user) {
    const risks = [];
    const bmi = user.BMI || this.calculateBMI(user.weight, user.height);

    // BMI-related risks
    if (bmi >= 30) {
      risks.push({
        category: 'Obesity',
        level: 'High',
        description: 'BMI indicates obesity, significantly increasing risk of diabetes, heart disease, and stroke',
        recommendations: [
          'Consult healthcare provider for weight management plan',
          'Focus on sustainable calorie deficit',
          'Increase physical activity gradually'
        ]
      });
    } else if (bmi >= 25) {
      risks.push({
        category: 'Overweight',
        level: 'Moderate',
        description: 'BMI indicates overweight, increasing risk of chronic diseases',
        recommendations: [
          'Aim for gradual weight loss of 1-2 lbs per week',
          'Monitor portion sizes',
          'Increase daily physical activity'
        ]
      });
    } else if (bmi < 18.5) {
      risks.push({
        category: 'Underweight',
        level: 'Moderate',
        description: 'BMI indicates underweight, which may affect immune function and bone health',
        recommendations: [
          'Focus on nutrient-dense, calorie-rich foods',
          'Consider consulting a nutritionist',
          'Monitor for underlying health conditions'
        ]
      });
    }

    // Activity level risks
    if (user.activity_level === 'sedentary') {
      risks.push({
        category: 'Sedentary Lifestyle',
        level: 'Moderate',
        description: 'Low physical activity increases risk of cardiovascular disease and diabetes',
        recommendations: [
          'Aim for at least 150 minutes of moderate exercise per week',
          'Start with short walks and gradually increase',
          'Consider strength training 2-3 times per week'
        ]
      });
    }

    // Age-related risks
    const age = user.calculateAge ? user.calculateAge() : user.age;
    if (age >= 40) {
      risks.push({
        category: 'Age-Related',
        level: 'Low',
        description: 'Age increases risk of chronic diseases - regular health screenings recommended',
        recommendations: [
          'Schedule regular health check-ups',
          'Monitor blood pressure and cholesterol',
          'Maintain bone health with calcium and vitamin D'
        ]
      });
    }

    return risks;
  }

  /**
   * Generate personalized health recommendations
   */
  generateRecommendations(user) {
    const recommendations = [];
    const bmi = user.BMI || this.calculateBMI(user.weight, user.height);

    // BMI-based recommendations
    if (bmi < 18.5) {
      recommendations.push({
        category: 'Weight Management',
        priority: 'High',
        message: 'Focus on healthy weight gain with nutrient-dense foods',
        actions: [
          'Increase calorie intake with healthy fats and proteins',
          'Eat frequent, smaller meals',
          'Consider working with a registered dietitian'
        ]
      });
    } else if (bmi > 25) {
      recommendations.push({
        category: 'Weight Management',
        priority: 'High',
        message: 'Focus on gradual, sustainable weight loss',
        actions: [
          'Create a moderate calorie deficit (500-750 calories/day)',
          'Prioritize whole foods over processed foods',
          'Track your food intake for awareness'
        ]
      });
    }

    // Activity recommendations
    if (user.activity_level === 'sedentary') {
      recommendations.push({
        category: 'Physical Activity',
        priority: 'High',
        message: 'Increase daily physical activity for better health',
        actions: [
          'Start with 10-minute walks after meals',
          'Take stairs instead of elevators',
          'Set hourly reminders to move'
        ]
      });
    }

    // Goal-specific recommendations
    switch (user.health_goals) {
      case 'lose_weight':
        recommendations.push({
          category: 'Weight Loss',
          priority: 'Medium',
          message: 'Sustainable weight loss strategies',
          actions: [
            'Aim for 1-2 pounds weight loss per week',
            'Focus on protein at each meal to maintain muscle',
            'Stay hydrated - often thirst is mistaken for hunger'
          ]
        });
        break;
      case 'gain_muscle':
        recommendations.push({
          category: 'Muscle Building',
          priority: 'Medium',
          message: 'Optimize nutrition for muscle growth',
          actions: [
            'Consume 1.6-2.2g protein per kg body weight',
            'Time protein intake around workouts',
            'Ensure adequate sleep for recovery'
          ]
        });
        break;
    }

    // General health recommendations
    recommendations.push({
      category: 'General Health',
      priority: 'Medium',
      message: 'Foundation habits for long-term health',
      actions: [
        'Aim for 7-9 hours of quality sleep nightly',
        'Eat a variety of colorful fruits and vegetables',
        'Stay hydrated with 8-10 glasses of water daily',
        'Manage stress through relaxation techniques'
      ]
    });

    return recommendations;
  }

  /**
   * Calculate BMI
   */
  calculateBMI(weight, height) {
    if (!weight || !height) return null;
    return parseFloat((weight / Math.pow(height / 100, 2)).toFixed(1));
  }

  /**
   * Get BMI category
   */
  getBMICategory(bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  /**
   * Calculate body fat percentage estimate (rough approximation)
   */
  estimateBodyFat(bmi, age, gender) {
    // US Navy method approximation
    let bodyFat;
    if (gender === 'Male') {
      bodyFat = (1.20 * bmi) + (0.23 * age) - 16.2;
    } else {
      bodyFat = (1.20 * bmi) + (0.23 * age) - 5.4;
    }
    
    return Math.max(5, Math.min(50, Math.round(bodyFat)));
  }

  /**
   * Calculate water intake recommendation
   */
  calculateWaterIntake(weight, activityLevel) {
    let baseWater = weight * 35; // 35ml per kg
    
    // Adjust for activity level
    const activityMultipliers = {
      sedentary: 1.0,
      light: 1.1,
      moderate: 1.2,
      active: 1.3,
      very_active: 1.4
    };
    
    const multiplier = activityMultipliers[activityLevel] || 1.0;
    return Math.round(baseWater * multiplier);
  }

  /**
   * Validate health metrics
   */
  validateHealthMetrics(user) {
    const errors = [];
    const warnings = [];

    // Validate BMI
    if (user.weight && user.height) {
      const bmi = this.calculateBMI(user.weight, user.height);
      if (bmi < 16 || bmi > 40) {
        warnings.push('BMI value is in extreme range - please verify measurements');
      }
    }

    // Validate age
    if (user.age && (user.age < 13 || user.age > 120)) {
      errors.push('Age must be between 13 and 120 years');
    }

    // Validate weight
    if (user.weight && (user.weight < 30 || user.weight > 300)) {
      warnings.push('Weight value seems unusual - please verify');
    }

    // Validate height
    if (user.height && (user.height < 100 || user.height > 250)) {
      warnings.push('Height value seems unusual - please verify');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

module.exports = new HealthService();
/**
 * 🧮 CALCULATION UTILITIES
 * Helper functions for various calculations used throughout the app
 */

/**
 * BMI Calculations
 */
const calculateBMI = (weight, height) => {
  if (!weight || !height) return null;
  return parseFloat((weight / Math.pow(height / 100, 2)).toFixed(1));
};

const getBMICategory = (bmi) => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

/**
 * Age Calculations
 */
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Nutrition Score Calculations
 */
const calculateNutritionScore = (nutritionFacts) => {
  if (!nutritionFacts) return 0;
  
  let score = 100;
  
  // Penalize high sodium (>600mg per serving)
  if (nutritionFacts.sodium > 600) {
    score -= 20;
  } else if (nutritionFacts.sodium > 400) {
    score -= 10;
  }
  
  // Penalize high sugar (>15g per serving)
  if (nutritionFacts.sugar > 15) {
    score -= 20;
  } else if (nutritionFacts.sugar > 10) {
    score -= 10;
  }
  
  // Penalize trans fat
  if (nutritionFacts.trans_fat > 0) {
    score -= 25;
  }
  
  // Penalize high saturated fat (>5g per serving)
  if (nutritionFacts.saturated_fat > 5) {
    score -= 15;
  }
  
  // Reward high protein (>10g per serving)
  if (nutritionFacts.protein > 10) {
    score += 10;
  } else if (nutritionFacts.protein > 5) {
    score += 5;
  }
  
  // Reward high fiber (>5g per serving)
  if (nutritionFacts.fiber > 5) {
    score += 10;
  } else if (nutritionFacts.fiber > 3) {
    score += 5;
  }
  
  return Math.max(0, Math.min(100, score));
};

/**
 * Calorie Need Calculations
 */
const calculateBMR = (weight, height, age, gender) => {
  // Mifflin-St Jeor Equation
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'Male' ? bmr + 5 : bmr - 161;
};

const calculateTDEE = (bmr, activityLevel) => {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  
  return Math.round(bmr * (multipliers[activityLevel] || 1.2));
};

/**
 * Percentage Calculations
 */
const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
};

const calculatePercentageChange = (oldValue, newValue) => {
  if (!oldValue || oldValue === 0) return 0;
  return Math.round(((newValue - oldValue) / oldValue) * 100);
};

/**
 * Unit Conversions
 */
const convertKgToLbs = (kg) => Math.round(kg * 2.20462 * 100) / 100;
const convertLbsToKg = (lbs) => Math.round(lbs / 2.20462 * 100) / 100;
const convertCmToFeet = (cm) => {
  const feet = Math.floor(cm / 30.48);
  const inches = Math.round((cm % 30.48) / 2.54);
  return `${feet}'${inches}"`;
};

/**
 * Statistical Calculations
 */
const calculateAverage = (numbers) => {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return Math.round((sum / numbers.length) * 100) / 100;
};

const calculateMedian = (numbers) => {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  return sorted.length % 2 !== 0 
    ? sorted[mid] 
    : (sorted[mid - 1] + sorted[mid]) / 2;
};

/**
 * Health Score Calculations
 */
const calculateHealthScore = (assessments) => {
  if (!Array.isArray(assessments) || assessments.length === 0) return 0;
  
  const weights = {
    excellent: 100,
    good: 75,
    moderate: 50,
    avoid: 25
  };
  
  let totalWeightedScore = 0;
  let totalAssessments = 0;
  
  assessments.forEach(assessment => {
    const weight = weights[assessment.recommendation] || 0;
    totalWeightedScore += weight;
    totalAssessments++;
  });
  
  return totalAssessments > 0 ? Math.round(totalWeightedScore / totalAssessments) : 0;
};

/**
 * Date Calculations
 */
const daysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1 - date2) / oneDay));
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Validation Helpers
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password) => {
  // At least 8 characters, one uppercase, one lowercase, one number, one special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/;
  return passwordRegex.test(password);
};

const isValidBarcode = (barcode) => {
  return /^\d{8,14}$/.test(barcode);
};

/**
 * Rounding Utilities
 */
const roundToDecimal = (number, decimals = 2) => {
  return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

const roundToNearest = (number, nearest) => {
  return Math.round(number / nearest) * nearest;
};

module.exports = {
  // BMI calculations
  calculateBMI,
  getBMICategory,
  
  // Age calculations
  calculateAge,
  
  // Nutrition calculations
  calculateNutritionScore,
  calculateBMR,
  calculateTDEE,
  
  // Percentage calculations
  calculatePercentage,
  calculatePercentageChange,
  
  // Unit conversions
  convertKgToLbs,
  convertLbsToKg,
  convertCmToFeet,
  
  // Statistical calculations
  calculateAverage,
  calculateMedian,
  
  // Health calculations
  calculateHealthScore,
  
  // Date calculations
  daysBetween,
  addDays,
  
  // Validation helpers
  isValidEmail,
  isValidPassword,
  isValidBarcode,
  
  // Rounding utilities
  roundToDecimal,
  roundToNearest
};
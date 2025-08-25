/**
 * 📝 FORMATTING UTILITIES
 * Helper functions for formatting data throughout the app
 */

/**
 * Date Formatting
 */
const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'readable':
      return d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    case 'relative':
      return formatRelativeTime(d);
    default:
      return d.toISOString();
  }
};

const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  
  return formatDate(date, 'readable');
};

/**
 * Number Formatting
 */
const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined) return '';
  return Number(number).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '';
  return `${formatNumber(value, decimals)}%`;
};

/**
 * Health Metric Formatting
 */
const formatBMI = (bmi) => {
  if (!bmi) return '';
  return `${formatNumber(bmi, 1)} kg/m²`;
};

const formatWeight = (weight, unit = 'kg') => {
  if (!weight) return '';
  if (unit === 'lbs') {
    const lbs = weight * 2.20462;
    return `${formatNumber(lbs, 1)} lbs`;
  }
  return `${formatNumber(weight, 1)} kg`;
};

const formatHeight = (height, unit = 'cm') => {
  if (!height) return '';
  if (unit === 'ft') {
    const feet = Math.floor(height / 30.48);
    const inches = Math.round((height % 30.48) / 2.54);
    return `${feet}'${inches}"`;
  }
  return `${formatNumber(height, 0)} cm`;
};

const formatCalories = (calories) => {
  if (!calories) return '';
  return `${formatNumber(calories, 0)} cal`;
};

/**
 * Nutrition Formatting
 */
const formatNutrition = (value, unit) => {
  if (value === null || value === undefined) return '';
  
  switch (unit) {
    case 'g':
      return `${formatNumber(value, 1)}g`;
    case 'mg':
      return `${formatNumber(value, 0)}mg`;
    case 'mcg':
      return `${formatNumber(value, 0)}mcg`;
    case 'cal':
      return `${formatNumber(value, 0)} cal`;
    default:
      return formatNumber(value, 1);
  }
};

const formatServingSize = (servingSize) => {
  if (!servingSize) return '';
  return servingSize.toString().includes('g') ? servingSize : `${servingSize}g`;
};

/**
 * Text Formatting
 */
const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const capitalizeWords = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

const formatEnum = (enumValue) => {
  if (!enumValue) return '';
  return enumValue.replace(/_/g, ' ').replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Array Formatting
 */
const formatList = (array, conjunction = 'and') => {
  if (!Array.isArray(array) || array.length === 0) return '';
  if (array.length === 1) return array[0];
  if (array.length === 2) return `${array[0]} ${conjunction} ${array[1]}`;
  
  const lastItem = array[array.length - 1];
  const otherItems = array.slice(0, -1);
  return `${otherItems.join(', ')}, ${conjunction} ${lastItem}`;
};

const formatIngredients = (ingredients) => {
  if (!Array.isArray(ingredients)) return '';
  return ingredients.map(ingredient => capitalize(ingredient)).join(', ');
};

/**
 * Health Score Formatting
 */
const formatHealthScore = (score) => {
  if (score === null || score === undefined) return '';
  
  const formattedScore = `${score}/100`;
  
  if (score >= 80) return `${formattedScore} (Excellent)`;
  if (score >= 60) return `${formattedScore} (Good)`;
  if (score >= 40) return `${formattedScore} (Fair)`;
  return `${formattedScore} (Poor)`;
};

const formatRecommendation = (recommendation) => {
  const recommendations = {
    excellent: { text: 'Excellent Choice', icon: '🟢', color: 'green' },
    good: { text: 'Good Option', icon: '🔵', color: 'blue' },
    moderate: { text: 'Moderate', icon: '🟡', color: 'orange' },
    avoid: { text: 'Avoid', icon: '🔴', color: 'red' }
  };
  
  return recommendations[recommendation] || { text: 'Unknown', icon: '⚪', color: 'gray' };
};

/**
 * File Size Formatting
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * API Response Formatting
 */
const formatApiResponse = (success, message, data = null, errors = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (data !== null) response.data = data;
  if (errors !== null) response.errors = errors;
  
  return response;
};

const formatValidationError = (error) => {
  return {
    field: error.path || error.param,
    message: error.msg,
    value: error.value
  };
};

/**
 * Search Result Formatting
 */
const formatSearchResults = (results, total, limit, offset) => {
  return {
    results,
    pagination: {
      total,
      limit,
      offset,
      hasMore: (offset + limit) < total,
      currentPage: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Barcode Formatting
 */
const formatBarcode = (barcode) => {
  if (!barcode) return '';
  
  // Add spaces for readability based on barcode type
  if (barcode.length === 12) {
    // UPC-A: 0 12345 67890 1
    return barcode.replace(/(\d{1})(\d{5})(\d{5})(\d{1})/, '$1 $2 $3 $4');
  }
  if (barcode.length === 13) {
    // EAN-13: 0 123456 789012 3
    return barcode.replace(/(\d{1})(\d{6})(\d{6})(\d{1})/, '$1 $2 $3 $4');
  }
  
  return barcode;
};

module.exports = {
  // Date formatting
  formatDate,
  formatRelativeTime,
  
  // Number formatting
  formatNumber,
  formatCurrency,
  formatPercentage,
  
  // Health metric formatting
  formatBMI,
  formatWeight,
  formatHeight,
  formatCalories,
  
  // Nutrition formatting
  formatNutrition,
  formatServingSize,
  
  // Text formatting
  capitalize,
  capitalizeWords,
  formatEnum,
  truncateText,
  
  // Array formatting
  formatList,
  formatIngredients,
  
  // Health score formatting
  formatHealthScore,
  formatRecommendation,
  
  // File formatting
  formatFileSize,
  
  // API formatting
  formatApiResponse,
  formatValidationError,
  formatSearchResults,
  
  // Barcode formatting
  formatBarcode
};
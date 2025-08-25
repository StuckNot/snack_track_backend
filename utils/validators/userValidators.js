const { body, param, query } = require('express-validator');

/**
 * 👤 USER VALIDATION RULES
 * Validation rules for user-related endpoints
 */

/**
 * User Registration Validation
 */
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
    
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 255 })
    .withMessage('Email must be less than 255 characters'),
    
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
  body('date_of_birth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 13 || age > 120) {
        throw new Error('Age must be between 13 and 120 years');
      }
      return true;
    }),
    
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other', 'Prefer not to say'])
    .withMessage('Gender must be one of: Male, Female, Other, Prefer not to say'),
    
  body('weight')
    .optional()
    .isFloat({ min: 30, max: 300 })
    .withMessage('Weight must be between 30 and 300 kg'),
    
  body('height')
    .optional()
    .isFloat({ min: 100, max: 250 })
    .withMessage('Height must be between 100 and 250 cm'),
    
  body('health_goals')
    .optional()
    .isIn(['lose_weight', 'gain_muscle', 'maintain', 'improve_health'])
    .withMessage('Health goal must be one of: lose_weight, gain_muscle, maintain, improve_health'),
    
  body('activity_level')
    .optional()
    .isIn(['sedentary', 'light', 'moderate', 'active', 'very_active'])
    .withMessage('Activity level must be one of: sedentary, light, moderate, active, very_active'),
    
  body('dietary_preferences')
    .optional()
    .isIn(['veg', 'vegan', 'keto', 'paleo', 'gluten_free', 'dairy_free', 'none'])
    .withMessage('Dietary preference must be one of: veg, vegan, keto, paleo, gluten_free, dairy_free, none'),
    
  body('allergies')
    .optional()
    .isArray()
    .withMessage('Allergies must be an array')
    .custom((allergies) => {
      const validAllergies = [
        'peanuts', 'tree_nuts', 'milk', 'eggs', 'soy', 'wheat', 'fish', 
        'shellfish', 'sesame', 'sulfites', 'none'
      ];
      
      if (!allergies.every(allergy => validAllergies.includes(allergy))) {
        throw new Error('Invalid allergy specified');
      }
      
      if (allergies.length > 10) {
        throw new Error('Maximum 10 allergies allowed');
      }
      
      return true;
    })
];

/**
 * User Login Validation
 */
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 1, max: 128 })
    .withMessage('Password must be less than 128 characters')
];

/**
 * Profile Update Validation
 */
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
    
  body('date_of_birth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
    
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other', 'Prefer not to say'])
    .withMessage('Gender must be one of: Male, Female, Other, Prefer not to say'),
    
  body('weight')
    .optional()
    .isFloat({ min: 30, max: 300 })
    .withMessage('Weight must be between 30 and 300 kg'),
    
  body('height')
    .optional()
    .isFloat({ min: 100, max: 250 })
    .withMessage('Height must be between 100 and 250 cm'),
    
  body('health_goals')
    .optional()
    .isIn(['lose_weight', 'gain_muscle', 'maintain', 'improve_health'])
    .withMessage('Health goal must be one of: lose_weight, gain_muscle, maintain, improve_health'),
    
  body('activity_level')
    .optional()
    .isIn(['sedentary', 'light', 'moderate', 'active', 'very_active'])
    .withMessage('Activity level must be one of: sedentary, light, moderate, active, very_active'),
    
  body('dietary_preferences')
    .optional()
    .isIn(['veg', 'vegan', 'keto', 'paleo', 'gluten_free', 'dairy_free', 'none'])
    .withMessage('Dietary preference must be one of: veg, vegan, keto, paleo, gluten_free, dairy_free, none'),
    
  body('allergies')
    .optional()
    .isArray()
    .withMessage('Allergies must be an array')
];

/**
 * Password Change Validation
 */
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
    
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('New password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

/**
 * User Search Validation
 */
const validateUserSearch = [
  query('health_goal')
    .optional()
    .isIn(['lose_weight', 'gain_muscle', 'maintain', 'improve_health'])
    .withMessage('Health goal filter must be valid'),
    
  query('dietary_preference')
    .optional()
    .isIn(['veg', 'vegan', 'keto', 'paleo', 'gluten_free', 'dairy_free', 'none'])
    .withMessage('Dietary preference filter must be valid'),
    
  query('allergy')
    .optional()
    .isIn(['peanuts', 'tree_nuts', 'milk', 'eggs', 'soy', 'wheat', 'fish', 'shellfish', 'sesame', 'sulfites'])
    .withMessage('Allergy filter must be valid'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
    
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be non-negative')
];

/**
 * User ID Validation
 */
const validateUserId = [
  param('id')
    .isUUID()
    .withMessage('User ID must be a valid UUID')
];

/**
 * Health Compatibility Check Validation
 */
const validateHealthCompatibility = [
  body('product_id')
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
    
  body('serving_size')
    .optional()
    .isFloat({ min: 0.1, max: 10 })
    .withMessage('Serving size multiplier must be between 0.1 and 10')
];

/**
 * Profile Picture Upload Validation
 */
const validateProfilePictureUpload = [
  // File validation handled by multer middleware
  body('description')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Image description must be less than 100 characters')
];

/**
 * Account Deactivation Validation
 */
const validateAccountDeactivation = [
  body('reason')
    .optional()
    .isIn(['temporary', 'privacy_concerns', 'not_useful', 'found_alternative', 'other'])
    .withMessage('Deactivation reason must be valid'),
    
  body('feedback')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Feedback must be less than 500 characters'),
    
  body('password')
    .notEmpty()
    .withMessage('Password confirmation is required for account deactivation')
];

/**
 * Custom User Validators
 */
const customUserValidators = {
  /**
   * Validate age based on date of birth
   */
  validateAge: (dateOfBirth) => {
    if (!dateOfBirth) return true; // Optional field
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 13 && age <= 120;
  },
  
  /**
   * Validate BMI calculation
   */
  validateBMI: (weight, height) => {
    if (!weight || !height) return true; // Optional fields
    
    const bmi = weight / Math.pow(height / 100, 2);
    return bmi >= 10 && bmi <= 60; // Reasonable BMI range
  },
  
  /**
   * Validate email domain (if restrictions needed)
   */
  validateEmailDomain: (email) => {
    // Add any domain restrictions here if needed
    const blockedDomains = ['tempmail.com', '10minutemail.com'];
    const domain = email.split('@')[1];
    return !blockedDomains.includes(domain);
  },
  
  /**
   * Validate password strength
   */
  validatePasswordStrength: (password) => {
    if (!password) return false;
    
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /\W/.test(password),
      noCommon: !['password', '123456789', 'qwerty'].includes(password.toLowerCase())
    };
    
    return Object.values(checks).every(check => check);
  },
  
  /**
   * Validate allergy list consistency
   */
  validateAllergyList: (allergies) => {
    if (!Array.isArray(allergies)) return false;
    
    // Can't have 'none' with other allergies
    if (allergies.includes('none') && allergies.length > 1) {
      return false;
    }
    
    // No duplicates
    return new Set(allergies).size === allergies.length;
  }
};

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validateUserSearch,
  validateUserId,
  validateHealthCompatibility,
  validateProfilePictureUpload,
  validateAccountDeactivation,
  customUserValidators
};
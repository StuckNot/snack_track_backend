const axios = require('axios');

/**
 * 📱 BARCODE SERVICE
 * Service for barcode validation and external API lookup
 */
class BarcodeService {
  constructor() {
    this.supportedFormats = {
      UPC_A: { length: 12, pattern: /^\d{12}$/ },
      UPC_E: { length: 8, pattern: /^\d{8}$/ },
      EAN_13: { length: 13, pattern: /^\d{13}$/ },
      EAN_8: { length: 8, pattern: /^\d{8}$/ },
      CODE_128: { length: [6, 20], pattern: /^[\x00-\x7F]{6,20}$/ }
    };
  }

  /**
   * Validate barcode format
   */
  validateBarcode(barcode) {
    if (!barcode || typeof barcode !== 'string') {
      return { valid: false, error: 'Barcode must be a string' };
    }

    const cleanBarcode = barcode.trim();
    
    // Check against supported formats
    for (const [format, rules] of Object.entries(this.supportedFormats)) {
      if (Array.isArray(rules.length)) {
        if (cleanBarcode.length >= rules.length[0] && 
            cleanBarcode.length <= rules.length[1] && 
            rules.pattern.test(cleanBarcode)) {
          return { valid: true, format, barcode: cleanBarcode };
        }
      } else {
        if (cleanBarcode.length === rules.length && rules.pattern.test(cleanBarcode)) {
          return { valid: true, format, barcode: cleanBarcode };
        }
      }
    }

    return { valid: false, error: 'Invalid barcode format' };
  }

  /**
   * Calculate UPC/EAN check digit
   */
  calculateCheckDigit(barcode) {
    const digits = barcode.split('').map(Number);
    let sum = 0;
    
    for (let i = 0; i < digits.length - 1; i++) {
      sum += digits[i] * (i % 2 === 0 ? 1 : 3);
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit;
  }

  /**
   * Verify barcode check digit
   */
  verifyCheckDigit(barcode) {
    if (barcode.length < 8) return false;
    
    const providedCheckDigit = parseInt(barcode.slice(-1));
    const calculatedCheckDigit = this.calculateCheckDigit(barcode);
    
    return providedCheckDigit === calculatedCheckDigit;
  }

  /**
   * Lookup product information from external APIs
   */
  async lookupProduct(barcode) {
    const validation = this.validateBarcode(barcode);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    try {
      // Try OpenFoodFacts first (free and comprehensive)
      const openFoodData = await this.lookupOpenFoodFacts(validation.barcode);
      if (openFoodData) {
        return {
          source: 'openfoodfacts',
          data: openFoodData,
          confidence: 0.8
        };
      }

      // Could add more APIs here (USDA, Edamam, etc.)
      return null;

    } catch (error) {
      console.error('Barcode lookup error:', error);
      throw new Error(`Failed to lookup product: ${error.message}`);
    }
  }

  /**
   * Lookup product from OpenFoodFacts API
   */
  async lookupOpenFoodFacts(barcode) {
    try {
      const response = await axios.get(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
        {
          timeout: 5000,
          headers: {
            'User-Agent': 'SnackTrack-App/1.0 (Contact: support@snacktrack.com)'
          }
        }
      );

      if (response.data.status === 1 && response.data.product) {
        return this.normalizeOpenFoodFactsData(response.data.product);
      }

      return null;
    } catch (error) {
      if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
        throw new Error('Unable to connect to product database');
      }
      throw error;
    }
  }

  /**
   * Normalize OpenFoodFacts data to our format
   */
  normalizeOpenFoodFactsData(product) {
    const nutriments = product.nutriments || {};
    
    return {
      name: product.product_name || product.product_name_en || 'Unknown Product',
      brand: product.brands?.split(',')[0]?.trim() || null,
      barcode: product.code,
      image_url: product.image_url || product.image_front_url,
      ingredients: product.ingredients_text || product.ingredients_text_en,
      serving_size: product.serving_size || null,
      categories: product.categories?.split(',').map(cat => cat.trim()) || [],
      nutrition: {
        calories: nutriments.energy_kcal_100g || nutriments['energy-kcal_100g'] || nutriments.energy_kcal,
        protein: nutriments.proteins_100g || nutriments.proteins,
        carbs: nutriments.carbohydrates_100g || nutriments.carbohydrates,
        fat: nutriments.fat_100g || nutriments.fat,
        saturated_fat: nutriments['saturated-fat_100g'] || nutriments['saturated-fat'],
        trans_fat: nutriments['trans-fat_100g'] || nutriments['trans-fat'] || 0,
        fiber: nutriments.fiber_100g || nutriments.fiber,
        sugar: nutriments.sugars_100g || nutriments.sugars,
        sodium: nutriments.sodium_100g || nutriments.sodium,
        cholesterol: nutriments.cholesterol_100g || nutriments.cholesterol || 0,
        serving_size_g: parseFloat(product.serving_quantity) || 100
      },
      quality_score: product.nutriscore_grade ? this.convertNutriScore(product.nutriscore_grade) : null,
      data_completeness: this.assessDataCompleteness(product)
    };
  }

  /**
   * Convert Nutri-Score to numeric value
   */
  convertNutriScore(grade) {
    const scores = { 'a': 90, 'b': 75, 'c': 60, 'd': 45, 'e': 30 };
    return scores[grade.toLowerCase()] || null;
  }

  /**
   * Assess how complete the product data is
   */
  assessDataCompleteness(product) {
    let score = 0;
    const checks = [
      product.product_name,
      product.brands,
      product.ingredients_text,
      product.nutriments?.energy_kcal_100g,
      product.nutriments?.proteins_100g,
      product.nutriments?.carbohydrates_100g,
      product.nutriments?.fat_100g,
      product.image_url
    ];

    checks.forEach(field => {
      if (field !== undefined && field !== null && field !== '') {
        score += 12.5; // 100/8 fields
      }
    });

    return Math.round(score);
  }

  /**
   * Generate alternative barcodes for lookup
   */
  generateAlternatives(barcode) {
    const alternatives = [barcode];
    
    // For UPC-A, try UPC-E conversion
    if (barcode.length === 12) {
      const upcE = this.convertUPCAtoUPCE(barcode);
      if (upcE) alternatives.push(upcE);
    }
    
    // For UPC-E, try UPC-A conversion
    if (barcode.length === 8) {
      const upcA = this.convertUPCEtoUPCA(barcode);
      if (upcA) alternatives.push(upcA);
    }

    return alternatives;
  }

  /**
   * Convert UPC-A to UPC-E if possible
   */
  convertUPCAtoUPCE(upcA) {
    // Simplified conversion - would need full implementation for production
    return null;
  }

  /**
   * Convert UPC-E to UPC-A
   */
  convertUPCEtoUPCA(upcE) {
    // Simplified conversion - would need full implementation for production
    return null;
  }
}

module.exports = new BarcodeService();
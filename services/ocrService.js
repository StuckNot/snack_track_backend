const Tesseract = require('tesseract.js');
const sharp = require('sharp');

/**
 * 📷 OCR SERVICE
 * Service for extracting text from product images using OCR
 */
class OCRService {
  constructor() {
    this.supportedFormats = ['jpg', 'jpeg', 'png', 'webp'];
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.ocrProviders = {
      tesseract: this.processTesseract.bind(this),
      googleVision: this.processGoogleVision.bind(this),
      awsTextract: this.processAWSTextract.bind(this)
    };
    this.tesseractOptions = {
      logger: m => console.log(m), // Optional: log OCR progress
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,%-() ',
    };
  }

  /**
   * Extract nutrition facts from product image
   */
  async extractNutritionFacts(imageBuffer, options = {}) {
    try {
      // Validate image
      const validation = this.validateImage(imageBuffer);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Process with OCR
      const ocrResult = await this.processImage(imageBuffer, options);
      
      // Extract nutrition data from OCR text
      const nutritionData = this.parseNutritionText(ocrResult.text);
      
      return {
        success: true,
        nutritionData,
        confidence: ocrResult.confidence,
        rawText: ocrResult.text,
        processingTime: ocrResult.processingTime,
        provider: options.provider || 'tesseract'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        provider: options.provider || 'tesseract'
      };
    }
  }

  /**
   * Validate uploaded image
   */
  validateImage(imageBuffer) {
    if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
      return { valid: false, error: 'Invalid image buffer' };
    }

    if (imageBuffer.length > this.maxFileSize) {
      return { valid: false, error: 'Image file too large (max 10MB)' };
    }

    // Basic image format validation
    const header = imageBuffer.toString('hex', 0, 4);
    const isValidFormat = 
      header.startsWith('ffd8') || // JPEG
      header.startsWith('8950') || // PNG
      header.startsWith('5249'); // WEBP

    if (!isValidFormat) {
      return { valid: false, error: 'Unsupported image format' };
    }

    return { valid: true };
  }

  /**
   * Process image with selected OCR provider
   */
  async processImage(imageBuffer, options = {}) {
    const provider = options.provider || 'tesseract';
    const processor = this.ocrProviders[provider];

    if (!processor) {
      throw new Error(`Unsupported OCR provider: ${provider}`);
    }

    const startTime = Date.now();
    const result = await processor(imageBuffer, options);
    const processingTime = Date.now() - startTime;

    return {
      ...result,
      processingTime
    };
  }

  /**
   * Process with Tesseract.js (client-side OCR)
   * Note: This would typically run in the frontend
   */
  async processTesseract(imageBuffer, options = {}) {
    try {
      // Preprocess image for better OCR results
      const processedImage = await this.preprocessImage(imageBuffer);
      
      // Extract text using Tesseract
      const { data: { text } } = await Tesseract.recognize(
        processedImage,
        'eng',
        this.tesseractOptions
      );

      console.log('📝 Raw OCR Text:', text);

      // Parse nutrition information from extracted text
      const nutritionData = this.parseNutritionText(text);
      
      return {
        rawText: text,
        nutritionData,
        confidence: this.calculateConfidence(nutritionData)
      };

    } catch (error) {
      console.error('❌ OCR Error:', error);
      throw new Error(`OCR processing failed: ${error.message}`);
    }
  }

  /**
   * Process with Google Vision API
   */
  async processGoogleVision(imageBuffer, options = {}) {
    try {
      // This would require Google Cloud Vision API setup
      // const vision = require('@google-cloud/vision');
      // const client = new vision.ImageAnnotatorClient();
      
      // For now, return placeholder
      return {
        text: 'Google Vision API integration requires API key setup',
        confidence: 0,
        blocks: []
      };

    } catch (error) {
      throw new Error(`Google Vision API error: ${error.message}`);
    }
  }

  /**
   * Process with AWS Textract
   */
  async processAWSTextract(imageBuffer, options = {}) {
    try {
      // This would require AWS Textract setup
      // const AWS = require('aws-sdk');
      // const textract = new AWS.Textract();
      
      // For now, return placeholder
      return {
        text: 'AWS Textract integration requires AWS credentials setup',
        confidence: 0,
        blocks: []
      };

    } catch (error) {
      throw new Error(`AWS Textract error: ${error.message}`);
    }
  }

  /**
   * Parse nutrition facts from OCR text
   */
  parseNutritionText(text) {
    const nutritionData = {
      calories: null,
      protein: null,
      carbs: null,
      fat: null,
      saturated_fat: null,
      trans_fat: null,
      fiber: null,
      sugar: null,
      sodium: null,
      cholesterol: null,
      serving_size: null
    };

    if (!text) return nutritionData;

    const normalizedText = text.toLowerCase().replace(/[^\w\s\d.]/g, ' ');

    // Nutrition fact patterns
    const patterns = {
      calories: /calories?\s*(\d+(?:\.\d+)?)/i,
      protein: /protein\s*(\d+(?:\.\d+)?)\s*g/i,
      carbs: /(?:carbohydrate|carbs?)\s*(\d+(?:\.\d+)?)\s*g/i,
      fat: /(?:total\s+)?fat\s*(\d+(?:\.\d+)?)\s*g/i,
      saturated_fat: /saturated\s+fat\s*(\d+(?:\.\d+)?)\s*g/i,
      trans_fat: /trans\s+fat\s*(\d+(?:\.\d+)?)\s*g/i,
      fiber: /(?:dietary\s+)?fiber\s*(\d+(?:\.\d+)?)\s*g/i,
      sugar: /(?:total\s+)?sugars?\s*(\d+(?:\.\d+)?)\s*g/i,
      sodium: /sodium\s*(\d+(?:\.\d+)?)\s*(?:mg|milligrams?)/i,
      cholesterol: /cholesterol\s*(\d+(?:\.\d+)?)\s*(?:mg|milligrams?)/i,
      serving_size: /serving\s+size\s*([^\n]+)/i
    };

    // Extract values using patterns
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = normalizedText.match(pattern);
      if (match) {
        if (key === 'serving_size') {
          nutritionData[key] = match[1].trim();
        } else {
          nutritionData[key] = parseFloat(match[1]);
        }
      }
    }

    return nutritionData;
  }

  /**
   * Extract ingredient list from OCR text
   */
  parseIngredients(text) {
    if (!text) return [];

    const normalizedText = text.toLowerCase();
    
    // Look for ingredients section
    const ingredientsPattern = /ingredients?\s*:?\s*([^.]*(?:\.[^.]*)*)/i;
    const match = normalizedText.match(ingredientsPattern);
    
    if (!match) return [];

    const ingredientsText = match[1];
    
    // Split by commas and clean up
    const ingredients = ingredientsText
      .split(',')
      .map(ingredient => ingredient.trim())
      .filter(ingredient => ingredient.length > 1)
      .map(ingredient => {
        // Remove parenthetical information
        return ingredient.replace(/\([^)]*\)/g, '').trim();
      });

    return ingredients.slice(0, 20); // Limit to 20 ingredients
  }

  /**
   * Preprocess image for better OCR results
   */
  async preprocessImage(imageBuffer) {
    try {
      // Use Sharp to enhance image for OCR
      const processedBuffer = await sharp(imageBuffer)
        .greyscale() // Convert to grayscale
        .resize(null, 800) // Resize height to 800px (maintains aspect ratio)
        .sharpen() // Sharpen image
        .normalize() // Normalize contrast
        .threshold(128) // Convert to black and white
        .toBuffer();

      return processedBuffer;
    } catch (error) {
      console.error('❌ Image preprocessing failed:', error);
      // Return original image if preprocessing fails
      return imageBuffer;
    }
  }

  /**
   * Get OCR confidence score
   */
  calculateConfidenceScore(ocrResult) {
    if (!ocrResult.blocks || ocrResult.blocks.length === 0) {
      return 0;
    }

    const confidences = ocrResult.blocks
      .map(block => block.confidence || 0)
      .filter(conf => conf > 0);

    if (confidences.length === 0) return 0;

    const averageConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
    return Math.round(averageConfidence * 100) / 100;
  }

  /**
   * Validate extracted nutrition data
   */
  validateNutritionData(nutritionData) {
    const errors = [];
    const warnings = [];

    // Check for required fields
    if (!nutritionData.calories) {
      errors.push('Calories not found');
    }

    // Validate ranges
    if (nutritionData.calories && (nutritionData.calories < 0 || nutritionData.calories > 2000)) {
      warnings.push('Calories value seems unrealistic');
    }

    if (nutritionData.protein && nutritionData.protein < 0) {
      errors.push('Protein cannot be negative');
    }

    if (nutritionData.fat && nutritionData.fat < 0) {
      errors.push('Fat cannot be negative');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      completeness: this.calculateCompleteness(nutritionData)
    };
  }

  /**
   * Calculate data completeness percentage
   */
  calculateCompleteness(nutritionData) {
    const fields = ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium'];
    const filledFields = fields.filter(field => nutritionData[field] !== null && nutritionData[field] !== undefined);
    
    return Math.round((filledFields.length / fields.length) * 100);
  }

  /**
   * 🏷️ EXTRACT PRODUCT NAME FROM IMAGE
   */
  async extractProductName(imageBuffer) {
    try {
      const { data: { text } } = await Tesseract.recognize(
        imageBuffer,
        'eng',
        this.tesseractOptions
      );

      // Look for product name (usually in larger text at top)
      const lines = text.split('\n').filter(line => line.trim());
      
      // Simple heuristic: longest line with letters is likely the product name
      const productNameLine = lines
        .filter(line => line.length > 3 && /[a-zA-Z]/.test(line))
        .sort((a, b) => b.length - a.length)[0];

      return productNameLine ? productNameLine.trim() : null;

    } catch (error) {
      console.error('❌ Product name extraction failed:', error);
      return null;
    }
  }

  /**
   * 🔍 EXTRACT INGREDIENTS FROM IMAGE
   */
  async extractIngredients(imageBuffer) {
    try {
      const { data: { text } } = await Tesseract.recognize(
        imageBuffer,
        'eng',
        this.tesseractOptions
      );

      // Look for ingredients section
      const ingredientsMatch = text.match(/ingredients?[:\-\s]*(.+?)(?:\n\n|\.|allergen|contains|nutrition)/is);
      
      if (ingredientsMatch) {
        const ingredientsText = ingredientsMatch[1]
          .replace(/\n/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        return ingredientsText;
      }

      return null;

    } catch (error) {
      console.error('❌ Ingredients extraction failed:', error);
      return null;
    }
  }

  /**
   * 🎯 FULL PRODUCT ANALYSIS FROM IMAGE
   */
  async analyzeProductImage(imageBuffer) {
    try {
      console.log('🔍 Starting full product image analysis...');

      const [nutritionResult, productName, ingredients] = await Promise.all([
        this.extractNutritionText(imageBuffer),
        this.extractProductName(imageBuffer),
        this.extractIngredients(imageBuffer)
      ]);

      return {
        productName,
        ingredients,
        nutrition: nutritionResult.nutritionData,
        rawText: nutritionResult.rawText,
        confidence: nutritionResult.confidence,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Full product analysis failed:', error);
      throw new Error(`Product analysis failed: ${error.message}`);
    }
  }
}

module.exports = new OCRService();
'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up (queryInterface, Sequelize) {
    const now = new Date();
    
    // Get category IDs from the database
    const categories = await queryInterface.sequelize.query(
      "SELECT id, name FROM categories;",
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    const products = [
      // Snacks
      {
        id: uuidv4(),
        name: 'Lay\'s Classic Potato Chips',
        brand: 'Lay\'s',
        barcode: '028400064484',
        category_id: categoryMap['Snacks'],
        description: 'Classic salted potato chips',
        ingredients: 'Potatoes, Vegetable Oil, Salt',
        serving_size: '28g (about 15 chips)',
        image_url: 'https://example.com/lays-classic.jpg',
        manufacturer: 'Frito-Lay',
        country_of_origin: 'USA',
        data_source: 'api',
        verification_status: 'verified',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Oreo Original Cookies',
        brand: 'Oreo',
        barcode: '044000032227',
        category_id: categoryMap['Candy & Sweets'],
        description: 'Classic chocolate sandwich cookies with cream filling',
        ingredients: 'Sugar, Unbleached Enriched Flour, Palm Oil, Cocoa, High Fructose Corn Syrup',
        serving_size: '34g (3 cookies)',
        image_url: 'https://example.com/oreo-original.jpg',
        manufacturer: 'Mondelez International',
        country_of_origin: 'USA',
        data_source: 'api',
        verification_status: 'verified',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Doritos Nacho Cheese',
        brand: 'Frito-Lay',
        barcode: '028400064842',
        category_id: categoryMap['Snacks'] || null,
        description: 'Nacho cheese flavored tortilla chips',
        ingredients: 'Whole Corn, Vegetable Oil, Salt, Cheddar Cheese, Whey, Monosodium Glutamate',
        serving_size: '28g (about 12 chips)',
        image_url: 'https://example.com/doritos.jpg',
        manufacturer: 'Frito-Lay',
        country_of_origin: 'USA',
        data_source: 'manual',
        verification_status: 'verified',
        verified_by: null,
        verified_at: now,
        is_active: true,
        createdAt: now,
        updatedAt: now
      },
      // Beverages
      {
        id: uuidv4(),
        name: 'Coca-Cola Classic',
        brand: 'Coca-Cola',
        barcode: '049000028911',
        category_id: categoryMap['Beverages'],
        description: 'Classic cola soft drink',
        ingredients: 'Carbonated Water, High Fructose Corn Syrup, Caramel Color, Phosphoric Acid, Natural Flavors, Caffeine',
        serving_size: '355ml (1 can)',
        image_url: 'https://example.com/coca-cola.jpg',
        manufacturer: 'The Coca-Cola Company',
        country_of_origin: 'USA',
        data_source: 'api',
        verification_status: 'verified',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Coca-Cola Classic',
        brand: 'Coca-Cola',
        barcode: '049000042566',
        category_id: categoryMap['Beverages'] || null,
        description: 'Classic cola soft drink',
        ingredients: 'Carbonated Water, High Fructose Corn Syrup, Caramel Color, Phosphoric Acid, Natural Flavors, Caffeine',
        serving_size: '355ml (1 can)',
        image_url: 'https://example.com/coke.jpg',
        manufacturer: 'The Coca-Cola Company',
        country_of_origin: 'USA',
        data_source: 'manual',
        verification_status: 'verified',
        verified_by: null,
        verified_at: now,
        is_active: true,
        createdAt: now,
        updatedAt: now
      },
      // Dairy
      {
        id: uuidv4(),
        name: 'Greek Yogurt Plain',
        brand: 'Chobani',
        barcode: '894700010014',
        category_id: categoryMap['Dairy'],
        description: 'Plain Greek yogurt with live cultures',
        ingredients: 'Cultured Nonfat Milk, Live and Active Cultures',
        serving_size: '170g (1 container)',
        image_url: 'https://example.com/chobani-plain.jpg',
        manufacturer: 'Chobani',
        country_of_origin: 'USA',
        data_source: 'api',
        verification_status: 'verified',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Greek Yogurt Plain',
        brand: 'Chobani',
        barcode: '894700010014',
        category_id: categoryMap['Dairy'] || null,
        description: 'Plain Greek yogurt',
        ingredients: 'Cultured Nonfat Milk, Live and Active Cultures',
        serving_size: '170g (1 container)',
        image_url: 'https://example.com/chobani.jpg',
        manufacturer: 'Chobani',
        country_of_origin: 'USA',
        data_source: 'manual',
        verification_status: 'verified',
        verified_by: null,
        verified_at: now,
        is_active: true,
        createdAt: now,
        updatedAt: now
      },
      // Breakfast
      {
        id: uuidv4(),
        name: 'Honey Nut Cheerios',
        brand: 'Cheerios',
        barcode: '016000275270',
        category_id: categoryMap['Breakfast'],
        description: 'Whole grain oat cereal with honey and almond flavor',
        ingredients: 'Whole Grain Oats, Sugar, Oat Bran, Corn Starch, Honey, Brown Sugar Syrup, Salt',
        serving_size: '37g (1 1/3 cups)',
        image_url: 'https://example.com/honey-nut-cheerios.jpg',
        manufacturer: 'General Mills',
        country_of_origin: 'USA',
        data_source: 'api',
        verification_status: 'verified',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Cheerios Original',
        brand: 'General Mills',
        barcode: '016000275270',
        category_id: categoryMap['Cereals'] || null,
        description: 'Whole grain oat cereal',
        ingredients: 'Whole Grain Oats, Modified Corn Starch, Sugar, Salt, Tripotassium Phosphate',
        serving_size: '28g (3/4 cup)',
        image_url: 'https://example.com/cheerios.jpg',
        manufacturer: 'General Mills',
        country_of_origin: 'USA',
        data_source: 'manual',
        verification_status: 'verified',
        verified_by: null,
        verified_at: now,
        is_active: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Clif Bar Chocolate Chip',
        brand: 'Clif Bar',
        barcode: '722252100306',
        category_id: categoryMap['Snacks'] || null,
        description: 'Organic energy bar with chocolate chips',
        ingredients: 'Organic Brown Rice Syrup, Organic Rolled Oats, Organic Soy Protein Isolate, Organic Cane Syrup',
        serving_size: '68g (1 bar)',
        image_url: 'https://example.com/clifbar.jpg',
        manufacturer: 'Clif Bar & Company',
        country_of_origin: 'USA',
        data_source: 'manual',
        verification_status: 'verified',
        verified_by: null,
        verified_at: now,
        is_active: true,
        createdAt: now,
        updatedAt: now
      }
    ];

    await queryInterface.bulkInsert('products', products, {});

    // Now create nutrition facts for these products
    const insertedProducts = await queryInterface.sequelize.query(
      "SELECT id, name FROM products;",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const nutritionFacts = [
      // Lay's Classic Potato Chips
      {
        id: uuidv4(),
        product_id: insertedProducts.find(p => p.name.includes('Lay\'s Classic')).id,
        serving_size_g: 28,
        calories: 160,
        protein: 2,
        carbs: 15,
        fat: 10,
        saturated_fat: 1.5,
        trans_fat: 0,
        cholesterol: 0,
        sodium: 170,
        fiber: 1,
        sugar: 0,
        added_sugar: 0,
        vitamin_a: 0,
        vitamin_c: 10,
        calcium: 0,
        iron: 0.4,
        potassium: 350,
        data_quality: 'complete',
        verified_by: 'fda',
        last_verified: now,
        createdAt: now,
        updatedAt: now
      },
      // Oreo Cookies
      {
        id: uuidv4(),
        product_id: insertedProducts.find(p => p.name.includes('Oreo')).id,
        serving_size_g: 34,
        calories: 160,
        protein: 2,
        carbs: 25,
        fat: 7,
        saturated_fat: 2,
        trans_fat: 0,
        cholesterol: 0,
        sodium: 135,
        fiber: 1,
        sugar: 14,
        added_sugar: 13,
        vitamin_a: 0,
        vitamin_c: 0,
        calcium: 40,
        iron: 1.8,
        potassium: 90,
        data_quality: 'complete',
        verified_by: 'manufacturer',
        last_verified: now,
        createdAt: now,
        updatedAt: now
      },
      // Coca-Cola
      {
        id: uuidv4(),
        product_id: insertedProducts.find(p => p.name.includes('Coca-Cola')).id,
        serving_size_g: 355,
        calories: 140,
        protein: 0,
        carbs: 39,
        fat: 0,
        saturated_fat: 0,
        trans_fat: 0,
        cholesterol: 0,
        sodium: 45,
        fiber: 0,
        sugar: 39,
        added_sugar: 39,
        vitamin_a: 0,
        vitamin_c: 0,
        calcium: 0,
        iron: 0,
        potassium: 0,
        data_quality: 'complete',
        verified_by: 'manufacturer',
        last_verified: now,
        createdAt: now,
        updatedAt: now
      },
      // Greek Yogurt
      {
        id: uuidv4(),
        product_id: insertedProducts.find(p => p.name.includes('Greek Yogurt')).id,
        serving_size_g: 170,
        calories: 100,
        protein: 18,
        carbs: 6,
        fat: 0,
        saturated_fat: 0,
        trans_fat: 0,
        cholesterol: 10,
        sodium: 65,
        fiber: 0,
        sugar: 6,
        added_sugar: 0,
        vitamin_a: 0,
        vitamin_c: 0,
        calcium: 200,
        iron: 0,
        potassium: 240,
        data_quality: 'complete',
        verified_by: 'manufacturer',
        last_verified: now,
        createdAt: now,
        updatedAt: now
      },
      // Honey Nut Cheerios
      {
        id: uuidv4(),
        product_id: insertedProducts.find(p => p.name.includes('Cheerios')).id,
        serving_size_g: 37,
        calories: 140,
        protein: 3,
        carbs: 29,
        fat: 2,
        saturated_fat: 0,
        trans_fat: 0,
        cholesterol: 0,
        sodium: 190,
        fiber: 3,
        sugar: 12,
        added_sugar: 12,
        vitamin_a: 10,
        vitamin_c: 10,
        vitamin_d: 10,
        calcium: 100,
        iron: 18,
        potassium: 160,
        data_quality: 'complete',
        verified_by: 'manufacturer',
        last_verified: now,
        createdAt: now,
        updatedAt: now
      }
    ];

    await queryInterface.bulkInsert('nutrition_facts', nutritionFacts, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('nutrition_facts', null, {});
    await queryInterface.bulkDelete('products', null, {});
  }
};

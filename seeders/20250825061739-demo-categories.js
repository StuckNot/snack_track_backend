'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const categories = [
      // Main categories
      { id: uuidv4(), name: 'Snacks', description: 'Chips, crackers, nuts, and other snack foods', icon: '🍿', is_active: true, createdAt: now, updatedAt: now },
      { id: uuidv4(), name: 'Beverages', description: 'Soft drinks, juices, water, and other beverages', icon: '🥤', is_active: true, createdAt: now, updatedAt: now },
      { id: uuidv4(), name: 'Dairy', description: 'Milk, cheese, yogurt, and dairy products', icon: '🥛', is_active: true, createdAt: now, updatedAt: now },
      { id: uuidv4(), name: 'Bakery', description: 'Bread, pastries, cakes, and baked goods', icon: '🍞', is_active: true, createdAt: now, updatedAt: now },
      { id: uuidv4(), name: 'Fruits', description: 'Fresh, dried, and canned fruits', icon: '🍎', is_active: true, createdAt: now, updatedAt: now },
      { id: uuidv4(), name: 'Vegetables', description: 'Fresh, frozen, and canned vegetables', icon: '🥕', is_active: true, createdAt: now, updatedAt: now },
      { id: uuidv4(), name: 'Meat & Seafood', description: 'Fresh and processed meat, poultry, and seafood', icon: '🥩', is_active: true, createdAt: now, updatedAt: now },
      { id: uuidv4(), name: 'Frozen Foods', description: 'Frozen meals, vegetables, and desserts', icon: '🧊', is_active: true, createdAt: now, updatedAt: now },
      { id: uuidv4(), name: 'Pantry', description: 'Canned goods, grains, pasta, and pantry staples', icon: '🥫', is_active: true, createdAt: now, updatedAt: now },
      { id: uuidv4(), name: 'Breakfast', description: 'Cereals, oatmeal, and breakfast foods', icon: '🥣', is_active: true, createdAt: now, updatedAt: now },
      { id: uuidv4(), name: 'Condiments', description: 'Sauces, dressings, and condiments', icon: '🧈', is_active: true, createdAt: now, updatedAt: now },
      { id: uuidv4(), name: 'Candy & Sweets', description: 'Chocolate, candy, and sweet treats', icon: '🍭', is_active: true, createdAt: now, updatedAt: now },
      { id: uuidv4(), name: 'Cereals', description: 'Breakfast cereals and granola', icon: '🥣', is_active: true, createdAt: now, updatedAt: now },
      { id: uuidv4(), name: 'Packaged Foods', description: 'Canned goods, frozen meals, and packaged foods', icon: '🥫', is_active: true, createdAt: now, updatedAt: now }
    ];

    await queryInterface.bulkInsert('categories', categories, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  }
};

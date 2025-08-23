'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('Test123!@#', salt);

    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        age: 25,
        gender: 'Male',
        height: 175,
        weight: 70,
        BMI: 22.86,
        allergies: JSON.stringify(['nuts', 'shellfish']),
        dietary_preferences: 'veg',
        health_goals: 'maintain',
        activity_level: 'moderate',
        phone: '1234567890',
        is_active: true,
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedPassword,
        age: 30,
        gender: 'Female',
        height: 165,
        weight: 60,
        BMI: 22.04,
        allergies: JSON.stringify(['dairy']),
        dietary_preferences: 'vegan',
        health_goals: 'lose_weight',
        activity_level: 'active',
        phone: '9876543210',
        is_active: true,
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: hashedPassword,
        age: 28,
        gender: 'Male',
        height: 180,
        weight: 85,
        BMI: 26.23,
        allergies: JSON.stringify([]),
        dietary_preferences: 'keto',
        health_goals: 'gain_muscle',
        activity_level: 'very_active',
        phone: '5555555555',
        is_active: true,
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        password: hashedPassword,
        age: 26,
        gender: 'Female',
        height: 168,
        weight: 55,
        BMI: 19.49,
        allergies: JSON.stringify(['gluten', 'eggs']),
        dietary_preferences: 'gluten_free',
        health_goals: 'improve_health',
        activity_level: 'light',
        phone: '7777777777',
        is_active: true,
        email_verified: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};

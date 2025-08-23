'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      age: {
        type: Sequelize.INTEGER
      },
      gender: {
        type: Sequelize.ENUM('Male', 'Female', 'Other')
      },
      height: {
        type: Sequelize.FLOAT
      },
      weight: {
        type: Sequelize.FLOAT
      },
      BMI: {
        type: Sequelize.FLOAT
      },
      allergies: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      dietary_preferences: {
        type: Sequelize.ENUM('veg', 'vegan', 'keto', 'paleo', 'gluten_free', 'dairy_free', 'none'),
        defaultValue: 'none'
      },
      health_goals: {
        type: Sequelize.ENUM('lose_weight', 'gain_muscle', 'maintain', 'improve_health'),
        defaultValue: 'maintain'
      },
      activity_level: {
        type: Sequelize.ENUM('sedentary', 'light', 'moderate', 'active', 'very_active'),
        defaultValue: 'moderate'
      },
      date_of_birth: {
        type: Sequelize.DATE
      },
      phone: {
        type: Sequelize.STRING
      },
      profile_picture: {
        type: Sequelize.STRING
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      last_login: {
        type: Sequelize.DATE
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['is_active']);
    await queryInterface.addIndex('users', ['health_goals']);
    await queryInterface.addIndex('users', ['dietary_preferences']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};

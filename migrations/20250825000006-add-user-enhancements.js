'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add health conditions field
    await queryInterface.addColumn('users', 'health_conditions', {
      type: Sequelize.JSON,
      defaultValue: [],
      comment: 'Array of health conditions ["diabetes", "hypertension", "heart_disease"]'
    });

    // Add medications field
    await queryInterface.addColumn('users', 'medications', {
      type: Sequelize.JSON,
      defaultValue: [],
      comment: 'Array of current medications that may affect dietary choices'
    });

    // Add notification preferences
    await queryInterface.addColumn('users', 'notification_preferences', {
      type: Sequelize.JSON,
      defaultValue: {
        email_notifications: true,
        push_notifications: true,
        weekly_reports: true,
        allergy_alerts: true
      },
      comment: 'User notification preferences'
    });

    // Add privacy settings
    await queryInterface.addColumn('users', 'privacy_settings', {
      type: Sequelize.JSON,
      defaultValue: {
        profile_visibility: 'private',
        share_health_data: false,
        allow_analytics: true
      },
      comment: 'User privacy preferences'
    });

    // Add custom daily calorie goal
    await queryInterface.addColumn('users', 'daily_calorie_goal', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Custom daily calorie goal (overrides calculated value)'
    });

    // Add security fields
    await queryInterface.addColumn('users', 'email_verification_token', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Token for email verification'
    });

    await queryInterface.addColumn('users', 'password_reset_token', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Token for password reset'
    });

    await queryInterface.addColumn('users', 'password_reset_expires', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Expiration time for password reset token'
    });

    await queryInterface.addColumn('users', 'failed_login_attempts', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      comment: 'Track failed login attempts for security'
    });

    await queryInterface.addColumn('users', 'account_locked_until', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Account lock timestamp for security'
    });

    // Add localization fields
    await queryInterface.addColumn('users', 'country', {
      type: Sequelize.STRING(2),
      allowNull: true,
      comment: 'ISO country code for localization'
    });

    await queryInterface.addColumn('users', 'timezone', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'User timezone for proper scheduling'
    });

    await queryInterface.addColumn('users', 'language_preference', {
      type: Sequelize.STRING(5),
      defaultValue: 'en',
      comment: 'User language preference (ISO 639-1)'
    });

    // Add indexes for performance
    await queryInterface.addIndex('users', ['email_verification_token']);
    await queryInterface.addIndex('users', ['password_reset_token']);
    await queryInterface.addIndex('users', ['country']);
    await queryInterface.addIndex('users', ['failed_login_attempts']);
  },

  async down(queryInterface, Sequelize) {
    // Remove all added columns
    await queryInterface.removeColumn('users', 'health_conditions');
    await queryInterface.removeColumn('users', 'medications');
    await queryInterface.removeColumn('users', 'notification_preferences');
    await queryInterface.removeColumn('users', 'privacy_settings');
    await queryInterface.removeColumn('users', 'daily_calorie_goal');
    await queryInterface.removeColumn('users', 'email_verification_token');
    await queryInterface.removeColumn('users', 'password_reset_token');
    await queryInterface.removeColumn('users', 'password_reset_expires');
    await queryInterface.removeColumn('users', 'failed_login_attempts');
    await queryInterface.removeColumn('users', 'account_locked_until');
    await queryInterface.removeColumn('users', 'country');
    await queryInterface.removeColumn('users', 'timezone');
    await queryInterface.removeColumn('users', 'language_preference');
  }
};
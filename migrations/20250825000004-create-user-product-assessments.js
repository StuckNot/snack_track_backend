'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_product_assessments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      scan_method: {
        type: Sequelize.ENUM('barcode', 'image', 'manual'),
        defaultValue: 'barcode'
      },
      recommendation: {
        type: Sequelize.ENUM('excellent', 'good', 'moderate', 'avoid'),
        allowNull: false
      },
      personalized_score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
          max: 100
        },
        comment: 'Personalized health score 0-100'
      },
      allergy_warnings: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of allergy warnings'
      },
      dietary_compatible: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Compatible with user dietary preferences'
      },
      health_recommendations: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of health recommendations'
      },
      assessment_summary: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Human-readable assessment summary'
      },
      confidence_score: {
        type: Sequelize.FLOAT,
        allowNull: true,
        validate: {
          min: 0,
          max: 1
        },
        comment: 'Confidence in assessment (0-1)'
      },
      assessment_version: {
        type: Sequelize.STRING(10),
        defaultValue: '1.0',
        comment: 'Version of assessment algorithm used'
      },
      user_rating: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 5
        },
        comment: 'User feedback rating 1-5'
      },
      user_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'User personal notes about the product'
      },
      scan_location: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'GPS coordinates where scan occurred'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('user_product_assessments', ['user_id']);
    await queryInterface.addIndex('user_product_assessments', ['product_id']);
    await queryInterface.addIndex('user_product_assessments', ['user_id', 'product_id'], {
      unique: true,
      name: 'unique_user_product_assessment'
    });
    await queryInterface.addIndex('user_product_assessments', ['recommendation']);
    await queryInterface.addIndex('user_product_assessments', ['personalized_score']);
    await queryInterface.addIndex('user_product_assessments', ['scan_method']);
    await queryInterface.addIndex('user_product_assessments', ['createdAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_product_assessments');
  }
};
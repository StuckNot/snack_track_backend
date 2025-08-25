'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      brand: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      barcode: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ingredients: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      serving_size: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      image_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      manufacturer: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      country_of_origin: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      data_source: {
        type: Sequelize.ENUM('manual', 'api', 'admin'),
        defaultValue: 'manual'
      },
      verification_status: {
        type: Sequelize.ENUM('pending', 'verified', 'rejected'),
        defaultValue: 'pending'
      },
      verified_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      verified_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
    await queryInterface.addIndex('products', ['barcode']);
    await queryInterface.addIndex('products', ['name']);
    await queryInterface.addIndex('products', ['brand']);
    await queryInterface.addIndex('products', ['category_id']);
    await queryInterface.addIndex('products', ['verification_status']);
    await queryInterface.addIndex('products', ['data_source']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
  }
};
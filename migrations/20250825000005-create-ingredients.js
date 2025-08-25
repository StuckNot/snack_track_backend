'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ingredients', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
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
      name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      is_allergen: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      order_index: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      percentage: {
        type: Sequelize.FLOAT,
        allowNull: true,
        validate: {
          min: 0,
          max: 100
        }
      },
      allergen_type: {
        type: Sequelize.ENUM(
          'milk', 'eggs', 'fish', 'shellfish', 'tree_nuts', 'peanuts', 
          'wheat', 'soybeans', 'sesame', 'other'
        ),
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('ingredients', ['product_id']);
    await queryInterface.addIndex('ingredients', ['name']);
    await queryInterface.addIndex('ingredients', ['is_allergen']);
    await queryInterface.addIndex('ingredients', ['allergen_type']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ingredients');
  }
};
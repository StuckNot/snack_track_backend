'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('nutrition_facts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      serving_size_g: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 100,
        comment: 'Serving size in grams'
      },
      calories: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Calories per serving'
      },
      protein: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Protein in grams'
      },
      carbs: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Total carbohydrates in grams'
      },
      fat: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Total fat in grams'
      },
      saturated_fat: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Saturated fat in grams'
      },
      trans_fat: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Trans fat in grams'
      },
      cholesterol: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Cholesterol in mg'
      },
      sodium: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Sodium in mg'
      },
      fiber: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Dietary fiber in grams'
      },
      sugar: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Total sugars in grams'
      },
      added_sugar: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Added sugars in grams'
      },
      vitamin_a: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Vitamin A in mcg'
      },
      vitamin_c: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Vitamin C in mg'
      },
      vitamin_d: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Vitamin D in mcg'
      },
      calcium: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Calcium in mg'
      },
      iron: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Iron in mg'
      },
      potassium: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Potassium in mg'
      },
      other_nutrients: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Additional nutrients as JSON object'
      },
      data_quality: {
        type: Sequelize.ENUM('excellent', 'good', 'partial', 'poor'),
        defaultValue: 'partial',
        comment: 'Quality of nutrition data'
      },
      verified_by: {
        type: Sequelize.ENUM('user', 'admin', 'api', 'lab'),
        defaultValue: 'api',
        comment: 'Source of verification'
      },
      last_verified: {
        type: Sequelize.DATE,
        allowNull: true
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

    // Add indexes
    await queryInterface.addIndex('nutrition_facts', ['product_id']);
    await queryInterface.addIndex('nutrition_facts', ['calories']);
    await queryInterface.addIndex('nutrition_facts', ['data_quality']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('nutrition_facts');
  }
};
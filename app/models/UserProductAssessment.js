// Define ENUM values as constants (easier to manage & reuse)
const ASSESSMENT_TYPES = {
  GOOD: "Good",
  MODERATE: "Moderate",
  AVOID: "Avoid",
};

module.exports = (sequelize, DataTypes) => {
  const UserProductAssessment = sequelize.define(
    "UserProductAssessment",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
      },
      assessment: {
        type: DataTypes.ENUM(...Object.values(ASSESSMENT_TYPES)), // ✅ Using constants
        allowNull: false,
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "user_product_assessments",
      timestamps: true,
      underscored: true,
    }
  );

  UserProductAssessment.associate = (models) => {
    UserProductAssessment.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
    UserProductAssessment.belongsTo(models.Product, {
      foreignKey: "product_id",
      as: "product",
    });
  };

  // ✅ Attach constants directly to the model for better accessibility
  UserProductAssessment.ASSESSMENT_TYPES = ASSESSMENT_TYPES;

  return UserProductAssessment;
};

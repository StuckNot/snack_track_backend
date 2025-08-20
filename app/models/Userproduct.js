module.exports = (sequelize, DataTypes) => {
  const UserProductAssessment = sequelize.define("UserProductAssessment", {
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
      type: DataTypes.ENUM("Good", "Moderate", "Avoid"),
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: "user_product_assessments",
    timestamps: true,   
    underscored: true,  
  });

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

  return UserProductAssessment;
};
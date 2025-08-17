const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  age: DataTypes.INTEGER,
  gender: {
    type: DataTypes.ENUM("Male", "Female", "Other"),
  },
  height: DataTypes.FLOAT,
  weight: DataTypes.FLOAT,
  bmi: DataTypes.FLOAT,
  allergies: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  dietary_preferences: DataTypes.STRING,
  health_goals: DataTypes.STRING,
}, {
  tableName: "users",  
  timestamps: true,
});

User.beforeSave(async (user) => {
  if (user.changed("password")) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
}
});
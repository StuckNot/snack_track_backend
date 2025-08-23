const { User } = require('../models');
const { sequelize } = require('../config/database');

describe('User Model', () => {
  beforeAll(async () => {
    // Sync database for testing
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await User.destroy({ where: {}, force: true });
  });

  describe('🔐 User Creation & Authentication', () => {
    test('should create a user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Test123!@#',
        age: 25,
        gender: 'Male',
        height: 175,
        weight: 70
      };

      const user = await User.create(userData);

      expect(user.id).toBeDefined();
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.password).not.toBe('Test123!@#'); // Should be hashed
      expect(user.BMI).toBeCloseTo(22.86, 1);
    });

    test('should hash password before creating user', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Test123!@#'
      };

      const user = await User.create(userData);
      
      expect(user.password).not.toBe('Test123!@#');
      expect(user.password.length).toBeGreaterThan(50); // bcrypt hash length
    });

    test('should validate password correctly', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123!@#'
      };

      const user = await User.create(userData);
      
      const isValid = await user.validatePassword('Test123!@#');
      const isInvalid = await user.validatePassword('WrongPassword');
      
      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });

    test('should reject weak passwords', async () => {
      await expect(User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'weak'
      })).rejects.toThrow();
    });
  });

  describe('📊 Health Calculations', () => {
    test('should calculate BMI correctly', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123!@#',
        height: 180,
        weight: 70
      });

      const bmi = user.calculateBMI();
      expect(bmi).toBeCloseTo(21.60, 1);
    });

    test('should categorize BMI correctly', async () => {
      const user1 = await User.create({
        name: 'User1',
        email: 'user1@example.com',
        password: 'Test123!@#',
        height: 180,
        weight: 55
      });

      const user2 = await User.create({
        name: 'User2',
        email: 'user2@example.com',
        password: 'Test123!@#',
        height: 170,
        weight: 70
      });

      expect(user1.getBMICategory()).toBe('Underweight');
      expect(user2.getBMICategory()).toBe('Normal');
    });

    test('should calculate daily calories correctly', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123!@#',
        age: 25,
        gender: 'Male',
        height: 180,
        weight: 75,
        activity_level: 'moderate'
      });

      const calories = user.calculateDailyCalories();
      expect(calories).toBeGreaterThan(2000);
      expect(calories).toBeLessThan(3000);
    });

    test('should calculate ideal weight range', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123!@#',
        height: 175
      });

      const range = user.getIdealWeightRange();
      expect(range.min).toBeCloseTo(56.7, 1);
      expect(range.max).toBeCloseTo(76.4, 1);
    });
  });

  describe('🥗 Allergy & Dietary Methods', () => {
    test('should detect allergies correctly', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123!@#',
        allergies: ['nuts', 'dairy']
      });

      expect(user.hasAllergy('peanuts')).toBe(true);
      expect(user.hasAllergy('milk')).toBe(true);
      expect(user.hasAllergy('chicken')).toBe(false);
    });

    test('should check dietary compatibility', async () => {
      const veganUser = await User.create({
        name: 'Vegan User',
        email: 'vegan@example.com',
        password: 'Test123!@#',
        dietary_preferences: 'vegan'
      });

      const vegetarianIngredients = ['wheat', 'tomato', 'cheese'];
      const veganIngredients = ['wheat', 'tomato', 'olive oil'];

      expect(veganUser.isCompatibleWith(vegetarianIngredients)).toBe(false);
      expect(veganUser.isCompatibleWith(veganIngredients)).toBe(true);
    });
  });

  describe('🔍 Static Query Methods', () => {
    test('should find user by email', async () => {
      await User.create({
        name: 'Test User',
        email: 'findme@example.com',
        password: 'Test123!@#'
      });

      const user = await User.findByEmail('findme@example.com');
      expect(user).toBeTruthy();
      expect(user.email).toBe('findme@example.com');

      const nonExistent = await User.findByEmail('notfound@example.com');
      expect(nonExistent).toBeNull();
    });

    test('should find users by health goal', async () => {
      await User.create({
        name: 'User1',
        email: 'user1@example.com',
        password: 'Test123!@#',
        health_goals: 'lose_weight'
      });

      await User.create({
        name: 'User2',
        email: 'user2@example.com',
        password: 'Test123!@#',
        health_goals: 'gain_muscle'
      });

      const weightLossUsers = await User.findByHealthGoal('lose_weight');
      expect(weightLossUsers).toHaveLength(1);
      expect(weightLossUsers[0].health_goals).toBe('lose_weight');
    });
  });

  describe('🔒 Data Privacy Methods', () => {
    test('should return safe object without password', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123!@#',
        height: 175,
        weight: 70
      });

      const safeObject = user.toSafeObject();
      
      expect(safeObject.password).toBeUndefined();
      expect(safeObject.name).toBe('Test User');
      expect(safeObject.bmiCategory).toBeDefined();
      expect(safeObject.dailyCalories).toBeDefined();
    });

    test('should return public object with minimal data', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123!@#'
      });

      const publicObject = user.toPublicObject();
      
      expect(publicObject.id).toBeDefined();
      expect(publicObject.name).toBe('Test User');
      expect(publicObject.email).toBeUndefined();
      expect(publicObject.password).toBeUndefined();
    });

    test('should return health profile with relevant data', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123!@#',
        age: 25,
        gender: 'Male',
        height: 175,
        weight: 70,
        allergies: ['nuts'],
        dietary_preferences: 'veg'
      });

      const healthProfile = user.toHealthProfile();
      
      expect(healthProfile.age).toBe(25);
      expect(healthProfile.allergies).toEqual(['nuts']);
      expect(healthProfile.dietary_preferences).toBe('veg');
      expect(healthProfile.email).toBeUndefined();
      expect(healthProfile.password).toBeUndefined();
    });
  });
});
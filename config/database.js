const { Sequelize } = require('sequelize');
require('dotenv').config();

const config = {
  development: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'snacktrack_dev',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  },
  test: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME ? `${process.env.DB_NAME}_test` : 'snacktrack_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
};

// Test database connection function
const testConnection = async () => {
  try {
    const env = process.env.NODE_ENV || 'development';
    const dbConfig = config[env];
    
    const sequelize = new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: false, // Disable logging for connection test
        dialectOptions: dbConfig.dialectOptions
      }
    );

    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    await sequelize.close();
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    return false;
  }
};

module.exports = {
  ...config,
  testConnection
};
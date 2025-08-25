const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = process.env.PORT || 5000;

/**
 * 🚀 START SERVER
 */
const startServer = async () => {
  try {
    // Test database connection
    console.log('🔌 Testing database connection...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.log('⚠️  Database connection failed, but server will start anyway');
      console.log('💡 Install PostgreSQL and update .env file to enable database features');
    }

    // Start the server
    app.listen(PORT, () => {
      console.log('🎉 SnackTrack Server Status:');
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
      console.log('');
      console.log('🥗 Available User Endpoints:');
      console.log(`   POST /api/users/register - User registration`);
      console.log(`   POST /api/users/login - User login`);
      console.log(`   GET  /api/users/health-tips - Public health tips`);
      console.log(`   GET  /api/users/dietary-preferences - Dietary options`);
      console.log('');
      console.log('🔐 Protected Endpoints (require JWT token):');
      console.log(`   GET  /api/users/profile - Get user profile`);
      console.log(`   PUT  /api/users/profile - Update profile`);
      console.log(`   GET  /api/users/health-analysis - Health analysis`);
      console.log(`   POST /api/users/check-compatibility - Check food compatibility`);
      console.log('');
      if (!isConnected) {
        console.log('💡 Next Steps:');
        console.log('   1. Install PostgreSQL (https://postgresapp.com/)');
        console.log('   2. Update DB_PASSWORD in .env file');
        console.log('   3. Run: npm run db:create');
        console.log('   4. Run: npm run db:migrate');
        console.log('   5. Run: npm run db:seed');
      }
      console.log('=====================================');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();
const app = require('./app');
const { testConnection } = require('./config/config');

const PORT = process.env.PORT || 5000;

/**
 * START SERVER
 */
const startServer = async () => {
  try {
    // Test database connection
    console.log('Testing database connection...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.log('Database connection failed, but server will start anyway');
      console.log('Install PostgreSQL and update .env file to enable database features');
    }

    // Start the server
    app.listen(PORT, () => {
      console.log('SnackTrack Server Status:');
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`API Base URL: http://localhost:${PORT}/api`);
      console.log(`API Documentation: http://localhost:${PORT}/api`);
      console.log(`Health Check: http://localhost:${PORT}/api/health`);
      if (!isConnected) {
        console.log('Next Steps:');
        console.log('   1. Install PostgreSQL (https://postgresapp.com/)');
        console.log('   2. Update DB_PASSWORD in .env file');
        console.log('   3. Run: npm run db:create');
        console.log('   4. Run: npm run db:migrate');
        console.log('   5. Run: npm run db:seed');
      }
    });

  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();
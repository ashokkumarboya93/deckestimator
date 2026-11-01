// =============================================
// Deck Estimator — Server Entry Point
// =============================================
// Validates environment, connects to MongoDB, starts Express.
// Handles graceful shutdown on process signals.

const { env, validateEnv } = require('./config/env');
const { connectDatabase, disconnectDatabase } = require('./config/database');
const app = require('./app');

async function startServer() {
  try {
    // Step 1: Validate environment variables
    validateEnv();
    console.log(`[Server] Environment: ${env.NODE_ENV}`);

    // Step 2: Connect to MongoDB
    await connectDatabase();

    // Step 3: Start Express
    const server = app.listen(env.PORT, () => {
      console.log(`[Server] Deck Estimator API running on http://localhost:${env.PORT}`);
      console.log(`[Server] Health check: http://localhost:${env.PORT}/api/v1/health`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n[Server] ${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDatabase();
        console.log('[Server] Server closed.');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('[Server] Forced shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Catch unhandled rejections
    process.on('unhandledRejection', (reason) => {
      console.error('[Server] Unhandled Rejection:', reason);
      // Let the process manager restart the server
      shutdown('UNHANDLED_REJECTION');
    });

    process.on('uncaughtException', (error) => {
      console.error('[Server] Uncaught Exception:', error);
      shutdown('UNCAUGHT_EXCEPTION');
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error.message);
    process.exit(1);
  }
}

startServer();


// =============================================
// Deck Estimator — MongoDB Connection
// =============================================
// Connects to MongoDB Atlas (or local) using Mongoose.
// Logs connection events and handles errors.

const mongoose = require('mongoose');
const dns = require('dns');
const { env } = require('./env');

// When connecting to Atlas SRV URIs on Windows / Wi-Fi routers that truncate large SRV packets,
// ensure public standard DNS resolvers are available
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Use system default if setting custom servers is restricted
}

/**
 * Connect to MongoDB.
 * Retries are handled by Mongoose's built-in reconnection logic.
 */
async function connectDatabase() {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      dbName: 'DECK_ESTIMATOR',
    });
    console.log(`[Database] Connected to MongoDB (${env.isDev ? 'development' : env.NODE_ENV})`);
  } catch (error) {
    console.error('[Database] MongoDB connection failed:', error.message);
    throw error;
  }
}

// Connection event listeners
mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database] MongoDB connection error:', err.message);
});

/**
 * Gracefully close the database connection.
 */
async function disconnectDatabase() {
  await mongoose.connection.close();
  console.log('[Database] MongoDB connection closed');
}

module.exports = { connectDatabase, disconnectDatabase };


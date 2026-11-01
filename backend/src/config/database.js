// =============================================
// Deck Estimator — MongoDB Connection
// =============================================
// Connects to MongoDB Atlas (or local) using Mongoose.
// Logs connection events and handles errors.

const mongoose = require('mongoose');
const { env } = require('./env');

/**
 * Connect to MongoDB.
 * Retries are handled by Mongoose's built-in reconnection logic.
 */
async function connectDatabase() {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      dbName: 'deck_estimator',
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


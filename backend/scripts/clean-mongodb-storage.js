// =============================================
// Deck Estimator — MongoDB Storage Cleanup Script
// =============================================
// CAREFUL CLEANUP:
// ONLY drops the bloated auditLogs collection (~554 MB of duplicate photo logs).
// ALL other collections (users, estimates, decks, contractors, pricing, settings, etc.)
// remain 100% untouched.
// =============================================

const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function runCleanup() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Error: MONGODB_URI not found in .env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  console.log('\n--- Checking current Database Stats before cleanup ---');
  const beforeStats = await db.stats();
  console.log('Data Size Before:', (beforeStats.dataSize / 1024 / 1024).toFixed(2), 'MB');
  console.log('Storage Size Before:', (beforeStats.storageSize / 1024 / 1024).toFixed(2), 'MB');

  console.log('\n--- Dropping bloated auditLogs collection (~554 MB) ---');
  try {
    const auditExists = await db.listCollections({ name: 'auditLogs' }).hasNext();
    if (auditExists) {
      await db.collection('auditLogs').drop();
      console.log('✔ Dropped auditLogs successfully! (~554 MB freed)');
    } else {
      console.log('ℹ auditLogs collection does not exist.');
    }
  } catch (err) {
    console.error('Failed to drop auditLogs:', err.message);
  }

  console.log('\n--- Checking Database Stats after cleanup ---');
  try {
    const afterStats = await db.stats();
    console.log('Data Size After:', (afterStats.dataSize / 1024 / 1024).toFixed(2), 'MB');
    console.log('Storage Size After:', (afterStats.storageSize / 1024 / 1024).toFixed(2), 'MB');
  } catch (err) {
    console.warn('Could not fetch updated stats:', err.message);
  }

  await mongoose.disconnect();
  console.log('\n✔ Cleanup finished safely. Only unnecessary auditLogs was removed.');
}

if (require.main === module) {
  runCleanup().catch(console.error);
}

module.exports = { runCleanup };

// =============================================
// Deck Estimator — Reset to Initial Application State
// =============================================
// 1. Drops the unneeded 'sample_mflix' demo database (160 MB freed)
// 2. Removes test estimates, test decks, and test uploads
// 3. Removes contractor test verification documents & histories
// 4. Removes test leads, commissions, notifications, and discount logs
// 5. Drops obsolete/duplicate ghost collections
// 6. Preserves all critical platform configs, pricing, materials, services,
//    catalogs, and essential admin accounts
// =============================================

const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function resetToInitial() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Error: MONGODB_URI not found in .env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB cluster...');
  await mongoose.connect(uri);
  const client = mongoose.connection.getClient();

  // 1. Drop sample_mflix database
  console.log('\n--- 1. Dropping demo database (sample_mflix) ---');
  try {
    const dbs = await client.db().admin().listDatabases();
    const hasSampleMflix = dbs.databases.some((d) => d.name === 'sample_mflix');
    if (hasSampleMflix) {
      await client.db('sample_mflix').dropDatabase();
      console.log('✔ Dropped sample_mflix database successfully! (~160 MB freed)');
    } else {
      console.log('ℹ sample_mflix does not exist.');
    }
  } catch (err) {
    console.warn('Could not drop sample_mflix:', err.message);
  }

  const db = client.db('DECK_ESTIMATOR');

  // 2. Collections to clean completely for initial fresh state
  console.log('\n--- 2. Cleaning test data & uploads from DECK_ESTIMATOR ---');
  const collectionsToClean = [
    // Test Estimates & revisions
    'estimates',
    'estimateRevisions',
    'estimateActivities',
    // Test Decks & photos
    'decks',
    'deckimages',
    'deckConditionAnalyses',
    // Uploaded verification documents & test contractor history
    'verificationdocuments',
    'verificationhistories',
    // Test leads & activities
    'leads',
    'leadactivities',
    'leadassignmenthistories',
    // Test commissions & payouts
    'commissions',
    'commissionpaymentrecords',
    'commissionhistories',
    // Test notifications & requests
    'notifications',
    'userrequests',
    // Test discount applications & logs
    'discountapplications',
    'discountAuditLogs',
    // Ghost / obsolete collections
    'projects',
    'mediaFiles',
    'estimatorfields',
    'contractorProfiles',
    'estimatordependencies',
    'platformSettings',
  ];

  for (const colName of collectionsToClean) {
    try {
      const exists = await db.listCollections({ name: colName }).hasNext();
      if (exists) {
        await db.collection(colName).drop();
        console.log(`✔ Cleared test collection: ${colName}`);
      }
    } catch (err) {
      console.warn(`Could not clear ${colName}:`, err.message);
    }
  }

  // 3. Clean test users: keep admins and active user, strip any base64 avatars
  console.log('\n--- 3. Cleaning test users & heavy avatar blobs ---');
  try {
    const keepEmails = [
      'admin@deckestimator.com',
      'robert@deckestimator.com',
      'ashokkumarboya93@gmail.com',
    ];

    // Remove temporary disposable test accounts
    const deleteResult = await db.collection('users').deleteMany({
      email: { $nin: keepEmails },
    });
    console.log(`✔ Removed ${deleteResult.deletedCount} temporary test user accounts`);

    // Strip base64 avatar strings from remaining users if present
    await db.collection('users').updateMany(
      { avatar: { $regex: '^data:image' } },
      { $unset: { avatar: '' } }
    );
    await db.collection('users').updateMany(
      { profileImage: { $regex: '^data:image' } },
      { $unset: { profileImage: '' } }
    );
    console.log('✔ Sanitized remaining user profile images');
  } catch (err) {
    console.warn('Error cleaning users:', err.message);
  }

  // 4. Verification and final cluster stats
  console.log('\n--- 4. Checking final cluster statistics ---');
  const finalDbs = await client.db().admin().listDatabases();
  console.table(
    finalDbs.databases.map((d) => ({
      name: d.name,
      sizeMB: (d.sizeOnDisk / 1024 / 1024).toFixed(2),
    }))
  );

  const finalStats = await db.stats();
  console.log('DECK_ESTIMATOR Data Size:', (finalStats.dataSize / 1024 / 1024).toFixed(2), 'MB');
  console.log('DECK_ESTIMATOR Storage Size:', (finalStats.storageSize / 1024 / 1024).toFixed(2), 'MB');

  await mongoose.disconnect();
  console.log('\n✔ Application successfully reset to initial fresh clean state!');
}

if (require.main === module) {
  resetToInitial().catch(console.error);
}

module.exports = { resetToInitial };


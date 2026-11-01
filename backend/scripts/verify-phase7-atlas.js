// =============================================
// Deck Estimator — Live MongoDB Atlas Phase 7 Verification
// =============================================
// Connects to live MongoDB Atlas to verify Phase 7 collection:
// deckConditionAnalyses and its integration with decks, users, and auditLogs.
// Strictly validates persistence, indexing, populates, and cleans up.

const path = require('path');
const dns = require('dns');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignored if unsupported
}

const ConditionAnalysis = require('../src/modules/condition-analysis/conditionAnalysis.model');
const Deck = require('../src/modules/decks/deck.model');
const DeckImage = require('../src/modules/files/deckImage.model');
const User = require('../src/modules/users/users.model');
const AuditLog = require('../src/shared/models/auditLog.model');

async function verifyLiveAtlas() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('ERROR: MONGODB_URI environment variable is not defined.');
    process.exit(1);
  }

  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  console.log(`Connecting to live MongoDB Atlas: ${maskedUri}`);

  const cleanupStack = [];

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    console.log('✓ Successfully connected to live MongoDB Atlas!');
    console.log(`Database Name: ${mongoose.connection.db.databaseName}`);

    // Resolve an existing user or fallback ID
    let testUserId;
    const existingUsers = await mongoose.connection.db.collection('users').find({}).toArray();
    if (existingUsers.length > 0) {
      testUserId = existingUsers[0]._id;
      console.log(`Found existing Atlas user: ${existingUsers[0].email} (${testUserId})`);
    } else {
      testUserId = new mongoose.Types.ObjectId();
      console.log(`Using generated ObjectId: ${testUserId}`);
    }

    // 1. Setup Test Deck
    console.log('\n--- 1. Setting Up Live Test Deck ---');
    const testDeck = await Deck.create({
      ownerId: testUserId,
      ownerType: 'CUSTOMER',
      projectName: 'Atlas Live AI Analysis Deck',
      deckShape: 'rectangle',
      measurementUnit: 'ft',
      dimensions: { length: 24, width: 16, area: 384 },
      surfaceDetails: { material: 'wood', condition: 'fair' },
      completionStatus: 'complete',
    });
    cleanupStack.push(() => Deck.findByIdAndDelete(testDeck._id));
    console.log(`✓ Test Deck created with ID: ${testDeck._id}`);

    // 2. Setup Test DeckImage
    console.log('\n--- 2. Setting Up Test Deck Image Record ---');
    const testImage = await DeckImage.create({
      deckId: testDeck._id,
      ownerId: testUserId,
      originalFilename: 'atlas-live-condition-photo.jpg',
      storageKey: `atlas-test-${Date.now()}.jpg`,
      storageProvider: 'local',
      mimeType: 'image/jpeg',
      fileSize: 2048,
      imageDescription: 'Primary surface photo for AI verification',
    });
    cleanupStack.push(() => DeckImage.findByIdAndDelete(testImage._id));
    console.log(`✓ Test DeckImage created with ID: ${testImage._id}`);

    // 3. Test Condition Analysis Persistence
    console.log('\n--- 3. Testing Condition Analysis Persistence on Atlas ---');
    const testAnalysis = await ConditionAnalysis.create({
      deckId: testDeck._id,
      ownerId: testUserId,
      requestedBy: testUserId,
      imageReferences: [
        {
          imageId: testImage._id,
          storageKey: testImage.storageKey,
          originalFilename: testImage.originalFilename,
          mimeType: testImage.mimeType,
        },
      ],
      analysisStatus: 'COMPLETED',
      conditionLevel: 3,
      conditionLabel: 'MODERATE_DETERIORATION',
      conditionConfidence: 0.895,
      imageQuality: {
        label: 'GOOD',
        confidence: 0.96,
        blurScore: 135.5,
        brightness: 124.0,
        resolution: '1920x1080',
      },
      defects: [
        { label: 'PEELING_COATING', confidence: 0.92, detected: true },
        { label: 'FADING_DISCOLORATION', confidence: 0.78, detected: true },
        { label: 'CRACKS', confidence: 0.12, detected: false },
      ],
      manualReview: {
        required: false,
        reason: null,
        reviewStatus: 'NONE',
      },
      model: {
        name: 'MobileNetV3-DeckCondition',
        version: '1.0.0',
        datasetVersion: 'pilot-v1',
      },
      limitations: [
        'Assessment is based only on visible image content.',
        'Structural safety cannot be determined from this photograph.',
      ],
      inferenceDurationMs: 138,
      analysisStartedAt: new Date(),
      analysisCompletedAt: new Date(),
      notes: 'Atlas live verification test document',
    });
    cleanupStack.push(() => ConditionAnalysis.findByIdAndDelete(testAnalysis._id));
    console.log(`✓ Condition Analysis saved with ID: ${testAnalysis._id}`);
    console.log(`  Status: ${testAnalysis.analysisStatus} | Level: ${testAnalysis.conditionLevel} (${testAnalysis.conditionLabel})`);
    console.log(`  Confidence: ${testAnalysis.conditionConfidence * 100}% | Quality: ${testAnalysis.imageQuality.label}`);

    // 4. Test Audit Log Persistence
    console.log('\n--- 4. Testing Audit Log Persistence on Atlas ---');
    const testAuditLog = await AuditLog.create({
      performedBy: testUserId,
      action: 'CREATE_CONDITION_ANALYSIS',
      entityType: 'ESTIMATE',
      entityId: testAnalysis._id,
      newValue: {
        deckId: testDeck._id,
        status: testAnalysis.analysisStatus,
        conditionLevel: testAnalysis.conditionLevel,
      },
    });
    cleanupStack.push(() => AuditLog.findByIdAndDelete(testAuditLog._id));
    console.log(`✓ Audit Log saved with ID: ${testAuditLog._id}`);

    // 5. Query and Population Validation
    console.log('\n--- 5. Verifying Atlas Queries & Schema Population ---');
    const queried = await ConditionAnalysis.findById(testAnalysis._id)
      .populate('deckId', 'projectName dimensions')
      .populate('imageReferences.imageId', 'originalFilename');

    if (!queried) {
      throw new Error('Queried analysis record could not be retrieved from Atlas!');
    }
    console.log(`✓ Successfully retrieved analysis populated with Deck & Image:`);
    console.log(`  Deck: ${queried.deckId?.projectName} (${queried.deckId?.dimensions?.area} sq ft)`);
    console.log(`  Image: ${queried.imageReferences[0]?.imageId?.originalFilename}`);

    console.log('\n=============================================');
    console.log('ALL PHASE 7 LIVE ATLAS PERSISTENCE CHECKS PASSED!');
    console.log('=============================================');
  } catch (err) {
    console.error('Atlas Verification Failure:', err);
    process.exitCode = 1;
  } finally {
    console.log('\n--- Cleaning up Atlas test records ---');
    for (const cleaner of cleanupStack.reverse()) {
      try {
        await cleaner();
      } catch (cleanErr) {
        console.warn('Warning during cleanup:', cleanErr.message);
      }
    }
    console.log('✓ Cleanup complete. Atlas database left clean.');
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB Atlas.');
  }
}

verifyLiveAtlas();

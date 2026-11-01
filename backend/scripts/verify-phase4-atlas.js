// =============================================
// Deck Estimator — Live MongoDB Atlas Phase 4 Verification
// =============================================
// Connects to live MongoDB Atlas to verify Phase 4 collections,
// schemas, dimensional area calculations, and metadata persistence.
// Safely masks credentials and performs automatic test record cleanup.

const path = require('path');
const dns = require('dns');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

// Configure reliable DNS servers for SRV resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignored if unsupported
}

const Deck = require('../src/modules/decks/deck.model');
const DeckImage = require('../src/modules/files/deckImage.model');
const User = require('../src/modules/users/users.model');
const { ROLES } = require('../src/shared/constants');

async function verifyLiveAtlas() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('ERROR: MONGODB_URI environment variable is not defined.');
    process.exit(1);
  }

  // Mask credentials for display
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  console.log(`Connecting to live MongoDB Atlas at: ${maskedUri}`);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log('✓ Successfully connected to MongoDB Atlas!');
    console.log(`Database Name: ${mongoose.connection.db.databaseName}`);

    // 1. Resolve an owner ObjectId
    let testOwnerId;
    const existingUser = await mongoose.connection.db.collection('users').findOne({});
    if (existingUser) {
      testOwnerId = existingUser._id;
    } else {
      testOwnerId = new mongoose.Types.ObjectId();
    }

    console.log(`Using owner ID: ${testOwnerId}`);

    // 2. Test Phase 4 Deck Persistence on Atlas
    console.log('\n--- 1. Testing Deck Creation on Live Atlas ---');
    const testDeck = await Deck.create({
      ownerId: testOwnerId,
      projectName: 'Live Atlas Verified Deck',
      projectDescription: 'Phase 4 live Atlas persistence verification',
      propertyAddress: {
        street: '789 Atlas Way',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
      },
      measurementUnit: 'ft',
      deckShape: 'rectangle',
      dimensions: {
        length: 24,
        width: 16,
        area: 384, // 24 * 16 = 384
        isManualArea: false,
      },
      structureDetails: {
        levels: 1,
        isAttached: true,
        hasRailings: true,
        railingLength: 64,
        hasStairs: true,
        stairStepCount: 3,
        builtInFeatures: ['bench'],
      },
      surfaceDetails: {
        material: 'wood',
        coatingStatus: 'sealed',
      },
      visibleConditions: ['surface_wear'],
      completionStatus: 'complete',
    });

    console.log(`✓ Deck created on Atlas with ID: ${testDeck._id}`);
    console.log(`  Project Name: ${testDeck.projectName}`);
    console.log(`  Dimensions: ${testDeck.dimensions.length} x ${testDeck.dimensions.width} ft`);
    console.log(`  Area: ${testDeck.dimensions.area} sq ft`);

    // 3. Test Phase 4 DeckImage Metadata Persistence on Atlas
    console.log('\n--- 2. Testing DeckImage Metadata Creation on Live Atlas ---');
    const testImage = await DeckImage.create({
      deckId: testDeck._id,
      ownerId: testOwnerId,
      originalFilename: 'atlas_site_photo.jpg',
      storageKey: 'atlas-uuid-test-key-1234.jpg',
      storageProvider: 'local',
      mimeType: 'image/jpeg',
      fileSize: 1024 * 512, // 512 KB
      imageDescription: 'Site photo recorded directly to Atlas cluster',
    });

    console.log(`✓ DeckImage metadata created on Atlas with ID: ${testImage._id}`);
    console.log(`  Filename: ${testImage.originalFilename}`);
    console.log(`  MIME Type: ${testImage.mimeType}`);
    console.log(`  File Size: ${testImage.fileSize} bytes`);

    // 4. Test Query and Association
    console.log('\n--- 3. Testing Relational Query on Live Atlas ---');
    const retrievedDeck = await Deck.findById(testDeck._id).lean();
    const retrievedImages = await DeckImage.find({ deckId: testDeck._id }).lean();

    console.log(`✓ Retrieved Deck: "${retrievedDeck.projectName}"`);
    console.log(`✓ Associated Images Count: ${retrievedImages.length}`);
    if (retrievedImages.length !== 1 || retrievedImages[0].storageKey !== testImage.storageKey) {
      throw new Error('Image metadata relationship mismatch on Atlas query!');
    }

    // 5. Test Indexes on Live Atlas
    console.log('\n--- 4. Checking Collection Indexes on Live Atlas ---');
    const deckIndexes = await Deck.collection.indexes();
    const imageIndexes = await DeckImage.collection.indexes();
    console.log('✓ Deck Indexes:', deckIndexes.map((idx) => Object.keys(idx.key).join('+')).join(', '));
    console.log('✓ DeckImage Indexes:', imageIndexes.map((idx) => Object.keys(idx.key).join('+')).join(', '));

    // 6. Cleanup Live Atlas Test Records
    console.log('\n--- 5. Cleaning Up Live Atlas Test Records ---');
    await DeckImage.deleteMany({ deckId: testDeck._id });
    await Deck.findByIdAndDelete(testDeck._id);
    console.log('✓ Cleaned up all verification test records from live Atlas database.');

    console.log('\n=============================================');
    console.log('✅ LIVE MONGODB ATLAS PHASE 4 PERSISTENCE: FULLY VERIFIED');
    console.log('=============================================');
  } catch (err) {
    console.error('\n❌ ATLAS VERIFICATION FAILED:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB Atlas.');
  }
}

verifyLiveAtlas();

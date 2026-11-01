// =============================================
// Deck Estimator — Live MongoDB Atlas Phase 5 Verification
// =============================================
// Connects to live MongoDB Atlas to verify Phase 5 collections,
// schemas, foreign key relationships, audit log schemas, and persistence.
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

const MaterialCategory = require('../src/modules/catalogs/materialCategory.model');
const Material = require('../src/modules/catalogs/material.model');
const ServiceCategory = require('../src/modules/catalogs/serviceCategory.model');
const Service = require('../src/modules/catalogs/service.model');
const MaterialServiceCompatibility = require('../src/modules/catalogs/materialServiceCompatibility.model');
const AuditLog = require('../src/shared/models/auditLog.model');

async function verifyLiveAtlas() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('ERROR: MONGODB_URI environment variable is not defined.');
    process.exit(1);
  }

  // Mask credentials for safe display
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  console.log(`Connecting to live MongoDB Atlas at: ${maskedUri}`);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log('✓ Successfully connected to MongoDB Atlas!');
    console.log(`Database Name: ${mongoose.connection.db.databaseName}`);

    // Resolve an admin/operator ObjectId
    let testAdminId;
    const existingUser = await mongoose.connection.db.collection('users').findOne({});
    if (existingUser) {
      testAdminId = existingUser._id;
    } else {
      testAdminId = new mongoose.Types.ObjectId();
    }

    console.log(`Using admin/operator ID: ${testAdminId}`);

    // 1. Verify Material Category Persistence
    console.log('\n--- 1. Testing Material Category Persistence on Live Atlas ---');
    const testMatCategory = await MaterialCategory.create({
      name: 'Atlas Test Deck Coatings',
      slug: 'atlas-test-deck-coatings-' + Date.now(),
      description: 'Live Atlas verification category for deck finishes',
      displayOrder: 99,
      status: 'active',
      createdBy: testAdminId,
      updatedBy: testAdminId,
    });
    console.log(`✓ Material Category created on Atlas: ID=${testMatCategory._id}, Name="${testMatCategory.name}"`);

    // 2. Verify Material Persistence
    console.log('\n--- 2. Testing Material Persistence on Live Atlas ---');
    const testMatCode = `ATLAS-MAT-${Date.now().toString().slice(-4)}`;
    const testMaterial = await Material.create({
      materialName: 'Olympic Elite Advanced Stain',
      materialCode: testMatCode,
      categoryId: testMatCategory._id,
      materialType: 'stain',
      brandName: 'Olympic',
      productName: 'Olympic Elite Stain & Sealant',
      compatibleSurfaces: ['wood'],
      measurement: {
        quantityUnit: 'gallon',
      },
      coverage: {
        coverageValue: 350,
        coverageAreaUnit: 'square_foot',
        coverageQuantity: 1,
        coverageQuantityUnit: 'gallon',
      },
      cost: {
        unitCost: 59.99,
        currency: 'USD',
        costUnit: 'gallon',
      },
      specifications: {
        finishType: 'Transparent',
        dryingTime: 24,
        recommendedCoats: 2,
        uvResistance: true,
        waterResistance: true,
      },
      status: 'active',
      createdBy: testAdminId,
      updatedBy: testAdminId,
    });
    console.log(`✓ Material created on Atlas: ID=${testMaterial._id}, Code="${testMaterial.materialCode}", UnitCost=$${testMaterial.cost.unitCost}`);

    // 3. Verify Service Category Persistence
    console.log('\n--- 3. Testing Service Category Persistence on Live Atlas ---');
    const testSrvCategory = await ServiceCategory.create({
      name: 'Atlas Test Surface Restoration',
      slug: 'atlas-test-surface-restoration-' + Date.now(),
      description: 'Live Atlas category for deep deck cleaning',
      displayOrder: 99,
      status: 'active',
      createdBy: testAdminId,
      updatedBy: testAdminId,
    });
    console.log(`✓ Service Category created on Atlas: ID=${testSrvCategory._id}, Name="${testSrvCategory.name}"`);

    // 4. Verify Service Persistence
    console.log('\n--- 4. Testing Service Persistence on Live Atlas ---');
    const testSrvCode = `ATLAS-SRV-${Date.now().toString().slice(-4)}`;
    const testService = await Service.create({
      serviceName: 'Deep Wood Deck Stripping',
      serviceCode: testSrvCode,
      categoryId: testSrvCategory._id,
      serviceType: 'preparation',
      description: 'Chemical stripping of weathered deck coatings',
      measurement: {
        unit: 'square_foot',
      },
      operationalDetails: {
        estimatedDuration: 2,
        durationUnit: 'hour',
        requiredEquipment: ['Pressure Washer', 'Chemical Sprayer'],
        safetyNotes: 'Wear chemical goggles and protective gloves',
      },
      status: 'active',
      createdBy: testAdminId,
      updatedBy: testAdminId,
    });
    console.log(`✓ Service created on Atlas: ID=${testService._id}, Code="${testService.serviceCode}", Type="${testService.serviceType}"`);

    // 5. Verify Material-Service Compatibility Persistence
    console.log('\n--- 5. Testing Compatibility Relationship on Live Atlas ---');
    const testCompatibility = await MaterialServiceCompatibility.create({
      materialId: testMaterial._id,
      serviceId: testService._id,
      compatibilityStatus: 'compatible',
      compatibilityNotes: 'Olympic Elite stain performs optimally after chemical deep stripping.',
      createdBy: testAdminId,
      updatedBy: testAdminId,
    });
    console.log(`✓ Compatibility created on Atlas: ID=${testCompatibility._id}, Status="${testCompatibility.compatibilityStatus}"`);

    // 6. Verify Populated Relational Query
    console.log('\n--- 6. Testing Populated Relational Queries ---');
    const populated = await MaterialServiceCompatibility.findById(testCompatibility._id)
      .populate('materialId', 'materialName materialCode materialType brandName')
      .populate('serviceId', 'serviceName serviceCode serviceType');
    console.log(`✓ Populated Material: "${populated.materialId.materialName}" (${populated.materialId.materialCode})`);
    console.log(`✓ Populated Service: "${populated.serviceId.serviceName}" (${populated.serviceId.serviceCode})`);

    // 7. Verify Audit Log Persistence against Atlas Validator
    console.log('\n--- 7. Testing Audit Log Persistence with Atlas Schema Validator ---');
    const testAuditLog = await AuditLog.create({
      performedBy: testAdminId,
      action: 'CREATE_MATERIAL',
      entityType: 'MATERIAL',
      entityId: testMaterial._id,
      newValue: { name: testMaterial.materialName, code: testMaterial.materialCode },
    });
    console.log(`✓ Audit log created on Atlas: ID=${testAuditLog._id}, Action="${testAuditLog.action}", EntityType="${testAuditLog.entityType}"`);

    // 8. Cleanup Test Artifacts
    console.log('\n--- 8. Cleaning Up Test Artifacts ---');
    await MaterialServiceCompatibility.findByIdAndDelete(testCompatibility._id);
    await Material.findByIdAndDelete(testMaterial._id);
    await MaterialCategory.findByIdAndDelete(testMatCategory._id);
    await Service.findByIdAndDelete(testService._id);
    await ServiceCategory.findByIdAndDelete(testSrvCategory._id);
    await AuditLog.findByIdAndDelete(testAuditLog._id);
    console.log('✓ Successfully cleaned up all test documents from MongoDB Atlas.');

    console.log('\n=============================================');
    console.log('🎉 Live MongoDB Atlas Phase 5 Verification: ALL PASSED!');
    console.log('=============================================');
  } catch (err) {
    console.error('❌ Live Atlas Verification Failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB Atlas.');
  }
}

verifyLiveAtlas();

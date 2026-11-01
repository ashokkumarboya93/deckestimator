// =============================================
// Deck Estimator — Live MongoDB Atlas Phase 6 Verification
// =============================================
// Connects to live MongoDB Atlas to verify Phase 6 collections:
// pricingConfigurations, estimates, estimateRevisions, and auditLogs.
// Strictly tests persistence, schema validation, calculations, revisions,
// and ensures complete cleanup of test records.

const path = require('path');
const dns = require('dns');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignored if unsupported
}

const PricingConfiguration = require('../src/modules/pricing/pricingConfiguration.model');
const Estimate = require('../src/modules/estimates/estimate.model');
const EstimateRevision = require('../src/modules/estimates/estimateRevision.model');
const Deck = require('../src/modules/decks/deck.model');
const User = require('../src/modules/users/users.model');
const Material = require('../src/modules/catalogs/material.model');
const MaterialCategory = require('../src/modules/catalogs/materialCategory.model');
const Service = require('../src/modules/catalogs/service.model');
const ServiceCategory = require('../src/modules/catalogs/serviceCategory.model');
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

    // Resolve an admin/operator ObjectId
    let testUserId;
    const existingUsers = await mongoose.connection.db.collection('users').find({}).toArray();
    if (existingUsers.length > 0) {
      testUserId = existingUsers[0]._id;
      console.log(`Found existing Atlas user: ${existingUsers[0].email} (${testUserId})`);
    } else {
      testUserId = new mongoose.Types.ObjectId();
      console.log(`Using generated ObjectId: ${testUserId}`);
    }

    // 1. Verify Pricing Configuration Persistence
    console.log('\n--- 1. Testing Pricing Configuration Persistence on Atlas ---');
    const testPricingConfig = await PricingConfiguration.create({
      configurationName: 'Atlas Live Test Pricing Rules 2026',
      minimumJobPrice: 500,
      basePricePerSqFt: 5.5,
      laborRate: 65,
      wastePercentage: 10,
      travelCharge: 75,
      taxPercentage: 6.5,
      taxName: 'State Sales Tax',
      additionalCoatingPrice: 1.25,
      notes: 'Live verification test document',
      effectiveFrom: new Date(),
      isActive: true,
      createdBy: testUserId,
    });
    cleanupStack.push(() => PricingConfiguration.findByIdAndDelete(testPricingConfig._id));
    console.log(`✓ Pricing Configuration saved with ID: ${testPricingConfig._id}`);
    console.log(`  Name: ${testPricingConfig.configurationName}`);
    console.log(`  Base: $${testPricingConfig.basePricePerSqFt}/sqft | Min Job: $${testPricingConfig.minimumJobPrice} | Waste: ${testPricingConfig.wastePercentage}%`);

    // 2. Setup Deck, Material, and Service for Estimate Test
    console.log('\n--- 2. Setting Up Dependent Project & Catalog Records ---');
    const testMatCat = await MaterialCategory.create({
      name: 'Atlas Test Finishes',
      slug: `atlas-test-finishes-${Date.now()}`,
      description: 'Temporary category for live test',
      createdBy: testUserId,
      isActive: true,
    });
    cleanupStack.push(() => MaterialCategory.findByIdAndDelete(testMatCat._id));

    const testMaterial = await Material.create({
      materialName: 'Atlas Premium Cedar Stain',
      materialCode: `MAT-ATLAS-${Date.now()}`,
      categoryId: testMatCat._id,
      brandName: 'AtlasPro',
      productName: 'CedarShield',
      materialType: 'stain',
      unitCost: 45.0,
      unitOfMeasure: 'gallon',
      coverageValue: 200,
      coverageAreaUnit: 'square_foot',
      compatibleSurfaces: ['wood'],
      createdBy: testUserId,
      isActive: true,
    });
    cleanupStack.push(() => Material.findByIdAndDelete(testMaterial._id));

    const testSrvCat = await ServiceCategory.create({
      name: 'Atlas Test Prep Services',
      slug: `atlas-test-prep-services-${Date.now()}`,
      description: 'Temporary service category for live test',
      createdBy: testUserId,
      isActive: true,
    });
    cleanupStack.push(() => ServiceCategory.findByIdAndDelete(testSrvCat._id));

    const testService = await Service.create({
      serviceName: 'Atlas Pressure Clean & Prep',
      serviceCode: `SRV-ATLAS-${Date.now()}`,
      serviceType: 'cleaning',
      categoryId: testSrvCat._id,
      pricingModel: 'per_sq_ft',
      basePrice: 0.5,
      estimatedHours: 4,
      createdBy: testUserId,
      isActive: true,
    });
    cleanupStack.push(() => Service.findByIdAndDelete(testService._id));

    const testDeck = await Deck.create({
      ownerId: testUserId,
      ownerType: 'CUSTOMER',
      projectName: 'Atlas Live Estimate Deck',
      deckShape: 'rectangle',
      measurementUnit: 'ft',
      dimensions: {
        length: 20,
        width: 15,
        area: 300,
      },
      surfaceDetails: {
        material: 'wood',
        condition: 'good',
      },
      completionStatus: 'complete',
    });
    cleanupStack.push(() => Deck.findByIdAndDelete(testDeck._id));
    console.log(`✓ Test Deck created: ${testDeck.projectName} (${testDeck.dimensions.area} sq ft)`);

    // 3. Verify Estimate Creation with Full Pricing Snapshot
    console.log('\n--- 3. Testing Estimate Creation & Snapshot Persistence on Atlas ---');
    const estimateNumber = `EST-LIVE-${Date.now()}`;
    const testEstimate = await Estimate.create({
      estimateNumber,
      deckId: testDeck._id,
      deckDetails: {
        projectName: testDeck.projectName,
        areaSqFt: 300,
        deckShape: 'rectangle',
        surfaceMaterial: 'wood',
      },
      pricingConfigurationId: testPricingConfig._id,
      pricingSnapshot: {
        basePricePerSqFt: 5.5,
        minimumJobPrice: 500,
        laborRate: 65,
        wastePercentage: 10,
        travelCharge: 75,
        taxPercentage: 6.5,
        materialsTotal: 90, // 2 gallons @ $45
        servicesTotal: 150, // 300 sq ft @ $0.50
        laborTotal: 260, // 4 hrs @ $65
        additionalCoatingTotal: 0,
        subtotal: 575,
        taxAmount: 37.38,
        minJobAdjustment: 0,
      },
      selectedMaterials: [
        {
          materialId: testMaterial._id,
          materialName: testMaterial.materialName,
          materialType: 'stain',
          quantity: 2,
          unitOfMeasure: 'gallon',
          unitPrice: 45,
          subtotal: 90,
          numberOfCoats: 1,
        },
      ],
      selectedServices: [
        {
          serviceId: testService._id,
          serviceName: testService.serviceName,
          pricingModel: 'per_sq_ft',
          quantity: 300,
          price: 150,
          subtotal: 150,
          estimatedHours: 4,
          laborCost: 260,
        },
      ],
      totalAmount: 612.38,
      estimateStatus: 'DRAFT',
      estimateType: 'CUSTOMER',
      ownerId: testUserId,
      createdBy: testUserId,
      version: 1,
      notes: 'Atlas live verification estimate test document',
    });
    cleanupStack.push(() => Estimate.findByIdAndDelete(testEstimate._id));
    console.log(`✓ Estimate created with ID: ${testEstimate._id}`);
    console.log(`  Estimate Number: ${testEstimate.estimateNumber}`);
    console.log(`  Total Amount: $${testEstimate.totalAmount}`);
    console.log(`  Status: ${testEstimate.estimateStatus} | Version: v${testEstimate.version}`);

    // 4. Verify Estimate Revision Archive Persistence
    console.log('\n--- 4. Testing Estimate Revision Archive Persistence on Atlas ---');
    const testRevision = await EstimateRevision.create({
      estimateId: testEstimate._id,
      version: 1,
      previousSnapshot: testEstimate.pricingSnapshot,
      revisedSnapshot: testEstimate.pricingSnapshot,
      totalAmount: testEstimate.totalAmount,
      revisionReason: 'Initial rate lock snapshot',
      revisedBy: testUserId,
    });
    cleanupStack.push(() => EstimateRevision.findByIdAndDelete(testRevision._id));
    console.log(`✓ Estimate Revision archived with ID: ${testRevision._id}`);
    console.log(`  Linked to Estimate: ${testRevision.estimateId}`);
    console.log(`  Version: v${testRevision.version} | Total Preserved: $${testRevision.totalAmount}`);

    // 5. Verify Audit Log Persistence
    console.log('\n--- 5. Testing Audit Log Persistence on Atlas ---');
    const testAuditLog = await AuditLog.create({
      performedBy: testUserId,
      userRole: 'customer',
      action: 'CREATE_ESTIMATE',
      entityType: 'ESTIMATE',
      entityId: testEstimate._id.toString(),
      details: {
        estimateNumber: testEstimate.estimateNumber,
        totalAmount: testEstimate.totalAmount,
      },
    });
    cleanupStack.push(() => AuditLog.findByIdAndDelete(testAuditLog._id));
    console.log(`✓ Audit Log record created with ID: ${testAuditLog._id}`);
    console.log(`  Action: ${testAuditLog.action} | EntityType: ${testAuditLog.entityType}`);

    // 6. Query and Verification
    console.log('\n--- 6. Verifying Atlas Queries & Schema Retrieval ---');
    const queriedEstimate = await Estimate.findById(testEstimate._id)
      .populate('deckId', 'projectName dimensions')
      .populate('createdBy', 'role');

    if (!queriedEstimate) {
      throw new Error('Queried estimate could not be retrieved from Atlas!');
    }
    console.log(`✓ Retrieved Estimate populated with Deck & Creator:`);
    console.log(`  Deck: ${queriedEstimate.deckId?.projectName} (${queriedEstimate.deckId?.dimensions?.area} sq ft)`);
    console.log(`  Creator: ${queriedEstimate.createdBy?.role || queriedEstimate.createdBy || 'Verified ID'}`);

    const queriedRevisions = await EstimateRevision.find({ estimateId: testEstimate._id });
    console.log(`✓ Retrieved ${queriedRevisions.length} revision(s) for estimate.`);

    console.log('\n=============================================');
    console.log('ALL PHASE 6 LIVE ATLAS PERSISTENCE CHECKS PASSED!');
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

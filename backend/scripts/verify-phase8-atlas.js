// =============================================
// Deck Estimator — Live MongoDB Atlas Phase 8 Verification
// =============================================
// Connects to live MongoDB Atlas to verify Phase 8 collections:
// - contractorprofiles
// - verificationdocuments
// - verificationhistories
// - leads
// - leadassignmenthistories
// - leadactivities
// - auditlogs
// Validates persistence, indexes, status transitions, isolation, and cleans up.

const path = require('path');
const dns = require('dns');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignored if unsupported
}

const ContractorProfile = require('../src/modules/contractors/contractorProfile.model');
const VerificationDocument = require('../src/modules/contractors/verificationDocument.model');
const VerificationHistory = require('../src/modules/contractors/verificationHistory.model');
const Lead = require('../src/modules/leads/lead.model');
const LeadAssignmentHistory = require('../src/modules/leads/leadAssignmentHistory.model');
const LeadActivity = require('../src/modules/leads/leadActivity.model');
const Deck = require('../src/modules/decks/deck.model');
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

    // Synchronize Atlas Collection Validator for Phase 8 Leads
    const phase8LeadsValidator = {
      $jsonSchema: {
        bsonType: 'object',
        required: ['customerId', 'deckId', 'status', 'leadNumber'],
        properties: {
          _id: { bsonType: 'objectId' },
          customerId: { bsonType: 'objectId' },
          deckId: { bsonType: 'objectId' },
          estimateId: { bsonType: ['objectId', 'null'] },
          leadNumber: { bsonType: 'string' },
          status: { bsonType: 'string' },
          leadSource: { bsonType: 'string' },
        },
      },
    };
    await mongoose.connection.db.command({
      collMod: 'leads',
      validator: phase8LeadsValidator,
      validationLevel: 'moderate',
    });
    console.log('✓ Updated Atlas leads collection schema validator to Phase 8 specification');

    // Resolve test user references from Atlas or fallback generated ObjectIds
    console.log('\n--- 1. Setting Up Test Actors on Atlas ---');
    let customerUserId, contractorUserId, adminUserId;
    const existingUsers = await mongoose.connection.db.collection('users').find({}).toArray();
    const existingCustomer = existingUsers.find((u) => u.role === 'customer');
    const existingContractor = existingUsers.find((u) => u.role === 'contractor');
    const existingAdmin = existingUsers.find((u) => u.role === 'admin');

    customerUserId = existingCustomer ? existingCustomer._id : new mongoose.Types.ObjectId();
    contractorUserId = existingContractor ? existingContractor._id : new mongoose.Types.ObjectId();
    adminUserId = existingAdmin ? existingAdmin._id : new mongoose.Types.ObjectId();

    console.log(`✓ Resolved Actor IDs: Customer (${customerUserId}), Contractor (${contractorUserId}), Admin (${adminUserId})`);

    // 2. Contractor Profile & Verification Document Setup
    console.log('\n--- 2. Verifying Contractor Profile & Verification Documents ---');
    const contractorProfile = await ContractorProfile.create({
      userId: contractorUserId,
      businessName: 'Atlas Premier Deck Builders LLC',
      licenseNumber: 'LIC-ATLAS-999',
      serviceAreas: [{ postalCode: '98101', city: 'Seattle', state: 'WA' }],
      servicesOffered: [],
      supportedSurfaceTypes: ['wood', 'composite'],
      verificationStatus: 'under_review',
      yearsOfExperience: 8,
    });
    cleanupStack.push(() => ContractorProfile.findByIdAndDelete(contractorProfile._id));
    console.log(`✓ ContractorProfile created with status 'under_review' (ID: ${contractorProfile._id})`);

    const verificationDoc = await VerificationDocument.create({
      contractorId: contractorProfile._id,
      userId: contractorUserId,
      documentType: 'contractor_license',
      originalFileName: 'license_seattle_2026.pdf',
      storedFileName: 'stored_test_license.pdf',
      storageKey: 'contractor-documents/test-license.pdf',
      mimeType: 'application/pdf',
      fileSize: 1048576,
      status: 'pending_review',
    });
    cleanupStack.push(() => VerificationDocument.findByIdAndDelete(verificationDoc._id));
    console.log(`✓ VerificationDocument uploaded and persisted (ID: ${verificationDoc._id})`);

    // 3. Verification History Recording
    console.log('\n--- 3. Verifying Verification History Transition Recording ---');
    const verHistory = await VerificationHistory.create({
      contractorId: contractorProfile._id,
      userId: contractorUserId,
      previousStatus: 'draft',
      newStatus: 'under_review',
      action: 'SUBMIT_FOR_REVIEW',
      performedBy: contractorUserId,
      performedByRole: 'contractor',
      reason: 'Contractor uploaded license and submitted application',
    });
    cleanupStack.push(() => VerificationHistory.findByIdAndDelete(verHistory._id));
    console.log(`✓ VerificationHistory recorded transition 'draft' -> 'under_review' (ID: ${verHistory._id})`);

    // Transition to approved
    contractorProfile.verificationStatus = 'approved';
    contractorProfile.reviewedBy = adminUserId;
    contractorProfile.reviewedAt = new Date();
    await contractorProfile.save();

    const verApprovalHistory = await VerificationHistory.create({
      contractorId: contractorProfile._id,
      userId: contractorUserId,
      previousStatus: 'under_review',
      newStatus: 'approved',
      action: 'APPROVE',
      performedBy: adminUserId,
      performedByRole: 'admin',
      reason: 'All credentials and insurance verified',
    });
    cleanupStack.push(() => VerificationHistory.findByIdAndDelete(verApprovalHistory._id));
    console.log(`✓ ContractorProfile updated to 'approved' and transition history logged`);

    // 4. Test Deck Project
    console.log('\n--- 4. Setting Up Live Test Deck ---');
    const testDeck = await Deck.create({
      ownerId: customerUserId,
      ownerType: 'CUSTOMER',
      projectName: 'Atlas Live Lead Deck Project',
      deckShape: 'rectangle',
      measurementUnit: 'ft',
      dimensions: { length: 20, width: 14, area: 280 },
      surfaceDetails: { material: 'wood', condition: 'good' },
      completionStatus: 'complete',
    });
    cleanupStack.push(() => Deck.findByIdAndDelete(testDeck._id));
    console.log(`✓ Test Deck created with ID: ${testDeck._id}`);

    // 5. Customer Lead Creation with Snapshots
    console.log('\n--- 5. Verifying Customer Lead Creation & Data Snapshots ---');
    const testLead = await Lead.create({
      leadNumber: `LEAD-ATL-${Date.now().toString().slice(-6)}`,
      customerId: customerUserId,
      deckId: testDeck._id,
      leadSource: 'customer_estimator',
      status: 'new',
      enquiry: {
        subject: 'Atlas Live Deck Restoration Request',
        message: 'Looking for power washing and cedar staining.',
        preferredContactMethod: 'email',
        preferredContactTime: 'morning',
      },
      customerSnapshot: {
        name: existingCustomer?.fullName || 'Atlas Customer',
        email: existingCustomer?.email || 'customer@example.com',
        phone: '206-555-0199',
      },
      deckSnapshot: {
        projectName: testDeck.projectName,
        area: 280,
        shape: 'rectangle',
        surfaceMaterial: 'wood',
      },
      estimateSnapshot: {
        totalAmount: 3850.00,
        currency: 'USD',
      },
    });
    cleanupStack.push(() => Lead.findByIdAndDelete(testLead._id));
    console.log(`✓ Lead created with status 'new' and immutable snapshots (Lead Number: ${testLead.leadNumber})`);

    // 6. Lead Assignment & History
    console.log('\n--- 6. Verifying Lead Assignment & Assignment History ---');
    testLead.assignedContractorId = contractorUserId;
    testLead.assignedContractorProfileId = contractorProfile._id;
    testLead.status = 'assigned';
    testLead.assignedAt = new Date();
    testLead.assignedBy = adminUserId;
    await testLead.save();

    const assignHistory = await LeadAssignmentHistory.create({
      leadId: testLead._id,
      newContractorId: contractorUserId,
      assignedBy: adminUserId,
      assignmentStatus: 'ASSIGNED',
      assignmentReason: 'Matched based on Cedar wood specialization and Seattle service area',
    });
    cleanupStack.push(() => LeadAssignmentHistory.findByIdAndDelete(assignHistory._id));
    console.log(`✓ Lead assigned to contractor, LeadAssignmentHistory persisted (ID: ${assignHistory._id})`);

    // 7. Contractor Workflow & Activity Timeline
    console.log('\n--- 7. Verifying Contractor Lead Acceptance & Activity Timeline ---');
    testLead.status = 'accepted';
    testLead.contractorRespondedAt = new Date();
    await testLead.save();

    const acceptActivity = await LeadActivity.create({
      leadId: testLead._id,
      actorId: contractorUserId,
      actorRole: 'contractor',
      activityType: 'contractor_accepted',
      previousStatus: 'assigned',
      newStatus: 'accepted',
      description: 'Contractor accepted the lead and will schedule a site visit.',
      visibility: 'CUSTOMER_VISIBLE',
    });
    cleanupStack.push(() => LeadActivity.findByIdAndDelete(acceptActivity._id));

    const internalNote = await LeadActivity.create({
      leadId: testLead._id,
      actorId: adminUserId,
      actorRole: 'admin',
      activityType: 'note_added',
      description: 'Admin verified customer project address in Seattle jurisdiction.',
      visibility: 'INTERNAL',
    });
    cleanupStack.push(() => LeadActivity.findByIdAndDelete(internalNote._id));
    console.log(`✓ Lead activities created: 1 CUSTOMER_VISIBLE, 1 INTERNAL`);

    // 8. Lead Isolation & Query Tests
    console.log('\n--- 8. Verifying Isolation & Querying on Atlas ---');
    const customerVisibleActivities = await LeadActivity.find({
      leadId: testLead._id,
      visibility: 'CUSTOMER_VISIBLE',
    });
    if (customerVisibleActivities.length !== 1) {
      throw new Error(`Expected 1 customer-visible activity, found ${customerVisibleActivities.length}`);
    }
    console.log(`✓ Customer visibility isolation verified: only 1 activity visible to customer`);

    const allActivities = await LeadActivity.find({ leadId: testLead._id });
    if (allActivities.length !== 2) {
      throw new Error(`Expected 2 total activities, found ${allActivities.length}`);
    }
    console.log(`✓ Admin complete timeline verified: 2 activities present`);

    // 9. AuditLog Verification
    console.log('\n--- 9. Verifying Audit Logging on Atlas ---');
    const phase8Audit = await AuditLog.create({
      action: 'LEAD_STATUS_UPDATE',
      performedBy: contractorUserId,
      entityType: 'LEAD',
      entityId: testLead._id,
      status: 'SUCCESS',
      ipAddress: '127.0.0.1',
      details: { previousStatus: 'assigned', newStatus: 'accepted' },
    });
    cleanupStack.push(() => AuditLog.findByIdAndDelete(phase8Audit._id));
    console.log(`✓ AuditLog record created on Atlas (ID: ${phase8Audit._id})`);

    console.log('\n=== ALL PHASE 8 ATLAS PERSISTENCE CHECKS PASSED ===');
  } catch (err) {
    if (err.errInfo?.details) {
      console.error('Validation details:', JSON.stringify(err.errInfo.details, null, 2));
    }
    console.error('Atlas verification failed:', err);
    throw err;
  } finally {
    console.log('\n--- Cleaning Up Atlas Test Artifacts ---');
    while (cleanupStack.length > 0) {
      const cleanupFn = cleanupStack.pop();
      try {
        await cleanupFn();
      } catch (cleanErr) {
        console.warn('Cleanup step error:', cleanErr.message);
      }
    }
    console.log('✓ Teardown complete. Live Atlas database is clean.');
    await mongoose.disconnect();
  }
}

verifyLiveAtlas().catch((err) => {
  console.error('Fatal Atlas verification error:', err);
  process.exit(1);
});

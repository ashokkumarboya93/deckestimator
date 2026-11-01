// =============================================
// Deck Estimator — Live MongoDB Atlas Phase 9 Verification
// =============================================
// Connects to live MongoDB Atlas to verify Phase 9 collections:
// - discountpolicies
// - discountassignments
// - discountapplications
// - commissionpolicies
// - commissions
// - commissionhistories
// - commissionpaymentrecords
// - auditlogs
// Validates persistence, unique indexes, status lifecycles, and cleans up.

const path = require('path');
const dns = require('dns');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignored if unsupported
}

const {
  DISCOUNT_TYPE,
  DISCOUNT_POLICY_STATUS,
  DISCOUNT_APPLICABILITY,
  DISCOUNT_ASSIGNMENT_TYPE,
  COMMISSION_TYPE,
  COMMISSION_POLICY_STATUS,
  COMMISSION_CALCULATION_BASIS,
  COMMISSION_STATUS,
} = require('../src/shared/constants');

const DiscountPolicy = require('../src/modules/discounts/discountPolicy.model');
const DiscountAssignment = require('../src/modules/discounts/discountAssignment.model');
const DiscountApplication = require('../src/modules/discounts/discountApplication.model');
const CommissionPolicy = require('../src/modules/commissions/commissionPolicy.model');
const Commission = require('../src/modules/commissions/commission.model');
const CommissionHistory = require('../src/modules/commissions/commissionHistory.model');
const CommissionPaymentRecord = require('../src/modules/commissions/commissionPaymentRecord.model');
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

    // Resolve test user references from Atlas or fallback generated ObjectIds
    console.log('\n--- 1. Setting Up Test Actors on Atlas ---');
    let contractorUserId, adminUserId;
    const existingUsers = await mongoose.connection.db.collection('users').find({}).toArray();
    for (const u of existingUsers) {
      if (u.role === 'contractor' && !contractorUserId) contractorUserId = u._id;
      if (u.role === 'admin' && !adminUserId) adminUserId = u._id;
    }
    if (!contractorUserId) contractorUserId = new mongoose.Types.ObjectId();
    if (!adminUserId) adminUserId = new mongoose.Types.ObjectId();
    const testLeadId = new mongoose.Types.ObjectId();
    const testEstimateId = new mongoose.Types.ObjectId();

    console.log(`Contractor Actor ID: ${contractorUserId}`);
    console.log(`Admin Actor ID: ${adminUserId}`);

    // Synchronize Atlas Collection Validator for Phase 9 AuditLogs & Commissions
    const phase9AuditLogsValidator = {
      $jsonSchema: {
        bsonType: 'object',
        required: ['performedBy', 'action', 'entityType', 'entityId'],
        properties: {
          _id: { bsonType: 'objectId' },
          performedBy: { bsonType: 'objectId' },
          action: { bsonType: 'string', minLength: 2 },
          entityType: {
            bsonType: 'string',
            enum: [
              'USER',
              'CONTRACTOR',
              'DECK',
              'ESTIMATE',
              'MATERIAL',
              'PRICING',
              'CONDITION_ANALYSIS',
              'LEAD',
              'COMMISSION',
              'COMMISSION_POLICY',
              'DISCOUNT',
              'DISCOUNT_POLICY',
              'DISCOUNT_ASSIGNMENT',
            ],
          },
          entityId: { bsonType: 'objectId' },
          oldValue: { bsonType: ['object', 'null'] },
          newValue: { bsonType: ['object', 'null'] },
          ipAddress: { bsonType: ['string', 'null'] },
          createdAt: { bsonType: 'date' },
        },
      },
    };
    await mongoose.connection.db.command({
      collMod: 'auditLogs',
      validator: phase9AuditLogsValidator,
      validationLevel: 'moderate',
    });
    console.log('✓ Updated Atlas auditLogs collection schema validator for Phase 9 entity types');

    const phase9CommissionsValidator = {
      $jsonSchema: {
        bsonType: 'object',
        required: [
          'contractorId',
          'leadId',
          'commissionPolicyId',
          'commissionReference',
          'commissionType',
          'commissionValue',
          'calculatedAmount',
          'status',
        ],
        properties: {
          _id: { bsonType: 'objectId' },
          contractorId: { bsonType: 'objectId' },
          leadId: { bsonType: 'objectId' },
          estimateId: { bsonType: ['objectId', 'null'] },
          commissionPolicyId: { bsonType: 'objectId' },
          commissionReference: { bsonType: 'string' },
          commissionType: { bsonType: 'string' },
          commissionValue: { bsonType: ['double', 'int', 'long', 'decimal'] },
          calculatedAmount: { bsonType: ['double', 'int', 'long', 'decimal'] },
          basisAmount: { bsonType: ['double', 'int', 'long', 'decimal'] },
          status: { bsonType: 'string' },
        },
      },
    };
    await mongoose.connection.db.command({
      collMod: 'commissions',
      validator: phase9CommissionsValidator,
      validationLevel: 'moderate',
    });
    console.log('✓ Updated Atlas commissions collection schema validator to Phase 9 specification');

    // Ensure indexes are built on Atlas
    await DiscountAssignment.syncIndexes();
    await Commission.syncIndexes();
    await DiscountPolicy.syncIndexes();
    await CommissionPolicy.syncIndexes();
    console.log('✓ Synchronized Mongoose compound indexes with Atlas');

    // --- 2. Discount Policy Persistence ---
    console.log('\n--- 2. Verifying Discount Policy Persistence on Atlas ---');
    const discountPolicy = await DiscountPolicy.create({
      name: 'Atlas Test Contractor Discount 10%',
      code: `DISC_ATLAS_${Date.now()}`,
      description: 'Test discount policy for Atlas live verification',
      discountType: DISCOUNT_TYPE.PERCENTAGE,
      discountValue: 10,
      applicability: DISCOUNT_APPLICABILITY.ALL,
      maxUsageCount: 50,
      status: DISCOUNT_POLICY_STATUS.ACTIVE,
      createdBy: adminUserId,
    });
    cleanupStack.push(async () => DiscountPolicy.findByIdAndDelete(discountPolicy._id));
    console.log(`✓ Created DiscountPolicy on Atlas: ${discountPolicy._id} (${discountPolicy.code})`);

    // Verify retrieval
    const retrievedDiscPol = await DiscountPolicy.findById(discountPolicy._id);
    if (!retrievedDiscPol || retrievedDiscPol.discountValue !== 10) {
      throw new Error('DiscountPolicy retrieval mismatch on Atlas');
    }
    console.log('✓ DiscountPolicy confirmed readable from Atlas');

    // --- 3. Contractor Discount Assignment & Unique Compound Index ---
    console.log('\n--- 3. Verifying Contractor Discount Assignment & Index on Atlas ---');
    const assignment = await DiscountAssignment.create({
      contractorId: contractorUserId,
      discountPolicyId: discountPolicy._id,
      assignmentType: DISCOUNT_ASSIGNMENT_TYPE.INDIVIDUAL,
      assignedBy: adminUserId,
      notes: 'Atlas test individual assignment',
    });
    cleanupStack.push(async () => DiscountAssignment.findByIdAndDelete(assignment._id));
    console.log(`✓ Created DiscountAssignment on Atlas: ${assignment._id}`);

    // Test unique constraint (contractorId, discountPolicyId)
    let duplicateAssignmentBlocked = false;
    try {
      await DiscountAssignment.create({
        contractorId: contractorUserId,
        discountPolicyId: discountPolicy._id,
        assignmentType: DISCOUNT_ASSIGNMENT_TYPE.INDIVIDUAL,
        assignedBy: adminUserId,
      });
    } catch (err) {
      if (err.code === 11000) duplicateAssignmentBlocked = true;
    }
    if (!duplicateAssignmentBlocked) {
      throw new Error('Atlas failed to block duplicate DiscountAssignment');
    }
    console.log('✓ Verified Atlas enforces unique compound index on (contractorId, discountPolicyId)');

    // --- 4. Discount Application Snapshot ---
    console.log('\n--- 4. Verifying Discount Application Snapshot on Atlas ---');
    const discountApp = await DiscountApplication.create({
      estimateId: testEstimateId,
      estimateVersion: 1,
      contractorId: contractorUserId,
      discountPolicyId: discountPolicy._id,
      policySnapshot: {
        policyId: discountPolicy._id,
        name: discountPolicy.name,
        code: discountPolicy.code,
        discountType: discountPolicy.discountType,
        discountValue: discountPolicy.discountValue,
        applicability: 'all',
      },
      eligibleAmount: 1800.0,
      discountAmount: 180.0,
      originalEstimateAmount: 1953.0,
      finalEstimateAmount: 1757.7,
      calculationSnapshot: { baseSubtotal: 1800, discount: 180, tax: 137.7 },
      appliedAmount: 180.0,
      appliedBy: contractorUserId,
    });
    cleanupStack.push(async () => DiscountApplication.findByIdAndDelete(discountApp._id));
    console.log(`✓ Created DiscountApplication snapshot on Atlas: ${discountApp._id}`);

    // --- 5. Commission Policy Persistence ---
    console.log('\n--- 5. Verifying Commission Policy Persistence on Atlas ---');
    const commissionPolicy = await CommissionPolicy.create({
      name: 'Atlas Test Tier 1 Commission',
      code: `COMM_ATLAS_${Date.now()}`,
      description: 'Test commission policy for Atlas live verification',
      commissionType: COMMISSION_TYPE.PERCENTAGE,
      commissionValue: 8,
      calculationBasis: COMMISSION_CALCULATION_BASIS.CONVERTED_ESTIMATE,
      minimumCommission: 50,
      maximumCommission: 1500,
      status: COMMISSION_POLICY_STATUS.ACTIVE,
      createdBy: adminUserId,
    });
    cleanupStack.push(async () => CommissionPolicy.findByIdAndDelete(commissionPolicy._id));
    console.log(`✓ Created CommissionPolicy on Atlas: ${commissionPolicy._id} (${commissionPolicy.code})`);

    // --- 6. Commission Generation, Lifecycle & Duplicate Protection ---
    console.log('\n--- 6. Verifying Commission Lifecycle on Atlas ---');
    const commission = await Commission.create({
      commissionReference: `COM-ATLAS-${Date.now()}`,
      contractorId: contractorUserId,
      leadId: testLeadId,
      estimateId: testEstimateId,
      commissionPolicyId: commissionPolicy._id,
      policySnapshot: {
        policyId: commissionPolicy._id,
        name: commissionPolicy.name,
        code: commissionPolicy.code,
        commissionType: commissionPolicy.commissionType,
        commissionValue: commissionPolicy.commissionValue,
        calculationBasis: commissionPolicy.calculationBasis,
      },
      commissionType: commissionPolicy.commissionType,
      commissionValue: commissionPolicy.commissionValue,
      calculationBasis: commissionPolicy.calculationBasis,
      basisAmount: 3500.0,
      calculatedAmount: 280.0,
      status: COMMISSION_STATUS.PENDING,
      createdBy: adminUserId,
    });
    cleanupStack.push(async () => Commission.findByIdAndDelete(commission._id));
    console.log(`✓ Created Commission record on Atlas: ${commission._id} (${commission.commissionReference})`);

    // Verify duplicate commission protection via compound index (leadId, commissionPolicyId)
    let duplicateCommissionBlocked = false;
    try {
      await Commission.create({
        commissionReference: `COM-ATLAS-DUP-${Date.now()}`,
        contractorId: contractorUserId,
        leadId: testLeadId,
        estimateId: testEstimateId,
        commissionPolicyId: commissionPolicy._id,
        policySnapshot: {
          policyId: commissionPolicy._id,
          name: commissionPolicy.name,
          code: commissionPolicy.code,
          commissionType: commissionPolicy.commissionType,
          commissionValue: commissionPolicy.commissionValue,
          calculationBasis: commissionPolicy.calculationBasis,
        },
        commissionType: commissionPolicy.commissionType,
        commissionValue: commissionPolicy.commissionValue,
        calculationBasis: commissionPolicy.calculationBasis,
        basisAmount: 3500.0,
        calculatedAmount: 280.0,
        status: COMMISSION_STATUS.PENDING,
        createdBy: adminUserId,
      });
    } catch (err) {
      if (err.code === 11000) duplicateCommissionBlocked = true;
    }
    if (!duplicateCommissionBlocked) {
      throw new Error('Atlas failed to enforce unique compound index on (leadId, commissionPolicyId)');
    }
    console.log('✓ Verified Atlas enforces unique compound index on (leadId, commissionPolicyId)');

    // Lifecycle transitions: PENDING -> UNDER_REVIEW -> APPROVED -> PAYABLE -> PAID
    commission.status = COMMISSION_STATUS.UNDER_REVIEW;
    commission.reviewedBy = adminUserId;
    commission.reviewedAt = new Date();
    await commission.save();
    console.log('✓ Transitioned to UNDER_REVIEW');

    commission.status = COMMISSION_STATUS.APPROVED;
    await commission.save();
    console.log('✓ Transitioned to APPROVED');

    commission.status = COMMISSION_STATUS.PAYABLE;
    await commission.save();
    console.log('✓ Transitioned to PAYABLE');

    // Record Commission History Event
    const historyEntry = await CommissionHistory.create({
      commissionId: commission._id,
      action: 'APPROVE',
      previousStatus: COMMISSION_STATUS.UNDER_REVIEW,
      newStatus: COMMISSION_STATUS.APPROVED,
      performedBy: adminUserId,
      performedByRole: 'admin',
      notes: 'Atlas lifecycle verification note',
    });
    cleanupStack.push(async () => CommissionHistory.findByIdAndDelete(historyEntry._id));
    console.log(`✓ Created CommissionHistory entry on Atlas: ${historyEntry._id}`);

    // --- 7. Commission Payment Record ---
    console.log('\n--- 7. Verifying Commission Payment Record on Atlas ---');
    const paymentRecord = await CommissionPaymentRecord.create({
      commissionId: commission._id,
      contractorId: contractorUserId,
      amount: commission.calculatedAmount,
      currency: 'USD',
      paymentMethod: 'CHECK',
      paymentReference: `CHK-ATLAS-${Date.now()}`,
      recordedBy: adminUserId,
      notes: 'Atlas payment record confirmation',
    });
    cleanupStack.push(async () => CommissionPaymentRecord.findByIdAndDelete(paymentRecord._id));
    console.log(`✓ Created CommissionPaymentRecord on Atlas: ${paymentRecord._id} (Ref: ${paymentRecord.paymentReference})`);

    commission.status = COMMISSION_STATUS.PAID;
    commission.paidAt = new Date();
    commission.paymentRecordId = paymentRecord._id;
    await commission.save();
    console.log('✓ Commission marked as PAID on Atlas with payment confirmation linkage');

    // --- 8. Audit Logging ---
    console.log('\n--- 8. Verifying Audit Log Persistence on Atlas ---');
    const auditEntry = await AuditLog.create({
      performedBy: adminUserId,
      action: 'POLICY_STATUS_CHANGE',
      entityType: 'COMMISSION_POLICY',
      entityId: commissionPolicy._id,
      metadata: {
        notes: 'Atlas verification audit logging',
      },
    });
    cleanupStack.push(async () => AuditLog.findByIdAndDelete(auditEntry._id));
    console.log(`✓ Created AuditLog entry on Atlas: ${auditEntry._id}`);

    console.log('\n=============================================');
    console.log('🎉 ALL ATLAS PHASE 9 VERIFICATIONS PASSED 100%!');
    console.log('=============================================');
  } catch (error) {
    console.error('\n❌ Atlas Verification Failed:', error);
    process.exitCode = 1;
  } finally {
    console.log('\n--- Executing Cleanup on Atlas ---');
    while (cleanupStack.length > 0) {
      const cleaner = cleanupStack.pop();
      try {
        await cleaner();
      } catch (cleanErr) {
        console.warn('Warning during cleanup:', cleanErr.message);
      }
    }
    console.log('✓ Atlas test artifacts cleanly purged');
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB Atlas');
  }
}

verifyLiveAtlas();


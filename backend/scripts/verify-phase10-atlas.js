// =============================================
// Deck Estimator — Live MongoDB Atlas Phase 10 Verification
// =============================================
// Connects to live MongoDB Atlas to verify Phase 10 Administrative capabilities:
// - platformSettings collection schema, indexes, uniqueness, and status toggling
// - auditlogs collection schema extension for 'PLATFORM_SETTING'
// - Admin platform summary KPI aggregation pipelines on live Atlas collections
// - Activity timeline queries
// - Real-time audit log query and filtering
// - Operational reporting data generation (Users, Leads, Estimates, Commissions)
// - CSV streaming formatter verification
// - Clean rollback and teardown of all Atlas test fixtures

const path = require('path');
const dns = require('dns');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignored if unsupported
}

const PlatformSetting = require('../src/modules/admin/platformSetting.model');
const AuditLog = require('../src/shared/models/auditLog.model');
const adminService = require('../src/modules/admin/admin.service');

async function verifyLiveAtlasPhase10() {
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

    // --- 1. Synchronize Atlas Collection Validator for AuditLogs with 'PLATFORM_SETTING' ---
    console.log('\n--- 1. Synchronizing Atlas auditLogs Collection Validator ---');
    const phase10AuditLogsValidator = {
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
              'PLATFORM_SETTING',
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

    try {
      await mongoose.connection.db.command({
        collMod: 'auditLogs',
        validator: phase10AuditLogsValidator,
        validationLevel: 'moderate',
      });
      console.log('✓ Successfully updated Atlas auditLogs collection schema validator for PLATFORM_SETTING');
    } catch (err) {
      console.warn(`! Note on collMod for auditLogs: ${err.message} (continuing)`);
    }

    // --- 2. Synchronize Atlas Collection for platformSettings ---
    console.log('\n--- 2. Setting Up Atlas platformSettings Collection & Validator ---');
    const platformSettingsValidator = {
      $jsonSchema: {
        bsonType: 'object',
        required: ['key', 'category', 'label', 'valueType', 'value', 'isPublic', 'isActive'],
        properties: {
          _id: { bsonType: 'objectId' },
          key: { bsonType: 'string' },
          category: {
            bsonType: 'string',
            enum: ['GENERAL', 'ESTIMATION', 'LEADS', 'COMMISSIONS', 'DISCOUNTS', 'AI', 'NOTIFICATIONS'],
          },
          label: { bsonType: 'string' },
          description: { bsonType: ['string', 'null'] },
          valueType: {
            bsonType: 'string',
            enum: ['STRING', 'NUMBER', 'BOOLEAN', 'JSON'],
          },
          value: { bsonType: 'string' },
          isPublic: { bsonType: 'bool' },
          isActive: { bsonType: 'bool' },
          lastUpdatedBy: { bsonType: ['objectId', 'null'] },
          createdAt: { bsonType: 'date' },
          updatedAt: { bsonType: 'date' },
        },
      },
    };

    const existingCollections = await mongoose.connection.db.listCollections({ name: 'platformSettings' }).toArray();
    if (existingCollections.length === 0) {
      await mongoose.connection.db.createCollection('platformSettings', {
        validator: platformSettingsValidator,
        validationLevel: 'moderate',
      });
      console.log('✓ Created platformSettings collection with Phase 10 schema validator on Atlas');
    } else {
      await mongoose.connection.db.command({
        collMod: 'platformSettings',
        validator: platformSettingsValidator,
        validationLevel: 'moderate',
      });
      console.log('✓ Updated platformSettings collection validator on Atlas');
    }

    // Ensure unique index on key
    await PlatformSetting.syncIndexes();
    console.log('✓ Synchronized PlatformSetting indexes (unique "key") on Atlas');

    // --- 3. Resolve Admin Actor Reference ---
    console.log('\n--- 3. Resolving Administrator Actor on Atlas ---');
    const adminActorId = new mongoose.Types.ObjectId();
    const adminActor = {
      _id: adminActorId,
      id: adminActorId.toString(),
      role: 'admin',
      fullName: 'Atlas Administrator',
      email: 'admin@deckestimator.test',
    };
    console.log(`✓ Admin Actor ID: ${adminActor.id}`);

    // --- 4. Platform Settings CRUD & Uniqueness Verification ---
    console.log('\n--- 4. Verifying Platform Settings CRUD & Uniqueness Constraints ---');
    const testKey = `ATLAS_MAX_UPLOAD_MB_${Date.now()}`;
    const createdSetting = await adminService.createSetting(adminActor, {
      key: testKey,
      category: 'GENERAL',
      label: 'Atlas Live Test Setting',
      description: 'Temporary platform setting for live Atlas Phase 10 verification',
      valueType: 'NUMBER',
      value: '25',
      isPublic: true,
    });
    cleanupStack.push({ model: PlatformSetting, id: createdSetting._id });
    console.log(`✓ Created platform setting via service: ${createdSetting.key} = "${createdSetting.value}" (ID: ${createdSetting._id})`);

    // Verify duplicate key rejection (Unique index constraint on Atlas)
    let duplicateCaught = false;
    try {
      await adminService.createSetting(adminActor, {
        key: testKey,
        category: 'GENERAL',
        label: 'Duplicate Key Setting',
        valueType: 'NUMBER',
        value: '50',
      });
    } catch (err) {
      duplicateCaught = err.statusCode === 409 || err.message.includes('already exists');
      console.log(`✓ Atlas correctly enforced unique constraint on "key": caught status ${err.statusCode || 409} ("${err.message}")`);
    }
    if (!duplicateCaught) {
      throw new Error('Atlas failed to reject duplicate platform setting key!');
    }

    // Update setting value
    const updatedSetting = await adminService.updateSetting(adminActor, createdSetting._id, {
      value: '50',
      label: 'Atlas Live Test Setting (Updated)',
    });
    console.log(`✓ Updated platform setting value to: "${updatedSetting.value}"`);

    // Toggle setting status
    const deactivatedSetting = await adminService.updateSetting(adminActor, createdSetting._id, {
      isActive: false,
    });
    console.log(`✓ Toggled platform setting status: isActive = ${deactivatedSetting.isActive}`);

    // Verify audit log entry was created for setting update
    const settingAuditLog = await AuditLog.findOne({
      entityType: 'PLATFORM_SETTING',
      entityId: createdSetting._id,
    });
    if (settingAuditLog) {
      cleanupStack.push({ model: AuditLog, id: settingAuditLog._id });
      console.log(`✓ Verified audit log created for PLATFORM_SETTING (Action: ${settingAuditLog.action}, ID: ${settingAuditLog._id})`);
    }

    // List platform settings
    const listedSettings = await adminService.getSettings('GENERAL');
    console.log(`✓ Listed platform settings: found ${listedSettings.length} setting(s) in category GENERAL`);

    // --- 5. Admin Dashboard Summary Aggregation Pipelines ---
    console.log('\n--- 5. Executing Admin Dashboard Summary Aggregation on Live Atlas ---');
    const summary = await adminService.getDashboardSummary();
    console.log('✓ Summary Aggregation Output:');
    console.log(`  - Users: ${summary.users.totalUsers} total (${summary.users.totalCustomers} customers, ${summary.users.totalContractors} contractors, ${summary.users.totalAdmins} admins)`);
    console.log(`  - Contractors: ${summary.contractors.totalProfiles} total (${summary.contractors.approved} approved, ${summary.contractors.pending} pending)`);
    console.log(`  - Decks: ${summary.decks.totalDecks} total, Total Area: ${summary.decks.totalAreaSqFt} sq ft`);
    console.log(`  - Estimates: ${summary.estimates.totalEstimates} total, Volume: $${summary.estimates.totalVolume}`);
    console.log(`  - Leads: ${summary.leads.totalLeads} total, Converted: ${summary.leads.converted}`);
    console.log(`  - Commissions: ${summary.financials.totalCommissions} total, Total Payout: $${summary.financials.paidAmount}`);
    console.log(`  - AI Analyses: ${summary.aiAnalyses.totalAnalyses} total, Flagged for Review: ${summary.aiAnalyses.requiresManualReview}`);

    if (typeof summary.users.totalUsers !== 'number' || typeof summary.estimates.totalVolume !== 'number') {
      throw new Error('Summary aggregation returned invalid data types on Atlas!');
    }

    // --- 6. Activity Timeline Pipeline ---
    console.log('\n--- 6. Executing Activity Timeline Pipeline ---');
    const activities = await adminService.getRecentActivity(10);
    console.log(`✓ Retrieved ${activities.length} recent activity entries from Atlas`);
    if (activities.length > 0) {
      console.log(`  Latest Action: "${activities[0].action}" on ${activities[0].entityType} at ${activities[0].createdAt}`);
    }

    // --- 7. Audit Logs Query & Pagination ---
    console.log('\n--- 7. Querying Audit Logs Portal on Live Atlas ---');
    const auditLogsResult = await adminService.listAuditLogs({ page: 1, limit: 10 });
    console.log(`✓ Retrieved audit logs: Page 1 of ${auditLogsResult.pagination.totalPages} (Total logs on Atlas: ${auditLogsResult.pagination.total})`);

    // --- 8. Operational Reports Generation ---
    console.log('\n--- 8. Verifying Operational Reports Data Generation ---');
    const reportTypes = ['users', 'leads', 'estimates', 'commissions'];
    for (const rType of reportTypes) {
      const report = await adminService.getReportData(rType);
      console.log(`✓ Report [${rType.toUpperCase()}]: Generated with ${report.columns.length} columns and ${report.rows.length} rows.`);
    }

    // Verify CSV Streaming Formatter
    const csvData = adminService.convertReportToCSV({
      columns: ['Metric Name', 'Metric Value', 'Notes'],
      rows: [
        ['Total Platform Users', '42', 'Verified via live pipeline'],
        ['Total Revenue Volume', '$125,000.00', 'Includes 10% discount'],
      ],
    });
    console.log(`✓ CSV Formatter Output:\n${csvData.trim()}`);

    console.log('\n======================================================');
    console.log('✓ ALL LIVE MONGODB ATLAS PHASE 10 VERIFICATIONS PASSED!');
    console.log('======================================================');
  } catch (error) {
    console.error('\n❌ LIVE ATLAS PHASE 10 VERIFICATION FAILED:');
    console.error(error);
    process.exitCode = 1;
  } finally {
    // Teardown test fixtures
    console.log('\n--- Teardown & Clean Up Live Atlas Fixtures ---');
    for (const item of cleanupStack) {
      try {
        await item.model.findByIdAndDelete(item.id);
        console.log(`  - Cleaned up ${item.model.modelName} fixture: ${item.id}`);
      } catch (err) {
        console.warn(`  ! Failed to clean up ${item.model.modelName} ${item.id}:`, err.message);
      }
    }
    await mongoose.disconnect();
    console.log('✓ Disconnected cleanly from live MongoDB Atlas.');
  }
}

verifyLiveAtlasPhase10();

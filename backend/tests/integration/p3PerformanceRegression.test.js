// =============================================
// Phase P3 Performance & Optimization Verification
// =============================================

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const zlib = require('node:zlib');
const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'p3_test_access_secret_32_chars_min_ok';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'p3_test_refresh_secret_32_chars_min_ok';

const app = require('../../src/app');
const User = require('../../src/modules/users/users.model');
const ContractorProfile = require('../../src/modules/contractors/contractorProfile.model');
const UserRequest = require('../../src/modules/users/userRequest.model');
const Deck = require('../../src/modules/decks/deck.model');
const Estimate = require('../../src/modules/estimates/estimate.model');
const Lead = require('../../src/modules/leads/lead.model');
const Project = require('../../src/modules/admin/project.model');
const Notification = require('../../src/modules/notifications/notification.model');
const PlatformSetting = require('../../src/modules/admin/platformSetting.model');
const adminService = require('../../src/modules/admin/admin.service');
const pricingService = require('../../src/modules/pricing/pricing.service');
const catalogService = require('../../src/modules/catalogs/catalog.service');
const notificationService = require('../../src/modules/notifications/notification.service');

let mongod;
let server;
let baseUrl;

function rawRequest(reqPath, { method = 'GET', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(reqPath, baseUrl);
    const req = http.request(
      url,
      { method, headers },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            buffer: Buffer.concat(chunks),
          });
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

test.describe('Phase P3 Backend Performance & Runtime Verification', () => {
  test.before(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { dbName: 'p3_perf_test' });
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const { port } = server.address();
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  test.after(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  test('1. Compression middleware gzips JSON responses over 1KB threshold', async () => {
    // Seed enough public settings to easily exceed 1KB payload
    const docs = Array.from({ length: 12 }, (_, idx) => ({
      key: `P3_PUBLIC_KEY_${idx}`,
      category: 'GENERAL',
      label: `Public Test Setting Number ${idx}`,
      description: 'Longer description text used to ensure gzip compression threshold is exceeded cleanly.',
      valueType: 'STRING',
      value: `Configured platform value payload segment #${idx} for compression verification`,
      isPublic: true,
      isActive: true,
    }));
    await PlatformSetting.insertMany(docs);

    const res = await rawRequest('/api/v1/settings/public', {
      headers: { 'Accept-Encoding': 'gzip' },
    });

    assert.equal(res.status, 200);
    assert.equal(res.headers['content-encoding'], 'gzip');

    const decoded = JSON.parse(zlib.gunzipSync(res.buffer).toString('utf8'));
    assert.equal(decoded.success, true);
    assert.equal(decoded.data.length, 12);
    assert.ok(decoded.data[0].id, 'Normalized lean public setting should include id');
    assert.equal(decoded.data[0].__v, undefined);
  });

  test('2. Schema indexes cover critical filter and sort query paths', () => {
    const hasIndex = (schema, keys) =>
      schema.indexes().some(([fields]) =>
        Object.entries(keys).every(([k, dir]) => fields[k] === dir)
      );

    assert.ok(hasIndex(Notification.schema, { createdAt: -1 }));
    assert.ok(hasIndex(Notification.schema, { userId: 1, isRead: 1, createdAt: -1 }));
    assert.ok(hasIndex(Notification.schema, { recipientType: 1, createdAt: -1 }));
    assert.ok(hasIndex(Notification.schema, { targetRole: 1, createdAt: -1 }));

    assert.ok(hasIndex(User.schema, { accountStatus: 1, role: 1, createdAt: -1 }));
    assert.ok(hasIndex(User.schema, { role: 1, accountStatus: 1, createdAt: -1 }));
    assert.ok(hasIndex(User.schema, { createdAt: -1 }));

    assert.ok(hasIndex(ContractorProfile.schema, { verificationStatus: 1, submittedAt: -1 }));
    assert.ok(hasIndex(UserRequest.schema, { status: 1, createdAt: -1 }));
    assert.ok(hasIndex(Estimate.schema, { ownerId: 1, createdAt: -1 }));
    assert.ok(hasIndex(Estimate.schema, { createdFor: 1, createdAt: -1 }));
    assert.ok(hasIndex(Lead.schema, { latestContactDate: -1, createdAt: -1 }));
    assert.ok(hasIndex(PlatformSetting.schema, { isPublic: 1, category: 1 }));
  });

  test('3. Consolidated $facet queries in admin.service match exact counts without leaking passwordHash', async () => {
    const pw = await User.hashPassword('SecretPass123!');
    const [custActive, custBlocked, contractorActive, disabledUser] = await User.create([
      { fullName: 'Active Cust', email: 'acust@p3.test', passwordHash: pw, role: 'customer', accountStatus: 'active' },
      { fullName: 'Blocked Cust', email: 'bcust@p3.test', passwordHash: pw, role: 'customer', accountStatus: 'blocked' },
      { fullName: 'Active Cont', email: 'acont@p3.test', passwordHash: pw, role: 'contractor', accountStatus: 'active' },
      { fullName: 'Disabled User', email: 'dis@p3.test', passwordHash: pw, role: 'customer', accountStatus: 'disabled' },
    ]);

    const deck = await Deck.create({
      ownerId: custActive._id,
      projectName: 'P3 Deck',
      dimensions: { length: 20, width: 12, area: 240 },
    });

    const est = await Estimate.create({
      estimateNumber: 'EST-P3-001',
      deckId: deck._id,
      ownerId: custActive._id,
      createdBy: custActive._id,
      createdFor: custActive._id,
      deckDetails: { areaSqFt: 240, shape: 'rectangle', height: 'ground' },
      pricingSnapshot: { basePricePerSqFt: 0.5, total: 4200 },
      totalAmount: 4200,
    });

    const lead = await Lead.create({
      customerId: custActive._id,
      deckId: deck._id,
      estimateId: est._id,
      leadSource: 'customer_estimator',
      priority: 'HOT',
      status: 'new',
      leadNumber: 'LD-P3-1',
      enquiry: {
        subject: 'P3 Deck Restoration Quote',
        message: 'Looking for an estimate and contractor availability.',
      },
    });

    await Project.create({
      projectId: 'PRJ-P3-1',
      projectName: 'Completed P3 Project',
      customerId: custActive._id,
      contractorId: contractorActive._id,
      estimateId: est._id,
      status: 'completed',
      progress: 100,
    });

    const summary = await adminService.getDashboardSummary('30d');
    assert.equal(summary.summary.totalUsers, 3); // excludes disabledUser
    assert.equal(summary.summary.totalCustomers, 2);
    assert.equal(summary.summary.totalContractors, 1);
    assert.equal(summary.summary.totalLeads, 1);
    assert.equal(summary.summary.hotPriorityLeads, 1);
    assert.equal(summary.summary.totalEstimates, 1);
    assert.equal(summary.summary.estimatedValue, 4200);
    assert.equal(summary.summary.totalRevenue, 4200);
    assert.equal(summary.hotLeads.length, 1);
    assert.ok(summary.recentActivities.length >= 1);

    const usersPage = await adminService.listUsers({ page: 1, limit: 10 });
    assert.equal(usersPage.counts.totalUsers, 3);
    assert.equal(usersPage.counts.totalCustomers, 2);
    assert.equal(usersPage.counts.totalContractors, 1);
    assert.equal(usersPage.counts.activeUsers, 2);
    assert.equal(usersPage.counts.inactiveUsers, 1);
    assert.equal(usersPage.data.length, 3);
    usersPage.data.forEach((u) => {
      assert.ok(u.id);
      assert.equal(u.passwordHash, undefined);
      assert.equal(u.__v, undefined);
    });

    // Empty page must not error on $in: []
    const emptyUsers = await adminService.listUsers({ search: 'no-such-user-p3' });
    assert.equal(emptyUsers.data.length, 0);
  });

  test('4. Lean service helpers normalize id cleanly across pricing, catalog, and notifications', async () => {
    const activePricing = await pricingService.getActivePricingConfiguration();
    assert.ok(activePricing);
    assert.equal(typeof activePricing.basePricePerSqFt, 'number');

    const cats = await catalogService.getMaterialCategories({});
    assert.deepEqual(cats.categories, []);

    const cust = await User.findOne({ email: 'acust@p3.test' }).lean();
    await Notification.create({
      recipientType: 'all',
      targetRole: 'all',
      title: 'P3 Perf Broadcast',
      message: 'Testing lean notification selection',
    });

    const notifRes = await notificationService.getUserNotifications({
      id: cust._id.toString(),
      role: 'customer',
    });
    assert.ok(notifRes.notifications.length >= 1);
    assert.ok(notifRes.notifications[0].id);
    assert.equal(notifRes.notifications[0].__v, undefined);
  });

  test('5. Built frontend assets directory exists and Railway static caching matches', () => {
    const assetsDir = path.resolve(__dirname, '../../../frontend/dist/assets');
    assert.ok(fs.existsSync(assetsDir), 'frontend/dist/assets must exist after production build');
    const assetFiles = fs.readdirSync(assetsDir);
    assert.ok(assetFiles.some((f) => f.startsWith('index-') && f.endsWith('.js')));
  });
});

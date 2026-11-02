// =============================================
// Deck Estimator — Phase 10 Admin Platform Management Tests
// =============================================

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../../src/app');
const User = require('../../src/modules/users/users.model');
const PlatformSetting = require('../../src/modules/admin/platformSetting.model');
const AuditLog = require('../../src/shared/models/auditLog.model');
const { ROLES, ACCOUNT_STATUS } = require('../../src/shared/constants');

describe('Phase 10 — Administrative Dashboard & Platform Management Full Validation', () => {
  let mongoServer;
  let server;
  let baseUrl;

  let adminToken, contractorToken, customerToken;
  let adminUser, contractorUser, customerUser;

  // Helper request function
  async function api(path, options = {}) {
    const url = `${baseUrl}${path}`;
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (options.token) headers['Authorization'] = `Bearer ${options.token}`;

    const res = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const contentType = res.headers.get('content-type') || '';
    let body;
    if (contentType.includes('application/json')) {
      body = await res.json();
    } else {
      body = await res.text();
    }

    return {
      status: res.status,
      headers: res.headers,
      body,
    };
  }

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;

    // 1. Create Admin User
    const adminRes = await api('/api/v1/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Super Admin',
        email: 'superadmin@example.com',
        password: 'Password123!',
      },
    });
    adminUser = await User.findById(adminRes.body.data.user.id);
    adminUser.role = ROLES.ADMIN;
    await adminUser.save();

    const adminLogin = await api('/api/v1/auth/login', {
      method: 'POST',
      body: {
        email: 'superadmin@example.com',
        password: 'Password123!',
      },
    });
    adminToken = adminLogin.body.data.token;

    // 2. Create Contractor User
    const contractorRes = await api('/api/v1/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Contractor Mike',
        email: 'contractor@example.com',
        password: 'Password123!',
      },
    });
    contractorUser = await User.findById(contractorRes.body.data.user.id);
    contractorUser.role = ROLES.CONTRACTOR;
    await contractorUser.save();

    const contractorLogin = await api('/api/v1/auth/login', {
      method: 'POST',
      body: {
        email: 'contractor@example.com',
        password: 'Password123!',
      },
    });
    contractorToken = contractorLogin.body.data.token;

    // 3. Create Customer User
    const customerRes = await api('/api/v1/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Customer Jane',
        email: 'customer@example.com',
        password: 'Password123!',
      },
    });
    customerUser = await User.findById(customerRes.body.data.user.id);

    const customerLogin = await api('/api/v1/auth/login', {
      method: 'POST',
      body: {
        email: 'customer@example.com',
        password: 'Password123!',
      },
    });
    customerToken = customerLogin.body.data.token;
  });

  after(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  });

  // -------------------------------------------------------------
  // 1. STRICT AUTHORIZATION & ACCESS CONTROL
  // -------------------------------------------------------------
  describe('Admin Role Guard & Access Isolation', () => {
    it('1. GET /api/v1/admin/dashboard/summary - Denies unauthenticated access (401)', async () => {
      const res = await api('/api/v1/admin/dashboard/summary');
      assert.equal(res.status, 401);
    });

    it('2. GET /api/v1/admin/dashboard/summary - Denies customer access (403)', async () => {
      const res = await api('/api/v1/admin/dashboard/summary', { token: customerToken });
      assert.equal(res.status, 403);
    });

    it('3. GET /api/v1/admin/dashboard/summary - Denies contractor access (403)', async () => {
      const res = await api('/api/v1/admin/dashboard/summary', { token: contractorToken });
      assert.equal(res.status, 403);
    });

    it('4. GET /api/v1/admin/dashboard/summary - Grants Admin access with real aggregation metrics', async () => {
      const res = await api('/api/v1/admin/dashboard/summary', { token: adminToken });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.users);
      assert.equal(res.body.data.users.totalUsers, 3);
      assert.equal(res.body.data.users.totalAdmins, 1);
      assert.equal(res.body.data.users.totalContractors, 1);
      assert.equal(res.body.data.users.totalCustomers, 1);
    });
  });

  // -------------------------------------------------------------
  // 2. USER & CUSTOMER MANAGEMENT CRUD
  // -------------------------------------------------------------
  describe('User Management CRUD & Safeguards', () => {
    it('5. GET /api/v1/admin/users - Admin retrieves paginated user list with search/filter', async () => {
      const res = await api('/api/v1/admin/users?role=customer', { token: adminToken });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.equal(res.body.data.length, 1);
      assert.equal(res.body.data[0].email, 'customer@example.com');
      assert.equal(res.body.pagination.total, 1);
    });

    it('6. GET /api/v1/admin/users/:id - Admin retrieves detailed user profile with contextual counts', async () => {
      const res = await api(`/api/v1/admin/users/${customerUser._id}`, { token: adminToken });
      assert.equal(res.status, 200);
      assert.equal(res.body.data.user.email, 'customer@example.com');
      assert.ok(res.body.data.stats);
    });

    it('7. POST /api/v1/admin/users - Admin creates new user account directly', async () => {
      const res = await api('/api/v1/admin/users', {
        method: 'POST',
        token: adminToken,
        body: {
          fullName: 'Staff Admin',
          email: 'staffadmin@example.com',
          password: 'Password123!',
          role: ROLES.ADMIN,
        },
      });
      assert.equal(res.status, 201);
      assert.equal(res.body.data.email, 'staffadmin@example.com');
      assert.equal(res.body.data.role, ROLES.ADMIN);
    });

    it('8. PATCH /api/v1/admin/users/:id - Admin updates user profile permitted fields', async () => {
      const res = await api(`/api/v1/admin/users/${customerUser._id}`, {
        method: 'PATCH',
        token: adminToken,
        body: {
          fullName: 'Jane Doe Updated',
          phone: '555-0199',
        },
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.data.fullName, 'Jane Doe Updated');
      assert.equal(res.body.data.phone, '555-0199');
    });

    it('9. PATCH /api/v1/admin/users/:id/status - Admin suspends user account with reason', async () => {
      const res = await api(`/api/v1/admin/users/${customerUser._id}/status`, {
        method: 'PATCH',
        token: adminToken,
        body: {
          accountStatus: ACCOUNT_STATUS.SUSPENDED,
          reason: 'Investigation pending',
        },
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.data.accountStatus, ACCOUNT_STATUS.SUSPENDED);
    });

    it('10. Security: Admin self-demotion / last-admin deactivation is blocked (400)', async () => {
      const res = await api(`/api/v1/admin/users/${adminUser._id}`, {
        method: 'PATCH',
        token: adminToken,
        body: {
          role: ROLES.CUSTOMER,
        },
      });
      assert.equal(res.status, 400);
      assert.match(res.body.error.message, /Administrators cannot modify their own administrative role/i);
    });
  });

  // -------------------------------------------------------------
  // 3. DECK, ESTIMATE & AI OVERSIGHT
  // -------------------------------------------------------------
  describe('Operational Oversight Modules', () => {
    it('11. GET /api/v1/admin/decks - Admin lists all platform deck records', async () => {
      const res = await api('/api/v1/admin/decks', { token: adminToken });
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.pagination);
    });

    it('12. GET /api/v1/admin/estimates - Admin lists all platform estimates with pagination', async () => {
      const res = await api('/api/v1/admin/estimates', { token: adminToken });
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.data));
    });

    it('13. GET /api/v1/admin/analyses - Admin inspects AI condition analysis operations', async () => {
      const res = await api('/api/v1/admin/analyses', { token: adminToken });
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.data));
    });
  });

  // -------------------------------------------------------------
  // 4. PLATFORM SETTINGS MANAGEMENT
  // -------------------------------------------------------------
  describe('Platform Settings CRUD', () => {
    it('14. POST /api/v1/admin/settings - Admin creates a new platform setting', async () => {
      const res = await api('/api/v1/admin/settings', {
        method: 'POST',
        token: adminToken,
        body: {
          key: 'ESTIMATE_VALIDITY_DAYS',
          category: 'ESTIMATE',
          label: 'Estimate Validity Window',
          description: 'Number of calendar days a generated estimate pricing remains guaranteed',
          valueType: 'NUMBER',
          value: 30,
          isPublic: true,
        },
      });
      assert.equal(res.status, 201);
      assert.equal(res.body.data.key, 'ESTIMATE_VALIDITY_DAYS');
      assert.equal(res.body.data.value, 30);
    });

    it('15. POST /api/v1/admin/settings - Rejects duplicate setting key (409)', async () => {
      const res = await api('/api/v1/admin/settings', {
        method: 'POST',
        token: adminToken,
        body: {
          key: 'ESTIMATE_VALIDITY_DAYS',
          category: 'ESTIMATE',
          label: 'Duplicate key',
          valueType: 'NUMBER',
          value: 15,
        },
      });
      assert.equal(res.status, 409);
    });

    it('16. GET /api/v1/admin/settings - Admin retrieves list of all platform settings', async () => {
      const res = await api('/api/v1/admin/settings', { token: adminToken });
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.data));
      assert.equal(res.body.data.length, 1);
      assert.equal(res.body.data[0].key, 'ESTIMATE_VALIDITY_DAYS');
    });

    it('17. PATCH /api/v1/admin/settings/:key - Admin updates platform setting value', async () => {
      const res = await api('/api/v1/admin/settings/ESTIMATE_VALIDITY_DAYS', {
        method: 'PATCH',
        token: adminToken,
        body: {
          value: 45,
          description: 'Updated validity guarantee to 45 days',
        },
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.data.value, 45);
    });
  });

  // -------------------------------------------------------------
  // 5. AUDIT LOGS RETRIEVAL & IMMUTABILITY
  // -------------------------------------------------------------
  describe('Audit Logs Oversight', () => {
    it('18. GET /api/v1/admin/audit-logs - Admin searches and lists audit events', async () => {
      const res = await api('/api/v1/admin/audit-logs', { token: adminToken });
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.length > 0);
      assert.ok(res.body.data[0].performedBy);
    });

    it('19. GET /api/v1/admin/dashboard/activity - Retrieves recent activity timeline', async () => {
      const res = await api('/api/v1/admin/dashboard/activity?limit=5', { token: adminToken });
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.length <= 5);
    });
  });

  // -------------------------------------------------------------
  // 6. REPORTS & CSV EXPORT
  // -------------------------------------------------------------
  describe('Reporting & Exporting', () => {
    it('20. GET /api/v1/admin/reports/users - Admin gets structured users report', async () => {
      const res = await api('/api/v1/admin/reports/users', { token: adminToken });
      assert.equal(res.status, 200);
      assert.equal(res.body.data.type, 'users');
      assert.ok(Array.isArray(res.body.data.columns));
      assert.ok(Array.isArray(res.body.data.rows));
      assert.ok(res.body.data.rows.length >= 3);
    });

    it('21. GET /api/v1/admin/reports/users?format=csv - Admin exports users report as CSV file stream', async () => {
      const res = await api('/api/v1/admin/reports/users?format=csv', { token: adminToken });
      assert.equal(res.status, 200);
      assert.match(res.headers.get('content-type'), /text\/csv/);
      assert.match(res.headers.get('content-disposition'), /attachment; filename="users-report-/);
      assert.match(res.body, /"ID","Full Name","Email","Role","Status","Registered At"/);
      assert.match(res.body, /"superadmin@example.com"/);
    });

    it('22. GET /api/v1/admin/reports/leads - Admin gets leads report', async () => {
      const res = await api('/api/v1/admin/reports/leads', { token: adminToken });
      assert.equal(res.status, 200);
      assert.equal(res.body.data.type, 'leads');
      assert.ok(Array.isArray(res.body.data.columns));
    });

    it('23. GET /api/v1/admin/reports/estimates - Admin gets estimates report', async () => {
      const res = await api('/api/v1/admin/reports/estimates', { token: adminToken });
      assert.equal(res.status, 200);
      assert.equal(res.body.data.type, 'estimates');
      assert.ok(Array.isArray(res.body.data.columns));
    });

    it('24. GET /api/v1/admin/reports/commissions - Admin gets commissions report', async () => {
      const res = await api('/api/v1/admin/reports/commissions', { token: adminToken });
      assert.equal(res.status, 200);
      assert.equal(res.body.data.type, 'commissions');
      assert.ok(Array.isArray(res.body.data.columns));
    });
  });
});

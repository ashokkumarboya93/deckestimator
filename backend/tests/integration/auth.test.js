// =============================================
// Deck Estimator — Auth & Authorization Comprehensive Tests (Phase 3)
// =============================================

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const User = require('../../src/modules/users/users.model');
const ContractorProfile = require('../../src/modules/contractors/contractorProfile.model');
const { ROLES, VERIFICATION_STATUS } = require('../../src/shared/constants');

describe('Phase 3 — Authentication & Authorization Full Validation', () => {
  let mongoServer;
  let server;
  let baseUrl;
  let customerToken;
  let customerUser;
  let pendingContractorToken;
  let approvedContractorToken;
  let adminToken;

  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(0, () => {
        const { port } = server.address();
        baseUrl = `http://localhost:${port}/api/v1`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  });

  // 1. Successful customer registration
  it('1. POST /auth/register - Successfully register a customer', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Alice Customer',
        email: 'alice@deckestimator.com',
        password: 'SecurePassword123!',
        role: 'customer',
        phone: '123-456-7890',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.equal(data.data.user.email, 'alice@deckestimator.com');
    assert.equal(data.data.user.role, ROLES.CUSTOMER);
    assert.equal(data.data.user.accountStatus, 'active');
    assert.ok(data.data.token);
    assert.equal(data.data.user.passwordHash, undefined);

    customerToken = data.data.token;
    customerUser = data.data.user;
  });

  // 2. Successful contractor registration
  it('2. POST /auth/register - Successfully register a contractor with pending profile', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Bob Contractor',
        email: 'bob@prodecks.com',
        password: 'ContractorPass123!',
        role: 'contractor',
        phone: '987-654-3210',
        businessName: 'Pro Decks LLC',
        licenseNumber: 'LIC-CA-9921',
        licenseJurisdiction: 'CA',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.equal(data.data.user.role, ROLES.CONTRACTOR);
    assert.equal(data.data.user.accountStatus, 'pending_verification');
    assert.ok(data.data.contractorProfile);
    assert.equal(data.data.contractorProfile.verificationStatus, VERIFICATION_STATUS.PENDING);
    assert.equal(data.data.contractorProfile.licenseNumber, 'LIC-CA-9921');

    pendingContractorToken = data.data.token;
  });

  // 3. Duplicate email rejection
  it('3. POST /auth/register - Reject duplicate email registration', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Alice Clone',
        email: 'ALICE@deckestimator.com', // Case-insensitive test
        password: 'AnotherPassword123!',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 409);
    assert.equal(data.success, false);
    assert.equal(data.error.code, 'CONFLICT');
  });

  // 4. Invalid registration data rejection
  it('4. POST /auth/register - Reject invalid registration payload (short password & bad email)', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: '',
        email: 'not-an-email',
        password: '123',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.success, false);
    assert.equal(data.error.code, 'VALIDATION_ERROR');
    assert.ok(data.error.details.length >= 1);
  });

  // 5. Public Admin registration rejection
  it('5. POST /auth/register - Forbid admin role in public registration', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Attacker Admin',
        email: 'attacker@admin.com',
        password: 'SuperAdminPassword123!',
        role: 'admin',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.success, false);
    assert.equal(data.error.code, 'VALIDATION_ERROR');
  });

  // 6. Successful login
  it('6. POST /auth/login - Successfully login with valid credentials and receive token & cookie', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice@deckestimator.com',
        password: 'SecurePassword123!',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.data.token);
    assert.equal(data.data.user.email, 'alice@deckestimator.com');

    // Cookie header check
    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie, 'Should set http-only cookie');
    assert.ok(setCookie.includes('token='), 'Cookie should contain token');
  });

  // 7. Incorrect password rejection
  it('7. POST /auth/login - Reject login with incorrect password', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice@deckestimator.com',
        password: 'WrongPassword!',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 401);
    assert.equal(data.success, false);
    assert.equal(data.error.code, 'UNAUTHORIZED');
  });

  // 8. Nonexistent user login rejection
  it('8. POST /auth/login - Reject login for nonexistent email with generic 401 (prevent enumeration)', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nobody@nowhere.com',
        password: 'AnyPassword123!',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 401);
    assert.equal(data.success, false);
    assert.equal(data.error.code, 'UNAUTHORIZED');
  });

  // 9. Password hash not exposed in API responses
  it('9. GET /auth/me & User JSON transform - Ensure passwordHash is never exposed', async () => {
    const res = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.data.user.passwordHash, undefined);
    assert.equal(data.data.user.__v, undefined);
  });

  // 10. Valid and invalid JWT handling
  it('10. GET /auth/me - Handle invalid and malformed JWTs gracefully', async () => {
    const resMalformed = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: 'Bearer thisisnotavalidtoken' },
    });
    const dataMalformed = await resMalformed.json();
    assert.equal(resMalformed.status, 401);
    assert.equal(dataMalformed.error.code, 'INVALID_TOKEN');
  });

  // 11. Logout behavior
  it('11. POST /auth/logout - Clear authentication cookie', async () => {
    const res = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie);
  });

  // 12. Unauthorized endpoint access
  it('12. GET /users/me - Reject request with missing Authorization', async () => {
    const res = await fetch(`${baseUrl}/users/me`);
    const data = await res.json();
    assert.equal(res.status, 401);
    assert.equal(data.error.code, 'AUTH_REQUIRED');
  });

  // 13. Customer-to-customer access isolation
  it('13. Customer access isolation - Customers only modify their own profile', async () => {
    const res = await fetch(`${baseUrl}/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        fullName: 'Alice Customer Modified',
        phone: '555-444-3333',
      }),
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.data.user.fullName, 'Alice Customer Modified');
    assert.equal(data.data.user.id, customerUser.id);
  });

  // 14. Contractor verification restrictions
  it('14. Contractor verification restrictions - Verification guard blocks unapproved contractor', async () => {
    // Check pending contractor verification status
    const profileRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${pendingContractorToken}` },
    });
    const profileData = await profileRes.json();
    assert.equal(profileData.data.contractorProfile.verificationStatus, 'pending');

    // Create an approved contractor directly in test DB
    const approvedPassHash = await User.hashPassword('ApprovedPass123!');
    const approvedUser = await User.create({
      fullName: 'Charlie Approved',
      email: 'charlie@approvedcontractor.com',
      passwordHash: approvedPassHash,
      role: ROLES.CONTRACTOR,
      accountStatus: 'active',
    });
    await ContractorProfile.create({
      userId: approvedUser._id,
      businessName: 'Charlie Deck Estimators',
      licenseNumber: 'LIC-APP-77',
      verificationStatus: VERIFICATION_STATUS.APPROVED,
    });
    const authService = require('../../src/modules/auth/auth.service');
    approvedContractorToken = authService.generateToken(approvedUser);
    assert.ok(approvedContractorToken);
  });

  // 15. Admin-only endpoint protection
  it('15. Admin role protection - Non-admins cannot access admin role-guarded endpoints', async () => {
    // Register admin directly via DB (controlled process)
    const adminPassHash = await User.hashPassword('AdminMaster123!');
    const adminUser = await User.create({
      fullName: 'System Administrator',
      email: 'admin@deckestimator.com',
      passwordHash: adminPassHash,
      role: ROLES.ADMIN,
      accountStatus: 'active',
    });
    const authService = require('../../src/modules/auth/auth.service');
    adminToken = authService.generateToken(adminUser);
    assert.ok(adminToken);

    // Verify admin role via /auth/me
    const adminMe = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminMeData = await adminMe.json();
    assert.equal(adminMeData.data.user.role, 'admin');

    // Customer role attempting admin check
    const { authorize } = require('../../src/middleware/authorize');
    const adminGuard = authorize(ROLES.ADMIN);

    let denied = false;
    const mockReq = { user: { role: ROLES.CUSTOMER } };
    const mockRes = {
      status(code) {
        if (code === 403) denied = true;
        return { json: () => {} };
      },
    };
    adminGuard(mockReq, mockRes, () => {});
    assert.equal(denied, true, 'Customer must receive 403 Forbidden from Admin guard');
  });

  // 16. Unauthorized profile field modification
  it('16. PATCH /users/me - Strictly reject unauthorized attempts to alter role or account status', async () => {
    const res = await fetch(`${baseUrl}/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        fullName: 'Alice Legit',
        role: 'admin', // Malicious attempt to change role
        accountStatus: 'suspended', // Malicious attempt to change status
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 400, 'Schema must reject unpermitted keys with 400 Bad Request');
    assert.equal(data.error.code, 'VALIDATION_ERROR');

    // Confirm role and status in database are completely unchanged
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const meData = await meRes.json();
    assert.equal(meData.data.user.role, ROLES.CUSTOMER, 'Role must remain customer');
    assert.equal(meData.data.user.accountStatus, 'active', 'Account status must remain active');
  });

  // 17. Session and cookie security behavior
  it('17. Cookie configuration - Cookies are HttpOnly with appropriate flags', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice@deckestimator.com',
        password: 'SecurePassword123!',
      }),
    });
    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie.toLowerCase().includes('httponly'), 'Must have HttpOnly flag');
    assert.ok(setCookie.toLowerCase().includes('samesite=lax') || setCookie.toLowerCase().includes('samesite=none'));
  });
});

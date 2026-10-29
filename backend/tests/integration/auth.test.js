// =============================================
// DECK PRO — Auth & Users Integration Test
// =============================================

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');

describe('Auth & Users Module Integration', () => {
  let mongoServer;
  let server;
  let baseUrl;
  let customerToken;
  let customerUser;

  before(async () => {
    // 1. Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // 2. Start HTTP test server
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
    // Teardown
    if (server) await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  });

  it('POST /auth/register - Should register a new customer', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Jane Customer',
        email: 'jane@example.com',
        password: 'Password123!',
        role: 'customer',
        phone: '1234567890',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.equal(data.data.user.email, 'jane@example.com');
    assert.equal(data.data.user.role, 'customer');
    assert.equal(data.data.user.accountStatus, 'active');
    assert.ok(data.data.token, 'Should return JWT token');
    assert.equal(data.data.user.passwordHash, undefined, 'passwordHash must not be exposed');

    customerToken = data.data.token;
    customerUser = data.data.user;
  });

  it('POST /auth/register - Should reject duplicate email', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Duplicate Jane',
        email: 'JANE@example.com', // Test case-insensitivity
        password: 'Password123!',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 409);
    assert.equal(data.success, false);
    assert.equal(data.error.code, 'CONFLICT');
  });

  it('POST /auth/register - Should reject admin role assignment via public register', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Malicious Admin',
        email: 'admin_attack@example.com',
        password: 'Password123!',
        role: 'admin',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 400);
    assert.equal(data.success, false);
    assert.equal(data.error.code, 'VALIDATION_ERROR');
  });

  it('POST /auth/register - Should register a contractor with profile', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Bob Builder',
        email: 'bob@contractor.com',
        password: 'Password123!',
        role: 'contractor',
        phone: '5551234567',
        businessName: 'Bob Decks LLC',
        licenseNumber: 'LIC-998877',
        licenseJurisdiction: 'CA',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.success, true);
    assert.equal(data.data.user.role, 'contractor');
    assert.equal(data.data.user.accountStatus, 'pending_verification');
    assert.ok(data.data.contractorProfile, 'ContractorProfile must be created');
    assert.equal(data.data.contractorProfile.businessName, 'Bob Decks LLC');
    assert.equal(data.data.contractorProfile.verificationStatus, 'pending');
  });

  it('POST /auth/login - Should login with correct credentials', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'jane@example.com',
        password: 'Password123!',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.data.token);
    assert.equal(data.data.user.email, 'jane@example.com');
  });

  it('POST /auth/login - Should fail with incorrect password', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'jane@example.com',
        password: 'WrongPassword!',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 401);
    assert.equal(data.success, false);
    assert.equal(data.error.code, 'UNAUTHORIZED');
  });

  it('GET /auth/me - Should return current user when authenticated', async () => {
    const res = await fetch(`${baseUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${customerToken}`,
      },
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.data.user.id, customerUser.id);
  });

  it('GET /auth/me - Should reject unauthenticated request', async () => {
    const res = await fetch(`${baseUrl}/auth/me`);
    const data = await res.json();

    assert.equal(res.status, 401);
    assert.equal(data.success, false);
    assert.equal(data.error.code, 'AUTH_REQUIRED');
  });

  it('PATCH /users/me - Should update profile fields', async () => {
    const res = await fetch(`${baseUrl}/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        fullName: 'Jane Customer Updated',
        phone: '9998887777',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.data.user.fullName, 'Jane Customer Updated');
    assert.equal(data.data.user.phone, '9998887777');
  });
});

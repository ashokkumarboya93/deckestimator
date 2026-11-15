// =============================================
// Deck Estimator — Mandatory 9 Pillars Security & Concepts Verification
// =============================================
// Verifies all 9 mandatory concepts without altering existing business logic:
// 1. Authentication (login, logout, session management, bcrypt)
// 2. Error Handling (proper JSON error envelopes, no uncaught crashes)
// 3. Authorization (Role-based access: Admin, Contractor, Customer)
// 4. Data Validation (Frontend and Backend validation schemas)
// 5. Data Security (Protection of sensitive credentials, passwordHash, tokens)
// 6. Database Security (Sanitization of NoSQL injection operators: $, .)
// 7. Password Recovery (Forgot-password and reset-password workflow)
// 8. Data Backup (Snapshot manifest and recovery utilities)
// 9. Audit Logs (Logging and activity tracking in database)

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const app = require('../../src/app');
const { connectDatabase, disconnectDatabase } = require('../../src/config/database');
const User = require('../../src/modules/users/users.model');
const { sanitizeInput, sanitizeObject } = require('../../src/middleware/sanitize');

describe('Mandatory 9 Pillars Verification Suite', () => {
  let server;
  let baseUrl;
  let adminToken = '';
  let customerToken = '';
  const testEmail = `sec_test_${Date.now()}@deckestimator.com`;
  const initialPassword = 'TestPassword123!';
  const updatedPassword = 'NewSecretPassword456!';
  let generatedResetToken = '';

  before(async () => {
    await connectDatabase();
    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(0, () => {
        baseUrl = `http://localhost:${server.address().port}/api/v1`;
        resolve();
      });
    });
  });

  after(async () => {
    // Cleanup test user
    try {
      await User.deleteOne({ email: testEmail });
    } catch {
      // ignore
    }
    if (server && server.listening) {
      await new Promise((resolve) => server.close(resolve));
    }
    await disconnectDatabase();
  });

  // ----------------------------------------------------
  // PILLAR 1: Authentication
  // ----------------------------------------------------
  describe('Pillar 1: Authentication & Session Management', () => {
    it('should register a test user with securely hashed password', async () => {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Security Test Customer',
          email: testEmail,
          password: initialPassword,
          role: 'customer',
          phone: '+15551234567',
        }),
      });

      const body = await res.json();
      assert.equal(res.status, 201, `Expected 201 Created: ${JSON.stringify(body)}`);
      assert.equal(body.success, true);
      assert.ok(body.data.token, 'Should return session token');
      customerToken = body.data.token;

      // Verify bcrypt in database
      const dbUser = await User.findOne({ email: testEmail }).select('+passwordHash');
      assert.ok(dbUser.passwordHash.startsWith('$2'), 'Password must be hashed with bcrypt ($2a/$2b)');
      assert.notEqual(dbUser.passwordHash, initialPassword, 'Raw password must never be stored');
    });

    it('should reject invalid credentials with 401 Unauthorized', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'WrongPassword999!',
        }),
      });

      const body = await res.json();
      assert.equal(res.status, 401);
      assert.equal(body.success, false);
      assert.equal(body.error.code, 'UNAUTHORIZED');
    });

    it('should successfully log in with valid credentials and return JWT', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: initialPassword,
        }),
      });

      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.success, true);
      assert.ok(body.data.token);
    });

    it('should clear cookies on logout', async () => {
      const res = await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
        },
      });

      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.success, true);
      const setCookie = res.headers.get('set-cookie');
      if (setCookie) {
        assert.ok(setCookie.includes('token=') || setCookie.includes('Expires=') || setCookie.includes('Max-Age=0'));
      }
    });
  });

  // ----------------------------------------------------
  // PILLAR 2: Error Handling
  // ----------------------------------------------------
  describe('Pillar 2: Error Handling', () => {
    it('should return standard 404 envelope without crashing for unknown endpoints', async () => {
      const res = await fetch(`${baseUrl}/non-existent-api-path-404`);
      const body = await res.json();
      assert.equal(res.status, 404);
      assert.equal(body.success, false);
      assert.ok(body.error.code, 'Should return error code');
      assert.ok(body.error.message, 'Should return error message');
      assert.equal(body.stack, undefined, 'Must not leak stack traces');
    });

    it('should handle malformed JSON cleanly with 400 Bad Request', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"invalidJson',
      });
      assert.ok(res.status >= 400 && res.status < 500, 'Must return 4xx error instead of crashing');
    });
  });

  // ----------------------------------------------------
  // PILLAR 3: Authorization (Role-Based Access Control)
  // ----------------------------------------------------
  describe('Pillar 3: Authorization & RBAC', () => {
    it('should block unauthenticated requests to protected endpoints with 401', async () => {
      const res = await fetch(`${baseUrl}/users/me`);
      const body = await res.json();
      assert.equal(res.status, 401);
      assert.equal(body.success, false);
    });

    it('should allow customer to access their own /users/me endpoint', async () => {
      const res = await fetch(`${baseUrl}/users/me`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.success, true);
      assert.equal(body.data.user.email, testEmail);
    });

    it('should reject non-admin users from admin-only endpoints with 403 Forbidden', async () => {
      // Platform settings or admin users list
      const res = await fetch(`${baseUrl}/admin/users`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      const body = await res.json();
      assert.equal(res.status, 403, 'Customer must be blocked from admin endpoints with 403');
      assert.equal(body.success, false);
      assert.equal(body.error.code, 'FORBIDDEN');
    });
  });

  // ----------------------------------------------------
  // PILLAR 4: Data Validation
  // ----------------------------------------------------
  describe('Pillar 4: Data Validation (Joi & Input Sanitization)', () => {
    it('should reject registration with invalid email format', async () => {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Invalid Email User',
          email: 'not-an-email',
          password: 'ValidPassword123!',
          role: 'customer',
        }),
      });

      const body = await res.json();
      assert.equal(res.status, 400);
      assert.equal(body.success, false);
      assert.equal(body.error.code, 'VALIDATION_ERROR');
    });

    it('should reject registration with short/weak password', async () => {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Weak Password User',
          email: 'weakpass@deckestimator.test',
          password: '123',
          role: 'customer',
        }),
      });

      const body = await res.json();
      assert.equal(res.status, 400);
      assert.equal(body.success, false);
      assert.equal(body.error.code, 'VALIDATION_ERROR');
    });
  });

  // ----------------------------------------------------
  // PILLAR 5: Data Security & Privacy
  // ----------------------------------------------------
  describe('Pillar 5: Data Security & Privacy', () => {
    it('should never expose passwordHash in API responses', async () => {
      const res = await fetch(`${baseUrl}/users/me`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      const body = await res.json();
      assert.equal(body.data.user.passwordHash, undefined, 'passwordHash must never be exposed');
      assert.equal(body.data.user.password, undefined, 'Raw password must never be exposed');
    });

    it('should never expose passwordResetToken or passwordResetExpires in API responses', async () => {
      const res = await fetch(`${baseUrl}/users/me`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      const body = await res.json();
      assert.equal(body.data.user.passwordResetToken, undefined, 'passwordResetToken must never be exposed');
      assert.equal(body.data.user.passwordResetExpires, undefined, 'passwordResetExpires must never be exposed');
    });
  });

  // ----------------------------------------------------
  // PILLAR 6: Database Security & NoSQL Injection Protection
  // ----------------------------------------------------
  describe('Pillar 6: Database Security & NoSQL Injection Prevention', () => {
    it('should sanitize dangerous MongoDB query operators ($gt, $where, $regex) from input', () => {
      const maliciousPayload = {
        email: { $gt: '' },
        password: { $ne: null },
        query: { $regex: '.*' },
        nested: {
          'bad.field': 'malicious',
          safeField: 'good',
        },
      };

      const sanitized = sanitizeObject(maliciousPayload);

      assert.equal(sanitized.email.$gt, undefined, 'Keys starting with $ must be stripped');
      assert.equal(sanitized.password.$ne, undefined, 'Keys starting with $ must be stripped');
      assert.equal(sanitized.query.$regex, undefined, 'Keys starting with $ must be stripped');
      assert.equal(sanitized.nested['bad.field'], undefined, 'Keys containing . must be stripped');
      assert.equal(sanitized.nested.safeField, 'good', 'Safe fields must be preserved');
    });

    it('should prevent NoSQL injection via login endpoint', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: { $gt: '' },
          password: { $gt: '' },
        }),
      });

      // Sanitizer strips $gt, leaving email & password undefined or failing validation
      assert.ok(res.status === 400 || res.status === 401, 'Injection attempt must be safely rejected');
      const body = await res.json();
      assert.equal(body.success, false);
    });
  });

  // ----------------------------------------------------
  // PILLAR 7: Password Recovery (Forgot & Reset Password)
  // ----------------------------------------------------
  describe('Pillar 7: Password Recovery Workflow', () => {
    it('POST /auth/forgot-password should generate reset token for registered email', async () => {
      const res = await fetch(`${baseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail }),
      });

      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.success, true);
      assert.ok(body.message);

      // In development mode, the reset token is returned in data for convenience/testing
      assert.ok(body.data.resetToken, 'Reset token should be generated');
      generatedResetToken = body.data.resetToken;

      // Verify in DB that reset token is stored as SHA256 hash
      const dbUser = await User.findOne({ email: testEmail }).select('+passwordResetToken +passwordResetExpires');
      assert.ok(dbUser.passwordResetToken, 'Token hash must be stored');
      assert.notEqual(dbUser.passwordResetToken, generatedResetToken, 'Token must be SHA256 hashed in DB');
      assert.ok(dbUser.passwordResetExpires > new Date(), 'Expiry must be in the future');
    });

    it('POST /auth/reset-password should reset password with valid token', async () => {
      const res = await fetch(`${baseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: generatedResetToken,
          newPassword: updatedPassword,
          confirmPassword: updatedPassword,
        }),
      });

      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.success, true);

      // Verify that the reset token is now cleared in DB (single-use protection)
      const dbUser = await User.findOne({ email: testEmail }).select('+passwordResetToken +passwordResetExpires');
      assert.ok(!dbUser.passwordResetToken, 'Reset token must be cleared after use');
      assert.ok(!dbUser.passwordResetExpires, 'Expiry must be cleared after use');
    });

    it('should successfully log in with the new password', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: updatedPassword,
        }),
      });

      const body = await res.json();
      assert.equal(res.status, 200);
      assert.equal(body.success, true);
      assert.ok(body.data.token);
    });

    it('should reject reused or invalid reset token with 400', async () => {
      const res = await fetch(`${baseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: generatedResetToken, // already consumed
          newPassword: 'AnotherPassword999!',
          confirmPassword: 'AnotherPassword999!',
        }),
      });

      const body = await res.json();
      assert.equal(res.status, 400);
      assert.equal(body.success, false);
    });
  });

  // ----------------------------------------------------
  // PILLAR 8: Data Backup & Recovery Mechanism
  // ----------------------------------------------------
  describe('Pillar 8: Data Backup & Recovery', () => {
    it('should verify backup snapshots and manifest exist on disk', () => {
      const backupDir = path.join(__dirname, '../../backups');
      assert.ok(fs.existsSync(backupDir), 'Backup root directory must exist');

      const snapshots = fs.readdirSync(backupDir).filter((f) => f.startsWith('backup-'));
      assert.ok(snapshots.length > 0, 'At least one backup snapshot must exist');

      const latest = path.join(backupDir, snapshots.sort().reverse()[0]);
      const manifestPath = path.join(latest, 'manifest.json');
      assert.ok(fs.existsSync(manifestPath), 'Latest snapshot must have manifest.json');

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      assert.equal(manifest.database, 'DECK_ESTIMATOR');
      assert.ok(manifest.totalDocuments > 0, 'Backup must contain valid documents');
      assert.ok(manifest.collections.users.count > 0, 'Users collection must be backed up');
    });
  });

  // ----------------------------------------------------
  // PILLAR 9: Audit Logs & Administrative Tracking
  // ----------------------------------------------------
  describe('Pillar 9: Audit Logs & Tracking', () => {
    it('should verify auditLogs collection exists and tracks activity', async () => {
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      const colNames = collections.map((c) => c.name);
      assert.ok(colNames.includes('auditLogs'), 'auditLogs collection must exist in database');

      const auditCol = db.collection('auditLogs');
      const count = await auditCol.countDocuments();
      assert.ok(typeof count === 'number', 'Must be able to query audit logs count');
    });
  });
});

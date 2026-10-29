// =============================================
// DECK PRO — Health Endpoint Test
// =============================================
// Verifies the server starts and the health endpoint responds.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const app = require('../../src/app');

describe('Health Endpoint', () => {
  let server;
  let baseUrl;

  // Start a test server on a random port
  it('should start the server', async () => {
    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(0, () => {
        const { port } = server.address();
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
    assert.ok(server.listening, 'Server should be listening');
  });

  it('GET /api/v1/health should return 200 with status ok', async () => {
    const response = await fetch(`${baseUrl}/api/v1/health`);
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.data.status, 'ok');
    assert.ok(data.data.timestamp, 'Should include a timestamp');
    assert.ok(data.data.environment, 'Should include environment');
  });

  it('GET /api/v1/nonexistent should return 404', async () => {
    const response = await fetch(`${baseUrl}/api/v1/nonexistent`);
    const data = await response.json();

    assert.equal(response.status, 404);
    assert.equal(data.success, false);
    assert.equal(data.error.code, 'NOT_FOUND');
  });

  it('should close the server', async () => {
    await new Promise((resolve) => server.close(resolve));
    assert.ok(!server.listening, 'Server should be closed');
  });
});

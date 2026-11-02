// ============================================================================
// Deck Estimator - Batch 1 (APIs 001 - 030) Automated Live HTTP Verification
// ============================================================================

const fs = require('fs');

async function testFirst30Apis() {
  const baseUrl = 'http://localhost:5000/api/v1';
  console.log('========================================================================');
  console.log('--- EXECUTING LIVE HTTP VERIFICATION: API-001 TO API-030 ---');
  console.log('Server Base URL: ' + baseUrl);
  console.log('========================================================================\n');

  const results = [];

  async function call(apiId, name, method, endpoint, headers = {}, body = null) {
    const opts = { method, headers: { ...headers } };
    if (body) {
      if (Buffer.isBuffer(body)) {
        opts.body = body;
      } else if (typeof body === 'object') {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(body);
      } else {
        opts.body = body;
      }
    }

    const start = Date.now();
    let res, data;
    try {
      res = await fetch(baseUrl + endpoint, opts);
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }
    } catch (err) {
      return { apiId, name, method, endpoint, status: 'ERROR', error: err.message, ok: false };
    }
    const elapsed = Date.now() - start;

    const ok = res.status >= 200 && res.status < 300;
    const record = { apiId, name, method, endpoint, status: res.status, ok, elapsed, data };
    results.push(record);

    console.log(`[${ok ? 'PASS' : 'FAIL'}] ${apiId}: ${method} ${endpoint} -> Status ${res.status} (${elapsed}ms)`);
    if (!ok) {
      console.log('   Error Detail:', JSON.stringify(data));
    }
    return record;
  }

  // --- Authenticate Admin for Admin APIs ---
  const adminLogin = await call('SETUP', 'Admin Auth', 'POST', '/auth/login', {}, {
    email: 'admin@deckestimator.com',
    password: 'AdminPass123!'
  });
  const adminToken = adminLogin.data?.data?.token;

  // 1. API-001: Health check
  await call('API-001', 'Health & Telemetry', 'GET', '/health');

  // 2. API-002: Customer Registration
  const userEmail = 'postman_batch1_' + Date.now() + '@example.com';
  const reg = await call('API-002', 'Customer Registration', 'POST', '/auth/register', {}, {
    fullName: 'Postman Batch Tester',
    email: userEmail,
    password: 'SecurePassword123!',
    phone: '+1-555-888-9999',
    role: 'customer'
  });
  let customerToken = reg.data?.data?.token;

  // 3. API-003: Login
  const loginRes = await call('API-003', 'Customer Login', 'POST', '/auth/login', {}, {
    email: userEmail,
    password: 'SecurePassword123!'
  });
  customerToken = loginRes.data?.data?.token || customerToken;
  const authHeader = { 'Authorization': 'Bearer ' + customerToken };
  const adminHeader = { 'Authorization': 'Bearer ' + adminToken };

  // 4. API-004: Logout
  await call('API-004', 'Customer Logout', 'POST', '/auth/logout', authHeader);

  // 5. API-005: Retrieve Current Authenticated User Session (auth/me)
  await call('API-005', 'Get Authenticated Session', 'GET', '/auth/me', authHeader);

  // 6. API-006: Get User Profile (users/me)
  await call('API-006', 'Get Profile Details', 'GET', '/users/me', authHeader);

  // 7. API-007: Update User Profile (users/me)
  await call('API-007', 'Update Profile Details', 'PATCH', '/users/me', authHeader, {
    fullName: 'Postman Batch Tester Updated',
    phone: '+1-555-000-1111'
  });

  // 8. API-008: Create Deck Project
  const deckA = await call('API-008', 'Create Deck Project', 'POST', '/decks', authHeader, {
    projectName: 'Batch1 Primary Deck ' + Date.now(),
    deckShape: 'rectangle',
    dimensions: { length: 24, width: 16 }
  });
  const primaryDeckId = deckA.data?.data?.deck?.id || deckA.data?.data?.id;

  // Create temporary secondary deck for API-012 delete test
  const deckTemp = await call('SETUP', 'Create Deck for Delete', 'POST', '/decks', authHeader, {
    projectName: 'Deck To Be Deleted ' + Date.now(),
    deckShape: 'square',
    dimensions: { length: 10, width: 10 }
  });
  const deleteDeckId = deckTemp.data?.data?.deck?.id || deckTemp.data?.data?.id;

  // 9. API-009: List User Deck Projects
  await call('API-009', 'List Decks', 'GET', '/decks', authHeader);

  // 10. API-010: Get Deck Project by ID
  await call('API-010', 'Get Deck by ID', 'GET', `/decks/${primaryDeckId}`, authHeader);

  // 11. API-011: Update Deck Project Specifications
  await call('API-011', 'Update Deck Specifications', 'PATCH', `/decks/${primaryDeckId}`, authHeader, {
    projectDescription: 'Updated deck description for batch testing',
    deckShape: 'rectangle',
    dimensions: { length: 26, width: 16 }
  });

  // 12. API-012: Delete Deck Project (Soft Delete)
  await call('API-012', 'Delete Deck Project', 'DELETE', `/decks/${deleteDeckId}`, authHeader);

  // 13. API-013: Upload Deck Photographs (Multipart/Form-Data)
  const validPng = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
    0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
    0x42, 0x60, 0x82
  ]);
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const multipartHeader1 = '--' + boundary + '\r\n' +
    'Content-Disposition: form-data; name="images"; filename="photo1.png"\r\n' +
    'Content-Type: application/octet-stream\r\n\r\n';
  const multipartHeader2 = '\r\n--' + boundary + '\r\n' +
    'Content-Disposition: form-data; name="images"; filename="photo2.png"\r\n' +
    'Content-Type: application/octet-stream\r\n\r\n';
  const multipartFooter = '\r\n--' + boundary + '--\r\n';

  const multipartBody = Buffer.concat([
    Buffer.from(multipartHeader1, 'utf-8'),
    validPng,
    Buffer.from(multipartHeader2, 'utf-8'),
    validPng,
    Buffer.from(multipartFooter, 'utf-8')
  ]);

  const uploadRes = await call(
    'API-013',
    'Upload Deck Photographs',
    'POST',
    `/decks/${primaryDeckId}/images`,
    { ...authHeader, 'Content-Type': 'multipart/form-data; boundary=' + boundary },
    multipartBody
  );
  const uploadedImages = uploadRes.data?.data?.images || uploadRes.data?.data || [];
  const primaryImageId = uploadedImages[0]?.id;
  const secondaryImageId = uploadedImages[1]?.id;

  // 14. API-014: List Uploaded Deck Photographs
  await call('API-014', 'List Deck Photos', 'GET', `/decks/${primaryDeckId}/images`, authHeader);

  // 15. API-015: Serve / Stream Private Deck Image
  await call('API-015', 'Stream Deck Photo', 'GET', `/decks/${primaryDeckId}/images/${primaryImageId}`, authHeader);

  // 16. API-016: Delete Deck Photograph (Delete secondary image)
  if (secondaryImageId) {
    await call('API-016', 'Delete Deck Photo', 'DELETE', `/decks/${primaryDeckId}/images/${secondaryImageId}`, authHeader);
  }

  // 17. API-017: Run Condition Analysis (Deck Shortcut)
  await call('API-017', 'Run Condition Analysis Shortcut', 'POST', `/decks/${primaryDeckId}/analyses`, authHeader, {
    notes: 'Triggered condition assessment from batch 1 testing'
  });

  // 18. API-018: List Condition Analyses (Deck Shortcut)
  await call('API-018', 'List Deck Analyses Shortcut', 'GET', `/decks/${primaryDeckId}/analyses`, authHeader);

  // 19. API-019: Create Material Category (Admin)
  const catName = 'Batch1 Category ' + Date.now();
  const catRes = await call('API-019', 'Create Material Category', 'POST', '/catalog/material-categories', adminHeader, {
    name: catName,
    description: 'Material category for automated testing batch 1',
    displayOrder: 1,
    status: 'active'
  });
  const categoryId = catRes.data?.data?.category?.id || catRes.data?.data?.id;

  // 20. API-020: List Material Categories
  await call('API-020', 'List Material Categories', 'GET', '/catalog/material-categories', authHeader);

  // 21. API-021: Get Material Category by ID
  await call('API-021', 'Get Category by ID', 'GET', `/catalog/material-categories/${categoryId}`, authHeader);

  // 22. API-022: Patch Material Category
  await call('API-022', 'Patch Material Category', 'PATCH', `/catalog/material-categories/${categoryId}`, adminHeader, {
    description: 'Partially updated description for category',
    displayOrder: 2
  });

  // 23. API-023: Put (Replace) Material Category
  await call('API-023', 'Put Material Category', 'PUT', `/catalog/material-categories/${categoryId}`, adminHeader, {
    name: catName + ' Replaced',
    description: 'Completely replaced category description',
    displayOrder: 3,
    status: 'active'
  });

  // 24. API-024: Toggle Material Category Status
  await call('API-024', 'Toggle Category Status', 'PATCH', `/catalog/material-categories/${categoryId}/status`, adminHeader, {
    status: 'inactive'
  });
  // Re-enable to active for materials
  await call('SETUP', 'Re-enable Category', 'PATCH', `/catalog/material-categories/${categoryId}/status`, adminHeader, {
    status: 'active'
  });

  // 25. API-025: Create Material Item
  const matCode = 'MAT-B1-' + Math.floor(1000 + Math.random() * 9000);
  const matRes = await call('API-025', 'Create Material Item', 'POST', '/catalog/materials', adminHeader, {
    materialCode: matCode,
    materialName: 'Olympic Semi-Transparent Wood Stain ' + matCode,
    categoryId: categoryId,
    materialType: 'stain',
    description: 'Waterproof exterior deck stain with UV protection',
    compatibleSurfaces: ['wood'],
    specifications: {
      finishType: 'semi-gloss',
      baseType: 'oil',
      dryingTime: 24,
      recommendedCoats: 2
    },
    coverage: {
      coverageValue: 250,
      coverageAreaUnit: 'square_foot',
      coverageQuantity: 1,
      coverageQuantityUnit: 'gallon'
    },
    cost: {
      unitCost: 49.99,
      currency: 'USD',
      costUnit: 'gallon'
    },
    status: 'active'
  });
  const materialId = matRes.data?.data?.material?.id || matRes.data?.data?.id;

  // 26. API-026: List Materials
  await call('API-026', 'List Materials', 'GET', '/catalog/materials', authHeader);

  // 27. API-027: Get Material by ID
  await call('API-027', 'Get Material by ID', 'GET', `/catalog/materials/${materialId}`, authHeader);

  // 28. API-028: Patch Material
  await call('API-028', 'Patch Material', 'PATCH', `/catalog/materials/${materialId}`, adminHeader, {
    description: 'Patched material description for batch 1 testing',
    cost: {
      unitCost: 52.50,
      currency: 'USD',
      costUnit: 'gallon'
    }
  });

  // 29. API-029: Put (Replace) Material
  await call('API-029', 'Put Material', 'PUT', `/catalog/materials/${materialId}`, adminHeader, {
    materialName: 'Olympic Semi-Transparent Wood Stain (PUT Replaced)',
    categoryId: categoryId,
    materialType: 'stain',
    description: 'Replaced material description via PUT',
    compatibleSurfaces: ['wood', 'composite'],
    specifications: {
      finishType: 'matte',
      baseType: 'acrylic',
      dryingTime: 12,
      recommendedCoats: 2
    },
    coverage: {
      coverageValue: 300,
      coverageAreaUnit: 'square_foot',
      coverageQuantity: 1,
      coverageQuantityUnit: 'gallon'
    },
    cost: {
      unitCost: 54.00,
      currency: 'USD',
      costUnit: 'gallon'
    },
    status: 'active'
  });

  // 30. API-030: Update Material Status
  await call('API-030', 'Update Material Status', 'PATCH', `/catalog/materials/${materialId}/status`, adminHeader, {
    status: 'inactive'
  });

  console.log('\n========================================================================');
  const passed = results.filter(r => r.ok && r.apiId.startsWith('API-')).length;
  const total = results.filter(r => r.apiId.startsWith('API-')).length;
  console.log(`--- BATCH 1 EXECUTION COMPLETE: ${passed} / ${total} APIS PASSED ---`);
  console.log('========================================================================\n');

  return results;
}

testFirst30Apis().catch(console.error);


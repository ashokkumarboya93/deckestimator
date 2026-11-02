// ============================================================================
// Deck Estimator - Batch 2 (APIs 031 - 060) Automated Live HTTP Verification
// ============================================================================

const fs = require('fs');

async function testSecond30Apis() {
  const baseUrl = 'http://localhost:5000/api/v1';
  console.log('========================================================================');
  console.log('--- EXECUTING LIVE HTTP VERIFICATION: API-031 TO API-060 ---');
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

  // --- 1. Authenticate Admin ---
  const adminLogin = await call('SETUP', 'Admin Auth', 'POST', '/auth/login', {}, {
    email: 'admin@deckestimator.com',
    password: 'AdminPass123!'
  });
  const adminToken = adminLogin.data?.data?.token;
  const adminHeader = { 'Authorization': 'Bearer ' + adminToken };

  // --- 2. Authenticate Customer ---
  const custEmail = 'customer_b2_' + Date.now() + '@example.com';
  const custReg = await call('SETUP', 'Customer Reg', 'POST', '/auth/register', {}, {
    fullName: 'Batch2 Customer Tester',
    email: custEmail,
    password: 'SecurePassword123!',
    phone: '+1-555-777-1111',
    role: 'customer'
  });
  const customerToken = custReg.data?.data?.token;
  const custHeader = { 'Authorization': 'Bearer ' + customerToken };

  // --- 3. Create Deck for Customer (Prerequisite for Estimates 055-060) ---
  const deckRes = await call('SETUP', 'Customer Deck', 'POST', '/decks', custHeader, {
    projectName: 'Batch 2 Deck Project ' + Date.now(),
    deckShape: 'rectangle',
    dimensions: { length: 20, width: 15 }
  });
  const deckId = deckRes.data?.data?.deck?.id || deckRes.data?.data?.id;

  // --- 4. Create Material Category & Material (Prerequisite for Compatibilities 043-048 & Estimates) ---
  const matCatRes = await call('SETUP', 'Material Category', 'POST', '/catalog/material-categories', adminHeader, {
    name: 'Batch2 Stains Category ' + Date.now(),
    description: 'Category for batch 2 testing',
    displayOrder: 1,
    status: 'active'
  });
  const matCatId = matCatRes.data?.data?.category?.id || matCatRes.data?.data?.id;

  const matCode = 'MAT-B2-' + Math.floor(1000 + Math.random() * 9000);
  const matRes = await call('SETUP', 'Material Item', 'POST', '/catalog/materials', adminHeader, {
    materialCode: matCode,
    materialName: 'Olympic Maximum Stain ' + matCode,
    categoryId: matCatId,
    materialType: 'stain',
    description: 'Stain material for batch 2 estimates',
    compatibleSurfaces: ['wood'],
    cost: { unitCost: 45.00, currency: 'USD', costUnit: 'gallon' },
    coverage: { coverageValue: 250, coverageAreaUnit: 'square_foot', coverageQuantity: 1, coverageQuantityUnit: 'gallon' },
    status: 'active'
  });
  const materialId = matRes.data?.data?.material?.id || matRes.data?.data?.id;

  // ==========================================================================
  // SERVICE CATEGORIES (API-031 to API-036)
  // ==========================================================================

  // API-031: Create Service Category
  const srvCatName = 'Batch2 Power Washing ' + Date.now();
  const srvCatRes = await call('API-031', 'Create Service Category', 'POST', '/catalog/service-categories', adminHeader, {
    name: srvCatName,
    description: 'High pressure surface preparation and cleaning',
    displayOrder: 1,
    status: 'active'
  });
  const serviceCategoryId = srvCatRes.data?.data?.category?.id || srvCatRes.data?.data?.id;

  // API-032: List Service Categories
  await call('API-032', 'List Service Categories', 'GET', '/catalog/service-categories', custHeader);

  // API-033: Get Service Category by ID
  await call('API-033', 'Get Service Category by ID', 'GET', `/catalog/service-categories/${serviceCategoryId}`, custHeader);

  // API-034: Patch Service Category
  await call('API-034', 'Patch Service Category', 'PATCH', `/catalog/service-categories/${serviceCategoryId}`, adminHeader, {
    description: 'Patched service category description',
    displayOrder: 2
  });

  // API-035: Put Service Category
  await call('API-035', 'Put Service Category', 'PUT', `/catalog/service-categories/${serviceCategoryId}`, adminHeader, {
    name: srvCatName + ' (Replaced)',
    description: 'Fully replaced service category via PUT',
    displayOrder: 3,
    status: 'active'
  });

  // API-036: Update Service Category Status
  await call('API-036', 'Toggle Service Category Status', 'PATCH', `/catalog/service-categories/${serviceCategoryId}/status`, adminHeader, {
    status: 'inactive'
  });
  // Re-enable to active so child services work
  await call('SETUP', 'Re-enable Service Category', 'PATCH', `/catalog/service-categories/${serviceCategoryId}/status`, adminHeader, {
    status: 'active'
  });

  // ==========================================================================
  // SERVICES (API-037 to API-042)
  // ==========================================================================

  // API-037: Create Service Item
  const srvCode = 'SRV-PW-' + Math.floor(1000 + Math.random() * 9000);
  const srvRes = await call('API-037', 'Create Service Item', 'POST', '/catalog/services', adminHeader, {
    serviceCode: srvCode,
    serviceName: 'Deep Pressure Washing & Surface Prep',
    categoryId: serviceCategoryId,
    serviceType: 'cleaning',
    description: 'High pressure cleaning and mold removal',
    measurement: { unit: 'square_foot' },
    operationalDetails: {
      estimatedDuration: 4,
      durationUnit: 'hour',
      laborNotes: '2 technicians required for standard residential deck'
    },
    status: 'active'
  });
  const serviceId = srvRes.data?.data?.service?.id || srvRes.data?.data?.id;

  // API-038: List Services
  await call('API-038', 'List Services', 'GET', '/catalog/services', custHeader);

  // API-039: Get Service by ID
  await call('API-039', 'Get Service by ID', 'GET', `/catalog/services/${serviceId}`, custHeader);

  // API-040: Patch Service
  await call('API-040', 'Patch Service', 'PATCH', `/catalog/services/${serviceId}`, adminHeader, {
    description: 'Updated service operational description',
    operationalDetails: {
      estimatedDuration: 3,
      durationUnit: 'hour'
    }
  });

  // API-041: Put Service
  await call('API-041', 'Put Service', 'PUT', `/catalog/services/${serviceId}`, adminHeader, {
    serviceName: 'Deep Pressure Washing (Replaced via PUT)',
    categoryId: serviceCategoryId,
    serviceType: 'cleaning',
    description: 'Completely replaced service details via PUT',
    measurement: { unit: 'square_foot' },
    operationalDetails: {
      estimatedDuration: 3,
      durationUnit: 'hour'
    },
    status: 'active'
  });

  // API-042: Update Service Status
  await call('API-042', 'Update Service Status', 'PATCH', `/catalog/services/${serviceId}/status`, adminHeader, {
    status: 'inactive'
  });
  // Re-enable to active for compatibility and estimates
  await call('SETUP', 'Re-enable Service Status', 'PATCH', `/catalog/services/${serviceId}/status`, adminHeader, {
    status: 'active'
  });

  // ==========================================================================
  // MATERIAL-SERVICE COMPATIBILITY (API-043 to API-048)
  // ==========================================================================

  // API-043: Create Material-Service Compatibility
  const compRes = await call('API-043', 'Create Compatibility', 'POST', '/catalog/compatibilities', adminHeader, {
    materialId: materialId,
    serviceId: serviceId,
    compatibilityStatus: 'compatible',
    compatibilityNotes: 'Olympic stain is fully compatible with deep pressure washing surface preparation.'
  });
  const compatibilityId = compRes.data?.data?.compatibility?.id || compRes.data?.data?.id;

  // API-044: List Compatibilities
  await call('API-044', 'List Compatibilities', 'GET', '/catalog/compatibilities', custHeader);

  // API-045: Get Compatibility by ID
  await call('API-045', 'Get Compatibility by ID', 'GET', `/catalog/compatibilities/${compatibilityId}`, custHeader);

  // API-046: Patch Compatibility
  await call('API-046', 'Patch Compatibility', 'PATCH', `/catalog/compatibilities/${compatibilityId}`, adminHeader, {
    compatibilityNotes: 'Updated compatibility notes during batch 2 testing.'
  });

  // API-047: Put Compatibility
  await call('API-047', 'Put Compatibility', 'PUT', `/catalog/compatibilities/${compatibilityId}`, adminHeader, {
    compatibilityStatus: 'compatible',
    compatibilityNotes: 'Completely replaced compatibility relationship via PUT.'
  });

  // Create temporary compatibility to delete in API-048 so our primary compatibility remains for estimates
  const tempSrvCode = 'SRV-TMP-' + Math.floor(1000 + Math.random() * 9000);
  const tempSrvRes = await call('SETUP', 'Temp Service for Del', 'POST', '/catalog/services', adminHeader, {
    serviceCode: tempSrvCode,
    serviceName: 'Temporary Service for Deletion Test',
    categoryId: serviceCategoryId,
    serviceType: 'other',
    measurement: { unit: 'fixed_job' }
  });
  const tempSrvId = tempSrvRes.data?.data?.service?.id || tempSrvRes.data?.data?.id;

  const tempCompRes = await call('SETUP', 'Temp Comp for Del', 'POST', '/catalog/compatibilities', adminHeader, {
    materialId: materialId,
    serviceId: tempSrvId,
    compatibilityStatus: 'requires_review'
  });
  const tempCompId = tempCompRes.data?.data?.compatibility?.id || tempCompRes.data?.data?.id;

  // API-048: Delete Compatibility Link
  await call('API-048', 'Delete Compatibility Link', 'DELETE', `/catalog/compatibilities/${tempCompId}`, adminHeader);

  // ==========================================================================
  // PRICING CONFIGURATION (API-049 to API-054)
  // ==========================================================================

  // API-049: Get Active Pricing Configuration
  await call('API-049', 'Get Active Pricing Config', 'GET', '/pricing/configurations/active', custHeader);

  // API-050: Create Pricing Configuration (Admin)
  const priceCfgRes = await call('API-050', 'Create Pricing Config', 'POST', '/pricing/configurations', adminHeader, {
    configurationName: 'Batch 2 Pricing Configuration ' + Date.now(),
    minimumJobPrice: 250,
    basePricePerSqFt: 3.50,
    additionalCoatingPrice: 1.25,
    travelCharge: 45.00,
    laborRate: 65.00,
    wastePercentage: 10,
    taxPercentage: 8.25,
    taxName: 'State Sales Tax',
    isActive: true,
    notes: 'Configured for batch 2 automated estimation testing'
  });
  const pricingConfigId = priceCfgRes.data?.data?.configuration?.id || priceCfgRes.data?.data?.id;

  // API-051: List Pricing Configurations
  await call('API-051', 'List Pricing Configurations', 'GET', '/pricing/configurations', adminHeader);

  // API-052: Get Pricing Configuration by ID
  await call('API-052', 'Get Pricing Config by ID', 'GET', `/pricing/configurations/${pricingConfigId}`, adminHeader);

  // API-053: Patch Pricing Configuration
  await call('API-053', 'Patch Pricing Config', 'PATCH', `/pricing/configurations/${pricingConfigId}`, adminHeader, {
    basePricePerSqFt: 3.75,
    minimumJobPrice: 275
  });

  // API-054: Toggle Pricing Configuration Status
  await call('API-054', 'Toggle Pricing Config Status', 'PATCH', `/pricing/configurations/${pricingConfigId}/status`, adminHeader, {
    isActive: true
  });

  // ==========================================================================
  // ESTIMATES & PRICING ENGINE (API-055 to API-060)
  // ==========================================================================

  // API-055: Create & Calculate Pricing Estimate
  const estRes = await call('API-055', 'Create & Calculate Estimate', 'POST', '/estimates', custHeader, {
    deckId: deckId,
    estimateName: 'Comprehensive Restoration Estimate ' + Date.now(),
    materialIds: [materialId],
    serviceIds: [serviceId],
    numberOfCoats: 2,
    notes: 'Customer generated estimate during batch 2 testing'
  });
  const estimateId = estRes.data?.data?.estimate?.id || estRes.data?.data?.id;

  // API-056: List Estimates
  await call('API-056', 'List Estimates', 'GET', '/estimates', custHeader);

  // API-057: Get Estimate by ID
  await call('API-057', 'Get Estimate by ID', 'GET', `/estimates/${estimateId}`, custHeader);

  // API-058: Recalculate Estimate (Revision)
  await call('API-058', 'Recalculate Estimate', 'POST', `/estimates/${estimateId}/recalculate`, custHeader, {
    materialIds: [materialId],
    serviceIds: [serviceId],
    revisionReason: 'Recalculated with updated square footage',
    notes: 'Updated revision notes'
  });

  // API-059: Get Estimate Audit History
  await call('API-059', 'Get Estimate History', 'GET', `/estimates/${estimateId}/history`, custHeader);

  // API-060: Update Estimate Status
  await call('API-060', 'Update Estimate Status', 'PATCH', `/estimates/${estimateId}/status`, custHeader, {
    estimateStatus: 'SUBMITTED',
    notes: 'Customer submitted estimate to contractors'
  });

  console.log('\n========================================================================');
  const passed = results.filter(r => r.ok && r.apiId.startsWith('API-')).length;
  const total = results.filter(r => r.apiId.startsWith('API-')).length;
  console.log(`--- BATCH 2 EXECUTION COMPLETE: ${passed} / ${total} APIS PASSED ---`);
  console.log('========================================================================\n');

  return results;
}

testSecond30Apis().catch(console.error);


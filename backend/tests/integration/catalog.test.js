// =============================================
// Deck Estimator — Catalog Management Tests (Phase 5)
// =============================================

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const User = require('../../src/modules/users/users.model');
const AuditLog = require('../../src/shared/models/auditLog.model');
const MaterialCategory = require('../../src/modules/catalogs/materialCategory.model');
const Material = require('../../src/modules/catalogs/material.model');
const ServiceCategory = require('../../src/modules/catalogs/serviceCategory.model');
const Service = require('../../src/modules/catalogs/service.model');
const MaterialServiceCompatibility = require('../../src/modules/catalogs/materialServiceCompatibility.model');
const { ROLES } = require('../../src/shared/constants');

describe('Phase 5 — Material & Service Catalog Management', () => {
  let mongoServer;
  let server;
  let baseUrl;
  let adminToken;
  let customerToken;
  let contractorToken;

  let createdMaterialCategoryId;
  let createdMaterialId;
  let createdServiceCategoryId;
  let createdServiceId;
  let createdCompatibilityId;

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

    // 1. Register Customer
    const custRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Customer Chris',
        email: 'chris.catalog@deckestimator.com',
        password: 'Password123!',
        role: ROLES.CUSTOMER,
        phone: '1234567890',
      }),
    });
    const custData = await custRes.json();
    customerToken = custData.data.token;

    // 2. Register Contractor
    const contRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Contractor Carl',
        email: 'carl.catalog@deckestimator.com',
        password: 'Password123!',
        role: ROLES.CONTRACTOR,
        phone: '1234567891',
        businessName: 'Carl Deck Works',
        licenseNumber: 'LIC-CARL-001',
      }),
    });
    const contData = await contRes.json();
    contractorToken = contData.data.token;

    // 3. Register Admin User
    const adminReg = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Catalog Master Admin',
        email: 'superadmin.catalog@deckestimator.com',
        password: 'Password123!',
        role: ROLES.CUSTOMER,
        phone: '1234567899',
      }),
    });
    const adminRegData = await adminReg.json();
    const adminUserId = adminRegData.data.user.id;

    await User.findByIdAndUpdate(adminUserId, { role: ROLES.ADMIN });

    // Login to get token with ADMIN role
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin.catalog@deckestimator.com',
        password: 'Password123!',
      }),
    });
    const adminLoginData = await adminLoginRes.json();
    adminToken = adminLoginData.data.token;
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  // =============================================
  // 1. MATERIAL CATEGORIES
  // =============================================
  describe('Material Categories API', () => {
    it('Admin can create a new material category', async () => {
      const res = await fetch(`${baseUrl}/catalog/material-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'Decking Boards & Planks',
          description: 'Wood and composite decking planks',
          displayOrder: 1,
        }),
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.category.name, 'Decking Boards & Planks');
      assert.equal(json.data.category.slug, 'decking-boards-planks');
      assert.equal(json.data.category.status, 'active');
      createdMaterialCategoryId = json.data.category.id;
    });

    it('Duplicate material category name returns 409 Conflict', async () => {
      const res = await fetch(`${baseUrl}/catalog/material-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'decking boards & planks',
          description: 'Duplicate test',
        }),
      });

      assert.equal(res.status, 409);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.ok(json.error.message.includes('already exists'));
    });

    it('Customer cannot create material category (403 Forbidden)', async () => {
      const res = await fetch(`${baseUrl}/catalog/material-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          name: 'Customer Category',
        }),
      });

      assert.equal(res.status, 403);
    });

    it('Contractor cannot create material category (403 Forbidden)', async () => {
      const res = await fetch(`${baseUrl}/catalog/material-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${contractorToken}`,
        },
        body: JSON.stringify({
          name: 'Contractor Category',
        }),
      });

      assert.equal(res.status, 403);
    });

    it('Admin can update a material category', async () => {
      const res = await fetch(
        `${baseUrl}/catalog/material-categories/${createdMaterialCategoryId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            description: 'Updated premium planks and wood deck boards',
            displayOrder: 5,
          }),
        }
      );

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(
        json.data.category.description,
        'Updated premium planks and wood deck boards'
      );
      assert.equal(json.data.category.displayOrder, 5);
    });

    it('Admin can toggle material category status', async () => {
      const res = await fetch(
        `${baseUrl}/catalog/material-categories/${createdMaterialCategoryId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ status: 'inactive' }),
        }
      );

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.data.category.status, 'inactive');

      // Revert back to active
      await fetch(
        `${baseUrl}/catalog/material-categories/${createdMaterialCategoryId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ status: 'active' }),
        }
      );
    });

    it('List material categories includes material count', async () => {
      const res = await fetch(`${baseUrl}/catalog/material-categories`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(Array.isArray(json.data.categories));
      const found = json.data.categories.find((c) => c.id === createdMaterialCategoryId);
      assert.ok(found);
      assert.equal(typeof found.materialsCount, 'number');
    });
  });

  // =============================================
  // 2. MATERIALS
  // =============================================
  describe('Materials API', () => {
    it('Admin can create a new material with comprehensive specs', async () => {
      const res = await fetch(`${baseUrl}/catalog/materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          materialName: 'Olympic Maximum Stain & Sealant in One',
          materialCode: 'OLY-MAX-001',
          categoryId: createdMaterialCategoryId,
          materialType: 'stain',
          brandName: 'Olympic Maximum',
          productName: 'Olympic Maximum Semi-Transparent Stain',
          compatibleSurfaces: ['wood'],
          measurement: {
            quantityUnit: 'gallon',
          },
          cost: {
            unitCost: 48.98,
            currency: 'USD',
            costUnit: 'gallon',
          },
          coverage: {
            coverageValue: 300,
            coverageAreaUnit: 'square_foot',
            coverageQuantity: 1,
            coverageQuantityUnit: 'gallon',
          },
          specifications: {
            finishType: 'Semi-Transparent',
            dryingTime: 24,
            recommendedCoats: 2,
            uvResistance: true,
            waterResistance: true,
          },
        }),
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.material.materialName, 'Olympic Maximum Stain & Sealant in One');
      assert.equal(json.data.material.materialCode, 'OLY-MAX-001');
      assert.equal(json.data.material.cost.unitCost, 48.98);
      assert.equal(json.data.material.coverage.coverageValue, 300);
      assert.equal(json.data.material.specifications.finishType, 'Semi-Transparent');
      assert.equal(json.data.material.status, 'active');
      createdMaterialId = json.data.material.id;
    });

    it('Duplicate materialCode returns 409 Conflict', async () => {
      const res = await fetch(`${baseUrl}/catalog/materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          materialName: 'Another Olympic Stain',
          materialCode: 'OLY-MAX-001',
          categoryId: createdMaterialCategoryId,
          materialType: 'stain',
        }),
      });

      assert.equal(res.status, 409);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.ok(json.error.message.includes('already exists'));
    });

    it('Invalid categoryId returns 400 Bad Request', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const res = await fetch(`${baseUrl}/catalog/materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          materialName: 'Test Invalid Category',
          categoryId: nonExistentId,
          materialType: 'paint',
        }),
      });

      assert.equal(res.status, 400);
      const json = await res.json();
      assert.ok(json.error.message.includes('does not exist'));
    });

    it('Non-admin cannot create material (403 Forbidden)', async () => {
      const res = await fetch(`${baseUrl}/catalog/materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          materialName: 'Unauthorized Material',
          categoryId: createdMaterialCategoryId,
          materialType: 'stain',
        }),
      });

      assert.equal(res.status, 403);
    });

    it('Admin can update material details and cost', async () => {
      const res = await fetch(`${baseUrl}/catalog/materials/${createdMaterialId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          cost: {
            unitCost: 51.5,
          },
          description: 'Updated formula with enhanced UV blockers',
        }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.data.material.cost.unitCost, 51.5);
      assert.equal(
        json.data.material.description,
        'Updated formula with enhanced UV blockers'
      );
    });

    it('Attempting to update materialCode is forbidden by validation', async () => {
      const res = await fetch(`${baseUrl}/catalog/materials/${createdMaterialId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          materialCode: 'NEW-CODE-999',
        }),
      });

      assert.equal(res.status, 400);
    });

    it('Admin can toggle material status', async () => {
      const res = await fetch(
        `${baseUrl}/catalog/materials/${createdMaterialId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ status: 'inactive' }),
        }
      );

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.data.material.status, 'inactive');

      // Revert to active
      await fetch(
        `${baseUrl}/catalog/materials/${createdMaterialId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ status: 'active' }),
        }
      );
    });

    it('Get materials supports search and filter', async () => {
      const res = await fetch(
        `${baseUrl}/catalog/materials?search=Olympic&materialType=stain`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(json.data.materials.length >= 1);
      assert.equal(json.data.materials[0].id, createdMaterialId);
    });
  });

  // =============================================
  // 3. SERVICE CATEGORIES
  // =============================================
  describe('Service Categories API', () => {
    it('Admin can create a new service category', async () => {
      const res = await fetch(`${baseUrl}/catalog/service-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'Surface Preparation & Power Washing',
          description: 'High-pressure cleaning, degreasing, and chemical stripping',
          displayOrder: 1,
        }),
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.category.name, 'Surface Preparation & Power Washing');
      assert.equal(json.data.category.slug, 'surface-preparation-power-washing');
      createdServiceCategoryId = json.data.category.id;
    });

    it('Duplicate service category returns 409 Conflict', async () => {
      const res = await fetch(`${baseUrl}/catalog/service-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'surface preparation & power washing',
        }),
      });

      assert.equal(res.status, 409);
    });

    it('Non-admin cannot create service category (403 Forbidden)', async () => {
      const res = await fetch(`${baseUrl}/catalog/service-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          name: 'Customer Category Test',
        }),
      });

      assert.equal(res.status, 403);
    });

    it('List service categories includes service count', async () => {
      const res = await fetch(`${baseUrl}/catalog/service-categories`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(Array.isArray(json.data.categories));
      const found = json.data.categories.find((c) => c.id === createdServiceCategoryId);
      assert.ok(found);
      assert.equal(typeof found.servicesCount, 'number');
    });
  });

  // =============================================
  // 4. SERVICES
  // =============================================
  describe('Services API', () => {
    it('Admin can create a new service', async () => {
      const res = await fetch(`${baseUrl}/catalog/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          serviceName: 'Pressure Washing & Deep Cleaning',
          serviceCode: 'SRV-PW-001',
          categoryId: createdServiceCategoryId,
          serviceType: 'cleaning',
          description: 'Complete deck wash removing algae, dirt, and loose mill glaze',
          measurement: {
            unit: 'square_foot',
          },
          operationalDetails: {
            estimatedDuration: 1.5,
            durationUnit: 'hour',
            requiredEquipment: ['Commercial Pressure Washer', 'Surface Cleaner Disc'],
            safetyNotes: 'Safety Goggles and Slip-resistant Boots required',
          },
        }),
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.service.serviceName, 'Pressure Washing & Deep Cleaning');
      assert.equal(json.data.service.serviceCode, 'SRV-PW-001');
      assert.equal(json.data.service.serviceType, 'cleaning');
      assert.equal(json.data.service.measurement.unit, 'square_foot');
      createdServiceId = json.data.service.id;
    });

    it('Duplicate serviceCode returns 409 Conflict', async () => {
      const res = await fetch(`${baseUrl}/catalog/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          serviceName: 'Another Pressure Wash Service',
          serviceCode: 'SRV-PW-001',
          categoryId: createdServiceCategoryId,
          serviceType: 'cleaning',
        }),
      });

      assert.equal(res.status, 409);
    });

    it('Admin can update service operational details', async () => {
      const res = await fetch(`${baseUrl}/catalog/services/${createdServiceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          description: 'Updated comprehensive deep cleaning service',
          operationalDetails: {
            estimatedDuration: 2.0,
            durationUnit: 'hour',
            requiredEquipment: ['Commercial Pressure Washer', 'Rotary Surface Disc'],
            safetyNotes: 'Full PPE required',
          },
        }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(
        json.data.service.description,
        'Updated comprehensive deep cleaning service'
      );
      assert.equal(json.data.service.operationalDetails.estimatedDuration, 2.0);
    });

    it('Non-admin cannot update service (403 Forbidden)', async () => {
      const res = await fetch(`${baseUrl}/catalog/services/${createdServiceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({ description: 'Unauthorized change' }),
      });

      assert.equal(res.status, 403);
    });
  });

  // =============================================
  // 5. MATERIAL-SERVICE COMPATIBILITY
  // =============================================
  describe('Material-Service Compatibility API', () => {
    it('Admin can link a material and service with compatibility status', async () => {
      const res = await fetch(`${baseUrl}/catalog/compatibilities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          materialId: createdMaterialId,
          serviceId: createdServiceId,
          compatibilityStatus: 'compatible',
          compatibilityNotes: 'Recommended: wash deck thoroughly and allow 48h drying before Olympic stain application.',
        }),
      });

      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.compatibility.compatibilityStatus, 'compatible');
      assert.equal(json.data.compatibility.materialId.id, createdMaterialId);
      assert.equal(json.data.compatibility.serviceId.id, createdServiceId);
      createdCompatibilityId = json.data.compatibility.id;
    });

    it('Duplicate compatibility link returns 409 Conflict', async () => {
      const res = await fetch(`${baseUrl}/catalog/compatibilities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          materialId: createdMaterialId,
          serviceId: createdServiceId,
          compatibilityStatus: 'compatible',
        }),
      });

      assert.equal(res.status, 409);
      const json = await res.json();
      assert.ok(json.error.message.toLowerCase().includes('already exists'));
    });

    it('Admin can update compatibility status and notes', async () => {
      const res = await fetch(
        `${baseUrl}/catalog/compatibilities/${createdCompatibilityId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            compatibilityStatus: 'requires_review',
            compatibilityNotes: 'Ensure deck moisture level is below 15% before application.',
          }),
        }
      );

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(
        json.data.compatibility.compatibilityStatus,
        'requires_review'
      );
      assert.equal(
        json.data.compatibility.compatibilityNotes,
        'Ensure deck moisture level is below 15% before application.'
      );
    });

    it('Get compatibilities returns populated material and service objects', async () => {
      const res = await fetch(`${baseUrl}/catalog/compatibilities`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(json.data.compatibilities.length >= 1);
      const item = json.data.compatibilities.find((c) => c.id === createdCompatibilityId);
      assert.ok(item);
      assert.equal(item.materialId.materialName, 'Olympic Maximum Stain & Sealant in One');
      assert.equal(item.serviceId.serviceName, 'Pressure Washing & Deep Cleaning');
    });

    it('Customer cannot delete compatibility (403 Forbidden)', async () => {
      const res = await fetch(
        `${baseUrl}/catalog/compatibilities/${createdCompatibilityId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${customerToken}`,
          },
        }
      );

      assert.equal(res.status, 403);
    });

    it('Admin can delete compatibility link', async () => {
      const res = await fetch(
        `${baseUrl}/catalog/compatibilities/${createdCompatibilityId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(json.data.message.includes('deleted successfully'));

      // Verify deletion
      const verifyRes = await fetch(
        `${baseUrl}/catalog/compatibilities/${createdCompatibilityId}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      assert.equal(verifyRes.status, 404);
    });
  });

  // =============================================
  // 6. AUDIT LOGGING
  // =============================================
  describe('Audit Logging Verification', () => {
    it('Administrative operations recorded entries in auditLogs', async () => {
      const logs = await AuditLog.find({
        action: {
          $in: [
            'CREATE_MATERIAL_CATEGORY',
            'CREATE_MATERIAL',
            'CREATE_SERVICE_CATEGORY',
            'CREATE_SERVICE',
            'CREATE_COMPATIBILITY',
            'DELETE_COMPATIBILITY',
          ],
        },
      });

      assert.ok(logs.length >= 5, `Expected at least 5 audit logs, found ${logs.length}`);
      const actions = logs.map((l) => l.action);
      assert.ok(actions.includes('CREATE_MATERIAL_CATEGORY'));
      assert.ok(actions.includes('CREATE_MATERIAL'));
      assert.ok(actions.includes('CREATE_SERVICE_CATEGORY'));
      assert.ok(actions.includes('CREATE_SERVICE'));
      assert.ok(actions.includes('CREATE_COMPATIBILITY'));
    });
  });
});

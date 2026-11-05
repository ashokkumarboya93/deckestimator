// =============================================
// Deck Estimator — Comprehensive Admin Portal Seed Script
// =============================================

require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');

const User = require('../src/modules/users/users.model');
const ContractorProfile = require('../src/modules/contractors/contractorProfile.model');
const Deck = require('../src/modules/decks/deck.model');
const Estimate = require('../src/modules/estimates/estimate.model');
const Lead = require('../src/modules/leads/lead.model');
const Material = require('../src/modules/catalogs/material.model');
const MaterialCategory = require('../src/modules/catalogs/materialCategory.model');
const Service = require('../src/modules/catalogs/service.model');
const ServiceCategory = require('../src/modules/catalogs/serviceCategory.model');
const PricingConfiguration = require('../src/modules/pricing/pricingConfiguration.model');
const DiscountPolicy = require('../src/modules/discounts/discountPolicy.model');
const DiscountAssignment = require('../src/modules/discounts/discountAssignment.model');
const DiscountAuditLog = require('../src/modules/discounts/discountAuditLog.model');
const VerificationHistory = require('../src/modules/contractors/verificationHistory.model');
const PlatformSetting = require('../src/modules/admin/platformSetting.model');
const Project = require('../src/modules/admin/project.model');
const { EstimatorField, EstimatorDependency } = require('../src/modules/admin/estimatorConfig.model');
const { CatalogProduct, CatalogSubstrate, CatalogCoverageRate } = require('../src/modules/admin/catalogExtended.model');
const PermissionsPolicy = require('../src/modules/admin/permissionsPolicy.model');
const AuditLog = require('../src/shared/models/auditLog.model');

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB successfully.');

  // 1. Ensure Admin User
  let admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    const passwordHash = await User.hashPassword('Admin@123456');
    admin = await User.create({
      fullName: 'System Administrator',
      email: 'admin@deckestimator.com',
      passwordHash,
      role: 'admin',
      accountStatus: 'active',
      phone: '+1 555 123 4567',
    });
    console.log('Created admin account: admin@deckestimator.com / Admin@123456');
  } else {
    admin.passwordHash = await User.hashPassword('Admin@123456');
    admin.accountStatus = 'active';
    admin.phone = admin.phone || '+1 555 123 4567';
    await admin.save();
    console.log('Admin account ready: admin@deckestimator.com / Admin@123456');
  }

  // 2. Fetch or create Customers & Contractors
  let customer = await User.findOne({ role: 'customer' });
  if (!customer) {
    const pwd = await User.hashPassword('Customer@123');
    customer = await User.create({
      fullName: 'John Smith',
      email: 'john.smith@example.com',
      passwordHash: pwd,
      role: 'customer',
      accountStatus: 'active',
      phone: '+1 555 234 5678',
    });
  }

  let contractorUser = await User.findOne({ role: 'contractor' });
  if (!contractorUser) {
    const pwd = await User.hashPassword('Contractor@123');
    contractorUser = await User.create({
      fullName: 'David Miller',
      email: 'david.miller@example.com',
      passwordHash: pwd,
      role: 'contractor',
      accountStatus: 'active',
      phone: '+1 555 345 6789',
    });
  }

  // Ensure contractor profile exists
  let contractorProfile = await ContractorProfile.findOne({ userId: contractorUser._id });
  if (!contractorProfile) {
    contractorProfile = await ContractorProfile.create({
      userId: contractorUser._id,
      businessName: 'Miller Custom Decks & Restoration',
      businessEmail: contractorUser.email,
      businessPhone: contractorUser.phone,
      licenseNumber: 'TX-DECK-88921',
      licenseJurisdiction: 'Texas State Board',
      verificationStatus: 'approved',
      approvedAt: new Date(),
      reviewedBy: admin._id,
    });
  }

  // 3. Seed Pricing Configuration with Calculator Values from Spec
  let pricingConfig = await PricingConfiguration.findOne({ isActive: true });
  const defaultPricing = {
    configurationName: 'DECK PRO Live Calculator Configuration',
    minimumJobPrice: 500,
    basePricePerSqFt: 3.5,
    additionalCoatingPrice: 0.85,
    travelCharge: 75,
    laborRate: 75,
    wastePercentage: 10,
    taxPercentage: 8.25,
    taxName: 'Sales Tax',
    isActive: true,
    createdBy: admin._id,
    calculatorPricing: {
      materialCosts: [
        { name: 'Stain', price: 46, unit: 'Gallon' },
        { name: 'Stripper', price: 38, unit: 'Gallon' },
        { name: 'Brightener', price: 28, unit: 'Gallon' },
        { name: 'Cleaner', price: 32, unit: 'Gallon' },
      ],
      laborAndProductivity: {
        laborBillingRate: 75,
        floorProductionRate: 50,
        maintenancePercentage: 70,
      },
      adjustmentFactors: {
        woodSpecies: [
          { name: 'Pressure Treated Pine', laborMultiplier: 1.0, coverage: 175 },
          { name: 'Cedar', laborMultiplier: 1.1, coverage: 150 },
          { name: 'Redwood', laborMultiplier: 1.1, coverage: 160 },
          { name: 'Mahogany / Meranti', laborMultiplier: 1.2, coverage: 225 },
          { name: 'Garapa / Tigerwood', laborMultiplier: 1.3, coverage: 275 },
          { name: 'Ipe / Cumaru / Massaranduba', laborMultiplier: 1.35, coverage: 350 },
          { name: 'Composite', laborMultiplier: 0.45, coverage: 'N/A' },
        ],
        accessConditions: [
          { name: 'Ground Level', multiplier: 1.0 },
          { name: 'Elevated, One Story', multiplier: 1.15 },
          { name: 'Second Story', multiplier: 1.35 },
          { name: 'Staging or Roof Work', multiplier: 1.6 },
        ],
        coatingConditions: [
          { name: 'Bare or Weathered Gray', multiplier: 1.0 },
          { name: 'Maintained Penetrating Stain', multiplier: 0.7 },
          { name: 'Oil Penetrating, One Coat', multiplier: 1.3 },
          { name: 'Oil, Heavy Build-up', multiplier: 1.9 },
          { name: 'Film-former', multiplier: 2.2 },
          { name: 'Solid Stain or Paint', multiplier: 2.8 },
          { name: 'Unknown or Mixed', multiplier: 2.2 },
        ],
        surfaceConditions: [
          { name: 'Heavy Mildew', factorPercentage: 15 },
          { name: 'Tannin or Rust Bleed', factorPercentage: 10 },
          { name: 'Pressure Damage / Furring', factorPercentage: 20 },
          { name: 'Mill Glaze, New Wood', factorPercentage: 5 },
        ],
      },
      quoteSettings: {
        baseVariationPercentage: 12,
        mediumConfidenceVariation: 8,
        lowConfidenceVariation: 20,
      },
    },
  };

  if (!pricingConfig) {
    pricingConfig = await PricingConfiguration.create(defaultPricing);
    console.log('Seeded live pricing configuration.');
  } else if (!pricingConfig.calculatorPricing || !pricingConfig.calculatorPricing.materialCosts?.length) {
    pricingConfig.calculatorPricing = defaultPricing.calculatorPricing;
    await pricingConfig.save();
    console.log('Updated pricing configuration with calculatorPricing fields.');
  }

  // 4. Seed Default 10% Contractor Discount Policy
  let defaultPolicy = await DiscountPolicy.findOne({ code: 'CONTRACTOR_DEFAULT_10' });
  if (!defaultPolicy) {
    defaultPolicy = await DiscountPolicy.create({
      name: 'Default Contractor Discount (10%)',
      code: 'CONTRACTOR_DEFAULT_10',
      description: 'Standard 10% platform discount applied to eligible contractor estimates.',
      discountType: 'percentage',
      discountValue: 10,
      status: 'active',
      createdBy: admin._id,
      notes: 'Global default applied to contractors without individual custom rules.',
    });
    console.log('Seeded default 10% contractor discount policy.');
  }

  // Seed sample discount audit log
  const existingAudit = await DiscountAuditLog.countDocuments();
  if (existingAudit === 0) {
    await DiscountAuditLog.create([
      {
        contractorId: contractorUser._id,
        contractorName: contractorUser.fullName,
        previousDiscount: 10,
        newDiscount: 15,
        discountType: 'individual',
        reason: 'Consistently completed 25+ projects with excellent ratings',
        updatedBy: admin._id,
        updatedByName: 'Admin User',
      },
      {
        contractorId: null,
        contractorName: 'All Contractors (Default)',
        previousDiscount: 8,
        newDiscount: 10,
        discountType: 'default',
        reason: 'Platform promotion policy standard adjustment',
        updatedBy: admin._id,
        updatedByName: 'Admin User',
      },
    ]);
  }

  // 5. Seed Estimator Configuration (Input Fields and Dependencies)
  const fieldsCount = await EstimatorField.countDocuments();
  if (fieldsCount === 0) {
    await EstimatorField.create([
      { fieldName: 'Deck Length', displayLabel: 'Deck Length', inputType: 'Number', unit: 'ft', required: true, section: 'Dimensions', order: 1, status: 'active' },
      { fieldName: 'Deck Width', displayLabel: 'Deck Width', inputType: 'Number', unit: 'ft', required: true, section: 'Dimensions', order: 2, status: 'active' },
      { fieldName: 'Deck Height', displayLabel: 'Deck Height', inputType: 'Number', unit: 'ft', required: false, section: 'Dimensions', order: 3, status: 'active' },
      { fieldName: 'Deck Material', displayLabel: 'Deck Material', inputType: 'Dropdown', unit: 'none', required: true, section: 'Materials', options: ['Composite', 'Wood', 'Cedar', 'Redwood'], order: 4, status: 'active' },
      { fieldName: 'Deck Shape', displayLabel: 'Deck Shape', inputType: 'Dropdown', unit: 'none', required: true, section: 'Dimensions', options: ['Rectangle', 'Square', 'L-Shaped', 'Multi-Level'], order: 5, status: 'active' },
      { fieldName: 'Railing Type', displayLabel: 'Railing Type', inputType: 'Dropdown', unit: 'none', required: true, section: 'Components', options: ['Wood Railing', 'Aluminum Railing', 'Cable Railing', 'None'], order: 6, status: 'active' },
    ]);
    console.log('Seeded estimator input fields.');
  }

  const depsCount = await EstimatorDependency.countDocuments();
  if (depsCount === 0) {
    await EstimatorDependency.create([
      { parentField: 'Deck Material', condition: 'equals', value: 'Composite', showField: 'Composite Product Options', status: 'active' },
      { parentField: 'Deck Material', condition: 'equals', value: 'Wood', showField: 'Wood Product Options', status: 'active' },
      { parentField: 'Railing Type', condition: 'not_equals', value: 'None', showField: 'Railing Length (ft)', status: 'active' },
    ]);
    console.log('Seeded estimator dependencies.');
  }

  // 6. Seed Catalog Items (Materials, Products & Finishes, Substrates, Services, Coverage Rates)
  let materialCat = await MaterialCategory.findOne();
  if (!materialCat) {
    materialCat = await MaterialCategory.create({
      categoryName: 'Decking Lumber & Composites',
      categoryCode: 'DECK_LUMBER',
      description: 'Primary structural and decking surface materials',
      status: 'active',
      createdBy: admin._id,
    });
  }

  const matCount = await Material.countDocuments();
  if (matCount === 0) {
    await Material.create([
      {
        materialName: 'Composite Decking',
        materialCode: 'MAT-COMP-01',
        description: 'Durable, low-maintenance engineered composite boards resistant to mold and UV fading.',
        categoryId: materialCat._id,
        materialType: 'coating',
        productImage: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=400&q=80',
        status: 'active',
        unit: 'SQ_FT',
        pricePerUnit: 8.75,
        coveragePerUnit: 12,
        createdBy: admin._id,
      },
      {
        materialName: 'Cedar Wood',
        materialCode: 'MAT-CEDAR-02',
        description: 'Natural Western Red Cedar lumber offering natural resistance to decay and rich grain warmth.',
        categoryId: materialCat._id,
        materialType: 'other',
        productImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
        status: 'active',
        unit: 'SQ_FT',
        pricePerUnit: 6.5,
        coveragePerUnit: 10,
        createdBy: admin._id,
      },
      {
        materialName: 'Pressure Treated Pine',
        materialCode: 'MAT-PTP-03',
        description: 'Heavy-duty preservative-treated southern yellow pine suited for footings and budget decking.',
        categoryId: materialCat._id,
        materialType: 'other',
        productImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80',
        status: 'active',
        unit: 'SQ_FT',
        pricePerUnit: 4.5,
        coveragePerUnit: 8,
        createdBy: admin._id,
      },
    ]);
    console.log('Seeded catalog materials.');
  }

  const prodCount = await CatalogProduct.countDocuments();
  if (prodCount === 0) {
    await CatalogProduct.create([
      {
        productName: 'Premium Composite Board',
        materialCategory: 'Composite Decking',
        description: 'High-end capped composite plank with realistic woodgrain embossing.',
        productImage: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=400&q=80',
        finishes: [
          { name: 'Espresso Brown', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=300&q=80', status: 'active' },
          { name: 'Slate Grey', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=80', status: 'active' },
          { name: 'Natural Teak', image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=300&q=80', status: 'active' },
        ],
        status: 'active',
      },
      {
        productName: 'Cedar Plank Select',
        materialCategory: 'Cedar Wood',
        description: 'Hand-selected architectural clear cedar boards with smooth milled finish.',
        productImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
        finishes: [
          { name: 'Clear Natural Oil', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=80', status: 'active' },
          { name: 'Redwood Tint Stain', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=300&q=80', status: 'active' },
        ],
        status: 'active',
      },
    ]);
    console.log('Seeded catalog products with finishes.');
  }

  const subCount = await CatalogSubstrate.countDocuments();
  if (subCount === 0) {
    await CatalogSubstrate.create([
      {
        substrateName: 'Concrete Patio Base',
        description: 'Level solid poured concrete slab suitable for low-profile sleeper decking.',
        substrateImage: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80',
        status: 'active',
      },
      {
        substrateName: 'Compacted Soil / Ground',
        description: 'Natural earthen sub-base requiring concrete pier footings and weed barrier.',
        substrateImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80',
        status: 'active',
      },
      {
        substrateName: 'Existing Wooden Frame',
        description: 'Pre-existing structural joists and beam framing requiring resurfacing.',
        substrateImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80',
        status: 'active',
      },
    ]);
    console.log('Seeded catalog substrates.');
  }

  let serviceCat = await ServiceCategory.findOne();
  if (!serviceCat) {
    serviceCat = await ServiceCategory.create({
      categoryName: 'Restoration Services',
      categoryCode: 'RESTORATION',
      description: 'Deck cleaning, restoration, and structural installation',
      status: 'active',
      createdBy: admin._id,
    });
  }

  const srvCount = await Service.countDocuments();
  if (srvCount === 0) {
    await Service.create([
      {
        serviceName: 'Deck Installation',
        serviceCode: 'SRV-INSTALL-01',
        description: 'Full layout framing and surface board laying with hidden fastener systems.',
        categoryId: serviceCat._id,
        serviceType: 'labor',
        rate: {
          rateType: 'hourly',
          baseRate: 75,
          unitCost: 75,
          rateUnit: 'hour',
          currency: 'USD',
        },
        unitPrice: 75,
        unit: 'HOUR',
        productImage: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=400&q=80',
        status: 'active',
        createdBy: admin._id,
      },
      {
        serviceName: 'Pressure Wash & Brighten',
        serviceCode: 'SRV-WASH-02',
        description: 'Deep fiber cleaning to remove gray oxidation, mold, and chemical residue.',
        categoryId: serviceCat._id,
        serviceType: 'surface_preparation',
        rate: {
          rateType: 'fixed',
          baseRate: 1.25,
          unitCost: 1.25,
          rateUnit: 'sq_ft',
          currency: 'USD',
        },
        unitPrice: 1.25,
        unit: 'SQ_FT',
        productImage: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80',
        status: 'active',
        createdBy: admin._id,
      },
    ]);
    console.log('Seeded catalog services.');
  }

  const covCount = await CatalogCoverageRate.countDocuments();
  if (covCount === 0) {
    await CatalogCoverageRate.create([
      { productName: 'Premium Composite Board', materialCategory: 'Composite Decking', coverageRate: 10, unit: 'Sq. ft.', productImage: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=300&q=80', status: 'active' },
      { productName: 'Cedar Plank Select', materialCategory: 'Cedar Wood', coverageRate: 8, unit: 'Sq. ft.', productImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=80', status: 'active' },
      { productName: 'Standard Stripper Chemical', materialCategory: 'Chemicals', coverageRate: 150, unit: 'Sq. ft. / Gallon', productImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=300&q=80', status: 'active' },
    ]);
    console.log('Seeded catalog coverage rates.');
  }

  // 7. Seed Projects with Real Progress Tracking
  const projectCount = await Project.countDocuments();
  if (projectCount === 0) {
    await Project.create([
      {
        projectId: 'PRJ-102',
        projectName: 'Backyard Deck Restoration',
        customerId: customer._id,
        contractorId: contractorUser._id,
        status: 'in_progress',
        progress: 60,
        deckSize: '450 sq ft',
        location: { street: '4200 River Oak Way', city: 'Austin', state: 'TX', zipCode: '78701' },
        startDate: new Date(Date.now() - 14 * 86400000),
        expectedCompletionDate: new Date(Date.now() + 10 * 86400000),
        notes: 'Stripping completed. Surface brightener dried. Ready for dual-coat penetrating oil stain.',
        progressHistory: [
          { previousProgress: 0, newProgress: 25, previousStatus: 'pending', newStatus: 'in_progress', notes: 'Site survey and pressure washing begun', updatedBy: admin._id, updatedAt: new Date(Date.now() - 10 * 86400000) },
          { previousProgress: 25, newProgress: 60, previousStatus: 'in_progress', newStatus: 'in_progress', notes: 'Sanding and chemical stripping complete', updatedBy: admin._id, updatedAt: new Date(Date.now() - 2 * 86400000) },
        ],
        lastUpdatedBy: admin._id,
      },
      {
        projectId: 'PRJ-101',
        projectName: 'Poolside Cedar Deck Refinish',
        customerId: customer._id,
        contractorId: contractorUser._id,
        status: 'completed',
        progress: 100,
        deckSize: '320 sq ft',
        location: { street: '1804 Lakeview Terrace', city: 'Cedar Park', state: 'TX', zipCode: '78613' },
        startDate: new Date(Date.now() - 30 * 86400000),
        actualCompletionDate: new Date(Date.now() - 3 * 86400000),
        notes: 'Job completed successfully and inspected by homeowner.',
        progressHistory: [
          { previousProgress: 75, newProgress: 100, previousStatus: 'in_progress', newStatus: 'completed', notes: 'Final coat cured and walkthrough approved', updatedBy: admin._id, updatedAt: new Date(Date.now() - 3 * 86400000) },
        ],
        lastUpdatedBy: admin._id,
      },
      {
        projectId: 'PRJ-103',
        projectName: 'Front Porch Deck Rebuild',
        customerId: customer._id,
        contractorId: contractorUser._id,
        status: 'pending',
        progress: 15,
        deckSize: '280 sq ft',
        location: { street: '920 Hillside Dr', city: 'Round Rock', state: 'TX', zipCode: '78664' },
        notes: 'Permits acquired, awaiting lumber delivery.',
        lastUpdatedBy: admin._id,
      },
      {
        projectId: 'PRJ-104',
        projectName: 'Multi-Level Hillside Deck',
        customerId: customer._id,
        contractorId: null,
        status: 'on_hold',
        progress: 20,
        deckSize: '620 sq ft',
        location: { street: '512 Ridge Crest', city: 'West Lake Hills', state: 'TX', zipCode: '78746' },
        notes: 'Customer requested pause until masonry retaining wall is completed.',
        lastUpdatedBy: admin._id,
      },
    ]);
    console.log('Seeded projects with progress records.');
  }

  // 8. Seed Leads with Contact Us / Reach Out & Automatic Hot Priority
  const leadCount = await Lead.countDocuments();
  if (leadCount === 0) {
    let sampleDeck = await Deck.findOne();
    if (!sampleDeck) {
      sampleDeck = await Deck.create({
        ownerId: customer._id,
        projectName: 'Riverside Deck',
        dimensions: { length: 20, width: 20, area: 400 },
        completionStatus: 'complete',
      });
    }

    await Lead.create([
      {
        leadNumber: 'LD-101',
        customerId: customer._id,
        deckId: sampleDeck._id,
        leadSource: 'contact_form',
        contactSource: 'Contact Us',
        userType: 'Customer',
        enquiry: {
          subject: 'Staining and board sealing inquiry',
          message: 'Looking for a contractor to power wash and reseal our 400 sq ft cedar deck before winter.',
          preferredContactMethod: 'phone',
        },
        customerSnapshot: {
          name: customer.fullName,
          email: customer.email,
          phone: customer.phone,
        },
        deckSnapshot: {
          projectName: 'Riverside Deck',
          area: 400,
          city: 'Austin',
          state: 'TX',
        },
        contactCount: 3,
        firstContactDate: new Date(Date.now() - 5 * 86400000),
        latestContactDate: new Date(Date.now() - 2 * 86400000),
        priority: 'HOT',
        status: 'new',
      },
      {
        leadNumber: 'LD-105',
        customerId: customer._id,
        deckId: sampleDeck._id,
        assignedContractorId: contractorUser._id,
        leadSource: 'estimate_enquiry',
        contactSource: 'Reach Out',
        userType: 'Contractor',
        enquiry: {
          subject: 'Priority decking project quote request',
          message: 'Homeowner requested detailed quote through Reach Out contractor portal.',
          preferredContactMethod: 'email',
        },
        customerSnapshot: {
          name: contractorUser.fullName,
          email: contractorUser.email,
          phone: contractorUser.phone,
        },
        deckSnapshot: {
          projectName: 'Poolside Deck',
          area: 320,
          city: 'Cedar Park',
          state: 'TX',
        },
        contactCount: 2,
        firstContactDate: new Date(Date.now() - 8 * 86400000),
        latestContactDate: new Date(Date.now() - 4 * 86400000),
        priority: 'HOT',
        status: 'assigned',
      },
      {
        leadNumber: 'LD-109',
        customerId: customer._id,
        deckId: sampleDeck._id,
        leadSource: 'contact_form',
        contactSource: 'Contact Us',
        userType: 'Customer',
        enquiry: {
          subject: 'Mildew remediation and wood restoration',
          message: 'Heavy mildew on north side of deck, needs chemical strip and stain.',
        },
        customerSnapshot: {
          name: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          phone: '+1 555 456 7890',
        },
        deckSnapshot: {
          projectName: 'North Wood Deck',
          area: 250,
        },
        contactCount: 1,
        firstContactDate: new Date(Date.now() - 12 * 86400000),
        latestContactDate: new Date(Date.now() - 10 * 86400000),
        priority: 'HOT',
        status: 'in_progress',
      },
      {
        leadNumber: 'LD-112',
        customerId: customer._id,
        deckId: sampleDeck._id,
        leadSource: 'contact_form',
        contactSource: 'Contact Us',
        userType: 'Customer',
        enquiry: {
          subject: 'General enquiry for deck inspection',
          message: 'Requesting advice on whether to repair or replace boards.',
        },
        customerSnapshot: {
          name: 'Alex Carter',
          email: 'alex.carter@example.com',
          phone: '+1 555 345 6789',
        },
        deckSnapshot: {
          projectName: 'Garden Porch',
          area: 180,
        },
        contactCount: 1,
        firstContactDate: new Date(Date.now() - 25 * 86400000),
        latestContactDate: new Date(Date.now() - 25 * 86400000),
        priority: 'HOT',
        status: 'new',
      },
    ]);
    console.log('Seeded leads with Hot Priority.');
  }

  // 9. Seed Permissions Matrix
  let permissionsPolicy = await PermissionsPolicy.findOne();
  if (!permissionsPolicy) {
    permissionsPolicy = await PermissionsPolicy.create({
      policyName: 'Standard Role Permissions',
      permissions: [
        { moduleKey: 'dashboard', permissionName: 'View Dashboard', customer: true, contractor: true, admin: true },
        { moduleKey: 'projects', permissionName: 'View Projects', customer: true, contractor: true, admin: true },
        { moduleKey: 'estimates', permissionName: 'Create Estimates', customer: true, contractor: true, admin: true },
        { moduleKey: 'project_progress', permissionName: 'Update Project Progress', customer: false, contractor: true, admin: true },
        { moduleKey: 'discounts', permissionName: 'Manage Discounts', customer: false, contractor: false, admin: true },
        { moduleKey: 'catalog', permissionName: 'Manage Catalog', customer: false, contractor: false, admin: true },
        { moduleKey: 'pricing', permissionName: 'Manage Pricing', customer: false, contractor: false, admin: true },
        { moduleKey: 'users', permissionName: 'Manage Users', customer: false, contractor: false, admin: true },
        { moduleKey: 'reports', permissionName: 'View Reports & Analytics', customer: false, contractor: false, admin: true },
        { moduleKey: 'system_settings', permissionName: 'System Configuration', customer: false, contractor: false, admin: true },
      ],
      updatedBy: admin._id,
    });
    console.log('Seeded role permissions matrix.');
  }

  // 10. Seed Platform Settings
  const defaultSettings = [
    { key: 'GENERAL_CONTACT_EMAIL', category: 'GENERAL', label: 'Contact Email', value: 'support@deckpro.com', valueType: 'STRING', isPublic: true },
    { key: 'GENERAL_CONTACT_PHONE', category: 'GENERAL', label: 'Contact Phone', value: '+1 (555) 123-4567', valueType: 'STRING', isPublic: true },
    { key: 'GENERAL_DEFAULT_LANGUAGE', category: 'GENERAL', label: 'Default Language', value: 'English', valueType: 'STRING', isPublic: true },
    { key: 'GENERAL_TIME_ZONE', category: 'GENERAL', label: 'Time Zone', value: 'America/Chicago (CST)', valueType: 'STRING', isPublic: true },
    { key: 'GENERAL_DATE_FORMAT', category: 'GENERAL', label: 'Date Format', value: 'MM/DD/YYYY', valueType: 'STRING', isPublic: true },
    { key: 'GENERAL_DEFAULT_CURRENCY', category: 'GENERAL', label: 'Default Currency', value: 'USD', valueType: 'STRING', isPublic: true },
    { key: 'NOTIF_NEW_USER_REGISTRATION', category: 'NOTIFICATION', label: 'New User Registration Notification', value: 'true', valueType: 'BOOLEAN', isPublic: false },
    { key: 'NOTIF_NEW_LEAD_CREATED', category: 'NOTIFICATION', label: 'New Lead Created Notification', value: 'true', valueType: 'BOOLEAN', isPublic: false },
    { key: 'NOTIF_LEAD_ASSIGNED', category: 'NOTIFICATION', label: 'Lead Assigned Notification', value: 'true', valueType: 'BOOLEAN', isPublic: false },
    { key: 'NOTIF_PROJECT_UPDATES', category: 'NOTIFICATION', label: 'Project Updates Notification', value: 'true', valueType: 'BOOLEAN', isPublic: false },
    { key: 'NOTIF_ESTIMATE_GENERATED', category: 'NOTIFICATION', label: 'Estimate Generated Notification', value: 'true', valueType: 'BOOLEAN', isPublic: false },
    { key: 'SECURITY_MIN_PASSWORD_LENGTH', category: 'SECURITY', label: 'Minimum Password Length', value: '8', valueType: 'NUMBER', isPublic: false },
    { key: 'SECURITY_SESSION_TIMEOUT_MINS', category: 'SECURITY', label: 'Session Timeout Minutes', value: '30', valueType: 'NUMBER', isPublic: false },
    { key: 'SECURITY_LOGIN_SECURITY_ENABLED', category: 'SECURITY', label: 'Login Security Enabled', value: 'true', valueType: 'BOOLEAN', isPublic: false },
    { key: 'SECURITY_MAX_FAILED_LOGIN_ATTEMPTS', category: 'SECURITY', label: 'Maximum Failed Login Attempts', value: '5', valueType: 'NUMBER', isPublic: false },
    { key: 'SECURITY_ACCOUNT_LOCKOUT_DURATION_MINS', category: 'SECURITY', label: 'Account Lockout Duration Minutes', value: '15', valueType: 'NUMBER', isPublic: false },
  ];

  for (const s of defaultSettings) {
    const exists = await PlatformSetting.findOne({ key: s.key });
    if (!exists) {
      await PlatformSetting.create({
        ...s,
        lastUpdatedBy: admin._id,
      });
    }
  }
  console.log('Platform settings seeded.');

  console.log('ALL SEEDING COMPLETED SUCCESSFULLY!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

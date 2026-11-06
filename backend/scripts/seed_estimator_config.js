const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { EstimatorField, EstimatorDependency } = require('../src/modules/admin/estimatorConfig.model');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas');

  const countFields = await EstimatorField.countDocuments();
  if (countFields === 0) {
    const defaultFields = [
      {
        fieldKey: 'deck_length',
        label: 'Deck Length',
        fieldType: 'number',
        section: 'dimensions',
        required: true,
        unit: 'ft',
        minValue: 4,
        maxValue: 120,
        defaultValue: 20,
        order: 10,
        active: true,
      },
      {
        fieldKey: 'deck_width',
        label: 'Deck Width',
        fieldType: 'number',
        section: 'dimensions',
        required: true,
        unit: 'ft',
        minValue: 4,
        maxValue: 80,
        defaultValue: 14,
        order: 20,
        active: true,
      },
      {
        fieldKey: 'deck_shape',
        label: 'Deck Layout Architecture',
        fieldType: 'select',
        section: 'dimensions',
        required: true,
        unit: '',
        options: ['Rectangular / Standard', 'L-Shaped Perimeter', 'Multi-Level Wrap-Around', 'Custom Octagonal'],
        defaultValue: 'Rectangular / Standard',
        order: 30,
        active: true,
      },
      {
        fieldKey: 'surface_material',
        label: 'Primary Deck Substrate',
        fieldType: 'select',
        section: 'materials',
        required: true,
        unit: '',
        options: ['Pressure-Treated Southern Pine', 'Western Red Cedar', 'California Redwood', 'Ipe / Hardwood Exotics', 'Trex Composite Planks'],
        defaultValue: 'Pressure-Treated Southern Pine',
        order: 40,
        active: true,
      },
      {
        fieldKey: 'surface_condition',
        label: 'Current Wood Degradation State',
        fieldType: 'select',
        section: 'condition',
        required: true,
        unit: '',
        options: ['Good (Normal Wear)', 'Weathered (Faded / Grayed)', 'Severely Degraded (Peeling Finish / Mold)'],
        defaultValue: 'Weathered (Faded / Grayed)',
        order: 50,
        active: true,
      },
      {
        fieldKey: 'stain_product',
        label: 'Premium Protective Finish',
        fieldType: 'select',
        section: 'finishes',
        required: true,
        unit: '',
        options: ['Penetrating Oil (Semi-Transparent)', 'Solid Color Acrylic Latex Shield', 'Clear UV Guard Waterproofer', 'Industrial Alkyd Heavy-Duty Staining'],
        defaultValue: 'Penetrating Oil (Semi-Transparent)',
        order: 60,
        active: true,
      },
      {
        fieldKey: 'railings_length',
        label: 'Perimeter Railings Length',
        fieldType: 'number',
        section: 'additions',
        required: false,
        unit: 'lin ft',
        minValue: 0,
        maxValue: 300,
        defaultValue: 34,
        order: 70,
        active: true,
      },
      {
        fieldKey: 'stairs_count',
        label: 'Staircase Step Count',
        fieldType: 'number',
        section: 'additions',
        required: false,
        unit: 'steps',
        minValue: 0,
        maxValue: 50,
        defaultValue: 4,
        order: 80,
        active: true,
      },
      {
        fieldKey: 'elevation_level',
        label: 'Deck Elevation / Ground Clearance',
        fieldType: 'select',
        section: 'dimensions',
        required: true,
        unit: '',
        options: ['Ground Level (< 3 ft)', 'Elevated Mid-Level (3 - 8 ft)', 'Second-Story High Clearance (> 8 ft)'],
        defaultValue: 'Ground Level (< 3 ft)',
        order: 90,
        active: true,
      },
      {
        fieldKey: 'prep_service',
        label: 'Deep Chemical Strip & Power Washing Prep',
        fieldType: 'select',
        section: 'services',
        required: true,
        unit: '',
        options: ['Full Pressure Wash & Brightener Neutralization', 'Heavy Chemical Stripping + Mold Eradication', 'Light Surface Clean & Air Blow'],
        defaultValue: 'Full Pressure Wash & Brightener Neutralization',
        order: 100,
        active: true,
      },
    ];

    await EstimatorField.insertMany(defaultFields);
    console.log(`Seeded ${defaultFields.length} Estimator Fields into MongoDB.`);
  }

  const countDeps = await EstimatorDependency.countDocuments();
  if (countDeps === 0) {
    const defaultDeps = [
      {
        sourceField: 'surface_condition',
        condition: 'equals',
        conditionValue: 'Severely Degraded (Peeling Finish / Mold)',
        targetField: 'prep_service',
        action: 'require',
        active: true,
      },
      {
        sourceField: 'elevation_level',
        condition: 'equals',
        conditionValue: 'Second-Story High Clearance (> 8 ft)',
        targetField: 'stain_product',
        action: 'show',
        active: true,
      },
      {
        sourceField: 'stain_product',
        condition: 'equals',
        conditionValue: 'Clear UV Guard Waterproofer',
        targetField: 'surface_material',
        action: 'show',
        active: true,
      },
    ];

    await EstimatorDependency.insertMany(defaultDeps);
    console.log(`Seeded ${defaultDeps.length} Estimator Dependencies into MongoDB.`);
  }

  await mongoose.disconnect();
  console.log('Seeding complete.');
}

seed().catch(console.error);

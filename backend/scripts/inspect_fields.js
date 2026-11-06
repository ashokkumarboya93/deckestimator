const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function inspectFields() {
  await mongoose.connect(process.env.MONGODB_URI);
  const EstimatorField = mongoose.model('EstimatorField', new mongoose.Schema({}, { strict: false }));
  const EstimatorDependency = mongoose.model('EstimatorDependency', new mongoose.Schema({}, { strict: false }));

  const fields = await EstimatorField.find().lean();
  const deps = await EstimatorDependency.find().lean();

  console.log('Fields:', fields.map(f => ({
    name: f.fieldName || f.fieldKey,
    label: f.displayLabel || f.label,
    type: f.inputType || f.fieldType,
    status: f.status || (f.active ? 'active' : 'inactive')
  })));

  console.log('Dependencies:', deps.map(d => ({
    source: d.sourceField,
    condition: d.condition,
    val: d.conditionValue,
    target: d.targetField,
    action: d.action
  })));

  await mongoose.disconnect();
}

inspectFields().catch(console.error);


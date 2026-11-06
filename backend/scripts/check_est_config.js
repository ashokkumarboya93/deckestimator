const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function checkEstimatorConfig() {
  await mongoose.connect(process.env.MONGODB_URI);
  const EstimatorField = mongoose.model('EstimatorField', new mongoose.Schema({}, { strict: false }));
  const EstimatorDependency = mongoose.model('EstimatorDependency', new mongoose.Schema({}, { strict: false }));

  const fields = await EstimatorField.find().lean();
  const deps = await EstimatorDependency.find().lean();

  console.log(`Estimator Fields count: ${fields.length}`);
  console.log(fields.slice(0, 5).map(f => ({ key: f.fieldKey, label: f.label, type: f.fieldType, section: f.section })));
  console.log(`Estimator Dependencies count: ${deps.length}`);
  console.log(deps.slice(0, 3));

  await mongoose.disconnect();
}

checkEstimatorConfig().catch(console.error);


const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function inspectCatalogData() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const collections = [
    'materials',
    'catalogProducts',
    'catalogSubstrates',
    'services',
    'catalogCoverageRates',
    'pricingConfigurations',
    'discountpolicies',
    'platformSettings'
  ];

  for (const c of collections) {
    const docs = await db.collection(c).find().limit(3).toArray();
    console.log(`\n=== Collection: ${c} (Count: ${await db.collection(c).countDocuments()}) ===`);
    console.log(JSON.stringify(docs.map(d => {
      const { _id, ...rest } = d;
      return rest;
    }), null, 2));
  }

  await mongoose.disconnect();
}

inspectCatalogData().catch(console.error);


const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function checkCatalog() {
  await mongoose.connect(process.env.MONGODB_URI);
  const collections = await mongoose.connection.db.listCollections().toArray();
  const collNames = collections.map(c => c.name);
  console.log('Collections in DB:', collNames);

  // Check counts
  const checkCount = async (name) => {
    if (collNames.includes(name)) {
      const count = await mongoose.connection.db.collection(name).countDocuments();
      console.log(`Collection '${name}': ${count} documents`);
    } else {
      console.log(`Collection '${name}': NOT FOUND`);
    }
  };

  await checkCount('materials');
  await checkCount('deckMaterials');
  await checkCount('products');
  await checkCount('finishes');
  await checkCount('substrates');
  await checkCount('woodSubstrates');
  await checkCount('services');
  await checkCount('coveragerates');
  await checkCount('coverageRates');

  await mongoose.disconnect();
}

checkCatalog().catch(console.error);


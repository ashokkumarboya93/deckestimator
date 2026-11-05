require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const cols = await mongoose.connection.db.listCollections({ name: 'users' }).toArray();
  const schema = cols[0].options.validator.$jsonSchema;
  schema.properties.accountStatus.enum = [
    'active',
    'suspended',
    'disabled',
    'pending_verification',
    'blocked',
    'inactive',
  ];
  await mongoose.connection.db.command({
    collMod: 'users',
    validator: { $jsonSchema: schema },
  });
  console.log('Successfully updated MongoDB users schema validator with blocked & inactive.');
  await mongoose.disconnect();
}

main().catch(console.error);


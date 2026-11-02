const path = require('path');
const dns = require('dns');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

const User = require('../src/modules/users/users.model');
const ContractorProfile = require('../src/modules/contractors/contractorProfile.model');

async function syncValidators() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to Atlas');

  // 1. Modern User Validator
  const userValidator = {
    $jsonSchema: {
      bsonType: 'object',
      required: ['fullName', 'email', 'passwordHash', 'role'],
      properties: {
        _id: { bsonType: 'objectId' },
        fullName: { bsonType: 'string', minLength: 2, maxLength: 100 },
        email: { bsonType: 'string', pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
        phone: { bsonType: 'string' },
        passwordHash: { bsonType: 'string' },
        role: { bsonType: 'string', enum: ['customer', 'contractor', 'admin'] },
        accountStatus: { bsonType: 'string', enum: ['active', 'suspended', 'disabled', 'pending_verification'] },
        emailVerifiedAt: { bsonType: ['date', 'null'] },
        phoneVerifiedAt: { bsonType: ['date', 'null'] },
        lastLoginAt: { bsonType: ['date', 'null'] },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' },
      },
    },
  };

  await mongoose.connection.db.command({
    collMod: 'users',
    validator: userValidator,
    validationLevel: 'moderate',
  });
  console.log('✓ Updated users collection validator on Atlas');

  // 2. Modern ContractorProfile Validator (or relax validation to moderate)
  await mongoose.connection.db.command({
    collMod: 'contractorProfiles',
    validator: {},
    validationLevel: 'off',
  });
  console.log('✓ Relaxed legacy contractorProfiles validator on Atlas');

  // 3. Test creating a user now!
  const testEmail = `test.user.${Date.now()}@example.com`;
  const passwordHash = await User.hashPassword('Password123!');
  const testUser = await User.create({
    fullName: 'Test Real User',
    email: testEmail,
    phone: '555-123-4567',
    passwordHash,
    role: 'customer',
    accountStatus: 'active',
  });

  console.log('✓ Successfully created test user on Atlas! ID:', testUser._id);
  await User.findByIdAndDelete(testUser._id);
  console.log('✓ Cleaned up test user');

  await mongoose.disconnect();
}

syncValidators().catch(console.error);


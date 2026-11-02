const path = require('path');
const dns = require('dns');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

const User = require('../src/modules/users/users.model');

async function seedAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to Atlas');

  const adminEmail = 'admin@deckestimator.com';
  let admin = await User.findOne({ email: adminEmail });

  const passwordHash = await User.hashPassword('AdminPass123!');

  if (!admin) {
    admin = await User.create({
      fullName: 'System Administrator',
      email: adminEmail,
      phone: '555-0100',
      passwordHash,
      role: 'admin',
      accountStatus: 'active',
    });
    console.log('✓ Created dedicated Admin user:', admin.email);
  } else {
    admin.passwordHash = passwordHash;
    admin.role = 'admin';
    admin.accountStatus = 'active';
    await admin.save();
    console.log('✓ Updated dedicated Admin user credentials:', admin.email);
  }

  await mongoose.disconnect();
}

seedAdmin().catch(console.error);

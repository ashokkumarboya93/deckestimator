const bcrypt = require('bcryptjs');
const { connectDatabase } = require('../src/config/database');
const User = require('../src/modules/users/users.model');

async function fix() {
  await connectDatabase();
  const hash = await bcrypt.hash('Password123!', 10);
  await User.updateOne({ email: 'admin@deckestimator.com' }, { $set: { passwordHash: hash, accountStatus: 'active' } });
  console.log('Admin passwordHash set successfully to Password123!');
  process.exit(0);
}

fix().catch(err => {
  console.error(err);
  process.exit(1);
});


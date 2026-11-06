const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const PlatformSetting = require('../src/modules/admin/platformSetting.model');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas');

  const defaultSettings = [
    { key: 'COMPANY_NAME', category: 'GENERAL', label: 'Company Brand Name', valueType: 'STRING', value: 'Deck Restoration Plus' },
    { key: 'SUPPORT_EMAIL', category: 'GENERAL', label: 'Support Email Address', valueType: 'STRING', value: 'support@deckestimator.com' },
    { key: 'SUPPORT_PHONE', category: 'GENERAL', label: 'Support Contact Phone', valueType: 'STRING', value: '(856) 666-8888' },
    { key: 'CURRENCY', category: 'GENERAL', label: 'Platform Currency', valueType: 'STRING', value: 'USD' },
    { key: 'TAX_RATE_PERCENT', category: 'GENERAL', label: 'Sales Tax Rate (%)', valueType: 'NUMBER', value: 6.625 },
    { key: 'EMAIL_ON_CONTRACTOR_REGISTER', category: 'NOTIFICATION', label: 'Alert on Contractor Registration', valueType: 'BOOLEAN', value: true },
    { key: 'EMAIL_ON_HOT_LEAD', category: 'NOTIFICATION', label: 'Alert on Hot Priority Lead', valueType: 'BOOLEAN', value: true },
    { key: 'WEEKLY_REPORT_DISPATCH', category: 'NOTIFICATION', label: 'Weekly Summary Digest Dispatch', valueType: 'BOOLEAN', value: true },
    { key: 'SESSION_TIMEOUT_MINUTES', category: 'SECURITY', label: 'Session Idle Timeout (Minutes)', valueType: 'NUMBER', value: 120 },
    { key: 'ENFORCE_MFA_FOR_ADMINS', category: 'SECURITY', label: 'Enforce Two-Factor Authentication', valueType: 'BOOLEAN', value: false },
  ];

  for (const s of defaultSettings) {
    const existing = await PlatformSetting.findOne({ key: s.key });
    if (!existing) {
      await PlatformSetting.create(s);
      console.log(`Created setting: ${s.key}`);
    } else {
      console.log(`Setting exists: ${s.key}`);
    }
  }

  await mongoose.disconnect();
  console.log('Platform settings sync complete.');
}

seed().catch(console.error);


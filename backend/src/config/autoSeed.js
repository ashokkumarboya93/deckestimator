// =============================================
// Deck Estimator — Production Auto-Seed Utility
// =============================================
// Automatically provisions default admin and baseline platform
// configuration on startup if database is empty.

const User = require('../modules/users/users.model');
const PlatformSetting = require('../modules/admin/platformSetting.model');

async function autoSeed() {
  try {
    // 1. Ensure Admin User exists
    const adminEmail = 'admin@deckestimator.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const passwordHash = await User.hashPassword('AdminPass123!');
      admin = await User.create({
        fullName: 'System Administrator',
        email: adminEmail,
        passwordHash,
        role: 'admin',
        accountStatus: 'active',
        phone: '+1 555 123 4567',
      });
      console.log(`[AutoSeed] Provisioned default Admin user: ${adminEmail}`);
    }

    // 2. Ensure baseline platform settings exist
    const settingCount = await PlatformSetting.countDocuments();
    if (settingCount === 0) {
      const defaultSettings = [
        { key: 'COMPANY_NAME', category: 'GENERAL', label: 'Company Name', value: 'Deck Estimator Pro', valueType: 'STRING', isPublic: true },
        { key: 'CONTACT_EMAIL', category: 'GENERAL', label: 'Contact Email', value: 'support@deckestimator.com', valueType: 'STRING', isPublic: true },
        { key: 'COMMISSION_RATE', category: 'FINANCIAL', label: 'Platform Commission Rate (%)', value: '10', valueType: 'NUMBER', isPublic: true },
      ];
      for (const s of defaultSettings) {
        await PlatformSetting.create({ ...s, lastUpdatedBy: admin._id });
      }
      console.log('[AutoSeed] Baseline platform settings initialized');
    }
  } catch (err) {
    console.warn('[AutoSeed] Non-fatal initialization warning:', err.message);
  }
}

module.exports = { autoSeed };


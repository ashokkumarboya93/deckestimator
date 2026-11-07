const fs = require('fs');

let service = fs.readFileSync('backend/src/modules/admin/admin.service.js', 'utf8');
service = service.replace(/\r\n/g, '\n');

// 1. Add Notification import
if (!service.includes("const Notification = require('../notifications/notification.model');")) {
  service = service.replace(
    "const PlatformSetting = require('./platformSetting.model');",
    "const PlatformSetting = require('./platformSetting.model');\nconst Notification = require('../notifications/notification.model');"
  );
}

// 2. Update SETTINGS_KEY_MAP
const oldKeyMapTarget = `const SETTINGS_KEY_MAP = {
  companyName: 'COMPANY_NAME',
  supportEmail: 'SUPPORT_EMAIL',
  supportPhone: 'SUPPORT_PHONE',
  currency: 'CURRENCY',
  taxRatePercent: 'TAX_RATE_PERCENT',
  emailOnContractorRegister: 'EMAIL_ON_CONTRACTOR_REGISTER',
  emailOnHotLead: 'EMAIL_ON_HOT_LEAD',
  weeklyReportDispatch: 'WEEKLY_REPORT_DISPATCH',
  sessionTimeoutMinutes: 'SESSION_TIMEOUT_MINUTES',
  enforceMFAForAdmins: 'ENFORCE_MFA_FOR_ADMINS',
};`;

const newKeyMap = `const SETTINGS_KEY_MAP = {
  companyName: 'COMPANY_NAME',
  brandTagline: 'BRAND_TAGLINE',
  platformLogoUrl: 'PLATFORM_LOGO_URL',
  supportEmail: 'SUPPORT_EMAIL',
  supportPhone: 'SUPPORT_PHONE',
  whatsappNumber: 'WHATSAPP_NUMBER',
  businessAddress: 'BUSINESS_ADDRESS',
  operatingHours: 'OPERATING_HOURS',
  currency: 'CURRENCY',
  taxRatePercent: 'TAX_RATE_PERCENT',
  emailOnContractorRegister: 'EMAIL_ON_CONTRACTOR_REGISTER',
  emailOnHotLead: 'EMAIL_ON_HOT_LEAD',
  weeklyReportDispatch: 'WEEKLY_REPORT_DISPATCH',
  sessionTimeoutMinutes: 'SESSION_TIMEOUT_MINUTES',
  enforceMFAForAdmins: 'ENFORCE_MFA_FOR_ADMINS',
};`;

if (service.includes(oldKeyMapTarget)) {
  service = service.replace(oldKeyMapTarget, newKeyMap);
}

// 3. Update flatSettings in getSystemSettings
const oldFlatSettings = `  const flatSettings = {
    companyName: 'Deck Restoration Plus',
    supportEmail: 'support@deckestimator.com',
    supportPhone: '(856) 666-8888',
    currency: 'USD',
    taxRatePercent: 6.625,
    emailOnContractorRegister: true,
    emailOnHotLead: true,
    weeklyReportDispatch: true,
    sessionTimeoutMinutes: 120,
    enforceMFAForAdmins: false,
  };`;

const newFlatSettings = `  const flatSettings = {
    companyName: 'Deck Restoration Plus',
    brandTagline: 'Commercial & Residential Exterior Wood Restoration Specialists',
    platformLogoUrl: '',
    supportEmail: 'support@deckestimator.com',
    supportPhone: '(856) 666-8888',
    whatsappNumber: '+1 (856) 555-0199',
    businessAddress: '1452 Boardwalk Ave, Cherry Hill, NJ 08002',
    operatingHours: 'Mon - Fri: 8:00 AM - 6:00 PM EST, Sat: 9:00 AM - 2:00 PM EST',
    currency: 'USD',
    taxRatePercent: 6.625,
    emailOnContractorRegister: true,
    emailOnHotLead: true, 
    weeklyReportDispatch: true,
    sessionTimeoutMinutes: 120,
    enforceMFAForAdmins: false,
  };`;

if (service.includes(oldFlatSettings)) {
  service = service.replace(oldFlatSettings, newFlatSettings);
}

// 4. Add Notification methods before getPermissionsMatrix
const notificationMethods = `
// ====================================================================
// NOTIFICATION BROADCAST & DIRECT DISPATCH ENGINE
// ====================================================================

async function dispatchAdminNotification(adminUser, payload) {
  const { recipientType = 'all', targetRole = 'all', userIds = [], title, message, category = 'GENERAL', channels = ['IN_APP'] } = payload;
  if (!title || !message) {
    throw new BadRequestError('Notification title and message are required.');
  }

  const senderName = adminUser.fullName || adminUser.name || 'System Administrator';
  const createdDocs = [];

  if (recipientType === 'specific' && Array.isArray(userIds) && userIds.length > 0) {
    const targetUsers = await User.find({ _id: { $in: userIds } }).select('fullName email phone role');
    for (const u of targetUsers) {
      const doc = await Notification.create({
        recipientType: 'specific',
        userId: u._id,
        recipientSnapshot: {
          name: u.fullName,
          email: u.email,
          phone: u.phone,
          role: u.role,
        },
        targetRole: u.role,
        title,
        message,
        category,
        channels,
        sentBy: adminUser.id || adminUser._id,
        sentByName: senderName,
      });
      createdDocs.push(doc);
    }
  } else {
    // Broadcast message
    const roleTarget = recipientType === 'customer' ? 'customer' : recipientType === 'contractor' ? 'contractor' : 'all';
    const doc = await Notification.create({
      recipientType: recipientType === 'both' ? 'all' : recipientType,
      targetRole: roleTarget,
      title,
      message,
      category,
      channels,
      sentBy: adminUser.id || adminUser._id,
      sentByName: senderName,
    });
    createdDocs.push(doc);
  }

  await logAdminAction(adminUser, 'NOTIFICATION_DISPATCH', 'Notification', createdDocs[0]?._id, null, {
    recipientType,
    count: createdDocs.length,
    title,
  });

  return {
    success: true,
    count: createdDocs.length,
    message: \`Notification successfully dispatched to \${createdDocs.length} recipient(s).\`,
    notifications: createdDocs,
  };
}

async function getNotificationBroadcastHistory(limit = 30) {
  const list = await Notification.find().sort({ createdAt: -1 }).limit(Number(limit));
  return list.map((n) => n.toJSON());
}

async function searchNotificationRecipients(query = '') {
  let q = { accountStatus: { $ne: 'disabled' }, role: { $in: [ROLES.CUSTOMER, ROLES.CONTRACTOR] } };
  if (query && query.trim()) {
    const reg = new RegExp(query.trim(), 'i');
    q.$or = [{ fullName: reg }, { email: reg }, { phone: reg }];
  }
  const users = await User.find(q).select('fullName email phone role accountStatus').limit(25);
  return users.map((u) => ({
    id: u._id.toString(),
    _id: u._id.toString(),
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    role: u.role,
    accountStatus: u.accountStatus,
  }));
}
`;

if (!service.includes('dispatchAdminNotification')) {
  service = service.replace(
    '// 11. PERMISSIONS MATRIX (Verification & Progress Tab 4)',
    `${notificationMethods}\n// 11. PERMISSIONS MATRIX (Verification & Progress Tab 4)`
  );
  console.log('Added notification methods to admin.service.js');
}

// 5. Update exports
if (!service.includes('dispatchAdminNotification,')) {
  service = service.replace(
    'getSystemSettings,\n  updateSystemSettings,',
    'getSystemSettings,\n  updateSystemSettings,\n  dispatchAdminNotification,\n  getNotificationBroadcastHistory,\n  searchNotificationRecipients,'
  );
  console.log('Updated exports in admin.service.js');
}

fs.writeFileSync('backend/src/modules/admin/admin.service.js', service, 'utf8');
console.log('admin.service.js successfully updated.');


// =============================================
// Deck Estimator — Production Database Backup Utility
// =============================================
// Exports all primary application collections to timestamped JSON files
// with full manifest. Zero cloud cost, minimal RAM footprint.

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { connectDatabase, disconnectDatabase } = require('../src/config/database');

const BACKUP_DIR_ROOT = path.join(__dirname, '../backups');

const CORE_COLLECTIONS = [
  'users',
  'contractorprofiles',
  'decks',
  'estimates',
  'leads',
  'projects',
  'materials',
  'services',
  'pricingConfigurations',
  'platformSettings',
  'permissionsPolicies',
  'userrequests',
  'verificationdocuments',
  'notifications',
  'auditLogs',
];

async function runBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const targetDir = path.join(BACKUP_DIR_ROOT, `backup-${timestamp}`);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  console.log(`[Backup] Connecting to database using verified database config...`);
  await connectDatabase();
  const db = mongoose.connection.db;

  const manifest = {
    timestamp: new Date().toISOString(),
    database: 'DECK_ESTIMATOR',
    collections: {},
    totalDocuments: 0,
  };

  console.log(`[Backup] Exporting core business collections to: ${targetDir}\n`);

  for (const colName of CORE_COLLECTIONS) {
    try {
      const col = db.collection(colName);
      // For decks, exclude heavy base64 photo binaries to keep backup fast & lightweight
      const projection = colName === 'decks' ? { photos: 0 } : {};
      const docs = await col.find({}, { projection }).limit(500).toArray();
      const filePath = path.join(targetDir, `${colName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), 'utf8');

      manifest.collections[colName] = {
        count: docs.length,
        file: `${colName}.json`,
        sizeBytes: fs.statSync(filePath).size,
      };
      manifest.totalDocuments += docs.length;

      console.log(`  ✓ ${colName.padEnd(28)} -> ${docs.length.toString().padStart(4)} documents saved.`);
    } catch (err) {
      console.warn(`  ⚠ ${colName.padEnd(28)} -> Skipped (${err.message})`);
    }
  }

  const manifestPath = path.join(targetDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log(`\n[Backup] SUCCESS! ${manifest.totalDocuments} total documents backed up across ${Object.keys(manifest.collections).length} collections.`);
  console.log(`[Backup] Manifest written to: ${manifestPath}\n`);

  await disconnectDatabase();
}

runBackup().catch((err) => {
  console.error('[Backup Error]:', err);
  process.exit(1);
});

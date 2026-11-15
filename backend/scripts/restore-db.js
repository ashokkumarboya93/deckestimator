// =============================================
// Deck Estimator — Database Restore Utility
// =============================================
// Restores collections from a selected backup snapshot folder.

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { connectDatabase, disconnectDatabase } = require('../src/config/database');

const BACKUP_DIR_ROOT = path.join(__dirname, '../backups');

async function runRestore() {
  const targetBackupDirArg = process.argv[2];

  let backupDir = targetBackupDirArg;
  if (!backupDir) {
    if (!fs.existsSync(BACKUP_DIR_ROOT)) {
      console.error('No backups directory found.');
      process.exit(1);
    }
    const folders = fs.readdirSync(BACKUP_DIR_ROOT).filter((f) => f.startsWith('backup-'));
    if (folders.length === 0) {
      console.error('No backup snapshots found in backend/backups/');
      process.exit(1);
    }
    folders.sort().reverse();
    backupDir = path.join(BACKUP_DIR_ROOT, folders[0]);
  }

  const manifestPath = path.join(backupDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error(`Invalid backup directory (missing manifest.json): ${backupDir}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log(`[Restore] Target Snapshot: ${backupDir}`);
  console.log(`[Restore] Snapshot Created: ${manifest.timestamp} (${manifest.totalDocuments} docs)`);

  console.log(`[Restore] Connecting to database...`);
  await connectDatabase();
  const db = mongoose.connection.db;

  for (const [colName, meta] of Object.entries(manifest.collections)) {
    const jsonPath = path.join(backupDir, meta.file);
    if (!fs.existsSync(jsonPath)) continue;

    const docs = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    if (!Array.isArray(docs) || docs.length === 0) continue;

    const col = db.collection(colName);
    const convertedDocs = docs.map((d) => {
      if (d._id && typeof d._id === 'string' && d._id.length === 24) {
        d._id = new mongoose.Types.ObjectId(d._id);
      }
      return d;
    });

    let restoredCount = 0;
    for (const doc of convertedDocs) {
      if (doc._id) {
        await col.replaceOne({ _id: doc._id }, doc, { upsert: true });
        restoredCount++;
      }
    }
    console.log(`  ✓ ${colName.padEnd(28)} -> ${restoredCount.toString().padStart(4)} documents restored/upserted.`);
  }

  console.log(`\n[Restore] SUCCESS! Database restoration complete from ${manifest.timestamp}.\n`);
  await disconnectDatabase();
}

runRestore().catch((err) => {
  console.error('[Restore Error]:', err);
  process.exit(1);
});

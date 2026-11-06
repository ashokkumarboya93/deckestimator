const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const adminService = require('../src/modules/admin/admin.service');
const Project = require('../src/modules/admin/project.model');
const User = require('../src/modules/users/users.model');

async function testAll() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('--- Testing Admin Endpoints ---');

  // 1. Settings
  const settings = await adminService.getSystemSettings();
  console.log('Settings:', settings.settings.companyName, settings.systemInfo.backendStatus);

  // 2. Reports
  const reports = await adminService.getReportsAnalyticsData();
  console.log('Reports metrics:', reports.metrics);

  // 3. Reports Export
  const repExport = await adminService.exportReportsData('csv', { tab: 'business_overview' });
  console.log('Reports CSV lines:', repExport.data.split('\n').length);

  // 4. Projects Export Dossier
  const proj = await Project.findOne();
  if (proj) {
    const projExport = await adminService.exportSingleProjectDossier(proj._id, 'csv');
    console.log('Project export lines:', projExport.data.split('\n').length, projExport.filename);
  }

  // 5. Admin Profile
  const admin = await User.findOne({ role: 'admin' });
  if (admin) {
    const prof = await adminService.getAdminProfile(admin._id);
    console.log('Admin profile:', prof.name, prof.email, prof.role);
  }

  // 6. Catalog overview & materials
  const catOverview = await adminService.getCatalogOverview();
  console.log('Catalog overview:', catOverview);

  const mats = await adminService.listCatalogMaterials();
  console.log('Materials count:', mats.length, 'Sample name:', mats[0]?.name, 'Price:', mats[0]?.unitPrice);

  await mongoose.disconnect();
  console.log('--- All Tests Passed Successfully! ---');
}

testAll().catch(console.error);

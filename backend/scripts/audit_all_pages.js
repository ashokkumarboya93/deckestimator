const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const jwt = require('jsonwebtoken');

async function auditAllPages() {
  const adminToken = jwt.sign(
    { id: '6ae828fb83dc9eb8e450f8d6', role: 'admin', email: 'admin@deckestimator.com' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const headers = { Authorization: 'Bearer ' + adminToken };

  console.log('=== AUDITING ALL ADMIN PORTAL PAGES ===\n');

  // Page 5: Projects
  const resProj = await fetch('http://localhost:5000/api/v1/admin/projects', { headers });
  const dataProj = await resProj.json();
  console.log('5. PROJECTS (/admin/projects):', resProj.status, `Count: ${dataProj.data?.length}`);

  // Page 6: Estimator Config
  const resFields = await fetch('http://localhost:5000/api/v1/admin/estimator-config/fields', { headers });
  const dataFields = await resFields.json();
  const resDeps = await fetch('http://localhost:5000/api/v1/admin/estimator-config/dependencies', { headers });
  const dataDeps = await resDeps.json();
  console.log('6. ESTIMATOR CONFIG (/admin/estimator-config):', `Fields: ${dataFields.data?.length}, Deps: ${dataDeps.data?.length}`);

  // Page 7: Catalog Management
  const resCat = await fetch('http://localhost:5000/api/v1/admin/catalog/overview', { headers });
  const dataCat = await resCat.json();
  console.log('7. CATALOG (/admin/catalog):', resCat.status, dataCat.data ? Object.keys(dataCat.data).map(k => `${k}: ${dataCat.data[k]?.length}`) : dataCat);

  // Page 8: Pricing Management
  const resPrice = await fetch('http://localhost:5000/api/v1/admin/pricing', { headers });
  const dataPrice = await resPrice.json();
  console.log('8. PRICING (/admin/pricing):', resPrice.status, `Has Config: ${!!dataPrice.data?.materials}`);

  // Page 9: Discounts Management
  const resDisc = await fetch('http://localhost:5000/api/v1/admin/discounts/overview', { headers });
  const dataDisc = await resDisc.json();
  console.log('9. DISCOUNTS (/admin/discounts):', resDisc.status, `Policies: ${dataDisc.data?.policies?.length}, Contractors: ${dataDisc.data?.contractors?.length}`);

  // Page 10: Reports & Analytics
  const resReports = await fetch('http://localhost:5000/api/v1/admin/reports/analytics?period=30d', { headers });
  const dataReports = await resReports.json();
  console.log('10. REPORTS (/admin/reports):', resReports.status, `KPIs: ${!!dataReports.data?.kpis}`);

  // Page 11: System Settings
  const resSettings = await fetch('http://localhost:5000/api/v1/admin/settings', { headers });
  const dataSettings = await resSettings.json();
  console.log('11. SETTINGS (/admin/settings):', resSettings.status, `Has settings: ${!!dataSettings.data}`);

  // Page 12: Admin Profile
  const resProfile = await fetch('http://localhost:5000/api/v1/admin/profile', { headers });
  const dataProfile = await resProfile.json();
  console.log('12. ADMIN PROFILE (/admin/profile):', resProfile.status, `Admin Name: ${dataProfile.data?.fullName || dataProfile.data?.name}`);
}

auditAllPages().catch(console.error);


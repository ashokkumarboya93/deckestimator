const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const jwt = require('jsonwebtoken');

async function testDiscountsAndReports() {
  const adminToken = jwt.sign(
    { id: '6ae828fb83dc9eb8e450f8d6', role: 'admin', email: 'admin@deckestimator.com' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  const headers = { Authorization: 'Bearer ' + adminToken };

  const resDisc = await fetch('http://localhost:5000/api/v1/admin/discounts', { headers });
  console.log('DISCOUNTS status:', resDisc.status);
  const dataDisc = await resDisc.json();
  console.log('DISCOUNTS data:', Object.keys(dataDisc.data || {}));

  const resRep = await fetch('http://localhost:5000/api/v1/admin/reports', { headers });
  console.log('REPORTS status:', resRep.status);
  const dataRep = await resRep.json();
  console.log('REPORTS data keys:', Object.keys(dataRep.data || {}));

  const resPrice = await fetch('http://localhost:5000/api/v1/admin/pricing', { headers });
  console.log('PRICING status:', resPrice.status);
  const dataPrice = await resPrice.json();
  console.log('PRICING data keys:', Object.keys(dataPrice.data || {}));
}

testDiscountsAndReports().catch(console.error);


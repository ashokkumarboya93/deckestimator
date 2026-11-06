const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const jwt = require('jsonwebtoken');

async function testProjectsAPI() {
  const token = jwt.sign(
    { id: '6ae828fb83dc9eb8e450f8d6', role: 'admin', email: 'admin@deckestimator.com' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const res = await fetch('http://localhost:5000/api/v1/admin/projects', {
    headers: { Authorization: 'Bearer ' + token }
  });
  const data = await res.json();
  console.log('Projects count:', data.data?.length);
  console.log(data.data?.map(p => ({
    title: p.title,
    customer: p.customerName,
    contractor: p.contractorName,
    progress: p.progress,
    specs: p.deckSpecs
  })));
}

testProjectsAPI().catch(console.error);


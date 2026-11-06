const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function inspectProjects() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Project = mongoose.model('Project', new mongoose.Schema({}, { strict: false }));
  const projects = await Project.find().lean();
  console.log(`Total projects in DB: ${projects.length}`);
  console.log(projects.map(p => ({
    id: p.projectId,
    name: p.projectName,
    customerId: p.customerId,
    contractorId: p.contractorId,
    progress: p.progress,
    status: p.status
  })));
  await mongoose.disconnect();
}

inspectProjects().catch(console.error);


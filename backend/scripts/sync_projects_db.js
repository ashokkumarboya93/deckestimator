const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function syncProjects() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = require('../src/modules/users/users.model');
  const Project = require('../src/modules/admin/project.model');

  const ashok = await User.findOne({ email: 'ashok123@gmail.com' });
  const akshitha = await User.findOne({ email: 'versebunny24@gmail.com' });
  const thrisha = await User.findOne({ email: 'customer@gmail.com' });
  const erukonda = await User.findOne({ email: 'thrisha142003@gmail.com' });
  const alex = await User.findOne({ email: 'alex.builder@gmail.com' });

  console.log('Linking real users to projects...');

  await Project.updateOne(
    { projectId: 'PRJ-101' },
    {
      $set: {
        customerId: ashok?._id,
        contractorId: alex?._id,
        progress: 100,
        status: 'completed',
        projectName: 'Ashok Master Redwood Deck Refinish',
        deckSpecs: { length: 24, width: 16, woodSpecies: 'Redwood' },
      }
    }
  );

  await Project.updateOne(
    { projectId: 'PRJ-102' },
    {
      $set: {
        customerId: akshitha?._id,
        contractorId: alex?._id,
        progress: 85,
        status: 'in_progress',
        projectName: 'Lakefront Cedar Deck Restoration',
        deckSpecs: { length: 20, width: 14, woodSpecies: 'Western Red Cedar' },
      }
    }
  );

  await Project.updateOne(
    { projectId: 'PRJ-103' },
    {
      $set: {
        customerId: thrisha?._id,
        contractorId: alex?._id,
        progress: 15,
        status: 'pending',
        projectName: 'Front Porch Pressure Treated Deck Rebuild',
        deckSpecs: { length: 16, width: 12, woodSpecies: 'Pressure Treated Pine' },
      }
    }
  );

  await Project.updateOne(
    { projectId: 'PRJ-104' },
    {
      $set: {
        customerId: erukonda?._id,
        contractorId: alex?._id,
        progress: 20,
        status: 'on_hold',
        projectName: 'Multi-Level Hillside Deck Staining',
        deckSpecs: { length: 28, width: 18, woodSpecies: 'Mahogany' },
      }
    }
  );

  const updated = await Project.find().populate('customerId', 'fullName email').populate('contractorId', 'fullName email').lean();
  console.log('Updated projects:');
  console.log(updated.map(p => ({
    id: p.projectId,
    name: p.projectName,
    customer: p.customerId?.fullName,
    contractor: p.contractorId?.fullName,
    progress: p.progress,
    status: p.status,
  })));

  await mongoose.disconnect();
}

syncProjects().catch(console.error);

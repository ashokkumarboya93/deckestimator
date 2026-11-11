// ============================================================================
// DECK RESTORATION PLUS — DEMO VIDEO LAUNCHER
// ============================================================================
// Usage:
//   node demo_video_1_customer_admin.js        (Run Video 1)
//   node demo_video_2_contractor_admin.js      (Run Video 2)
//   node demo_video_3_admin_command_center.js  (Run Video 3)
//   node run_demo_menu.js [1|2|3|all]          (Run from menu)
// ============================================================================

const { execSync } = require('child_process');

const arg = process.argv[2] || '1';

const scripts = {
  '1': 'demo_video_1_customer_admin.js',
  '2': 'demo_video_2_contractor_admin.js',
  '3': 'demo_video_3_admin_command_center.js',
};

if (arg === 'all') {
  console.log('Running Video 1...');
  execSync('node demo_video_1_customer_admin.js', { stdio: 'inherit' });
  console.log('Running Video 2...');
  execSync('node demo_video_2_contractor_admin.js', { stdio: 'inherit' });
  console.log('Running Video 3...');
  execSync('node demo_video_3_admin_command_center.js', { stdio: 'inherit' });
} else if (scripts[arg]) {
  console.log(`Launching ${scripts[arg]}...`);
  execSync(`node ${scripts[arg]}`, { stdio: 'inherit' });
} else {
  console.log('Invalid option. Pass 1, 2, 3, or all.');
}


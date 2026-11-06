// =============================================
// Deck Estimator — Admin Portal Operational Handbook & Guidelines
// =============================================
// Comprehensive visual and document-style handbook:
// - Detailed operational documentation for each page in the portal
// - Interactive section browser, search filter, visual flowcharts, and rule tables
// - Standard Operating Procedures (SOPs), role access matrix, and verification guidelines

import React, { useState } from 'react';

const SECTIONS = [
  { id: 'overview', title: '1. Architecture & Platform Lifecycle', icon: '🏛️' },
  { id: 'dashboard', title: '2. Executive Operations Dashboard', icon: '📊' },
  { id: 'users', title: '3. User Management & Governance', icon: '👥' },
  { id: 'verifications', title: '4. Contractor Verification & Compliance', icon: '🛡️' },
  { id: 'leads', title: '5. Lead Inquiries & 30-Day Auto Hot Hub', icon: '🎯' },
  { id: 'projects', title: '6. Projects Directory & Milestone Tracking', icon: '📁' },
  { id: 'pricing', title: '7. Pricing & Discounts Unified Engine', icon: '💰' },
  { id: 'reports', title: '8. Business Intelligence & Reports', icon: '📈' },
  { id: 'settings', title: '9. System Settings, WhatsApp & Broadcasts', icon: '⚙️' },
  { id: 'sop', title: '10. Administrator Daily & Weekly SOPs', icon: '📋' },
];

export default function AdminGuidelinesPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = SECTIONS.filter((s) => {
    if (!searchQuery.trim()) return true;
    return s.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Administrator Guidelines & Operational Manual</h1>
          <p style={styles.subtitle}>
            Comprehensive operational documentation, visual lifecycle diagrams, and standard operating procedures (SOP).
          </p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={() => window.print()} style={styles.btnPrint}>
            🖨️ Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Main Two-Column Handbook Layout */}
      <div style={styles.handbookGrid}>
        {/* Navigation Sidebar */}
        <aside style={styles.navCol}>
          <div style={styles.searchBox}>
            <input
              type="text"
              placeholder="Search guidelines manual..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <nav style={styles.navList}>
            {filteredSections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                style={{
                  ...styles.navItem,
                  ...(activeSection === sec.id ? styles.navItemActive : {}),
                }}
              >
                <span style={{ fontSize: '16px' }}>{sec.icon}</span>
                <span style={{ flex: 1, textAlign: 'left', fontWeight: activeSection === sec.id ? '700' : '500' }}>
                  {sec.title}
                </span>
              </button>
            ))}
          </nav>

          {/* Quick Support Card */}
          <div style={styles.supportBox}>
            <h4 style={{ margin: '0 0 6px', fontSize: '13px', color: '#0f172a' }}>Platform Governance</h4>
            <p style={{ margin: 0, fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
              All administrative operations are backed by immutable audit logs in MongoDB Atlas for compliance.
            </p>
          </div>
        </aside>

        {/* Content Viewer Column */}
        <main style={styles.contentCol}>
          {/* SECTION 1: ARCHITECTURE & LIFECYCLE */}
          {activeSection === 'overview' && (
            <div style={styles.docArticle}>
              <div style={styles.badgePill}>ARCHITECTURE OVERVIEW</div>
              <h2 style={styles.docTitle}>Platform Lifecycle & Operational Ecosystem</h2>
              <p style={styles.docLead}>
                Deck Restoration Plus operates as a synchronized three-tier ecosystem connecting Homeowners (Customers),
                Vetted Specialists (Contractors), and Platform Administrators via a centralized MongoDB Atlas datastore.
              </p>

              {/* Visual Flow diagram card */}
              <div style={styles.flowCard}>
                <h4 style={styles.flowTitle}>Core Lifecycle Progression</h4>
                <div style={styles.flowSteps}>
                  <div style={styles.stepBox}>
                    <span style={styles.stepNum}>1</span>
                    <strong>Customer Estimate</strong>
                    <p style={styles.stepDesc}>Dimensions, wood substrate & condition calculated.</p>
                  </div>
                  <div style={styles.stepArrow}>➔</div>
                  <div style={styles.stepBox}>
                    <span style={styles.stepNum}>2</span>
                    <strong>Lead Generated</strong>
                    <p style={styles.stepDesc}>Customer clicks Contact Us or Reach Out (&le;30d Auto Hot).</p>
                  </div>
                  <div style={styles.stepArrow}>➔</div>
                  <div style={styles.stepBox}>
                    <span style={styles.stepNum}>3</span>
                    <strong>Contractor Assigned</strong>
                    <p style={styles.stepDesc}>Verified partner claims lead with discounted materials.</p>
                  </div>
                  <div style={styles.stepArrow}>➔</div>
                  <div style={styles.stepBox}>
                    <span style={styles.stepNum}>4</span>
                    <strong>Project Completed</strong>
                    <p style={styles.stepDesc}>Milestones logged (0-100%) and project finalized.</p>
                  </div>
                </div>
              </div>

              <h3 style={styles.h3}>Portal Roles & Security Matrix</h3>
              <table style={styles.manualTable}>
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Primary Capabilities</th>
                    <th>Data Access Scope</th>
                    <th>Governance Level</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Customer</strong></td>
                    <td>Continuous estimation, save quotes, Contact Us inquiries, track deck progress.</td>
                    <td>Own estimates, active projects & notifications.</td>
                    <td>Self-serve authenticated.</td>
                  </tr>
                  <tr>
                    <td><strong>Contractor</strong></td>
                    <td>Submit licensing credentials, view assigned leads, build contractor quotes.</td>
                    <td>Verified leads, claimed projects, custom partner discounts.</td>
                    <td>Requires Admin verification approval.</td>
                  </tr>
                  <tr>
                    <td><strong>Administrator</strong></td>
                    <td>Full oversight: users, verifications, leads, projects, pricing engine, notifications.</td>
                    <td>System-wide MongoDB collections & audit history.</td>
                    <td>Complete governance authority.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* SECTION 2: DASHBOARD HUB */}
          {activeSection === 'dashboard' && (
            <div style={styles.docArticle}>
              <div style={styles.badgePill}>OPERATIONS HUB</div>
              <h2 style={styles.docTitle}>Page 1: Executive Operations Dashboard</h2>
              <p style={styles.docLead}>
                The dashboard serves as the real-time mission control for the platform, pulling live telemetry and aggregations directly from MongoDB Atlas every 10 seconds.
              </p>

              <h3 style={styles.h3}>Summary Metric Cards Anatomy</h3>
              <div style={styles.cardGrid}>
                <div style={styles.cardInfo}>
                  <strong>Total Users</strong>
                  <p>All active accounts in the database (Customers + Contractors + Admins).</p>
                </div>
                <div style={styles.cardInfo}>
                  <strong>Customers</strong>
                  <p>Registered homeowners who have created deck estimates.</p>
                </div>
                <div style={styles.cardInfo}>
                  <strong>Contractors</strong>
                  <p>Registered exterior restoration professionals.</p>
                </div>
                <div style={styles.cardInfo}>
                  <strong>Hot Priority Leads</strong>
                  <p>High-intent inquiries created or updated within the last 30 days.</p>
                </div>
              </div>

              <h3 style={styles.h3}>Business Activity Trend Multi-Series Line Chart</h3>
              <p style={styles.text}>
                The interactive SVG chart groups live MongoDB timestamps by date along an 11-point timeline.
                The three lines reflect:
              </p>
              <ul style={styles.bulletList}>
                <li><strong style={{ color: '#1d4ed8' }}>Blue Line</strong>: Cumulative User Registrations</li>
                <li><strong style={{ color: '#10b981' }}>Green Line</strong>: Cumulative Inbound Leads</li>
                <li><strong style={{ color: '#8b5cf6' }}>Purple Line</strong>: Cumulative Generated Estimates</li>
              </ul>
            </div>
          )}

          {/* SECTION 3: USER MANAGEMENT */}
          {activeSection === 'users' && (
            <div style={styles.docArticle}>
              <div style={styles.badgePill}>GOVERNANCE</div>
              <h2 style={styles.docTitle}>Page 2: User Governance & Security Administration</h2>
              <p style={styles.docLead}>
                Monitor, inspect, moderate, and manage all homeowner and contractor accounts registered on Deck Restoration Plus.
              </p>

              <h3 style={styles.h3}>Account Statuses & Moderation Lifecycle</h3>
              <ul style={styles.bulletList}>
                <li><strong>ACTIVE (Green)</strong>: Account is verified and has standard platform permissions.</li>
                <li><strong>BLOCKED (Red)</strong>: Suspended account. User cannot log in; pending actions are frozen. Click "Unblock" to restore.</li>
                <li><strong>PENDING (Amber)</strong>: Awaiting initial email verification or administrative review.</li>
              </ul>

              <h3 style={styles.h3}>Comprehensive User Dossier Modal & Export</h3>
              <p style={styles.text}>
                Clicking <strong>Profile</strong> opens the deep user modal featuring three tabs:
              </p>
              <ol style={styles.numberList}>
                <li><strong>Account & Registration Details</strong>: Full Name, email, phone, created date, verification timestamp.</li>
                <li><strong>Estimations & Projects</strong>: Live deck dimensions, wood species, and active quotes.</li>
                <li><strong>Enquiries & Audit History</strong>: All contact submissions and moderation events.</li>
              </ol>
              <div style={styles.tipBox}>
                💡 <strong>Export Tip:</strong> Click "Export Dossier (CSV)" or "Export Dossier (Excel)" inside the modal to download an audit file for legal compliance.
              </div>
            </div>
          )}

          {/* SECTION 4: VERIFICATIONS & PROGRESS */}
          {activeSection === 'verifications' && (
            <div style={styles.docArticle}>
              <div style={styles.badgePill}>COMPLIANCE</div>
              <h2 style={styles.docTitle}>Page 3: Contractor Verification & Milestone Progress</h2>
              <p style={styles.docLead}>
                Enforce quality control by reviewing contractor credentials, licensing states, and overseeing ongoing restoration milestones.
              </p>

              <h3 style={styles.h3}>Contractor Verification Protocol (SOP)</h3>
              <div style={styles.stepsList}>
                <div style={styles.stepItem}>
                  <strong>Step 1: Check License Number & State</strong>
                  <p>Cross-reference the contractor's state license jurisdiction with official state licensing registries.</p>
                </div>
                <div style={styles.stepItem}>
                  <strong>Step 2: Confirm Business Phone & Entity</strong>
                  <p>Verify business name and phone against public records or contractor insurance filings.</p>
                </div>
                <div style={styles.stepItem}>
                  <strong>Step 3: Approve or Reject with Reason</strong>
                  <p>Click "Approve" to activate contractor tools, or "Reject" with mandatory logged reason.</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: LEAD MANAGEMENT */}
          {activeSection === 'leads' && (
            <div style={styles.docArticle}>
              <div style={styles.badgePill}>CRM ENQUIRIES</div>
              <h2 style={styles.docTitle}>Page 4: Lead Inquiries & 30-Day Auto Hot Priority</h2>
              <p style={styles.docLead}>
                Capture incoming Contact Us and Reach Out inquiries from customers and contractors with automatic time-sensitive qualification.
              </p>

              <h3 style={styles.h3}>The 30-Day Auto Hot Priority Rule</h3>
              <div style={styles.highlightBox}>
                🔥 <strong>Hot Priority Automation:</strong> Any inquiry submitted or updated within the last 30 calendar days is automatically flagged with <code>HOT</code> priority and appears in the <strong>Hot Priority</strong> tab. Inquiries older than 30 days automatically shift to standard status.
              </div>

              <h3 style={styles.h3}>Isolated Tabs Architecture</h3>
              <ul style={styles.bulletList}>
                <li><strong>Hot Priority Tab</strong>: Immediate attention queue (&le; 30 days).</li>
                <li><strong>Customer Leads Tab</strong>: Exclusively homeowner inquiries and estimate assistance requests.</li>
                <li><strong>Contractor Leads Tab</strong>: Inquiries from contractor specialists seeking assistance or partner onboarding.</li>
                <li><strong>All Leads Tab</strong>: Complete database record with multi-parameter filter panel.</li>
              </ul>
            </div>
          )}

          {/* SECTION 6: PROJECTS */}
          {activeSection === 'projects' && (
            <div style={styles.docArticle}>
              <div style={styles.badgePill}>OPERATIONS</div>
              <h2 style={styles.docTitle}>Page 5: Projects Directory & Progress Slider</h2>
              <p style={styles.docLead}>
                Oversee active deck restoration stages, track crew milestones from 0% to 100%, and inspect deck dimensions.
              </p>

              <h3 style={styles.h3}>Updating Milestones</h3>
              <p style={styles.text}>
                Click <strong>Update Progress</strong> on any project to open the progress modal:
              </p>
              <ul style={styles.bulletList}>
                <li><strong>Progress Slider</strong>: Set exact completion percentage (0% to 100%). Setting 100% marks the project completed.</li>
                <li><strong>Milestone Status</strong>: In Progress, Completed, On Hold, or Cancelled.</li>
                <li><strong>History Log</strong>: Notes recorded with timestamp and admin attribution.</li>
              </ul>
            </div>
          )}

          {/* SECTION 7: PRICING & DISCOUNTS */}
          {activeSection === 'pricing' && (
            <div style={styles.docArticle}>
              <div style={styles.badgePill}>CALCULATION ENGINE</div>
              <h2 style={styles.docTitle}>Page 6: Pricing & Discounts Unified Engine</h2>
              <p style={styles.docLead}>
                Centrally administer all calculator pricing parameters, labor productivity ratios, and tiered contractor incentive discounts.
              </p>

              <h3 style={styles.h3}>Pricing Multipliers Formula</h3>
              <div style={styles.codeBlock}>
                <code>Total Job = (Material Cost + Labor Hours × Hourly Rate) × (1 + Waste% + Markup%)</code>
              </div>

              <h3 style={styles.h3}>Contractor Tier Incentive Matrix</h3>
              <table style={styles.manualTable}>
                <thead>
                  <tr>
                    <th>Tier Name</th>
                    <th>Completed Projects Requirement</th>
                    <th>Standard Discount</th>
                    <th>Policy Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Standard Tier</strong></td>
                    <td>0 – 5 Completed Projects</td>
                    <td><strong>10%</strong></td>
                    <td>Global platform baseline for all verified contractors.</td>
                  </tr>
                  <tr>
                    <td><strong>Gold Tier</strong></td>
                    <td>6 – 15 Completed Projects</td>
                    <td><strong>12%</strong></td>
                    <td>Performance incentive for regular partners.</td>
                  </tr>
                  <tr>
                    <td><strong>Platinum Tier</strong></td>
                    <td>16+ Completed Projects</td>
                    <td><strong>15%</strong></td>
                    <td>Top-tier partner incentive for high-volume specialists.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* SECTION 8: REPORTS & ANALYTICS */}
          {activeSection === 'reports' && (
            <div style={styles.docArticle}>
              <div style={styles.badgePill}>BUSINESS INTELLIGENCE</div>
              <h2 style={styles.docTitle}>Page 7: Reports & Analytics Hub</h2>
              <p style={styles.docLead}>
                Exportable financial summaries, estimate conversion telemetry, and contractor performance benchmarks.
              </p>

              <h3 style={styles.h3}>Export Capabilities</h3>
              <p style={styles.text}>
                Every report tab can be downloaded in two formats using the header buttons:
              </p>
              <ul style={styles.bulletList}>
                <li><strong>Export CSV</strong>: Standard comma-separated format for Excel, Google Sheets, or data warehouses.</li>
                <li><strong>Export Excel</strong>: Direct binary spreadsheet format with formatted columns and metadata.</li>
              </ul>
            </div>
          )}

          {/* SECTION 9: SYSTEM SETTINGS */}
          {activeSection === 'settings' && (
            <div style={styles.docArticle}>
              <div style={styles.badgePill}>CONFIGURATION & COMMUNICATIONS</div>
              <h2 style={styles.docTitle}>Page 8: System Settings & Targeted Notifications</h2>
              <p style={styles.docLead}>
                Manage company branding, official WhatsApp & phone numbers, and broadcast in-app notifications directly to customer and contractor portals.
              </p>

              <h3 style={styles.h3}>Targeted Notification Dispatcher</h3>
              <p style={styles.text}>
                Administrators can compose and dispatch announcements with four targeting options:
              </p>
              <ol style={styles.numberList}>
                <li><strong>All Customers</strong>: Broadcasts notice to every registered homeowner.</li>
                <li><strong>All Contractors</strong>: Broadcasts notice to all verified contractors.</li>
                <li><strong>Both (Everyone)</strong>: Platform-wide broadcast.</li>
                <li><strong>Specific User(s)</strong>: Live search by name, email, or phone to send a targeted message to individual recipients.</li>
              </ol>
            </div>
          )}

          {/* SECTION 10: DAILY & WEEKLY SOPS */}
          {activeSection === 'sop' && (
            <div style={styles.docArticle}>
              <div style={styles.badgePill}>PROCEDURES</div>
              <h2 style={styles.docTitle}>Page 10: Administrator Daily & Weekly SOPs</h2>
              <p style={styles.docLead}>
                Standard Operating Procedures to maintain high customer satisfaction, fast lead response times, and platform data integrity.
              </p>

              <h3 style={styles.h3}>Daily Morning Checklist (9:00 AM)</h3>
              <div style={styles.checklist}>
                <label style={styles.checkItem}>
                  <input type="checkbox" defaultChecked style={styles.chk} />
                  <span>1. Review <strong>Hot Priority Leads</strong> tab and ensure all new inquiries are contacted within 2 hours.</span>
                </label>
                <label style={styles.checkItem}>
                  <input type="checkbox" defaultChecked style={styles.chk} />
                  <span>2. Inspect <strong>Verification & Progress</strong> queue for pending contractor license applications.</span>
                </label>
                <label style={styles.checkItem}>
                  <input type="checkbox" style={styles.chk} />
                  <span>3. Verify active project progress updates and contact contractors with stalled milestones (&gt;5 days).</span>
                </label>
                <label style={styles.checkItem}>
                  <input type="checkbox" style={styles.chk} />
                  <span>4. Check System Settings DB connection status to verify MongoDB Atlas connectivity.</span>
                </label>
              </div>

              <h3 style={styles.h3}>Weekly Maintenance Checklist (Monday 10:00 AM)</h3>
              <div style={styles.checklist}>
                <label style={styles.checkItem}>
                  <input type="checkbox" style={styles.chk} />
                  <span>1. Export weekly <strong>Reports & Analytics</strong> CSV for executive management review.</span>
                </label>
                <label style={styles.checkItem}>
                  <input type="checkbox" style={styles.chk} />
                  <span>2. Review contractor completed projects count and apply 12% Gold or 15% Platinum discount incentives.</span>
                </label>
                <label style={styles.checkItem}>
                  <input type="checkbox" style={styles.chk} />
                  <span>3. Dispatch targeted announcement or maintenance reminder via <strong>System Settings Notifications</strong>.</span>
                </label>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px 32px',
    backgroundColor: '#f8fafc',
    minHeight: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: '4px 0 0',
  },
  btnPrint: {
    padding: '9px 16px',
    backgroundColor: '#ffffff',
    color: '#1d4ed8',
    border: '1px solid #1d4ed8',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '12px',
    cursor: 'pointer',
  },
  handbookGrid: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    gap: '24px',
    alignItems: 'start',
  },
  navCol: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '16px',
    position: 'sticky',
    top: '20px',
  },
  searchBox: {
    marginBottom: '14px',
  },
  searchInput: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '12px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  navList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#475569',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  navItemActive: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    fontWeight: '700',
  },
  supportBox: {
    marginTop: '20px',
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
  contentCol: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '32px',
    minHeight: '650px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  docArticle: {
    maxWidth: '820px',
  },
  badgePill: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '800',
    color: '#1d4ed8',
    backgroundColor: '#eff6ff',
    padding: '3px 8px',
    borderRadius: '4px',
    letterSpacing: '0.05em',
    marginBottom: '10px',
  },
  docTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 10px',
  },
  docLead: {
    fontSize: '14px',
    color: '#475569',
    lineHeight: '1.6',
    margin: '0 0 24px',
  },
  h3: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '24px 0 12px',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '8px',
  },
  text: {
    fontSize: '13px',
    color: '#334155',
    lineHeight: '1.6',
    margin: '0 0 12px',
  },
  flowCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '18px',
    margin: '18px 0',
  },
  flowTitle: {
    margin: '0 0 14px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#0f172a',
    textTransform: 'uppercase',
  },
  flowSteps: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    overflowX: 'auto',
  },
  stepBox: {
    flex: 1,
    minWidth: '130px',
    backgroundColor: '#ffffff',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    textAlign: 'center',
  },
  stepNum: {
    display: 'inline-flex',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '6px',
  },
  stepDesc: {
    margin: '4px 0 0',
    fontSize: '11px',
    color: '#64748b',
    lineHeight: '1.3',
  },
  stepArrow: {
    color: '#94a3b8',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  manualTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
    margin: '14px 0',
    border: '1px solid #e2e8f0',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '14px',
    margin: '14px 0',
  },
  cardInfo: {
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '12px',
  },
  bulletList: {
    margin: '8px 0 16px 20px',
    fontSize: '13px',
    color: '#334155',
    lineHeight: '1.6',
  },
  numberList: {
    margin: '8px 0 16px 20px',
    fontSize: '13px',
    color: '#334155',
    lineHeight: '1.6',
  },
  tipBox: {
    padding: '12px 16px',
    backgroundColor: '#eff6ff',
    borderLeft: '4px solid #1d4ed8',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#1e40af',
    margin: '14px 0',
  },
  highlightBox: {
    padding: '12px 16px',
    backgroundColor: '#fffbeb',
    borderLeft: '4px solid #f59e0b',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#92400e',
    margin: '14px 0',
  },
  codeBlock: {
    padding: '12px 16px',
    backgroundColor: '#0f172a',
    color: '#38bdf8',
    borderRadius: '6px',
    fontSize: '12px',
    fontFamily: 'monospace',
    margin: '14px 0',
  },
  stepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    margin: '12px 0',
  },
  stepItem: {
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '13px',
  },
  checklist: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    margin: '14px 0',
  },
  checkItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '10px 14px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '13px',
    color: '#1e293b',
    cursor: 'pointer',
  },
  chk: {
    marginTop: '3px',
    accentColor: '#1d4ed8',
  },
};

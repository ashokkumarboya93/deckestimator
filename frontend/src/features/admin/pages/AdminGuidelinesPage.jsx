// =============================================
// Deck Estimator — Admin Portal Operational Handbook & Guidelines
// =============================================
// Comprehensive visual and document-style handbook:
// - Detailed operational documentation for each page and tab in the portal
// - Interactive section browser, search filter, visual flowcharts, and rule tables
// - Direct one-click navigation to every page and sub-tab in the Admin Portal
// - Standard Operating Procedures (SOPs), role access matrix, and verification guidelines
// - 100% SVG Iconography and modern responsive layout

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SECTIONS = [
  { id: 'overview', title: '1. Architecture & Platform Lifecycle', path: '/admin/dashboard' },
  { id: 'dashboard', title: '2. Executive Operations Dashboard', path: '/admin/dashboard' },
  { id: 'users', title: '3. User Management & Appeal Requests', path: '/admin/users' },
  { id: 'verifications', title: '4. Contractor Verification & Documents', path: '/admin/verification-progress' },
  { id: 'leads', title: '5. Lead Inquiries & Raised Requests', path: '/admin/leads' },
  { id: 'projects', title: '6. Projects & 4-Stage Life Cycle', path: '/admin/projects' },
  { id: 'pricing', title: '7. Pricing & Discounts Tuning Engine', path: '/admin/pricing' },
  { id: 'reports', title: '8. Business Intelligence & Reports', path: '/admin/reports' },
  { id: 'settings', title: '9. System Settings & Broadcast Alerts', path: '/admin/settings' },
  { id: 'sop', title: '10. Administrator Daily & Weekly SOPs', path: '/admin/dashboard' },
];

export default function AdminGuidelinesPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = SECTIONS.filter((s) => {
    if (!searchQuery.trim()) return true;
    return s.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const renderSectionIcon = (id) => {
    switch (id) {
      case 'overview':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        );
      case 'dashboard':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        );
      case 'users':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );
      case 'verifications':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        );
      case 'leads':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        );
      case 'projects':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        );
      case 'pricing':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        );
      case 'reports':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        );
      case 'settings':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        );
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitleRow}>
            <h1 style={styles.title}>Administrator Guidelines & Operational Manual</h1>
            <span style={styles.liveBadge}>Platform Version 2.4 • Live System Docs</span>
          </div>
          <p style={styles.subtitle}>
            Comprehensive operational documentation, page navigation, and standard operating procedures (SOP) for central platform administrators.
          </p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={() => window.print()} style={styles.btnPrint}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: 6 }}>
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print / Save as PDF
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
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {renderSectionIcon(sec.id)}
                </span>
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
              <div style={styles.articleHeader}>
                <div>
                  <div style={styles.badgePill}>ARCHITECTURE OVERVIEW</div>
                  <h2 style={styles.docTitle}>Platform Lifecycle & Operational Ecosystem</h2>
                </div>
                <button onClick={() => navigate('/admin/dashboard')} style={styles.navPageBtn}>
                  Open Dashboard →
                </button>
              </div>

              <p style={styles.docLead}>
                Deck Restoration Plus operates as a synchronized three-tier ecosystem connecting Homeowners (Customers),
                Vetted Specialists (Contractors), and Platform Administrators via a centralized MongoDB Atlas datastore.
              </p>

              <div style={styles.infoCallout}>
                <h4 style={{ margin: '0 0 6px', color: '#034EA2' }}>Core Ecosystem Pillars</h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#334155', lineHeight: '1.6' }}>
                  <li><strong>Customer Estimator:</strong> Self-service deck measurement, wood selection, and instant price estimation without mandatory minimum job price enforcement.</li>
                  <li><strong>Contractor Portal:</strong> Professional estimation engine featuring wholesale trade discount margins (10% default or customized overrides).</li>
                  <li><strong>Admin Portal:</strong> Central command center monitoring accounts, inquiries, discrete 4-stage project lifecycles, and pricing rate cards.</li>
                </ul>
              </div>

              <h3 style={styles.sectionHeading}>4-Stage Project Life Cycle</h3>
              <div style={styles.stepGrid}>
                <div style={styles.stepCard}>
                  <div style={styles.stepNum}>1</div>
                  <strong>Created</strong>
                  <p>Customer or Contractor generates a deck estimation calculation.</p>
                </div>
                <div style={styles.stepCard}>
                  <div style={styles.stepNum}>2</div>
                  <strong>Requested (Amber)</strong>
                  <p>User clicks "Reach Out" or requests booking assistance for their estimate.</p>
                </div>
                <div style={styles.stepCard}>
                  <div style={styles.stepNum}>3</div>
                  <strong>In Progress (Blue)</strong>
                  <p>Admin dispatches crew and commences physical surface restoration.</p>
                </div>
                <div style={styles.stepCard}>
                  <div style={styles.stepNum}>4</div>
                  <strong>Completed (Green)</strong>
                  <p>Restoration delivered, inspected, and archived in historical database.</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: EXECUTIVE OPERATIONS DASHBOARD */}
          {activeSection === 'dashboard' && (
            <div style={styles.docArticle}>
              <div style={styles.articleHeader}>
                <div>
                  <div style={styles.badgePill}>PAGE GUIDANCE: /admin/dashboard</div>
                  <h2 style={styles.docTitle}>Executive Operations Dashboard</h2>
                </div>
                <button onClick={() => navigate('/admin/dashboard')} style={styles.navPageBtn}>
                  Go to Dashboard →
                </button>
              </div>

              <p style={styles.docLead}>
                The Executive Dashboard displays 100% real-time MongoDB metrics using the pastel pill summary card design.
              </p>

              <h3 style={styles.sectionHeading}>Component Breakdown</h3>
              <div style={styles.featuresList}>
                <div style={styles.featureItem}>
                  <strong>Row 1: Platform Users & Inquiries</strong>
                  <p>Total Users (Blue), Customers (Sky Blue), Contractors (Amber), and Total Leads (Emerald) with dynamic 30-day growth percentages.</p>
                </div>
                <div style={styles.featureItem}>
                  <strong>Row 2: Operations & Estimations</strong>
                  <p>Hot Priority Leads (Rose fire card), Active Projects (Cyan), Total Estimates (Purple), and Estimated Value (Green dollar volume).</p>
                </div>
                <div style={styles.featureItem}>
                  <strong>Activity Trend & Lead Overview Charts</strong>
                  <p>Interactive SVG line chart showing platform velocity and donut distribution by user role.</p>
                </div>
                <div style={styles.featureItem}>
                  <strong>Recent Activities & Distribution Bar Plot</strong>
                  <p>Live stream of latest audit logs and visual breakdown of account verification status.</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: USER MANAGEMENT & APPEALS */}
          {activeSection === 'users' && (
            <div style={styles.docArticle}>
              <div style={styles.articleHeader}>
                <div>
                  <div style={styles.badgePill}>PAGE GUIDANCE: /admin/users</div>
                  <h2 style={styles.docTitle}>User Management & Appeal Requests</h2>
                </div>
                <button onClick={() => navigate('/admin/users')} style={styles.navPageBtn}>
                  Go to Users →
                </button>
              </div>

              <p style={styles.docLead}>
                Manage all registered customers and contractors, enforce security moderation, and review account unblock appeals.
              </p>

              <h3 style={styles.sectionHeading}>4 Dedicated Tabs</h3>
              <div style={styles.featuresList}>
                <div style={styles.featureItem}>
                  <strong>1. All Users:</strong> Complete directory with search, status filters (active, pending, blocked), and quick action controls.
                </div>
                <div style={styles.featureItem}>
                  <strong>2. Customers:</strong> Homeowner accounts with contact details, registration timestamps, and email verification indicators.
                </div>
                <div style={styles.featureItem}>
                  <strong>3. Contractors:</strong> Trade specialist accounts displaying license numbers, company names, and verification tiers.
                </div>
                <div style={styles.featureItem}>
                  <strong>4. User Requests (Appeals):</strong> Dedicated queue where blocked accounts can submit unblock requests with reasons for administrative review.
                </div>
              </div>

              <div style={styles.warningCallout}>
                <strong>Account Moderation Protocol:</strong> Blocking an account immediately locks the customer or contractor portal, displaying a warning notice directing them to submit an unblocking request to the Deck Restoration Plus team.
              </div>
            </div>
          )}

          {/* SECTION 4: CONTRACTOR VERIFICATION & DOCUMENTS */}
          {activeSection === 'verifications' && (
            <div style={styles.docArticle}>
              <div style={styles.articleHeader}>
                <div>
                  <div style={styles.badgePill}>PAGE GUIDANCE: /admin/verification-progress</div>
                  <h2 style={styles.docTitle}>Contractor Verification & Document Compliance</h2>
                </div>
                <button onClick={() => navigate('/admin/verification-progress')} style={styles.navPageBtn}>
                  Go to Verifications →
                </button>
              </div>

              <p style={styles.docLead}>
                Review trade contractor licenses, insurance policies, and business credentials before approving marketplace access.
              </p>

              <h3 style={styles.sectionHeading}>Operational Workflow</h3>
              <div style={styles.featuresList}>
                <div style={styles.featureItem}>
                  <strong>Contractor Profiles Tab:</strong> Inspect company legal names, license numbers, jurisdictions, and years of experience. One-click Approve or Reject with reason logging.
                </div>
                <div style={styles.featureItem}>
                  <strong>Uploaded Documents Tab:</strong> Inspect uploaded insurance policies, liability certificates, and trade licenses. Mark documents as Verified or Rejected.
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: LEAD MANAGEMENT & RAISED REQUESTS */}
          {activeSection === 'leads' && (
            <div style={styles.docArticle}>
              <div style={styles.articleHeader}>
                <div>
                  <div style={styles.badgePill}>PAGE GUIDANCE: /admin/leads</div>
                  <h2 style={styles.docTitle}>Lead Inquiries & Reach-Out Requests Hub</h2>
                </div>
                <button onClick={() => navigate('/admin/leads')} style={styles.navPageBtn}>
                  Go to Leads →
                </button>
              </div>

              <p style={styles.docLead}>
                Monitors real customer and contractor reach-out requests, service inquiries, and project bookings.
              </p>

              <h3 style={styles.sectionHeading}>Table Columns & Features</h3>
              <div style={styles.tableResponsive}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Column</th>
                      <th style={styles.th}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={styles.tr}>
                      <td style={styles.td}><strong>Contact Person</strong></td>
                      <td style={styles.td}>Name, email, phone number, and account role initials.</td>
                    </tr>
                    <tr style={styles.tr}>
                      <td style={styles.td}><strong>Type & Source</strong></td>
                      <td style={styles.td}>Customer/Contractor origin. Tagged as "Estimation Service" if booked from an estimate.</td>
                    </tr>
                    <tr style={styles.tr}>
                      <td style={styles.td}><strong>Requested Message</strong></td>
                      <td style={styles.td}>Full inquiry message text submitted by the user.</td>
                    </tr>
                    <tr style={styles.tr}>
                      <td style={styles.td}><strong>Priority</strong></td>
                      <td style={styles.td}>HOT Priority (last 30 days reach-out) or Standard.</td>
                    </tr>
                    <tr style={styles.tr}>
                      <td style={styles.td}><strong>Date & Time</strong></td>
                      <td style={styles.td}>Timestamp of the reach-out request.</td>
                    </tr>
                    <tr style={styles.tr}>
                      <td style={styles.td}><strong>Location</strong></td>
                      <td style={styles.td}>City and state of the deck project.</td>
                    </tr>
                    <tr style={styles.tr}>
                      <td style={styles.td}><strong>Actions</strong></td>
                      <td style={styles.td}>View Details modal with full section-wise inputs and pricing breakdown.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 style={styles.sectionHeading}>All Leads Archive & Cutoff Date Selector</h3>
              <p style={{ fontSize: '13px', color: '#475569' }}>
                In the <strong>All Leads & History</strong> tab, admins can select a custom <strong>Last Date Cutoff</strong> to filter and export older customer records, complete with pagination controls.
              </p>
            </div>
          )}

          {/* SECTION 6: PROJECTS DIRECTORY & 4-STAGE LIFE CYCLE */}
          {activeSection === 'projects' && (
            <div style={styles.docArticle}>
              <div style={styles.articleHeader}>
                <div>
                  <div style={styles.badgePill}>PAGE GUIDANCE: /admin/projects</div>
                  <h2 style={styles.docTitle}>Project Management & Discrete 4-Stage Tracking</h2>
                </div>
                <button onClick={() => navigate('/admin/projects')} style={styles.navPageBtn}>
                  Go to Projects →
                </button>
              </div>

              <p style={styles.docLead}>
                Tracks both customer and contractor estimations as projects across 4 discrete stages without percentages.
              </p>

              <h3 style={styles.sectionHeading}>Summary Metric Cards (Pastel Pill Design)</h3>
              <div style={styles.featuresList}>
                <div style={styles.featureItem}>
                  <strong>TOTAL ESTIMATIONS (Blue):</strong> All active deck estimates created across the platform.
                </div>
                <div style={styles.featureItem}>
                  <strong>REQUESTED PROJECTS (Amber):</strong> Estimates where the user clicked "Reach Out" or requested a project booking.
                </div>
                <div style={styles.featureItem}>
                  <strong>IN PROGRESS (Purple):</strong> Active restoration projects currently underway.
                </div>
                <div style={styles.featureItem}>
                  <strong>COMPLETED PROJECTS (Emerald):</strong> Finished and delivered restoration jobs.
                </div>
              </div>

              <h3 style={styles.sectionHeading}>Real-Time Stage Synchronization</h3>
              <p style={{ fontSize: '13px', color: '#475569' }}>
                When an administrator updates a project stage via the <strong>Update Stage</strong> action, the new stage and customer note are saved in MongoDB and immediately reflected on both customer and contractor portals in real time.
              </p>
            </div>
          )}

          {/* SECTION 7: PRICING & DISCOUNTS ENGINE */}
          {activeSection === 'pricing' && (
            <div style={styles.docArticle}>
              <div style={styles.articleHeader}>
                <div>
                  <div style={styles.badgePill}>PAGE GUIDANCE: /admin/pricing</div>
                  <h2 style={styles.docTitle}>Estimator Pricing & Options Tuning Engine</h2>
                </div>
                <button onClick={() => navigate('/admin/pricing')} style={styles.navPageBtn}>
                  Go to Pricing Engine →
                </button>
              </div>

              <p style={styles.docLead}>
                Central pricing configuration with 6 dedicated tabs, clean SVG vector icons, and dynamic catalog item management.
              </p>

              <div style={styles.featuresList}>
                <div style={styles.featureItem}>
                  <strong>1. Master Rates & Thresholds:</strong> Labor Rate ($250/hr), Rate Position Interpolator (50%), Stacked Finish surcharge ($1.00/sq ft), and Minimum Mobilization Prices ($2,500 Near, $3,000 Far).
                </div>
                <div style={styles.featureItem}>
                  <strong>2. Base Rate Card Matrix:</strong> 12-cell sq ft rate matrix across Clean, Strip, Strip & Sand prep against 4 protective finishes (Clear Sealer, Semi-Transparent, Semi-Solid, Solid Stain).
                </div>
                <div style={styles.featureItem}>
                  <strong>3. Wood Species & Materials:</strong> Dynamic table of wood species with labor difficulty multipliers (+10% Cedar, +15% Redwood, +30% Tigerwood). Full Add New, Edit, and Delete support.
                </div>
                <div style={styles.featureItem}>
                  <strong>4. Deck Architectural Components:</strong> Railings, stairs, skirting, benches, and pergolas with area conversion multipliers. Full Add New, Edit, and Delete support.
                </div>
                <div style={styles.featureItem}>
                  <strong>5. Scope of Work & Production Speeds:</strong> Technician speeds in sq ft per man-hour for preparation, washing, and staining. Full Add New, Edit, and Delete support.
                </div>
                <div style={styles.featureItem}>
                  <strong>6. Contractor Trade Discounts:</strong> Dedicated tab for wholesale discounts. Configure platform-wide default (10%) and set individual custom discount overrides per contractor.
                </div>
              </div>
            </div>
          )}

          {/* SECTION 8: REPORTS & BUSINESS INTELLIGENCE */}
          {activeSection === 'reports' && (
            <div style={styles.docArticle}>
              <div style={styles.articleHeader}>
                <div>
                  <div style={styles.badgePill}>PAGE GUIDANCE: /admin/reports</div>
                  <h2 style={styles.docTitle}>Reports & Business Intelligence</h2>
                </div>
                <button onClick={() => navigate('/admin/reports')} style={styles.navPageBtn}>
                  Go to Reports →
                </button>
              </div>

              <p style={styles.docLead}>
                Live analytical reports backed by real MongoDB aggregations with zero static fallbacks or hardcoded numbers.
              </p>

              <div style={styles.featuresList}>
                <div style={styles.featureItem}>
                  <strong>Pastel Pill Summary KPI Cards:</strong> TOTAL ESTIMATIONS, COMPLETED PROJECTS, TOTAL REVENUE, and TOTAL ESTIMATIONS VALUE.
                </div>
                <div style={styles.featureItem}>
                  <strong>Interactive SVG Trajectory Chart:</strong> Dynamic monthly platform volume with hover revenue tooltips.
                </div>
                <div style={styles.featureItem}>
                  <strong>Wood Demand Distribution:</strong> Dynamically aggregated percentages of customer lumber choices directly from database estimates.
                </div>
                <div style={styles.featureItem}>
                  <strong>Export Support:</strong> Download analytical summaries for any of the 8 tabs in CSV or Excel format.
                </div>
              </div>
            </div>
          )}

          {/* SECTION 9: SYSTEM SETTINGS & BROADCASTS */}
          {activeSection === 'settings' && (
            <div style={styles.docArticle}>
              <div style={styles.articleHeader}>
                <div>
                  <div style={styles.badgePill}>PAGE GUIDANCE: /admin/settings</div>
                  <h2 style={styles.docTitle}>System Settings & Targeted Broadcast Engine</h2>
                </div>
                <button onClick={() => navigate('/admin/settings')} style={styles.navPageBtn}>
                  Go to Settings →
                </button>
              </div>

              <p style={styles.docLead}>
                Configure platform branding, WhatsApp support lines, security sessions, and dispatch targeted broadcast notifications.
              </p>

              <div style={styles.featuresList}>
                <div style={styles.featureItem}>
                  <strong>Targeted Broadcast Engine:</strong> Send messages to All Customers, All Contractors, Both Groups, or Specific Users. Messages persist in MongoDB and display directly in user notifications.
                </div>
                <div style={styles.featureItem}>
                  <strong>Clean SVG Controls:</strong> All audience selector icons and broadcast buttons feature sleek vector graphics.
                </div>
                <div style={styles.featureItem}>
                  <strong>System Diagnostics:</strong> Real-time MongoDB Atlas health check, Node.js version, and server uptime.
                </div>
              </div>
            </div>
          )}

          {/* SECTION 10: SOPS */}
          {activeSection === 'sop' && (
            <div style={styles.docArticle}>
              <div style={styles.articleHeader}>
                <div>
                  <div style={styles.badgePill}>STANDARD OPERATING PROCEDURES</div>
                  <h2 style={styles.docTitle}>Administrator Daily & Weekly SOPs</h2>
                </div>
                <button onClick={() => navigate('/admin/dashboard')} style={styles.navPageBtn}>
                  Dashboard Overview →
                </button>
              </div>

              <p style={styles.docLead}>
                Standard Operating Procedures for platform administrators ensuring responsiveness, compliance, and accurate pricing.
              </p>

              <h3 style={styles.sectionHeading}>Daily Checklist (Morning & Afternoon)</h3>
              <div style={styles.featuresList}>
                <div style={styles.featureItem}>
                  <strong>1. Review Hot Priority Leads:</strong> Check `/admin/leads` Hot Priority tab for new user reach-out requests submitted in the last 24 hours. Contact homeowners or assign to specialists.
                </div>
                <div style={styles.featureItem}>
                  <strong>2. Review Account Appeals:</strong> Check `/admin/users` User Requests tab for blocked accounts requesting reactivation.
                </div>
                <div style={styles.featureItem}>
                  <strong>3. Update Project Stages:</strong> Check `/admin/projects` and update project stages from `requested` to `in progress` or `completed` as physical deck work progresses.
                </div>
                <div style={styles.featureItem}>
                  <strong>4. Review Contractor Credentials:</strong> Check `/admin/verification-progress` for pending contractor profile submissions and uploaded insurance documents.
                </div>
              </div>

              <h3 style={styles.sectionHeading}>Weekly Review Checklist</h3>
              <div style={styles.featuresList}>
                <div style={styles.featureItem}>
                  <strong>1. Export Performance Reports:</strong> Download weekly CSV/Excel reports from `/admin/reports` to monitor gross volume and conversion rates.
                </div>
                <div style={styles.featureItem}>
                  <strong>2. Calibrate Material Pricing:</strong> Review `/admin/pricing` base rate matrix and wood species multipliers to match seasonal lumber costs.
                </div>
                <div style={styles.featureItem}>
                  <strong>3. Contractor Partner Discounts:</strong> Audit wholesale trade discounts and customize high-performing contractor incentives.
                </div>
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
    padding: '24px',
    maxWidth: '1440px',
    margin: '0 auto',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '14px',
  },
  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.3px',
  },
  liveBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 10px',
    borderRadius: '9999px',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    fontSize: '11px',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: '4px 0 0',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  btnPrint: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '7px 14px',
    borderRadius: '9999px',
    backgroundColor: '#ffffff',
    color: '#334155',
    border: '1px solid #cbd5e1',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },

  // Layout Grid
  handbookGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(260px, 320px) 1fr',
    gap: '20px',
    alignItems: 'start',
  },
  navCol: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  searchBox: {
    marginBottom: '12px',
  },
  searchInput: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '12px',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
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
    padding: '9px 12px',
    borderRadius: '8px',
    border: 'none',
    background: 'none',
    color: '#475569',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textAlign: 'left',
    width: '100%',
  },
  navItemActive: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontWeight: '700',
  },
  supportBox: {
    marginTop: '16px',
    padding: '12px',
    borderRadius: '10px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
  },

  // Content Column
  contentCol: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '28px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  docArticle: {
    display: 'flex',
    flexDirection: 'column',
  },
  articleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '16px',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '16px',
    flexWrap: 'wrap',
  },
  badgePill: {
    display: 'inline-block',
    fontSize: '10px',
    fontWeight: '800',
    color: '#047857',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    padding: '3px 8px',
    borderRadius: '4px',
    marginBottom: '8px',
    letterSpacing: '0.5px',
  },
  docTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.3px',
  },
  navPageBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '7px 16px',
    borderRadius: '9999px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  docLead: {
    fontSize: '14px',
    color: '#475569',
    lineHeight: '1.6',
    margin: '0 0 20px',
  },
  sectionHeading: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '24px 0 12px',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '6px',
  },
  infoCallout: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
  },
  warningCallout: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '12px',
    padding: '14px 16px',
    fontSize: '13px',
    color: '#92400e',
    lineHeight: '1.5',
    marginTop: '16px',
  },
  stepGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
  },
  stepCard: {
    padding: '14px',
    borderRadius: '10px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    fontSize: '12px',
    color: '#475569',
  },
  stepNum: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '11px',
    marginBottom: '8px',
  },
  featuresList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  featureItem: {
    padding: '12px 14px',
    borderRadius: '10px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    fontSize: '13px',
    color: '#334155',
    lineHeight: '1.5',
  },
  tableResponsive: {
    overflowX: 'auto',
    width: '100%',
    marginBottom: '16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '13px',
  },
  th: {
    padding: '10px 12px',
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontSize: '11px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #e2e8f0',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '10px 12px',
    verticalAlign: 'top',
  },
};

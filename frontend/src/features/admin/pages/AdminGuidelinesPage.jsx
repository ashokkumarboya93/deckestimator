// =============================================
// Deck Estimator — Admin Portal Operational Handbook & Guidelines
// =============================================
// Comprehensive visual and document-style handbook:
// - Detailed operational documentation for each page and tab in the portal
// - Interactive section browser, search filter, visual flowcharts, and rule tables
// - Direct one-click navigation to every page and sub-tab in the Admin Portal
// - Standard Operating Procedures (SOPs), role access matrix, and verification guidelines
// - Direct one-click PDF downloads for both Admin Manual and Calculator Formulas Guide
// - 100% SVG Iconography and modern responsive layout

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { downloadAdminManualPdf, downloadCalculatorFormulasPdf } from '../../../utils/adminGuidelinesPdf';

const SECTIONS = [
  { id: 'overview', title: '1. Architecture & Platform Lifecycle', path: '/admin/dashboard' },
  { id: 'dashboard', title: '2. Executive Operations Dashboard', path: '/admin/dashboard' },
  { id: 'users', title: '3. User Management & Moderation', path: '/admin/users' },
  { id: 'verifications', title: '4. Contractor Verification & Documents', path: '/admin/verification-progress' },
  { id: 'leads', title: '5. Lead Inquiries & Reach-Outs Hub', path: '/admin/leads' },
  { id: 'projects', title: '6. Projects & 4-Stage Life Cycle', path: '/admin/projects' },
  { id: 'pricing', title: '7. Pricing & Discounts Tuning Engine', path: '/admin/pricing-discounts' },
  { id: 'reports', title: '8. Business Intelligence & Reports', path: '/admin/reports' },
  { id: 'settings', title: '9. System Settings & Broadcast Alerts', path: '/admin/settings' },
  { id: 'sop', title: '10. Administrator Daily & Weekly SOPs', path: '/admin/dashboard' },
  { id: 'calculator', title: '11. Estimator Formulas & Math Architecture', path: '/admin/pricing-discounts' },
];

export default function AdminGuidelinesPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingManual, setDownloadingManual] = useState(false);
  const [downloadingCalc, setDownloadingCalc] = useState(false);

  const filteredSections = SECTIONS.filter((s) => {
    if (!searchQuery.trim()) return true;
    return s.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleDownloadManual = async () => {
    try {
      setDownloadingManual(true);
      await downloadAdminManualPdf();
    } catch (err) {
      console.error('Failed to download admin manual:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingManual(false);
    }
  };

  const handleDownloadCalc = async () => {
    try {
      setDownloadingCalc(true);
      await downloadCalculatorFormulasPdf();
    } catch (err) {
      console.error('Failed to download calculator formulas:', err);
      alert('Failed to generate calculator PDF. Please try again.');
    } finally {
      setDownloadingCalc(false);
    }
  };

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
            <circle cx="12" cy="6" r="1" />
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
      case 'calculator':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <line x1="8" y1="6" x2="16" y2="6" />
            <line x1="16" y1="14" x2="16" y2="18" />
            <path d="M16 10h.01" />
            <path d="M12 10h.01" />
            <path d="M8 10h.01" />
            <path d="M12 14h.01" />
            <path d="M8 14h.01" />
            <path d="M12 18h.01" />
            <path d="M8 18h.01" />
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
            <h1 style={styles.title}>Administrator Guidelines &amp; Operational Manual</h1>
            <span style={styles.liveBadge}>Platform Version 2.4 • Live System Docs</span>
          </div>
          <p style={styles.subtitle}>
            Comprehensive operational documentation, page navigation, standard operating procedures (SOP), and mathematical calculation reference for platform administrators.
          </p>
        </div>
        <div style={styles.headerActions}>
          <button
            onClick={handleDownloadManual}
            disabled={downloadingManual}
            style={styles.btnManualDownload}
            title="Download complete operational manual as a single formatted PDF file"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: 7 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {downloadingManual ? 'Generating PDF...' : 'Download Admin Manual (PDF)'}
          </button>

          <button
            onClick={handleDownloadCalc}
            disabled={downloadingCalc}
            style={styles.btnCalcDownload}
            title="Download technical calculator formulas and worked examples guide as a single PDF"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: 7 }}>
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <line x1="8" y1="6" x2="16" y2="6" />
              <polyline points="10 14 12 16 14 14" />
              <line x1="12" y1="11" x2="12" y2="16" />
            </svg>
            {downloadingCalc ? 'Generating PDF...' : 'Download Calculator Engine & Formulas (PDF)'}
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
                  <h2 style={styles.docTitle}>Platform Lifecycle &amp; Operational Ecosystem</h2>
                </div>
                <button onClick={() => navigate('/admin/dashboard')} style={styles.navPageBtn}>
                  Open Dashboard →
                </button>
              </div>

              <p style={styles.docLead}>
                Deck Restoration Plus operates as a synchronized three-tier ecosystem connecting Homeowners (Customers),
                Vetted Specialists (Contractors), and Platform Administrators via a centralized MongoDB Atlas datastore.
              </p>

              {/* Administrator Capabilities Highlight Box */}
              <div style={styles.capabilitiesCard}>
                <div style={styles.capHeader}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#034ea2" strokeWidth="2.2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#034ea2' }}>
                    What the Administrator is Capable of Doing
                  </h4>
                </div>
                <ul style={styles.capList}>
                  <li><strong>Full Platform Orchestration:</strong> Monitor real-time activities across customers, contractors, and internal staff from a central dashboard.</li>
                  <li><strong>Data Isolation &amp; Safety:</strong> Delete operational records (leads, verifications, projects) safely without corrupting or deleting user profiles.</li>
                  <li><strong>Real-time State Synchronization:</strong> Stage updates made by admin propagate immediately to customer and contractor portals without polling delays.</li>
                  <li><strong>Wholesale Tier Customization:</strong> Configure global contractor discount tiers or customize individual contractor profit margins permanently.</li>
                </ul>
              </div>

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
                  <p>User clicks &quot;Reach Out&quot; or requests booking assistance for their estimate.</p>
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
                The Executive Dashboard displays 100% real-time MongoDB metrics using pastel pill summary cards, visual activity trend curves, and role distribution plots.
              </p>

              <div style={styles.capabilitiesCard}>
                <div style={styles.capHeader}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#034ea2" strokeWidth="2.2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#034ea2' }}>
                    Administrator Capabilities on the Dashboard
                  </h4>
                </div>
                <ul style={styles.capList}>
                  <li><strong>Live Metrics Telemetry:</strong> Track 8 primary KPI metrics across platform accounts, leads, active restorations, and estimated revenue.</li>
                  <li><strong>Interactive Velocity Trajectory:</strong> Hover over platform activity curve to inspect daily user creation and estimation spikes.</li>
                  <li><strong>One-Click Drilldown:</strong> Click any summary pill card to jump straight into its corresponding management module.</li>
                  <li><strong>Audit Activity Stream:</strong> Inspect the latest 20 platform events including stage updates, rate changes, and user status actions.</li>
                </ul>
              </div>

              <h3 style={styles.sectionHeading}>Component Breakdown</h3>
              <div style={styles.featuresList}>
                <div style={styles.featureItem}>
                  <strong>Row 1: Platform Users &amp; Inquiries</strong>
                  <p>Total Users (Blue), Customers (Sky Blue), Contractors (Amber), and Total Leads (Emerald) with dynamic growth indicators.</p>
                </div>
                <div style={styles.featureItem}>
                  <strong>Row 2: Operations &amp; Estimations</strong>
                  <p>Hot Priority Leads (Rose fire card), Active Projects (Cyan), Total Estimates (Purple), and Estimated Value (Green dollar volume).</p>
                </div>
                <div style={styles.featureItem}>
                  <strong>Activity Trend &amp; Lead Overview Charts</strong>
                  <p>Interactive SVG line chart showing platform velocity and donut distribution by user role.</p>
                </div>
                <div style={styles.featureItem}>
                  <strong>Recent Activities &amp; Distribution Bar Plot</strong>
                  <p>Live stream of latest audit logs and visual breakdown of account verification status.</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: USER MANAGEMENT & MODERATION */}
          {activeSection === 'users' && (
            <div style={styles.docArticle}>
              <div style={styles.articleHeader}>
                <div>
                  <div style={styles.badgePill}>PAGE GUIDANCE: /admin/users</div>
                  <h2 style={styles.docTitle}>User Management &amp; Appeal Requests</h2>
                </div>
                <button onClick={() => navigate('/admin/users')} style={styles.navPageBtn}>
                  Go to Users →
                </button>
              </div>

              <p style={styles.docLead}>
                Manage all registered customers and contractors, enforce security moderation, and review account unblock appeals.
              </p>

              <div style={styles.capabilitiesCard}>
                <div style={styles.capHeader}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#034ea2" strokeWidth="2.2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#034ea2' }}>
                    Administrator Capabilities in User Management
                  </h4>
                </div>
                <ul style={styles.capList}>
                  <li><strong>Account Status Control:</strong> Instantly switch account status between Active, Blocked, or Suspended with immediate session revocation.</li>
                  <li><strong>Multi-Select Bulk Operations:</strong> Select multiple user records to perform bulk status updates or export detailed CSV/JSON archives.</li>
                  <li><strong>Confirmation Safeguards:</strong> Deleting accounts requires modal confirmation so accidental deletions are impossible.</li>
                  <li><strong>Appeal Review Queue:</strong> Inspect blocked user unblock appeals and accept or reject with administrative feedback notes.</li>
                </ul>
              </div>

              <h3 style={styles.sectionHeading}>4 Dedicated Tabs</h3>
              <div style={styles.featuresList}>
                <div style={styles.featureItem}>
                  <strong>1. All Users:</strong> Complete directory with search, simplified status filters (Active, Blocked, Inactive), and quick action controls.
                </div>
                <div style={styles.featureItem}>
                  <strong>2. Customers:</strong> Homeowner accounts with contact details, registration timestamps, and verification badges.
                </div>
                <div style={styles.featureItem}>
                  <strong>3. Contractors:</strong> Trade specialist accounts displaying license numbers, company names, and verification tiers.
                </div>
                <div style={styles.featureItem}>
                  <strong>4. User Requests (Appeals):</strong> Dedicated queue where blocked accounts submit unblock requests with reasons for review.
                </div>
              </div>

              <div style={styles.exampleCard}>
                <div style={styles.exampleTitle}>Practical Operational Example: Unblocking an Appealed Contractor</div>
                <p style={styles.exampleText}>
                  A contractor whose license expired was temporarily blocked. After renewing their credentials, they submitted an unblock appeal via their portal. The Admin opens <strong>User Requests</strong> tab, reviews the uploaded updated license, clicks <strong>Approve Appeal</strong>, and the account status instantly reverts to <strong>Active</strong>.
                </p>
              </div>
            </div>
          )}

          {/* SECTION 4: CONTRACTOR VERIFICATION & DOCUMENTS */}
          {activeSection === 'verifications' && (
            <div style={styles.docArticle}>
              <div style={styles.articleHeader}>
                <div>
                  <div style={styles.badgePill}>PAGE GUIDANCE: /admin/verification-progress</div>
                  <h2 style={styles.docTitle}>Contractor Verification &amp; Document Compliance</h2>
                </div>
                <button onClick={() => navigate('/admin/verification-progress')} style={styles.navPageBtn}>
                  Go to Verifications →
                </button>
              </div>

              <p style={styles.docLead}>
                Review trade contractor licenses, insurance policies, and business credentials before approving marketplace access.
              </p>

              <div style={styles.capabilitiesCard}>
                <div style={styles.capHeader}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#034ea2" strokeWidth="2.2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#034ea2' }}>
                    Administrator Capabilities in Verifications
                  </h4>
                </div>
                <ul style={styles.capList}>
                  <li><strong>Record-Only Deletion:</strong> Delete verification submission logs safely without deleting the contractor&apos;s registered user account.</li>
                  <li><strong>Document Inspection:</strong> Open high-resolution PDF or image certificates directly in the review modal before verification.</li>
                  <li><strong>Verification Revocation:</strong> Revoke compliance badges when an insurance policy lapses with mandatory audit justification.</li>
                  <li><strong>Badge Alert Bubbles:</strong> Sidebar badges display pending unread submissions; clicking marks records as viewed and clears counter.</li>
                </ul>
              </div>

              <h3 style={styles.sectionHeading}>Verification Workflow</h3>
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

          {/* SECTION 5: LEAD MANAGEMENT & REACH-OUTS HUB */}
          {activeSection === 'leads' && (
            <div style={styles.docArticle}>
              <div style={styles.articleHeader}>
                <div>
                  <div style={styles.badgePill}>PAGE GUIDANCE: /admin/leads</div>
                  <h2 style={styles.docTitle}>Lead Inquiries &amp; Reach-Out Requests Hub</h2>
                </div>
                <button onClick={() => navigate('/admin/leads')} style={styles.navPageBtn}>
                  Go to Leads →
                </button>
              </div>

              <p style={styles.docLead}>
                Monitors real customer and contractor reach-out requests, service inquiries, and project bookings.
              </p>

              <div style={styles.capabilitiesCard}>
                <div style={styles.capHeader}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#034ea2" strokeWidth="2.2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#034ea2' }}>
                    Administrator Capabilities in Lead Management
                  </h4>
                </div>
                <ul style={styles.capList}>
                  <li><strong>Inquiry Origin Identification:</strong> Automatically categorizes direct support contacts as &quot;Reach Out&quot; and estimate bookings as &quot;Estimation Service&quot;.</li>
                  <li><strong>Uploaded Photo Inspection:</strong> View full-resolution homeowner deck photos inside the details modal and export to PDF.</li>
                  <li><strong>Dynamic Alert Bubbles:</strong> Sidebar red counter tracks unread leads; opening or viewing a lead decrements the counter in real time.</li>
                  <li><strong>Safe Multi-Lead Deletion:</strong> Select multiple leads and delete inquiry entries via confirmation modal without deleting customer profiles.</li>
                </ul>
              </div>

              <h3 style={styles.sectionHeading}>Table Columns &amp; Features</h3>
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
                      <td style={styles.td}><strong>Type &amp; Source</strong></td>
                      <td style={styles.td}>Customer/Contractor origin. Tagged as &quot;Estimation Service&quot; if booked from an estimate.</td>
                    </tr>
                    <tr style={styles.tr}>
                      <td style={styles.td}><strong>Priority</strong></td>
                      <td style={styles.td}>HOT Priority (last 30 days reach-out) or Standard.</td>
                    </tr>
                    <tr style={styles.tr}>
                      <td style={styles.td}><strong>Date &amp; Time</strong></td>
                      <td style={styles.td}>Timestamp of the reach-out request with custom date range picker.</td>
                    </tr>
                    <tr style={styles.tr}>
                      <td style={styles.td}><strong>Location</strong></td>
                      <td style={styles.td}>City and state of the deck project.</td>
                    </tr>
                    <tr style={styles.tr}>
                      <td style={styles.td}><strong>Actions</strong></td>
                      <td style={styles.td}>View Details modal with full deck dimensions, lumber selections, and uploaded photos.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 6: PROJECTS DIRECTORY & 4-STAGE LIFE CYCLE */}
          {activeSection === 'projects' && (
            <div style={styles.docArticle}>
              <div style={styles.articleHeader}>
                <div>
                  <div style={styles.badgePill}>PAGE GUIDANCE: /admin/projects</div>
                  <h2 style={styles.docTitle}>Project Management &amp; Discrete 4-Stage Tracking</h2>
                </div>
                <button onClick={() => navigate('/admin/projects')} style={styles.navPageBtn}>
                  Go to Projects →
                </button>
              </div>

              <p style={styles.docLead}>
                Tracks customer and contractor deck restoration estimations through a discrete 4-stage lifecycle without arbitrary percentages.
              </p>

              <div style={styles.capabilitiesCard}>
                <div style={styles.capHeader}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#034ea2" strokeWidth="2.2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#034ea2' }}>
                    Administrator Capabilities in Project Management
                  </h4>
                </div>
                <ul style={styles.capList}>
                  <li><strong>Stage Progression Engine:</strong> Advance projects sequentially across Created, Requested, In Progress, and Completed.</li>
                  <li><strong>Synchronous Client Updates:</strong> Advancing stage immediately updates homeowner and contractor portal dashboards.</li>
                  <li><strong>Total Sq Ft Metrics:</strong> Cleanly displays calculated square footage directly under the estimated valuation.</li>
                  <li><strong>Clean Table Layout:</strong> Removed redundant columns to ensure a zero-horizontal-scroll layout across all resolutions.</li>
                </ul>
              </div>

              <div style={styles.exampleCard}>
                <div style={styles.exampleTitle}>Practical Operational Example: Dispatching a Project</div>
                <p style={styles.exampleText}>
                  A homeowner creates an estimate for a 450 sq ft Cedar deck ($2,850) and clicks Reach Out. The project appears in <strong>Requested Projects</strong>. The admin contacts the homeowner, schedules the crew, and changes stage to <strong>In Progress</strong> with note &quot;Crew scheduled for Monday 8 AM&quot;. The customer sees this live on their dashboard immediately.
                </p>
              </div>
            </div>
          )}

          {/* SECTION 7: PRICING & DISCOUNTS ENGINE */}
          {activeSection === 'pricing' && (
            <div style={styles.docArticle}>
              <div style={styles.articleHeader}>
                <div>
                  <div style={styles.badgePill}>PAGE GUIDANCE: /admin/pricing-discounts</div>
                  <h2 style={styles.docTitle}>Estimator Pricing &amp; Options Tuning Engine</h2>
                </div>
                <button onClick={() => navigate('/admin/pricing-discounts')} style={styles.navPageBtn}>
                  Go to Pricing Engine →
                </button>
              </div>

              <p style={styles.docLead}>
                Central pricing configuration with 6 dedicated tabs, clean SVG vector icons, dynamic catalog item management, and per-contractor wholesale discounts.
              </p>

              <div style={styles.capabilitiesCard}>
                <div style={styles.capHeader}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#034ea2" strokeWidth="2.2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#034ea2' }}>
                    Administrator Capabilities in Pricing &amp; Discounts
                  </h4>
                </div>
                <ul style={styles.capList}>
                  <li><strong>Global Wholesale Discount:</strong> Set standard contractor trade discount (e.g. 10%) applied to all certified contractors.</li>
                  <li><strong>Individual Discount Overrides:</strong> Search any contractor by name or email and assign an isolated custom discount (e.g. 15%) that will NEVER be overwritten by global changes.</li>
                  <li><strong>Dynamic Rate Matrix:</strong> Tune the 12-cell sq ft rate matrix across Clean, Strip, Strip &amp; Sand prep against 4 protective finishes.</li>
                  <li><strong>Architectural Component Multipliers:</strong> Add, edit, or remove deck components (railings, stairs, skirting, pergolas) with custom area multipliers.</li>
                </ul>
              </div>

              <div style={styles.exampleCard}>
                <div style={styles.exampleTitle}>Practical Operational Example: Tuning Satheesh&apos;s Trade Discount</div>
                <p style={styles.exampleText}>
                  Admin navigates to <strong>Contractor Discounts</strong> tab. In the <strong>Tune Individual Contractor</strong> search box, types &quot;satheesh&quot;. Satheesh appears in the live search dropdown. Admin clicks his card, enters &quot;15%&quot; discount, and clicks <strong>Save Contractor Override</strong>. Whenever Satheesh calculates an estimate, he automatically receives 15% wholesale discount instead of the standard 10%.
                </p>
              </div>
            </div>
          )}

          {/* SECTION 8: REPORTS & BUSINESS INTELLIGENCE */}
          {activeSection === 'reports' && (
            <div style={styles.docArticle}>
              <div style={styles.articleHeader}>
                <div>
                  <div style={styles.badgePill}>PAGE GUIDANCE: /admin/reports</div>
                  <h2 style={styles.docTitle}>Reports &amp; Business Intelligence</h2>
                </div>
                <button onClick={() => navigate('/admin/reports')} style={styles.navPageBtn}>
                  Go to Reports →
                </button>
              </div>

              <p style={styles.docLead}>
                Live analytical reports backed by real MongoDB aggregations with zero static fallbacks or hardcoded numbers.
              </p>

              <div style={styles.capabilitiesCard}>
                <div style={styles.capHeader}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#034ea2" strokeWidth="2.2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#034ea2' }}>
                    Administrator Capabilities in Analytics
                  </h4>
                </div>
                <ul style={styles.capList}>
                  <li><strong>Real-time Aggregation:</strong> KPI cards calculate total estimations, completed projects, realized revenue, and estimate pipeline from MongoDB.</li>
                  <li><strong>Visual Plots Across All Tabs:</strong> Bar charts for project status, fluid curves for lead acquisition, and role distribution plots.</li>
                  <li><strong>Catalog &amp; Wood Species Demand:</strong> Visual breakdown of most popular lumber choices, deck conditions, and service packages.</li>
                  <li><strong>One-Click PDF/Excel Export:</strong> Export formatted analytics summaries with a single click.</li>
                </ul>
              </div>
            </div>
          )}

          {/* SECTION 9: SYSTEM SETTINGS & BROADCASTS */}
          {activeSection === 'settings' && (
            <div style={styles.docArticle}>
              <div style={styles.articleHeader}>
                <div>
                  <div style={styles.badgePill}>PAGE GUIDANCE: /admin/settings</div>
                  <h2 style={styles.docTitle}>System Settings &amp; Targeted Broadcast Engine</h2>
                </div>
                <button onClick={() => navigate('/admin/settings')} style={styles.navPageBtn}>
                  Go to Settings →
                </button>
              </div>

              <p style={styles.docLead}>
                Configure platform branding, WhatsApp support lines, security sessions, and dispatch targeted broadcast notifications.
              </p>

              <div style={styles.capabilitiesCard}>
                <div style={styles.capHeader}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#034ea2" strokeWidth="2.2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#034ea2' }}>
                    Administrator Capabilities in System Settings
                  </h4>
                </div>
                <ul style={styles.capList}>
                  <li><strong>Multi-User Targeted Dispatcher:</strong> Search recipients by name, email, or phone number and select multiple individuals (customers &amp; contractors) simultaneously.</li>
                  <li><strong>Synchronized Contact Channels:</strong> Updating support phone, email, or WhatsApp numbers synchronizes instantly across portal footers and contact modals.</li>
                  <li><strong>Live Database Diagnostics:</strong> Inspect real-time MongoDB ping latency, active connection pools, and Node.js process runtime.</li>
                </ul>
              </div>

              <div style={styles.exampleCard}>
                <div style={styles.exampleTitle}>Practical Operational Example: Dispatching a Freeze Warning</div>
                <p style={styles.exampleText}>
                  An unexpected freeze is forecast. The admin selects <strong>Specific User(s)</strong>, searches and adds 4 active contractors in the northern region, types &quot;Freeze Advisory: Do not apply acrylic stain when temperatures drop below 50°F&quot;, and clicks <strong>Transmit Targeted Notification</strong>. All 4 contractors receive immediate in-app alerts on their dashboard.
                </p>
              </div>
            </div>
          )}

          {/* SECTION 10: SOPS */}
          {activeSection === 'sop' && (
            <div style={styles.docArticle}>
              <div style={styles.articleHeader}>
                <div>
                  <div style={styles.badgePill}>STANDARD OPERATING PROCEDURES</div>
                  <h2 style={styles.docTitle}>Administrator Daily &amp; Weekly SOPs</h2>
                </div>
                <button onClick={() => navigate('/admin/dashboard')} style={styles.navPageBtn}>
                  Dashboard Overview →
                </button>
              </div>

              <p style={styles.docLead}>
                Standard Operating Procedures for platform administrators ensuring responsiveness, compliance, and accurate pricing.
              </p>

              <h3 style={styles.sectionHeading}>Daily Checklist (Morning &amp; Afternoon)</h3>
              <div style={styles.featuresList}>
                <div style={styles.featureItem}>
                  <strong>1. Review Hot Priority Leads:</strong> Check <code>/admin/leads</code> Hot Priority tab for new user reach-out requests submitted in the last 24 hours. Contact homeowners or assign to specialists.
                </div>
                <div style={styles.featureItem}>
                  <strong>2. Review Account Appeals:</strong> Check <code>/admin/users</code> User Requests tab for blocked accounts requesting reactivation.
                </div>
                <div style={styles.featureItem}>
                  <strong>3. Update Project Stages:</strong> Check <code>/admin/projects</code> and update project stages from <code>requested</code> to <code>in progress</code> or <code>completed</code> as physical deck work progresses.
                </div>
                <div style={styles.featureItem}>
                  <strong>4. Review Contractor Credentials:</strong> Check <code>/admin/verification-progress</code> for pending contractor profile submissions and uploaded insurance documents.
                </div>
              </div>

              <h3 style={styles.sectionHeading}>Weekly Review Checklist</h3>
              <div style={styles.featuresList}>
                <div style={styles.featureItem}>
                  <strong>1. Export Performance Reports:</strong> Download weekly CSV/Excel reports from <code>/admin/reports</code> to monitor gross volume and conversion rates.
                </div>
                <div style={styles.featureItem}>
                  <strong>2. Calibrate Material Pricing:</strong> Review <code>/admin/pricing-discounts</code> base rate matrix and wood species multipliers to match seasonal lumber costs.
                </div>
                <div style={styles.featureItem}>
                  <strong>3. Contractor Partner Discounts:</strong> Audit wholesale trade discounts and customize high-performing contractor incentives.
                </div>
              </div>
            </div>
          )}

          {/* SECTION 11: ESTIMATOR FORMULAS & MATH ARCHITECTURE */}
          {activeSection === 'calculator' && (
            <div style={styles.docArticle}>
              <div style={styles.articleHeader}>
                <div>
                  <div style={styles.badgePill}>MATHEMATICAL REFERENCE</div>
                  <h2 style={styles.docTitle}>Estimator Calculation Engine &amp; Math Architecture</h2>
                </div>
                <button onClick={() => navigate('/admin/pricing-discounts')} style={styles.navPageBtn}>
                  Configure Pricing →
                </button>
              </div>

              <p style={styles.docLead}>
                Comprehensive mathematical specification of the continuous deck restoration pricing engine, including geometric surface area aggregation, chemical coverage packaging, labor hour equations, minimum mobilization price rules, and trade discount deductions.
              </p>

              {/* Formula Card 1: Effective Surface Area */}
              <div style={styles.formulaCard}>
                <div style={styles.formulaTitle}>1. Geometric Effective Surface Area Formula</div>
                <div style={styles.mathBlock}>
                  A_total = A_floor + (LF_railings × 3.0 × 2) + (N_steps × W_stair × 1.5) + (LF_fascia × 0.8) + (A_floor × 0.35 [if joists]) + (L_perg × W_perg × 0.60) + A_privacy + A_siding
                </div>
                <p style={styles.formulaDesc}>
                  Every architectural element has a standard conversion multiplier reflecting true 3D surface area (e.g. railings are measured on both inner and outer face, stairs include treads + risers at 1.5x tread width).
                </p>
              </div>

              {/* Formula Card 2: Continuous Base Rate Card Matrix */}
              <div style={styles.formulaCard}>
                <div style={styles.formulaTitle}>2. Base Rate Card Lookup Matrix ($/sq ft)</div>
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Preparation Phase</th>
                        <th style={styles.th}>Clear Sealer</th>
                        <th style={styles.th}>Semi-Transparent</th>
                        <th style={styles.th}>Semi-Solid</th>
                        <th style={styles.th}>Solid Stain</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={styles.tr}>
                        <td style={styles.td}><strong>Clean &amp; Wash</strong></td>
                        <td style={styles.td}>$2.50 / sq ft</td>
                        <td style={styles.td}>$2.75 / sq ft</td>
                        <td style={styles.td}>$3.10 / sq ft</td>
                        <td style={styles.td}>$3.45 / sq ft</td>
                      </tr>
                      <tr style={styles.tr}>
                        <td style={styles.td}><strong>Chemical Strip &amp; Neutralize</strong></td>
                        <td style={styles.td}>$3.25 / sq ft</td>
                        <td style={styles.td}>$3.50 / sq ft</td>
                        <td style={styles.td}>$3.85 / sq ft</td>
                        <td style={styles.td}>$4.25 / sq ft</td>
                      </tr>
                      <tr style={styles.tr}>
                        <td style={styles.td}><strong>Heavy Strip &amp; Mechanical Sand</strong></td>
                        <td style={styles.td}>$4.50 / sq ft</td>
                        <td style={styles.td}>$4.85 / sq ft</td>
                        <td style={styles.td}>$5.25 / sq ft</td>
                        <td style={styles.td}>$5.75 / sq ft</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Formula Card 3: Chemical Coverage */}
              <div style={styles.formulaCard}>
                <div style={styles.formulaTitle}>3. Chemical Packaging &amp; Coverage Specifications</div>
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Chemical Agent</th>
                        <th style={styles.th}>Theoretical Spread Rate</th>
                        <th style={styles.th}>Packaging Unit</th>
                        <th style={styles.th}>Quantity Formula</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={styles.tr}>
                        <td style={styles.td}><strong>Restoration Cleaner / Stripper</strong></td>
                        <td style={styles.td}>150 sq ft per gallon</td>
                        <td style={styles.td}>5-Gallon Commercial Pails</td>
                        <td style={styles.td}><code>ceil(A_total / (150 × 5)) pails</code></td>
                      </tr>
                      <tr style={styles.tr}>
                        <td style={styles.td}><strong>pH Balancing Neutralizer / Brightener</strong></td>
                        <td style={styles.td}>200 sq ft per gallon</td>
                        <td style={styles.td}>5-Gallon Commercial Pails</td>
                        <td style={styles.td}><code>ceil(A_total / (200 × 5)) pails</code></td>
                      </tr>
                      <tr style={styles.tr}>
                        <td style={styles.td}><strong>Protective Penetrating Stain / Sealer</strong></td>
                        <td style={styles.td}>175 sq ft per gallon (2 coats)</td>
                        <td style={styles.td}>5-Gallon Pails + 1-Gal Cans</td>
                        <td style={styles.td}><code>ceil(A_total / 175) total gallons</code></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Formula Card 4: Labor Hours & Mobilization Floor */}
              <div style={styles.formulaCard}>
                <div style={styles.formulaTitle}>4. Labor Hours &amp; Mobilization Floor Rules</div>
                <div style={styles.mathBlock}>
                  Hours = (A_total / ProductionSpeed) × M_species × M_elevation
                  <br />
                  RetailQuote = max((A_total × BaseRate × M_wood × M_condition) + Repairs + Addons, $2,500.00)
                </div>
                <p style={styles.formulaDesc}>
                  <strong>Minimum Mobilization Policy:</strong> When contractor or retail projects yield raw calculation below $2,500, the platform automatically applies the mobilization safety floor of $2,500.00 to guarantee crew overhead and transit profitability.
                </p>
              </div>

              {/* Worked Example */}
              <div style={styles.exampleCard}>
                <div style={styles.exampleTitle}>Complete Step-by-Step Practical Worked Example: 500 Sq Ft California Redwood Deck</div>
                <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6' }}>
                  <p><strong>Input Parameters:</strong></p>
                  <ul>
                    <li>Floor Area: 500 sq ft (20 ft × 25 ft)</li>
                    <li>Railings: 45 linear ft (3 ft height)</li>
                    <li>Stairs: 1 set of 5 steps (4 ft wide)</li>
                    <li>Wood Species: California Redwood (+15% labor multiplier)</li>
                    <li>Deck Condition: Weathered Graying (Requires Chemical Strip + Neutralize)</li>
                    <li>Selected Protective Finish: Semi-Transparent Cedar Tone</li>
                    <li>Elevation: Ground level (&lt;4 ft)</li>
                    <li>Contractor: Certified Partner (10% standard wholesale trade discount)</li>
                  </ul>

                  <p><strong>Step 1: Calculate Effective Total Surface Area</strong></p>
                  <p style={{ fontFamily: 'monospace', backgroundColor: '#f1f5f9', padding: '8px 12px', borderRadius: '6px' }}>
                    Floor Area = 500 sq ft<br />
                    Railings Area = 45 LF × 3.0 ft × 2 faces = 270 sq ft<br />
                    Stairs Area = 5 steps × 4.0 ft × 1.5 multiplier = 30 sq ft<br />
                    <strong>Total Effective Area (A_total) = 500 + 270 + 30 = 800 sq ft</strong>
                  </p>

                  <p><strong>Step 2: Base Rate Card Matrix Lookup</strong></p>
                  <p style={{ fontFamily: 'monospace', backgroundColor: '#f1f5f9', padding: '8px 12px', borderRadius: '6px' }}>
                    Preparation = Chemical Strip &amp; Neutralize<br />
                    Finish = Semi-Transparent Stain<br />
                    <strong>Matrix Lookup Unit Rate = $3.50 / sq ft</strong>
                  </p>

                  <p><strong>Step 3: Base Surface Restoration Cost</strong></p>
                  <p style={{ fontFamily: 'monospace', backgroundColor: '#f1f5f9', padding: '8px 12px', borderRadius: '6px' }}>
                    Base Cost = 800 sq ft × $3.50 = <strong>$2,800.00</strong>
                  </p>

                  <p><strong>Step 4: Wood Species Multiplier Adjustment</strong></p>
                  <p style={{ fontFamily: 'monospace', backgroundColor: '#f1f5f9', padding: '8px 12px', borderRadius: '6px' }}>
                    California Redwood Multiplier = 1.15 (+15%)<br />
                    Redwood Adjusted Price = $2,800.00 × 1.15 = <strong>$3,220.00</strong>
                  </p>

                  <p><strong>Step 5: Mobilization Floor Verification</strong></p>
                  <p style={{ fontFamily: 'monospace', backgroundColor: '#f1f5f9', padding: '8px 12px', borderRadius: '6px' }}>
                    $3,220.00 is greater than $2,500.00 minimum mobilization threshold.<br />
                    <strong>Standard Retail Homeowner Quote = $3,220.00</strong>
                  </p>

                  <p><strong>Step 6: Certified Contractor Wholesale Quote Calculation</strong></p>
                  <p style={{ fontFamily: 'monospace', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '8px 12px', borderRadius: '6px', color: '#065f46' }}>
                    Trade Discount Rate = 10%<br />
                    Discount Amount = $3,220.00 × 0.10 = $322.00<br />
                    <strong>Contractor Trade Wholesale Price = $3,220.00 - $322.00 = $2,898.00</strong>
                  </p>
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
    gap: '12px',
    flexWrap: 'wrap',
  },
  btnManualDownload: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '9px 18px',
    borderRadius: '9999px',
    backgroundColor: '#034EA2',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 2px 4px rgba(3, 78, 162, 0.25)',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  btnCalcDownload: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '9px 18px',
    borderRadius: '9999px',
    backgroundColor: '#059669',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 2px 4px rgba(5, 150, 105, 0.25)',
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
    padding: '9px 12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#475569',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textAlign: 'left',
    width: '100%',
  },
  navItemActive: {
    backgroundColor: '#eff6ff',
    color: '#034EA2',
    fontWeight: '700',
  },
  supportBox: {
    marginTop: '20px',
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
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    minHeight: '600px',
  },
  docArticle: {
    display: 'flex',
    flexDirection: 'column',
  },
  articleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '14px',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  badgePill: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#034EA2',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    marginBottom: '4px',
  },
  docTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.3px',
  },
  navPageBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    borderRadius: '6px',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    border: '1px solid #cbd5e1',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  docLead: {
    fontSize: '14px',
    color: '#475569',
    lineHeight: '1.6',
    margin: '0 0 16px',
  },

  // Capabilities Card
  capabilitiesCard: {
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '12px',
    padding: '16px 18px',
    marginBottom: '20px',
  },
  capHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
  },
  capList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '12.5px',
    color: '#0369a1',
    lineHeight: '1.6',
  },

  // Practical Example Card
  exampleCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderLeft: '4px solid #034EA2',
    borderRadius: '8px',
    padding: '14px 18px',
    marginTop: '16px',
    marginBottom: '16px',
  },
  exampleTitle: {
    fontSize: '12.5px',
    fontWeight: '800',
    color: '#0F2C59',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  exampleText: {
    fontSize: '12.5px',
    color: '#334155',
    lineHeight: '1.5',
    margin: 0,
  },

  // Formula Card
  formulaCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
  },
  formulaTitle: {
    fontSize: '13.5px',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '8px',
  },
  mathBlock: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '10px 14px',
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#034EA2',
    lineHeight: '1.6',
    marginBottom: '8px',
  },
  formulaDesc: {
    fontSize: '12px',
    color: '#64748b',
    lineHeight: '1.5',
    margin: 0,
  },

  sectionHeading: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '20px 0 10px',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '6px',
  },
  infoCallout: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
  },
  stepGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '12px',
  },
  stepCard: {
    padding: '12px',
    borderRadius: '10px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    fontSize: '12px',
    color: '#475569',
  },
  stepNum: {
    width: '22px',
    height: '22px',
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
    fontSize: '12.5px',
    color: '#334155',
    lineHeight: '1.5',
  },
  tableResponsive: {
    overflowX: 'auto',
    width: '100%',
    marginBottom: '12px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '12px',
  },
  th: {
    padding: '8px 10px',
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
    padding: '8px 10px',
    verticalAlign: 'top',
  },
};

// =============================================
// Deck Estimator — Contractor Document Detail Page
// =============================================
// Matches Image 3 (Top Right) Visual Reference:
// - Breadcrumbs: Verification & Compliance > Document Details
// - Title (Contractor License) + Verified badge
// - Document preview canvas with zoom / pagination controls
// - Document Information card: Category, File Name, File Size, Uploaded On, Verified On, Status
// - Download button & Replace Document button

import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

export default function ContractorDocumentDetailPage() {
  const navigate = useNavigate();
  const { documentId } = useParams();

  const [zoom, setZoom] = useState(100);

  return (
    <div style={styles.container}>
      {/* 1. BREADCRUMBS */}
      <div style={styles.breadcrumbRow}>
        <Link to="/contractor/verification" style={styles.breadcrumbLink}>
          &larr; Verification &amp; Compliance
        </Link>
        <span style={styles.breadcrumbDivider}>&rsaquo;</span>
        <span style={styles.breadcrumbCurrent}>Document Details</span>
      </div>

      {/* 2. TITLE & STATUS BADGE */}
      <div style={styles.titleRow}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={styles.pageTitle}>Contractor License</h1>
          <span style={styles.verifiedBadge}>Verified</span>
        </div>
        <p style={styles.pageSub}>Complete details and verification status for this document.</p>
      </div>

      {/* 3. TWO-COLUMN: PREVIEW CANVAS (LEFT) + INFO CARD (RIGHT) */}
      <div style={styles.mainGrid}>
        {/* Left: Document Preview Canvas */}
        <div style={styles.previewCard}>
          <div style={styles.certBox}>
            <div style={styles.certBorder}>
              <div style={styles.certSeal}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="7" />
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                </svg>
              </div>
              <h2 style={styles.certTitle}>CONTRACTOR LICENSE</h2>
              <p style={styles.certSub}>State Contractor License</p>
              <p style={styles.certOrg}>Apex Deck Pros LLC</p>
              <div style={styles.certMeta}>
                <div><strong>License No:</strong> LIC-TX-2026-99</div>
                <div><strong>Valid Through:</strong> Oct 31, 2028</div>
              </div>
            </div>
          </div>

          {/* Canvas Controls */}
          <div style={styles.canvasControls}>
            <span style={styles.pageIndicator}>Page 1 of 1</span>
            <div style={styles.zoomControls}>
              <button
                type="button"
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                style={styles.zoomBtn}
              >
                &minus;
              </button>
              <span style={styles.zoomText}>{zoom}%</span>
              <button
                type="button"
                onClick={() => setZoom(Math.min(150, zoom + 10))}
                style={styles.zoomBtn}
              >
                +
              </button>
              <button type="button" style={styles.zoomBtn}>⛶</button>
            </div>
          </div>
        </div>

        {/* Right: Document Information Card */}
        <div style={styles.infoCol}>
          <div style={styles.infoCard}>
            <h3 style={styles.infoHeading}>Document Information</h3>

            <div style={styles.infoList}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Document Category</span>
                <span style={styles.infoVal}>License</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>File Name</span>
                <span style={styles.infoVal}>license.pdf</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>File Size</span>
                <span style={styles.infoVal}>1.2 MB</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Uploaded On</span>
                <span style={styles.infoVal}>Oct 20, 2026</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Verified On</span>
                <span style={styles.infoVal}>Oct 21, 2026</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Status</span>
                <span style={styles.verifiedText}>Verified</span>
              </div>
            </div>

            <div style={styles.btnStack}>
              <button type="button" style={styles.downloadBtn}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
                <span>Download</span>
              </button>
              <button type="button" style={styles.replaceBtn}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                <span>Replace Document</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  breadcrumbRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
  },
  breadcrumbLink: {
    color: '#1d4ed8',
    textDecoration: 'none',
    fontWeight: '600',
  },
  breadcrumbDivider: {
    color: '#94a3b8',
  },
  breadcrumbCurrent: {
    color: '#64748b',
  },
  titleRow: {
    display: 'flex',
    flexDirection: 'column',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#0f172a',
    margin: 0,
  },
  verifiedBadge: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '12px',
  },
  pageSub: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '4px',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 340px',
    gap: '24px',
  },
  previewCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  certBox: {
    width: '100%',
    maxWidth: '480px',
    border: '2px solid #cbd5e1',
    borderRadius: '8px',
    padding: '36px 28px',
    backgroundColor: '#f8fafc',
    textAlign: 'center',
  },
  certBorder: {
    border: '1px solid #94a3b8',
    padding: '24px',
    borderRadius: '4px',
  },
  certSeal: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '10px',
  },
  certTitle: {
    fontSize: '18px',
    fontWeight: '900',
    letterSpacing: '1px',
    color: '#0f172a',
    margin: '0 0 4px 0',
  },
  certSub: {
    fontSize: '12px',
    color: '#64748b',
    margin: '0 0 12px 0',
  },
  certOrg: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#1d4ed8',
    margin: '0 0 20px 0',
  },
  certMeta: {
    display: 'flex',
    justifyContent: 'space-around',
    fontSize: '11px',
    color: '#475569',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '12px',
  },
  canvasControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: '20px',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '14px',
  },
  pageIndicator: {
    fontSize: '12px',
    color: '#64748b',
  },
  zoomControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  zoomBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    padding: '3px 8px',
    fontSize: '12px',
    cursor: 'pointer',
    color: '#334155',
  },
  zoomText: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#0f172a',
  },
  infoCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '22px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  infoHeading: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 16px 0',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '10px',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
  },
  infoLabel: {
    color: '#64748b',
  },
  infoVal: {
    color: '#0f172a',
    fontWeight: '700',
  },
  verifiedText: {
    color: '#15803d',
    fontWeight: '800',
  },
  btnStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  downloadBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '10px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#1d4ed8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  replaceBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '10px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#334155',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
};


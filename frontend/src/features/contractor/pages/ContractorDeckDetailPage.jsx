// =============================================
// Deck Estimator — Contractor Deck Project Details Page
// =============================================
// Matches Image 4 (Top Right) Visual Reference:
// - Breadcrumbs: Projects & Decks > Project Details
// - Title (Riverside Deck Restoration) + Status badge (In Progress)
// - Client name & location
// - Action buttons: Edit Project | + Create Estimate
// - Tabs: Overview | Specifications | Photos | Estimates (2) | Notes & History
// - Photo gallery
// - Project Summary & Status cards

import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

export default function ContractorDeckDetailPage() {
  const navigate = useNavigate();
  const { deckId } = useParams();

  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div style={styles.container}>
      {/* 1. BREADCRUMBS */}
      <div style={styles.breadcrumbRow}>
        <Link to="/contractor/projects" style={styles.breadcrumbLink}>
          Projects &amp; Decks
        </Link>
        <span style={styles.breadcrumbDivider}>&rsaquo;</span>
        <span style={styles.breadcrumbCurrent}>Project Details</span>
      </div>

      {/* 2. TITLE BAR & ACTIONS */}
      <div style={styles.titleRow}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={styles.projectTitle}>Riverside Deck Restoration</h1>
            <span style={styles.statusInProgress}>In Progress</span>
          </div>
          <div style={styles.clientMeta}>
            <span>Client: Jane Homeowner</span>
            <span style={{ margin: '0 8px' }}>|</span>
            <span>Location: Austin, TX</span>
          </div>
        </div>

        <div style={styles.actionBtnsRow}>
          <button
            type="button"
            onClick={() => navigate(`/contractor/decks/${deckId || 'proj-1'}/edit`)}
            style={styles.editProjectBtn}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <span>Edit Project</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(`/contractor/decks/${deckId || 'proj-1'}/estimate/new`)}
            style={styles.createEstBtn}
          >
            + Create Estimate
          </button>
        </div>
      </div>

      {/* 3. TABS */}
      <div style={styles.tabBar}>
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          style={{ ...styles.tabBtn, ...(activeTab === 'overview' ? styles.tabBtnActive : {}) }}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('specifications')}
          style={{ ...styles.tabBtn, ...(activeTab === 'specifications' ? styles.tabBtnActive : {}) }}
        >
          Specifications
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('photos')}
          style={{ ...styles.tabBtn, ...(activeTab === 'photos' ? styles.tabBtnActive : {}) }}
        >
          Photos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('estimates')}
          style={{ ...styles.tabBtn, ...(activeTab === 'estimates' ? styles.tabBtnActive : {}) }}
        >
          Estimates (2)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('notes')}
          style={{ ...styles.tabBtn, ...(activeTab === 'notes' ? styles.tabBtnActive : {}) }}
        >
          Notes &amp; History
        </button>
      </div>

      {/* 4. MAIN TWO-COLUMN CONTENT */}
      <div style={styles.mainGrid}>
        {/* Left: Photos Gallery */}
        <div style={styles.galleryCard}>
          <div style={styles.mainPhotoWrap}>
            <img
              src="https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80"
              alt="Main Deck Photo"
              style={styles.mainPhoto}
            />
          </div>
          <div style={styles.thumbStrip}>
            <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=200&q=80" alt="Thumb" style={styles.stripThumb} />
            <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=200&q=80" alt="Thumb" style={styles.stripThumb} />
            <img src="https://images.unsplash.com/photo-1591825729269-caeb344f6df2?auto=format&fit=crop&w=200&q=80" alt="Thumb" style={styles.stripThumb} />
          </div>
        </div>

        {/* Right: Project Summary & Status */}
        <div style={styles.summaryCol}>
          <div style={styles.summaryCard}>
            <h3 style={styles.cardHeading}>Project Summary</h3>
            <div style={styles.summaryList}>
              <div style={styles.summaryRow}>
                <span style={styles.sumLabel}>Deck Size</span>
                <span style={styles.sumVal}>400 sq ft</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.sumLabel}>Shape</span>
                <span style={styles.sumVal}>Rectangle</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.sumLabel}>Levels</span>
                <span style={styles.sumVal}>1</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.sumLabel}>Height</span>
                <span style={styles.sumVal}>2 – 4 ft</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.sumLabel}>Condition</span>
                <span style={styles.sumVal}>Weathered</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.sumLabel}>Services</span>
                <span style={styles.sumVal}>Cleaning, Staining</span>
              </div>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <h3 style={styles.cardHeading}>Project Status</h3>
            <div style={{ marginBottom: '14px' }}>
              <span style={styles.statusInProgress}>In Progress</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.sumLabel}>Created On</span>
              <span style={styles.sumVal}>Oct 20, 2026</span>
            </div>
            <div style={{ ...styles.summaryRow, marginTop: '8px' }}>
              <span style={styles.sumLabel}>Last Updated</span>
              <span style={styles.sumVal}>Nov 3, 2026</span>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectTitle: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#0f172a',
    margin: 0,
  },
  statusInProgress: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '12px',
  },
  clientMeta: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '4px',
  },
  actionBtnsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  editProjectBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '10px 18px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#0f172a',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  createEstBtn: {
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(29, 78, 216, 0.25)',
  },
  tabBar: {
    display: 'flex',
    gap: '12px',
    borderBottom: '1px solid #e2e8f0',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#64748b',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
  },
  tabBtnActive: {
    color: '#1d4ed8',
    borderBottomColor: '#1d4ed8',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 340px',
    gap: '24px',
  },
  galleryCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  mainPhotoWrap: {
    width: '100%',
    height: '320px',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
    marginBottom: '14px',
  },
  mainPhoto: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  thumbStrip: {
    display: 'flex',
    gap: '12px',
  },
  stripThumb: {
    width: '80px',
    height: '60px',
    borderRadius: '6px',
    objectFit: 'cover',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
  },
  summaryCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  cardHeading: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 14px 0',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '8px',
  },
  summaryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
  },
  sumLabel: {
    color: '#64748b',
  },
  sumVal: {
    color: '#0f172a',
    fontWeight: '700',
  },
};

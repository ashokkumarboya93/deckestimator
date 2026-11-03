// =============================================
// Deck Estimator — Contractor Deck Project Details Page
// =============================================
// Matches Image 4 (Top Right) Visual Reference:
// - Breadcrumbs: Projects & Decks > Project Details
// - Title + Status badge
// - Client name & location
// - Action buttons: Edit Project | + Create Estimate
// - Tabs: Overview | Specifications | Photos | Estimates | Notes & History
// - Dynamic backend loading via getDeckById

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getDeckById } from '../../customer/api/decksApi';

export default function ContractorDeckDetailPage() {
  const navigate = useNavigate();
  const { deckId } = useParams();

  const [activeTab, setActiveTab] = useState('overview');
  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(Boolean(deckId && deckId.length === 24));
  const [notes, setNotes] = useState([
    'Nov 3, 2026: Site survey completed. Measurements verified at 400 sq ft.',
    'Oct 28, 2026: Client requested semi-transparent cedar stain sample.',
  ]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    if (deckId && deckId.length === 24) {
      getDeckById(deckId)
        .then((data) => setDeck(data))
        .catch((err) => console.warn('Could not load deck details from API:', err))
        .finally(() => setLoading(false));
    }
  }, [deckId]);

  const projectName = deck?.projectName || 'Riverside Deck Restoration';
  const clientName = deck?.ownerId?.fullName || deck?.owner?.fullName || deck?.ownerName || 'Jane Homeowner';
  const locationStr = deck?.location?.city
    ? `${deck.location.city}, ${deck.location.state || 'TX'}`
    : 'Austin, TX';
  const deckSize = deck?.dimensions?.area ? `${deck.dimensions.area} sq ft` : '400 sq ft';
  const deckShape = deck?.shape ? deck.shape.replace('_', ' ').toUpperCase() : 'Rectangle';
  const heightStr = deck?.heightFromGround ? `${deck.heightFromGround} ft` : '2 – 4 ft';
  const levelsCount = deck?.levels || 1;
  const materialStr = deck?.surfaceDetails?.material || 'Natural Wood (Cedar)';
  const statusStr = deck?.status === 'in_progress' ? 'In Progress' : (deck?.status || 'In Progress');

  const photos = deck?.photos && deck.photos.length > 0 ? deck.photos : [
    { id: 'p1', url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80' },
    { id: 'p2', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80' },
    { id: 'p3', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80' },
  ];

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    setNotes([`${dateStr}: ${newNote.trim()}`, ...notes]);
    setNewNote('');
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        Loading deck project specifications...
      </div>
    );
  }

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
            <h1 style={styles.projectTitle}>{projectName}</h1>
            <span style={styles.statusInProgress}>{statusStr}</span>
          </div>
          <div style={styles.clientMeta}>
            <span>Client: {clientName}</span>
            <span style={{ margin: '0 8px' }}>|</span>
            <span>Location: {locationStr}</span>
          </div>
        </div>

        <div style={styles.actionBtnsRow}>
          <button
            type="button"
            onClick={() => navigate(`/contractor/decks/${deckId || 'proj-1'}/edit`)}
            style={styles.editProjectBtn}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
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
        {['overview', 'specifications', 'photos', 'estimates', 'notes'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tabBtn,
              ...(activeTab === tab ? styles.tabBtnActive : {}),
            }}
          >
            {tab === 'notes' ? 'Notes & History' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* 4. TAB CONTENTS */}
      {activeTab === 'overview' && (
        <div style={styles.contentGrid}>
          {/* Main Left: Photo Showcase */}
          <div style={styles.leftCol}>
            <div style={styles.mainPhotoCard}>
              <img
                src={photos[0].url}
                alt="Deck main"
                style={styles.heroImg}
              />
              <div style={styles.thumbStrip}>
                {photos.map((item, idx) => (
                  <img
                    key={item.id || idx}
                    src={item.url}
                    alt={`Thumb ${idx + 1}`}
                    style={styles.thumbImg}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Project Summary */}
          <div style={styles.rightCol}>
            <div style={styles.summaryCard}>
              <h3 style={styles.cardHeader}>Project Summary</h3>
              <div style={styles.summaryTable}>
                <div style={styles.sumRow}>
                  <span style={styles.sumLabel}>Deck Size</span>
                  <span style={styles.sumVal}>{deckSize}</span>
                </div>
                <div style={styles.sumRow}>
                  <span style={styles.sumLabel}>Shape</span>
                  <span style={styles.sumVal}>{deckShape}</span>
                </div>
                <div style={styles.sumRow}>
                  <span style={styles.sumLabel}>Levels</span>
                  <span style={styles.sumVal}>{levelsCount}</span>
                </div>
                <div style={styles.sumRow}>
                  <span style={styles.sumLabel}>Height</span>
                  <span style={styles.sumVal}>{heightStr}</span>
                </div>
                <div style={styles.sumRow}>
                  <span style={styles.sumLabel}>Condition</span>
                  <span style={styles.sumVal}>Weathered</span>
                </div>
                <div style={styles.sumRow}>
                  <span style={styles.sumLabel}>Services</span>
                  <span style={styles.sumVal}>Cleaning, Staining</span>
                </div>
              </div>
            </div>

            <div style={{ ...styles.summaryCard, marginTop: '16px' }}>
              <h3 style={styles.cardHeader}>Project Status</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={styles.statusInProgress}>{statusStr}</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                <div>Created: Oct 20, 2026</div>
                <div style={{ marginTop: '4px' }}>Last Updated: Nov 3, 2026</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'specifications' && (
        <div style={styles.specCard}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#0f172a' }}>
            Detailed Site Specifications
          </h3>
          <div style={styles.specGrid}>
            <div style={styles.specItem}>
              <strong>Floor Area:</strong> {deckSize}
            </div>
            <div style={styles.specItem}>
              <strong>Geometry / Shape:</strong> {deckShape}
            </div>
            <div style={styles.specItem}>
              <strong>Elevation / Height:</strong> {heightStr}
            </div>
            <div style={styles.specItem}>
              <strong>Levels:</strong> {levelsCount} Tier(s)
            </div>
            <div style={styles.specItem}>
              <strong>Surface Material:</strong> {materialStr}
            </div>
            <div style={styles.specItem}>
              <strong>Existing Coating:</strong> Semi-Transparent Stain
            </div>
          </div>
        </div>
      )}

      {activeTab === 'photos' && (
        <div style={styles.specCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>Photo Gallery</h3>
            <button
              type="button"
              onClick={() => alert('Photo uploader: select files to attach.')}
              style={styles.createEstBtn}
            >
              + Upload Photos
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {photos.map((p, i) => (
              <img
                key={p.id || i}
                src={p.url}
                alt="Deck site"
                style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px' }}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'estimates' && (
        <div style={styles.specCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>Attached Estimates</h3>
            <button
              type="button"
              onClick={() => navigate(`/contractor/decks/${deckId || 'proj-1'}/estimate/new`)}
              style={styles.createEstBtn}
            >
              + Create New Estimate
            </button>
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '700', color: '#0f172a' }}>EST-20261103-08659C</div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Full Restoration • $2,378 – $3,566</div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/contractor/estimates')}
              style={styles.editProjectBtn}
            >
              View Estimate
            </button>
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div style={styles.specCard}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#0f172a' }}>
            Project Notes &amp; Activity History
          </h3>
          <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a new project note..."
              style={styles.noteInput}
            />
            <button type="submit" style={styles.createEstBtn}>
              Add Note
            </button>
          </form>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notes.map((n, i) => (
              <div key={i} style={styles.noteItem}>
                {n}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '30px 40px',
    backgroundColor: '#f8fafc',
    minHeight: 'calc(100vh - 65px)',
  },
  breadcrumbRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.82rem',
    marginBottom: '14px',
  },
  breadcrumbLink: {
    color: '#1d4ed8',
    textDecoration: 'none',
    fontWeight: '500',
  },
  breadcrumbDivider: {
    color: '#94a3b8',
  },
  breadcrumbCurrent: {
    color: '#64748b',
    fontWeight: '500',
  },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  projectTitle: {
    fontSize: '1.55rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  statusInProgress: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  clientMeta: {
    fontSize: '0.85rem',
    color: '#64748b',
    marginTop: '6px',
  },
  actionBtnsRow: {
    display: 'flex',
    gap: '10px',
  },
  editProjectBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    color: '#334155',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  createEstBtn: {
    padding: '8px 18px',
    backgroundColor: '#1d4ed8',
    border: 'none',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(29, 78, 216, 0.25)',
  },
  tabBar: {
    display: 'flex',
    gap: '4px',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '24px',
  },
  tabBtn: {
    padding: '10px 18px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: '#64748b',
    fontSize: '0.88rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  tabBtnActive: {
    color: '#1d4ed8',
    borderBottomColor: '#1d4ed8',
    fontWeight: '700',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1.6fr 1fr',
    gap: '24px',
  },
  leftCol: {},
  mainPhotoCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  heroImg: {
    width: '100%',
    height: '320px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  thumbStrip: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
  },
  thumbImg: {
    width: '90px',
    height: '65px',
    objectFit: 'cover',
    borderRadius: '6px',
    cursor: 'pointer',
    border: '1px solid #e2e8f0',
  },
  rightCol: {},
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  cardHeader: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 16px 0',
  },
  summaryTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sumRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.86rem',
    borderBottom: '1px solid #f8fafc',
    paddingBottom: '8px',
  },
  sumLabel: {
    color: '#64748b',
  },
  sumVal: {
    fontWeight: '600',
    color: '#0f172a',
  },
  specCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '24px',
  },
  specGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  specItem: {
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    fontSize: '0.88rem',
    color: '#334155',
  },
  noteInput: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '0.86rem',
    outline: 'none',
  },
  noteItem: {
    padding: '10px 14px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    borderLeft: '3px solid #1d4ed8',
    fontSize: '0.85rem',
    color: '#334155',
  },
};

// =============================================
// Deck Estimator — Customer Dashboard Page
// =============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDecks, deleteDeck } from '../api/decksApi';
import { useAuth } from '../../auth/hooks/useAuth';

export default function CustomerDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [decks, setDecks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    loadDecks(1);
  }, []);

  async function loadDecks(page = 1) {
    setLoading(true);
    setError(null);
    try {
      const data = await getDecks({ page, limit: 9 });
      setDecks(data.decks);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load deck projects.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(deckId, projectName) {
    if (!window.confirm(`Are you sure you want to delete "${projectName}"? This will also permanently delete all associated photos.`)) {
      return;
    }

    try {
      await deleteDeck(deckId);
      setActionMessage(`Project "${projectName}" was deleted successfully.`);
      loadDecks(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to delete deck project.');
    }
  }

  return (
    <div style={styles.container}>
      {/* Top Banner */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>My Deck Projects</h1>
          <p style={styles.subtitle}>
            Welcome back, {user?.fullName || 'Customer'}. Manage your deck specifications, dimensions, and photos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/customer/decks/new')}
          style={styles.newProjectBtn}
        >
          + New Deck Project
        </button>
      </div>

      {actionMessage && (
        <div style={styles.successBanner}>
          {actionMessage}
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', float: 'right' }}
          >
            ✕
          </button>
        </div>
      )}

      {error && <div style={styles.errorBanner}>{error}</div>}

      {/* Content State */}
      {loading ? (
        <div style={styles.loadingBox}>
          <p>Loading your deck projects...</p>
        </div>
      ) : decks.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📐</div>
          <h3 style={styles.emptyTitle}>No Deck Projects Yet</h3>
          <p style={styles.emptyDesc}>
            You haven't entered any decks yet. Create your first project by adding dimensions, surface details, and photos to get accurate estimates.
          </p>
          <button
            type="button"
            onClick={() => navigate('/customer/decks/new')}
            style={styles.createFirstBtn}
          >
            Create Your First Deck Project
          </button>
        </div>
      ) : (
        <>
          <div style={styles.grid}>
            {decks.map((deck) => {
              const area = deck.dimensions?.area
                ? `${deck.dimensions.area} sq ${deck.measurementUnit || 'ft'}`
                : 'Area pending';
              const locationStr = [deck.propertyAddress?.city, deck.propertyAddress?.state]
                .filter(Boolean)
                .join(', ') || 'No address specified';

              return (
                <div key={deck.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div>
                      <h3 style={styles.cardTitle}>{deck.projectName}</h3>
                      <span style={styles.cardLocation}>{locationStr}</span>
                    </div>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: deck.completionStatus === 'complete' ? '#dcfce7' : '#fef9c3',
                        color: deck.completionStatus === 'complete' ? '#15803d' : '#854d0e',
                      }}
                    >
                      {deck.completionStatus === 'complete' ? 'Complete' : 'Draft'}
                    </span>
                  </div>

                  <div style={styles.cardDetails}>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Shape:</span>
                      <span style={styles.detailValue}>{deck.deckShape?.toUpperCase() || 'RECTANGLE'}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Size:</span>
                      <span style={styles.detailValueBold}>{area}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Material:</span>
                      <span style={styles.detailValue}>
                        {deck.surfaceDetails?.material || 'Wood'} ({deck.surfaceDetails?.coatingStatus || 'none'})
                      </span>
                    </div>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Updated:</span>
                      <span style={styles.detailValue}>
                        {new Date(deck.updatedAt || deck.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div style={styles.cardActions}>
                    <button
                      type="button"
                      onClick={() => navigate(`/customer/decks/${deck.id}`)}
                      style={styles.viewBtn}
                    >
                      View & Photos
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/customer/decks/${deck.id}/edit`)}
                      style={styles.editBtn}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(deck.id, deck.projectName)}
                      style={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => loadDecks(pagination.page - 1)}
                style={styles.pageBtn}
              >
                ← Previous
              </button>
              <span style={styles.pageInfo}>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadDecks(pagination.page + 1)}
                style={styles.pageBtn}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '30px auto',
    padding: '0 20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  pageTitle: {
    fontSize: '26px',
    fontWeight: '700',
    color: 'var(--color-text)',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--color-text-muted)',
    marginTop: '4px',
  },
  newProjectBtn: {
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 'var(--radius)',
    padding: '11px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: 'var(--shadow)',
  },
  successBanner: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#15803d',
    padding: '12px 18px',
    borderRadius: 'var(--radius)',
    marginBottom: '20px',
    fontSize: '14px',
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: 'var(--color-danger)',
    padding: '12px 18px',
    borderRadius: 'var(--radius)',
    marginBottom: '20px',
    fontSize: '14px',
  },
  loadingBox: {
    textAlign: 'center',
    padding: '60px 20px',
    color: 'var(--color-text-muted)',
  },
  emptyState: {
    backgroundColor: 'var(--color-surface)',
    border: '1px dashed var(--color-border)',
    borderRadius: 'var(--radius)',
    padding: '50px 30px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--color-text)',
    marginBottom: '8px',
  },
  emptyDesc: {
    fontSize: '14px',
    color: 'var(--color-text-muted)',
    maxWidth: '500px',
    lineHeight: '1.5',
    marginBottom: '24px',
  },
  createFirstBtn: {
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 'var(--radius)',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    padding: '20px',
    boxShadow: 'var(--shadow)',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '14px',
  },
  cardTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: 'var(--color-text)',
    marginBottom: '2px',
  },
  cardLocation: {
    fontSize: '12px',
    color: 'var(--color-text-muted)',
  },
  statusBadge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 8px',
    borderRadius: '12px',
    textTransform: 'uppercase',
  },
  cardDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '20px',
    backgroundColor: 'var(--color-bg)',
    padding: '12px',
    borderRadius: 'var(--radius)',
    flex: 1,
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
  },
  detailLabel: {
    color: 'var(--color-text-muted)',
  },
  detailValue: {
    color: 'var(--color-text)',
  },
  detailValueBold: {
    fontWeight: '600',
    color: '#166534',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    marginTop: 'auto',
  },
  viewBtn: {
    flex: 2,
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 'var(--radius)',
    padding: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    borderRadius: 'var(--radius)',
    padding: '8px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  deleteBtn: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    color: 'var(--color-danger)',
    borderRadius: 'var(--radius)',
    padding: '8px 12px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    marginTop: '32px',
  },
  pageBtn: {
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    fontSize: '13px',
  },
  pageInfo: {
    fontSize: '13px',
    color: 'var(--color-text-muted)',
  },
};

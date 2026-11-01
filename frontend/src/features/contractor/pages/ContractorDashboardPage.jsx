// =============================================
// Deck Estimator — Contractor Dashboard Page
// =============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDecks, deleteDeck } from '../../customer/api/decksApi';
import { useAuth } from '../../auth/hooks/useAuth';

export default function ContractorDashboardPage() {
  const navigate = useNavigate();
  const { user, contractorProfile } = useAuth();
  const [decks, setDecks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const isApproved = contractorProfile?.verificationStatus === 'approved';

  useEffect(() => {
    if (isApproved) {
      loadDecks(1);
    } else {
      setLoading(false);
    }
  }, [isApproved]);

  async function loadDecks(page = 1) {
    setLoading(true);
    setError(null);
    try {
      const data = await getDecks({ page, limit: 9 });
      setDecks(data.decks);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load contractor deck projects.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(deckId, projectName) {
    if (!window.confirm(`Are you sure you want to delete deck job "${projectName}"? This will also remove all job photos.`)) {
      return;
    }

    try {
      await deleteDeck(deckId);
      setActionMessage(`Deck project "${projectName}" was deleted successfully.`);
      loadDecks(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to delete deck project.');
    }
  }

  return (
    <div style={styles.container}>
      {/* Contractor Header */}
      <div style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={styles.pageTitle}>Contractor Deck Management</h1>
            <span
              style={{
                ...styles.verificationBadge,
                backgroundColor: isApproved ? '#dcfce7' : '#fef9c3',
                color: isApproved ? '#15803d' : '#854d0e',
              }}
            >
              {isApproved ? '✓ Verified Contractor' : `Status: ${contractorProfile?.verificationStatus || 'Pending'}`}
            </span>
          </div>
          <p style={styles.subtitle}>
            {contractorProfile?.businessName || user?.fullName} — Manage your client deck measurements, surveys, and site photographs.
          </p>
        </div>

        {isApproved && (
          <button
            type="button"
            onClick={() => navigate('/contractor/decks/new')}
            style={styles.newProjectBtn}
          >
            + Create New Deck Record
          </button>
        )}
      </div>

      {/* Verification Notice for Non-Approved Contractors */}
      {!isApproved && (
        <div style={styles.pendingNotice}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
            Account Verification In Progress
          </h3>
          <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
            Your contractor account is currently in <strong>{contractorProfile?.verificationStatus || 'pending_verification'}</strong> status.
            Administrative approval of your contractor license ({contractorProfile?.licenseNumber || 'on file'}) is required before creating active client deck records.
          </p>
        </div>
      )}

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
      {isApproved && (
        loading ? (
          <div style={styles.loadingBox}>
            <p>Loading your authorized deck records...</p>
          </div>
        ) : decks.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🛠️</div>
            <h3 style={styles.emptyTitle}>No Contractor Deck Records</h3>
            <p style={styles.emptyDesc}>
              You haven't entered any project specifications yet. Create a deck record to log client property measurements, shapes, materials, and survey photos.
            </p>
            <button
              type="button"
              onClick={() => navigate('/contractor/decks/new')}
              style={styles.createFirstBtn}
            >
              Create First Deck Record
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
                        <span style={styles.detailLabel}>Geometry:</span>
                        <span style={styles.detailValue}>{deck.deckShape?.toUpperCase() || 'RECTANGLE'}</span>
                      </div>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Measurements:</span>
                        <span style={styles.detailValueBold}>{area}</span>
                      </div>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Surface:</span>
                        <span style={styles.detailValue}>
                          {deck.surfaceDetails?.material || 'Wood'} ({deck.surfaceDetails?.coatingStatus || 'none'})
                        </span>
                      </div>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Last Updated:</span>
                        <span style={styles.detailValue}>
                          {new Date(deck.updatedAt || deck.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div style={styles.cardActions}>
                      <button
                        type="button"
                        onClick={() => navigate(`/contractor/decks/${deck.id}`)}
                        style={styles.viewBtn}
                      >
                        Site Photos & Details
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/contractor/decks/${deck.id}/edit`)}
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
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total records)
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
        )
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
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--color-text)',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--color-text-muted)',
    marginTop: '4px',
  },
  verificationBadge: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 10px',
    borderRadius: '12px',
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
  pendingNotice: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fef08a',
    color: '#854d0e',
    padding: '16px 20px',
    borderRadius: 'var(--radius)',
    marginBottom: '24px',
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


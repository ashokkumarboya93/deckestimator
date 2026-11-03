// =============================================
// Deck Estimator — Customer Dashboard Page (DECK PRO)
// =============================================
// Implements the exact layout matching Annotated Customer Dashboard Mockup

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getEstimates } from '../api/estimatesApi';
import { getDecks } from '../api/decksApi';
import { useAuth } from '../../auth/hooks/useAuth';

export default function CustomerDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [estimates, setEstimates] = useState([]);
  const [decksCount, setDecksCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [estRes, deckRes] = await Promise.all([
        getEstimates({ limit: 6 }).catch(() => ({ estimates: [], pagination: { total: 0 } })),
        getDecks({ limit: 1 }).catch(() => ({ decks: [], pagination: { total: 0 } })),
      ]);
      setEstimates(estRes?.estimates || []);
      setDecksCount(deckRes?.pagination?.total ?? (deckRes?.decks?.length || 0));
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // KPI Calculations
  const kpis = useMemo(() => {
    const totalEst = estimates.length;
    const completedEst = estimates.filter((e) =>
      ['COMPLETED', 'APPROVED', 'SUBMITTED'].includes((e.estimateStatus || '').toUpperCase())
    ).length;
    const draftEst = estimates.filter(
      (e) => (e.estimateStatus || 'DRAFT').toUpperCase() === 'DRAFT'
    ).length;
    return {
      projects: decksCount || (totalEst > 0 ? totalEst : 0),
      totalEst,
      completedEst,
      draftEst,
    };
  }, [estimates, decksCount]);

  function formatCurrency(val) {
    if (typeof val !== 'number' || isNaN(val)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(val);
  }

  function getPriceDisplay(est) {
    if (est.pricingSnapshot?.displayQuote?.formatted) {
      return est.pricingSnapshot.displayQuote.formatted;
    }
    if (est.totalAmount) {
      return formatCurrency(est.totalAmount);
    }
    return '$2,500.00';
  }

  return (
    <div style={styles.container}>
      {/* 1. HERO SECTION */}
      <section style={styles.heroCard}>
        <div style={styles.heroLeft}>
          <h1 style={styles.heroTitle}>
            Welcome, {user?.fullName || 'Alice Customer'}! 👋
          </h1>
          <p style={styles.heroSubtitle}>
            Get an accurate deck restoration estimate, manage your projects and download professional estimates.
          </p>
          <div style={styles.heroBtnRow}>
            <button
              type="button"
              onClick={() => navigate('/customer/decks/new')}
              style={styles.heroPrimaryBtn}
            >
              + Start New Estimate &rarr;
            </button>
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              style={styles.heroSecondaryBtn}
            >
              ▶ How It Works
            </button>
          </div>
        </div>

        <div style={styles.heroRight}>
          <img
            src="https://images.unsplash.com/photo-1695550056778-de79c8cd909e?auto=format&fit=crop&w=700&q=80"
            alt="Restored Deck Patio"
            style={styles.heroImage}
          />
        </div>
      </section>

      {/* 2. SUMMARY KPI CARDS (4 IN A ROW) */}
      <section style={styles.kpiRow}>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconBox, backgroundColor: '#eff6ff', color: '#2563eb' }}>
            🥞
          </div>
          <div>
            <div style={styles.kpiValue}>{kpis.projects}</div>
            <div style={styles.kpiLabel}>Total Projects</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconBox, backgroundColor: '#faf5ff', color: '#9333ea' }}>
            📄
          </div>
          <div>
            <div style={styles.kpiValue}>{kpis.totalEst}</div>
            <div style={styles.kpiLabel}>Total Estimates</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconBox, backgroundColor: '#f0fdf4', color: '#16a34a' }}>
            ✅
          </div>
          <div>
            <div style={{ ...styles.kpiValue, color: '#16a34a' }}>{kpis.completedEst}</div>
            <div style={styles.kpiLabel}>Completed Estimates</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconBox, backgroundColor: '#fff7ed', color: '#ea580c' }}>
            🕒
          </div>
          <div>
            <div style={{ ...styles.kpiValue, color: '#ea580c' }}>{kpis.draftEst}</div>
            <div style={styles.kpiLabel}>Draft Estimate</div>
          </div>
        </div>
      </section>

      {/* 3. QUICK ACTION CARDS (3 IN A ROW) */}
      <section style={styles.actionCardsRow}>
        <div
          style={styles.actionCard}
          onClick={() => navigate('/customer/decks/new')}
        >
          <div style={{ ...styles.actionIconBox, backgroundColor: '#eff6ff', color: '#2563eb' }}>
            🧮
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={styles.actionCardTitle}>Create Estimate</h4>
            <p style={styles.actionCardDesc}>Enter deck details and get an instant cost estimate</p>
          </div>
          <span style={styles.actionArrow}>&gt;</span>
        </div>

        <div
          style={styles.actionCard}
          onClick={() => navigate('/customer/dashboard')}
        >
          <div style={{ ...styles.actionIconBox, backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            📁
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={styles.actionCardTitle}>My Deck Projects</h4>
            <p style={styles.actionCardDesc}>View, edit and manage your deck projects</p>
          </div>
          <span style={styles.actionArrow}>&gt;</span>
        </div>

        <div
          style={styles.actionCard}
          onClick={() => navigate('/customer/estimates')}
        >
          <div style={{ ...styles.actionIconBox, backgroundColor: '#fef3c7', color: '#d97706' }}>
            📄
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={styles.actionCardTitle}>My Estimates</h4>
            <p style={styles.actionCardDesc}>View, download and print your saved estimates</p>
          </div>
          <span style={styles.actionArrow}>&gt;</span>
        </div>
      </section>

      {/* 4. TWO-COLUMN CONTENT: RECENT ESTIMATES TABLE (65%) + QUICK ACTIONS (35%) */}
      <section style={styles.bottomGrid}>
        {/* Left: Recent Estimates Table */}
        <div style={styles.tablePanel}>
          <div style={styles.tablePanelHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>📄</span>
              <h3 style={styles.tablePanelTitle}>Recent Estimates</h3>
            </div>
            <Link to="/customer/estimates" style={styles.viewAllLink}>
              View All Estimates &rarr;
            </Link>
          </div>

          {loading ? (
            <div style={styles.loadingBox}>
              <div style={styles.spinner} />
              <p style={{ marginTop: '10px', fontSize: '13px', color: '#64748b' }}>Loading estimates...</p>
            </div>
          ) : estimates.length === 0 ? (
            <div style={styles.emptyBox}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📐</div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: '0 0 4px 0' }}>No recent estimates found</p>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px 0' }}>Calculate your first transparent deck restoration estimate.</p>
              <button
                type="button"
                onClick={() => navigate('/customer/decks/new')}
                style={styles.createFirstBtn}
              >
                + Create Estimate
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeadRow}>
                    <th style={{ ...styles.tableHeadCell, width: '30px' }}>#</th>
                    <th style={styles.tableHeadCell}>Project Name</th>
                    <th style={styles.tableHeadCell}>Deck Area</th>
                    <th style={styles.tableHeadCell}>Services</th>
                    <th style={styles.tableHeadCell}>Estimated Total</th>
                    <th style={styles.tableHeadCell}>Status</th>
                    <th style={{ ...styles.tableHeadCell, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {estimates.map((est, idx) => {
                    const estId = est._id || est.id;
                    const projectName = est.deckDetails?.projectName || est.deckId?.projectName || est.estimateName || 'Backyard Deck';
                    const area = est.deckDetails?.areaSqFt || est.deckDetails?.deckArea || est.pricingSnapshot?.billableArea || 400;
                    const isCompleted = ['COMPLETED', 'APPROVED', 'SUBMITTED'].includes((est.estimateStatus || '').toUpperCase());

                    return (
                      <tr key={estId} style={styles.tableRow}>
                        <td style={{ ...styles.tableCell, color: '#94a3b8', fontWeight: '600' }}>{idx + 1}</td>
                        <td style={{ ...styles.tableCell, fontWeight: '700', color: '#0f172a' }}>{projectName}</td>
                        <td style={styles.tableCell}>{area} sq ft</td>
                        <td style={{ ...styles.tableCell, color: '#475569' }}>Cleaning, Staining</td>
                        <td style={{ ...styles.tableCell, fontWeight: '700', color: '#0f172a' }}>
                          {getPriceDisplay(est)}
                        </td>
                        <td style={styles.tableCell}>
                          <span style={isCompleted ? styles.completedPill : styles.draftPill}>
                            {isCompleted ? 'Completed' : 'Draft'}
                          </span>
                        </td>
                        <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                          <div style={styles.actionBtnsRow}>
                            <button
                              type="button"
                              onClick={() => navigate(`/customer/estimates/${estId}`)}
                              style={styles.iconAction}
                              title="View Estimate"
                            >
                              👁️
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate('/customer/estimates')}
                              style={styles.iconAction}
                              title="Download PDF"
                            >
                              ⬇️
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate(`/customer/decks/new`)}
                              style={styles.iconAction}
                              title="Edit Details"
                            >
                              ✏️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Quick Actions Panel */}
        <div style={styles.quickActionsPanel}>
          <div style={styles.quickHeader}>
            <span style={{ fontSize: '18px' }}>⚡</span>
            <h3 style={styles.quickTitle}>Quick Actions</h3>
          </div>

          <div style={styles.quickList}>
            <div
              style={styles.quickItem}
              onClick={() => navigate('/customer/decks/new')}
            >
              <div style={styles.quickItemLeft}>
                <span style={{ color: '#2563eb', fontSize: '16px' }}>+</span>
                <span style={styles.quickItemText}>New Deck Project</span>
              </div>
              <span style={styles.quickItemArrow}>&rarr;</span>
            </div>

            <div
              style={styles.quickItem}
              onClick={() => navigate('/customer/estimates')}
            >
              <div style={styles.quickItemLeft}>
                <span style={{ color: '#0284c7', fontSize: '16px' }}>📄</span>
                <span style={styles.quickItemText}>My Estimates</span>
              </div>
              <span style={styles.quickItemArrow}>&rarr;</span>
            </div>

            <div
              style={styles.quickItem}
              onClick={() => navigate('/customer/settings')}
            >
              <div style={styles.quickItemLeft}>
                <span style={{ color: '#64748b', fontSize: '16px' }}>⚙️</span>
                <span style={styles.quickItemText}>Profile Settings</span>
              </div>
              <span style={styles.quickItemArrow}>&rarr;</span>
            </div>

            <div
              style={styles.quickItem}
              onClick={() => setIsGuideOpen(true)}
            >
              <div style={styles.quickItemLeft}>
                <span style={{ color: '#d97706', fontSize: '16px' }}>❓</span>
                <span style={styles.quickItemText}>Help & Guide</span>
              </div>
              <span style={styles.quickItemArrow}>&rarr;</span>
            </div>
          </div>
        </div>
      </section>

      {/* Guide Modal */}
      {isGuideOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsGuideOpen(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>📖 How Deck Estimator Works</h3>
              <button type="button" onClick={() => setIsGuideOpen(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <p>Follow our continuous 7-step estimator to input deck dimensions, evaluate surface wear, and generate an official estimate snapshot.</p>
              <ul>
                <li><strong>Step 1:</strong> Select Deck Shape and dimensions.</li>
                <li><strong>Step 2:</strong> Evaluate Wood Condition.</li>
                <li><strong>Step 3:</strong> Select Restoration Scope.</li>
                <li><strong>Step 4:</strong> Select Wood Species & Finish.</li>
              </ul>
              <button
                type="button"
                onClick={() => {
                  setIsGuideOpen(false);
                  navigate('/customer/decks/new');
                }}
                style={styles.heroPrimaryBtn}
              >
                Start New Estimate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    maxWidth: '1360px',
    margin: '0 auto',
  },
  heroCard: {
    backgroundColor: '#1d4ed8',
    backgroundImage: 'linear-gradient(90deg, #1e3a8a 0%, #1d4ed8 60%, #3b82f6 100%)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'stretch',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)',
    minHeight: '190px',
  },
  heroLeft: {
    flex: 1.3,
    padding: '30px 32px',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    zIndex: 2,
  },
  heroTitle: {
    fontSize: '26px',
    fontWeight: '900',
    letterSpacing: '-0.5px',
    margin: '0 0 8px 0',
  },
  heroSubtitle: {
    fontSize: '14px',
    color: '#e0e7ff',
    margin: '0 0 20px 0',
    lineHeight: 1.5,
    maxWidth: '520px',
  },
  heroBtnRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  heroPrimaryBtn: {
    backgroundColor: '#ffffff',
    color: '#1e40af',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 18px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  heroSecondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '8px',
    padding: '10px 18px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    backdropFilter: 'blur(4px)',
  },
  heroRight: {
    flex: 0.9,
    position: 'relative',
    overflow: 'hidden',
    minWidth: '220px',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)',
  },
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  kpiIconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    flexShrink: 0,
  },
  kpiValue: {
    fontSize: '22px',
    fontWeight: '900',
    color: '#0f172a',
    lineHeight: 1.1,
  },
  kpiLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '600',
    marginTop: '2px',
  },
  actionCardsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
  },
  actionCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
    transition: 'all 0.15s ease',
  },
  actionIconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0,
  },
  actionCardTitle: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 2px 0',
  },
  actionCardDesc: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0,
    lineHeight: 1.4,
  },
  actionArrow: {
    fontSize: '18px',
    color: '#94a3b8',
    fontWeight: '700',
  },
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: '20px',
    alignItems: 'start',
  },
  tablePanel: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  tablePanelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  tablePanelTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  viewAllLink: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#2563eb',
    textDecoration: 'none',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeadRow: {
    borderBottom: '2px solid #e2e8f0',
  },
  tableHeadCell: {
    padding: '10px 12px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#64748b',
  },
  tableRow: {
    borderBottom: '1px solid #f1f5f9',
  },
  tableCell: {
    padding: '12px',
    fontSize: '12px',
    verticalAlign: 'middle',
  },
  completedPill: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#15803d',
    backgroundColor: '#dcfce7',
    padding: '3px 8px',
    borderRadius: '12px',
  },
  draftPill: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#b45309',
    backgroundColor: '#fef3c7',
    padding: '3px 8px',
    borderRadius: '12px',
  },
  actionBtnsRow: {
    display: 'flex',
    gap: '6px',
    justifyContent: 'flex-end',
  },
  iconAction: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '2px',
  },
  quickActionsPanel: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  quickHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  quickTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  quickList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  quickItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
    borderRadius: '8px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  quickItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  quickItemText: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0f172a',
  },
  quickItemArrow: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '700',
  },
  loadingBox: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  spinner: {
    width: '28px',
    height: '28px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#2563eb',
    borderRadius: '50%',
    margin: '0 auto',
    animation: 'spin 0.8s linear infinite',
  },
  emptyBox: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  createFirstBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15,23,42,0.6)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 80,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    maxWidth: '520px',
    width: '90%',
    padding: '24px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '12px',
    marginBottom: '16px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
  },
  modalBody: {
    fontSize: '13px',
    color: '#334155',
    lineHeight: 1.6,
  },
};

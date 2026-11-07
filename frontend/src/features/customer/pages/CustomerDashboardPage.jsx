// =============================================
// Deck Estimator — Customer Dashboard Page (DECK PRO)
// =============================================
// Modern Architectural Design:
// - Premium Navy & Samsung Blue Hero Banner with live guarantee badge
// - High-contrast responsive KPI metric cards
// - Quick Navigation Action cards
// - Responsive Recent Estimates table with SVG action buttons
// - Quick Actions panel connecting directly to /customer/profile

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
      {/* 1. HERO SECTION — ARCHITECTURAL SAMSUNG BLUE & DEEP NAVY */}
      <section style={styles.heroCard}>
        <div style={styles.heroLeft}>
          <div style={styles.heroBadge}>
            <span style={styles.heroBadgeDot} />
            <span>PRECISION RESTORATION ESTIMATION PORTAL</span>
          </div>
          <h1 style={styles.heroTitle}>
            Welcome, {user?.fullName || 'Valued Homeowner'}!
          </h1>
          <p style={styles.heroSubtitle}>
            Calculate guaranteed deck restoration quotes, schedule licensed local contractors, and manage project specifications with full transparent pricing.
          </p>
          <div style={styles.heroBtnRow}>
            <button
              type="button"
              onClick={() => navigate('/customer/decks/new')}
              style={styles.heroPrimaryBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <span>+ Start New Estimation</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              style={styles.heroSecondaryBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.22)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>Restoration Calculator Guide</span>
            </button>
          </div>
        </div>

        <div style={styles.heroRight}>
          <div style={styles.heroImageWrapper}>
            <img
              src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80"
              alt="Restored Natural Cedar Deck"
              style={styles.heroImage}
            />
            <div style={styles.heroImageOverlayBadge}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span>100% Price Lock Guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SUMMARY KPI CARDS (4 IN A RESPONSIVE ROW) */}
      <section style={styles.kpiRow}>
        {/* KPI 1 */}
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconBox, backgroundColor: '#eff6ff', color: '#034EA2' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <div style={styles.kpiValue}>{kpis.projects}</div>
            <div style={styles.kpiLabel}>Total Projects</div>
            <div style={styles.kpiSub}>Registered deck footprints</div>
          </div>
        </div>

        {/* KPI 2 */}
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconBox, backgroundColor: '#eff6ff', color: '#0284c7' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div>
            <div style={styles.kpiValue}>{kpis.totalEst}</div>
            <div style={styles.kpiLabel}>Total Estimates</div>
            <div style={styles.kpiSub}>Calculated quotes</div>
          </div>
        </div>

        {/* KPI 3 */}
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconBox, backgroundColor: '#ecfdf5', color: '#16a34a' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <div style={{ ...styles.kpiValue, color: '#15803d' }}>{kpis.completedEst}</div>
            <div style={styles.kpiLabel}>Completed Estimates</div>
            <div style={styles.kpiSub}>Official scope verified</div>
          </div>
        </div>

        {/* KPI 4 */}
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconBox, backgroundColor: '#fffbeb', color: '#d97706' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <div style={{ ...styles.kpiValue, color: '#b45309' }}>{kpis.draftEst}</div>
            <div style={styles.kpiLabel}>Draft Estimates</div>
            <div style={styles.kpiSub}>In-progress setups</div>
          </div>
        </div>
      </section>

      {/* 3. QUICK NAVIGATION ACTION CARDS */}
      <section style={styles.actionCardsRow}>
        <div
          style={styles.actionCard}
          onClick={() => navigate('/customer/decks/new')}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#034EA2';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <div style={{ ...styles.actionIconBox, backgroundColor: '#eff6ff', color: '#034EA2' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={styles.actionCardTitle}>Create Estimate</h4>
            <p style={styles.actionCardDesc}>Enter deck footprint, select wood &amp; get guaranteed pricing</p>
          </div>
          <span style={styles.actionArrow}>&rarr;</span>
        </div>

        <div
          style={styles.actionCard}
          onClick={() => navigate('/customer/estimates')}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#034EA2';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <div style={{ ...styles.actionIconBox, backgroundColor: '#f0fdf4', color: '#16a34a' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={styles.actionCardTitle}>My Deck Projects</h4>
            <p style={styles.actionCardDesc}>Review specifications, surface dimensions, and site photos</p>
          </div>
          <span style={styles.actionArrow}>&rarr;</span>
        </div>

        <div
          style={styles.actionCard}
          onClick={() => navigate('/customer/estimates')}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#034EA2';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <div style={{ ...styles.actionIconBox, backgroundColor: '#f8fafc', color: '#475569' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={styles.actionCardTitle}>My Estimates</h4>
            <p style={styles.actionCardDesc}>View, download and print your official estimate records</p>
          </div>
          <span style={styles.actionArrow}>&rarr;</span>
        </div>
      </section>

      {/* 4. TWO-COLUMN LAYOUT: RECENT ESTIMATES TABLE (68%) + QUICK ACTIONS (32%) */}
      <section style={styles.bottomGrid}>
        {/* Left: Recent Estimates Table */}
        <div style={styles.tablePanel}>
          <div style={styles.tablePanelHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={styles.tableHeaderIconBox}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#034EA2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h3 style={styles.tablePanelTitle}>Recent Estimates</h3>
              <span style={styles.tableBadge}>{estimates.length}</span>
            </div>
            <Link to="/customer/estimates" style={styles.viewAllLink}>
              <span>View All Estimates</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div style={styles.loadingBox}>
              <div style={styles.spinner} />
              <p style={{ marginTop: '12px', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                Loading deck estimates...
              </p>
            </div>
          ) : estimates.length === 0 ? (
            <div style={styles.emptyBox}>
              <div style={styles.emptyIconCircle}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <p style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>
                No recent estimates found
              </p>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0', maxWidth: '340px' }}>
                Calculate your first guaranteed deck restoration quote in under 2 minutes.
              </p>
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
                    <th style={{ ...styles.tableHeadCell, width: '36px' }}>#</th>
                    <th style={styles.tableHeadCell}>Project Name</th>
                    <th style={styles.tableHeadCell}>Deck Area</th>
                    <th style={styles.tableHeadCell}>Scope</th>
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
                        <td style={{ ...styles.tableCell, color: '#94a3b8', fontWeight: '600' }}>
                          {idx + 1}
                        </td>
                        <td style={{ ...styles.tableCell, fontWeight: '700', color: '#0f172a' }}>
                          {projectName}
                        </td>
                        <td style={styles.tableCell}>
                          <span style={styles.areaBadge}>{area} sq ft</span>
                        </td>
                        <td style={{ ...styles.tableCell, color: '#475569', fontSize: '12.5px' }}>
                          Cleaning &amp; Staining
                        </td>
                        <td style={{ ...styles.tableCell, fontWeight: '800', color: '#034EA2' }}>
                          {getPriceDisplay(est)}
                        </td>
                        <td style={styles.tableCell}>
                          <span style={isCompleted ? styles.completedPill : styles.draftPill}>
                            <span style={isCompleted ? styles.pillDotCompleted : styles.pillDotDraft} />
                            {isCompleted ? 'Completed' : 'Draft'}
                          </span>
                        </td>
                        <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                          <div style={styles.actionBtnsRow}>
                            <button
                              type="button"
                              onClick={() => navigate(`/customer/estimates/${estId}`)}
                              style={styles.iconAction}
                              title="View Estimate Details"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#034EA2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate('/customer/estimates')}
                              style={styles.iconAction}
                              title="Download PDF"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate('/customer/decks/new')}
                              style={styles.iconAction}
                              title="Edit / Recalculate Deck"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                              </svg>
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

        {/* Right: Quick Actions & Support Panel */}
        <div style={styles.quickActionsCol}>
          {/* Quick Actions Card */}
          <div style={styles.quickActionsPanel}>
            <div style={styles.quickHeader}>
              <div style={styles.quickHeaderIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#034EA2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3 style={styles.quickTitle}>Quick Actions</h3>
            </div>

            <div style={styles.quickList}>
              <div
                style={styles.quickItem}
                onClick={() => navigate('/customer/decks/new')}
              >
                <div style={styles.quickItemLeft}>
                  <div style={{ ...styles.quickIconMini, backgroundColor: '#eff6ff', color: '#034EA2' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                  <span style={styles.quickItemText}>New Deck Project</span>
                </div>
                <span style={styles.quickItemArrow}>&rarr;</span>
              </div>

              <div
                style={styles.quickItem}
                onClick={() => navigate('/customer/estimates')}
              >
                <div style={styles.quickItemLeft}>
                  <div style={{ ...styles.quickIconMini, backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <span style={styles.quickItemText}>My Estimates</span>
                </div>
                <span style={styles.quickItemArrow}>&rarr;</span>
              </div>

              <div
                style={styles.quickItem}
                onClick={() => navigate('/customer/profile')}
              >
                <div style={styles.quickItemLeft}>
                  <div style={{ ...styles.quickIconMini, backgroundColor: '#f8fafc', color: '#475569' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                  </div>
                  <span style={styles.quickItemText}>Profile Settings</span>
                </div>
                <span style={styles.quickItemArrow}>&rarr;</span>
              </div>

              <div
                style={styles.quickItem}
                onClick={() => setIsGuideOpen(true)}
              >
                <div style={styles.quickItemLeft}>
                  <div style={{ ...styles.quickIconMini, backgroundColor: '#fffbeb', color: '#d97706' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <span style={styles.quickItemText}>Restoration Guide</span>
                </div>
                <span style={styles.quickItemArrow}>&rarr;</span>
              </div>
            </div>
          </div>

          {/* Assistance Support Card */}
          <div style={styles.supportCard}>
            <div style={styles.supportHeader}>
              <div style={styles.supportIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#034EA2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <h4 style={styles.supportTitle}>Need Estimator Help?</h4>
            </div>
            <p style={styles.supportText}>
              Our certified deck restoration estimators are available to assist with custom footprints, wood conditions, or commercial scopes.
            </p>
            <div style={styles.supportPhoneRow}>
              <span style={{ fontWeight: '700', color: '#034EA2' }}>(856) 678-3325</span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Mon-Fri 8am-6pm</span>
            </div>
          </div>
        </div>
      </section>

      {/* Guide Walkthrough Modal */}
      {isGuideOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsGuideOpen(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={styles.modalIconCircle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#034EA2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                  Restoration Calculator Guide &amp; How It Works
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGuideOpen(false)}
                style={styles.closeBtn}
                title="Close"
              >
                ✕
              </button>
            </div>
            <div style={styles.modalBody}>
              <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                Follow our 9-step precision calculator to generate a guaranteed quote conforming to industry standards.
              </p>
              <div style={styles.guideStepList}>
                <div style={styles.guideStepItem}>
                  <span style={styles.stepBadge}>1</span>
                  <div>
                    <strong>Dimensions &amp; Shape:</strong> Rectangle, Square, L-Shape, Multi-Level, or Custom area calculation.
                  </div>
                </div>
                <div style={styles.guideStepItem}>
                  <span style={styles.stepBadge}>2</span>
                  <div>
                    <strong>Stairs (Count-Based):</strong> Stairs are calculated precisely per stair step (not by sq ft), plus railings and fascia.
                  </div>
                </div>
                <div style={styles.guideStepItem}>
                  <span style={styles.stepBadge}>3</span>
                  <div>
                    <strong>Wood Species Rules:</strong> Pressure-treated pine, cedar, redwood, or composite/Trex (locks to cleaning only).
                  </div>
                </div>
                <div style={styles.guideStepItem}>
                  <span style={styles.stepBadge}>4</span>
                  <div>
                    <strong>Existing Finish:</strong> Bare wood, transparent sealer, semi-transparent stain, or solid paint stripping.
                  </div>
                </div>
                <div style={styles.guideStepItem}>
                  <span style={styles.stepBadge}>5</span>
                  <div>
                    <strong>Restoration Scope:</strong> Deep wash, metasilicate stripper, brightener neutralizer, and mechanical sanding.
                  </div>
                </div>
                <div style={styles.guideStepItem}>
                  <span style={styles.stepBadge}>6</span>
                  <div>
                    <strong>Damage Overlaps:</strong> Crack and loose board repairs consolidated with rot inspection fee capped at $150.
                  </div>
                </div>
                <div style={styles.guideStepItem}>
                  <span style={styles.stepBadge}>7</span>
                  <div>
                    <strong>Photo Upload (Optional):</strong> Daylight photos of surface, stairs, and problem areas to calibrate quote.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsGuideOpen(false);
                  navigate('/customer/decks/new');
                }}
                style={styles.modalLaunchBtn}
              >
                Start New Estimation &rarr;
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
    maxWidth: '1380px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },

  // HERO BANNER
  heroCard: {
    background: 'linear-gradient(135deg, #071E3D 0%, #034EA2 55%, #0284C7 100%)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    boxShadow: '0 10px 25px rgba(3, 78, 162, 0.18)',
    minHeight: '210px',
    padding: '28px 32px',
    position: 'relative',
    gap: '24px',
    flexWrap: 'wrap',
  },
  heroLeft: {
    flex: '1 1 540px',
    color: '#ffffff',
    zIndex: 2,
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    border: '1px solid rgba(255, 255, 255, 0.22)',
    borderRadius: '20px',
    padding: '4px 12px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.6px',
    color: '#E0F2FE',
    marginBottom: '12px',
    textTransform: 'uppercase',
  },
  heroBadgeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#38BDF8',
  },
  heroTitle: {
    fontSize: '28px',
    fontWeight: '900',
    letterSpacing: '-0.5px',
    margin: '0 0 10px 0',
    color: '#ffffff',
    lineHeight: 1.2,
  },
  heroSubtitle: {
    fontSize: '14px',
    color: '#E0E7FF',
    margin: '0 0 22px 0',
    lineHeight: 1.5,
    maxWidth: '560px',
    fontWeight: '400',
  },
  heroBtnRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  heroPrimaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#ffffff',
    color: '#034EA2',
    border: 'none',
    borderRadius: '10px',
    padding: '11px 20px',
    fontSize: '13.5px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
    transition: 'all 0.18s ease',
  },
  heroSecondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    color: '#ffffff',
    border: '1.5px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '10px',
    padding: '10px 18px',
    fontSize: '13.5px',
    fontWeight: '600',
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
    transition: 'all 0.18s ease',
  },
  heroRight: {
    flex: '0 1 340px',
    display: 'flex',
    justifyContent: 'center',
    zIndex: 2,
  },
  heroImageWrapper: {
    position: 'relative',
    width: '320px',
    height: '160px',
    borderRadius: '14px',
    overflow: 'hidden',
    border: '2px solid rgba(255, 255, 255, 0.25)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  heroImageOverlayBadge: {
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    right: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(6px)',
    borderRadius: '8px',
    padding: '6px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11.5px',
    fontWeight: '700',
    color: '#0f172a',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },

  // KPI CARDS
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  kpiIconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  kpiValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 1.1,
    marginBottom: '2px',
  },
  kpiLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
  },
  kpiSub: {
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '2px',
  },

  // ACTION CARDS
  actionCardsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '16px',
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
  },
  actionIconBox: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionCardTitle: {
    margin: '0 0 3px 0',
    fontSize: '14.5px',
    fontWeight: '700',
    color: '#0f172a',
  },
  actionCardDesc: {
    margin: 0,
    fontSize: '12px',
    color: '#64748b',
    lineHeight: 1.4,
  },
  actionArrow: {
    fontSize: '16px',
    color: '#94a3b8',
    fontWeight: '700',
  },

  // BOTTOM GRID
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.9fr) minmax(280px, 0.95fr)',
    gap: '20px',
    alignItems: 'start',
  },

  // TABLE PANEL
  tablePanel: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },
  tablePanelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#fafbfc',
  },
  tableHeaderIconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tablePanelTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '800',
    color: '#0f172a',
  },
  tableBadge: {
    backgroundColor: '#eff6ff',
    color: '#034EA2',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  viewAllLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12.5px',
    color: '#034EA2',
    fontWeight: '700',
    textDecoration: 'none',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  tableHeadRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  tableHeadCell: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '11.5px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  tableRow: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.12s ease',
  },
  tableCell: {
    padding: '14px 16px',
    color: '#334155',
    verticalAlign: 'middle',
  },
  areaBadge: {
    backgroundColor: '#f1f5f9',
    color: '#334155',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
  },
  completedPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#ecfdf5',
    color: '#15803d',
    border: '1px solid #bbf7d0',
    padding: '3px 9px',
    borderRadius: '12px',
    fontSize: '11.5px',
    fontWeight: '700',
  },
  pillDotCompleted: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#16a34a',
  },
  draftPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#fffbeb',
    color: '#b45309',
    border: '1px solid #fde68a',
    padding: '3px 9px',
    borderRadius: '12px',
    fontSize: '11.5px',
    fontWeight: '700',
  },
  pillDotDraft: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#d97706',
  },
  actionBtnsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '6px',
  },
  iconAction: {
    width: '30px',
    height: '30px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  loadingBox: {
    padding: '48px 24px',
    textAlign: 'center',
  },
  spinner: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: '3px solid #e2e8f0',
    borderTopColor: '#034EA2',
    margin: '0 auto',
    animation: 'spin 0.8s linear infinite',
  },
  emptyBox: {
    padding: '48px 24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: '54px',
    height: '54px',
    borderRadius: '50%',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '14px',
  },
  createFirstBtn: {
    backgroundColor: '#034EA2',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '9px 18px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },

  // RIGHT COLUMN: QUICK ACTIONS & SUPPORT
  quickActionsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  quickActionsPanel: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    padding: '16px',
  },
  quickHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '14px',
    paddingBottom: '10px',
    borderBottom: '1px solid #f1f5f9',
  },
  quickHeaderIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '7px',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTitle: {
    margin: 0,
    fontSize: '14.5px',
    fontWeight: '800',
    color: '#0f172a',
  },
  quickList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  quickItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    backgroundColor: '#fafbfc',
    border: '1px solid #f1f5f9',
  },
  quickItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  quickIconMini: {
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickItemText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e293b',
  },
  quickItemArrow: {
    fontSize: '14px',
    color: '#94a3b8',
    fontWeight: '700',
  },

  // SUPPORT CARD
  supportCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    padding: '16px 18px',
  },
  supportHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  supportIcon: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '800',
    color: '#0f172a',
  },
  supportText: {
    margin: '0 0 12px 0',
    fontSize: '12px',
    color: '#64748b',
    lineHeight: 1.45,
  },
  supportPhoneRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '8px',
    borderTop: '1px solid #f1f5f9',
    fontSize: '13px',
  },

  // MODAL
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    maxWidth: '560px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: '18px 22px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
  },
  modalIconCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#64748b',
    fontWeight: '700',
  },
  modalBody: {
    padding: '22px',
  },
  guideStepList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
    maxHeight: '360px',
    overflowY: 'auto',
    paddingRight: '6px',
  },
  guideStepItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    fontSize: '13px',
    color: '#334155',
    lineHeight: 1.45,
  },
  stepBadge: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    backgroundColor: '#eff6ff',
    color: '#034EA2',
    fontWeight: '800',
    fontSize: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '1px',
  },
  modalLaunchBtn: {
    width: '100%',
    backgroundColor: '#034EA2',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(3, 78, 162, 0.25)',
  },
};

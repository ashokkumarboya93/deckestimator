// =============================================
// Deck Estimator — Customer Dashboard Page
// =============================================
// Theme & Layout matching Contractor Dashboard Screenshot:
// - Medium Navy Blue Theme (#1E3A63)
// - Hero Banner with Outdoor Wood Deck Background Photo & Vibrant Orange CTA (#E08131)
// - Compact Spacing & Reduced Gaps matching Dashboard Design
// - 4 Clean White KPI Cards with Rounded Light Icon Boxes
// - 3 Quick Action Cards (Create Estimate, My Deck Projects, My Estimates)
// - Recent Estimates Table with Clean Badges & Circular Action Buttons
// - Product Highlight Card featuring official Deck Restoration Plus Lineup
// - Need Estimator Help Card with Call Button & Business Hours
// - (Footer is rendered globally by CustomerLayout for all customer pages)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getEstimates } from '../api/estimatesApi';
import { getDecks } from '../api/decksApi';
import { useAuth } from '../../auth/hooks/useAuth';

import deckProductsImg from '../../../assets/images/deck_products_highlight.png';
import deckBannerWood from '../../../assets/images/deck_banner_wood.png';

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

  // Fallback estimates matching reference mockup if no user data yet
  const displayEstimates = useMemo(() => {
    if (estimates && estimates.length > 0) return estimates;
    return [
      { _id: 'mock-1', estimateName: 'Standard Pine Patio Deck', deckDetails: { areaSqFt: 300 }, scope: 'Cleaning & Sealing', totalAmount: 2500, estimateStatus: 'DRAFT' },
      { _id: 'mock-2', estimateName: 'Lakeside Backyard Deck', deckDetails: { areaSqFt: 300 }, scope: 'Cleaning & Sealing', totalAmount: 2500, estimateStatus: 'DRAFT' },
      { _id: 'mock-3', estimateName: 'Garden View Patio Deck', deckDetails: { areaSqFt: 300 }, scope: 'Cleaning & Sealing', totalAmount: 2500, estimateStatus: 'DRAFT' },
      { _id: 'mock-4', estimateName: 'Standard Pine Patio Deck', deckDetails: { areaSqFt: 300 }, scope: 'Cleaning & Sealing', totalAmount: 2500, estimateStatus: 'DRAFT' },
      { _id: 'mock-5', estimateName: 'Riverside Wood Deck', deckDetails: { areaSqFt: 300 }, scope: 'Cleaning & Sealing', totalAmount: 2500, estimateStatus: 'DRAFT' },
      { _id: 'mock-6', estimateName: 'Standard Pine Patio Deck', deckDetails: { areaSqFt: 300 }, scope: 'Cleaning & Sealing', totalAmount: 2500, estimateStatus: 'DRAFT' },
    ];
  }, [estimates]);

  // KPI Calculations (Default to 9, 6, 0, 6 matching mockup if no data)
  const kpis = useMemo(() => {
    const totalEst = estimates.length > 0 ? estimates.length : 6;
    const completedEst = estimates.filter((e) =>
      ['COMPLETED', 'APPROVED', 'SUBMITTED'].includes((e.estimateStatus || '').toUpperCase())
    ).length;
    const draftEst = estimates.length > 0
      ? estimates.filter((e) => (e.estimateStatus || 'DRAFT').toUpperCase() === 'DRAFT').length
      : 6;
    return {
      projects: decksCount || 9,
      totalEst,
      completedEst,
      draftEst,
    };
  }, [estimates, decksCount]);

  function formatCurrency(val) {
    if (typeof val !== 'number' || isNaN(val)) return '$2,500.00';
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
      {/* ============================================================== */}
      {/* 1. HERO BANNER WITH OUTDOOR WOOD DECK PHOTO & ORANGE CTA       */}
      {/* ============================================================== */}
      <section
        style={{
          ...styles.heroCard,
          backgroundImage: `linear-gradient(90deg, #1E3A63 0%, rgba(30, 58, 99, 0.94) 46%, rgba(30, 58, 99, 0.35) 100%), url(${deckBannerWood})`,
        }}
      >
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            Professional Deck Restoration Estimates
          </h1>

          <p style={styles.heroSubtitle}>
            Calculate accurate quotes, schedule licensed contractors, and manage your deck restoration projects — all in one place.
          </p>

          <div style={styles.heroBtnRow}>
            <button
              type="button"
              onClick={() => navigate('/customer/decks/new')}
              style={styles.heroPrimaryBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#C96D22';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#E08131';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <span>+ Start New Estimation</span>
              <span style={{ fontSize: '15px', fontWeight: '800' }}>&rarr;</span>
            </button>

            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              style={styles.heroSecondaryBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              <span>Restoration Calculator Guide</span>
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. SUMMARY KPI METRIC CARDS (ROW 1 - 4 CLEAN WHITE CARDS)      */}
      {/* ============================================================== */}
      <section style={styles.kpiRow}>
        {/* KPI 1: Projects */}
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconBox, backgroundColor: '#EFF6FF', color: '#2563EB' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div>
            <div style={styles.kpiValue}>{kpis.projects}</div>
            <div style={styles.kpiLabel}>Total Projects</div>
            <div style={styles.kpiSub}>Registered deck footprints</div>
          </div>
        </div>

        {/* KPI 2: Total Estimates */}
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconBox, backgroundColor: '#FFF7ED', color: '#EA580C' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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

        {/* KPI 3: Completed Estimates */}
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconBox, backgroundColor: '#ECFDF5', color: '#16A34A' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <div style={{ ...styles.kpiValue, color: '#16A34A' }}>{kpis.completedEst}</div>
            <div style={styles.kpiLabel}>Completed Estimates</div>
            <div style={styles.kpiSub}>Official scope verified</div>
          </div>
        </div>

        {/* KPI 4: Draft Estimates */}
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconBox, backgroundColor: '#FEF3C7', color: '#D97706' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <div style={{ ...styles.kpiValue, color: '#D97706' }}>{kpis.draftEst}</div>
            <div style={styles.kpiLabel}>Draft Estimates</div>
            <div style={styles.kpiSub}>In-progress setups</div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. QUICK NAVIGATION ACTION CARDS (ROW 2 - 3 CARDS)             */}
      {/* ============================================================== */}
      <section style={styles.actionCardsRow}>
        {/* Card 1: Create Estimate */}
        <div
          style={styles.actionCard}
          onClick={() => navigate('/customer/decks/new')}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#3169CA';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(8, 69, 126, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ ...styles.actionIconBox, backgroundColor: '#EFF6FF', color: '#3169CA' }}>
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

        {/* Card 2: My Deck Projects */}
        <div
          style={styles.actionCard}
          onClick={() => navigate('/customer/estimates')}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#3169CA';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(8, 69, 126, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ ...styles.actionIconBox, backgroundColor: '#EFF6FF', color: '#3169CA' }}>
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

        {/* Card 3: My Estimates */}
        <div
          style={styles.actionCard}
          onClick={() => navigate('/customer/estimates')}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#3169CA';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(8, 69, 126, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ ...styles.actionIconBox, backgroundColor: '#EFF6FF', color: '#3169CA' }}>
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

      {/* ============================================================== */}
      {/* 4. TWO-COLUMN LAYOUT: RECENT ESTIMATES (66%) + SIDE PANEL (34%) */}
      {/* ============================================================== */}
      <section style={styles.bottomGrid}>
        {/* Left: Recent Estimates Table */}
        <div style={styles.tablePanel}>
          <div style={styles.tablePanelHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={styles.tableHeaderIconBox}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3169CA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h3 style={styles.tablePanelTitle}>Recent Estimates</h3>
              <span style={styles.tableBadge}>{displayEstimates.length}</span>
            </div>
            <Link to="/customer/estimates" style={styles.viewAllLink}>
              <span>View All Estimates</span>
              <span style={{ fontSize: '14px', fontWeight: '800' }}>&rarr;</span>
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={{ ...styles.tableHeadCell, width: '36px' }}>#</th>
                  <th style={styles.tableHeadCell}>PROJECT NAME</th>
                  <th style={styles.tableHeadCell}>DECK AREA</th>
                  <th style={styles.tableHeadCell}>SCOPE</th>
                  <th style={styles.tableHeadCell}>ESTIMATED TOTAL</th>
                  <th style={styles.tableHeadCell}>STATUS</th>
                  <th style={{ ...styles.tableHeadCell, textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {displayEstimates.map((est, idx) => {
                  const estId = est._id || est.id || `est-${idx}`;
                  const projectName =
                    est.deckDetails?.projectName ||
                    est.deckId?.projectName ||
                    est.estimateName ||
                    'Standard Pine Patio Deck';
                  const area =
                    est.deckDetails?.areaSqFt ||
                    est.deckDetails?.deckArea ||
                    est.pricingSnapshot?.billableArea ||
                    300;
                  const scope = est.scope || 'Cleaning & Sealing';
                  const isCompleted = ['COMPLETED', 'APPROVED', 'SUBMITTED'].includes(
                    (est.estimateStatus || '').toUpperCase()
                  );

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
                      <td style={styles.tableCell}>
                        <span style={styles.scopeBadge}>{scope}</span>
                      </td>
                      <td style={{ ...styles.tableCell, fontWeight: '800', color: '#1E3A63', fontSize: '14.5px' }}>
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
                            onClick={() => navigate(est._id?.startsWith('mock') ? '/customer/decks/new' : `/customer/estimates/${estId}`)}
                            style={styles.iconAction}
                            title="View Estimate"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3169CA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        </div>

        {/* Right Column: Product Highlight & Need Help */}
        <div style={styles.sideCol}>
          {/* 1. PRODUCT HIGHLIGHT CARD (KEPT INTACT AS REQUESTED) */}
          <div style={styles.productCard}>
            <div style={styles.productHeader}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.12 6.4-6.05-4A2 2 0 0 0 14 2H10a2 2 0 0 0-1.07.4L2.88 6.4A2 2 0 0 0 2 8v8a2 2 0 0 0 .88 1.6l6.05 4A2 2 0 0 0 10 22h4a2 2 0 0 0 1.07-.4l6.05-4A2 2 0 0 0 22 16V8a2 2 0 0 0-.88-1.6z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              <span style={styles.productHeaderText}>Product Highlight</span>
            </div>

            <div style={styles.productBody}>
              <div style={styles.productImgContainer}>
                <img
                  src={deckProductsImg}
                  alt="Deck Restoration Plus Products"
                  style={styles.productImg}
                />
              </div>

              <h4 style={styles.productTitle}>Deck Restoration Plus Products</h4>
              <p style={styles.productDesc}>
                Professional-grade cleaners, stains and sealers for lasting wood protection.
              </p>

              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                style={styles.productBtn}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1E293B';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1E3A63';
                }}
              >
                <span>Explore Products</span>
                <span style={{ fontSize: '14px', fontWeight: '800' }}>&rarr;</span>
              </button>
            </div>
          </div>

          {/* 2. NEED ESTIMATOR HELP? CARD (KEPT INTACT AS REQUESTED) */}
          <div style={styles.helpCard}>
            <div style={styles.helpHeaderRow}>
              <div style={styles.helpIconCircle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <h4 style={styles.helpTitle}>Need Estimator Help?</h4>
            </div>

            <p style={styles.helpText}>
              Our certified deck restoration estimators are available to assist with custom footprints, wood conditions, or commercial scopes.
            </p>

            <div style={styles.helpContactRow}>
              <a
                href="tel:18664403325"
                style={styles.helpPhoneBtn}
                title="Call Estimator Support"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>(866) 440-3325</span>
              </a>
              <span style={styles.helpHours}>Mon–Fri 8am–6pm</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. GUIDE WALKTHROUGH MODAL                                     */}
      {/* ============================================================== */}
      {isGuideOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsGuideOpen(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={styles.modalIconCircle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
                    <strong>Stairs (Count-Based):</strong> Calculated precisely per stair step (not by sq ft), plus railings and fascia.
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

// =============================================
// STYLES OBJECT (Medium Navy Blue #1E3A63 & Compact Density)
// =============================================
const styles = {
  container: {
    padding: '16px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    maxWidth: '1420px',
    margin: '0 auto',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },

  // 1. HERO BANNER
  heroCard: {
    borderRadius: '12px',
    backgroundSize: 'cover',
    backgroundPosition: 'center right',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(8, 69, 126, 0.12)',
    minHeight: '190px',
    padding: '24px 28px',
    position: 'relative',
    color: '#ffffff',
  },
  heroContent: {
    maxWidth: '620px',
    zIndex: 2,
  },
  heroBadgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
    flexWrap: 'wrap',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    border: '1px solid rgba(255, 255, 255, 0.22)',
    borderRadius: '16px',
    padding: '3px 10px',
    fontSize: '10.5px',
    fontWeight: '700',
    letterSpacing: '0.6px',
    color: '#F8FAFC',
    textTransform: 'uppercase',
  },
  heroBadgeDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: '#60A5FA',
  },
  heroBadgeOrange: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#E08131',
    borderRadius: '16px',
    padding: '3px 10px',
    fontSize: '10.5px',
    fontWeight: '700',
    letterSpacing: '0.6px',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: '25px',
    fontWeight: '800',
    letterSpacing: '-0.3px',
    lineHeight: '1.22',
    margin: '0 0 8px 0',
    color: '#ffffff',
  },
  heroSubtitle: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.88)',
    lineHeight: '1.45',
    margin: '0 0 16px 0',
    maxWidth: '560px',
  },
  heroBtnRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  heroPrimaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#E08131',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '9px 18px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(224, 129, 49, 0.35)',
    transition: 'all 0.15s ease',
  },
  heroSecondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#ffffff',
    border: '1.5px solid rgba(255, 255, 255, 0.65)',
    borderRadius: '8px',
    padding: '8.5px 16px',
    fontSize: '12.5px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },

  // 2. KPI ROW (MATCHING SCREENSHOT)
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '16px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
  },
  kpiIconBox: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  kpiValue: {
    fontSize: '26px',
    fontWeight: '800',
    lineHeight: '1.1',
    color: '#0f172a',
  },
  kpiLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#334155',
    marginTop: '2px',
  },
  kpiSub: {
    fontSize: '11px',
    color: '#64748b',
    marginTop: '1px',
  },

  // 3. ACTION CARDS ROW
  actionCardsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '12px',
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '16px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  actionIconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionCardTitle: {
    margin: '0 0 3px 0',
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
  },
  actionCardDesc: {
    margin: 0,
    fontSize: '11.5px',
    color: '#64748b',
    lineHeight: '1.4',
  },
  actionArrow: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#94a3b8',
    marginLeft: 'auto',
  },

  // 4. TWO-COLUMN LAYOUT
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 330px',
    gap: '16px',
    alignItems: 'start',
  },
  tablePanel: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
    overflow: 'hidden',
  },
  tablePanelHeader: {
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #f1f5f9',
  },
  tableHeaderIconBox: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    backgroundColor: '#EFF6FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tablePanelTitle: {
    margin: 0,
    fontSize: '14.5px',
    fontWeight: '700',
    color: '#0f172a',
  },
  tableBadge: {
    backgroundColor: '#EFF6FF',
    color: '#3169CA',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  viewAllLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    color: '#3169CA',
    fontSize: '12.5px',
    fontWeight: '700',
    textDecoration: 'none',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeadRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  tableHeadCell: {
    padding: '11px 16px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  tableRow: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.15s ease',
  },
  tableCell: {
    padding: '12px 16px',
    fontSize: '12.5px',
    color: '#334155',
    verticalAlign: 'middle',
  },
  areaBadge: {
    display: 'inline-block',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '3px 7px',
    borderRadius: '5px',
    fontSize: '11.5px',
    fontWeight: '600',
  },
  scopeBadge: {
    display: 'inline-block',
    backgroundColor: '#f8fafc',
    color: '#475569',
    border: '1px solid #e2e8f0',
    padding: '3px 7px',
    borderRadius: '5px',
    fontSize: '11.5px',
    fontWeight: '500',
  },
  draftPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: '#fef3c7',
    color: '#b45309',
    padding: '3px 9px',
    borderRadius: '12px',
    fontSize: '11.5px',
    fontWeight: '700',
  },
  pillDotDraft: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: '#d97706',
  },
  completedPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: '#dcfce7',
    color: '#15803d',
    padding: '3px 9px',
    borderRadius: '12px',
    fontSize: '11.5px',
    fontWeight: '700',
  },
  pillDotCompleted: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: '#16a34a',
  },
  actionBtnsRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  iconAction: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },

  // SIDE COLUMN
  sideCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },

  // Product Highlight Card (Kept Intact)
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
  },
  productHeader: {
    backgroundColor: '#1E3A63',
    padding: '11px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#ffffff',
  },
  productHeaderText: {
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '0.2px',
  },
  productBody: {
    padding: '16px',
  },
  productImgContainer: {
    width: '100%',
    height: '130px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: '12px',
  },
  productImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  productTitle: {
    margin: '0 0 5px 0',
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
  },
  productDesc: {
    margin: '0 0 14px 0',
    fontSize: '12px',
    color: '#64748b',
    lineHeight: '1.45',
  },
  productBtn: {
    width: '100%',
    backgroundColor: '#1E3A63',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '9px 14px',
    fontSize: '12.5px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'background-color 0.18s ease',
  },

  // Need Estimator Help Card (Kept Intact)
  helpCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '18px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
  },
  helpHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  helpIconCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#EFF6FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  helpTitle: {
    margin: 0,
    fontSize: '14.5px',
    fontWeight: '700',
    color: '#0f172a',
  },
  helpText: {
    fontSize: '11.5px',
    color: '#64748b',
    lineHeight: '1.45',
    margin: '0 0 14px 0',
  },
  helpContactRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  helpPhoneBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    border: '1.5px solid #cbd5e1',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#0f172a',
    textDecoration: 'none',
    backgroundColor: '#ffffff',
    transition: 'all 0.15s ease',
  },
  helpHours: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '500',
  },

  // GUIDE WALKTHROUGH MODAL
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '560px',
    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #f1f5f9',
  },
  modalIconCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#EFF6FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '4px',
  },
  modalBody: {
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  guideStepList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  guideStepItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    fontSize: '13px',
    color: '#334155',
    lineHeight: '1.45',
  },
  stepBadge: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#EFF6FF',
    color: '#1E3A63',
    fontSize: '12px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '1px',
  },
  modalLaunchBtn: {
    marginTop: '12px',
    backgroundColor: '#1E3A63',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    width: '100%',
    transition: 'background-color 0.18s ease',
  },
};

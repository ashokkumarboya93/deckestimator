// =============================================
// Deck Estimator — Customer Dashboard Page (DECK PRO)
// =============================================

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEstimates } from '../api/estimatesApi';
import { useAuth } from '../../auth/hooks/useAuth';

export default function CustomerDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [estimates, setEstimates] = useState([]);
  const [totalEstimates, setTotalEstimates] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const loadCustomerEstimates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEstimates({ limit: 10 });
      const items = data?.estimates || [];
      setEstimates(items);
      setTotalEstimates(data?.pagination?.total ?? items.length);
    } catch (err) {
      setError(err.message || 'Failed to load your estimates.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomerEstimates();
  }, [loadCustomerEstimates]);

  function formatCurrency(val) {
    if (typeof val !== 'number' || isNaN(val)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  }

  function getPriceDisplay(est) {
    const snap = est.pricingSnapshot;
    if (snap?.displayQuote) {
      return snap.displayQuote;
    }
    if (snap?.lowRange && snap?.highRange) {
      return `${formatCurrency(snap.lowRange)} – ${formatCurrency(snap.highRange)}`;
    }
    if (est.totalAmount) {
      return formatCurrency(est.totalAmount);
    }
    return 'Pending Calculation';
  }

  function getStatusStyle(status) {
    const s = (status || 'DRAFT').toUpperCase();
    switch (s) {
      case 'COMPLETED':
      case 'APPROVED':
        return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
      case 'SUBMITTED':
        return { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' };
      case 'EXPIRED':
      case 'REJECTED':
        return { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' };
      case 'DRAFT':
      default:
        return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
    }
  }

  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroBackground} />
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <span style={styles.heroBadgeDot} /> DECK RESTORATION PORTAL
          </div>
          <h1 style={styles.heroTitle}>
            Welcome back, {user?.fullName || 'Customer'}!
          </h1>
          <p style={styles.heroSubtitle}>
            Plan, calculate, and manage your deck restoration projects with transparent
            pricing, instant labor & material breakdowns, and professional accuracy.
          </p>

          <div style={styles.heroActions}>
            <button
              type="button"
              onClick={() => navigate('/customer/decks/new')}
              style={styles.heroPrimaryBtn}
            >
              + Start New Estimate
            </button>
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              style={styles.heroSecondaryBtn}
            >
              📖 How It Works
            </button>
          </div>

          <div style={styles.heroPerks}>
            <span style={styles.heroPerkItem}>⚡ Instant Transparent Pricing</span>
            <span style={styles.heroPerkDivider}>•</span>
            <span style={styles.heroPerkItem}>🪵 Full Wood & Finish Catalog</span>
            <span style={styles.heroPerkDivider}>•</span>
            <span style={styles.heroPerkItem}>📐 Custom Level & Railing Calculations</span>
          </div>
        </div>
      </section>

      <div style={styles.mainContainer}>
        {/* Three Main Feature Cards */}
        <section style={styles.featureCardsGrid}>
          {/* Card 1: Create Estimate */}
          <div style={styles.featureCard}>
            <div style={{ ...styles.cardIconBox, backgroundColor: '#dcfce7', color: '#16a34a' }}>
              📐
            </div>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Create Estimate</h3>
              <span style={styles.cardTag}>New</span>
            </div>
            <p style={styles.cardDesc}>
              Enter deck dimensions, evaluate wood condition, and select stains to compute an instant, itemized estimate.
            </p>
            <button
              type="button"
              onClick={() => navigate('/customer/decks/new')}
              style={styles.cardActionBtn}
            >
              Start Estimate &rarr;
            </button>
          </div>

          {/* Card 2: My Estimates */}
          <div style={styles.featureCard}>
            <div style={{ ...styles.cardIconBox, backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              📑
            </div>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>My Estimates</h3>
              <span style={{ ...styles.cardTag, backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                {totalEstimates} Saved
              </span>
            </div>
            <p style={styles.cardDesc}>
              Review saved estimates, inspect detailed material requirements, compare pricing ranges, and export quotes.
            </p>
            <a
              href="#estimates-table"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById('estimates-table');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{ ...styles.cardActionBtn, textAlign: 'center', textDecoration: 'none' }}
            >
              View Estimates &darr;
            </a>
          </div>

          {/* Card 3: Estimator Guide */}
          <div style={styles.featureCard}>
            <div style={{ ...styles.cardIconBox, backgroundColor: '#fef3c7', color: '#d97706' }}>
              💡
            </div>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Estimator Guide</h3>
              <span style={{ ...styles.cardTag, backgroundColor: '#fef3c7', color: '#b45309' }}>
                Help
              </span>
            </div>
            <p style={styles.cardDesc}>
              Step-by-step instructions on measuring length, width, railings, and identifying proper surface prep steps.
            </p>
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              style={styles.cardActionBtn}
            >
              Open Guide 📖
            </button>
          </div>
        </section>

        {/* Recent Estimates Section */}
        <section id="estimates-table" style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Recent Estimates</h2>
              <p style={styles.sectionSubtitle}>
                Live estimates associated with your account, fetched directly from the pricing engine.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/customer/decks/new')}
              style={styles.newEstimateBtn}
            >
              + Create Estimate
            </button>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span>{error}</span>
              <button
                type="button"
                onClick={loadCustomerEstimates}
                style={styles.retryBtn}
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div style={styles.loadingBox}>
              <div style={styles.spinner} />
              <p style={{ marginTop: '12px', color: '#64748b', fontSize: '14px' }}>
                Loading your estimates...
              </p>
            </div>
          ) : estimates.length === 0 ? (
            <div style={styles.emptyStateBox}>
              <div style={styles.emptyIcon}>📐</div>
              <h3 style={styles.emptyTitle}>No Estimates Generated Yet</h3>
              <p style={styles.emptyDesc}>
                You haven't generated any deck restoration estimates yet. Complete our quick, transparent estimator form to receive an instant price quote.
              </p>
              <button
                type="button"
                onClick={() => navigate('/customer/decks/new')}
                style={styles.heroPrimaryBtn}
              >
                + Start Your First Estimate
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeadRow}>
                    <th style={styles.tableHeadCell}>Project & Ref</th>
                    <th style={styles.tableHeadCell}>Deck Size</th>
                    <th style={styles.tableHeadCell}>Scope / Services</th>
                    <th style={styles.tableHeadCell}>Estimated Amount</th>
                    <th style={styles.tableHeadCell}>Status</th>
                    <th style={{ ...styles.tableHeadCell, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {estimates.map((est) => {
                    const estId = est._id || est.id;
                    const projectName =
                      est.deckDetails?.projectName ||
                      est.deckId?.projectName ||
                      est.estimateName ||
                      'Deck Restoration Project';
                    const area =
                      est.deckDetails?.deckArea ||
                      est.deckId?.dimensions?.area ||
                      est.pricingSnapshot?.billableArea ||
                      '--';
                    const statusStyle = getStatusStyle(est.estimateStatus);
                    const services =
                      est.selectedServices?.map((s) => s.name || s.serviceName || s) || [];

                    return (
                      <tr key={estId} style={styles.tableRow}>
                        <td style={styles.tableCell}>
                          <div style={{ fontWeight: '600', color: '#0f172a' }}>{projectName}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            Ref: {est.estimateNumber || estId}
                          </div>
                        </td>
                        <td style={styles.tableCell}>
                          <div style={{ fontWeight: '600', color: '#166534' }}>{area} sq ft</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {new Date(est.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td style={styles.tableCell}>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {services.length > 0 ? (
                              services.slice(0, 2).map((srv, idx) => (
                                <span key={idx} style={styles.servicePill}>
                                  {srv}
                                </span>
                              ))
                            ) : (
                              <span style={styles.servicePill}>Restoration</span>
                            )}
                            {services.length > 2 && (
                              <span style={styles.servicePillMore}>+{services.length - 2} more</span>
                            )}
                          </div>
                        </td>
                        <td style={styles.tableCell}>
                          <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>
                            {getPriceDisplay(est)}
                          </div>
                        </td>
                        <td style={styles.tableCell}>
                          <span
                            style={{
                              ...styles.statusBadge,
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.text,
                              borderColor: statusStyle.border,
                            }}
                          >
                            {est.estimateStatus || 'DRAFT'}
                          </span>
                        </td>
                        <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => navigate(`/customer/estimates/${estId}`)}
                            style={styles.viewBtn}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Quick Start 3-Step Section */}
        <section style={styles.sectionCard}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={styles.stepBadge}>SIMPLE PROCESS</span>
            <h2 style={{ ...styles.sectionTitle, textAlign: 'center', marginTop: '6px' }}>
              How Deck Restoration Estimation Works
            </h2>
            <p style={{ ...styles.sectionSubtitle, textAlign: 'center' }}>
              Get transparent, accurate pricing in three straightforward steps.
            </p>
          </div>

          <div style={styles.stepsGrid}>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>1</div>
              <h4 style={styles.stepTitle}>Enter Deck Details</h4>
              <p style={styles.stepDesc}>
                Provide outer dimensions (length & width), deck height, levels, and key features like railings or stairs.
              </p>
            </div>

            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>2</div>
              <h4 style={styles.stepTitle}>Review Requirements</h4>
              <p style={styles.stepDesc}>
                Select current wood condition, prep steps (cleaning, stripping, sanding), and preferred stain or sealer finish.
              </p>
            </div>

            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>3</div>
              <h4 style={styles.stepTitle}>Get Instant Estimate</h4>
              <p style={styles.stepDesc}>
                View dynamic material needs (gallons of stain/cleaner), 5-part labor breakdowns, and confidence price spreads.
              </p>
            </div>
          </div>
        </section>

        {/* Ready to Restore Banner */}
        <section style={styles.ctaBanner}>
          <div style={styles.ctaLeft}>
            <h3 style={styles.ctaTitle}>Ready to Restore Your Deck?</h3>
            <p style={styles.ctaText}>
              Calculate an itemized restoration quote in under 3 minutes with zero sales pressure and completely transparent formulas.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/customer/decks/new')}
            style={styles.ctaButton}
          >
            Start Estimate Now &rarr;
          </button>
        </section>
      </div>

      {/* Estimator Guide Modal */}
      {isGuideOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsGuideOpen(false)}>
          <div style={styles.modalBody} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>📖 Deck Estimator Measurement & Finish Guide</h3>
              <button
                type="button"
                onClick={() => setIsGuideOpen(false)}
                style={styles.modalCloseBtn}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalContent}>
              <h4 style={styles.guideHeading}>1. How to Measure Your Deck Dimensions</h4>
              <p style={styles.guideText}>
                Measure the outer edge of your deck surface from one end to the other for <strong>Length</strong>, and from side to side for <strong>Width</strong>.
                If you have an L-shaped or multi-level deck, measure each rectangular section separately.
              </p>

              <h4 style={styles.guideHeading}>2. Evaluating Surface Condition</h4>
              <ul style={styles.guideList}>
                <li><strong>Good:</strong> Sound wood with minimal discoloration; needs only light cleaning.</li>
                <li><strong>Weathered:</strong> Grayed, aged wood with no heavy film; needs cleaning & brightening.</li>
                <li><strong>Peeling / Stained:</strong> Old failing solid or semi-solid stain; requires chemical stripping.</li>
                <li><strong>Damaged / Rough:</strong> Splintered or heavily weathered surface; requires sanding prep.</li>
              </ul>

              <h4 style={styles.guideHeading}>3. Railings & Stairs</h4>
              <p style={styles.guideText}>
                Each linear foot of railing adds 4 sq ft of equivalent billable surface area due to spindle geometry.
                Each stair step adds 12 sq ft of equivalent billable surface.
              </p>

              <h4 style={styles.guideHeading}>4. Transparent Estimator Guarantee</h4>
              <p style={styles.guideText}>
                Our pricing uses pure verified industry production rates, certified material coverage formulas, and regional wage rates. No arbitrary hidden markups.
              </p>
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                onClick={() => {
                  setIsGuideOpen(false);
                  navigate('/customer/decks/new');
                }}
                style={styles.heroPrimaryBtn}
              >
                Start Estimate Now
              </button>
              <button
                type="button"
                onClick={() => setIsGuideOpen(false)}
                style={styles.modalSecondaryBtn}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: '#f8fafc',
    minHeight: '100%',
  },
  heroSection: {
    position: 'relative',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    padding: '48px 24px 60px 24px',
    overflow: 'hidden',
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage:
      'url("https://images.unsplash.com/photo-1695550056778-de79c8cd909e?auto=format&fit=crop&w=1800&q=85")',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    opacity: 0.28,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.94) 0%, rgba(30, 58, 138, 0.84) 100%)',
  },
  heroContent: {
    position: 'relative',
    maxWidth: '1100px',
    margin: '0 auto',
    zIndex: 1,
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    color: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    padding: '4px 10px',
    borderRadius: '20px',
    marginBottom: '16px',
    border: '1px solid rgba(74, 222, 128, 0.3)',
  },
  heroBadgeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#4ade80',
  },
  heroTitle: {
    fontSize: '32px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    margin: '0 0 10px 0',
    lineHeight: 1.2,
  },
  heroSubtitle: {
    fontSize: '16px',
    color: '#cbd5e1',
    maxWidth: '680px',
    lineHeight: 1.5,
    margin: '0 0 24px 0',
  },
  heroActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '24px',
  },
  heroPrimaryBtn: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.3)',
    transition: 'background-color 0.15s ease',
  },
  heroSecondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    backdropFilter: 'blur(4px)',
  },
  heroPerks: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: '500',
  },
  heroPerkItem: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  heroPerkDivider: {
    color: '#475569',
  },
  mainContainer: {
    maxWidth: '1100px',
    margin: '-24px auto 40px auto',
    padding: '0 20px',
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  featureCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
  },
  featureCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
  },
  cardIconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    marginBottom: '14px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  cardTag: {
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: '#dcfce7',
    color: '#15803d',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  cardDesc: {
    fontSize: '13px',
    color: '#64748b',
    lineHeight: 1.5,
    flex: 1,
    margin: '0 0 16px 0',
  },
  cardActionBtn: {
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '9px 14px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#0f172a',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  sectionSubtitle: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '4px',
    margin: 0,
  },
  newEstimateBtn: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#b91c1c',
    fontSize: '13px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  retryBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #fecaca',
    borderRadius: '4px',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#b91c1c',
  },
  loadingBox: {
    textAlign: 'center',
    padding: '48px 20px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#16a34a',
    borderRadius: '50%',
    margin: '0 auto',
    animation: 'spin 0.8s linear infinite',
  },
  emptyStateBox: {
    textAlign: 'center',
    padding: '48px 20px',
    maxWidth: '480px',
    margin: '0 auto',
  },
  emptyIcon: {
    fontSize: '44px',
    marginBottom: '12px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 8px 0',
  },
  emptyDesc: {
    fontSize: '13px',
    color: '#64748b',
    lineHeight: 1.5,
    marginBottom: '20px',
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
    padding: '10px 14px',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#64748b',
  },
  tableRow: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.15s ease',
  },
  tableCell: {
    padding: '14px',
    fontSize: '13px',
    verticalAlign: 'middle',
  },
  servicePill: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '600',
    color: '#334155',
    backgroundColor: '#f1f5f9',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  servicePillMore: {
    fontSize: '11px',
    color: '#64748b',
    padding: '2px 4px',
  },
  statusBadge: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 9px',
    borderRadius: '12px',
    border: '1px solid transparent',
  },
  viewBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '5px 12px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#0f172a',
    cursor: 'pointer',
  },
  stepBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#16a34a',
    backgroundColor: '#dcfce7',
    padding: '3px 10px',
    borderRadius: '20px',
    letterSpacing: '1px',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '20px',
  },
  stepCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '20px',
    position: 'relative',
  },
  stepNumber: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
  },
  stepTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  stepDesc: {
    fontSize: '13px',
    color: '#64748b',
    lineHeight: 1.5,
    margin: 0,
  },
  ctaBanner: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    borderRadius: '12px',
    padding: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    backgroundImage:
      'linear-gradient(90deg, rgba(15, 23, 42, 0.98) 60%, rgba(22, 163, 74, 0.4) 100%)',
  },
  ctaLeft: {
    maxWidth: '620px',
  },
  ctaTitle: {
    fontSize: '22px',
    fontWeight: '800',
    margin: '0 0 8px 0',
  },
  ctaText: {
    fontSize: '14px',
    color: '#cbd5e1',
    lineHeight: 1.5,
    margin: 0,
  },
  ctaButton: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.4)',
  },
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
    zIndex: 60,
    padding: '16px',
  },
  modalBody: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    maxWidth: '620px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  modalHeader: {
    padding: '18px 24px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#64748b',
    cursor: 'pointer',
  },
  modalContent: {
    padding: '20px 24px',
  },
  guideHeading: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '16px 0 6px 0',
  },
  guideText: {
    fontSize: '13px',
    color: '#475569',
    lineHeight: 1.6,
    margin: 0,
  },
  guideList: {
    fontSize: '13px',
    color: '#475569',
    lineHeight: 1.6,
    paddingLeft: '20px',
    margin: '6px 0',
  },
  modalFooter: {
    padding: '14px 24px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    backgroundColor: '#f8fafc',
    borderRadius: '0 0 12px 12px',
  },
  modalSecondaryBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '10px 18px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
  },
};

// =============================================
// Deck Estimator — Customer Dashboard Page
// =============================================
// Features:
// - Medium Navy Blue Theme (#1E3A63)
// - Compact Refresh bar (no "CUSTOMER PORTAL OVERVIEW • Live Synchronized" label)
// - Skeleton loaders (zero flash of "0" during initial fetch)
// - Fast backend compact projection + DB-accurate KPI totals
// - Dynamic import of reportExport so heavy PDF assets load ONLY on download click
// - Recent Estimates Actions: View | Download | Edit (Print removed)
// - Full Mobile (<=640px), Tablet/iPad (<=1024px), Laptop & Desktop responsiveness

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getEstimates, getEstimateById } from '../api/estimatesApi';
import { useAuth } from '../../auth/hooks/useAuth';

import deckProductsImg from '../../../assets/images/deck_products_highlight.webp';
import deckBannerWood from '../../../assets/images/deck_banner_wood.webp';

export default function CustomerDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [estimates, setEstimates] = useState([]);
  const [summary, setSummary] = useState(null);
  const [totalCount, setTotalCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState(null);

  const loadDashboardData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const estRes = await getEstimates({ limit: 8, compact: '1' });
      setEstimates(estRes?.estimates || []);
      setSummary(estRes?.summary || null);
      setTotalCount(
        estRes?.pagination?.total !== undefined ? estRes.pagination.total : null
      );
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    const handleSaved = () => loadDashboardData(true);
    window.addEventListener('estimation_saved', handleSaved);
    return () => window.removeEventListener('estimation_saved', handleSaved);
  }, [loadDashboardData]);

  // Real-time KPI calculations using full DB summary when available
  const kpis = useMemo(() => {
    if (summary) {
      return {
        total: summary.total ?? estimates.length,
        created: summary.created ?? 0,
        completed: summary.completed ?? 0,
        inProgress: summary.inProgress ?? 0,
      };
    }

    const total = totalCount !== null ? totalCount : estimates.length;
    const created = estimates.filter((e) => {
      const st = (e.estimateStatus || 'CREATED').toUpperCase();
      return st === 'CREATED' || st === 'DRAFT';
    }).length;
    const completed = estimates.filter((e) => {
      const st = (e.estimateStatus || '').toUpperCase();
      return st === 'COMPLETED' || st === 'APPROVED';
    }).length;
    const inProgress = estimates.filter((e) => {
      const st = (e.estimateStatus || '').toUpperCase();
      return st === 'IN_PROGRESS' || st === 'REQUESTED' || st === 'IN_REVIEW' || st === 'SUBMITTED';
    }).length;

    return { total, created, completed, inProgress };
  }, [summary, totalCount, estimates]);

  const handleDownloadPdf = async (est) => {
    const estId = est._id || est.id;
    if (!estId || downloadingId) return;
    setDownloadingId(estId);
    try {
      const [{ downloadEstimatePdf }, fullEst] = await Promise.all([
        import('../../../utils/reportExport'),
        getEstimateById(estId).catch(() => est),
      ]);
      await downloadEstimatePdf(fullEst || est, user);
    } catch {
      // Fall back with current compact record
      try {
        const { downloadEstimatePdf } = await import('../../../utils/reportExport');
        await downloadEstimatePdf(est, user);
      } catch {
        // Ignore
      }
    } finally {
      setDownloadingId(null);
    }
  };

  function formatCurrency(val) {
    if (typeof val !== 'number' || Number.isNaN(val)) return '$2,500.00';
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

  function mapStage(status) {
    const s = (status || 'CREATED').toUpperCase();
    if (s === 'COMPLETED' || s === 'APPROVED') return { label: 'Completed', color: '#16A34A', bg: '#DCFCE7', dot: '#15803D' };
    if (s === 'IN_PROGRESS') return { label: 'In Progress', color: '#7E22CE', bg: '#FAF5FF', dot: '#9333EA' };
    if (s === 'REQUESTED' || s === 'IN_REVIEW' || s === 'SUBMITTED') return { label: 'Requested', color: '#D97706', bg: '#FEF3C7', dot: '#B45309' };
    return { label: 'Created', color: '#0284C7', bg: '#E0F2FE', dot: '#0369A1' };
  }

  function getEstimateScope(est) {
    if (est.scope) return est.scope;
    const fromServices = Array.isArray(est.selectedServices)
      ? est.selectedServices.map((s) => s.serviceName).filter(Boolean)
      : Array.isArray(est.services)
      ? est.services
      : [];
    if (fromServices.length > 0) return fromServices.slice(0, 2).join(' & ');
    return 'Cleaning & Sealing';
  }

  return (
    <div className="cust-dash-root">
      <style>{`
        @keyframes drpShimmer {
          0% { background-position: -220px 0; }
          100% { background-position: 220px 0; }
        }
        @keyframes drpSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .drp-skel {
          display: inline-block;
          border-radius: 6px;
          background: linear-gradient(90deg, rgba(148,163,184,0.18) 25%, rgba(148,163,184,0.34) 50%, rgba(148,163,184,0.18) 75%);
          background-size: 440px 100%;
          animation: drpShimmer 1.25s infinite linear;
        }
        .cust-dash-root {
          padding: 18px 24px 36px;
          max-width: 1440px;
          margin: 0 auto;
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .cust-dash-root * {
          box-sizing: border-box;
        }
        .cust-dash-topbar {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          margin-bottom: 12px;
        }
        .cust-dash-hero {
          border-radius: 14px;
          background-size: cover;
          background-position: center;
          padding: 28px 34px;
          color: #ffffff;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(30, 58, 99, 0.16);
          margin-bottom: 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }
        .cust-dash-hero-title {
          margin: 0 0 8px 0;
          font-size: 26px !important;
          font-weight: 800;
          line-height: 1.2;
          color: #ffffff;
          letter-spacing: -0.3px;
        }
        .cust-dash-sticker-wrap {
          display: none;
          z-index: 2;
          flex-shrink: 0;
        }
        @media (min-width: 960px) {
          .cust-dash-sticker-wrap {
            display: block;
          }
        }
        .cust-dash-kpi-grid {
          display: grid !important;
          grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          gap: 14px !important;
          margin-bottom: 18px;
        }
        .cust-dash-kpi-card {
          border-radius: 14px;
          padding: 15px 16px !important;
          border: 1px solid;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          min-width: 0;
        }
        .cust-dash-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(30, 58, 99, 0.1);
        }
        .cust-dash-actions-grid {
          display: grid !important;
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          gap: 14px !important;
          margin-bottom: 20px;
        }
        .cust-dash-bottom-grid {
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) 330px !important;
          gap: 20px !important;
          align-items: start;
        }
        .cust-dash-side-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .cust-dash-desktop-table-wrap {
          display: block;
          overflow-x: auto;
        }
        .cust-dash-mobile-cards {
          display: none;
        }
        .cust-dash-product-img {
          width: 100%;
          height: 136px;
          object-fit: contain;
          display: block;
        }

        /* iPad / Tablet (<= 1100px) */
        @media (max-width: 1100px) {
          .cust-dash-root {
            padding: 16px 16px 28px;
          }
          .cust-dash-kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .cust-dash-bottom-grid {
            grid-template-columns: 1fr !important;
          }
          .cust-dash-side-col {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 16px !important;
            align-items: start !important;
          }
          .cust-dash-side-col > div {
            height: auto !important;
            align-self: start !important;
          }
          .cust-dash-root table {
            display: table !important;
            width: 100% !important;
            min-width: 100% !important;
          }
          .cust-dash-root th,
          .cust-dash-root td {
            padding: 10px 7px !important;
            white-space: normal !important;
          }
          .cust-dash-root th:last-child,
          .cust-dash-root td:last-child {
            white-space: nowrap !important;
            width: 118px !important;
          }
          .cust-dash-root .drp-action-row {
            flex-wrap: nowrap !important;
            gap: 6px !important;
          }
        }

        /* Mobile / Small Tablet (<= 720px) */
        @media (max-width: 720px) {
          .cust-dash-root {
            padding: 12px 12px 24px !important;
          }
          .cust-dash-hero {
            padding: 18px 16px !important;
            border-radius: 12px;
            margin-bottom: 14px;
          }
          .cust-dash-hero-title {
            font-size: 19px !important;
          }
          .cust-dash-hero-sub {
            font-size: 12.5px !important;
            margin-bottom: 14px !important;
          }
          .cust-dash-actions-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
            margin-bottom: 16px;
          }
          .cust-dash-side-col {
            grid-template-columns: 1fr !important;
          }
          .cust-dash-desktop-table-wrap {
            display: none !important;
          }
          .cust-dash-mobile-cards {
            display: flex !important;
            flex-direction: column;
            gap: 10px;
            padding: 12px;
          }
          .cust-dash-product-img {
            height: 106px !important;
          }
        }

        /* Narrow Mobile (<= 480px) */
        @media (max-width: 480px) {
          .cust-dash-kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
            margin-bottom: 14px;
          }
          .cust-dash-kpi-card {
            padding: 11px 12px !important;
            gap: 8px !important;
          }
          .cust-dash-kpi-icon {
            width: 34px !important;
            height: 34px !important;
          }
          .cust-dash-kpi-val {
            font-size: 19px !important;
          }
          .cust-dash-kpi-label {
            font-size: 11px !important;
            white-space: normal !important;
            line-height: 1.25;
          }
          .cust-dash-hero-btn-row button {
            width: 100%;
            justify-content: center;
            padding: 9px 14px !important;
            font-size: 12.5px !important;
          }
        }
        /* Beat global.css mobile [style*="padding:"] blanket rule */
        @media (max-width: 900px) {
          .cust-dash-root .drp-compact-pad {
            padding: 3px 8px !important;
          }
          .cust-dash-root .drp-pill-pad {
            padding: 2px 9px !important;
          }
          .cust-dash-root .drp-icon-btn {
            padding: 0 !important;
            width: 30px !important;
            height: 30px !important;
            min-height: 30px !important;
          }
          .cust-dash-root .drp-refresh-btn {
            padding: 6px 12px !important;
            min-height: 34px !important;
          }
          .cust-dash-root .drp-hero-badge {
            padding: 4px 10px !important;
          }
        }
      `}</style>

      {/* Top Control Bar: Clean Right-Aligned Refresh */}
      <div className="cust-dash-topbar">
        <button
          type="button"
          className="drp-refresh-btn"
          onClick={() => loadDashboardData(true)}
          disabled={loading || refreshing}
          style={styles.refreshBtn}
          title="Refresh real-time estimates & project data"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              animation: refreshing ? 'drpSpin 0.8s linear infinite' : 'none',
              transformOrigin: 'center',
            }}
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          <span>{error}</span>
          <button type="button" onClick={() => loadDashboardData(true)} style={styles.retryBtn}>
            Retry
          </button>
        </div>
      )}

      {/* 1. HERO BANNER */}
      <section
        className="cust-dash-hero"
        style={{
          backgroundImage: `linear-gradient(90deg, #1E3A63 0%, rgba(30, 58, 99, 0.92) 58%, rgba(30, 58, 99, 0.45) 100%), url(${deckBannerWood})`,
        }}
      >
        <div style={styles.heroContent}>
          <div className="drp-hero-badge" style={styles.heroTagBadge}>
            Certified Exterior Wood Restoration
          </div>

          <h1 className="cust-dash-hero-title">
            Professional Deck Restoration Estimates
          </h1>

          <p className="cust-dash-hero-sub" style={styles.heroSubtitle}>
            Calculate guaranteed quotes, schedule licensed contractors, and track your deck restoration from creation to completion.
          </p>

          <div className="cust-dash-hero-btn-row" style={styles.heroBtnRow}>
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
              <span>+ Create New Estimation</span>
              <span style={{ fontSize: '15px', fontWeight: '800' }}>&rarr;</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/customer/support')}
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

        {/* Decorative Right-Side Sticker Badge (Desktop >= 960px) */}
        <div className="cust-dash-sticker-wrap">
          <div style={styles.bannerSticker}>
            <div style={styles.stickerIconBox}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E08131" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#1E3A63', textTransform: 'uppercase' }}>
                1-Year Guaranteed
              </div>
              <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '600' }}>
                Licensed &amp; Certified
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SUMMARY KPI CARDS (Total | Created | Completed | In Progress) */}
      <section className="cust-dash-kpi-grid">
        {[
          {
            label: 'Total Estimates',
            value: kpis.total,
            bg: 'linear-gradient(135deg, #F0F7FF 0%, #E0EEFF 100%)',
            border: '#BFDBFE',
            iconColor: '#1E3A63',
            valColor: '#0f172a',
            title: 'All estimates created on this account',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            ),
          },
          {
            label: 'Created Estimates',
            value: kpis.created,
            bg: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
            border: '#FDE68A',
            iconColor: '#D97706',
            valColor: '#B45309',
            title: 'Newly calculated estimates pending inquiry',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            ),
          },
          {
            label: 'Completed Estimates',
            value: kpis.completed,
            bg: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
            border: '#BBF7D0',
            iconColor: '#16A34A',
            valColor: '#15803D',
            title: 'Successfully verified & completed deck projects',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            ),
          },
          {
            label: 'In Progress',
            value: kpis.inProgress,
            bg: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
            border: '#E9D5FF',
            iconColor: '#7E22CE',
            valColor: '#7E22CE',
            title: 'Estimations currently requested or underway',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            ),
          },
        ].map((card) => (
          <div
            key={card.label}
            className="cust-dash-kpi-card"
            style={{ background: card.bg, borderColor: card.border }}
            onClick={() => navigate('/customer/estimates')}
            title={card.title}
          >
            <div className="cust-dash-kpi-icon" style={{ ...styles.kpiIconCircle, color: card.iconColor }}>
              {card.icon}
            </div>
            <div style={styles.kpiCenter}>
              {loading ? (
                <span className="drp-skel" style={{ width: '36px', height: '24px', marginBottom: '4px' }} />
              ) : (
                <div className="cust-dash-kpi-val" style={{ ...styles.kpiValue, color: card.valColor }}>
                  {card.value}
                </div>
              )}
              <div className="cust-dash-kpi-label" style={styles.kpiLabel}>{card.label}</div>
            </div>
            <div style={styles.kpiChevron}>&rarr;</div>
          </div>
        ))}
      </section>

      {/* 3. QUICK NAVIGATION ACTION CARDS */}
      <section className="cust-dash-actions-grid">
        {[
          {
            title: 'Create Estimate',
            to: '/customer/decks/new',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            ),
          },
          {
            title: 'My Deck Projects',
            to: '/customer/estimates',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            ),
          },
          {
            title: 'Profile Settings',
            to: '/customer/profile',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            ),
          },
        ].map((item) => (
          <div
            key={item.title}
            style={styles.actionCard}
            onClick={() => navigate(item.to)}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#1E3A63';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(30, 58, 99, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.03)';
            }}
          >
            <div style={styles.actionIconBox}>{item.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={styles.actionCardTitle}>{item.title}</h4>
            </div>
            <span style={styles.actionArrow}>&rarr;</span>
          </div>
        ))}
      </section>

      {/* 4. TWO-COLUMN LAYOUT: RECENT ESTIMATES + SIDE PANEL */}
      <section className="cust-dash-bottom-grid">
        {/* Left: Recent Estimates Panel */}
        <div style={styles.tablePanel}>
          <div style={styles.tablePanelHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div style={styles.tableHeaderIconBox}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h3 style={styles.tablePanelTitle}>Recent Estimates</h3>
              {loading ? (
                <span className="drp-skel" style={{ width: '24px', height: '18px', borderRadius: '10px' }} />
              ) : (
                <span className="drp-compact-pad" style={styles.tableBadge}>{estimates.length}</span>
              )}
            </div>
            <Link to="/customer/estimates" style={styles.viewAllLink}>
              <span>View All</span>
              <span style={{ fontSize: '14px', fontWeight: '800' }}>&rarr;</span>
            </Link>
          </div>

          {/* Desktop / Tablet Table View (>= 721px) */}
          <div className="cust-dash-desktop-table-wrap">
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
                {loading ? (
                  [1, 2, 3].map((row) => (
                    <tr key={row} style={styles.tableRow}>
                      <td style={styles.tableCell}><span className="drp-skel" style={{ width: '16px', height: '14px' }} /></td>
                      <td style={styles.tableCell}>
                        <span className="drp-skel" style={{ width: '130px', height: '14px', marginBottom: '4px' }} />
                        <br />
                        <span className="drp-skel" style={{ width: '90px', height: '11px' }} />
                      </td>
                      <td style={styles.tableCell}><span className="drp-skel" style={{ width: '62px', height: '20px' }} /></td>
                      <td style={styles.tableCell}><span className="drp-skel" style={{ width: '105px', height: '20px' }} /></td>
                      <td style={styles.tableCell}><span className="drp-skel" style={{ width: '74px', height: '16px' }} /></td>
                      <td style={styles.tableCell}><span className="drp-skel" style={{ width: '78px', height: '22px', borderRadius: '12px' }} /></td>
                      <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                        <span className="drp-skel" style={{ width: '96px', height: '28px' }} />
                      </td>
                    </tr>
                  ))
                ) : estimates && estimates.length > 0 ? (
                  estimates.map((est, idx) => {
                    const estId = est._id || est.id;
                    const projectName =
                      est.deckDetails?.projectName ||
                      est.deckId?.projectName ||
                      est.estimateName ||
                      `Deck Project (${est.estimateNumber || idx + 1})`;
                    const area =
                      est.deckDetails?.areaSqFt ||
                      est.deckDetails?.deckArea ||
                      est.deckId?.areaSqFt ||
                      est.pricingSnapshot?.billableArea ||
                      400;
                    const scope = getEstimateScope(est);
                    const stage = mapStage(est.estimateStatus);
                    const isDownloading = downloadingId === estId;

                    return (
                      <tr key={estId} style={styles.tableRow}>
                        <td style={{ ...styles.tableCell, color: '#94a3b8', fontWeight: '600' }}>
                          {idx + 1}
                        </td>
                        <td style={{ ...styles.tableCell, fontWeight: '700', color: '#0f172a' }}>
                          <div>{projectName}</div>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
                            {est.estimateNumber || `Ref: DP-2026-${String(estId).slice(-4)}`}
                          </div>
                        </td>
                        <td style={styles.tableCell}>
                          <span className="drp-compact-pad" style={styles.areaBadge}>{area} sq ft</span>
                        </td>
                        <td style={styles.tableCell}>
                          <span className="drp-compact-pad" style={styles.scopeBadge}>{scope}</span>
                        </td>
                        <td style={{ ...styles.tableCell, fontWeight: '800', color: '#1E3A63', fontSize: '14px' }}>
                          {getPriceDisplay(est)}
                        </td>
                        <td style={styles.tableCell}>
                          <span
                            className="drp-pill-pad"
                            style={{
                              ...styles.statusPill,
                              backgroundColor: stage.bg,
                              color: stage.color,
                              borderColor: stage.color,
                            }}
                          >
                            <span style={{ ...styles.statusDot, backgroundColor: stage.dot }} />
                            {stage.label}
                          </span>
                        </td>
                        <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                          <div className="drp-action-row" style={styles.actionBtnsRow}>
                            {/* View Action */}
                            <button
                              type="button"
                              className="drp-icon-btn"
                              onClick={() => navigate(`/customer/estimates/${estId}`)}
                              style={styles.iconAction}
                              title="View Estimate Details"
                              aria-label="View Estimate"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                            {/* Download Official PDF Action */}
                            <button
                              type="button"
                              className="drp-icon-btn"
                              onClick={() => handleDownloadPdf(est)}
                              disabled={isDownloading}
                              style={styles.iconAction}
                              title="Download Official PDF Report"
                              aria-label="Download Estimate PDF"
                            >
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#475569"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ animation: isDownloading ? 'drpSpin 0.8s linear infinite' : 'none' }}
                              >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                            </button>
                            {/* Edit Action */}
                            <button
                              type="button"
                              className="drp-icon-btn"
                              onClick={() =>
                                navigate('/customer/decks/new', {
                                  state: { editEstimate: est },
                                })
                              }
                              style={styles.iconAction}
                              title="Edit / Recalculate Estimate"
                              aria-label="Edit Estimate"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{ padding: '32px 20px', textAlign: 'center', color: '#64748b' }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#1E3A63', marginBottom: '4px' }}>
                        No estimations created yet
                      </div>
                      <div style={{ fontSize: '12px', marginBottom: '14px' }}>
                        Click "+ Create New Estimation" to build your first guaranteed quote.
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('/customer/decks/new')}
                        style={styles.emptyCreateBtn}
                      >
                        + Create New Estimation
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Estimate Cards View (<= 720px) */}
          <div className="cust-dash-mobile-cards">
            {loading ? (
              [1, 2].map((c) => (
                <div key={c} style={styles.mobileCard}>
                  <span className="drp-skel" style={{ width: '55%', height: '16px', marginBottom: '8px' }} />
                  <span className="drp-skel" style={{ width: '80%', height: '12px', marginBottom: '10px' }} />
                  <span className="drp-skel" style={{ width: '100%', height: '32px' }} />
                </div>
              ))
            ) : estimates && estimates.length > 0 ? (
              estimates.map((est, idx) => {
                const estId = est._id || est.id;
                const projectName =
                  est.deckDetails?.projectName ||
                  est.deckId?.projectName ||
                  est.estimateName ||
                  `Deck Project (${est.estimateNumber || idx + 1})`;
                const area =
                  est.deckDetails?.areaSqFt ||
                  est.deckDetails?.deckArea ||
                  est.deckId?.areaSqFt ||
                  est.pricingSnapshot?.billableArea ||
                  400;
                const scope = getEstimateScope(est);
                const stage = mapStage(est.estimateStatus);
                const isDownloading = downloadingId === estId;

                return (
                  <div key={estId} style={styles.mobileCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a', wordBreak: 'break-word' }}>
                          {projectName}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {est.estimateNumber || `Ref: DP-2026-${String(estId).slice(-4)}`}
                        </div>
                      </div>
                      <span
                        className="drp-pill-pad"
                        style={{
                          ...styles.statusPill,
                          backgroundColor: stage.bg,
                          color: stage.color,
                          borderColor: stage.color,
                          flexShrink: 0,
                          fontSize: '10.5px',
                          padding: '2px 8px',
                        }}
                      >
                        <span style={{ ...styles.statusDot, backgroundColor: stage.dot }} />
                        {stage.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      <span className="drp-compact-pad" style={styles.areaBadge}>{area} sq ft</span>
                      <span className="drp-compact-pad" style={styles.scopeBadge}>{scope}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: '#1E3A63' }}>
                        {getPriceDisplay(est)}
                      </span>
                      <div className="drp-action-row" style={styles.actionBtnsRow}>
                        <button
                          type="button"
                          className="drp-icon-btn"
                          onClick={() => navigate(`/customer/estimates/${estId}`)}
                          style={styles.iconAction}
                          title="View Estimate"
                          aria-label="View Estimate"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="drp-icon-btn"
                          onClick={() => handleDownloadPdf(est)}
                          disabled={isDownloading}
                          style={styles.iconAction}
                          title="Download PDF"
                          aria-label="Download Estimate PDF"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="drp-icon-btn"
                          onClick={() =>
                            navigate('/customer/decks/new', {
                              state: { editEstimate: est },
                            })
                          }
                          style={styles.iconAction}
                          title="Edit Estimate"
                          aria-label="Edit Estimate"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: '#64748b' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#1E3A63', marginBottom: '4px' }}>
                  No estimations created yet
                </div>
                <div style={{ fontSize: '12px', marginBottom: '12px' }}>
                  Tap below to calculate your guaranteed quote.
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/customer/decks/new')}
                  style={styles.emptyCreateBtn}
                >
                  + Create New Estimation
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Product Highlight & Need Help */}
        <div className="cust-dash-side-col">
          {/* 1. PRODUCT HIGHLIGHT CARD */}
          <div style={styles.productCard}>
            <div style={styles.productHeader}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.12 6.4-6.05-4A2 2 0 0 0 14 2H10a2 2 0 0 0-1.07.4L2.88 6.4A2 2 0 0 0 2 8v8a2 2 0 0 0 .88 1.6l6.05 4A2 2 0 0 0 10 22h4a2 2 0 0 0 1.07-.4l6.05-4A2 2 0 0 0 22 16V8a2 2 0 0 0-.88-1.6z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              <h4 style={styles.productTitle}>Product Highlight</h4>
            </div>

            <div style={styles.productBody}>
              <div style={styles.productImgWrap}>
                <img
                  src={deckProductsImg}
                  alt="Deck Restoration Plus Product Lineup"
                  className="cust-dash-product-img"
                  loading="lazy"
                />
              </div>

              <div style={styles.productInfo}>
                <span style={styles.productCategory}>Certified Professional Formulation</span>
                <h5 style={styles.productName}>Deck Restoration Plus Wood Restoration System</h5>
                <p style={styles.productDesc}>
                  Commercial-grade cleaners, strippers, and deep-penetrating oil stains formulated for extreme outdoor durability.
                </p>

                <div style={styles.productHighlightsList}>
                  <div style={styles.productHighlightItem}>
                    <span style={styles.productCheck}>✓</span>
                    <span>EPA Registered &amp; Eco-Safe</span>
                  </div>
                  <div style={styles.productHighlightItem}>
                    <span style={styles.productCheck}>✓</span>
                    <span>Superior UV Photoprotection</span>
                  </div>
                </div>

                <a
                  href="https://www.deckrestorationplus.com/shop"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.productCtaBtn}
                >
                  <span>Explore Product Catalog</span>
                  <span style={{ fontSize: '13px', fontWeight: '800' }}>&rarr;</span>
                </a>
              </div>
            </div>
          </div>

          {/* 2. NEED ESTIMATOR HELP CARD */}
          <div style={styles.helpCard}>
            <div style={styles.helpHeader}>
              <div style={styles.helpIconBox}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div>
                <h4 style={styles.helpTitle}>Need Estimator Help?</h4>
                <p style={styles.helpSub}>Certified support specialists available</p>
              </div>
            </div>

            <p style={styles.helpText}>
              Have questions regarding wood species, custom deck elevations, or repair scopes? Speak directly with our restoration engineering team.
            </p>

            <div style={styles.helpPhoneRow}>
              <a href="tel:18664403325" style={styles.helpPhoneBtn}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>(866) 440-DECK</span>
              </a>
            </div>

            <div style={styles.helpHours}>
              <span>Mon &ndash; Fri: 8:00 AM &ndash; 6:00 PM EST</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #CBD5E1',
    borderRadius: '6px',
    color: '#1E3A63',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '10px 14px',
    marginBottom: '14px',
    borderRadius: '8px',
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    color: '#991B1B',
    fontSize: '13px',
    fontWeight: '600',
  },
  retryBtn: {
    padding: '5px 10px',
    borderRadius: '6px',
    border: '1px solid #FCA5A5',
    backgroundColor: '#ffffff',
    color: '#991B1B',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  heroContent: {
    maxWidth: '680px',
    zIndex: 2,
    minWidth: 0,
  },
  heroTagBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    backdropFilter: 'blur(4px)',
    borderRadius: '20px',
    fontSize: '10.5px',
    fontWeight: '700',
    color: '#F8FAFC',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: '8px',
  },
  heroSubtitle: {
    margin: '0 0 18px 0',
    fontSize: '13.5px',
    lineHeight: '1.5',
    color: 'rgba(255, 255, 255, 0.9)',
    maxWidth: '560px',
  },
  heroBtnRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  heroPrimaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#E08131',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13.5px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: '0 4px 14px rgba(224, 129, 49, 0.35)',
  },
  heroSecondaryBtn: {
    padding: '10px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.35)',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  bannerSticker: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(8px)',
    borderRadius: '12px',
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
    border: '1px solid rgba(255, 255, 255, 0.6)',
  },
  stickerIconBox: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: '#FFF7ED',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiIconCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
    flexShrink: 0,
  },
  kpiCenter: {
    flex: 1,
    minWidth: 0,
  },
  kpiValue: {
    fontSize: '23px',
    fontWeight: '900',
    color: '#0f172a',
    lineHeight: '1.1',
    marginBottom: '2px',
  },
  kpiLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#475569',
    whiteSpace: 'nowrap',
  },
  kpiChevron: {
    fontSize: '15px',
    color: '#94a3b8',
    fontWeight: '700',
    flexShrink: 0,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    padding: '13px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
  },
  actionIconBox: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    backgroundColor: '#F1F5F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionCardTitle: {
    margin: 0,
    fontSize: '14.5px',
    fontWeight: '800',
    color: '#1E3A63',
  },
  actionArrow: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#94a3b8',
    marginLeft: 'auto',
  },
  tablePanel: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1.5px solid #CBD5E1',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
    minWidth: 0,
  },
  tablePanelHeader: {
    padding: '13px 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    borderBottom: '1px solid #E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  tableHeaderIconBox: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    backgroundColor: '#EFF6FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tablePanelTitle: {
    margin: 0,
    fontSize: '14.5px',
    fontWeight: '800',
    color: '#1E3A63',
  },
  tableBadge: {
    backgroundColor: '#EFF6FF',
    color: '#1E3A63',
    fontSize: '11px',
    fontWeight: '800',
    padding: '2px 8px',
    borderRadius: '12px',
    border: '1px solid #BFDBFE',
  },
  viewAllLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    color: '#1E3A63',
    fontSize: '12.5px',
    fontWeight: '700',
    textDecoration: 'none',
    flexShrink: 0,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeadRow: {
    backgroundColor: '#F8FAFC',
    borderBottom: '1.5px solid #E2E8F0',
  },
  tableHeadCell: {
    padding: '11px 14px',
    fontSize: '11px',
    fontWeight: '800',
    color: '#475569',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  tableRow: {
    borderBottom: '1px solid #E2E8F0',
  },
  tableCell: {
    padding: '12px 14px',
    fontSize: '12.5px',
    color: '#334155',
    verticalAlign: 'middle',
  },
  mobileCard: {
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '12px',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
  },
  areaBadge: {
    display: 'inline-block',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    padding: '3px 7px',
    borderRadius: '5px',
    fontSize: '11.5px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  scopeBadge: {
    display: 'inline-block',
    backgroundColor: '#F8FAFC',
    color: '#475569',
    border: '1px solid #E2E8F0',
    padding: '3px 7px',
    borderRadius: '5px',
    fontSize: '11.5px',
    fontWeight: '600',
  },
  statusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '11.5px',
    fontWeight: '800',
    border: '1px solid',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  actionBtnsRow: {
    display: 'flex',
    gap: '6px',
    justifyContent: 'flex-end',
    flexWrap: 'nowrap',
  },
  iconAction: {
    width: '30px',
    height: '30px',
    borderRadius: '6px',
    border: '1px solid #E2E8F0',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
  },
  emptyCreateBtn: {
    padding: '8px 16px',
    backgroundColor: '#1E3A63',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12.5px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1.5px solid #CBD5E1',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
  productHeader: {
    backgroundColor: '#1E3A63',
    padding: '11px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  productTitle: {
    margin: 0,
    fontSize: '13.5px',
    fontWeight: '800',
    color: '#ffffff',
  },
  productBody: {
    padding: '14px',
  },
  productImgWrap: {
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '12px',
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
  },
  productInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  productCategory: {
    fontSize: '10.5px',
    fontWeight: '700',
    color: '#E08131',
    textTransform: 'uppercase',
  },
  productName: {
    margin: 0,
    fontSize: '13.5px',
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: '1.3',
  },
  productDesc: {
    margin: '3px 0 8px',
    fontSize: '11.5px',
    color: '#64748b',
    lineHeight: '1.4',
  },
  productHighlightsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '12px',
  },
  productHighlightItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11.5px',
    color: '#334155',
  },
  productCheck: {
    color: '#15803D',
    fontWeight: '800',
    fontSize: '12px',
  },
  productCtaBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '9px 14px',
    backgroundColor: '#1E3A63',
    color: '#ffffff',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    textDecoration: 'none',
  },
  helpCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1.5px solid #CBD5E1',
    padding: '14px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
  helpHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  helpIconBox: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    backgroundColor: '#EFF6FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  helpTitle: {
    margin: 0,
    fontSize: '13.5px',
    fontWeight: '800',
    color: '#1E3A63',
  },
  helpSub: {
    margin: 0,
    fontSize: '11px',
    color: '#64748b',
  },
  helpText: {
    margin: '0 0 10px',
    fontSize: '11.5px',
    color: '#475569',
    lineHeight: '1.45',
  },
  helpPhoneRow: {
    marginBottom: '8px',
  },
  helpPhoneBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    backgroundColor: '#1E3A63',
    color: '#ffffff',
    borderRadius: '6px',
    fontSize: '12.5px',
    fontWeight: '800',
    textDecoration: 'none',
  },
  helpHours: {
    fontSize: '10.5px',
    color: '#94a3b8',
    fontWeight: '600',
  },
};

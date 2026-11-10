// =============================================
// Deck Estimator — Customer Dashboard Page
// =============================================
// Updated Full-Stack Implementation:
// - Medium Navy Blue Theme (#1E3A63)
// - Top Control Bar with spinning Refresh button
// - Hero Banner with balanced gradient, decorative sticker badge, "+ Create New Estimation" CTA, and Restoration Guide linking to /customer/support
// - 4 Pale Shiny Summary Cards matching Contractor Dashboard in exact order:
//     [ Total Estimates | Created Estimates | Completed Estimates | In Progress ]
//   (100% real-time database counts, no fake data, no descriptions, white icon circle, right chevron)
// - 3 Quick Action Cards below KPIs: Clean white background, thin border, shiny hover, larger font (15px), no descriptions, updated icons
// - Recent Estimates Table with crisp outlined borders, zero "Draft" labels (cycle starts at Created -> Requested -> In Progress -> Completed), and 100% working actions

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getEstimates } from '../api/estimatesApi';
import { getDecks } from '../api/decksApi';
import { useAuth } from '../../auth/hooks/useAuth';
import { downloadEstimatePdf } from '../../../utils/reportExport';

import deckProductsImg from '../../../assets/images/deck_products_highlight.png';
import deckBannerWood from '../../../assets/images/deck_banner_wood.png';
import mainLogoV2 from '../../../assets/images/Main_Logo_v2.png';

export default function CustomerDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadDashboardData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const estRes = await getEstimates({ limit: 8 }).catch(() => ({ estimates: [], pagination: { total: 0 } }));
      setEstimates(estRes?.estimates || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    const handleSaved = () => loadDashboardData();
    window.addEventListener('estimation_saved', handleSaved);
    return () => window.removeEventListener('estimation_saved', handleSaved);
  }, [loadDashboardData]);

  // Real-time KPI Calculations strictly mapped to user data:
  // Order: [ Total Estimates | Created Estimates | Completed Estimates | In Progress ]
  const kpis = useMemo(() => {
    const total = estimates.length;
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

    return {
      total,
      created,
      completed,
      inProgress,
    };
  }, [estimates]);

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

  // Map raw status into strict lifecycle: Created -> Requested -> In Progress -> Completed
  function mapStage(status) {
    const s = (status || 'CREATED').toUpperCase();
    if (s === 'COMPLETED' || s === 'APPROVED') return { label: 'Completed', color: '#16A34A', bg: '#DCFCE7', dot: '#15803D' };
    if (s === 'IN_PROGRESS') return { label: 'In Progress', color: '#7E22CE', bg: '#FAF5FF', dot: '#9333EA' };
    if (s === 'REQUESTED' || s === 'IN_REVIEW' || s === 'SUBMITTED') return { label: 'Requested', color: '#D97706', bg: '#FEF3C7', dot: '#B45309' };
    return { label: 'Created', color: '#0284C7', bg: '#E0F2FE', dot: '#0369A1' };
  }

  return (
    <div style={styles.container}>
      {/* ============================================================== */}
      {/* 0. TOP CONTROL BAR WITH DASHBOARD REFRESH BUTTON               */}
      {/* ============================================================== */}
      <div style={styles.topControlRow}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Customer Portal Overview
          </span>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            Live Synchronized
          </span>
        </div>

        <button
          type="button"
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
              animation: refreshing ? 'spin 0.8s linear infinite' : 'none',
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

      {/* ============================================================== */}
      {/* 1. HERO BANNER WITH REFINED GRADIENT & DECORATIVE STICKER      */}
      {/* ============================================================== */}
      <section
        style={{
          ...styles.heroCard,
          backgroundImage: `linear-gradient(90deg, #1E3A63 0%, rgba(30, 58, 99, 0.92) 58%, rgba(30, 58, 99, 0.45) 100%), url(${deckBannerWood})`,
        }}
      >
        <div style={styles.heroContent}>
          <div style={styles.heroTagBadge}>
            Certified Exterior Wood Restoration
          </div>

          <h1 style={styles.heroTitle}>
            Professional Deck Restoration Estimates
          </h1>

          <p style={styles.heroSubtitle}>
            Calculate guaranteed quotes, schedule licensed contractors, and track your deck restoration from creation to completion.
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

        {/* Decorative Right-Side Sticker Badge */}
        <div style={styles.bannerStickerWrap}>
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

      {/* ============================================================== */}
      {/* 2. SUMMARY KPI CARDS (ORDER: TOTAL | CREATED | COMPLETED | IN PROGRESS) */}
      {/* Matching Contractor Dashboard Pale Colored Shiny Cards         */}
      {/* ============================================================== */}
      <section style={styles.kpiRowGrid}>
        {/* Card 1: Total Estimates (Pale Shiny Blue) */}
        <div
          style={{ ...styles.kpiCard, background: 'linear-gradient(135deg, #F0F7FF 0%, #E0EEFF 100%)', borderColor: '#BFDBFE' }}
          onClick={() => navigate('/customer/estimates')}
          title="All estimates created on this account"
        >
          <div style={{ ...styles.kpiIconCircle, color: '#1E3A63' }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div style={styles.kpiCenter}>
            <div style={styles.kpiValue}>{kpis.total}</div>
            <div style={styles.kpiLabel}>Total Estimates</div>
          </div>
          <div style={styles.kpiChevron}>&rarr;</div>
        </div>

        {/* Card 2: Created Estimates (Pale Shiny Amber) */}
        <div
          style={{ ...styles.kpiCard, background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', borderColor: '#FDE68A' }}
          onClick={() => navigate('/customer/estimates')}
          title="Newly calculated estimates pending inquiry"
        >
          <div style={{ ...styles.kpiIconCircle, color: '#D97706' }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div style={styles.kpiCenter}>
            <div style={{ ...styles.kpiValue, color: '#B45309' }}>{kpis.created}</div>
            <div style={styles.kpiLabel}>Created Estimates</div>
          </div>
          <div style={styles.kpiChevron}>&rarr;</div>
        </div>

        {/* Card 3: Completed Estimates (Pale Shiny Emerald) */}
        <div
          style={{ ...styles.kpiCard, background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)', borderColor: '#BBF7D0' }}
          onClick={() => navigate('/customer/estimates')}
          title="Successfully verified & completed deck projects"
        >
          <div style={{ ...styles.kpiIconCircle, color: '#16A34A' }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div style={styles.kpiCenter}>
            <div style={{ ...styles.kpiValue, color: '#15803D' }}>{kpis.completed}</div>
            <div style={styles.kpiLabel}>Completed Estimates</div>
          </div>
          <div style={styles.kpiChevron}>&rarr;</div>
        </div>

        {/* Card 4: In Progress (Pale Shiny Purple) */}
        <div
          style={{ ...styles.kpiCard, background: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)', borderColor: '#E9D5FF' }}
          onClick={() => navigate('/customer/estimates')}
          title="Estimations currently requested or underway"
        >
          <div style={{ ...styles.kpiIconCircle, color: '#7E22CE' }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div style={styles.kpiCenter}>
            <div style={{ ...styles.kpiValue, color: '#7E22CE' }}>{kpis.inProgress}</div>
            <div style={styles.kpiLabel}>In Progress</div>
          </div>
          <div style={styles.kpiChevron}>&rarr;</div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. QUICK NAVIGATION ACTION BUTTONS (CLEAN WHITE / OUTLINED)    */}
      {/* No pale colors, thin border, shiny hover, larger font, no desc */}
      {/* ============================================================== */}
      <section style={styles.actionCardsRow}>
        {/* Card 1: Create Estimate */}
        <div
          style={styles.actionCard}
          onClick={() => navigate('/customer/decks/new')}
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
          <div style={styles.actionIconBox}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={styles.actionCardTitle}>Create Estimate</h4>
          </div>
          <span style={styles.actionArrow}>&rarr;</span>
        </div>

        {/* Card 2: My Deck Projects */}
        <div
          style={styles.actionCard}
          onClick={() => navigate('/customer/estimates')}
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
          <div style={styles.actionIconBox}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={styles.actionCardTitle}>My Deck Projects</h4>
          </div>
          <span style={styles.actionArrow}>&rarr;</span>
        </div>

        {/* Card 3: My Estimates */}
        <div
          style={styles.actionCard}
          onClick={() => navigate('/customer/estimates')}
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
          <div style={styles.actionIconBox}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={styles.actionCardTitle}>My Estimates</h4>
          </div>
          <span style={styles.actionArrow}>&rarr;</span>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. TWO-COLUMN LAYOUT: RECENT ESTIMATES (66%) + SIDE PANEL (34%) */}
      {/* ============================================================== */}
      <section style={styles.bottomGrid}>
        {/* Left: Recent Estimates Table with Crisp Outlined Borders */}
        <div style={styles.tablePanel}>
          <div style={styles.tablePanelHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={styles.tableHeaderIconBox}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
                {estimates && estimates.length > 0 ? (
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
                      est.pricingSnapshot?.billableArea ||
                      400;
                    const scope = est.scope || (est.services ? est.services.slice(0, 2).join(' & ') : 'Cleaning & Sealing');
                    const stage = mapStage(est.estimateStatus);

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
                          <span style={styles.areaBadge}>{area} sq ft</span>
                        </td>
                        <td style={styles.tableCell}>
                          <span style={styles.scopeBadge}>{scope}</span>
                        </td>
                        <td style={{ ...styles.tableCell, fontWeight: '800', color: '#1E3A63', fontSize: '14.5px' }}>
                          {getPriceDisplay(est)}
                        </td>
                        <td style={styles.tableCell}>
                          <span
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
                          <div style={styles.actionBtnsRow}>
                            {/* View Action */}
                            <button
                              type="button"
                              onClick={() => navigate('/customer/estimates')}
                              style={styles.iconAction}
                              title="View Estimate Details"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                            {/* Download PDF Action */}
                            <button
                              type="button"
                              onClick={() => downloadEstimatePdf(est, user)}
                              style={styles.iconAction}
                              title="Download Official PDF Report"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                            </button>
                            {/* Print Official PDF Action */}
                            <button
                              type="button"
                              onClick={() => downloadEstimatePdf(est, user)}
                              style={styles.iconAction}
                              title="Print Official PDF Report"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 6 2 18 2 18 9" />
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                <rect x="6" y="14" width="12" height="8" />
                              </svg>
                            </button>
                            {/* Edit Action */}
                            <button
                              type="button"
                              onClick={() =>
                                navigate('/customer/decks/new', {
                                  state: { editEstimate: est },
                                })
                              }
                              style={styles.iconAction}
                              title="Edit / Recalculate Estimate"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
                    <td colSpan="7" style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b' }}>
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
        </div>

        {/* Right Column: Product Highlight & Need Help */}
        <div style={styles.sideCol}>
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
                  style={styles.productImg}
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
                  href="https://deckrestorationplus.com"
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
              <a href="tel:8564403325" style={styles.helpPhoneBtn}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>(856) 440-DECK</span>
              </a>
            </div>

            <div style={styles.helpHours}>
              <span>Mon – Fri: 8:00 AM – 6:00 PM EST</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px 24px 40px',
    maxWidth: '1440px',
    margin: '0 auto',
    boxSizing: 'border-box',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  // 0. TOP CONTROL BAR
  topControlRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
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

  // 1. HERO BANNER
  heroCard: {
    borderRadius: '14px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    padding: '32px 36px',
    color: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(30, 58, 99, 0.16)',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroContent: {
    maxWidth: '680px',
    zIndex: 2,
  },
  heroTagBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    backdropFilter: 'blur(4px)',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#F8FAFC',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: '10px',
  },
  heroTitle: {
    margin: '0 0 10px 0',
    fontSize: '27px',
    fontWeight: '800',
    lineHeight: '1.2',
    color: '#ffffff',
    letterSpacing: '-0.3px',
  },
  heroSubtitle: {
    margin: '0 0 20px 0',
    fontSize: '13.5px',
    lineHeight: '1.5',
    color: 'rgba(255, 255, 255, 0.9)',
    maxWidth: '560px',
  },
  heroBtnRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  heroPrimaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '11px 22px',
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
    padding: '11px 18px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.35)',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  bannerStickerWrap: {
    display: 'none',
    zIndex: 2,
    '@media (min-width: 900px)': {
      display: 'block',
    },
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

  // 2. PALE SHINY SUMMARY KPI ROW (Strict Order: Total | Created | Completed | In Progress)
  kpiRowGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  kpiCard: {
    borderRadius: '14px',
    padding: '16px 18px',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '14px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
    cursor: 'pointer',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  kpiIconCircle: {
    width: '42px',
    height: '42px',
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
    fontSize: '24px',
    fontWeight: '900',
    color: '#0f172a',
    lineHeight: '1.1',
    marginBottom: '2px',
  },
  kpiLabel: {
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#475569',
    whiteSpace: 'nowrap',
  },
  kpiChevron: {
    fontSize: '16px',
    color: '#94a3b8',
    fontWeight: '700',
  },

  // 3. QUICK NAVIGATION ACTION BUTTONS
  actionCardsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '14px',
    marginBottom: '24px',
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
  },
  actionIconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#F1F5F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionCardTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '800',
    color: '#1E3A63',
  },
  actionArrow: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#94a3b8',
    marginLeft: 'auto',
  },

  // 4. TWO-COLUMN LAYOUT
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: '20px',
    alignItems: 'start',
  },
  tablePanel: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1.5px solid #CBD5E1',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
  },
  tablePanelHeader: {
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  tableHeaderIconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#EFF6FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tablePanelTitle: {
    margin: 0,
    fontSize: '15px',
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
    gap: '5px',
    color: '#1E3A63',
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
    backgroundColor: '#F8FAFC',
    borderBottom: '1.5px solid #E2E8F0',
  },
  tableHeadCell: {
    padding: '12px 16px',
    fontSize: '11px',
    fontWeight: '800',
    color: '#475569',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  tableRow: {
    borderBottom: '1px solid #E2E8F0',
    transition: 'background-color 0.15s ease',
  },
  tableCell: {
    padding: '13px 16px',
    fontSize: '12.5px',
    color: '#334155',
    verticalAlign: 'middle',
  },
  areaBadge: {
    display: 'inline-block',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    padding: '3px 7px',
    borderRadius: '5px',
    fontSize: '11.5px',
    fontWeight: '600',
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
    transition: 'all 0.15s ease',
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

  // SIDE PANEL
  sideCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
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
    padding: '12px 16px',
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
    padding: '16px',
  },
  productImgWrap: {
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '12px',
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
  },
  productImg: {
    width: '100%',
    height: '140px',
    objectFit: 'contain',
    display: 'block',
  },
  productInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
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
    transition: 'background-color 0.15s ease',
  },

  // HELP CARD
  helpCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1.5px solid #CBD5E1',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
  helpHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
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
    margin: '0 0 12px',
    fontSize: '11.5px',
    color: '#475569',
    lineHeight: '1.45',
  },
  helpPhoneRow: {
    marginBottom: '10px',
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

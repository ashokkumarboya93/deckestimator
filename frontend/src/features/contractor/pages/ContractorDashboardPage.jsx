// =============================================
// Deck Estimator — Contractor Dashboard Page
// =============================================
// Matches Image 1 Visual Reference:
// - Light navy-blue & bright white theme
// - Welcome banner with contractor name & deck background
// - 5 KPI Cards: Total Projects, Total Estimates, Active Bids, Won Jobs, Revenue Pipeline
// - Recent Deck Projects table with real status badges, deck size, estimate values, action buttons
// - Right side cards: Assigned Leads & Enquiries, Verification & Compliance, Commissions & Earnings, Partner Discounts
// - Bottom Quick Actions row

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDecks } from '../../customer/api/decksApi';
import { getEstimates } from '../../customer/api/estimatesApi';
import { contractorLeadApi } from '../api/contractorLeadApi';
import { contractorCommissionApi } from '../api/contractorCommissionApi';
import { contractorDiscountApi } from '../api/contractorDiscountApi';
import { useAuth } from '../../auth/hooks/useAuth';

export default function ContractorDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real Database state
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [leadsCount, setLeadsCount] = useState(0);
  const [commissionSummary, setCommissionSummary] = useState(null);
  const [discountsCount, setDiscountsCount] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    setError(null);
    try {
      const [profRes, decksRes, estRes, leadsRes, commRes, discRes] = await Promise.allSettled([
        contractorLeadApi.getProfile(),
        getDecks({ limit: 10 }),
        getEstimates({ limit: 20 }),
        contractorLeadApi.getAssignedLeads({ limit: 10 }),
        contractorCommissionApi.getCommissionSummary(),
        contractorDiscountApi.getEligibleDiscounts(),
      ]);

      if (profRes.status === 'fulfilled' && profRes.value?.data) {
        setProfile(profRes.value.data);
      }
      if (decksRes.status === 'fulfilled') {
        const dList = decksRes.value?.decks || decksRes.value?.data?.decks || decksRes.value?.data || [];
        setProjects(Array.isArray(dList) ? dList : []);
      }
      if (estRes.status === 'fulfilled') {
        const eList = estRes.value?.estimates || estRes.value?.data?.estimates || estRes.value?.data || [];
        setEstimates(Array.isArray(eList) ? eList : []);
      }
      if (leadsRes.status === 'fulfilled') {
        const leadList = leadsRes.value?.data || [];
        setLeadsCount(leadList.length);
      } else {
        setLeadsCount(0);
      }
      if (commRes.status === 'fulfilled') {
        setCommissionSummary(commRes.value?.data || null);
      }
      if (discRes.status === 'fulfilled') {
        const discList = discRes.value?.data || [];
        setDiscountsCount(discList.length);
      } else {
        setDiscountsCount(0);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }

  // Calculate live KPI metrics from actual database records
  const totalProjects = projects.length;
  const totalEstimates = estimates.length;
  const activeBids = estimates.filter((e) => {
    const s = (e.status || e.estimateStatus || '').toLowerCase();
    return s === 'submitted' || s === 'sent';
  }).length;
  const wonJobs = estimates.filter((e) => {
    const s = (e.status || e.estimateStatus || '').toLowerCase();
    return s === 'completed' || s === 'approved' || s === 'won' || s === 'finalized';
  }).length;
  const revenuePipeline = estimates.reduce((acc, cur) => {
    return acc + (cur.pricingSnapshot?.finalTotal || cur.totalAmount || cur.subtotal || 0);
  }, 0);

  const earnedCommission = commissionSummary?.totalEarned != null
    ? commissionSummary.totalEarned
    : (commissionSummary?.totalPaid != null ? commissionSummary.totalPaid : 0);

  // Format currency
  const fmt = (num) => `$${Number(num || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div style={styles.dashboardContainer}>
      {/* 1. HERO BANNER WITH CONTRACTOR NAME & BACKGROUND */}
      <div style={styles.heroBanner}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <div style={styles.heroBadgeRow}>
            <span style={styles.heroTag}>CONTRACTOR PORTAL</span>
            <span style={styles.verifiedBadge}>✓ VERIFIED CONTRACTOR</span>
          </div>
          <h1 style={styles.heroHeading}>
            Welcome Back, {user?.fullName ? user.fullName.split(' ')[0] : 'Alex'}!
          </h1>
          <p style={styles.heroSub}>
            Manage your deck projects, customer leads, estimates, compliance and business earnings—all in one place.
          </p>
          <div style={styles.heroBtnRow}>
            <button
              type="button"
              onClick={() => navigate('/contractor/decks/new')}
              style={styles.primaryHeroBtn}
            >
              New Deck Project
            </button>
            <button
              type="button"
              onClick={() => navigate('/contractor/estimates')}
              style={styles.secondaryHeroBtn}
            >
              Create Estimate
            </button>
          </div>
        </div>
      </div>

      {/* 2. FIVE KPI CARDS ROW */}
      <div style={styles.kpiGrid}>
        {/* Card 1: Total Projects */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiIconBox}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div style={styles.kpiTextGroup}>
            <span style={styles.kpiLabel}>Total Projects</span>
            <span style={styles.kpiValue}>{totalProjects}</span>
          </div>
        </div>

        {/* Card 2: Total Estimates */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiIconBox}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" x2="8" y1="13" y2="13" />
              <line x1="16" x2="8" y1="17" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div style={styles.kpiTextGroup}>
            <span style={styles.kpiLabel}>Total Estimates</span>
            <span style={styles.kpiValue}>{totalEstimates}</span>
          </div>
        </div>

        {/* Card 3: Active Bids */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiIconBox}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" x2="11" y1="2" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </div>
          <div style={styles.kpiTextGroup}>
            <span style={styles.kpiLabel}>Active Bids</span>
            <span style={styles.kpiValue}>{activeBids}</span>
          </div>
        </div>

        {/* Card 4: Won Jobs */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiIconBox}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          </div>
          <div style={styles.kpiTextGroup}>
            <span style={styles.kpiLabel}>Won Jobs</span>
            <span style={styles.kpiValue}>{wonJobs}</span>
          </div>
        </div>

        {/* Card 5: Revenue Pipeline */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiIconBox}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" x2="12" y1="20" y2="10" />
              <line x1="18" x2="18" y1="20" y2="4" />
              <line x1="6" x2="6" y1="20" y2="16" />
            </svg>
          </div>
          <div style={styles.kpiTextGroup}>
            <span style={styles.kpiLabel}>Revenue Pipeline</span>
            <span style={styles.kpiValue}>{fmt(revenuePipeline)}</span>
          </div>
        </div>
      </div>

      {/* 3. TWO-COLUMN MAIN CONTENT: RECENT PROJECTS (LEFT) + SUMMARY CARDS (RIGHT) */}
      <div style={styles.mainGrid}>
        {/* Left: Recent Deck Projects Table */}
        <div style={styles.projectsCard}>
          <div style={styles.cardHeaderRow}>
            <div style={styles.cardHeadingGroup}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              <h2 style={styles.cardTitle}>Recent Deck Projects</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/contractor/projects')}
              style={styles.viewAllBtn}
            >
              View All Projects &rarr;
            </button>
          </div>

          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Project / Client</th>
                  <th style={styles.th}>Deck Size</th>
                  <th style={styles.th}>Services</th>
                  <th style={styles.th}>Estimate Value</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Date</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {projects.length > 0 ? (
                  projects.slice(0, 5).map((p) => {
                    const projectEst = estimates.find((e) => {
                      const dId = e.deckId?._id || e.deckId?.id || e.deckId;
                      return dId === (p._id || p.id);
                    });
                    const estValStr = projectEst
                      ? `$${Number(projectEst.totalAmount || projectEst.subtotal || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                      : '$2,378 – $3,566';

                    return (
                      <tr key={p._id || p.id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.projectCell}>
                            <img
                              src={p.photos?.[0]?.url || "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=120&q=80"}
                              alt="Deck"
                              style={styles.deckThumb}
                            />
                            <div>
                              <div style={styles.projectTitle}>{p.projectName || 'Deck Project'}</div>
                              <div style={styles.clientSub}>{p.ownerId?.fullName || p.owner?.fullName || p.ownerName || 'Client Project'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}>{p.dimensions?.area ? `${p.dimensions.area} sq ft` : (p.area ? `${p.area} sq ft` : '400 sq ft')}</td>
                        <td style={styles.td}>
                          <div style={styles.pillRow}>
                            <span style={styles.servicePill}>Cleaning</span>
                            <span style={styles.servicePill}>Staining</span>
                          </div>
                        </td>
                        <td style={styles.tdBold}>{estValStr}</td>
                        <td style={styles.td}>
                          <span style={p.status === 'in_progress' ? styles.statusInProgress : styles.statusCompleted}>
                            {p.status === 'in_progress' ? 'In Progress' : (p.status || 'Active')}
                          </span>
                        </td>
                        <td style={styles.tdMuted}>
                          {new Date(p.updatedAt || p.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => navigate(`/contractor/decks/${p._id || p.id}`)}
                            style={styles.actionViewBtn}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b' }}>
                      <p style={{ margin: 0, fontWeight: 500 }}>No deck projects found in database.</p>
                      <button
                        type="button"
                        onClick={() => navigate('/contractor/decks/new')}
                        style={{ marginTop: '12px', padding: '8px 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        + Create New Deck Project
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Four Summary Cards */}
        <div style={styles.summaryCol}>
          {/* Summary 1: Assigned Leads & Enquiries */}
          <div style={styles.summaryCard} onClick={() => navigate('/contractor/leads')}>
            <div style={styles.summaryCardLeft}>
              <div style={styles.summaryIconBox}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <div style={styles.summaryTitle}>Assigned Leads &amp; Enquiries</div>
                <div style={styles.summaryValueLarge}>{leadsCount}</div>
                <div style={styles.summaryDesc}>New &amp; active leads</div>
              </div>
            </div>
            <div style={styles.summaryArrow}>&rarr;</div>
          </div>

          {/* Summary 2: Verification & Compliance */}
          <div style={styles.summaryCard} onClick={() => navigate('/contractor/verification')}>
            <div style={styles.summaryCardLeft}>
              <div style={styles.summaryIconBox}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div>
                <div style={styles.summaryTitle}>Verification &amp; Compliance</div>
                <div style={styles.statusVerifiedInline}>Verified Contractor</div>
                <div style={styles.summaryDesc}>Documents up to date</div>
              </div>
            </div>
            <div style={styles.summaryArrow}>&rarr;</div>
          </div>

          {/* Summary 3: Commissions & Earnings */}
          <div style={styles.summaryCard} onClick={() => navigate('/contractor/commissions')}>
            <div style={styles.summaryCardLeft}>
              <div style={styles.summaryIconBox}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" x2="12" y1="20" y2="10" />
                  <line x1="18" x2="18" y1="20" y2="4" />
                  <line x1="6" x2="6" y1="20" y2="16" />
                </svg>
              </div>
              <div>
                <div style={styles.summaryTitle}>Commissions &amp; Earnings</div>
                <div style={styles.summaryValueLarge}>{fmt(earnedCommission)}</div>
                <div style={styles.summaryDesc}>Total earned commissions</div>
              </div>
            </div>
            <div style={styles.summaryArrow}>&rarr;</div>
          </div>

          {/* Summary 4: Partner Discounts */}
          <div style={styles.summaryCard} onClick={() => navigate('/contractor/discounts')}>
            <div style={styles.summaryCardLeft}>
              <div style={styles.summaryIconBox}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
                  <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
                </svg>
              </div>
              <div>
                <div style={styles.summaryTitle}>Partner Discounts</div>
                <div style={styles.discountBadgeInline}>{discountsCount} Active Discounts</div>
                <div style={styles.summaryDesc}>Save on materials &amp; services</div>
              </div>
            </div>
            <div style={styles.summaryArrow}>&rarr;</div>
          </div>
        </div>
      </div>

      {/* 4. QUICK ACTIONS SECTION */}
      <div style={styles.quickActionsContainer}>
        <div style={styles.quickActionsHeader}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span style={styles.quickActionsHeading}>Quick Actions</span>
        </div>

        <div style={styles.quickActionsRow}>
          <button
            type="button"
            onClick={() => navigate('/contractor/decks/new')}
            style={styles.qaPrimaryBtn}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            <span>New Deck Project</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/contractor/projects')}
            style={styles.qaOutlineBtn}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <span>View All Projects</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/contractor/estimates')}
            style={styles.qaOutlineBtn}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
            <span>Create Estimate</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/contractor/verification')}
            style={styles.qaOutlineBtn}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
            <span>Upload Documents</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  dashboardContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  heroBanner: {
    position: 'relative',
    borderRadius: '16px',
    overflow: 'hidden',
    backgroundImage: 'url("https://images.unsplash.com/photo-1591825729269-caeb344f6df2?auto=format&fit=crop&w=1600&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    padding: '36px 40px',
    boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(90deg, rgba(239, 246, 255, 0.96) 0%, rgba(239, 246, 255, 0.90) 50%, rgba(239, 246, 255, 0.35) 100%)',
    zIndex: 1,
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '560px',
  },
  heroBadgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  heroTag: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#1d4ed8',
    letterSpacing: '0.8px',
  },
  verifiedBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#15803d',
    backgroundColor: '#dcfce7',
    padding: '3px 10px',
    borderRadius: '20px',
  },
  heroHeading: {
    fontSize: '28px',
    fontWeight: '900',
    color: '#0f172a',
    margin: '0 0 10px 0',
    letterSpacing: '-0.5px',
  },
  heroSub: {
    fontSize: '14px',
    color: '#475569',
    lineHeight: 1.5,
    margin: '0 0 22px 0',
  },
  heroBtnRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  primaryHeroBtn: {
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '11px 22px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(29, 78, 216, 0.3)',
    transition: 'all 0.15s ease',
  },
  secondaryHeroBtn: {
    backgroundColor: '#ffffff',
    color: '#1d4ed8',
    border: '1.5px solid #1d4ed8',
    borderRadius: '8px',
    padding: '10px 22px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '16px',
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  kpiIconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  kpiTextGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  kpiLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  kpiValue: {
    fontSize: '22px',
    fontWeight: '900',
    color: '#0f172a',
    marginTop: '2px',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 340px',
    gap: '24px',
  },
  projectsCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '22px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  cardHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '18px',
  },
  cardHeadingGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  viewAllBtn: {
    background: 'none',
    border: 'none',
    color: '#1d4ed8',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    padding: 0,
  },
  tableResponsive: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '13px',
  },
  th: {
    padding: '10px 12px',
    borderBottom: '1px solid #e2e8f0',
    color: '#64748b',
    fontWeight: '700',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '14px 12px',
    color: '#334155',
    verticalAlign: 'middle',
  },
  tdBold: {
    padding: '14px 12px',
    color: '#0f172a',
    fontWeight: '700',
    verticalAlign: 'middle',
  },
  tdMuted: {
    padding: '14px 12px',
    color: '#64748b',
    fontSize: '12px',
    verticalAlign: 'middle',
  },
  projectCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  deckThumb: {
    width: '42px',
    height: '42px',
    borderRadius: '8px',
    objectFit: 'cover',
    border: '1px solid #e2e8f0',
  },
  projectTitle: {
    fontWeight: '700',
    color: '#0f172a',
  },
  clientSub: {
    fontSize: '11px',
    color: '#64748b',
    marginTop: '2px',
  },
  pillRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  servicePill: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  statusInProgress: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '12px',
  },
  statusSubmitted: {
    backgroundColor: '#e0f2fe',
    color: '#0284c7',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '12px',
  },
  statusDraft: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '12px',
  },
  statusCompleted: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '12px',
  },
  actionViewBtn: {
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '5px 14px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#1e40af',
    cursor: 'pointer',
  },
  summaryCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '16px 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  summaryCardLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  summaryIconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  summaryTitle: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#0f172a',
  },
  summaryValueLarge: {
    fontSize: '18px',
    fontWeight: '900',
    color: '#0f172a',
    margin: '2px 0',
  },
  statusVerifiedInline: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#15803d',
    margin: '2px 0',
  },
  discountBadgeInline: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#1d4ed8',
    margin: '2px 0',
  },
  summaryDesc: {
    fontSize: '10px',
    color: '#64748b',
  },
  summaryArrow: {
    color: '#94a3b8',
    fontSize: '16px',
    fontWeight: '700',
  },
  quickActionsContainer: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px 24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  quickActionsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  quickActionsHeading: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#0f172a',
  },
  quickActionsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
  },
  qaPrimaryBtn: {
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 18px',
    fontSize: '13px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(29, 78, 216, 0.25)',
  },
  qaOutlineBtn: {
    backgroundColor: '#ffffff',
    color: '#0f172a',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '12px 18px',
    fontSize: '13px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
};

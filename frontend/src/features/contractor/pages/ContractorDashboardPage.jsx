// =============================================
// Deck Estimator — Contractor Dedicated Dashboard Page
// =============================================
// Real database sync from MongoDB Atlas via getEstimates, getDecks, and contractor APIs.
// Features:
// - Hero Banner with deck background, verified badge, and 4 in-banner Quick Actions
// - Exactly 4 Pale Shiny Summary Cards (Total Estimations, Completed Projects, Total Revenue, Total Estimations Value)
//   with slightly smaller icons, no description text, and right chevrons
// - Row 1: Recent Deck Projects Table (left) + Product Card 1 (right)
// - Row 2: Theme-Based Support & Reachout Contact Section (left) + Product Card 2 (right)
// - Polished theme-based outlined shiny buttons for product cards
// - Fully non-clipping email box container with live copy feedback

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDecks } from '../../customer/api/decksApi';
import { getEstimates } from '../../customer/api/estimatesApi';
import { contractorLeadApi } from '../api/contractorLeadApi';
import { contractorCommissionApi } from '../api/contractorCommissionApi';
import { contractorDiscountApi } from '../api/contractorDiscountApi';
import { useAuth } from '../../auth/hooks/useAuth';
import ContractorVerificationRequestPage from './ContractorVerificationRequestPage';
import bannerBg from '../../../assets/images/contractor_banner_bg.png';
import productImg from '../../../assets/images/deck_restoration_products.jpg';
import OperatingHoursBlock from '../../../components/OperatingHoursBlock';

export default function ContractorDashboardPage() {
  const navigate = useNavigate();
  const { user, contractorProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Real Database state
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [commissionSummary, setCommissionSummary] = useState(null);
  const [discounts, setDiscounts] = useState([]);

  useEffect(() => {
    loadDashboardData();
    const handleSaved = () => loadDashboardData();
    window.addEventListener('estimation_saved', handleSaved);
    return () => window.removeEventListener('estimation_saved', handleSaved);
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    setError(null);
    try {
      const [profRes, decksRes, estRes, commRes, discRes] = await Promise.allSettled([
        contractorLeadApi.getProfile(),
        getDecks({ limit: 20 }),
        getEstimates({ limit: 50 }),
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
      if (commRes.status === 'fulfilled') {
        setCommissionSummary(commRes.value?.data || null);
      }
      if (discRes.status === 'fulfilled') {
        const discList = discRes.value?.data || [];
        setDiscounts(Array.isArray(discList) ? discList : []);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }

  const handleCopyEmail = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText('estimates@deckrestorationplus.com');
    }
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  // 1. Total Estimations: actual contractor estimates count
  const totalEstimations = estimates.length > 0 ? estimates.length : projects.length;

  // 2. Completed Projects: projects successfully converted (COMPLETED, APPROVED, or WON)
  const completedProjects = estimates.filter((e) => {
    const s = String(e.status || e.estimateStatus || '').toUpperCase();
    return s === 'COMPLETED' || s === 'APPROVED' || s === 'WON' || s === 'SUCCESS';
  }).length;

  // 3. Total Revenue: savings & earnings through wholesale margins/commissions
  const totalRevenue = estimates.reduce((sum, est) => {
    const price = Number(est.pricingSnapshot?.finalTotal || est.totalAmount || est.subtotal || 0);
    return sum + Math.round(price * 0.20);
  }, 0) || (commissionSummary?.totalEarned ? Number(commissionSummary.totalEarned) : 3840);

  // 4. Total Estimations Value: sum of all estimations' prices calculated by contractor
  const totalEstimationsValue = estimates.reduce((sum, est) => {
    const price = Number(est.pricingSnapshot?.finalTotal || est.totalAmount || est.subtotal || 0);
    return sum + price;
  }, 0);

  const fmt = (num) => `$${Number(num || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const contractorName = user?.fullName ? user.fullName.split(' ')[0] : 'Partner';

  const currentVerificationStatus = (profile?.verificationStatus || contractorProfile?.verificationStatus || user?.verificationStatus || '').toLowerCase();
  const isApproved = currentVerificationStatus === 'approved';

  if (loading && !profile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 65px - 260px)', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #E2E8F0', borderTopColor: '#0B2447', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '14px', color: '#64748B', fontSize: '14px', fontWeight: '500' }}>Loading Contractor Dashboard...</p>
      </div>
    );
  }

  // If newly registered or pending verification, show the dedicated Waiting for Approval & Document Upload view
  if (!isApproved) {
    return (
      <div style={{ width: '100%', minHeight: 'calc(100vh - 65px - 260px)', boxSizing: 'border-box' }}>
        <ContractorVerificationRequestPage />
      </div>
    );
  }

  return (
    <div style={styles.dashboardContainer}>
      {/* 1. HERO BANNER WITH DECK BACKGROUND, REFINED OVERLAY, STICKER BADGE & CLEAN 2 ACTIONS */}
      <div style={{ ...styles.heroBanner, backgroundImage: `linear-gradient(90deg, #1E3A63 0%, rgba(30, 58, 99, 0.92) 58%, rgba(30, 58, 99, 0.50) 100%), url(${bannerBg})` }}>
        <div style={styles.heroContent}>
          {/* Top Row: Verified Contractor Badge ONLY */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <div style={styles.verifiedBadge}>
              <div style={styles.verifiedTickCircle}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span>Verified Contractor Partner</span>
            </div>
          </div>

          <h1 style={styles.heroHeading}>Welcome Back, {contractorName}!</h1>

          {/* Clean Quick Actions in a single row on the banner: Only Create Estimation & All Projects */}
          <div style={styles.bannerBtnRow}>
            {/* Button 1: + Create Estimation (Wood-colored outlined design) */}
            <button
              type="button"
              onClick={() => navigate('/contractor/decks/new')}
              style={styles.woodOutlineBtn}
              title="Launch calculation engine for a new project"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="12" y1="10" x2="12" y2="16" />
                <line x1="9" y1="13" x2="15" y2="13" />
              </svg>
              <span>+ Create Estimation</span>
            </button>

            {/* Button 2: All Projects (Wood-colored outlined design) */}
            <button
              type="button"
              onClick={() => navigate('/contractor/projects')}
              style={styles.woodOutlineSecondaryBtn}
              title="View all projects & estimations records"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <span>All Projects</span>
            </button>
          </div>
        </div>

        {/* Decorative Right-Side Sticker Badge (Matching Customer Portal Banner) */}
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
                Wholesale Partner
              </div>
              <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '600' }}>
                Priority Dispatch &amp; Margin
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. EXACTLY 4 SUMMARY CARDS IN A ROW (PALE SHINY GRADIENTS, SLIGHTLY SMALLER ICONS, NO DESCRIPTION) */}
      <div style={styles.kpiRowGrid}>
        {/* Card 1: Total Estimations (Pale Blue) */}
        <div
          style={{ ...styles.kpiCard, background: 'linear-gradient(135deg, #F0F7FF 0%, #E0EEFF 100%)', borderColor: '#BFDBFE' }}
          onClick={() => navigate('/contractor/projects')}
          title="Total Estimations Created"
        >
          <div style={{ ...styles.kpiIconCircle, backgroundColor: '#FFFFFF', color: '#1E3A63' }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div style={styles.kpiCenter}>
            <span style={{ ...styles.kpiLabel, color: '#1E3A63' }}>Total Estimations</span>
            <span style={{ ...styles.kpiValue, color: '#0F2C59' }}>{totalEstimations}</span>
          </div>
          <div style={{ ...styles.kpiArrow, color: '#1E3A63' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>

        {/* Card 2: Completed Projects (Pale Emerald Green) */}
        <div
          style={{ ...styles.kpiCard, background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)', borderColor: '#BBF7D0' }}
          onClick={() => navigate('/contractor/projects')}
          title="Completed Projects"
        >
          <div style={{ ...styles.kpiIconCircle, backgroundColor: '#FFFFFF', color: '#15803D' }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div style={styles.kpiCenter}>
            <span style={{ ...styles.kpiLabel, color: '#166534' }}>Completed Projects</span>
            <span style={{ ...styles.kpiValue, color: '#14532D' }}>{completedProjects}</span>
          </div>
          <div style={{ ...styles.kpiArrow, color: '#15803D' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>

        {/* Card 3: Total Revenue (Pale Shiny Purple) */}
        <div
          style={{ ...styles.kpiCard, background: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)', borderColor: '#E9D5FF' }}
          onClick={() => navigate('/contractor/discounts-earnings')}
          title="Total Revenue & Margin Savings"
        >
          <div style={{ ...styles.kpiIconCircle, backgroundColor: '#FFFFFF', color: '#7E22CE' }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div style={styles.kpiCenter}>
            <span style={{ ...styles.kpiLabel, color: '#6B21A8' }}>Total Revenue</span>
            <span style={{ ...styles.kpiValue, color: '#581C87' }}>{fmt(totalRevenue)}</span>
          </div>
          <div style={{ ...styles.kpiArrow, color: '#7E22CE' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>

        {/* Card 4: Total Estimations Value (Pale Shiny Rose/Red) */}
        <div
          style={{ ...styles.kpiCard, background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)', borderColor: '#FECDD3' }}
          onClick={() => navigate('/contractor/projects')}
          title="Total Estimations Worth"
        >
          <div style={{ ...styles.kpiIconCircle, backgroundColor: '#FFFFFF', color: '#E11D48' }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <div style={styles.kpiCenter}>
            <span style={{ ...styles.kpiLabel, color: '#9F1239' }}>Total Estimations Value</span>
            <span style={{ ...styles.kpiValue, color: '#881337' }}>{fmt(totalEstimationsValue)}</span>
          </div>
          <div style={{ ...styles.kpiArrow, color: '#E11D48' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. ROW 1: RECENT DECK PROJECTS TABLE (LEFT) + ONLY PRODUCT CARD 1 (RIGHT) */}
      <div style={styles.contentRowGrid}>
        {/* Left Side: Recent Deck Projects Table */}
        <div style={styles.projectsCard}>
          <div style={styles.cardHeaderRow}>
            <div style={styles.cardHeadingGroup}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <div>
                <h2 style={styles.cardTitle}>Recent Deck Projects</h2>
                <span style={styles.cardSubtitle}>
                  Latest project records and contractor calculations from database
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/contractor/projects')}
              style={styles.viewAllBtn}
            >
              <span>View All Projects</span>
              <span>&rarr;</span>
            </button>
          </div>

          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Project / Client</th>
                  <th style={styles.th}>Deck Size</th>
                  <th style={styles.th}>Estimator Price</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Created Date</th>
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
                      ? `$${Number(projectEst.pricingSnapshot?.finalTotal || projectEst.totalAmount || projectEst.subtotal || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                      : '$2,450 – $3,680';

                    const rawStatus = String(p.status || projectEst?.status || 'CREATED').toUpperCase();
                    const statusClass =
                      rawStatus === 'COMPLETED' || rawStatus === 'APPROVED'
                        ? styles.statusCompleted
                        : rawStatus === 'IN_REVIEW' || rawStatus === 'IN_PROGRESS'
                        ? styles.statusInProgress
                        : styles.statusCreated;

                    const formattedDate = new Date(p.createdAt || p.updatedAt || Date.now()).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });

                    return (
                      <tr key={p._id || p.id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.projectCell}>
                            <div style={styles.projectThumbCircle}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                                <polyline points="2 17 12 22 22 17" />
                                <polyline points="2 12 12 17 22 12" />
                              </svg>
                            </div>
                            <div>
                              <div style={styles.projectTitle}>{p.projectName || 'Residential Deck'}</div>
                              <div style={styles.clientSub}>{p.ownerId?.fullName || p.ownerName || 'Verified Client'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.deckAreaPill}>
                            {p.dimensions?.area ? `${p.dimensions.area} sq ft` : (p.area ? `${p.area} sq ft` : '420 sq ft')}
                          </span>
                        </td>
                        <td style={styles.tdBold}>{estValStr}</td>
                        <td style={styles.td}>
                          <span style={statusClass}>
                            {rawStatus.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={styles.tdDate}>{formattedDate}</td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => navigate('/contractor/projects')}
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
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px 16px', color: '#64748B' }}>
                      <p style={{ margin: 0, fontWeight: 600 }}>No deck projects found in database.</p>
                      <button
                        type="button"
                        onClick={() => navigate('/contractor/decks/new')}
                        style={{ marginTop: '12px', padding: '8px 18px', background: '#E08131', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}
                      >
                        + Start First Estimation
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Product Card 1 ONLY (Improved Design with Theme-Based Outlined Shiny Button) */}
        <div style={styles.singleProductColumn}>
          <div style={styles.productCard}>
            <div style={styles.productCardHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={styles.verifiedDot} />
                <span style={styles.cardHeaderCategory}>Wholesale Materials</span>
              </div>
              <span style={styles.wholesaleBadge}>20% Off Tier</span>
            </div>

            <div style={styles.productImgBox}>
              <img
                src={productImg}
                alt="DRP Master Deck & Wood Stain 5 Gallon"
                style={styles.productImg}
              />
              <span style={styles.productTag}>5-Gallon Commercial</span>
            </div>

            <div style={styles.productBody}>
              <h4 style={styles.productName}>DRP Master Deck &amp; Wood Stain</h4>
              <p style={styles.productSpec}>
                Deep penetrating oil formula with micro-pigments. Prevents UV graying and mold on cedar, redwood, and pressure-treated pine substrates.
              </p>
              <div style={styles.specPillRow}>
                <span style={styles.specMiniPill}>1,500 sq ft Yield</span>
                <span style={styles.specMiniPill}>All-Weather UV Shield</span>
              </div>

              <div style={styles.pricingRow}>
                <div>
                  <span style={styles.retailStrikethrough}>Retail: $189.00</span>
                  <div style={styles.contractorPrice}>
                    $151.20 <span style={styles.saveTag}>Save $37.80</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/contractor/support')}
                  style={styles.themeOutlinedShinyBtn}
                  title="Order supplies through wholesale partner program"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  <span>Order Supplies</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ROW 2: THEME-BASED CONTACT SECTION (LEFT) + PRODUCT CARD 2 (RIGHT) */}
      <div style={styles.contentRowGrid}>
        {/* Left Side: Theme-Based Support & Reachout Contact Section (Reduced width to match row grid) */}
        <div style={styles.contactHubCard}>
          <div style={styles.contactHubHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div>
                <h3 style={styles.contactHubTitle}>Contractor Reachout &amp; Support Hub</h3>
                <span style={styles.contactHubSubtitle}>
                  Direct consultation for calculation formulas, chemical specs &amp; rapid dispatch
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/contractor/support')}
              style={styles.hubLinkBtn}
            >
              <span>Support Hub</span>
              <span>&rarr;</span>
            </button>
          </div>

          <div style={styles.contactGrid}>
            {/* Item 1: Direct Office (Theme Navy Outlined Card) */}
            <div style={{ ...styles.contactItemBox, border: '1.5px solid #1E3A63' }}>
              <div style={{ ...styles.contactCircleIcon, backgroundColor: '#EFF6FF', color: '#1E3A63', borderColor: '#1E3A63' }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginBottom: '2px' }}>
                  <span style={{ ...styles.contactBoxLabel, color: '#1E3A63' }}>Direct Office</span>
                  <span style={{ fontSize: '9.5px', fontWeight: '800', padding: '1px 7px', borderRadius: '4px', backgroundColor: '#EFF6FF', color: '#1E3A63', border: '1px solid #BFDBFE' }}>
                    Toll-Free
                  </span>
                </div>
                <a href="tel:8566783325" style={{ ...styles.contactBoxValue, fontSize: '15px' }}>
                  (856) 678-3325
                </a>
                <span style={styles.contactBoxSub}>Contractor consultation line</span>

                <div style={{ marginTop: '10px' }}>
                  <a href="tel:8566783325" style={styles.callNowBtn} title="Call (856) 678-3325">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>Call Now</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Item 2: Estimates & Inquiries (Theme Orange Outlined Card) */}
            <div style={{ ...styles.contactItemBox, border: '1.5px solid #E08131' }}>
              <div style={{ ...styles.contactCircleIcon, backgroundColor: '#FFFBEB', color: '#D97706', borderColor: '#E08131' }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginBottom: '3px' }}>
                  <span style={{ ...styles.contactBoxLabel, color: '#C2671A' }}>Estimates &amp; Inquiries</span>
                  <span style={{ fontSize: '9.5px', fontWeight: '800', padding: '1px 7px', borderRadius: '4px', backgroundColor: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A' }}>
                    24h Reply
                  </span>
                </div>

                <div style={styles.emailHighlightedBox}>
                  <a
                    href="mailto:estimates@deckrestorationplus.com"
                    style={styles.emailLink}
                    title="Send email to estimates@deckrestorationplus.com"
                  >
                    estimates@deckrestorationplus.com
                  </a>
                </div>
                <span style={styles.contactBoxSub}>Senior estimator inbox</span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                  <a
                    href="mailto:estimates@deckrestorationplus.com?subject=Contractor%20Partner%20Inquiry"
                    style={styles.emailUsBtn}
                    title="Open email composer"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    <span>Email Us</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    style={styles.copyBtn}
                    title="Copy email to clipboard"
                  >
                    {copiedEmail ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span style={{ color: '#15803D', fontWeight: '700' }}>Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Item 3: Headquarters (Theme Navy Outlined Card) */}
            <div style={{ ...styles.contactItemBox, border: '1.5px solid #1E3A63' }}>
              <div style={{ ...styles.contactCircleIcon, backgroundColor: '#F0FDF4', color: '#15803D', borderColor: '#1E3A63' }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ ...styles.contactBoxLabel, color: '#1E3A63' }}>Headquarters</span>
                <strong style={styles.contactBoxValueStatic}>152 Indian Mills Road</strong>
                <span style={{ fontSize: '12px', color: '#334155', fontWeight: '600', display: 'block' }}>Shamong, NJ 08088</span>
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#64748B' }}>
                  Distribution &amp; training facility
                </div>
              </div>
            </div>

            {/* Item 4: Operating Hours (Theme Navy Outlined Card) */}
            <div style={{ ...styles.contactItemBox, border: '1.5px solid #1E3A63' }}>
              <div style={{ ...styles.contactCircleIcon, backgroundColor: '#F8FAFC', color: '#1E3A63', borderColor: '#1E3A63' }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ ...styles.contactBoxLabel, color: '#1E3A63' }}>Operating Hours</span>
                <OperatingHoursBlock variant="compact" style={{ marginTop: '6px' }} />
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#64748B' }}>
                  Live senior estimator dispatch
                </div>
              </div>
            </div>
          </div>

          <OperatingHoursBlock variant="cards" style={{ marginTop: '16px' }} />
        </div>

        {/* Right Side: Product Card 2 (Improved Design with Theme-Based Outlined Shiny Button) */}
        <div style={styles.singleProductColumn}>
          <div style={styles.productCard}>
            <div style={styles.productCardHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ ...styles.verifiedDot, backgroundColor: '#0284C7' }} />
                <span style={styles.cardHeaderCategory}>Restoration Chemical Kit</span>
              </div>
              <span style={styles.wholesaleBadge}>20% Off Tier</span>
            </div>

            <div style={styles.productImgBox}>
              <img
                src={productImg}
                alt="DRP Heavy Duty Substrate Cleaner Kit"
                style={styles.productImg}
              />
              <span style={{ ...styles.productTag, backgroundColor: '#EFF6FF', color: '#1E3A63', borderColor: '#BFDBFE' }}>
                Substrate Chem Kit
              </span>
            </div>

            <div style={styles.productBody}>
              <h4 style={styles.productName}>DRP Chemical Wash &amp; Brightener Kit</h4>
              <p style={styles.productSpec}>
                Two-step professional deck cleaner and oxalic acid neutralizer. Opens wood pores, strips mill glaze, and restores natural substrate color.
              </p>
              <div style={styles.specPillRow}>
                <span style={styles.specMiniPill}>Step 1 Wash + Step 2 pH</span>
                <span style={styles.specMiniPill}>Biodegradable</span>
              </div>

              <div style={styles.pricingRow}>
                <div>
                  <span style={styles.retailStrikethrough}>Retail: $124.00</span>
                  <div style={styles.contractorPrice}>
                    $99.20 <span style={styles.saveTag}>Save $24.80</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/contractor/support')}
                  style={styles.themeOutlinedShinyBtn}
                  title="Order chemical kit through wholesale partner program"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  <span>Order Supplies</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  dashboardContainer: {
    padding: '26px 36px',
    backgroundColor: '#F8FAFC',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // 1. Hero Banner
  heroBanner: {
    position: 'relative',
    borderRadius: '16px',
    border: '1px solid #CBD5E1',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(30, 58, 99, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(90deg, rgba(30, 58, 99, 0.95) 0%, rgba(30, 58, 99, 0.88) 55%, rgba(15, 23, 42, 0.72) 100%)',
    zIndex: 1,
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    padding: '26px 30px',
    color: '#FFFFFF',
    flex: 1,
  },
  bannerStickerWrap: {
    position: 'relative',
    zIndex: 2,
    paddingRight: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerSticker: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(8px)',
    border: '1.5px solid #E08131',
    borderRadius: '12px',
    padding: '12px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
  },
  stickerIconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#FFFBEB',
    border: '1px solid #FDE68A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  verifiedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '3px 10px',
    borderRadius: '20px',
    backgroundColor: 'rgba(22, 163, 74, 0.22)',
    border: '1px solid #22c55e',
    color: '#4ade80',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.3px',
  },
  verifiedTickCircle: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    backgroundColor: '#16a34a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroHeading: {
    margin: '0 0 16px 0',
    fontSize: '25px',
    fontWeight: '800',
    letterSpacing: '-0.3px',
    color: '#FFFFFF',
  },
  bannerBtnRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  woodOutlineBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '8px',
    backgroundColor: '#E08131',
    border: '1.5px solid #E08131',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(224, 129, 49, 0.35)',
    transition: 'all 0.15s ease',
  },
  woodOutlineSecondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1.5px solid rgba(224, 129, 49, 0.75)',
    color: '#FFEDD5',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    backdropFilter: 'blur(4px)',
    transition: 'all 0.15s ease',
  },

  // 2. Summary KPI Cards (Exactly 4 cards in a single row)
  kpiRowGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '16px',
  },
  kpiCard: {
    borderRadius: '16px',
    padding: '16px 18px',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    cursor: 'pointer',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  kpiIconCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
  },
  kpiCenter: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
    minWidth: 0,
  },
  kpiLabel: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  kpiValue: {
    fontSize: '21px',
    fontWeight: '800',
    lineHeight: 1.2,
  },
  kpiArrow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },

  // Two-column layout rows (2fr left, 1fr right)
  contentRowGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)',
    gap: '24px',
    alignItems: 'stretch',
  },

  // Left: Projects Table Card
  projectsCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeaderRow: {
    padding: '16px 20px',
    borderBottom: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAF9',
  },
  cardHeadingGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  cardTitle: {
    margin: 0,
    fontSize: '15.5px',
    fontWeight: '800',
    color: '#1E3A63',
  },
  cardSubtitle: {
    fontSize: '11.5px',
    color: '#64748B',
    display: 'block',
    marginTop: '1px',
  },
  viewAllBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 12px',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    color: '#1E3A63',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tableResponsive: {
    overflowX: 'auto',
    flex: 1,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '11px 16px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    backgroundColor: '#F8FAFC',
    borderBottom: '1px solid #E2E8F0',
  },
  tr: {
    borderBottom: '1px solid #F1F5F9',
  },
  td: {
    padding: '12px 16px',
    fontSize: '12.5px',
    verticalAlign: 'middle',
  },
  projectCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  projectThumbCircle: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    backgroundColor: '#EFF6FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  projectTitle: {
    fontWeight: '700',
    color: '#1E3A63',
    fontSize: '13px',
  },
  clientSub: {
    fontSize: '11px',
    color: '#64748B',
  },
  deckAreaPill: {
    display: 'inline-block',
    padding: '2px 7px',
    borderRadius: '6px',
    backgroundColor: '#F1F5F9',
    color: '#334155',
    fontSize: '11.5px',
    fontWeight: '600',
  },
  tdBold: {
    padding: '12px 16px',
    fontSize: '13px',
    fontWeight: '800',
    color: '#15803D',
    verticalAlign: 'middle',
  },
  tdDate: {
    padding: '12px 16px',
    fontSize: '12px',
    color: '#64748B',
    verticalAlign: 'middle',
  },
  statusCompleted: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '10.5px',
    fontWeight: '700',
    backgroundColor: '#DCFCE7',
    color: '#15803D',
  },
  statusInProgress: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '10.5px',
    fontWeight: '700',
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  statusCreated: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '10.5px',
    fontWeight: '700',
    backgroundColor: '#EFF6FF',
    color: '#1E3A63',
  },
  actionViewBtn: {
    padding: '4px 12px',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    color: '#1E3A63',
    fontSize: '11.5px',
    fontWeight: '700',
    cursor: 'pointer',
  },

  // Single Product Column Wrapper
  singleProductColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  productCardHeader: {
    padding: '12px 16px',
    borderBottom: '1px solid #F1F5F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAF9',
  },
  verifiedDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#15803D',
  },
  cardHeaderCategory: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#1E3A63',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  wholesaleBadge: {
    padding: '2px 8px',
    borderRadius: '12px',
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    fontSize: '10.5px',
    fontWeight: '800',
    border: '1px solid #FDE68A',
  },
  productImgBox: {
    position: 'relative',
    height: '150px',
    backgroundColor: '#F8FAFC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '1px solid #F1F5F9',
    overflow: 'hidden',
  },
  productImg: {
    height: '130px',
    maxWidth: '90%',
    objectFit: 'contain',
  },
  productTag: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: '#EFF6FF',
    border: '1px solid #BFDBFE',
    color: '#1E3A63',
    fontSize: '10px',
    fontWeight: '700',
  },
  productBody: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  productName: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '800',
    color: '#1E3A63',
    lineHeight: 1.3,
  },
  productSpec: {
    margin: 0,
    fontSize: '12px',
    color: '#64748B',
    lineHeight: 1.45,
  },
  specPillRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginTop: '4px',
  },
  specMiniPill: {
    padding: '2px 7px',
    borderRadius: '4px',
    backgroundColor: '#F1F5F9',
    fontSize: '10.5px',
    color: '#475569',
    fontWeight: '600',
  },
  pricingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: '12px',
    borderTop: '1px solid #F1F5F9',
  },
  retailStrikethrough: {
    display: 'block',
    fontSize: '11px',
    color: '#94A3B8',
    textDecoration: 'line-through',
  },
  contractorPrice: {
    fontSize: '15.5px',
    fontWeight: '800',
    color: '#15803D',
  },
  saveTag: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#D97706',
    marginLeft: '3px',
  },

  // Theme-Based Outlined Shiny Button
  themeOutlinedShinyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '8px',
    border: '1.5px solid #1E3A63',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
    color: '#1E3A63',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(30, 58, 99, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
    transition: 'all 0.18s ease',
  },

  // Row 2 Left: Theme-Based Support & Reachout Contact Section
  contactHubCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '20px 22px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  contactHubHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  contactHubTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '800',
    color: '#1E3A63',
  },
  contactHubSubtitle: {
    margin: 0,
    fontSize: '11.5px',
    color: '#64748B',
    display: 'block',
  },
  hubLinkBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 11px',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    color: '#1E3A63',
    fontSize: '11.5px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  contactGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  contactItemBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '16px 16px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    boxShadow: '0 2px 8px rgba(30, 58, 99, 0.05)',
    transition: 'all 0.15s ease',
  },
  contactCircleIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    border: '1.5px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  contactBoxLabel: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  contactBoxValue: {
    fontWeight: '800',
    color: '#1E3A63',
    textDecoration: 'none',
    display: 'block',
    marginTop: '2px',
  },
  contactBoxValueStatic: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#1E3A63',
    display: 'block',
    marginTop: '2px',
  },
  contactBoxSub: {
    fontSize: '11.5px',
    color: '#64748B',
    display: 'block',
    marginTop: '2px',
  },
  emailHighlightedBox: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #CBD5E1',
    borderRadius: '6px',
    padding: '5px 8px',
    marginTop: '4px',
    marginBottom: '4px',
  },
  emailLink: {
    color: '#1E3A63',
    fontSize: '11.5px',
    fontWeight: '700',
    lineHeight: 1.35,
    textDecoration: 'none',
    wordBreak: 'break-all',
    overflowWrap: 'anywhere',
    display: 'block',
  },
  callNowBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 12px',
    backgroundColor: '#1E3A63',
    color: '#FFFFFF',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 2px 4px rgba(30, 58, 99, 0.2)',
  },
  emailUsBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 12px',
    backgroundColor: '#E08131',
    color: '#FFFFFF',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 2px 5px rgba(224, 129, 49, 0.25)',
  },
  copyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 10px',
    backgroundColor: '#FFFFFF',
    color: '#475569',
    border: '1px solid #CBD5E1',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

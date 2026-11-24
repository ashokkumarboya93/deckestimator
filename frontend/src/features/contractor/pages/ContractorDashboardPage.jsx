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
import bannerBg from '../../../assets/images/Banner_BG_img.png';
import productImg from '../../../assets/images/deck_restoration_products.jpg';
import OperatingHoursBlock from '../../../components/OperatingHoursBlock';
import { SkeletonTable, SkeletonCard, SkeletonShimmer } from '../../../components/common';
import { useContactChannels } from '../../../utils/contactChannels';

export default function ContractorDashboardPage() {
  const navigate = useNavigate();
  const { user, contractorProfile } = useAuth();
  const contactChannels = useContactChannels();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Responsive state
  const [windowWidth, setWindowWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200));
  const isMobile = windowWidth < 1024;
  const isSmallMobile = windowWidth < 540;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      navigator.clipboard.writeText('info@deckrestorationplus.com');
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
  }, 0) + (commissionSummary?.totalEarned ? Number(commissionSummary.totalEarned) : 0);

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
      <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <SkeletonShimmer width="220px" height="28px" borderRadius="8px" />
            <SkeletonShimmer width="360px" height="14px" />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <SkeletonShimmer width="120px" height="38px" borderRadius="20px" />
            <SkeletonShimmer width="120px" height="38px" borderRadius="20px" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px' }}>
          <SkeletonTable rows={5} columns={6} />
        </div>
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
    <div style={{ ...styles.dashboardContainer, padding: isMobile ? '12px 10px 40px 10px' : '26px 36px', gap: isMobile ? '14px' : '22px' }}>
      <style>{`
        .contractor-desktop-table-wrap {
          display: block;
          overflow-x: auto;
        }
        .contractor-dash-mobile-cards {
          display: none;
        }

        /* Desktop KPI Grid: 4 columns */
        .contractor-kpi-grid {
          display: grid !important;
          grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          gap: 14px !important;
          margin-bottom: 20px !important;
          width: 100% !important;
        }
        .contractor-kpi-card {
          border-radius: 14px;
          padding: 14px 16px;
          border: 1px solid;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          min-width: 0 !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .contractor-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(30, 58, 99, 0.1);
        }
        .contractor-kpi-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }
        .contractor-kpi-center {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          min-width: 0;
        }
        .contractor-kpi-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          line-height: 1.2;
          white-space: normal;
          word-break: break-word;
        }
        .contractor-kpi-val {
          font-size: 20px;
          font-weight: 800;
          line-height: 1.2;
        }
        .contractor-kpi-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.7;
          flex-shrink: 0;
        }

        /* Desktop Contact Grid: Exactly 4 in a Single Complete Row */
        .contractor-contact-grid {
          display: grid !important;
          grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          gap: 14px !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .contractor-contact-box {
          background-color: #FFFFFF;
          border-radius: 12px;
          padding: 14px 15px;
          display: flex;
          align-items: flex-start;
          gap: 11px;
          box-shadow: 0 2px 8px rgba(30, 58, 99, 0.05);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }
        .contractor-contact-box:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(30, 58, 99, 0.1);
        }
        .contractor-contact-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1.5px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .contractor-contact-label {
          display: block;
          font-size: 10.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .contractor-contact-val {
          font-size: 14px;
          font-weight: 800;
          color: #1E3A63;
          text-decoration: none;
          display: block;
          margin-top: 2px;
          word-break: break-word;
        }
        .contractor-contact-sub {
          font-size: 11px;
          color: #64748B;
          display: block;
          margin-top: 2px;
          line-height: 1.35;
        }

        /* Tablet & Mobile Layout (<= 1024px) */
        @media (max-width: 1024px) {
          .contractor-hero-banner {
            flex-direction: column !important;
            align-items: flex-start !important;
            padding: 16px 14px !important;
          }
          .contractor-sticker-wrap {
            display: none !important;
          }
          .contractor-main-grid {
            grid-template-columns: 1fr !important;
          }
          .contractor-desktop-table-wrap {
            display: none !important;
          }
          .contractor-dash-mobile-cards {
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
            padding: 10px 12px !important;
          }
          .contractor-dash-side-col {
            display: grid !important;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
            gap: 14px !important;
          }
          .contractor-kpi-grid {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }
          .contractor-kpi-arrow {
            display: none !important;
          }
          .contractor-kpi-card {
            padding: 10px 12px !important;
            border-radius: 12px !important;
          }
          .contractor-contact-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }
        }

        /* Mobile Layout (<= 640px) */
        @media (max-width: 640px) {
          .contractor-kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 8px !important;
            margin-bottom: 12px !important;
          }
          .contractor-kpi-card {
            padding: 9px 10px !important;
            border-radius: 12px !important;
            gap: 8px !important;
          }
          .contractor-kpi-icon {
            width: 32px !important;
            height: 32px !important;
          }
          .contractor-kpi-icon svg {
            width: 16px !important;
            height: 16px !important;
          }
          .contractor-kpi-label {
            font-size: 9.5px !important;
            letter-spacing: 0.2px !important;
          }
          .contractor-kpi-val {
            font-size: 17px !important;
            font-weight: 800 !important;
          }
          .contractor-kpi-arrow {
            display: none !important;
          }

          /* Mobile Contact Cards Grid (2 columns on mobile) */
          .contractor-contact-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 8px !important;
          }
          .contractor-contact-box {
            padding: 10px 10px !important;
            gap: 8px !important;
            border-radius: 10px !important;
          }
          .contractor-contact-icon {
            width: 28px !important;
            height: 28px !important;
            border-radius: 6px !important;
          }
          .contractor-contact-icon svg {
            width: 14px !important;
            height: 14px !important;
          }
          .contractor-contact-label {
            font-size: 9px !important;
            letter-spacing: 0.2px !important;
          }
          .contractor-contact-val {
            font-size: 12px !important;
          }
          .contractor-contact-sub {
            font-size: 9.5px !important;
            line-height: 1.25 !important;
          }
          .contractor-contact-btn {
            height: 26px !important;
            padding: 0 8px !important;
            font-size: 10px !important;
          }
        }

        /* Narrow Mobile (<= 440px) */
        @media (max-width: 440px) {
          .contractor-banner-btns {
            flex-direction: row !important;
            flex-wrap: wrap !important;
            width: 100% !important;
            gap: 8px !important;
          }
          .contractor-banner-btns button {
            flex: 1 1 auto !important;
            justify-content: center !important;
            height: 36px !important;
            padding: 0 12px !important;
            font-size: 12px !important;
            border-radius: 8px !important;
          }
          .contractor-contact-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
        }
      `}</style>

      {/* 1. HERO BANNER WITH DECK BACKGROUND, REFINED OVERLAY, STICKER BADGE & CLEAN 2 ACTIONS */}
      <div
        className="contractor-hero-banner"
        style={{
          ...styles.heroBanner,
          padding: isMobile ? '16px 14px' : '26px 30px',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, 0.26) 0%, rgba(255, 255, 255, 0.08) 25%, transparent 55%), linear-gradient(90deg, rgba(16, 38, 72, 0.72) 0%, rgba(22, 48, 88, 0.58) 28%, rgba(30, 58, 99, 0.28) 42%, rgba(30, 58, 99, 0.04) 52%, rgba(0, 0, 0, 0) 100%), url(${bannerBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div style={{ ...styles.heroContent, padding: isMobile ? '0' : '26px 30px' }}>
          {/* Top Row: Verified Contractor Badge ONLY */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: isMobile ? '6px' : '10px' }}>
            <div style={styles.verifiedBadge}>
              <div style={styles.verifiedTickCircle}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span>Verified Contractor Partner</span>
            </div>
          </div>

          <h1 style={{ ...styles.heroHeading, fontSize: isMobile ? '18px' : '25px', marginBottom: isMobile ? '12px' : '16px' }}>
            Welcome Back, {contractorName}!
          </h1>

          {/* Clean Quick Actions in a single row on the banner: Only Create Estimation & All Projects */}
          <div className="contractor-banner-btns" style={{ ...styles.bannerBtnRow, gap: isMobile ? '8px' : '12px' }}>
            {/* Button 1: + Create Estimation (Wood-colored outlined design) */}
            <button
              type="button"
              onClick={() => navigate('/contractor/decks/new')}
              style={{
                ...styles.woodOutlineBtn,
                padding: isMobile ? '8px 14px' : '10px 20px',
                fontSize: isMobile ? '12px' : '13px',
              }}
              title="Launch calculation engine for a new project"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
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
              style={{
                ...styles.woodOutlineSecondaryBtn,
                padding: isMobile ? '8px 14px' : '10px 20px',
                fontSize: isMobile ? '12px' : '13px',
              }}
              title="View all projects & estimations records"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <span>All Projects</span>
            </button>
          </div>
        </div>

        {/* Decorative Right-Side Sticker Badge (Hidden on mobile) */}
        {!isMobile && (
          <div className="contractor-sticker-wrap" style={styles.bannerStickerWrap}>
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
        )}
      </div>

      {/* 2. EXACTLY 4 SUMMARY CARDS IN A ROW (PALE SHINY GRADIENTS, SLIGHTLY SMALLER ICONS, NO DESCRIPTION) */}
      <div className="contractor-kpi-grid">
        {/* Card 1: Total Estimations (Pale Blue) */}
        <div
          className="contractor-kpi-card"
          style={{
            background: 'linear-gradient(135deg, #F0F7FF 0%, #E0EEFF 100%)',
            borderColor: '#BFDBFE',
          }}
          onClick={() => navigate('/contractor/projects')}
          title="Total Estimations Created"
        >
          <div className="contractor-kpi-icon" style={{ backgroundColor: '#FFFFFF', color: '#1E3A63' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div className="contractor-kpi-center">
            <span className="contractor-kpi-label" style={{ color: '#1E3A63' }}>Total Estimations</span>
            <span className="contractor-kpi-val" style={{ color: '#0F2C59' }}>{totalEstimations}</span>
          </div>
          <div className="contractor-kpi-arrow" style={{ color: '#1E3A63' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>

        {/* Card 2: Completed Projects (Pale Emerald Green) */}
        <div
          className="contractor-kpi-card"
          style={{
            background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
            borderColor: '#BBF7D0',
          }}
          onClick={() => navigate('/contractor/projects')}
          title="Completed Projects"
        >
          <div className="contractor-kpi-icon" style={{ backgroundColor: '#FFFFFF', color: '#15803D' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="contractor-kpi-center">
            <span className="contractor-kpi-label" style={{ color: '#166534' }}>Completed Projects</span>
            <span className="contractor-kpi-val" style={{ color: '#14532D' }}>{completedProjects}</span>
          </div>
          <div className="contractor-kpi-arrow" style={{ color: '#15803D' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>

        {/* Card 3: Total Revenue (Pale Shiny Purple) */}
        <div
          className="contractor-kpi-card"
          style={{
            background: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
            borderColor: '#E9D5FF',
          }}
          onClick={() => navigate('/contractor/discounts-earnings')}
          title="Total Revenue & Margin Savings"
        >
          <div className="contractor-kpi-icon" style={{ backgroundColor: '#FFFFFF', color: '#7E22CE' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="contractor-kpi-center">
            <span className="contractor-kpi-label" style={{ color: '#6B21A8' }}>Total Revenue</span>
            <span className="contractor-kpi-val" style={{ color: '#581C87' }}>{fmt(totalRevenue)}</span>
          </div>
          <div className="contractor-kpi-arrow" style={{ color: '#7E22CE' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>

        {/* Card 4: Total Estimations Value (Pale Shiny Rose/Red) */}
        <div
          className="contractor-kpi-card"
          style={{
            background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
            borderColor: '#FECDD3',
          }}
          onClick={() => navigate('/contractor/projects')}
          title="Total Estimations Worth"
        >
          <div className="contractor-kpi-icon" style={{ backgroundColor: '#FFFFFF', color: '#E11D48' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <div className="contractor-kpi-center">
            <span className="contractor-kpi-label" style={{ color: '#9F1239' }}>Total Estimations Value</span>
            <span className="contractor-kpi-val" style={{ color: '#881337' }}>{fmt(totalEstimationsValue)}</span>
          </div>
          <div className="contractor-kpi-arrow" style={{ color: '#E11D48' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT GRID (LEFT: RECENT PROJECTS + TIME TABLES; RIGHT: WHOLESALE PRODUCT + TRADE DESK) */}
      <div
        className="contractor-main-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) 340px',
          gap: isMobile ? '16px' : '22px',
          alignItems: 'start',
          width: '100%',
        }}
      >
        {/* LEFT COLUMN: Projects + Operating Hours Cards (Placed ABOVE Reachout Hub) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0, width: '100%' }}>

          {/* Recent Deck Projects Card */}
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

            {/* Desktop Table View */}
            <div className="contractor-desktop-table-wrap" style={styles.tableResponsive}>
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

            {/* Mobile Project Cards View (<= 1024px) */}
            <div className="contractor-dash-mobile-cards">
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
                  const area = p.dimensions?.area || p.area || 420;

                  const targetUrl = projectEst ? `/contractor/projects/${projectEst._id || projectEst.id}` : '/contractor/projects';

                  return (
                    <div key={p._id || p.id} style={styles.mobileCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ minWidth: 0, flex: 1, cursor: 'pointer' }} onClick={() => navigate(targetUrl)}>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: '#1E3A63', wordBreak: 'break-word' }}>
                            {p.projectName || 'Residential Deck'}
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
                            {p.ownerId?.fullName || p.ownerName || 'Verified Client'} • {formattedDate}
                          </div>
                        </div>
                        <span style={{ ...statusClass, fontSize: '10px', padding: '2.5px 8px', borderRadius: '12px', flexShrink: 0 }}>
                          {rawStatus.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={styles.deckAreaPill}>{area} sq ft</span>
                          <strong style={{ fontSize: '13.5px', color: '#15803D', fontWeight: '800' }}>
                            {estValStr}
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(targetUrl)}
                          style={{ ...styles.actionViewBtn, padding: '4px 12px', height: '28px', fontSize: '11px' }}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748B' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1E3A63', marginBottom: '4px' }}>
                    No deck projects yet
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/contractor/decks/new')}
                    style={{ marginTop: '8px', padding: '6px 14px', background: '#E08131', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}
                  >
                    + Start First Estimation
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Operating Hours Cards (Matching Customer Portal Design) - ABOVE Support Hub */}
          <div style={{ width: '100%' }}>
            <OperatingHoursBlock variant="cards" />
          </div>
        </div>

        {/* RIGHT COLUMN: Single Product Card (Wholesale Materials) + Trade Desk Help Card */}
        <div className="contractor-dash-side-col" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
          {/* Wholesale Materials Product Card (No empty spaces, height: auto) */}
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

          {/* Trade Desk / Contractor Support Card */}
          <div style={styles.contractorHelpCard}>
            <div style={styles.helpHeader}>
              <div style={styles.helpIconBox}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div>
                <h4 style={styles.helpTitle}>Wholesale Partner Support</h4>
                <p style={styles.helpSub}>Trade desk specialists available</p>
              </div>
            </div>
            <p style={styles.helpText}>
              Need bulk pallet shipment rates, technical stain yield assistance, or commercial formulation guidance? Call our contractor desk directly.
            </p>
            <div style={{ marginTop: '14px' }}>
              <a href="tel:18664403325" style={styles.helpPhoneBtn}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>(866) 440-DECK</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CONTRACTOR REACHOUT & SUPPORT HUB - BELOW TIME TABLES IN A FULL-WIDTH SINGLE ROW */}
      <div style={{ ...styles.contactHubCard, width: '100%', boxSizing: 'border-box', marginTop: '4px' }}>
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

        {/* Exactly 4 Contact Items in a Clean Full-Width Row on Desktop & Responsive 2x2 Grid on Mobile */}
        <div className="contractor-contact-grid">
          {/* Item 1: Direct Office Phone */}
          <div className="contractor-contact-box" style={{ border: '1.5px solid #1E3A63' }}>
            <div className="contractor-contact-icon" style={{ backgroundColor: '#EFF6FF', color: '#1E3A63', borderColor: '#1E3A63' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginBottom: '2px' }}>
                <span className="contractor-contact-label" style={{ color: '#1E3A63' }}>Direct Office</span>
                <span style={{ fontSize: '9px', fontWeight: '800', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#EFF6FF', color: '#1E3A63', border: '1px solid #BFDBFE' }}>
                  Toll-Free
                </span>
              </div>
              <a href={`tel:${(contactChannels.supportPhone || '').replace(/[^0-9]/g, '') || '8664403325'}`} className="contractor-contact-val">
                {contactChannels.supportPhone || '(866) 440-DECK'}
              </a>
              <span className="contractor-contact-sub">Direct Line: {contactChannels.supportPhone || '(856) 666-8888'}</span>

              <div style={{ marginTop: '8px' }}>
                <a href={`tel:${(contactChannels.supportPhone || '').replace(/[^0-9]/g, '') || '8664403325'}`} className="contractor-contact-btn" style={styles.callNowBtn} title={`Call ${contactChannels.supportPhone || '(866) 440-DECK'}`}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>Call Now</span>
                </a>
              </div>
            </div>
          </div>

          {/* Item 2: Estimates & Inquiries */}
          <div className="contractor-contact-box" style={{ border: '1.5px solid #E08131' }}>
            <div className="contractor-contact-icon" style={{ backgroundColor: '#FFFBEB', color: '#D97706', borderColor: '#E08131' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginBottom: '2px' }}>
                <span className="contractor-contact-label" style={{ color: '#C2671A' }}>Inquiries</span>
                <span style={{ fontSize: '9px', fontWeight: '800', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A' }}>
                  Official
                </span>
              </div>

              <div style={styles.emailHighlightedBox}>
                <a
                  href={`mailto:${contactChannels.supportEmail || 'support@deckestimator.com'}`}
                  style={styles.emailLink}
                  title={`Send email to ${contactChannels.supportEmail || 'support@deckestimator.com'}`}
                >
                  {contactChannels.supportEmail || 'support@deckestimator.com'}
                </a>
              </div>
              <span className="contractor-contact-sub">Senior estimator inbox</span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                <a
                  href={`mailto:${contactChannels.supportEmail || 'support@deckestimator.com'}?subject=Contractor%20Partner%20Inquiry`}
                  className="contractor-contact-btn"
                  style={styles.emailUsBtn}
                  title="Open email composer"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  <span>Email</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(contactChannels.supportEmail || 'support@deckestimator.com');
                    setCopiedEmail(true);
                    setTimeout(() => setCopiedEmail(false), 2000);
                  }}
                  className="contractor-contact-btn"
                  style={styles.copyBtn}
                  title="Copy email to clipboard"
                >
                  {copiedEmail ? (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span style={{ color: '#15803D', fontWeight: '700' }}>Copied</span>
                    </>
                  ) : (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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

          {/* Item 3: Headquarters */}
          <div className="contractor-contact-box" style={{ border: '1.5px solid #1E3A63' }}>
            <div className="contractor-contact-icon" style={{ backgroundColor: '#F0FDF4', color: '#15803D', borderColor: '#1E3A63' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span className="contractor-contact-label" style={{ color: '#1E3A63' }}>Headquarters</span>
              <strong className="contractor-contact-val" style={{ color: '#0F172A', fontSize: '12px' }}>
                {contactChannels.businessAddress || '1452 Boardwalk Ave, Cherry Hill, NJ 08002'}
              </strong>
              <span className="contractor-contact-sub">{contactChannels.operatingHours || 'Mon - Fri: 8:00 AM - 6:00 PM EST'}</span>
              <div style={{ marginTop: '8px' }}>
                <span style={{ fontSize: '10px', color: '#15803D', fontWeight: '700', backgroundColor: '#DCFCE7', padding: '2px 6px', borderRadius: '4px', border: '1px solid #BBF7D0' }}>
                  Central Office
                </span>
              </div>
            </div>
          </div>

          {/* Item 4: Rapid Dispatch & Trade Desk */}
          <div className="contractor-contact-box" style={{ border: '1.5px solid #1E3A63' }}>
            <div className="contractor-contact-icon" style={{ backgroundColor: '#EFF6FF', color: '#2563EB', borderColor: '#1E3A63' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginBottom: '2px' }}>
                <span className="contractor-contact-label" style={{ color: '#1E3A63' }}>Rapid Dispatch</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '9px', fontWeight: '800', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#16A34A', display: 'inline-block' }} />
                  Live
                </span>
              </div>
              <strong className="contractor-contact-val" style={{ color: '#0F172A' }}>
                Senior Estimator Desk
              </strong>
              <span className="contractor-contact-sub">Fast partner tickets &amp; formula specs</span>
              <div style={{ marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => navigate('/contractor/support')}
                  className="contractor-contact-btn"
                  style={styles.callNowBtn}
                  title="Open contractor support tickets"
                >
                  <span>Open Ticket &rarr;</span>
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
    border: '1px solid rgba(255, 255, 255, 0.35)',
    backgroundSize: 'cover',
    backgroundPosition: 'center right',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
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
    height: 'auto',
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
    marginTop: '12px',
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

  // Mobile Project Card
  mobileCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '12px 14px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  },

  // Trade Desk / Contractor Help Card
  contractorHelpCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '18px 20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
  },
  helpHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  helpIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#EFF6FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1E3A63',
  },
  helpTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '800',
    color: '#1E3A63',
  },
  helpSub: {
    margin: 0,
    fontSize: '11px',
    color: '#64748B',
  },
  helpText: {
    margin: '0 0 10px 0',
    fontSize: '12px',
    color: '#475569',
    lineHeight: 1.5,
  },
  helpPhoneBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    borderRadius: '8px',
    backgroundColor: '#EFF6FF',
    border: '1.5px solid #1E3A63',
    color: '#1E3A63',
    fontSize: '12.5px',
    fontWeight: '800',
    textDecoration: 'none',
    boxShadow: '0 1px 3px rgba(30, 58, 99, 0.08)',
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
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
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
    wordBreak: 'break-all',
    overflowWrap: 'anywhere',
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

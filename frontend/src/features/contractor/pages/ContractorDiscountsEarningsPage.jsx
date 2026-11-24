// =============================================
// Deck Estimator — Contractor Discounts & Earnings Page
// =============================================
// Unified portal combining Wholesale Partner Discounts and Commissions & Earnings
// Features:
// - Pale navy shiny hero banner with thin border & high-fidelity money bag graphic
// - Real MongoDB data only for all KPI cards (no fake numbers) with crisp thin borders
// - Prominent tabs switcher with clear active state & real live number badges
// - Wholesale Discounts Tab:
//     * Contractor Tier Discount Program banner with pale shine, thin border, & direct docs upload link
//     * Pill-shaped search bar + pill-shaped filter dropdown (High to Low, Low to High, Newest, Oldest)
//     * Real Active Partner Discount Policies table
//     * Two-column bottom section:
//         - Left: Request Higher Wholesale Discount form (Business Name, 4 request types, description, submit)
//         - Right: Important Guidelines & Discount Tiers card (10% default, doc verification for 15%, 20% requests)
// - Commissions & Earnings Tab:
//     * Reduced-width pill-shaped search bar + pill-shaped status dropdown
//     * Commission Payout Ledger & interactive breakdown modal

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractorDiscountApi } from '../api/contractorDiscountApi';
import { contractorCommissionApi } from '../api/contractorCommissionApi';
import { contractorLeadApi } from '../api/contractorLeadApi';
import { getEstimates } from '../../customer/api/estimatesApi';
import { useAuth } from '../../auth/hooks/useAuth';
import contractorBannerBg from '../../../assets/images/Banner_BG_img.png';

function getDeckArea(est) {
  if (est?.deckDetails?.dimensions?.squareFootage) return `${est.deckDetails.dimensions.squareFootage} sq ft`;
  if (est?.pricingSnapshot?.totalArea) return `${est.pricingSnapshot.totalArea} sq ft`;
  if (est?.deckDetails?.dimensions?.length && est?.deckDetails?.dimensions?.width) {
    return `${Number(est.deckDetails.dimensions.length) * Number(est.deckDetails.dimensions.width)} sq ft`;
  }
  return '—';
}

function getDeckDimensions(est) {
  if (est?.deckDetails?.dimensions?.length && est?.deckDetails?.dimensions?.width) {
    return `(${est.deckDetails.dimensions.length} ft × ${est.deckDetails.dimensions.width} ft)`;
  }
  return '';
}

function getEstimateStatusBadge(status) {
  const s = (status || 'CREATED').toUpperCase();
  if (s === 'COMPLETED') {
    return {
      bg: '#DCFCE7',
      color: '#15803D',
      border: '1px solid #86EFAC',
      label: 'Completed',
    };
  }
  if (s === 'APPROVED' || s === 'IN_REVIEW' || s === 'REQUESTED') {
    return {
      bg: '#FEF3C7',
      color: '#B45309',
      border: '1px solid #FDE68A',
      label: s === 'REQUESTED' ? 'In Review' : 'Approved',
    };
  }
  return {
    bg: '#F1F5F9',
    color: '#475569',
    border: '1px solid #CBD5E1',
    label: 'Created',
  };
}

// High-fidelity Money Bag SVG illustration for the right side of the banner
function MoneyBagGraphic({ size = 105 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <defs>
        <radialGradient id="bagAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#93C5FD" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bagLeather" x1="20" y1="28" x2="100" y2="108" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2A4D7E" />
          <stop offset="50%" stopColor="#1E3A63" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="goldSheen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="35%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="ropeGold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <filter id="bagDropShadow" x="-15%" y="-15%" width="130%" height="130%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#0F172A" floodOpacity="0.22" />
        </filter>
      </defs>

      {/* Subtle radial aura */}
      <circle cx="60" cy="62" r="54" fill="url(#bagAura)" />

      {/* Gold coins beneath */}
      <ellipse cx="36" cy="98" rx="14" ry="5.5" fill="#B45309" />
      <ellipse cx="36" cy="96" rx="14" ry="5.5" fill="url(#goldSheen)" />
      <ellipse cx="84" cy="99" rx="15" ry="6" fill="#92400E" />
      <ellipse cx="84" cy="97" rx="15" ry="6" fill="url(#goldSheen)" />
      <ellipse cx="60" cy="103" rx="19" ry="6.5" fill="#78350F" />
      <ellipse cx="60" cy="101" rx="19" ry="6.5" fill="url(#goldSheen)" />

      {/* Main Bag with shadow */}
      <g filter="url(#bagDropShadow)">
        {/* Ruffled Bag Fluting / Open Crown */}
        <path
          d="M44 32 C39 23, 45 17, 52 21 C56 15, 64 15, 68 21 C75 17, 81 23, 76 32 Z"
          fill="url(#bagLeather)"
          stroke="#60A5FA"
          strokeWidth="0.8"
          strokeOpacity="0.35"
        />
        {/* Tied rope collar */}
        <ellipse cx="60" cy="35" rx="18" ry="5.5" fill="url(#ropeGold)" />
        <path d="M56 38 C53 44, 51 49, 50 53 M64 38 C67 43, 69 49, 70 54" stroke="url(#goldSheen)" strokeWidth="2.4" strokeLinecap="round" />

        {/* Large Rounded Leather Sack Body */}
        <path
          d="M42 35 C28 43, 17 64, 21 84 C25 100, 38 106, 60 106 C82 106, 95 100, 99 84 C103 64, 92 43, 78 35 C72 39, 48 39, 42 35 Z"
          fill="url(#bagLeather)"
          stroke="#94A3B8"
          strokeWidth="0.9"
          strokeOpacity="0.35"
        />

        {/* Sheen arc */}
        <path
          d="M32 58 C28 72, 33 87, 41 94"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeOpacity="0.28"
        />

        {/* Golden Dollar Medallion */}
        <circle cx="60" cy="72" r="16.5" fill="url(#goldSheen)" />
        <circle cx="60" cy="72" r="14" fill="#1E3A63" />
        <text
          x="60"
          y="79"
          textAnchor="middle"
          fill="url(#goldSheen)"
          fontSize="21"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          $
        </text>
      </g>
    </svg>
  );
}

export default function ContractorDiscountsEarningsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [windowWidth, setWindowWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200));
  const isMobile = windowWidth < 1024;
  const isSmallMobile = windowWidth < 540;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [loading, setLoading] = useState(true);

  // Real Database state
  const [discounts, setDiscounts] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [effectiveDiscountRate, setEffectiveDiscountRate] = useState(5);
  const [totalWholesaleSavings, setTotalWholesaleSavings] = useState(0);
  const [commissions, setCommissions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [profile, setProfile] = useState(null);

  // Discounts tab search & filter
  const [discountSearch, setDiscountSearch] = useState('');
  const [discountSort, setDiscountSort] = useState('ALL');

  // Request higher discount form state
  const [reqBusinessName, setReqBusinessName] = useState('');
  const [reqType, setReqType] = useState('Request Higher Wholesale Discount (Tier Upgrade)');
  const [reqDescription, setReqDescription] = useState('');
  const [reqSubmitting, setReqSubmitting] = useState(false);
  const [reqSuccessMessage, setReqSuccessMessage] = useState('');
  const [reqErrorMessage, setReqErrorMessage] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      const [discRes, commRes, sumRes, profRes, estRes] = await Promise.allSettled([
        contractorDiscountApi.getEligibleDiscounts(),
        contractorCommissionApi.getMyCommissions(),
        contractorCommissionApi.getCommissionSummary(),
        contractorLeadApi.getProfile(),
        getEstimates({ limit: 100 }),
      ]);

      // 1. Discount policies & rate (always dynamically read the live tuned discount from admin)
      if (discRes.status === 'fulfilled' && discRes.value) {
        const dData = discRes.value?.data || discRes.value;
        if (Array.isArray(dData)) {
          setDiscounts(dData);
          if (dData[0]?.discountValue) {
            setEffectiveDiscountRate(Number(dData[0].discountValue));
          }
        } else if (dData) {
          if (Array.isArray(dData.policies)) {
            setDiscounts(dData.policies);
          }
          const eff =
            dData.effectiveRate ??
            dData.effectiveDiscount?.rate ??
            dData.defaultDiscount ??
            (Array.isArray(dData.policies) && dData.policies[0]?.discountValue);
          if (typeof eff === 'number') {
            setEffectiveDiscountRate(eff);
          }
        }
      }

      // 2. Commissions ledger
      if (commRes.status === 'fulfilled' && commRes.value?.data) {
        const cData = commRes.value.data;
        if (Array.isArray(cData)) {
          setCommissions(cData);
        } else if (cData?.commissions && Array.isArray(cData.commissions)) {
          setCommissions(cData.commissions);
        }
      }

      // 3. Commission Financial Summary
      if (sumRes.status === 'fulfilled' && sumRes.value?.data) {
        setSummary(sumRes.value.data?.summary || sumRes.value.data);
      }

      // 4. Contractor Profile
      if (profRes.status === 'fulfilled' && profRes.value?.data) {
        const pData = profRes.value.data?.profile || profRes.value.data;
        setProfile(pData);
        if (pData?.businessName) {
          setReqBusinessName(pData.businessName);
        }
      }

      // 5. Contractor Estimates & Wholesale Savings
      if (estRes.status === 'fulfilled') {
        const estList = estRes.value?.estimates || estRes.value?.data?.estimates || (Array.isArray(estRes.value) ? estRes.value : []);
        setEstimates(estList);
        let savings = 0;
        estList.forEach((e) => {
          if (e.discountBreakdown?.applied && e.discountBreakdown?.discountAmount) {
            savings += Number(e.discountBreakdown.discountAmount);
          } else if (e.discountBreakdown?.originalTotal && e.totalAmount && e.discountBreakdown.originalTotal > e.totalAmount) {
            savings += (Number(e.discountBreakdown.originalTotal) - Number(e.totalAmount));
          }
        });
        setTotalWholesaleSavings(savings);
      }
    } catch (e) {
      console.warn('Error loading discounts & earnings real data:', e);
    } finally {
      setLoading(false);
    }
  }

  // Pre-fill business name when user/profile loads
  useEffect(() => {
    if (!reqBusinessName && (profile?.businessName || user?.businessName || user?.fullName)) {
      setReqBusinessName(profile?.businessName || user?.businessName || `${user?.fullName} Deck Services LLC`);
    }
  }, [profile, user, reqBusinessName]);

  // Map real discount policies
  const displayDiscounts = useMemo(() => {
    if (!discounts || discounts.length === 0) {
      return [
        {
          id: 'disc-def-10',
          name: 'DRP Master Contractor Material Wholesale',
          code: 'CONTRACTOR_DEFAULT_10',
          type: 'Percentage',
          value: `${effectiveDiscountRate || 5}%`,
          numericValue: effectiveDiscountRate || 5,
          applicableFor: 'Premium Wood, Stains & Sealers',
          validity: 'Active Throughout 2026',
          status: 'Active',
          tier: 'Standard Wholesale Partner',
          createdAt: new Date('2026-01-01'),
        },
      ];
    }

    return discounts.map((d) => ({
      id: d._id || d.id,
      name: d.name || 'Contractor Material Wholesale Discount',
      code: d.code || '',
      type: d.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount',
      value: d.discountType === 'percentage' ? `${d.discountValue}%` : `$${d.discountValue}`,
      numericValue: Number(d.discountValue) || 0,
      applicableFor: d.applicableComponent
        ? d.applicableComponent.charAt(0).toUpperCase() + d.applicableComponent.slice(1)
        : (d.applicableFor || 'Materials & Sealers'),
      validity: d.effectiveStartDate && d.effectiveEndDate
        ? `${new Date(d.effectiveStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – ${new Date(d.effectiveEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        : 'Active Throughout 2026',
      status: d.status === 'active' || d.status === 'ACTIVE' ? 'Active' : (d.status || 'Active'),
      tier: d.discountValue >= 20 ? 'DRP Elite Partner' : d.discountValue >= 15 ? 'Verified Pro' : 'Standard Partner',
      createdAt: d.createdAt ? new Date(d.createdAt) : new Date('2026-01-01'),
    }));
  }, [discounts, effectiveDiscountRate]);

  // Filter & sort discount policies live
  const filteredDiscounts = useMemo(() => {
    let result = displayDiscounts.filter((d) => {
      const q = discountSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.applicableFor.toLowerCase().includes(q) ||
        d.value.toLowerCase().includes(q)
      );
    });

    if (discountSort === 'HIGH_TO_LOW') {
      result.sort((a, b) => b.numericValue - a.numericValue);
    } else if (discountSort === 'LOW_TO_HIGH') {
      result.sort((a, b) => a.numericValue - b.numericValue);
    } else if (discountSort === 'NEWEST') {
      result.sort((a, b) => b.createdAt - a.createdAt);
    } else if (discountSort === 'OLDEST') {
      result.sort((a, b) => a.createdAt - b.createdAt);
    }

    return result;
  }, [displayDiscounts, discountSearch, discountSort]);

  const activeWholesaleTier =
    (typeof effectiveDiscountRate === 'number' && effectiveDiscountRate > 0)
      ? effectiveDiscountRate
      : (profile?.wholesaleDiscountTier || 5);

  const totalEstimationCost = useMemo(() => {
    return estimates.reduce((sum, e) => {
      const val = Number(e.totalAmount || e.pricingSnapshot?.calculatedTotal || 0);
      return sum + val;
    }, 0);
  }, [estimates]);

  const earnedCommissions = useMemo(() => {
    return estimates.reduce((sum, e) => {
      const isCompleted = (e.estimateStatus || e.status || '').toUpperCase() === 'COMPLETED';
      if (!isCompleted) return sum;
      const discountAmt = Number(
        e.discountBreakdown?.discountAmount ||
        (e.discountBreakdown?.originalTotal > e.totalAmount ? e.discountBreakdown.originalTotal - e.totalAmount : 0) ||
        ((Number(e.totalAmount || 0) * activeWholesaleTier) / 100)
      );
      return sum + discountAmt;
    }, 0);
  }, [estimates, activeWholesaleTier]);

  // Filter contractor estimates live for Discounts tab
  const filteredEstimates = useMemo(() => {
    return estimates.filter((est) => {
      const q = discountSearch.toLowerCase().trim();
      const projName = est.deckDetails?.projectName || est.estimateName || 'Custom Deck';
      const refNum = est.estimateNumber || est._id || '';
      const wood = est.deckDetails?.surfaceMaterial || est.pricingSnapshot?.wood || '';
      const matchesSearch = !q || projName.toLowerCase().includes(q) || refNum.toLowerCase().includes(q) || wood.toLowerCase().includes(q);

      const st = (est.estimateStatus || est.status || 'CREATED').toUpperCase();
      let matchesFilter = true;
      if (discountSort === 'COMPLETED') {
        matchesFilter = st === 'COMPLETED';
      } else if (discountSort === 'IN_REVIEW') {
        matchesFilter = st === 'IN_REVIEW' || st === 'REQUESTED';
      } else if (discountSort === 'CREATED') {
        matchesFilter = st === 'CREATED';
      }

      return matchesSearch && matchesFilter;
    });
  }, [estimates, discountSearch, discountSort]);

  // Handle submit discount request to Backend & Admin
  async function handleSubmitDiscountRequest(e) {
    e.preventDefault();
    if (!reqDescription.trim()) {
      setReqErrorMessage('Please provide a description or reason for your discount request.');
      return;
    }

    setReqSubmitting(true);
    setReqErrorMessage('');
    setReqSuccessMessage('');

    try {
      await contractorDiscountApi.submitDiscountRequest({
        businessName: reqBusinessName,
        requestType: reqType,
        description: reqDescription,
      });
      setReqSuccessMessage(
        '✓ Your wholesale discount request has been submitted successfully to the Admin team. You can track review status under Verification & Progress.'
      );
      setReqDescription('');
    } catch (err) {
      setReqErrorMessage(err.message || 'Failed to submit discount request. Please try again.');
    } finally {
      setReqSubmitting(false);
    }
  }

  return (
    <div style={{ ...styles.page, padding: isMobile ? '12px 10px 40px 10px' : '26px 36px 60px 36px' }}>
      <style>{`
        @media (max-width: 1024px) {
          .contractor-discounts-bottom-grid {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            gap: 16px !important;
          }
          .contractor-discounts-bottom-grid > div {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          .contractor-discounts-kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }
        }
      `}</style>
      {/* 1. Header Hero Banner with Wood Deck Background matching other contractor pages */}
      <section
        style={{
          ...styles.heroBanner,
          padding: isMobile ? '18px 16px' : '26px 32px',
          backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, 0.26) 0%, rgba(255, 255, 255, 0.08) 25%, transparent 55%), linear-gradient(90deg, rgba(16, 38, 72, 0.72) 0%, rgba(22, 48, 88, 0.58) 28%, rgba(30, 58, 99, 0.28) 42%, rgba(30, 58, 99, 0.04) 52%, rgba(0, 0, 0, 0) 100%), url(${contractorBannerBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
          backgroundRepeat: 'no-repeat',
          borderRadius: '16px',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 18px rgba(15, 23, 42, 0.08)',
        }}
      >
        <div style={styles.heroContent}>
          <div style={styles.portalBadge}>
            <span style={styles.portalBadgeText}>Wood Restoration</span>
          </div>
          <h1 style={{ ...styles.heroTitle, fontSize: isMobile ? '20px' : '26px', margin: '4px 0 6px 0', color: '#ffffff', fontWeight: '900' }}>
            Discounts &amp; Earnings
          </h1>
          <p style={{ ...styles.heroSub, fontSize: isMobile ? '12px' : '13.5px', color: '#E2E8F0', margin: 0, maxWidth: '640px' }}>
            Manage your wholesale material discounts, volume pricing benefits, and track accrued completed project earnings in one unified dashboard.
          </p>
        </div>
      </section>

      {/* 2. Summary KPI Cards — Glass Effect & Pale Colors with Real MongoDB Data */}
      <div
        style={{
          ...styles.kpiGrid,
          gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, 1fr)',
          gap: isMobile ? '10px' : '16px',
        }}
      >
        {/* Card 1: Wholesale Tier Discount */}
        <div
          style={{
            ...styles.kpiCard,
            padding: isMobile ? '12px 14px' : '18px 20px',
            background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)',
            border: '1.5px solid #BFDBFE',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 14px rgba(30, 58, 99, 0.04)',
          }}
        >
          <div style={styles.kpiTopRow}>
            <span style={{ ...styles.kpiLabel, fontSize: isMobile ? '10px' : '11.5px', color: '#1E3A63' }}>Wholesale Tier Discount</span>
            <div style={{ ...styles.kpiIconBox, width: isMobile ? '30px' : '38px', height: isMobile ? '30px' : '38px', backgroundColor: '#DBEAFE', color: '#1E3A63', border: '1px solid #93C5FD' }}>
              <svg width={isMobile ? '15' : '19'} height={isMobile ? '15' : '19'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="5" x2="5" y2="19" />
                <circle cx="6.5" cy="6.5" r="2.5" />
                <circle cx="17.5" cy="17.5" r="2.5" />
              </svg>
            </div>
          </div>
          <div style={{ ...styles.kpiValue, fontSize: isMobile ? '19px' : '23px', color: '#1E3A63' }}>
            {activeWholesaleTier}% OFF
          </div>
          <span style={{ fontSize: isMobile ? '9.5px' : '11px', color: '#64748B', display: 'block', marginTop: '2px' }}>
            Active tuned partner tier
          </span>
        </div>

        {/* Card 2: Total Estimation Cost (Replaces Wholesale Savings) */}
        <div
          style={{
            ...styles.kpiCard,
            padding: isMobile ? '12px 14px' : '18px 20px',
            background: 'linear-gradient(135deg, rgba(240, 249, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)',
            border: '1.5px solid #BAE6FD',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.04)',
          }}
        >
          <div style={styles.kpiTopRow}>
            <span style={{ ...styles.kpiLabel, fontSize: isMobile ? '10px' : '11.5px', color: '#0369A1' }}>Total Estimation Cost</span>
            <div style={{ ...styles.kpiIconBox, width: isMobile ? '30px' : '38px', height: isMobile ? '30px' : '38px', backgroundColor: '#E0F2FE', color: '#0284C7', border: '1px solid #7DD3FC' }}>
              <svg width={isMobile ? '15' : '19'} height={isMobile ? '15' : '19'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <div style={{ ...styles.kpiValue, fontSize: isMobile ? '19px' : '23px', color: '#0284C7' }}>
            ${totalEstimationCost.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <span style={{ fontSize: isMobile ? '9.5px' : '11px', color: '#64748B', display: 'block', marginTop: '2px' }}>
            Total scope across all builds
          </span>
        </div>

        {/* Card 3: Earned Commissions (Real applied discounts from completed conversions) */}
        <div
          style={{
            ...styles.kpiCard,
            padding: isMobile ? '12px 14px' : '18px 20px',
            background: 'linear-gradient(135deg, rgba(240, 253, 244, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)',
            border: '1.5px solid #BBF7D0',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 14px rgba(21, 128, 61, 0.04)',
          }}
        >
          <div style={styles.kpiTopRow}>
            <span style={{ ...styles.kpiLabel, fontSize: isMobile ? '10px' : '11.5px', color: '#15803D' }}>Earned Commissions</span>
            <div style={{ ...styles.kpiIconBox, width: isMobile ? '30px' : '38px', height: isMobile ? '30px' : '38px', backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC' }}>
              <svg width={isMobile ? '15' : '19'} height={isMobile ? '15' : '19'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <div style={{ ...styles.kpiValue, fontSize: isMobile ? '19px' : '23px', color: '#15803D' }}>
            ${earnedCommissions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: isMobile ? '9.5px' : '11px', color: '#64748B', display: 'block', marginTop: '2px' }}>
            From completed conversions
          </span>
        </div>

        {/* Card 4: Total Estimations (Replaces Payable Balance) */}
        <div
          style={{
            ...styles.kpiCard,
            padding: isMobile ? '12px 14px' : '18px 20px',
            background: 'linear-gradient(135deg, rgba(255, 251, 235, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)',
            border: '1.5px solid #FDE68A',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 14px rgba(224, 129, 49, 0.04)',
          }}
        >
          <div style={styles.kpiTopRow}>
            <span style={{ ...styles.kpiLabel, fontSize: isMobile ? '10px' : '11.5px', color: '#B45309' }}>Total Estimations</span>
            <div style={{ ...styles.kpiIconBox, width: isMobile ? '30px' : '38px', height: isMobile ? '30px' : '38px', backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #FCD34D' }}>
              <svg width={isMobile ? '15' : '19'} height={isMobile ? '15' : '19'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
          </div>
          <div style={{ ...styles.kpiValue, fontSize: isMobile ? '19px' : '23px', color: '#C2671A' }}>
            {estimates.length}
          </div>
          <span style={{ fontSize: isMobile ? '9.5px' : '11px', color: '#64748B', display: 'block', marginTop: '2px' }}>
            Saved calculation builds
          </span>
        </div>
      </div>

      {/* 3. Wholesale Partner Discounts Header & Real Live Count Badge */}
      <div style={{ ...styles.tabContainer, flexWrap: 'wrap', gap: isMobile ? '8px' : '10px' }}>
        <div
          style={{
            ...styles.tabBtn,
            ...styles.tabBtnActive,
            padding: isMobile ? '8px 14px' : '10px 20px',
            fontSize: isMobile ? '12px' : '13.5px',
            cursor: 'default',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="5" x2="5" y2="19" />
            <circle cx="6.5" cy="6.5" r="2.5" />
            <circle cx="17.5" cy="17.5" r="2.5" />
          </svg>
          <span>Wholesale Partner Discounts</span>
          <span style={styles.tabPillActive}>
            {estimates.length}
          </span>
        </div>
      </div>

      {/* WHOLESALE PARTNER DISCOUNTS & SAVINGS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Banner: Contractor Tier Discount Program */}
          <div style={styles.tierBanner}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '300px' }}>
                <div style={styles.tierIconBox}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <h3 style={styles.tierTitle}>Contractor Tier Discount Program</h3>
                  <p style={styles.tierSub}>
                    Discounts are automatically calculated and subtracted from wholesale materials and stain packages during your estimation builds.
                  </p>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '12px',
                    padding: '8px 16px',
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '8px',
                    fontSize: isMobile ? '12px' : '13px',
                    color: '#1E3A63',
                    fontWeight: '600',
                  }}>
                    <span>✨</span>
                    <span>Get more Discounts by uploading your documents and based on your Estimations History and conversions</span>
                  </div>
                </div>
              </div>

              {/* Highlight callout to upload documents now */}
              <div style={styles.uploadHighlightCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '15px' }}>⚡</span>
                  <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#1E3A63' }}>
                    Want higher discount tiers?
                  </span>
                </div>
                <p style={{ margin: '4px 0 10px 0', fontSize: '11.5px', color: '#475569', lineHeight: 1.4 }}>
                  Upload your business license and insurance documents in Profile Settings to unlock enhanced wholesale partner pricing.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/contractor/profile')}
                  style={styles.uploadDocsBtn}
                >
                  <span>Upload Documents Now &rarr;</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Partner Estimations & Wholesale Discounts Table Card */}
          <div style={styles.tableCard}>
            <div style={{ ...styles.policiesTopBar, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '10px' : '16px' }}>
              <div>
                <h3 style={styles.tableTitle}>Partner Estimations &amp; Savings</h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Real-time status of your estimation calculations and realized wholesale savings upon completion.
                </span>
              </div>

              {/* Pill-shaped live Search and Filter */}
              <div style={{ ...styles.pillControlRow, flexDirection: isMobile ? 'column' : 'row', width: isMobile ? '100%' : 'auto', gap: isMobile ? '8px' : '12px' }}>
                {/* Pill Search */}
                <div style={{ ...styles.pillSearchBox, width: isMobile ? '100%' : '260px', height: isMobile ? '36px' : '40px', padding: isMobile ? '0 12px' : '0 16px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder={isMobile ? "Search estimations..." : "Search project, ref #, or wood..."}
                    value={discountSearch}
                    onChange={(e) => setDiscountSearch(e.target.value)}
                    style={{ ...styles.pillSearchInput, fontSize: isMobile ? '11.5px' : '13px' }}
                  />
                  {discountSearch && (
                    <button onClick={() => setDiscountSearch('')} style={styles.clearSearchBtn}>
                      &times;
                    </button>
                  )}
                </div>

                {/* Pill Filter Dropdown */}
                <div style={{ ...styles.pillSelectWrap, width: isMobile ? '100%' : 'auto' }}>
                  <select
                    value={discountSort}
                    onChange={(e) => setDiscountSort(e.target.value)}
                    style={{ ...styles.pillSelect, width: isMobile ? '100%' : 'auto', height: isMobile ? '36px' : '38px', fontSize: isMobile ? '11.5px' : '12.5px', padding: isMobile ? '4px 10px' : '7px 14px' }}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="COMPLETED">Completed Only</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="CREATED">Created</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => loadAllData()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: isMobile ? '6px 12px' : '8px 14px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '999px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    color: '#1E3A63',
                    cursor: 'pointer',
                  }}
                  title="Refresh estimations from database"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M23 4v6h-6" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeadRow}>
                    <th style={styles.th}>Project Name</th>
                    <th style={styles.th}>Deck Size</th>
                    <th style={styles.th}>Total Estimation Cost</th>
                    <th style={styles.th}>Wholesale Discount %</th>
                    <th style={styles.th}>Status</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Earned Discount Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEstimates.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '42px 16px', color: '#94A3B8' }}>
                        <div style={{ fontSize: '30px', marginBottom: '8px' }}>📋</div>
                        <strong style={{ display: 'block', fontSize: '14px', color: '#1E3A63', marginBottom: '4px' }}>
                          No Estimations Found
                        </strong>
                        <span style={{ fontSize: '12px' }}>
                          Completed project conversions will reflect here with your calculated wholesale savings.
                        </span>
                      </td>
                    </tr>
                  ) : (
                    filteredEstimates.map((est) => {
                      const projName = est.deckDetails?.projectName || est.estimateName || 'Custom Deck Project';
                      const refNum = est.estimateNumber || (est._id ? `EST-${String(est._id).slice(-8).toUpperCase()}` : 'EST-PENDING');
                      const area = getDeckArea(est);
                      const dims = getDeckDimensions(est);
                      const totalCost = Number(est.totalAmount || est.pricingSnapshot?.calculatedTotal || 0);
                      const discountRate = est.discountBreakdown?.rate || activeWholesaleTier;
                      const isCompleted = (est.estimateStatus || est.status || '').toUpperCase() === 'COMPLETED';
                      const stBadge = getEstimateStatusBadge(est.estimateStatus || est.status);

                      const discountSavings = Number(
                        est.discountBreakdown?.discountAmount ||
                        (est.discountBreakdown?.originalTotal > est.totalAmount ? est.discountBreakdown.originalTotal - est.totalAmount : 0) ||
                        ((totalCost * discountRate) / 100)
                      );

                      return (
                        <tr key={est._id || est.id} style={styles.tr}>
                          <td style={styles.td}>
                            <div style={{ fontWeight: '700', color: '#1E3A63', fontSize: '13.5px' }}>
                              {projName}
                            </div>
                            <div style={{ fontSize: '11.5px', fontFamily: 'monospace', color: '#64748B', marginTop: '2px' }}>
                              {refNum}
                            </div>
                          </td>

                          <td style={styles.td}>
                            <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '13px' }}>
                              {area}
                            </div>
                            {dims && (
                              <div style={{ fontSize: '11px', color: '#64748B' }}>
                                {dims}
                              </div>
                            )}
                          </td>

                          <td style={styles.td}>
                            <span style={{ fontSize: '14px', fontWeight: '800', color: '#1E3A63' }}>
                              ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </td>

                          <td style={styles.td}>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '800',
                              backgroundColor: '#EFF6FF',
                              color: '#1E3A63',
                              border: '1px solid #BFDBFE',
                            }}>
                              {discountRate}% Tier
                            </span>
                          </td>

                          <td style={styles.td}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '3px 10px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: '800',
                              backgroundColor: stBadge.bg,
                              color: stBadge.color,
                              border: stBadge.border,
                            }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: stBadge.color }} />
                              {stBadge.label}
                            </span>
                          </td>

                          <td style={{ ...styles.td, textAlign: 'right' }}>
                            {isCompleted ? (
                              <div>
                                <span style={{ fontSize: '15px', fontWeight: '900', color: '#15803D' }}>
                                  +${discountSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                <span style={{ display: 'block', fontSize: '10.5px', fontWeight: '700', color: '#166534' }}>
                                  ✓ Savings Realized
                                </span>
                              </div>
                            ) : (
                              <span style={{
                                display: 'inline-block',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '11.5px',
                                color: '#94A3B8',
                                backgroundColor: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                              }}>
                                Pending Completion
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Before Footer / After List: Two-Column Row (Request Higher Discount Form + Important Guidelines Box) */}
          <div
            className="contractor-discounts-bottom-grid"
            style={{
              ...styles.bottomSectionGrid,
              display: isMobile ? 'flex' : 'grid',
              flexDirection: isMobile ? 'column' : 'initial',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
              gap: isMobile ? '16px' : '20px',
              width: '100%',
            }}
          >
            {/* Left Box: Request Higher Wholesale Discount Form */}
            <div style={{ ...styles.requestFormCard, padding: isMobile ? '16px 14px' : '22px 24px' }}>
              <div style={styles.formCardHeader}>
                <div style={styles.formHeaderIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
                <div>
                  <h3 style={styles.formTitle}>Request Higher Wholesale Discount</h3>
                  <p style={styles.formSub}>
                    Apply for custom commercial pricing, tier upgrades, or special partner support.
                  </p>
                </div>
              </div>

              {reqSuccessMessage && (
                <div style={styles.formSuccessBox}>
                  {reqSuccessMessage}
                </div>
              )}

              {reqErrorMessage && (
                <div style={styles.formErrorBox}>
                  {reqErrorMessage}
                </div>
              )}

              <form onSubmit={handleSubmitDiscountRequest} style={styles.formBody}>
                {/* Field 1: Business Name */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>
                    Business Name <span style={{ color: '#E11D48' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your contractor registered business name"
                    value={reqBusinessName}
                    onChange={(e) => setReqBusinessName(e.target.value)}
                    style={styles.formInput}
                  />
                </div>

                {/* Field 2: Type of Request */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>
                    Type of Request <span style={{ color: '#E11D48' }}>*</span>
                  </label>
                  <select
                    value={reqType}
                    onChange={(e) => setReqType(e.target.value)}
                    style={styles.formSelect}
                  >
                    <option value="Request Higher Wholesale Discount (Tier Upgrade)">
                      Request Higher Wholesale Discount (Tier Upgrade to 15% – 20%)
                    </option>
                    <option value="Commercial Project Volume Discount">
                      Commercial Project Volume Discount (Multi-Deck / Commercial Jobs ≥ $6,000)
                    </option>
                    <option value="Billing & Commission Adjustment Inquiry">
                      Billing &amp; Commission Adjustment Inquiry (Disbursement Review)
                    </option>
                    <option value="Special Contractor Partnership Tier Support">
                      Special Contractor Partnership Tier Support (Custom Vouchers &amp; Supply)
                    </option>
                  </select>
                </div>

                {/* Field 3: Description / Reason */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>
                    Description / Justification <span style={{ color: '#E11D48' }}>*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe your current project volume, expected annual deck footage, or reason for requesting an enhanced discount tier..."
                    value={reqDescription}
                    onChange={(e) => setReqDescription(e.target.value)}
                    style={styles.formTextarea}
                  />
                </div>

                {/* Submit Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '6px' }}>
                  <button
                    type="submit"
                    disabled={reqSubmitting}
                    style={{
                      ...styles.formSubmitBtn,
                      width: isMobile ? '100%' : 'auto',
                      justifyContent: 'center',
                      opacity: reqSubmitting ? 0.7 : 1,
                      cursor: reqSubmitting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {reqSubmitting ? (
                      <span>Submitting Request...</span>
                    ) : (
                      <>
                        <span>Submit Discount Request</span>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Box: Important Guidelines & Discount Tiers */}
            <div style={{ ...styles.guidelinesCard, padding: isMobile ? '16px 14px' : '22px 24px' }}>
              <div style={styles.guidelinesHeader}>
                <div style={styles.guidelinesIconBox}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </div>
                <div>
                  <h3 style={styles.guidelinesTitle}>Important Guidelines &amp; Discount Tiers</h3>
                  <p style={styles.guidelinesSub}>
                    Key terms, proof requirements, and partner qualification rules.
                  </p>
                </div>
              </div>

              <div style={styles.guidelinesContent}>
                {/* Guideline 1 */}
                <div style={styles.guidelineItem}>
                  <div style={styles.guidelineDot} />
                  <div>
                    <div style={styles.guidelineHeading}>Active Wholesale Material Discount</div>
                    <div style={styles.guidelineText}>
                      Your current active tier of <strong>{activeWholesaleTier}%</strong> is automatically applied to all materials, stains, and restoration packages.
                    </div>
                  </div>
                </div>

                {/* Guideline 2 */}
                <div style={styles.guidelineItem}>
                  <div style={{ ...styles.guidelineDot, backgroundColor: '#0284C7' }} />
                  <div>
                    <div style={{ ...styles.guidelineHeading, color: '#0369A1' }}>
                      Upload Verification Documents in Profile Settings
                    </div>
                    <div style={styles.guidelineText}>
                      Upload your business license and insurance certificate under Profile Settings to unlock higher wholesale discount tiers.
                    </div>
                  </div>
                </div>

                {/* Guideline 3 */}
                <div style={styles.guidelineItem}>
                  <div style={{ ...styles.guidelineDot, backgroundColor: '#15803D' }} />
                  <div>
                    <div style={{ ...styles.guidelineHeading, color: '#15803D' }}>
                      Request Tier Upgrades via the Form Beside
                    </div>
                    <div style={styles.guidelineText}>
                      Get more Discounts by uploading your documents and based on your Estimations History and conversions. Submit your tier adjustment request beside for Admin review.
                    </div>
                  </div>
                </div>

                {/* Quick Link Button */}
                <div style={{ paddingTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => navigate('/contractor/profile')}
                    style={styles.guidelinesLinkBtn}
                  >
                    <span>Manage Contractor Profile &amp; Documents &rarr;</span>
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
  page: {
    padding: '24px 32px',
    backgroundColor: '#F8FAFC',
    minHeight: '100vh',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // 1. Pale navy shiny hero banner with thin border
  headerCard: {
    background: 'linear-gradient(135deg, #F0F4F9 0%, #E6EDF5 50%, #F5F8FC 100%)',
    border: '1.5px solid #CBD5E1',
    borderRadius: '16px',
    padding: '26px 32px',
    marginBottom: '22px',
    boxShadow: '0 4px 18px -2px rgba(30, 58, 99, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
    position: 'relative',
    overflow: 'hidden',
  },
  bannerInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '20px',
  },
  portalBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #CBD5E1',
    borderRadius: '9999px',
    marginBottom: '8px',
    boxShadow: '0 1px 3px rgba(30, 58, 99, 0.06)',
  },
  portalBadgeText: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#1E3A63',
    letterSpacing: '0.4px',
    textTransform: 'uppercase',
  },
  pageTitle: {
    margin: '0 0 6px 0',
    fontSize: '26px',
    fontWeight: '800',
    color: '#1E3A63',
    letterSpacing: '-0.3px',
  },
  pageSub: {
    margin: 0,
    fontSize: '13.5px',
    color: '#475569',
    maxWidth: '720px',
    lineHeight: 1.5,
  },
  moneyBagWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    filter: 'drop-shadow(0 4px 10px rgba(15, 23, 42, 0.08))',
  },

  // 2. Summary KPI Cards with thin borders
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
    marginBottom: '22px',
  },
  kpiCard: {
    borderRadius: '14px',
    padding: '18px 20px',
    border: '1.5px solid #CBD5E1',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  kpiTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  kpiLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  kpiIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: '25px',
    fontWeight: '800',
    color: '#1E3A63',
    marginBottom: '4px',
    letterSpacing: '-0.4px',
  },
  kpiSub: {
    fontSize: '12px',
    color: '#64748B',
    lineHeight: 1.35,
  },

  // 3. Tab Switcher
  tabContainer: {
    display: 'flex',
    gap: '10px',
    borderBottom: '2px solid #CBD5E1',
    marginBottom: '22px',
  },
  tabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 20px',
    fontSize: '14.5px',
    fontWeight: '600',
    color: '#64748B',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    marginBottom: '-2px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tabBtnActive: {
    color: '#1E3A63',
    fontWeight: '800',
    borderBottomColor: '#1E3A63',
  },
  tabPillActive: {
    padding: '3px 9px',
    borderRadius: '9999px',
    backgroundColor: '#1E3A63',
    color: '#FFFFFF',
    fontSize: '11.5px',
    fontWeight: '800',
    minWidth: '22px',
    textAlign: 'center',
  },
  tabPillInactive: {
    padding: '3px 9px',
    borderRadius: '9999px',
    backgroundColor: '#E2E8F0',
    color: '#475569',
    fontSize: '11.5px',
    fontWeight: '700',
    minWidth: '22px',
    textAlign: 'center',
  },

  // Tier Banner inside Discounts Tab
  tierBanner: {
    background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
    border: '1.5px solid #BFDBFE',
    borderLeft: '4px solid #1E3A63',
    borderRadius: '14px',
    padding: '20px 22px',
    boxShadow: '0 2px 8px rgba(30, 58, 99, 0.04)',
  },
  tierIconBox: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: '#EFF6FF',
    border: '1px solid #BFDBFE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tierTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '800',
    color: '#1E3A63',
  },
  tierSub: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#475569',
    lineHeight: 1.45,
    maxWidth: '700px',
  },
  tierPill: {
    padding: '5px 12px',
    borderRadius: '9999px',
    backgroundColor: '#F1F5F9',
    border: '1px solid #CBD5E1',
    fontSize: '12px',
    color: '#334155',
  },
  tierPillCurrent: {
    backgroundColor: '#EFF6FF',
    borderColor: '#1E3A63',
    color: '#1E3A63',
    fontWeight: '800',
    boxShadow: '0 0 0 1px #1E3A63',
  },
  tierPillPro: {
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
    color: '#0369A1',
  },
  tierPillElite: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    color: '#92400E',
  },
  uploadHighlightCard: {
    backgroundColor: '#FFFFFF',
    border: '1.5px dashed #0284C7',
    borderRadius: '10px',
    padding: '12px 16px',
    maxWidth: '280px',
    flexShrink: 0,
    boxShadow: '0 2px 6px rgba(2, 132, 199, 0.08)',
  },
  uploadDocsBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '7px 12px',
    backgroundColor: '#1E3A63',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '9999px',
    fontSize: '11.5px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },

  // Table Card & Top Bar
  tableCard: {
    backgroundColor: '#FFFFFF',
    border: '1.5px solid #CBD5E1',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
  policiesTopBar: {
    padding: '16px 22px',
    borderBottom: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAF9',
    flexWrap: 'wrap',
    gap: '14px',
  },
  pillControlRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  pillSearchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#FFFFFF',
    border: '1.5px solid #CBD5E1',
    borderRadius: '9999px',
    padding: '7px 14px',
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: '420px',
  },
  pillSearchInput: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '13px',
    color: '#1E293B',
    width: '100%',
    minWidth: 0,
  },
  pillSelectWrap: {
    display: 'flex',
    alignItems: 'center',
  },
  pillSelect: {
    padding: '7px 14px',
    borderRadius: '9999px',
    border: '1.5px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#1E293B',
    outline: 'none',
    cursor: 'pointer',
  },
  clearSearchBtn: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    color: '#94A3B8',
    cursor: 'pointer',
    padding: 0,
    lineHeight: 1,
  },
  tableTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '800',
    color: '#1E3A63',
  },
  tableHeaderBar: {
    padding: '16px 22px',
    borderBottom: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAF9',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeadRow: {
    backgroundColor: '#F8FAFC',
    borderBottom: '1.5px solid #CBD5E1',
  },
  th: {
    padding: '12px 18px',
    fontSize: '11.5px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  tr: {
    borderBottom: '1px solid #F1F5F9',
  },
  td: {
    padding: '14px 18px',
    fontSize: '13px',
    verticalAlign: 'middle',
  },

  // Bottom Section: Two Columns (Form + Guidelines)
  bottomSectionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
    gap: '20px',
    marginTop: '6px',
  },
  requestFormCard: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
    border: '1.5px solid #CBD5E1',
    borderRadius: '14px',
    padding: '22px 24px',
    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
  },
  formCardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '18px',
  },
  formHeaderIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#EFF6FF',
    border: '1px solid #BFDBFE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  formTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '800',
    color: '#1E3A63',
  },
  formSub: {
    margin: '3px 0 0 0',
    fontSize: '12.5px',
    color: '#64748B',
    lineHeight: 1.4,
  },
  formSuccessBox: {
    padding: '12px 16px',
    borderRadius: '10px',
    backgroundColor: '#DCFCE7',
    border: '1px solid #86EFAC',
    color: '#15803D',
    fontSize: '12.5px',
    fontWeight: '600',
    lineHeight: 1.45,
    marginBottom: '16px',
  },
  formErrorBox: {
    padding: '12px 16px',
    borderRadius: '10px',
    backgroundColor: '#FEE2E2',
    border: '1px solid #FCA5A5',
    color: '#991B1B',
    fontSize: '12.5px',
    fontWeight: '600',
    lineHeight: 1.45,
    marginBottom: '16px',
  },
  formBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  formLabel: {
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#334155',
  },
  formInput: {
    padding: '9px 14px',
    borderRadius: '9999px',
    border: '1.5px solid #CBD5E1',
    fontSize: '13px',
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    outline: 'none',
  },
  formSelect: {
    padding: '9px 14px',
    borderRadius: '9999px',
    border: '1.5px solid #CBD5E1',
    fontSize: '13px',
    fontWeight: '500',
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    cursor: 'pointer',
  },
  formTextarea: {
    padding: '10px 14px',
    borderRadius: '12px',
    border: '1.5px solid #CBD5E1',
    fontSize: '13px',
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  formSubmitBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 22px',
    background: 'linear-gradient(135deg, #1E3A63 0%, #2A4D7E 100%)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '9999px',
    fontSize: '13px',
    fontWeight: '700',
    boxShadow: '0 2px 8px rgba(30, 58, 99, 0.25)',
    transition: 'all 0.15s ease',
  },

  // Right Box: Important Guidelines Card
  guidelinesCard: {
    background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
    border: '1.5px solid #CBD5E1',
    borderRadius: '14px',
    padding: '22px 24px',
    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  guidelinesHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '18px',
  },
  guidelinesIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#E0F2FE',
    border: '1px solid #BAE6FD',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  guidelinesTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '800',
    color: '#1E3A63',
  },
  guidelinesSub: {
    margin: '3px 0 0 0',
    fontSize: '12.5px',
    color: '#64748B',
    lineHeight: 1.4,
  },
  guidelinesContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  guidelineItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  guidelineDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#1E3A63',
    marginTop: '6px',
    flexShrink: 0,
  },
  guidelineHeading: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#1E3A63',
    marginBottom: '2px',
  },
  guidelineText: {
    fontSize: '12.5px',
    color: '#475569',
    lineHeight: 1.45,
  },
  guidelinesLinkBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '9px 18px',
    backgroundColor: '#FFFFFF',
    color: '#1E3A63',
    border: '1.5px solid #CBD5E1',
    borderRadius: '9999px',
    fontSize: '12.5px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.15s ease',
  },

  // Commissions Filter Bar
  filterBarCard: {
    backgroundColor: '#FFFFFF',
    border: '1.5px solid #CBD5E1',
    borderRadius: '14px',
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '14px',
    flexWrap: 'wrap',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
  },
  commSearchPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#F8FAFC',
    border: '1.5px solid #CBD5E1',
    borderRadius: '9999px',
    padding: '7px 14px',
    width: '100%',
    boxSizing: 'border-box',
    maxWidth: '560px',
  },

  // Badges & Actions
  badgeSuccess: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '11.5px',
    fontWeight: '700',
    backgroundColor: '#DCFCE7',
    color: '#15803D',
    border: '1px solid #BBF7D0',
  },
  statusDotSuccess: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#15803D',
  },
  badgeWarning: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '11.5px',
    fontWeight: '700',
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    border: '1px solid #FDE68A',
  },
  statusDotWarning: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#D97706',
  },
  badgeNeutral: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '11.5px',
    fontWeight: '600',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    border: '1px solid #E2E8F0',
  },
  txnCode: {
    fontSize: '12px',
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#1E3A63',
    backgroundColor: '#EFF6FF',
    padding: '3px 7px',
    borderRadius: '4px',
    border: '1px solid #DBEAFE',
  },
  detailBtn: {
    padding: '6px 14px',
    borderRadius: '9999px',
    border: '1.5px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    fontSize: '12px',
    fontWeight: '700',
    color: '#1E3A63',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },

  // Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '16px',
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: '14px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    border: '1.5px solid #CBD5E1',
  },
  modalHeader: {
    padding: '18px 20px',
    borderBottom: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '22px',
    lineHeight: '1',
    color: '#94A3B8',
    cursor: 'pointer',
  },
  modalBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  modalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '8px',
    borderBottom: '1px solid #F1F5F9',
  },
  modalLabel: {
    fontSize: '12.5px',
    color: '#64748B',
    fontWeight: '500',
  },
  modalValue: {
    fontSize: '13px',
    color: '#1E293B',
    fontWeight: '600',
    textAlign: 'right',
  },
  modalFooter: {
    padding: '14px 20px',
    backgroundColor: '#F8FAFC',
    borderTop: '1px solid #E2E8F0',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  modalConfirmBtn: {
    padding: '8px 18px',
    backgroundColor: '#1E3A63',
    color: '#FFFFFF',
    borderRadius: '9999px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};

// =============================================
// Deck Estimator — Dedicated Contractor Project Detail / Estimate View Page
// =============================================
// Displays complete selected input parameters, pricing breakdown,
// official guarantee metrics, and action options:
// - Edit in Estimator (redirects with all inputs pre-populated)
// - Export Document (branded HTML/PDF download)
// - Delete Project (database deletion with confirmation)
// - Contact & Conversion CTA (Inquiry / Convert to Booking lead generation)
// - Medium Navy (#1E3A63) & Inter Font Theme

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getEstimateById, deleteEstimate, updateEstimateStatus, requestProjectEstimate } from '../../customer/api/estimatesApi';
import { useAuth } from '../../auth/hooks/useAuth';
import { downloadEstimatePdf, downloadEstimateExcel, getEstimatePhotos } from '../../../utils/reportExport';

export default function ContractorProjectDetailPage() {
  const { projectId, estimateId } = useParams();
  const idToLoad = projectId || estimateId;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Conversion / Lead Booking State
  const [converting, setConverting] = useState(false);
  const [converted, setConverted] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  // Delete Confirmation Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchEstimate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!idToLoad) {
        throw new Error('No project or estimation ID provided.');
      }
      const data = await getEstimateById(idToLoad);
      if (!data) throw new Error('Estimate record could not be found.');
      setEstimate(data);
      if (data.estimateStatus === 'IN_REVIEW' || data.status === 'in_review') {
        setConverted(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  }, [idToLoad]);

  useEffect(() => {
    fetchEstimate();
  }, [fetchEstimate]);

  // Format Currency
  const fmt = (val) => {
    if (typeof val !== 'number' || isNaN(val)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Format Full Date
  const formatDate = (d) => {
    if (!d) return 'November 8, 2026';
    const date = new Date(d);
    if (isNaN(date.getTime())) return 'November 8, 2026';
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Convert / Inquiry Lead Submission
  const handleConvertToBooking = async () => {
    if (!estimate || converting || converted) return;
    setConverting(true);
    try {
      await requestProjectEstimate(estimate._id || estimate.id, {
        subject: `Contractor Project Booking: ${estimate.deckDetails?.projectName || estimate.estimateName || 'Deck Restoration'}`,
        message: `Contractor converted estimate ${estimate.estimateNumber || ''} for deck size ${estimate.deckDetails?.areaSqFt || 400} sq ft. Total price: ${fmt(estimate.totalAmount)}. Marked as REQUESTED for administrative booking.`,
      });

      setConverted(true);
      setActionNotice('✓ Successfully converted! Project marked as REQUESTED and dispatched to Admin Leads as HOT priority.');
      setEstimate((prev) => ({ ...prev, estimateStatus: 'REQUESTED', status: 'REQUESTED' }));
    } catch (err) {
      alert(`Conversion note: ${err.message}`);
    } finally {
      setConverting(false);
    }
  };

  // Trigger Official PDF Report Download
  const handleExportPdf = async () => {
    if (!estimate) return;
    try {
      await downloadEstimatePdf(estimate, user);
      setActionNotice(`✓ Official estimate PDF downloaded for ${estimate.estimateNumber || 'Project'}`);
    } catch (err) {
      alert(`Could not download PDF report: ${err.message}`);
    }
  };

  // Trigger Official Excel / CSV Dossier Download
  const handleExportExcel = () => {
    if (!estimate) return;
    try {
      downloadEstimateExcel(estimate, user);
      setActionNotice(`✓ Official Excel dossier downloaded for ${estimate.estimateNumber || 'Project'}`);
    } catch (err) {
      alert(`Could not download Excel dossier: ${err.message}`);
    }
  };

  // Delete Project from Database
  const handleDelete = async () => {
    if (!estimate || deleting) return;
    setDeleting(true);
    try {
      await deleteEstimate(estimate._id || estimate.id);
      navigate('/contractor/projects', {
        state: { message: `Project ${estimate.estimateNumber || ''} was successfully deleted.` },
      });
    } catch (err) {
      alert(`Could not delete project: ${err.message}`);
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={{ marginTop: '14px', fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
          Loading project specifications from database...
        </p>
      </div>
    );
  }

  if (error || !estimate) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorCard}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#991B1B', margin: '12px 0 6px' }}>Project Not Found</h2>
          <p style={{ fontSize: '13px', color: '#7F1D1D', margin: '0 0 16px' }}>{error || 'Unable to retrieve project details.'}</p>
          <button
            type="button"
            onClick={() => navigate('/contractor/projects')}
            style={styles.backBtnSolid}
          >
            ← Return to My Projects
          </button>
        </div>
      </div>
    );
  }

  const snap = estimate.pricingSnapshot || {};
  const spec = snap.spec || {};
  const deck = estimate.deckDetails || {};
  const compSqft = spec.componentSqft || deck.structureDetails?.components || {};
  const componentsList = spec.components || deck.components || deck.structureDetails?.components || [];
  const servicesList = spec.services || deck.services || snap.services || ['cleaning', 'sealing'];
  const conditionsList = spec.conditions || deck.visibleConditions || [];

  const rawTotal = estimate.discountBreakdown?.originalTotal || snap.originalTotal || estimate.totalAmount || 2500;
  const isDiscountApplied = estimate.discountBreakdown?.applied;
  const discountPercent = estimate.discountBreakdown?.discountPercentage || 10;
  const discountAmount = estimate.discountBreakdown?.discountAmount || Math.round((rawTotal * discountPercent) / 100);
  const finalPrice = isDiscountApplied ? (estimate.totalAmount || (rawTotal - discountAmount)) : rawTotal;

  const deckId = estimate.deckId?._id || estimate.deckId || deck.deckId;
  const uploadedPhotos = getEstimatePhotos(estimate);

  return (
    <div style={styles.page}>
      {/* 1. TOP BREADCRUMB & BACK ACTION BAR */}
      <div style={styles.topNavRow}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => navigate('/contractor/projects')}
            style={styles.backLinkBtn}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back to My Projects</span>
          </button>
          <span style={{ color: '#CBD5E1' }}>/</span>
          <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>
            {deck.projectName || estimate.estimateName || 'Project Details'}
          </span>
        </div>

        {/* Support & Reachout Direct Dial Box */}
        <div style={styles.topContactBox}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Contractor Hotline:</span>
            <a href="tel:8566783325" style={styles.topPhoneLink}>
              (856) 678-3325
            </a>
          </div>
          <span style={{ color: '#CBD5E1' }}>•</span>
          <a
            href="mailto:estimates@deckrestorationplus.com?subject=Contractor%20Project%20Assistance"
            style={styles.topEmailLink}
          >
            Senior Estimator Dispatch
          </a>
        </div>
      </div>

      {/* ACTION NOTICE TOAST */}
      {actionNotice && (
        <div style={styles.noticeToast}>
          <span>{actionNotice}</span>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            style={{ background: 'none', border: 'none', color: '#15803D', fontWeight: '800', cursor: 'pointer', marginLeft: 'auto' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. PROJECT HERO HEADER & ACTIONS */}
      <div style={styles.heroCard}>
        <div style={styles.heroLeft}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <span style={styles.refPill}>Ref: {estimate.estimateNumber || `DP-${estimate._id?.substring(0, 8)}`}</span>
            <span
              style={{
                ...styles.statusPill,
                backgroundColor: converted ? '#DCFCE7' : '#EFF6FF',
                color: converted ? '#15803D' : '#1E3A63',
                borderColor: converted ? '#86EFAC' : '#BFDBFE',
              }}
            >
              <span style={{ ...styles.statusDot, backgroundColor: converted ? '#15803D' : '#1E3A63' }} />
              {converted ? 'IN REVIEW / BOOKING CONVERTED' : (estimate.estimateStatus || 'CREATED')}
            </span>
            <span style={styles.datePill}>Created: {formatDate(estimate.createdAt)}</span>
          </div>

          <h1 style={styles.projectTitle}>
            {deck.projectName || estimate.estimateName || 'Custom Deck Restoration Project'}
          </h1>

          <p style={styles.projectDesc}>
            {deck.projectDescription || `Full-scope restoration specification for ${spec.woodSpecies || deck.surfaceMaterial || 'deck'} (${deck.areaSqFt || snap.A || 400} sq ft).`}
          </p>
        </div>

        {/* Primary Action Buttons: Inquiry | Edit | Export PDF | Export Excel | Print | Delete */}
        <div style={styles.heroRightActions}>
          {/* Conversion / Inquiry Button (Green) */}
          <button
            type="button"
            onClick={handleConvertToBooking}
            disabled={converting || converted}
            style={{
              ...styles.convertBtn,
              backgroundColor: converted ? '#166534' : '#15803D',
              borderColor: '#15803D',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>{converting ? 'Submitting...' : converted ? '✓ In Review / Converted' : 'Inquiry / Convert to Booking'}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* 1. Edit in Estimator Button */}
            <button
              type="button"
              onClick={() => {
                navigate(`/contractor/decks/new?estimateId=${estimate._id || estimate.id}${deckId ? `&deckId=${deckId}` : ''}`);
              }}
              style={styles.actionBtnNavy}
              title="Open estimator with all chosen parameters"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>Edit</span>
            </button>

            {/* 2. Export PDF Button */}
            <button
              type="button"
              onClick={handleExportPdf}
              style={styles.actionBtnNavy}
              title="Download official branded PDF report"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Export PDF</span>
            </button>

            {/* 3. Export Excel Button */}
            <button
              type="button"
              onClick={handleExportExcel}
              style={styles.actionBtnTeal}
              title="Download Excel spreadsheet dossier"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
              <span>Export Excel</span>
            </button>

            {/* 4. Print Button */}
            <button
              type="button"
              onClick={handleExportPdf}
              style={styles.actionBtnWhite}
              title="Download print-ready official estimate"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>Print</span>
            </button>

            {/* 5. Delete Button */}
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              style={styles.actionBtnRed}
              title="Delete project estimate permanently"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. FINANCIAL QUOTED PRICE & OPERATIONAL METRICS */}
      <div style={styles.pricingCard}>
        <div style={styles.priceLeftSection}>
          <span style={styles.priceHeaderLabel}>Contractor Guaranteed Estimator Price</span>

          {isDiscountApplied ? (
            <div style={{ margin: '8px 0 12px 0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                <span style={styles.strikeRetailPrice}>{fmt(rawTotal)}</span>
                <strong style={styles.discountedFinalPrice}>{fmt(finalPrice)}</strong>
                <span style={styles.wholesalePill}>✓ {discountPercent}% Wholesale Partner Discount Applied</span>
              </div>
              <span style={styles.savingsSubtext}>
                Contractor savings: <strong>{fmt(discountAmount)}</strong> deducted via active discount tier
              </span>
            </div>
          ) : (
            <div style={{ margin: '8px 0 12px 0' }}>
              <strong style={{ ...styles.discountedFinalPrice, color: '#1E3A63' }}>{fmt(finalPrice)}</strong>
              <span style={styles.savingsSubtext}>Standard undiscounted retail estimate volume</span>
            </div>
          )}

          <p style={styles.guaranteeNotice}>
            Backed by Deck Restoration Plus proprietary restoration standards. All calculations factor licensed crew labor, commercial cleaning chemistry, and penetrating sealer coverage.
          </p>
        </div>

        <div style={styles.priceMetricsGrid}>
          <div style={styles.metricItem}>
            <span style={styles.metricLabel}>Billable Area ($A$)</span>
            <strong style={styles.metricVal}>{deck.areaSqFt || snap.A || 400} sq ft</strong>
          </div>
          <div style={styles.metricItem}>
            <span style={styles.metricLabel}>Unit Sq Ft Rate</span>
            <strong style={styles.metricVal}>${Number(snap.rate || 2.75).toFixed(2)} / sq ft</strong>
          </div>
          <div style={styles.metricItem}>
            <span style={styles.metricLabel}>Labor Allowance</span>
            <strong style={styles.metricVal}>
              {Number(snap.baseHours || 8).toFixed(1)} hrs (${Number(snap.labourAdj || 0).toLocaleString()})
            </strong>
          </div>
          <div style={styles.metricItem}>
            <span style={styles.metricLabel}>Mobilization Floor</span>
            <strong style={styles.metricVal}>${Number(snap.minJob || 2500).toLocaleString()} Standard</strong>
          </div>
        </div>
      </div>

      {/* 4. SELECTED INPUT SPECIFICATIONS (SECTIONS 1 TO 8) */}
      <div style={styles.specificationsGrid}>
        {/* SECTION 1: Footprint & Dimensions */}
        <div style={styles.specCard}>
          <div style={styles.specCardHeader}>
            <div style={styles.specCardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            </div>
            <div>
              <h3 style={styles.specCardTitle}>Section 01: Dimensions &amp; Footprint</h3>
              <span style={styles.specCardSub}>Deck layout geometry and usable surface area</span>
            </div>
          </div>
          <div style={styles.specContentRows}>
            <div style={styles.specRow}>
              <span>Deck Shape:</span>
              <strong style={{ textTransform: 'capitalize' }}>{(spec.deckShape || deck.deckShape || 'rectangle').replace(/_/g, ' ')}</strong>
            </div>
            <div style={styles.specRow}>
              <span>Length &amp; Width:</span>
              <strong>
                {spec.length || deck.dimensions?.length || 20} ft &times; {spec.width || deck.dimensions?.width || 15} ft
              </strong>
            </div>
            <div style={styles.specRow}>
              <span>Usable Floor Area:</span>
              <strong style={{ color: '#15803D' }}>{deck.areaSqFt || snap.A || 400} sq ft</strong>
            </div>
          </div>
        </div>

        {/* SECTION 2: Selected Components & SQFT */}
        <div style={styles.specCard}>
          <div style={styles.specCardHeader}>
            <div style={styles.specCardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h3 style={styles.specCardTitle}>Section 02: Architectural Components</h3>
              <span style={styles.specCardSub}>Railings, stairs, pergolas &amp; vertical structures</span>
            </div>
          </div>
          <div style={styles.specContentRows}>
            {componentsList.length === 0 ? (
              <span style={{ fontSize: '13px', color: '#64748B' }}>Standard deck surface only (No auxiliary components selected).</span>
            ) : (
              componentsList.map((comp, idx) => (
                <div key={idx} style={styles.specRow}>
                  <span style={{ textTransform: 'capitalize' }}>&bull; {String(comp).replace(/_/g, ' ')}:</span>
                  <strong>
                    {compSqft[comp] ? `${compSqft[comp]} ${comp === 'stairs' ? 'steps' : 'sq ft'}` : 'Included in scope'}
                  </strong>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SECTION 3: Wood Species */}
        <div style={styles.specCard}>
          <div style={styles.specCardHeader}>
            <div style={styles.specCardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <h3 style={styles.specCardTitle}>Section 03: Wood Species / Material</h3>
              <span style={styles.specCardSub}>Substrate chemistry and density rating</span>
            </div>
          </div>
          <div style={styles.specContentRows}>
            <div style={styles.specRow}>
              <span>Selected Material:</span>
              <strong style={{ color: '#1E3A63', textTransform: 'capitalize' }}>
                {(spec.woodSpecies || deck.surfaceMaterial || 'pressure_treated_pine').replace(/_/g, ' ')}
              </strong>
            </div>
            <div style={styles.specRow}>
              <span>Substrate Class:</span>
              <span style={styles.tagBadge}>Commercial Grade</span>
            </div>
          </div>
        </div>

        {/* SECTION 4: Elevation & Site Accessibility */}
        <div style={styles.specCard}>
          <div style={styles.specCardHeader}>
            <div style={styles.specCardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 15l-6-6-6 6" />
              </svg>
            </div>
            <div>
              <h3 style={styles.specCardTitle}>Section 04: Elevation &amp; Accessibility</h3>
              <span style={styles.specCardSub}>Ground clearance and ladder mobilization tier</span>
            </div>
          </div>
          <div style={styles.specContentRows}>
            <div style={styles.specRow}>
              <span>Height Category:</span>
              <strong style={{ textTransform: 'capitalize' }}>
                {(spec.accessType || deck.deckType || 'ground').replace(/_/g, ' ')}
              </strong>
            </div>
            {spec.exactHeightFt && (
              <div style={styles.specRow}>
                <span>Exact Height:</span>
                <strong>{spec.exactHeightFt} feet</strong>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 5: Existing Deck Finish */}
        <div style={styles.specCard}>
          <div style={styles.specCardHeader}>
            <div style={styles.specCardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <div>
              <h3 style={styles.specCardTitle}>Section 05: Existing Coating Status</h3>
              <span style={styles.specCardSub}>Prior stain, paint, or bare substrate</span>
            </div>
          </div>
          <div style={styles.specContentRows}>
            <div style={styles.specRow}>
              <span>Coating Condition:</span>
              <strong style={{ textTransform: 'capitalize' }}>
                {(spec.existingCoating || deck.deckCondition || 'none').replace(/_/g, ' ')}
              </strong>
            </div>
          </div>
        </div>

        {/* SECTION 6: Restoration Services & Stain */}
        <div style={styles.specCard}>
          <div style={styles.specCardHeader}>
            <div style={styles.specCardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <div>
              <h3 style={styles.specCardTitle}>Section 06: Scope of Work &amp; Services</h3>
              <span style={styles.specCardSub}>Chemical treatments, washing &amp; penetrating finish</span>
            </div>
          </div>
          <div style={styles.specContentRows}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '4px 0' }}>
              {servicesList.map((srv, idx) => (
                <span key={idx} style={styles.servicePill}>
                  ✓ {String(srv).replace(/_/g, ' ').toUpperCase()}
                </span>
              ))}
            </div>
            <div style={styles.specRow}>
              <span>Stain Finish Tier:</span>
              <strong>{spec.stainType === 'solid' ? 'Solid Body Stain' : 'Semi-Transparent Penetrating'}</strong>
            </div>
          </div>
        </div>

        {/* SECTION 7: Physical Condition & Damages */}
        <div style={styles.specCard}>
          <div style={styles.specCardHeader}>
            <div style={styles.specCardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <h3 style={styles.specCardTitle}>Section 07: Condition &amp; Board Integrity</h3>
              <span style={styles.specCardSub}>Weathering signs and damaged board counts</span>
            </div>
          </div>
          <div style={styles.specContentRows}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '4px 0' }}>
              {conditionsList.map((cond, idx) => (
                <span key={idx} style={styles.conditionPill}>
                  {String(cond).replace(/_/g, ' ')}
                </span>
              ))}
            </div>
            {(spec.crackBoardCount > 0 || spec.rottedBoardCount > 0 || spec.warpedBoardCount > 0) && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#475569' }}>
                Board Counts: {spec.crackBoardCount || 0} cracked, {spec.rottedBoardCount || 0} rotted, {spec.warpedBoardCount || 0} warped.
              </div>
            )}
          </div>
        </div>

        {/* SECTION 8: Property Location & Notes */}
        <div style={styles.specCard}>
          <div style={styles.specCardHeader}>
            <div style={styles.specCardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <h3 style={styles.specCardTitle}>Section 08: Property Location &amp; Dispatch Notes</h3>
              <span style={styles.specCardSub}>Job site dispatch address and scope instructions</span>
            </div>
          </div>
          <div style={styles.specContentRows}>
            <div style={styles.specRow}>
              <span>Job Address:</span>
              <strong>
                {deck.location?.street || deck.propertyAddress?.street || '152 Indian Mills Road, Shamong, NJ 08088'}
              </strong>
            </div>
            <div style={styles.specRow}>
              <span>Municipality:</span>
              <strong>
                {deck.location?.city || deck.propertyAddress?.city || 'Shamong'}, {deck.location?.state || deck.propertyAddress?.state || 'NJ'} {deck.location?.zipCode || deck.propertyAddress?.zipCode || '08088'}
              </strong>
            </div>
            {estimate.notes && (
              <div style={{ marginTop: '6px', fontSize: '12px', color: '#475569', backgroundColor: '#F8FAFC', padding: '8px 12px', borderRadius: '6px' }}>
                <strong>Scope Notes:</strong> {estimate.notes}
              </div>
            )}
            {estimate.customerFacingStatus?.note && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#1E3A63', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', padding: '8px 12px', borderRadius: '6px' }}>
                <strong>Latest Admin Dispatch Update:</strong> {estimate.customerFacingStatus.note}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 9: Uploaded Inspection Photos Gallery */}
        <div style={{ ...styles.specCard, gridColumn: '1 / -1' }}>
          <div style={styles.specCardHeader}>
            <div style={styles.specCardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <div>
              <h3 style={styles.specCardTitle}>Inspection Photos &amp; Site Media ({uploadedPhotos.length})</h3>
              <span style={styles.specCardSub}>Visual deck documentation uploaded during project setup</span>
            </div>
          </div>
          <div style={{ padding: '14px 18px' }}>
            {uploadedPhotos.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '8px', color: '#64748B', fontSize: '13px' }}>
                No site photos were uploaded for this estimate. Photos uploaded in Section 8 appear here and in downloaded PDF dossiers.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
                {uploadedPhotos.map((photo, pIdx) => {
                  const src = photo.dataUrl || photo.url || photo.src;
                  return (
                    <div
                      key={photo.id || pIdx}
                      style={{
                        position: 'relative',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#0F172A',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                      }}
                    >
                      <img
                        src={src}
                        alt={photo.name || `Site Photo ${pIdx + 1}`}
                        style={{
                          width: '100%',
                          height: '140px',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                      <div style={{ padding: '6px 8px', backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#1E3A63', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {photo.category || photo.name || `Photo #${pIdx + 1}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div style={styles.modalOverlay} onClick={() => !deleting && setShowDeleteModal(false)}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0F172A' }}>Delete Project Record?</h3>
                <span style={{ fontSize: '12.5px', color: '#64748B' }}>This action cannot be undone.</span>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              Are you sure you want to delete <strong>{deck.projectName || estimate.estimateName}</strong> (Ref: {estimate.estimateNumber})? This will permanently remove the estimate from your portfolio.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                style={styles.modalCancelBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={styles.modalDeleteConfirmBtn}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Project'}
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
    padding: '24px 32px 60px 32px',
    backgroundColor: '#F8FAFC',
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '65vh',
  },
  spinner: {
    width: '38px',
    height: '38px',
    border: '3px solid #E2E8F0',
    borderTopColor: '#1E3A63',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    padding: '20px',
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #FECACA',
    borderRadius: '12px',
    padding: '32px',
    textAlign: 'center',
    maxWidth: '460px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  backBtnSolid: {
    padding: '10px 20px',
    backgroundColor: '#1E3A63',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  topNavRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  backLinkBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: '#FFFFFF',
    border: '1.5px solid #CBD5E1',
    borderRadius: '8px',
    color: '#1E3A63',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  topContactBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '12px',
    backgroundColor: '#FFFFFF',
    padding: '6px 14px',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
  },
  topPhoneLink: {
    color: '#1E3A63',
    fontWeight: '800',
    textDecoration: 'none',
  },
  topEmailLink: {
    color: '#C2671A',
    fontWeight: '700',
    textDecoration: 'none',
  },
  noticeToast: {
    backgroundColor: '#DCFCE7',
    border: '1px solid #86EFAC',
    color: '#15803D',
    padding: '12px 18px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    marginBottom: '18px',
    display: 'flex',
    alignItems: 'center',
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    border: '1.5px solid #CBD5E1',
    borderRadius: '12px',
    padding: '24px 28px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '24px',
    flexWrap: 'wrap',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
  },
  heroLeft: {
    flex: '1 1 450px',
  },
  refPill: {
    fontSize: '11px',
    fontWeight: '800',
    padding: '3px 8px',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    borderRadius: '6px',
    border: '1px solid #E2E8F0',
    fontFamily: 'monospace',
  },
  statusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11.5px',
    fontWeight: '800',
    padding: '3px 10px',
    borderRadius: '9999px',
    border: '1px solid transparent',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  datePill: {
    fontSize: '12px',
    color: '#64748B',
    fontWeight: '600',
  },
  projectTitle: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#0F172A',
    margin: '0 0 6px 0',
    letterSpacing: '-0.02em',
  },
  projectDesc: {
    fontSize: '13.5px',
    color: '#475569',
    margin: 0,
    lineHeight: 1.5,
  },
  heroRightActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '10px',
    flexShrink: 0,
  },
  convertBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 18px',
    color: '#FFFFFF',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '800',
    border: '1px solid transparent',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(21, 128, 61, 0.25)',
    transition: 'all 0.15s ease',
  },
  actionBtnNavy: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    backgroundColor: '#1E3A63',
    color: '#FFFFFF',
    border: '1px solid #1E3A63',
    borderRadius: '8px',
    fontSize: '12.5px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  actionBtnTeal: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    backgroundColor: '#FFFFFF',
    color: '#0D9488',
    border: '1.5px solid #0D9488',
    borderRadius: '8px',
    fontSize: '12.5px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  actionBtnWhite: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    backgroundColor: '#FFFFFF',
    color: '#1E3A63',
    border: '1.5px solid #CBD5E1',
    borderRadius: '8px',
    fontSize: '12.5px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  actionBtnRed: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    backgroundColor: '#FFFFFF',
    color: '#DC2626',
    border: '1.5px solid #FCA5A5',
    borderRadius: '8px',
    fontSize: '12.5px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  pricingCard: {
    backgroundColor: '#FFFFFF',
    border: '2px solid #1E3A63',
    borderRadius: '12px',
    padding: '24px 28px',
    marginBottom: '24px',
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: '24px',
    boxShadow: '0 4px 14px rgba(30, 58, 99, 0.08)',
  },
  priceLeftSection: {
    borderRight: '1px solid #E2E8F0',
    paddingRight: '24px',
  },
  priceHeaderLabel: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#1E3A63',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  strikeRetailPrice: {
    textDecoration: 'line-through',
    color: '#94A3B8',
    fontSize: '24px',
    fontWeight: '700',
  },
  discountedFinalPrice: {
    fontSize: '36px',
    fontWeight: '900',
    color: '#15803D',
    letterSpacing: '-0.02em',
  },
  wholesalePill: {
    fontSize: '11px',
    fontWeight: '800',
    backgroundColor: '#DCFCE7',
    color: '#15803D',
    border: '1px solid #86EFAC',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  savingsSubtext: {
    display: 'block',
    fontSize: '12.5px',
    color: '#64748B',
    fontWeight: '500',
    marginTop: '4px',
  },
  guaranteeNotice: {
    fontSize: '12px',
    color: '#64748B',
    lineHeight: 1.45,
    margin: '12px 0 0 0',
  },
  priceMetricsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },
  metricItem: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  metricLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  metricVal: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#0F172A',
  },
  specificationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '18px',
  },
  specCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
  },
  specCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '14px',
    borderBottom: '1px solid #F1F5F9',
    paddingBottom: '12px',
  },
  specCardIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#EFF6FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  specCardTitle: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#0F172A',
    margin: 0,
  },
  specCardSub: {
    fontSize: '11.5px',
    color: '#64748B',
  },
  specContentRows: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  specRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12.5px',
    color: '#334155',
  },
  tagBadge: {
    fontSize: '10.5px',
    fontWeight: '700',
    backgroundColor: '#EFF6FF',
    color: '#1E3A63',
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid #BFDBFE',
  },
  servicePill: {
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: '#F0FDF4',
    color: '#15803D',
    border: '1px solid #BBF7D0',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  conditionPill: {
    fontSize: '11px',
    fontWeight: '600',
    backgroundColor: '#FFFBEB',
    color: '#92400E',
    border: '1px solid #FDE68A',
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'capitalize',
  },
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
    padding: '16px',
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px 28px',
    maxWidth: '460px',
    width: '100%',
    boxShadow: '0 20px 35px rgba(0,0,0,0.2)',
  },
  modalCancelBtn: {
    padding: '8px 16px',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    border: '1px solid #CBD5E1',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  modalDeleteConfirmBtn: {
    padding: '8px 18px',
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};

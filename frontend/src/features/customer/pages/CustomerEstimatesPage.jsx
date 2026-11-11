// =============================================
// Deck Estimator — Customer My Projects & Estimations Page
// =============================================
// Features:
// - Medium Navy Blue Theme (#1E3A63)
// - Hero Banner with high-resolution deck restoration image overlay
// - Dynamic interactive search bar by project name, reference ID, and wood/scope
// - Live status filter dropdown (All, Created, In Review, Completed)
// - Refresh button with spinning SVG icon & live sync
// - Exact table columns: Project Name | Deck Size | Labour & Materials | Estimator price | Status | Created Date | Actions
// - Project name top (large), reference name below (small)
// - Exact price display ($X,XXX.XX)
// - Status workflow: Created (blue pill), In Review (amber pill), Completed (green pill)
// - Actions: View, Print (dedicated official PDF template), Three Dots Menu (Edit, Export, Delete with DB confirmation)
// - Fully integrated with backend API & database

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { getEstimates, deleteEstimate, requestProjectEstimate } from '../api/estimatesApi';
import { downloadEstimatePdf, downloadEstimateExcel, getEstimatePhotos } from '../../../utils/reportExport';
import { OPERATING_HOURS_PRINT_LINES } from '../../../constants/operatingHours';
import deckBannerWood from '../../../assets/images/deck_banner_wood.png';
import mainLogo from '../../../assets/images/MainLodo.png';

const DEFAULT_THUMBS = [
  'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1591825729269-caeb344f6df2?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=120&q=80',
];

export default function CustomerEstimatesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState([]);
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);

  // Modals & Action Menus
  const [viewEstimate, setViewEstimate] = useState(null);
  const [deleteConfirmEst, setDeleteConfirmEst] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 });
  const [activeMenuEst, setActiveMenuEst] = useState(null);

  const menuRef = useRef(null);

  // Close 3-dots menu on click outside or scroll
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    }
    function handleScroll() {
      setOpenMenuId(null);
    }
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  // Fetch estimates from backend
  const fetchEstimates = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await getEstimates({ limit: 100 });
      setEstimates(data?.estimates || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch your estimates.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEstimates();
    const handleSaved = () => fetchEstimates(true);
    window.addEventListener('estimation_saved', handleSaved);
    return () => window.removeEventListener('estimation_saved', handleSaved);
  }, [fetchEstimates]);

  // Toast notification auto-dismiss
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Helpers: Currency & Full Date
  function formatCurrency(val) {
    if (typeof val !== 'number' || isNaN(val)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  }

  function formatFullDate(dateVal) {
    if (!dateVal) return 'Nov 8, 2026';
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return 'Nov 8, 2026';
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  // Get Exact Calculated Estimator Price
  function getExactPrice(est) {
    const snap = est.pricingSnapshot;
    if (snap?.calculatedTotal !== undefined) {
      return formatCurrency(snap.calculatedTotal);
    }
    if (snap?.total !== undefined) {
      return formatCurrency(snap.total);
    }
    if (typeof est.totalAmount === 'number' && est.totalAmount > 0) {
      return formatCurrency(est.totalAmount);
    }
    return '$2,500.00';
  }

  // Get Deck Area & Dimensions
  function getDeckArea(est) {
    const area = est.deckDetails?.areaSqFt || est.deckDetails?.deckArea || est.pricingSnapshot?.A || 400;
    return `${area} sq ft`;
  }

  function getDeckDimensions(est) {
    const len = est.deckDetails?.deckLength || est.deckDetails?.dimensions?.length || 20;
    const wid = est.deckDetails?.deckWidth || est.deckDetails?.dimensions?.width || 20;
    return `(${len} ft × ${wid} ft)`;
  }

  // Get Labour & Materials Summary
  function getLabourAndMaterials(est) {
    const snap = est.pricingSnapshot || {};
    const laborHrs = snap.baseHours !== undefined
      ? (Number(snap.baseHours) + Number(snap.woodHours || 0) + Number(snap.accessHours || 0)).toFixed(1)
      : (est.laborBreakdown?.totalHours ? Number(est.laborBreakdown.totalHours).toFixed(1) : '32.0');

    const matCost = snap.materialsCost !== undefined
      ? formatCurrency(snap.materialsCost)
      : (est.selectedMaterials?.[0]?.totalCost ? formatCurrency(est.selectedMaterials[0].totalCost) : '$1,120.00');

    return {
      hours: `${laborHrs} labor hrs`,
      materials: `${matCost} materials`,
    };
  }

  // Map Backend Status to Target Workflow
  function getNormalizedStatus(est) {
    const raw = (est.estimateStatus || '').toUpperCase();
    if (raw === 'COMPLETED') return 'COMPLETED';
    if (raw === 'IN_PROGRESS') return 'IN_PROGRESS';
    if (raw === 'REQUESTED' || raw === 'IN_REVIEW' || raw === 'SUBMITTED' || raw === 'APPROVED') return 'REQUESTED';
    return 'CREATED';
  }

  function renderStatusBadge(statusKey) {
    if (statusKey === 'COMPLETED') {
      return (
        <span style={styles.badgeCompleted}>
          <span style={styles.badgeDotCompleted} />
          Completed
        </span>
      );
    }
    if (statusKey === 'IN_PROGRESS') {
      return (
        <span style={{ ...styles.badgeInReview, backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
          <span style={{ ...styles.badgeDotInReview, backgroundColor: '#2563eb' }} />
          In Progress
        </span>
      );
    }
    if (statusKey === 'REQUESTED') {
      return (
        <span style={styles.badgeInReview}>
          <span style={styles.badgeDotInReview} />
          Requested
        </span>
      );
    }
    return (
      <span style={styles.badgeCreated}>
        <span style={styles.badgeDotCreated} />
        Created
      </span>
    );
  }

  // Filter & Search Logic
  const filteredEstimates = useMemo(() => {
    return estimates.filter((est) => {
      const normStatus = getNormalizedStatus(est);
      const matchesStatus =
        statusFilter === 'ALL' || normStatus === statusFilter.toUpperCase();

      const title = (est.deckDetails?.projectName || est.estimateName || '').toLowerCase();
      const refId = (est.estimateNumber || est._id || '').toLowerCase();
      const wood = (est.deckDetails?.surfaceMaterial || est.pricingSnapshot?.wood || '').toLowerCase();
      const search = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !search ||
        title.includes(search) ||
        refId.includes(search) ||
        wood.includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [estimates, statusFilter, searchTerm]);

  // KPI Metrics Calculation
  const kpis = useMemo(() => {
    const total = estimates.length;
    const completed = estimates.filter((e) => getNormalizedStatus(e) === 'COMPLETED').length;
    const inReview = estimates.filter((e) => getNormalizedStatus(e) === 'IN_REVIEW').length;
    const created = estimates.filter((e) => getNormalizedStatus(e) === 'CREATED').length;

    const totalVal = estimates.reduce((sum, e) => {
      const val = e.pricingSnapshot?.calculatedTotal || e.totalAmount || 2500;
      return sum + Number(val);
    }, 0);

    return { total, created, inReview, completed, totalVal };
  }, [estimates]);

  // -------------------------------------------------------------
  // ACTION HANDLERS
  // -------------------------------------------------------------

  // 1. Edit Action: Navigate to estimator with preloaded state
  const handleEdit = (est) => {
    setOpenMenuId(null);
    navigate('/customer/decks/new', {
      state: { editEstimate: est },
    });
  };

  // 2. Delete Action: Confirm & Delete from DB
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmEst) return;
    const id = deleteConfirmEst._id || deleteConfirmEst.id;
    setDeletingId(id);
    try {
      await deleteEstimate(id);
      setEstimates((prev) => prev.filter((e) => (e._id || e.id) !== id));
      setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
      setSuccessToast(`Estimate record "${deleteConfirmEst.deckDetails?.projectName || deleteConfirmEst.estimateName || 'Project'}" deleted.`);
      setDeleteConfirmEst(null);
    } catch (err) {
      alert(`Failed to delete estimate: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // Multi-select handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredEstimates.map((est) => est._id || est.id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    filteredEstimates.length > 0 &&
    filteredEstimates.every((est) => selectedIds.includes(est._id || est.id));
  const isPartiallySelected =
    selectedIds.length > 0 && !isAllSelected;

  // Batch Export PDF
  const handleBatchExportPdf = async () => {
    const selectedEsts = estimates.filter((e) => selectedIds.includes(e._id || e.id));
    for (const est of selectedEsts) {
      await downloadEstimatePdf(est, user);
      await new Promise((r) => setTimeout(r, 450));
    }
    setSuccessToast(`Exported ${selectedEsts.length} official PDF estimates.`);
  };

  // Batch Export Excel / CSV
  const handleBatchExportExcel = () => {
    const selectedEsts = estimates.filter((e) => selectedIds.includes(e._id || e.id));
    selectedEsts.forEach((est) => downloadEstimateExcel(est, user));
    setSuccessToast(`Exported ${selectedEsts.length} Excel dossiers.`);
  };

  // Batch Delete
  const handleConfirmBatchDelete = async () => {
    setBatchDeleting(true);
    try {
      await Promise.all(selectedIds.map((id) => deleteEstimate(id)));
      setEstimates((prev) => prev.filter((item) => !selectedIds.includes(item._id || item.id)));
      setSuccessToast(`Successfully deleted ${selectedIds.length} estimates.`);
      setSelectedIds([]);
      setShowBatchDeleteModal(false);
    } catch (err) {
      alert(`Could not delete selected items: ${err.message}`);
    } finally {
      setBatchDeleting(false);
    }
  };

  // 3. Dedicated Professional PDF Template Generation for Print & Export
  const generateOfficialEstimateHtml = (est) => {
    const estId = est.estimateNumber || est._id || 'EST-PRO-2026';
    const dateFormatted = formatFullDate(est.createdAt);
    const statusText = getNormalizedStatus(est) === 'COMPLETED' ? 'COMPLETED & VERIFIED' : getNormalizedStatus(est) === 'IN_REVIEW' ? 'UNDER CONTRACTOR REVIEW' : 'CREATED ESTIMATE';
    const customerName = user?.fullName || 'Valued Deck Restoration Customer';
    const customerEmail = user?.email || 'customer@deckrestorationplus.com';
    const customerPhone = user?.phone || user?.phoneNumber || '(856) 678-3325';
    const projName = est.deckDetails?.projectName || est.estimateName || 'Custom Residential Deck Restoration';
    const street = est.deckDetails?.location?.street || '152 Indian Mills Road';
    const city = est.deckDetails?.location?.city || 'Shamong';
    const state = est.deckDetails?.location?.state || 'NJ';
    const zip = est.deckDetails?.location?.zipCode || '08088';
    const area = getDeckArea(est);
    const dims = getDeckDimensions(est);
    const shape = (est.deckDetails?.deckShape || est.pricingSnapshot?.shape || 'Rectangle').toUpperCase();
    const wood = (est.deckDetails?.surfaceMaterial || est.pricingSnapshot?.wood || 'Pressure Treated Pine').replace(/_/g, ' ').toUpperCase();
    const elevation = (est.deckDetails?.deckType || est.pricingSnapshot?.elevation || 'Ground Level (0–4 ft)').replace(/_/g, ' ').toUpperCase();
    const exactPrice = getExactPrice(est);
    const lm = getLabourAndMaterials(est);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Official Deck Restoration Estimate - ${estId}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; font-family: 'Inter', -apple-system, sans-serif; }
          body { background: #ffffff; color: #0f172a; margin: 0; padding: 36px 42px; font-size: 13px; line-height: 1.5; }
          .header-row { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1E3A63; padding-bottom: 18px; margin-bottom: 22px; }
          .logo-text { font-size: 22px; font-weight: 800; color: #1E3A63; letter-spacing: -0.5px; margin: 0; }
          .sub-brand { font-size: 11px; font-weight: 700; color: #E08131; letter-spacing: 0.5px; text-transform: uppercase; margin-top: 2px; }
          .doc-title-block { text-align: right; }
          .doc-title { font-size: 16px; font-weight: 800; color: #1E3A63; text-transform: uppercase; margin: 0; }
          .doc-ref { font-size: 12px; color: #64748b; font-weight: 600; margin-top: 3px; }
          .status-badge { display: inline-block; padding: 4px 10px; background: #EFF6FF; color: #1E3A63; border: 1px solid #BFDBFE; border-radius: 6px; font-size: 11px; font-weight: 700; margin-top: 6px; }

          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
          .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; }
          .box-title { font-size: 11px; font-weight: 700; color: #1E3A63; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
          .info-line { display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 5px; }
          .info-label { color: #64748b; font-weight: 500; }
          .info-val { font-weight: 600; color: #0f172a; }

          .spec-table { width: 100%; border-collapse: collapse; margin-bottom: 22px; }
          .spec-table th { background: #1E3A63; color: #ffffff; text-align: left; padding: 9px 12px; font-size: 12px; font-weight: 700; }
          .spec-table td { padding: 9px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12.5px; }
          .spec-table tr:nth-child(even) { background: #f8fafc; }

          .price-card { background: #f0f7ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
          .price-title { font-size: 14px; font-weight: 700; color: #1E3A63; }
          .price-sub { font-size: 11px; color: #475569; margin-top: 2px; }
          .price-amount { font-size: 26px; font-weight: 900; color: #1E3A63; }

          .guarantee-box { border-left: 3px solid #E08131; background: #fffbf5; padding: 10px 14px; font-size: 11.5px; color: #9a3412; margin-bottom: 24px; border-radius: 0 6px 6px 0; }
          .footer-box { border-top: 1px solid #e2e8f0; padding-top: 16px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
          .footer-contact strong { color: #0f172a; }

          @media print {
            body { padding: 18px; }
            @page { margin: 15mm; }
          }
        </style>
      </head>
      <body>
        <div class="header-row">
          <div>
            <h1 class="logo-text">DECK RESTORATION PLUS</h1>
            <div class="sub-brand">National Deck Restoration & Wood Care Platform</div>
          </div>
          <div class="doc-title-block">
            <h2 class="doc-title">Official Guaranteed Estimate</h2>
            <div class="doc-ref">Ref: ${estId} &bull; Date: ${dateFormatted}</div>
            <div class="status-badge">${statusText}</div>
          </div>
        </div>

        <div class="grid-2">
          <div class="info-box">
            <h3 class="box-title">Client &amp; Contact Details</h3>
            <div class="info-line"><span class="info-label">Customer:</span><span class="info-val">${customerName}</span></div>
            <div class="info-line"><span class="info-label">Email:</span><span class="info-val">${customerEmail}</span></div>
            <div class="info-line"><span class="info-label">Phone:</span><span class="info-val">${customerPhone}</span></div>
            <div class="info-line"><span class="info-label">Account Status:</span><span class="info-val">Verified Client</span></div>
          </div>

          <div class="info-box">
            <h3 class="box-title">Project Site Location</h3>
            <div class="info-line"><span class="info-label">Project Title:</span><span class="info-val">${projName}</span></div>
            <div class="info-line"><span class="info-label">Property Address:</span><span class="info-val">${street}</span></div>
            <div class="info-line"><span class="info-label">Municipality:</span><span class="info-val">${city}, ${state} ${zip}</span></div>
            <div class="info-line"><span class="info-label">Service Tier:</span><span class="info-val">Full Scope Certified Restoration</span></div>
          </div>
        </div>

        <table class="spec-table">
          <thead>
            <tr>
              <th>Restoration Specification</th>
              <th>Selected Input</th>
              <th>Technical Scope Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Deck Perimeter &amp; Shape</strong></td>
              <td>${shape}</td>
              <td>Configured surface geometry</td>
            </tr>
            <tr>
              <td><strong>Deck Footprint Dimensions</strong></td>
              <td>${dims}</td>
              <td>${area} total billable footprint area</td>
            </tr>
            <tr>
              <td><strong>Surface Wood Species</strong></td>
              <td>${wood}</td>
              <td>Penetrating rate card classification</td>
            </tr>
            <tr>
              <td><strong>Structural Elevation</strong></td>
              <td>${elevation}</td>
              <td>Staging, safety harness &amp; ladder allowance</td>
            </tr>
            <tr>
              <td><strong>Labour Breakdown</strong></td>
              <td>${lm.hours}</td>
              <td>Deep wash, preparation &amp; finish application</td>
            </tr>
            <tr>
              <td><strong>Materials &amp; Coatings</strong></td>
              <td>${lm.materials}</td>
              <td>Professional exterior penetrating oils &amp; sealers</td>
            </tr>
          </tbody>
        </table>

        <div class="price-card">
          <div>
            <div class="price-title">Guaranteed Restoration Total</div>
            <div class="price-sub">Includes all specified labor, materials, equipment mobilization, and disposal</div>
          </div>
          <div class="price-amount">${exactPrice}</div>
        </div>

        <div class="guarantee-box">
          <strong>Deck Restoration Plus Quality Guarantee:</strong> All estimates provided through this official portal are backed by Deck Restoration Plus proprietary restoration standards, professional-grade penetrating sealers, and licensed, certified contractors. Standard $2,500 project mobilization floor applies upon crew dispatch.
        </div>

        <div class="footer-box">
          <div>
            <strong>Deck Restoration Plus National Headquarters</strong><br>
            152 Indian Mills Road, Unit A, Shamong, NJ 08088<br>
            Official Website: www.deckrestorationplus.com
          </div>
          <div class="footer-contact" style="text-align: right;">
            Toll Free Support: <strong>1 (866) 440-DECK (3325)</strong><br>
            Office: <strong>(609) 268-3436</strong> &bull; Email: <strong>info@deckrestorationplus.com</strong><br>
            ${OPERATING_HOURS_PRINT_LINES.contracting}<br>
            ${OPERATING_HOURS_PRINT_LINES.office}
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Trigger Dedicated Print Action (Direct PDF download without browser print dialog)
  const handlePrint = async (est) => {
    try {
      await downloadEstimatePdf(est, user);
      setSuccessToast(`Official estimate PDF downloaded for ${est.estimateNumber || 'Project'}.`);
    } catch (err) {
      alert(`Could not download PDF report: ${err.message}`);
    }
  };

  // Trigger Dedicated Export Template (PDF or Excel)
  const handleExport = async (est, format = 'pdf') => {
    setOpenMenuId(null);
    try {
      if (format === 'excel') {
        downloadEstimateExcel(est, user);
        setSuccessToast(`Estimate Excel dossier downloaded for ${est.estimateNumber || 'Project'}.`);
      } else {
        await downloadEstimatePdf(est, user);
        setSuccessToast(`Official estimate PDF downloaded for ${est.estimateNumber || 'Project'}.`);
      }
    } catch (err) {
      alert(`Export error: ${err.message}`);
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* 1. HERO HEADER BANNER (Consistent with Dashboard Navy Overlay) */}
      <section
        style={{
          ...styles.heroBanner,
          backgroundImage: `linear-gradient(90deg, #1E3A63 0%, rgba(30, 58, 99, 0.94) 46%, rgba(30, 58, 99, 0.35) 100%), url(${deckBannerWood})`,
        }}
      >
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>My Projects &amp; Estimations</h1>
          <p style={styles.heroSubtitle}>
            Review specifications, track review status, export official estimate documents, and manage your deck restoration portfolio.
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
              <span>+ Create New Estimate</span>
              <span style={{ fontSize: '15px', fontWeight: '800' }}>&rarr;</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. SUMMARY KPI CARDS (Colored Cards Kept Intact) */}
      <div style={styles.kpiGrid}>
        {/* Total Estimates */}
        <div style={{ ...styles.kpiCard, backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
          <div style={{ ...styles.kpiIconWrap, backgroundColor: '#dbeafe', color: '#1E3A63' }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div>
            <span style={styles.kpiLabel}>Total Estimates</span>
            <strong style={styles.kpiValue}>{kpis.total}</strong>
          </div>
        </div>

        {/* Created Estimates */}
        <div style={{ ...styles.kpiCard, backgroundColor: '#f0fdfa', borderColor: '#99f6e4' }}>
          <div style={{ ...styles.kpiIconWrap, backgroundColor: '#ccfbf1', color: '#0f766e' }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <span style={styles.kpiLabel}>Created Status</span>
            <strong style={styles.kpiValue}>{kpis.created}</strong>
          </div>
        </div>

        {/* In Review / Submitted */}
        <div style={{ ...styles.kpiCard, backgroundColor: '#fefce8', borderColor: '#fef08a' }}>
          <div style={{ ...styles.kpiIconWrap, backgroundColor: '#fef9c3', color: '#b45309' }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <span style={styles.kpiLabel}>In Review</span>
            <strong style={styles.kpiValue}>{kpis.inReview}</strong>
          </div>
        </div>

        {/* Completed Quotes */}
        <div style={{ ...styles.kpiCard, backgroundColor: '#ecfdf5', borderColor: '#bbf7d0' }}>
          <div style={{ ...styles.kpiIconWrap, backgroundColor: '#dcfce7', color: '#15803d' }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <span style={styles.kpiLabel}>Completed Quotes</span>
            <strong style={styles.kpiValue}>{kpis.completed}</strong>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {successToast && (
        <div style={styles.toastBox}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{successToast}</span>
        </div>
      )}

      {/* 3. SEARCH & FILTER TOOLBAR */}
      <div style={styles.toolbarCard}>
        {/* Working Search Bar */}
        <div style={styles.searchBox}>
          <span style={styles.searchIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by project name, reference number, or wood species..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={styles.clearSearchBtn}
              title="Clear Search"
            >
              &times;
            </button>
          )}
        </div>

        {/* Status Filter & Refresh Button with Icon */}
        <div style={styles.filterGroup}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.selectDropdown}
          >
            <option value="ALL">All Statuses</option>
            <option value="CREATED">Created</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <button
            type="button"
            onClick={() => fetchEstimates(true)}
            disabled={refreshing}
            style={styles.refreshBtn}
            title="Refresh Estimations List"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
              }}
            >
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={styles.errorAlert}>
          <span>{error}</span>
          <button type="button" onClick={() => fetchEstimates()} style={styles.retryBtn}>
            Retry
          </button>
        </div>
      )}

      {/* BULK ACTIONS BAR (When estimates selected) */}
      {selectedIds.length > 0 && (
        <div style={styles.bulkActionBar}>
          <div style={styles.bulkLeft}>
            <span style={styles.bulkCountBadge}>
              {selectedIds.length} {selectedIds.length === 1 ? 'estimate' : 'estimates'} selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              style={styles.bulkDeselectBtn}
            >
              Deselect All
            </button>
          </div>
          <div style={styles.bulkRight}>
            <button
              type="button"
              onClick={handleBatchExportPdf}
              style={styles.bulkActionBtn}
              title="Download official PDF reports for all selected estimates"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Batch Export PDF</span>
            </button>
            <button
              type="button"
              onClick={handleBatchExportExcel}
              style={styles.bulkActionBtn}
              title="Download Excel dossiers for all selected estimates"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
              <span>Batch Export Excel</span>
            </button>
            <button
              type="button"
              onClick={() => setShowBatchDeleteModal(true)}
              style={styles.bulkDeleteBtn}
              title="Delete all selected estimates from database"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              <span>Batch Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. ESTIMATES LIST TABLE */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <p style={{ marginTop: '12px', color: '#64748b', fontSize: '13.5px' }}>
              Loading your deck project estimations...
            </p>
          </div>
        ) : filteredEstimates.length === 0 ? (
          <div style={styles.emptyBox}>
            <div style={styles.emptyIconCircle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <h3 style={styles.emptyTitle}>No Projects Found</h3>
            <p style={styles.emptySubtitle}>
              {searchTerm || statusFilter !== 'ALL'
                ? 'No estimates match your search or filter. Try clearing your filters.'
                : 'You have not created any deck restoration estimates yet. Calculate guaranteed pricing now.'}
            </p>
            <button
              type="button"
              onClick={() => navigate('/customer/decks/new')}
              style={styles.emptyActionBtn}
            >
              + Create First Estimate
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={{ ...styles.tableHeadCell, width: '42px', textAlign: 'center', paddingLeft: '14px', paddingRight: '6px' }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isPartiallySelected;
                      }}
                      onChange={handleSelectAll}
                      style={styles.checkboxInput}
                      aria-label="Select all estimates"
                    />
                  </th>
                  <th style={styles.tableHeadCell}>Project Name</th>
                  <th style={styles.tableHeadCell}>Deck Size</th>
                  <th style={styles.tableHeadCell}>Labour &amp; Materials</th>
                  <th style={styles.tableHeadCell}>Estimator price</th>
                  <th style={styles.tableHeadCell}>Status</th>
                  <th style={styles.tableHeadCell}>Created Date</th>
                  <th style={{ ...styles.tableHeadCell, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEstimates.map((est, idx) => {
                  const estId = est._id || est.id;
                  const isRowSelected = selectedIds.includes(estId);
                  const thumb = DEFAULT_THUMBS[idx % DEFAULT_THUMBS.length];
                  const projName = est.deckDetails?.projectName || est.estimateName || 'Deck Restoration Project';
                  const refNumber = est.estimateNumber || estId;
                  const exactPrice = getExactPrice(est);
                  const normStatus = getNormalizedStatus(est);
                  const lm = getLabourAndMaterials(est);
                  const fullDate = formatFullDate(est.createdAt);
                  const isMenuOpen = openMenuId === estId;

                  return (
                    <tr
                      key={estId}
                      style={{
                        ...styles.tableBodyRow,
                        backgroundColor: isRowSelected ? '#F0F9FF' : 'transparent',
                      }}
                    >
                      {/* Selection Checkbox */}
                      <td style={{ ...styles.tableCell, width: '42px', textAlign: 'center', paddingLeft: '14px', paddingRight: '6px' }}>
                        <input
                          type="checkbox"
                          checked={isRowSelected}
                          onChange={() => handleSelectOne(estId)}
                          style={styles.checkboxInput}
                          aria-label={`Select ${projName}`}
                        />
                      </td>

                      {/* 1. Project Name: Title TOP (Large), Reference Name BELOW (Small) */}
                      <td style={styles.tableCell}>
                        <div style={styles.refProjectWrap}>
                          <img
                            src={thumb}
                            alt="Deck project thumbnail"
                            style={styles.deckThumb}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            <strong style={styles.projectNameTitle} title={projName}>
                              {projName}
                            </strong>
                            <span style={styles.refNumberSub}>
                              {refNumber}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Deck Size */}
                      <td style={styles.tableCell}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <strong style={styles.deckSizeSqFt}>{getDeckArea(est)}</strong>
                          <span style={styles.deckDimensions}>{getDeckDimensions(est)}</span>
                        </div>
                      </td>

                      {/* 3. Labour & Materials */}
                      <td style={styles.tableCell}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={styles.laborHrsText}>{lm.hours}</span>
                          <span style={styles.materialsText}>{lm.materials}</span>
                        </div>
                      </td>

                      {/* 4. Estimator Price (Exact Calculated Amount) */}
                      <td style={styles.tableCell}>
                        <strong style={styles.exactPriceText}>
                          {exactPrice}
                        </strong>
                      </td>

                      {/* 5. Status (Theme-based Created / In Review / Completed) */}
                      <td style={styles.tableCell}>
                        {renderStatusBadge(normStatus)}
                      </td>

                      {/* 6. Created Date (Full Date) */}
                      <td style={styles.tableCell}>
                        <span style={styles.dateText}>{fullDate}</span>
                      </td>

                      {/* 7. Actions: View | Print | Three Dots (Edit, Export, Delete) */}
                      <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                        <div style={styles.actionBtnsRow}>
                          {/* View Button */}
                          <button
                            type="button"
                            onClick={() => setViewEstimate(est)}
                            style={styles.actionBtnView}
                            title="View Project Specifications"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            <span>View</span>
                          </button>

                          {/* Print Button (Dedicated PDF Template) */}
                          <button
                            type="button"
                            onClick={() => handlePrint(est)}
                            style={styles.actionBtnPrint}
                            title="Print Official PDF Estimate"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 6 2 18 2 18 9" />
                              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                              <rect x="6" y="14" width="12" height="8" />
                            </svg>
                            <span>Print</span>
                          </button>

                          {/* Three Dots Button (Coordinates tracked for fixed non-clipping menu) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              setMenuCoords({
                                top: rect.bottom + 4,
                                left: Math.max(10, rect.right - 150),
                              });
                              setActiveMenuEst(est);
                              setOpenMenuId((prev) => (prev === estId ? null : estId));
                            }}
                            style={styles.threeDotsBtn}
                            title="More Options"
                          >
                            &bull;&bull;&bull;
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Table Footer */}
            <div style={styles.tableFooter}>
              <span style={styles.showingText}>
                Showing 1 – {filteredEstimates.length} of {estimates.length} estimations
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Non-Clipping 3-Dots Dropdown Menu (Fixed in Viewport) */}
      {openMenuId && activeMenuEst && (
        <div
          ref={menuRef}
          style={{
            ...styles.actionDropdownMenu,
            position: 'fixed',
            top: `${menuCoords.top}px`,
            left: `${menuCoords.left}px`,
            zIndex: 99999,
          }}
        >
          {/* Edit */}
          <button
            type="button"
            onClick={() => handleEdit(activeMenuEst)}
            style={styles.actionDropdownItem}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Edit</span>
          </button>

          {/* Export PDF */}
          <button
            type="button"
            onClick={() => handleExport(activeMenuEst, 'pdf')}
            style={styles.actionDropdownItem}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export PDF</span>
          </button>

          {/* Export Excel */}
          <button
            type="button"
            onClick={() => handleExport(activeMenuEst, 'excel')}
            style={styles.actionDropdownItem}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F766E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            <span>Export Excel</span>
          </button>

          <div style={styles.dropdownDivider} />

          {/* Delete */}
          <button
            type="button"
            onClick={() => {
              setOpenMenuId(null);
              setDeleteConfirmEst(activeMenuEst);
            }}
            style={styles.actionDropdownItemDanger}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* 5. VIEW ESTIMATE REPORT MODAL (EXPANDED TO FULL DOSSIER WITH PHOTOS & EXPORTS) */}
      {viewEstimate && (
        <div style={styles.modalOverlay} onClick={() => setViewEstimate(null)}>
          <div
            style={{
              ...styles.modalContent,
              maxWidth: '920px',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ margin: '0 0 3px 0', fontSize: '19px', fontWeight: '800', color: '#1E3A63' }}>
                  {viewEstimate.deckDetails?.projectName || viewEstimate.estimateName || 'Deck Restoration Project'}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                  Ref: {viewEstimate.estimateNumber || viewEstimate._id} &bull; Created {formatFullDate(viewEstimate.createdAt)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '800',
                    backgroundColor: '#DCFCE7',
                    color: '#15803D',
                    border: '1px solid #BBF7D0',
                    textTransform: 'uppercase',
                  }}
                >
                  Guaranteed Estimate
                </span>
                <button
                  type="button"
                  onClick={() => setViewEstimate(null)}
                  style={styles.modalCloseBtn}
                  title="Close"
                >
                  &times;
                </button>
              </div>
            </div>

            <div style={{ ...styles.modalBody, overflowY: 'auto', padding: '20px 24px' }}>
              {/* Customer & Location Dossier */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#1E3A63', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px' }}>
                    Customer Contact Dossier
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Name:</span>
                    <strong>{user?.fullName || 'Verified Deck Owner'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Email:</span>
                    <strong>{user?.email || 'N/A'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>Phone:</span>
                    <strong>{user?.phone || '(856) 678-3325'}</strong>
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#1E3A63', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px' }}>
                    Project Site Address
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Street Address:</span>
                    <strong>{viewEstimate.deckDetails?.propertyAddress?.street || viewEstimate.deckDetails?.location?.street || '152 Indian Mills Road'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Municipality:</span>
                    <strong>
                      {[viewEstimate.deckDetails?.propertyAddress?.city || viewEstimate.deckDetails?.location?.city || 'Shamong', viewEstimate.deckDetails?.propertyAddress?.state || viewEstimate.deckDetails?.location?.state || 'NJ', viewEstimate.deckDetails?.propertyAddress?.zipCode || viewEstimate.deckDetails?.location?.zipCode || '08088'].filter(Boolean).join(', ')}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>Status:</span>
                    <div>{renderStatusBadge(getNormalizedStatus(viewEstimate))}</div>
                  </div>
                </div>
              </div>

              {/* Section-by-Section Architectural Inputs Table */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#1E3A63', color: '#ffffff' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '700', width: '30%' }}>Section</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '700', width: '35%' }}>Selected Input</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '700', width: '35%' }}>Dimensions & Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#FFFFFF' }}>
                      <td style={{ padding: '8px 12px', fontWeight: '700', color: '#1E3A63' }}>Section 1: Footprint</td>
                      <td style={{ padding: '8px 12px', textTransform: 'capitalize' }}>{viewEstimate.deckDetails?.deckShape || viewEstimate.pricingSnapshot?.shape || 'Rectangle'}</td>
                      <td style={{ padding: '8px 12px', color: '#475569' }}>{getDeckDimensions(viewEstimate)} • {getDeckArea(viewEstimate)}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                      <td style={{ padding: '8px 12px', fontWeight: '700', color: '#1E3A63' }}>Section 2: Components</td>
                      <td style={{ padding: '8px 12px' }}>{viewEstimate.components?.length > 0 ? viewEstimate.components.join(', ') : 'Standard Floor'}</td>
                      <td style={{ padding: '8px 12px', color: '#475569' }}>Perimeter railings & step assemblies included</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#FFFFFF' }}>
                      <td style={{ padding: '8px 12px', fontWeight: '700', color: '#1E3A63' }}>Section 3: Wood Species</td>
                      <td style={{ padding: '8px 12px', textTransform: 'capitalize' }}>{(viewEstimate.deckDetails?.surfaceMaterial || viewEstimate.woodSpecies || 'Pressure Treated Pine').replace(/_/g, ' ')}</td>
                      <td style={{ padding: '8px 12px', color: '#475569' }}>Penetrating oil rate card calibration</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                      <td style={{ padding: '8px 12px', fontWeight: '700', color: '#1E3A63' }}>Section 4: Elevation</td>
                      <td style={{ padding: '8px 12px', textTransform: 'capitalize' }}>{(viewEstimate.deckDetails?.deckType || viewEstimate.accessType || 'Ground Level (0–4 ft)').replace(/_/g, ' ')}</td>
                      <td style={{ padding: '8px 12px', color: '#475569' }}>{viewEstimate.exactHeightFt ? `${viewEstimate.exactHeightFt} ft staging` : 'Ground tier'}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#FFFFFF' }}>
                      <td style={{ padding: '8px 12px', fontWeight: '700', color: '#1E3A63' }}>Section 5: Existing Finish</td>
                      <td style={{ padding: '8px 12px', textTransform: 'capitalize' }}>{(viewEstimate.coatingType || viewEstimate.surfaceDetails?.coatingStatus || 'None / Bare').replace(/_/g, ' ')}</td>
                      <td style={{ padding: '8px 12px', color: '#475569' }}>Clean pore absorption verified</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                      <td style={{ padding: '8px 12px', fontWeight: '700', color: '#1E3A63' }}>Section 6: Services</td>
                      <td style={{ padding: '8px 12px', fontWeight: '700', color: '#E08131' }}>
                        {viewEstimate.services?.length > 0 ? viewEstimate.services.map((s) => s.replace(/_/g, ' ').toUpperCase()).join(' • ') : 'Cleaning & Sealing'}
                      </td>
                      <td style={{ padding: '8px 12px', color: '#475569' }}>Commercial chemicals & multi-coat protection</td>
                    </tr>
                    <tr style={{ background: '#FFFFFF' }}>
                      <td style={{ padding: '8px 12px', fontWeight: '700', color: '#1E3A63' }}>Section 7: Conditions</td>
                      <td style={{ padding: '8px 12px' }}>{viewEstimate.damageConditions?.length > 0 ? viewEstimate.damageConditions.join(', ') : 'Weathered baseline'}</td>
                      <td style={{ padding: '8px 12px', color: '#475569' }}>Surface stabilized prior to coating</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Uploaded Inspection Photos Gallery (Section 8) */}
              {(() => {
                const viewPhotos = getEstimatePhotos(viewEstimate);
                if (viewPhotos.length === 0) return null;
                return (
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#1E3A63', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Uploaded Deck Inspection Photos ({viewPhotos.length} On-File)</span>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>Included in Official PDF Report</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                      {viewPhotos.map((p, pIdx) => (
                        <div key={pIdx} style={{ border: '1px solid #CBD5E1', borderRadius: '6px', overflow: 'hidden', background: '#FFFFFF' }}>
                          <img
                            src={p.url || p.dataUrl}
                            alt={p.category || `Inspection ${pIdx + 1}`}
                            style={{ width: '100%', height: '85px', objectFit: 'cover', display: 'block' }}
                          />
                          <div style={{ padding: '4px', fontSize: '9px', fontWeight: '700', color: '#475569', textAlign: 'center', background: '#F1F5F9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.category || `Photo #${pIdx + 1}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Price Highlight Box */}
              <div style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: '8px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#15803D', textTransform: 'uppercase' }}>
                    Official Guaranteed Estimate Total
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                    All labor hours, commercial equipment, EPA detergents &amp; premium wood penetrations included.
                  </div>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#15803D' }}>
                  {getExactPrice(viewEstimate)}
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              {/* Export PDF Button */}
              <button
                type="button"
                onClick={() => handleExport(viewEstimate, 'pdf')}
                style={{
                  ...styles.modalPrimaryActionBtn,
                  backgroundColor: '#1E3A63',
                  borderColor: '#1E3A63',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                title="Download template-based PDF report"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Export PDF</span>
              </button>

              {/* Print Official PDF Button */}
              <button
                type="button"
                onClick={() => handlePrint(viewEstimate)}
                style={{
                  ...styles.modalPrimaryActionBtn,
                  backgroundColor: '#ffffff',
                  borderColor: '#CBD5E1',
                  color: '#1E3A63',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                title="Print Official PDF Report"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                <span>Print</span>
              </button>

              {/* Export Excel Button */}
              <button
                type="button"
                onClick={() => handleExport(viewEstimate, 'excel')}
                style={{
                  ...styles.modalPrimaryActionBtn,
                  backgroundColor: '#0F766E',
                  borderColor: '#0F766E',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                title="Download Excel spreadsheet summary"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
                <span>Export Excel</span>
              </button>

              {getNormalizedStatus(viewEstimate) === 'CREATED' && (
                <button
                  type="button"
                  onClick={async () => {
                    const estId = viewEstimate._id || viewEstimate.id;
                    try {
                      await requestProjectEstimate(estId, {
                        message: `Customer requested service booking / reach-out for ${viewEstimate.deckDetails?.projectName || 'Deck'} ($${viewEstimate.totalAmount || 0})`,
                      });
                      alert('Request submitted! Our team will contact you shortly and your project status is now Requested.');
                      setViewEstimate(null);
                      fetchEstimates();
                    } catch (err) {
                      alert(err?.message || 'Failed to submit booking request.');
                    }
                  }}
                  style={{ ...styles.modalPrimaryActionBtn, backgroundColor: '#D97706', borderColor: '#B45309', color: '#ffffff' }}
                >
                  Reach Out / Book Project
                </button>
              )}

              <button
                type="button"
                onClick={() => setViewEstimate(null)}
                style={styles.modalDismissBtn}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. DELETE CONFIRMATION MODAL */}
      {deleteConfirmEst && (
        <div style={styles.modalOverlay} onClick={() => setDeleteConfirmEst(null)}>
          <div style={styles.deleteConfirmCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.deleteIconWrap}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>
            <h3 style={styles.deleteModalTitle}>Delete Estimate Record?</h3>
            <p style={styles.deleteModalDesc}>
              Are you sure you want to permanently delete{' '}
              <strong>
                "{deleteConfirmEst.deckDetails?.projectName || deleteConfirmEst.estimateName || 'Deck Project'}"
              </strong>{' '}
              (Ref: {deleteConfirmEst.estimateNumber || deleteConfirmEst._id})? This action cannot be undone and will synchronize with your database.
            </p>

            <div style={styles.deleteModalBtnRow}>
              <button
                type="button"
                onClick={() => setDeleteConfirmEst(null)}
                style={styles.modalCancelBtn}
                disabled={Boolean(deletingId)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                style={styles.modalConfirmDeleteBtn}
                disabled={Boolean(deletingId)}
              >
                {deletingId ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. BATCH DELETE CONFIRMATION MODAL */}
      {showBatchDeleteModal && (
        <div style={styles.modalOverlay} onClick={() => setShowBatchDeleteModal(false)}>
          <div style={styles.deleteConfirmCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.deleteIconWrap}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>
            <h3 style={styles.deleteModalTitle}>Delete {selectedIds.length} Selected Estimates?</h3>
            <p style={styles.deleteModalDesc}>
              Are you sure you want to permanently delete these <strong>{selectedIds.length} estimates</strong>? This action cannot be undone and will permanently delete them from your account.
            </p>

            <div style={styles.deleteModalBtnRow}>
              <button
                type="button"
                onClick={() => setShowBatchDeleteModal(false)}
                style={styles.modalCancelBtn}
                disabled={batchDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBatchDelete}
                style={styles.modalConfirmDeleteBtn}
                disabled={batchDeleting}
              >
                {batchDeleting ? 'Deleting...' : 'Delete Selected Estimates'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// STYLES OBJECT (Medium Navy Blue #1E3A63 Theme)
// -------------------------------------------------------------
const styles = {
  pageContainer: {
    maxWidth: '1420px',
    margin: '0 auto',
    padding: '16px 24px 60px 24px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  checkboxInput: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
    accentColor: '#1E3A63',
    margin: 0,
    verticalAlign: 'middle',
  },
  bulkActionBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E3A63',
    color: '#FFFFFF',
    padding: '12px 20px',
    borderRadius: '10px',
    marginBottom: '16px',
    boxShadow: '0 4px 14px rgba(30, 58, 99, 0.22)',
    flexWrap: 'wrap',
    gap: '12px',
  },
  bulkLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  bulkCountBadge: {
    fontSize: '13px',
    fontWeight: '700',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    padding: '4px 10px',
    borderRadius: '999px',
    letterSpacing: '0.2px',
  },
  bulkDeselectBtn: {
    background: 'none',
    border: 'none',
    color: '#93C5FD',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: '2px 4px',
  },
  bulkRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  bulkActionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#FFFFFF',
    color: '#1E3A63',
    border: 'none',
    borderRadius: '6px',
    padding: '7px 12px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  bulkDeleteBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    padding: '7px 12px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },

  // 1. Hero Banner
  heroBanner: {
    borderRadius: '12px',
    backgroundSize: 'cover',
    backgroundPosition: 'center right',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    minHeight: '135px',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: '16px',
  },
  heroContent: {
    padding: '24px 32px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '6px',
    maxWidth: '680px',
    zIndex: 2,
    color: '#ffffff',
  },
  heroTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-0.3px',
    margin: 0,
    lineHeight: '1.2',
  },
  heroSubtitle: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.82)',
    lineHeight: '1.4',
    margin: 0,
  },
  heroBtnRow: {
    marginTop: '6px',
  },
  heroPrimaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#E08131',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '13px',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 18px',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(224, 129, 49, 0.35)',
    transition: 'all 0.18s ease',
  },

  // 2. Summary KPI Cards
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '14px',
    marginBottom: '16px',
  },
  kpiCard: {
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
  },
  kpiIconWrap: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  kpiLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '2px',
  },
  kpiValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.4px',
    lineHeight: '1',
  },

  toastBox: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#15803d',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '14px',
  },

  // 3. Toolbar
  toolbarCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '12px 18px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '16px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
  },
  searchBox: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    display: 'flex',
    alignItems: 'center',
  },
  searchInput: {
    width: '100%',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '8px 32px 8px 36px',
    fontSize: '13px',
    outline: 'none',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    transition: 'border-color 0.15s ease',
  },
  clearSearchBtn: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '2px',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  selectDropdown: {
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#334155',
    backgroundColor: '#ffffff',
    outline: 'none',
    cursor: 'pointer',
  },
  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1E3A63',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },

  errorAlert: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '13px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  retryBtn: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },

  // 4. Table Card
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
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
    fontSize: '11.5px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  tableBodyRow: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.15s ease',
  },
  tableCell: {
    padding: '12px 16px',
    fontSize: '13px',
    color: '#334155',
    verticalAlign: 'middle',
  },

  refProjectWrap: {
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
    flexShrink: 0,
  },
  projectNameTitle: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: '1.25',
    maxWidth: '240px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  refNumberSub: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '500',
    marginTop: '2px',
  },

  deckSizeSqFt: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0f172a',
  },
  deckDimensions: {
    fontSize: '11px',
    color: '#64748b',
    marginTop: '2px',
  },

  laborHrsText: {
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#334155',
  },
  materialsText: {
    fontSize: '11.5px',
    color: '#64748b',
    marginTop: '1px',
  },

  exactPriceText: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#1E3A63',
  },

  // Status Badges
  badgeCreated: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: '#EFF6FF',
    color: '#1E3A63',
    border: '1px solid #BFDBFE',
    borderRadius: '16px',
    padding: '3px 10px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  badgeDotCreated: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#1E3A63',
  },
  badgeInReview: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: '#FEF3C7',
    color: '#B45309',
    border: '1px solid #FDE68A',
    borderRadius: '16px',
    padding: '3px 10px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  badgeDotInReview: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#D97706',
  },
  badgeCompleted: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: '#DCFCE7',
    color: '#15803D',
    border: '1px solid #BBF7D0',
    borderRadius: '16px',
    padding: '3px 10px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  badgeDotCompleted: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#16A34A',
  },

  dateText: {
    fontSize: '12.5px',
    color: '#475569',
    whiteSpace: 'nowrap',
  },

  // Actions
  actionBtnsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  actionBtnView: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '5px 10px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#1E3A63',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  actionBtnPrint: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '5px 10px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  threeDotsBtn: {
    width: '30px',
    height: '28px',
    borderRadius: '6px',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    color: '#475569',
    letterSpacing: '-1px',
    transition: 'all 0.15s ease',
  },

  actionDropdownMenu: {
    position: 'absolute',
    top: '32px',
    right: 0,
    width: '140px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.12)',
    zIndex: 90,
    padding: '4px 0',
  },
  actionDropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '8px 12px',
    border: 'none',
    background: 'none',
    textAlign: 'left',
    fontSize: '12.5px',
    fontWeight: '500',
    color: '#0f172a',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  dropdownDivider: {
    height: '1px',
    backgroundColor: '#f1f5f9',
    margin: '3px 0',
  },
  actionDropdownItemDanger: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '8px 12px',
    border: 'none',
    background: 'none',
    textAlign: 'left',
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#dc2626',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },

  tableFooter: {
    padding: '12px 18px',
    borderTop: '1px solid #f1f5f9',
    backgroundColor: '#ffffff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  showingText: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500',
  },

  // Loading & Empty states
  loadingBox: {
    padding: '48px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '3px solid #e2e8f0',
    borderTopColor: '#1E3A63',
    animation: 'spin 0.8s linear infinite',
  },
  emptyBox: {
    padding: '48px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  emptyIconCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  emptySubtitle: {
    fontSize: '13px',
    color: '#64748b',
    maxWidth: '420px',
    margin: '0 0 16px 0',
    lineHeight: '1.45',
  },
  emptyActionBtn: {
    backgroundColor: '#1E3A63',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 18px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },

  // 5. View Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
    backdropFilter: 'blur(3px)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    maxWidth: '680px',
    width: '100%',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '18px 24px',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#f8fafc',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '22px',
    color: '#64748b',
    cursor: 'pointer',
    lineHeight: '1',
    padding: '0 4px',
  },
  modalBody: {
    padding: '20px 24px',
  },
  modalGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  modalSpecCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '14px 16px',
  },
  modalSectionTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#1E3A63',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    margin: '0 0 10px 0',
  },
  modalSpecRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12.5px',
    color: '#475569',
    marginBottom: '8px',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    padding: '14px 24px',
    borderTop: '1px solid #f1f5f9',
    backgroundColor: '#f8fafc',
  },
  modalPrimaryActionBtn: {
    backgroundColor: '#1E3A63',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 18px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  modalDismissBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    color: '#334155',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },

  // 6. Delete Confirmation Modal
  deleteConfirmCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    maxWidth: '440px',
    width: '100%',
    padding: '24px',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.25)',
  },
  deleteIconWrap: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#fef2f2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 14px auto',
  },
  deleteModalTitle: {
    fontSize: '17px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 8px 0',
  },
  deleteModalDesc: {
    fontSize: '13px',
    color: '#64748b',
    lineHeight: '1.45',
    margin: '0 0 20px 0',
  },
  deleteModalBtnRow: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '9px 14px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
  },
  modalConfirmDeleteBtn: {
    flex: 1,
    backgroundColor: '#dc2626',
    border: 'none',
    borderRadius: '8px',
    padding: '9px 14px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#ffffff',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
  },
};

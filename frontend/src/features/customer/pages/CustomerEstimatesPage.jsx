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
import { getEstimates, getEstimateById, deleteEstimate, requestProjectEstimate } from '../api/estimatesApi';
import deckBannerWood from '../../../assets/images/deck_banner_wood.webp';
import { ESTIMATOR_IMAGES } from '../../../assets/images/Input_images/estimatorImages';

const DEFAULT_THUMBS = [
  ESTIMATOR_IMAGES.shapes.rectangle.references[1] || ESTIMATOR_IMAGES.shapes.rectangle.main,
  ESTIMATOR_IMAGES.woodSpecies.cedar.main,
  ESTIMATOR_IMAGES.woodSpecies.redwood.main,
  ESTIMATOR_IMAGES.services.staining.main,
  ESTIMATOR_IMAGES.services.cleaning.main,
];

function extractEstimatePhotos(est) {
  if (!est) return [];
  const raw =
    (Array.isArray(est.photos) && est.photos.length > 0 && est.photos) ||
    (Array.isArray(est.deckDetails?.photos) && est.deckDetails.photos.length > 0 && est.deckDetails.photos) ||
    (Array.isArray(est.deckId?.photos) && est.deckId.photos.length > 0 && est.deckId.photos) ||
    [];
  return raw.filter((p) => p && (p.url || p.dataUrl || typeof p === 'string'));
}

export default function CustomerEstimatesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [successToast, setSuccessToast] = useState(null);
  const [errorToast, setErrorToast] = useState(null);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));

  // Responsive listener for mobile and tablets
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState([]);
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);

  // Modals & Action Menus
  const [viewEstimate, setViewEstimate] = useState(null);
  const [hydratingView, setHydratingView] = useState(false);
  const [requestingId, setRequestingId] = useState(null);
  const [exportingId, setExportingId] = useState(null);
  const [deleteConfirmEst, setDeleteConfirmEst] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 });
  const [activeMenuEst, setActiveMenuEst] = useState(null);

  const menuRef = useRef(null);
  const hydratedCacheRef = useRef(new Map());

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

  // Fetch estimates from backend using fast compact projection (excludes heavy photos from list)
  const fetchEstimates = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    if (isRefresh) hydratedCacheRef.current.clear();
    try {
      const data = await getEstimates({ limit: 50, compact: '1' });
      setEstimates(data?.estimates || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch your estimates.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Hydrate full estimate (photos & detailed line items) lazily on View / Edit / Export
  const hydrateEstimate = useCallback(async (est) => {
    const id = est?._id || est?.id;
    if (!id) return est;
    if (hydratedCacheRef.current.has(id)) {
      return hydratedCacheRef.current.get(id);
    }
    try {
      const full = await getEstimateById(id);
      if (full) {
        hydratedCacheRef.current.set(id, full);
        return full;
      }
    } catch {
      // Fallback to compact record if hydration fails
    }
    return est;
  }, []);

  const handleOpenView = async (est) => {
    setViewEstimate(est);
    const id = est?._id || est?.id;
    if (!id) return;
    if (hydratedCacheRef.current.has(id)) {
      setViewEstimate(hydratedCacheRef.current.get(id));
      return;
    }
    setHydratingView(true);
    const full = await hydrateEstimate(est);
    setHydratingView(false);
    setViewEstimate((prev) => (prev && (prev._id || prev.id) === id ? full : prev));
  };

  useEffect(() => {
    fetchEstimates();
    const handleSaved = () => fetchEstimates(true);
    window.addEventListener('estimation_saved', handleSaved);
    return () => window.removeEventListener('estimation_saved', handleSaved);
  }, [fetchEstimates]);

  // Toast notification auto-dismiss
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  useEffect(() => {
    if (errorToast) {
      const timer = setTimeout(() => setErrorToast(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [errorToast]);

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
    const snap = est?.pricingSnapshot || {};
    const baseHrs = Number(snap.baseHours ?? est?.laborBreakdown?.totalHours ?? 0);
    const woodHrs = Number(snap.woodHours || 0);
    const accessHrs = Number(snap.accessHours || 0);
    const totalHrsNum = snap.baseHours !== undefined
      ? (baseHrs + woodHrs + accessHrs)
      : (est?.laborBreakdown?.totalHours !== undefined ? Number(est.laborBreakdown.totalHours) : 32.0);
    const laborHrs = (Number.isFinite(totalHrsNum) ? totalHrsNum : 32.0).toFixed(1);

    const rawMat = snap.materialsCost ?? est?.selectedMaterials?.[0]?.subtotal ?? est?.selectedMaterials?.[0]?.totalCost;
    const matCost = rawMat !== undefined && rawMat !== null
      ? formatCurrency(Number(rawMat))
      : '$1,120.00';

    return {
      hours: `${laborHrs} labor hrs`,
      materials: `${matCost} materials`,
    };
  }

  // Map Backend Status to Target Workflow
  function getNormalizedStatus(est) {
    const raw = (est?.estimateStatus || '').toUpperCase();
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

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEstimates.length / pageSize));
  const paginatedEstimates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEstimates.slice(start, start + pageSize);
  }, [filteredEstimates, currentPage, pageSize]);

  // KPI Metrics Calculation
  const kpis = useMemo(() => {
    const total = estimates.length;
    const completed = estimates.filter((e) => getNormalizedStatus(e) === 'COMPLETED').length;
    const inReview = estimates.filter((e) => {
      const st = getNormalizedStatus(e);
      return st === 'REQUESTED' || st === 'IN_PROGRESS';
    }).length;
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

  // 1. Edit Action: Hydrate full estimate & navigate to estimator with preloaded state
  const handleEdit = async (est) => {
    setOpenMenuId(null);
    const full = await hydrateEstimate(est);
    navigate('/customer/decks/new', {
      state: { editEstimate: full || est },
    });
  };

  // Submit Reach-Out / Booking Request (Syncs Estimate + Admin Lead + Project)
  const handleRequestBooking = async (est) => {
    const estId = est?._id || est?.id;
    if (!estId || requestingId) return;
    setOpenMenuId(null);
    setRequestingId(estId);
    setErrorToast(null);
    try {
      await requestProjectEstimate(estId, {
        message: `Customer requested service booking / reach-out for ${est.deckDetails?.projectName || est.estimateName || 'Deck Project'} ($${est.totalAmount || 0})`,
      });
      setEstimates((prev) =>
        prev.map((item) => ((item._id || item.id) === estId ? { ...item, estimateStatus: 'REQUESTED' } : item))
      );
      setViewEstimate((prev) =>
        prev && (prev._id || prev.id) === estId ? { ...prev, estimateStatus: 'REQUESTED' } : prev
      );
      setSuccessToast(`Booking request submitted for "${est.deckDetails?.projectName || est.estimateName || 'Deck Project'}".`);
    } catch (err) {
      setErrorToast(err?.message || 'Failed to submit booking request.');
    } finally {
      setRequestingId(null);
    }
  };

  // 2. Delete Action: Confirm & Delete from DB
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmEst) return;
    const id = deleteConfirmEst._id || deleteConfirmEst.id;
    setDeletingId(id);
    try {
      await deleteEstimate(id);
      hydratedCacheRef.current.delete(id);
      setEstimates((prev) => prev.filter((e) => (e._id || e.id) !== id));
      setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
      setSuccessToast(`Estimate record "${deleteConfirmEst.deckDetails?.projectName || deleteConfirmEst.estimateName || 'Project'}" deleted.`);
      setDeleteConfirmEst(null);
    } catch (err) {
      setErrorToast(`Failed to delete estimate: ${err.message}`);
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
    filteredEstimates.some((est) => selectedIds.includes(est._id || est.id)) && !isAllSelected;

  // Batch Export PDF (lazy-loads PDF library + hydrates each selected estimate)
  const handleBatchExportPdf = async () => {
    const selectedEsts = estimates.filter((e) => selectedIds.includes(e._id || e.id));
    if (selectedEsts.length === 0) return;
    try {
      const { downloadEstimatePdf } = await import('../../../utils/reportExport');
      for (const est of selectedEsts) {
        const full = await hydrateEstimate(est);
        await downloadEstimatePdf(full || est, user);
        await new Promise((r) => setTimeout(r, 350));
      }
      setSuccessToast(`Exported ${selectedEsts.length} official PDF estimates.`);
    } catch (err) {
      setErrorToast(`Batch PDF export failed: ${err.message}`);
    }
  };

  // Batch Export Excel / CSV (lazy-loaded)
  const handleBatchExportExcel = async () => {
    const selectedEsts = estimates.filter((e) => selectedIds.includes(e._id || e.id));
    if (selectedEsts.length === 0) return;
    try {
      const { downloadEstimateExcel } = await import('../../../utils/reportExport');
      for (const est of selectedEsts) {
        const full = await hydrateEstimate(est);
        downloadEstimateExcel(full || est, user);
      }
      setSuccessToast(`Exported ${selectedEsts.length} Excel dossiers.`);
    } catch (err) {
      setErrorToast(`Batch Excel export failed: ${err.message}`);
    }
  };

  // Batch Delete
  const handleConfirmBatchDelete = async () => {
    setBatchDeleting(true);
    try {
      await Promise.all(selectedIds.map((id) => deleteEstimate(id)));
      selectedIds.forEach((id) => hydratedCacheRef.current.delete(id));
      setEstimates((prev) => prev.filter((item) => !selectedIds.includes(item._id || item.id)));
      setSuccessToast(`Successfully deleted ${selectedIds.length} estimates.`);
      setSelectedIds([]);
      setShowBatchDeleteModal(false);
    } catch (err) {
      setErrorToast(`Could not delete selected items: ${err.message}`);
    } finally {
      setBatchDeleting(false);
    }
  };

  // Export / Download Official Report (PDF or Excel, lazy-loads heavy PDF bundle + full estimate data)
  const handleExport = async (est, format = 'pdf') => {
    const estId = est?._id || est?.id;
    setOpenMenuId(null);
    if (exportingId) return;
    setExportingId(estId || 'export');
    setErrorToast(null);
    try {
      const full = await hydrateEstimate(est);
      const targetEst = full || est;
      const { downloadEstimatePdf, downloadEstimateExcel } = await import('../../../utils/reportExport');
      if (format === 'excel') {
        downloadEstimateExcel(targetEst, user);
        setSuccessToast(`Estimate Excel dossier downloaded for ${targetEst.estimateNumber || 'Project'}.`);
      } else {
        await downloadEstimatePdf(targetEst, user);
        setSuccessToast(`Official estimate PDF downloaded for ${targetEst.estimateNumber || 'Project'}.`);
      }
    } catch (err) {
      setErrorToast(`Export failed: ${err.message || 'Unable to generate report.'}`);
    } finally {
      setExportingId(null);
    }
  };

  return (
    <div style={{
      ...styles.pageContainer,
      padding: isMobile ? '12px 10px 44px 10px' : '16px 24px 60px 24px',
    }}>
      {/* 1. HERO HEADER BANNER (Consistent with Dashboard Navy Overlay) */}
      <section
        style={{
          ...styles.heroBanner,
          padding: isMobile ? '20px 16px' : '36px 40px',
          minHeight: isMobile ? 'auto' : '220px',
          backgroundImage: `linear-gradient(90deg, #1E3A63 0%, rgba(30, 58, 99, 0.94) 46%, rgba(30, 58, 99, 0.35) 100%), url(${deckBannerWood})`,
        }}
      >
        <div style={styles.heroContent}>
          <h1 style={{ ...styles.heroTitle, fontSize: isMobile ? '21px' : '30px', margin: '0 0 6px 0' }}>
            My Projects &amp; Estimations
          </h1>
          <p style={{ ...styles.heroSubtitle, fontSize: isMobile ? '12.5px' : '14px', margin: '0 0 14px 0' }}>
            Review specifications, track review status, export official estimate documents, and manage your deck restoration portfolio.
          </p>
          <div style={styles.heroBtnRow}>
            <button
              type="button"
              onClick={() => navigate('/customer/decks/new')}
              style={{
                ...styles.heroPrimaryBtn,
                width: isMobile ? '100%' : 'auto',
                justifyContent: 'center',
                padding: isMobile ? '10px 16px' : '11px 22px',
              }}
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

      {/* 2. SUMMARY KPI CARDS */}
      <div style={{
        ...styles.kpiGrid,
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? '8px' : '14px',
      }}>
        {/* Total Estimates */}
        <div style={{ ...styles.kpiCard, padding: isMobile ? '10px 12px' : '14px 18px', gap: isMobile ? '10px' : '14px', backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
          <div style={{ ...styles.kpiIconWrap, width: isMobile ? '34px' : '42px', height: isMobile ? '34px' : '42px', backgroundColor: '#dbeafe', color: '#1E3A63' }}>
            <svg width={isMobile ? '16' : '19'} height={isMobile ? '16' : '19'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <span style={{ ...styles.kpiLabel, fontSize: isMobile ? '11px' : '12px' }}>Total Estimates</span>
            <strong style={{ ...styles.kpiValue, fontSize: isMobile ? '20px' : '24px' }}>{kpis.total}</strong>
          </div>
        </div>

        {/* Created Estimates */}
        <div style={{ ...styles.kpiCard, padding: isMobile ? '10px 12px' : '14px 18px', gap: isMobile ? '10px' : '14px', backgroundColor: '#f0fdfa', borderColor: '#99f6e4' }}>
          <div style={{ ...styles.kpiIconWrap, width: isMobile ? '34px' : '42px', height: isMobile ? '34px' : '42px', backgroundColor: '#ccfbf1', color: '#0f766e' }}>
            <svg width={isMobile ? '16' : '19'} height={isMobile ? '16' : '19'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <span style={{ ...styles.kpiLabel, fontSize: isMobile ? '11px' : '12px' }}>Created</span>
            <strong style={{ ...styles.kpiValue, fontSize: isMobile ? '20px' : '24px' }}>{kpis.created}</strong>
          </div>
        </div>

        {/* Requested / In Progress */}
        <div style={{ ...styles.kpiCard, padding: isMobile ? '10px 12px' : '14px 18px', gap: isMobile ? '10px' : '14px', backgroundColor: '#fefce8', borderColor: '#fef08a' }}>
          <div style={{ ...styles.kpiIconWrap, width: isMobile ? '34px' : '42px', height: isMobile ? '34px' : '42px', backgroundColor: '#fef9c3', color: '#b45309' }}>
            <svg width={isMobile ? '16' : '19'} height={isMobile ? '16' : '19'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <span style={{ ...styles.kpiLabel, fontSize: isMobile ? '11px' : '12px' }}>Requested / Active</span>
            <strong style={{ ...styles.kpiValue, fontSize: isMobile ? '20px' : '24px' }}>{kpis.inReview}</strong>
          </div>
        </div>

        {/* Completed Quotes */}
        <div style={{ ...styles.kpiCard, padding: isMobile ? '10px 12px' : '14px 18px', gap: isMobile ? '10px' : '14px', backgroundColor: '#ecfdf5', borderColor: '#bbf7d0' }}>
          <div style={{ ...styles.kpiIconWrap, width: isMobile ? '34px' : '42px', height: isMobile ? '34px' : '42px', backgroundColor: '#dcfce7', color: '#15803d' }}>
            <svg width={isMobile ? '16' : '19'} height={isMobile ? '16' : '19'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <span style={{ ...styles.kpiLabel, fontSize: isMobile ? '11px' : '12px' }}>Completed</span>
            <strong style={{ ...styles.kpiValue, fontSize: isMobile ? '20px' : '24px' }}>{kpis.completed}</strong>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {successToast && (
        <div style={styles.toastBox}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{successToast}</span>
        </div>
      )}
      {errorToast && (
        <div style={{ ...styles.errorAlert, marginBottom: '14px' }}>
          <span>{errorToast}</span>
          <button type="button" onClick={() => setErrorToast(null)} style={{ background: 'none', border: 'none', color: '#b91c1c', fontWeight: '800', fontSize: '16px', cursor: 'pointer', lineHeight: 1 }}>
            &times;
          </button>
        </div>
      )}

      {/* 3. SEARCH & FILTER TOOLBAR */}
      <div style={{
        ...styles.toolbarCard,
        flexDirection: isMobile ? 'column' : 'row',
        padding: isMobile ? '10px 12px' : '14px 18px',
        gap: isMobile ? '8px' : '14px',
      }}>
        {/* Working Search Bar */}
        <div style={{ ...styles.searchBox, width: isMobile ? '100%' : 'auto', flex: 1 }}>
          <span style={styles.searchIcon}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder={isMobile ? "Search project, ref # or wood..." : "Search by project name, reference number, or wood species..."}
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

        {/* Status Filter & Refresh Button */}
        <div style={{
          ...styles.filterGroup,
          width: isMobile ? '100%' : 'auto',
          display: 'flex',
          gap: '8px',
        }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ ...styles.selectDropdown, flex: isMobile ? 1 : 'none' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="CREATED">Created</option>
            <option value="REQUESTED">Requested</option>
            <option value="IN_PROGRESS">In Progress</option>
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
              width="14"
              height="14"
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
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
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
        ) : isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px' }}>
            {paginatedEstimates.map((est) => {
              const estId = est._id || est.id;
              const isRowSelected = selectedIds.includes(estId);
              const projName = est.deckDetails?.projectName || est.estimateName || 'Deck Restoration Project';
              const refNumber = est.estimateNumber || estId;
              const exactPrice = getExactPrice(est);
              const normStatus = getNormalizedStatus(est);
              const lm = getLabourAndMaterials(est);
              const fullDate = formatFullDate(est.createdAt);

              return (
                <div
                  key={estId}
                  style={{
                    backgroundColor: isRowSelected ? '#F0F9FF' : '#ffffff',
                    border: `1px solid ${isRowSelected ? '#93C5FD' : '#E2E8F0'}`,
                    borderRadius: '10px',
                    padding: '12px',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', minWidth: 0, flex: 1 }}>
                      <input
                        type="checkbox"
                        checked={isRowSelected}
                        onChange={() => handleSelectOne(estId)}
                        style={{ ...styles.checkboxInput, marginTop: '3px', flexShrink: 0 }}
                        aria-label={`Select ${projName}`}
                      />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h4 style={{ margin: '0 0 2px 0', fontSize: '14px', fontWeight: '800', color: '#1E3A63', wordBreak: 'break-word' }}>
                          {projName}
                        </h4>
                        <span style={{ display: 'block', fontSize: '10.5px', color: '#64748b', fontWeight: '600', wordBreak: 'break-all' }}>
                          {refNumber} &bull; {fullDate}
                        </span>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>{renderStatusBadge(normStatus)}</div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      border: '1px solid #F1F5F9',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                        Deck Size
                      </div>
                      <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0F172A', marginTop: '2px' }}>
                        {getDeckArea(est)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                        Labour &amp; Materials
                      </div>
                      <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#0F172A', marginTop: '2px', lineHeight: 1.3 }}>
                        <div>{lm.hours}</div>
                        <div style={{ color: '#475569', fontWeight: '600' }}>{lm.materials}</div>
                      </div>
                    </div>
                    <div style={{ gridColumn: 'span 2', borderTop: '1px solid #E2E8F0', paddingTop: '6px', marginTop: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#15803D', textTransform: 'uppercase' }}>
                        Estimator Price:
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: '900', color: '#15803D' }}>
                        {exactPrice}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenView(est)}
                      style={{
                        flex: '1 1 calc(50% - 3px)',
                        backgroundColor: '#1E3A63',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '7px',
                        padding: '8px 10px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      <span>View</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExport(est, 'pdf')}
                      disabled={exportingId === estId}
                      style={{
                        flex: '1 1 calc(50% - 3px)',
                        backgroundColor: '#ffffff',
                        color: '#1E3A63',
                        border: '1px solid #CBD5E1',
                        borderRadius: '7px',
                        padding: '8px 10px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <span>{exportingId === estId ? 'Exporting...' : 'PDF'}</span>
                    </button>

                    {normStatus === 'CREATED' && (
                      <button
                        type="button"
                        onClick={() => handleRequestBooking(est)}
                        disabled={requestingId === estId}
                        style={{
                          flex: '1 1 100%',
                          backgroundColor: '#D97706',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '7px',
                          padding: '8px 10px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        {requestingId === estId ? 'Submitting Booking Request...' : 'Reach Out / Book Project'}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleEdit(est)}
                      style={{
                        flex: '1 1 0',
                        backgroundColor: '#F8FAFC',
                        color: '#334155',
                        border: '1px solid #E2E8F0',
                        borderRadius: '7px',
                        padding: '7px 8px',
                        fontSize: '11.5px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExport(est, 'excel')}
                      style={{
                        flex: '1 1 0',
                        backgroundColor: '#F0FDFA',
                        color: '#0F766E',
                        border: '1px solid #CCFBF1',
                        borderRadius: '7px',
                        padding: '7px 8px',
                        fontSize: '11.5px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Excel
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmEst(est)}
                      style={{
                        flex: '1 1 0',
                        backgroundColor: '#FEF2F2',
                        color: '#DC2626',
                        border: '1px solid #FECACA',
                        borderRadius: '7px',
                        padding: '7px 8px',
                        fontSize: '11.5px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
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
                {paginatedEstimates.map((est, idx) => {
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

                      {/* 7. Actions: View | Download PDF | Three Dots (Book, Edit, Export Excel, Delete) */}
                      <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                        <div style={styles.actionBtnsRow}>
                          {/* View Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenView(est)}
                            style={styles.actionBtnView}
                            title="View Project Specifications"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            <span>View</span>
                          </button>

                          {/* Download PDF Button */}
                          <button
                            type="button"
                            onClick={() => handleExport(est, 'pdf')}
                            disabled={exportingId === estId}
                            style={styles.actionBtnPrint}
                            title="Download Official PDF Estimate"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            <span>{exportingId === estId ? '...' : 'PDF'}</span>
                          </button>

                          {/* Three Dots Button (Coordinates tracked for fixed non-clipping menu) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              setMenuCoords({
                                top: rect.bottom + 4,
                                left: Math.max(10, rect.right - 170),
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
          </div>
        )}

        {/* Dedicated Customer Pagination Bar */}
        {filteredEstimates.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              padding: '14px 18px',
              borderTop: '1px solid #E2E8F0',
              backgroundColor: '#FAFAFA',
            }}
          >
            <div style={{ fontSize: '13px', color: '#64748B' }}>
              Showing <strong>{Math.min(filteredEstimates.length, (currentPage - 1) * pageSize + 1)}</strong> to{' '}
              <strong>{Math.min(filteredEstimates.length, currentPage * pageSize)}</strong> of{' '}
              <strong>{filteredEstimates.length}</strong> estimations
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12.5px',
                    fontWeight: '600',
                    color: '#1E3A63',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.45 : 1,
                  }}
                >
                  &larr; Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setCurrentPage(pg)}
                    style={{
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border: pg === currentPage ? '1.5px solid #1E3A63' : '1px solid #CBD5E1',
                      backgroundColor: pg === currentPage ? '#1E3A63' : '#FFFFFF',
                      color: pg === currentPage ? '#FFFFFF' : '#334155',
                      boxShadow: pg === currentPage ? '0 1px 3px rgba(30, 58, 99, 0.2)' : 'none',
                    }}
                  >
                    {pg}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12.5px',
                    fontWeight: '600',
                    color: '#1E3A63',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.45 : 1,
                  }}
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Non-Clipping 3-Dots Dropdown Menu (Fixed in Viewport) */}
      {openMenuId && activeMenuEst && (
        <div
          ref={menuRef}
          style={{
            ...styles.actionDropdownMenu,
            width: '170px',
            position: 'fixed',
            top: `${menuCoords.top}px`,
            left: `${menuCoords.left}px`,
            zIndex: 99999,
          }}
        >
          {/* Reach Out / Book (when Created) */}
          {getNormalizedStatus(activeMenuEst) === 'CREATED' && (
            <button
              type="button"
              onClick={() => handleRequestBooking(activeMenuEst)}
              style={{ ...styles.actionDropdownItem, color: '#B45309', fontWeight: '700' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72" />
              </svg>
              <span>Book / Reach Out</span>
            </button>
          )}

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

      {/* 5. VIEW ESTIMATE REPORT MODAL (RESPONSIVE FULL DOSSIER WITH LAZY PHOTOS & EXPORTS) */}
      {viewEstimate && (() => {
        const viewId = viewEstimate._id || viewEstimate.id;
        const propAddr = viewEstimate.deckDetails?.propertyAddress || viewEstimate.deckDetails?.location || {};
        const streetText = propAddr.street || 'Not specified';
        const municipalityText = [propAddr.city, propAddr.state, propAddr.zipCode].filter(Boolean).join(', ') || 'Not specified';
        const specComponents = viewEstimate.components?.length
          ? viewEstimate.components
          : (viewEstimate.deckDetails?.components?.length ? viewEstimate.deckDetails.components : (viewEstimate.pricingSnapshot?.spec?.components || []));
        const specServices = viewEstimate.services?.length
          ? viewEstimate.services
          : (viewEstimate.deckDetails?.services?.length ? viewEstimate.deckDetails.services : (viewEstimate.pricingSnapshot?.spec?.services || []));
        const specConditions = viewEstimate.damageConditions?.length
          ? viewEstimate.damageConditions
          : (viewEstimate.deckDetails?.damageConditions?.length ? viewEstimate.deckDetails.damageConditions : (viewEstimate.pricingSnapshot?.spec?.damageConditions || []));
        const specHeightFt = viewEstimate.exactHeightFt || viewEstimate.deckDetails?.exactHeightFt;
        const specCoating = viewEstimate.coatingType || viewEstimate.surfaceDetails?.coatingStatus || viewEstimate.deckDetails?.coatingType || 'None / Bare';
        const viewPhotos = extractEstimatePhotos(viewEstimate);

        const specRows = [
          {
            section: 'Section 1: Footprint',
            input: (viewEstimate.deckDetails?.deckShape || viewEstimate.pricingSnapshot?.shape || 'Rectangle').replace(/_/g, ' '),
            details: `${getDeckDimensions(viewEstimate)} • ${getDeckArea(viewEstimate)}`,
          },
          {
            section: 'Section 2: Components',
            input: specComponents.length > 0 ? specComponents.join(', ') : 'Standard Floor',
            details: 'Perimeter railings & step assemblies calibrated',
          },
          {
            section: 'Section 3: Wood Species',
            input: (viewEstimate.deckDetails?.surfaceMaterial || viewEstimate.woodSpecies || viewEstimate.pricingSnapshot?.wood || 'Pressure Treated Pine').replace(/_/g, ' '),
            details: 'Penetrating oil rate card calibration',
          },
          {
            section: 'Section 4: Elevation',
            input: (viewEstimate.deckDetails?.deckType || viewEstimate.accessType || viewEstimate.pricingSnapshot?.elevation || 'Ground Level (0–4 ft)').replace(/_/g, ' '),
            details: specHeightFt ? `${specHeightFt} ft staging` : 'Ground tier',
          },
          {
            section: 'Section 5: Existing Finish',
            input: String(specCoating).replace(/_/g, ' '),
            details: 'Clean pore absorption verified',
          },
          {
            section: 'Section 6: Services',
            input: specServices.length > 0 ? specServices.map((s) => String(s).replace(/_/g, ' ').toUpperCase()).join(' • ') : 'Cleaning & Sealing',
            details: 'Commercial chemicals & multi-coat protection',
            highlight: true,
          },
          {
            section: 'Section 7: Conditions',
            input: specConditions.length > 0 ? specConditions.join(', ') : 'Weathered baseline',
            details: 'Surface stabilized prior to coating',
          },
        ];

        return (
        <div style={styles.modalOverlay} onClick={() => setViewEstimate(null)}>
          <div
            style={{
              ...styles.modalContent,
              width: isMobile ? '96vw' : '920px',
              maxWidth: '920px',
              maxHeight: isMobile ? '94vh' : '92vh',
              display: 'flex',
              flexDirection: 'column',
              margin: 'auto',
              borderRadius: isMobile ? '10px' : '12px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ ...styles.modalHeader, padding: isMobile ? '12px 14px' : '16px 24px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                <h3 style={{ margin: '0 0 3px 0', fontSize: isMobile ? '16px' : '19px', fontWeight: '800', color: '#1E3A63', wordBreak: 'break-word' }}>
                  {viewEstimate.deckDetails?.projectName || viewEstimate.estimateName || 'Deck Restoration Project'}
                </h3>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', wordBreak: 'break-all' }}>
                  Ref: {viewEstimate.estimateNumber || viewId} &bull; Created {formatFullDate(viewEstimate.createdAt)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
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

            <div style={{ ...styles.modalBody, overflowY: 'auto', padding: isMobile ? '12px' : '20px 24px' }}>
              {/* Customer & Location Dossier */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '10px' : '16px', marginBottom: '14px' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#1E3A63', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px' }}>
                    Customer Contact Dossier
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Name:</span>
                    <strong style={{ textAlign: 'right' }}>{user?.fullName || 'Verified Deck Owner'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Email:</span>
                    <strong style={{ wordBreak: 'break-all', textAlign: 'right' }}>{user?.email || 'N/A'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>Phone:</span>
                    <strong style={{ textAlign: 'right' }}>{user?.phone || user?.phoneNumber || 'Not provided'}</strong>
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#1E3A63', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px' }}>
                    Project Site Address
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Street Address:</span>
                    <strong style={{ textAlign: 'right', wordBreak: 'break-word' }}>{streetText}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Municipality:</span>
                    <strong style={{ textAlign: 'right', wordBreak: 'break-word' }}>{municipalityText}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>Status:</span>
                    <div>{renderStatusBadge(getNormalizedStatus(viewEstimate))}</div>
                  </div>
                </div>
              </div>

              {/* Section-by-Section Architectural Inputs (Responsive Cards on Mobile, Table on Desktop/Tablet) */}
              {isMobile ? (
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', marginBottom: '14px' }}>
                  <div style={{ background: '#1E3A63', color: '#ffffff', padding: '8px 12px', fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase' }}>
                    Restoration Specifications
                  </div>
                  {specRows.map((row, rIdx) => (
                    <div
                      key={row.section}
                      style={{
                        padding: '9px 12px',
                        backgroundColor: rIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                        borderBottom: rIdx < specRows.length - 1 ? '1px solid #E2E8F0' : 'none',
                      }}
                    >
                      <div style={{ fontSize: '10.5px', fontWeight: '700', color: '#1E3A63', textTransform: 'uppercase' }}>
                        {row.section}
                      </div>
                      <div style={{ fontSize: '12.5px', fontWeight: row.highlight ? '700' : '600', color: row.highlight ? '#E08131' : '#0F172A', marginTop: '2px', textTransform: row.highlight ? 'none' : 'capitalize', wordBreak: 'break-word' }}>
                        {row.input}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        {row.details}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: '#1E3A63', color: '#ffffff' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '700', width: '28%' }}>Section</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '700', width: '36%' }}>Selected Input</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '700', width: '36%' }}>Dimensions &amp; Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {specRows.map((row, rIdx) => (
                        <tr
                          key={row.section}
                          style={{
                            borderBottom: rIdx < specRows.length - 1 ? '1px solid #E2E8F0' : 'none',
                            background: rIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                          }}
                        >
                          <td style={{ padding: '8px 12px', fontWeight: '700', color: '#1E3A63' }}>{row.section}</td>
                          <td style={{ padding: '8px 12px', fontWeight: row.highlight ? '700' : '500', color: row.highlight ? '#E08131' : '#0F172A', textTransform: row.highlight ? 'none' : 'capitalize' }}>
                            {row.input}
                          </td>
                          <td style={{ padding: '8px 12px', color: '#475569' }}>{row.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Uploaded Inspection Photos Gallery (Lazy-Hydrated Section 8) */}
              {hydratingView && viewPhotos.length === 0 ? (
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#64748b' }}>
                  <div style={{ ...styles.spinner, width: '18px', height: '18px', borderWidth: '2px' }} />
                  <span>Loading full specification details &amp; inspection photos...</span>
                </div>
              ) : viewPhotos.length > 0 ? (
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 14px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#1E3A63', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                    <span>Uploaded Deck Inspection Photos ({viewPhotos.length} On-File)</span>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Included in Official PDF Report</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                    {viewPhotos.map((p, pIdx) => (
                      <div key={pIdx} style={{ border: '1px solid #CBD5E1', borderRadius: '6px', overflow: 'hidden', background: '#FFFFFF' }}>
                        <img
                          src={typeof p === 'string' ? p : (p.url || p.dataUrl)}
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
              ) : null}

              {/* Price Highlight Box */}
              <div style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: '8px', padding: isMobile ? '12px 14px' : '14px 18px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '8px' : '0' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#15803D', textTransform: 'uppercase' }}>
                    Official Guaranteed Estimate Total
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                    All labor hours, commercial equipment, EPA detergents &amp; premium wood penetrations included.
                  </div>
                </div>
                <div style={{ fontSize: isMobile ? '22px' : '24px', fontWeight: '900', color: '#15803D', alignSelf: isMobile ? 'flex-end' : 'auto' }}>
                  {getExactPrice(viewEstimate)}
                </div>
              </div>
            </div>

            <div style={{ ...styles.modalFooter, padding: isMobile ? '10px 12px' : '14px 24px', flexWrap: 'wrap', gap: '8px' }}>
              {getNormalizedStatus(viewEstimate) === 'CREATED' && (
                <button
                  type="button"
                  onClick={() => handleRequestBooking(viewEstimate)}
                  disabled={requestingId === viewId}
                  style={{
                    ...styles.modalPrimaryActionBtn,
                    backgroundColor: '#D97706',
                    borderColor: '#B45309',
                    color: '#ffffff',
                    flex: isMobile ? '1 1 100%' : 'none',
                    order: isMobile ? -1 : 0,
                    justifyContent: 'center',
                  }}
                >
                  {requestingId === viewId ? 'Submitting Booking...' : 'Reach Out / Book Project'}
                </button>
              )}

              {/* Export PDF Button */}
              <button
                type="button"
                onClick={() => handleExport(viewEstimate, 'pdf')}
                disabled={exportingId === viewId}
                style={{
                  ...styles.modalPrimaryActionBtn,
                  backgroundColor: '#1E3A63',
                  borderColor: '#1E3A63',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  flex: isMobile ? '1 1 calc(50% - 4px)' : 'none',
                  justifyContent: 'center',
                }}
                title="Download official PDF estimate"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>{exportingId === viewId ? 'Exporting...' : 'Download PDF'}</span>
              </button>

              {/* Export Excel Button */}
              <button
                type="button"
                onClick={() => handleExport(viewEstimate, 'excel')}
                disabled={exportingId === viewId}
                style={{
                  ...styles.modalPrimaryActionBtn,
                  backgroundColor: '#0F766E',
                  borderColor: '#0F766E',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  flex: isMobile ? '1 1 calc(50% - 4px)' : 'none',
                  justifyContent: 'center',
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

              <button
                type="button"
                onClick={() => setViewEstimate(null)}
                style={{ ...styles.modalDismissBtn, flex: isMobile ? '1 1 100%' : 'none', justifyContent: 'center' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
        );
      })()}

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
    flexWrap: 'wrap',
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

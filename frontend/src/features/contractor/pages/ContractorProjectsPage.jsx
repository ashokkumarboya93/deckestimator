// =============================================
// Deck Estimator — Contractor My Projects & Estimations Page
// =============================================
// Unified Single Page combining Projects & Estimates:
// - Medium Navy Blue Theme (#1E3A63) & Inter Font
// - Small banner of "My Projects" with New Estimation CTA
// - Pale colored shiny summary KPI cards
// - Interactive search bar, status filter dropdown, and refresh button with spinning icon + text
// - Exact table columns:
//   Project Name | Deck Size | Labour & Materials | Estimator price | Status | Created Date | Actions
// - Actions: View button, Print button (official PDF estimate template), and Three Dots Menu (Edit, Export, Delete)
// - Synchronized full-stack backend & database connectivity

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { getEstimates, deleteEstimate, bulkDeleteEstimates, requestProjectEstimate } from '../../customer/api/estimatesApi';
import { downloadEstimatePdf, downloadEstimateExcel } from '../../../utils/reportExport';
import contractorBannerBg from '../../../assets/images/Banner_BG_img.png';
import { OPERATING_HOURS_PRINT_LINES } from '../../../constants/operatingHours';
import { SkeletonTable, SkeletonShimmer } from '../../../components/common';

export default function ContractorProjectsPage() {
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

  // Pagination & Responsiveness
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));
  const [isSmallMobile, setIsSmallMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 480 : false));
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768);
        setIsSmallMobile(window.innerWidth < 480);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState([]);
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);

  // Modals & Action Menus
  const [deleteConfirmEst, setDeleteConfirmEst] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 });
  const [activeMenuEst, setActiveMenuEst] = useState(null);
  const [convertingId, setConvertingId] = useState(null);

  const menuRef = useRef(null);

  // Close 3-dots menu on click outside or scroll
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
        setActiveMenuEst(null);
      }
    }
    function handleScroll() {
      setOpenMenuId(null);
      setActiveMenuEst(null);
    }
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  // Fetch contractor projects & estimates from backend
  const fetchProjects = useCallback(async (isRefresh = false) => {
    let hasCached = false;
    if (!isRefresh) {
      try {
        const raw = localStorage.getItem('drp_cont_estimates_cache');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setEstimates(parsed);
            hasCached = true;
          }
        }
      } catch {
        // Ignore
      }
    }
    if (isRefresh) setRefreshing(true);
    else if (!hasCached) setLoading(true);
    setError(null);
    try {
      const data = await getEstimates({ limit: 100, compact: '1' });
      const list = data?.estimates || data?.data?.estimates || (Array.isArray(data) ? data : []);
      const safeList = Array.isArray(list) ? list : [];
      setEstimates(safeList);
      try {
        localStorage.setItem('drp_cont_estimates_cache', JSON.stringify(safeList));
      } catch {
        // Ignore quota
      }
    } catch (err) {
      if (!hasCached) setError(err.message || 'Failed to fetch your projects and estimates.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    const handleSaved = () => fetchProjects(true);
    window.addEventListener('estimation_saved', handleSaved);
    return () => window.removeEventListener('estimation_saved', handleSaved);
  }, [fetchProjects]);

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
    if (!dateVal) return 'November 8, 2026';
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return 'November 8, 2026';
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  // Get Exact Calculated Estimator Price
  function getExactPrice(est) {
    if (typeof est.totalAmount === 'number' && est.totalAmount > 0) {
      return formatCurrency(est.totalAmount);
    }
    const snap = est.pricingSnapshot;
    if (snap?.pureCalculatedPrice !== undefined) {
      return formatCurrency(snap.pureCalculatedPrice);
    }
    if (snap?.calculatedTotal !== undefined) {
      return formatCurrency(snap.calculatedTotal);
    }
    if (snap?.finalTotal !== undefined) {
      return formatCurrency(snap.finalTotal);
    }
    if (snap?.total !== undefined) {
      return formatCurrency(snap.total);
    }
    return formatCurrency(0);
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

    const prep = snap.prep ? snap.prep.toUpperCase() : 'CLEAN & WASH';
    const finish = snap.finish ? snap.finish.toUpperCase() : 'PENETRATING SEALER';

    return {
      hours: `${laborHrs} hrs labor`,
      materials: `${prep} • ${finish}`,
    };
  }

  // Status Pill Resolver (Blue for CREATED, Amber for IN_REVIEW, Green for COMPLETED, Orange/Yellow for REQUESTED)
  function resolveStatusBadge(rawStatus) {
    const s = String(rawStatus || 'CREATED').toUpperCase();
    if (s === 'REQUESTED') {
      return {
        label: 'Requested',
        bg: '#FEF3C7',
        text: '#92400E',
        border: '#FDE68A',
        dot: '#D97706',
      };
    }
    if (s === 'IN_REVIEW' || s === 'REVIEW' || s === 'NEEDS_CONTRACTOR_QUOTE' || s === 'PENDING') {
      return {
        label: 'In Review',
        bg: '#FFFBEB',
        text: '#B45309',
        border: '#FDE68A',
        dot: '#F59E0B',
      };
    }
    if (s === 'COMPLETED' || s === 'APPROVED' || s === 'CONVERTED' || s === 'ACCEPTED') {
      return {
        label: 'Completed',
        bg: '#ECFDF5',
        text: '#15803D',
        border: '#A7F3D0',
        dot: '#10B981',
      };
    }
    return {
      label: 'Created',
      bg: '#EFF6FF',
      text: '#1E3A63',
      border: '#BFDBFE',
      dot: '#1E3A63',
    };
  }

  // Filter & Search Logic
  const filteredEstimates = useMemo(() => {
    return estimates.filter((est) => {
      const q = searchTerm.toLowerCase().trim();
      const name = (est.deckDetails?.projectName || est.estimateName || est.projectName || '').toLowerCase();
      const client = (est.ownerId?.fullName || est.ownerName || '').toLowerCase();
      const ref = (est.estimateNumber || est._id || '').toLowerCase();
      const wood = (est.deckDetails?.surfaceMaterial || est.pricingSnapshot?.wood || est.pricingSnapshot?.spec?.woodSpecies || '').toLowerCase();

      const matchesSearch = !q || name.includes(q) || client.includes(q) || ref.includes(q) || wood.includes(q);

      const statusObj = resolveStatusBadge(est.estimateStatus || est.status);
      const matchesStatus =
        statusFilter === 'ALL' ||
        statusObj.label.toUpperCase() === statusFilter.toUpperCase() ||
        (statusFilter === 'IN_REVIEW' && (statusObj.label === 'In Review' || statusObj.label === 'Requested'));

      return matchesSearch && matchesStatus;
    });
  }, [estimates, searchTerm, statusFilter]);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEstimates.length / pageSize));
  const paginatedEstimates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEstimates.slice(start, start + pageSize);
  }, [filteredEstimates, currentPage, pageSize]);

  // Pale Colored Shiny Summary KPI Cards
  const stats = useMemo(() => {
    const total = estimates.length;
    let createdCount = 0;
    let requestedCount = 0;
    let inReviewCount = 0;
    let completedCount = 0;
    let totalPortfolioVal = 0;

    estimates.forEach((e) => {
      const s = resolveStatusBadge(e.estimateStatus || e.status).label;
      if (s === 'Requested') requestedCount++;
      else if (s === 'In Review') inReviewCount++;
      else if (s === 'Completed') completedCount++;
      else createdCount++;

      const amt = Number(e.pricingSnapshot?.calculatedTotal ?? e.pricingSnapshot?.finalTotal ?? e.totalAmount ?? 0);
      if (!isNaN(amt)) totalPortfolioVal += amt;
    });

    return {
      total,
      createdCount,
      requestedCount,
      inReviewCount,
      completedCount,
      totalPortfolioVal,
    };
  }, [estimates]);

  // Delete Action Handler with Database Sync
  const handleConfirmDelete = async () => {
    if (!deleteConfirmEst) return;
    const targetId = deleteConfirmEst._id || deleteConfirmEst.id;
    setDeletingId(targetId);
    try {
      await deleteEstimate(targetId);
      setEstimates((prev) => prev.filter((item) => (item._id || item.id) !== targetId));
      setSelectedIds((prev) => prev.filter((id) => id !== targetId));
      setSuccessToast(`Project "${deleteConfirmEst.deckDetails?.projectName || 'Estimate'}" deleted successfully.`);
      setDeleteConfirmEst(null);
    } catch (err) {
      alert(err.message || 'Failed to delete estimate record.');
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

  // Batch Delete (Single fast atomic API request)
  const handleConfirmBatchDelete = async () => {
    setBatchDeleting(true);
    try {
      await bulkDeleteEstimates(selectedIds);
      setEstimates((prev) => prev.filter((item) => !selectedIds.includes(item._id || item.id)));
      try { localStorage.removeItem('drp_cont_estimates_cache'); } catch {}
      setSuccessToast(`Successfully deleted ${selectedIds.length} projects.`);
      setSelectedIds([]);
      setShowBatchDeleteModal(false);
    } catch (err) {
      alert(`Could not delete selected items: ${err.message}`);
    } finally {
      setBatchDeleting(false);
    }
  };

  // Request Enquiry / Convert to Booking
  const handleRequestEnquiry = async (est) => {
    setOpenMenuId(null);
    setActiveMenuEst(null);
    const estId = est._id || est.id;
    setConvertingId(estId);
    try {
      await requestProjectEstimate(estId, {
        subject: `Contractor Project Booking: ${est.deckDetails?.projectName || est.estimateName || 'Deck Project'}`,
        message: `Contractor requested booking and administrative dispatch for project ${est.estimateNumber || estId} (${getExactPrice(est)}).`,
      });
      setEstimates((prev) =>
        prev.map((item) =>
          (item._id || item.id) === estId
            ? { ...item, estimateStatus: 'REQUESTED', status: 'REQUESTED' }
            : item
        )
      );
      setSuccessToast(`Enquiry submitted for ${est.deckDetails?.projectName || 'Project'}! Added to Admin Leads as HOT priority.`);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'An error occurred while submitting enquiry.';
      alert(`Enquiry notice: ${errMsg}`);
    } finally {
      setConvertingId(null);
    }
  };

  // Dedicated Official PDF Estimate Template Generator
  const generateOfficialEstimateHtml = (est) => {
    const projName = est.deckDetails?.projectName || est.estimateName || 'Custom Deck Restoration';
    const estId = est.estimateNumber || est._id || 'DP-2026-EST';
    const dateFormatted = formatFullDate(est.createdAt);
    const area = getDeckArea(est);
    const dims = getDeckDimensions(est);
    const lm = getLabourAndMaterials(est);
    const exactPrice = getExactPrice(est);
    const statusText = resolveStatusBadge(est.estimateStatus || est.status).label;
    const wood = (est.deckDetails?.surfaceMaterial || est.pricingSnapshot?.wood || 'Pressure Treated Pine').replace(/_/g, ' ').toUpperCase();
    const elevation = (est.deckDetails?.deckType || est.pricingSnapshot?.elevation || 'Ground Level (0–4 ft)').replace(/_/g, ' ').toUpperCase();
    const shape = (est.deckDetails?.deckShape || est.pricingSnapshot?.shape || 'Rectangle').toUpperCase();

    const contractorName = user?.fullName || 'Licensed DRP Field Contractor';
    const contractorEmail = user?.email || 'contractor@deckrestorationplus.com';
    const contractorPhone = user?.phone || '(856) 678-3325';
    const street = est.deckDetails?.location?.street || '152 Indian Mills Road';
    const city = est.deckDetails?.location?.city || 'Shamong';
    const state = est.deckDetails?.location?.state || 'NJ';
    const zip = est.deckDetails?.location?.zipCode || '08088';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Official Estimate - ${projName} (${estId})</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color: #0f172a; margin: 0; padding: 36px; background: #ffffff; line-height: 1.5; }
          .header-row { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1E3A63; padding-bottom: 18px; margin-bottom: 24px; }
          .logo-text { font-size: 20px; font-weight: 900; color: #1E3A63; letter-spacing: -0.5px; margin: 0; }
          .sub-brand { font-size: 11px; font-weight: 600; color: #E08131; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 3px; }
          .doc-title-block { text-align: right; }
          .doc-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
          .doc-ref { font-size: 12px; color: #64748b; margin-top: 4px; font-family: monospace; }
          .status-badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; background: #eff6ff; color: #1E3A63; margin-top: 6px; }

          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
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
            <div class="sub-brand">Commercial Contractor Project Estimate</div>
          </div>
          <div class="doc-title-block">
            <h2 class="doc-title">Project Commercial Estimate</h2>
            <div class="doc-ref">Ref: ${estId} &bull; Date: ${dateFormatted}</div>
            <div class="status-badge">${statusText}</div>
          </div>
        </div>

        <div class="grid-2">
          <div class="info-box">
            <h3 class="box-title">Contractor &amp; Estimator Profile</h3>
            <div class="info-line"><span class="info-label">Contractor:</span><span class="info-val">${contractorName}</span></div>
            <div class="info-line"><span class="info-label">Email:</span><span class="info-val">${contractorEmail}</span></div>
            <div class="info-line"><span class="info-label">Phone:</span><span class="info-val">${contractorPhone}</span></div>
            <div class="info-line"><span class="info-label">Accreditation:</span><span class="info-val">DRP Certified Field Partner</span></div>
          </div>

          <div class="info-box">
            <h3 class="box-title">Project Site Location</h3>
            <div class="info-line"><span class="info-label">Project Title:</span><span class="info-val">${projName}</span></div>
            <div class="info-line"><span class="info-label">Property Address:</span><span class="info-val">${street}</span></div>
            <div class="info-line"><span class="info-label">Municipality:</span><span class="info-val">${city}, ${state} ${zip}</span></div>
            <div class="info-line"><span class="info-label">Mobilization Standard:</span><span class="info-val">$2,500 Base Rate Minimum</span></div>
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
            <div class="price-title">Guaranteed Project Estimate</div>
            <div class="price-sub">Includes professional labor hours, chemical preparation, materials, and mobilization</div>
          </div>
          <div class="price-amount">${exactPrice}</div>
        </div>

        <div class="guarantee-box">
          <strong>Deck Restoration Plus Quality Guarantee:</strong> All estimates provided through this official portal are backed by Deck Restoration Plus proprietary restoration standards, professional-grade penetrating sealers, and licensed, certified contractors. Standard $2,500 project mobilization floor applies upon crew dispatch.
        </div>

        <div class="footer-box">
          <div>
            <strong>Deck Restoration Plus National Headquarters</strong><br>
            152 Indian Mills Road, Shamong, NJ 08088<br>
            Official Website: www.deckrestorationplus.com
          </div>
          <div class="footer-contact" style="text-align: right;">
            Toll Free Support: <strong>1 (866) 440-DECK (3325)</strong><br>
            Office: <strong>(856) 678-3325</strong> &bull; Email: <strong>estimates@deckrestorationplus.com</strong><br>
            ${OPERATING_HOURS_PRINT_LINES.contracting}<br>
            ${OPERATING_HOURS_PRINT_LINES.office}
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Trigger Dedicated Print Template (Direct PDF download without browser print dialog)
  const handlePrint = async (est) => {
    try {
      await downloadEstimatePdf(est, user);
      setSuccessToast(`Official estimate PDF downloaded for ${est.estimateNumber || 'Project'}.`);
    } catch (err) {
      alert(`Could not download PDF report: ${err.message}`);
    }
  };

  // Trigger Dedicated Export Template
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
    <div style={{ ...styles.pageContainer, padding: isMobile ? '12px 10px 40px 10px' : '24px 20px 60px 20px' }}>
      <style>{`
        /* Mobile-First 2x2 KPI Grid (Same as Customer Portal) */
        .contractor-proj-kpi-grid {
          display: grid !important;
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          gap: 10px !important;
          margin-bottom: 16px !important;
          width: 100% !important;
        }
        @media (min-width: 1025px) {
          .contractor-proj-kpi-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            gap: 14px !important;
          }
        }
        .contractor-proj-kpi-card {
          border-radius: 12px !important;
          padding: 10px 12px !important;
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
          min-width: 0 !important;
          width: 100% !important;
          box-sizing: border-box !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03) !important;
          border-width: 1.5px !important;
          border-style: solid !important;
          cursor: pointer !important;
          transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        }
        .contractor-proj-kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(30, 58, 99, 0.08) !important;
        }
        @media (max-width: 400px) {
          .contractor-proj-kpi-card {
            padding: 8px 8px !important;
            gap: 6px !important;
          }
        }
        @media (max-width: 1024px) {
          .contractor-controls-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            width: 100% !important;
          }
          .contractor-search-box {
            flex: 0 0 auto !important;
            min-width: 100% !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          .contractor-search-box input {
            padding-left: 36px !important;
            box-sizing: border-box !important;
          }
          .contractor-filter-group {
            width: 100% !important;
            justify-content: space-between !important;
            margin-left: 0 !important;
            gap: 8px !important;
          }
          .contractor-filter-group select {
            height: 38px !important;
            line-height: normal !important;
            padding: 0 10px !important;
            font-size: 12.5px !important;
            box-sizing: border-box !important;
          }
          .contractor-filter-group button {
            height: 38px !important;
            padding: 0 14px !important;
            font-size: 12.5px !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>
      {/* 1. SMALL BANNER OF "MY PROJECTS" (Clean, Compact, Shiny) */}
      <section
        style={{
          ...styles.heroBanner,
          padding: isMobile ? '16px 14px' : '24px 28px',
          backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, 0.26) 0%, rgba(255, 255, 255, 0.08) 25%, transparent 55%), linear-gradient(90deg, rgba(16, 38, 72, 0.72) 0%, rgba(22, 48, 88, 0.58) 28%, rgba(30, 58, 99, 0.28) 42%, rgba(30, 58, 99, 0.04) 52%, rgba(0, 0, 0, 0) 100%), url(${contractorBannerBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div style={styles.heroContent}>
          <h1 style={{ ...styles.heroTitle, fontSize: isMobile ? '19px' : '24px', marginBottom: isMobile ? '10px' : '14px' }}>My Projects</h1>
          <div style={styles.heroBtnRow}>
            <button
              type="button"
              onClick={() => navigate('/contractor/decks/new')}
              style={{
                ...styles.heroPrimaryBtn,
                padding: isMobile ? '7px 14px' : '9px 18px',
                fontSize: isMobile ? '11.5px' : '12.5px',
              }}
            >
              <span>+ New Estimation</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. PALE COLORED SHINY SUMMARY KPI CARDS (2x2 Grid on Mobile, 4 Columns on Desktop) */}
      <div className="contractor-proj-kpi-grid">
        {/* Total Projects */}
        <div
          onClick={() => setStatusFilter('ALL')}
          className="contractor-proj-kpi-card"
          style={{
            backgroundColor: '#EFF6FF',
            borderColor: statusFilter === 'ALL' ? '#3B82F6' : '#BFDBFE',
          }}
          title="Filter by all projects"
        >
          <div style={{ ...styles.kpiIconWrap, width: isMobile ? '34px' : '42px', height: isMobile ? '34px' : '42px', backgroundColor: '#DBEAFE', color: '#1E3A63' }}>
            <svg width={isMobile ? '16' : '19'} height={isMobile ? '16' : '19'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <span style={{ ...styles.kpiLabel, fontSize: isMobile ? '9.5px' : '11.5px' }}>Total Projects</span>
            <strong style={{ ...styles.kpiValue, fontSize: isMobile ? '18px' : '22px', color: '#1E3A63' }}>
              {loading ? <SkeletonShimmer width="36px" height="22px" borderRadius="4px" /> : stats.total}
            </strong>
            <span style={{ ...styles.kpiSub, fontSize: '10.5px', display: isMobile ? 'none' : 'block' }}>Tracked in active portfolio</span>
          </div>
        </div>

        {/* In Review & Requested */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'IN_REVIEW' ? 'ALL' : 'IN_REVIEW')}
          className="contractor-proj-kpi-card"
          style={{
            backgroundColor: '#FFFBEB',
            borderColor: statusFilter === 'IN_REVIEW' || statusFilter === 'REQUESTED' ? '#F59E0B' : '#FDE68A',
          }}
          title="Filter by In Review & Requested projects"
        >
          <div style={{ ...styles.kpiIconWrap, width: isMobile ? '34px' : '42px', height: isMobile ? '34px' : '42px', backgroundColor: '#FEF3C7', color: '#B45309' }}>
            <svg width={isMobile ? '16' : '19'} height={isMobile ? '16' : '19'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <span style={{ ...styles.kpiLabel, fontSize: isMobile ? '9.5px' : '11.5px' }}>In Review</span>
            <strong style={{ ...styles.kpiValue, fontSize: isMobile ? '18px' : '22px', color: '#B45309' }}>
              {loading ? <SkeletonShimmer width="36px" height="22px" borderRadius="4px" /> : (stats.inReviewCount + stats.requestedCount)}
            </strong>
            <span style={{ ...styles.kpiSub, fontSize: '10.5px', display: isMobile ? 'none' : 'block' }}>Pending approval / requested</span>
          </div>
        </div>

        {/* Completed Projects */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'COMPLETED' ? 'ALL' : 'COMPLETED')}
          className="contractor-proj-kpi-card"
          style={{
            backgroundColor: '#ECFDF5',
            borderColor: statusFilter === 'COMPLETED' ? '#10B981' : '#A7F3D0',
          }}
          title="Filter by Completed projects"
        >
          <div style={{ ...styles.kpiIconWrap, width: isMobile ? '34px' : '42px', height: isMobile ? '34px' : '42px', backgroundColor: '#D1FAE5', color: '#15803D' }}>
            <svg width={isMobile ? '16' : '19'} height={isMobile ? '16' : '19'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <span style={{ ...styles.kpiLabel, fontSize: isMobile ? '9.5px' : '11.5px' }}>Completed</span>
            <strong style={{ ...styles.kpiValue, fontSize: isMobile ? '18px' : '22px', color: '#15803D' }}>
              {loading ? <SkeletonShimmer width="36px" height="22px" borderRadius="4px" /> : stats.completedCount}
            </strong>
            <span style={{ ...styles.kpiSub, fontSize: '10.5px', display: isMobile ? 'none' : 'block' }}>Finished projects</span>
          </div>
        </div>

        {/* Total Pipeline Value */}
        <div
          className="contractor-proj-kpi-card"
          style={{
            backgroundColor: '#FAF5FF',
            borderColor: '#E9D5FF',
          }}
        >
          <div style={{ ...styles.kpiIconWrap, width: isMobile ? '34px' : '42px', height: isMobile ? '34px' : '42px', backgroundColor: '#F3E8FF', color: '#9333EA' }}>
            <svg width={isMobile ? '16' : '19'} height={isMobile ? '16' : '19'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <span style={{ ...styles.kpiLabel, fontSize: isMobile ? '9.5px' : '11.5px' }}>Pipeline Value</span>
            <strong style={{ ...styles.kpiValue, fontSize: isMobile ? '18px' : '22px', color: '#7E22CE' }}>
              {loading ? <SkeletonShimmer width="72px" height="22px" borderRadius="4px" /> : formatCurrency(stats.totalPortfolioVal)}
            </strong>
            <span style={{ ...styles.kpiSub, fontSize: '10.5px', display: isMobile ? 'none' : 'block' }}>Total estimated volume</span>
          </div>
        </div>
      </div>

      {/* 3. CONTROLS BAR: SEARCH + FILTER + REFRESH (Clean Card with Refined Mobile Spacing) */}
      <div
        className="contractor-controls-bar"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: isMobile ? '10px 12px' : '12px 18px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? '8px' : '14px',
          marginBottom: '16px',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Search Bar */}
        <div
          className="contractor-search-box"
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            flex: isMobile ? 'none' : 1,
            width: isMobile ? '100%' : 'auto',
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isMobile ? 'Search projects, ref #, wood...' : 'Search by project name, reference number, or wood species...'}
            style={{
              width: '100%',
              height: isMobile ? '38px' : '40px',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              paddingLeft: '34px',
              paddingRight: searchTerm ? '32px' : '12px',
              fontSize: isMobile ? '12.5px' : '13px',
              backgroundColor: '#F8FAFC',
              color: '#0F172A',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                fontSize: '15px',
                cursor: 'pointer',
                padding: '2px 4px',
                lineHeight: 1,
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter & Refresh Container */}
        <div
          className="contractor-filter-group"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: isMobile ? '100%' : 'auto',
          }}
        >
          <div style={{ flex: isMobile ? 1 : 'none', minWidth: isMobile ? 0 : '160px' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                height: isMobile ? '38px' : '40px',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '0 12px',
                fontSize: isMobile ? '12.5px' : '13px',
                fontWeight: '600',
                color: '#1E3A63',
                backgroundColor: '#FFFFFF',
                outline: 'none',
                cursor: 'pointer',
                boxSizing: 'border-box',
              }}
            >
              <option value="ALL">All Statuses ({estimates.length})</option>
              <option value="CREATED">Created ({stats.createdCount})</option>
              <option value="REQUESTED">Requested ({stats.requestedCount})</option>
              <option value="IN_REVIEW">In Review ({stats.inReviewCount})</option>
              <option value="COMPLETED">Completed ({stats.completedCount})</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => fetchProjects(true)}
            disabled={refreshing || loading}
            style={{
              height: isMobile ? '38px' : '40px',
              padding: isMobile ? '0 14px' : '0 18px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              fontSize: isMobile ? '12.5px' : '13px',
              fontWeight: '700',
              color: '#1E3A63',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              flexShrink: 0,
              boxSizing: 'border-box',
              transition: 'all 0.15s ease',
            }}
            title="Refresh list from database"
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
                animation: refreshing ? 'spin 0.8s linear infinite' : 'none',
              }}
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* TOAST FEEDBACK */}
      {successToast && (
        <div style={styles.toastCard}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{successToast}</span>
        </div>
      )}

      {/* BULK ACTIONS BAR (When projects selected) */}
      {selectedIds.length > 0 && (
        <div style={styles.bulkActionBar}>
          <div style={styles.bulkLeft}>
            <span style={styles.bulkCountBadge}>
              {selectedIds.length} {selectedIds.length === 1 ? 'project' : 'projects'} selected
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
              title="Download official PDF reports for all selected projects"
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
              title="Download Excel dossiers for all selected projects"
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
              title="Delete all selected projects from database"
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

      {/* 4. PROJECTS & ESTIMATES TABLE */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={{ padding: '8px' }}>
            <SkeletonTable rows={5} columns={7} />
          </div>
        ) : filteredEstimates.length === 0 ? (
          <div style={styles.emptyWrap}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            <h3 style={styles.emptyTitle}>No Projects Found</h3>
            <p style={styles.emptyDesc}>
              {searchTerm || statusFilter !== 'ALL'
                ? 'No projects matched your search criteria. Try clearing filters.'
                : 'You have not created any deck restoration estimates yet.'}
            </p>
            <button
              type="button"
              onClick={() => navigate('/contractor/decks/new')}
              style={styles.emptyBtn}
            >
              + Create New Estimation
            </button>
          </div>
        ) : isMobile ? (
          /* Mobile Card View — Customer Portal Standard Compact Layout */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px' }}>
            {paginatedEstimates.map((est) => {
              const estId = est._id || est.id;
              const isRowSelected = selectedIds.includes(estId);
              const projName = est.deckDetails?.projectName || est.estimateName || 'Custom Deck Restoration';
              const refName = est.estimateNumber || `DP-${(estId || '').substring(0, 8).toUpperCase()}`;
              const exactPrice = getExactPrice(est);
              const area = getDeckArea(est);
              const dims = getDeckDimensions(est);
              const lm = getLabourAndMaterials(est);
              const statusObj = resolveStatusBadge(est.estimateStatus || est.status);
              const fullDate = formatFullDate(est.createdAt);
              const isAlreadyRequested = ['REQUESTED', 'IN_REVIEW', 'COMPLETED', 'APPROVED', 'CONVERTED'].includes(
                String(est.estimateStatus || est.status || '').toUpperCase()
              );

              return (
                <div
                  key={estId}
                  style={{
                    backgroundColor: isRowSelected ? '#F0F9FF' : '#ffffff',
                    border: `1.5px solid ${isRowSelected ? '#93C5FD' : '#E2E8F0'}`,
                    borderRadius: '12px',
                    padding: '12px 14px',
                    boxShadow: '0 1px 4px rgba(15, 23, 42, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '9px',
                  }}
                >
                  {/* Top Row: Checkbox + Title/Ref + Status Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', minWidth: 0, flex: 1 }}>
                      <input
                        type="checkbox"
                        checked={isRowSelected}
                        onChange={() => handleSelectOne(estId)}
                        style={{ ...styles.checkboxInput, marginTop: '2px', flexShrink: 0 }}
                        aria-label={`Select ${projName}`}
                      />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h4
                          onClick={() => navigate(`/contractor/projects/${estId}`)}
                          style={{ margin: '0 0 2px 0', fontSize: '13.5px', fontWeight: '800', color: '#1E3A63', cursor: 'pointer', wordBreak: 'break-word' }}
                        >
                          {projName}
                        </h4>
                        <span style={{ display: 'block', fontSize: '10.5px', color: '#64748B', fontWeight: '600' }}>
                          {refName} &bull; {fullDate}
                        </span>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '2.5px 8px',
                          borderRadius: '12px',
                          backgroundColor: statusObj.bg,
                          color: statusObj.text,
                          borderColor: statusObj.border,
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontWeight: '700',
                        }}
                      >
                        <span style={{ ...styles.statusDot, backgroundColor: statusObj.dot }} />
                        {statusObj.label}
                      </span>
                    </div>
                  </div>

                  {/* Middle Specs Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      gap: '8px',
                      backgroundColor: '#F8FAFC',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #F1F5F9',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '9.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>Deck Size</span>
                      <strong style={{ fontSize: '12.5px', color: '#0F172A', marginTop: '2px', display: 'block' }}>{area}</strong>
                      <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>{dims}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '9.5px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', display: 'block' }}>Labour &amp; Materials</span>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#0F172A', marginTop: '2px', lineHeight: 1.3 }}>
                        <div>{lm.hours}</div>
                        <div style={{ color: '#475569', fontWeight: '600', fontSize: '10px' }}>{lm.materials}</div>
                      </div>
                    </div>
                    <div style={{ gridColumn: 'span 2', borderTop: '1px solid #E2E8F0', paddingTop: '6px', marginTop: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '10px', fontWeight: '800', color: '#15803D', textTransform: 'uppercase' }}>
                        Estimator Price:
                      </span>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '15.5px', fontWeight: '900', color: '#15803D' }}>
                          {exactPrice}
                        </span>
                        <span style={{ fontSize: '9.5px', color: '#16A34A', fontWeight: '700', display: 'block' }}>
                          ✓ {est.discountBreakdown?.discountPercentage ? `${est.discountBreakdown.discountPercentage}% Wholesale Applied` : 'Wholesale Applied'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Enquiry / Booking Conversion Button or Request Submitted Badge */}
                  <div style={{ marginTop: '2px' }}>
                    {isAlreadyRequested ? (
                      <div
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          backgroundColor: '#F0FDF4',
                          border: '1px solid #BBF7D0',
                          borderRadius: '7px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          fontSize: '11.5px',
                          fontWeight: '700',
                          color: '#15803D',
                          boxSizing: 'border-box',
                        }}
                        title="Request has already been submitted for this estimation"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Request Submitted</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRequestEnquiry(est)}
                        disabled={convertingId === estId}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          backgroundColor: '#E08131',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '7px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          fontSize: '11.5px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          boxSizing: 'border-box',
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <span>{convertingId === estId ? 'Submitting...' : 'Inquiry / Convert to Booking'}</span>
                      </button>
                    )}
                  </div>

                  {/* Bottom Actions Row: View, Print, More Options */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <button
                      type="button"
                      onClick={() => navigate(`/contractor/projects/${estId}`)}
                      style={{
                        ...styles.actionViewBtn,
                        flex: 1,
                        justifyContent: 'center',
                        padding: '0 10px',
                        height: '32px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      <span>View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrint(est)}
                      style={{
                        ...styles.actionPrintBtn,
                        flex: 1,
                        justifyContent: 'center',
                        padding: '0 10px',
                        height: '32px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 6 2 18 2 18 9" />
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                        <rect x="6" y="14" width="12" height="8" />
                      </svg>
                      <span>Print</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (openMenuId === estId) {
                          setOpenMenuId(null);
                          setActiveMenuEst(null);
                        } else {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setMenuCoords({
                            top: rect.bottom + 6,
                            left: Math.max(10, rect.right - 220),
                          });
                          setActiveMenuEst(est);
                          setOpenMenuId(estId);
                        }
                      }}
                      style={{ ...styles.actionDotsBtn, width: '32px', height: '32px', padding: 0 }}
                      title="More options"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="19" cy="12" r="1.5" />
                        <circle cx="5" cy="12" r="1.5" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
      ) : (
        /* Desktop Table View */
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={{ ...styles.th, width: '42px', textAlign: 'center', paddingLeft: '14px', paddingRight: '6px' }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isPartiallySelected;
                      }}
                      onChange={handleSelectAll}
                      style={styles.checkboxInput}
                      aria-label="Select all projects"
                      disabled={filteredEstimates.length === 0}
                    />
                  </th>
                  <th style={styles.th}>Project Name</th>
                  <th style={styles.th}>Deck Size</th>
                  <th style={styles.th}>Labour &amp; Materials</th>
                  <th style={styles.th}>Estimator Price</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Created Date</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEstimates.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '48px 24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px' }}>
                          <polygon points="12 2 2 7 12 12 22 7 12 2" />
                          <polyline points="2 17 12 22 22 17" />
                          <polyline points="2 12 12 17 22 12" />
                        </svg>
                        <h3 style={styles.emptyTitle}>No Projects Found</h3>
                        <p style={styles.emptyDesc}>
                          {searchTerm || statusFilter !== 'ALL'
                            ? 'No projects matched your search criteria. Try clearing filters.'
                            : 'You have not created any deck restoration estimates yet.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => navigate('/contractor/decks/new')}
                          style={styles.emptyBtn}
                        >
                          + Create New Estimation
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedEstimates.map((est) => {
                  const estId = est._id || est.id;
                  const isRowSelected = selectedIds.includes(estId);
                  const projName = est.deckDetails?.projectName || est.estimateName || 'Custom Deck Restoration';
                  const refName = est.estimateNumber || `DP-${(estId || '').substring(0, 8).toUpperCase()}`;
                  const exactPrice = getExactPrice(est);
                  const area = getDeckArea(est);
                  const dims = getDeckDimensions(est);
                  const lm = getLabourAndMaterials(est);
                  const statusObj = resolveStatusBadge(est.estimateStatus || est.status);
                  const fullDate = formatFullDate(est.createdAt);
                  const deckId = est.deckId?._id || est.deckId || est.deckDetails?.deckId;
                  const isMenuOpen = openMenuId === estId;

                  return (
                    <tr
                      key={estId}
                      style={{
                        ...styles.tableRow,
                        backgroundColor: isRowSelected ? '#F0F9FF' : 'transparent',
                      }}
                    >
                      {/* Selection Checkbox */}
                      <td style={{ ...styles.td, width: '42px', textAlign: 'center', paddingLeft: '14px', paddingRight: '6px' }}>
                        <input
                          type="checkbox"
                          checked={isRowSelected}
                          onChange={() => handleSelectOne(estId)}
                          style={styles.checkboxInput}
                          aria-label={`Select ${projName}`}
                        />
                      </td>

                      {/* Project Name & Reference */}
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={styles.projectIconBadge}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="12 2 2 7 12 12 22 7 12 2" />
                              <polyline points="2 17 12 22 22 17" />
                              <polyline points="2 12 12 17 22 12" />
                            </svg>
                          </div>
                          <div>
                            <strong style={styles.projectNameText}>{projName}</strong>
                            <span style={styles.projectRefText}>{refName}</span>
                          </div>
                        </div>
                      </td>

                      {/* Deck Size */}
                      <td style={styles.td}>
                        <strong style={styles.deckSizeText}>{area}</strong>
                        <span style={styles.deckDimText}>{dims}</span>
                      </td>

                      {/* Labour & Materials */}
                      <td style={styles.td}>
                        <strong style={styles.lmHoursText}>{lm.hours}</strong>
                        <span style={styles.lmScopeText}>{lm.materials}</span>
                      </td>

                      {/* Estimator Price */}
                      <td style={styles.td}>
                        <strong style={styles.priceText}>{exactPrice}</strong>
                        {est.discountBreakdown?.applied && est.discountBreakdown?.originalTotal > (est.totalAmount || 0) ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                            <span style={{ fontSize: '11px', textDecoration: 'line-through', color: '#94a3b8' }}>
                              {formatCurrency(est.discountBreakdown.originalTotal)}
                            </span>
                            <span style={{ fontSize: '10px', color: '#15803d', fontWeight: '800', backgroundColor: '#dcfce7', padding: '1px 5px', borderRadius: '4px', border: '1px solid #86efac' }}>
                              {est.discountBreakdown.discountPercentage || 5}% Off
                            </span>
                          </div>
                        ) : (
                          <span style={styles.priceSubText}>Guaranteed Total</span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            backgroundColor: statusObj.bg,
                            color: statusObj.text,
                            borderColor: statusObj.border,
                          }}
                        >
                          <span style={{ ...styles.statusDot, backgroundColor: statusObj.dot }} />
                          {statusObj.label}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td style={styles.td}>
                        <span style={styles.dateText}>{fullDate}</span>
                      </td>

                      {/* Actions */}
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <div style={styles.actionsFlex}>
                          {/* 1. View Button: Redirects to Dedicated Full Project View Page */}
                          <button
                            type="button"
                            onClick={() => navigate(`/contractor/projects/${estId}`)}
                            style={styles.actionViewBtn}
                            title="Inspect complete technical scope on dedicated page"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            <span>View</span>
                          </button>

                          {/* 2. Print Button */}
                          <button
                            type="button"
                            onClick={() => handlePrint(est)}
                            style={styles.actionPrintBtn}
                            title="Print official PDF estimate"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 6 2 18 2 18 9" />
                              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                              <rect x="6" y="14" width="12" height="8" />
                            </svg>
                            <span>Print</span>
                          </button>

                          {/* 3. Three Dots Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (openMenuId === estId) {
                                setOpenMenuId(null);
                                setActiveMenuEst(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setMenuCoords({
                                  top: rect.bottom + 6,
                                  left: Math.max(10, rect.right - 220),
                                });
                                setActiveMenuEst(est);
                                setOpenMenuId(estId);
                              }
                            }}
                            style={styles.actionDotsBtn}
                            title="More options"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="1.5" />
                              <circle cx="19" cy="12" r="1.5" />
                              <circle cx="5" cy="12" r="1.5" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        )}

        {/* Dedicated Pagination Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '12px 18px',
            borderTop: '1px solid #E2E8F0',
            backgroundColor: '#FAFAFA',
          }}
        >
          <div style={{ fontSize: '13px', color: '#64748B' }}>
            Showing <strong>{filteredEstimates.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{' '}
            <strong>{Math.min(filteredEstimates.length, currentPage * pageSize)}</strong> of{' '}
            <strong>{filteredEstimates.length}</strong> projects
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || filteredEstimates.length === 0}
              style={{
                padding: '6px 12px',
                fontSize: '12.5px',
                fontWeight: '600',
                color: '#1E3A63',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                cursor: currentPage <= 1 || filteredEstimates.length === 0 ? 'not-allowed' : 'pointer',
                opacity: currentPage <= 1 || filteredEstimates.length === 0 ? 0.45 : 1,
              }}
            >
              &larr; Prev
            </button>

            {totalPages > 1 &&
              Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
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
              disabled={currentPage >= totalPages || filteredEstimates.length === 0}
              style={{
                padding: '6px 12px',
                fontSize: '12.5px',
                fontWeight: '600',
                color: '#1E3A63',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                cursor: currentPage >= totalPages || filteredEstimates.length === 0 ? 'not-allowed' : 'pointer',
                opacity: currentPage >= totalPages || filteredEstimates.length === 0 ? 0.45 : 1,
              }}
            >
              Next &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Floating Non-Clipping 3-Dots Dropdown Menu (Fixed in Viewport) */}
      {openMenuId && activeMenuEst && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${menuCoords.top}px`,
            left: `${menuCoords.left}px`,
            zIndex: 999999,
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E2E8F0',
            width: '220px',
            padding: '6px',
          }}
        >
          {/* Request Enquiry / Convert to Booking or Request Submitted */}
          {['REQUESTED', 'IN_REVIEW', 'COMPLETED', 'APPROVED', 'CONVERTED'].includes(
            String(activeMenuEst.estimateStatus || activeMenuEst.status || '').toUpperCase()
          ) ? (
            <div
              style={{
                ...styles.menuItem,
                color: '#15803D',
                cursor: 'default',
                opacity: 0.9,
                fontWeight: 700,
                backgroundColor: '#F0FDF4',
              }}
              title="Request has already been submitted for this estimation"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Request Submitted</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleRequestEnquiry(activeMenuEst)}
              disabled={convertingId === (activeMenuEst._id || activeMenuEst.id)}
              style={styles.menuItem}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E08131" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>{convertingId === (activeMenuEst._id || activeMenuEst.id) ? 'Submitting...' : 'Inquiry / Convert to Booking'}</span>
            </button>
          )}

          {/* Edit in Estimator */}
          <button
            type="button"
            onClick={() => {
              setOpenMenuId(null);
              const targetId = activeMenuEst._id || activeMenuEst.id;
              setActiveMenuEst(null);
              navigate(`/contractor/decks/new?estimateId=${targetId}`);
            }}
            style={styles.menuItem}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Edit in Estimator</span>
          </button>

          {/* Export PDF */}
          <button
            type="button"
            onClick={() => {
              setOpenMenuId(null);
              const est = activeMenuEst;
              setActiveMenuEst(null);
              handleExport(est, 'pdf');
            }}
            style={styles.menuItem}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export PDF</span>
          </button>

          {/* Export Excel */}
          <button
            type="button"
            onClick={() => {
              setOpenMenuId(null);
              const est = activeMenuEst;
              setActiveMenuEst(null);
              handleExport(est, 'excel');
            }}
            style={styles.menuItem}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            <span>Export Excel</span>
          </button>

          <div style={styles.menuDivider} />

          {/* Delete */}
          <button
            type="button"
            onClick={() => {
              setOpenMenuId(null);
              const estToDelete = activeMenuEst;
              setActiveMenuEst(null);
              setDeleteConfirmEst(estToDelete);
            }}
            style={{ ...styles.menuItem, color: '#DC2626' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <span>Delete Project</span>
          </button>
        </div>
      )}

      {/* BATCH DELETE CONFIRMATION MODAL */}
      {showBatchDeleteModal && (
        <div style={styles.modalOverlay} onClick={() => setShowBatchDeleteModal(false)}>
          <div style={styles.deleteModalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.deleteIconCircle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <h3 style={styles.deleteTitle}>Delete {selectedIds.length} Selected Projects?</h3>
            <p style={styles.deleteText}>
              Are you sure you want to permanently delete these <strong>{selectedIds.length} projects</strong>? This will permanently remove the estimates and blueprints from the database.
            </p>
            <div style={styles.deleteActionsRow}>
              <button
                type="button"
                onClick={() => setShowBatchDeleteModal(false)}
                style={styles.deleteCancelBtn}
                disabled={batchDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBatchDelete}
                style={styles.deleteConfirmBtn}
                disabled={batchDeleting}
              >
                {batchDeleting ? 'Deleting...' : 'Delete Selected Projects'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. DELETE CONFIRMATION MODAL                             */}
      {/* ======================================================== */}
      {deleteConfirmEst && (
        <div style={styles.modalOverlay} onClick={() => setDeleteConfirmEst(null)}>
          <div style={styles.deleteModalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.deleteIconCircle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <h3 style={styles.deleteTitle}>Delete Project Record?</h3>
            <p style={styles.deleteText}>
              Are you sure you want to permanently delete <strong>"{deleteConfirmEst.deckDetails?.projectName || deleteConfirmEst.estimateName || 'this project'}"</strong>? This will remove the estimate and its database snapshot permanently.
            </p>
            <div style={styles.deleteActionsRow}>
              <button
                type="button"
                onClick={() => setDeleteConfirmEst(null)}
                style={styles.deleteCancelBtn}
                disabled={deletingId !== null}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                style={styles.deleteConfirmBtn}
                disabled={deletingId !== null}
              >
                {deletingId ? 'Deleting...' : 'Yes, Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  pageContainer: {
    maxWidth: '1360px',
    margin: '0 auto',
    padding: '24px 20px 60px 20px',
    fontFamily: "'Inter', sans-serif",
  },
  heroBanner: {
    borderRadius: '14px',
    padding: '24px 28px',
    backgroundSize: 'cover',
    backgroundPosition: 'center right',
    border: '1px solid rgba(255, 255, 255, 0.35)',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
    marginBottom: '20px',
  },
  heroContent: {
    maxWidth: '720px',
  },
  heroBadge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '6px',
    backgroundColor: '#E08131',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  heroBadgeSecondary: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: '700',
    marginBottom: '8px',
    backdropFilter: 'blur(4px)',
  },
  heroTitle: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#FFFFFF',
    margin: '0 0 4px 0',
    letterSpacing: '-0.4px',
  },
  heroSubtitle: {
    fontSize: '12.5px',
    color: '#E2E8F0',
    margin: '0 0 14px 0',
    lineHeight: 1.45,
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
    padding: '9px 18px',
    backgroundColor: '#E08131',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12.5px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 3px 10px rgba(224, 129, 49, 0.35)',
    transition: 'all 0.18s ease',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  kpiCard: {
    border: '1.5px solid',
    borderRadius: '12px',
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
    transition: 'all 0.15s ease',
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
    fontSize: '11.5px',
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  kpiValue: {
    display: 'block',
    fontSize: '22px',
    fontWeight: '900',
    margin: '2px 0',
    letterSpacing: '-0.3px',
  },
  kpiSub: {
    display: 'block',
    fontSize: '11px',
    color: '#64748B',
  },
  controlsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '14px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  searchWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    flex: '1 1 auto',
    maxWidth: '560px',
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
  searchIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '9px 34px 9px 38px',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    outline: 'none',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.15s ease',
  },
  clearSearchBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    cursor: 'pointer',
    fontSize: '12px',
    padding: '4px',
  },
  filterActionsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginLeft: 'auto',
  },
  selectWrap: {
    position: 'relative',
  },
  selectIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
  },
  filterSelect: {
    padding: '9px 24px 9px 34px',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1E3A63',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  },
  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 18px',
    backgroundColor: '#FFFFFF',
    color: '#1E3A63',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.15s ease',
  },
  toastCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#ECFDF5',
    border: '1px solid #A7F3D0',
    color: '#15803D',
    fontSize: '13px',
    fontWeight: '600',
    padding: '10px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    overflow: 'visible',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeaderRow: {
    backgroundColor: '#F8FAFC',
    borderBottom: '1px solid #E2E8F0',
  },
  th: {
    padding: '14px 18px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
  },
  tableRow: {
    borderBottom: '1px solid #F1F5F9',
    transition: 'background-color 0.12s ease',
  },
  td: {
    padding: '16px 18px',
    fontSize: '13px',
    verticalAlign: 'middle',
  },
  projectIconBadge: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    backgroundColor: '#EFF6FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  projectNameText: {
    display: 'block',
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#0F172A',
  },
  projectRefText: {
    display: 'block',
    fontSize: '11.5px',
    color: '#64748B',
    marginTop: '2px',
    fontFamily: 'monospace',
  },
  deckSizeText: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '700',
    color: '#0F172A',
  },
  deckDimText: {
    display: 'block',
    fontSize: '11.5px',
    color: '#64748B',
    marginTop: '2px',
  },
  lmHoursText: {
    display: 'block',
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#1E3A63',
  },
  lmScopeText: {
    display: 'block',
    fontSize: '11.5px',
    color: '#64748B',
    marginTop: '2px',
  },
  priceText: {
    display: 'block',
    fontSize: '14.5px',
    fontWeight: '800',
    color: '#0F172A',
  },
  priceSubText: {
    display: 'block',
    fontSize: '11px',
    color: '#64748B',
    marginTop: '2px',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '11.5px',
    fontWeight: '700',
    border: '1px solid',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  dateText: {
    fontSize: '12.5px',
    color: '#334155',
    whiteSpace: 'nowrap',
  },
  actionsFlex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  actionViewBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    backgroundColor: '#EFF6FF',
    color: '#1E3A63',
    border: '1px solid #BFDBFE',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  actionPrintBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    backgroundColor: '#F8FAFC',
    color: '#334155',
    border: '1px solid #CBD5E1',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  actionDotsBtn: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    color: '#475569',
    border: '1px solid #CBD5E1',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  dotsMenuDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '6px',
    width: '190px',
    backgroundColor: '#FFFFFF',
    border: '1.5px solid #CBD5E1',
    borderRadius: '10px',
    boxShadow: '0 14px 35px rgba(0, 0, 0, 0.2)',
    zIndex: 99999,
    overflow: 'hidden',
    padding: '6px 0',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '9px 14px',
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'left',
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#1E293B',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease',
  },
  menuDivider: {
    height: '1px',
    backgroundColor: '#F1F5F9',
    margin: '4px 0',
  },
  loadingWrap: {
    padding: '48px 24px',
    textAlign: 'center',
  },
  spinner: {
    width: '32px',
    height: '32px',
    margin: '0 auto',
    border: '3px solid #E2E8F0',
    borderTopColor: '#1E3A63',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  emptyWrap: {
    padding: '36px 20px',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#0F172A',
    margin: '12px 0 4px 0',
  },
  emptyDesc: {
    fontSize: '13px',
    color: '#64748B',
    maxWidth: '420px',
    margin: '0 auto 18px auto',
  },
  emptyBtn: {
    padding: '9px 20px',
    backgroundColor: '#1E3A63',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '7px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '20px',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '740px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #E2E8F0',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#0F172A',
    margin: 0,
  },
  modalSubtitle: {
    fontSize: '12px',
    color: '#64748B',
    marginTop: '3px',
    display: 'block',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#64748B',
    cursor: 'pointer',
    padding: '4px',
  },
  modalBody: {
    padding: '20px 24px',
  },
  modalGrid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px',
  },
  modalBox: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '16px',
  },
  modalSectionTitle: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#1E3A63',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    margin: '0 0 12px 0',
    paddingBottom: '6px',
    borderBottom: '1px solid #E2E8F0',
  },
  modalLine: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12.5px',
    marginBottom: '8px',
    color: '#475569',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    padding: '16px 24px',
    borderTop: '1px solid #E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  modalPrintBtn: {
    padding: '8px 18px',
    backgroundColor: '#1E3A63',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12.5px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  modalCloseMainBtn: {
    padding: '8px 18px',
    backgroundColor: '#FFFFFF',
    color: '#475569',
    border: '1px solid #CBD5E1',
    borderRadius: '6px',
    fontSize: '12.5px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  deleteModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '440px',
    padding: '28px 24px',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
  },
  deleteIconCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#FEE2E2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 14px auto',
  },
  deleteTitle: {
    fontSize: '17px',
    fontWeight: '800',
    color: '#0F172A',
    margin: '0 0 8px 0',
  },
  deleteText: {
    fontSize: '13px',
    color: '#475569',
    margin: '0 0 20px 0',
    lineHeight: 1.5,
  },
  deleteActionsRow: {
    display: 'flex',
    gap: '10px',
  },
  deleteCancelBtn: {
    flex: 1,
    padding: '9px 16px',
    backgroundColor: '#FFFFFF',
    color: '#475569',
    border: '1px solid #CBD5E1',
    borderRadius: '7px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  deleteConfirmBtn: {
    flex: 1,
    padding: '9px 16px',
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '7px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};

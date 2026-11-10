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
import { getEstimates, deleteEstimate, requestProjectEstimate } from '../../customer/api/estimatesApi';
import { downloadEstimatePdf, downloadEstimateExcel } from '../../../utils/reportExport';
import contractorBannerBg from '../../../assets/images/contractor_banner_bg.png';

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
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await getEstimates({ limit: 100 });
      setEstimates(data?.estimates || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch your projects and estimates.');
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
    if (snap?.calculatedTotal !== undefined) {
      return formatCurrency(snap.calculatedTotal);
    }
    if (snap?.total !== undefined) {
      return formatCurrency(snap.total);
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

    const prep = snap.prep ? snap.prep.toUpperCase() : 'CLEAN & WASH';
    const finish = snap.finish ? snap.finish.toUpperCase() : 'PENETRATING SEALER';

    return {
      hours: `${laborHrs} hrs labor`,
      materials: `${prep} • ${finish}`,
    };
  }

  // Status Pill Resolver (Blue for CREATED, Amber for IN_REVIEW, Green for COMPLETED)
  function resolveStatusBadge(rawStatus) {
    const s = String(rawStatus || 'CREATED').toUpperCase();
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
      const name = (est.deckDetails?.projectName || est.estimateName || '').toLowerCase();
      const ref = (est.estimateNumber || est._id || '').toLowerCase();
      const wood = (est.deckDetails?.surfaceMaterial || est.pricingSnapshot?.wood || '').toLowerCase();

      const matchesSearch = !q || name.includes(q) || ref.includes(q) || wood.includes(q);

      const statusObj = resolveStatusBadge(est.estimateStatus || est.status);
      const matchesStatus =
        statusFilter === 'ALL' || statusObj.label.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [estimates, searchTerm, statusFilter]);

  // Pale Colored Shiny Summary KPI Cards
  const stats = useMemo(() => {
    const total = estimates.length;
    let inReviewCount = 0;
    let completedCount = 0;
    let totalPortfolioVal = 0;

    estimates.forEach((e) => {
      const s = resolveStatusBadge(e.estimateStatus || e.status).label;
      if (s === 'In Review') inReviewCount++;
      if (s === 'Completed') completedCount++;

      const amt = Number(e.pricingSnapshot?.calculatedTotal ?? e.totalAmount ?? 2500);
      if (!isNaN(amt)) totalPortfolioVal += amt;
    });

    return {
      total,
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

  // Batch Delete
  const handleConfirmBatchDelete = async () => {
    setBatchDeleting(true);
    try {
      await Promise.all(selectedIds.map((id) => deleteEstimate(id)));
      setEstimates((prev) => prev.filter((item) => !selectedIds.includes(item._id || item.id)));
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
            Support Hours: Monday – Friday 7:30 AM – 6:00 PM EST
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
    <div style={styles.pageContainer}>
      {/* 1. SMALL BANNER OF "MY PROJECTS" (Clean, Compact, Shiny) */}
      <section
        style={{
          ...styles.heroBanner,
          backgroundImage: `linear-gradient(90deg, #1E3A63 0%, rgba(30, 58, 99, 0.94) 55%, rgba(30, 58, 99, 0.45) 100%), url(${contractorBannerBg})`,
        }}
      >
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>My Projects</h1>
          <p style={styles.heroSubtitle}>
            Manage all your deck projects, customer proposals, and technical pricing records in one synchronized workspace.
          </p>
          <div style={styles.heroBtnRow}>
            <button
              type="button"
              onClick={() => navigate('/contractor/decks/new')}
              style={styles.heroPrimaryBtn}
            >
              <span>+ New Estimation</span>
              <span style={{ fontSize: '15px', fontWeight: '800' }}>&rarr;</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. PALE COLORED SHINY SUMMARY KPI CARDS */}
      <div style={styles.kpiGrid}>
        {/* Total Projects */}
        <div style={{ ...styles.kpiCard, backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }}>
          <div style={{ ...styles.kpiIconWrap, backgroundColor: '#DBEAFE', color: '#1E3A63' }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div>
            <span style={styles.kpiLabel}>Total Projects</span>
            <strong style={{ ...styles.kpiValue, color: '#1E3A63' }}>{stats.total}</strong>
            <span style={styles.kpiSub}>Tracked in active portfolio</span>
          </div>
        </div>

        {/* In Review / Active Quotes */}
        <div style={{ ...styles.kpiCard, backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}>
          <div style={{ ...styles.kpiIconWrap, backgroundColor: '#FEF3C7', color: '#B45309' }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <span style={styles.kpiLabel}>In Review / Dispatched</span>
            <strong style={{ ...styles.kpiValue, color: '#B45309' }}>{stats.inReviewCount}</strong>
            <span style={styles.kpiSub}>Pending homeowner approval</span>
          </div>
        </div>

        {/* Completed Projects */}
        <div style={{ ...styles.kpiCard, backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }}>
          <div style={{ ...styles.kpiIconWrap, backgroundColor: '#D1FAE5', color: '#15803D' }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <span style={styles.kpiLabel}>Completed Projects</span>
            <strong style={{ ...styles.kpiValue, color: '#15803D' }}>{stats.completedCount}</strong>
            <span style={styles.kpiSub}>Successfully converted &amp; finished</span>
          </div>
        </div>

        {/* Total Pipeline Value (Pale Purple as requested) */}
        <div style={{ ...styles.kpiCard, backgroundColor: '#FAF5FF', borderColor: '#E9D5FF' }}>
          <div style={{ ...styles.kpiIconWrap, backgroundColor: '#F3E8FF', color: '#9333EA' }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <span style={styles.kpiLabel}>Pipeline Value</span>
            <strong style={{ ...styles.kpiValue, color: '#7E22CE' }}>{formatCurrency(stats.totalPortfolioVal)}</strong>
            <span style={styles.kpiSub}>Total estimated volume</span>
          </div>
        </div>
      </div>

      {/* 3. CONTROLS BAR: SEARCH + FILTER + REFRESH */}
      <div style={styles.controlsRow}>
        {/* Search Bar */}
        <div style={styles.searchWrap}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={styles.searchIcon}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects by title, reference #, or wood species..."
            style={styles.searchInput}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={styles.clearSearchBtn}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter & Refresh Container */}
        <div style={styles.filterActionsGroup}>
          <div style={styles.selectWrap}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={styles.selectIcon}>
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="ALL">All Statuses ({estimates.length})</option>
              <option value="CREATED">Created ({stats.total - stats.inReviewCount - stats.completedCount})</option>
              <option value="IN REVIEW">In Review ({stats.inReviewCount})</option>
              <option value="COMPLETED">Completed ({stats.completedCount})</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => fetchProjects(true)}
            disabled={refreshing || loading}
            style={styles.refreshBtn}
            title="Refresh list from database"
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
          <div style={styles.loadingWrap}>
            <div style={styles.spinner} />
            <p style={{ marginTop: '12px', fontSize: '13px', color: '#64748B' }}>Loading projects &amp; estimates from database...</p>
          </div>
        ) : filteredEstimates.length === 0 ? (
          <div style={styles.emptyWrap}>
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
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
        ) : (
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
                {filteredEstimates.map((est) => {
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
                              {est.discountBreakdown.discountPercentage || 10}% Off
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

                          {/* 3. Three Dots Button (Coordinates tracked for fixed non-clipping menu) */}
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
                })}
              </tbody>
            </table>
          </div>
        )}
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
          {/* Request Enquiry / Convert to Booking */}
          <button
            type="button"
            onClick={() => handleRequestEnquiry(activeMenuEst)}
            disabled={convertingId === (activeMenuEst._id || activeMenuEst.id)}
            style={styles.menuItem}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E08131" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>{convertingId === (activeMenuEst._id || activeMenuEst.id) ? 'Submitting...' : 'Request Enquiry'}</span>
          </button>

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
    backgroundPosition: 'center',
    boxShadow: '0 4px 18px rgba(30, 58, 99, 0.15)',
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
    minWidth: '380px',
    flex: '1 1 380px',
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
    padding: '10px 38px 10px 42px',
    border: '1.5px solid #CBD5E1',
    borderRadius: '9999px',
    fontSize: '13px',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
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
    padding: '10px 36px 10px 36px',
    border: '1.5px solid #CBD5E1',
    borderRadius: '9999px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1E3A63',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  },
  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#FFFFFF',
    color: '#1E3A63',
    border: '1.5px solid #1E3A63',
    borderRadius: '9999px',
    fontSize: '13px',
    fontWeight: '700',
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
    minHeight: '360px',
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
    padding: '60px 24px',
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
    gridTemplateColumns: '1fr 1fr',
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

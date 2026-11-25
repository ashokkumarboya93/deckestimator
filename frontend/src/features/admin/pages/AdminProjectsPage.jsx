// =============================================
// Deck Estimator — Admin Projects Directory & Progress Page
// =============================================
// Features:
// - Summary KPI cards matching the pastel pill design (White circular badge, uppercase label, bold metric, chevron)
// - Real-time MongoDB synchronization across Customer and Contractor estimations
// - 4 Discrete Life Cycle Stages (No percentage bars):
//     created  ->  requested (amber)  ->  in progress (blue)  ->  completed (green)
// - Direct Admin Stage Controls: Update project stage with real-time customer & contractor portal sync
// - Shiny pill-shaped search bar, status filter pills, refresh button, and export actions
// - Comprehensive View Details modal showing deck specs, customer & contractor info, amounts, and history
// - Export to CSV & Excel

import React, { useState, useEffect, useRef } from 'react';
import { adminApi } from '../api/adminApi';
import { downloadEstimatePdf, downloadEstimateExcel } from '../../../utils/reportExport';
import { ConfirmModal, SkeletonTable, SkeletonShimmer, EmptyState } from '../../../components/common';
import { designTokens, colors, radii, shadows, typography } from '../../../theme';

const STAGES = [
  { id: 'all', label: 'All Stages' },
  { id: 'created', label: 'Created' },
  { id: 'requested', label: 'Requested' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
];

const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '15d', label: 'Last 15 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '60d', label: 'Last 60 Days' },
];

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [counts, setCounts] = useState({ total: 0, created: 0, requested: 0, inProgress: 0, completed: 0, totalValue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [lastDateFilter, setLastDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dateInputRef = useRef(null);

  // Pagination & Select All
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const [selectedProjectIds, setSelectedProjectIds] = useState([]);

  // Modals
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [stageModal, setStageModal] = useState({ open: false, project: null, stage: 'in_progress', note: '' });
  const [savingStage, setSavingStage] = useState(false);

  useEffect(() => {
    fetchProjects(1, statusFilter, searchTerm, dateRangeFilter, lastDateFilter, pageSize);
  }, [statusFilter, dateRangeFilter, lastDateFilter]);

  const fetchProjects = async (
    pageNum = page,
    filter = statusFilter,
    search = searchTerm,
    dateRange = dateRangeFilter,
    lastDate = lastDateFilter,
    limit = pageSize
  ) => {
    setLoading(true);
    setIsRefreshing(true);
    setError(null);
    try {
      const res = await adminApi.getProjects({
        status: filter !== 'all' ? filter : undefined,
        search: (search || '').trim() ? search.trim() : undefined,
        dateRange: dateRange !== 'all' ? dateRange : undefined,
        lastDate: lastDate ? lastDate : undefined,
        page: pageNum,
        limit,
      });
      setProjects(res.data || []);
      if (res.counts) {
        setCounts(res.counts);
      }
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages || 1);
        setTotalProjects(res.pagination.total || res.data?.length || 0);
        setPage(res.pagination.page || pageNum);
      } else {
        setTotalPages(1);
        setTotalProjects(res.data?.length || 0);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const allCurrentPageSelected = projects.length > 0 && projects.every(p => selectedProjectIds.includes(p._id || p.id));
  const toggleSelectAll = () => {
    if (allCurrentPageSelected) {
      setSelectedProjectIds([]);
    } else {
      const currentIds = projects.map(p => p._id || p.id);
      setSelectedProjectIds(currentIds);
    }
  };
  const toggleSelectProject = (id) => {
    setSelectedProjectIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleExport = (format = 'excel') => {
    const listToExport = selectedProjectIds.length > 0
      ? projects.filter(p => selectedProjectIds.includes(p._id || p.id))
      : projects;

    const headers = [
      'Project Reference',
      'Project Name',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Contractor Name',
      'Wood Species',
      'Deck Size',
      'Estimated Value ($)',
      'Stage',
      'Location',
      'Last Updated'
    ];

    const rows = listToExport.map(p => [
      p.estimateReference || p.projectId || 'EST',
      p.title || p.projectName || 'Deck Project',
      p.customerName || 'N/A',
      p.userEmail || '—',
      p.userPhone || '—',
      p.contractorName || 'Unassigned',
      p.woodSpecies || 'Pressure Treated Pine',
      p.deckSpecs?.dimensions ? `${p.deckSpecs.dimensions} ft` : p.deckSize || '400 sq ft',
      Number(p.totalAmount || 0),
      (p.stage || p.status || 'created').replace('_', ' ').toUpperCase(),
      p.location || 'New Jersey, USA',
      new Date(p.updatedAt || p.createdAt || Date.now()).toLocaleDateString()
    ]);

    const escapeCsv = (val) => `"${String(val !== undefined && val !== null ? val : '').replace(/"/g, '""')}"`;
    const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows.map(r => r.map(escapeCsv).join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: format === 'excel' ? 'application/vnd.ms-excel;charset=utf-8' : 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deck-projects-${statusFilter}-${Date.now()}.${format === 'excel' ? 'xls' : 'csv'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenStageModal = (project) => {
    const current = (project.stage || project.status || 'created').toLowerCase();
    const nextDefault = current === 'created' ? 'requested' : current === 'requested' ? 'in_progress' : current === 'in_progress' ? 'completed' : 'completed';
    setStageModal({
      open: true,
      project,
      stage: nextDefault,
      note: '',
    });
  };

  const handleSaveStage = async () => {
    if (!stageModal.project) return;
    setSavingStage(true);
    try {
      const targetId = stageModal.project._id || stageModal.project.id;
      await adminApi.updateProjectProgress(targetId, {
        stage: stageModal.stage,
        status: stageModal.stage,
        note: stageModal.note || `Stage updated to ${stageModal.stage.replace('_', ' ').toUpperCase()} by Administrator`,
      });
      setSuccessMsg(`Project stage updated to "${stageModal.stage.replace('_', ' ').toUpperCase()}" successfully.`);
      if (selectedProject && (selectedProject._id === targetId || selectedProject.id === targetId)) {
        setSelectedProject((prev) => ({ ...prev, stage: stageModal.stage, status: stageModal.stage }));
      }
      setStageModal({ open: false, project: null, stage: 'in_progress', note: '' });
      fetchProjects(page, statusFilter, searchTerm, dateRangeFilter, lastDateFilter, pageSize);
    } catch (err) {
      setError(err?.message || 'Failed to update project stage.');
    } finally {
      setSavingStage(false);
    }
  };

  const handleOpenDetails = async (proj) => {
    setSelectedProject(proj);
    setIsDetailsModalOpen(true);
    setLoadingDetails(true);

    // Mark project as read for admin alert bubble
    try {
      const readProjects = JSON.parse(localStorage.getItem('drp_admin_read_projects') || '[]');
      const idKey = proj._id || proj.id || proj.projectId || proj.estimateReference;
      if (idKey && !readProjects.includes(idKey)) {
        readProjects.push(idKey);
        localStorage.setItem('drp_admin_read_projects', JSON.stringify(readProjects));
        window.dispatchEvent(new CustomEvent('drp_admin_alerts_updated'));
      }
    } catch (_) {}

    try {
      const targetId = proj._id || proj.id;
      const full = await adminApi.getProjectDetails(targetId);
      if (full && (full.data || full._id)) {
        setSelectedProject(full.data || full);
      }
    } catch {
      // Keep optimistic project
    } finally {
      setLoadingDetails(false);
    }
  };

  // Enterprise Confirmation Modal States
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    id: null,
    name: '',
    loading: false,
  });
  const [bulkDeleteModalState, setBulkDeleteModalState] = useState({
    isOpen: false,
    loading: false,
  });

  const handleDeleteProject = (id, name) => {
    setDeleteModalState({
      isOpen: true,
      id,
      name: name || 'Selected Project',
      loading: false,
    });
  };

  const executeConfirmDeleteProject = async () => {
    const { id, name } = deleteModalState;
    if (!id) return;
    setDeleteModalState((prev) => ({ ...prev, loading: true }));
    setProjects((prev) => prev.filter((p) => (p._id || p.id) !== id));
    setSelectedProjectIds((prev) => prev.filter((x) => x !== id));
    if (selectedProject && (selectedProject._id === id || selectedProject.id === id)) {
      setIsDetailsModalOpen(false);
      setSelectedProject(null);
    }
    try {
      await adminApi.deleteProject(id);
      setSuccessMsg(`Project "${name}" deleted successfully.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      setDeleteModalState({ isOpen: false, id: null, name: '', loading: false });
    } catch (err) {
      setError(`Failed to delete project: ${err.message}`);
      setDeleteModalState({ isOpen: false, id: null, name: '', loading: false });
      fetchProjects(page, statusFilter, searchTerm);
    }
  };

  const handleBulkDeleteProjects = () => {
    if (selectedProjectIds.length === 0) return;
    setBulkDeleteModalState({ isOpen: true, loading: false });
  };

  const executeConfirmBulkDelete = async () => {
    setBulkDeleteModalState({ isOpen: true, loading: true });
    const idsToDelete = [...selectedProjectIds];
    setProjects((prev) => prev.filter((p) => !idsToDelete.includes(p._id || p.id)));
    setSelectedProjectIds([]);
    try {
      await adminApi.bulkDeleteProjects(idsToDelete);
      setSuccessMsg(`Successfully deleted ${idsToDelete.length} projects.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      setBulkDeleteModalState({ isOpen: false, loading: false });
    } catch (err) {
      setError(`Failed to delete selected projects: ${err.message}`);
      setBulkDeleteModalState({ isOpen: false, loading: false });
      fetchProjects(page, statusFilter, searchTerm);
    }
  };

  const renderStageBadge = (stage) => {
    const s = (stage || 'created').toLowerCase();
    if (s === 'completed') {
      return (
        <span style={styles.badgeCompleted}>
          <span style={styles.badgeDotGreen} />
          Completed
        </span>
      );
    }
    if (s === 'in_progress' || s === 'in progress') {
      return (
        <span style={styles.badgeInProgress}>
          <span style={styles.badgeDotBlue} />
          In Progress
        </span>
      );
    }
    if (s === 'requested') {
      return (
        <span style={styles.badgeRequested}>
          <span style={styles.badgeDotAmber} />
          Requested
        </span>
      );
    }
    return (
      <span style={styles.badgeCreated}>
        <span style={styles.badgeDotSlate} />
        Created
      </span>
    );
  };

  return (
    <div style={styles.container}>
      {/* 1. Header with Title and Shiny Pill Export Buttons */}
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitleRow}>
            <h1 style={styles.title}>Project Management</h1>
            <span style={styles.liveDbPill}>
              <span style={styles.pulseDot} />
              Live Projects
            </span>
          </div>
          <p style={styles.subtitle}>
            Monitor customer and contractor deck restoration estimations throughout their complete life cycle.
          </p>
        </div>
        <div style={styles.headerActions}>
          <button
            type="button"
            onClick={() => handleExport('csv')}
            style={styles.shinyExportBtn}
            title={selectedProjectIds.length > 0 ? `Export ${selectedProjectIds.length} selected project(s) as CSV` : 'Export filtered projects as CSV'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV{selectedProjectIds.length > 0 ? ` (${selectedProjectIds.length})` : ''}
          </button>
          <button
            type="button"
            onClick={() => handleExport('excel')}
            style={styles.shinyExportGreenBtn}
            title={selectedProjectIds.length > 0 ? `Export ${selectedProjectIds.length} selected project(s) as Excel` : 'Export filtered projects as Excel'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Export Excel{selectedProjectIds.length > 0 ? ` (${selectedProjectIds.length})` : ''}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div style={styles.alertSuccess}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2.2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span style={{ marginLeft: 8, flex: 1 }}>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} style={styles.alertCloseBtn}>✕</button>
        </div>
      )}

      {error && (
        <div style={styles.alertError}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2.2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
          </svg>
          <span style={{ marginLeft: 8, flex: 1 }}>{error}</span>
          <button onClick={() => setError(null)} style={styles.alertCloseBtn}>✕</button>
        </div>
      )}

      {/* 2. Summary KPI Cards (Pastel Pill Cards Matching Uploaded Reference Image) */}
      <div style={styles.cardsRow}>
        {/* Card 1: TOTAL ESTIMATIONS (Blue Pill) */}
        <div style={styles.cardBlueRef} onClick={() => setStatusFilter('all')}>
          <div style={styles.cardRefInner}>
            <div style={styles.cardRefLeft}>
              <div style={styles.iconCircleWhite}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div>
                <div style={styles.cardRefLabelBlue}>TOTAL ESTIMATIONS</div>
                <div style={styles.cardRefValueBlue}>
                  {loading ? (
                    <SkeletonShimmer width="48px" height="26px" borderRadius="6px" style={{ marginTop: '2px' }} />
                  ) : (
                    counts.total ?? projects.length
                  )}
                </div>
              </div>
            </div>
            <div style={styles.chevronBlue}>›</div>
          </div>
        </div>

        {/* Card 2: REQUESTED PROJECTS (Amber Pill) */}
        <div style={styles.cardAmberRef} onClick={() => setStatusFilter('requested')}>
          <div style={styles.cardRefInner}>
            <div style={styles.cardRefLeft}>
              <div style={styles.iconCircleWhite}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <div>
                <div style={styles.cardRefLabelAmber}>REQUESTED PROJECTS</div>
                <div style={styles.cardRefValueAmber}>
                  {loading ? (
                    <SkeletonShimmer width="48px" height="26px" borderRadius="6px" style={{ marginTop: '2px' }} />
                  ) : (
                    counts.requested ?? 0
                  )}
                </div>
              </div>
            </div>
            <div style={styles.chevronAmber}>›</div>
          </div>
        </div>

        {/* Card 3: IN PROGRESS (Purple Pill) */}
        <div style={styles.cardPurpleRef} onClick={() => setStatusFilter('in_progress')}>
          <div style={styles.cardRefInner}>
            <div style={styles.cardRefLeft}>
              <div style={styles.iconCircleWhite}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7e22ce" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <div>
                <div style={styles.cardRefLabelPurple}>IN PROGRESS</div>
                <div style={styles.cardRefValuePurple}>
                  {loading ? (
                    <SkeletonShimmer width="48px" height="26px" borderRadius="6px" style={{ marginTop: '2px' }} />
                  ) : (
                    counts.inProgress ?? 0
                  )}
                </div>
              </div>
            </div>
            <div style={styles.chevronPurple}>›</div>
          </div>
        </div>

        {/* Card 4: COMPLETED PROJECTS (Emerald Pill) */}
        <div style={styles.cardGreenRef} onClick={() => setStatusFilter('completed')}>
          <div style={styles.cardRefInner}>
            <div style={styles.cardRefLeft}>
              <div style={styles.iconCircleWhite}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <div style={styles.cardRefLabelGreen}>COMPLETED PROJECTS</div>
                <div style={styles.cardRefValueGreen}>
                  {loading ? (
                    <SkeletonShimmer width="48px" height="26px" borderRadius="6px" style={{ marginTop: '2px' }} />
                  ) : (
                    counts.completed ?? 0
                  )}
                </div>
              </div>
            </div>
            <div style={styles.chevronGreen}>›</div>
          </div>
        </div>
      </div>

      {/* 3. Controls Bar: Single Row [Search | Stage Filter | Days Range | Date Picker | Refresh | Bulk Delete] */}
      <div style={styles.controlBar}>
        {/* Search Input */}
        <div style={styles.shinySearchWrapper}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" style={{ marginRight: 8, flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search estimations by name, customer, contractor, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setPage(1);
                fetchProjects(1, statusFilter, searchTerm, dateRangeFilter, lastDateFilter, pageSize);
              }
            }}
            style={styles.shinySearchInput}
          />
          {searchTerm && (
            <button onClick={() => { setSearchTerm(''); setPage(1); fetchProjects(1, statusFilter, '', dateRangeFilter, lastDateFilter, pageSize); }} style={styles.clearSearchBtn} title="Clear search">✕</button>
          )}
        </div>

        {/* Stage Filter Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => {
            const val = e.target.value;
            setStatusFilter(val);
            setPage(1);
            fetchProjects(1, val, searchTerm, dateRangeFilter, lastDateFilter, pageSize);
          }}
          style={styles.shinySelect}
          title="Filter by life cycle stage"
        >
          <option value="all">All Stages ({counts.total || 0})</option>
          <option value="created">Created ({counts.created || 0})</option>
          <option value="requested">Requested ({counts.requested || 0})</option>
          <option value="in_progress">In Progress ({counts.inProgress || 0})</option>
          <option value="completed">Completed ({counts.completed || 0})</option>
        </select>

        {/* Days Range Dropdown Filter */}
        <select
          value={dateRangeFilter}
          onChange={(e) => {
            const val = e.target.value;
            setDateRangeFilter(val);
            setPage(1);
            fetchProjects(1, statusFilter, searchTerm, val, lastDateFilter, pageSize);
          }}
          style={styles.shinySelect}
          title="Filter by date range"
        >
          {DATE_RANGE_OPTIONS.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>

        {/* Date Selector Button (opens calendar on click, matches row height & button styling) */}
        <div
          style={styles.shinyDateWrapper}
          onClick={() => dateInputRef.current?.showPicker?.()}
          title="Click to filter by date"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" style={{ flexShrink: 0 }}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <input
            ref={dateInputRef}
            type="date"
            value={lastDateFilter}
            onChange={(e) => {
              const val = e.target.value;
              setLastDateFilter(val);
              setPage(1);
              fetchProjects(1, statusFilter, searchTerm, dateRangeFilter, val, pageSize);
            }}
            style={styles.shinyDateInput}
            title="Filter records up to this date"
          />
          {lastDateFilter && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLastDateFilter('');
                setPage(1);
                fetchProjects(1, statusFilter, searchTerm, dateRangeFilter, '', pageSize);
              }}
              style={styles.clearDateBtn}
              title="Clear date filter"
            >
              ✕
            </button>
          )}
        </div>

        {/* Refresh Button */}
        <button
          onClick={() => fetchProjects(page, statusFilter, searchTerm, dateRangeFilter, lastDateFilter, pageSize)}
          style={styles.shinyRefreshBtn}
          title="Refresh Projects Database"
          disabled={loading}
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
              transition: 'transform 0.4s ease',
              transform: isRefreshing ? 'rotate(360deg)' : 'none',
              marginRight: 6,
            }}
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Refresh
        </button>

        {selectedProjectIds.length > 0 && (
          <button
            type="button"
            onClick={handleBulkDeleteProjects}
            style={styles.shinyBulkDeleteBtn}
            title="Permanently delete all selected project estimations"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Delete Selected ({selectedProjectIds.length})
          </button>
        )}
      </div>

      {/* 4. Projects Table */}
      <div style={styles.card}>
        {loading ? (
          <div style={{ padding: '4px' }}>
            <SkeletonTable rows={5} columns={6} />
          </div>
        ) : projects.length === 0 ? (
          <div style={styles.emptyBox}>
            <div style={styles.emptyIconCircle}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <p style={styles.emptyTitle}>No project estimations found</p>
            <p style={styles.emptySub}>
              {searchTerm
                ? 'No matching projects match your search keywords.'
                : 'Customer and contractor estimations will automatically show up as projects.'}
            </p>
          </div>
        ) : (
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: '44px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={allCurrentPageSelected}
                      onChange={toggleSelectAll}
                      style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#1d4ed8' }}
                      title="Select all projects on this page"
                    />
                  </th>
                  <th style={{ ...styles.th, width: '32%' }}>Project / Estimation</th>
                  <th style={{ ...styles.th, width: '25%' }}>Customer / Initiator</th>
                  <th style={{ ...styles.th, width: '18%' }}>Estimated Value</th>
                  <th style={{ ...styles.th, width: '13%' }}>Life Cycle Stage</th>
                  <th style={{ ...styles.th, width: '12%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p._id || p.id} style={styles.tr}>
                    <td style={{ ...styles.td, width: '44px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedProjectIds.includes(p._id || p.id)}
                        onChange={() => toggleSelectProject(p._id || p.id)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#1d4ed8' }}
                      />
                    </td>
                    {/* Project & Ref */}
                    <td style={styles.td}>
                      <div style={styles.projectTitleRow}>
                        <span style={styles.projectTitle}>{p.title || p.projectName || 'Deck Restoration Project'}</span>
                        <span style={styles.referenceBadge}>{p.estimateReference || p.projectId || 'EST'}</span>
                      </div>
                      <div style={styles.projectSub}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {p.location || 'New Jersey, USA'}
                      </div>
                    </td>

                    {/* Customer / Initiator */}
                    <td style={styles.td}>
                      <div style={styles.contactName}>{p.customerName || 'Homeowner Customer'}</div>
                      <div style={styles.contactEmail}>{p.userEmail || '—'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                        {p.userPhone && <span style={styles.contactPhone}>{p.userPhone}</span>}
                        <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', backgroundColor: p.userRole === 'contractor' ? '#eff6ff' : '#ecfdf5', color: p.userRole === 'contractor' ? '#1d4ed8' : '#047857', fontWeight: '700' }}>
                          {p.userRole === 'contractor' ? 'Contractor' : 'Customer'}
                        </span>
                      </div>
                    </td>

                    {/* Estimated Value & Total SqFt */}
                    <td style={styles.td}>
                      <div style={styles.amountPrimary}>
                        ${Number(p.totalAmount || 0).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '11px', color: '#047857', fontWeight: '700', marginTop: '2px' }}>
                        {p.areaSqFt || p.deckSpecs?.area || 400} sq ft
                      </div>
                      <div style={styles.amountSub}>Calculated Price</div>
                    </td>

                    {/* Life Cycle Stage */}
                    <td style={styles.td}>
                      {renderStageBadge(p.stage || p.status)}
                    </td>

                    {/* Actions */}
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={styles.actionGroup}>
                        <button
                          onClick={() => handleOpenStageModal(p)}
                          style={styles.btnUpdateStage}
                          title="Update Life Cycle Stage"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: 4 }}>
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                          Update Stage
                        </button>
                        <button
                          onClick={() => handleOpenDetails(p)}
                          style={styles.btnViewDetails}
                          title="View Full Estimation Dossier"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleDeleteProject(p._id || p.id, p.title || p.projectName || 'Project')}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: '#fee2e2',
                            color: '#b91c1c',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease',
                          }}
                          title="Permanently delete project estimation"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div style={styles.paginationBar}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={styles.paginationInfo}>
                  Showing {totalProjects === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalProjects)} of {totalProjects} project estimations
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Show:</label>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      const newSize = Number(e.target.value);
                      setPageSize(newSize);
                      setPage(1);
                      fetchProjects(1, statusFilter, searchTerm, dateRangeFilter, lastDateFilter, newSize);
                    }}
                    style={styles.pageSizeSelect}
                    title="Select number of projects per page"
                  >
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>
              </div>

              <div style={styles.paginationActions}>
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => {
                    const nextP = Math.max(1, page - 1);
                    setPage(nextP);
                    fetchProjects(nextP, statusFilter, searchTerm, dateRangeFilter, lastDateFilter, pageSize);
                  }}
                  style={page <= 1 ? styles.pageBtnDisabled : styles.pageBtn}
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, totalPages || 1) }, (_, i) => {
                  const pNum = i + 1;
                  const isCurrent = page === pNum;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => {
                        setPage(pNum);
                        fetchProjects(pNum, statusFilter, searchTerm, dateRangeFilter, lastDateFilter, pageSize);
                      }}
                      style={isCurrent ? styles.pageBtnActive : styles.pageBtn}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() => {
                    const nextP = Math.min(totalPages, page + 1);
                    setPage(nextP);
                    fetchProjects(nextP, statusFilter, searchTerm, dateRangeFilter, lastDateFilter, pageSize);
                  }}
                  style={page >= totalPages ? styles.pageBtnDisabled : styles.pageBtn}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Update Life Cycle Stage Modal */}
      {stageModal.open && stageModal.project && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Update Life Cycle Stage</h3>
                <p style={styles.modalSub}>
                  {stageModal.project.title || stageModal.project.projectName} ({stageModal.project.estimateReference || stageModal.project.projectId})
                </p>
              </div>
              <button
                onClick={() => setStageModal({ open: false, project: null, stage: 'in_progress', note: '' })}
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Current Stage</label>
                <div style={{ marginBottom: 12 }}>
                  {renderStageBadge(stageModal.project.stage || stageModal.project.status)}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Select New Life Cycle Stage</label>
                <div style={styles.stageChoiceGrid}>
                  {[
                    { id: 'created', label: 'Created', desc: 'Initial estimation generated', color: '#64748b' },
                    { id: 'requested', label: 'Requested', desc: 'Customer/Contractor reached out or booked', color: '#d97706' },
                    { id: 'in_progress', label: 'In Progress', desc: 'Staff or crew work commenced', color: '#2563eb' },
                    { id: 'completed', label: 'Completed', desc: 'Deck restoration finished & delivered', color: '#16a34a' },
                  ].map((st) => (
                    <div
                      key={st.id}
                      onClick={() => setStageModal({ ...stageModal, stage: st.id })}
                      style={{
                        ...styles.stageChoiceCard,
                        ...(stageModal.stage === st.id ? styles.stageChoiceCardActive : {}),
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700, fontSize: '13px', color: st.color }}>{st.label}</span>
                        <input
                          type="radio"
                          name="targetStage"
                          checked={stageModal.stage === st.id}
                          onChange={() => setStageModal({ ...stageModal, stage: st.id })}
                        />
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: 4 }}>{st.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Stage Update Note / Customer Facing Message</label>
                <textarea
                  rows={3}
                  placeholder="e.g., Work schedule confirmed; crew dispatched for stripping and restoration..."
                  value={stageModal.note}
                  onChange={(e) => setStageModal({ ...stageModal, note: e.target.value })}
                  style={styles.modalTextarea}
                />
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: 4, display: 'block' }}>
                  This update synchronizes in real time with the customer and contractor portals.
                </span>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setStageModal({ open: false, project: null, stage: 'in_progress', note: '' })}
                style={styles.btnCancel}
                disabled={savingStage}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStage}
                style={styles.btnSaveStage}
                disabled={savingStage}
              >
                {savingStage ? 'Updating Stage...' : 'Apply Stage Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. View Details Modal (Expanded Comprehensive Report Preview) */}
      {isDetailsModalOpen && selectedProject && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalBox, maxWidth: '960px', width: '95vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
            <div style={styles.modalHeader}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={styles.modalTitle}>{selectedProject.title || selectedProject.projectName}</h3>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#e2e8f0', fontWeight: '700', color: '#1e293b' }}>
                    {selectedProject.estimateReference || selectedProject.projectId}
                  </span>
                </div>
                <p style={styles.modalSub}>
                  Created: {new Date(selectedProject.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(selectedProject.createdAt || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} • Location: {selectedProject.location || 'New Jersey, USA'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleOpenStageModal(selectedProject)}
                  style={styles.modalBtnUpdateStage}
                  title="Update Life Cycle Stage"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginRight: 4 }}>
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  <span>Update Stage</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadEstimatePdf(selectedProject, {
                    fullName: selectedProject.customerName,
                    email: selectedProject.userEmail,
                    phone: selectedProject.userPhone,
                    location: selectedProject.location,
                  })}
                  style={styles.modalBtnExportPdf}
                  title="Download Official PDF Report"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  <span>Export PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadEstimateExcel(selectedProject, {
                    fullName: selectedProject.customerName,
                    email: selectedProject.userEmail,
                    phone: selectedProject.userPhone,
                    location: selectedProject.location,
                  })}
                  style={styles.modalBtnExportExcel}
                  title="Export Data as Excel / CSV"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="8" y1="13" x2="16" y2="17" />
                    <line x1="16" y1="13" x2="8" y2="17" />
                  </svg>
                  <span>Export Excel</span>
                </button>
                <button onClick={() => setIsDetailsModalOpen(false)} style={styles.closeBtn}>✕</button>
              </div>
            </div>

            <div style={{ ...styles.modalBody, overflowY: 'auto', flex: 1, padding: '20px 24px' }}>
              {/* Top Highlights Banner */}
              <div style={styles.detailsHighlightRow}>
                <div style={styles.highlightBlock}>
                  <span style={styles.highlightLabel}>Life Cycle Stage</span>
                  <div style={{ marginTop: 4 }}>
                    {renderStageBadge(selectedProject.stage || selectedProject.status)}
                  </div>
                </div>
                <div style={styles.highlightBlock}>
                  <span style={styles.highlightLabel}>Guaranteed Estimate</span>
                  <span style={styles.highlightAmount}>${Number(selectedProject.totalAmount || 2500).toLocaleString()}</span>
                </div>
                <div style={styles.highlightBlock}>
                  <span style={styles.highlightLabel}>Deck Dimensions & Area</span>
                  <span style={styles.highlightText}>
                    {selectedProject.deckSpecs?.dimensions ? `${selectedProject.deckSpecs.dimensions} ft` : ''} ({selectedProject.areaSqFt || selectedProject.deckSpecs?.area || 400} sq ft)
                  </span>
                </div>
                <div style={styles.highlightBlock}>
                  <span style={styles.highlightLabel}>Assigned Partner</span>
                  <span style={styles.highlightText}>
                    {selectedProject.contractorName || 'Deck Restoration Plus Staff'}
                  </span>
                </div>
              </div>

              {/* Dossier Grid */}
              <div style={styles.dossierGrid}>
                {/* 1. Customer & Property Contact */}
                <div style={styles.dossierCard}>
                  <h4 style={styles.dossierSectionTitle}>👤 Customer & Property Dossier</h4>
                  <div style={styles.dossierItem}>
                    <span style={styles.dossierLabel}>Name:</span>
                    <span style={styles.dossierVal}>{selectedProject.customerName || 'Valued Homeowner'}</span>
                  </div>
                  <div style={styles.dossierItem}>
                    <span style={styles.dossierLabel}>Email:</span>
                    <span style={styles.dossierVal}>{selectedProject.userEmail || '—'}</span>
                  </div>
                  <div style={styles.dossierItem}>
                    <span style={styles.dossierLabel}>Phone:</span>
                    <span style={styles.dossierVal}>{selectedProject.userPhone || '—'}</span>
                  </div>
                  <div style={styles.dossierItem}>
                    <span style={styles.dossierLabel}>Property Location:</span>
                    <span style={styles.dossierVal}>
                      {selectedProject.propertyAddress?.street
                        ? `${selectedProject.propertyAddress.street}, ${selectedProject.propertyAddress.city || ''} ${selectedProject.propertyAddress.state || ''} ${selectedProject.propertyAddress.zipCode || ''}`
                        : (selectedProject.location || 'New Jersey, USA')}
                    </span>
                  </div>
                  <div style={styles.dossierItem}>
                    <span style={styles.dossierLabel}>User Role:</span>
                    <span style={styles.dossierVal}>{selectedProject.userRole?.toUpperCase() || 'CUSTOMER'}</span>
                  </div>
                  <div style={styles.dossierItem}>
                    <span style={styles.dossierLabel}>Creation Time:</span>
                    <span style={styles.dossierVal}>{new Date(selectedProject.createdAt || Date.now()).toLocaleString()}</span>
                  </div>
                </div>

                {/* 2. Deck Footprint & Dimensions */}
                <div style={styles.dossierCard}>
                  <h4 style={styles.dossierSectionTitle}>📐 Deck Footprint & Structure</h4>
                  <div style={styles.dossierItem}>
                    <span style={styles.dossierLabel}>Deck Shape:</span>
                    <span style={styles.dossierVal}>{(selectedProject.deckSpecs?.shape || selectedProject.estimateData?.deckDetails?.deckShape || 'rectangle').replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                  <div style={styles.dossierItem}>
                    <span style={styles.dossierLabel}>Wood / Material:</span>
                    <span style={styles.dossierVal}>{selectedProject.woodSpecies || 'Pressure Treated Pine'}</span>
                  </div>
                  <div style={styles.dossierItem}>
                    <span style={styles.dossierLabel}>Dimensions:</span>
                    <span style={styles.dossierVal}>{selectedProject.deckSpecs?.dimensions || '20 x 20'} ft</span>
                  </div>
                  <div style={styles.dossierItem}>
                    <span style={styles.dossierLabel}>Floor Surface Area:</span>
                    <span style={styles.dossierVal}>{selectedProject.areaSqFt || selectedProject.deckSpecs?.area || 400} sq ft</span>
                  </div>
                  <div style={styles.dossierItem}>
                    <span style={styles.dossierLabel}>Elevation / Access:</span>
                    <span style={styles.dossierVal}>{(selectedProject.structureDetails?.height || selectedProject.deckSpecs?.height || 'Ground Level (0–4 ft)').replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                  <div style={styles.dossierItem}>
                    <span style={styles.dossierLabel}>Exact Elevation:</span>
                    <span style={styles.dossierVal}>{selectedProject.structureDetails?.exactHeightFt ? `${selectedProject.structureDetails.exactHeightFt} ft` : 'Standard'}</span>
                  </div>
                </div>

                {/* 3. Restoration Scope & Services */}
                <div style={styles.dossierCard}>
                  <h4 style={styles.dossierSectionTitle}>🛠️ Restoration Scope & Services</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '8px 0 12px' }}>
                    {Array.isArray(selectedProject.services) && selectedProject.services.length > 0 ? (
                      selectedProject.services.map((svc, i) => (
                        <span
                          key={i}
                          style={{
                            padding: '4px 9px',
                            borderRadius: '6px',
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            fontSize: '11px',
                            fontWeight: '700',
                            border: '1px solid #bfdbfe',
                            textTransform: 'uppercase',
                          }}
                        >
                          ✓ {String(svc).replace(/_/g, ' ')}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Cleaning & Standard Sealing</span>
                    )}
                  </div>
                  <div style={styles.dossierItem}>
                    <span style={styles.dossierLabel}>Existing Coating:</span>
                    <span style={styles.dossierVal}>{(selectedProject.surfaceDetails?.coatingStatus || selectedProject.estimateData?.surfaceDetails?.coatingStatus || 'None / Bare Wood').replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                  <div style={styles.dossierItem}>
                    <span style={styles.dossierLabel}>Surface Condition:</span>
                    <span style={styles.dossierVal}>{(selectedProject.visibleConditions?.length ? selectedProject.visibleConditions.join(', ') : 'Standard Weathering').replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                </div>

                {/* 4. Structural Components */}
                <div style={styles.dossierCard}>
                  <h4 style={styles.dossierSectionTitle}>🏗️ Structural Components</h4>
                  <div style={styles.dossierItem}>
                    <span style={styles.dossierLabel}>Perimeter Railings:</span>
                    <span style={styles.dossierVal}>{selectedProject.structureDetails?.hasRailings ? `Yes (${selectedProject.structureDetails?.railingSqft || 50} sq ft)` : 'None'}</span>
                  </div>
                  <div style={styles.dossierItem}>
                    <span style={styles.dossierLabel}>Stair Steps:</span>
                    <span style={styles.dossierVal}>{selectedProject.structureDetails?.hasStairs ? `Yes (${selectedProject.structureDetails?.stairStepCount || 4} steps)` : 'None'}</span>
                  </div>
                  <div style={styles.dossierItem}>
                    <span style={styles.dossierLabel}>Pergola Overhead:</span>
                    <span style={styles.dossierVal}>{selectedProject.structureDetails?.hasPergola ? `Yes (${selectedProject.structureDetails?.pergolaSqft || 100} sq ft)` : 'None'}</span>
                  </div>
                  <div style={styles.dossierItem}>
                    <span style={styles.dossierLabel}>Privacy Screen / Wall:</span>
                    <span style={styles.dossierVal}>{selectedProject.structureDetails?.hasPrivacyWall ? `Yes (${selectedProject.structureDetails?.privacyWallSqft || 60} sq ft)` : 'None'}</span>
                  </div>
                  <div style={styles.dossierItem}>
                    <span style={styles.dossierLabel}>Fascia Banding:</span>
                    <span style={styles.dossierVal}>{selectedProject.structureDetails?.hasFascia ? 'Yes' : 'No'}</span>
                  </div>
                  <div style={styles.dossierItem}>
                    <span style={styles.dossierLabel}>Underside Joists:</span>
                    <span style={styles.dossierVal}>{selectedProject.structureDetails?.includeJoists ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              {/* 5. SECTION 8: UPLOADED INSPECTION PHOTOS GALLERY */}
              <div style={{ ...styles.dossierCard, marginBottom: '16px', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                      📸 Section 8 — Uploaded Deck Photos ({selectedProject.photos?.length || 0})
                    </h4>
                    {selectedProject.photos && selectedProject.photos.length > 0 && (
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: '#dcfce7', color: '#166534', fontWeight: '700' }}>
                        Customer Uploaded
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    Click any photo to enlarge
                  </span>
                </div>

                {selectedProject.photos && selectedProject.photos.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '14px' }}>
                    {selectedProject.photos.map((photo, idx) => {
                      const photoUrl = typeof photo === 'string' ? photo : (photo?.url || photo?.data || '');
                      return (
                        <div
                          key={idx}
                          onClick={() => setPreviewPhoto(photoUrl)}
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            backgroundColor: '#f8fafc',
                            cursor: 'pointer',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
                          }}
                        >
                          <div style={{ width: '100%', height: '125px', overflow: 'hidden', position: 'relative', backgroundColor: '#0f172a' }}>
                            <img
                              src={photoUrl}
                              alt={`Inspection Photo ${idx + 1}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{ position: 'absolute', bottom: 4, right: 6, backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                              🔍 Click to zoom
                            </div>
                          </div>
                          <div style={{ padding: '8px 10px', fontSize: '11px', fontWeight: '700', color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Photo #{idx + 1}</span>
                            <span style={{ fontSize: '10px', color: '#94a3b8' }}>Inspection</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" style={{ margin: '0 auto 8px' }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b', fontWeight: '600' }}>
                      No inspection photos uploaded by the user for this deck estimation.
                    </p>
                  </div>
                )}
              </div>

              {/* 6. Pricing Summary Breakdown */}
              <div style={styles.pricingSummaryBox}>
                <h4 style={styles.dossierSectionTitle}>💰 Financial Pricing Breakdown</h4>
                <div style={styles.dossierItem}>
                  <span style={styles.dossierLabel}>Estimate Reference:</span>
                  <span style={styles.dossierVal}>{selectedProject.estimateReference || selectedProject.projectId}</span>
                </div>
                <div style={styles.dossierItem}>
                  <span style={styles.dossierLabel}>Status / Lifecycle:</span>
                  <span style={styles.dossierVal}>{(selectedProject.stage || selectedProject.status || 'CREATED').toUpperCase()}</span>
                </div>
                <div style={styles.dossierItem}>
                  <span style={styles.dossierLabel}>Minimum Job Dispatch Price:</span>
                  <span style={styles.dossierVal}>$2,500.00</span>
                </div>
                <div style={{ ...styles.dossierItem, borderTop: '1.5px solid #cbd5e1', paddingTop: '8px', marginTop: '6px' }}>
                  <span style={{ ...styles.dossierLabel, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Guaranteed Estimate Total:</span>
                  <span style={{ ...styles.dossierVal, fontSize: '18px', fontWeight: '900', color: '#047857' }}>
                    ${Number(selectedProject.totalAmount || 2500).toLocaleString()}
                  </span>
                </div>
                {selectedProject.estimateData?.customerFacingStatus?.note && (
                  <div style={{ marginTop: '8px', padding: '8px 12px', backgroundColor: '#eff6ff', borderRadius: '6px', fontSize: '11.5px', color: '#1e40af' }}>
                    <strong>Latest Dispatch Note:</strong> {selectedProject.estimateData.customerFacingStatus.note}
                  </div>
                )}
              </div>
            </div>

            <div style={styles.modalFooter}>
              <div style={{ display: 'flex', gap: '8px', marginRight: 'auto' }}>
                <button
                  type="button"
                  onClick={() => downloadEstimatePdf(selectedProject, {
                    fullName: selectedProject.customerName,
                    email: selectedProject.userEmail,
                    phone: selectedProject.userPhone,
                    location: selectedProject.location,
                  })}
                  style={styles.modalBtnExportPdf}
                >
                  Download PDF Report
                </button>
                <button
                  type="button"
                  onClick={() => downloadEstimateExcel(selectedProject, {
                    fullName: selectedProject.customerName,
                    email: selectedProject.userEmail,
                    phone: selectedProject.userPhone,
                    location: selectedProject.location,
                  })}
                  style={styles.modalBtnExportExcel}
                >
                  Download Excel
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteProject(selectedProject._id || selectedProject.id, selectedProject.title || selectedProject.projectName || 'Project')}
                style={{
                  padding: '9px 16px',
                  backgroundColor: '#fee2e2',
                  color: '#b91c1c',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                title="Permanently delete project estimation"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                <span>Delete Project</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                style={styles.btnCancel}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  handleOpenStageModal(selectedProject);
                }}
                style={styles.btnSaveStage}
              >
                Update Stage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Photo Lightbox Modal */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.88)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              backgroundColor: '#000',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <button
              onClick={() => setPreviewPhoto(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                backgroundColor: 'rgba(255,255,255,0.85)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                fontSize: '18px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0f172a',
                zIndex: 10,
              }}
            >
              ✕
            </button>
            <img
              src={previewPhoto}
              alt="Deck Inspection Enlarged"
              style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', display: 'block' }}
            />
          </div>
        </div>
      )}

      {/* Enterprise Single Project Delete Confirm Modal */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        title="Delete Project Estimation?"
        message={`Are you sure you want to delete project "${deleteModalState.name}"? This will permanently remove the estimation record and all associated specifications.`}
        confirmLabel="Delete Project"
        variant="danger"
        isLoading={deleteModalState.loading}
        onConfirm={executeConfirmDeleteProject}
        onClose={() =>
          !deleteModalState.loading &&
          setDeleteModalState({ isOpen: false, id: null, name: '', loading: false })
        }
      />

      {/* Enterprise Bulk Delete Confirm Modal */}
      <ConfirmModal
        isOpen={bulkDeleteModalState.isOpen}
        title={`Delete ${selectedProjectIds.length} Selected Projects?`}
        message={`Are you sure you want to permanently delete these ${selectedProjectIds.length} selected project estimations? This action cannot be undone.`}
        confirmLabel="Delete Selected"
        variant="danger"
        isLoading={bulkDeleteModalState.loading}
        onConfirm={executeConfirmBulkDelete}
        onClose={() =>
          !bulkDeleteModalState.loading &&
          setBulkDeleteModalState({ isOpen: false, loading: false })
        }
      />
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1440px',
    margin: '0 auto',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '14px',
  },
  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.3px',
  },
  liveDbPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#ecfdf5',
    color: '#047857',
    border: '1px solid #a7f3d0',
    padding: '3px 10px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: '700',
  },
  pulseDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)',
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: '4px 0 0',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  shinyExportBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '9999px',
    backgroundColor: '#ffffff',
    color: '#334155',
    border: '1px solid #cbd5e1',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
    fontSize: '12px',
    fontWeight: '700',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  shinyExportGreenBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '9999px',
    backgroundColor: '#047857',
    color: '#ffffff',
    border: '1px solid #065f46',
    boxShadow: '0 1px 3px rgba(4, 120, 87, 0.25), inset 0 1px 0 rgba(255,255,255,0.25)',
    fontSize: '12px',
    fontWeight: '700',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },

  // Pastel Pill Summary Cards
  cardsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '12px',
    marginBottom: '18px',
  },
  cardRefInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardRefLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  iconCircleWhite: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    flexShrink: 0,
  },

  // 1. Blue Pill
  cardBlueRef: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '16px',
    padding: '12px 14px',
    boxShadow: '0 1px 3px rgba(29, 78, 216, 0.05)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  cardRefLabelBlue: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#1d4ed8',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  cardRefValueBlue: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#1e3a8a',
    marginTop: '1px',
    lineHeight: 1.15,
  },
  chevronBlue: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#3b82f6',
  },

  // 2. Amber Pill
  cardAmberRef: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '16px',
    padding: '12px 14px',
    boxShadow: '0 1px 3px rgba(217, 119, 6, 0.05)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  cardRefLabelAmber: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#b45309',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  cardRefValueAmber: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#78350f',
    marginTop: '1px',
    lineHeight: 1.15,
  },
  chevronAmber: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#f59e0b',
  },

  // 3. Purple Pill
  cardPurpleRef: {
    backgroundColor: '#faf5ff',
    border: '1px solid #e9d5ff',
    borderRadius: '16px',
    padding: '12px 14px',
    boxShadow: '0 1px 3px rgba(126, 34, 206, 0.05)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  cardRefLabelPurple: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#7e22ce',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  cardRefValuePurple: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#581c87',
    marginTop: '1px',
    lineHeight: 1.15,
  },
  chevronPurple: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#a855f7',
  },

  // 4. Emerald Pill
  cardGreenRef: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '16px',
    padding: '12px 14px',
    boxShadow: '0 1px 3px rgba(22, 163, 74, 0.05)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  cardRefLabelGreen: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#15803d',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  cardRefValueGreen: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#14532d',
    marginTop: '1px',
    lineHeight: 1.15,
  },
  chevronGreen: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#22c55e',
  },

  // Controls Bar
  controlBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  shinySearchWrapper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '9999px',
    padding: '6px 14px',
    width: '320px',
    maxWidth: '100%',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04), inset 0 1px 2px rgba(0,0,0,0.02)',
  },
  shinySearchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '13px',
    color: '#0f172a',
    width: '100%',
    backgroundColor: 'transparent',
  },
  clearSearchBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '12px',
    padding: '0 4px',
  },
  stageFilterPills: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
  },
  shinyStageBtn: {
    padding: '6px 14px',
    borderRadius: '9999px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  },
  shinyStageBtnActive: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    borderColor: '#0f172a',
    boxShadow: '0 2px 4px rgba(15, 23, 42, 0.2)',
  },
  shinyRefreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 14px',
    borderRadius: '9999px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    color: '#334155',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    transition: 'all 0.15s ease',
  },
  shinySelect: {
    padding: '7px 12px',
    borderRadius: '8px',
    border: '1.5px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    color: '#334155',
    outline: 'none',
    cursor: 'pointer',
    height: '36px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    transition: 'border-color 0.15s ease',
  },
  shinyDateWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    height: '36px',
    padding: '0 10px',
    borderRadius: '8px',
    border: '1.5px solid #cbd5e1',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    boxSizing: 'border-box',
    transition: 'all 0.15s ease',
  },
  shinyDateInput: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '12px',
    color: '#0f172a',
    fontWeight: '700',
    fontFamily: 'inherit',
    cursor: 'pointer',
    padding: 0,
    margin: 0,
  },
  clearDateBtn: {
    background: 'none',
    border: 'none',
    fontSize: '11px',
    color: '#64748b',
    cursor: 'pointer',
    padding: '0 2px',
  },
  shinyBulkDeleteBtn: {
    padding: '7px 12px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    height: '36px',
    boxShadow: '0 1px 2px rgba(185, 28, 28, 0.08)',
  },

  // Main Card & Table
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    overflow: 'hidden',
    width: '100%',
    boxSizing: 'border-box',
  },
  tableResponsive: {
    overflowX: 'hidden',
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '12.5px',
    tableLayout: 'fixed',
  },
  th: {
    padding: '10px 12px',
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontSize: '11px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    borderBottom: '1px solid #e2e8f0',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.1s ease',
  },
  td: {
    padding: '9px 12px',
    verticalAlign: 'middle',
  },

  // Row Details
  projectTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  projectTitle: {
    fontWeight: '700',
    color: '#0f172a',
    fontSize: '13px',
  },
  referenceBadge: {
    fontSize: '10px',
    fontWeight: '700',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid #e2e8f0',
  },
  projectSub: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '11px',
    color: '#64748b',
    marginTop: '3px',
  },
  contactName: {
    fontWeight: '600',
    color: '#0f172a',
    fontSize: '13px',
  },
  contactEmail: {
    fontSize: '11px',
    color: '#64748b',
  },
  contactPhone: {
    fontSize: '11px',
    color: '#0284c7',
  },
  contactRoleBadge: {
    display: 'inline-block',
    fontSize: '10px',
    fontWeight: '700',
    color: '#475569',
    backgroundColor: '#f1f5f9',
    padding: '2px 6px',
    borderRadius: '4px',
    marginTop: '2px',
  },
  specPrimary: {
    fontWeight: '700',
    color: '#0f172a',
    fontSize: '13px',
  },
  specSecondary: {
    fontSize: '11px',
    color: '#64748b',
  },
  amountPrimary: {
    fontWeight: '800',
    color: '#047857',
    fontSize: '14px',
  },
  amountSub: {
    fontSize: '10px',
    color: '#64748b',
  },

  // 4 Discrete Stage Badges
  badgeCreated: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '3px 8px',
    borderRadius: '6px',
    backgroundColor: '#f8fafc',
    color: '#475569',
    border: '1px solid #e2e8f0',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
  },
  badgeDotSlate: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: '#94a3b8',
    flexShrink: 0,
  },
  badgeRequested: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '3px 8px',
    borderRadius: '6px',
    backgroundColor: '#fffbeb',
    color: '#d97706',
    border: '1px solid #fde68a',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
  },
  badgeDotAmber: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: '#f59e0b',
    flexShrink: 0,
  },
  badgeInProgress: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '3px 8px',
    borderRadius: '6px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    border: '1px solid #bfdbfe',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
  },
  badgeDotBlue: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    flexShrink: 0,
  },
  badgeCompleted: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '3px 8px',
    borderRadius: '6px',
    backgroundColor: '#ecfdf5',
    color: '#059669',
    border: '1px solid #a7f3d0',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
  },
  badgeDotGreen: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    flexShrink: 0,
  },

  // Actions
  actionGroup: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '8px',
  },
  btnUpdateStage: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '5px 10px',
    borderRadius: '6px',
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    color: '#0f172a',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  btnViewDetails: {
    padding: '5px 10px',
    borderRadius: '6px',
    backgroundColor: '#0f172a',
    border: 'none',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },

  // Alerts
  alertSuccess: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: '8px',
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
    marginBottom: '16px',
    fontSize: '13px',
    fontWeight: '600',
  },
  alertError: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: '8px',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    marginBottom: '16px',
    fontSize: '13px',
    fontWeight: '600',
  },
  alertCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#64748b',
  },

  // Loader & Empty
  loaderBox: {
    padding: '48px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #1d4ed8',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  emptyBox: {
    padding: '48px',
    textAlign: 'center',
  },
  emptyIconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px',
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  emptySub: {
    fontSize: '13px',
    color: '#64748b',
    margin: '6px 0 0',
  },

  // Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '16px',
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '520px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  modalTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '800',
    color: '#0f172a',
  },
  modalSub: {
    margin: '3px 0 0',
    fontSize: '12px',
    color: '#64748b',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#64748b',
  },
  modalBody: {
    padding: '20px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  inputLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  stageChoiceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  stageChoiceCard: {
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  stageChoiceCardActive: {
    borderColor: '#0f172a',
    backgroundColor: '#f8fafc',
    boxShadow: '0 0 0 1px #0f172a',
  },
  modalTextarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  modalFooter: {
    padding: '14px 20px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '10px',
    backgroundColor: '#f8fafc',
    borderRadius: '0 0 16px 16px',
  },
  btnCancel: {
    padding: '7px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  btnSaveStage: {
    padding: '7px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },

  // View Details Highlights
  detailsHighlightRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '10px',
    backgroundColor: '#f8fafc',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    marginBottom: '16px',
  },
  highlightBlock: {
    display: 'flex',
    flexDirection: 'column',
  },
  highlightLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  highlightAmount: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#047857',
    marginTop: '2px',
  },
  highlightText: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0f172a',
    marginTop: '2px',
  },
  dossierGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
    marginBottom: '16px',
  },
  dossierCard: {
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
  },
  dossierSectionTitle: {
    margin: '0 0 10px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#0f172a',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '4px',
  },
  dossierItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    marginBottom: '6px',
    gap: '8px',
  },
  dossierLabel: {
    color: '#64748b',
    fontWeight: '600',
  },
  dossierVal: {
    color: '#0f172a',
    fontWeight: '600',
    textAlign: 'right',
  },
  pricingSummaryBox: {
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  modalBtnExportPdf: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '7px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
    fontSize: '11.5px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  modalBtnExportExcel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '7px',
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
    fontSize: '11.5px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  modalBtnUpdateStage: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '7px',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    fontSize: '11.5px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  paginationBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e2e8f0',
    flexWrap: 'wrap',
    gap: '12px',
  },
  paginationInfo: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '600',
  },
  pageSizeSelect: {
    padding: '4px 8px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '12px',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    cursor: 'pointer',
    fontWeight: 600,
  },
  paginationActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  pageBtn: {
    padding: '5px 10px',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    color: '#334155',
    fontSize: '11.5px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  pageBtnActive: {
    padding: '5px 10px',
    borderRadius: '6px',
    border: '1px solid #0f172a',
    backgroundColor: '#0f172a',
    fontSize: '11.5px',
    fontWeight: '800',
    color: '#ffffff',
    cursor: 'pointer',
  },
  pageBtnDisabled: {
    padding: '5px 10px',
    borderRadius: '6px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    color: '#94a3b8',
    fontSize: '11.5px',
    fontWeight: '600',
    cursor: 'not-allowed',
  },
  pageIndicator: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#0f172a',
    padding: '0 6px',
  },
};

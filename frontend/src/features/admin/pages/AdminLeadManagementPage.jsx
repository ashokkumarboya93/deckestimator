// =============================================
// Deck Estimator — Admin Lead Management Hub
// =============================================
// Features:
// - 4 Dedicated Tabs:
//     1. Hot Priority (Shows real reach-out requests / customer & contractor inquiries)
//     2. Customer Leads (Homeowner customer reach-outs & enquiries)
//     3. Contractor Leads (Contractor partner requests & registrations)
//     4. All Leads (Complete historical list with pagination & Last Date cutoff selector)
// - Table Columns:
//     Contact Person | Type & Source | Requested Message | Priority | Date & Time | Location | Actions
// - Source Tagging: If requested from estimation, displays "Estimation Service"
// - Pill-shaped shiny controls:
//     * Shiny reduced-width search bar
//     * Date filters: Today, 7 Days, 15 Days, 30 Days, 60 Days, All Time
//     * "Last Date" cutoff picker (in All Leads tab) for historical archive search
//     * Shiny Refresh button & Export CSV / Excel buttons
// - Large View Details Modal:
//     * Complete contact & account profile dossier
//     * Requested message, enquiry subject, preferred contact method & time
//     * Requested Estimation Specs: Estimated price, sq ft, dimensions, wood species, and section-wise inputs selected
//     * User activity & past estimation history
//     * In-modal Export CSV / Excel
// - Export functionality exports currently filtered records with section-wise inputs and amounts

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import { BASE_URL } from '../../../api/client';
import { ConfirmModal, EmptyState, LoadingSpinner, SkeletonTable, SkeletonShimmer } from '../../../components/common';
import { resolveAvatarUrl } from '../../../utils/imageOptimizer';

const TABS = [
  { id: 'hot', label: 'Hot Priority Requests', key: 'hotPriority' },
  { id: 'customer', label: 'Customer Leads', key: 'customerLeads' },
  { id: 'contractor', label: 'Contractor Leads', key: 'contractorLeads' },
  { id: 'reachout', label: 'All Reach Outs', key: 'allReachOuts' },
];

const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '15d', label: 'Last 15 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '60d', label: 'Last 60 Days' },
];

export default function AdminLeadManagementPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('hot');
  const [leads, setLeads] = useState([]);
  const [counts, setCounts] = useState({ hotPriority: 0, customerLeads: 0, contractorLeads: 0, allReachOuts: 0 });
  const [unopenedCounts, setUnopenedCounts] = useState({ hotPriority: 0, customerLeads: 0, contractorLeads: 0, allReachOuts: 0 });
  const [openedLeadIds, setOpenedLeadIds] = useState(() => {
    try {
      const saved = localStorage.getItem('deck_admin_opened_leads');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [pageSize, setPageSize] = useState(25);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dateInputRef = useRef(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lastDateFilter, setLastDateFilter] = useState(''); // Specific cutoff filter
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);

  // View Details Modal State
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadDossier, setLeadDossier] = useState(null);
  const [loadingDossier, setLoadingDossier] = useState(false);
  const [dossierError, setDossierError] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [acceptingLead, setAcceptingLead] = useState(false);
  const [acceptSuccessNotice, setAcceptSuccessNotice] = useState(null);
  const [acceptErrorNotice, setAcceptErrorNotice] = useState(null);
  const [exportingFormat, setExportingFormat] = useState(null);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const resolveLeadTargetId = (lead) => {
    if (!lead) return '';
    if (lead.estimateIdStr) return String(lead.estimateIdStr);
    if (typeof lead.estimateId === 'string' && lead.estimateId) return lead.estimateId;
    if (lead.estimateId && typeof lead.estimateId === 'object') {
      const nested = lead.estimateId._id || lead.estimateId.id;
      if (nested) return String(nested);
    }
    if (lead.estimateSnapshot?.estimateId) return String(lead.estimateSnapshot.estimateId);
    if (leadDossier?.estimateDetails?.estimateId) return String(leadDossier.estimateDetails.estimateId);
    if (leadDossier?.lead?.estimateIdStr) return String(leadDossier.lead.estimateIdStr);
    if (typeof leadDossier?.lead?.estimateId === 'string') return leadDossier.lead.estimateId;
    return String(lead._id || lead.id || '');
  };

  const handleAcceptLeadRequest = async (lead) => {
    if (!lead || acceptingLead) return;
    setAcceptingLead(true);
    setAcceptSuccessNotice(null);
    setAcceptErrorNotice(null);
    try {
      const targetId = resolveLeadTargetId(lead);
      if (!targetId) {
        throw new Error('Could not resolve an Estimate, Project, or Lead ID for this request.');
      }
      const noteMsg = lead.isReachOut
        ? 'We will contact you soon! Our specialist team is reviewing your inquiry.'
        : `Admin marked request in progress for ${lead.name || 'Client'}. Our specialist will contact you soon!`;
      await adminApi.updateProjectProgress(targetId, {
        stage: 'in_progress',
        status: 'in_progress',
        note: noteMsg,
      });
      setAcceptSuccessNotice('✓ Request In Progress! Notification sent: "We will contact you soon!"');
      setSelectedLead((prev) => prev ? { ...prev, estimateStatus: 'IN_PROGRESS', status: 'in_progress', isAccepted: true, isOpened: true } : null);
      setLeads((prev) =>
        prev.map((item) => {
          const leadKey = item._id || item.id || item.leadNumber;
          const isMatch = leadKey === targetId || leadKey === lead._id || leadKey === lead.id || leadKey === lead.leadNumber;
          return isMatch
            ? { ...item, status: 'in_progress', estimateStatus: 'IN_PROGRESS', isAccepted: true, isOpened: true }
            : item;
        })
      );
      setLeadDossier((prev) =>
        prev
          ? {
              ...prev,
              lead: prev.lead ? { ...prev.lead, status: 'in_progress', isAccepted: true, isOpened: true } : prev.lead,
              estimateDetails: prev.estimateDetails
                ? { ...prev.estimateDetails, estimateStatus: 'IN_PROGRESS' }
                : prev.estimateDetails,
            }
          : prev
      );
      await fetchLeads(pagination.page || 1, pageSize);
    } catch (err) {
      setAcceptErrorNotice(err?.response?.data?.message || err.message || 'Failed to update request.');
    } finally {
      setAcceptingLead(false);
    }
  };

  const handleExportDossier = async (format, combinedLead, custMeta) => {
    if (exportingFormat) return;
    setExportingFormat(format);
    setAcceptErrorNotice(null);
    try {
      const { downloadEstimatePdf, downloadEstimateExcel } = await import('../../../utils/reportExport');
      if (format === 'excel') {
        downloadEstimateExcel(combinedLead, custMeta);
      } else {
        await downloadEstimatePdf(combinedLead, custMeta);
      }
    } catch (err) {
      setAcceptErrorNotice(err?.message || `Failed to generate ${format.toUpperCase()} export.`);
    } finally {
      setExportingFormat(null);
    }
  };

  const fetchLeads = useCallback(async (pageToFetch = pagination.page, limitToFetch = pageSize) => {
    const safePage = Number(pageToFetch) > 0 ? Number(pageToFetch) : 1;
    const safeLimit = Number(limitToFetch) > 0 ? Number(limitToFetch) : 25;
    setLoading(true);
    setIsRefreshing(true);
    setError(null);
    try {
      const res = await adminApi.getLeads({
        tab: activeTab,
        search: searchTerm.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        dateRange: dateRangeFilter !== 'all' ? dateRangeFilter : undefined,
        lastDate: lastDateFilter ? lastDateFilter : undefined,
        page: safePage,
        limit: safeLimit,
      });

      setLeads(res.data || []);
      if (res.counts) setCounts(res.counts);
      if (res.unopenedCounts) setUnopenedCounts(res.unopenedCounts);
      if (res.pagination) {
        setPagination({
          page: res.pagination.page || safePage,
          limit: res.pagination.limit || safeLimit,
          total: res.pagination.total ?? (res.data?.length || 0),
          totalPages: res.pagination.totalPages || Math.ceil((res.pagination.total ?? (res.data?.length || 0)) / safeLimit) || 1,
        });
      }
    } catch (err) {
      setError(err?.message || 'Failed to load leads from database.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab, dateRangeFilter, statusFilter, lastDateFilter, searchTerm, pagination.page, pageSize]);

  useEffect(() => {
    fetchLeads(1, pageSize);
  }, [activeTab, dateRangeFilter, statusFilter, lastDateFilter]);

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    fetchLeads(1, newSize);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLeads(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDateRangeFilter('all');
    setStatusFilter('all');
    setLastDateFilter('');
    fetchLeads(1);
  };

  // Open Detailed Dossier Modal
  const handleOpenLeadDetails = async (lead) => {
    const leadKey = lead._id || lead.id || lead.leadNumber;

    // Instantly mark as opened locally & persist
    setOpenedLeadIds((prev) => {
      const next = new Set(prev);
      next.add(leadKey);
      try {
        localStorage.setItem('deck_admin_opened_leads', JSON.stringify([...next]));
        const readLeads = JSON.parse(localStorage.getItem('drp_admin_read_leads') || '[]');
        if (!readLeads.includes(leadKey)) {
          readLeads.push(leadKey);
          localStorage.setItem('drp_admin_read_leads', JSON.stringify(readLeads));
        }
        window.dispatchEvent(new CustomEvent('drp_admin_alerts_updated'));
      } catch {}
      return next;
    });

    // Mark opened in table rows
    setLeads((prev) =>
      prev.map((item) =>
        (item._id === leadKey || item.id === leadKey || item.leadNumber === leadKey)
          ? { ...item, isOpened: true }
          : item
      )
    );

    // Decrement unread bubble alert count for current tab
    setUnopenedCounts((prev) => {
      const tabObj = TABS.find((t) => t.id === activeTab);
      const key = tabObj?.key || 'allReachOuts';
      return {
        ...prev,
        [key]: Math.max(0, (prev[key] || 0) - 1),
      };
    });

    setSelectedLead({ ...lead, isOpened: true });
    setLoadingDossier(true);
    setDossierError(null);
    setAcceptSuccessNotice(null);
    setAcceptErrorNotice(null);

    try {
      const dossierRes = await adminApi.getLeadDetails(leadKey);
      setLeadDossier(dossierRes.data || dossierRes);
    } catch (err) {
      setDossierError(err?.message || 'Failed to fetch detailed dossier.');
    } finally {
      setLoadingDossier(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedLead(null);
    setLeadDossier(null);
    setAcceptSuccessNotice(null);
    setAcceptErrorNotice(null);
  };

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    id: null,
    identifier: '',
    loading: false,
  });

  const promptDeleteLead = (id, leadIdentifier) => {
    setDeleteModalState({
      isOpen: true,
      id,
      identifier: leadIdentifier || 'Selected Lead',
      loading: false,
    });
  };

  const handleDeleteLead = (id, leadIdentifier) => {
    promptDeleteLead(id, leadIdentifier);
  };

  const isAllSelected = leads.length > 0 && selectedLeadIds.length === leads.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leads.map((l) => l._id || l.id));
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedLeadIds.length === 0) return;
    promptDeleteLead(selectedLeadIds, `${selectedLeadIds.length} Selected Item(s)`);
  };

  const handleOpenUserProfile = (lead) => {
    const leadKey = lead?._id || lead?.id || lead?.leadNumber;
    if (leadKey) {
      setOpenedLeadIds((prev) => {
        const next = new Set(prev);
        next.add(leadKey);
        try {
          localStorage.setItem('deck_admin_opened_leads', JSON.stringify([...next]));
          const readLeads = JSON.parse(localStorage.getItem('drp_admin_read_leads') || '[]');
          if (!readLeads.includes(leadKey)) {
            readLeads.push(leadKey);
            localStorage.setItem('drp_admin_read_leads', JSON.stringify(readLeads));
          }
          window.dispatchEvent(new CustomEvent('drp_admin_alerts_updated'));
        } catch {}
        return next;
      });
    }

    const targetUserId =
      lead?.userId ||
      lead?.customerId ||
      lead?.contractorId ||
      leadDossier?.user?._id ||
      leadDossier?.lead?.userId ||
      leadDossier?.lead?.customerId ||
      leadDossier?.lead?.contractorId;

    if (targetUserId) {
      navigate(`/admin/users/${targetUserId}`);
    } else if (lead?.email) {
      navigate(`/admin/users?search=${encodeURIComponent(lead.email)}`);
    } else {
      navigate('/admin/users');
    }
  };

  const handleConfirmDeleteLead = async () => {
    const { id, identifier } = deleteModalState;
    if (!id) return;
    const idsToDelete = Array.isArray(id) ? id : [id];

    setDeleteModalState((prev) => ({ ...prev, loading: true }));

    try {
      await Promise.all(idsToDelete.map((leadId) => adminApi.deleteLead(leadId)));

      setLeads((prev) => prev.filter((item) => !idsToDelete.includes(item._id || item.id)));
      setSelectedLeadIds((prev) => prev.filter((item) => !idsToDelete.includes(item)));

      if (selectedLead && idsToDelete.includes(selectedLead._id || selectedLead.id)) {
        setSelectedLead(null);
        setLeadDossier(null);
      }

      setDeleteModalState({ isOpen: false, id: null, identifier: '', loading: false });
      setSuccessMsg(`Deleted "${identifier}" successfully.`);
      setTimeout(() => setSuccessMsg(null), 3000);

      fetchLeads(pagination.page);
      window.dispatchEvent(new CustomEvent('drp_admin_alerts_updated'));
    } catch (err) {
      setDeleteModalState({ isOpen: false, id: null, identifier: '', loading: false });
      setError(`Failed to delete: ${err.message}`);
      fetchLeads(pagination.page);
    }
  };

  const getTabCount = (tabId) => {
    if (tabId === 'hot') return counts.hotPriority || 0;
    if (tabId === 'customer') return counts.customerLeads || 0;
    if (tabId === 'contractor') return counts.contractorLeads || 0;
    return counts.allReachOuts ?? counts.reachOuts ?? counts.allLeads ?? 0;
  };

  const getTabUnopenedCount = (tabId) => {
    if (tabId === 'hot') return unopenedCounts.hotPriority || 0;
    if (tabId === 'customer') return unopenedCounts.customerLeads || 0;
    if (tabId === 'contractor') return unopenedCounts.contractorLeads || 0;
    return unopenedCounts.allReachOuts ?? unopenedCounts.reachOuts ?? unopenedCounts.allLeads ?? 0;
  };


  const handleDirectExportExcel = (format = 'excel') => {
    const recordsToExport = selectedLeadIds.length > 0
      ? leads.filter((l) => selectedLeadIds.includes(l._id || l.id))
      : leads;

    if (recordsToExport.length === 0) {
      alert('No leads available to export in current queue.');
      return;
    }

    const headers = [
      'Lead #',
      'Contact Person',
      'Email',
      'Phone',
      'Company / Business',
      'Type',
      'Source',
      'Requested Message',
      'Estimated Value ($)',
      'Priority',
      'Date',
      'Time',
      'Location',
      'Status',
    ];

    const rows = recordsToExport.map((l) => {
      const contactTime = new Date(l.latestContactDate || l.createdAt || Date.now());
      const daysDiff = Math.floor((Date.now() - contactTime.getTime()) / (1000 * 60 * 60 * 24));
      const priorityText = daysDiff <= 7 ? 'HOT' : 'REQUESTED';
      const locText = (l.location && l.location !== '—' && l.location !== '-' && l.location !== 'Shamong, NJ') ? l.location : (l.city ? `${l.city}${l.state ? `, ${l.state}` : ''}` : 'Location Pending');
      const dateText = contactTime.toLocaleDateString('en-US');
      const timeText = contactTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const estValue = l.estimatedValue > 0 ? `${Number(l.estimatedValue).toFixed(2)}` : '$0.00';

      return [
        l.leadNumber || l.leadId || '',
        l.name || '',
        l.email || '',
        l.phone || '',
        l.businessName || '',
        (l.userType || 'Customer').toUpperCase(),
        l.contactSource || (l.isEstimationService ? 'Estimation Service' : 'Direct Inquiry'),
        l.requestedMessage || l.enquiry?.message || '',
        estValue,
        priorityText,
        dateText,
        timeText,
        locText,
        (l.status || 'New').toUpperCase(),
      ];
    });

    const csvContent =
      '\uFEFF' +
      [headers, ...rows]
        .map((row) =>
          row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
        )
        .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const countTag = selectedLeadIds.length > 0 ? `Selected-${selectedLeadIds.length}` : `All-${recordsToExport.length}`;
    link.download = `DeckRestorationPlus-Leads-${activeTab}-${countTag}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export filtered visible leads
  const getExportUrl = (format) => {
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.append('status', statusFilter);
    if (dateRangeFilter !== 'all') params.append('dateRange', dateRangeFilter);
    if (activeTab === 'all' && lastDateFilter) params.append('lastDate', lastDateFilter);
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    return `${BASE_URL}/admin/leads/export?format=${format}&tab=${activeTab}&${params.toString()}`;
  };

  return (
    <div style={{ ...styles.container, padding: isMobile ? '12px' : '24px' }}>
      {/* 1. Header with Title & Shiny Export Actions */}
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitleRow}>
            <h1 style={styles.title}>Lead & Reach-Out Inquiries</h1>
            <span style={styles.liveDbPill}>
              <span style={styles.pulseDot} />
              Live Updates
            </span>
          </div>
          
        </div>
        <div style={styles.headerActions}>
          {selectedLeadIds.length > 0 && (
            <button
              type="button"
              onClick={handleBulkDelete}
              style={styles.shinyBulkDeleteBtn}
              title={`Permanently delete ${selectedLeadIds.length} selected item(s)`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Delete Selected ({selectedLeadIds.length})
            </button>
          )}
          <button
            type="button"
            onClick={() => handleDirectExportExcel('csv')}
            style={styles.shinyExportBtn}
            title="Download CSV of current queue or selected leads"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV{selectedLeadIds.length > 0 ? ` (${selectedLeadIds.length})` : ''}
          </button>
          <button
            type="button"
            onClick={() => handleDirectExportExcel('excel')}
            style={styles.shinyExportGreenBtn}
            title="Download Excel spreadsheet of current queue or selected leads"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Export Excel{selectedLeadIds.length > 0 ? ` (${selectedLeadIds.length})` : ''}
          </button>
        </div>
      </div>

      {/* 2. Tabs */}
      <div style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = getTabCount(tab.id);
          const unopened = getTabUnopenedCount(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedLeadIds([]);
              }}
              style={{
                ...styles.tabBtn,
                ...(isActive ? styles.tabBtnActive : {}),
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  ...styles.tabBadge,
                  ...(isActive ? styles.tabBadgeActive : {}),
                }}
              >
                {count}
              </span>
              {unopened > 0 && (
                <span
                  style={styles.unreadBubbleBadge}
                  title={`${unopened} unopened in ${tab.label}`}
                >
                  {unopened}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Controls Bar: Shiny Reduced-Width Search, Date Filters, Last-Date Selector, Refresh */}
      <div style={styles.controlBar}>
        {/* Shiny Reduced-Width Search Bar */}
        <form onSubmit={handleSearchSubmit} style={styles.shinySearchWrapper}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" style={{ marginRight: 6 }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder={isMobile ? "Search leads..." : "Search leads by name, email, phone..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.shinySearchInput}
          />
          {searchTerm && (
            <button type="button" onClick={() => { setSearchTerm(''); fetchLeads(1); }} style={styles.clearSearchBtn}>✕</button>
          )}
        </form>

        {/* Range Dropdown Filter */}
        <select
          value={dateRangeFilter}
          onChange={(e) => {
            setDateRangeFilter(e.target.value);
          }}
          style={styles.shinySelect}
          title="Filter by submission date range"
        >
          {DATE_RANGE_OPTIONS.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>

        {/* Date Selector Button (opens calendar on click, no "Cutoff Date:" text, matches height & button styling) */}
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
            onChange={(e) => setLastDateFilter(e.target.value)}
            style={styles.shinyDateInput}
            title="Filter records up to this date"
          />
          {lastDateFilter && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLastDateFilter('');
              }}
              style={styles.clearDateBtn}
              title="Clear date filter"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status & Priority Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.shinySelect}
          title="Filter by status or priority tag"
        >
          <option value="all">All Statuses</option>
          <option value="hot">🔥 Hot Priority</option>
          <option value="opened">👁️ Opened / Viewed</option>
          <option value="unopened">🔔 Unopened / New</option>
          <option value="in_progress">⚙️ In Progress</option>
          <option value="pending">⏳ Pending Review</option>
          <option value="converted">✅ Converted / Completed</option>
          <option value="contacted">📞 Contacted</option>
        </select>

        {/* Shiny Refresh Button */}
        <button
          onClick={() => fetchLeads()}
          style={styles.shinyRefreshBtn}
          title="Refresh Leads Database"
          disabled={loading}
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
      </div>

      {/* 4. Table Content Card */}
      <div style={styles.card}>
        {loading ? (
          <div style={{ padding: '8px' }}>
            <SkeletonTable rows={5} columns={6} />
          </div>
        ) : error ? (
          <div style={styles.errorBox}>
            <p style={{ margin: 0, fontWeight: '700' }}>Error Loading Data</p>
            <p style={{ margin: '4px 0 0', fontSize: '13px' }}>{error}</p>
          </div>
        ) : leads.length === 0 ? (
          <EmptyState
            icon="inbox"
            title="No leads found in this queue"
            description={
              searchTerm
                ? 'Try adjusting your search keywords or clearing active filters.'
                : 'Customer and contractor inquiries or booking reach-outs will appear here in real time.'
            }
            actionLabel={searchTerm ? 'Clear Search' : null}
            onAction={searchTerm ? () => setSearchTerm('') : null}
          />
        ) : (
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: '44px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      style={styles.checkboxInput}
                      title={isAllSelected ? 'Deselect all rows' : 'Select all rows'}
                    />
                  </th>
                  <th style={styles.th}>Contact Person</th>
                  <th style={styles.th}>Type &amp; Source</th>
                  <th style={styles.th}>Priority</th>
                  <th style={styles.th}>Date &amp; Time</th>
                  <th style={styles.th}>Location</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => {
                  const contactDate = new Date(l.latestContactDate || l.createdAt || Date.now());
                  const daysDiff = (Date.now() - contactDate.getTime()) / (1000 * 3600 * 24);
                  const isHot = (l.isHot || l.priority === 'hot' || l.priority === 'HOT') && daysDiff <= 7;
                  const isCust = (l.userType || '').toLowerCase() === 'customer';
                  const initials = (l.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

                  const leadKey = l._id || l.id || l.leadNumber;
                  const isUnopened = !l.isOpened && !openedLeadIds.has(leadKey);
                  const isAccepted =
                    l.status === 'in_progress' ||
                    l.status === 'quote_in_progress' ||
                    l.status === 'contacted' ||
                    l.status === 'converted' ||
                    l.estimateStatus === 'IN_PROGRESS' ||
                    Boolean(l.isAccepted);

                  // Type & Source label
                  const isEstimation = Boolean(
                    l.isEstimationService ||
                    l.contactSource === 'Estimation Service' ||
                    l.estimateId ||
                    l.estimateSnapshot?.estimateId ||
                    l.leadSource === 'customer_estimator' ||
                    l.leadSource === 'contractor_estimator'
                  );
                  const isReachOut = !isEstimation;
                  const leadLocation = (l.location && l.location !== '—' && l.location !== '-' && l.location !== 'Shamong, NJ') ? l.location : (l.city ? `${l.city}${l.state ? `, ${l.state}` : ''}` : (l.address?.city ? `${l.address.city}, ${l.address.state || ''}` : 'Location Pending'));

                  return (
                    <tr key={leadKey} style={{ ...styles.tr, backgroundColor: selectedLeadIds.includes(leadKey) ? '#f0fdf4' : 'transparent' }}>
                      {/* Checkbox Column */}
                      <td style={{ ...styles.td, width: '44px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedLeadIds.includes(leadKey)}
                          onChange={() => toggleSelectRow(leadKey)}
                          style={styles.checkboxInput}
                        />
                      </td>

                      {/* 1. Contact Person */}
                      <td style={styles.td}>
                        <div style={styles.personCell}>
                          {l.avatar && resolveAvatarUrl(l.avatar) ? (
                            <img
                              src={resolveAvatarUrl(l.avatar)}
                              alt={l.name || 'User'}
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              style={styles.avatarImg}
                            />
                          ) : (
                            <div style={{ ...styles.avatarCircle, backgroundColor: isCust ? '#ecfdf5' : '#eff6ff', color: isCust ? '#059669' : '#2563eb' }}>
                              {initials}
                            </div>
                          )}
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {isUnopened && (
                                <span
                                  style={{
                                    width: '7px',
                                    height: '7px',
                                    borderRadius: '50%',
                                    backgroundColor: '#ef4444',
                                    boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.25)',
                                    display: 'inline-block',
                                    flexShrink: 0,
                                  }}
                                  title="Unopened inquiry"
                                />
                              )}
                              <span style={styles.personName}>{l.name}</span>
                            </div>
                            <div style={styles.personEmail}>{l.email}</div>
                            <div style={styles.personPhone}>{l.phone || '—'}</div>
                            {l.businessName && (
                              <div style={styles.personCompany}>{l.businessName}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. Type & Source */}
                      <td style={styles.td}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                            <span style={isCust ? styles.badgeCustomer : styles.badgeContractor}>
                              {(l.userType || 'Customer').toUpperCase()}
                            </span>
                            {isReachOut ? (
                              <span style={styles.badgeReachOut}>
                                Reach Out
                              </span>
                            ) : (
                              <span style={styles.badgeEstimationService}>
                                Estimation Service
                              </span>
                            )}
                          </div>
                          <span style={styles.sourceLabel}>
                            {isEstimation ? 'Estimation Service' : 'Reach Out'}
                          </span>
                          <span style={styles.leadIdSmall}>#{l.leadNumber || l.leadId}</span>
                        </div>
                      </td>

                      {/* 3. Priority */}
                      <td style={styles.td}>
                        {isAccepted ? (
                          <span style={styles.openedPill} title="Admin accepted / In Progress">
                            OPENED
                          </span>
                        ) : !isUnopened && isHot ? (
                          <span style={styles.viewedPill} title="Inquiry opened & viewed">
                            VIEWED
                          </span>
                        ) : isHot ? (
                          <span style={styles.hotPill}>
                            HOT
                          </span>
                        ) : (
                          <span style={styles.standardPill}>
                            REQUESTED
                          </span>
                        )}
                      </td>

                      {/* 4. Date & Time */}
                      <td style={styles.td}>
                        <div style={styles.dateTimeBadge}>
                          <div style={styles.dateRow}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" style={{ marginRight: 4, flexShrink: 0 }}>
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <span>
                              {new Date(l.latestContactDate || l.createdAt || Date.now()).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <div style={styles.timeRow}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{ marginRight: 4, flexShrink: 0 }}>
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span>
                              {new Date(l.latestContactDate || l.createdAt || Date.now()).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 5. Location */}
                      <td style={styles.td}>
                        <div style={styles.locationText}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{ marginRight: 4 }}>
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {leadLocation}
                        </div>
                      </td>

                      {/* 6. Actions */}
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenUserProfile(l)}
                            style={styles.btnActionProfile}
                            title="Open User Profile Page"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            Profile
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenLeadDetails(l)}
                            style={styles.btnViewDetails}
                            title="View Full Lead & Inquiry Dossier"
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLead(l._id || l.id, l.name || l.leadNumber)}
                            style={styles.btnDeleteLead}
                            title="Permanently delete lead"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            Delete
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

        {/* Pagination Controls with Range Selector */}
        <div style={styles.paginationBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={styles.paginationInfo}>
              Showing {leads.length > 0 ? (pagination.page - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(pagination.page * pageSize, pagination.total || leads.length)} of{' '}
              {pagination.total || leads.length} leads
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Show:</label>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                style={styles.pageSizeSelect}
                title="Select number of leads per page"
              >
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>

          <div style={styles.paginationBtns}>
            <button
              type="button"
              disabled={pagination.page <= 1 || loading}
              onClick={() => fetchLeads(pagination.page - 1, pageSize)}
              style={pagination.page <= 1 ? styles.pageBtnDisabled : styles.pageBtn}
            >
              Previous
            </button>

            {Array.from({ length: Math.min(5, pagination.totalPages || 1) }, (_, i) => {
              const pNum = i + 1;
              const isCurrent = pagination.page === pNum;
              return (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => fetchLeads(pNum, pageSize)}
                  style={isCurrent ? styles.pageBtnActive : styles.pageBtn}
                >
                  {pNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={pagination.page >= (pagination.totalPages || 1) || loading}
              onClick={() => fetchLeads(pagination.page + 1, pageSize)}
              style={pagination.page >= (pagination.totalPages || 1) ? styles.pageBtnDisabled : styles.pageBtn}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 5. View Details Large Dossier Modal (Expanded Comprehensive Report Preview) */}
      {selectedLead && (() => {
        const rawPhotosList = [
          ...(Array.isArray(selectedLead?.photos) ? selectedLead.photos : []),
          ...(Array.isArray(leadDossier?.photos) ? leadDossier.photos : []),
          ...(Array.isArray(leadDossier?.lead?.photos) ? leadDossier.lead.photos : []),
          ...(Array.isArray(leadDossier?.deckDetails?.photos) ? leadDossier.deckDetails.photos : []),
          ...(Array.isArray(leadDossier?.estimateDetails?.photos) ? leadDossier.estimateDetails.photos : []),
          ...(Array.isArray(leadDossier?.estimateDetails?.deckDetails?.photos) ? leadDossier.estimateDetails.deckDetails.photos : []),
          ...(Array.isArray(selectedLead?.deckSnapshot?.photos) ? selectedLead.deckSnapshot.photos : []),
        ].filter(Boolean);

        const seenUrls = new Set();
        const leadPhotos = [];
        for (const p of rawPhotosList) {
          const u = typeof p === 'string' ? p : (p?.url || p?.dataUrl || p?.data || p?.preview || '');
          if (u && !seenUrls.has(u)) {
            seenUrls.add(u);
            leadPhotos.push(p);
          }
        }

        const combinedLead = {
          ...selectedLead,
          ...leadDossier?.lead,
          photos: leadPhotos,
          propertyAddress: selectedLead.propertyAddress || leadDossier?.propertyAddress || leadDossier?.deckDetails?.propertyAddress,
          structureDetails: selectedLead.structureDetails || leadDossier?.structureDetails || leadDossier?.deckDetails?.structureDetails,
          surfaceDetails: selectedLead.surfaceDetails || leadDossier?.surfaceDetails || leadDossier?.deckDetails?.surfaceDetails,
          visibleConditions: selectedLead.visibleConditions || leadDossier?.visibleConditions || leadDossier?.deckDetails?.visibleConditions || [],
          services: selectedLead.services || leadDossier?.services || leadDossier?.estimateDetails?.calculationDetails?.services || [],
          totalAmount: selectedLead.estimatedValue || leadDossier?.estimateDetails?.totalAmount || 2500,
          deckDetails: leadDossier?.deckDetails || selectedLead.deckSnapshot || {},
          estimateDetails: leadDossier?.estimateDetails || selectedLead.estimateSnapshot || {},
        };

        const custMeta = {
          fullName: selectedLead.name,
          email: selectedLead.email,
          phone: selectedLead.phone,
          location: selectedLead.location,
        };

        const isAcceptedInProgress =
          selectedLead.estimateStatus === 'IN_PROGRESS' ||
          leadDossier?.estimateDetails?.estimateStatus === 'IN_PROGRESS' ||
          selectedLead.status === 'quote_in_progress' ||
          selectedLead.status === 'in_progress';

        return (
          <div style={{ ...styles.modalOverlay, padding: isMobile ? '8px' : '16px' }}>
            <div style={{ ...styles.modalBoxLarge, maxWidth: '960px', width: isMobile ? '96vw' : '95vw', maxHeight: '92vh' }}>
              {/* Modal Header */}
              <div style={{ ...styles.modalHeader, flexWrap: 'wrap', gap: '10px', padding: isMobile ? '12px 14px' : '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: '1 1 220px' }}>
                  {selectedLead.avatar && resolveAvatarUrl(selectedLead.avatar) ? (
                    <img
                      src={resolveAvatarUrl(selectedLead.avatar)}
                      alt={selectedLead.name || 'User'}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      style={styles.modalAvatarImg}
                    />
                  ) : (
                    <div style={{ ...styles.avatarLarge, backgroundColor: (selectedLead.userType || '').toLowerCase() === 'customer' ? '#ecfdf5' : '#eff6ff', color: (selectedLead.userType || '').toLowerCase() === 'customer' ? '#059669' : '#2563eb' }}>
                      {(selectedLead.name || 'U').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h3 style={styles.modalTitle}>{selectedLead.name}</h3>
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#e2e8f0', fontWeight: '700', color: '#1e293b' }}>
                        Lead #{selectedLead.leadNumber || selectedLead.leadId}
                      </span>
                    </div>
                    <p style={{ ...styles.modalSub, wordBreak: 'break-word' }}>
                      {(selectedLead.userType || 'Customer').toUpperCase()} • Contact Date: {new Date(selectedLead.latestContactDate || selectedLead.createdAt || Date.now()).toLocaleString()} • {(selectedLead.location && selectedLead.location !== 'Shamong, NJ' && selectedLead.location !== 'New Jersey') ? selectedLead.location : (selectedLead.city ? `${selectedLead.city}${selectedLead.state ? `, ${selectedLead.state}` : ''}` : 'Location Pending')}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenUserProfile(selectedLead)}
                    style={styles.modalBtnProfile}
                    title="Open Dedicated User Profile"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>User Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportDossier('pdf', combinedLead, custMeta)}
                    disabled={exportingFormat === 'pdf'}
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
                    <span>{exportingFormat === 'pdf' ? 'Exporting...' : 'Export PDF'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportDossier('excel', combinedLead, custMeta)}
                    disabled={exportingFormat === 'excel'}
                    style={styles.modalBtnExportExcel}
                    title="Export Data as Excel / CSV"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="8" y1="13" x2="16" y2="17" />
                      <line x1="16" y1="13" x2="8" y2="17" />
                    </svg>
                    <span>{exportingFormat === 'excel' ? 'Exporting...' : 'Export Excel'}</span>
                  </button>
                  <button onClick={handleCloseModal} style={styles.closeBtn}>✕</button>
                </div>
              </div>

              {/* Modal Body */}
              <div style={styles.modalBody}>
                {loadingDossier && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', marginBottom: '12px', fontSize: '12px', color: '#1e40af', fontWeight: '600' }}>
                    <div style={{ ...styles.spinner, width: 14, height: 14, borderWidth: 2 }} />
                    <span>Synchronizing full historical dossier from live database...</span>
                  </div>
                )}

                <div style={styles.modalContentGrid}>
                    {/* Top Highlights Banner */}
                    <div style={styles.modalBanner}>
                      <div style={styles.bannerItem}>
                        <span style={styles.bannerLabel}>Lead Priority</span>
                        <span style={selectedLead.isHot ? styles.bannerValHot : styles.bannerValStandard}>
                          {selectedLead.isHot ? 'HOT' : 'REQUESTED'}
                        </span>
                      </div>
                      <div style={styles.bannerItem}>
                        <span style={styles.bannerLabel}>Type & Source</span>
                        <span style={styles.bannerVal}>
                          {selectedLead.isReachOut ? '★ Reach Out Inquiry' : (selectedLead.isEstimationService ? 'Estimation Service' : (selectedLead.contactSource || 'Direct Inquiry'))}
                        </span>
                      </div>
                      {selectedLead.isReachOut ? (
                        <div style={styles.bannerItem}>
                          <span style={styles.bannerLabel}>Inquiry Type</span>
                          <span style={{ ...styles.bannerVal, color: '#0369a1', fontWeight: '800' }}>
                            Direct Support Inquiry
                          </span>
                        </div>
                      ) : (
                        <div style={styles.bannerItem}>
                          <span style={styles.bannerLabel}>Estimated Value</span>
                          <span style={styles.bannerValAmount}>
                            ${Number(selectedLead.pureCalculated || selectedLead.estimatedValue || leadDossier?.estimateDetails?.subtotal || leadDossier?.estimateDetails?.totalAmount || 0).toLocaleString()}
                          </span>
                          {(selectedLead.minJobApplied || selectedLead.isMinJobApplied || leadDossier?.lead?.minJobApplied) ? (
                            <span style={{ fontSize: '11px', color: '#b45309', fontWeight: '700', backgroundColor: '#fef3c7', padding: '2px 6px', borderRadius: '4px', border: '1px solid #fde68a', marginTop: '2px', display: 'inline-block' }}>
                              ⚡ Min Job Floor ($2,500 Applied)
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#15803d', fontWeight: '700', backgroundColor: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', border: '1px solid #a7f3d0', marginTop: '2px', display: 'inline-block' }}>
                              ✓ Pure Calculated (No Min Job Floor)
                            </span>
                          )}
                        </div>
                      )}
                      <div style={styles.bannerItem}>
                        <span style={styles.bannerLabel}>Contact Timestamp</span>
                        <span style={styles.bannerVal}>
                          {new Date(selectedLead.latestContactDate || selectedLead.createdAt || Date.now()).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Requested Message Section */}
                    <div style={styles.dossierSectionCard}>
                      <h4 style={styles.dossierSectionTitle}>📨 Requested Message & Inquiry Details</h4>
                      <div style={styles.inquiryMessageBox}>
                        <p style={styles.inquiryMessageText}>
                          "{selectedLead.requestedMessage || selectedLead.enquiry?.message || leadDossier?.lead?.enquiry?.message || 'Inquiry initiated via online deck restoration portal.'}"
                        </p>
                        {selectedLead.enquiry?.subject && (
                          <div style={{ marginTop: 8, fontSize: '12px', color: '#64748b' }}>
                            <strong>Subject:</strong> {selectedLead.enquiry.subject}
                          </div>
                        )}
                        {selectedLead.enquiry?.preferredContactMethod && (
                          <div style={{ marginTop: 4, fontSize: '12px', color: '#64748b' }}>
                            <strong>Preferred Method:</strong> {selectedLead.enquiry.preferredContactMethod} • <strong>Time:</strong> {selectedLead.enquiry.preferredContactTime || 'Anytime'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Two Column Grid: Contact Info & Estimation Specifications */}
                    <div style={styles.twoColGrid}>
                      {/* Personal & Dedicated Contact Profile */}
                      <div style={styles.dossierSectionCard}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginBottom: '10px' }}>
                          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                            👤 Dedicated Account & Profile Dossier
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '10.5px', padding: '2px 8px', borderRadius: '12px', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: '800' }}>
                              Profile ID #{String(leadDossier?.user?._id || selectedLead.userId || selectedLead.id || selectedLead._id || '').slice(-6).toUpperCase()}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenUserProfile(selectedLead)}
                              style={styles.btnOpenFullProfile}
                              title="Navigate to User Profile page"
                            >
                              User Profile →
                            </button>
                          </div>
                        </div>
                        <div style={styles.dossierItem}>
                          <span style={styles.dossierLabel}>Full Name:</span>
                          <span style={styles.dossierVal}>{selectedLead.name}</span>
                        </div>
                        <div style={styles.dossierItem}>
                          <span style={styles.dossierLabel}>Email Address:</span>
                          <span style={styles.dossierVal}>
                            {selectedLead.email}
                            {leadDossier?.user?.emailVerifiedAt && (
                              <span style={{ marginLeft: 6, fontSize: '10px', color: '#059669', fontWeight: '800' }}>✓ Verified</span>
                            )}
                          </span>
                        </div>
                        <div style={styles.dossierItem}>
                          <span style={styles.dossierLabel}>Phone Number:</span>
                          <span style={styles.dossierVal}>
                            {selectedLead.phone || '—'}
                            {leadDossier?.user?.phoneVerifiedAt && (
                              <span style={{ marginLeft: 6, fontSize: '10px', color: '#059669', fontWeight: '800' }}>✓ Verified</span>
                            )}
                          </span>
                        </div>
                        <div style={styles.dossierItem}>
                          <span style={styles.dossierLabel}>User Role:</span>
                          <span style={styles.dossierVal}>{(selectedLead.userType || 'Customer').toUpperCase()}</span>
                        </div>
                        <div style={styles.dossierItem}>
                          <span style={styles.dossierLabel}>Account Status:</span>
                          <span style={styles.dossierVal}>
                            <span style={styles.activeStatusPill}>{leadDossier?.user?.accountStatus || 'Active'}</span>
                          </span>
                        </div>
                        {selectedLead.businessName && (
                          <div style={styles.dossierItem}>
                            <span style={styles.dossierLabel}>Company / Business:</span>
                            <span style={styles.dossierVal}>{selectedLead.businessName}</span>
                          </div>
                        )}
                        {leadDossier?.contractorProfile?.licenseNumber && (
                          <div style={styles.dossierItem}>
                            <span style={styles.dossierLabel}>Contractor License:</span>
                            <span style={styles.dossierVal}>{leadDossier.contractorProfile.licenseNumber} ({leadDossier.contractorProfile.licenseJurisdiction || 'NJ'})</span>
                          </div>
                        )}
                        <div style={styles.dossierItem}>
                          <span style={styles.dossierLabel}>Member Since:</span>
                          <span style={styles.dossierVal}>
                            {leadDossier?.user?.createdAt ? new Date(leadDossier.user.createdAt).toLocaleDateString() : 'Direct Inquiry Record'}
                          </span>
                        </div>
                        <div style={styles.dossierItem}>
                          <span style={styles.dossierLabel}>Property Location:</span>
                          <span style={styles.dossierVal}>
                            {combinedLead.propertyAddress?.street
                              ? `${combinedLead.propertyAddress.street}, ${combinedLead.propertyAddress.city || ''} ${combinedLead.propertyAddress.state || ''}`
                              : ((selectedLead.location && selectedLead.location !== 'Shamong, NJ' && selectedLead.location !== 'New Jersey')
                                ? selectedLead.location
                                : (combinedLead.propertyAddress?.city ? `${combinedLead.propertyAddress.city}, ${combinedLead.propertyAddress.state || ''}` : 'Location Pending'))}
                          </span>
                        </div>
                      </div>

                      {/* Right Panel: If Reach Out, show Inquiry Channel Details; If Estimation, show Deck Specs */}
                      {selectedLead.isReachOut ? (
                        <div style={styles.dossierSectionCard}>
                          <h4 style={styles.dossierSectionTitle}>📋 Direct Reach-Out Inquiry Specifications</h4>
                          <div style={styles.dossierItem}>
                            <span style={styles.dossierLabel}>Inquiry Subject:</span>
                            <span style={styles.dossierVal}>{selectedLead.enquiry?.subject || 'Estimator & Scope Guidance'}</span>
                          </div>
                          <div style={styles.dossierItem}>
                            <span style={styles.dossierLabel}>Submission Source:</span>
                            <span style={styles.dossierVal}>{selectedLead.contactSource || (selectedLead.userType === 'Contractor' ? 'Contractor Partner Reach-Out' : 'Customer Support')}</span>
                          </div>
                          <div style={styles.dossierItem}>
                            <span style={styles.dossierLabel}>Approximate Deck Area:</span>
                            <span style={styles.dossierVal}>
                              {selectedLead.enquiry?.approxSize || (selectedLead.deckArea > 0 ? `${selectedLead.deckArea} sq ft` : 'Direct Scope Consultation')}
                            </span>
                          </div>
                          <div style={styles.dossierItem}>
                            <span style={styles.dossierLabel}>Preferred Contact Method:</span>
                            <span style={styles.dossierVal}>{selectedLead.enquiry?.preferredContactMethod || 'Email / Phone'}</span>
                          </div>
                          <div style={styles.dossierItem}>
                            <span style={styles.dossierLabel}>Preferred Callback Time:</span>
                            <span style={styles.dossierVal}>{selectedLead.enquiry?.preferredContactTime || 'Anytime during office hours'}</span>
                          </div>
                          <div style={{ ...styles.dossierItem, backgroundColor: '#f5f3ff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #ddd6fe', marginTop: '8px' }}>
                            <span style={{ ...styles.dossierLabel, color: '#6d28d9', fontWeight: '800' }}>★ Inquiry Status:</span>
                            <span style={{ ...styles.dossierVal, color: '#7c3aed', fontWeight: '800' }}>
                              Individual Direct Reach Out (No Calculation Required)
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div style={styles.dossierSectionCard}>
                          <h4 style={styles.dossierSectionTitle}>📐 Estimation Specifications & Blueprint</h4>
                          <div style={styles.dossierItem}>
                            <span style={styles.dossierLabel}>Deck Dimensions:</span>
                            <span style={styles.dossierVal}>{selectedLead.deckDimensions || '20 x 20 ft'}</span>
                          </div>
                          <div style={styles.dossierItem}>
                            <span style={styles.dossierLabel}>Wood Species:</span>
                            <span style={styles.dossierVal}>{selectedLead.woodSpecies || 'Pressure Treated Pine'}</span>
                          </div>
                          <div style={styles.dossierItem}>
                            <span style={styles.dossierLabel}>Surface Area:</span>
                            <span style={styles.dossierVal}>{selectedLead.deckArea ? `${selectedLead.deckArea} sq ft` : '400 sq ft'}</span>
                          </div>
                          <div style={styles.dossierItem}>
                            <span style={styles.dossierLabel}>Elevation:</span>
                            <span style={styles.dossierVal}>{(combinedLead.structureDetails?.height || 'Ground Level (0–4 ft)').replace(/_/g, ' ').toUpperCase()}</span>
                          </div>
                          <div style={styles.dossierItem}>
                            <span style={styles.dossierLabel}>Selected Services:</span>
                            <span style={styles.dossierVal}>
                              {combinedLead.services?.length ? combinedLead.services.join(', ') : 'Cleaning & Sealing'}
                            </span>
                          </div>
                          <div style={styles.dossierItem}>
                            <span style={styles.dossierLabel}>Inputs Summary:</span>
                            <span style={styles.dossierVal}>{selectedLead.selectedInputsSummary || 'Full Deck Restoration'}</span>
                          </div>
                          {(selectedLead.minJobApplied || selectedLead.isMinJobApplied || leadDossier?.lead?.minJobApplied) && (
                            <div style={{ ...styles.dossierItem, backgroundColor: '#fef3c7', padding: '6px 8px', borderRadius: '6px', border: '1px solid #fde68a' }}>
                              <span style={{ ...styles.dossierLabel, color: '#92400e' }}>⚡ Mobilization Pricing Floor:</span>
                              <span style={{ ...styles.dossierVal, color: '#b45309', fontWeight: '800' }}>
                                $2,500 Applied (Pure Subtotal: ${Number(selectedLead.pureCalculated || leadDossier?.lead?.pureCalculated || 0).toLocaleString()})
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* SECTION 8: UPLOADED INSPECTION PHOTOS GALLERY */}
                    {(leadPhotos.length > 0 || !selectedLead.isReachOut) && (
                      <div style={styles.dossierSectionCard}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                              📸 Section 8 — Uploaded Deck Photos ({leadPhotos.length})
                            </h4>
                            {leadPhotos.length > 0 && (
                              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: '#dcfce7', color: '#166534', fontWeight: '700' }}>
                                User Uploaded
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                            Click any photo to enlarge
                          </span>
                        </div>

                        {leadPhotos.length > 0 ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '14px' }}>
                            {leadPhotos.map((photo, idx) => {
                              const photoUrl = typeof photo === 'string' ? photo : (photo?.url || photo?.dataUrl || photo?.data || photo?.preview || '');
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
                                      alt={`Deck Inspection ${idx + 1}`}
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
                          <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" style={{ margin: '0 auto 6px' }}>
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                              No inspection photos uploaded for this lead inquiry.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Financial Breakdown & Pricing Snapshot — ONLY FOR ESTIMATION LEADS */}
                    {!selectedLead.isReachOut && (
                      <div style={styles.dossierSectionCard}>
                        <h4 style={styles.dossierSectionTitle}>💰 Financial Breakdown & Pricing</h4>
                        {Boolean(selectedLead.minJobApplied || selectedLead.isMinJobApplied || leadDossier?.lead?.minJobApplied) ? (
                          <>
                            <div style={styles.dossierItem}>
                              <span style={styles.dossierLabel}>Minimum Job Dispatch Price:</span>
                              <span style={{ ...styles.dossierVal, color: '#b45309', fontWeight: '700' }}>$2,500.00 (Enforced)</span>
                            </div>
                            <div style={styles.dossierItem}>
                              <span style={styles.dossierLabel}>Pure Scope Subtotal:</span>
                              <span style={styles.dossierVal}>${Number(selectedLead.pureCalculated || leadDossier?.lead?.pureCalculated || 0).toLocaleString()}</span>
                            </div>
                          </>
                        ) : (
                          <div style={styles.dossierItem}>
                            <span style={styles.dossierLabel}>Standard Mobilization Floor:</span>
                            <span style={{ ...styles.dossierVal, color: '#64748b' }}>$2,500.00 (Not Applied • Pure Rate Billed)</span>
                          </div>
                        )}
                        <div style={{ ...styles.dossierItem, borderTop: '1.5px solid #cbd5e1', paddingTop: '8px', marginTop: '6px' }}>
                          <span style={{ ...styles.dossierLabel, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Calculated Estimate Total:</span>
                          <span style={{ ...styles.dossierVal, fontSize: '18px', fontWeight: '900', color: '#047857' }}>
                            ${Number(selectedLead.pureCalculated || selectedLead.estimatedValue || leadDossier?.estimateDetails?.subtotal || leadDossier?.estimateDetails?.totalAmount || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Activity & History */}
                    <div style={styles.dossierSectionCard}>
                      <h4 style={styles.dossierSectionTitle}>⏱️ User History & Activity</h4>
                      <div style={styles.historyList}>
                        <div style={styles.historyItem}>
                          <span style={styles.historyDot} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '12px', color: '#0f172a' }}>
                              Reach-out Inquiry Raised
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {new Date(selectedLead.latestContactDate || selectedLead.createdAt || Date.now()).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div style={styles.historyItem}>
                          <span style={{ ...styles.historyDot, backgroundColor: '#10b981' }} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '12px', color: '#0f172a' }}>
                              Account Registration & Estimator Access
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {new Date(leadDossier?.user?.createdAt || selectedLead.createdAt || Date.now()).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              {/* Accept Success / Error Notice */}
              {acceptSuccessNotice && (
                <div style={{ padding: '10px 16px', backgroundColor: '#ECFDF5', color: '#15803D', borderTop: '1px solid #A7F3D0', fontWeight: '700', fontSize: '13px' }}>
                  {acceptSuccessNotice}
                </div>
              )}
              {acceptErrorNotice && (
                <div style={{ padding: '10px 16px', backgroundColor: '#FEF2F2', color: '#B91C1C', borderTop: '1px solid #FECACA', fontWeight: '700', fontSize: '13px' }}>
                  {acceptErrorNotice}
                </div>
              )}

              {/* Modal Footer */}
              <div style={{ ...styles.modalFooter, flexWrap: 'wrap', gap: '10px', padding: isMobile ? '12px' : '12px 20px' }}>
                <div style={{ display: 'flex', gap: '8px', marginRight: 'auto', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleExportDossier('pdf', combinedLead, custMeta)}
                    disabled={exportingFormat === 'pdf'}
                    style={styles.modalBtnExportPdf}
                  >
                    {exportingFormat === 'pdf' ? 'Exporting PDF...' : 'Download PDF Report'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportDossier('excel', combinedLead, custMeta)}
                    disabled={exportingFormat === 'excel'}
                    style={styles.modalBtnExportExcel}
                  >
                    {exportingFormat === 'excel' ? 'Exporting Excel...' : 'Download Excel'}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* View User Page Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenUserProfile(selectedLead)}
                    style={styles.btnModalFooterProfile}
                    title="Open User Profile Page"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>View User Profile</span>
                  </button>

                  {/* Accept Request Button */}
                  <button
                    type="button"
                    onClick={() => handleAcceptLeadRequest(selectedLead)}
                    disabled={acceptingLead || isAcceptedInProgress}
                    style={{
                      padding: '9px 18px',
                      backgroundColor: isAcceptedInProgress ? '#166534' : '#15803D',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: isAcceptedInProgress ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 6px rgba(21, 128, 61, 0.25)',
                    }}
                    title="Accept booking request and move to IN PROGRESS"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>
                      {acceptingLead
                        ? 'Updating...'
                        : isAcceptedInProgress
                        ? '✓ Request In Progress'
                        : 'Request In Progress'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteLead(selectedLead._id || selectedLead.id, selectedLead.name || selectedLead.leadNumber)}
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
                    title="Permanently delete lead"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span>Delete Lead</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    style={styles.btnCloseModal}
                  >
                    Close Dossier
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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

      {/* Enterprise Delete Confirmation Dialog */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        title="Permanently Delete Lead Record?"
        message={`Are you sure you want to permanently delete lead record "${deleteModalState.identifier}"? Note: This deletes only the lead inquiry record. Customer accounts, contractor credentials, and saved estimations will remain completely intact.`}
        confirmLabel={deleteModalState.loading ? 'Deleting...' : 'Delete Lead'}
        variant="danger"
        isLoading={deleteModalState.loading}
        onConfirm={handleConfirmDeleteLead}
        onClose={() =>
          !deleteModalState.loading &&
          setDeleteModalState({ isOpen: false, id: null, identifier: '', loading: false })
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
  shinyBulkDeleteBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '9999px',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: '1px solid #b91c1c',
    boxShadow: '0 1px 3px rgba(220, 38, 38, 0.3), inset 0 1px 0 rgba(255,255,255,0.25)',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
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

  // Tabs
  tabBar: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '16px',
    overflowX: 'auto',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    border: 'none',
    background: 'none',
    borderBottom: '2px solid transparent',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  },
  tabBtnActive: {
    color: '#0f172a',
    borderBottomColor: '#0f172a',
  },
  tabBadge: {
    padding: '2px 8px',
    borderRadius: '9999px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    fontSize: '11px',
    fontWeight: '800',
  },
  tabBadgeActive: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
  },

  // Controls Bar
  controlBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
    flexWrap: 'wrap',
    width: '100%',
  },
  shinySearchWrapper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    border: '1.5px solid #cbd5e1',
    borderRadius: '8px',
    padding: '7px 12px',
    flex: '1 1 280px',
    minWidth: '220px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  shinySearchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '12.5px',
    color: '#0f172a',
    width: '100%',
    backgroundColor: 'transparent',
    fontFamily: 'inherit',
  },
  clearSearchBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '12px',
  },
  filterPillGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    flexWrap: 'wrap',
  },
  filterGroupLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    marginRight: '2px',
  },
  shinyPillBtn: {
    padding: '5px 11px',
    borderRadius: '9999px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  shinyPillBtnActive: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    borderColor: '#0f172a',
    boxShadow: '0 2px 4px rgba(15, 23, 42, 0.2)',
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
  },
  shinyRefreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    border: '1.5px solid #cbd5e1',
    color: '#1e3a63',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    height: '36px',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
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
    overflowX: 'auto',
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '12.5px',
    tableLayout: 'auto',
  },
  th: {
    padding: '10px 10px',
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
    padding: '9px 10px',
    verticalAlign: 'middle',
  },

  // Row Item Styles
  checkboxInput: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
    accentColor: '#047857',
  },
  personCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatarImg: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1.5px solid #cbd5e1',
    flexShrink: 0,
  },
  avatarCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '12px',
    flexShrink: 0,
  },
  personName: {
    fontWeight: '700',
    color: '#0f172a',
    fontSize: '13px',
  },
  personEmail: {
    fontSize: '11px',
    color: '#64748b',
  },
  personPhone: {
    fontSize: '11px',
    color: '#0284c7',
  },
  personCompany: {
    fontSize: '10px',
    color: '#475569',
    fontWeight: '600',
    marginTop: '2px',
  },
  badgeCustomer: {
    display: 'inline-block',
    fontSize: '10px',
    fontWeight: '800',
    color: '#047857',
    backgroundColor: '#dcfce7',
    padding: '2px 6px',
    borderRadius: '4px',
    width: 'fit-content',
  },
  badgeContractor: {
    display: 'inline-block',
    fontSize: '10px',
    fontWeight: '800',
    color: '#1d4ed8',
    backgroundColor: '#dbeafe',
    padding: '2px 6px',
    borderRadius: '4px',
    width: 'fit-content',
  },
  badgeEstimationService: {
    display: 'inline-block',
    fontSize: '10px',
    fontWeight: '800',
    color: '#6b21a8',
    backgroundColor: '#f3e8ff',
    border: '1px solid #d8b4fe',
    padding: '2px 6px',
    borderRadius: '4px',
    width: 'fit-content',
  },
  badgeReachOut: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '10.5px',
    fontWeight: '800',
    color: '#6d28d9',
    backgroundColor: '#ede9fe',
    border: '1px solid #ddd6fe',
    padding: '2px 7px',
    borderRadius: '4px',
    width: 'fit-content',
    boxShadow: '0 1px 2px rgba(109, 40, 217, 0.08)',
  },
  unreadBubbleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px 7px',
    borderRadius: '9999px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: '800',
    lineHeight: 1.2,
    boxShadow: '0 1px 3px rgba(239, 68, 68, 0.4)',
    marginLeft: '4px',
  },
  sourceLabel: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '500',
  },
  leadIdSmall: {
    fontSize: '10px',
    color: '#94a3b8',
    fontFamily: 'monospace',
  },
  requestedMessageText: {
    fontSize: '12px',
    color: '#0f172a',
    fontWeight: '600',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    lineHeight: 1.4,
  },
  estimatedValueBadge: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '700',
    color: '#047857',
    backgroundColor: '#ecfdf5',
    padding: '2px 6px',
    borderRadius: '4px',
    marginTop: '4px',
  },
  hotPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    fontWeight: '800',
    color: '#b91c1c',
    backgroundColor: '#fee2e2',
    border: '1px solid #fca5a5',
    padding: '3px 8px',
    borderRadius: '9999px',
  },
  openedPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    fontWeight: '800',
    color: '#047857',
    backgroundColor: '#dcfce7',
    border: '1px solid #86efac',
    padding: '3px 8px',
    borderRadius: '9999px',
    letterSpacing: '0.04em',
  },
  viewedPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    fontWeight: '800',
    color: '#0284c7',
    backgroundColor: '#e0f2fe',
    border: '1px solid #7dd3fc',
    padding: '3px 8px',
    borderRadius: '9999px',
    letterSpacing: '0.04em',
  },
  standardPill: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#475569',
    backgroundColor: '#f1f5f9',
    padding: '2px 8px',
    borderRadius: '9999px',
  },
  dateTimeBadge: {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: '3px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    padding: '4px 8px',
    borderRadius: '6px',
  },
  dateRow: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    fontWeight: '700',
    color: '#0f172a',
    whiteSpace: 'nowrap',
  },
  timeRow: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
    whiteSpace: 'nowrap',
  },
  dateTimeText: {
    fontWeight: '600',
    color: '#0f172a',
    fontSize: '12px',
  },
  timeSub: {
    fontSize: '11px',
    color: '#64748b',
  },
  locationText: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    color: '#334155',
    fontWeight: '500',
  },
  btnActionProfile: {
    height: '28px',
    padding: '0 8px',
    borderRadius: '6px',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    color: '#1d4ed8',
    fontSize: '11.5px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
  },
  btnViewDetails: {
    height: '28px',
    padding: '0 10px',
    borderRadius: '6px',
    backgroundColor: '#0f172a',
    border: 'none',
    color: '#ffffff',
    fontSize: '11.5px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
  },
  btnDeleteLead: {
    height: '28px',
    padding: '0 8px',
    borderRadius: '6px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    fontSize: '11.5px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
  },

  // Pagination
  paginationBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderTop: '1px solid #f1f5f9',
    backgroundColor: '#f8fafc',
    fontSize: '12px',
    color: '#64748b',
    flexWrap: 'wrap',
    gap: '12px',
  },
  paginationInfo: {
    fontWeight: '600',
    color: '#475569',
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
  paginationBtns: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  pageBtn: {
    padding: '5px 10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '11.5px',
    fontWeight: '700',
    color: '#334155',
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
    border: '1px solid #e2e8f0',
    backgroundColor: '#f1f5f9',
    fontSize: '11.5px',
    fontWeight: '600',
    color: '#94a3b8',
    cursor: 'not-allowed',
  },
  paginationRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderTop: '1px solid #f1f5f9',
    backgroundColor: '#f8fafc',
    fontSize: '12px',
    color: '#64748b',
  },
  paginationText: {
    fontWeight: '600',
  },
  paginationBtns: {
    display: 'flex',
    gap: '8px',
  },
  pageBtn: {
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    color: '#334155',
    cursor: 'pointer',
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
  errorBox: {
    padding: '16px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    margin: '16px',
  },

  // Large Dossier Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '16px',
  },
  modalBoxLarge: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '720px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
  },
  modalAvatarImg: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #cbd5e1',
    flexShrink: 0,
  },
  avatarLarge: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '15px',
    flexShrink: 0,
  },
  modalBtnProfile: {
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
  btnOpenFullProfile: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 8px',
    borderRadius: '6px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: 'none',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  btnModalFooterProfile: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 16px',
    borderRadius: '8px',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  modalTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '800',
    color: '#0f172a',
  },
  modalSub: {
    margin: '2px 0 0',
    fontSize: '12px',
    color: '#64748b',
  },
  modalExportSmallBtn: {
    padding: '5px 10px',
    borderRadius: '6px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    color: '#334155',
    fontSize: '11px',
    fontWeight: '700',
    textDecoration: 'none',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#64748b',
    padding: '4px',
  },
  modalBody: {
    padding: '20px',
    backgroundColor: '#f8fafc',
  },
  modalContentGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  modalBanner: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '10px',
    backgroundColor: '#ffffff',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  bannerItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  bannerLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  bannerVal: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#0f172a',
    marginTop: '2px',
  },
  bannerValHot: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#b91c1c',
    marginTop: '2px',
  },
  bannerValStandard: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#475569',
    marginTop: '2px',
  },
  bannerValAmount: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#047857',
    marginTop: '2px',
  },
  dossierSectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '14px 16px',
    border: '1px solid #e2e8f0',
  },
  dossierSectionTitle: {
    margin: '0 0 10px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#0f172a',
  },
  inquiryMessageBox: {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '12px',
    border: '1px solid #e2e8f0',
  },
  inquiryMessageText: {
    margin: 0,
    fontSize: '13px',
    color: '#0f172a',
    fontStyle: 'italic',
    lineHeight: 1.5,
  },
  twoColGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
    gap: '12px',
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
  activeStatusPill: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#047857',
    backgroundColor: '#dcfce7',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  breakdownBox: {
    marginTop: '8px',
    padding: '8px 10px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
  breakdownRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#334155',
    marginBottom: '2px',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    paddingLeft: '6px',
  },
  historyItem: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  historyDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    marginTop: '4px',
    flexShrink: 0,
  },
  modalFooter: {
    padding: '12px 20px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    backgroundColor: '#ffffff',
    borderRadius: '0 0 16px 16px',
  },
  btnCloseModal: {
    padding: '6px 16px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
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
};

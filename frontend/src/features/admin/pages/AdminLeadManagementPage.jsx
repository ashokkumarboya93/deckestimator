// =============================================
// Deck Estimator — Admin Lead Management Hub
// =============================================
// Features:
// - 4 horizontal tabs: Hot Priority, Customer Leads, Contractor Leads, All Leads
// - Automatic Hot Priority calculation using the last 30 days (<= 30 days)
// - Contact Us and Reach Out event tracking and count counters
// - Working Filter Panel (Status, Contact Source, Date Range, Sort, Search)
// - Real MongoDB data with live relationship population
// - View Details popup with complete Customer / Contractor dossier:
//   * Registration & user account profile details
//   * Estimations count, breakdown, total amount, status
//   * Deck projects overview
//   * Contact history & enquiry message
//   * Small popup Export CSV & Export Excel buttons
// - Page-level Export CSV & Excel

import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';

const TABS = [
  { id: 'hot', label: 'Hot Priority' },
  { id: 'customer', label: 'Customer Leads' },
  { id: 'contractor', label: 'Contractor Leads' },
  { id: 'all', label: 'All Leads' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'converted', label: 'Converted' },
  { value: 'closed', label: 'Closed / Lost' },
];

const SOURCE_OPTIONS = [
  { value: 'all', label: 'All Sources' },
  { value: 'Contact Us', label: 'Contact Us' },
  { value: 'Reach Out', label: 'Reach Out' },
  { value: 'Help', label: 'Help Request' },
];

const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'most_contacted', label: 'Most Contacted' },
  { value: 'name_asc', label: 'Name (A–Z)' },
];

export default function AdminLeadManagementPage() {
  const [activeTab, setActiveTab] = useState('hot');
  const [leads, setLeads] = useState([]);
  const [counts, setCounts] = useState({ hotPriority: 0, customerLeads: 0, contractorLeads: 0, allLeads: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // View Details Modal State
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadDossier, setLeadDossier] = useState(null);
  const [loadingDossier, setLoadingDossier] = useState(false);
  const [dossierError, setDossierError] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState('profile');

  useEffect(() => {
    fetchLeads();
  }, [activeTab, statusFilter, sourceFilter, dateRangeFilter, sortOption]);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getLeads({
        tab: activeTab,
        search: searchTerm.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        source: sourceFilter !== 'all' ? sourceFilter : undefined,
        dateRange: dateRangeFilter !== 'all' ? dateRangeFilter : undefined,
        sort: sortOption,
        limit: 50,
      });

      setLeads(res.data || []);
      if (res.counts) {
        setCounts(res.counts);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load leads from database.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSourceFilter('all');
    setDateRangeFilter('all');
    setSortOption('newest');
  };

  const hasActiveFilters = statusFilter !== 'all' || sourceFilter !== 'all' || dateRangeFilter !== 'all' || searchTerm.trim().length > 0;

  // Open Lead Details & Fetch Full Dossier
  const handleOpenLeadDetails = async (lead) => {
    setSelectedLead(lead);
    setLoadingDossier(true);
    setDossierError(null);
    setActiveModalTab('profile');

    try {
      const dossierRes = await adminApi.getLeadDetails(lead.id || lead._id || lead.leadNumber);
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
  };

  const getTabCount = (tabId) => {
    if (tabId === 'hot') return counts.hotPriority || 0;
    if (tabId === 'customer') return counts.customerLeads || 0;
    if (tabId === 'contractor') return counts.contractorLeads || 0;
    return counts.allLeads || 0;
  };

  return (
    <div style={styles.container}>
      {/* 1. Header with Title & Export Actions */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Lead Management</h1>
          <p style={styles.subtitle}>
            Capture incoming Contact Us &amp; Reach Out enquiries, prioritize time-sensitive leads (last 30 days), and review verified customer and contractor requests.
          </p>
        </div>
        <div style={styles.headerActions}>
          <a
            href={adminApi.exportLeadsUrl('csv', activeTab, {
              status: statusFilter !== 'all' ? statusFilter : undefined,
              source: sourceFilter !== 'all' ? sourceFilter : undefined,
              dateRange: dateRangeFilter !== 'all' ? dateRangeFilter : undefined,
            })}
            target="_blank"
            rel="noreferrer"
            style={styles.btnSecondary}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </a>
          <a
            href={adminApi.exportLeadsUrl('excel', activeTab, {
              status: statusFilter !== 'all' ? statusFilter : undefined,
              source: sourceFilter !== 'all' ? sourceFilter : undefined,
              dateRange: dateRangeFilter !== 'all' ? dateRangeFilter : undefined,
            })}
            target="_blank"
            rel="noreferrer"
            style={styles.btnSuccess}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Excel
          </a>
        </div>
      </div>

      {/* 2. Tabs */}
      <div style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = getTabCount(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tabBtn,
                ...(isActive ? styles.tabBtnActive : {}),
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  ...styles.tabBadge,
                  ...(tab.id === 'hot' ? styles.hotBadge : styles.neutralBadge),
                  ...(isActive ? styles.tabBadgeActive : {}),
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Search Bar and Filter Controls */}
      <div style={styles.controlsCard}>
        <div style={styles.searchRow}>
          <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
            <div style={styles.searchBox}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search by lead name, email, phone, location, or business..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => { setSearchTerm(''); fetchLeads(); }}
                  style={styles.clearSearchBtn}
                >
                  ✕
                </button>
              )}
            </div>
            <button type="submit" style={styles.searchBtn}>Search</button>
          </form>

          <button
            type="button"
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            style={{
              ...styles.filterToggleBtn,
              ...(isFilterPanelOpen || hasActiveFilters ? styles.filterToggleActive : {}),
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filters
            {hasActiveFilters && <span style={styles.activeDot} />}
          </button>
        </div>

        {/* Expandable Filter Panel */}
        {isFilterPanelOpen && (
          <div style={styles.filterPanel}>
            <div style={styles.filterGrid}>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Contact Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={styles.filterSelect}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Contact Source</label>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  style={styles.filterSelect}
                >
                  {SOURCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Date Range</label>
                <select
                  value={dateRangeFilter}
                  onChange={(e) => setDateRangeFilter(e.target.value)}
                  style={styles.filterSelect}
                >
                  {DATE_RANGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Sort Order</label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  style={styles.filterSelect}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.filterFooter}>
              <button
                type="button"
                onClick={handleClearFilters}
                style={styles.clearFiltersBtn}
              >
                Reset All Filters
              </button>
              <button
                type="button"
                onClick={() => fetchLeads()}
                style={styles.applyFiltersBtn}
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Table Content Card */}
      <div style={styles.card}>
        {loading ? (
          <div style={styles.loaderBox}>
            <div style={styles.spinner} />
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '12px' }}>Loading real MongoDB lead enquiries...</p>
          </div>
        ) : error ? (
          <div style={styles.errorBox}>
            <p style={{ margin: 0, fontWeight: '600' }}>Error Loading Data</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>{error}</p>
          </div>
        ) : leads.length === 0 ? (
          <div style={styles.emptyBox}>
            <div style={styles.emptyIconCircle}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.6">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 style={styles.emptyTitle}>No leads in {TABS.find(t => t.id === activeTab)?.label} queue</h3>
            <p style={styles.emptySub}>
              {activeTab === 'hot'
                ? 'No Contact Us or Reach Out requests received in the last 30 days.'
                : activeTab === 'customer'
                ? 'No customer contact enquiries have been submitted yet.'
                : activeTab === 'contractor'
                ? 'No contractor reach-out requests have been submitted yet.'
                : 'No lead enquiries currently exist.'}
            </p>
          </div>
        ) : (
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Contact Person</th>
                  <th style={styles.th}>Type &amp; Source</th>
                  <th style={styles.th}>Contact Count</th>
                  <th style={styles.th}>Priority (30-Day Auto)</th>
                  <th style={styles.th}>Date &amp; Location</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => {
                  const isHot = l.isHot;
                  const isCust = (l.userType || '').toLowerCase() === 'customer';
                  const initials = (l.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

                  return (
                    <tr key={l._id} style={styles.tr}>
                      {/* 1. Contact Person */}
                      <td style={styles.td}>
                        <div style={styles.personCell}>
                          <div style={{ ...styles.avatarCircle, backgroundColor: isCust ? '#ecfdf5' : '#eff6ff', color: isCust ? '#059669' : '#2563eb' }}>
                            {initials}
                          </div>
                          <div>
                            <div style={styles.personName}>{l.name}</div>
                            <div style={styles.personEmail}>{l.email}</div>
                            <div style={styles.personPhone}>{l.phone || '—'}</div>
                            {l.businessName && (
                              <div style={styles.personCompany}>🏢 {l.businessName}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. Type & Source */}
                      <td style={styles.td}>
                        <span style={isCust ? styles.badgeCustomer : styles.badgeContractor}>
                          {(l.userType || 'Customer').toUpperCase()}
                        </span>
                        <div style={styles.sourceLabel}>
                          Source: <strong style={{ color: '#0f172a' }}>{l.contactSource || (isCust ? 'Contact Us' : 'Reach Out')}</strong>
                        </div>
                        <div style={styles.leadIdSmall}>#{l.leadNumber || l.leadId}</div>
                      </td>

                      {/* 3. Contact Count */}
                      <td style={styles.td}>
                        <span style={styles.countBadgePill}>
                          {l.contactCount || 1} Reach-out(s)
                        </span>
                      </td>

                      {/* 4. Priority (30-day auto) */}
                      <td style={styles.td}>
                        {isHot ? (
                          <span style={styles.hotPill}>
                            🔥 HOT PRIORITY ({l.daysSinceContact !== undefined ? `${l.daysSinceContact}d ago` : 'Active'})
                          </span>
                        ) : (
                          <span style={styles.standardPill}>Standard</span>
                        )}
                      </td>

                      {/* 5. Date & Location */}
                      <td style={styles.td}>
                        <div style={styles.locationText}>{l.location || '—'}</div>
                        <div style={styles.dateText}>
                          {new Date(l.latestContactDate || l.createdAt || Date.now()).toLocaleDateString('en-US', {
                            month: 'short',
                            day: '2-digit',
                            year: 'numeric',
                          })}
                        </div>
                        <span style={styles.statusSubPill}>{(l.status || 'new').toUpperCase()}</span>
                      </td>

                      {/* 6. Actions */}
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenLeadDetails(l)}
                          style={styles.actionBtnOutline}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. COMPREHENSIVE VIEW DETAILS POPUP (DOSSIER MODAL) */}
      {selectedLead && (
        <div style={styles.modalOverlay} onClick={handleCloseModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <div>
                <div style={styles.modalHeaderTop}>
                  <span style={styles.modalLeadNumber}>#{selectedLead.leadNumber || selectedLead.leadId}</span>
                  <span style={(selectedLead.userType || '').toLowerCase() === 'customer' ? styles.badgeCustomer : styles.badgeContractor}>
                    {(selectedLead.userType || 'Customer').toUpperCase()}
                  </span>
                  <span style={styles.statusSubPill}>{(selectedLead.status || 'new').toUpperCase()}</span>
                </div>
                <h2 style={styles.modalTitle}>{selectedLead.name}</h2>
                <p style={styles.modalSub}>{selectedLead.email} • {selectedLead.phone || 'No phone recorded'}</p>
              </div>

              <div style={styles.modalHeaderRight}>
                {/* Small Popup Export Buttons */}
                <a
                  href={adminApi.exportSingleLeadUrl(selectedLead.id || selectedLead._id, 'csv')}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.popupExportBtn}
                  title="Export this user's entire dossier to CSV"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Export CSV
                </a>

                <a
                  href={adminApi.exportSingleLeadUrl(selectedLead.id || selectedLead._id, 'excel')}
                  target="_blank"
                  rel="noreferrer"
                  style={{ ...styles.popupExportBtn, borderColor: '#10b981', color: '#047857' }}
                  title="Export this user's entire dossier to Excel"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Export Excel
                </a>

                <button onClick={handleCloseModal} style={styles.closeBtn} title="Close popup">✕</button>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div style={styles.modalTabBar}>
              <button
                type="button"
                onClick={() => setActiveModalTab('profile')}
                style={{ ...styles.modalTabBtn, ...(activeModalTab === 'profile' ? styles.modalTabBtnActive : {}) }}
              >
                1. Registration &amp; Account
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('enquiry')}
                style={{ ...styles.modalTabBtn, ...(activeModalTab === 'enquiry' ? styles.modalTabBtnActive : {}) }}
              >
                2. Enquiry &amp; Contact History
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('estimates')}
                style={{ ...styles.modalTabBtn, ...(activeModalTab === 'estimates' ? styles.modalTabBtnActive : {}) }}
              >
                {(selectedLead.userType || '').toLowerCase() === 'customer'
                  ? '3. Estimations & Projects'
                  : '3. Assigned Leads & Bids'}
              </button>
            </div>

            {/* Modal Body */}
            <div style={styles.modalBody}>
              {loadingDossier ? (
                <div style={styles.loaderBox}>
                  <div style={styles.spinner} />
                  <p style={{ color: '#64748b', fontSize: '13px', marginTop: '10px' }}>Loading entire profile from MongoDB...</p>
                </div>
              ) : dossierError ? (
                <div style={styles.errorBox}>{dossierError}</div>
              ) : (
                <>
                  {/* TAB 1: REGISTRATION & USER ACCOUNT */}
                  {activeModalTab === 'profile' && (
                    <div>
                      <h4 style={styles.sectionHeading}>User Registration Details</h4>
                      <div style={styles.dossierGrid}>
                        <div style={styles.dossierItem}>
                          <span style={styles.dossierLabel}>Full Name</span>
                          <span style={styles.dossierValue}>{leadDossier?.user?.fullName || selectedLead.name}</span>
                        </div>
                        <div style={styles.dossierItem}>
                          <span style={styles.dossierLabel}>Registered Email</span>
                          <span style={styles.dossierValue}>{leadDossier?.user?.email || selectedLead.email}</span>
                        </div>
                        <div style={styles.dossierItem}>
                          <span style={styles.dossierLabel}>Contact Phone</span>
                          <span style={styles.dossierValue}>{leadDossier?.user?.phone || selectedLead.phone || '—'}</span>
                        </div>
                        <div style={styles.dossierItem}>
                          <span style={styles.dossierLabel}>User Role</span>
                          <span style={styles.dossierValue}>{(leadDossier?.user?.role || selectedLead.userType || 'customer').toUpperCase()}</span>
                        </div>
                        <div style={styles.dossierItem}>
                          <span style={styles.dossierLabel}>Account Status</span>
                          <span style={{
                            ...styles.statusSubPill,
                            backgroundColor: leadDossier?.user?.accountStatus === 'active' ? '#ecfdf5' : '#fee2e2',
                            color: leadDossier?.user?.accountStatus === 'active' ? '#047857' : '#b91c1c',
                          }}>
                            {(leadDossier?.user?.accountStatus || 'active').toUpperCase()}
                          </span>
                        </div>
                        <div style={styles.dossierItem}>
                          <span style={styles.dossierLabel}>Registered On</span>
                          <span style={styles.dossierValue}>
                            {leadDossier?.user?.createdAt
                              ? new Date(leadDossier.user.createdAt).toLocaleString()
                              : '—'}
                          </span>
                        </div>
                      </div>

                      {/* If Contractor: Show Business & License Credentials */}
                      {leadDossier?.contractorData?.profile && (
                        <div style={{ marginTop: '20px' }}>
                          <h4 style={styles.sectionHeading}>Contractor Licensing &amp; Business Profile</h4>
                          <div style={styles.dossierGrid}>
                            <div style={styles.dossierItem}>
                              <span style={styles.dossierLabel}>Business / Company</span>
                              <span style={styles.dossierValue}>{leadDossier.contractorData.profile.businessName || '—'}</span>
                            </div>
                            <div style={styles.dossierItem}>
                              <span style={styles.dossierLabel}>Contractor License #</span>
                              <span style={styles.dossierValue}>{leadDossier.contractorData.profile.licenseNumber || '—'}</span>
                            </div>
                            <div style={styles.dossierItem}>
                              <span style={styles.dossierLabel}>Jurisdiction / State</span>
                              <span style={styles.dossierValue}>{leadDossier.contractorData.profile.licenseJurisdiction || '—'}</span>
                            </div>
                            <div style={styles.dossierItem}>
                              <span style={styles.dossierLabel}>Experience</span>
                              <span style={styles.dossierValue}>{leadDossier.contractorData.profile.yearsOfExperience || 0} years</span>
                            </div>
                            <div style={styles.dossierItem}>
                              <span style={styles.dossierLabel}>Verification Status</span>
                              <span style={{
                                ...styles.statusSubPill,
                                backgroundColor: leadDossier.contractorData.profile.verificationStatus === 'approved' ? '#ecfdf5' : '#fffbeb',
                                color: leadDossier.contractorData.profile.verificationStatus === 'approved' ? '#047857' : '#b45309',
                              }}>
                                {(leadDossier.contractorData.profile.verificationStatus || 'pending').toUpperCase()}
                              </span>
                            </div>
                            <div style={styles.dossierItem}>
                              <span style={styles.dossierLabel}>Approved Date</span>
                              <span style={styles.dossierValue}>
                                {leadDossier.contractorData.profile.approvedAt
                                  ? new Date(leadDossier.contractorData.profile.approvedAt).toLocaleDateString()
                                  : 'Awaiting Review'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: ENQUIRY & CONTACT HISTORY */}
                  {activeModalTab === 'enquiry' && (
                    <div>
                      <h4 style={styles.sectionHeading}>Enquiry Details</h4>
                      <div style={styles.enquiryCard}>
                        <div style={styles.enquiryMeta}>
                          <div><strong>Source:</strong> {selectedLead.contactSource || 'Contact Us'}</div>
                          <div><strong>Total Contacts:</strong> {selectedLead.contactCount || 1} times</div>
                          <div><strong>Priority:</strong> {selectedLead.isHot ? '🔥 HOT PRIORITY (Last 30 Days)' : 'Standard'}</div>
                        </div>
                        <div style={{ marginTop: '12px' }}>
                          <span style={styles.dossierLabel}>Subject</span>
                          <div style={styles.enquirySubjectText}>
                            {selectedLead.enquiry?.subject || 'Direct Service Enquiry'}
                          </div>
                        </div>
                        <div style={{ marginTop: '12px' }}>
                          <span style={styles.dossierLabel}>Message / Request</span>
                          <div style={styles.enquiryMessageBox}>
                            {selectedLead.enquiry?.message || 'Customer requested consultation via web portal.'}
                          </div>
                        </div>
                      </div>

                      {/* Contact Events Timeline */}
                      <h4 style={{ ...styles.sectionHeading, marginTop: '20px' }}>Contact History Timeline</h4>
                      {selectedLead.contactHistory && selectedLead.contactHistory.length > 0 ? (
                        <div style={styles.timelineList}>
                          {selectedLead.contactHistory.map((item, idx) => (
                            <div key={idx} style={styles.timelineItem}>
                              <div style={styles.timelineBullet} />
                              <div style={styles.timelineContent}>
                                <div style={styles.timelineDate}>
                                  {new Date(item.date).toLocaleString()} • <strong>{item.source}</strong>
                                </div>
                                <div style={styles.timelineSubject}>{item.subject}</div>
                                <div style={styles.timelineMsg}>{item.message}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ color: '#64748b', fontSize: '13px' }}>
                          First recorded contact: {new Date(selectedLead.firstContactDate || selectedLead.createdAt).toLocaleString()}.
                        </p>
                      )}
                    </div>
                  )}

                  {/* TAB 3: ESTIMATIONS & DECK PROJECTS */}
                  {activeModalTab === 'estimates' && (
                    <div>
                      {(selectedLead.userType || '').toLowerCase() === 'customer' ? (
                        <div>
                          {/* Summary Stats */}
                          <div style={styles.modalStatsRow}>
                            <div style={styles.modalStatCard}>
                              <div style={styles.modalStatVal}>{leadDossier?.customerData?.decksCount || 0}</div>
                              <div style={styles.modalStatLbl}>Deck Projects</div>
                            </div>
                            <div style={styles.modalStatCard}>
                              <div style={styles.modalStatVal}>{leadDossier?.customerData?.estimatesCount || 0}</div>
                              <div style={styles.modalStatLbl}>Total Estimates</div>
                            </div>
                            <div style={styles.modalStatCard}>
                              <div style={styles.modalStatVal}>{leadDossier?.customerData?.activeEstimatesCount || 0}</div>
                              <div style={styles.modalStatLbl}>Active Estimates</div>
                            </div>
                          </div>

                          {/* Estimates Table */}
                          <h4 style={{ ...styles.sectionHeading, marginTop: '16px' }}>Estimates Created by this Customer</h4>
                          {leadDossier?.customerData?.estimates && leadDossier.customerData.estimates.length > 0 ? (
                            <table style={styles.subTable}>
                              <thead>
                                <tr>
                                  <th style={styles.subTh}>Estimate Ref</th>
                                  <th style={styles.subTh}>Deck Project</th>
                                  <th style={styles.subTh}>Estimated Cost</th>
                                  <th style={styles.subTh}>Status</th>
                                  <th style={styles.subTh}>Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {leadDossier.customerData.estimates.map((est) => (
                                  <tr key={est.id}>
                                    <td style={styles.subTd}><strong>{est.estimateReference}</strong></td>
                                    <td style={styles.subTd}>{est.deckName}</td>
                                    <td style={styles.subTd}>${(est.totalCost || 0).toLocaleString()}</td>
                                    <td style={styles.subTd}><span style={styles.statusSubPill}>{est.status}</span></td>
                                    <td style={styles.subTd}>{new Date(est.createdAt).toLocaleDateString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div style={styles.subEmpty}>
                              No formal estimates created yet by this customer.
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          {/* Contractor Projects & Leads */}
                          <div style={styles.modalStatsRow}>
                            <div style={styles.modalStatCard}>
                              <div style={styles.modalStatVal}>{leadDossier?.contractorData?.assignedLeadsCount || 0}</div>
                              <div style={styles.modalStatLbl}>Assigned Leads</div>
                            </div>
                          </div>
                          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '12px' }}>
                            {leadDossier?.contractorData?.assignedLeadsCount === 0
                              ? 'This contractor currently has no assigned leads.'
                              : `Contractor has ${leadDossier?.contractorData?.assignedLeadsCount} leads dispatched in their service area.`}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div style={styles.modalFooter}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={adminApi.exportSingleLeadUrl(selectedLead.id || selectedLead._id, 'csv')}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.popupExportBtn}
                >
                  Download CSV
                </a>
                <a
                  href={adminApi.exportSingleLeadUrl(selectedLead.id || selectedLead._id, 'excel')}
                  target="_blank"
                  rel="noreferrer"
                  style={{ ...styles.popupExportBtn, borderColor: '#10b981', color: '#047857' }}
                >
                  Download Excel
                </a>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                style={styles.btnSecondary}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Component Styles
// -------------------------------------------------------------
const styles = {
  container: {
    padding: '24px 32px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
    maxWidth: '780px',
    lineHeight: '1.4',
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
  },
  btnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  btnSuccess: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#059669',
    border: 'none',
    borderRadius: '8px',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  tabBar: {
    display: 'flex',
    gap: '4px',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '16px',
  },
  tabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#64748b',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  tabBtnActive: {
    color: '#2563eb',
    fontWeight: '600',
    borderBottom: '2px solid #2563eb',
  },
  tabBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 7px',
    borderRadius: '12px',
  },
  hotBadge: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
  },
  neutralBadge: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
  },
  tabBadgeActive: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
  },
  controlsCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    padding: '12px 16px',
    marginBottom: '16px',
  },
  searchRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  searchForm: {
    display: 'flex',
    gap: '8px',
    flex: 1,
  },
  searchBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0 12px',
    backgroundColor: '#ffffff',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    padding: '9px 8px',
    fontSize: '13px',
    width: '100%',
    color: '#0f172a',
  },
  clearSearchBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '13px',
  },
  searchBtn: {
    padding: '9px 18px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  filterToggleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 16px',
    backgroundColor: '#f8fafc',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    position: 'relative',
  },
  filterToggleActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#93c5fd',
    color: '#1d4ed8',
  },
  activeDot: {
    width: '7px',
    height: '7px',
    backgroundColor: '#2563eb',
    borderRadius: '50%',
    marginLeft: '2px',
  },
  filterPanel: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #f1f5f9',
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    marginBottom: '12px',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  filterLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
  },
  filterSelect: {
    padding: '7px 10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
  },
  filterFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
  clearFiltersBtn: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  applyFiltersBtn: {
    padding: '6px 14px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  loaderBox: {
    padding: '48px 0',
    textAlign: 'center',
  },
  spinner: {
    display: 'inline-block',
    width: '32px',
    height: '32px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#2563eb',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorBox: {
    padding: '16px 20px',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    borderRadius: '8px',
    margin: '16px',
  },
  emptyBox: {
    padding: '64px 20px',
    textAlign: 'center',
  },
  emptyIconCircle: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#f8fafc',
    marginBottom: '12px',
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 6px 0',
  },
  emptySub: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
  },
  tableResponsive: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.1s',
  },
  td: {
    padding: '14px 16px',
    verticalAlign: 'middle',
  },
  personCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatarCircle: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    flexShrink: 0,
  },
  personName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0f172a',
  },
  personEmail: {
    fontSize: '12px',
    color: '#64748b',
  },
  personPhone: {
    fontSize: '12px',
    color: '#475569',
  },
  personCompany: {
    fontSize: '11px',
    color: '#2563eb',
    marginTop: '2px',
  },
  badgeCustomer: {
    display: 'inline-block',
    padding: '3px 8px',
    fontSize: '11px',
    fontWeight: '700',
    borderRadius: '4px',
    backgroundColor: '#ecfdf5',
    color: '#047857',
  },
  badgeContractor: {
    display: 'inline-block',
    padding: '3px 8px',
    fontSize: '11px',
    fontWeight: '700',
    borderRadius: '4px',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
  },
  sourceLabel: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '4px',
  },
  leadIdSmall: {
    fontSize: '11px',
    color: '#94a3b8',
    fontFamily: 'monospace',
    marginTop: '2px',
  },
  countBadgePill: {
    display: 'inline-block',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: '600',
    borderRadius: '12px',
    backgroundColor: '#f1f5f9',
    color: '#334155',
  },
  hotPill: {
    display: 'inline-block',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: '700',
    borderRadius: '12px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
  },
  standardPill: {
    display: 'inline-block',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: '500',
    borderRadius: '12px',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
  },
  locationText: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#0f172a',
  },
  dateText: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px',
  },
  statusSubPill: {
    display: 'inline-block',
    padding: '2px 6px',
    fontSize: '10px',
    fontWeight: '700',
    borderRadius: '4px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    marginTop: '3px',
  },
  actionBtnOutline: {
    padding: '6px 14px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },

  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '820px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
  },
  modalHeaderTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  modalLeadNumber: {
    fontSize: '12px',
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#64748b',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 4px 0',
  },
  modalSub: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
  },
  modalHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  popupExportBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '5px 10px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#2563eb',
    backgroundColor: '#ffffff',
    border: '1px solid #bfdbfe',
    borderRadius: '6px',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  closeBtn: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: '#f1f5f9',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#475569',
    cursor: 'pointer',
    marginLeft: '6px',
  },
  modalTabBar: {
    display: 'flex',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    padding: '0 16px',
  },
  modalTabBtn: {
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#64748b',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
  },
  modalTabBtnActive: {
    color: '#2563eb',
    fontWeight: '600',
    borderBottom: '2px solid #2563eb',
    backgroundColor: '#ffffff',
  },
  modalBody: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1,
  },
  sectionHeading: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 12px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  dossierGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px',
    backgroundColor: '#f8fafc',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  dossierItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  dossierLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  dossierValue: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#0f172a',
  },
  enquiryCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px',
  },
  enquiryMeta: {
    display: 'flex',
    gap: '16px',
    fontSize: '12px',
    color: '#475569',
    paddingBottom: '10px',
    borderBottom: '1px solid #f1f5f9',
  },
  enquirySubjectText: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
    marginTop: '2px',
  },
  enquiryMessageBox: {
    marginTop: '4px',
    padding: '12px 14px',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    fontSize: '13px',
    color: '#334155',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
  },
  timelineList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    borderLeft: '2px solid #e2e8f0',
    paddingLeft: '16px',
    marginLeft: '6px',
  },
  timelineItem: {
    position: 'relative',
  },
  timelineBullet: {
    position: 'absolute',
    left: '-22px',
    top: '4px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    border: '2px solid #ffffff',
  },
  timelineContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  timelineDate: {
    fontSize: '11px',
    color: '#64748b',
  },
  timelineSubject: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#0f172a',
  },
  timelineMsg: {
    fontSize: '12px',
    color: '#475569',
  },
  modalStatsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '16px',
  },
  modalStatCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center',
  },
  modalStatVal: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#0f172a',
  },
  modalStatLbl: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px',
  },
  subTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
  },
  subTh: {
    backgroundColor: '#f8fafc',
    padding: '8px 10px',
    fontWeight: '600',
    color: '#475569',
    borderBottom: '1px solid #e2e8f0',
    textAlign: 'left',
  },
  subTd: {
    padding: '10px',
    borderBottom: '1px solid #f1f5f9',
    color: '#1e293b',
  },
  subEmpty: {
    padding: '24px',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    color: '#64748b',
    fontSize: '13px',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 24px',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
};

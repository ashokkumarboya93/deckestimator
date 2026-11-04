// =============================================
// Deck Estimator — Centralized Admin Dashboard Page (Phase 10)
// =============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/adminApi';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'decks' | 'estimates' | 'analyses' | 'settings' | 'audit' | 'reports'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // --- Overview State ---
  const [summary, setSummary] = useState(null);
  const [activities, setActivities] = useState([]);

  // --- Users State ---
  const [users, setUsers] = useState([]);
  const [userPagination, setUserPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editUserForm, setEditUserForm] = useState({ fullName: '', phone: '', role: '', accountStatus: '', reason: '' });
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({ fullName: '', email: '', password: '', phone: '', role: 'customer' });

  // --- Decks Oversight State ---
  const [decks, setDecks] = useState([]);
  const [deckPagination, setDeckPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // --- Estimates Oversight State ---
  const [estimates, setEstimates] = useState([]);
  const [estimatePagination, setEstimatePagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // --- AI Analyses State ---
  const [analyses, setAnalyses] = useState([]);
  const [analysisPagination, setAnalysisPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // --- Settings State ---
  const [settings, setSettings] = useState([]);
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  const [newSetting, setNewSetting] = useState({
    key: '',
    category: 'GENERAL',
    label: '',
    description: '',
    valueType: 'STRING',
    value: '',
    isPublic: false,
  });
  const [isEditSettingModalOpen, setIsEditSettingModalOpen] = useState(false);
  const [editSettingForm, setEditSettingForm] = useState({
    key: '',
    label: '',
    value: '',
    valueType: 'STRING',
  });

  // --- Audit Logs State ---
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditPagination, setAuditPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // --- Reports State ---
  const [reportType, setReportType] = useState('users');
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    if (activeTab === 'overview') {
      loadOverviewData();
    } else if (activeTab === 'users') {
      loadUsers(1);
    } else if (activeTab === 'decks') {
      loadDecks(1);
    } else if (activeTab === 'estimates') {
      loadEstimates(1);
    } else if (activeTab === 'analyses') {
      loadAnalyses(1);
    } else if (activeTab === 'settings') {
      loadSettings();
    } else if (activeTab === 'audit') {
      loadAuditLogs(1);
    } else if (activeTab === 'reports') {
      loadReport(reportType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Load Overview
  async function loadOverviewData() {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, actRes] = await Promise.all([
        adminApi.getDashboardSummary(),
        adminApi.getRecentActivity(10),
      ]);
      setSummary(sumRes?.data || sumRes);
      setActivities(Array.isArray(actRes?.data) ? actRes.data : Array.isArray(actRes) ? actRes : []);
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to load dashboard overview.');
    } finally {
      setLoading(false);
    }
  }

  // Load Users
  async function loadUsers(page = 1) {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getUsers({
        page,
        limit: 15,
        role: userRoleFilter || undefined,
        accountStatus: userStatusFilter || undefined,
        search: userSearch || undefined,
      });
      setUsers(data.data || []);
      setUserPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }

  // Handle Edit User
  function openEditUser(user) {
    setSelectedUser(user);
    setEditUserForm({
      fullName: user.fullName || '',
      phone: user.phone || '',
      role: user.role || 'customer',
      accountStatus: user.accountStatus || 'active',
      reason: '',
    });
    setIsEditUserModalOpen(true);
  }

  async function handleSaveUser(e) {
    e.preventDefault();
    if (!selectedUser) return;
    setLoading(true);
    try {
      await adminApi.updateUser(selectedUser._id || selectedUser.id, {
        fullName: editUserForm.fullName,
        phone: editUserForm.phone,
        role: editUserForm.role,
        accountStatus: editUserForm.accountStatus,
        statusReason: editUserForm.reason,
      });
      setSuccessMsg(`User ${editUserForm.fullName} updated successfully.`);
      setIsEditUserModalOpen(false);
      loadUsers(userPagination.page);
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to update user.');
    } finally {
      setLoading(false);
    }
  }

  // Handle Create User
  async function handleCreateUser(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await adminApi.createUser(createUserForm);
      setSuccessMsg('User successfully created.');
      setIsCreateUserModalOpen(false);
      setCreateUserForm({ fullName: '', email: '', password: '', phone: '', role: 'customer' });
      loadUsers(1);
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  }

  // Load Decks
  async function loadDecks(page = 1) {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getDecks({ page, limit: 15 });
      setDecks(data.data || []);
      setDeckPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to load decks.');
    } finally {
      setLoading(false);
    }
  }

  // Load Estimates
  async function loadEstimates(page = 1) {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getEstimates({ page, limit: 15 });
      setEstimates(data.data || []);
      setEstimatePagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to load estimates.');
    } finally {
      setLoading(false);
    }
  }

  // Load AI Analyses
  async function loadAnalyses(page = 1) {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAnalyses({ page, limit: 15 });
      setAnalyses(data.data || []);
      setAnalysisPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to load AI analyses.');
    } finally {
      setLoading(false);
    }
  }

  // Load Settings
  async function loadSettings() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getSettings();
      setSettings(data.data || []);
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  }

  // Create Setting
  async function handleCreateSetting(e) {
    e.preventDefault();
    setLoading(true);
    try {
      let parsedValue = newSetting.value;
      if (newSetting.valueType === 'NUMBER') parsedValue = Number(newSetting.value);
      if (newSetting.valueType === 'BOOLEAN') parsedValue = newSetting.value === 'true' || newSetting.value === true;
      if (newSetting.valueType === 'OBJECT' || newSetting.valueType === 'ARRAY') parsedValue = JSON.parse(newSetting.value);

      await adminApi.createSetting({
        key: newSetting.key.toUpperCase(),
        category: newSetting.category,
        label: newSetting.label,
        description: newSetting.description,
        valueType: newSetting.valueType,
        value: parsedValue,
        isPublic: newSetting.isPublic,
      });

      setSuccessMsg('Setting created successfully.');
      setIsSettingModalOpen(false);
      setNewSetting({ key: '', category: 'GENERAL', label: '', description: '', valueType: 'STRING', value: '', isPublic: false });
      loadSettings();
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to create setting.');
    } finally {
      setLoading(false);
    }
  }

  // Toggle Setting Status (Activate / Deactivate)
  async function handleToggleSettingStatus(setting) {
    setLoading(true);
    try {
      await adminApi.updateSetting(setting.key, { isActive: !setting.isActive });
      setSuccessMsg(`Setting ${setting.key} ${setting.isActive ? 'deactivated' : 'activated'} successfully.`);
      loadSettings();
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to update setting status.');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenEditSetting(setting) {
    setEditSettingForm({
      key: setting.key,
      label: setting.label || '',
      value: typeof setting.value === 'object' ? JSON.stringify(setting.value) : String(setting.value),
      valueType: setting.valueType || 'STRING',
    });
    setIsEditSettingModalOpen(true);
  }

  async function handleSaveSetting(e) {
    e.preventDefault();
    if (!editSettingForm.key) return;
    setLoading(true);
    try {
      let parsedValue = editSettingForm.value;
      if (editSettingForm.valueType === 'NUMBER') parsedValue = Number(editSettingForm.value);
      if (editSettingForm.valueType === 'BOOLEAN') parsedValue = editSettingForm.value === 'true' || editSettingForm.value === true;
      if (editSettingForm.valueType === 'OBJECT' || editSettingForm.valueType === 'ARRAY' || editSettingForm.valueType === 'JSON') {
        if (typeof editSettingForm.value === 'string') {
          parsedValue = JSON.parse(editSettingForm.value);
        }
      }
      await adminApi.updateSetting(editSettingForm.key, { value: parsedValue, label: editSettingForm.label });
      setSuccessMsg(`Setting ${editSettingForm.key} updated successfully.`);
      setIsEditSettingModalOpen(false);
      loadSettings();
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to update setting.');
    } finally {
      setLoading(false);
    }
  }

  // Load Audit Logs
  async function loadAuditLogs(page = 1) {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAuditLogs({ page, limit: 20 });
      setAuditLogs(data.data || []);
      setAuditPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  }

  // Load Reports
  async function loadReport(type) {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getReport(type);
      setReportData(data.data);
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Failed to load report.');
    } finally {
      setLoading(false);
    }
  }

  // Download CSV
  async function handleDownloadCsv() {
    try {
      const blob = await adminApi.downloadReportCsv(reportType);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}-report-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err?.message || 'Failed to export CSV report.');
    }
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Administrative Operations Hub</h1>
          <p style={styles.subtitle}>Platform-wide governance, user management, deck & estimate oversight, system configurations, and audit telemetry.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabBar}>
        <button
          type="button"
          onClick={() =>setActiveTab('overview')}
          style={{ ...styles.tabBtn, borderBottom: activeTab === 'overview' ? '3px solid #1d4ed8' : '3px solid transparent', color: activeTab === 'overview' ? '#1d4ed8' : '#64748b', fontWeight: activeTab === 'overview' ? '700' : '500' }}
        >Operations Overview
        </button>
        <button
          type="button"
          onClick={() =>setActiveTab('users')}
          style={{ ...styles.tabBtn, borderBottom: activeTab === 'users' ? '3px solid #1d4ed8' : '3px solid transparent', color: activeTab === 'users' ? '#1d4ed8' : '#64748b', fontWeight: activeTab === 'users' ? '700' : '500' }}
        >User Directory
        </button>
        <button
          type="button"
          onClick={() =>setActiveTab('decks')}
          style={{ ...styles.tabBtn, borderBottom: activeTab === 'decks' ? '3px solid #1d4ed8' : '3px solid transparent', color: activeTab === 'decks' ? '#1d4ed8' : '#64748b', fontWeight: activeTab === 'decks' ? '700' : '500' }}
        >Deck Records
        </button>
        <button
          type="button"
          onClick={() =>setActiveTab('estimates')}
          style={{ ...styles.tabBtn, borderBottom: activeTab === 'estimates' ? '3px solid #1d4ed8' : '3px solid transparent', color: activeTab === 'estimates' ? '#1d4ed8' : '#64748b', fontWeight: activeTab === 'estimates' ? '700' : '500' }}
        >Estimates Oversight
        </button>
        <button
          type="button"
          onClick={() =>setActiveTab('analyses')}
          style={{ ...styles.tabBtn, borderBottom: activeTab === 'analyses' ? '3px solid #1d4ed8' : '3px solid transparent', color: activeTab === 'analyses' ? '#1d4ed8' : '#64748b', fontWeight: activeTab === 'analyses' ? '700' : '500' }}
        >AI Condition Telemetry
        </button>
        <button
          type="button"
          onClick={() =>setActiveTab('settings')}
          style={{ ...styles.tabBtn, borderBottom: activeTab === 'settings' ? '3px solid #1d4ed8' : '3px solid transparent', color: activeTab === 'settings' ? '#1d4ed8' : '#64748b', fontWeight: activeTab === 'settings' ? '700' : '500' }}
        >Platform Settings
        </button>
        <button
          type="button"
          onClick={() =>setActiveTab('audit')}
          style={{ ...styles.tabBtn, borderBottom: activeTab === 'audit' ? '3px solid #1d4ed8' : '3px solid transparent', color: activeTab === 'audit' ? '#1d4ed8' : '#64748b', fontWeight: activeTab === 'audit' ? '700' : '500' }}
        >Audit Logs
        </button>
        <button
          type="button"
          onClick={() =>setActiveTab('reports')}
          style={{ ...styles.tabBtn, borderBottom: activeTab === 'reports' ? '3px solid #1d4ed8' : '3px solid transparent', color: activeTab === 'reports' ? '#1d4ed8' : '#64748b', fontWeight: activeTab === 'reports' ? '700' : '500' }}
        >Reports & CSV
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div style={styles.successBanner}>
          <span>{successMsg}</span>
          <button type="button" onClick={() =>setSuccessMsg(null)} style={styles.closeAlertBtn}></button>
        </div>
      )}
      {error && (
        <div style={styles.errorBanner}>
          <span>{error}</span>
          <button type="button" onClick={() =>setError(null)} style={styles.closeAlertBtn}></button>
        </div>
      )}

            {/* TAB 1: OVERVIEW & RICH VISUALIZATIONS */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {summary ? (
            <>
              {/* 1. OPERATIONAL PLATFORM STATUS BAR */}
              <div style={styles.statusBarCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={styles.pulseDot} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                      DeckPro Platform Operations Live
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                      MongoDB Atlas Connected • Real-time telemetry synchronized • All services operational
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={styles.liveSyncBadge}>Live Sync: Active</span>
                  <button
                    type="button"
                    onClick={loadOverviewData}
                    style={styles.refreshBtn}
                    title="Refresh Live Metrics"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10" />
                      <polyline points="1 20 1 14 7 14" />
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* 2. TOP 5 EXECUTIVE KPI CARDS */}
              <div style={styles.kpiGrid}>
                {/* KPI 1: Platform Users */}
                <div style={styles.richKpiCard}>
                  <div style={styles.kpiTopRow}>
                    <span style={styles.kpiLabel}>Total Platform Users</span>
                    <div style={{ ...styles.kpiIconBox, backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                  </div>
                  <div style={styles.kpiBigNumber}>{summary.users?.totalUsers || 0}</div>
                  <div style={styles.kpiSubRow}>
                    <span style={styles.pillCustomer}>{summary.users?.totalCustomers || 0} Customers</span>
                    <span style={styles.pillContractor}>{summary.users?.totalContractors || 0} Pros</span>
                  </div>
                  <div style={styles.progressBarWrap}>
                    <div style={{ ...styles.progressBarFill, width: `${Math.round(((summary.users?.activeUsers || 0) / (summary.users?.totalUsers || 1)) * 100)}%`, backgroundColor: '#1d4ed8' }} />
                  </div>
                  <span style={styles.kpiFootnote}>{summary.users?.activeUsers || 0} Active accounts ({Math.round(((summary.users?.activeUsers || 0) / (summary.users?.totalUsers || 1)) * 100)}%)</span>
                </div>

                {/* KPI 2: Contractor Compliance */}
                <div style={styles.richKpiCard}>
                  <div style={styles.kpiTopRow}>
                    <span style={styles.kpiLabel}>Contractor Network</span>
                    <div style={{ ...styles.kpiIconBox, backgroundColor: '#ecfdf5', color: '#15803d' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                  </div>
                  <div style={{ ...styles.kpiBigNumber, color: '#15803d' }}>
                    {summary.contractors?.approved || 0}
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginLeft: '6px' }}>/ {summary.contractors?.totalProfiles || 0}</span>
                  </div>
                  <div style={styles.kpiSubRow}>
                    <span style={styles.pillSuccess}>Approved & Active</span>
                    {summary.contractors?.pending > 0 && (
                      <span style={styles.pillWarning}>{summary.contractors.pending} Pending</span>
                    )}
                  </div>
                  <div style={styles.progressBarWrap}>
                    <div style={{ ...styles.progressBarFill, width: `${Math.round(((summary.contractors?.approved || 0) / (summary.contractors?.totalProfiles || 1)) * 100)}%`, backgroundColor: '#15803d' }} />
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/contractor-verifications')}
                    style={styles.cardActionBtn}
                  >
                    <span>Manage Verifications &rarr;</span>
                  </button>
                </div>

                {/* KPI 3: Commercial Estimates & Pipeline */}
                <div style={styles.richKpiCard}>
                  <div style={styles.kpiTopRow}>
                    <span style={styles.kpiLabel}>Gross Pipeline Volume</span>
                    <div style={{ ...styles.kpiIconBox, backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                  </div>
                  <div style={styles.kpiBigNumber}>${Math.round(summary.estimates?.totalVolume || 0).toLocaleString()}</div>
                  <div style={styles.kpiSubRow}>
                    <span style={styles.pillNeutral}>{summary.estimates?.totalEstimates || 0} Total Estimates</span>
                    <span style={styles.pillSuccess}>${Math.round(summary.estimates?.completedRevenue || 0).toLocaleString()} Realized</span>
                  </div>
                  <div style={styles.progressBarWrap}>
                    <div style={{ ...styles.progressBarFill, width: `${Math.round(((summary.estimates?.completedRevenue || 0) / (summary.estimates?.totalVolume || 1)) * 100)}%`, backgroundColor: '#3b82f6' }} />
                  </div>
                  <span style={styles.kpiFootnote}>Average quote: ${Math.round((summary.estimates?.totalVolume || 0) / (summary.estimates?.totalEstimates || 1)).toLocaleString()}</span>
                </div>

                {/* KPI 4: Customer Leads Hub */}
                <div style={styles.richKpiCard}>
                  <div style={styles.kpiTopRow}>
                    <span style={styles.kpiLabel}>Customer Inquiries</span>
                    <div style={{ ...styles.kpiIconBox, backgroundColor: '#fef3c7', color: '#b45309' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div style={styles.kpiBigNumber}>{summary.leads?.totalLeads || 0}</div>
                  <div style={styles.kpiSubRow}>
                    <span style={styles.pillWarning}>{summary.leads?.newLeads || 0} New Unassigned</span>
                    <span style={styles.pillSuccess}>{summary.leads?.converted || 0} Converted</span>
                  </div>
                  <div style={styles.progressBarWrap}>
                    <div style={{ ...styles.progressBarFill, width: `${Math.round(((summary.leads?.converted || 0) / (summary.leads?.totalLeads || 1)) * 100)}%`, backgroundColor: '#f59e0b' }} />
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/leads')}
                    style={styles.cardActionBtn}
                  >
                    <span>Assign Leads &rarr;</span>
                  </button>
                </div>

                {/* KPI 5: Financials & Commissions */}
                <div style={styles.richKpiCard}>
                  <div style={styles.kpiTopRow}>
                    <span style={styles.kpiLabel}>Settled Commissions</span>
                    <div style={{ ...styles.kpiIconBox, backgroundColor: '#f8fafc', color: '#1d4ed8' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                    </div>
                  </div>
                  <div style={{ ...styles.kpiBigNumber, color: '#0f172a' }}>
                    ${Math.round(summary.financials?.paidAmount || 0).toLocaleString()}
                  </div>
                  <div style={styles.kpiSubRow}>
                    <span style={styles.pillNeutral}>{summary.financials?.paidCount || 0} Payouts Paid</span>
                    <span style={styles.pillAlert}>${Math.round(summary.financials?.pendingPayableAmount || 0).toLocaleString()} Payable</span>
                  </div>
                  <div style={styles.progressBarWrap}>
                    <div style={{ ...styles.progressBarFill, width: `${Math.round(((summary.financials?.paidAmount || 0) / (summary.financials?.totalAmountCalculated || 1)) * 100)}%`, backgroundColor: '#1d4ed8' }} />
                  </div>
                  <span style={styles.kpiFootnote}>Total Accrued: ${Math.round(summary.financials?.totalAmountCalculated || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* 3. VISUALIZATIONS SECTION (2-COLUMN GRID) */}
              <div style={styles.visualsGrid}>
                {/* Visual 1: Estimates Pipeline Breakdown */}
                <div style={styles.visualCard}>
                  <div style={styles.visualHeader}>
                    <div>
                      <h4 style={styles.visualTitle}>Estimate Pipeline & Revenue Breakdown</h4>
                      <p style={styles.visualSubtitle}>Live distribution across draft, submitted, and completed estimates</p>
                    </div>
                    <span style={styles.visualBadge}>{summary.estimates?.totalEstimates || 0} Total Quotes</span>
                  </div>

                  {/* Horizontal Stacked Bar */}
                  <div style={styles.stackedBarWrap}>
                    <div
                      style={{
                        ...styles.stackedSegment,
                        width: `${Math.max(4, Math.round(((summary.estimates?.draft || 0) / (summary.estimates?.totalEstimates || 1)) * 100))}%`,
                        backgroundColor: '#94a3b8',
                      }}
                      title={`Drafts: ${summary.estimates?.draft || 0}`}
                    />
                    <div
                      style={{
                        ...styles.stackedSegment,
                        width: `${Math.max(4, Math.round(((summary.estimates?.submitted || 0) / (summary.estimates?.totalEstimates || 1)) * 100))}%`,
                        backgroundColor: '#3b82f6',
                      }}
                      title={`Submitted: ${summary.estimates?.submitted || 0}`}
                    />
                    <div
                      style={{
                        ...styles.stackedSegment,
                        width: `${Math.max(4, Math.round(((summary.estimates?.completed || 0) / (summary.estimates?.totalEstimates || 1)) * 100))}%`,
                        backgroundColor: '#15803d',
                      }}
                      title={`Completed: ${summary.estimates?.completed || 0}`}
                    />
                  </div>

                  {/* Legend / Stats Row */}
                  <div style={styles.legendRow}>
                    <div style={styles.legendItem}>
                      <div style={{ ...styles.legendDot, backgroundColor: '#94a3b8' }} />
                      <div>
                        <span style={styles.legendName}>Draft Quotes</span>
                        <strong style={styles.legendCount}>{summary.estimates?.draft || 0}</strong>
                      </div>
                    </div>

                    <div style={styles.legendItem}>
                      <div style={{ ...styles.legendDot, backgroundColor: '#3b82f6' }} />
                      <div>
                        <span style={styles.legendName}>Submitted Quotes</span>
                        <strong style={styles.legendCount}>{summary.estimates?.submitted || 0}</strong>
                      </div>
                    </div>

                    <div style={styles.legendItem}>
                      <div style={{ ...styles.legendDot, backgroundColor: '#15803d' }} />
                      <div>
                        <span style={styles.legendName}>Completed & Invoiced</span>
                        <strong style={styles.legendCount}>{summary.estimates?.completed || 0}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Summary Strip */}
                  <div style={styles.metricsSummaryStrip}>
                    <div style={styles.metricStripBox}>
                      <span style={styles.metricStripLabel}>Total Pipeline Value</span>
                      <strong style={styles.metricStripVal}>${Math.round(summary.estimates?.totalVolume || 0).toLocaleString()}</strong>
                    </div>
                    <div style={styles.metricStripBox}>
                      <span style={styles.metricStripLabel}>Realized Revenue</span>
                      <strong style={{ ...styles.metricStripVal, color: '#15803d' }}>${Math.round(summary.estimates?.completedRevenue || 0).toLocaleString()}</strong>
                    </div>
                    <div style={styles.metricStripBox}>
                      <span style={styles.metricStripLabel}>Partner Discounts</span>
                      <strong style={styles.metricStripVal}>${Number(summary.estimates?.totalDiscountGranted || 0).toFixed(2)}</strong>
                    </div>
                  </div>
                </div>

                {/* Visual 2: Demographics & Contractor Verification Gauge */}
                <div style={styles.visualCard}>
                  <div style={styles.visualHeader}>
                    <div>
                      <h4 style={styles.visualTitle}>User Demographics & Compliance</h4>
                      <p style={styles.visualSubtitle}>Account segmentation & contractor vetting progress</p>
                    </div>
                    <span style={styles.visualBadge}>{summary.decks?.totalAreaSqFt?.toLocaleString() || 0} Sq Ft Managed</span>
                  </div>

                  {/* Demographic Bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '14px 0' }}>
                    {/* Homeowners */}
                    <div>
                      <div style={styles.barLabelRow}>
                        <span style={styles.barLabel}>Homeowners (Customers)</span>
                        <span style={styles.barVal}>{summary.users?.totalCustomers || 0} ({Math.round(((summary.users?.totalCustomers || 0) / (summary.users?.totalUsers || 1)) * 100)}%)</span>
                      </div>
                      <div style={styles.barBg}>
                        <div style={{ ...styles.barFill, width: `${Math.round(((summary.users?.totalCustomers || 0) / (summary.users?.totalUsers || 1)) * 100)}%`, backgroundColor: '#1d4ed8' }} />
                      </div>
                    </div>

                    {/* Contractors */}
                    <div>
                      <div style={styles.barLabelRow}>
                        <span style={styles.barLabel}>Deck Contractors (Pros)</span>
                        <span style={styles.barVal}>{summary.users?.totalContractors || 0} ({Math.round(((summary.users?.totalContractors || 0) / (summary.users?.totalUsers || 1)) * 100)}%)</span>
                      </div>
                      <div style={styles.barBg}>
                        <div style={{ ...styles.barFill, width: `${Math.round(((summary.users?.totalContractors || 0) / (summary.users?.totalUsers || 1)) * 100)}%`, backgroundColor: '#0284c7' }} />
                      </div>
                    </div>

                    {/* System Admins */}
                    <div>
                      <div style={styles.barLabelRow}>
                        <span style={styles.barLabel}>Platform Administrators</span>
                        <span style={styles.barVal}>{summary.users?.totalAdmins || 0} ({Math.round(((summary.users?.totalAdmins || 0) / (summary.users?.totalUsers || 1)) * 100)}%)</span>
                      </div>
                      <div style={styles.barBg}>
                        <div style={{ ...styles.barFill, width: `${Math.round(((summary.users?.totalAdmins || 0) / (summary.users?.totalUsers || 1)) * 100)}%`, backgroundColor: '#64748b' }} />
                      </div>
                    </div>
                  </div>

                  {/* Contractor Compliance Gauge Bar */}
                  <div style={styles.contractorGaugeBox}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>Contractor Verification Status</span>
                      <span style={{ fontSize: '12px', color: '#15803d', fontWeight: '700' }}>
                        {Math.round(((summary.contractors?.approved || 0) / (summary.contractors?.totalProfiles || 1)) * 100)}% Verified
                      </span>
                    </div>
                    <div style={styles.stackedBarWrap}>
                      <div
                        style={{
                          ...styles.stackedSegment,
                          width: `${Math.max(4, Math.round(((summary.contractors?.approved || 0) / (summary.contractors?.totalProfiles || 1)) * 100))}%`,
                          backgroundColor: '#15803d',
                        }}
                        title={`Approved: ${summary.contractors?.approved || 0}`}
                      />
                      <div
                        style={{
                          ...styles.stackedSegment,
                          width: `${Math.max(4, Math.round(((summary.contractors?.pending || 0) / (summary.contractors?.totalProfiles || 1)) * 100))}%`,
                          backgroundColor: '#f59e0b',
                        }}
                        title={`Pending: ${summary.contractors?.pending || 0}`}
                      />
                      <div
                        style={{
                          ...styles.stackedSegment,
                          width: `${Math.max(4, Math.round(((summary.contractors?.rejected || 0) / (summary.contractors?.totalProfiles || 1)) * 100))}%`,
                          backgroundColor: '#ef4444',
                        }}
                        title={`Rejected: ${summary.contractors?.rejected || 0}`}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                      <span>{summary.contractors?.approved || 0} Approved</span>
                      <span>{summary.contractors?.pending || 0} Awaiting Review</span>
                      <span>{summary.contractors?.rejected || 0} Ineligible</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. QUICK ACTION COMMAND CENTER (4 DIRECT CARDS) */}
              <div style={styles.commandGrid}>
                <div style={styles.commandCard} onClick={() => navigate('/admin/contractor-verifications')}>
                  <div style={{ ...styles.commandIconBox, backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h5 style={styles.commandTitle}>Verify Contractors</h5>
                    <p style={styles.commandDesc}>Review licenses &amp; approve pending contractor profiles</p>
                  </div>
                  {summary.contractors?.pending > 0 && (
                    <span style={styles.commandBadge}>{summary.contractors.pending} Pending</span>
                  )}
                </div>

                <div style={styles.commandCard} onClick={() => navigate('/admin/leads')}>
                  <div style={{ ...styles.commandIconBox, backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h5 style={styles.commandTitle}>Triage Customer Leads</h5>
                    <p style={styles.commandDesc}>Assign new customer project inquiries to approved pros</p>
                  </div>
                  {summary.leads?.newLeads > 0 && (
                    <span style={styles.commandBadge}>{summary.leads.newLeads} New</span>
                  )}
                </div>

                <div style={styles.commandCard} onClick={() => navigate('/admin/catalog')}>
                  <div style={{ ...styles.commandIconBox, backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                      <polyline points="2 12 12 17 22 12" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h5 style={styles.commandTitle}>Catalog &amp; Pricing</h5>
                    <p style={styles.commandDesc}>Configure materials, hourly labor rates, and formula rules</p>
                  </div>
                  <span style={styles.commandArrow}>&rarr;</span>
                </div>

                <div style={styles.commandCard} onClick={() => navigate('/admin/commissions')}>
                  <div style={{ ...styles.commandIconBox, backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h5 style={styles.commandTitle}>Commissions &amp; Payouts</h5>
                    <p style={styles.commandDesc}>Approve earnings and record settlements for contractors</p>
                  </div>
                  <span style={styles.commandArrow}>&rarr;</span>
                </div>
              </div>

              {/* 5. RECENT OPERATIONAL AUDIT TIMELINE */}
              <div style={styles.activityCard}>
                <div style={styles.activityHeader}>
                  <div>
                    <h4 style={styles.visualTitle}>Recent Operational Activity Stream</h4>
                    <p style={styles.visualSubtitle}>Real-time system audit logs and administrative events</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('audit')}
                    style={styles.textActionLink}
                  >
                    View All Audit Logs &rarr;
                  </button>
                </div>

                {activities.length === 0 ? (
                  <div style={styles.emptyBox}>No recent audit records found.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activities.map((act) => (
                      <div key={act._id || act.id} style={styles.activityRow}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={styles.activityAvatar}>
                            {(act.performedBy?.fullName || act.performedBy?.email || 'SYS')[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={styles.activityActionTag}>{act.action}</span>
                              <span style={styles.activityEntity}>on {act.entityType}</span>
                            </div>
                            <span style={styles.activityAuthor}>
                              By {act.performedBy?.fullName || act.performedBy?.email || 'System'} ({act.performedBy?.role || 'Admin'})
                            </span>
                          </div>
                        </div>

                        <span style={styles.activityDate}>
                          {new Date(act.createdAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={styles.emptyBox}>
              <div style={styles.spinner} />
              <p style={{ marginTop: '12px', fontSize: '14px', color: '#64748b' }}>Loading overview telemetry from MongoDB Atlas...</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: USERS */}
      {activeTab === 'users' && (
        <div>
          <div style={styles.controlsRow}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={userSearch}
                onChange={(e) =>setUserSearch(e.target.value)}
                style={styles.input}
              />
              <select
                value={userRoleFilter}
                onChange={(e) =>setUserRoleFilter(e.target.value)}
                style={styles.select}
              >
                <option value="">All Roles</option>
                <option value="customer">Customer</option>
                <option value="contractor">Contractor</option>
                <option value="admin">Admin</option>
              </select>
              <select
                value={userStatusFilter}
                onChange={(e) =>setUserStatusFilter(e.target.value)}
                style={styles.select}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="deactivated">Deactivated</option>
              </select>
              <button type="button" onClick={() =>loadUsers(1)} style={styles.secondaryBtn}>Filter
              </button>
            </div>
            <button type="button" onClick={() =>setIsCreateUserModalOpen(true)} style={styles.primaryBtn}>
              + Create User
            </button>
          </div>

          <div style={styles.tableCard}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Full Name & Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Registered</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id || u.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong>{u.fullName}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{u.email}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: '700' }}>{u.role}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: u.accountStatus === 'active' ? '#dcfce7' : '#fee2e2',
                        color: u.accountStatus === 'active' ? '#15803d' : '#b91c1c',
                      }}>
                        {u.accountStatus?.toUpperCase()}
                      </span>
                    </td>
                    <td style={styles.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      <button type="button" onClick={() =>openEditUser(u)} style={styles.smallActionBtn}>Edit / Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DECKS */}
      {activeTab === 'decks' && (
        <div>
          <div style={styles.tableCard}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Deck Project</th>
                  <th style={styles.th}>Owner</th>
                  <th style={styles.th}>Area (Sq Ft)</th>
                  <th style={styles.th}>Surface Material</th>
                  <th style={styles.th}>Created</th>
                </tr>
              </thead>
              <tbody>
                {decks.map((d) => (
                  <tr key={d._id || d.id} style={styles.tr}>
                    <td style={styles.td}><strong>{d.projectName || d.name || 'Deck Project'}</strong></td>
                    <td style={styles.td}>{d.ownerId?.fullName || d.customerId?.fullName || d.contractorId?.fullName || 'N/A'}</td>
                    <td style={styles.td}>{d.dimensions?.area || d.totalAreaSqFt || 0} sq ft</td>
                    <td style={styles.td}>{d.surfaceDetails?.material || d.surfaceMaterial || d.surfaceType || 'Wood'}</td>
                    <td style={styles.td}>{new Date(d.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={styles.paginationRow}>
              <span>Showing {decks.length} of {deckPagination.total} deck projects</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  disabled={deckPagination.page <= 1}
                  onClick={() =>loadDecks(deckPagination.page - 1)}
                  style={styles.pageBtn}
                >Previous
                </button>
                <span style={{ fontSize: '13px', alignSelf: 'center' }}>Page {deckPagination.page} of {deckPagination.totalPages || 1}
                </span>
                <button
                  type="button"
                  disabled={deckPagination.page >= deckPagination.totalPages}
                  onClick={() =>loadDecks(deckPagination.page + 1)}
                  style={styles.pageBtn}
                >Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ESTIMATES */}
      {activeTab === 'estimates' && (
        <div>
          <div style={styles.tableCard}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Estimate #</th>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Deck</th>
                  <th style={styles.th}>Total Amount</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {estimates.map((e) => (
                  <tr key={e._id || e.id} style={styles.tr}>
                    <td style={styles.td}><strong>{e.estimateNumber || 'N/A'}</strong></td>
                    <td style={styles.td}>{e.ownerId?.fullName || e.customerId?.fullName || e.createdFor?.fullName || 'N/A'}</td>
                    <td style={styles.td}>{e.deckDetails?.projectName || e.deckId?.projectName || e.deckId?.name || 'Deck'}</td>
                    <td style={styles.td}><strong>${Number(e.totalAmount || 0).toFixed(2)}</strong></td>
                    <td style={styles.td}>{e.estimateStatus || e.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={styles.paginationRow}>
              <span>Showing {estimates.length} of {estimatePagination.total} estimates</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  disabled={estimatePagination.page <= 1}
                  onClick={() =>loadEstimates(estimatePagination.page - 1)}
                  style={styles.pageBtn}
                >Previous
                </button>
                <span style={{ fontSize: '13px', alignSelf: 'center' }}>Page {estimatePagination.page} of {estimatePagination.totalPages || 1}
                </span>
                <button
                  type="button"
                  disabled={estimatePagination.page >= estimatePagination.totalPages}
                  onClick={() =>loadEstimates(estimatePagination.page + 1)}
                  style={styles.pageBtn}
                >Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AI ANALYSES */}
      {activeTab === 'analyses' && (
        <div>
          <div style={styles.tableCard}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Analysis ID</th>
                  <th style={styles.th}>Deck</th>
                  <th style={styles.th}>Overall Level</th>
                  <th style={styles.th}>Manual Review</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {analyses.map((a) => (
                  <tr key={a._id || a.id} style={styles.tr}>
                    <td style={styles.td}><code>{a._id}</code></td>
                    <td style={styles.td}>{a.deckId?.name || 'Deck'}</td>
                    <td style={styles.td}>Level {a.conditionAssessment?.overallConditionLevel || 'N/A'}</td>
                    <td style={styles.td}>{a.requiresManualReview ? ' Flagged' : 'Normal'}</td>
                    <td style={styles.td}>{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={styles.paginationRow}>
              <span>Showing {analyses.length} of {analysisPagination.total} analyses</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  disabled={analysisPagination.page <= 1}
                  onClick={() =>loadAnalyses(analysisPagination.page - 1)}
                  style={styles.pageBtn}
                >Previous
                </button>
                <span style={{ fontSize: '13px', alignSelf: 'center' }}>Page {analysisPagination.page} of {analysisPagination.totalPages || 1}
                </span>
                <button
                  type="button"
                  disabled={analysisPagination.page >= analysisPagination.totalPages}
                  onClick={() =>loadAnalyses(analysisPagination.page + 1)}
                  style={styles.pageBtn}
                >Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SETTINGS */}
      {activeTab === 'settings' && (
        <div>
          <div style={{ ...styles.controlsRow, justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Platform Configuration Engine</h3>
            <button type="button" onClick={() =>setIsSettingModalOpen(true)} style={styles.primaryBtn}>
              + Add Platform Setting
            </button>
          </div>
          <div style={styles.tableCard}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Key & Label</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Value</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {settings.map((s) => (
                  <tr key={s._id || s.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong>{s.key}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{s.label}</div>
                    </td>
                    <td style={styles.td}>{s.category}</td>
                    <td style={styles.td}><code>{s.valueType}</code></td>
                    <td style={styles.td}><strong>{typeof s.value === 'object' ? JSON.stringify(s.value) : String(s.value)}</strong></td>
                    <td style={styles.td}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: s.isActive ? '#dcfce7' : '#fee2e2',
                        color: s.isActive ? '#15803d' : '#b91c1c',
                      }}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        type="button"
                        onClick={() =>handleToggleSettingStatus(s)}
                        style={{
                          ...styles.smallActionBtn,
                          backgroundColor: s.isActive ? '#fee2e2' : '#dcfce7',
                          color: s.isActive ? '#b91c1c' : '#15803d',
                          marginRight: '6px',
                        }}
                      >
                        {s.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>handleOpenEditSetting(s)}
                        style={styles.smallActionBtn}
                      >Edit Value
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div>
          <div style={styles.tableCard}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Timestamp</th>
                  <th style={styles.th}>Actor</th>
                  <th style={styles.th}>Action</th>
                  <th style={styles.th}>Entity</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log._id || log.id} style={styles.tr}>
                    <td style={styles.td}>{new Date(log.createdAt).toLocaleString()}</td>
                    <td style={styles.td}>{log.performedBy?.fullName || 'System'} ({log.performedBy?.role || 'Admin'})</td>
                    <td style={styles.td}><strong>{log.action}</strong></td>
                    <td style={styles.td}><code>{log.entityType}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={styles.paginationRow}>
              <span>Showing {auditLogs.length} of {auditPagination.total} audit logs</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  disabled={auditPagination.page <= 1}
                  onClick={() =>loadAuditLogs(auditPagination.page - 1)}
                  style={styles.pageBtn}
                >Previous
                </button>
                <span style={{ fontSize: '13px', alignSelf: 'center' }}>Page {auditPagination.page} of {auditPagination.totalPages || 1}
                </span>
                <button
                  type="button"
                  disabled={auditPagination.page >= auditPagination.totalPages}
                  onClick={() =>loadAuditLogs(auditPagination.page + 1)}
                  style={styles.pageBtn}
                >Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: REPORTS */}
      {activeTab === 'reports' && (
        <div>
          <div style={styles.controlsRow}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                value={reportType}
                onChange={(e) => {
                  setReportType(e.target.value);
                  loadReport(e.target.value);
                }}
                style={styles.select}
              >
                <option value="users">User Operations Report</option>
                <option value="leads">Lead Conversion Report</option>
                <option value="estimates">Estimates & Revenue Report</option>
                <option value="commissions">Commission Payouts Report</option>
              </select>
              <button type="button" onClick={() =>loadReport(reportType)} style={styles.secondaryBtn}>Refresh
              </button>
            </div>
            <button type="button" onClick={handleDownloadCsv} style={{ ...styles.primaryBtn, backgroundColor: '#15803d' }}>Export CSV
            </button>
          </div>

          {reportData ? (
            <div style={styles.tableCard}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    {reportData.columns.map((col, idx) => (
                      <th key={idx} style={styles.th}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.rows.map((row, rIdx) => (
                    <tr key={rIdx} style={styles.tr}>
                      {row.map((val, cIdx) => (
                        <td key={cIdx} style={styles.td}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={styles.emptyBox}>Loading report data...</div>
          )}
        </div>
      )}

      {/* Modal: Edit User */}
      {isEditUserModalOpen && selectedUser && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3 style={styles.modalTitle}>Edit User Profile: {selectedUser.fullName}</h3>
            <form onSubmit={handleSaveUser}>
              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Full Name:</label>
                <input
                  type="text"
                  required
                  value={editUserForm.fullName}
                  onChange={(e) =>setEditUserForm({ ...editUserForm, fullName: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Phone:</label>
                <input
                  type="text"
                  value={editUserForm.phone}
                  onChange={(e) =>setEditUserForm({ ...editUserForm, phone: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Role:</label>
                <select
                  value={editUserForm.role}
                  onChange={(e) =>setEditUserForm({ ...editUserForm, role: e.target.value })}
                  style={styles.input}
                >
                  <option value="customer">Customer</option>
                  <option value="contractor">Contractor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Account Status:</label>
                <select
                  value={editUserForm.accountStatus}
                  onChange={(e) =>setEditUserForm({ ...editUserForm, accountStatus: e.target.value })}
                  style={styles.input}
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="deactivated">Deactivated</option>
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Change Reason:</label>
                <input
                  type="text"
                  placeholder="Audit reason for status/role change..."
                  value={editUserForm.reason}
                  onChange={(e) =>setEditUserForm({ ...editUserForm, reason: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() =>setIsEditUserModalOpen(false)} style={styles.secondaryBtn}>Cancel
                </button>
                <button type="submit" disabled={loading} style={styles.primaryBtn}>Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create User */}
      {isCreateUserModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3 style={styles.modalTitle}>Onboard New Platform User</h3>
            <form onSubmit={handleCreateUser}>
              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Full Name:</label>
                <input
                  type="text"
                  required
                  value={createUserForm.fullName}
                  onChange={(e) =>setCreateUserForm({ ...createUserForm, fullName: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Email Address:</label>
                <input
                  type="email"
                  required
                  value={createUserForm.email}
                  onChange={(e) =>setCreateUserForm({ ...createUserForm, email: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Password:</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={createUserForm.password}
                  onChange={(e) =>setCreateUserForm({ ...createUserForm, password: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Platform Role:</label>
                <select
                  value={createUserForm.role}
                  onChange={(e) =>setCreateUserForm({ ...createUserForm, role: e.target.value })}
                  style={styles.input}
                >
                  <option value="customer">Customer</option>
                  <option value="contractor">Contractor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() =>setIsCreateUserModalOpen(false)} style={styles.secondaryBtn}>Cancel
                </button>
                <button type="submit" disabled={loading} style={styles.primaryBtn}>Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Setting */}
      {isSettingModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3 style={styles.modalTitle}>Add Platform Setting</h3>
            <form onSubmit={handleCreateSetting}>
              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Setting Key (e.g. ESTIMATE_EXPIRY_DAYS):</label>
                <input
                  type="text"
                  required
                  value={newSetting.key}
                  onChange={(e) =>setNewSetting({ ...newSetting, key: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Category:</label>
                <select
                  value={newSetting.category}
                  onChange={(e) =>setNewSetting({ ...newSetting, category: e.target.value })}
                  style={styles.input}
                >
                  <option value="GENERAL">General</option>
                  <option value="ESTIMATE">Estimate</option>
                  <option value="UPLOAD">Upload</option>
                  <option value="NOTIFICATION">Notification</option>
                  <option value="BUSINESS">Business</option>
                  <option value="SECURITY">Security</option>
                </select>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Label:</label>
                <input
                  type="text"
                  required
                  value={newSetting.label}
                  onChange={(e) =>setNewSetting({ ...newSetting, label: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Value Type:</label>
                <select
                  value={newSetting.valueType}
                  onChange={(e) =>setNewSetting({ ...newSetting, valueType: e.target.value })}
                  style={styles.input}
                >
                  <option value="STRING">String</option>
                  <option value="NUMBER">Number</option>
                  <option value="BOOLEAN">Boolean</option>
                  <option value="OBJECT">Object / JSON</option>
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Value:</label>
                <input
                  type="text"
                  required
                  value={newSetting.value}
                  onChange={(e) =>setNewSetting({ ...newSetting, value: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() =>setIsSettingModalOpen(false)} style={styles.secondaryBtn}>Cancel
                </button>
                <button type="submit" disabled={loading} style={styles.primaryBtn}>Save Setting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Setting */}
      {isEditSettingModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3 style={styles.modalTitle}>Update Platform Setting: {editSettingForm.key}</h3>
            <form onSubmit={handleSaveSetting}>
              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Label:</label>
                <input
                  type="text"
                  required
                  value={editSettingForm.label}
                  onChange={(e) =>setEditSettingForm({ ...editSettingForm, label: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Value Type:</label>
                <input
                  type="text"
                  disabled
                  value={editSettingForm.valueType}
                  style={{ ...styles.input, backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Value:</label>
                <input
                  type="text"
                  required
                  value={editSettingForm.value}
                  onChange={(e) =>setEditSettingForm({ ...editSettingForm, value: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() =>setIsEditSettingModalOpen(false)} style={styles.secondaryBtn}>Cancel
                </button>
                <button type="submit" disabled={loading} style={styles.primaryBtn}>Update Setting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '24px 28px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  header: { marginBottom: '20px' },
  pageTitle: { fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 },
  subtitle: { fontSize: '14px', color: '#64748b', marginTop: '4px' },
  tabBar: { display: 'flex', gap: '16px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px', overflowX: 'auto' },
  tabBtn: { background: 'none', border: 'none', padding: '12px 6px', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s ease' },
  
  // Status Bar
  statusBarCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
  },
  pulseDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#16a34a',
    boxShadow: '0 0 0 3px rgba(22, 163, 74, 0.2)',
  },
  liveSyncBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#15803d',
    backgroundColor: '#dcfce7',
    padding: '3px 8px',
    borderRadius: '12px',
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '5px 12px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
  },

  // KPI Grid
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  richKpiCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
  },
  kpiTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  kpiLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  kpiIconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiBigNumber: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: '1.2',
    margin: '2px 0 8px',
  },
  kpiSubRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '10px',
  },
  pillCustomer: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#1d4ed8',
    backgroundColor: '#eff6ff',
    padding: '2px 7px',
    borderRadius: '6px',
  },
  pillContractor: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#0369a1',
    backgroundColor: '#e0f2fe',
    padding: '2px 7px',
    borderRadius: '6px',
  },
  pillSuccess: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#15803d',
    backgroundColor: '#dcfce7',
    padding: '2px 7px',
    borderRadius: '6px',
  },
  pillWarning: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#b45309',
    backgroundColor: '#fef3c7',
    padding: '2px 7px',
    borderRadius: '6px',
  },
  pillNeutral: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#475569',
    backgroundColor: '#f1f5f9',
    padding: '2px 7px',
    borderRadius: '6px',
  },
  pillAlert: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#b91c1c',
    backgroundColor: '#fee2e2',
    padding: '2px 7px',
    borderRadius: '6px',
  },
  progressBarWrap: {
    width: '100%',
    height: '4px',
    backgroundColor: '#f1f5f9',
    borderRadius: '2px',
    overflow: 'hidden',
    marginTop: 'auto',
    marginBottom: '6px',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  kpiFootnote: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '500',
  },
  cardActionBtn: {
    background: 'none',
    border: 'none',
    padding: 0,
    fontSize: '11px',
    fontWeight: '700',
    color: '#1d4ed8',
    cursor: 'pointer',
    textAlign: 'left',
  },

  // Visuals Grid
  visualsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
    gap: '20px',
  },
  visualCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    padding: '22px 24px',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
    display: 'flex',
    flexDirection: 'column',
  },
  visualHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  visualTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  visualSubtitle: {
    fontSize: '12px',
    color: '#64748b',
    margin: '3px 0 0',
  },
  visualBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#1d4ed8',
    backgroundColor: '#eff6ff',
    padding: '3px 9px',
    borderRadius: '8px',
  },
  stackedBarWrap: {
    width: '100%',
    height: '14px',
    borderRadius: '7px',
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
    display: 'flex',
    margin: '12px 0 16px',
  },
  stackedSegment: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  legendRow: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    marginBottom: '18px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  legendName: {
    display: 'block',
    fontSize: '11px',
    color: '#64748b',
  },
  legendCount: {
    display: 'block',
    fontSize: '13px',
    color: '#0f172a',
    fontWeight: '700',
  },
  metricsSummaryStrip: {
    marginTop: 'auto',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '14px',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  metricStripBox: {
    display: 'flex',
    flexDirection: 'column',
  },
  metricStripLabel: {
    fontSize: '11px',
    color: '#64748b',
  },
  metricStripVal: {
    fontSize: '14px',
    color: '#0f172a',
    fontWeight: '700',
    marginTop: '2px',
  },

  // Demographics bars
  barLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    marginBottom: '4px',
  },
  barLabel: {
    fontWeight: '600',
    color: '#334155',
  },
  barVal: {
    color: '#64748b',
    fontWeight: '600',
  },
  barBg: {
    height: '8px',
    borderRadius: '4px',
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  contractorGaugeBox: {
    marginTop: 'auto',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '14px',
  },

  // Command Grid
  commandGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
  },
  commandCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  commandIconBox: {
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  commandTitle: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '700',
    color: '#0f172a',
  },
  commandDesc: {
    margin: '2px 0 0',
    fontSize: '11px',
    color: '#64748b',
    lineHeight: '1.3',
  },
  commandBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#b45309',
    backgroundColor: '#fef3c7',
    padding: '3px 8px',
    borderRadius: '10px',
    whiteSpace: 'nowrap',
  },
  commandArrow: {
    fontSize: '14px',
    color: '#94a3b8',
    fontWeight: '700',
  },

  // Activity Card
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    padding: '22px 24px',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
  },
  activityHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  textActionLink: {
    background: 'none',
    border: 'none',
    fontSize: '12px',
    fontWeight: '700',
    color: '#1d4ed8',
    cursor: 'pointer',
  },
  activityRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #f1f5f9',
  },
  activityAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  activityActionTag: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#1d4ed8',
    backgroundColor: '#eff6ff',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  activityEntity: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
  },
  activityAuthor: {
    fontSize: '11px',
    color: '#64748b',
    display: 'block',
    marginTop: '2px',
  },
  activityDate: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },

  // Legacy tab elements preserved
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' },
  card: { backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px' },
  metricLabel: { fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' },
  metricValue: { fontSize: '28px', fontWeight: '800', margin: '4px 0' },
  metricSub: { fontSize: '12px', color: '#64748b' },
  controlsRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px' },
  input: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' },
  select: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff' },
  primaryBtn: { backgroundColor: '#1d4ed8', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  secondaryBtn: { backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  smallActionBtn: { padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '11px', fontWeight: '600', cursor: 'pointer' },
  tableCard: { backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' },
  thRow: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  th: { padding: '10px 14px', fontWeight: '700', color: '#475569', fontSize: '12px' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '10px 14px' },
  successBanner: { backgroundColor: '#dcfce7', color: '#15803d', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' },
  errorBanner: { backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' },
  closeAlertBtn: { background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' },
  emptyBox: { padding: '36px', textAlign: 'center', color: '#64748b', fontSize: '14px' },
  spinner: { width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#1d4ed8', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalBox: { backgroundColor: '#ffffff', borderRadius: '8px', padding: '24px', width: '100%', maxWidth: '480px' },
  modalTitle: { fontSize: '18px', fontWeight: '700', margin: '0 0 12px 0' },
  label: { display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#475569' },
};
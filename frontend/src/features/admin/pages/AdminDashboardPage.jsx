// =============================================
// Deck Estimator — Centralized Admin Dashboard Page (Phase 10)
// =============================================

import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';

export default function AdminDashboardPage() {
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
      setSummary(sumRes.data);
      setActivities(actRes.data || []);
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
          <p style={styles.subtitle}>
            Platform-wide governance, user management, deck & estimate oversight, system configurations, and audit telemetry.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabBar}>
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          style={{ ...styles.tabBtn, borderBottom: activeTab === 'overview' ? '3px solid #0284c7' : '3px solid transparent', color: activeTab === 'overview' ? '#0284c7' : '#64748b', fontWeight: activeTab === 'overview' ? '700' : '500' }}
        >
          📊 Operations Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          style={{ ...styles.tabBtn, borderBottom: activeTab === 'users' ? '3px solid #0284c7' : '3px solid transparent', color: activeTab === 'users' ? '#0284c7' : '#64748b', fontWeight: activeTab === 'users' ? '700' : '500' }}
        >
          👥 User Directory
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('decks')}
          style={{ ...styles.tabBtn, borderBottom: activeTab === 'decks' ? '3px solid #0284c7' : '3px solid transparent', color: activeTab === 'decks' ? '#0284c7' : '#64748b', fontWeight: activeTab === 'decks' ? '700' : '500' }}
        >
          🛠️ Deck Records
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('estimates')}
          style={{ ...styles.tabBtn, borderBottom: activeTab === 'estimates' ? '3px solid #0284c7' : '3px solid transparent', color: activeTab === 'estimates' ? '#0284c7' : '#64748b', fontWeight: activeTab === 'estimates' ? '700' : '500' }}
        >
          📐 Estimates Oversight
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('analyses')}
          style={{ ...styles.tabBtn, borderBottom: activeTab === 'analyses' ? '3px solid #0284c7' : '3px solid transparent', color: activeTab === 'analyses' ? '#0284c7' : '#64748b', fontWeight: activeTab === 'analyses' ? '700' : '500' }}
        >
          🧠 AI Condition Telemetry
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          style={{ ...styles.tabBtn, borderBottom: activeTab === 'settings' ? '3px solid #0284c7' : '3px solid transparent', color: activeTab === 'settings' ? '#0284c7' : '#64748b', fontWeight: activeTab === 'settings' ? '700' : '500' }}
        >
          ⚙️ Platform Settings
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          style={{ ...styles.tabBtn, borderBottom: activeTab === 'audit' ? '3px solid #0284c7' : '3px solid transparent', color: activeTab === 'audit' ? '#0284c7' : '#64748b', fontWeight: activeTab === 'audit' ? '700' : '500' }}
        >
          📜 Audit Logs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          style={{ ...styles.tabBtn, borderBottom: activeTab === 'reports' ? '3px solid #0284c7' : '3px solid transparent', color: activeTab === 'reports' ? '#0284c7' : '#64748b', fontWeight: activeTab === 'reports' ? '700' : '500' }}
        >
          📈 Reports & CSV
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div style={styles.successBanner}>
          <span>{successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg(null)} style={styles.closeAlertBtn}>✕</button>
        </div>
      )}
      {error && (
        <div style={styles.errorBanner}>
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} style={styles.closeAlertBtn}>✕</button>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div>
          {summary ? (
            <div>
              {/* KPI Grid */}
              <div style={styles.grid}>
                <div style={{ ...styles.card, borderLeft: '4px solid #0284c7' }}>
                  <div style={styles.metricLabel}>Total Platform Users</div>
                  <div style={{ ...styles.metricValue, color: '#0284c7' }}>{summary.users.totalUsers}</div>
                  <div style={styles.metricSub}>{summary.users.totalCustomers} Customers | {summary.users.totalContractors} Contractors</div>
                </div>
                <div style={{ ...styles.card, borderLeft: '4px solid #15803d' }}>
                  <div style={styles.metricLabel}>Verified Contractors</div>
                  <div style={{ ...styles.metricValue, color: '#15803d' }}>{summary.contractors.approved}</div>
                  <div style={styles.metricSub}>{summary.contractors.pending} Pending Review</div>
                </div>
                <div style={{ ...styles.card, borderLeft: '4px solid #d97706' }}>
                  <div style={styles.metricLabel}>Estimates & Revenue</div>
                  <div style={{ ...styles.metricValue, color: '#d97706' }}>{summary.estimates.totalEstimates}</div>
                  <div style={styles.metricSub}>Completed Rev: ${Number(summary.estimates.completedRevenue || 0).toLocaleString()} | Pipeline: ${Number(summary.estimates.totalVolume || 0).toLocaleString()}</div>
                </div>
                <div style={{ ...styles.card, borderLeft: '4px solid #6366f1' }}>
                  <div style={styles.metricLabel}>Customer Leads</div>
                  <div style={{ ...styles.metricValue, color: '#6366f1' }}>{summary.leads.totalLeads}</div>
                  <div style={styles.metricSub}>{summary.leads.converted} Converted ({Math.round((summary.leads.converted / (summary.leads.totalLeads || 1)) * 100)}%)</div>
                </div>
                <div style={{ ...styles.card, borderLeft: '4px solid #8b5cf6' }}>
                  <div style={styles.metricLabel}>Commissions & Discounts</div>
                  <div style={{ ...styles.metricValue, color: '#8b5cf6' }}>${Number(summary.financials?.paidAmount || 0).toLocaleString()}</div>
                  <div style={styles.metricSub}>Paid Payouts (Accrued: ${Number(summary.financials?.totalAmountCalculated || 0).toLocaleString()}) | Discounts: ${Number(summary.estimates.totalDiscountGranted || 0).toLocaleString()}</div>
                </div>
              </div>

              {/* Activity Timeline */}
              <div style={{ ...styles.card, marginTop: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Recent Operational Activities</h3>
                {activities.length === 0 ? (
                  <div style={styles.emptyBox}>No recent audit records found.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activities.map((act) => (
                      <div key={act._id || act.id} style={styles.activityRow}>
                        <div>
                          <strong>{act.action}</strong> on <code>{act.entityType}</code>
                          <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>
                            By {act.performedBy?.fullName || act.performedBy?.email || 'System'} ({act.performedBy?.role || 'Admin'})
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {new Date(act.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={styles.emptyBox}>Loading overview metrics...</div>
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
                onChange={(e) => setUserSearch(e.target.value)}
                style={styles.input}
              />
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                style={styles.select}
              >
                <option value="">All Roles</option>
                <option value="customer">Customer</option>
                <option value="contractor">Contractor</option>
                <option value="admin">Admin</option>
              </select>
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                style={styles.select}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="deactivated">Deactivated</option>
              </select>
              <button type="button" onClick={() => loadUsers(1)} style={styles.secondaryBtn}>
                Filter
              </button>
            </div>
            <button type="button" onClick={() => setIsCreateUserModalOpen(true)} style={styles.primaryBtn}>
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
                      <button type="button" onClick={() => openEditUser(u)} style={styles.smallActionBtn}>
                        Edit / Status
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
                  onClick={() => loadDecks(deckPagination.page - 1)}
                  style={styles.pageBtn}
                >
                  Previous
                </button>
                <span style={{ fontSize: '13px', alignSelf: 'center' }}>
                  Page {deckPagination.page} of {deckPagination.totalPages || 1}
                </span>
                <button
                  type="button"
                  disabled={deckPagination.page >= deckPagination.totalPages}
                  onClick={() => loadDecks(deckPagination.page + 1)}
                  style={styles.pageBtn}
                >
                  Next
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
                  onClick={() => loadEstimates(estimatePagination.page - 1)}
                  style={styles.pageBtn}
                >
                  Previous
                </button>
                <span style={{ fontSize: '13px', alignSelf: 'center' }}>
                  Page {estimatePagination.page} of {estimatePagination.totalPages || 1}
                </span>
                <button
                  type="button"
                  disabled={estimatePagination.page >= estimatePagination.totalPages}
                  onClick={() => loadEstimates(estimatePagination.page + 1)}
                  style={styles.pageBtn}
                >
                  Next
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
                    <td style={styles.td}>{a.requiresManualReview ? '⚠️ Flagged' : 'Normal'}</td>
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
                  onClick={() => loadAnalyses(analysisPagination.page - 1)}
                  style={styles.pageBtn}
                >
                  Previous
                </button>
                <span style={{ fontSize: '13px', alignSelf: 'center' }}>
                  Page {analysisPagination.page} of {analysisPagination.totalPages || 1}
                </span>
                <button
                  type="button"
                  disabled={analysisPagination.page >= analysisPagination.totalPages}
                  onClick={() => loadAnalyses(analysisPagination.page + 1)}
                  style={styles.pageBtn}
                >
                  Next
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
            <button type="button" onClick={() => setIsSettingModalOpen(true)} style={styles.primaryBtn}>
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
                        onClick={() => handleToggleSettingStatus(s)}
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
                        onClick={() => handleOpenEditSetting(s)}
                        style={styles.smallActionBtn}
                      >
                        Edit Value
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
                  onClick={() => loadAuditLogs(auditPagination.page - 1)}
                  style={styles.pageBtn}
                >
                  Previous
                </button>
                <span style={{ fontSize: '13px', alignSelf: 'center' }}>
                  Page {auditPagination.page} of {auditPagination.totalPages || 1}
                </span>
                <button
                  type="button"
                  disabled={auditPagination.page >= auditPagination.totalPages}
                  onClick={() => loadAuditLogs(auditPagination.page + 1)}
                  style={styles.pageBtn}
                >
                  Next
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
              <button type="button" onClick={() => loadReport(reportType)} style={styles.secondaryBtn}>
                Refresh
              </button>
            </div>
            <button type="button" onClick={handleDownloadCsv} style={{ ...styles.primaryBtn, backgroundColor: '#15803d' }}>
              📥 Export CSV
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
                  onChange={(e) => setEditUserForm({ ...editUserForm, fullName: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Phone:</label>
                <input
                  type="text"
                  value={editUserForm.phone}
                  onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Role:</label>
                <select
                  value={editUserForm.role}
                  onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
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
                  onChange={(e) => setEditUserForm({ ...editUserForm, accountStatus: e.target.value })}
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
                  onChange={(e) => setEditUserForm({ ...editUserForm, reason: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setIsEditUserModalOpen(false)} style={styles.secondaryBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} style={styles.primaryBtn}>
                  Save Changes
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
                  onChange={(e) => setCreateUserForm({ ...createUserForm, fullName: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Email Address:</label>
                <input
                  type="email"
                  required
                  value={createUserForm.email}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
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
                  onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Platform Role:</label>
                <select
                  value={createUserForm.role}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, role: e.target.value })}
                  style={styles.input}
                >
                  <option value="customer">Customer</option>
                  <option value="contractor">Contractor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setIsCreateUserModalOpen(false)} style={styles.secondaryBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} style={styles.primaryBtn}>
                  Create User
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
                  onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Category:</label>
                <select
                  value={newSetting.category}
                  onChange={(e) => setNewSetting({ ...newSetting, category: e.target.value })}
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
                  onChange={(e) => setNewSetting({ ...newSetting, label: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={styles.label}>Value Type:</label>
                <select
                  value={newSetting.valueType}
                  onChange={(e) => setNewSetting({ ...newSetting, valueType: e.target.value })}
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
                  onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setIsSettingModalOpen(false)} style={styles.secondaryBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} style={styles.primaryBtn}>
                  Save Setting
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
                  onChange={(e) => setEditSettingForm({ ...editSettingForm, label: e.target.value })}
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
                  onChange={(e) => setEditSettingForm({ ...editSettingForm, value: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setIsEditSettingModalOpen(false)} style={styles.secondaryBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} style={styles.primaryBtn}>
                  Update Setting
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
    maxWidth: '1240px',
    margin: '0 auto',
    padding: '24px 16px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: { marginBottom: '20px' },
  pageTitle: { fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 },
  subtitle: { fontSize: '14px', color: '#64748b', marginTop: '4px' },
  tabBar: { display: 'flex', gap: '16px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px', overflowX: 'auto' },
  tabBtn: { background: 'none', border: 'none', padding: '12px 6px', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' },
  card: { backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px' },
  metricLabel: { fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' },
  metricValue: { fontSize: '28px', fontWeight: '800', margin: '4px 0' },
  metricSub: { fontSize: '12px', color: '#64748b' },
  controlsRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px' },
  input: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' },
  select: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff' },
  primaryBtn: { backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  secondaryBtn: { backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  smallActionBtn: { padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '11px', fontWeight: '600', cursor: 'pointer' },
  tableCard: { backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' },
  thRow: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  th: { padding: '10px 14px', fontWeight: '700', color: '#475569', fontSize: '12px' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '10px 14px' },
  activityRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '13px' },
  successBanner: { backgroundColor: '#dcfce7', color: '#15803d', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' },
  errorBanner: { backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' },
  closeAlertBtn: { background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' },
  emptyBox: { padding: '36px', textAlign: 'center', color: '#64748b', fontSize: '14px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalBox: { backgroundColor: '#ffffff', borderRadius: '8px', padding: '24px', width: '100%', maxWidth: '480px' },
  modalTitle: { fontSize: '18px', fontWeight: '700', margin: '0 0 12px 0' },
  label: { display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#475569' },
};

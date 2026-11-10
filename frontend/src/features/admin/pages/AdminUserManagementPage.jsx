// =============================================
// Deck Estimator — Admin User Management Page
// =============================================
// Features:
// - 4 horizontal tabs: All Users, Customers, Contractors, User Activity
// - Search, Status filter, Role filter, Pagination
// - User Profile details modal with moderation history
// - Action dialogs: Activate / Deactivate, Block / Unblock with reason, Soft Delete with retention confirmation
// - Directly backed by MongoDB via adminApi

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/adminApi';

const TABS = [
  { id: 'all', label: 'All Users' },
  { id: 'customer', label: 'Customers' },
  { id: 'contractor', label: 'Contractors' },
  { id: 'activity', label: 'User Activity' },
  { id: 'requests', label: 'User Requests' },
];

export default function AdminUserManagementPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [users, setUsers] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Modals & User Requests
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [actionModal, setActionModal] = useState({ open: false, type: '', user: null, reason: '' });
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [requestModal, setRequestModal] = useState({ open: false, request: null, notes: '' });
  const [requestSubmitting, setRequestSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [activeTab, statusFilter, page]);

  // Live auto-filter search while typing (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 280);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'requests') {
        const res = await adminApi.getUserRequests({
          page,
          limit: 12,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchTerm.trim() || undefined,
        });
        const reqList = res.data?.data || res.data || [];
        setUserRequests(reqList);
        setPagination(res.data?.pagination || res.pagination || { page: 1, totalPages: 1, total: reqList.length });
        return;
      }

      const params = {
        page,
        limit: 12,
        search: searchTerm.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };

      if (activeTab === 'customer') params.role = 'customer';
      else if (activeTab === 'contractor') params.role = 'contractor';

      const res = await adminApi.getUsers(params);
      setUsers(res.data || []);
      setPagination(res.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusAction = (user, type) => {
    setActionModal({ open: true, type, user, reason: '' });
  };

  const handleConfirmAction = async () => {
    if (!actionModal.user) return;
    setActionSubmitting(true);
    setError(null);
    try {
      const targetId = actionModal.user._id || actionModal.user.id;
      if (actionModal.type === 'delete') {
        await adminApi.softDeleteUser(targetId, actionModal.reason);
        setSuccessMsg(`User ${actionModal.user.name || actionModal.user.fullName} successfully soft-deleted.`);
      } else {
        const newStatus = actionModal.type === 'block' ? 'blocked' : actionModal.type === 'unblock' ? 'active' : actionModal.type;
        await adminApi.updateUserStatus(targetId, newStatus, actionModal.reason);
        setSuccessMsg(`User status updated to ${newStatus.toUpperCase()}`);
      }
      setActionModal({ open: false, type: '', user: null, reason: '' });
      fetchUsers();
    } catch (err) {
      setError(err?.message || 'Failed to execute moderation action.');
    } finally {
      setActionSubmitting(false);
    }
  };

  const openUserProfile = (u) => {
    const userId = u?._id || u?.id;
    if (userId) {
      navigate(`/admin/users/${userId}`);
    } else {
      setSelectedUser(u);
      setIsProfileModalOpen(true);
    }
  };

  const handleResolveRequest = async (requestId, action) => {
    setRequestSubmitting(true);
    setError(null);
    try {
      await adminApi.resolveUserRequest(requestId, action, requestModal.notes);
      setSuccessMsg(`Appeal successfully ${action === 'approve' || action === 'unblock' ? 'approved and user account unblocked' : 'rejected'}.`);
      setRequestModal({ open: false, request: null, notes: '' });
      fetchUsers();
    } catch (err) {
      setError(err?.message || 'Failed to process user appeal.');
    } finally {
      setRequestSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.title}>User Management</h1>
          <p style={styles.subtitle}>
            Oversee registered accounts, manage role permissions, moderate account standing, and review activity audits.
          </p>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.statPill}>
            <span style={styles.statPillLabel}>Total Accounts:</span>
            <span style={styles.statPillVal}>{pagination.total || users.length}</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div style={styles.alertSuccess}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span style={{ marginLeft: 8 }}>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} style={styles.alertCloseBtn}>✕</button>
        </div>
      )}

      {error && (
        <div style={styles.alertError}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span style={{ marginLeft: 8 }}>{error}</span>
          <button onClick={() => setError(null)} style={styles.alertCloseBtn}>✕</button>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabContainer}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              style={{
                ...styles.tabButton,
                ...(isActive ? styles.tabButtonActive : {}),
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Universal Auto-Search, Filter & Refresh Bar (Rendered for ALL Tabs) */}
      <div style={styles.filterBar}>
        <div style={{ ...styles.searchBox, flex: 1, maxWidth: '480px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder={
              activeTab === 'requests'
                ? "Search appeal requests by name, email, or message..."
                : activeTab === 'activity'
                ? "Search audit logs by name, email, or action..."
                : activeTab === 'customer'
                ? "Search customers by name, email, or phone..."
                : activeTab === 'contractor'
                ? "Search contractors by company, license, or name..."
                : "Search all users by name, email, phone, or company..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...styles.searchInput, width: '100%' }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0 4px', fontSize: '14px', lineHeight: 1 }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div style={styles.filterRight}>
          <label style={styles.filterLabel}>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            style={styles.selectInput}
          >
            {activeTab === 'requests' ? (
              <>
                <option value="all">All Appeal Statuses</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </>
            ) : activeTab === 'activity' ? (
              <>
                <option value="all">All Moderation Actions</option>
                <option value="active">Active Transitions</option>
                <option value="blocked">Blocked Actions</option>
                <option value="pending">Pending Verifications</option>
                <option value="inactive">Inactive</option>
              </>
            ) : (
              <>
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="blocked">Blocked</option>
                <option value="inactive">Inactive</option>
              </>
            )}
          </select>

          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            style={styles.refreshBtn}
            title="Refresh list from database"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Requests Tab View */}
      {activeTab === 'requests' ? (
        <div style={styles.card}>
          <div style={styles.cardHeaderFlex}>
            <div>
              <h3 style={styles.cardTitle}>User Reactivation &amp; Unblock Appeals</h3>
              <p style={styles.cardSub}>
                Blocked customers and contractors who have submitted requests to the Deck Restoration Plus Team.
              </p>
            </div>
          </div>

          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>User / Account</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Submitted Date</th>
                  <th style={styles.th}>Appeal Summary</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {userRequests.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={styles.emptyTd}>No unblock appeal requests found.</td>
                  </tr>
                ) : (
                  userRequests.map((req) => (
                    <tr key={req._id || req.id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.userCell}>
                          <div style={styles.avatarPill}>
                            {(req.fullName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={styles.userName}>{req.fullName}</div>
                            <div style={styles.userEmail}>{req.email}</div>
                            {req.phone && <div style={{ fontSize: '11px', color: '#64748b' }}>{req.phone}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={getRoleBadgeStyle(req.role)}>
                          {(req.role || 'user').toUpperCase()}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={getStatusBadgeStyle(req.status)}>
                          {(req.status || 'pending').toUpperCase()}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {new Date(req.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td style={{ ...styles.td, maxWidth: '280px' }}>
                        <div style={{ fontSize: '12px', color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {req.message}
                        </div>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => setRequestModal({ open: true, request: req, notes: req.adminNotes || '' })}
                          style={styles.actionBtnOutline}
                        >
                          View Request
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'activity' ? (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Recent User Moderation & Security Logs</h3>
          <p style={styles.cardSub}>Audit trail of account approvals, status transitions, blocks, and data modifications.</p>
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Timestamp</th>
                  <th style={styles.th}>Target User</th>
                  <th style={styles.th}>Action / Status</th>
                  <th style={styles.th}>Admin Reason</th>
                  <th style={styles.th}>Changed By</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const activityRows = users.flatMap((u) => (u.moderationHistory || []).map((m, i) => ({ ...m, user: u, key: `${u._id}-${i}` })))
                    .filter((act) => {
                      if (statusFilter !== 'all' && (act.newStatus || '').toLowerCase() !== statusFilter.toLowerCase()) {
                        return false;
                      }
                      if (searchTerm.trim()) {
                        const q = searchTerm.toLowerCase();
                        const userName = (act.user?.fullName || act.user?.name || '').toLowerCase();
                        const userEmail = (act.user?.email || '').toLowerCase();
                        const action = (act.newStatus || '').toLowerCase();
                        const reason = (act.reason || '').toLowerCase();
                        return userName.includes(q) || userEmail.includes(q) || action.includes(q) || reason.includes(q);
                      }
                      return true;
                    });

                  if (activityRows.length === 0) {
                    return (
                      <tr>
                        <td colSpan="5" style={styles.emptyTd}>No recorded moderation activities found matching filters.</td>
                      </tr>
                    );
                  }

                  return activityRows.map((m) => (
                    <tr key={m.key} style={styles.tr}>
                      <td style={styles.td}>{new Date(m.changedAt || Date.now()).toLocaleString()}</td>
                      <td style={styles.td}><strong>{m.user.name || m.user.fullName}</strong> ({m.user.email})</td>
                      <td style={styles.td}>
                        <span style={getStatusBadgeStyle(m.newStatus)}>{(m.newStatus || '').toUpperCase()}</span>
                      </td>
                      <td style={styles.td}>{m.reason || 'Standard system action'}</td>
                      <td style={styles.td}>{m.changedBy || 'Admin System'}</td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>

          {/* User Table */}
          <div style={styles.card}>
            {loading ? (
              <div style={styles.loaderBox}>
                <div style={styles.spinner} />
                <span style={{ color: '#64748b', fontSize: '14px' }}>Loading registered users...</span>
              </div>
            ) : users.length === 0 ? (
              <div style={styles.emptyBox}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
                <p style={styles.emptyTitle}>No users found</p>
                <p style={styles.emptySub}>Try adjusting your search criteria or status filter.</p>
              </div>
            ) : (
              <div style={styles.tableResponsive}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>User / Entity</th>
                      <th style={styles.th}>Role</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Contact Info</th>
                      <th style={styles.th}>Joined Date</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const userId = u._id || u.id;
                      const userName = u.fullName || u.name || 'Unnamed User';
                      const userStatus = u.accountStatus || u.status || 'ACTIVE';
                      return (
                      <tr key={userId} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.userCell}>
                            <div style={styles.avatarPill}>
                              {userName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={styles.userName}>{userName}</div>
                              <div style={styles.userEmail}>{u.email}</div>
                              {u.contractorProfile?.companyName && (
                                <div style={styles.companyBadge}>{u.contractorProfile.companyName}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={getRoleBadgeStyle(u.role)}>
                            {u.role ? u.role.toUpperCase() : 'USER'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={getStatusBadgeStyle(userStatus)}>
                            {userStatus.toUpperCase()}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontSize: '13px', color: '#334155' }}>{u.phone || '—'}</div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontSize: '13px', color: '#64748b' }}>
                            {new Date(u.createdAt || Date.now()).toLocaleDateString()}
                          </div>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <div style={styles.actionButtonGroup}>
                            <button
                              onClick={() => openUserProfile(u)}
                              style={styles.actionBtnOutline}
                              title="View full account profile"
                            >
                              Profile
                            </button>
                            {userStatus.toLowerCase() === 'blocked' ? (
                              <button
                                onClick={() => handleOpenStatusAction(u, 'unblock')}
                                style={styles.actionBtnSuccess}
                                title="Unblock user access"
                              >
                                Unblock
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenStatusAction(u, 'block')}
                                style={styles.actionBtnWarning}
                                title="Block account access"
                              >
                                Block
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenStatusAction(u, 'delete')}
                              style={styles.actionBtnDanger}
                              title="Soft delete user account"
                            >
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

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div style={styles.paginationBar}>
                <span style={styles.paginationInfo}>
                  Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
                </span>
                <div style={styles.paginationBtns}>
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    style={pagination.page <= 1 ? styles.pageBtnDisabled : styles.pageBtn}
                  >
                    Previous
                  </button>
                  <button
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    style={pagination.page >= pagination.totalPages ? styles.pageBtnDisabled : styles.pageBtn}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* USER PROFILE MODAL */}
      {isProfileModalOpen && selectedUser && (
        <div style={styles.modalOverlay} onClick={() => setIsProfileModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>User Profile Details</h2>
                <p style={styles.modalSub}>Account record and moderation audit trail</p>
              </div>
              <button onClick={() => setIsProfileModalOpen(false)} style={styles.modalCloseBtn}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.profileGrid}>
                <div style={styles.profileField}>
                  <span style={styles.fieldLabel}>Full Name</span>
                  <span style={styles.fieldValue}>{selectedUser.name || '—'}</span>
                </div>
                <div style={styles.profileField}>
                  <span style={styles.fieldLabel}>Email Address</span>
                  <span style={styles.fieldValue}>{selectedUser.email}</span>
                </div>
                <div style={styles.profileField}>
                  <span style={styles.fieldLabel}>Role</span>
                  <span style={getRoleBadgeStyle(selectedUser.role)}>{selectedUser.role?.toUpperCase()}</span>
                </div>
                <div style={styles.profileField}>
                  <span style={styles.fieldLabel}>Account Status</span>
                  <span style={getStatusBadgeStyle(selectedUser.status)}>{(selectedUser.status || 'ACTIVE').toUpperCase()}</span>
                </div>
                <div style={styles.profileField}>
                  <span style={styles.fieldLabel}>Phone</span>
                  <span style={styles.fieldValue}>{selectedUser.phone || '—'}</span>
                </div>
                <div style={styles.profileField}>
                  <span style={styles.fieldLabel}>User ID</span>
                  <span style={{ ...styles.fieldValue, fontFamily: 'monospace', fontSize: '12px' }}>{selectedUser._id}</span>
                </div>
              </div>

              {/* Contractor specifics if applicable */}
              {selectedUser.contractorProfile && (
                <div style={styles.contractorBox}>
                  <h4 style={styles.contractorBoxTitle}>Contractor Information</h4>
                  <div style={styles.profileGrid}>
                    <div style={styles.profileField}>
                      <span style={styles.fieldLabel}>Company Name</span>
                      <span style={styles.fieldValue}>{selectedUser.contractorProfile.companyName || '—'}</span>
                    </div>
                    <div style={styles.profileField}>
                      <span style={styles.fieldLabel}>Verification Status</span>
                      <span style={getStatusBadgeStyle(selectedUser.contractorProfile.verificationStatus)}>
                        {selectedUser.contractorProfile.verificationStatus?.toUpperCase() || 'UNVERIFIED'}
                      </span>
                    </div>
                    <div style={styles.profileField}>
                      <span style={styles.fieldLabel}>License Number</span>
                      <span style={styles.fieldValue}>{selectedUser.contractorProfile.licenseNumber || '—'}</span>
                    </div>
                    <div style={styles.profileField}>
                      <span style={styles.fieldLabel}>Custom Discount</span>
                      <span style={{ fontWeight: 600, color: '#1d4ed8' }}>
                        {selectedUser.contractorProfile.customDiscount !== undefined ? `${selectedUser.contractorProfile.customDiscount}%` : 'Default (10%)'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Moderation History */}
              <div style={{ marginTop: '20px' }}>
                <h4 style={styles.contractorBoxTitle}>Account Moderation History</h4>
                {selectedUser.moderationHistory && selectedUser.moderationHistory.length > 0 ? (
                  <div style={styles.historyList}>
                    {selectedUser.moderationHistory.map((h, i) => (
                      <div key={i} style={styles.historyItem}>
                        <div style={styles.historyDot} />
                        <div style={styles.historyContent}>
                          <div style={styles.historyTop}>
                            <strong>Status changed to {h.newStatus}</strong>
                            <span style={styles.historyDate}>{new Date(h.changedAt).toLocaleString()}</span>
                          </div>
                          {h.reason && <p style={styles.historyReason}>Reason: {h.reason}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
                    No moderation actions have been recorded for this user.
                  </p>
                )}
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => setIsProfileModalOpen(false)} style={styles.modalBtnSecondary}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION / REASON MODAL (BLOCK / UNBLOCK / DELETE) */}
      {actionModal.open && actionModal.user && (
        <div style={styles.modalOverlay} onClick={() => setActionModal({ open: false, type: '', user: null, reason: '' })}>
          <div style={styles.modalContentSmall} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>
              {actionModal.type === 'delete'
                ? 'Confirm Account Deletion'
                : actionModal.type === 'block'
                ? 'Confirm Account Block'
                : 'Confirm Account Unblock'}
            </h3>
            <p style={styles.modalSub}>
              {actionModal.type === 'delete'
                ? `Are you sure you want to soft-delete ${actionModal.user.name}'s account? The record will be preserved for compliance and data retention.`
                : `Are you sure you want to change account standing for ${actionModal.user.name}?`}
            </p>

            <div style={{ marginTop: '16px' }}>
              <label style={styles.inputLabel}>Reason / Audit Note (Required):</label>
              <textarea
                rows={3}
                style={styles.modalTextarea}
                placeholder="Enter justification for administrative audit trail..."
                value={actionModal.reason}
                onChange={(e) => setActionModal({ ...actionModal, reason: e.target.value })}
              />
            </div>

            <div style={styles.modalFooter}>
              <button
                onClick={() => setActionModal({ open: false, type: '', user: null, reason: '' })}
                style={styles.modalBtnSecondary}
                disabled={actionSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                style={actionModal.type === 'delete' ? styles.actionBtnDangerLg : styles.actionBtnPrimaryLg}
                disabled={actionSubmitting || !actionModal.reason.trim()}
              >
                {actionSubmitting ? 'Processing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER REQUEST DETAILS & APPEAL REVIEW MODAL */}
      {requestModal.open && requestModal.request && (
        <div style={styles.modalOverlay} onClick={() => setRequestModal({ open: false, request: null, notes: '' })}>
          <div style={{ ...styles.modalContent, maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>User Reactivation Appeal Details</h2>
                <p style={styles.modalSub}>Submitted by blocked user to Deck Restoration Plus Team</p>
              </div>
              <button onClick={() => setRequestModal({ open: false, request: null, notes: '' })} style={styles.modalCloseBtn}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.profileGrid}>
                <div style={styles.profileField}>
                  <span style={styles.fieldLabel}>Applicant Name</span>
                  <span style={styles.fieldValue}>{requestModal.request.fullName}</span>
                </div>
                <div style={styles.profileField}>
                  <span style={styles.fieldLabel}>Registered Email</span>
                  <span style={styles.fieldValue}>{requestModal.request.email}</span>
                </div>
                <div style={styles.profileField}>
                  <span style={styles.fieldLabel}>Account Role</span>
                  <span style={getRoleBadgeStyle(requestModal.request.role)}>{(requestModal.request.role || 'user').toUpperCase()}</span>
                </div>
                <div style={styles.profileField}>
                  <span style={styles.fieldLabel}>Appeal Status</span>
                  <span style={getStatusBadgeStyle(requestModal.request.status)}>{(requestModal.request.status || 'pending').toUpperCase()}</span>
                </div>
                <div style={styles.profileField}>
                  <span style={styles.fieldLabel}>Contact Phone</span>
                  <span style={styles.fieldValue}>{requestModal.request.phone || 'Not provided'}</span>
                </div>
                <div style={styles.profileField}>
                  <span style={styles.fieldLabel}>Submission Timestamp</span>
                  <span style={styles.fieldValue}>{new Date(requestModal.request.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <span style={styles.fieldLabel}>Applicant's Explanation &amp; Appeal Message</span>
                <div style={styles.appealMessageBox}>
                  {requestModal.request.message}
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={styles.fieldLabel}>Admin Resolution Notes</label>
                <textarea
                  rows={3}
                  value={requestModal.notes}
                  onChange={(e) => setRequestModal((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Enter optional notes explaining the approval or rejection decision..."
                  style={styles.modalTextarea}
                />
              </div>

              <div style={{ ...styles.modalActions, marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setRequestModal({ open: false, request: null, notes: '' })}
                  style={styles.actionBtnSecondary}
                >
                  Close
                </button>
                {requestModal.request.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      disabled={requestSubmitting}
                      onClick={() => handleResolveRequest(requestModal.request._id || requestModal.request.id, 'reject')}
                      style={styles.actionBtnDangerLg}
                    >
                      {requestSubmitting ? 'Processing...' : 'Reject Appeal'}
                    </button>
                    <button
                      type="button"
                      disabled={requestSubmitting}
                      onClick={() => handleResolveRequest(requestModal.request._id || requestModal.request.id, 'approve')}
                      style={styles.actionBtnSuccessLg}
                    >
                      {requestSubmitting ? 'Processing...' : '✓ Unblock Account & Approve'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Badge Helpers
function getRoleBadgeStyle(role) {
  const base = {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.04em',
  };
  if (role === 'admin') return { ...base, backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' };
  if (role === 'contractor') return { ...base, backgroundColor: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' };
  return { ...base, backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' };
}

function getStatusBadgeStyle(status) {
  const base = {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.04em',
  };
  const s = (status || '').toLowerCase();
  if (s === 'active' || s === 'approved') return { ...base, backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' };
  if (s === 'blocked' || s === 'rejected') return { ...base, backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' };
  if (s === 'pending') return { ...base, backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' };
  return { ...base, backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' };
}

// Component Styles
const styles = {
  container: {
    padding: '24px 32px',
    backgroundColor: '#f8fafc',
    minHeight: '100%',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    margin: '6px 0 0',
    fontSize: '14px',
    color: '#64748b',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statPill: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '8px 16px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  statPillLabel: {
    fontSize: '13px',
    color: '#64748b',
  },
  statPillVal: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#0f172a',
  },
  alertSuccess: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  alertError: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  alertCloseBtn: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'inherit',
    fontWeight: 'bold',
  },
  tabContainer: {
    display: 'flex',
    gap: '8px',
    borderBottom: '2px solid #e2e8f0',
    marginBottom: '20px',
  },
  tabButton: {
    padding: '10px 18px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer',
    marginBottom: '-2px',
    transition: 'all 0.15s ease',
  },
  tabButtonActive: {
    color: '#1d4ed8',
    borderBottom: '2px solid #1d4ed8',
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  searchForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: '1 1 320px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0 12px',
    flex: 1,
    height: '40px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    padding: '0 8px',
    width: '100%',
    fontSize: '14px',
    color: '#0f172a',
  },
  searchBtn: {
    padding: '0 16px',
    height: '40px',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
  },
  filterRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  filterLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
  },
  selectInput: {
    height: '40px',
    padding: '0 12px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
  },
  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    height: '40px',
    padding: '0 14px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  cardTitle: {
    margin: '0 0 4px',
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
  },
  cardSub: {
    margin: '0 0 16px',
    fontSize: '13px',
    color: '#64748b',
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
    padding: '12px 14px',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#64748b',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.1s ease',
  },
  td: {
    padding: '14px',
    fontSize: '14px',
    color: '#1e293b',
    verticalAlign: 'middle',
  },
  emptyTd: {
    padding: '32px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px',
  },
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatarPill: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '14px',
    flexShrink: 0,
  },
  userName: {
    fontWeight: '600',
    color: '#0f172a',
    fontSize: '14px',
  },
  userEmail: {
    fontSize: '12px',
    color: '#64748b',
  },
  companyBadge: {
    fontSize: '11px',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    padding: '1px 6px',
    borderRadius: '4px',
    display: 'inline-block',
    marginTop: '3px',
    fontWeight: '500',
  },
  actionButtonGroup: {
    display: 'inline-flex',
    gap: '6px',
  },
  actionBtnOutline: {
    padding: '5px 10px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
  },
  actionBtnWarning: {
    padding: '5px 10px',
    backgroundColor: '#fffbeb',
    border: '1px solid #fcd34d',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#b45309',
    cursor: 'pointer',
  },
  actionBtnSuccess: {
    padding: '5px 10px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #6ee7b7',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#047857',
    cursor: 'pointer',
  },
  actionBtnDanger: {
    padding: '5px 10px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#b91c1c',
    cursor: 'pointer',
  },
  paginationBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid #f1f5f9',
  },
  paginationInfo: {
    fontSize: '13px',
    color: '#64748b',
  },
  paginationBtns: {
    display: 'flex',
    gap: '8px',
  },
  pageBtn: {
    padding: '6px 14px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
  },
  pageBtnDisabled: {
    padding: '6px 14px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#94a3b8',
    cursor: 'not-allowed',
  },
  loaderBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 0',
    gap: '12px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#1d4ed8',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  emptyBox: {
    textAlign: 'center',
    padding: '48px 0',
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#334155',
    margin: '12px 0 4px',
  },
  emptySub: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: 0,
  },
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
    padding: '16px',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '650px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  modalContentSmall: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '480px',
    padding: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  modalHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
  },
  modalSub: {
    margin: '4px 0 0',
    fontSize: '13px',
    color: '#64748b',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#64748b',
    cursor: 'pointer',
  },
  modalBody: {
    padding: '24px',
  },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
  },
  profileField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  fieldLabel: {
    fontSize: '12px',
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  fieldValue: {
    fontSize: '14px',
    color: '#0f172a',
    fontWeight: '500',
  },
  contractorBox: {
    marginTop: '20px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  contractorBoxTitle: {
    margin: '0 0 12px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#1e293b',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingLeft: '8px',
  },
  historyItem: {
    display: 'flex',
    gap: '12px',
    position: 'relative',
  },
  historyDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#1d4ed8',
    marginTop: '5px',
    flexShrink: 0,
  },
  historyContent: {
    flex: 1,
  },
  historyTop: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#1e293b',
  },
  historyDate: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  historyReason: {
    margin: '4px 0 0',
    fontSize: '12px',
    color: '#64748b',
  },
  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    backgroundColor: '#f8fafc',
    borderBottomLeftRadius: '12px',
    borderBottomRightRadius: '12px',
  },
  modalBtnSecondary: {
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
  },
  actionBtnPrimaryLg: {
    padding: '8px 18px',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  actionBtnDangerLg: {
    padding: '8px 18px',
    backgroundColor: '#b91c1c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  inputLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '6px',
  },
  modalTextarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },

  modalHeaderTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
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
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#2563eb',
    backgroundColor: '#ffffff',
    border: '1px solid #bfdbfe',
    borderRadius: '6px',
    textDecoration: 'none',
    cursor: 'pointer',
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
  modalLoaderBox: {
    padding: '40px 0',
    textAlign: 'center',
  },
  sectionHeading: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 12px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  modalStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '10px',
    marginBottom: '16px',
  },
  statMetricCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center',
  },
  statMetricVal: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
  },
  statMetricLbl: {
    fontSize: '11px',
    color: '#64748b',
    marginTop: '2px',
  },
  subTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
    marginBottom: '16px',
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
    padding: '9px 10px',
    borderBottom: '1px solid #f1f5f9',
    color: '#1e293b',
  },
  subStatusPill: {
    display: 'inline-block',
    padding: '2px 6px',
    fontSize: '10px',
    fontWeight: '700',
    borderRadius: '4px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
  },
  subEmpty: {
    padding: '20px',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    color: '#64748b',
    fontSize: '13px',
    marginBottom: '14px',
  },
  enquiriesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  enquiryCardItem: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '12px',
  },
  enquiryTopRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  enquiryLeadNum: {
    fontSize: '11px',
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#64748b',
  },
  enquirySourcePill: {
    padding: '2px 6px',
    fontSize: '11px',
    fontWeight: '600',
    borderRadius: '4px',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
  },
  enquiryDateText: {
    fontSize: '11px',
    color: '#94a3b8',
    marginLeft: 'auto',
  },
  enquirySubjectText: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '4px',
  },
  enquiryMsgText: {
    fontSize: '12px',
    color: '#475569',
    lineHeight: '1.4',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 24px',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  cardHeaderFlex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '12px',
  },
  appealMessageBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '12px 14px',
    fontSize: '13px',
    color: '#1e293b',
    lineHeight: 1.5,
    marginTop: '6px',
    whiteSpace: 'pre-wrap',
  },
  actionBtnSuccessLg: {
    padding: '8px 18px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};

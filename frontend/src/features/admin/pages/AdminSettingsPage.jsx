// =============================================
// Deck Estimator — Admin System Settings & Communications Hub
// =============================================
// Features:
// - 5 tabs: General & Branding, Contact & WhatsApp, Targeted Notifications, Security & Session, System Diagnostics
// - Edit everything: Company Name, Tagline, Logo URL, WhatsApp Number, Phone, Email, Business Address, Hours
// - Targeted Notification Broadcast Engine:
//     * Dispatch to: Customers, Contractors, Both, or Specific User(s) with live autocomplete search
//     * Category / Urgency selection & message builder
//     * Direct MongoDB persistence in 'notifications' collection & Live Broadcast History
// - Live MongoDB Atlas health ping, server uptime, Node.js runtime diagnostics

import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import DeckHomeLogo from '../components/DeckHomeLogo';

const TABS = [
  { id: 'general', label: 'General & Branding' },
  { id: 'contact', label: 'Contact, WhatsApp & Channels' },
  { id: 'notifications', label: 'Targeted Notifications & Alerts' },
  { id: 'security', label: 'Security & Session Access' },
  { id: 'system_info', label: 'System Diagnostics & DB' },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    companyName: 'Deck Restoration Plus',
    brandTagline: 'Commercial & Residential Exterior Wood Restoration Specialists',
    platformLogoUrl: '',
    supportEmail: 'support@deckestimator.com',
    supportPhone: '(856) 666-8888',
    whatsappNumber: '+1 (856) 555-0199',
    businessAddress: '1452 Boardwalk Ave, Cherry Hill, NJ 08002',
    operatingHours: 'Mon - Fri: 8:00 AM - 6:00 PM EST, Sat: 9:00 AM - 2:00 PM EST',
    currency: 'USD',
    taxRatePercent: 6.625,
    emailOnContractorRegister: true,
    emailOnHotLead: true,
    weeklyReportDispatch: true,
    sessionTimeoutMinutes: 120,
    enforceMFAForAdmins: false,
  });

  const [sysInfo, setSysInfo] = useState({
    dbConnected: true,
    nodeVersion: 'v24.x',
    platformUptime: '24 hours',
    environment: 'development',
    collectionsCount: 15,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // NOTIFICATION DISPATCHER STATE
  const [notifForm, setNotifForm] = useState({
    recipientType: 'customer', // 'customer' | 'contractor' | 'both' | 'specific'
    selectedUsers: [],
    title: '',
    message: '',
    category: 'GENERAL',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [dispatchingNotif, setDispatchingNotif] = useState(false);
  const [notifHistory, setNotifHistory] = useState([]);

  useEffect(() => {
    loadSettings();
    loadNotifHistory();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getSystemSettings();
      if (res?.data) {
        if (res.data.settings) setSettings((prev) => ({ ...prev, ...res.data.settings }));
        if (res.data.systemInfo) setSysInfo((prev) => ({ ...prev, ...res.data.systemInfo }));
      }
    } catch (err) {
      setError(err?.message || 'Failed to load system settings.');
    } finally {
      setLoading(false);
    }
  };

  const loadNotifHistory = async () => {
    try {
      const res = await adminApi.getNotificationHistory(20);
      setNotifHistory(res?.data || []);
    } catch {
      // Ignore initial load error
    }
  };

  // User search debounce
  useEffect(() => {
    if (notifForm.recipientType !== 'specific') return;
    const timeout = setTimeout(async () => {
      setIsSearchingUsers(true);
      try {
        const res = await adminApi.searchRecipients(searchQuery);
        setSearchResults(res?.data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [searchQuery, notifForm.recipientType]);

  const handleSaveSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await adminApi.updateSystemSettings({ settings });
      setSuccessMsg('Platform configurations and communication channels successfully saved to MongoDB Atlas.');
    } catch (err) {
      setError(err?.message || 'Failed to update system settings.');
    } finally {
      setSaving(false);
    }
  };

  // NOTIFICATION ACTIONS
  const handleSelectUser = (u) => {
    if (notifForm.selectedUsers.some((sel) => sel.id === u.id)) return;
    setNotifForm((prev) => ({
      ...prev,
      selectedUsers: [...prev.selectedUsers, u],
    }));
    setSearchQuery('');
  };

  const handleRemoveUser = (userId) => {
    setNotifForm((prev) => ({
      ...prev,
      selectedUsers: prev.selectedUsers.filter((u) => u.id !== userId),
    }));
  };

  const handleDispatchNotification = async (e) => {
    e.preventDefault();
    if (!notifForm.title.trim() || !notifForm.message.trim()) {
      setError('Please provide both notification title and message.');
      return;
    }
    if (notifForm.recipientType === 'specific' && notifForm.selectedUsers.length === 0) {
      setError('Please select at least one specific user to receive this message.');
      return;
    }

    setDispatchingNotif(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const payload = {
        recipientType: notifForm.recipientType,
        userIds: notifForm.selectedUsers.map((u) => u.id || u._id),
        title: notifForm.title.trim(),
        message: notifForm.message.trim(),
        category: notifForm.category,
      };

      const res = await adminApi.dispatchNotification(payload);
      setSuccessMsg(res?.message || 'Notification broadcast successfully dispatched and recorded in MongoDB.');
      setNotifForm({
        recipientType: 'customer',
        selectedUsers: [],
        title: '',
        message: '',
        category: 'GENERAL',
      });
      loadNotifHistory();
    } catch (err) {
      setError(err?.message || 'Failed to dispatch notification.');
    } finally {
      setDispatchingNotif(false);
    }
  };

  const cleanWhatsappNumber = (settings.whatsappNumber || '').replace(/[^0-9]/g, '');

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>System Settings & Communications</h1>
          <p style={styles.subtitle}>
            Platform branding, WhatsApp & phone channels, targeted notification broadcasting, and live database telemetry.
          </p>
        </div>
        <button onClick={handleSaveSettings} disabled={saving} style={styles.btnPrimary}>
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
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
          </svg>
          <span style={{ marginLeft: 8 }}>{error}</span>
          <button onClick={() => setError(null)} style={styles.alertCloseBtn}>✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="drp-tab-scroll" style={styles.tabBar}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              ...styles.tabBtn,
              ...(activeTab === t.id ? styles.tabBtnActive : {}),
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Card Body */}
      <div style={styles.card}>
        {loading ? (
          <div style={styles.loaderBox}>
            <div style={styles.spinner} />
            <span>Loading system settings...</span>
          </div>
        ) : activeTab === 'general' ? (
          /* TAB 1: GENERAL & BRANDING */
          <div>
            <h3 style={styles.cardSectionTitle}>Brand Identity & Regional Defaults</h3>
            <p style={styles.cardSectionSub}>Platform brand name, tagline, logo symbol, and financial parameters.</p>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Company Brand Name</label>
                <input
                  type="text"
                  value={settings.companyName || ''}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  style={styles.input}
                  placeholder="e.g. Deck Restoration Plus"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Brand Tagline / Slogan</label>
                <input
                  type="text"
                  value={settings.brandTagline || ''}
                  onChange={(e) => setSettings({ ...settings, brandTagline: e.target.value })}
                  style={styles.input}
                  placeholder="e.g. Exterior Wood Restoration Specialists"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Default Currency</label>
                <select
                  value={settings.currency || 'USD'}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  style={styles.select}
                >
                  <option value="USD">USD ($) - United States Dollar</option>
                  <option value="CAD">CAD ($) - Canadian Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Sales Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.001"
                  value={settings.taxRatePercent || 0}
                  onChange={(e) => setSettings({ ...settings, taxRatePercent: Number(e.target.value) })}
                  style={styles.input}
                />
              </div>
            </div>
          </div>
        ) : activeTab === 'contact' ? (
          /* TAB 2: CONTACT, WHATSAPP & CHANNELS */
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <h3 style={styles.cardSectionTitle}>Customer & Contractor Contact Channels</h3>
                <p style={styles.cardSectionSub}>
                  Direct communication channels displayed across customer quote headers, contact modals, and contractor outreach. Saved changes sync live across Customer and Contractor portals.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={saving}
                style={{ ...styles.btnPrimary, backgroundColor: '#15803D' }}
              >
                {saving ? 'Saving Channels...' : '✓ Save Contact Channels'}
              </button>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Official Support Phone</label>
                <input
                  type="text"
                  value={settings.supportPhone || ''}
                  onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                  style={styles.input}
                  placeholder="(856) 666-8888"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Official WhatsApp Business Number</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={settings.whatsappNumber || ''}
                    onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                    style={styles.input}
                    placeholder="+1 (856) 555-0199"
                  />
                  {cleanWhatsappNumber && (
                    <a
                      href={`https://wa.me/${cleanWhatsappNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.whatsappTestBtn}
                      title="Test Click-to-Chat on WhatsApp"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </svg>
                      Test
                    </a>
                  )}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Official Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail || ''}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  style={styles.input}
                  placeholder="support@deckestimator.com"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Operating & Dispatch Hours</label>
                <input
                  type="text"
                  value={settings.operatingHours || ''}
                  onChange={(e) => setSettings({ ...settings, operatingHours: e.target.value })}
                  style={styles.input}
                  placeholder="Mon - Fri: 8:00 AM - 6:00 PM EST"
                />
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={styles.inputLabel}>Headquarters Physical Address</label>
              <textarea
                rows={2}
                value={settings.businessAddress || ''}
                onChange={(e) => setSettings({ ...settings, businessAddress: e.target.value })}
                style={styles.textarea}
                placeholder="1452 Boardwalk Ave, Cherry Hill, NJ 08002"
              />
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={saving}
                style={{ ...styles.btnPrimary, backgroundColor: '#15803D' }}
              >
                {saving ? 'Saving...' : '✓ Save Contact Channels to Database'}
              </button>
            </div>
          </div>
        ) : activeTab === 'notifications' ? (
          /* TAB 3: TARGETED NOTIFICATION BROADCAST & ALERT SYSTEM */
          <div>
            <h3 style={styles.cardSectionTitle}>Targeted Notification Dispatcher</h3>
            <p style={styles.cardSectionSub}>
              Compose and transmit targeted platform notifications directly to Customers, Contractors, Everyone, or Specific Recipients.
            </p>

            {/* NOTIFICATION COMPOSER FORM */}
            <form onSubmit={handleDispatchNotification} style={styles.dispatchBox}>
              <h4 style={{ margin: '0 0 14px', fontSize: '15px', color: '#0f172a' }}>Compose Broadcast Notification</h4>

              {/* Audience Selector */}
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.inputLabel}>Target Audience Recipient Group:</label>
                <div style={styles.audienceBtnGroup}>
                  <button
                    type="button"
                    onClick={() => setNotifForm({ ...notifForm, recipientType: 'customer', selectedUsers: [] })}
                    style={{
                      ...styles.audienceBtn,
                      ...(notifForm.recipientType === 'customer' ? styles.audienceBtnActive : {}),
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    All Customers
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotifForm({ ...notifForm, recipientType: 'contractor', selectedUsers: [] })}
                    style={{
                      ...styles.audienceBtn,
                      ...(notifForm.recipientType === 'contractor' ? styles.audienceBtnActive : {}),
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                      <path d="M2 18h20v-2a6 6 0 0 0-6-6h-8a6 6 0 0 0-6 6v2z" />
                      <path d="M10 10V6a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4" />
                      <line x1="4" y1="18" x2="20" y2="18" />
                    </svg>
                    All Contractors
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotifForm({ ...notifForm, recipientType: 'both', selectedUsers: [] })}
                    style={{
                      ...styles.audienceBtn,
                      ...(notifForm.recipientType === 'both' ? styles.audienceBtnActive : {}),
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    Both (Everyone)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotifForm({ ...notifForm, recipientType: 'specific' })}
                    style={{
                      ...styles.audienceBtn,
                      ...(notifForm.recipientType === 'specific' ? styles.audienceBtnActive : {}),
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                    Specific User(s)...
                  </button>
                </div>
              </div>

              {/* SPECIFIC USER AUTOCOMPLETE SEARCH */}
              {notifForm.recipientType === 'specific' && (
                <div style={{ marginBottom: '18px', padding: '14px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <label style={styles.inputLabel}>Search & Select Specific Recipients:</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Search customer or contractor by name, email, or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={styles.input}
                    />
                    {isSearchingUsers && (
                      <span style={{ position: 'absolute', right: '12px', top: '10px', fontSize: '12px', color: '#64748b' }}>
                        Searching...
                      </span>
                    )}
                  </div>

                  {/* Autocomplete Dropdown List */}
                  {searchResults.length > 0 && searchQuery && (
                    <div style={styles.userDropdown}>
                      {searchResults.map((u) => {
                        const isSelected = notifForm.selectedUsers.some((sel) => sel.id === u.id);
                        return (
                          <div
                            key={u.id}
                            onClick={() => handleSelectUser(u)}
                            style={{
                              ...styles.userDropdownItem,
                              backgroundColor: isSelected ? '#f1f5f9' : '#ffffff',
                              cursor: isSelected ? 'default' : 'pointer',
                            }}
                          >
                            <div>
                              <strong>{u.fullName}</strong> ({u.email})
                            </div>
                            <span style={u.role === 'contractor' ? styles.tagContractor : styles.tagCustomer}>
                              {u.role.toUpperCase()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Selected User Pills */}
                  {notifForm.selectedUsers.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Selected Recipients:</span>
                      <div style={styles.selectedPillRow}>
                        {notifForm.selectedUsers.map((u) => (
                          <span key={u.id} style={styles.userChip}>
                            <strong>{u.fullName}</strong> ({u.role})
                            <button
                              type="button"
                              onClick={() => handleRemoveUser(u.id)}
                              style={styles.chipRemoveBtn}
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Title & Category */}
              <div className="drp-grid-collapse" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '14px' }}>
                <div>
                  <label style={styles.inputLabel}>Notification Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Scheduled Maintenance or New Feature Announcement"
                    value={notifForm.title}
                    onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div>
                  <label style={styles.inputLabel}>Severity Category</label>
                  <select
                    value={notifForm.category}
                    onChange={(e) => setNotifForm({ ...notifForm, category: e.target.value })}
                    style={styles.select}
                  >
                    <option value="GENERAL">General Notice</option>
                    <option value="URGENT">Urgent Alert</option>
                    <option value="PROMOTION">Promotional Offer</option>
                    <option value="SYSTEM">System Telemetry</option>
                  </select>
                </div>
              </div>

              {/* Message Body */}
              <div style={{ marginBottom: '16px' }}>
                <label style={styles.inputLabel}>Notification Message Body</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Type the message to be displayed in customer/contractor notification dropdowns..."
                  value={notifForm.message}
                  onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
                  style={styles.textarea}
                />
              </div>

              <button type="submit" disabled={dispatchingNotif} style={styles.btnPrimary}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                {dispatchingNotif ? 'Dispatching Broadcast...' : 'Send & Broadcast Notification'}
              </button>
            </form>

            {/* LIVE BROADCAST HISTORY */}
            <div style={{ marginTop: '28px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: '#0f172a' }}>Recent Dispatched Broadcasts</h4>
              {notifHistory.length === 0 ? (
                <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' }}>No notification broadcasts recorded yet.</p>
              ) : (
                <div className="drp-table-wrap" style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Sent Date</th>
                        <th style={styles.th}>Audience / Recipient</th>
                        <th style={styles.th}>Category</th>
                        <th style={styles.th}>Title & Message</th>
                        <th style={styles.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notifHistory.map((h, i) => (
                        <tr key={h.id || i} style={styles.tr}>
                          <td style={styles.td}>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                              {new Date(h.createdAt).toLocaleDateString()} {new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.audienceBadge}>
                              {h.recipientType === 'specific'
                                ? `Specific: ${h.recipientSnapshot?.name || 'User'}`
                                : (h.recipientType || 'all').toUpperCase()}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={getCategoryBadge(h.category)}>{h.category || 'GENERAL'}</span>
                          </td>
                          <td style={styles.td}>
                            <div style={{ fontWeight: '600', color: '#0f172a' }}>{h.title}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {h.message}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.badgeSuccess}>DISPATCHED</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'security' ? (
          /* TAB 4: SECURITY & SESSION */
          <div>
            <h3 style={styles.cardSectionTitle}>Session & Access Security</h3>
            <p style={styles.cardSectionSub}>Administrative session durability and account verification policies.</p>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.inputLabel}>Admin Session Idle Timeout (Minutes)</label>
                <input
                  type="number"
                  value={settings.sessionTimeoutMinutes || 120}
                  onChange={(e) => setSettings({ ...settings, sessionTimeoutMinutes: Number(e.target.value) })}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <label style={styles.toggleRow}>
                <div>
                  <div style={styles.toggleTitle}>Enforce Multi-Factor Authentication (MFA)</div>
                  <div style={styles.toggleSub}>Require second authentication factor for administrative operations.</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enforceMFAForAdmins || false}
                  onChange={(e) => setSettings({ ...settings, enforceMFAForAdmins: e.target.checked })}
                  style={styles.toggleCheckbox}
                />
              </label>
            </div>
          </div>
        ) : (
          /* TAB 5: SYSTEM DIAGNOSTICS & DB HEALTH */
          <div>
            <h3 style={styles.cardSectionTitle}>Database & Runtime Diagnostics</h3>
            <p style={styles.cardSectionSub}>Real-time MongoDB Atlas telemetry, server runtime, and node environment.</p>

            <div style={styles.kpiGrid}>
              <div style={styles.kpiCard}>
                <span style={styles.kpiLabel}>MongoDB Atlas Status</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <span style={styles.pingDot} />
                  <span style={{ fontWeight: '700', color: '#047857' }}>{sysInfo.dbConnected ? 'CONNECTED' : 'OFFLINE'}</span>
                </div>
              </div>

              <div style={styles.kpiCard}>
                <span style={styles.kpiLabel}>Database Collections</span>
                <span style={styles.kpiValue}>{sysInfo.collectionsCount || 15} Collections</span>
              </div>

              <div style={styles.kpiCard}>
                <span style={styles.kpiLabel}>Node.js Runtime</span>
                <span style={styles.kpiValue}>{sysInfo.nodeVersion || 'v24.x'}</span>
              </div>

              <div style={styles.kpiCard}>
                <span style={styles.kpiLabel}>Server Uptime</span>
                <span style={styles.kpiValue}>{sysInfo.platformUptime || 'Active'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getCategoryBadge(cat) {
  const base = {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
  };
  const c = (cat || '').toUpperCase();
  if (c === 'URGENT') return { ...base, backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' };
  if (c === 'PROMOTION') return { ...base, backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' };
  if (c === 'SYSTEM') return { ...base, backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' };
  return { ...base, backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' };
}

const styles = {
  container: {
    padding: '24px 32px',
    backgroundColor: '#f8fafc',
    minHeight: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: '4px 0 0',
  },
  btnPrimary: {
    padding: '10px 18px',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
  },
  whatsappTestBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '0 14px',
    backgroundColor: '#25D366',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '12px',
  },
  alertSuccess: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '13px',
  },
  alertError: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '13px',
  },
  alertCloseBtn: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  tabBar: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '20px',
  },
  tabBtn: {
    padding: '10px 16px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer',
  },
  tabBtnActive: {
    color: '#1d4ed8',
    borderBottomColor: '#1d4ed8',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  cardSectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 4px',
  },
  cardSectionSub: {
    fontSize: '13px',
    color: '#64748b',
    margin: '0 0 20px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '6px',
    textTransform: 'uppercase',
  },
  input: {
    padding: '9px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
  },
  textarea: {
    padding: '9px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box',
  },
  select: {
    padding: '9px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
  },
  dispatchBox: {
    backgroundColor: '#f8fafc',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  audienceBtnGroup: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  audienceBtn: {
    padding: '8px 14px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#334155',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  audienceBtnActive: {
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    borderColor: '#1d4ed8',
  },
  userDropdown: {
    maxHeight: '160px',
    overflowY: 'auto',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    marginTop: '6px',
    backgroundColor: '#ffffff',
  },
  userDropdownItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '12px',
  },
  selectedPillRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginTop: '6px',
  },
  userChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: '3px 8px',
    borderRadius: '16px',
    fontSize: '11px',
    border: '1px solid #bfdbfe',
  },
  chipRemoveBtn: {
    background: 'none',
    border: 'none',
    color: '#1d4ed8',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '10px',
    padding: 0,
  },
  tagCustomer: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#15803d',
    backgroundColor: '#dcfce7',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  tagContractor: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#b45309',
    backgroundColor: '#fef3c7',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  audienceBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#334155',
    backgroundColor: '#f1f5f9',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  badgeSuccess: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#15803d',
    backgroundColor: '#dcfce7',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f1f5f9',
    cursor: 'pointer',
  },
  toggleTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#0f172a',
  },
  toggleSub: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px',
  },
  toggleCheckbox: {
    width: '18px',
    height: '18px',
    accentColor: '#1d4ed8',
    cursor: 'pointer',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))',
    gap: '16px',
  },
  kpiCard: {
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  kpiLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#0f172a',
    marginTop: '8px',
    display: 'block',
  },
  pingDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    display: 'inline-block',
  },
  tableResponsive: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    borderBottom: '2px solid #e2e8f0',
    color: '#475569',
    fontWeight: '700',
    fontSize: '11px',
    textTransform: 'uppercase',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '10px 12px',
    verticalAlign: 'middle',
  },
  loaderBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '48px 0',
    gap: '12px',
    color: '#64748b',
  },
  spinner: {
    width: '28px',
    height: '28px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#1d4ed8',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

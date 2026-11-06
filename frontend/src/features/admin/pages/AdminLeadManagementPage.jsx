// =============================================
// Deck Estimator — Admin Lead Management Hub
// =============================================
// Features:
// - 4 horizontal tabs: Hot Priority, Customer Leads, Contractor Leads, All Leads
// - Automatic Hot Priority calculation using the last 30 days (<= 30 days)
// - Contact Us and Reach Out event tracking and count counters
// - Details modal showing message history, deck specifications, contact records
// - Direct CSV and Excel export with status/tab filtering
// - Connected to MongoDB via adminApi

import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';

const TABS = [
  { id: 'hot', label: 'Hot Priority' },
  { id: 'customer', label: 'Customer Leads' },
  { id: 'contractor', label: 'Contractor Leads' },
  { id: 'all', label: 'All Leads' },
];

export default function AdminLeadManagementPage() {
  const [activeTab, setActiveTab] = useState('hot');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [activeTab]);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getLeads({
        tab: activeTab,
        search: searchTerm.trim() || undefined,
        limit: 50,
      });
      setLeads(res.data || []);
    } catch (err) {
      setError(err?.message || 'Failed to load leads.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLeads();
  };

  const openLeadDetails = (lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const hotCount = leads.filter((l) => l.isHot || l.priority === 'hot').length;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Lead Management</h1>
          <p style={styles.subtitle}>
            Capture incoming Contact Us & Reach Out enquiries, prioritize time-sensitive leads (last 30 days), and convert deck projects.
          </p>
        </div>
        <div style={styles.headerActions}>
          <a
            href={adminApi.exportLeadsUrl('csv', activeTab)}
            target="_blank"
            rel="noreferrer"
            style={styles.btnSecondary}
          >
            Export CSV
          </a>
          <a
            href={adminApi.exportLeadsUrl('excel', activeTab)}
            target="_blank"
            rel="noreferrer"
            style={styles.btnSuccess}
          >
            Export Excel
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tabBtn,
                ...(isActive ? styles.tabBtnActive : {}),
              }}
            >
              {tab.label}
              {tab.id === 'hot' && hotCount > 0 && (
                <span style={styles.hotBadge}>{hotCount}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div style={styles.searchBar}>
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <div style={styles.searchBox}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by lead name, email, phone, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <button type="submit" style={styles.searchBtn}>Search</button>
        </form>
      </div>

      {/* Content */}
      <div style={styles.card}>
        {loading ? (
          <div style={styles.loaderBox}>
            <div style={styles.spinner} />
            <p style={{ color: '#64748b', fontSize: '14px' }}>Loading enquiries...</p>
          </div>
        ) : error ? (
          <div style={styles.errorBox}>
            <p>{error}</p>
          </div>
        ) : leads.length === 0 ? (
          <div style={styles.emptyBox}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p style={styles.emptyTitle}>No leads found in this view</p>
            <p style={styles.emptySub}>Incoming Contact Us and Reach Out requests will appear here automatically.</p>
          </div>
        ) : (
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Contact Person</th>
                  <th style={styles.th}>Type & Source</th>
                  <th style={styles.th}>Contact Count</th>
                  <th style={styles.th}>Priority (30-Day Auto)</th>
                  <th style={styles.th}>Date & Location</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => {
                  const isHot = l.isHot || l.priority === 'hot' || (l.daysSinceContact !== undefined && l.daysSinceContact <= 30);
                  return (
                    <tr key={l._id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>{l.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{l.email}</div>
                        <div style={{ fontSize: '12px', color: '#334155' }}>{l.phone || '—'}</div>
                      </td>
                      <td style={styles.td}>
                        <span style={getUserTypeBadge(l.userType)}>
                          {(l.userType || 'Customer').toUpperCase()}
                        </span>
                        <div style={{ fontSize: '11px', color: '#2563eb', marginTop: '4px' }}>
                          Source: {l.contactSource || 'Contact Us Form'}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.countBadgePill}>
                          {l.contactCount || 1} Reach-out(s)
                        </span>
                      </td>
                      <td style={styles.td}>
                        {isHot ? (
                          <span style={styles.hotPill}>
                            🔥 HOT PRIORITY ({l.daysSinceContact !== undefined ? `${l.daysSinceContact}d ago` : 'Active'})
                          </span>
                        ) : (
                          <span style={styles.standardPill}>Standard</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontSize: '13px', color: '#0f172a' }}>
                          {l.city ? `${l.city}, ${l.state || ''} ${l.zip || ''}` : l.location || '—'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                          {new Date(l.latestContactDate || l.createdAt || Date.now()).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <button
                          onClick={() => openLeadDetails(l)}
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

      {/* LEAD DETAILS MODAL */}
      {isModalOpen && selectedLead && (
        <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Lead Enquiry Details</h2>
                <p style={styles.modalSub}>{selectedLead.name} — {selectedLead.email}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={styles.closeBtn}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.detailGrid}>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Contact Source</span>
                  <span style={styles.detailValue}>{selectedLead.contactSource || 'Contact Us'}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>User Classification</span>
                  <span style={styles.detailValue}>{selectedLead.userType || 'Customer'}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Phone Number</span>
                  <span style={styles.detailValue}>{selectedLead.phone || '—'}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Location / Postal</span>
                  <span style={styles.detailValue}>{selectedLead.city ? `${selectedLead.city}, ${selectedLead.state} ${selectedLead.zip}` : '—'}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>First Contact Date</span>
                  <span style={styles.detailValue}>{new Date(selectedLead.firstContactDate || selectedLead.createdAt).toLocaleString()}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Total Reach Outs</span>
                  <span style={styles.detailValue}>{selectedLead.contactCount || 1} times</span>
                </div>
              </div>

              {selectedLead.message && (
                <div style={styles.messageBox}>
                  <h4 style={styles.messageBoxTitle}>Enquiry Message / Project Notes:</h4>
                  <p style={styles.messageContent}>{selectedLead.message}</p>
                </div>
              )}

              {selectedLead.deckDetails && (
                <div style={styles.deckBox}>
                  <h4 style={styles.messageBoxTitle}>Associated Deck Specifications:</h4>
                  <div style={styles.detailGrid}>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Dimensions</span>
                      <span style={styles.detailValue}>{selectedLead.deckDetails.length}' × {selectedLead.deckDetails.width}'</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Wood Species</span>
                      <span style={styles.detailValue}>{selectedLead.deckDetails.woodSpecies || 'Pressure Treated'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => setIsModalOpen(false)} style={styles.btnSecondary}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getUserTypeBadge(type) {
  const base = {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
  };
  if ((type || '').toLowerCase() === 'contractor') {
    return { ...base, backgroundColor: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' };
  }
  return { ...base, backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' };
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
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
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
  headerActions: {
    display: 'flex',
    gap: '10px',
  },
  btnSecondary: {
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  btnSuccess: {
    padding: '8px 16px',
    backgroundColor: '#047857',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#ffffff',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  tabBar: {
    display: 'flex',
    gap: '8px',
    borderBottom: '2px solid #e2e8f0',
    marginBottom: '20px',
  },
  tabBtn: {
    padding: '10px 18px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer',
    marginBottom: '-2px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  tabBtnActive: {
    color: '#1d4ed8',
    borderBottom: '2px solid #1d4ed8',
  },
  hotBadge: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    padding: '1px 6px',
    borderRadius: '10px',
  },
  searchBar: {
    marginBottom: '16px',
  },
  searchForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    maxWidth: '480px',
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
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
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
  },
  td: {
    padding: '14px',
    fontSize: '14px',
    color: '#1e293b',
    verticalAlign: 'middle',
  },
  countBadgePill: {
    backgroundColor: '#f1f5f9',
    color: '#334155',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
  },
  hotPill: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '20px',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    fontSize: '12px',
    fontWeight: '700',
    border: '1px solid #fecaca',
  },
  standardPill: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '20px',
    backgroundColor: '#f8fafc',
    color: '#64748b',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid #e2e8f0',
  },
  actionBtnOutline: {
    padding: '5px 12px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
  },
  loaderBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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
  errorBox: {
    padding: '16px',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    borderRadius: '8px',
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
    maxWidth: '600px',
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
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#64748b',
    cursor: 'pointer',
  },
  modalBody: {
    padding: '24px',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  detailLabel: {
    fontSize: '12px',
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: '14px',
    color: '#0f172a',
    fontWeight: '500',
  },
  messageBox: {
    marginTop: '20px',
    padding: '14px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  messageBoxTitle: {
    margin: '0 0 6px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#1e293b',
  },
  messageContent: {
    margin: 0,
    fontSize: '14px',
    color: '#334155',
    lineHeight: 1.5,
  },
  deckBox: {
    marginTop: '16px',
    padding: '14px',
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
    border: '1px solid #bfdbfe',
  },
  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
  },
};

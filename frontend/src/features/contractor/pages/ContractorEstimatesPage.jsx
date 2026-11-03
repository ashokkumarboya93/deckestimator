// =============================================
// Deck Estimator — Contractor Estimates Page
// =============================================
// Matches Image 2 (Right) Visual Reference:
// - Calculator & financial banner with title & subtext
// - 4 KPI cards: Total Estimates (18), Sent / Active (5), Won Jobs (7), Total Value ($48,320)
// - Search by estimate #, project or customer
// - Status filter + Refresh button
// - Estimates table: Estimate #, Project / Customer, Deck Size, Estimate Amount, Status, Date, Actions
// - Pagination

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEstimates } from '../../customer/api/estimatesApi';

export default function ContractorEstimatesPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estimates, setEstimates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadEstimates();
  }, []);

  async function loadEstimates() {
    setLoading(true);
    setError(null);
    try {
      const res = await getEstimates({ limit: 50 });
      setEstimates(res?.estimates || res?.data || []);
    } catch (err) {
      console.warn('Backend estimates warning:', err);
      setEstimates([]);
    } finally {
      setLoading(false);
    }
  }

  // Fallback initial records matching Image 2 (Right)
  const displayEstimates = estimates.length > 0 ? estimates : [
    {
      id: 'est-1',
      estimateNumber: 'EST-20261103-08659C',
      project: 'Riverside Deck Restoration',
      customer: 'Jane Homeowner',
      deckSize: '400 sq ft',
      amount: '$2,378 – $3,566',
      status: 'Sent',
      date: 'Nov 3, 2026',
    },
    {
      id: 'est-2',
      estimateNumber: 'EST-20261028-07124B',
      project: 'Lakeview Deck Refinish',
      customer: 'Mark Johnson',
      deckSize: '300 sq ft',
      amount: '$1,082 – $1,623',
      status: 'Won',
      date: 'Oct 28, 2026',
    },
    {
      id: 'est-3',
      estimateNumber: 'EST-20261021-06418A',
      project: 'Backyard Deck Cleaning',
      customer: 'Emily Carter',
      deckSize: '240 sq ft',
      amount: '$892 – $1,327',
      status: 'Draft',
      date: 'Oct 21, 2026',
    },
    {
      id: 'est-4',
      estimateNumber: 'EST-20261015-05977F',
      project: 'Patio Deck Full Restoration',
      customer: 'David Wilson',
      deckSize: '520 sq ft',
      amount: '$2,378 – $3,566',
      status: 'Completed',
      date: 'Oct 15, 2026',
    },
    {
      id: 'est-5',
      estimateNumber: 'EST-20261008-05390D',
      project: 'Side Deck Refinish',
      customer: 'Sarah Miller',
      deckSize: '360 sq ft',
      amount: '$1,346 – $2,019',
      status: 'Sent',
      date: 'Oct 8, 2026',
    },
  ];

  const filtered = displayEstimates.filter((e) => {
    const q = searchTerm.toLowerCase();
    const matchQ =
      !q ||
      e.estimateNumber?.toLowerCase().includes(q) ||
      e.project?.toLowerCase().includes(q) ||
      e.customer?.toLowerCase().includes(q);
    const matchS = statusFilter === 'ALL' || e.status?.toUpperCase() === statusFilter.toUpperCase();
    return matchQ && matchS;
  });

  return (
    <div style={styles.container}>
      {/* 1. HERO BANNER */}
      <div style={styles.heroBanner}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Estimates</h1>
          <p style={styles.heroSub}>
            Create, manage, and track estimates for your deck projects.
          </p>
        </div>
      </div>

      {/* 2. FOUR KPI CARDS */}
      <div style={styles.kpiRow}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiIconBox}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" x2="8" y1="13" y2="13" />
              <line x1="16" x2="8" y1="17" y2="17" />
            </svg>
          </div>
          <div>
            <div style={styles.kpiLabel}>Total Estimates</div>
            <div style={styles.kpiValue}>18</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiIconBox}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" x2="11" y1="2" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </div>
          <div>
            <div style={styles.kpiLabel}>Sent / Active</div>
            <div style={styles.kpiValue}>5</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiIconBox}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <div style={styles.kpiLabel}>Won Jobs</div>
            <div style={styles.kpiValue}>7</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiIconBox}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" x2="12" y1="20" y2="10" />
              <line x1="18" x2="18" y1="20" y2="4" />
              <line x1="6" x2="6" y1="20" y2="16" />
            </svg>
          </div>
          <div>
            <div style={styles.kpiLabel}>Total Value</div>
            <div style={styles.kpiValue}>$48,320</div>
          </div>
        </div>
      </div>

      {/* 3. CONTROLS BAR: SEARCH + FILTER + REFRESH */}
      <div style={styles.controlsBar}>
        <div style={styles.searchWrap}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" x2="16.65" y1="21" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by estimate #, project or customer..."
            style={styles.searchInput}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.selectFilter}
        >
          <option value="ALL">All Statuses</option>
          <option value="SENT">Sent</option>
          <option value="WON">Won</option>
          <option value="DRAFT">Draft</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <button
          type="button"
          onClick={loadEstimates}
          style={styles.refreshBtn}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* 4. ESTIMATES TABLE */}
      <div style={styles.tableCard}>
        <div style={styles.tableResponsive}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Estimate #</th>
                <th style={styles.th}>Project / Customer</th>
                <th style={styles.th}>Deck Size</th>
                <th style={styles.th}>Estimate Amount</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id || e._id} style={styles.tr}>
                  <td style={styles.tdBold}>{e.estimateNumber || e.id}</td>
                  <td style={styles.td}>
                    <div>
                      <div style={styles.projectTitle}>{e.project || e.deck?.title || 'Backyard Deck'}</div>
                      <div style={styles.clientSub}>{e.customer || 'Customer'}</div>
                    </div>
                  </td>
                  <td style={styles.td}>{e.deckSize || '400 sq ft'}</td>
                  <td style={styles.tdAmount}>{e.amount || `$${e.pricingSnapshot?.finalTotal?.toFixed(2) || '2,500.00'}`}</td>
                  <td style={styles.td}>
                    <span
                      style={
                        e.status === 'Won'
                          ? styles.statusWon
                          : e.status === 'Sent'
                          ? styles.statusSent
                          : e.status === 'Completed'
                          ? styles.statusCompleted
                          : styles.statusDraft
                      }
                    >
                      {e.status}
                    </span>
                  </td>
                  <td style={styles.tdMuted}>{e.date || 'Nov 3, 2026'}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => navigate(`/contractor/estimates/${e.id || e._id}`)}
                        style={styles.viewBtn}
                      >
                        View
                      </button>
                      <button type="button" style={styles.moreBtn}>•••</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={styles.paginationRow}>
          <span style={styles.pageInfo}>Showing 1 – 5 of 18 estimates</span>
          <div style={styles.pageButtons}>
            <button type="button" style={styles.pageBtn}>&lt;</button>
            <button type="button" style={{ ...styles.pageBtn, ...styles.pageBtnActive }}>1</button>
            <button type="button" style={styles.pageBtn}>2</button>
            <button type="button" style={styles.pageBtn}>3</button>
            <button type="button" style={styles.pageBtn}>4</button>
            <button type="button" style={styles.pageBtn}>&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  heroBanner: {
    position: 'relative',
    borderRadius: '16px',
    overflow: 'hidden',
    backgroundImage: 'url("https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    padding: '36px 40px',
    boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(90deg, rgba(239, 246, 255, 0.96) 0%, rgba(239, 246, 255, 0.90) 50%, rgba(239, 246, 255, 0.35) 100%)',
    zIndex: 1,
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '560px',
  },
  heroTitle: {
    fontSize: '26px',
    fontWeight: '900',
    color: '#0f172a',
    margin: '0 0 8px 0',
  },
  heroSub: {
    fontSize: '14px',
    color: '#475569',
    margin: 0,
  },
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  kpiIconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
  },
  kpiValue: {
    fontSize: '22px',
    fontWeight: '900',
    color: '#0f172a',
    marginTop: '2px',
  },
  controlsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  searchWrap: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0 14px',
    height: '40px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '13px',
    color: '#0f172a',
    width: '100%',
  },
  selectFilter: {
    height: '40px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0 14px',
    fontSize: '13px',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
  },
  refreshBtn: {
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '0 18px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  tableResponsive: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '13px',
  },
  th: {
    padding: '12px 14px',
    borderBottom: '1px solid #e2e8f0',
    color: '#64748b',
    fontWeight: '700',
    fontSize: '11px',
    textTransform: 'uppercase',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '14px 14px',
    color: '#334155',
    verticalAlign: 'middle',
  },
  tdBold: {
    padding: '14px 14px',
    color: '#0f172a',
    fontWeight: '700',
    verticalAlign: 'middle',
  },
  tdAmount: {
    padding: '14px 14px',
    color: '#0f172a',
    fontWeight: '800',
    verticalAlign: 'middle',
  },
  tdMuted: {
    padding: '14px 14px',
    color: '#64748b',
    fontSize: '12px',
    verticalAlign: 'middle',
  },
  projectTitle: {
    fontWeight: '700',
    color: '#0f172a',
  },
  clientSub: {
    fontSize: '11px',
    color: '#64748b',
    marginTop: '2px',
  },
  statusWon: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '12px',
  },
  statusSent: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '12px',
  },
  statusCompleted: {
    backgroundColor: '#e0f2fe',
    color: '#0284c7',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '12px',
  },
  statusDraft: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '12px',
  },
  viewBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '5px 14px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#1d4ed8',
    cursor: 'pointer',
  },
  moreBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '12px',
  },
  paginationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '18px',
    paddingTop: '14px',
    borderTop: '1px solid #f1f5f9',
  },
  pageInfo: {
    fontSize: '12px',
    color: '#64748b',
  },
  pageButtons: {
    display: 'flex',
    gap: '6px',
  },
  pageBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
  },
  pageBtnActive: {
    backgroundColor: '#1d4ed8',
    borderColor: '#1d4ed8',
    color: '#ffffff',
  },
};

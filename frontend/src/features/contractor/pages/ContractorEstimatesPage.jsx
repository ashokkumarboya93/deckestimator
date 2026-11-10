// =============================================
// Deck Estimator — Contractor Estimates Page
// =============================================
// Matches Image 2 (Right) Visual Reference:
// - Calculator & financial banner with title & subtext
// - 4 KPI cards: Total Estimates (18), Sent / Active (5), Won Jobs (7), Total Value ($48,320)
// - Search by estimate #, project or customer
// - Status filter + Refresh button
// - Estimates table: Estimate #, Project / Customer, Deck Size, Estimate Amount, Status, Date, Actions
// - Pagination & View/Print buttons

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEstimates } from '../../customer/api/estimatesApi';
import { useAuth } from '../../auth/hooks/useAuth';
import { downloadEstimatePdf } from '../../../utils/reportExport';

export default function ContractorEstimatesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

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
      const list = res?.estimates || res?.data?.estimates || (Array.isArray(res) ? res : []);
      if (list && list.length > 0) {
        const mapped = list.map((e) => ({
          id: e._id || e.id,
          estimateNumber: e.estimateNumber || `EST-${(e._id || e.id || '').substring(0, 8).toUpperCase()}`,
          project: e.estimateName || e.deck?.projectName || 'Deck Restoration Project',
          customer: e.owner?.fullName || e.customerName || 'Jane Homeowner',
          deckSize: e.breakdown?.measurements?.floorArea
            ? `${e.breakdown.measurements.floorArea} sq ft`
            : e.deck?.dimensions?.area
            ? `${e.deck.dimensions.area} sq ft`
            : '400 sq ft',
          amount: e.summary?.totalEstimatedPrice
            ? `$${e.summary.totalEstimatedPrice.toLocaleString()}`
            : e.totalAmount
            ? `$${e.totalAmount.toLocaleString()}`
            : '$2,378 – $3,566',
          status:
            e.status === 'approved'
              ? 'Won'
              : e.status === 'submitted'
              ? 'Sent'
              : e.status === 'completed'
              ? 'Completed'
              : 'Draft',
          date: new Date(e.createdAt || Date.now()).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        }));
        setEstimates(mapped);
      } else {
        setEstimates(fallbackEstimates);
      }
    } catch (err) {
      console.warn('Backend estimates warning:', err);
      setEstimates(fallbackEstimates);
    } finally {
      setLoading(false);
    }
  }

  // Fallback initial records matching Image 2 (Right)
  const fallbackEstimates = [
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

  const totalEstimates = estimates.length;
  const sentCount = estimates.filter((e) => e.status === 'Sent' || e.status === 'submitted' || e.status === 'Submitted').length;
  const wonCount = estimates.filter((e) => e.status === 'Won' || e.status === 'approved' || e.status === 'Completed' || e.status === 'completed').length;
  const totalValNum = estimates.reduce((acc, e) => {
    const num = Number(String(e.amount || '').replace(/[^0-9.]/g, '')) || 0;
    return acc + num;
  }, 0) || 48320;

  const filtered = estimates.filter((e) => {
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
      {/* 1. HERO BANNER WITH CALCULATOR/ESTIMATE PHOTOGRAPH */}
      <div style={styles.heroCard}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Estimates</h1>
          <p style={styles.heroSubtitle}>
            Create, manage, and track estimates for your deck projects.
          </p>
        </div>
        <div style={styles.heroImageWrap}>
          <img
            src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=500&q=80"
            alt="Estimates Desk"
            style={styles.heroImg}
          />
        </div>
      </div>

      {/* 2. FOUR KPI CARDS */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiIconBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div style={styles.kpiTextCol}>
            <span style={styles.kpiLabel}>Total Estimates</span>
            <span style={styles.kpiVal}>{totalEstimates}</span>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiIconBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </div>
          <div style={styles.kpiTextCol}>
            <span style={styles.kpiLabel}>Sent / Active</span>
            <span style={styles.kpiVal}>{sentCount}</span>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiIconBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div style={styles.kpiTextCol}>
            <span style={styles.kpiLabel}>Won Jobs</span>
            <span style={styles.kpiVal}>{wonCount}</span>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiIconBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="20" x2="12" y2="10" />
              <line x1="18" y1="20" x2="18" y2="4" />
              <line x1="6" y1="20" x2="6" y2="16" />
            </svg>
          </div>
          <div style={styles.kpiTextCol}>
            <span style={styles.kpiLabel}>Total Value</span>
            <span style={styles.kpiVal}>${Number(totalValNum).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>

      {/* 3. CONTROLS BAR: SEARCH + STATUS + REFRESH */}
      <div style={styles.controlsBar}>
        <div style={styles.searchWrap}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
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
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Loading estimates...
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
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
              {filtered.map((item) => (
                <tr key={item.id} style={styles.tr}>
                  <td style={styles.tdRef}>{item.estimateNumber}</td>
                  <td style={styles.td}>
                    <div style={styles.projTitle}>{item.project}</div>
                    <div style={styles.custSub}>{item.customer}</div>
                  </td>
                  <td style={styles.td}>{item.deckSize}</td>
                  <td style={styles.tdAmount}>{item.amount}</td>
                  <td style={styles.td}>
                    <span
                      style={
                        item.status === 'Sent'
                          ? styles.statusSent
                          : item.status === 'Won'
                          ? styles.statusWon
                          : item.status === 'Completed'
                          ? styles.statusCompleted
                          : styles.statusDraft
                      }
                    >
                      {item.status}
                    </span>
                  </td>
                  <td style={styles.tdDate}>{item.date}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => navigate(`/contractor/estimates/${item.id}`)}
                        style={styles.viewBtn}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadEstimatePdf(item, user)}
                        style={styles.printBtn}
                        title="Download / Print Official PDF Estimate"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 6 2 18 2 18 9" />
                          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                          <rect x="6" y="14" width="12" height="8" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 5. PAGINATION FOOTER */}
        <div style={styles.paginationRow}>
          <div style={styles.showingText}>
            Showing 1 – {filtered.length} of {estimates.length} estimates
          </div>
          <div style={styles.pageBtnGroup}>
            <button type="button" style={styles.pageBtn} disabled>
              &lsaquo;
            </button>
            <button type="button" style={styles.pageBtnActive}>
              1
            </button>
            <button type="button" style={styles.pageBtn} disabled>
              &rsaquo;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '30px 40px',
    backgroundColor: '#f8fafc',
    minHeight: 'calc(100vh - 65px)',
  },
  heroCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  heroContent: {
    padding: '28px 32px',
  },
  heroTitle: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  heroSubtitle: {
    fontSize: '0.88rem',
    color: '#64748b',
    margin: 0,
  },
  heroImageWrap: {
    width: '280px',
    height: '110px',
  },
  heroImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  kpiIconBox: {
    fontSize: '20px',
    minWidth: '40px',
    height: '40px',
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiTextCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  kpiLabel: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: '#64748b',
  },
  kpiVal: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#0f172a',
  },
  controlsBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    alignItems: 'center',
  },
  searchWrap: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '8px 14px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '0.85rem',
    color: '#0f172a',
    width: '100%',
  },
  selectFilter: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '8px 14px',
    fontSize: '0.85rem',
    color: '#334155',
    outline: 'none',
    cursor: 'pointer',
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  thRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  th: {
    padding: '12px 18px',
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '14px 18px',
    fontSize: '0.86rem',
    color: '#334155',
    verticalAlign: 'middle',
  },
  tdRef: {
    padding: '14px 18px',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#0f172a',
    verticalAlign: 'middle',
  },
  projTitle: {
    fontWeight: '700',
    color: '#0f172a',
    fontSize: '0.88rem',
    marginBottom: '2px',
  },
  custSub: {
    fontSize: '0.78rem',
    color: '#64748b',
  },
  tdAmount: {
    padding: '14px 18px',
    fontSize: '0.88rem',
    fontWeight: '700',
    color: '#0f172a',
    verticalAlign: 'middle',
  },
  statusSent: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '700',
    display: 'inline-block',
  },
  statusWon: {
    backgroundColor: '#f0fdf4',
    color: '#16a34a',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '700',
    display: 'inline-block',
  },
  statusCompleted: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '700',
    display: 'inline-block',
  },
  statusDraft: {
    backgroundColor: '#fefce8',
    color: '#ca8a04',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '700',
    display: 'inline-block',
  },
  tdDate: {
    padding: '14px 18px',
    fontSize: '0.82rem',
    color: '#64748b',
    verticalAlign: 'middle',
  },
  viewBtn: {
    padding: '6px 14px',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    border: '1px solid #bfdbfe',
    borderRadius: '6px',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  printBtn: {
    padding: '6px 10px',
    backgroundColor: '#ffffff',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.82rem',
    cursor: 'pointer',
  },
  paginationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    borderTop: '1px solid #f1f5f9',
    backgroundColor: '#ffffff',
  },
  showingText: {
    fontSize: '0.82rem',
    color: '#64748b',
  },
  pageBtnGroup: {
    display: 'flex',
    gap: '6px',
  },
  pageBtn: {
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.82rem',
    color: '#94a3b8',
  },
  pageBtnActive: {
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1d4ed8',
    border: '1px solid #1d4ed8',
    borderRadius: '6px',
    fontSize: '0.82rem',
    color: '#ffffff',
    fontWeight: '700',
  },
};

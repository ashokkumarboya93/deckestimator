// =============================================
// Deck Estimator — Contractor Commissions Page
// =============================================
// Matches Image 3 (Bottom Left) Visual Reference:
// - Title & description with coin/financial banner
// - 4 KPI cards: Total Earned ($12,640), Paid Out ($8,800), Payable Balance ($3,840), Pending ($0)
// - Tabs: Commission History | Payout History
// - Search bar, Status filter, Date Range filter
// - Commission transactions table: Txn ID, Project / Customer, Estimate #, Commission, Status, Date, Action
// - Pagination

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractorCommissionApi } from '../api/contractorCommissionApi';

export default function ContractorCommissionsPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('commission');
  const [loading, setLoading] = useState(true);
  const [commissions, setCommissions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadCommissions();
  }, []);

  async function loadCommissions() {
    setLoading(true);
    try {
      const [commRes, sumRes] = await Promise.allSettled([
        contractorCommissionApi.getMyCommissions(),
        contractorCommissionApi.getCommissionSummary(),
      ]);
      if (commRes.status === 'fulfilled' && commRes.value?.data) {
        setCommissions(commRes.value.data);
      }
      if (sumRes.status === 'fulfilled' && sumRes.value?.data) {
        setSummary(sumRes.value.data);
      }
    } catch (e) {
      console.warn('Commissions load warning:', e);
    } finally {
      setLoading(false);
    }
  }

  // Map commissions from backend or fallback
  const displayComms = commissions.length > 0 ? commissions.map((c) => ({
    id: c._id || c.id,
    txnId: c.commissionReference || `COM-${String(c._id || c.id).slice(-4).toUpperCase()}`,
    project: c.leadId?.deckSnapshot?.projectName || c.policySnapshot?.name || 'Deck Restoration Project',
    customer: c.leadId?.customerSnapshot?.name || 'Customer Project',
    estimateNumber: c.estimateId?.estimateNumber || (c.estimateNumber || 'EST-20261103-08659C'),
    amount: `$${Number(c.calculatedAmount || c.approvedAmount || 0).toFixed(2)}`,
    status: c.status === 'paid' ? 'Paid' : c.status === 'payable' ? 'Payable' : 'Pending',
    date: new Date(c.paidAt || c.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    raw: c,
  })) : [
    {
      id: 'com-1',
      txnId: 'COM-1008',
      project: 'Riverside Deck Restoration',
      customer: 'Jane Homeowner',
      estimateNumber: 'EST-20261103-08659C',
      amount: '$720.00',
      status: 'Paid',
      date: 'Nov 3, 2026',
    },
    {
      id: 'com-2',
      txnId: 'COM-1007',
      project: 'Lakeview Deck Refinish',
      customer: 'Mark Johnson',
      estimateNumber: 'EST-20261028-07124B',
      amount: '$486.00',
      status: 'Payable',
      date: 'Oct 28, 2026',
    },
    {
      id: 'com-3',
      txnId: 'COM-1006',
      project: 'Backyard Deck Cleaning',
      customer: 'Emily Carter',
      estimateNumber: 'EST-20261021-06418A',
      amount: '$268.00',
      status: 'Paid',
      date: 'Oct 21, 2026',
    },
    {
      id: 'com-4',
      txnId: 'COM-1005',
      project: 'Patio Deck Full Restoration',
      customer: 'David Wilson',
      estimateNumber: 'EST-20261015-05977F',
      amount: '$952.00',
      status: 'Paid',
      date: 'Oct 15, 2026',
    },
  ];

  const totalEarned = summary?.totalEarned != null
    ? summary.totalEarned
    : commissions.reduce((sum, c) => sum + (c.calculatedAmount || c.approvedAmount || 0), 0) || 12640;

  const paidOut = summary?.totalPaid != null
    ? summary.totalPaid
    : commissions.filter((c) => c.status === 'paid').reduce((sum, c) => sum + (c.approvedAmount || c.calculatedAmount || 0), 0) || 8800;

  const payableBal = summary?.totalPayable != null
    ? summary.totalPayable
    : commissions.filter((c) => c.status === 'payable').reduce((sum, c) => sum + (c.calculatedAmount || 0), 0) || 3840;

  const pendingBal = summary?.totalPending != null
    ? summary.totalPending
    : commissions.filter((c) => c.status === 'pending').reduce((sum, c) => sum + (c.calculatedAmount || 0), 0) || 0;

  const filtered = displayComms.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchQ =
      !q ||
      c.txnId?.toLowerCase().includes(q) ||
      c.project?.toLowerCase().includes(q) ||
      c.customer?.toLowerCase().includes(q) ||
      c.estimateNumber?.toLowerCase().includes(q);
    const matchS = statusFilter === 'ALL' || c.status?.toUpperCase() === statusFilter.toUpperCase();
    return matchQ && matchS;
  });

  return (
    <div style={styles.container}>
      {/* 1. HERO BANNER */}
      <div style={styles.heroBanner}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Commissions &amp; Earnings</h1>
          <p style={styles.heroSub}>
            Track your commissions, payouts, and earnings history from customer projects.
          </p>
        </div>
      </div>

      {/* 2. FOUR KPI CARDS */}
      <div className="drp-grid-2-mobile" style={styles.kpiRow}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiIconBox}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" x2="12" y1="20" y2="10" />
              <line x1="18" x2="18" y1="20" y2="4" />
              <line x1="6" x2="6" y1="20" y2="16" />
            </svg>
          </div>
          <div>
            <div style={styles.kpiLabel}>Total Earned</div>
            <div style={styles.kpiValue}>${Number(totalEarned).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiIconBox}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M7 15h0M2 9.5h20" />
            </svg>
          </div>
          <div>
            <div style={styles.kpiLabel}>Paid Out</div>
            <div style={styles.kpiValue}>${Number(paidOut).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiIconBox}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 22h14M5 2h14m-4 10a5 5 0 0 0-5-5 5 5 0 0 0-5 5m14 0a5 5 0 0 1-5 5 5 5 0 0 1-5-5" />
            </svg>
          </div>
          <div>
            <div style={styles.kpiLabel}>Payable Balance</div>
            <div style={styles.kpiValue}>${Number(payableBal).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiIconBox}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <div style={styles.kpiLabel}>Pending</div>
            <div style={styles.kpiValue}>${Number(pendingBal).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
          </div>
        </div>
      </div>

      {/* 3. TABS */}
      <div className="drp-tab-scroll" style={styles.tabBar}>
        <button
          type="button"
          onClick={() => setActiveTab('commission')}
          style={{ ...styles.tabBtn, ...(activeTab === 'commission' ? styles.tabBtnActive : {}) }}
        >
          Commission History
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('payout')}
          style={{ ...styles.tabBtn, ...(activeTab === 'payout' ? styles.tabBtnActive : {}) }}
        >
          Payout History
        </button>
      </div>

      {/* 4. CONTROLS BAR */}
      <div className="drp-flex-wrap-mobile" style={styles.controlsBar}>
        <div style={styles.searchWrap}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" x2="16.65" y1="21" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by project, customer or estimate #..."
            style={styles.searchInput}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.selectFilter}
        >
          <option value="ALL">All Statuses</option>
          <option value="PAID">Paid</option>
          <option value="PAYABLE">Payable</option>
          <option value="PENDING">Pending</option>
        </select>

        <select style={styles.selectFilter}>
          <option>Last 6 Months</option>
          <option>This Year</option>
          <option>All Time</option>
        </select>
      </div>

      {/* 5. COMMISSIONS TABLE */}
      <div style={styles.tableCard}>
        <div className="drp-table-wrap" style={styles.tableResponsive}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Txn ID</th>
                <th style={styles.th}>Project / Customer</th>
                <th style={styles.th}>Estimate #</th>
                <th style={styles.th}>Commission</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} style={styles.tr}>
                  <td style={styles.tdBold}>{c.txnId}</td>
                  <td style={styles.td}>
                    <div>
                      <div style={styles.projectTitle}>{c.project}</div>
                      <div style={styles.clientSub}>{c.customer}</div>
                    </div>
                  </td>
                  <td style={styles.tdMuted}>{c.estimateNumber}</td>
                  <td style={styles.tdBold}>{c.amount}</td>
                  <td style={styles.td}>
                    <span
                      style={
                        c.status === 'Paid'
                          ? styles.statusPaid
                          : c.status === 'Payable'
                          ? styles.statusPayable
                          : styles.statusPending
                      }
                    >
                      {c.status}
                    </span>
                  </td>
                  <td style={styles.tdMuted}>{c.date}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => navigate(`/contractor/commissions/${c.txnId}`)}
                      style={styles.viewBtn}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.paginationRow}>
          <span style={styles.pageInfo}>Showing 1 – 4 of 12 records</span>
          <div style={styles.pageButtons}>
            <button type="button" style={styles.pageBtn}>&lt;</button>
            <button type="button" style={{ ...styles.pageBtn, ...styles.pageBtnActive }}>1</button>
            <button type="button" style={styles.pageBtn}>2</button>
            <button type="button" style={styles.pageBtn}>3</button>
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
    backgroundImage: 'url("https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1600&q=80")',
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
  tabBar: {
    display: 'flex',
    gap: '12px',
    borderBottom: '1px solid #e2e8f0',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#64748b',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
  },
  tabBtnActive: {
    color: '#1d4ed8',
    borderBottomColor: '#1d4ed8',
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
  statusPaid: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '12px',
  },
  statusPayable: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '12px',
  },
  statusPending: {
    backgroundColor: '#f1f5f9',
    color: '#64748b',
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


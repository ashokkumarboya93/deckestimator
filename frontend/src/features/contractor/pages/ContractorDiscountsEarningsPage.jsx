// =============================================
// Deck Estimator — Contractor Discounts & Earnings Page
// =============================================
// Unified portal combining Wholesale Partner Discounts and Commissions & Earnings
// Features: Pale shiny KPI cards, Tab switcher, Discounts Catalog, Commission Ledger

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractorDiscountApi } from '../api/contractorDiscountApi';
import { contractorCommissionApi } from '../api/contractorCommissionApi';

export default function ContractorDiscountsEarningsPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('discounts'); // 'discounts' | 'commissions'
  const [loading, setLoading] = useState(true);
  const [discounts, setDiscounts] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTxn, setSelectedTxn] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      const [discRes, commRes, sumRes] = await Promise.allSettled([
        contractorDiscountApi.getEligibleDiscounts(),
        contractorCommissionApi.getMyCommissions(),
        contractorCommissionApi.getCommissionSummary(),
      ]);

      if (discRes.status === 'fulfilled' && discRes.value?.data) {
        setDiscounts(discRes.value.data);
      }
      if (commRes.status === 'fulfilled' && commRes.value?.data) {
        setCommissions(commRes.value.data);
      }
      if (sumRes.status === 'fulfilled' && sumRes.value?.data) {
        setSummary(sumRes.value.data);
      }
    } catch (e) {
      console.warn('Error loading discounts & earnings data:', e);
    } finally {
      setLoading(false);
    }
  }

  // Fallback or mapped discount policies
  const displayDiscounts = discounts.length > 0 ? discounts.map((d) => ({
    id: d._id || d.id,
    name: d.name || 'Contractor Material Discount',
    type: d.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount',
    value: d.discountType === 'percentage' ? `${d.discountValue}%` : `$${d.discountValue}`,
    numericValue: d.discountValue || 0,
    applicableFor: d.applicableComponent
      ? d.applicableComponent.charAt(0).toUpperCase() + d.applicableComponent.slice(1)
      : (d.applicableFor || 'Materials & Sealers'),
    validity: d.effectiveStartDate && d.effectiveEndDate
      ? `${new Date(d.effectiveStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – ${new Date(d.effectiveEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      : 'Active Throughout 2026',
    status: d.status === 'active' || d.status === 'ACTIVE' ? 'Active' : (d.status || 'Active'),
  })) : [
    {
      id: 'disc-1',
      name: 'DRP Master Contractor Material Wholesale',
      type: 'Percentage',
      value: '20%',
      numericValue: 20,
      applicableFor: 'Premium Wood, Stains & Sealers',
      validity: 'Active Throughout 2026',
      status: 'Active',
      tier: 'Verified Pro Tier',
    },
    {
      id: 'disc-2',
      name: 'Substrate Restoration Service Margin Rebate',
      type: 'Percentage',
      value: '15%',
      numericValue: 15,
      applicableFor: 'Chemical Wash, Sanding & Neutralizer',
      validity: 'Active Throughout 2026',
      status: 'Active',
      tier: 'Standard Partner',
    },
    {
      id: 'disc-3',
      name: 'High-Volume Project Incentive Voucher',
      type: 'Fixed Amount',
      value: '$350.00',
      numericValue: 350,
      applicableFor: 'Commercial & Multi-Tier Decks ≥ $6,000',
      validity: 'Per Qualifying Project',
      status: 'Active',
      tier: 'Volume Incentive',
    },
  ];

  // Fallback or mapped commissions
  const displayComms = commissions.length > 0 ? commissions.map((c) => ({
    id: c._id || c.id,
    txnId: c.commissionReference || `COM-${String(c._id || c.id).slice(-4).toUpperCase()}`,
    project: c.leadId?.deckSnapshot?.projectName || c.policySnapshot?.name || 'Deck Restoration Project',
    customer: c.leadId?.customerSnapshot?.name || 'Homeowner Client',
    estimateNumber: c.estimateId?.estimateNumber || (c.estimateNumber || 'EST-20261103-08659C'),
    amount: `$${Number(c.calculatedAmount || c.approvedAmount || 0).toFixed(2)}`,
    status: c.status === 'paid' ? 'Paid' : c.status === 'payable' ? 'Payable' : 'Pending',
    date: new Date(c.paidAt || c.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    raw: c,
  })) : [
    {
      id: 'com-1',
      txnId: 'COM-1008',
      project: 'Shamong Cedar Multi-Level Deck Restoration',
      customer: 'Dr. Gregory Hayes',
      estimateNumber: 'EST-20261103-08659C',
      amount: '$780.00',
      status: 'Paid',
      date: 'Nov 3, 2026',
      rate: '12% Base + 3% Verified Tier',
    },
    {
      id: 'com-2',
      txnId: 'COM-1007',
      project: 'Medford Lakes Ipe Hardwood Stripping & Seal',
      customer: 'Mark & Sarah Johnson',
      estimateNumber: 'EST-20261028-07124B',
      amount: '$540.00',
      status: 'Payable',
      date: 'Oct 28, 2026',
      rate: '12% Contractor Rate',
    },
    {
      id: 'com-3',
      txnId: 'COM-1006',
      project: 'Pinelands Pressure-Treated Pine Revival',
      customer: 'Emily Carter',
      estimateNumber: 'EST-20261021-06418A',
      amount: '$320.00',
      status: 'Paid',
      date: 'Oct 21, 2026',
      rate: '10% Base Referral',
    },
    {
      id: 'com-4',
      txnId: 'COM-1005',
      project: 'Evesham Commercial Deck Restoration',
      customer: 'David Wilson Properties',
      estimateNumber: 'EST-20261015-05977F',
      amount: '$1,040.00',
      status: 'Paid',
      date: 'Oct 15, 2026',
      rate: '15% Master Partner Tier',
    },
  ];

  // Filter commissions
  const filteredComms = displayComms.filter((item) => {
    const matchesSearch =
      item.txnId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.estimateNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      item.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div style={styles.page}>
      {/* Header Banner */}
      <div style={styles.headerCard}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', backgroundColor: '#EFF6FF', borderRadius: '6px', marginBottom: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#1E3A63', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Contractor Financial Portal
              </span>
            </div>
            <h1 style={styles.pageTitle}>Discounts &amp; Earnings</h1>
            <p style={styles.pageSub}>
              Manage your wholesale material discounts, volume pricing benefits, and track accrued commission earnings in one unified dashboard.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => navigate('/contractor/profile')}
              style={styles.verificationBtn}
              title="Upload verification documents to upgrade tier"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <span>Unlock 20% Tier</span>
            </button>
            <button
              onClick={loadAllData}
              style={styles.refreshBtn}
              title="Refresh financial data"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pale Colored Shiny Summary KPI Cards */}
      <div style={styles.kpiGrid}>
        {/* Card 1: Wholesale Discount */}
        <div style={{ ...styles.kpiCard, borderTop: '4px solid #1E3A63', background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)' }}>
          <div style={styles.kpiTopRow}>
            <span style={styles.kpiLabel}>Wholesale Tier Discount</span>
            <div style={{ ...styles.kpiIconBox, backgroundColor: '#EFF6FF', color: '#1E3A63', border: '1px solid #BFDBFE' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="5" x2="5" y2="19" />
                <circle cx="6.5" cy="6.5" r="2.5" />
                <circle cx="17.5" cy="17.5" r="2.5" />
              </svg>
            </div>
          </div>
          <div style={styles.kpiValue}>20% OFF</div>
          <div style={styles.kpiSub}>Materials &amp; Coatings wholesale pricing</div>
        </div>

        {/* Card 2: Active Discount Policies */}
        <div style={{ ...styles.kpiCard, borderTop: '4px solid #0284C7', background: 'linear-gradient(180deg, #F0F9FF 0%, #FFFFFF 100%)' }}>
          <div style={styles.kpiTopRow}>
            <span style={styles.kpiLabel}>Active Policies</span>
            <div style={{ ...styles.kpiIconBox, backgroundColor: '#E0F2FE', color: '#0284C7', border: '1px solid #BAE6FD' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
          </div>
          <div style={styles.kpiValue}>{displayDiscounts.length} Active</div>
          <div style={styles.kpiSub}>Applied automatically on estimates</div>
        </div>

        {/* Card 3: Total Accrued Commission */}
        <div style={{ ...styles.kpiCard, borderTop: '4px solid #15803D', background: 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)' }}>
          <div style={styles.kpiTopRow}>
            <span style={styles.kpiLabel}>Total Earned Commissions</span>
            <div style={{ ...styles.kpiIconBox, backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <div style={{ ...styles.kpiValue, color: '#15803D' }}>$12,680.00</div>
          <div style={styles.kpiSub}>Lifetime earnings through DRP network</div>
        </div>

        {/* Card 4: Available Payable Balance */}
        <div style={{ ...styles.kpiCard, borderTop: '4px solid #E08131', background: 'linear-gradient(180deg, #FFFBEB 0%, #FFFFFF 100%)' }}>
          <div style={styles.kpiTopRow}>
            <span style={styles.kpiLabel}>Payable Balance</span>
            <div style={{ ...styles.kpiIconBox, backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
          </div>
          <div style={{ ...styles.kpiValue, color: '#C2671A' }}>$3,840.00</div>
          <div style={styles.kpiSub}>Direct ACH release on Friday</div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={styles.tabContainer}>
        <button
          onClick={() => setActiveTab('discounts')}
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'discounts' ? styles.tabBtnActive : {}),
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="5" x2="5" y2="19" />
            <circle cx="6.5" cy="6.5" r="2.5" />
            <circle cx="17.5" cy="17.5" r="2.5" />
          </svg>
          <span>Wholesale Partner Discounts</span>
          <span style={styles.tabPill}>{displayDiscounts.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('commissions')}
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'commissions' ? styles.tabBtnActive : {}),
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <span>Commissions &amp; Earnings</span>
          <span style={styles.tabPill}>{displayComms.length}</span>
        </button>
      </div>

      {/* TAB 1: WHOLESALE PARTNER DISCOUNTS */}
      {activeTab === 'discounts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Tier Benefit Guide */}
          <div style={styles.tierBanner}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#1E3A63' }}>
                  Contractor Tier Discount Program
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#475569', lineHeight: 1.45 }}>
                  Discounts are automatically calculated and subtracted from wholesale materials and stain packages during your estimation builds. Verified contractors enjoy our maximum 20% tier and priority lead dispatch.
                </p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
                  <div style={styles.tierPill}>
                    <span style={{ fontWeight: '800', color: '#475569' }}>Standard Tier:</span> 10% Off
                  </div>
                  <div style={{ ...styles.tierPill, backgroundColor: '#E0F2FE', borderColor: '#BAE6FD', color: '#0369A1' }}>
                    <span style={{ fontWeight: '800' }}>Verified Pro:</span> 15% Off
                  </div>
                  <div style={{ ...styles.tierPill, backgroundColor: '#FEF3C7', borderColor: '#FDE68A', color: '#92400E' }}>
                    <span style={{ fontWeight: '800' }}>DRP Elite Partner:</span> 20% Off + $350 Project Vouchers
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Discounts Table Card */}
          <div style={styles.tableCard}>
            <div style={styles.tableHeaderBar}>
              <h3 style={styles.tableTitle}>Active Partner Discount Policies</h3>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                Reflected on all estimate material lines
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeadRow}>
                    <th style={styles.th}>Policy Name</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Discount Value</th>
                    <th style={styles.th}>Applicable Category</th>
                    <th style={styles.th}>Validity Period</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayDiscounts.map((item) => (
                    <tr key={item.id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={{ fontWeight: '700', color: '#1E3A63', fontSize: '13.5px' }}>
                          {item.name}
                        </div>
                        {item.tier && (
                          <span style={{ fontSize: '11px', color: '#0284C7', fontWeight: '600' }}>
                            {item.tier}
                          </span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.badgeNeutral}>{item.type}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontSize: '15px', fontWeight: '800', color: '#E08131' }}>
                          {item.value}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontSize: '13px', color: '#334155' }}>
                          {item.applicableFor}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontSize: '12.5px', color: '#64748B' }}>
                          {item.validity}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.badgeSuccess}>
                          <span style={styles.statusDotSuccess} />
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMMISSIONS & EARNINGS */}
      {activeTab === 'commissions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Filter Bar */}
          <div style={styles.filterBarCard}>
            <div style={styles.searchBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search transaction, project name, customer, or estimate #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} style={styles.clearSearchBtn}>
                  ×
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#475569' }}>Status:</span>
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
            </div>
          </div>

          {/* Commissions Table Card */}
          <div style={styles.tableCard}>
            <div style={styles.tableHeaderBar}>
              <div>
                <h3 style={styles.tableTitle}>Commission Payout Ledger</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                  Weekly direct ACH disbursements processed every Friday for settled jobs.
                </p>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#1E3A63' }}>
                Showing {filteredComms.length} records
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeadRow}>
                    <th style={styles.th}>Txn Reference</th>
                    <th style={styles.th}>Project &amp; Client</th>
                    <th style={styles.th}>Estimate #</th>
                    <th style={styles.th}>Commission Amount</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComms.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94A3B8' }}>
                        No commission records matched your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredComms.map((item) => (
                      <tr key={item.id} style={styles.tr}>
                        <td style={styles.td}>
                          <span style={styles.txnCode}>{item.txnId}</span>
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontWeight: '700', color: '#1E3A63', fontSize: '13.5px' }}>
                            {item.project}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>
                            Client: {item.customer}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={{ fontSize: '12.5px', fontFamily: 'monospace', color: '#334155' }}>
                            {item.estimateNumber}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontSize: '15px', fontWeight: '800', color: '#15803D' }}>
                            {item.amount}
                          </div>
                          {item.rate && (
                            <span style={{ fontSize: '10.5px', color: '#64748B' }}>{item.rate}</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          {item.status === 'Paid' && (
                            <span style={styles.badgeSuccess}>
                              <span style={styles.statusDotSuccess} />
                              Paid
                            </span>
                          )}
                          {item.status === 'Payable' && (
                            <span style={styles.badgeWarning}>
                              <span style={styles.statusDotWarning} />
                              Payable
                            </span>
                          )}
                          {item.status === 'Pending' && (
                            <span style={styles.badgeNeutral}>Pending</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          <span style={{ fontSize: '12.5px', color: '#64748B' }}>{item.date}</span>
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={() => setSelectedTxn(item)}
                            style={styles.detailBtn}
                            title="View transaction breakdown"
                          >
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTxn && (
        <div style={styles.modalOverlay} onClick={() => setSelectedTxn(null)}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1E3A63' }}>
                  Commission Settlement Details
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Ref: {selectedTxn.txnId} &bull; Estimate {selectedTxn.estimateNumber}
                </span>
              </div>
              <button onClick={() => setSelectedTxn(null)} style={styles.modalCloseBtn}>
                ×
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.modalRow}>
                <span style={styles.modalLabel}>Project Name</span>
                <span style={styles.modalValue}>{selectedTxn.project}</span>
              </div>
              <div style={styles.modalRow}>
                <span style={styles.modalLabel}>Client Name</span>
                <span style={styles.modalValue}>{selectedTxn.customer}</span>
              </div>
              <div style={styles.modalRow}>
                <span style={styles.modalLabel}>Commission Payout</span>
                <span style={{ ...styles.modalValue, color: '#15803D', fontWeight: '800', fontSize: '16px' }}>
                  {selectedTxn.amount}
                </span>
              </div>
              <div style={styles.modalRow}>
                <span style={styles.modalLabel}>Current Status</span>
                <span style={selectedTxn.status === 'Paid' ? styles.badgeSuccess : styles.badgeWarning}>
                  {selectedTxn.status}
                </span>
              </div>
              <div style={styles.modalRow}>
                <span style={styles.modalLabel}>Processed Date</span>
                <span style={styles.modalValue}>{selectedTxn.date}</span>
              </div>
              <div style={styles.modalRow}>
                <span style={styles.modalLabel}>Disbursement Method</span>
                <span style={styles.modalValue}>Direct ACH to Registered Business Account</span>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => setSelectedTxn(null)} style={styles.modalConfirmBtn}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: '24px 32px',
    backgroundColor: '#F8FAFC',
    minHeight: '100vh',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  },
  pageTitle: {
    margin: '0 0 6px 0',
    fontSize: '24px',
    fontWeight: '800',
    color: '#1E3A63',
    letterSpacing: '-0.3px',
  },
  pageSub: {
    margin: 0,
    fontSize: '13.5px',
    color: '#64748B',
    maxWidth: '750px',
    lineHeight: 1.5,
  },
  verificationBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 16px',
    backgroundColor: '#E08131',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(224, 129, 49, 0.25)',
  },
  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 14px',
    backgroundColor: '#FFFFFF',
    color: '#1E3A63',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  kpiCard: {
    borderRadius: '12px',
    padding: '18px 20px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
  },
  kpiTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  kpiLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  kpiIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#1E3A63',
    marginBottom: '4px',
  },
  kpiSub: {
    fontSize: '12px',
    color: '#64748B',
  },
  tabContainer: {
    display: 'flex',
    gap: '8px',
    borderBottom: '2px solid #E2E8F0',
    marginBottom: '20px',
  },
  tabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    fontSize: '13.5px',
    fontWeight: '600',
    color: '#64748B',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tabBtnActive: {
    color: '#1E3A63',
    fontWeight: '800',
    borderBottomColor: '#1E3A63',
  },
  tabPill: {
    padding: '2px 8px',
    borderRadius: '10px',
    backgroundColor: '#E2E8F0',
    color: '#475569',
    fontSize: '11px',
    fontWeight: '700',
  },
  tierBanner: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #BFDBFE',
    borderLeft: '4px solid #1E3A63',
    borderRadius: '12px',
    padding: '18px 20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
  },
  tierPill: {
    padding: '5px 12px',
    borderRadius: '6px',
    backgroundColor: '#F1F5F9',
    border: '1px solid #CBD5E1',
    fontSize: '12px',
    color: '#334155',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
  },
  tableHeaderBar: {
    padding: '16px 20px',
    borderBottom: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAF9',
  },
  tableTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '800',
    color: '#1E3A63',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeadRow: {
    backgroundColor: '#F8FAFC',
    borderBottom: '1px solid #E2E8F0',
  },
  th: {
    padding: '12px 18px',
    fontSize: '11.5px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  tr: {
    borderBottom: '1px solid #F1F5F9',
  },
  td: {
    padding: '14px 18px',
    fontSize: '13px',
    verticalAlign: 'middle',
  },
  filterBarCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '14px',
    flexWrap: 'wrap',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#F8FAFC',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    padding: '8px 12px',
    flex: 1,
    minWidth: '260px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '13px',
    color: '#1E293B',
    width: '100%',
  },
  clearSearchBtn: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    color: '#94A3B8',
    cursor: 'pointer',
    padding: 0,
  },
  selectFilter: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1E293B',
    outline: 'none',
    cursor: 'pointer',
  },
  badgeSuccess: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '11.5px',
    fontWeight: '700',
    backgroundColor: '#DCFCE7',
    color: '#15803D',
  },
  statusDotSuccess: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#15803D',
  },
  badgeWarning: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '11.5px',
    fontWeight: '700',
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  statusDotWarning: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#D97706',
  },
  badgeNeutral: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '11.5px',
    fontWeight: '600',
    backgroundColor: '#F1F5F9',
    color: '#475569',
  },
  txnCode: {
    fontSize: '12px',
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#1E3A63',
    backgroundColor: '#EFF6FF',
    padding: '3px 7px',
    borderRadius: '4px',
  },
  detailBtn: {
    padding: '5px 12px',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    fontSize: '12px',
    fontWeight: '600',
    color: '#1E3A63',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '16px',
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: '18px 20px',
    borderBottom: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '22px',
    lineHeight: '1',
    color: '#94A3B8',
    cursor: 'pointer',
  },
  modalBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  modalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '8px',
    borderBottom: '1px solid #F1F5F9',
  },
  modalLabel: {
    fontSize: '12.5px',
    color: '#64748B',
    fontWeight: '500',
  },
  modalValue: {
    fontSize: '13px',
    color: '#1E293B',
    fontWeight: '600',
    textAlign: 'right',
  },
  modalFooter: {
    padding: '14px 20px',
    backgroundColor: '#F8FAFC',
    borderTop: '1px solid #E2E8F0',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  modalConfirmBtn: {
    padding: '8px 18px',
    backgroundColor: '#1E3A63',
    color: '#FFFFFF',
    borderRadius: '6px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};


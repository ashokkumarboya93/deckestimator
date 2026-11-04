import os

path = 'frontend/src/features/admin/pages/AdminDashboardPage.jsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Ensure useNavigate is imported
if "useNavigate" not in c:
    c = c.replace(
        "import React, { useState, useEffect } from 'react';\nimport { adminApi } from '../api/adminApi';",
        "import React, { useState, useEffect } from 'react';\nimport { useNavigate } from 'react-router-dom';\nimport { adminApi } from '../api/adminApi';"
    )
    c = c.replace(
        "export default function AdminDashboardPage() {",
        "export default function AdminDashboardPage() {\n  const navigate = useNavigate();"
    )

# 2. Rich Overview Component JSX
new_overview_jsx = """      {/* TAB 1: OVERVIEW & RICH VISUALIZATIONS */}
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
      )}"""

# Replace lines 442 to 503
start_str = "{/* TAB 1: OVERVIEW */}"
end_str = "{/* TAB 2: USERS */}"
start_idx = c.find(start_str)
end_idx = c.find(end_str)

if start_idx != -1 and end_idx != -1:
    c = c[:start_idx] + new_overview_jsx + "\n\n      " + c[end_idx:]
    print("Replaced TAB 1: OVERVIEW in AdminDashboardPage.jsx")
else:
    print("Could not find start or end index for TAB 1")

# Update styles object with rich styles
styles_needle = "const styles = {"
styles_idx = c.find(styles_needle)
if styles_idx != -1:
    rich_styles = """const styles = {
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
};"""
    c = c[:styles_idx] + rich_styles

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print('AdminDashboardPage upgraded with rich visualizations and live metrics.')

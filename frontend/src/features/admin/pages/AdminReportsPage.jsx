// =============================================
// Deck Estimator — Admin Reports & Business Analytics Hub
// =============================================
// Features:
// - Summary KPI Cards with 100% Real Live Database Metrics:
//     * TOTAL ESTIMATIONS (All recorded customer & contractor estimates)
//     * COMPLETED PROJECTS (Completed restoration projects)
//     * TOTAL REVENUE (Sum of completed estimations)
//     * TOTAL ESTIMATIONS VALUE (Sum of all platform estimates)
// - 6 Dedicated Business Tabs:
//     1. Business Overview (Gross Revenue Trajectory SVG & Live Lead Conversion Funnel Bar Chart)
//     2. Revenue Analytics (Revenue Breakdown & Margin Streams from real estimates)
//     3. Leads & Projects (Visual plots: Project status bars, Leads fluid curve, Users bar graph + data tables)
//     4. Contractor Performance (Ranked contractor leaderboard by completed projects & revenue)
//     5. Catalog & Wood Demand (Area statistics, Wood species bars, Services chosen bars, Deck conditions)
//     6. System Audit Trail (Searchable & filterable log of all admin/platform actions)
// - Interactive SVG Charts with hover tooltips and dynamic indicators
// - Export to CSV, Excel, and PDF with date filtering

import React, { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../api/adminApi';

const TABS = [
  { id: 'business_overview', label: 'Business Overview' },
  { id: 'revenue', label: 'Revenue Analytics' },
  { id: 'leads', label: 'Leads & Projects' },
  { id: 'contractors', label: 'Contractor Performance' },
  { id: 'catalog', label: 'Catalog & Wood Demand' },
  { id: 'audit', label: 'System Audit Trail' },
];

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState('business_overview');
  const [dateRange, setDateRange] = useState('30d');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Contractor profile modal in Contractor Performance tab
  const [selectedContractorProfile, setSelectedContractorProfile] = useState(null);

  // Search & filter states for tabs
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilterType, setAuditFilterType] = useState('all');
  const [leadsSearch, setLeadsSearch] = useState('');
  const [projectsSearch, setProjectsSearch] = useState('');
  const [contractorSearch, setContractorSearch] = useState('');

  useEffect(() => {
    fetchReport();
  }, [activeTab, dateRange]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getReports(activeTab, { dateRange });
      // Safely unwrap data payload regardless of response envelope
      const raw = res?.data?.metrics !== undefined ? res.data : (res?.metrics !== undefined ? res : (res?.data || res));
      setReportData(raw || null);
    } catch (err) {
      setError(err?.message || 'Failed to load report analytics.');
    } finally {
      setLoading(false);
    }
  };

  const metrics = reportData?.metrics || {};
  const monthlyRevenue = reportData?.monthlyRevenue || [];
  const materialSelection = reportData?.materialSelection || [];
  const materialsUsage = reportData?.materialsUsage || [];
  const servicesDemand = reportData?.servicesDemand || [];
  const conditionDemand = reportData?.conditionDemand || [];
  const areaStats = reportData?.areaStats || { min: 0, max: 0, avg: 0, totalSqFt: 0 };
  const leadFunnel = reportData?.leadFunnel || [];
  const contractorRanking = reportData?.contractorRanking || [];
  const financialStreams = reportData?.financialStreams || [];
  const auditLogs = reportData?.auditLogs || [];
  const recentLeads = reportData?.recentLeads || [];
  const recentProjects = reportData?.recentProjects || [];
  const userDistribution = reportData?.userDistribution || [];
  const projectStatusDistribution = reportData?.projectStatusDistribution || [];

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    let list = auditLogs;
    if (auditFilterType !== 'all') {
      list = list.filter((a) => {
        const act = (a.action || '').toUpperCase();
        if (auditFilterType === 'pricing') return act.includes('PRICING') || act.includes('DISCOUNT');
        if (auditFilterType === 'verification') return act.includes('VERIF');
        if (auditFilterType === 'user') return act.includes('USER');
        if (auditFilterType === 'project') return act.includes('PROJECT') || act.includes('LEAD');
        return true;
      });
    }
    if (auditSearch.trim()) {
      const q = auditSearch.toLowerCase();
      list = list.filter((a) => {
        const act = (a.action || '').toLowerCase();
        const actor = (a.performedByName || '').toLowerCase();
        const ent = (a.entityType || '').toLowerCase();
        return act.includes(q) || actor.includes(q) || ent.includes(q);
      });
    }
    return list;
  }, [auditLogs, auditFilterType, auditSearch]);

  // Filtered Contractors
  const filteredContractors = useMemo(() => {
    if (!contractorSearch.trim()) return contractorRanking;
    const q = contractorSearch.toLowerCase();
    return contractorRanking.filter(
      (c) =>
        (c.fullName || '').toLowerCase().includes(q) ||
        (c.businessName || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q)
    );
  }, [contractorRanking, contractorSearch]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    if (!leadsSearch.trim()) return recentLeads;
    const q = leadsSearch.toLowerCase();
    return recentLeads.filter(
      (l) =>
        (l.leadNumber || '').toLowerCase().includes(q) ||
        (l.customerSnapshot?.fullName || l.contractorSnapshot?.fullName || '').toLowerCase().includes(q) ||
        (l.status || '').toLowerCase().includes(q)
    );
  }, [recentLeads, leadsSearch]);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    if (!projectsSearch.trim()) return recentProjects;
    const q = projectsSearch.toLowerCase();
    return recentProjects.filter(
      (p) =>
        (p.projectId || '').toLowerCase().includes(q) ||
        (p.projectName || '').toLowerCase().includes(q) ||
        (p.customerName || '').toLowerCase().includes(q) ||
        (p.status || '').toLowerCase().includes(q)
    );
  }, [recentProjects, projectsSearch]);

  // Full-Width Dynamic SVG Revenue Trajectory Chart Calculations
  const chartWidth = 980;
  const chartHeight = 220;
  const paddingX = 55;
  const paddingY = 35;
  const plotW = chartWidth - paddingX * 2;
  const plotH = chartHeight - paddingY * 2;

  const revData =
    monthlyRevenue.length > 0
      ? monthlyRevenue
      : [{ month: 'Current', revenue: metrics.totalEstimatedValue || 0, count: metrics.totalEstimates || 0 }];
  const maxRev = Math.max(...revData.map((d) => d.revenue), 100);

  const points = revData.map((d, i) => {
    const x = paddingX + (revData.length > 1 ? (i / (revData.length - 1)) * plotW : plotW / 2);
    const y = paddingY + plotH - (d.revenue / maxRev) * plotH;
    return { x, y, month: d.month, revenue: d.revenue, count: d.count };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Export to PDF via clean print dialog
  const handleExportPdf = () => {
    window.print();
  };

  // Modern Bar Chart Renderer for "Live Lead Conversion Funnel"
  const renderFunnelBarChart = (data) => {
    const funnel =
      Array.isArray(data) && data.length > 0
        ? data
        : [
            {
              step: '1. Lead Inquiries Raised',
              count: metrics.totalLeads || 0,
              conversion: 100,
              color: '#2563eb',
              desc: 'Customer & contractor quote requests from website and platform',
            },
            {
              step: '2. Estimates Calculated',
              count: metrics.totalEstimates || 0,
              conversion: metrics.totalLeads > 0 ? Math.min(100, Math.round(((metrics.totalEstimates || 0) / metrics.totalLeads) * 100)) : 100,
              color: '#6366f1',
              desc: 'Deck restoration continuous pricing calculations generated',
            },
            {
              step: '3. Dispatched & In Progress',
              count: metrics.activeProjects || 0,
              conversion: (metrics.totalEstimates || 0) > 0 ? Math.round(((metrics.activeProjects || 0) / (metrics.totalEstimates || 1)) * 100) : 0,
              color: '#f59e0b',
              desc: 'Contractor trade mobilization and active surface execution',
            },
            {
              step: '4. Completed Restorations',
              count: metrics.completedProjects || 0,
              conversion: (metrics.activeProjects || 0) > 0 ? Math.round(((metrics.completedProjects || 0) / (metrics.activeProjects || 1)) * 100) : 100,
              color: '#10b981',
              desc: 'Finished, customer approved, and final invoice generated',
            },
          ];

    const maxCount = Math.max(...funnel.map((f) => Number(f.count) || 1), 1);

    return (
      <div style={styles.funnelCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={styles.cardTitle}>Live Lead Conversion Funnel</h3>
            <p style={styles.cardSub}>Dynamic progression from initial customer reach-out to completed deck restoration</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#15803D', backgroundColor: '#ECFDF5', padding: '5px 12px', borderRadius: '20px', border: '1px solid #A7F3D0' }}>
              Overall Conversion: {metrics.leadConversionRate || 0}%
            </span>
            <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#034EA2', backgroundColor: '#EFF6FF', padding: '5px 12px', borderRadius: '20px', border: '1px solid #BFDBFE' }}>
              Total Volume: {metrics.totalLeads || 0} Inquiries
            </span>
          </div>
        </div>

        {/* Clear Bar Chart Representation */}
        <div style={styles.funnelStepsGrid}>
          {funnel.map((stage, idx) => {
            const countNum = Number(stage.count) || 0;
            const widthPct = Math.max(12, Math.min(100, Math.round((countNum / maxCount) * 100)));
            const stepColor = stage.color || (idx === 0 ? '#2563eb' : idx === 1 ? '#6366f1' : idx === 2 ? '#f59e0b' : '#10b981');
            return (
              <div key={idx} style={styles.funnelStageBox}>
                <div style={styles.funnelStageHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: stepColor }} />
                    <strong style={{ fontSize: '13.5px', color: '#0F2C59' }}>{stage.step}</strong>
                  </div>
                  <span style={{ ...styles.funnelBadge, backgroundColor: `${stepColor}15`, color: stepColor, border: `1px solid ${stepColor}33` }}>
                    {countNum} Records
                  </span>
                </div>

                <div style={styles.funnelBarTrack}>
                  <div
                    style={{
                      ...styles.funnelBarFill,
                      width: `${widthPct}%`,
                      backgroundColor: stepColor,
                      boxShadow: `0 2px 8px ${stepColor}40`,
                    }}
                  >
                    <span style={styles.funnelBarLabel}>
                      {countNum} Records ({stage.conversion || 100}%)
                    </span>
                  </div>
                </div>

                <div style={styles.funnelStageFooter}>
                  <span style={styles.funnelDesc}>{stage.desc || 'Active database record pipeline stage'}</span>
                  {idx > 0 && (
                    <span style={styles.conversionPill}>
                      ↓ {stage.conversion}% stage retention
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* 1. Header with Title & Controls */}
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitleRow}>
            <h1 style={styles.title}>Reports & Business Analytics</h1>
            <span style={styles.liveDbPill}>
              <span style={styles.pulseDot} />
              Live Business Updates
            </span>
          </div>
          <p style={styles.subtitle}>
            Business intelligence, conversion funnel, revenue breakdown, contractor productivity, and compliance reporting.
          </p>
        </div>
        <div style={styles.headerControls}>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={styles.shinySelect}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last Quarter</option>
            <option value="1y">Past 12 Months</option>
          </select>
          <a
            href={adminApi.exportReportsUrl('csv', activeTab, dateRange)}
            target="_blank"
            rel="noreferrer"
            style={styles.shinyExportBtn}
            title="Download CSV table"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </a>
          <a
            href={adminApi.exportReportsUrl('excel', activeTab, dateRange)}
            target="_blank"
            rel="noreferrer"
            style={styles.shinyExportGreenBtn}
            title="Download Excel spreadsheet"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Export Excel
          </a>
          <button
            type="button"
            onClick={handleExportPdf}
            style={styles.shinyExportPdfBtn}
            title="Export formatted report to PDF"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* 2. Tabs Bar (6 Dedicated Tabs) */}
      <div style={styles.tabBar}>
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

      {loading ? (
        <div style={styles.loaderBox}>
          <div style={styles.spinner} />
          <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
            Aggregating real-time database analytics...
          </span>
        </div>
      ) : error ? (
        <div style={styles.errorBox}>{error}</div>
      ) : (
        <div>
          {/* ==================================================================== */}
          {/* TAB 1: BUSINESS OVERVIEW */}
          {/* ==================================================================== */}
          {activeTab === 'business_overview' && (
            <div>
              {/* Pastel Pill Summary Cards (Exact 100% Real Database Values) */}
              <div style={styles.cardsRow}>
                {/* Card 1: TOTAL ESTIMATIONS (Blue Pill) */}
                <div style={styles.cardBlueRef}>
                  <div style={styles.cardRefInner}>
                    <div style={styles.cardRefLeft}>
                      <div style={styles.iconCircleWhite}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                      </div>
                      <div>
                        <div style={styles.cardRefLabelBlue}>TOTAL ESTIMATIONS</div>
                        <div style={styles.cardRefValueBlue}>{metrics.totalEstimates || 0}</div>
                      </div>
                    </div>
                    <div style={styles.chevronBlue}>›</div>
                  </div>
                </div>

                {/* Card 2: COMPLETED PROJECTS (Green Pill) */}
                <div style={styles.cardGreenRef}>
                  <div style={styles.cardRefInner}>
                    <div style={styles.cardRefLeft}>
                      <div style={styles.iconCircleWhite}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                      </div>
                      <div>
                        <div style={styles.cardRefLabelGreen}>COMPLETED PROJECTS</div>
                        <div style={styles.cardRefValueGreen}>{metrics.completedProjects || 0}</div>
                      </div>
                    </div>
                    <div style={styles.chevronGreen}>›</div>
                  </div>
                </div>

                {/* Card 3: TOTAL REVENUE (Purple Pill - Completed Estimations Sum) */}
                <div style={styles.cardPurpleRef}>
                  <div style={styles.cardRefInner}>
                    <div style={styles.cardRefLeft}>
                      <div style={styles.iconCircleWhite}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7e22ce" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="1" x2="12" y2="23" />
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                      </div>
                      <div>
                        <div style={styles.cardRefLabelPurple}>TOTAL REVENUE</div>
                        <div style={styles.cardRefValuePurple}>
                          ${Math.round(metrics.totalRevenue || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div style={styles.chevronPurple}>›</div>
                  </div>
                </div>

                {/* Card 4: TOTAL ESTIMATIONS VALUE (Rose/Red Pill - All Estimations Sum) */}
                <div style={styles.cardRoseRef}>
                  <div style={styles.cardRefInner}>
                    <div style={styles.cardRefLeft}>
                      <div style={styles.iconCircleWhite}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="20" x2="18" y2="10" />
                          <line x1="12" y1="20" x2="12" y2="4" />
                          <line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                      </div>
                      <div>
                        <div style={styles.cardRefLabelRose}>TOTAL ESTIMATIONS VALUE</div>
                        <div style={styles.cardRefValueRose}>
                          ${Math.round(metrics.totalEstimatedValue || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div style={styles.chevronRose}>›</div>
                  </div>
                </div>
              </div>

              {/* Full-Width Interactive Gross Revenue Trajectory SVG Chart */}
              <div style={styles.chartCardFullWidth}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={styles.cardTitle}>Gross Revenue Trajectory ($)</h3>
                    <p style={styles.cardSub}>Monthly platform estimate volume from real database records</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={styles.legendPill}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2563EB' }}></span>
                      <span>Total Volume: ${Math.round(metrics.totalEstimatedValue || 0).toLocaleString()}</span>
                    </div>
                    <div style={styles.legendPillGreen}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                      <span>Realized Completed: ${Math.round(metrics.totalRevenue || 0).toLocaleString()}</span>
                    </div>
                    {hoveredPoint && (
                      <div style={styles.tooltipBadge}>
                        {hoveredPoint.month}: ${Math.round(hoveredPoint.revenue).toLocaleString()} ({hoveredPoint.count} estimates)
                      </div>
                    )}
                  </div>
                </div>

                <div style={styles.svgBox}>
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '220px' }}>
                    {/* Horizontal Grid lines */}
                    <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#F1F5F9" strokeWidth="1" />
                    <line x1={paddingX} y1={paddingY + plotH / 3} x2={chartWidth - paddingX} y2={paddingY + plotH / 3} stroke="#F1F5F9" strokeWidth="1" />
                    <line x1={paddingX} y1={paddingY + (plotH * 2) / 3} x2={chartWidth - paddingX} y2={paddingY + (plotH * 2) / 3} stroke="#F1F5F9" strokeWidth="1" />
                    <line x1={paddingX} y1={paddingY + plotH} x2={chartWidth - paddingX} y2={paddingY + plotH} stroke="#CBD5E1" strokeWidth="1.5" />

                    {/* Gradient Definition */}
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Area Polygon */}
                    {points.length > 1 && (
                      <polygon
                        points={`${points[0].x},${paddingY + plotH} ${polylinePoints} ${points[points.length - 1].x},${paddingY + plotH}`}
                        fill="url(#revenueGrad)"
                      />
                    )}

                    {/* Connecting Polyline */}
                    {points.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={polylinePoints}
                      />
                    )}

                    {/* Data Point Circles with Interactive Tooltip Hover */}
                    {points.map((p, idx) => (
                      <g key={idx}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={hoveredPoint?.month === p.month ? 7 : 5}
                          fill={hoveredPoint?.month === p.month ? '#1d4ed8' : '#3b82f6'}
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                          onMouseEnter={() => setHoveredPoint(p)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                        <text
                          x={p.x}
                          y={chartHeight - 10}
                          fontSize="11"
                          fontWeight="700"
                          fill="#475569"
                          textAnchor="middle"
                        >
                          {p.month}
                        </text>
                        <text
                          x={p.x}
                          y={p.y - 12}
                          fontSize="10"
                          fontWeight="800"
                          fill="#0F2C59"
                          textAnchor="middle"
                        >
                          ${Math.round(p.revenue / 1000)}k
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Live Lead Conversion Funnel Bar Chart */}
              <div style={{ marginTop: '24px' }}>
                {renderFunnelBarChart(leadFunnel)}
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 2: REVENUE ANALYTICS */}
          {/* ==================================================================== */}
          {activeTab === 'revenue' && (
            <div>
              {/* Financial KPI Summary Cards */}
              <div style={styles.kpiGrid}>
                <div style={styles.kpiCard}>
                  <span style={styles.kpiLabel}>Realized Completed Revenue</span>
                  <strong style={{ ...styles.kpiVal, color: '#15803D' }}>
                    ${Math.round(metrics.totalRevenue || 0).toLocaleString()}
                  </strong>
                  <span style={styles.kpiSub}>From {metrics.completedProjects || 0} finished restorations</span>
                </div>
                <div style={styles.kpiCard}>
                  <span style={styles.kpiLabel}>Active Pipeline Revenue</span>
                  <strong style={{ ...styles.kpiVal, color: '#B45309' }}>
                    ${Math.round(metrics.pipelineRevenue || 0).toLocaleString()}
                  </strong>
                  <span style={styles.kpiSub}>Underway across {metrics.activeProjects || 0} active deck jobs</span>
                </div>
                <div style={styles.kpiCard}>
                  <span style={styles.kpiLabel}>Total Platform Estimate Value</span>
                  <strong style={{ ...styles.kpiVal, color: '#034EA2' }}>
                    ${Math.round(metrics.totalEstimatedValue || 0).toLocaleString()}
                  </strong>
                  <span style={styles.kpiSub}>Aggregated from {metrics.totalEstimates || 0} estimates</span>
                </div>
                <div style={styles.kpiCard}>
                  <span style={styles.kpiLabel}>Average Estimate Size</span>
                  <strong style={{ ...styles.kpiVal, color: '#6D28D9' }}>
                    ${Math.round(metrics.averageProjectValue || 0).toLocaleString()}
                  </strong>
                  <span style={styles.kpiSub}>Mean quote value across all tiers</span>
                </div>
              </div>

              {/* Revenue Breakdown & Margin Streams */}
              <div style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={styles.cardTitle}>Revenue Breakdown & Margin Streams</h3>
                    <p style={styles.cardSub}>Financial performance across materials, labor, and chemical surface preparation</p>
                  </div>
                  <span style={styles.badgeSuccess}>100% Real Live Database Calculation</span>
                </div>

                {financialStreams.length === 0 ? (
                  <div style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
                    No revenue stream records available for this period.
                  </div>
                ) : (
                  <div style={styles.tableResponsive}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Financial Stream</th>
                          <th style={styles.th}>Gross Volume</th>
                          <th style={styles.th}>Trade Discounts Deducted</th>
                          <th style={styles.th}>Net Platform Volume</th>
                          <th style={styles.th}>Revenue Share</th>
                          <th style={styles.th}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {financialStreams.map((f, idx) => (
                          <tr key={idx} style={styles.tr}>
                            <td style={styles.td}>
                              <strong>{f.stream}</strong>
                            </td>
                            <td style={styles.td}>${f.gross.toLocaleString()}</td>
                            <td style={styles.td}>
                              <span style={{ color: '#B91C1C', fontWeight: '700' }}>
                                -${f.discount.toLocaleString()} (10%)
                              </span>
                            </td>
                            <td style={styles.td}>
                              <strong style={{ color: '#0F2C59' }}>${f.net.toLocaleString()}</strong>
                            </td>
                            <td style={styles.td}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '80px', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                                  <div style={{ width: `${f.share}%`, height: '100%', backgroundColor: '#034EA2' }}></div>
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: '800', color: '#034EA2' }}>{f.share}%</span>
                              </div>
                            </td>
                            <td style={styles.td}>
                              <span style={styles.badgeSuccess}>Live Database</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 3: LEADS & PROJECTS (Renamed from Leads & Funnel) */}
          {/* ==================================================================== */}
          {activeTab === 'leads' && (
            <div>
              {/* Visual Plots Grid for Projects, Leads, and Users */}
              <div style={styles.chartsGrid}>
                {/* 1. Projects Distribution Bar Chart */}
                <div style={styles.chartCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={styles.cardTitle}>Deck Projects Pipeline</h3>
                    <span style={styles.badgeContractor}>{metrics.totalProjects || 0} Total</span>
                  </div>
                  <p style={styles.cardSub}>Restoration project volume distributed by lifecycle status</p>
                  
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {projectStatusDistribution.map((p, idx) => (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '700', color: '#0F2C59' }}>{p.label}</span>
                          <span style={{ fontWeight: '800', color: p.color }}>{p.count} projects ({p.percentage}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '12px', backgroundColor: '#F1F5F9', borderRadius: '6px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.max(6, p.percentage)}%`, height: '100%', backgroundColor: p.color, borderRadius: '6px' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Platform User Roles Bar Chart */}
                <div style={styles.chartCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={styles.cardTitle}>Platform User Accounts</h3>
                    <span style={styles.badgeCustomer}>{metrics.totalUsers || 0} Users</span>
                  </div>
                  <p style={styles.cardSub}>Customer homeowners vs contractor pros vs platform administrators</p>
                  
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {userDistribution.map((u, idx) => (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '700', color: '#0F2C59' }}>{u.label}</span>
                          <span style={{ fontWeight: '800', color: u.color }}>{u.count} registered ({u.percentage}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '12px', backgroundColor: '#F1F5F9', borderRadius: '6px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.max(6, u.percentage)}%`, height: '100%', backgroundColor: u.color, borderRadius: '6px' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Fluid Area Trend Plot for Leads Progression */}
              <div style={{ ...styles.card, marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={styles.cardTitle}>Inquiries & Leads Fluid Acquisition Flow</h3>
                    <p style={styles.cardSub}>Progression of homeowner and trade partner inquiries through evaluation stages</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#DC2626', backgroundColor: '#FEE2E2', padding: '4px 10px', borderRadius: '6px' }}>
                      🔥 {metrics.hotLeads || 0} Hot Inquiries
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#2563EB', backgroundColor: '#EFF6FF', padding: '4px 10px', borderRadius: '6px' }}>
                      📊 {metrics.totalLeads || 0} Total Recorded
                    </span>
                  </div>
                </div>

                {/* Fluid SVG Curve */}
                <div style={styles.svgBox}>
                  <svg viewBox="0 0 900 160" style={{ width: '100%', height: '160px' }}>
                    <defs>
                      <linearGradient id="fluidLeadsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Background Grid Lines */}
                    <line x1="50" y1="20" x2="850" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="50" y1="75" x2="850" y2="75" stroke="#F1F5F9" strokeWidth="1" />
                    <line x1="50" y1="130" x2="850" y2="130" stroke="#CBD5E1" strokeWidth="1.5" />

                    {/* Fluid Path */}
                    <path
                      d="M 100 40 Q 250 110, 400 60 T 700 80 T 800 100 L 800 130 L 100 130 Z"
                      fill="url(#fluidLeadsGrad)"
                    />
                    <path
                      d="M 100 40 Q 250 110, 400 60 T 700 80 T 800 100"
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Stage Markers */}
                    <g>
                      <circle cx="100" cy="40" r="6" fill="#0284c7" stroke="#fff" strokeWidth="2.5" />
                      <text x="100" y="30" fontSize="11" fontWeight="800" fill="#034EA2" textAnchor="middle">Initial ({metrics.totalLeads || 0})</text>
                      <text x="100" y="145" fontSize="11" fontWeight="700" fill="#64748B" textAnchor="middle">New Reach-Out</text>
                    </g>
                    <g>
                      <circle cx="400" cy="60" r="6" fill="#6366f1" stroke="#fff" strokeWidth="2.5" />
                      <text x="400" y="50" fontSize="11" fontWeight="800" fill="#4338ca" textAnchor="middle">Evaluated ({metrics.totalEstimates || 0})</text>
                      <text x="400" y="145" fontSize="11" fontWeight="700" fill="#64748B" textAnchor="middle">Estimates Calculated</text>
                    </g>
                    <g>
                      <circle cx="700" cy="80" r="6" fill="#f59e0b" stroke="#fff" strokeWidth="2.5" />
                      <text x="700" y="70" fontSize="11" fontWeight="800" fill="#b45309" textAnchor="middle">Active ({metrics.activeProjects || 0})</text>
                      <text x="700" y="145" fontSize="11" fontWeight="700" fill="#64748B" textAnchor="middle">Dispatched</text>
                    </g>
                    <g>
                      <circle cx="800" cy="100" r="6" fill="#10b981" stroke="#fff" strokeWidth="2.5" />
                      <text x="800" y="90" fontSize="11" fontWeight="800" fill="#15803d" textAnchor="middle">Done ({metrics.completedProjects || 0})</text>
                      <text x="800" y="145" fontSize="11" fontWeight="700" fill="#64748B" textAnchor="middle">Completed</text>
                    </g>
                  </svg>
                </div>
              </div>

              {/* Data Table 1: Inquiries & Leads */}
              <div style={{ ...styles.card, marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={styles.cardTitle}>Live Database Inquiries & Lead Pipeline ({filteredLeads.length})</h3>
                    <p style={styles.cardSub}>Live recorded leads and customer requests from MongoDB</p>
                  </div>
                  <input
                    type="text"
                    placeholder="Search leads by number or contact..."
                    value={leadsSearch}
                    onChange={(e) => setLeadsSearch(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>

                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Lead #</th>
                        <th style={styles.th}>Contact Person</th>
                        <th style={styles.th}>Type & Source</th>
                        <th style={styles.th}>Inquiry / Service</th>
                        <th style={styles.th}>Priority</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Created Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map((l) => {
                        const name = l.customerSnapshot?.fullName || l.contractorSnapshot?.fullName || 'Contact Pending';
                        const email = l.customerSnapshot?.email || l.contractorSnapshot?.email || '';
                        return (
                          <tr key={l._id} style={styles.tr}>
                            <td style={styles.td}>
                              <code style={styles.codeBadge}>{l.leadNumber}</code>
                            </td>
                            <td style={styles.td}>
                              <strong>{name}</strong>
                              <span style={{ display: 'block', fontSize: '11px', color: '#64748B' }}>{email}</span>
                            </td>
                            <td style={styles.td}>
                              <span style={l.userType === 'CONTRACTOR' ? styles.badgeContractor : styles.badgeCustomer}>
                                {l.userType || 'CUSTOMER'}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <span style={{ fontSize: '12.5px', color: '#334155' }}>
                                {l.enquiry?.serviceType || 'Estimation Service'}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <span
                                style={{
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  backgroundColor: l.priority === 'HOT' ? '#FEE2E2' : '#F1F5F9',
                                  color: l.priority === 'HOT' ? '#DC2626' : '#475569',
                                }}
                              >
                                {l.priority || 'NORMAL'}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <span style={styles.badgeSuccess}>{(l.status || 'NEW').toUpperCase()}</span>
                            </td>
                            <td style={styles.td}>
                              <span style={{ fontSize: '12px', color: '#64748B' }}>
                                {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'Recent'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Data Table 2: Deck Projects Table */}
              <div style={{ ...styles.card, marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={styles.cardTitle}>Recent Deck Restoration Projects ({filteredProjects.length})</h3>
                    <p style={styles.cardSub}>Active and completed field restoration projects</p>
                  </div>
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={projectsSearch}
                    onChange={(e) => setProjectsSearch(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>

                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Project ID</th>
                        <th style={styles.th}>Project Name</th>
                        <th style={styles.th}>Customer</th>
                        <th style={styles.th}>Contractor Partner</th>
                        <th style={styles.th}>Progress</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Created Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.map((p) => (
                        <tr key={p._id} style={styles.tr}>
                          <td style={styles.td}>
                            <code style={styles.codeBadge}>{p.projectId}</code>
                          </td>
                          <td style={styles.td}>
                            <strong>{p.projectName}</strong>
                          </td>
                          <td style={styles.td}>{p.customerName}</td>
                          <td style={styles.td}>{p.contractorName}</td>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '70px', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${p.progress || 0}%`, height: '100%', backgroundColor: p.progress === 100 ? '#10b981' : '#034EA2' }} />
                              </div>
                              <span style={{ fontSize: '11px', fontWeight: '800', color: '#0F2C59' }}>{p.progress || 0}%</span>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={p.status === 'completed' ? styles.badgeSuccess : styles.badgeNormal}>
                              {(p.status || 'in_progress').toUpperCase()}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={{ fontSize: '12px', color: '#64748B' }}>
                              {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recent'}
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

          {/* ==================================================================== */}
          {/* TAB 4: CONTRACTOR PERFORMANCE (RANKING LEADERBOARD) */}
          {/* ==================================================================== */}
          {activeTab === 'contractors' && (
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={styles.cardTitle}>Contractor Partner Performance Leaderboard</h3>
                  <p style={styles.cardSub}>Ranked by completed deck restorations, conversion rate, and revenue volume</p>
                </div>
                <input
                  type="text"
                  placeholder="Search contractors..."
                  value={contractorSearch}
                  onChange={(e) => setContractorSearch(e.target.value)}
                  style={styles.searchInput}
                />
              </div>

              <div style={styles.tableResponsive}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Rank</th>
                      <th style={styles.th}>Contractor & Company</th>
                      <th style={styles.th}>Contact</th>
                      <th style={styles.th}>Completed Restorations</th>
                      <th style={styles.th}>Total Estimates</th>
                      <th style={styles.th}>Conversion Rate</th>
                      <th style={styles.th}>Total Completed Revenue</th>
                      <th style={styles.th}>Verification</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContractors.map((c) => {
                      const isTop3 = c.rank <= 3;
                      const rankColor = c.rank === 1 ? '#D97706' : c.rank === 2 ? '#64748B' : c.rank === 3 ? '#B45309' : '#0F2C59';
                      return (
                        <tr key={c.id || c._id} style={styles.tr}>
                          <td style={styles.td}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyCenter: 'center',
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                backgroundColor: isTop3 ? `${rankColor}15` : '#F1F5F9',
                                color: rankColor,
                                fontWeight: '900',
                                fontSize: '13px',
                                border: isTop3 ? `1.5px solid ${rankColor}` : '1px solid #CBD5E1',
                              }}
                            >
                              {c.rank === 1 ? '🥇' : c.rank === 2 ? '🥈' : c.rank === 3 ? '🥉' : `#${c.rank}`}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={styles.avatarCircle}>
                                {(c.fullName || 'C')[0].toUpperCase()}
                              </div>
                              <div>
                                <strong>{c.fullName}</strong>
                                <span style={{ display: 'block', fontSize: '11px', color: '#64748B' }}>
                                  {c.businessName}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={{ fontSize: '12.5px', color: '#334155', display: 'block' }}>{c.email}</span>
                            <span style={{ fontSize: '11px', color: '#64748B' }}>{c.phone || 'No phone'}</span>
                          </td>
                          <td style={styles.td}>
                            <strong style={{ color: '#15803D', fontSize: '14px' }}>{c.completedProjects} Jobs</strong>
                          </td>
                          <td style={styles.td}>
                            <span style={{ color: '#034EA2', fontWeight: '700' }}>{c.totalEstimates} Calculated</span>
                          </td>
                          <td style={styles.td}>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '800',
                                backgroundColor: c.conversionRate >= 50 ? '#DCFCE7' : '#EFF6FF',
                                color: c.conversionRate >= 50 ? '#15803D' : '#1D4ED8',
                              }}
                            >
                              {c.conversionRate}%
                            </span>
                          </td>
                          <td style={styles.td}>
                            <strong style={{ color: '#0F2C59' }}>
                              ${Math.round(c.totalRevenue).toLocaleString()}
                            </strong>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.badgeSuccess}>✓ {c.verificationStatus.toUpperCase()}</span>
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right' }}>
                            <button
                              onClick={() => setSelectedContractorProfile(c)}
                              style={styles.profileBtn}
                            >
                              View Profile
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 5: CATALOG & WOOD DEMAND */}
          {/* ==================================================================== */}
          {activeTab === 'catalog' && (
            <div>
              {/* Top Deck Surface Area Statistics Tiles */}
              <div style={styles.kpiGrid}>
                <div style={styles.kpiCard}>
                  <span style={styles.kpiLabel}>Total Deck Surface Measured</span>
                  <strong style={{ ...styles.kpiVal, color: '#034EA2' }}>
                    {(areaStats.totalSqFt || 0).toLocaleString()} sq ft
                  </strong>
                  <span style={styles.kpiSub}>Calculated across {areaStats.count || metrics.totalEstimates || 0} active deck plans</span>
                </div>
                <div style={styles.kpiCard}>
                  <span style={styles.kpiLabel}>Average Deck Size</span>
                  <strong style={{ ...styles.kpiVal, color: '#15803D' }}>
                    {(areaStats.avg || 0).toLocaleString()} sq ft
                  </strong>
                  <span style={styles.kpiSub}>Mean surface area per customer home</span>
                </div>
                <div style={styles.kpiCard}>
                  <span style={styles.kpiLabel}>Smallest Footprint</span>
                  <strong style={{ ...styles.kpiVal, color: '#6D28D9' }}>
                    {(areaStats.min || 0).toLocaleString()} sq ft
                  </strong>
                  <span style={styles.kpiSub}>Compact balcony / landing entry</span>
                </div>
                <div style={styles.kpiCard}>
                  <span style={styles.kpiLabel}>Largest Footprint</span>
                  <strong style={{ ...styles.kpiVal, color: '#B45309' }}>
                    {(areaStats.max || 0).toLocaleString()} sq ft
                  </strong>
                  <span style={styles.kpiSub}>Expansive multi-tier estate platform</span>
                </div>
              </div>

              {/* Bar Chart Visual Plots Grid */}
              <div style={styles.chartsGrid}>
                {/* 1. Wood Species Visual Distribution Bar Chart */}
                <div style={styles.chartCard}>
                  <h3 style={styles.cardTitle}>Deck Wood Species Popularity</h3>
                  <p style={styles.cardSub}>Lumber selections dynamically aggregated from live database estimates</p>
                  
                  <div style={styles.woodListWrapper}>
                    {materialSelection.map((m, idx) => {
                      const colors = ['#034EA2', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
                      const barColor = colors[idx % colors.length];
                      return (
                        <div key={idx} style={styles.woodRow}>
                          <div style={styles.woodLabelRow}>
                            <span style={styles.woodName}><strong>{m.name}</strong></span>
                            <span style={styles.woodStat}>
                              {m.count} decks ({m.percentage}%)
                            </span>
                          </div>
                          <div style={styles.woodProgressBarTrack}>
                            <div
                              style={{
                                ...styles.woodProgressBarFill,
                                width: `${Math.max(8, m.percentage)}%`,
                                backgroundColor: barColor,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Restoration Services Demand Bar Chart */}
                <div style={styles.chartCard}>
                  <h3 style={styles.cardTitle}>Restoration Services Chosen</h3>
                  <p style={styles.cardSub}>Specific service stages requested across all calculated estimates</p>
                  
                  <div style={styles.woodListWrapper}>
                    {servicesDemand.length === 0 ? (
                      <span style={{ fontSize: '13px', color: '#64748B' }}>No service components recorded yet.</span>
                    ) : (
                      servicesDemand.map((s, idx) => {
                        const colors = ['#0284C7', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#3B82F6'];
                        const barColor = colors[idx % colors.length];
                        return (
                          <div key={idx} style={styles.woodRow}>
                            <div style={styles.woodLabelRow}>
                              <span style={styles.woodName}><strong>{s.name}</strong></span>
                              <span style={styles.woodStat}>
                                {s.count} requests ({s.percentage}%)
                              </span>
                            </div>
                            <div style={styles.woodProgressBarTrack}>
                              <div
                                style={{
                                  ...styles.woodProgressBarFill,
                                  width: `${Math.max(8, s.percentage)}%`,
                                  backgroundColor: barColor,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 3. Deck Conditions Diagnosed Bar Chart */}
                <div style={styles.chartCard}>
                  <h3 style={styles.cardTitle}>Deck Physical Conditions Diagnosed</h3>
                  <p style={styles.cardSub}>Existing weathering, coating peeling, and surface decay</p>
                  
                  <div style={styles.woodListWrapper}>
                    {conditionDemand.length === 0 ? (
                      <span style={{ fontSize: '13px', color: '#64748B' }}>No condition metrics recorded yet.</span>
                    ) : (
                      conditionDemand.map((c, idx) => {
                        const colors = ['#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#3B82F6'];
                        const barColor = colors[idx % colors.length];
                        return (
                          <div key={idx} style={styles.woodRow}>
                            <div style={styles.woodLabelRow}>
                              <span style={styles.woodName}><strong>{c.name}</strong></span>
                              <span style={styles.woodStat}>
                                {c.count} decks ({c.percentage}%)
                              </span>
                            </div>
                            <div style={styles.woodProgressBarTrack}>
                              <div
                                style={{
                                  ...styles.woodProgressBarFill,
                                  width: `${Math.max(8, c.percentage)}%`,
                                  backgroundColor: barColor,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 4. Coating Materials & Prep Products Usage */}
                <div style={styles.chartCard}>
                  <h3 style={styles.cardTitle}>Chemical & Coating Product Demand</h3>
                  <p style={styles.cardSub}>Restoration materials packaged in customer & contractor quote cards</p>
                  
                  <div style={styles.woodListWrapper}>
                    {materialsUsage.map((p, idx) => {
                      const colors = ['#10B981', '#034EA2', '#F59E0B', '#8B5CF6'];
                      const barColor = colors[idx % colors.length];
                      const totalMat = materialsUsage.reduce((s, x) => s + x.count, 0) || 1;
                      const pct = Math.round((p.count / totalMat) * 100);
                      return (
                        <div key={idx} style={styles.woodRow}>
                          <div style={styles.woodLabelRow}>
                            <span style={styles.woodName}><strong>{p.name}</strong></span>
                            <span style={styles.woodStat}>
                              {p.count} packages ({pct}%)
                            </span>
                          </div>
                          <div style={styles.woodProgressBarTrack}>
                            <div
                              style={{
                                ...styles.woodProgressBarFill,
                                width: `${Math.max(8, pct)}%`,
                                backgroundColor: barColor,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Demand Tables */}
              <div style={{ ...styles.card, marginTop: '20px' }}>
                <h3 style={styles.cardTitle}>Wood Species Estimator Demand Ranking</h3>
                <p style={styles.cardSub}>Breakdown of lumber types, active estimations, and share of platform demand</p>
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Lumber / Substrate Species</th>
                        <th style={styles.th}>Active Estimates</th>
                        <th style={styles.th}>Platform Demand Share</th>
                        <th style={styles.th}>Average Project Value</th>
                        <th style={styles.th}>Demand Standing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materialSelection.map((m, idx) => (
                        <tr key={idx} style={styles.tr}>
                          <td style={styles.td}>
                            <strong>{m.name}</strong>
                          </td>
                          <td style={styles.td}>
                            <strong>{m.count} estimates</strong>
                          </td>
                          <td style={styles.td}>
                            <span style={{ color: '#034EA2', fontWeight: '800' }}>{m.percentage}%</span>
                          </td>
                          <td style={styles.td}>
                            ${m.avgPrice ? m.avgPrice.toLocaleString() : '3,500'}
                          </td>
                          <td style={styles.td}>
                            <span style={m.percentage >= 30 ? styles.badgeSuccess : styles.badgeNormal}>
                              {m.percentage >= 30 ? 'High Volume' : 'Steady Demand'}
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

          {/* ==================================================================== */}
          {/* TAB 6: SYSTEM AUDIT TRAIL */}
          {/* ==================================================================== */}
          {activeTab === 'audit' && (
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={styles.cardTitle}>System Audit Trail & Platform Event Logs ({filteredAuditLogs.length})</h3>
                  <p style={styles.cardSub}>Live chronological records of administrative decisions, pricing engine edits, and security events</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select
                    value={auditFilterType}
                    onChange={(e) => setAuditFilterType(e.target.value)}
                    style={styles.shinySelect}
                  >
                    <option value="all">All Action Types</option>
                    <option value="pricing">Pricing & Discounts</option>
                    <option value="verification">Contractor Verification</option>
                    <option value="user">User Management</option>
                    <option value="project">Projects & Leads</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search audit actions..."
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>
              </div>

              <div style={styles.tableResponsive}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Timestamp</th>
                      <th style={styles.th}>Action</th>
                      <th style={styles.th}>Target Entity</th>
                      <th style={styles.th}>Performed By</th>
                      <th style={styles.th}>Details & Values Changed</th>
                      <th style={styles.th}>IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAuditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                          No audit trail events match the current filter.
                        </td>
                      </tr>
                    ) : (
                      filteredAuditLogs.map((log, idx) => {
                        const isDiscount = (log.action || '').includes('DISCOUNT');
                        const isVerif = (log.action || '').includes('VERIF');
                        const isCleanup = (log.action || '').includes('CLEANUP') || (log.action || '').includes('SYSTEM');
                        return (
                          <tr key={log.id || idx} style={styles.tr}>
                            <td style={styles.td}>
                              <span style={{ fontSize: '12px', color: '#334155', whiteSpace: 'nowrap' }}>
                                {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Recent'}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  backgroundColor: isDiscount ? '#FEF3C7' : isVerif ? '#DCFCE7' : isCleanup ? '#F1F5F9' : '#DBEAFE',
                                  color: isDiscount ? '#92400E' : isVerif ? '#15803D' : isCleanup ? '#475569' : '#1D4ED8',
                                }}
                              >
                                {log.action}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <code style={styles.codeBadge}>{log.entityType || 'SYSTEM'}</code>
                            </td>
                            <td style={styles.td}>
                              <strong>{log.performedByName || 'System Administrator'}</strong>
                              <span style={{ display: 'block', fontSize: '10.5px', color: '#64748B' }}>
                                {log.performedByRole || 'ADMIN'}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <div style={{ fontSize: '12px', color: '#334155', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {log.newValue ? (
                                  typeof log.newValue === 'object' ? JSON.stringify(log.newValue) : String(log.newValue)
                                ) : (
                                  'Executed administrative adjustment'
                                )}
                              </div>
                            </td>
                            <td style={styles.td}>
                              <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                                {log.ipAddress || '127.0.0.1'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contractor Profile Details Modal */}
      {selectedContractorProfile && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0F2C59' }}>
                Contractor Performance Dossier
              </h3>
              <button
                type="button"
                onClick={() => setSelectedContractorProfile(null)}
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px', padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '10px' }}>
              <div style={{ ...styles.avatarCircle, width: '48px', height: '48px', fontSize: '20px' }}>
                {(selectedContractorProfile.fullName || 'C')[0].toUpperCase()}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '16px', color: '#0F2C59' }}>{selectedContractorProfile.fullName}</h4>
                <span style={{ fontSize: '12px', color: '#64748B' }}>{selectedContractorProfile.businessName}</span>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <span style={styles.badgeSuccess}>Rank #{selectedContractorProfile.rank}</span>
                  <span style={styles.badgeCustomer}>{selectedContractorProfile.verificationStatus.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={styles.dossierStatBox}>
                <span style={styles.dossierStatLabel}>Completed Restorations</span>
                <strong style={{ fontSize: '18px', color: '#15803D' }}>{selectedContractorProfile.completedProjects} Jobs</strong>
              </div>
              <div style={styles.dossierStatBox}>
                <span style={styles.dossierStatLabel}>Conversion Rate</span>
                <strong style={{ fontSize: '18px', color: '#034EA2' }}>{selectedContractorProfile.conversionRate}%</strong>
              </div>
              <div style={styles.dossierStatBox}>
                <span style={styles.dossierStatLabel}>Completed Revenue</span>
                <strong style={{ fontSize: '18px', color: '#0F2C59' }}>${Math.round(selectedContractorProfile.totalRevenue).toLocaleString()}</strong>
              </div>
              <div style={styles.dossierStatBox}>
                <span style={styles.dossierStatLabel}>Estimations Handled</span>
                <strong style={{ fontSize: '18px', color: '#6D28D9' }}>{selectedContractorProfile.totalEstimates} Calculated</strong>
              </div>
            </div>

            <div style={{ fontSize: '12.5px', color: '#475569', marginBottom: '20px', lineHeight: '1.5' }}>
              <div><strong>Email:</strong> {selectedContractorProfile.email}</div>
              <div><strong>Phone:</strong> {selectedContractorProfile.phone || 'N/A'}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSelectedContractorProfile(null)}
                style={styles.cancelBtn}
              >
                Close
              </button>
              <a
                href={`/admin/users`}
                style={styles.actionLinkBtn}
              >
                Open in User Management →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================
// MODERN DECK RESTORATION PLUS ADMIN STYLES
// =============================================
const styles = {
  container: {
    padding: '24px 32px 60px 32px',
    maxWidth: '1440px',
    margin: '0 auto',
    boxSizing: 'border-box',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '14px',
  },
  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#0F2C59',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  liveDbPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#ECFDF5',
    color: '#047857',
    border: '1px solid #A7F3D0',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '0.02em',
  },
  pulseDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#10B981',
    boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)',
  },
  subtitle: {
    fontSize: '13.5px',
    color: '#64748B',
    margin: '4px 0 0',
  },
  headerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  shinySelect: {
    padding: '7px 14px',
    borderRadius: '8px',
    border: '1.5px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#0F2C59',
    outline: 'none',
    cursor: 'pointer',
  },
  shinyExportBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    backgroundColor: '#F8FAFC',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#334155',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  shinyExportGreenBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    backgroundColor: '#15803D',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '800',
    color: '#FFFFFF',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  shinyExportPdfBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    backgroundColor: '#0F2C59',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '800',
    color: '#FFFFFF',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tabBar: {
    display: 'flex',
    gap: '8px',
    borderBottom: '2px solid #E2E8F0',
    marginBottom: '20px',
    overflowX: 'auto',
  },
  tabBtn: {
    padding: '12px 18px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748B',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  },
  tabBtnActive: {
    color: '#034EA2',
    fontWeight: '900',
    borderBottom: '3px solid #034EA2',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px 8px 0 0',
  },
  cardsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '14px',
    marginBottom: '24px',
  },
  cardBlueRef: {
    backgroundColor: '#EFF6FF',
    border: '1px solid #BFDBFE',
    borderRadius: '12px',
    padding: '16px 20px',
  },
  cardGreenRef: {
    backgroundColor: '#ECFDF5',
    border: '1px solid #A7F3D0',
    borderRadius: '12px',
    padding: '16px 20px',
  },
  cardPurpleRef: {
    backgroundColor: '#FAF5FF',
    border: '1px solid #E9D5FF',
    borderRadius: '12px',
    padding: '16px 20px',
  },
  cardRoseRef: {
    backgroundColor: '#FFF1F2',
    border: '1px solid #FECDD3',
    borderRadius: '12px',
    padding: '16px 20px',
  },
  cardRefInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardRefLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  iconCircleWhite: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  cardRefLabelBlue: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#1D4ED8',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  cardRefValueBlue: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#0F2C59',
  },
  chevronBlue: {
    fontSize: '22px',
    color: '#93C5FD',
    fontWeight: '300',
  },
  cardRefLabelGreen: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#15803D',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  cardRefValueGreen: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#065F46',
  },
  chevronGreen: {
    fontSize: '22px',
    color: '#86EFAC',
    fontWeight: '300',
  },
  cardRefLabelPurple: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#7E22CE',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  cardRefValuePurple: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#581C87',
  },
  chevronPurple: {
    fontSize: '22px',
    color: '#D8B4FE',
    fontWeight: '300',
  },
  cardRefLabelRose: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#E11D48',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  cardRefValueRose: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#881337',
  },
  chevronRose: {
    fontSize: '22px',
    color: '#FDA4AF',
    fontWeight: '300',
  },
  chartCardFullWidth: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '24px 28px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    marginBottom: '24px',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
    gap: '20px',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '20px 24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  cardTitle: {
    fontSize: '17px',
    fontWeight: '800',
    color: '#0F2C59',
    margin: '0 0 4px 0',
  },
  cardSub: {
    fontSize: '12.5px',
    color: '#64748B',
    margin: 0,
  },
  svgBox: {
    width: '100%',
    overflowX: 'auto',
  },
  tooltipBadge: {
    backgroundColor: '#0F2C59',
    color: '#FFFFFF',
    padding: '5px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '800',
  },
  legendPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    backgroundColor: '#EFF6FF',
    borderRadius: '20px',
    fontSize: '11.5px',
    fontWeight: '700',
    color: '#1D4ED8',
  },
  legendPillGreen: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    backgroundColor: '#ECFDF5',
    borderRadius: '20px',
    fontSize: '11.5px',
    fontWeight: '700',
    color: '#15803D',
  },
  funnelCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '24px 28px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  funnelStepsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  funnelStageBox: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '14px 18px',
  },
  funnelStageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  funnelBadge: {
    fontSize: '11px',
    fontWeight: '800',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  funnelBarTrack: {
    width: '100%',
    height: '24px',
    backgroundColor: '#E2E8F0',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  funnelBarFill: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '12px',
    borderRadius: '8px',
    transition: 'width 0.4s ease',
  },
  funnelBarLabel: {
    fontSize: '11.5px',
    fontWeight: '800',
    color: '#FFFFFF',
    whiteSpace: 'nowrap',
  },
  funnelStageFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '6px',
    fontSize: '11px',
  },
  funnelDesc: {
    color: '#64748B',
    fontWeight: '500',
  },
  conversionPill: {
    color: '#059669',
    fontWeight: '700',
    fontSize: '10.5px',
    backgroundColor: '#ECFDF5',
    padding: '2px 8px',
    borderRadius: '4px',
    border: '1px solid #A7F3D0',
  },
  card: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '24px 28px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  },
  tableResponsive: {
    overflowX: 'auto',
    marginTop: '16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '12px 14px',
    fontSize: '12px',
    fontWeight: '800',
    color: '#64748B',
    borderBottom: '2px solid #E2E8F0',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  tr: {
    borderBottom: '1px solid #F1F5F9',
  },
  td: {
    padding: '14px',
    fontSize: '13px',
    color: '#1E293B',
    verticalAlign: 'middle',
  },
  badgeSuccess: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '800',
    backgroundColor: '#DCFCE7',
    color: '#15803D',
  },
  badgeCustomer: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '800',
    backgroundColor: '#DBEAFE',
    color: '#1D4ED8',
  },
  badgeContractor: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '800',
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  badgeNormal: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: '#F1F5F9',
    color: '#475569',
  },
  codeBadge: {
    backgroundColor: '#F1F5F9',
    color: '#0F2C59',
    padding: '3px 7px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  avatarCircle: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    backgroundColor: '#0F2C59',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '800',
    flexShrink: 0,
  },
  profileBtn: {
    padding: '5px 12px',
    backgroundColor: '#F1F5F9',
    border: '1px solid #CBD5E1',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#0F2C59',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  woodListWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginTop: '16px',
  },
  woodRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  woodLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12.5px',
  },
  woodName: {
    color: '#0F2C59',
  },
  woodStat: {
    color: '#64748B',
    fontWeight: '700',
  },
  woodProgressBarTrack: {
    width: '100%',
    height: '10px',
    backgroundColor: '#E2E8F0',
    borderRadius: '5px',
    overflow: 'hidden',
  },
  woodProgressBarFill: {
    height: '100%',
    borderRadius: '5px',
    transition: 'width 0.4s ease',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px',
    marginBottom: '20px',
  },
  kpiCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  kpiLabel: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  kpiVal: {
    fontSize: '24px',
    fontWeight: '900',
    margin: '4px 0 2px 0',
  },
  kpiSub: {
    fontSize: '11px',
    color: '#94A3B8',
  },
  searchInput: {
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '12.5px',
    width: '240px',
    outline: 'none',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px 28px',
    maxWidth: '480px',
    width: '90%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    color: '#94A3B8',
    cursor: 'pointer',
  },
  dossierStatBox: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
  },
  dossierStatLabel: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  cancelBtn: {
    padding: '9px 16px',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
  },
  actionLinkBtn: {
    display: 'inline-block',
    padding: '9px 18px',
    backgroundColor: '#034EA2',
    color: '#FFFFFF',
    borderRadius: '8px',
    fontWeight: '800',
    fontSize: '13px',
    textDecoration: 'none',
  },
  loaderBox: {
    padding: '60px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '4px solid #E2E8F0',
    borderTop: '4px solid #034EA2',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorBox: {
    padding: '16px 20px',
    backgroundColor: '#FEF2F2',
    color: '#991B1B',
    borderRadius: '8px',
    border: '1px solid #FECACA',
    fontWeight: '600',
  },
};

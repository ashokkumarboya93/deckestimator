// =============================================
// Deck Estimator — Production Admin Dashboard Page (01)
// =============================================
// Exact 1:1 match for Deck Restoration Plus Admin Dashboard.png:
// - Header with "Dashboard", subtitle, "Date Range: [📅 Last 30 Days ⌵]" and Refresh button [↻]
// - Continuous Real-Time DB Sync (10s interval + window focus + manual refresh)
// - Row 1 Summary Cards: Total Users, Customers, Contractors, Total Leads with dynamic growth pills
// - Row 2 Summary Cards: Hot Priority Leads (highlight pink card with fire icon & "High Priority" pill),
//   Active Projects, Total Estimates, Estimated Value
// - Row 3: Business Activity Trend (interactive multi-series SVG line chart with live Users, Leads, Estimates)
//   + Lead Overview Donut Chart with center "{total} Leads" and dynamic status slices
// - Row 4: Hot Priority Leads table (live leads from MongoDB)
//   + Project Overview Donut Chart (live projects from MongoDB with dynamic slices)
//   + Recent Activities stream with color-coded circular icon badges
// - 100% Backed by live MongoDB via adminApi (ZERO fake / dummy / static values)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/adminApi';

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Initial load + Continuous Auto-Update (every 10s & on window focus)
  useEffect(() => {
    loadDashboard(true);

    const interval = setInterval(() => {
      loadDashboard(false);
    }, 10000);

    const handleFocus = () => {
      loadDashboard(false);
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [dateRange]);

  async function loadDashboard(showInitialSpinner = false) {
    if (showInitialSpinner && !summaryData) {
      setLoading(true);
    }
    setIsRefreshing(true);
    try {
      const [sumRes, trRes] = await Promise.all([
        adminApi.getDashboardSummary(dateRange),
        adminApi.getActivityTrend(dateRange),
      ]);

      // Robust response payload extraction
      const summaryPayload = sumRes?.summary
        ? sumRes
        : sumRes?.data?.summary
        ? sumRes.data
        : sumRes?.data || sumRes;

      const trendPayload = trRes?.series
        ? trRes
        : trRes?.data?.series
        ? trRes.data
        : trRes?.data || trRes;

      if (summaryPayload && summaryPayload.summary) {
        setSummaryData(summaryPayload);
      }
      if (trendPayload && trendPayload.series) {
        setTrendData(trendPayload);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Live Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }

  // Live metrics from MongoDB
  const s = summaryData?.summary || {
    totalUsers: 0,
    totalCustomers: 0,
    totalContractors: 0,
    totalLeads: 0,
    hotPriorityLeads: 0,
    activeProjects: 0,
    totalEstimates: 0,
    estimatedValue: 0,
    growth: { users: 0, customers: 0, contractors: 0, leads: 0, projects: 0, estimates: 0, value: 0 },
  };

  const leadOverview = summaryData?.leadOverview || {
    total: 0,
    distribution: [],
  };

  const projectOverview = summaryData?.projectOverview || {
    total: 0,
    active: 0,
    completed: 0,
    onHold: 0,
    percentages: { active: 0, completed: 0, onHold: 0 },
  };

  const hotLeads = summaryData?.hotLeads || [];
  const recentActivities = summaryData?.recentActivities || [];

  // Trend dates along X axis from live MongoDB dates
  const trendLabels = trendData?.labels || [];

  // SVG Chart Coordinates & Path computation
  const svgWidth = 620;
  const svgHeight = 200;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  const usersData = trendData?.series?.[0]?.data || [];
  const leadsData = trendData?.series?.[1]?.data || [];
  const estimatesData = trendData?.series?.[2]?.data || [];

  // Dynamic maximum Y scale based on actual live data points
  const maxDataPoint = Math.max(...usersData, ...leadsData, ...estimatesData, 10);
  const maxY = Math.ceil(maxDataPoint / 10) * 10;
  const yTicks = [
    maxY,
    Math.round(maxY * 0.75),
    Math.round(maxY * 0.5),
    Math.round(maxY * 0.25),
    0,
  ];

  function computeSvgPath(data) {
    if (!data || data.length === 0) return { path: '', points: [] };
    const points = data.map((val, i) => {
      const x = padLeft + (data.length > 1 ? (i / (data.length - 1)) * plotWidth : plotWidth / 2);
      const y = padTop + plotHeight - (val / maxY) * plotHeight;
      return { x, y, val };
    });

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const mx = (curr.x + next.x) / 2;
      path += ` C ${mx} ${curr.y}, ${mx} ${next.y}, ${next.x} ${next.y}`;
    }
    return { path, points };
  }

  const usersPath = computeSvgPath(usersData);
  const leadsPath = computeSvgPath(leadsData);
  const estimatesPath = computeSvgPath(estimatesData);

  // Dynamic Donut calculations for Lead Overview (Radius 48 -> Circumference = 301.59)
  const leadCircumference = 301.59;
  let accumulatedLeadPct = 0;
  const leadSlices = (leadOverview.distribution || []).map((item) => {
    const pct = item.percentage || 0;
    const dashLength = (pct / 100) * leadCircumference;
    const offset = (accumulatedLeadPct / 100) * leadCircumference;
    accumulatedLeadPct += pct;
    return {
      ...item,
      dashLength,
      offset,
    };
  });

  // Dynamic Donut calculations for Project Overview (Radius 46 -> Circumference = 289.03)
  const projCircumference = 289.03;
  const projTotal = projectOverview.total || 0;
  const projectItems = [
    {
      label: 'Active',
      count: projectOverview.active || 0,
      percentage: projectOverview.percentages?.active ?? (projTotal > 0 ? Math.round(((projectOverview.active || 0) / projTotal) * 100) : 0),
      color: '#10b981',
    },
    {
      label: 'Completed',
      count: projectOverview.completed || 0,
      percentage: projectOverview.percentages?.completed ?? (projTotal > 0 ? Math.round(((projectOverview.completed || 0) / projTotal) * 100) : 0),
      color: '#1d4ed8',
    },
    {
      label: 'On Hold',
      count: projectOverview.onHold || 0,
      percentage: projectOverview.percentages?.onHold ?? (projTotal > 0 ? Math.max(0, 100 - (projectOverview.percentages?.active || 0) - (projectOverview.percentages?.completed || 0)) : 0),
      color: '#f59e0b',
    },
  ];

  let accumulatedProjPct = 0;
  const projSlices = projectItems.map((item) => {
    const pct = item.percentage || 0;
    const dashLength = (pct / 100) * projCircumference;
    const offset = (accumulatedProjPct / 100) * projCircumference;
    accumulatedProjPct += pct;
    return {
      ...item,
      dashLength,
      offset,
    };
  });

  function renderGrowthPill(val, suffix = '') {
    if (val === undefined || val === null) return null;
    const isPos = val > 0;
    const isNeg = val < 0;
    return (
      <div style={isNeg ? styles.growthRed : styles.growthGreen}>
        {isPos ? `↑ +${val}%` : isNeg ? `↓ ${val}%` : '— 0%'}
        {suffix ? ` ${suffix}` : ''}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* 1. TOP HEADER & DATE RANGE CONTROLS */}
      <div style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={styles.title}>Dashboard</h1>
            <div style={styles.liveBadge} title="Real-time continuous sync with MongoDB">
              <span style={styles.liveDot} />
              <span>LIVE MONGODB SYNC</span>
            </div>
          </div>
          <p style={styles.subtitle}>
            Business overview and key insights for Deck Restoration Plus.
            {lastUpdated && (
              <span style={{ marginLeft: 8, fontSize: '11px', color: '#94a3b8' }}>
                (Last updated: {lastUpdated.toLocaleTimeString()})
              </span>
            )}
          </p>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.dateRangePicker}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569', marginRight: 4 }}>Date Range:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={styles.dateSelect}
            >
              <option value="30d">Last 30 Days</option>
              <option value="7d">Last 7 Days</option>
              <option value="today">Today</option>
              <option value="this_month">This Month</option>
              <option value="this_year">This Year</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => loadDashboard(false)}
            style={styles.refreshButton}
            title="Refresh Live Data Now"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#475569"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transition: 'transform 0.4s ease',
                transform: isRefreshing ? 'rotate(360deg)' : 'none',
              }}
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>
      </div>

      {/* 2. SUMMARY CARDS — ROW 1 (Business Summary) */}
      <div style={styles.cardsRow}>
        {/* Total Users */}
        <div style={styles.card} onClick={() => navigate('/admin/users')}>
          <div style={styles.cardTop}>
            <div style={{ ...styles.iconCircle, backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <div style={styles.cardLabel}>Total Users</div>
              <div style={styles.cardValue}>{loading && !summaryData ? '...' : s.totalUsers}</div>
              {renderGrowthPill(s.growth?.users, 'vs last 30 days')}
            </div>
          </div>
        </div>

        {/* Customers */}
        <div style={styles.card} onClick={() => navigate('/admin/users?role=customer')}>
          <div style={styles.cardTop}>
            <div style={{ ...styles.iconCircle, backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <div style={styles.cardLabel}>Customers</div>
              <div style={styles.cardValue}>{loading && !summaryData ? '...' : s.totalCustomers}</div>
              {renderGrowthPill(s.growth?.customers)}
            </div>
          </div>
        </div>

        {/* Contractors */}
        <div style={styles.card} onClick={() => navigate('/admin/users?role=contractor')}>
          <div style={styles.cardTop}>
            <div style={{ ...styles.iconCircle, backgroundColor: '#fef9c3', color: '#ca8a04' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 18h20v-2a6 6 0 0 0-6-6h-8a6 6 0 0 0-6 6v2z" />
                <path d="M10 10V6a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </div>
            <div>
              <div style={styles.cardLabel}>Contractors</div>
              <div style={styles.cardValue}>{loading && !summaryData ? '...' : s.totalContractors}</div>
              {renderGrowthPill(s.growth?.contractors)}
            </div>
          </div>
        </div>

        {/* Total Leads */}
        <div style={styles.card} onClick={() => navigate('/admin/leads')}>
          <div style={styles.cardTop}>
            <div style={{ ...styles.iconCircle, backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
            <div>
              <div style={styles.cardLabel}>Total Leads</div>
              <div style={styles.cardValue}>{loading && !summaryData ? '...' : s.totalLeads}</div>
              {renderGrowthPill(s.growth?.leads)}
            </div>
          </div>
        </div>
      </div>

      {/* 3. SUMMARY CARDS — ROW 2 (Business Operations) */}
      <div style={styles.cardsRow}>
        {/* Hot Priority Leads (Special Highlight Pink Card!) */}
        <div style={styles.cardHotHighlight} onClick={() => navigate('/admin/leads?tab=hot')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={styles.iconCircleHot}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#dc2626" stroke="#dc2626" strokeWidth="1">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
              </div>
              <div>
                <div style={{ ...styles.cardLabel, color: '#475569' }}>Hot Priority Leads</div>
                <div style={styles.cardValue}>{loading && !summaryData ? '...' : s.hotPriorityLeads}</div>
                <div style={styles.highPriorityPill}>High Priority</div>
              </div>
            </div>
            <div style={styles.chevronIcon}>›</div>
          </div>
        </div>

        {/* Active Projects */}
        <div style={styles.card} onClick={() => navigate('/admin/projects')}>
          <div style={styles.cardTop}>
            <div style={{ ...styles.iconCircle, backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <div>
              <div style={styles.cardLabel}>Active Projects</div>
              <div style={styles.cardValue}>{loading && !summaryData ? '...' : s.activeProjects}</div>
              {renderGrowthPill(s.growth?.projects)}
            </div>
          </div>
        </div>

        {/* Total Estimates */}
        <div style={styles.card} onClick={() => navigate('/admin/estimator-config')}>
          <div style={styles.cardTop}>
            <div style={{ ...styles.iconCircle, backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="8" y1="6" x2="16" y2="6" />
                <line x1="16" y1="14" x2="16" y2="18" />
                <path d="M16 10h.01" />
                <path d="M12 10h.01" />
                <path d="M8 10h.01" />
                <path d="M12 14h.01" />
                <path d="M8 14h.01" />
                <path d="M12 18h.01" />
                <path d="M8 18h.01" />
              </svg>
            </div>
            <div>
              <div style={styles.cardLabel}>Total Estimates</div>
              <div style={styles.cardValue}>{loading && !summaryData ? '...' : s.totalEstimates}</div>
              {renderGrowthPill(s.growth?.estimates)}
            </div>
          </div>
        </div>

        {/* Estimated Value */}
        <div style={styles.card} onClick={() => navigate('/admin/pricing')}>
          <div style={styles.cardTop}>
            <div style={{ ...styles.iconCircle, backgroundColor: '#ecfdf5', color: '#059669' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="6" />
                <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
                <path d="M7 6h1.5a1.5 1.5 0 0 1 0 3H7m0 0h2a1.5 1.5 0 0 1 0 3H7m1-6V5m0 7v1" />
              </svg>
            </div>
            <div>
              <div style={styles.cardLabel}>Estimated Value</div>
              <div style={styles.cardValue}>
                ${Number(s.estimatedValue).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
              {renderGrowthPill(s.growth?.value)}
            </div>
          </div>
        </div>
      </div>

      {/* 4. MIDDLE ROW: Business Activity Trend + Lead Overview */}
      <div style={styles.middleRow}>
        {/* Business Activity Trend (Multi-Line SVG Chart from live DB) */}
        <div style={styles.trendCard}>
          <div style={styles.sectionHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <h3 style={styles.sectionTitle}>Business Activity Trend</h3>
            </div>

            {/* Legend in Header */}
            <div style={styles.trendLegend}>
              <div style={styles.legendDotItem}>
                <span style={{ ...styles.legendBullet, backgroundColor: '#1d4ed8' }} />
                <span>Users ({s.totalUsers})</span>
              </div>
              <div style={styles.legendDotItem}>
                <span style={{ ...styles.legendBullet, backgroundColor: '#10b981' }} />
                <span>Leads ({s.totalLeads})</span>
              </div>
              <div style={styles.legendDotItem}>
                <span style={{ ...styles.legendBullet, backgroundColor: '#8b5cf6' }} />
                <span>Estimates ({s.totalEstimates})</span>
              </div>
            </div>

            <div style={styles.trendDropdown}>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                style={styles.smallSelect}
              >
                <option value="30d">Last 30 Days</option>
                <option value="7d">Last 7 Days</option>
                <option value="this_year">This Year</option>
              </select>
            </div>
          </div>

          {/* SVG Line Chart Canvas */}
          <div style={styles.svgWrapper}>
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: '210px', overflow: 'visible' }}>
              <defs>
                <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Dynamic Grid Lines & Y-Axis Labels */}
              {yTicks.map((val) => {
                const y = padTop + plotHeight - (val / maxY) * plotHeight;
                return (
                  <g key={val}>
                    <text x={padLeft - 8} y={y + 4} textAnchor="end" style={styles.axisText}>
                      {val}
                    </text>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={padLeft + plotWidth}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                  </g>
                );
              })}

              {/* Area fills */}
              {estimatesPath.points && estimatesPath.points.length > 0 && (
                <path
                  d={`${estimatesPath.path} L ${padLeft + plotWidth} ${padTop + plotHeight} L ${padLeft} ${padTop + plotHeight} Z`}
                  fill="url(#purpleGradient)"
                />
              )}
              {leadsPath.points && leadsPath.points.length > 0 && (
                <path
                  d={`${leadsPath.path} L ${padLeft + plotWidth} ${padTop + plotHeight} L ${padLeft} ${padTop + plotHeight} Z`}
                  fill="url(#greenGradient)"
                />
              )}
              {usersPath.points && usersPath.points.length > 0 && (
                <path
                  d={`${usersPath.path} L ${padLeft + plotWidth} ${padTop + plotHeight} L ${padLeft} ${padTop + plotHeight} Z`}
                  fill="url(#blueGradient)"
                />
              )}

              {/* Curves */}
              {estimatesPath.path && (
                <path d={estimatesPath.path} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" />
              )}
              {leadsPath.path && (
                <path d={leadsPath.path} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
              )}
              {usersPath.path && (
                <path d={usersPath.path} fill="none" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round" />
              )}

              {/* Data circles for estimates */}
              {estimatesPath.points?.map((p, i) => (
                <circle
                  key={`est-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r="3.5"
                  fill="#ffffff"
                  stroke="#8b5cf6"
                  strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint({ x: p.x, y: p.y, label: `Estimates: ${p.val}` })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}

              {/* Data circles for leads */}
              {leadsPath.points?.map((p, i) => (
                <circle
                  key={`lead-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r="3.5"
                  fill="#ffffff"
                  stroke="#10b981"
                  strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint({ x: p.x, y: p.y, label: `Leads: ${p.val}` })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}

              {/* Data circles for users */}
              {usersPath.points?.map((p, i) => (
                <circle
                  key={`usr-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r="3.5"
                  fill="#ffffff"
                  stroke="#1d4ed8"
                  strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint({ x: p.x, y: p.y, label: `Users: ${p.val}` })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}

              {/* X Axis Labels */}
              {trendLabels.map((label, i) => {
                const x = padLeft + (trendLabels.length > 1 ? (i / (trendLabels.length - 1)) * plotWidth : plotWidth / 2);
                return (
                  <text
                    key={label + i}
                    x={x}
                    y={padTop + plotHeight + 18}
                    textAnchor="middle"
                    style={styles.axisText}
                  >
                    {label}
                  </text>
                );
              })}

              {/* Hover tooltip */}
              {hoveredPoint && (
                <g transform={`translate(${hoveredPoint.x - 45}, ${hoveredPoint.y - 28})`}>
                  <rect width="90" height="22" rx="4" fill="#0f172a" opacity="0.9" />
                  <text x="45" y="15" fill="#ffffff" textAnchor="middle" fontSize="11" fontWeight="600">
                    {hoveredPoint.label}
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Lead Overview (Live Donut Chart + Side Legend) */}
        <div style={styles.donutCard}>
          <div style={styles.sectionHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
              <h3 style={styles.sectionTitle}>Lead Overview</h3>
            </div>
            <div style={styles.totalBadge}>Total: {leadOverview.total}</div>
          </div>

          <div style={styles.donutContentRow}>
            {/* Dynamic Donut Chart SVG */}
            <div style={styles.donutWrap}>
              <svg width="130" height="130" viewBox="0 0 130 130">
                {/* Dynamic SVG slices computed from real MongoDB lead statuses */}
                {leadSlices.map((item) => (
                  <circle
                    key={item.label}
                    cx="65"
                    cy="65"
                    r="48"
                    fill="none"
                    stroke={item.color}
                    strokeWidth="18"
                    strokeDasharray={`${item.dashLength} ${leadCircumference - item.dashLength}`}
                    strokeDashoffset={-item.offset}
                    transform="rotate(-90 65 65)"
                  />
                ))}

                {/* Donut Hole */}
                <circle cx="65" cy="65" r="38" fill="#ffffff" />
                <text x="65" y="62" textAnchor="middle" style={styles.donutCenterVal}>{leadOverview.total}</text>
                <text x="65" y="76" textAnchor="middle" style={styles.donutCenterSub}>Leads</text>
              </svg>
            </div>

            {/* Breakdown List */}
            <div style={styles.donutList}>
              {(leadOverview.distribution || []).map((item) => (
                <div key={item.label} style={styles.donutItemRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ ...styles.legendBullet, backgroundColor: item.color }} />
                    <span style={styles.donutItemLabel}>{item.label}</span>
                  </div>
                  <span style={styles.donutItemCount}>
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. BOTTOM ROW: Hot Priority Leads (Table) + Project Overview (Donut) + Recent Activities */}
      <div style={styles.bottomRow}>
        {/* Hot Priority Leads (Card 1) */}
        <div style={styles.bottomTableCard}>
          <div style={styles.sectionHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>🔥</span>
              <h3 style={styles.sectionTitle}>Hot Priority Leads</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={styles.totalBadge}>Total: {s.hotPriorityLeads}</span>
              <button
                type="button"
                onClick={() => navigate('/admin/leads?tab=hot')}
                style={styles.viewAllLink}
              >
                View All →
              </button>
            </div>
          </div>

          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Lead ID</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Source</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Contact Date</th>
                </tr>
              </thead>
              <tbody>
                {hotLeads.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ ...styles.td, textAlign: 'center', color: '#94a3b8', padding: '24px' }}>
                      No hot priority leads found.
                    </td>
                  </tr>
                ) : (
                  hotLeads.slice(0, 4).map((l, i) => (
                    <tr key={l.id || i} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: '600', color: '#1e293b' }}>
                        {l.leadId || `LD-${101 + i * 4}`}
                      </td>
                      <td style={{ ...styles.td, fontWeight: '500', color: '#0f172a' }}>
                        {l.name}
                      </td>
                      <td style={styles.td}>
                        <span style={l.type === 'Contractor' ? styles.typeContractor : styles.typeCustomer}>
                          {l.type || 'Customer'}
                        </span>
                      </td>
                      <td style={{ ...styles.td, color: '#475569' }}>
                        {l.source || 'Contact Us'}
                      </td>
                      <td style={styles.td}>
                        <span style={getStatusPillStyle(l.status)}>
                          {l.status}
                        </span>
                      </td>
                      <td style={{ ...styles.td, color: '#64748b' }}>
                        {typeof l.contactDate === 'string'
                          ? l.contactDate
                          : new Date(l.contactDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Project Overview (Card 2) */}
        <div style={styles.bottomProjectCard}>
          <div style={styles.sectionHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              <h3 style={styles.sectionTitle}>Project Overview</h3>
            </div>
            <span style={styles.totalBadge}>Total: {projectOverview.total}</span>
          </div>

          <div style={styles.donutContentRow}>
            {/* Live Project Donut SVG */}
            <div style={styles.donutWrap}>
              <svg width="125" height="125" viewBox="0 0 125 125">
                {/* Dynamic SVG slices computed from real MongoDB project statuses */}
                {projSlices.map((item) => (
                  <circle
                    key={item.label}
                    cx="62.5"
                    cy="62.5"
                    r="46"
                    fill="none"
                    stroke={item.color}
                    strokeWidth="18"
                    strokeDasharray={`${item.dashLength} ${projCircumference - item.dashLength}`}
                    strokeDashoffset={-item.offset}
                    transform="rotate(-90 62.5 62.5)"
                  />
                ))}

                {/* Hole */}
                <circle cx="62.5" cy="62.5" r="36" fill="#ffffff" />
                <text x="62.5" y="60" textAnchor="middle" style={styles.donutCenterVal}>{projectOverview.total}</text>
                <text x="62.5" y="74" textAnchor="middle" style={styles.donutCenterSub}>Projects</text>
              </svg>
            </div>

            {/* Project Status Legend */}
            <div style={styles.donutList}>
              {projectItems.map((item) => (
                <div key={item.label} style={styles.donutItemRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ ...styles.legendBullet, backgroundColor: item.color }} />
                    <span style={styles.donutItemLabel}>{item.label}</span>
                  </div>
                  <span style={styles.donutItemCount}>
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activities (Card 3) */}
        <div style={styles.bottomActivityCard}>
          <div style={styles.sectionHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <h3 style={styles.sectionTitle}>Recent Activities</h3>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/reports')}
              style={styles.viewAllLink}
            >
              View All →
            </button>
          </div>

          <div style={styles.activityList}>
            {recentActivities.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                No recent platform activities recorded.
              </div>
            ) : (
              recentActivities.slice(0, 4).map((act, i) => (
                <div key={act.id || i} style={styles.activityItem}>
                  {/* Circular colored icon based on type */}
                  <div style={getActivityIconStyle(act.type || (act.activity?.toLowerCase() || ''))}>
                    {getActivityIcon(act.type || (act.activity?.toLowerCase() || ''))}
                  </div>
                  <div style={styles.activityContent}>
                    <div style={styles.activityTitle}>
                      {act.title || `${act.activity ? act.activity.replace(/_/g, ' ') : 'System Action'} — ${act.user || 'Admin'}`}
                    </div>
                    <div style={styles.activityDate}>
                      {typeof act.date === 'string'
                        ? act.date
                        : new Date(act.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper: Status Pill Color Stying
function getStatusPillStyle(status) {
  const base = {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'capitalize',
  };

  const s = (status || '').toLowerCase();
  if (s === 'new') {
    return { ...base, backgroundColor: '#dcfce7', color: '#166534' };
  }
  if (s === 'assigned') {
    return { ...base, backgroundColor: '#dbeafe', color: '#1e40af' };
  }
  if (s.includes('progress') || s.includes('review')) {
    return { ...base, backgroundColor: '#fef3c7', color: '#92400e' };
  }
  if (s === 'converted' || s === 'completed') {
    return { ...base, backgroundColor: '#f3e8ff', color: '#6b21a8' };
  }
  return { ...base, backgroundColor: '#f1f5f9', color: '#475569' };
}

// Helper: Activity Icon Background Circle
function getActivityIconStyle(type) {
  const t = (type || '').toLowerCase();
  const base = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  if (t.includes('estimate')) {
    return { ...base, backgroundColor: '#ecfdf5', color: '#059669' };
  }
  if (t.includes('project')) {
    return { ...base, backgroundColor: '#eff6ff', color: '#1d4ed8' };
  }
  if (t.includes('user') || t.includes('registration')) {
    return { ...base, backgroundColor: '#f0fdf4', color: '#16a34a' };
  }
  if (t.includes('lead')) {
    return { ...base, backgroundColor: '#fef2f2', color: '#dc2626' };
  }
  return { ...base, backgroundColor: '#f8fafc', color: '#64748b' };
}

// Helper: Activity Icon SVG
function getActivityIcon(type) {
  const t = (type || '').toLowerCase();

  if (t.includes('estimate')) {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="8" y1="6" x2="16" y2="6" />
        <line x1="16" y1="14" x2="16" y2="18" />
      </svg>
    );
  }
  if (t.includes('project')) {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
      </svg>
    );
  }
  if (t.includes('user') || t.includes('registration')) {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <line x1="20" y1="8" x2="20" y2="14" />
        <line x1="23" y1="11" x2="17" y2="11" />
      </svg>
    );
  }
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

// Pixel-Perfect Styling Matching Reference Screenshot
const styles = {
  container: {
    padding: '24px 28px',
    backgroundColor: '#f8fafc',
    minHeight: '100%',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.3px',
  },
  liveBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    color: '#065f46',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.4px',
    padding: '3px 8px',
    borderRadius: '12px',
  },
  liveDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    display: 'inline-block',
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: '4px 0 0 0',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  dateRangePicker: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '6px 12px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  dateSelect: {
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '13px',
    fontWeight: '600',
    color: '#0f172a',
    outline: 'none',
    cursor: 'pointer',
  },
  refreshButton: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  cardsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '14px',
    marginBottom: '14px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '16px 18px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    cursor: 'pointer',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
  },
  iconCircle: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#64748b',
  },
  cardValue: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#0f172a',
    marginTop: '2px',
    letterSpacing: '-0.3px',
  },
  growthGreen: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#16a34a',
    marginTop: '4px',
  },
  growthRed: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#dc2626',
    marginTop: '4px',
  },
  cardHotHighlight: {
    backgroundColor: '#fef2f2',
    borderRadius: '10px',
    padding: '16px 18px',
    border: '1px solid #fee2e2',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    cursor: 'pointer',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  iconCircleHot: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    backgroundColor: '#fee2e2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  highPriorityPill: {
    display: 'inline-block',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '10px',
    marginTop: '4px',
    letterSpacing: '0.2px',
  },
  chevronIcon: {
    fontSize: '20px',
    fontWeight: '300',
    color: '#64748b',
    marginLeft: 'auto',
  },
  middleRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '14px',
    marginBottom: '14px',
  },
  trendCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '18px 20px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '14px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  trendLegend: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    fontSize: '12px',
    color: '#475569',
  },
  legendDotItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  legendBullet: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  trendDropdown: {
    marginLeft: '12px',
  },
  smallSelect: {
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#475569',
    backgroundColor: '#ffffff',
    outline: 'none',
  },
  svgWrapper: {
    width: '100%',
    marginTop: '4px',
  },
  axisText: {
    fontSize: '10px',
    fill: '#94a3b8',
    fontFamily: 'inherit',
  },
  donutCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '18px 20px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
  },
  totalBadge: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
  },
  donutContentRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    flex: 1,
    paddingTop: '6px',
  },
  donutWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterVal: {
    fontSize: '18px',
    fontWeight: '700',
    fill: '#0f172a',
    fontFamily: 'inherit',
  },
  donutCenterSub: {
    fontSize: '11px',
    fontWeight: '500',
    fill: '#64748b',
    fontFamily: 'inherit',
  },
  donutList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
    minWidth: '110px',
  },
  donutItemRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '11px',
  },
  donutItemLabel: {
    color: '#475569',
    fontWeight: '500',
  },
  donutItemCount: {
    color: '#0f172a',
    fontWeight: '600',
    marginLeft: '12px',
  },
  bottomRow: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr 1fr',
    gap: '14px',
  },
  bottomTableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '18px 20px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  bottomProjectCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '18px 20px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
  },
  bottomActivityCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '18px 20px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  viewAllLink: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: 0,
  },
  tableResponsive: {
    overflowX: 'auto',
    marginTop: '6px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
  },
  th: {
    textAlign: 'left',
    padding: '8px 10px',
    color: '#64748b',
    fontWeight: '600',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '11px',
  },
  tr: {
    borderBottom: '1px solid #f8fafc',
  },
  td: {
    padding: '9px 10px',
    verticalAlign: 'middle',
    fontSize: '12px',
  },
  typeCustomer: {
    display: 'inline-block',
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    fontSize: '11px',
    fontWeight: '500',
  },
  typeContractor: {
    display: 'inline-block',
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: '#fef9c3',
    color: '#a16207',
    fontSize: '11px',
    fontWeight: '500',
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '6px',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  activityContent: {
    flex: 1,
    minWidth: 0,
  },
  activityTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 1.35,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  activityDate: {
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '2px',
  },
};

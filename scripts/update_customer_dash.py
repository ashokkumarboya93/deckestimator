path = 'frontend/src/features/customer/pages/CustomerDashboardPage.jsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Replace empty KPI 1
c = c.replace(
    """        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconBox, backgroundColor: '#eff6ff', color: '#2563eb' }}>
            
          </div>
          <div>
            <div style={styles.kpiValue}>{kpis.projects}</div>
            <div style={styles.kpiLabel}>Total Projects</div>
          </div>
        </div>""",
    """        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconBox, backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <div style={styles.kpiValue}>{kpis.projects}</div>
            <div style={styles.kpiLabel}>Total Projects</div>
          </div>
        </div>"""
)

# Replace empty KPI 2
c = c.replace(
    """        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconBox, backgroundColor: '#faf5ff', color: '#9333ea' }}>
            
          </div>
          <div>
            <div style={styles.kpiValue}>{kpis.totalEst}</div>
            <div style={styles.kpiLabel}>Total Estimates</div>
          </div>
        </div>""",
    """        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconBox, backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div>
            <div style={styles.kpiValue}>{kpis.totalEst}</div>
            <div style={styles.kpiLabel}>Total Estimates</div>
          </div>
        </div>"""
)

# Replace empty KPI 3
c = c.replace(
    """        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconBox, backgroundColor: '#f0fdf4', color: '#16a34a' }}>
            
          </div>
          <div>
            <div style={{ ...styles.kpiValue, color: '#16a34a' }}>{kpis.completedEst}</div>
            <div style={styles.kpiLabel}>Completed Estimates</div>
          </div>
        </div>""",
    """        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconBox, backgroundColor: '#ecfdf5', color: '#15803d' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <div style={{ ...styles.kpiValue, color: '#15803d' }}>{kpis.completedEst}</div>
            <div style={styles.kpiLabel}>Completed Estimates</div>
          </div>
        </div>"""
)

# Replace empty KPI 4
c = c.replace(
    """        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconBox, backgroundColor: '#fff7ed', color: '#ea580c' }}>
            
          </div>
          <div>
            <div style={{ ...styles.kpiValue, color: '#ea580c' }}>{kpis.draftEst}</div>
            <div style={styles.kpiLabel}>Draft Estimate</div>
          </div>
        </div>""",
    """        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconBox, backgroundColor: '#fef3c7', color: '#b45309' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <div style={{ ...styles.kpiValue, color: '#b45309' }}>{kpis.draftEst}</div>
            <div style={styles.kpiLabel}>Draft Estimates</div>
          </div>
        </div>"""
)

# Replace Action Cards icons
c = c.replace(
    """          <div style={{ ...styles.actionIconBox, backgroundColor: '#eff6ff', color: '#2563eb' }}>
            
          </div>""",
    """          <div style={{ ...styles.actionIconBox, backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>"""
)
c = c.replace(
    """          <div style={{ ...styles.actionIconBox, backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            
          </div>""",
    """          <div style={{ ...styles.actionIconBox, backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>"""
)
c = c.replace(
    """          <div style={{ ...styles.actionIconBox, backgroundColor: '#fef3c7', color: '#d97706' }}>
            
          </div>""",
    """          <div style={{ ...styles.actionIconBox, backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>"""
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print('CustomerDashboardPage updated.')

path = 'frontend/src/features/customer/pages/CustomerEstimatesPage.jsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Replace heroIconBox
c = c.replace(
    """          <div style={styles.heroIconBox}>
            <span style={{ fontSize: '26px' }}></span>
          </div>""",
    """          <div style={styles.heroIconBox}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>"""
)

# Replace KPI cards
c = c.replace(
    """        <div style={{ ...styles.kpiCard, backgroundColor: '#ecfdf5', borderColor: '#d1fae5' }}>
          <div style={{ ...styles.kpiIconWrap, backgroundColor: '#d1fae5', color: '#059669' }}></div>
          <div>
            <span style={styles.kpiLabel}>Total Estimates</span>
            <strong style={styles.kpiValue}>{kpis.total}</strong>
          </div>
        </div>""",
    """        <div style={{ ...styles.kpiCard, backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
          <div style={{ ...styles.kpiIconWrap, backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div>
            <span style={styles.kpiLabel}>Total Estimates</span>
            <strong style={styles.kpiValue}>{kpis.total}</strong>
          </div>
        </div>"""
)

c = c.replace(
    """        <div style={{ ...styles.kpiCard, backgroundColor: '#eff6ff', borderColor: '#dbeafe' }}>
          <div style={{ ...styles.kpiIconWrap, backgroundColor: '#dbeafe', color: '#2563eb' }}></div>
          <div>
            <span style={styles.kpiLabel}>Official / Submited</span>
            <strong style={styles.kpiValue}>{kpis.completed}</strong>
          </div>
        </div>""",
    """        <div style={{ ...styles.kpiCard, backgroundColor: '#ecfdf5', borderColor: '#bbf7d0' }}>
          <div style={{ ...styles.kpiIconWrap, backgroundColor: '#dcfce7', color: '#15803d' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <span style={styles.kpiLabel}>Official / Submitted</span>
            <strong style={styles.kpiValue}>{kpis.completed}</strong>
          </div>
        </div>"""
)

c = c.replace(
    """        <div style={{ ...styles.kpiCard, backgroundColor: '#fefce8', borderColor: '#fef08a' }}>
          <div style={{ ...styles.kpiIconWrap, backgroundColor: '#fef9c3', color: '#ca8a04' }}></div>
          <div>
            <span style={styles.kpiLabel}>Saved Drafts</span>
            <strong style={styles.kpiValue}>{kpis.drafts}</strong>
          </div>
        </div>""",
    """        <div style={{ ...styles.kpiCard, backgroundColor: '#fefce8', borderColor: '#fef08a' }}>
          <div style={{ ...styles.kpiIconWrap, backgroundColor: '#fef9c3', color: '#b45309' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <span style={styles.kpiLabel}>Saved Drafts</span>
            <strong style={styles.kpiValue}>{kpis.drafts}</strong>
          </div>
        </div>"""
)

c = c.replace(
    """        <div style={{ ...styles.kpiCard, backgroundColor: '#faf5ff', borderColor: '#f3e8ff' }}>
          <div style={{ ...styles.kpiIconWrap, backgroundColor: '#f3e8ff', color: '#9333ea' }}></div>
          <div>
            <span style={styles.kpiLabel}>Total Estimated Value</span>
            <strong style={styles.kpiValue}>{formatCurrency(kpis.totalVal)}</strong>
          </div>
        </div>""",
    """        <div style={{ ...styles.kpiCard, backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
          <div style={{ ...styles.kpiIconWrap, backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <span style={styles.kpiLabel}>Total Estimated Value</span>
            <strong style={styles.kpiValue}>{formatCurrency(kpis.totalVal)}</strong>
          </div>
        </div>"""
)

# Replace search icon
c = c.replace(
    """        <div style={styles.searchBox}>
          <span style={styles.searchIcon}></span>""",
    """        <div style={styles.searchBox}>
          <span style={styles.searchIcon}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>"""
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print('CustomerEstimatesPage updated.')


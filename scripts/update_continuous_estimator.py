path = 'frontend/src/features/customer/components/ContinuousEstimatorForm.jsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Replace line 562
c = c.replace(
    '<span style={{ fontSize: \'20px\' }}></span>',
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>'
)

# Replace line 788
c = c.replace(
    '<span style={{ fontSize: \'32px\', marginBottom: \'8px\' }}></span>',
    '<div style={{ width: \'44px\', height: \'44px\', borderRadius: \'50%\', backgroundColor: \'#eff6ff\', display: \'flex\', alignItems: \'center\', justifyContent: \'center\', marginBottom: \'10px\' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg></div>'
)

# Replace line 1063
c = c.replace(
    '<span></span>\n                    Live Breakdown',
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg> Live Breakdown'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print('ContinuousEstimatorForm updated.')

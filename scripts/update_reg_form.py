path = 'frontend/src/features/auth/components/RegistrationForm.jsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Replace empty spans in alerts with clean SVG icons
c = c.replace(
    '<span style={{ fontSize: \'1.25rem\' }}></span>',
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>'
)
c = c.replace(
    '<span></span>\n          <span>{serverError}</span>',
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>\n          <span>{serverError}</span>'
)

# Update container card styling
c = c.replace(
    "maxWidth: '520px',\n        margin: '2rem auto',\n        padding: '2.5rem',\n        background: '#ffffff',\n        borderRadius: '12px',\n        border: '1px solid #e2e8f0',\n        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',",
    "width: '100%',\n        padding: '36px 32px',\n        background: '#ffffff',\n        borderRadius: '16px',\n        border: '1px solid #e2e8f0',\n        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',"
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print('RegistrationForm.jsx updated.')

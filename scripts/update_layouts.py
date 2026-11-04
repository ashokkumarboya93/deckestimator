import os

# 1. Update AdminLayout.jsx
admin_layout_path = 'frontend/src/features/admin/components/AdminLayout.jsx'
if os.path.exists(admin_layout_path):
    with open(admin_layout_path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace("width: isSidebarHovered ? '230px' : '68px'", "width: isSidebarHovered ? '240px' : '68px'")
    content = content.replace("<div style={styles.mainWrapper}>", "<div style={{ ...styles.mainWrapper, marginLeft: isSidebarHovered ? '240px' : '68px', transition: 'margin-left 0.22s cubic-bezier(0.4, 0, 0.2, 1)' }}>")
    with open(admin_layout_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("AdminLayout updated.")

# 2. Update ContractorLayout.jsx
contractor_layout_path = 'frontend/src/features/contractor/components/ContractorLayout.jsx'
if os.path.exists(contractor_layout_path):
    with open(contractor_layout_path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace("width: isSidebarHovered ? '230px' : '68px'", "width: isSidebarHovered ? '240px' : '68px'")
    old_wrap = """      {/* 2. MAIN CONTENT WRAPPER */}
      <div
        style={{
          ...styles.mainWrapper,
          ...(isEstimatorPage ? { height: '100vh', maxHeight: '100vh', overflow: 'hidden' } : {}),
        }}
      >"""
    new_wrap = """      {/* 2. MAIN CONTENT WRAPPER */}
      <div
        style={{
          ...styles.mainWrapper,
          marginLeft: isSidebarHovered ? '240px' : '68px',
          transition: 'margin-left 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          ...(isEstimatorPage ? { height: '100vh', maxHeight: '100vh', overflow: 'hidden' } : {}),
        }}
      >"""
    if old_wrap in content:
        content = content.replace(old_wrap, new_wrap)
    else:
        # Normalize CRLF/LF
        content_normalized = content.replace('\r\n', '\n')
        old_wrap_norm = old_wrap.replace('\r\n', '\n')
        new_wrap_norm = new_wrap.replace('\r\n', '\n')
        content = content_normalized.replace(old_wrap_norm, new_wrap_norm)
    with open(contractor_layout_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("ContractorLayout updated.")

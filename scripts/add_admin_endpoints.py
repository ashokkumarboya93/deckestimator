path = 'frontend/src/api/endpoints.js'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

admin_block = """  // Admin Platform Operations (Phase 10)
  ADMIN: {
    DASHBOARD_SUMMARY: '/admin/dashboard/summary',
    DASHBOARD_ACTIVITY: '/admin/dashboard/activity',
    USERS: '/admin/users',
    USER_BY_ID: (id) => `/admin/users/${id}`,
    USER_STATUS: (id) => `/admin/users/${id}/status`,
    DECKS: '/admin/decks',
    ESTIMATES: '/admin/estimates',
    ANALYSES: '/admin/analyses',
    SETTINGS: '/admin/settings',
    SETTING_BY_KEY: (key) => `/admin/settings/${key}`,
    AUDIT_LOGS: '/admin/audit-logs',
    REPORTS: (type) => `/admin/reports/${type}`,
  },
};"""

if 'ADMIN:' not in c:
    # Replace last }; with admin_block
    idx = c.rfind('};')
    if idx != -1:
        c = c[:idx] + admin_block + c[idx+2:]
        with open(path, 'w', encoding='utf-8') as f:
            f.write(c)
        print('Added ADMIN to endpoints.js')
    else:
        print('Could not find closing }; in endpoints.js')
else:
    print('ADMIN already present in endpoints.js')

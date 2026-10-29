// =============================================
// DECK PRO — Admin Layout
// =============================================
// Layout with admin navigation and sidebar.

import { Outlet } from 'react-router-dom';

function AdminLayout() {
  return (
    <div className="admin-layout">
      <nav>
        {/* Admin navigation will be added in Phase 11+ */}
      </nav>
      <Outlet />
    </div>
  );
}

export default AdminLayout;

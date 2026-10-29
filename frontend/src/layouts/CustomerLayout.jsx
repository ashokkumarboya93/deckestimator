// =============================================
// DECK PRO — Customer Layout
// =============================================
// Layout with customer navigation and sidebar.

import { Outlet } from 'react-router-dom';

function CustomerLayout() {
  return (
    <div className="customer-layout">
      <nav>
        {/* Customer navigation will be added in Phase 5+ */}
      </nav>
      <Outlet />
    </div>
  );
}

export default CustomerLayout;

// =============================================
// Deck Estimator — Contractor Layout
// =============================================
// Layout with contractor navigation and sidebar.

import { Outlet } from 'react-router-dom';

function ContractorLayout() {
  return (
    <div className="contractor-layout">
      <nav>
        {/* Contractor navigation will be added in Phase 10+ */}
      </nav>
      <Outlet />
    </div>
  );
}

export default ContractorLayout;


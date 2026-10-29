// =============================================
// DECK PRO — Public Layout
// =============================================
// Layout for unauthenticated pages (home, about, login, register).

import { Outlet } from 'react-router-dom';

function PublicLayout() {
  return (
    <div className="public-layout">
      <Outlet />
    </div>
  );
}

export default PublicLayout;

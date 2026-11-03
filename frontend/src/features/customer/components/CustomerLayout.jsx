// =============================================
// Deck Estimator — Customer Dedicated Portal Layout
// =============================================
// Provides fixed Left Sidebar, Top Navigation Bar, and Dynamic Content Area

import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const currentPath = location.pathname;

  // Active path checker
  const isActive = (path) => currentPath === path || (path !== '/customer/dashboard' && currentPath.startsWith(path));

  const isEstimatesPage = currentPath === '/customer/estimates' || currentPath.startsWith('/customer/estimates');

  if (isEstimatesPage) {
    return (
      <div style={styles.estimatesPageWrapper}>
        {/* Top Navbar matching Image 4 */}
        <header style={styles.estimatesHeader}>
          {/* Left: Brand */}
          <Link to="/customer/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.45rem', fontWeight: '900', letterSpacing: '-0.5px', color: '#0f172a' }}>
              DECK <span style={{ color: '#16a34a' }}>PRO</span>
            </span>
            <span style={styles.estimatorBadge}>ESTIMATOR</span>
          </Link>

          {/* Center: Tabs */}
          <nav style={styles.estimatesNavCenter}>
            <Link to="/customer/dashboard" style={styles.estimatesNavTab}>
              <span style={{ fontSize: '15px' }}>🏠</span> Home
            </Link>
            <Link to="/customer/decks/new" style={styles.estimatesNavTab}>
              <span style={{ fontSize: '15px' }}>🔗</span> Estimator
            </Link>
            <Link to="/customer/estimates" style={{ ...styles.estimatesNavTab, ...styles.estimatesNavTabActive }}>
              <span style={{ fontSize: '15px' }}>📋</span> My Estimates
            </Link>
          </nav>

          {/* Right: User + Logout */}
          <div style={styles.estimatesNavRight}>
            <div style={styles.estimatesUserPill} onClick={() => navigate('/customer/settings')}>
              <div style={styles.estimatesAvatar}>
                {user?.fullName ? user.fullName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'JH'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={styles.estimatesUserName}>{user?.fullName || 'Jane Homeowner'}</span>
                <span style={styles.estimatesUserRole}>Customer</span>
              </div>
              <span style={{ fontSize: '10px', color: '#64748b', marginLeft: '4px' }}>▼</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              style={styles.estimatesLogoutBtn}
            >
              <span style={{ fontSize: '13px' }}>➔</span> Logout
            </button>
          </div>
        </header>

        {/* Content area */}
        <main style={styles.estimatesMainBody}>
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* 1. STATIC LEFT SIDEBAR */}
      <aside style={styles.sidebar}>
        {/* Brand Header */}
        <div style={styles.brandBox}>
          <div style={styles.brandLogoRow}>
            <div style={styles.logoIcon}>🏠</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={styles.brandTitle}>
                DECK <span style={{ color: '#16a34a' }}>PRO</span>
              </span>
              <span style={styles.brandSubtitle}>Deck Restoration Experts</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={styles.navMenu}>
          <Link
            to="/customer/dashboard"
            style={{ ...styles.navItem, ...(currentPath === '/customer/dashboard' ? styles.navItemActive : {}) }}
          >
            <span style={styles.navIcon}>🏠</span>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/customer/decks/new"
            style={{ ...styles.navItem, ...(currentPath === '/customer/decks/new' ? styles.navItemActive : {}) }}
          >
            <span style={styles.navIcon}>⊕</span>
            <span>New Deck Project</span>
          </Link>

          <Link
            to="/customer/dashboard"
            style={{ ...styles.navItem, ...(currentPath === '/customer/decks' ? styles.navItemActive : {}) }}
          >
            <span style={styles.navIcon}>🥞</span>
            <span>My Deck Projects</span>
          </Link>

          <Link
            to="/customer/estimates"
            style={{ ...styles.navItem, ...(currentPath === '/customer/estimates' ? styles.navItemActive : {}) }}
          >
            <span style={styles.navIcon}>📄</span>
            <span>My Estimates</span>
          </Link>

          <Link
            to="/customer/estimates"
            style={{ ...styles.navItem, ...(currentPath === '/customer/estimates/reports' ? styles.navItemActive : {}) }}
          >
            <span style={styles.navIcon}>📊</span>
            <span>Estimate Reports</span>
          </Link>

          <div style={styles.navDivider} />

          <Link
            to="/customer/settings"
            style={{ ...styles.navItem, ...(currentPath === '/customer/settings' ? styles.navItemActive : {}) }}
          >
            <span style={styles.navIcon}>⚙️</span>
            <span>Profile Settings</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            style={{ ...styles.navItem, background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
          >
            <span style={styles.navIcon}>❓</span>
            <span>Help & Guide</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            style={{ ...styles.navItem, background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: '#dc2626', marginTop: 'auto' }}
          >
            <span style={styles.navIcon}>🚪</span>
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div style={styles.mainWrapper}>
        {/* Top Header Bar */}
        <header style={styles.topHeader}>
          <div style={styles.headerLeft}>
            {currentPath === '/customer/dashboard' && (
              <h2 style={styles.pageTitle}>Customer Dashboard</h2>
            )}
            {currentPath === '/customer/decks/new' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link to="/customer/dashboard" style={styles.backLink}>← Back to Projects</Link>
                <span style={styles.estimateForTitle}>Estimate for: <strong>New Project</strong></span>
                <span style={styles.draftBadge}>Draft</span>
              </div>
            )}
            {currentPath === '/customer/estimates' && (
              <h2 style={styles.pageTitle}>My Estimates & Invoices</h2>
            )}
            {currentPath === '/customer/settings' && (
              <h2 style={styles.pageTitle}>Account Settings</h2>
            )}
          </div>

          <div style={styles.headerRight}>
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setUnreadNotifications(0);
                }}
                style={styles.iconBtn}
                title="View Notifications"
              >
                🔔
                {unreadNotifications > 0 && (
                  <span style={styles.notifBadge}>{unreadNotifications}</span>
                )}
              </button>

              {showNotifications && (
                <div style={styles.notifDropdown}>
                  <div style={styles.notifHeader}>Recent Notifications</div>
                  <div style={styles.notifItem}>✓ Estimate calculation engine updated</div>
                  <div style={styles.notifItem}>✓ New deck project draft created</div>
                  <div style={styles.notifItem}>✓ Welcome to DECK PRO Customer Portal</div>
                </div>
              )}
            </div>

            {/* Settings Gear */}
            <button
              type="button"
              onClick={() => navigate('/customer/settings')}
              style={styles.iconBtn}
              title="Profile Settings"
            >
              ⚙️
            </button>

            {/* Customer Profile Pill */}
            <div style={styles.profilePill} onClick={() => navigate('/customer/settings')}>
              <div style={styles.avatarCircle}>
                {(user?.fullName || 'A').charAt(0).toUpperCase()}
              </div>
              <div style={styles.profileText}>
                <span style={styles.profileName}>{user?.fullName || 'Alice Customer'}</span>
                <span style={styles.profileRole}>Customer</span>
              </div>
              <span style={{ fontSize: '10px', color: '#64748b' }}>▼</span>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main style={styles.mainContent}>
          <Outlet />
        </main>
      </div>

      {/* Help & Guide Modal */}
      {isHelpOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsHelpOpen(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>📖 Deck Restoration Guide & Help</h3>
              <button type="button" onClick={() => setIsHelpOpen(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <h4>1. How to Measure Length & Width</h4>
              <p>Measure the outer edge of your deck surface from end to end for Length, and from side to side for Width.</p>
              <h4>2. Assessing Wood Condition</h4>
              <ul>
                <li><strong>Good:</strong> Solid wood, light wash only.</li>
                <li><strong>Weathered:</strong> Grayed surface, needs cleaner & wood brightener.</li>
                <li><strong>Peeling / Stained:</strong> Failing topcoat, requires chemical stripper.</li>
                <li><strong>Damaged / Rough:</strong> Splintered boards, requires mechanical sanding.</li>
              </ul>
              <h4>3. Need Assistance?</h4>
              <p>Contact support anytime or use our interactive calculator for transparent pricing.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
  },
  sidebar: {
    width: '230px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    height: '100vh',
    flexShrink: 0,
    zIndex: 40,
  },
  brandBox: {
    padding: '20px 18px',
    borderBottom: '1px solid #f1f5f9',
  },
  brandLogoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoIcon: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
  },
  brandTitle: {
    fontSize: '17px',
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: '-0.5px',
    lineHeight: 1.1,
  },
  brandSubtitle: {
    fontSize: '10px',
    color: '#64748b',
    fontWeight: '600',
  },
  navMenu: {
    padding: '16px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
  },
  navItemActive: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontWeight: '700',
  },
  navIcon: {
    fontSize: '16px',
    width: '20px',
    textAlign: 'center',
  },
  navDivider: {
    height: '1px',
    backgroundColor: '#f1f5f9',
    margin: '10px 0',
  },
  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  topHeader: {
    height: '62px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '0 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 35,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  backLink: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#2563eb',
    textDecoration: 'none',
  },
  estimateForTitle: {
    fontSize: '15px',
    color: '#0f172a',
  },
  draftBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#16a34a',
    backgroundColor: '#dcfce7',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  iconBtn: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '50%',
    width: '34px',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    fontSize: '15px',
  },
  notifBadge: {
    position: 'absolute',
    top: '-3px',
    right: '-3px',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: '800',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDropdown: {
    position: 'absolute',
    top: '42px',
    right: 0,
    width: '260px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
    zIndex: 50,
  },
  notifHeader: {
    padding: '10px 14px',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '12px',
    fontWeight: '700',
    color: '#0f172a',
  },
  notifItem: {
    padding: '10px 14px',
    fontSize: '12px',
    color: '#475569',
    borderBottom: '1px solid #f8fafc',
  },
  profilePill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    padding: '3px 12px 3px 4px',
    cursor: 'pointer',
  },
  avatarCircle: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: '#1e40af',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '12px',
  },
  profileText: {
    display: 'flex',
    flexDirection: 'column',
  },
  profileName: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 1.2,
  },
  profileRole: {
    fontSize: '10px',
    color: '#64748b',
  },
  mainContent: {
    flex: 1,
    overflowY: 'auto',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15,23,42,0.6)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 70,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    maxWidth: '540px',
    width: '90%',
    padding: '24px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '12px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
  },
  modalBody: {
    fontSize: '13px',
    color: '#334155',
    lineHeight: 1.6,
  },
  estimatesPageWrapper: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
  },
  estimatesHeader: {
    height: '68px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '0 36px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    position: 'sticky',
    top: 0,
    zIndex: 40,
  },
  estimatorBadge: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#ffffff',
    backgroundColor: '#1e293b',
    padding: '3px 8px',
    borderRadius: '4px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  estimatesNavCenter: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  estimatesNavTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#334155',
    textDecoration: 'none',
    borderRadius: '8px',
    transition: 'all 0.15s ease',
  },
  estimatesNavTabActive: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    fontWeight: '700',
  },
  estimatesNavRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  estimatesUserPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '24px',
    padding: '4px 12px 4px 6px',
    cursor: 'pointer',
  },
  estimatesAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#6366f1',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '12px',
  },
  estimatesUserName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 1.2,
  },
  estimatesUserRole: {
    fontSize: '11px',
    color: '#64748b',
  },
  estimatesLogoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#ffffff',
    border: '1.5px solid #16a34a',
    borderRadius: '8px',
    padding: '7px 16px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#16a34a',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  estimatesMainBody: {
    flex: 1,
    overflowY: 'auto',
  },
};


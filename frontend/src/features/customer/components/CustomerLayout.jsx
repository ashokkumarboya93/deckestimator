// =============================================
// Deck Estimator — Customer Dedicated Portal Layout
// =============================================
// Features:
// - Collapsible hover sidebar (68px collapsed, 240px expanded on hover)
// - Main content smoothly adjusts (marginLeft adjusts synchronously so content is NEVER overlapped or hidden)
// - Consistent Light Navy Blue & Bright White theme (#1d4ed8, #0f172a, #f8fafc)
// - Zero emojis; clean SVG line icons throughout
// - Dynamic top navigation with breadcrumbs, notifications dropdown, user avatar, and logout

import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const currentPath = location.pathname;
  const isEstimatorPage = currentPath === '/customer/decks/new' || currentPath.includes('/decks/');

  // Active path checker
  const isActive = (path) => {
    if (path === '/customer/dashboard') return currentPath === '/customer/dashboard';
    return currentPath === path || currentPath.startsWith(path);
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'CU';

  // Compute page title and breadcrumbs
  const getPageInfo = () => {
    if (currentPath.includes('/customer/decks/new')) {
      return { title: 'Deck Estimator Builder', breadcrumb: 'Customer / New Deck Project' };
    }
    if (currentPath.includes('/customer/estimates')) {
      return { title: 'My Estimates', breadcrumb: 'Customer / Estimates Overview' };
    }
    if (currentPath.includes('/customer/decks/')) {
      return { title: 'Deck Project Details', breadcrumb: 'Customer / Project Records' };
    }
    return { title: 'Customer Dashboard', breadcrumb: 'Customer / Overview' };
  };

  const pageInfo = getPageInfo();

  return (
    <div
      style={{
        ...styles.container,
        minHeight: '100vh',
      }}
    >
      {/* 1. COLLAPSIBLE HOVER LEFT SIDEBAR */}
      <aside
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        style={{
          ...styles.sidebar,
          width: isSidebarHovered ? '240px' : '68px',
          transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isSidebarHovered ? '4px 0 24px rgba(15, 23, 42, 0.08)' : 'none',
        }}
      >
        {/* Brand Header */}
        <div style={styles.brandBox}>
          <Link to="/customer/dashboard" style={styles.brandLink}>
            <div style={styles.brandLogoIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                opacity: isSidebarHovered ? 1 : 0,
                transition: 'opacity 0.18s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={styles.brandTitle}>
                DECK <span style={{ color: '#1E3E62' }}>RESTORATION PLUS</span>
              </span>
              <span style={styles.brandSubtitle}>Customer Portal</span>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav style={styles.navMenu}>
          {/* 1. Dashboard */}
          <Link
            to="/customer/dashboard"
            style={{
              ...styles.navItem,
              ...(isActive('/customer/dashboard') ? styles.navItemActive : {}),
            }}
            title="Dashboard Overview"
          >
            <span style={styles.navIcon}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </span>
            <span style={{ opacity: isSidebarHovered ? 1 : 0, ...styles.navLabel }}>
              Dashboard
            </span>
          </Link>

          {/* 2. New Deck Estimate (Action Link) */}
          <Link
            to="/customer/decks/new"
            style={{
              ...styles.navItem,
              ...(currentPath === '/customer/decks/new' ? styles.navItemActive : {}),
            }}
            title="Create New Estimate"
          >
            <span style={styles.navIcon}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </span>
            <span style={{ opacity: isSidebarHovered ? 1 : 0, ...styles.navLabel }}>
              New Deck Project
            </span>
          </Link>

          {/* 3. My Estimates */}
          <Link
            to="/customer/estimates"
            style={{
              ...styles.navItem,
              ...(isActive('/customer/estimates') ? styles.navItemActive : {}),
            }}
            title="My Estimates"
          >
            <span style={styles.navIcon}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
            </span>
            <span style={{ opacity: isSidebarHovered ? 1 : 0, ...styles.navLabel }}>
              My Estimates
            </span>
          </Link>

          <div style={styles.navDivider} />

          {/* Guide / Help Trigger */}
          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            style={styles.navItemButton}
            title="How It Works Guide"
          >
            <span style={styles.navIcon}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
            <span style={{ opacity: isSidebarHovered ? 1 : 0, ...styles.navLabel }}>
              Restoration Guide
            </span>
          </button>
        </nav>

        {/* Sidebar Footer Logout */}
        <div style={styles.sidebarFooter}>
          <button
            type="button"
            onClick={handleLogout}
            style={styles.navItemLogout}
            title="Sign Out"
          >
            <span style={styles.navIcon}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <span style={{ opacity: isSidebarHovered ? 1 : 0, ...styles.navLabel }}>
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN VIEW AREA (Smoothly shifts so content is NEVER overlapped by sidebar) */}
      <div
        style={{
          ...styles.mainWrapper,
          marginLeft: isSidebarHovered ? '240px' : '68px',
          transition: 'margin-left 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* TOP NAVIGATION BAR */}
        <header style={styles.topHeader}>
          {/* Left: Breadcrumbs & Page Title */}
          <div style={styles.headerLeft}>
            <div>
              <div style={styles.breadcrumbText}>{pageInfo.breadcrumb}</div>
              <h1 style={styles.headerTitle}>{pageInfo.title}</h1>
            </div>
          </div>

          {/* Center: Search */}
          <div style={styles.headerCenter}>
            <div style={styles.searchBox}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search your deck projects, estimates, or restoration records..."
                style={styles.searchInput}
              />
            </div>
          </div>

          {/* Right: Notifications, Profile, Logout */}
          <div style={styles.headerRight}>
            {/* Quick Action Button */}
            <Link to="/customer/decks/new" style={styles.primaryActionBtn} title="Start New Estimate">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>+ New Estimate</span>
            </Link>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                style={styles.iconButton}
                title="Notifications"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadNotifications > 0 && (
                  <span style={styles.notifBadge}>{unreadNotifications}</span>
                )}
              </button>

              {showNotifications && (
                <div style={styles.notifDropdown}>
                  <div style={styles.dropdownHeader}>
                    <span style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>
                      Notifications
                    </span>
                    <button
                      type="button"
                      onClick={() => setUnreadNotifications(0)}
                      style={styles.textBtn}
                    >
                      Clear all
                    </button>
                  </div>
                  <div style={styles.notifList}>
                    <div style={styles.notifItem} onClick={() => setShowNotifications(false)}>
                      <div style={styles.notifDot} />
                      <div>
                        <p style={styles.notifTitle}>Estimate Ready for Review</p>
                        <p style={styles.notifTime}>Your latest deck restoration quote is prepared.</p>
                      </div>
                    </div>
                    <div style={styles.notifItem} onClick={() => setShowNotifications(false)}>
                      <div style={styles.notifDot} />
                      <div>
                        <p style={styles.notifTitle}>Verified Contractors Available</p>
                        <p style={styles.notifTime}>Local certified deck pros are ready to service your area.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={styles.profileBtn}
              >
                <div style={styles.avatar}>{initials}</div>
                <div style={styles.profileText}>
                  <span style={styles.profileName}>{user?.fullName || 'Jane Homeowner'}</span>
                  <span style={styles.profileRole}>Customer</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showProfileMenu && (
                <div style={styles.profileMenu}>
                  <div style={styles.profileMenuHeader}>
                    <p style={{ fontWeight: '700', fontSize: '14px', margin: 0, color: '#0f172a' }}>
                      {user?.fullName || 'Jane Homeowner'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                      {user?.email || 'customer@example.com'}
                    </p>
                  </div>
                  <div style={styles.menuDivider} />
                  <Link
                    to="/customer/dashboard"
                    onClick={() => setShowProfileMenu(false)}
                    style={styles.menuItem}
                  >
                    Dashboard Home
                  </Link>
                  <Link
                    to="/customer/estimates"
                    onClick={() => setShowProfileMenu(false)}
                    style={styles.menuItem}
                  >
                    Saved Estimates
                  </Link>
                  <div style={styles.menuDivider} />
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{ ...styles.menuItem, color: '#b91c1c', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Direct Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              style={styles.logoutBtn}
            >
              Logout
            </button>
          </div>
        </header>

        {/* PAGE CONTENT OUTLET */}
        <main
          style={{
            ...styles.pageContent,
            ...(isEstimatorPage ? { padding: 0 } : { padding: '24px 32px' }),
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* Educational Walkthrough Modal */}
      {isHelpOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsHelpOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={styles.modalIconBox}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </div>
                <h3 style={styles.modalTitle}>How Deck Estimator Works</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                style={styles.modalCloseBtn}
                title="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.guideStep}>
                <div style={styles.stepNum}>1</div>
                <div>
                  <h4 style={styles.stepTitle}>Enter Deck Dimensions &amp; Shape</h4>
                  <p style={styles.stepDesc}>Provide the length and width of your deck. The interactive blueprint visualizer immediately calculates square footage.</p>
                </div>
              </div>
              <div style={styles.guideStep}>
                <div style={styles.stepNum}>2</div>
                <div>
                  <h4 style={styles.stepTitle}>Assess Surface Condition &amp; Services</h4>
                  <p style={styles.stepDesc}>Select existing wood conditions (peeling, discoloration, weathering) and choose power washing, sanding, or staining treatments.</p>
                </div>
              </div>
              <div style={styles.guideStep}>
                <div style={styles.stepNum}>3</div>
                <div>
                  <h4 style={styles.stepTitle}>Select Finishes &amp; Materials</h4>
                  <p style={styles.stepDesc}>Choose premium wood stains, transparent sealers, and protective coatings with live coverage and pricing calculation.</p>
                </div>
              </div>
              <div style={styles.guideStep}>
                <div style={styles.stepNum}>4</div>
                <div>
                  <h4 style={styles.stepTitle}>Instant Accurate Estimate &amp; Contractor Match</h4>
                  <p style={styles.stepDesc}>Receive a transparent breakdown of materials, labor, and taxes, and connect directly with verified licensed contractors.</p>
                </div>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button
                type="button"
                onClick={() => {
                  setIsHelpOpen(false);
                  navigate('/customer/decks/new');
                }}
                style={styles.modalPrimaryBtn}
              >
                Start New Estimate
              </button>
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
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
    overflowY: 'auto',
  },
  brandBox: {
    height: '65px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 18px',
    borderBottom: '1px solid #f1f5f9',
  },
  brandLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
  },
  brandLogoIcon: {
    minWidth: '32px',
    height: '32px',
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: '1.15rem',
    fontWeight: '800',
    letterSpacing: '-0.3px',
    color: '#0f172a',
  },
  brandSubtitle: {
    fontSize: '0.70rem',
    color: '#1d4ed8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  navMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '16px 10px',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#475569',
    fontSize: '0.88rem',
    fontWeight: '500',
    transition: 'all 0.15s ease',
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    fontWeight: '600',
  },
  navItemButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: '8px',
    background: 'none',
    border: 'none',
    color: '#475569',
    fontSize: '0.88rem',
    fontWeight: '500',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    transition: 'all 0.15s ease',
  },
  navIcon: {
    minWidth: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    transition: 'opacity 0.15s ease',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: '500',
  },
  navDivider: {
    height: '1px',
    backgroundColor: '#f1f5f9',
    margin: '12px 6px',
  },
  sidebarFooter: {
    padding: '12px 10px',
    borderTop: '1px solid #f1f5f9',
  },
  navItemLogout: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: '8px',
    background: 'none',
    border: 'none',
    width: '100%',
    cursor: 'pointer',
    color: '#b91c1c',
    fontSize: '0.88rem',
    fontWeight: '500',
    textAlign: 'left',
  },
  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  topHeader: {
    height: '65px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
    position: 'sticky',
    top: 0,
    zIndex: 40,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  breadcrumbText: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '2px',
  },
  headerTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  headerCenter: {
    flex: 1,
    maxWidth: '440px',
    margin: '0 24px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '7px 14px',
    width: '100%',
  },
  searchInput: {
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '0.86rem',
    color: '#0f172a',
    outline: 'none',
    width: '100%',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  primaryActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#034EA2',
    backgroundImage: 'linear-gradient(135deg, #034EA2 0%, #0057B8 100%)',
    color: '#ffffff',
    padding: '10px 22px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 4px 14px rgba(3, 78, 162, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    border: 'none',
    letterSpacing: '-0.2px',
    cursor: 'pointer',
  },
  iconButton: {
    position: 'relative',
    background: 'none',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    width: '38px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
  },
  notifBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: '700',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #ffffff',
  },
  notifDropdown: {
    position: 'absolute',
    top: '46px',
    right: 0,
    width: '320px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 10px 25px rgba(15, 23, 42, 0.15)',
    border: '1px solid #e2e8f0',
    zIndex: 100,
    overflow: 'hidden',
  },
  dropdownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#f8fafc',
  },
  textBtn: {
    background: 'none',
    border: 'none',
    fontSize: '11px',
    color: '#1d4ed8',
    fontWeight: '600',
    cursor: 'pointer',
  },
  notifList: {
    maxHeight: '260px',
    overflowY: 'auto',
  },
  notifItem: {
    display: 'flex',
    gap: '10px',
    padding: '12px 16px',
    borderBottom: '1px solid #f8fafc',
    cursor: 'pointer',
    alignItems: 'flex-start',
  },
  notifDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#1d4ed8',
    borderRadius: '50%',
    marginTop: '5px',
    flexShrink: 0,
  },
  notifTitle: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '600',
    color: '#0f172a',
  },
  notifTime: {
    margin: '2px 0 0 0',
    fontSize: '11px',
    color: '#64748b',
  },
  profileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '24px',
    padding: '4px 12px 4px 5px',
    cursor: 'pointer',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  profileName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: '1.2',
  },
  profileRole: {
    fontSize: '10px',
    color: '#1d4ed8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  profileMenu: {
    position: 'absolute',
    top: '46px',
    right: 0,
    width: '220px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 10px 25px rgba(15, 23, 42, 0.15)',
    border: '1px solid #e2e8f0',
    zIndex: 100,
    overflow: 'hidden',
    padding: '6px 0',
  },
  profileMenuHeader: {
    padding: '10px 16px',
  },
  menuDivider: {
    height: '1px',
    backgroundColor: '#f1f5f9',
    margin: '4px 0',
  },
  menuItem: {
    display: 'block',
    padding: '9px 16px',
    fontSize: '13px',
    color: '#334155',
    textDecoration: 'none',
    fontWeight: '500',
  },
  logoutBtn: {
    backgroundColor: '#ffffff',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '7px 16px',
    fontSize: '0.86rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  pageContent: {
    flex: 1,
    minHeight: 'calc(100vh - 65px)',
    backgroundColor: '#f8fafc',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '560px',
    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #f1f5f9',
  },
  modalIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#0f172a',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '4px',
  },
  modalBody: {
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  guideStep: {
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start',
  },
  stepNum: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    fontSize: '13px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepTitle: {
    margin: '0 0 2px 0',
    fontSize: '0.92rem',
    fontWeight: '600',
    color: '#0f172a',
  },
  stepDesc: {
    margin: 0,
    fontSize: '0.84rem',
    color: '#64748b',
    lineHeight: '1.45',
  },
  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #f1f5f9',
    backgroundColor: '#f8fafc',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  modalPrimaryBtn: {
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    padding: '9px 20px',
    borderRadius: '8px',
    fontSize: '0.88rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

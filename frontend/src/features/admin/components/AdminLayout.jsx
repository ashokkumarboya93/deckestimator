// =============================================
// Deck Estimator — Admin Dedicated Portal Layout
// =============================================
// Matches Contractor Portal Layout & UX:
// - Collapsible hover sidebar (68px collapsed, 230px expanded on hover)
// - Fixed sidebar position with smooth width transition
// - Professional top navigation with breadcrumbs, notifications, search, profile, and logout
// - Navy & bright white theme (#0f172a, #1d4ed8, #f8fafc)
// - SVG line icons only; zero emojis

import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { adminVerificationApi } from '../api/adminVerificationApi';
import { adminLeadApi } from '../api/adminLeadApi';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [pendingVerificationsCount, setPendingVerificationsCount] = useState(0);
  const [newLeadsCount, setNewLeadsCount] = useState(0);

  const currentPath = location.pathname;

  // Load live counts for badges
  useEffect(() => {
    let mounted = true;

    // Fetch pending verifications count
    adminVerificationApi
      .getApplications({ status: 'pending', limit: 1 })
      .then((res) => {
        if (mounted && res?.pagination?.total !== undefined) {
          setPendingVerificationsCount(res.pagination.total);
        }
      })
      .catch(() => {});

    // Fetch unassigned / new leads count
    adminLeadApi
      .getAllLeads({ status: 'NEW', limit: 1 })
      .then((res) => {
        if (mounted && res?.pagination?.total !== undefined) {
          setNewLeadsCount(res.pagination.total);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/admin/dashboard') return currentPath === '/admin/dashboard';
    return currentPath === path || currentPath.startsWith(path);
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'AD';

  // Compute breadcrumb/title from current route
  const getPageInfo = () => {
    if (currentPath.includes('/admin/contractor-verifications')) {
      return { title: 'Contractor Verifications', breadcrumb: 'Governance / Verifications' };
    }
    if (currentPath.includes('/admin/catalog')) {
      return { title: 'Services & Materials Catalog', breadcrumb: 'Platform / Catalog' };
    }
    if (currentPath.includes('/admin/leads')) {
      return { title: 'Lead Management Hub', breadcrumb: 'Platform / Leads' };
    }
    if (currentPath.includes('/admin/commissions')) {
      return { title: 'Commissions & Payouts', breadcrumb: 'Financials / Commissions' };
    }
    return { title: 'Platform Operations Hub', breadcrumb: 'Administration / Dashboard' };
  };

  const pageInfo = getPageInfo();

  return (
    <div style={styles.container}>
      {/* 1. COLLAPSIBLE HOVER LEFT SIDEBAR (Identical UX to Contractor Portal) */}
      <aside
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        style={{
          ...styles.sidebar,
          width: isSidebarHovered ? '240px' : '68px',
          transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isSidebarHovered ? '4px 0 24px rgba(15, 23, 42, 0.12)' : 'none',
        }}
      >
        {/* Brand Header */}
        <div style={styles.brandBox}>
          <Link to="/admin/dashboard" style={styles.brandLink}>
            <div style={styles.brandLogoIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
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
                DECK <span style={{ color: '#1d4ed8' }}>PRO</span>
              </span>
              <span style={styles.brandSubtitle}>Admin Portal</span>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav style={styles.navMenu}>
          {/* 1. Dashboard */}
          <Link
            to="/admin/dashboard"
            style={{
              ...styles.navItem,
              ...(isActive('/admin/dashboard') ? styles.navItemActive : {}),
            }}
            title="Dashboard"
          >
            <span style={styles.navIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

          {/* 2. Contractor Verifications */}
          <Link
            to="/admin/contractor-verifications"
            style={{
              ...styles.navItem,
              ...(isActive('/admin/contractor-verifications') ? styles.navItemActive : {}),
            }}
            title="Contractor Verifications"
          >
            <span style={styles.navIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </span>
            <span style={{ opacity: isSidebarHovered ? 1 : 0, ...styles.navLabel }}>
              Verifications
            </span>
            {pendingVerificationsCount > 0 && (
              <span
                style={{
                  ...(isActive('/admin/contractor-verifications') ? styles.badgeActive : styles.badgeAlert),
                  opacity: isSidebarHovered ? 1 : 0,
                  transition: 'opacity 0.15s ease',
                }}
              >
                {pendingVerificationsCount}
              </span>
            )}
          </Link>

          {/* 3. Catalog & Pricing */}
          <Link
            to="/admin/catalog"
            style={{
              ...styles.navItem,
              ...(isActive('/admin/catalog') ? styles.navItemActive : {}),
            }}
            title="Services & Materials Catalog"
          >
            <span style={styles.navIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </span>
            <span style={{ opacity: isSidebarHovered ? 1 : 0, ...styles.navLabel }}>
              Catalog &amp; Pricing
            </span>
          </Link>

          {/* 4. Leads Management */}
          <Link
            to="/admin/leads"
            style={{
              ...styles.navItem,
              ...(isActive('/admin/leads') ? styles.navItemActive : {}),
            }}
            title="Leads Management"
          >
            <span style={styles.navIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
            <span style={{ opacity: isSidebarHovered ? 1 : 0, ...styles.navLabel }}>
              Lead Hub
            </span>
            {newLeadsCount > 0 && (
              <span
                style={{
                  ...(isActive('/admin/leads') ? styles.badgeActive : styles.badge),
                  opacity: isSidebarHovered ? 1 : 0,
                  transition: 'opacity 0.15s ease',
                }}
              >
                {newLeadsCount}
              </span>
            )}
          </Link>

          {/* 5. Commissions & Payouts */}
          <Link
            to="/admin/commissions"
            style={{
              ...styles.navItem,
              ...(isActive('/admin/commissions') ? styles.navItemActive : {}),
            }}
            title="Commissions & Payouts"
          >
            <span style={styles.navIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </span>
            <span style={{ opacity: isSidebarHovered ? 1 : 0, ...styles.navLabel }}>
              Commissions
            </span>
          </Link>

          <div style={styles.navDivider} />

          {/* Switch to Contractor View (for quick verification testing) */}
          <Link
            to="/contractor/dashboard"
            style={styles.navItem}
            title="Contractor View"
          >
            <span style={styles.navIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </span>
            <span style={{ opacity: isSidebarHovered ? 1 : 0, ...styles.navLabel }}>
              Contractor View
            </span>
          </Link>

          {/* Switch to Customer View */}
          <Link
            to="/customer/dashboard"
            style={styles.navItem}
            title="Customer View"
          >
            <span style={styles.navIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <span style={{ opacity: isSidebarHovered ? 1 : 0, ...styles.navLabel }}>
              Customer View
            </span>
          </Link>
        </nav>

        {/* Sidebar Footer / Logout */}
        <div style={styles.sidebarFooter}>
          <button
            type="button"
            onClick={handleLogout}
            style={styles.navItemLogout}
            title="Sign Out"
          >
            <span style={styles.navIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

      {/* 2. MAIN VIEW AREA */}
      <div style={{ ...styles.mainWrapper, marginLeft: isSidebarHovered ? '240px' : '68px', transition: 'margin-left 0.22s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        {/* TOP NAVIGATION BAR */}
        <header style={styles.topHeader}>
          {/* Left: Breadcrumbs & Page Title */}
          <div style={styles.headerLeft}>
            <div>
              <div style={styles.breadcrumbText}>{pageInfo.breadcrumb}</div>
              <h1 style={styles.headerTitle}>{pageInfo.title}</h1>
            </div>
          </div>

          {/* Center: Search Box */}
          <div style={styles.headerCenter}>
            <div style={styles.searchBox}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search accounts, contractors, estimates, catalog..."
                style={styles.searchInput}
              />
            </div>
          </div>

          {/* Right: Notifications, Admin Badge, Profile Menu, Logout */}
          <div style={styles.headerRight}>
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                style={styles.iconButton}
                title="Admin Notifications"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadNotifications > 0 && (
                  <span style={styles.notifBadge}>{unreadNotifications}</span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div style={styles.notifDropdown}>
                  <div style={styles.dropdownHeader}>
                    <span style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>
                      Admin Notifications
                    </span>
                    <button
                      type="button"
                      onClick={() => setUnreadNotifications(0)}
                      style={styles.textBtn}
                    >
                      Mark all read
                    </button>
                  </div>
                  <div style={styles.notifList}>
                    {pendingVerificationsCount > 0 && (
                      <div
                        style={styles.notifItem}
                        onClick={() => {
                          setShowNotifications(false);
                          navigate('/admin/contractor-verifications');
                        }}
                      >
                        <div style={styles.notifDot} />
                        <div>
                          <p style={styles.notifTitle}>Pending Contractor Applications</p>
                          <p style={styles.notifTime}>{pendingVerificationsCount} contractors await administrative review.</p>
                        </div>
                      </div>
                    )}
                    <div
                      style={styles.notifItem}
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/admin/dashboard');
                      }}
                    >
                      <div style={styles.notifDot} />
                      <div>
                        <p style={styles.notifTitle}>Platform Health Normal</p>
                        <p style={styles.notifTime}>MongoDB connected • All services operational</p>
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
                  <span style={styles.profileName}>{user?.fullName || 'Administrator'}</span>
                  <span style={styles.profileRole}>Platform Admin</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showProfileMenu && (
                <div style={styles.profileMenu}>
                  <div style={styles.profileMenuHeader}>
                    <p style={{ fontWeight: '700', fontSize: '14px', margin: 0, color: '#0f172a' }}>
                      {user?.fullName || 'Administrator'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                      {user?.email || 'admin@deckestimator.com'}
                    </p>
                  </div>
                  <div style={styles.menuDivider} />
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setShowProfileMenu(false)}
                    style={styles.menuItem}
                  >
                    Operations Overview
                  </Link>
                  <Link
                    to="/admin/contractor-verifications"
                    onClick={() => setShowProfileMenu(false)}
                    style={styles.menuItem}
                  >
                    Verification Desk
                  </Link>
                  <Link
                    to="/admin/catalog"
                    onClick={() => setShowProfileMenu(false)}
                    style={styles.menuItem}
                  >
                    Catalog &amp; Pricing Rules
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
        <main style={styles.pageContent}>
          <Outlet />
        </main>
      </div>
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
  badge: {
    marginLeft: 'auto',
    backgroundColor: '#e2e8f0',
    color: '#475569',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  badgeActive: {
    marginLeft: 'auto',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  badgeAlert: {
    marginLeft: 'auto',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '10px',
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
    marginLeft: '68px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    transition: 'margin-left 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
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
    maxWidth: '460px',
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
    gap: '16px',
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
};


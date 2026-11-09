// =============================================
// Deck Estimator — Production Admin Portal Layout
// =============================================
// Matches Showcase & Screenshots:
// - Always-open 250px sidebar by default with smooth toggle to 68px collapsed mode
// - Exact 11 sidebar pages in required sequence + Profile + Logout
// - Deep Navy theme (#0a1628, #1d4ed8 active, #ffffff text)
// - Top bar with hamburger toggle, title/breadcrumb, search, notifications, profile pill, and logout

import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import mainLogo from '../../../assets/images/MainLodo.png';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Sidebar always open by default, can toggle closed
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [pendingVerifications, setPendingVerifications] = useState(0);
  const [hotLeadsCount, setHotLeadsCount] = useState(0);

  const currentPath = location.pathname;

  // Load badge counts
  useEffect(() => {
    let mounted = true;
    fetch('http://localhost:5000/api/v1/admin/dashboard/summary', { credentials: 'include' })
      .then((r) => r.json())
      .then((res) => {
        if (mounted && res?.data?.summary) {
          setHotLeadsCount(res.data.summary.hotPriorityLeads || 0);
        }
      })
      .catch(() => {});

    fetch('http://localhost:5000/api/v1/admin/verifications?status=pending', { credentials: 'include' })
      .then((r) => r.json())
      .then((res) => {
        if (mounted && res?.counts?.pending !== undefined) {
          setPendingVerifications(res.counts.pending);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/admin/login', { replace: true });
    }
  };

  const isActive = (path) => {
    if (path === '/admin/dashboard') return currentPath === '/admin/dashboard';
    return currentPath.startsWith(path);
  };

  // Compute breadcrumbs & title
  const getPageMeta = () => {
    if (currentPath.includes('/admin/users')) return { title: 'User Management', category: 'Platform Governance' };
    if (currentPath.includes('/admin/verification-progress')) return { title: 'Verification & Progress', category: 'Operations & Approvals' };
    if (currentPath.includes('/admin/leads')) return { title: 'Lead Management', category: 'Enquiries Hub' };
    if (currentPath.includes('/admin/projects')) return { title: 'Projects', category: 'Deck Project Directory' };
    if (currentPath.includes('/admin/pricing') || currentPath.includes('/admin/discounts')) return { title: 'Pricing & Discounts', category: 'Calculation & Incentives' };
    if (currentPath.includes('/admin/reports')) return { title: 'Reports & Analytics', category: 'Business Insights' };
    if (currentPath.includes('/admin/settings')) return { title: 'System Settings', category: 'Configuration & Communications' };
    if (currentPath.includes('/admin/guidelines')) return { title: 'Admin Guidelines', category: 'Operational Manual & SOP' };
    if (currentPath.includes('/admin/profile')) return { title: 'My Profile', category: 'Account Management' };
    return { title: 'Dashboard', category: 'Business Overview' };
  };

  const meta = getPageMeta();

  // Exact 11 items
  const menuItems = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      path: '/admin/users',
      label: 'User Management',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      path: '/admin/verification-progress',
      label: 'Verification & Progress',
      badge: pendingVerifications > 0 ? pendingVerifications : null,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      ),
    },
    {
      path: '/admin/leads',
      label: 'Lead Management',
      badge: hotLeadsCount > 0 ? hotLeadsCount : null,
      badgeColor: '#ef4444',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      ),
    },
    {
      path: '/admin/projects',
      label: 'Projects',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      path: '/admin/pricing',
      label: 'Pricing & Discounts',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
          <line x1="18" y1="2" x2="18" y2="6" />
        </svg>
      ),
    },
    {
      path: '/admin/reports',
      label: 'Reports & Analytics',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      path: '/admin/settings',
      label: 'System Settings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
    {
      path: '/admin/guidelines',
      label: 'Admin Guidelines',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <line x1="9" y1="7" x2="15" y2="7" />
          <line x1="9" y1="11" x2="15" y2="11" />
        </svg>
      ),
    },
  ];

  return (
    <div style={styles.container}>
      {/* 1. SIDEBAR (250px by default, 68px collapsed) */}
      <aside
        style={{
          ...styles.sidebar,
          width: isSidebarOpen ? '250px' : '68px',
        }}
      >
        {/* Brand Header */}
        {isSidebarOpen ? (
          <div style={styles.brandBox}>
            <Link to="/admin/dashboard" style={styles.brandLink}>
              <img src={mainLogo} alt="Deck Restoration Plus" style={styles.sidebarLogo} />
            </Link>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              style={styles.sidebarToggleBtn}
              title="Collapse sidebar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </div>
        ) : (
          <div style={styles.brandBoxCollapsed}>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              style={styles.sidebarToggleBtnCollapsed}
              title="Expand sidebar"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* Navigation Items (Exact 11 Pages) */}
        <nav style={styles.navScroll}>
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                title={!isSidebarOpen ? item.label : undefined}
                style={{
                  ...styles.navLink,
                  backgroundColor: active ? '#1d4ed8' : 'transparent',
                  color: active ? '#ffffff' : '#94a3b8',
                  justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                }}
              >
                <div style={{ ...styles.linkIcon, color: active ? '#ffffff' : '#94a3b8' }}>
                  {item.icon}
                </div>
                {isSidebarOpen && (
                  <span style={styles.linkText}>{item.label}</span>
                )}
                {isSidebarOpen && item.badge && (
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: item.badgeColor || '#38bdf8',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div style={styles.navDivider} />

          {/* Profile Item */}
          <Link
            to="/admin/profile"
            title={!isSidebarOpen ? 'My Profile' : undefined}
            style={{
              ...styles.navLink,
              backgroundColor: isActive('/admin/profile') ? '#1d4ed8' : 'transparent',
              color: isActive('/admin/profile') ? '#ffffff' : '#94a3b8',
              justifyContent: isSidebarOpen ? 'flex-start' : 'center',
            }}
          >
            <div style={styles.linkIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            {isSidebarOpen && <span style={styles.linkText}>My Profile</span>}
          </Link>

          {/* Logout Sidebar Action */}
          <button
            type="button"
            onClick={handleLogout}
            title={!isSidebarOpen ? 'Logout' : undefined}
            style={{
              ...styles.navLink,
              ...styles.logoutSidebarBtn,
              justifyContent: isSidebarOpen ? 'flex-start' : 'center',
            }}
          >
            <div style={{ ...styles.linkIcon, color: '#f87171' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            {isSidebarOpen && <span style={{ ...styles.linkText, color: '#f87171' }}>Logout</span>}
          </button>
        </nav>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div
        style={{
          ...styles.mainWrapper,
          marginLeft: isSidebarOpen ? '250px' : '68px',
        }}
      >
        {/* Top Navigation Bar */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <div>
              <div style={styles.breadcrumbCategory}>{meta.category}</div>
              <h1 style={styles.breadcrumbTitle}>{meta.title}</h1>
            </div>
          </div>

          <div style={styles.headerRight}>
            {/* Notifications Button */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                style={styles.notifBtn}
                title="System Notifications"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadNotifications > 0 && (
                  <span style={styles.notifDot}>{unreadNotifications}</span>
                )}
              </button>

              {showNotifications && (
                <div style={styles.notifDropdown}>
                  <div style={styles.notifHeader}>
                    <span style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>Notifications</span>
                    <button
                      type="button"
                      onClick={() => setUnreadNotifications(0)}
                      style={styles.clearBtn}
                    >
                      Mark all read
                    </button>
                  </div>
                  <div style={styles.notifList}>
                    <div style={styles.notifItem}>
                      <span style={styles.notifItemDot} />
                      <div>
                        <p style={styles.notifItemTitle}>New contractor registration pending verification</p>
                        <span style={styles.notifItemTime}>10 minutes ago</span>
                      </div>
                    </div>
                    <div style={styles.notifItem}>
                      <span style={styles.notifItemDot} />
                      <div>
                        <p style={styles.notifItemTitle}>Hot priority lead received via Contact Us</p>
                        <span style={styles.notifItemTime}>2 hours ago</span>
                      </div>
                    </div>
                    <div style={styles.notifItem}>
                      <span style={{ ...styles.notifItemDot, backgroundColor: '#94a3b8' }} />
                      <div>
                        <p style={styles.notifItemTitle}>Project PRJ-102 updated to 60% progress</p>
                        <span style={styles.notifItemTime}>Yesterday</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Profile Dropdown Pill */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={styles.profilePill}
              >
                <div style={styles.avatar}>
                  {user?.fullName ? user.fullName[0].toUpperCase() : 'A'}
                </div>
                <div style={styles.profileInfo}>
                  <span style={styles.profileName}>{user?.fullName || 'Admin User'}</span>
                  <span style={styles.profileRole}>Administrator</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showProfileMenu && (
                <div style={styles.profileMenu}>
                  <div style={styles.profileMenuHeader}>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>{user?.fullName || 'Administrator'}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{user?.email || 'admin@deckestimator.com'}</div>
                  </div>
                  <div style={styles.menuDivider} />
                  <Link
                    to="/admin/profile"
                    onClick={() => setShowProfileMenu(false)}
                    style={styles.menuItem}
                  >
                    My Profile &amp; Password
                  </Link>
                  <Link
                    to="/admin/settings"
                    onClick={() => setShowProfileMenu(false)}
                    style={styles.menuItem}
                  >
                    System Settings
                  </Link>
                  <div style={styles.menuDivider} />
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{ ...styles.menuItem, ...styles.menuLogoutBtn }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Standalone Quick Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              style={styles.headerLogoutBtn}
              title="Logout of Admin Portal"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main style={styles.mainContent}>
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
    width: '100%',
    maxWidth: '100vw',
    overflowX: 'hidden',
    backgroundColor: '#f8fafc',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    boxSizing: 'border-box',
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#0a1628',
    color: '#ffffff',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    borderRight: '1px solid #1e293b',
  },
  brandBox: {
    height: '66px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 12px 0 16px',
    borderBottom: '1px solid #1e293b',
    flexShrink: 0,
  },
  brandBoxCollapsed: {
    height: '66px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '1px solid #1e293b',
    flexShrink: 0,
  },
  brandLink: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    overflow: 'hidden',
  },
  sidebarLogo: {
    height: '36px',
    maxWidth: '155px',
    objectFit: 'contain',
    display: 'block',
  },
  sidebarToggleBtn: {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '6px',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#94a3b8',
    transition: 'all 0.15s ease',
  },
  sidebarToggleBtnCollapsed: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    width: '38px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#ffffff',
    transition: 'all 0.15s ease',
  },
  navScroll: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '12px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '9px 12px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '0.84rem',
    fontWeight: '600',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  },
  linkIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  linkText: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  badge: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#ffffff',
    borderRadius: '10px',
    padding: '1px 7px',
  },
  navDivider: {
    height: '1px',
    backgroundColor: '#1e293b',
    margin: '10px 0',
  },
  logoutSidebarBtn: {
    background: 'none',
    border: 'none',
    width: '100%',
    cursor: 'pointer',
    textAlign: 'left',
  },
  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    maxWidth: '100%',
    overflowX: 'hidden',
    boxSizing: 'border-box',
    transition: 'margin-left 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  header: {
    height: '66px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  hamburgerBtn: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  breadcrumbCategory: {
    fontSize: '0.68rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    color: '#64748b',
    marginBottom: '2px',
  },
  breadcrumbTitle: {
    fontSize: '1.18rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  notifBtn: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
  },
  notifDot: {
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
    top: '44px',
    right: 0,
    width: '320px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 10px 25px rgba(15, 23, 42, 0.15)',
    border: '1px solid #e2e8f0',
    zIndex: 100,
    overflow: 'hidden',
  },
  notifHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#f8fafc',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: '#1d4ed8',
    fontSize: '11px',
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
  },
  notifItemDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#1d4ed8',
    marginTop: '5px',
    flexShrink: 0,
  },
  notifItemTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#0f172a',
    margin: '0 0 2px 0',
  },
  notifItemTime: {
    fontSize: '10px',
    color: '#64748b',
  },
  profilePill: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '24px',
    padding: '4px 12px 4px 5px',
    cursor: 'pointer',
  },
  avatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  profileName: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: '1.2',
  },
  profileRole: {
    fontSize: '10px',
    color: '#1d4ed8',
    fontWeight: '600',
    textTransform: 'uppercase',
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
    background: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
  },
  menuLogoutBtn: {
    color: '#dc2626',
    fontWeight: '600',
  },
  headerLogoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '7px 14px',
    fontSize: '0.82rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  mainContent: {
    flex: 1,
    minHeight: 'calc(100vh - 66px)',
    backgroundColor: '#f8fafc',
    overflowX: 'hidden',
    width: '100%',
    boxSizing: 'border-box',
  },
};

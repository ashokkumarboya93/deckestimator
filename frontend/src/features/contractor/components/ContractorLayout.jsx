// =============================================
// Deck Estimator — Contractor Dedicated Portal Layout
// =============================================
// Matches Image 1, 2, 3, 4 reference design:
// - Bright white & light navy blue theme (Zero green theme; green reserved only for positive status badges)
// - Fixed left sidebar with consistent line icons and live badge counts
// - Top navigation bar with DECK PRO branding, search, notifications, profile and logout
// - Full responsiveness and uniform visual styling across all 13 contractor interfaces

import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

export default function ContractorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const currentPath = location.pathname;

  // Active path checker
  const isActive = (path) => {
    if (path === '/contractor/dashboard') return currentPath === '/contractor/dashboard';
    return currentPath === path || currentPath.startsWith(path);
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'AB';

  return (
    <div style={styles.container}>
      {/* 1. FIXED LEFT SIDEBAR */}
      <aside style={styles.sidebar}>
        {/* Brand Header */}
        <div style={styles.brandBox}>
          <Link to="/contractor/dashboard" style={{ textDecoration: 'none' }}>
            <div style={styles.brandTitle}>
              DECK <span style={{ color: '#1e40af' }}>PRO</span>
            </div>
            <div style={styles.brandSubtitle}>Contractor Portal</div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav style={styles.navMenu}>
          {/* 1. Dashboard */}
          <Link
            to="/contractor/dashboard"
            style={{
              ...styles.navItem,
              ...(isActive('/contractor/dashboard') ? styles.navItemActive : {}),
            }}
          >
            <svg style={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span style={styles.navText}>Dashboard</span>
          </Link>

          {/* 2. Assigned Leads */}
          <Link
            to="/contractor/leads"
            style={{
              ...styles.navItem,
              ...(isActive('/contractor/leads') ? styles.navItemActive : {}),
            }}
          >
            <svg style={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span style={styles.navText}>Assigned Leads</span>
            <span style={isActive('/contractor/leads') ? styles.leadBadgeActive : styles.leadBadge}>6</span>
          </Link>

          {/* 3. Projects & Decks */}
          <Link
            to="/contractor/projects"
            style={{
              ...styles.navItem,
              ...(isActive('/contractor/projects') || (isActive('/contractor/decks') && !currentPath.includes('/estimates')) ? styles.navItemActive : {}),
            }}
          >
            <svg style={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            <span style={styles.navText}>Projects &amp; Decks</span>
          </Link>

          {/* 4. Estimates */}
          <Link
            to="/contractor/estimates"
            style={{
              ...styles.navItem,
              ...(isActive('/contractor/estimates') ? styles.navItemActive : {}),
            }}
          >
            <svg style={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
            <span style={styles.navText}>Estimates</span>
          </Link>

          {/* 5. Verification & Compliance */}
          <Link
            to="/contractor/verification"
            style={{
              ...styles.navItem,
              ...(isActive('/contractor/verification') ? styles.navItemActive : {}),
            }}
          >
            <svg style={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span style={styles.navText}>Verification &amp; Compliance</span>
          </Link>

          {/* 6. Commissions & Earnings */}
          <Link
            to="/contractor/commissions"
            style={{
              ...styles.navItem,
              ...(isActive('/contractor/commissions') ? styles.navItemActive : {}),
            }}
          >
            <svg style={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" x2="12" y1="20" y2="10" />
              <line x1="18" x2="18" y1="20" y2="4" />
              <line x1="6" x2="6" y1="20" y2="16" />
            </svg>
            <span style={styles.navText}>Commissions &amp; Earnings</span>
          </Link>

          {/* 7. Partner Discounts */}
          <Link
            to="/contractor/discounts"
            style={{
              ...styles.navItem,
              ...(isActive('/contractor/discounts') ? styles.navItemActive : {}),
            }}
          >
            <svg style={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
              <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
            </svg>
            <span style={styles.navText}>Partner Discounts</span>
          </Link>
        </nav>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div style={styles.mainWrapper}>
        {/* Top Header Bar matching Images 1-4 */}
        <header style={styles.topHeader}>
          {/* Left: Page Title / Hamburger */}
          <div style={styles.headerLeft}>
            <button type="button" style={styles.menuToggleBtn} title="Toggle Sidebar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>
            <h1 style={styles.headerTitle}>
              {currentPath.includes('/dashboard')
                ? 'Contractor Dashboard'
                : 'Contractor Portal'}
            </h1>
          </div>

          {/* Center: Search Bar */}
          <div style={styles.headerCenter}>
            <div style={styles.searchBox}>
              <svg style={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" x2="16.65" y1="21" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, leads, estimates..."
                style={styles.searchInput}
              />
            </div>
          </div>

          {/* Right: Notifications, Profile, Logout */}
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
                title="Notifications"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                {unreadNotifications > 0 && (
                  <span style={styles.notifBadge}>{unreadNotifications}</span>
                )}
              </button>

              {showNotifications && (
                <div style={styles.notifDropdown}>
                  <div style={styles.notifHeader}>Recent Notifications</div>
                  <div style={styles.notifItem}>✓ New lead assigned: Riverside Deck Restoration</div>
                  <div style={styles.notifItem}>✓ Document verified: Contractor License LIC-TX-2026-99</div>
                  <div style={styles.notifItem}>✓ Commission payable: COM-1007 ($486.00)</div>
                </div>
              )}
            </div>

            {/* Profile Dropdown Pill */}
            <div style={{ position: 'relative' }}>
              <div
                style={styles.profilePill}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div style={styles.avatarCircle}>{initials}</div>
                <div style={styles.profileText}>
                  <span style={styles.profileName}>{user?.fullName || 'Alex Master Builder'}</span>
                  <span style={styles.profileRole}>Apex Deck Pros LLC</span>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {showProfileMenu && (
                <div style={styles.profileDropdown}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/contractor/verification');
                    }}
                    style={styles.dropdownItem}
                  >
                    Profile &amp; Compliance
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{ ...styles.dropdownItem, color: '#dc2626' }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Standalone Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              style={styles.logoutBtn}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
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
    backgroundColor: '#f8fafc',
    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
  },
  sidebar: {
    width: '240px',
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
    padding: '24px 20px',
    borderBottom: '1px solid #f1f5f9',
  },
  brandTitle: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: '-0.5px',
    lineHeight: 1.1,
  },
  brandSubtitle: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '700',
    marginTop: '3px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  navMenu: {
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
    overflowY: 'auto',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
  },
  navItemActive: {
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    fontWeight: '700',
  },
  navIcon: {
    width: '18px',
    height: '18px',
    flexShrink: 0,
  },
  navText: {
    flex: 1,
  },
  leadBadge: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    fontSize: '11px',
    fontWeight: '800',
    padding: '2px 7px',
    borderRadius: '12px',
  },
  leadBadgeActive: {
    backgroundColor: '#ffffff',
    color: '#1d4ed8',
    fontSize: '11px',
    fontWeight: '800',
    padding: '2px 7px',
    borderRadius: '12px',
  },
  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    height: '100vh',
    overflowY: 'auto',
  },
  topHeader: {
    height: '64px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '0 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 35,
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  menuToggleBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: '17px',
    fontWeight: '800',
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
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0 12px',
    height: '38px',
  },
  searchIcon: {
    width: '16px',
    height: '16px',
    color: '#94a3b8',
    marginRight: '8px',
    flexShrink: 0,
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '13px',
    color: '#0f172a',
    width: '100%',
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
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    color: '#475569',
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
    top: '44px',
    right: 0,
    width: '280px',
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
    lineHeight: 1.4,
  },
  profilePill: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '24px',
    padding: '4px 14px 4px 5px',
    cursor: 'pointer',
  },
  avatarCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '12px',
  },
  profileText: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
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
  profileDropdown: {
    position: 'absolute',
    top: '46px',
    right: 0,
    width: '180px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
    zIndex: 50,
    overflow: 'hidden',
  },
  dropdownItem: {
    width: '100%',
    textAlign: 'left',
    padding: '10px 14px',
    background: 'none',
    border: 'none',
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
    borderBottom: '1px solid #f1f5f9',
  },
  logoutBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '6px 14px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
  },
  mainContent: {
    flex: 1,
    padding: '24px 32px 60px 32px',
    maxWidth: '1440px',
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
};

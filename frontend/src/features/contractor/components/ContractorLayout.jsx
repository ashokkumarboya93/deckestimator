// =============================================
// Deck Estimator — Contractor Dedicated Portal Layout
// =============================================
// Matches Customer Dashboard Sidebar & Layout UX:
// - Collapsible hover sidebar (68px collapsed, 230px expanded on hover)
// - Fixed sidebar position with smooth width transition
// - Independent middle scrolling for continuous estimator (height: 100vh)
// - Dynamic top navigation with breadcrumbs, notifications, search, profile, and logout
// - Help & Guide modal for contractor self-service

import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { contractorLeadApi } from '../api/contractorLeadApi';
import mainLogo from '../../../assets/images/MainLodo.png';
import ContractorFooter from './ContractorFooter';
import BlockedAccountPortal from '../../auth/components/BlockedAccountPortal';

export default function ContractorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isBlocked = user?.accountStatus === 'blocked' || user?.status === 'blocked';
  if (isBlocked) {
    return <BlockedAccountPortal user={user} />;
  }

  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [leadsCount, setLeadsCount] = useState(6);
  const [projectName, setProjectName] = useState('');
  const [contractorProfile, setContractorProfile] = useState(null);
  const [signoutHover, setSignoutHover] = useState(false);

  // Sync contractor profile data
  useEffect(() => {
    let mounted = true;
    const fetchProfile = () => {
      contractorLeadApi.getProfile()
        .then((res) => {
          if (mounted && res?.data) {
            setContractorProfile(res.data.profile || res.data);
          }
        })
        .catch(() => {});
    };

    fetchProfile();
    window.addEventListener('contractor_profile_updated', fetchProfile);
    return () => {
      mounted = false;
      window.removeEventListener('contractor_profile_updated', fetchProfile);
    };
  }, [user]);

  // Sync project name updates from active estimator
  useEffect(() => {
    const handleProjectName = (e) => {
      if (e?.detail !== undefined) {
        setProjectName(e.detail);
      }
    };
    window.addEventListener('deck_project_name_updated', handleProjectName);
    return () => {
      window.removeEventListener('deck_project_name_updated', handleProjectName);
    };
  }, []);

  const currentPath = location.pathname;
  const isEstimatorPage = currentPath === '/contractor/decks/new' || currentPath.includes('/decks/');
  const isDashboardPage = currentPath === '/contractor' || currentPath === '/contractor/' || currentPath.includes('/dashboard');

  // Load live lead counts for badge
  useEffect(() => {
    let mounted = true;
    contractorLeadApi.getAssignedLeads({ limit: 1 })
      .then((res) => {
        if (mounted && res?.pagination?.total !== undefined) {
          setLeadsCount(res.pagination.total);
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
    if (path === '/contractor/dashboard') return currentPath === '/contractor/dashboard';
    return currentPath === path || currentPath.startsWith(path);
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) =>n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'AB';

  return (
    <div
      style={{
        ...styles.container,
        minHeight: '100vh',
      }}
    >
      {/* 1. COLLAPSIBLE HOVER LEFT SIDEBAR (Expands over page, closes on mouse leave) */}
      <aside
        onMouseEnter={() =>setIsSidebarHovered(true)}
        onMouseLeave={() =>setIsSidebarHovered(false)}
        style={{
          ...styles.sidebar,
          width: isSidebarHovered ? '240px' : '68px',
          transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isSidebarHovered ? '6px 0 28px rgba(15, 23, 42, 0.16)' : 'none',
        }}
      >
        {/* Brand Header */}
        <div style={styles.brandBox}>
          {isSidebarHovered ? (
            <Link to="/contractor/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', width: '100%' }}>
              <img
                src={mainLogo}
                alt="Deck Restoration Plus"
                style={{
                  height: '36px',
                  maxWidth: '185px',
                  objectFit: 'contain',
                }}
              />
            </Link>
          ) : (
            <Link to="/contractor/dashboard" style={styles.brandLink} title="Deck Restoration Plus">
              <div style={styles.brandLogoIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
            </Link>
          )}
        </div>

        {/* Navigation Menu — Strictly 7 items in specified order */}
        <nav style={styles.navMenu}>
          {/* 1. Dashboard */}
          <Link
            to="/contractor/dashboard"
            style={{
              ...styles.navItem,
              ...(isActive('/contractor/dashboard') ? styles.navItemActive : {}),
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

          {/* 2. New Estimation */}
          <Link
            to="/contractor/decks/new"
            style={{
              ...styles.navItem,
              ...(currentPath === '/contractor/decks/new' ? styles.navItemActive : {}),
            }}
            title="New Estimation"
          >
            <span style={styles.navIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </span>
            <span style={{ opacity: isSidebarHovered ? 1 : 0, ...styles.navLabel }}>
              New Estimation
            </span>
          </Link>

          {/* 3. My Projects */}
          <Link
            to="/contractor/projects"
            style={{
              ...styles.navItem,
              ...(isActive('/contractor/projects') || (isActive('/contractor/decks') && !currentPath.includes('/decks/new'))
                ? styles.navItemActive
                : {}),
            }}
            title="My Projects"
          >
            <span style={styles.navIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </span>
            <span style={{ opacity: isSidebarHovered ? 1 : 0, ...styles.navLabel }}>
              My Projects
            </span>
          </Link>

          {/* 4. Discounts & Earnings */}
          <Link
            to="/contractor/discounts-earnings"
            style={{
              ...styles.navItem,
              ...(isActive('/contractor/discounts-earnings') || isActive('/contractor/commissions') || isActive('/contractor/discounts')
                ? styles.navItemActive
                : {}),
            }}
            title="Discounts & Earnings"
          >
            <span style={styles.navIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </span>
            <span style={{ opacity: isSidebarHovered ? 1 : 0, ...styles.navLabel }}>
              Discounts &amp; Earnings
            </span>
          </Link>

          {/* 5. Help & support */}
          <Link
            to="/contractor/support"
            style={{
              ...styles.navItem,
              ...(isActive('/contractor/support') ? styles.navItemActive : {}),
            }}
            title="Help & support"
          >
            <span style={styles.navIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
            <span style={{ opacity: isSidebarHovered ? 1 : 0, ...styles.navLabel }}>
              Help &amp; support
            </span>
          </Link>

          <div style={styles.navDivider} />

          {/* 6. Profile Settings */}
          <Link
            to="/contractor/profile"
            style={{
              ...styles.navItem,
              ...(isActive('/contractor/profile') || currentPath === '/contractor/settings' || currentPath === '/contractor/verification'
                ? styles.navItemActive
                : {}),
            }}
            title="Profile Settings"
          >
            <span style={styles.navIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </span>
            <span style={{ opacity: isSidebarHovered ? 1 : 0, ...styles.navLabel }}>
              Profile Settings
            </span>
          </Link>

          {/* 7. Sign Out */}
          <button
            type="button"
            onClick={handleLogout}
            onMouseEnter={() => setSignoutHover(true)}
            onMouseLeave={() => setSignoutHover(false)}
            style={{
              ...styles.navItem,
              backgroundColor: signoutHover ? 'rgba(239, 68, 68, 0.20)' : 'rgba(239, 68, 68, 0.08)',
              border: signoutHover ? '1.5px solid #ef4444' : '1.5px solid rgba(239, 68, 68, 0.45)',
              borderRadius: '8px',
              width: '100%',
              cursor: 'pointer',
              color: '#ef4444',
              marginTop: 'auto',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarHovered ? 'flex-start' : 'center',
              padding: '9px 12px',
              gap: '10px',
              transition: 'all 0.18s ease',
              boxShadow: signoutHover ? '0 2px 10px rgba(239, 68, 68, 0.25)' : 'none',
              outline: 'none',
            }}
            title="Sign Out"
          >
            <span style={{ ...styles.navIcon, color: '#ef4444', minWidth: '20px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <span style={{
              opacity: isSidebarHovered ? 1 : 0,
              width: isSidebarHovered ? 'auto' : 0,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              color: '#ef4444',
              fontWeight: '700',
              fontSize: '13px',
              transition: 'opacity 0.15s ease',
            }}>
              Sign Out
            </span>
          </button>
        </nav>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER (Fixed at 68px: Zero adjustment effect, page stays stable) */}
      <div
        style={{
          ...styles.mainWrapper,
          marginLeft: '68px',
          ...(isEstimatorPage ? { minHeight: '100vh' } : {}),
        }}
      >
        {/* Top Header Bar (Normal Natural Flow — Not Sticky) */}
        <header style={styles.topHeader}>
          {/* Left: Dynamic Page Title / Breadcrumbs */}
          <div style={styles.headerLeft}>
            {isEstimatorPage ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link
                  to="/contractor/projects"
                  style={styles.outlinedBackBtn}
                  title="← Back to Projects"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                    e.currentTarget.style.borderColor = '#94a3b8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  <span>Back</span>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#cbd5e1', fontSize: '18px', fontWeight: '300' }}>|</span>
                  <span style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>
                    {projectName?.trim() ? projectName.trim() : 'Untitled Project'}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={styles.headerTitle}>
                  {currentPath.includes('/dashboard')
                    ? 'Contractor Dashboard'
                    : currentPath.includes('/leads')
                    ? 'Assigned Leads & Enquiries'
                    : currentPath.includes('/projects')
                    ? 'Projects & Decks'
                    : currentPath.includes('/estimates')
                    ? 'Commercial Estimates'
                    : currentPath.includes('/verification')
                    ? 'Verification & Compliance'
                    : currentPath.includes('/commissions')
                    ? 'Commissions & Earnings'
                    : currentPath.includes('/discounts')
                    ? 'Partner Discounts'
                    : 'Contractor Portal'}
                </h1>
              </div>
            )}
          </div>

          {/* Center: Search Bar (Hidden on Contractor Dashboard & Estimator) */}
          {!isEstimatorPage && !isDashboardPage && (
            <div style={styles.headerCenter}>
              <div style={styles.searchBox}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search projects, leads, estimates..."
                  style={styles.searchInput}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      navigate(`/contractor/projects?search=${encodeURIComponent(e.target.value)}`);
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Right: Notifications, Profile, Logout */}
          <div style={styles.headerRight}>
            {/* Quick Action Button for Contractor */}
            <Link
              to="/contractor/decks/new"
              style={styles.primaryActionBtn}
              title="Start New Estimation"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F0F7FF';
                e.currentTarget.style.borderColor = '#003B7A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = '#034EA2';
              }}
            >
              <span>+ New Estimation</span>
            </Link>

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
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadNotifications > 0 && (
                  <span style={styles.notifBadge}>{unreadNotifications}</span>
                )}
              </button>

              {showNotifications && (
                <div style={styles.notifDropdown}>
                  <div style={styles.notifHeader}>Recent Notifications</div>
                  <div style={styles.notifItem}>New lead assigned: Riverside Deck Restoration</div>
                  <div style={styles.notifItem}>Document verified: Contractor License LIC-TX-2026-99</div>
                  <div style={styles.notifItem}>Commission payable: COM-1007 ($486.00)</div>
                </div>
              )}
            </div>

            {/* Profile Dropdown Pill */}
            <div style={{ position: 'relative' }}>
              <div
                style={styles.profilePill}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user?.fullName || 'Contractor'}
                    style={styles.avatarImg}
                  />
                ) : (
                  <div style={styles.avatarCircle}>{initials}</div>
                )}
                <div style={styles.profileText}>
                  <span style={styles.profileName}>{user?.fullName || 'Alex Master Builder'}</span>
                  <span style={styles.profileRole}>{contractorProfile?.businessName || user?.businessName || 'Apex Deck Pros LLC'}</span>
                </div>
                <span style={{ fontSize: '10px', color: '#64748b', marginLeft: '4px' }}>▼</span>
              </div>

              {showProfileMenu && (
                <div style={styles.profileDropdown}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/contractor/profile');
                    }}
                    style={styles.dropdownItem}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>Profile Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/contractor/projects');
                    }}
                    style={styles.dropdownItem}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                      <polyline points="2 12 12 17 22 12" />
                    </svg>My Projects
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{ ...styles.dropdownItem, color: '#dc2626' }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>Logout
                  </button>
                </div>
              )}
            </div>

            {/* Standalone Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              style={styles.logoutBtn}
            >Logout
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main
          style={{
            ...styles.mainContent,
            ...(isEstimatorPage ? { padding: 0 } : {}),
          }}
        >
          <Outlet />
        </main>

        {/* Dedicated Contractor Portal Footer (Shown on every page) */}
        <ContractorFooter />
      </div>

      {/* 3. HELP & GUIDE MODAL */}
      {isHelpOpen && (
        <div style={styles.modalOverlay} onClick={() =>setIsHelpOpen(false)}>
          <div style={styles.modalCard} onClick={(e) =>e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Contractor Portal Guide &amp; Workflow
              </h3>
              <button
                type="button"
                onClick={() =>setIsHelpOpen(false)}
                style={styles.closeBtn}
              >
                
              </button>
            </div>
            <div style={styles.modalBody}>
              <h4>1. Managing Assigned Leads</h4>
              <p>When admin dispatches customer deck inquiries in your service area, they appear under <strong>Assigned Leads</strong>. Accept leads to initiate contact or create bids.
              </p>
              <h4>2. Creating Estimates with Continuous Estimator</h4>
              <p>Navigate to <strong>New Deck Project</strong>. Enter dimensions, structural height, wood condition, and select services. The live calculation engine calculates total price instantly.
              </p>
              <h4>3. Verification &amp; Compliance</h4>
              <p>Upload required Contractor License, General Liability Insurance, and Business Registration documents to maintain verified contractor status.
              </p>
              <h4>4. Commissions &amp; Earnings</h4>
              <p>Track earned commissions on converted customer projects and monitor payout ledger history.
              </p>
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
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#0A1E3F',
    backgroundImage: 'linear-gradient(180deg, #071933 0%, #0B2447 50%, #06162C 100%)',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 120,
    overflowX: 'hidden',
    overflowY: 'auto',
    whiteSpace: 'nowrap',
  },
  brandBox: {
    minHeight: '68px',
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  portalBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: '9.5px',
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: '0.6px',
    textTransform: 'uppercase',
  },
  brandLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
  },
  brandLogoIcon: {
    minWidth: '34px',
    height: '34px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: '1.15rem',
    fontWeight: '800',
    letterSpacing: '-0.3px',
    color: '#ffffff',
  },
  brandSubtitle: {
    fontSize: '0.72rem',
    color: '#60A5FA',
    fontWeight: '600',
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
    color: '#FFFFFF',
    fontSize: '0.88rem',
    fontWeight: '500',
    transition: 'all 0.15s ease',
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    color: '#ffffff',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
    borderLeft: '3px solid #E08131',
  },
  navIcon: {
    fontSize: '18px',
    minWidth: '22px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
  },
  navLabel: {
    transition: 'opacity 0.15s ease',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: '#FFFFFF',
  },
  badge: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  badgeActive: {
    marginLeft: 'auto',
    backgroundColor: '#ffffff',
    color: '#071933',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  navDivider: {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    margin: '12px 6px',
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
    padding: '0 24px',
    position: 'sticky',
    top: 0,
    zIndex: 40,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  outlinedBackBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#ffffff',
    color: '#334155',
    border: '1.5px solid #cbd5e1',
    borderRadius: '8px',
    padding: '7px 14px',
    fontSize: '13.5px',
    fontWeight: '600',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  backLink: {
    color: '#1d4ed8',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  estimateForTitle: {
    fontSize: '0.95rem',
    color: '#334155',
  },
  draftBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#15803d',
    backgroundColor: '#dcfce7',
    padding: '3px 9px',
    borderRadius: '12px',
  },
  headerCenter: {
    flex: 1,
    maxWidth: '420px',
    margin: '0 24px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '6px 12px',
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '0.88rem',
    color: '#0f172a',
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
    gap: '6px',
    backgroundColor: '#FFFFFF',
    color: '#034EA2',
    padding: '8px 18px',
    borderRadius: '9px',
    fontSize: '13.5px',
    fontWeight: '700',
    textDecoration: 'none',
    border: '1.5px solid #034EA2',
    boxShadow: '0 1px 4px rgba(3, 78, 162, 0.08)',
    transition: 'all 0.18s ease',
    letterSpacing: '-0.1px',
    cursor: 'pointer',
  },
  iconBtn: {
    position: 'relative',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    backgroundColor: '#dc2626',
    color: '#fff',
    fontSize: '10px',
    fontWeight: '700',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDropdown: {
    position: 'absolute',
    top: '44px',
    right: 0,
    width: '320px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    padding: '12px',
    zIndex: 100,
  },
  notifHeader: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '8px',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '6px',
  },
  notifItem: {
    fontSize: '0.82rem',
    color: '#475569',
    padding: '6px 0',
    borderBottom: '1px solid #f8fafc',
  },
  profilePill: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '5px 12px 5px 6px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '24px',
    cursor: 'pointer',
  },
  avatarImg: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1.5px solid #CBD5E1',
    flexShrink: 0,
  },
  avatarCircle: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '0.78rem',
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
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 1.2,
  },
  profileRole: {
    fontSize: '0.72rem',
    color: '#64748b',
    lineHeight: 1.2,
  },
  profileDropdown: {
    position: 'absolute',
    top: '48px',
    right: 0,
    width: '200px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
    padding: '6px',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  dropdownItem: {
    padding: '8px 12px',
    fontSize: '0.85rem',
    color: '#334155',
    background: 'none',
    border: 'none',
    textAlign: 'left',
    borderRadius: '6px',
    cursor: 'pointer',
    width: '100%',
  },
  logoutBtn: {
    padding: '7px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    color: '#dc2626',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  mainContent: {
    flex: 1,
    minWidth: 0,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '540px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 24px',
    borderBottom: '1px solid #e2e8f0',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#94a3b8',
    cursor: 'pointer',
  },
  modalBody: {
    padding: '24px',
    color: '#334155',
    fontSize: '0.9rem',
    lineHeight: '1.6',
    maxHeight: '65vh',
    overflowY: 'auto',
  },
};

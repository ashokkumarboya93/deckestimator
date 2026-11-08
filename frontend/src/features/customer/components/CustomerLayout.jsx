// =============================================
// Deck Estimator — Customer Dedicated Layout
// =============================================
// Features:
// - Collapsible hover sidebar (68px collapsed, 240px expanded on hover)
// - Main content smoothly adjusts (marginLeft adjusts synchronously so content is NEVER overlapped or hidden)
// - Consistent Light Navy Blue & Bright White theme (#1d4ed8, #0f172a, #f8fafc)
// - Zero emojis; clean SVG line icons throughout
// - Dynamic top navigation with breadcrumbs, notifications dropdown, user avatar, and logout

import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import mainLogoDeck from '../../../assets/images/MainLodo.png';
import CustomerFooter from './CustomerFooter';

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [projectName, setProjectName] = useState('');

  const notifRef = useRef(null);
  const profileRef = useRef(null);

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

  // Click-outside listener for notifications & profile dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    if (currentPath.includes('/customer/support')) {
      return { title: 'Help & Support Documentation', breadcrumb: 'Customer / Help & Support' };
    }
    if (currentPath.includes('/customer/profile')) {
      return { title: 'Profile Settings', breadcrumb: 'Customer / Account' };
    }
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
      {/* 1. COLLAPSIBLE HOVER LEFT SIDEBAR (Expands over page, closes on mouse leave) */}
      <aside
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
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
            <Link to="/customer/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', width: '100%' }}>
              <img
                src={mainLogoDeck}
                alt="Deck Restoration Plus"
                style={{
                  height: '36px',
                  maxWidth: '190px',
                  objectFit: 'contain',
                }}
              />
            </Link>
          ) : (
            <Link to="/customer/dashboard" style={styles.brandLink} title="Deck Restoration Plus">
              <div style={styles.brandLogoIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
            </Link>
          )}
        </div>

        {/* Navigation Menu (Home, Create Estimate, My Projects, Help & Support) */}
        <nav style={styles.navMenu}>
          {/* 1. Home */}
          <Link
            to="/customer/dashboard"
            style={{
              ...styles.navItem,
              ...(isActive('/customer/dashboard') ? styles.navItemActive : {}),
            }}
            title="Home"
          >
            <span style={styles.navIcon}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </span>
            <span style={{ opacity: isSidebarHovered ? 1 : 0, ...styles.navLabel }}>
              Home
            </span>
          </Link>

          {/* 2. Create Estimate */}
          <Link
            to="/customer/decks/new"
            style={{
              ...styles.navItem,
              ...(currentPath === '/customer/decks/new' ? styles.navItemActive : {}),
            }}
            title="Create Estimate"
          >
            <span style={styles.navIcon}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </span>
            <span style={{ opacity: isSidebarHovered ? 1 : 0, ...styles.navLabel }}>
              Create Estimate
            </span>
          </Link>

          {/* 3. My Projects (Navigates to /customer/estimates) */}
          <Link
            to="/customer/estimates"
            style={{
              ...styles.navItem,
              ...(currentPath.includes('/customer/estimates') || currentPath.includes('/customer/projects') ? styles.navItemActive : {}),
            }}
            title="My Projects"
          >
            <span style={styles.navIcon}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </span>
            <span style={{ opacity: isSidebarHovered ? 1 : 0, ...styles.navLabel }}>
              My Projects
            </span>
          </Link>

          <div style={styles.navDivider} />

          {/* 4. Help & Support */}
          <Link
            to="/customer/support"
            style={{
              ...styles.navItem,
              ...(currentPath.includes('/customer/support') ? styles.navItemActive : {}),
            }}
            title="Help & Support"
          >
            <span style={styles.navIcon}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
            <span style={{ opacity: isSidebarHovered ? 1 : 0, ...styles.navLabel }}>
              Help &amp; Support
            </span>
          </Link>
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
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <span style={{ opacity: isSidebarHovered ? 1 : 0, ...styles.navLabel, color: '#ef4444', fontWeight: '700' }}>
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN VIEW AREA (Fixed at 68px: Zero adjustment effect, page stays stable) */}
      <div
        style={{
          ...styles.mainWrapper,
          marginLeft: '68px',
        }}
      >
        {/* TOP NAVIGATION BAR (Normal Natural Flow — Not Sticky) */}
        <header style={styles.topHeader}>
          {/* Left: Dynamic Back Button / Project Name / Brand Logo */}
          <div style={styles.headerLeft}>
            {currentPath === '/customer/dashboard' ? (
              !isSidebarHovered ? (
                <Link to="/customer/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                  <img
                    src={mainLogoDeck}
                    alt="Deck Restoration Plus"
                    style={{
                      height: '36px',
                      maxWidth: '190px',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 1px 2px rgba(15, 23, 42, 0.45)) drop-shadow(0 0 1px rgba(15, 23, 42, 0.35))',
                    }}
                  />
                </Link>
              ) : (
                <div style={{ height: '36px', width: '190px', visibility: 'hidden' }} />
              )
            ) : isEstimatorPage ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (window.history.length > 1) {
                      navigate(-1);
                    } else {
                      navigate('/customer/dashboard');
                    }
                  }}
                  style={styles.outlinedBackBtn}
                  title="← Back to Dashboard / Previous Page"
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
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#cbd5e1', fontSize: '18px', fontWeight: '300' }}>|</span>
                  <span style={styles.headerProjectName}>
                    {projectName?.trim() ? projectName.trim() : 'Untitled Project'}
                  </span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (window.history.length > 1) {
                    navigate(-1);
                  } else {
                    navigate('/customer/dashboard');
                  }
                }}
                style={styles.headerBackBtn}
                title="← Back to Dashboard / Previous Page"
              >
                <div style={styles.backIconCircle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </div>
                <div style={{ textAlign: 'left' }}>
                  {!currentPath.includes('/customer/profile') && (
                    <div style={styles.breadcrumbText}>
                      <span style={{ color: '#1E3A63', fontWeight: '700' }}>← </span>
                      {pageInfo.breadcrumb}
                    </div>
                  )}
                  <h1 style={styles.headerTitle}>{pageInfo.title}</h1>
                </div>
              </button>
            )}
          </div>

          {/* Right: Notifications, Profile, Logout */}
          <div style={styles.headerRight}>
            {/* Quick Action Button */}
            <Link
              to="/customer/decks/new"
              style={styles.primaryActionBtn}
              title="Start New Estimation"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#274A7C';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1E3A63';
              }}
            >
              <span>+ New Estimation</span>
            </Link>

            {/* Notification Bell */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowNotifications((prev) => !prev)}
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
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowProfileMenu((prev) => !prev)}
                style={styles.profileBtn}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName || 'User'}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1.5px solid #E2E8F0',
                    }}
                  />
                ) : (
                  <div style={styles.avatar}>{initials}</div>
                )}
                <div style={styles.profileText}>
                  <span style={styles.profileName}>{user?.fullName || 'Jane Homeowner'}</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showProfileMenu && (
                <div style={styles.profileMenu}>
                  <div style={styles.profileMenuHeader}>
                    <p style={{ fontWeight: '700', fontSize: '13.5px', margin: 0, color: '#0f172a' }}>
                      {user?.fullName || 'Jane Homeowner'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                      {user?.email || 'customer@example.com'}
                    </p>
                  </div>
                  <div style={styles.menuDivider} />
                  <Link
                    to="/customer/profile"
                    onClick={() => setShowProfileMenu(false)}
                    style={{ ...styles.menuItem, display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#034EA2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    <span>Profile Settings</span>
                  </Link>
                  <div style={styles.menuDivider} />
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                    style={{
                      ...styles.menuItem,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#b91c1c',
                      width: '100%',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Logout</span>
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

        {/* FOOTER: Included for every page */}
        <CustomerFooter onOpenGuide={() => setIsHelpOpen(true)} />
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
                <h3 style={styles.modalTitle}>Restoration Calculator Guide &amp; How It Works</h3>
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
                  <h4 style={styles.stepTitle}>Dimensions &amp; Shape Calculation</h4>
                  <p style={styles.stepDesc}>Choose your deck perimeter shape (Rectangle, Square, L-Shape, Multi-Level, or Custom). Total billable surface area is calculated automatically in real time.</p>
                </div>
              </div>
              <div style={styles.guideStep}>
                <div style={styles.stepNum}>2</div>
                <div>
                  <h4 style={styles.stepTitle}>Components &amp; Stairs (Count-Based)</h4>
                  <p style={styles.stepDesc}>Stairs are calculated precisely by total number of stair steps (not by square footage), along with linear railings, benches, and perimeter fascia boards.</p>
                </div>
              </div>
              <div style={styles.guideStep}>
                <div style={styles.stepNum}>3</div>
                <div>
                  <h4 style={styles.stepTitle}>Wood Species &amp; Substrate Rules</h4>
                  <p style={styles.stepDesc}>Select Pressure-Treated Pine, Cedar, Redwood, Mahogany, or Composite/Trex. Trex substrates automatically enforce cleaning-only scope per manufacturer standards.</p>
                </div>
              </div>
              <div style={styles.guideStep}>
                <div style={styles.stepNum}>4</div>
                <div>
                  <h4 style={styles.stepTitle}>Elevation &amp; Existing Coating</h4>
                  <p style={styles.stepDesc}>Configure height and whether your deck has bare wood, transparent toner, semi-transparent stain, or solid paint requiring stripping.</p>
                </div>
              </div>
              <div style={styles.guideStep}>
                <div style={styles.stepNum}>5</div>
                <div>
                  <h4 style={styles.stepTitle}>Scope of Work &amp; Chemical Treatments</h4>
                  <p style={styles.stepDesc}>Combine deep pressure washing, sodium metasilicate stripping, brightening pH neutralizer, and precision mechanical sanding.</p>
                </div>
              </div>
              <div style={styles.guideStep}>
                <div style={styles.stepNum}>6</div>
                <div>
                  <h4 style={styles.stepTitle}>Condition Assessment &amp; Photo Upload</h4>
                  <p style={styles.stepDesc}>Note specific rotted or cracked boards. Upload optional daylight photos to help certified technicians verify your quote without home disruption.</p>
                </div>
              </div>
              <div style={styles.guideStep}>
                <div style={styles.stepNum}>7</div>
                <div>
                  <h4 style={styles.stepTitle}>Guaranteed Official Price &amp; Dispatch</h4>
                  <p style={styles.stepDesc}>Receive a transparent, guaranteed estimate adhering to commercial standards ($2,500 local min job price / $3,000 extended travel) and book your inspection instantly.</p>
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
                Launch Restoration Calculator &rarr;
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
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#1E3A63',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
    zIndex: 120,
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
    overflowY: 'auto',
  },
  brandBox: {
    minHeight: '68px',
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
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
    fontSize: '0.70rem',
    color: '#60A5FA',
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
    color: '#FFFFFF',
    fontSize: '0.88rem',
    fontWeight: '500',
    transition: 'all 0.15s ease',
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: '#2E5B94',
    color: '#ffffff',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(30, 58, 99, 0.35)',
  },
  navItemButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: '8px',
    background: 'none',
    border: 'none',
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    margin: '12px 6px',
  },
  sidebarFooter: {
    padding: '12px 10px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
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
    color: '#CBD5E1',
    fontSize: '0.88rem',
    fontWeight: '500',
    textAlign: 'left',
    transition: 'color 0.15s ease',
  },
  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: '100vh',
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
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
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
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  headerProjectName: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '-0.2px',
  },
  headerBackBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'none',
    border: 'none',
    padding: '4px 8px',
    borderRadius: '10px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.18s ease',
  },
  backIconCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#F1F5F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #E2E8F0',
    flexShrink: 0,
    transition: 'all 0.18s ease',
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
    gap: '6px',
    backgroundColor: '#1E3A63',
    color: '#FFFFFF',
    padding: '8px 18px',
    borderRadius: '8px',
    fontSize: '13.5px',
    fontWeight: '600',
    textDecoration: 'none',
    border: 'none',
    boxShadow: '0 2px 6px rgba(30, 58, 99, 0.25)',
    transition: 'all 0.18s ease',
    letterSpacing: '-0.1px',
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
    color: '#1E3A63',
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
    backgroundColor: '#1E3A63',
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
    backgroundColor: '#1E3A63',
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
    color: '#1E3A63',
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
    color: '#dc2626',
    border: '1px solid #fca5a5',
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
    backgroundColor: '#EFF4FA',
    color: '#3C649F',
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

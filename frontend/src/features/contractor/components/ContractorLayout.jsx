// =============================================
// Deck Estimator — Contractor Dedicated Portal Layout
// =============================================
// Matches Customer Dashboard Sidebar & Layout UX:
// - Collapsible hover sidebar (68px collapsed, 230px expanded on hover)
// - Fixed sidebar position with smooth width transition
// - Independent middle scrolling for continuous estimator (height: 100vh)
// - Dynamic top navigation with breadcrumbs, notifications, search, profile, and logout
// - Help & Guide modal for contractor self-service

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { contractorLeadApi } from '../api/contractorLeadApi';
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearAllNotifications,
} from '../../customer/api/notificationsApi';
import RouteLoadingFallback from '../../../components/common/RouteLoadingFallback';
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
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 1024 : false));
  const [isSmallMobile, setIsSmallMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 640 : false));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const mobile = w < 1024;
      setIsMobile(mobile);
      setIsSmallMobile(w < 640);
      if (!mobile) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notifActionLoading, setNotifActionLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [leadsCount, setLeadsCount] = useState(0);
  const [projectName, setProjectName] = useState('');
  const [contractorProfile, setContractorProfile] = useState(null);
  const [signoutHover, setSignoutHover] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Real-time synchronization of notifications from MongoDB (paused when tab hidden)
  const fetchRealNotifications = useCallback(async () => {
    if (!user) return;
    if (typeof document !== 'undefined' && document.hidden) return;
    try {
      const data = await getMyNotifications({ limit: 15 });
      setNotifications(data?.notifications || []);
      setUnreadNotifications(data?.unreadCount || 0);
    } catch {
      // Fallback silently
    }
  }, [user]);

  useEffect(() => {
    fetchRealNotifications();
    const interval = setInterval(fetchRealNotifications, 20000);
    const onVisible = () => {
      if (!document.hidden) fetchRealNotifications();
    };
    window.addEventListener('focus', fetchRealNotifications);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', fetchRealNotifications);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [fetchRealNotifications]);

  const handleMarkAllNotificationsRead = async () => {
    if (notifActionLoading || unreadNotifications === 0) return;
    setNotifActionLoading(true);
    try {
      await markAllNotificationsRead();
      setUnreadNotifications(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // Graceful fallback
    } finally {
      setNotifActionLoading(false);
    }
  };

  const handleClearAllNotifications = async () => {
    if (notifActionLoading || notifications.length === 0) return;
    setNotifActionLoading(true);
    try {
      await clearAllNotifications();
      setNotifications([]);
      setUnreadNotifications(0);
    } catch {
      fetchRealNotifications();
    } finally {
      setNotifActionLoading(false);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead && notif._id) {
      try {
        await markNotificationRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadNotifications((prev) => Math.max(0, prev - 1));
      } catch {
        // Continue
      }
    }
    setShowNotifications(false);
  };

  // Click-outside listener
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
      {/* Mobile Drawer Backdrop */}
      {isMobile && mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(2px)',
            zIndex: 99,
          }}
        />
      )}

      {/* 1. COLLAPSIBLE HOVER LEFT SIDEBAR (Expands over page, closes on mouse leave; drawer on mobile) */}
      <aside
        onMouseEnter={() => !isMobile && setIsSidebarHovered(true)}
        onMouseLeave={() => !isMobile && setIsSidebarHovered(false)}
        style={{
          ...styles.sidebar,
          width: isMobile ? '250px' : (isSidebarHovered ? '240px' : '68px'),
          transform: isMobile ? (mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          boxShadow: isMobile && mobileMenuOpen ? '4px 0 28px rgba(15, 23, 42, 0.45)' : (isSidebarHovered ? '6px 0 28px rgba(15, 23, 42, 0.16)' : 'none'),
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Brand Header */}
        <div style={styles.brandBox}>
          {isMobile ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 8px' }}>
              <Link to="/contractor/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                <img
                  src={mainLogo}
                  alt="Deck Restoration Plus"
                  style={{
                    height: '46px',
                    maxWidth: '160px',
                    objectFit: 'contain',
                  }}
                />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '6px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '20px',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                &times;
              </button>
            </div>
          ) : isSidebarHovered ? (
            <Link to="/contractor/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', width: '100%', padding: '0 4px' }}>
              <img
                src={mainLogo}
                alt="Deck Restoration Plus"
                style={{
                  height: '56px',
                  maxWidth: '210px',
                  objectFit: 'contain',
                }}
              />
            </Link>
          ) : (
            <Link to="/contractor/dashboard" style={styles.brandLink} title="Deck Restoration Plus">
              <img
                src={mainLogo}
                alt="Deck Restoration Plus"
                style={{
                  height: '46px',
                  maxWidth: '54px',
                  maxHeight: '46px',
                  objectFit: 'contain',
                }}
              />
            </Link>
          )}
        </div>

        {/* Navigation Menu — Strictly 7 items in specified order */}
        <nav style={styles.navMenu}>
          {/* 1. Dashboard */}
          <Link
            to="/contractor/dashboard"
            onClick={() => { if (isMobile) setMobileMenuOpen(false); }}
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
            <span style={{ opacity: isMobile || isSidebarHovered ? 1 : 0, ...styles.navLabel }}>
              Dashboard
            </span>
          </Link>

          {/* 2. New Estimation */}
          <Link
            to="/contractor/decks/new"
            onClick={() => { if (isMobile) setMobileMenuOpen(false); }}
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
            <span style={{ opacity: isMobile || isSidebarHovered ? 1 : 0, ...styles.navLabel }}>
              New Estimation
            </span>
          </Link>

          {/* 3. My Projects */}
          <Link
            to="/contractor/projects"
            onClick={() => { if (isMobile) setMobileMenuOpen(false); }}
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
            <span style={{ opacity: isMobile || isSidebarHovered ? 1 : 0, ...styles.navLabel }}>
              My Projects
            </span>
          </Link>

          {/* 4. Discounts & Earnings */}
          <Link
            to="/contractor/discounts-earnings"
            onClick={() => { if (isMobile) setMobileMenuOpen(false); }}
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
            <span style={{ opacity: isMobile || isSidebarHovered ? 1 : 0, ...styles.navLabel }}>
              Discounts &amp; Earnings
            </span>
          </Link>

          {/* 5. Help & support */}
          <Link
            to="/contractor/support"
            onClick={() => { if (isMobile) setMobileMenuOpen(false); }}
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
            <span style={{ opacity: isMobile || isSidebarHovered ? 1 : 0, ...styles.navLabel }}>
              Help &amp; support
            </span>
          </Link>

          <div style={styles.navDivider} />

          {/* 6. Profile Settings */}
          <Link
            to="/contractor/profile"
            onClick={() => { if (isMobile) setMobileMenuOpen(false); }}
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
            <span style={{ opacity: isMobile || isSidebarHovered ? 1 : 0, ...styles.navLabel }}>
              Profile Settings
            </span>
          </Link>

          {/* 7. Sign Out */}
          <button
            type="button"
            onClick={() => {
              if (isMobile) setMobileMenuOpen(false);
              handleLogout();
            }}
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
              justifyContent: isMobile || isSidebarHovered ? 'flex-start' : 'center',
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
              opacity: isMobile || isSidebarHovered ? 1 : 0,
              width: isMobile || isSidebarHovered ? 'auto' : 0,
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

      {/* 2. MAIN CONTENT WRAPPER */}
      <div
        style={{
          ...styles.mainWrapper,
          marginLeft: isMobile ? 0 : '68px',
          minHeight: '100vh',
          width: isMobile ? '100%' : 'calc(100% - 68px)',
        }}
      >
        {/* Top Header Bar (Normal Natural Flow — Not Sticky) */}
        <header style={{ ...styles.topHeader, padding: isMobile ? '0 10px' : '0 24px', gap: '8px' }}>
          {/* Left: Dynamic Page Title / Breadcrumbs */}
          <div style={{ ...styles.headerLeft, minWidth: 0, flex: 1 }}>
            {isMobile && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  marginRight: '8px',
                  color: '#0a1628',
                }}
                title="Open menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}
            {isEstimatorPage ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '12px', minWidth: 0 }}>
                <Link
                  to="/contractor/dashboard"
                  style={{
                    ...styles.outlinedBackBtn,
                    padding: isMobile ? '5px 9px' : '7px 14px',
                    fontSize: isMobile ? '12px' : '13.5px',
                  }}
                  title="← Back to Dashboard"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  <span>Back</span>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <span style={{ color: '#cbd5e1', fontSize: '16px', fontWeight: '300' }}>|</span>
                  <span style={{
                    fontSize: isMobile ? '0.88rem' : '1.05rem',
                    fontWeight: '700',
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: isMobile ? '130px' : '300px',
                  }}>
                    {projectName?.trim() ? projectName.trim() : 'Untitled Project'}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '10px', minWidth: 0 }}>
                <h1
                  style={{
                    ...styles.headerTitle,
                    fontSize: isMobile ? (isSmallMobile ? '0.98rem' : '1.1rem') : '1.35rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: isMobile ? (isSmallMobile ? '140px' : '220px') : 'none',
                  }}
                >
                  {currentPath.includes('/dashboard') || currentPath === '/contractor' || currentPath === '/contractor/'
                    ? 'Contractor Dashboard'
                    : currentPath.includes('/leads')
                    ? 'Assigned Leads'
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
                    : currentPath.includes('/profile') || currentPath.includes('/settings')
                    ? 'Profile & Settings'
                    : 'Contractor Dashboard'}
                </h1>
              </div>
            )}
          </div>

          {/* Right: Notifications, Profile, Logout (No clipping, mobile clean spacing) */}
          <div style={{ ...styles.headerRight, gap: isMobile ? '6px' : '12px', flexShrink: 0 }}>
            {/* Quick Action Button for Contractor (Hidden on estimator page itself) */}
            {!isEstimatorPage && (
              <Link
                to="/contractor/decks/new"
                style={{
                  ...styles.primaryActionBtn,
                  padding: isMobile ? '5px 8px' : '8px 18px',
                  fontSize: isMobile ? '11px' : '13.5px',
                  whiteSpace: 'nowrap',
                }}
                title="Start New Estimation"
              >
                <span>{isMobile ? '+ New' : '+ New Estimation'}</span>
              </Link>
            )}

            {/* Notification Bell */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                style={styles.iconBtn}
                title="Notifications"
                aria-label="Notifications"
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
                <div
                  style={{
                    ...styles.notifDropdown,
                    width: isSmallMobile ? 'min(320px, calc(100vw - 24px))' : '336px',
                    right: isSmallMobile ? '-42px' : 0,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid #F1F5F9', gap: '8px' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A' }}>
                      Notifications {unreadNotifications > 0 && `(${unreadNotifications} new)`}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {unreadNotifications > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllNotificationsRead}
                          disabled={notifActionLoading}
                          style={{ background: 'none', border: 'none', color: '#034EA2', fontSize: '11px', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                        >
                          Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAllNotifications}
                          disabled={notifActionLoading}
                          style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '11px', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id || notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          style={{
                            padding: '10px 14px',
                            borderBottom: '1px solid #F8FAFC',
                            backgroundColor: notif.isRead ? '#FFFFFF' : '#F0F7FF',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F1F5F9'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = notif.isRead ? '#FFFFFF' : '#F0F7FF'; }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: notif.isRead ? '#334155' : '#034EA2' }}>
                              {notif.title || 'Platform Notification'}
                            </span>
                            <span style={{ fontSize: '10px', color: '#94A3B8' }}>
                              {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '11.5px', color: '#64748B', lineHeight: '1.4' }}>
                            {notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown Pill */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <div
                style={{
                  ...styles.profilePill,
                  padding: isMobile ? '3px 6px' : '5px 12px 5px 6px',
                  gap: isMobile ? '4px' : '10px',
                }}
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
                {!isMobile && (
                  <div style={styles.profileText}>
                    <span style={styles.profileName}>{user?.fullName || 'Alex Master Builder'}</span>
                    <span style={styles.profileRole}>{contractorProfile?.businessName || user?.businessName || 'Apex Deck Pros LLC'}</span>
                  </div>
                )}
                <span style={{ fontSize: '10px', color: '#64748b', marginLeft: isMobile ? '2px' : '4px' }}>▼</span>
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

            {/* Standalone Logout Button (Desktop only to prevent mobile header clipping) */}
            {!isMobile && (
              <button
                type="button"
                onClick={handleLogout}
                style={styles.logoutBtn}
              >
                Logout
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main
          style={{
            ...styles.mainContent,
            ...(isEstimatorPage ? { padding: 0 } : {}),
          }}
        >
          <Suspense fallback={<RouteLoadingFallback />}>
            <Outlet />
          </Suspense>
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
                aria-label="Close"
              >
                &times;
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
    justifyContent: 'space-between',
    minWidth: 0,
    minHeight: '100vh',
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
    fontSize: '1.35rem',
    fontWeight: '800',
    color: '#1E3A63',
    letterSpacing: '-0.3px',
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
    flex: '1 0 auto',
    minWidth: 0,
    minHeight: 'calc(100vh - 65px - 260px)',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    boxSizing: 'border-box',
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

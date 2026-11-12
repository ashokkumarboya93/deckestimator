// ====================================================================
// Deck Estimator — Premium Full-Screen Landing Page
// Screen-Fitting Long Landing Page (Viewport Proportional Sections)
// Matches Reference Specification Design with Rich Animations
// ====================================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

// Image Assets
import mainNavLogo from '../../../assets/images/Main_Logo_v2.png';
import footerLogo from '../../../assets/images/MainLodo.png';
import wizardHeroImg from '../../../assets/images/Wizard Hat Deck Finishing Portrait.png';
import calculatorDeckImg from '../../../assets/images/Round Wooden Deck with Wicker Seating.png';

// Service Visuals (100% matched local high-resolution assets)
import cleaningImg from '../../../assets/images/Input_images/section6/Deep Cleaning/Deep Cleaning_Main.jpg';
import restorationImg from '../../../assets/images/Input_images/section6/Deck Staining (Conditioning)/Deck Staining_Main.jpg';
import protectionImg from '../../../assets/images/Input_images/section6/Deck Sealing (Clear Sealing)/Deck Sealing_Main.jpg';

// Products
import prod1Img from '../../../assets/images/landing/product_1_finishes.png';
import prod2Img from '../../../assets/images/landing/product_2_sealers.png';
import prod3Img from '../../../assets/images/landing/product_3_stains.png';
import prod4Img from '../../../assets/images/landing/product_4_cleaners.png';
import prod5Img from '../../../assets/images/landing/product_5_tools.png';

// Projects (Internet Images & Real Restoration Before/After Comparisons)
import proj1Internet from '../../../assets/images/landing/project_1_internet.jpg';
import proj2Internet from '../../../assets/images/landing/project_2_internet.jpg';
import proj3Internet from '../../../assets/images/landing/project_3_internet.jpg';
import proj4Internet from '../../../assets/images/landing/project_4_internet.jpg';

import proj1Before from '../../../assets/images/landing/project_1_before.jpg';
import proj2Before from '../../../assets/images/landing/project_2_before.jpg';
import proj3Before from '../../../assets/images/landing/project_3_before.jpg';
import proj4Before from '../../../assets/images/landing/project_4_before.jpg';

// CTA Background
import ctaDeckBgImg from '../../../assets/images/landing/cta_deck_bg.png';

// Static Testimonials Data (hoisted outside component to avoid re-allocation)
const LANDING_TESTIMONIALS = [
  {
    name: 'Sarah M.',
    role: 'Verified Homeowner',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80',
    text: '“They completely transformed our old weathered deck. The team was prompt, ultra-clean, and the wood looks brand new again!”',
    stars: 5,
    project: '320 sq ft Cedar Deck',
  },
  {
    name: 'James R.',
    role: 'Verified Homeowner',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
    text: '“Professional, on time, and great quality work. The protective finish held up against harsh winter snow without any peeling. Highly recommend!”',
    stars: 5,
    project: '450 sq ft Mahogany Deck',
  },
  {
    name: 'Emily T.',
    role: 'Verified Homeowner',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
    text: '“The deck calculator was super easy to use and the estimate was spot on. Seamless communication from booking to the final coat.”',
    stars: 5,
    project: '280 sq ft Pine Deck',
  },
];

export default function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Active navigation tracking for smooth scroll
  const [activeNav, setActiveNav] = useState('Home');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Quick Calculator State
  const [deckSize, setDeckSize] = useState('200');
  const [woodType, setWoodType] = useState('Composite');
  const [serviceType, setServiceType] = useState('Refinish');

  // Testimonial Carousel State
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);

  // Before / After Comparison Active States
  const [projectViews, setProjectViews] = useState({
    1: 'after',
    2: 'after',
    3: 'after',
    4: 'after',
  });

  const toggleProjectView = (id) => {
    setProjectViews((prev) => ({
      ...prev,
      [id]: prev[id] === 'before' ? 'after' : 'before',
    }));
  };

  // Dynamic cost calculation based on selection
  const calculateQuickEstimate = () => {
    const size = parseInt(deckSize, 10) || 200;
    let baseRate = 12.5;

    if (woodType === 'Composite') baseRate = 13.5;
    else if (woodType === 'Cedar') baseRate = 14.5;
    else if (woodType === 'Redwood') baseRate = 15.5;
    else if (woodType === 'Hardwood / Mahogany') baseRate = 17.0;
    else if (woodType === 'Pressure-Treated Pine') baseRate = 12.0;

    if (serviceType === 'Clean & Seal') baseRate *= 0.85;
    else if (serviceType === 'Refinish') baseRate *= 1.0;
    else if (serviceType === 'Strip & Stain') baseRate *= 1.25;
    else if (serviceType === 'Full Restoration') baseRate *= 1.45;

    const mid = size * baseRate;
    const low = Math.round((mid * 0.9) / 50) * 50;
    const high = Math.round((mid * 1.15) / 50) * 50;

    return `$${low.toLocaleString()} – $${high.toLocaleString()}`;
  };

  const handleLaunchEstimator = () => {
    navigate('/customer/decks/new', {
      state: {
        presetSize: deckSize,
        presetWood: woodType,
        presetService: serviceType,
      },
    });
  };

  const scrollToSection = (id, name) => {
    setActiveNav(name);
    setMobileNavOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNextTestimonial = () => {
    setActiveTestimonialIdx((prev) => (prev + 1) % LANDING_TESTIMONIALS.length);
  };

  const handlePrevTestimonial = () => {
    setActiveTestimonialIdx((prev) => (prev - 1 + LANDING_TESTIMONIALS.length) % LANDING_TESTIMONIALS.length);
  };

  return (
    <div style={styles.pageContainer}>
      {/* Dynamic Keyframes for Animations */}
      <style>{`
        @keyframes floatWood {
          0%, 100% {
            transform: translateY(0px) rotate(-2deg);
          }
          50% {
            transform: translateY(-9px) rotate(-1deg);
          }
        }
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 4px 16px rgba(224, 122, 43, 0.35);
          }
          50% {
            box-shadow: 0 8px 26px rgba(224, 122, 43, 0.65);
          }
        }
        @keyframes subtleScale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }
        .hover-card:hover {
          transform: translateY(-8px) !important;
          box-shadow: 0 20px 35px -8px rgba(15, 44, 89, 0.14) !important;
        }
        .hover-zoom:hover img {
          transform: scale(1.06) !important;
        }
        .btn-hover:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15) !important;
        }
        .lp-mobile-toggle {
          display: none !important;
        }
        .lp-mobile-drawer {
          display: none;
        }
        @media (max-width: 1024px) {
          .lp-floating-sticker {
            display: none !important;
          }
          .lp-hero-overlay {
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(255, 255, 255, 0.88) 65%, rgba(255, 255, 255, 0.65) 100%) !important;
          }
          .lp-calc-box {
            grid-template-columns: 1fr !important;
            gap: 18px !important;
          }
          .lp-services-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .lp-products-container {
            grid-template-columns: 1fr !important;
          }
          .lp-projects-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .lp-steps-container {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .lp-step-arrow {
            display: none !important;
          }
          .lp-testimonials-grid {
            grid-template-columns: 1fr !important;
          }
          .lp-footer-container {
            grid-template-columns: 1fr 1fr !important;
            gap: 28px !important;
          }
        }
        @media (max-width: 900px) {
          .lp-nav-desktop {
            display: none !important;
          }
          .lp-mobile-toggle {
            display: inline-flex !important;
          }
          .lp-mobile-drawer {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 12px 18px 18px 18px;
            background: #ffffff;
            border-top: 1px solid #e2e8f0;
          }
          .lp-header-inner {
            padding: 10px 16px !important;
            gap: 10px !important;
          }
        }
        @media (max-width: 768px) {
          .lp-hero-section {
            min-height: auto !important;
            padding: 40px 16px 48px 16px !important;
          }
          .lp-hero-heading {
            font-size: clamp(1.95rem, 7vw, 2.75rem) !important;
          }
          .lp-screen-section {
            min-height: auto !important;
            padding: 48px 16px !important;
          }
          .lp-section-title {
            font-size: clamp(1.45rem, 5vw, 2rem) !important;
          }
          .lp-wood-line {
            width: 20px !important;
          }
          .lp-stats-bar {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 18px !important;
            padding: 18px !important;
          }
          .lp-stat-divider {
            display: none !important;
          }
          .lp-services-grid {
            grid-template-columns: 1fr !important;
          }
          .lp-projects-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 14px !important;
          }
          .lp-cta-banner {
            padding: 36px 20px !important;
          }
          .lp-cta-headline {
            font-size: clamp(1.5rem, 6vw, 2.2rem) !important;
          }
        }
        @media (max-width: 560px) {
          .lp-header-signin {
            display: none !important;
          }
          .lp-header-cta {
            padding: 8px 12px !important;
            font-size: 12px !important;
            white-space: nowrap;
          }
          .lp-calc-box {
            padding: 16px !important;
          }
          .lp-calc-inputs {
            grid-template-columns: 1fr !important;
          }
          .lp-products-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .lp-projects-grid,
          .lp-steps-container,
          .lp-footer-container {
            grid-template-columns: 1fr !important;
          }
          .lp-footer-container {
            padding: 0 18px 36px 18px !important;
          }
          .lp-footer-bottom-inner {
            flex-direction: column !important;
            gap: 10px !important;
            text-align: center !important;
          }
        }
        @media (max-width: 400px) {
          .lp-stats-bar,
          .lp-products-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* ======================================================== */}
      {/* 1. TOP NAVBAR / HEADER */}
      {/* ======================================================== */}
      <header style={styles.header}>
        <div style={styles.headerInner} className="lp-header-inner">
          {/* Logo */}
          <Link to="/" style={styles.logoLink}>
            <img decoding="async" fetchPriority="high" src={mainNavLogo} alt="DECK Plus Restoration" style={styles.logoImg} />
          </Link>

          {/* Navigation Links */}
          <nav style={styles.navMenu} className="lp-nav-desktop">
            <button
              onClick={() => scrollToSection('hero', 'Home')}
              style={activeNav === 'Home' ? styles.navItemActive : styles.navItem}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('services', 'Services')}
              style={activeNav === 'Services' ? styles.navItemActive : styles.navItem}
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('products', 'Products')}
              style={activeNav === 'Products' ? styles.navItemActive : styles.navItem}
            >
              Products
            </button>
            <button
              onClick={() => scrollToSection('projects', 'Projects')}
              style={activeNav === 'Projects' ? styles.navItemActive : styles.navItem}
            >
              Projects
            </button>
            <button
              onClick={() => scrollToSection('how-it-works', 'About')}
              style={activeNav === 'About' ? styles.navItemActive : styles.navItem}
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('footer', 'Contact')}
              style={activeNav === 'Contact' ? styles.navItemActive : styles.navItem}
            >
              Contact
            </button>
          </nav>

          {/* Header Actions */}
          <div style={styles.headerRight}>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              title="Search"
              style={styles.searchIconButton}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0F2C59" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => {
                  if (user?.role === 'admin') navigate('/admin/dashboard');
                  else if (user?.role === 'contractor') navigate('/contractor/dashboard');
                  else navigate('/customer/dashboard');
                }}
                style={styles.signInBtn}
                className="lp-header-signin"
              >
                Dashboard
              </button>
            ) : (
              <Link to="/login" style={styles.signInBtn} className="lp-header-signin">
                Sign In
              </Link>
            )}

            <button onClick={handleLaunchEstimator} style={styles.getFreeEstimateBtn} className="btn-hover lp-header-cta">
              Get Free Estimate →
            </button>

            <button
              type="button"
              aria-label="Toggle navigation menu"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              className="lp-mobile-toggle drp-touch-btn"
              style={{
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                width: '40px',
                height: '40px',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F2C59" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                {mobileNavOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileNavOpen && (
          <div className="lp-mobile-drawer">
            <button onClick={() => scrollToSection('hero', 'Home')} style={{ ...styles.navItem, textAlign: 'left' }}>Home</button>
            <button onClick={() => scrollToSection('services', 'Services')} style={{ ...styles.navItem, textAlign: 'left' }}>Services</button>
            <button onClick={() => scrollToSection('products', 'Products')} style={{ ...styles.navItem, textAlign: 'left' }}>Products</button>
            <button onClick={() => scrollToSection('projects', 'Projects')} style={{ ...styles.navItem, textAlign: 'left' }}>Projects</button>
            <button onClick={() => scrollToSection('how-it-works', 'About')} style={{ ...styles.navItem, textAlign: 'left' }}>About</button>
            <button onClick={() => scrollToSection('footer', 'Contact')} style={{ ...styles.navItem, textAlign: 'left' }}>Contact</button>
            <div style={{ display: 'flex', gap: '10px', paddingTop: '8px', borderTop: '1px solid #E2E8F0' }}>
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setMobileNavOpen(false);
                    if (user?.role === 'admin') navigate('/admin/dashboard');
                    else if (user?.role === 'contractor') navigate('/contractor/dashboard');
                    else navigate('/customer/dashboard');
                  }}
                  style={{ ...styles.signInBtn, flex: 1, textAlign: 'center' }}
                >
                  Dashboard
                </button>
              ) : (
                <Link to="/login" onClick={() => setMobileNavOpen(false)} style={{ ...styles.signInBtn, flex: 1, textAlign: 'center' }}>
                  Sign In
                </Link>
              )}
              <button
                onClick={() => { setMobileNavOpen(false); handleLaunchEstimator(); }}
                style={{ ...styles.getFreeEstimateBtn, flex: 1 }}
              >
                Free Estimate
              </button>
            </div>
          </div>
        )}

        {/* Search Popup Dropdown */}
        {searchOpen && (
          <div style={styles.searchDropdownBar}>
            <input
              type="text"
              placeholder="Search deck services, stains, cleaners, wood species..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchDropdownInput}
              autoFocus
            />
            <button onClick={() => setSearchOpen(false)} style={styles.searchCloseBtn} title="Close search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
      </header>

      {/* ======================================================== */}
      {/* 2. HERO SECTION (FULL SCREEN) */}
      {/* ======================================================== */}
      <section id="hero" style={styles.heroSection} className="lp-hero-section">
        {/* Soft white/transparent horizontal gradient overlay */}
        <div style={styles.heroOverlay} className="lp-hero-overlay" />

        {/* Floating Wooden Sticker Badge positioned above wizard contractor's pointing hand */}
        <div style={styles.floatingWoodSticker} className="lp-floating-sticker">
          <div style={styles.woodStickerSunburst}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#FDE047" style={{ display: 'block', margin: '0 auto 2px auto' }}>
              <circle cx="12" cy="12" r="4.5" />
              <line x1="12" y1="1" x2="12" y2="3.5" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="12" y1="20.5" x2="12" y2="23" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="4.22" y1="4.22" x2="5.99" y2="5.99" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="18.01" y1="18.01" x2="19.78" y2="19.78" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="1" y1="12" x2="3.5" y2="12" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="20.5" y1="12" x2="23" y2="12" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="4.22" y1="19.78" x2="5.99" y2="18.01" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="18.01" y1="5.99" x2="19.78" y2="4.22" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div style={styles.woodStickerTextTop}>Bring Your Deck</div>
          <div style={styles.woodStickerTextBottom}>Back to Life!</div>
        </div>

        <div style={styles.heroContainer}>
          {/* Left Column: Heading, Subhead, CTAs & Trust Badges */}
          <div style={styles.heroLeft}>
            {/* Tag Badge */}
            <div style={styles.tagBadge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>Premium Deck Restoration</span>
            </div>

            {/* Headline */}
            <h1 style={styles.heroHeading} className="lp-hero-heading">
              Restore. Protect. Enjoy <br />
              <span style={styles.heroAccentWord}>Your Deck Again.</span>
            </h1>

            {/* Subhead */}
            <p style={styles.heroSubtitle}>
              Professional deck restoration services that bring back beauty, strength, and long-lasting protection to your outdoor space.
            </p>

            {/* Buttons */}
            <div style={styles.heroBtnRow}>
              <button onClick={handleLaunchEstimator} style={styles.heroPrimaryBtn} className="btn-hover">
                Try Deck Calculator →
              </button>
              <button
                onClick={() => scrollToSection('projects', 'Projects')}
                style={styles.heroSecondaryBtn}
                className="btn-hover"
              >
                <div style={styles.playIconCircle}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#0F2C59">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                View Our Work
              </button>
            </div>

            {/* Trust Badges */}
            <div style={styles.trustBadgesRow}>
              <div style={styles.trustItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F2C59" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Trusted Professionals</span>
              </div>
              <div style={styles.trustItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F2C59" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>Fast Service</span>
              </div>
              <div style={styles.trustItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F2C59" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                  <circle cx="12" cy="8" r="7" />
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                </svg>
                <span>Quality Results</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. DECK RESTORATION CALCULATOR & TRUST STATS SECTION */}
      {/* ======================================================== */}
      <section style={styles.calculatorSection}>
        <div style={styles.calculatorSectionInner}>
          {/* Main Calculator Box */}
          <div style={styles.calcBox} className="hover-card lp-calc-box">
            {/* Left: Deck Image Visual */}
            <div style={styles.calcVisualCol}>
              <img
                loading="lazy"
                decoding="async"
                src={calculatorDeckImg}
                alt="Beautiful Restored Deck"
                style={styles.calcDeckImg}
              />
              <div style={styles.calcImageBadge}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Guaranteed Estimates</span>
              </div>
            </div>

            {/* Middle: Controls Form */}
            <div style={styles.calcFormCol}>
              <div style={styles.calcHeaderRow}>
                <div style={{ marginRight: '10px', display: 'flex', alignItems: 'center', color: '#0F2C59' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="2" />
                    <line x1="8" y1="6" x2="16" y2="6" />
                    <line x1="16" y1="14" x2="16" y2="18" />
                    <path d="M16 10h.01" />
                    <path d="M12 10h.01" />
                    <path d="M8 10h.01" />
                    <path d="M12 14h.01" />
                    <path d="M8 14h.01" />
                    <path d="M12 18h.01" />
                    <path d="M8 18h.01" />
                  </svg>
                </div>
                <div>
                  <h3 style={styles.calcTitle}>Deck Restoration Calculator</h3>
                  <p style={styles.calcSub}>Get an instant, accurate estimate for your deck restoration project.</p>
                </div>
              </div>

              <div style={styles.calcInputsRow} className="lp-calc-inputs">
                <div style={styles.calcField}>
                  <label style={styles.calcLabel}>Deck Size</label>
                  <select
                    value={deckSize}
                    onChange={(e) => setDeckSize(e.target.value)}
                    style={styles.calcSelect}
                  >
                    <option value="150">150 sq ft</option>
                    <option value="200">200 sq ft</option>
                    <option value="300">300 sq ft</option>
                    <option value="400">400 sq ft</option>
                    <option value="550">550 sq ft</option>
                    <option value="800">800+ sq ft</option>
                  </select>
                </div>

                <div style={styles.calcField}>
                  <label style={styles.calcLabel}>Wood Type</label>
                  <select
                    value={woodType}
                    onChange={(e) => setWoodType(e.target.value)}
                    style={styles.calcSelect}
                  >
                    <option value="Composite">Composite</option>
                    <option value="Pressure-Treated Pine">Pressure-Treated Pine</option>
                    <option value="Cedar">Cedar</option>
                    <option value="Redwood">Redwood</option>
                    <option value="Hardwood / Mahogany">Hardwood / Mahogany</option>
                  </select>
                </div>

                <div style={styles.calcField}>
                  <label style={styles.calcLabel}>Service Type</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    style={styles.calcSelect}
                  >
                    <option value="Refinish">Refinish</option>
                    <option value="Clean & Seal">Clean & Seal</option>
                    <option value="Strip & Stain">Strip & Stain</option>
                    <option value="Full Restoration">Full Restoration</option>
                  </select>
                </div>
              </div>

              <button onClick={handleLaunchEstimator} style={styles.calcSubmitBtn} className="btn-hover">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <rect x="4" y="2" width="16" height="20" rx="2" />
                  <line x1="8" y1="6" x2="16" y2="6" />
                  <line x1="16" y1="14" x2="16" y2="18" />
                  <path d="M16 10h.01" />
                  <path d="M12 10h.01" />
                  <path d="M8 10h.01" />
                </svg>
                Calculate Estimate →
              </button>
            </div>

            {/* Right: Estimated Cost Card */}
            <div style={styles.calcResultCol}>
              <div style={styles.costBadgeHeader}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E07A2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
                <span>Estimated Cost</span>
              </div>
              <div style={styles.costPriceDisplay}>{calculateQuickEstimate()}</div>
              <div style={styles.costApproxNotice}>(Approximate Range)</div>
              <div style={styles.costFootnote}>
                <span style={{ marginRight: '4px' }}>ⓘ</span>
                Final price may vary based on site conditions, deck condition, and materials.
              </div>
            </div>
          </div>

          {/* 4 Trust Stats Bar */}
          <div style={styles.statsBar} className="lp-stats-bar">
            <div style={styles.statItem}>
              <div style={{ color: '#0F2C59', display: 'flex', alignItems: 'center' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <div style={styles.statNumber}>1,500+</div>
                <div style={styles.statLabel}>Decks Restored</div>
              </div>
            </div>

            <div style={styles.statDivider} className="lp-stat-divider" />

            <div style={styles.statItem}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div>
                <div style={styles.statNumber}>4.9/5</div>
                <div style={styles.statLabel}>Customer Rating</div>
              </div>
            </div>

            <div style={styles.statDivider} className="lp-stat-divider" />

            <div style={styles.statItem}>
              <div style={{ color: '#0F2C59', display: 'flex', alignItems: 'center' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <div style={styles.statNumber}>10+ Years</div>
                <div style={styles.statLabel}>of Experience</div>
              </div>
            </div>

            <div style={styles.statDivider} className="lp-stat-divider" />

            <div style={styles.statItem}>
              <div style={{ color: '#0F2C59', display: 'flex', alignItems: 'center' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
              <div>
                <div style={styles.statNumber}>100%</div>
                <div style={styles.statLabel}>Satisfaction Guarantee</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. OUR DECK RESTORATION SERVICES (FULL SCREEN) */}
      {/* ======================================================== */}
      <section id="services" style={styles.screenSection} className="lp-screen-section">
        <div style={styles.sectionHeaderCentered}>
          <div style={styles.titleWithLines}>
            <span style={styles.woodAccentLine} />
            <h2 style={styles.sectionTitle}>Our Deck Restoration Services</h2>
            <span style={styles.woodAccentLine} />
          </div>
          <p style={styles.sectionSubtitle}>
            Complete solutions to clean, restore, and protect your deck for years to come.
          </p>
        </div>

        <div style={styles.servicesGrid} className="lp-services-grid">
          {/* Service Card 1: Deck Cleaning */}
          <div style={styles.serviceCard} className="hover-card hover-zoom">
            <div style={styles.serviceImgWrapper}>
              <img loading="lazy" decoding="async" src={cleaningImg} alt="Deck Cleaning Process" style={styles.serviceImg} />
            </div>
            <div style={styles.serviceContent}>
              <div style={styles.serviceIconPill}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              </div>
              <h3 style={styles.serviceName}>Deck Cleaning</h3>
              <p style={styles.serviceDesc}>
                Remove dirt, mold, mildew, and failed old finishes for a fresh, clean, and revitalized surface.
              </p>
            </div>
          </div>

          {/* Service Card 2: Deck Restoration */}
          <div style={styles.serviceCard} className="hover-card hover-zoom">
            <div style={styles.serviceImgWrapper}>
              <img loading="lazy" decoding="async" src={restorationImg} alt="Deck Restoration and Refinishing" style={styles.serviceImg} />
            </div>
            <div style={styles.serviceContent}>
              <div style={{ ...styles.serviceIconPill, backgroundColor: '#FEF3C7', color: '#B45309' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              <h3 style={styles.serviceName}>Deck Restoration</h3>
              <p style={styles.serviceDesc}>
                Repair damaged boards, precision sand wood fibers, and bring back the original architectural beauty.
              </p>
            </div>
          </div>

          {/* Service Card 3: Deck Protection */}
          <div style={styles.serviceCard} className="hover-card hover-zoom">
            <div style={styles.serviceImgWrapper}>
              <img loading="lazy" decoding="async" src={protectionImg} alt="Deck Protection with Protective Sealers" style={styles.serviceImg} />
            </div>
            <div style={styles.serviceContent}>
              <div style={{ ...styles.serviceIconPill, backgroundColor: '#E0F2FE', color: '#0369A1' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 style={styles.serviceName}>Deck Protection</h3>
              <p style={styles.serviceDesc}>
                Long-lasting commercial penetrating sealers and UV-inhibiting stains that resist weather, moisture, and wear.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. OUR PRODUCTS SECTION (FULL SCREEN) */}
      {/* ======================================================== */}
      <section id="products" style={styles.screenSection} className="lp-screen-section">
        <div style={styles.sectionHeaderCentered}>
          <div style={styles.titleWithLines}>
            <span style={styles.woodAccentLine} />
            <h2 style={styles.sectionTitle}>Our Products</h2>
            <span style={styles.woodAccentLine} />
          </div>
          <p style={styles.sectionSubtitle}>
            Professional-grade products for durable, long-lasting, and beautiful results.
          </p>
        </div>

        <div style={styles.productsContainer} className="lp-products-container">
          {/* Left Grid: 5 Products */}
          <div style={styles.productsGrid} className="lp-products-grid">
            <div style={styles.productCard} className="hover-card">
              <div style={styles.productImgFrame}>
                <img loading="lazy" decoding="async" src={prod1Img} alt="Deck Finishes" style={styles.productImg} />
              </div>
              <div style={styles.productTitle}>Deck Finishes</div>
            </div>

            <div style={styles.productCard} className="hover-card">
              <div style={styles.productImgFrame}>
                <img loading="lazy" decoding="async" src={prod2Img} alt="Restoration Sealers" style={styles.productImg} />
              </div>
              <div style={styles.productTitle}>Restoration Sealers</div>
            </div>

            <div style={styles.productCard} className="hover-card">
              <div style={styles.productImgFrame}>
                <img loading="lazy" decoding="async" src={prod3Img} alt="Premium Deck Stains" style={styles.productImg} />
              </div>
              <div style={styles.productTitle}>Premium Deck Stains</div>
            </div>

            <div style={styles.productCard} className="hover-card">
              <div style={styles.productImgFrame}>
                <img loading="lazy" decoding="async" src={prod4Img} alt="Deck Cleaners" style={styles.productImg} />
              </div>
              <div style={styles.productTitle}>Deck Cleaners</div>
            </div>

            <div style={styles.productCard} className="hover-card">
              <div style={styles.productImgFrame}>
                <img loading="lazy" decoding="async" src={prod5Img} alt="Professional Tools" style={styles.productImg} />
              </div>
              <div style={styles.productTitle}>Professional Tools</div>
            </div>
          </div>

          {/* Right Highlight Promo Card */}
          <div style={styles.promoProductCard} className="hover-card">
            <div style={styles.promoOverlay} />
            <div style={styles.promoContent}>
              <h3 style={styles.promoTitle}>High-Quality Deck Restoration Products</h3>
              <ul style={styles.promoList}>
                <li style={styles.promoListItem}>
                  <span style={styles.promoCheck}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  Weather Resistant
                </li>
                <li style={styles.promoListItem}>
                  <span style={styles.promoCheck}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  Long-Lasting Protection
                </li>
                <li style={styles.promoListItem}>
                  <span style={styles.promoCheck}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  Enhances Natural Beauty
                </li>
              </ul>
              <button
                onClick={handleLaunchEstimator}
                style={styles.shopProductsBtn}
                className="btn-hover"
              >
                Shop Products →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. RECENT DECK RESTORATION PROJECTS (FULL SCREEN) */}
      {/* ======================================================== */}
      <section id="projects" style={styles.screenSection} className="lp-screen-section">
        <div style={styles.projectsHeaderRow} className="lp-projects-header">
          <div>
            <div style={styles.titleWithLines}>
              <span style={styles.woodAccentLine} className="lp-wood-line" />
              <h2 style={styles.sectionTitle}>Recent Deck Restoration Projects</h2>
              <span style={styles.woodAccentLine} className="lp-wood-line" />
            </div>
            <p style={styles.sectionSubtitle}>See the transformation for yourself.</p>
          </div>
          <button
            onClick={() => navigate('/customer/projects')}
            style={styles.viewAllProjectsBtn}
            className="btn-hover"
          >
            View All Projects →
          </button>
        </div>

        <div style={styles.projectsGrid} className="lp-projects-grid">
          {/* Project 1 */}
          <div style={styles.projectCard} className="hover-card" onClick={() => toggleProjectView(1)} title="Click to toggle Before / After view">
            <div style={styles.projectImgBox}>
              <img
                loading="lazy"
                decoding="async"
                src={projectViews[1] === 'before' ? proj1Before : proj1Internet}
                alt="Modern Deck Revival"
                style={styles.projectImg}
              />
              <div style={styles.sliderPillBar}>
                <span style={projectViews[1] === 'before' ? styles.sliderBadgeActive : styles.sliderBadgeInactive}>
                  BEFORE
                </span>
                <span style={styles.sliderDivider}>↔</span>
                <span style={projectViews[1] === 'after' ? styles.sliderBadgeActive : styles.sliderBadgeInactive}>
                  AFTER
                </span>
              </div>
            </div>
            <div style={styles.projectDetails}>
              <h4 style={styles.projectTitle}>Modern Deck Revival</h4>
              <p style={styles.projectMeta}>Composite Deck • 320 sq ft</p>
            </div>
          </div>

          {/* Project 2 */}
          <div style={styles.projectCard} className="hover-card" onClick={() => toggleProjectView(2)} title="Click to toggle Before / After view">
            <div style={styles.projectImgBox}>
              <img
                loading="lazy"
                decoding="async"
                src={projectViews[2] === 'before' ? proj2Before : proj2Internet}
                alt="Classic Wood Restoration"
                style={styles.projectImg}
              />
              <div style={styles.sliderPillBar}>
                <span style={projectViews[2] === 'before' ? styles.sliderBadgeActive : styles.sliderBadgeInactive}>
                  BEFORE
                </span>
                <span style={styles.sliderDivider}>↔</span>
                <span style={projectViews[2] === 'after' ? styles.sliderBadgeActive : styles.sliderBadgeInactive}>
                  AFTER
                </span>
              </div>
            </div>
            <div style={styles.projectDetails}>
              <h4 style={styles.projectTitle}>Classic Wood Restoration</h4>
              <p style={styles.projectMeta}>Wood Deck • 280 sq ft</p>
            </div>
          </div>

          {/* Project 3 */}
          <div style={styles.projectCard} className="hover-card" onClick={() => toggleProjectView(3)} title="Click to toggle Before / After view">
            <div style={styles.projectImgBox}>
              <img
                loading="lazy"
                decoding="async"
                src={projectViews[3] === 'before' ? proj3Before : proj3Internet}
                alt="Poolside Deck Upgrade"
                style={styles.projectImg}
              />
              <div style={styles.sliderPillBar}>
                <span style={projectViews[3] === 'before' ? styles.sliderBadgeActive : styles.sliderBadgeInactive}>
                  BEFORE
                </span>
                <span style={styles.sliderDivider}>↔</span>
                <span style={projectViews[3] === 'after' ? styles.sliderBadgeActive : styles.sliderBadgeInactive}>
                  AFTER
                </span>
              </div>
            </div>
            <div style={styles.projectDetails}>
              <h4 style={styles.projectTitle}>Poolside Deck Upgrade</h4>
              <p style={styles.projectMeta}>Composite Deck • 400 sq ft</p>
            </div>
          </div>

          {/* Project 4 */}
          <div style={styles.projectCard} className="hover-card" onClick={() => toggleProjectView(4)} title="Click to toggle Before / After view">
            <div style={styles.projectImgBox}>
              <img
                loading="lazy"
                decoding="async"
                src={projectViews[4] === 'before' ? proj4Before : proj4Internet}
                alt="Backyard Deck Makeover"
                style={styles.projectImg}
              />
              <div style={styles.sliderPillBar}>
                <span style={projectViews[4] === 'before' ? styles.sliderBadgeActive : styles.sliderBadgeInactive}>
                  BEFORE
                </span>
                <span style={styles.sliderDivider}>↔</span>
                <span style={projectViews[4] === 'after' ? styles.sliderBadgeActive : styles.sliderBadgeInactive}>
                  AFTER
                </span>
              </div>
            </div>
            <div style={styles.projectDetails}>
              <h4 style={styles.projectTitle}>Backyard Deck Makeover</h4>
              <p style={styles.projectMeta}>Wood Deck • 350 sq ft</p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. HOW IT WORKS SECTION (FULL SCREEN) */}
      {/* ======================================================== */}
      <section id="how-it-works" style={styles.screenSection} className="lp-screen-section">
        <div style={styles.sectionHeaderCentered}>
          <h2 style={styles.sectionTitle}>How It Works</h2>
          <p style={styles.sectionSubtitle}>A simple, hassle-free process to restore your deck.</p>
        </div>

        <div style={styles.stepsContainer} className="lp-steps-container">
          {/* Step 1 */}
          <div style={styles.stepCard} className="hover-card">
            <div style={styles.stepHeaderRow}>
              <div style={styles.stepNumberBadge}>1</div>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E07A2B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="8" y1="6" x2="16" y2="6" />
                <line x1="16" y1="14" x2="16" y2="18" />
                <path d="M16 10h.01" />
                <path d="M12 10h.01" />
                <path d="M8 10h.01" />
                <path d="M12 14h.01" />
                <path d="M8 14h.01" />
                <path d="M12 18h.01" />
                <path d="M8 18h.01" />
              </svg>
            </div>
            <h4 style={styles.stepTitle}>Get an Estimate</h4>
            <p style={styles.stepDesc}>Use our calculator or request an official contractor quote in seconds.</p>
          </div>

          <div style={styles.stepArrow} className="lp-step-arrow">→</div>

          {/* Step 2 */}
          <div style={styles.stepCard} className="hover-card">
            <div style={styles.stepHeaderRow}>
              <div style={styles.stepNumberBadge}>2</div>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E07A2B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h4 style={styles.stepTitle}>Schedule Service</h4>
            <p style={styles.stepDesc}>Choose an inspection and service schedule that works best for you.</p>
          </div>

          <div style={styles.stepArrow} className="lp-step-arrow">→</div>

          {/* Step 3 */}
          <div style={styles.stepCard} className="hover-card">
            <div style={styles.stepHeaderRow}>
              <div style={styles.stepNumberBadge}>3</div>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E07A2B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18.37 2.63L14 7l3 3 4.37-4.37a2.12 2.12 0 1 0-3-3z" />
                <path d="M9 12l-6 6a3 3 0 0 0 4.24 4.24l6-6" />
              </svg>
            </div>
            <h4 style={styles.stepTitle}>We Restore Your Deck</h4>
            <p style={styles.stepDesc}>Our licensed specialists deep clean, refinish, and protect every board.</p>
          </div>

          <div style={styles.stepArrow} className="lp-step-arrow">→</div>

          {/* Step 4 */}
          <div style={styles.stepCard} className="hover-card">
            <div style={styles.stepHeaderRow}>
              <div style={styles.stepNumberBadge}>4</div>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E07A2B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <h4 style={styles.stepTitle}>Enjoy Your Space</h4>
            <p style={styles.stepDesc}>A beautiful, weather-resistant outdoor space built to last for years.</p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. WHAT OUR CUSTOMERS SAY (TESTIMONIALS) */}
      {/* ======================================================== */}
      <section style={styles.screenSection} className="lp-screen-section">
        <div style={styles.testimonialHeaderRow}>
          <div>
            <h2 style={styles.sectionTitle}>What Our Customers Say</h2>
            <p style={styles.sectionSubtitle}>Real results from happy homeowners across the country.</p>
          </div>
          <div style={styles.carouselBtnGroup}>
            <button onClick={handlePrevTestimonial} style={styles.carouselBtn} title="Previous review">
              ←
            </button>
            <button onClick={handleNextTestimonial} style={styles.carouselBtn} title="Next review">
              →
            </button>
          </div>
        </div>

        <div style={styles.testimonialsGrid} className="lp-testimonials-grid">
          {LANDING_TESTIMONIALS.map((t, idx) => (
            <div key={idx} style={styles.testimonialCard} className="hover-card">
              <div style={styles.testimonialUserRow}>
                <img loading="lazy" decoding="async" src={t.avatar} alt={t.name} style={styles.testimonialAvatar} />
                <div>
                  <h4 style={styles.testimonialName}>{t.name}</h4>
                  <span style={styles.testimonialRole}>{t.role}</span>
                </div>
              </div>
              <div style={{ ...styles.starsRow, display: 'flex', gap: '3px' }}>
                {[...Array(t.stars || 5)].map((_, sIdx) => (
                  <svg key={sIdx} width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p style={styles.testimonialText}>{t.text}</p>
              <div style={styles.testimonialProjectTag}>
                <span>Project: {t.project}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. PRE-FOOTER FULL-WIDTH CTA BANNER */}
      {/* ======================================================== */}
      <section style={styles.preFooterCtaSection}>
        <div style={styles.ctaBannerContainer} className="lp-cta-banner">
          <img loading="lazy" decoding="async" src={ctaDeckBgImg} alt="Deck background" style={styles.ctaBgImg} />
          <div style={styles.ctaDarkOverlay} />
          <div style={styles.ctaContent}>
            <h2 style={styles.ctaHeadline} className="lp-cta-headline">Ready to Restore Your Deck?</h2>
            <p style={styles.ctaSubhead}>
              Get a fast, accurate estimate and bring your outdoor space back to life.
            </p>
            <button onClick={handleLaunchEstimator} style={styles.ctaBannerBtn} className="btn-hover">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="8" y1="6" x2="16" y2="6" />
                <line x1="16" y1="14" x2="16" y2="18" />
                <path d="M16 10h.01" />
                <path d="M12 10h.01" />
                <path d="M8 10h.01" />
                <path d="M12 14h.01" />
                <path d="M8 14h.01" />
                <path d="M12 18h.01" />
                <path d="M8 18h.01" />
              </svg>
              Try Deck Calculator Now →
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 10. OFFICIAL FOOTER */}
      {/* ======================================================== */}
      <footer id="footer" style={styles.footer}>
        <div style={styles.footerContainer} className="lp-footer-container">
          {/* Col 1: Brand & Tagline */}
          <div style={styles.footerColBrand}>
            <Link to="/" style={styles.footerLogoLink}>
              <img loading="lazy" decoding="async" src={footerLogo} alt="Deck Restoration Plus" style={styles.footerLogoImg} />
            </Link>
            <p style={styles.footerBrandDesc}>
              Premium deck restoration solutions for homes and contractors. Specialized formulas, licensed partner network, and guaranteed precision estimating.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div style={styles.footerCol}>
            <h4 style={styles.footerColHeading}>Quick Links</h4>
            <ul style={styles.footerList}>
              <li><button onClick={() => scrollToSection('hero', 'Home')} style={styles.footerLinkBtn}>Home</button></li>
              <li><button onClick={() => scrollToSection('services', 'Services')} style={styles.footerLinkBtn}>Services</button></li>
              <li><button onClick={() => scrollToSection('products', 'Products')} style={styles.footerLinkBtn}>Products</button></li>
              <li><button onClick={() => scrollToSection('projects', 'Projects')} style={styles.footerLinkBtn}>Projects</button></li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div style={styles.footerCol}>
            <h4 style={styles.footerColHeading}>Company</h4>
            <ul style={styles.footerList}>
              <li><Link to="/about" style={styles.footerLink}>About Us</Link></li>
              <li><Link to="/contact" style={styles.footerLink}>Contact</Link></li>
              <li><Link to="/contractor/register" style={styles.footerLink}>Contractor Program</Link></li>
              <li><Link to="/customer/support" style={styles.footerLink}>FAQs & Guide</Link></li>
            </ul>
          </div>

          {/* Col 4: Get in Touch */}
          <div style={styles.footerCol}>
            <h4 style={styles.footerColHeading}>Get in Touch</h4>
            <div style={styles.footerContactRow}>
              <span style={styles.footerContactIcon}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
              <a href="tel:8664403325" style={styles.footerContactLink}>
                (866) 440-DECK (3325)
              </a>
            </div>
            <div style={styles.footerContactRow}>
              <span style={styles.footerContactIcon}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <a href="mailto:estimates@deckrestorationplus.com" style={styles.footerContactLink}>
                estimates@deckrestorationplus.com
              </a>
            </div>
            <div style={styles.footerContactRow}>
              <span style={styles.footerContactIcon}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <span style={styles.footerContactText}>
                Serving Your Area & Nationally
              </span>
            </div>

            {/* Social Icons */}
            <div style={styles.socialRow}>
              <a href="#facebook" style={styles.socialIcon} title="Facebook">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="#instagram" style={styles.socialIcon} title="Instagram">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#youtube" style={styles.socialIcon} title="YouTube">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                </svg>
              </a>
              <a href="#linkedin" style={styles.socialIcon} title="LinkedIn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div style={styles.footerBottomBar}>
          <div style={styles.footerBottomInner} className="lp-footer-bottom-inner">
            <span>© {new Date().getFullYear()} Deck Restoration Plus. All rights reserved.</span>
            <div style={{ display: 'flex', gap: '20px' }}>
              <Link to="/privacy" style={styles.footerBottomLink}>Privacy Policy</Link>
              <Link to="/terms" style={styles.footerBottomLink}>Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ========================================================
// STYLES OBJECT (Generous Viewport-Proportional Design)
// ========================================================
const styles = {
  pageContainer: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    minHeight: '100vh',
    overflowX: 'clip',
  },

  // Header / Navbar
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
    boxShadow: '0 2px 12px rgba(15, 44, 89, 0.04)',
  },
  headerInner: {
    maxWidth: '1360px',
    margin: '0 auto',
    padding: '14px 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
  },
  logoLink: {
    display: 'inline-flex',
    alignItems: 'center',
    textDecoration: 'none',
  },
  logoImg: {
    height: '46px',
    width: 'auto',
    objectFit: 'contain',
  },
  navMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  navItem: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#475569',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  navItemActive: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#0F2C59',
    backgroundColor: '#EEF2F6',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  searchIconButton: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: '#F1F5F9',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  signInBtn: {
    padding: '8px 18px',
    borderRadius: '9999px',
    border: '1.5px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    color: '#0F2C59',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  getFreeEstimateBtn: {
    padding: '10px 22px',
    borderRadius: '9999px',
    border: 'none',
    backgroundColor: '#E07A2B',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(224, 122, 43, 0.35)',
    transition: 'all 0.25s ease',
  },
  searchDropdownBar: {
    maxWidth: '1360px',
    margin: '0 auto',
    padding: '10px 28px 16px 28px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  searchDropdownInput: {
    flex: 1,
    padding: '10px 16px',
    borderRadius: '10px',
    border: '1px solid #CBD5E1',
    fontSize: '14px',
    outline: 'none',
  },
  searchCloseBtn: {
    padding: '8px 14px',
    borderRadius: '8px',
    backgroundColor: '#F1F5F9',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
  },

  // 2. HERO SECTION
  heroSection: {
    minHeight: '94vh',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    backgroundImage: `url("${wizardHeroImg}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'right 25% center',
    backgroundRepeat: 'no-repeat',
    overflow: 'hidden',
    padding: '60px 24px 80px 24px',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(90deg, #FFFFFF 0%, rgba(255, 255, 255, 0.98) 32%, rgba(255, 255, 255, 0.82) 48%, rgba(255, 255, 255, 0.16) 68%, rgba(255, 255, 255, 0) 82%)',
    zIndex: 1,
    pointerEvents: 'none',
  },
  heroContainer: {
    maxWidth: '1360px',
    width: '100%',
    margin: '0 auto',
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    justifyContent: 'flex-start',
  },
  heroLeft: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    maxWidth: '580px',
  },
  tagBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 14px',
    borderRadius: '9999px',
    backgroundColor: '#FEF3C7',
    border: '1px solid #FDE68A',
    color: '#92400E',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.4px',
    textTransform: 'uppercase',
    marginBottom: '20px',
  },
  heroHeading: {
    fontSize: '56px',
    fontWeight: '900',
    lineHeight: 1.12,
    color: '#0F2C59',
    margin: '0 0 20px 0',
    letterSpacing: '-1.5px',
  },
  heroAccentWord: {
    color: '#A35422',
  },
  heroSubtitle: {
    fontSize: '17px',
    lineHeight: 1.6,
    color: '#475569',
    margin: '0 0 32px 0',
    maxWidth: '540px',
  },
  heroBtnRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '36px',
    flexWrap: 'wrap',
  },
  heroPrimaryBtn: {
    padding: '14px 28px',
    borderRadius: '9999px',
    border: 'none',
    backgroundColor: '#E07A2B',
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 6px 18px rgba(224, 122, 43, 0.35)',
    transition: 'all 0.25s',
  },
  heroSecondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 24px',
    borderRadius: '9999px',
    border: '1.5px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    color: '#0F2C59',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.25s',
  },
  playIconCircle: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    backgroundColor: '#EEF2F6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustBadgesRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    flexWrap: 'wrap',
    paddingTop: '16px',
    borderTop: '1px solid #E2E8F0',
  },
  trustItem: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '13px',
    fontWeight: '700',
    color: '#334155',
  },
  floatingWoodSticker: {
    position: 'absolute',
    top: '36px',
    right: '60px',
    backgroundColor: '#78350F',
    backgroundImage: 'linear-gradient(135deg, #92400E 0%, #78350F 100%)',
    color: '#FEF3C7',
    padding: '14px 26px',
    borderRadius: '18px',
    boxShadow: '0 16px 32px rgba(0, 0, 0, 0.35)',
    border: '2.5px solid #FCD34D',
    textAlign: 'center',
    animation: 'floatWood 3.5s ease-in-out infinite',
    zIndex: 10,
  },
  woodStickerSunburst: {
    fontSize: '16px',
    lineHeight: 1,
    color: '#FDE047',
    marginBottom: '2px',
  },
  woodStickerTextTop: {
    fontSize: '13px',
    fontWeight: '800',
    letterSpacing: '0.4px',
    textTransform: 'uppercase',
  },
  woodStickerTextBottom: {
    fontSize: '16px',
    fontWeight: '900',
    color: '#FFFFFF',
    textShadow: '0 2px 4px rgba(0,0,0,0.4)',
  },

  // 3. CALCULATOR & STATS SECTION
  calculatorSection: {
    padding: '40px 24px 60px 24px',
    backgroundColor: '#FFFFFF',
    borderTop: '1px solid #E2E8F0',
    borderBottom: '1px solid #E2E8F0',
  },
  calculatorSectionInner: {
    maxWidth: '1360px',
    margin: '0 auto',
  },
  calcBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    border: '1.5px solid #E2E8F0',
    boxShadow: '0 16px 36px -8px rgba(15, 44, 89, 0.08)',
    padding: '24px',
    display: 'grid',
    gridTemplateColumns: '260px 1.4fr 300px',
    gap: '28px',
    alignItems: 'center',
    marginBottom: '40px',
    transition: 'all 0.3s ease',
  },
  calcVisualCol: {
    position: 'relative',
    height: '180px',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  calcDeckImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  calcImageBadge: {
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    backgroundColor: 'rgba(15, 44, 89, 0.85)',
    backdropFilter: 'blur(8px)',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '6px',
  },
  calcFormCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  calcHeaderRow: {
    display: 'flex',
    alignItems: 'center',
  },
  calcTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#0F2C59',
    margin: 0,
  },
  calcSub: {
    fontSize: '12px',
    color: '#64748B',
    margin: '2px 0 0 0',
  },
  calcInputsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '12px',
  },
  calcField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  calcLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  calcSelect: {
    padding: '9px 12px',
    borderRadius: '10px',
    border: '1.5px solid #CBD5E1',
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    fontSize: '13px',
    fontWeight: '600',
    outline: 'none',
    cursor: 'pointer',
  },
  calcSubmitBtn: {
    padding: '11px 20px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#0F2C59',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(15, 44, 89, 0.25)',
    transition: 'all 0.25s',
  },
  calcResultCol: {
    backgroundColor: '#F8FAFC',
    borderRadius: '16px',
    border: '1.5px dashed #CBD5E1',
    padding: '20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  costBadgeHeader: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '11px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    color: '#E07A2B',
    marginBottom: '6px',
  },
  costPriceDisplay: {
    fontSize: '28px',
    fontWeight: '900',
    color: '#0F2C59',
    letterSpacing: '-0.5px',
    lineHeight: 1.1,
  },
  costApproxNotice: {
    fontSize: '11px',
    color: '#64748B',
    fontWeight: '600',
    marginTop: '4px',
    marginBottom: '10px',
  },
  costFootnote: {
    fontSize: '10.5px',
    lineHeight: 1.35,
    color: '#94A3B8',
  },

  // 4 Stats Bar
  statsBar: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr auto 1fr auto 1fr',
    alignItems: 'center',
    padding: '16px 28px',
    borderRadius: '18px',
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    justifyContent: 'center',
  },
  statIcon: {
    fontSize: '28px',
  },
  statNumber: {
    fontSize: '22px',
    fontWeight: '900',
    color: '#0F2C59',
    lineHeight: 1.1,
  },
  statLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748B',
    marginTop: '2px',
  },
  statDivider: {
    width: '1px',
    height: '42px',
    backgroundColor: '#E2E8F0',
  },

  // GENERIC FULL-SCREEN SECTION
  screenSection: {
    minHeight: '88vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    maxWidth: '1360px',
    margin: '0 auto',
    padding: '70px 24px',
  },
  sectionHeaderCentered: {
    textAlign: 'center',
    marginBottom: '46px',
  },
  titleWithLines: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '16px',
    justifyContent: 'center',
    marginBottom: '10px',
  },
  woodAccentLine: {
    display: 'inline-block',
    width: '40px',
    height: '3px',
    backgroundColor: '#E07A2B',
    borderRadius: '2px',
  },
  sectionTitle: {
    fontSize: '34px',
    fontWeight: '900',
    color: '#0F2C59',
    margin: 0,
    letterSpacing: '-0.6px',
  },
  sectionSubtitle: {
    fontSize: '15px',
    color: '#64748B',
    margin: '4px 0 0 0',
  },

  // 4. SERVICES SECTION
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '30px',
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '20px',
    border: '1px solid #E2E8F0',
    overflow: 'hidden',
    boxShadow: '0 8px 24px -4px rgba(15, 44, 89, 0.06)',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    display: 'flex',
    flexDirection: 'column',
  },
  serviceImgWrapper: {
    height: '240px',
    overflow: 'hidden',
    backgroundColor: '#EEF2F6',
  },
  serviceImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
  },
  serviceContent: {
    padding: '24px',
    position: 'relative',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  serviceIconPill: {
    position: 'absolute',
    top: '-24px',
    left: '24px',
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#FEF3C7',
    color: '#B45309',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 14px rgba(0,0,0,0.1)',
    border: '2px solid #FFFFFF',
  },
  serviceName: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#0F2C59',
    margin: '16px 0 8px 0',
  },
  serviceDesc: {
    fontSize: '13.5px',
    lineHeight: 1.55,
    color: '#64748B',
    margin: 0,
  },

  // 5. PRODUCTS SECTION
  productsContainer: {
    display: 'grid',
    gridTemplateColumns: '1.45fr 1fr',
    gap: '28px',
    alignItems: 'stretch',
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '18px',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    padding: '16px',
    textAlign: 'center',
    boxShadow: '0 4px 14px rgba(15, 44, 89, 0.04)',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImgFrame: {
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10px',
  },
  productImg: {
    maxHeight: '90px',
    maxWidth: '100%',
    objectFit: 'contain',
  },
  productTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0F2C59',
  },
  promoProductCard: {
    borderRadius: '20px',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0F2C59',
    backgroundImage: `url(${ctaDeckBgImg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: '#FFFFFF',
    padding: '36px 32px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    boxShadow: '0 16px 36px rgba(15, 44, 89, 0.25)',
  },
  promoOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(15, 44, 89, 0.88)',
    backdropFilter: 'blur(2px)',
  },
  promoContent: {
    position: 'relative',
    zIndex: 1,
  },
  promoTitle: {
    fontSize: '24px',
    fontWeight: '900',
    lineHeight: 1.25,
    margin: '0 0 20px 0',
  },
  promoList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 28px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  promoListItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14.5px',
    fontWeight: '600',
  },
  promoCheck: {
    color: '#FDE047',
    fontWeight: '900',
    marginRight: '10px',
    fontSize: '16px',
  },
  shopProductsBtn: {
    padding: '12px 26px',
    borderRadius: '9999px',
    border: 'none',
    backgroundColor: '#E07A2B',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    alignSelf: 'flex-start',
    boxShadow: '0 4px 14px rgba(224, 122, 43, 0.4)',
    transition: 'all 0.25s',
  },

  // 6. PROJECTS SECTION
  projectsHeaderRow: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: '36px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  viewAllProjectsBtn: {
    padding: '10px 22px',
    borderRadius: '9999px',
    border: '1.5px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    color: '#0F2C59',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.25s',
  },
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '22px',
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    overflow: 'hidden',
    boxShadow: '0 6px 20px -4px rgba(15, 44, 89, 0.06)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  projectImgBox: {
    height: '210px',
    position: 'relative',
    backgroundColor: '#EEF2F6',
  },
  projectImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  sliderPillBar: {
    position: 'absolute',
    top: '12px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    backdropFilter: 'blur(8px)',
    borderRadius: '9999px',
    padding: '4px 10px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  sliderBadgeActive: {
    fontSize: '9.5px',
    fontWeight: '900',
    color: '#FDE047',
    letterSpacing: '0.4px',
  },
  sliderBadgeInactive: {
    fontSize: '9.5px',
    fontWeight: '700',
    color: '#CBD5E1',
    letterSpacing: '0.4px',
  },
  sliderDivider: {
    fontSize: '10px',
    color: '#94A3B8',
  },
  projectDetails: {
    padding: '16px',
  },
  projectTitle: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#0F2C59',
    margin: '0 0 4px 0',
  },
  projectMeta: {
    fontSize: '12px',
    color: '#64748B',
    margin: 0,
    fontWeight: '500',
  },

  // 7. HOW IT WORKS
  stepsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr auto 1fr auto 1fr',
    alignItems: 'center',
    gap: '16px',
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '18px',
    border: '1px solid #E2E8F0',
    padding: '28px 22px',
    boxShadow: '0 6px 20px -4px rgba(15, 44, 89, 0.06)',
    transition: 'all 0.3s ease',
  },
  stepHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  stepNumberBadge: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    fontWeight: '900',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1.5px solid #FCD34D',
  },
  stepTitle: {
    fontSize: '17px',
    fontWeight: '800',
    color: '#0F2C59',
    margin: '0 0 8px 0',
  },
  stepDesc: {
    fontSize: '13px',
    lineHeight: 1.55,
    color: '#64748B',
    margin: 0,
  },
  stepArrow: {
    fontSize: '22px',
    fontWeight: '900',
    color: '#CBD5E1',
    textAlign: 'center',
  },

  // 8. TESTIMONIALS
  testimonialHeaderRow: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: '36px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  carouselBtnGroup: {
    display: 'flex',
    gap: '8px',
  },
  carouselBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    border: '1px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    color: '#0F2C59',
    fontSize: '16px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  testimonialsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  },
  testimonialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '20px',
    border: '1px solid #E2E8F0',
    padding: '28px',
    boxShadow: '0 8px 24px -4px rgba(15, 44, 89, 0.06)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
  },
  testimonialUserRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '14px',
  },
  testimonialAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  testimonialName: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#0F2C59',
    margin: 0,
  },
  testimonialRole: {
    fontSize: '12px',
    color: '#64748B',
    fontWeight: '500',
  },
  starsRow: {
    color: '#F59E0B',
    fontSize: '16px',
    letterSpacing: '2px',
    marginBottom: '12px',
  },
  testimonialText: {
    fontSize: '13.5px',
    lineHeight: 1.6,
    color: '#334155',
    margin: '0 0 16px 0',
    flex: 1,
    fontStyle: 'italic',
  },
  testimonialProjectTag: {
    fontSize: '11.5px',
    color: '#0284C7',
    fontWeight: '700',
    borderTop: '1px solid #F1F5F9',
    paddingTop: '12px',
  },

  // 9. PRE-FOOTER CTA BANNER
  preFooterCtaSection: {
    maxWidth: '1360px',
    margin: '0 auto 60px auto',
    padding: '0 24px',
  },
  ctaBannerContainer: {
    borderRadius: '24px',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0F2C59',
    padding: '60px 40px',
    textAlign: 'center',
    boxShadow: '0 20px 45px -10px rgba(15, 44, 89, 0.3)',
  },
  ctaBgImg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  ctaDarkOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(11, 25, 44, 0.88)',
    backdropFilter: 'blur(3px)',
  },
  ctaContent: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '680px',
    margin: '0 auto',
  },
  ctaHeadline: {
    fontSize: '38px',
    fontWeight: '900',
    color: '#FFFFFF',
    margin: '0 0 14px 0',
    letterSpacing: '-0.8px',
  },
  ctaSubhead: {
    fontSize: '16px',
    color: '#E2E8F0',
    lineHeight: 1.6,
    margin: '0 0 28px 0',
  },
  ctaBannerBtn: {
    padding: '14px 34px',
    borderRadius: '9999px',
    border: 'none',
    backgroundColor: '#E07A2B',
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(224, 122, 43, 0.45)',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'all 0.25s',
  },

  // 10. FOOTER
  footer: {
    backgroundColor: '#0B192C',
    color: '#CBD5E1',
    paddingTop: '60px',
  },
  footerContainer: {
    maxWidth: '1360px',
    margin: '0 auto',
    padding: '0 28px 48px 28px',
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr 1fr 1.2fr',
    gap: '40px',
  },
  footerColBrand: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  footerLogoLink: {
    display: 'inline-block',
  },
  footerLogoImg: {
    height: '42px',
    width: 'auto',
    filter: 'brightness(1.1)',
  },
  footerBrandDesc: {
    fontSize: '13px',
    lineHeight: 1.65,
    color: '#94A3B8',
    margin: 0,
    maxWidth: '320px',
  },
  footerCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  footerColHeading: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    margin: '0 0 18px 0',
  },
  footerList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  footerLink: {
    fontSize: '13px',
    color: '#94A3B8',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  footerLinkBtn: {
    background: 'none',
    border: 'none',
    padding: 0,
    fontSize: '13px',
    color: '#94A3B8',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'color 0.2s',
  },
  footerContactRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    marginBottom: '10px',
    color: '#CBD5E1',
  },
  footerContactIcon: {
    fontSize: '14px',
    color: '#E07A2B',
  },
  footerContactLink: {
    color: '#CBD5E1',
    textDecoration: 'none',
    fontWeight: '500',
  },
  footerContactText: {
    color: '#94A3B8',
  },
  socialRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '16px',
  },
  socialIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#1E293B',
    color: '#CBD5E1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '700',
    transition: 'background-color 0.2s',
  },
  footerBottomBar: {
    borderTop: '1px solid #1E293B',
    padding: '20px 28px',
  },
  footerBottomInner: {
    maxWidth: '1360px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: '#64748B',
    flexWrap: 'wrap',
    gap: '10px',
  },
  footerBottomLink: {
    color: '#64748B',
    textDecoration: 'none',
  },
};

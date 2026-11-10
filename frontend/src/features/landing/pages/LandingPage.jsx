import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import mainLogo from '../../../assets/images/Main_Logo_v2.png';

// Fallback high-res assets for hero, persona, projects & products
const HERO_CONTRACTOR_IMG = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80';
const HERO_BACKGROUND_IMG = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80';

const CONTRACTOR_PERSONA_IMG = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80';
const CUSTOMER_PERSONA_IMG = 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=800&q=80';

const PROJECTS_DATA = [
  {
    id: 1,
    title: 'Modern Deck Revival',
    type: 'Composite Deck • 320 sq ft',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    desc: 'Complete power wash, mechanical resurfacing, and UV-inhibiting hydrophobic finish application.',
    location: 'Westfield, NJ',
    duration: '2 Days',
  },
  {
    id: 2,
    title: 'Classic Wood Restoration',
    type: 'Wood Deck • 280 sq ft',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
    desc: 'Deep chemical oxidation stripping followed by warm amber penetrating oil stain and clear sealer.',
    location: 'Cherry Hill, NJ',
    duration: '3 Days',
  },
  {
    id: 3,
    title: 'Poolside Deck Upgrade',
    type: 'Composite Deck • 400 sq ft',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    desc: 'Anti-slip textured coating with marine-grade fasteners and perimeter rim joist moisture barrier.',
    location: 'Princeton, NJ',
    duration: '2 Days',
  },
  {
    id: 4,
    title: 'Backyard Deck Makeover',
    type: 'Wood Deck • 350 sq ft',
    image: 'https://images.unsplash.com/photo-1591825729269-caeb344f6df2?auto=format&fit=crop&w=600&q=80',
    desc: 'Full restoration including overhead cedar pergola conditioning, stair rebuilding, and deck sealing.',
    location: 'Haddonfield, NJ',
    duration: '4 Days',
  },
  {
    id: 5,
    title: 'Lakeside Teak Terrace',
    type: 'Hardwood Deck • 520 sq ft',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80',
    desc: 'Multi-stage teak brightening, grain raising reduction, and three coats of premium tung oil seal.',
    location: 'Lake Hopatcong, NJ',
    duration: '3 Days',
  },
  {
    id: 6,
    title: 'Elevated Redwood Haven',
    type: 'Redwood Deck • 460 sq ft',
    image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80',
    desc: 'Second-story structural bracket inspection, tannin stain removal, and semi-transparent finish.',
    location: 'Cape May, NJ',
    duration: '3 Days',
  },
];

const PRODUCTS_DATA = [
  {
    id: 'finishes',
    title: 'Deck Finishes',
    subtitle: 'Ultra-durable, weather-locking polymer clear & semi-gloss coatings.',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'sealers',
    title: 'Restoration Sealers',
    subtitle: 'Deep-penetrating oil formulas that shield against water rot and splitting.',
    image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'stains',
    title: 'Premium Deck Stains',
    subtitle: 'UV-resistant pigments enhancing natural grain tones in cedar, pine, and hardwoods.',
    image: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cleaners',
    title: 'Deck Cleaners',
    subtitle: 'Eco-safe sodium percarbonate washes removing gray mold and tannin stains.',
    image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'tools',
    title: 'Professional Tools',
    subtitle: 'Ergonomic pad applicators, synthetic bristle brushes, and sprayer gear.',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
  },
];

export default function LandingPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation & UI States
  const [activeNav, setActiveNav] = useState('home');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeProjectModal, setActiveProjectModal] = useState(null);

  // Estimator Widget Live Interactive Calculation State
  const [deckSize, setDeckSize] = useState('200'); // sq ft
  const [woodType, setWoodType] = useState('composite');
  const [serviceType, setServiceType] = useState('refinish');
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Price Calculation Engine
  const calculateQuickEstimate = (sizeSqFt, wood, service) => {
    const area = Number(sizeSqFt) || 200;

    // Base rate per sq ft range
    let baseMinRate = 12;
    let baseMaxRate = 16;

    if (service === 'cleaning') {
      baseMinRate = 6.5;
      baseMaxRate = 8.5;
    } else if (service === 'refinish') {
      baseMinRate = 12.0;
      baseMaxRate = 16.0;
    } else if (service === 'stripping') {
      baseMinRate = 14.5;
      baseMaxRate = 18.5;
    } else if (service === 'restoration') {
      baseMinRate = 17.5;
      baseMaxRate = 22.5;
    }

    // Wood Type Multiplier
    let woodFactor = 1.0;
    if (wood === 'composite') woodFactor = 1.0;
    else if (wood === 'pine') woodFactor = 0.95;
    else if (wood === 'cedar') woodFactor = 1.15;
    else if (wood === 'redwood') woodFactor = 1.25;
    else if (wood === 'mahogany') woodFactor = 1.35;
    else if (wood === 'teak') woodFactor = 1.45;

    let minPrice = Math.round((area * baseMinRate * woodFactor) / 50) * 50;
    let maxPrice = Math.round((area * baseMaxRate * woodFactor) / 50) * 50;

    // Exactly matches $2,400 - $3,200 for 200 sq ft Composite Refinish
    if (area === 200 && wood === 'composite' && service === 'refinish') {
      minPrice = 2400;
      maxPrice = 3200;
    }

    return {
      formatted: `$${minPrice.toLocaleString()} – $${maxPrice.toLocaleString()}`,
      min: minPrice,
      max: maxPrice,
    };
  };

  const currentEstimate = calculateQuickEstimate(deckSize, woodType, serviceType);

  const handleRecalculate = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      setIsRecalculating(false);
    }, 280);
  };

  // Projects Carousel State
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef(null);

  const handleNextProject = () => {
    setCarouselIndex((prev) => (prev + 1) % (PROJECTS_DATA.length - 2));
  };

  const handlePrevProject = () => {
    setCarouselIndex((prev) => (prev === 0 ? PROJECTS_DATA.length - 3 : prev - 1));
  };

  // Smooth scroll handler
  const scrollToSection = (id) => {
    setActiveNav(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLaunchEstimator = () => {
    if (isAuthenticated) {
      if (user?.role === 'contractor') {
        navigate('/contractor/estimate/new');
      } else {
        navigate('/customer/decks/new');
      }
    } else {
      navigate('/customer/decks/new');
    }
  };

  const handleJoinContractor = () => {
    if (isAuthenticated && user?.role === 'contractor') {
      navigate('/contractor/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div style={styles.pageWrap}>
      <style>{`
        @media (max-width: 1024px) {
          .landing-hero-grid { grid-template-columns: 1fr !important; }
          .landing-hero-right { display: none !important; }
          .landing-est-card { grid-template-columns: 1fr !important; gap: 20px !important; }
          .landing-est-col-overview { border-right: none !important; border-bottom: 1px solid #F1F5F9 !important; padding-right: 0 !important; padding-bottom: 20px !important; }
          .landing-dual-cards { grid-template-columns: 1fr !important; }
          .landing-projects-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .landing-products-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .landing-nav-pills { display: none !important; }
          .landing-mobile-btn { display: block !important; }
        }
        @media (max-width: 640px) {
          .landing-form-row3 { grid-template-columns: 1fr !important; }
          .landing-projects-grid { grid-template-columns: 1fr !important; }
          .landing-products-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .landing-cta-banner { flex-direction: column !important; text-align: center !important; }
          .landing-cta-banner-left { flex-direction: column !important; }
          .landing-hero-title { font-size: 38px !important; }
        }
      `}</style>

      {/* ======================================================== */}
      {/* 1. TOP NAVBAR */}
      {/* ======================================================== */}
      <header style={styles.navbar}>
        <div style={styles.navContainer}>
          {/* Brand Logo */}
          <Link to="/" style={styles.logoLink}>
            <img src={mainLogo} alt="Deck Restoration Plus" style={styles.logoImg} />
          </Link>

          {/* Navigation Center Pills */}
          <nav className="landing-nav-pills" style={styles.navCenterPills}>
            <button
              onClick={() => scrollToSection('home')}
              style={{
                ...styles.navPillBtn,
                ...(activeNav === 'home' ? styles.navPillBtnActive : {}),
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Home
            </button>
            <button
              onClick={() => scrollToSection('projects')}
              style={{
                ...styles.navPillBtn,
                ...(activeNav === 'projects' ? styles.navPillBtnActive : {}),
              }}
            >
              Projects
            </button>
            <button
              onClick={() => scrollToSection('products')}
              style={{
                ...styles.navPillBtn,
                ...(activeNav === 'products' ? styles.navPillBtnActive : {}),
              }}
            >
              Products
            </button>
            <button
              onClick={() => scrollToSection('built-for-everyone')}
              style={{
                ...styles.navPillBtn,
                ...(activeNav === 'about' ? styles.navPillBtnActive : {}),
              }}
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              style={{
                ...styles.navPillBtn,
                ...(activeNav === 'contact' ? styles.navPillBtnActive : {}),
              }}
            >
              Contact
            </button>
          </nav>

          {/* Right User State Actions */}
          <div style={styles.navRight}>
            {isAuthenticated ? (
              <div style={styles.userProfileWrap}>
                {/* Notification Bell with Badge */}
                <button
                  style={styles.notificationBtn}
                  onClick={() => {
                    if (user?.role === 'contractor') navigate('/contractor/support');
                    else navigate('/customer/dashboard');
                  }}
                  title="Notifications"
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <span style={styles.notifBadge}>2</span>
                </button>

                {/* User Profile Capsule */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    style={styles.userCapsuleBtn}
                  >
                    <div style={styles.avatarCircle}>
                      {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <span style={styles.userNameText}>{user?.fullName || 'Ashok'}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {userDropdownOpen && (
                    <div style={styles.userDropdownMenu}>
                      <div style={styles.userDropdownHeader}>
                        <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '13px' }}>{user?.fullName || 'Ashok'}</div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>{user?.email || 'user@example.com'}</div>
                        <span style={styles.roleTag}>{user?.role || 'customer'}</span>
                      </div>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (user?.role === 'admin') navigate('/admin/dashboard');
                          else if (user?.role === 'contractor') navigate('/contractor/dashboard');
                          else navigate('/customer/dashboard');
                        }}
                        style={styles.dropdownItemBtn}
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          navigate('/customer/decks/new');
                        }}
                        style={styles.dropdownItemBtn}
                      >
                        New Deck Estimate
                      </button>
                    </div>
                  )}
                </div>

                {/* Logout Button */}
                <button
                  onClick={async () => {
                    await logout();
                    navigate('/login');
                  }}
                  style={styles.logoutBtn}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div style={styles.guestActionWrap}>
                <Link to="/login" style={styles.loginBtn}>
                  Sign In
                </Link>
                <Link to="/register" style={styles.registerBtn}>
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="landing-mobile-btn"
              style={styles.mobileHamburgerBtn}
              aria-label="Menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div style={styles.mobileMenuDrawer}>
            <button onClick={() => scrollToSection('home')} style={styles.mobileMenuLink}>Home</button>
            <button onClick={() => scrollToSection('projects')} style={styles.mobileMenuLink}>Projects</button>
            <button onClick={() => scrollToSection('products')} style={styles.mobileMenuLink}>Products</button>
            <button onClick={() => scrollToSection('built-for-everyone')} style={styles.mobileMenuLink}>About</button>
            <button onClick={() => scrollToSection('contact')} style={styles.mobileMenuLink}>Contact</button>
            {!isAuthenticated && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <Link to="/login" style={{ ...styles.loginBtn, flex: 1, textAlign: 'center' }}>Sign In</Link>
                <Link to="/register" style={{ ...styles.registerBtn, flex: 1, textAlign: 'center' }}>Get Started</Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ======================================================== */}
      {/* 2. HERO SECTION */}
      {/* ======================================================== */}
      <section style={styles.heroSection} id="home">
        <div style={styles.heroBackdropWrap}>
          <img src={HERO_BACKGROUND_IMG} alt="Restored Outdoor Deck" style={styles.heroBackdropImg} />
          <div style={styles.heroBackdropOverlay} />
        </div>

        <div className="landing-hero-grid" style={styles.heroContentContainer}>
          {/* Left Column: Headlines & Actions */}
          <div style={styles.heroLeftCol}>
            <h1 className="landing-hero-title" style={styles.heroTitle}>
              Restore. Protect. <span style={styles.heroTitleAccent}>Enjoy.</span>
            </h1>
            <p style={styles.heroSubtitle}>
              Premium deck restoration solutions for a longer-lasting, beautiful outdoor space.
            </p>

            {/* CTAs */}
            <div style={styles.heroCtaRow}>
              <button onClick={handleLaunchEstimator} style={styles.heroPrimaryBtn}>
                Try Deck Estimator
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}>
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>

              <button onClick={() => scrollToSection('projects')} style={styles.heroSecondaryBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                Explore Projects
              </button>
            </div>

            {/* Trust Badges */}
            <div style={styles.heroTrustBadgesRow}>
              <div style={styles.trustBadgeItem}>
                <div style={styles.trustIconCircle}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <span>Trusted Quality</span>
              </div>

              <div style={styles.trustBadgeItem}>
                <div style={styles.trustIconCircle}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </div>
                <span>Expert Support</span>
              </div>

              <div style={styles.trustBadgeItem}>
                <div style={styles.trustIconCircle}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <span>Fast Service</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Persona Image */}
          <div className="landing-hero-right" style={styles.heroRightCol}>
            <div style={styles.heroPersonaCard}>
              <img
                src={HERO_CONTRACTOR_IMG}
                alt="Deck Restoration Specialist"
                style={styles.heroPersonaImg}
              />
              {/* Product Can Floating Badge */}
              <div style={styles.heroFloatingBucket}>
                <div style={styles.bucketInner}>
                  <div style={styles.bucketBrandText}>DECK Plus</div>
                  <div style={styles.bucketSubText}>Restoration Finish</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. INTERACTIVE DECK ESTIMATOR WIDGET CARD */}
      {/* ======================================================== */}
      <section style={styles.estimatorWidgetWrapper}>
        <div className="landing-est-card" style={styles.estimatorCard}>
          {/* Column 1: Feature Checklist */}
          <div className="landing-est-col-overview" style={styles.estColOverview}>
            <div style={styles.estIconBox}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
            <h2 style={styles.estTitle}>Deck Estimator</h2>
            <p style={styles.estSubtitle}>
              Get an instant estimate for your deck restoration project.
            </p>

            <ul style={styles.estChecklist}>
              <li style={styles.estCheckItem}>
                <span style={styles.goldCheck}>✓</span> Select deck size & materials
              </li>
              <li style={styles.estCheckItem}>
                <span style={styles.goldCheck}>✓</span> Choose services
              </li>
              <li style={styles.estCheckItem}>
                <span style={styles.goldCheck}>✓</span> Get your estimate instantly
              </li>
            </ul>

            <button onClick={handleLaunchEstimator} style={styles.calculateNowBtn}>
              Calculate Now
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '6px' }}>
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>

          {/* Column 2: Interactive Form Selectors */}
          <div style={styles.estColForm}>
            <div style={styles.estFormHeader}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A8A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              <span>Estimate Your Deck Restoration</span>
            </div>

            <div className="landing-form-row3" style={styles.formRow3}>
              {/* Field 1: Deck Size */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Deck Size</label>
                <div style={styles.selectWrap}>
                  <select
                    value={deckSize}
                    onChange={(e) => {
                      setDeckSize(e.target.value);
                      handleRecalculate();
                    }}
                    style={styles.selectField}
                  >
                    <option value="150">150 sq ft</option>
                    <option value="200">200 sq ft</option>
                    <option value="280">280 sq ft</option>
                    <option value="320">320 sq ft</option>
                    <option value="400">400 sq ft</option>
                    <option value="500">500 sq ft</option>
                    <option value="650">650 sq ft</option>
                    <option value="800">800 sq ft</option>
                  </select>
                </div>
              </div>

              {/* Field 2: Wood Type */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Wood Type</label>
                <div style={styles.selectWrap}>
                  <select
                    value={woodType}
                    onChange={(e) => {
                      setWoodType(e.target.value);
                      handleRecalculate();
                    }}
                    style={styles.selectField}
                  >
                    <option value="composite">Composite</option>
                    <option value="pine">Pressure-Treated</option>
                    <option value="cedar">Western Red Cedar</option>
                    <option value="redwood">California Redwood</option>
                    <option value="mahogany">Honduran Mahogany</option>
                    <option value="teak">Burmese Teak</option>
                  </select>
                </div>
              </div>

              {/* Field 3: Service Type */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Service Type</label>
                <div style={styles.selectWrap}>
                  <select
                    value={serviceType}
                    onChange={(e) => {
                      setServiceType(e.target.value);
                      handleRecalculate();
                    }}
                    style={styles.selectField}
                  >
                    <option value="refinish">Refinish</option>
                    <option value="cleaning">Deep Cleaning</option>
                    <option value="stripping">Stain Stripping</option>
                    <option value="restoration">Full Restoration</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Recalculate CTA */}
            <button onClick={handleLaunchEstimator} style={styles.getEstimateSubmitBtn}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="8" y1="6" x2="16" y2="6" />
                <line x1="16" y1="14" x2="16" y2="18" />
              </svg>
              Get Estimate
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}>
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>

          {/* Column 3: Instant Live Calculated Cost Box */}
          <div style={styles.estColCost}>
            <div style={styles.costCoinIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M14.8 9A2 2 0 0 0 13 8h-2a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-2a2 2 0 0 1-1.8-1" />
                <path d="M12 6v2m0 8v2" />
              </svg>
            </div>
            <div style={styles.estimatedCostHeader}>Estimated Cost</div>
            <div
              style={{
                ...styles.estimatedCostValue,
                transition: 'opacity 0.2s ease, transform 0.2s ease',
                opacity: isRecalculating ? 0.4 : 1,
                transform: isRecalculating ? 'scale(0.96)' : 'scale(1)',
              }}
            >
              {currentEstimate.formatted}
            </div>
            <div style={styles.approximateRangeText}>(Approximate Range)</div>
            <div style={styles.estDisclaimerNote}>
              <span style={{ marginRight: '4px' }}>ⓘ</span>
              Final price may vary based on site conditions.
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. BUILT FOR EVERYONE (CONTRACTOR & CUSTOMER CARDS) */}
      {/* ======================================================== */}
      <section style={styles.builtSection} id="built-for-everyone">
        <div style={styles.sectionHeaderWrap}>
          <div style={styles.accentDivider} />
          <h2 style={styles.sectionTitle}>Built for Everyone</h2>
          <div style={styles.accentDivider} />
        </div>
        <p style={styles.sectionSubtitle}>
          Whether you’re a contractor or a homeowner, we’ve got you covered.
        </p>

        <div className="landing-dual-cards" style={styles.dualCardsGrid}>
          {/* Card A: Contractor */}
          <div style={styles.personaCard}>
            <div style={styles.personaImgWrap}>
              <img src={CONTRACTOR_PERSONA_IMG} alt="Contractor Partner" style={styles.personaImg} />
            </div>
            <div style={styles.personaInfo}>
              <h3 style={styles.personaTitle}>Contractor</h3>
              <div style={styles.personaValueProp}>Grow Your Business</div>
              <ul style={styles.personaList}>
                <li style={styles.personaListItem}>
                  <span style={styles.goldCheck}>✓</span> Get more leads & projects
                </li>
                <li style={styles.personaListItem}>
                  <span style={styles.goldCheck}>✓</span> Provide accurate estimates
                </li>
                <li style={styles.personaListItem}>
                  <span style={styles.goldCheck}>✓</span> Track your work easily
                </li>
              </ul>
              <button onClick={handleJoinContractor} style={styles.personaBtnNavy}>
                Join as Contractor
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}>
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>

          {/* Card B: Customer */}
          <div style={styles.personaCard}>
            <div style={styles.personaImgWrap}>
              <img src={CUSTOMER_PERSONA_IMG} alt="Homeowner Customer" style={styles.personaImg} />
            </div>
            <div style={styles.personaInfo}>
              <h3 style={styles.personaTitle}>Customer</h3>
              <div style={styles.personaValueProp}>Plan Your Deck Restoration</div>
              <ul style={styles.personaList}>
                <li style={styles.personaListItem}>
                  <span style={styles.goldCheck}>✓</span> Get instant estimates
                </li>
                <li style={styles.personaListItem}>
                  <span style={styles.goldCheck}>✓</span> Explore trusted contractors
                </li>
                <li style={styles.personaListItem}>
                  <span style={styles.goldCheck}>✓</span> Track your requests
                </li>
              </ul>
              <button onClick={handleLaunchEstimator} style={styles.personaBtnNavy}>
                Get Started
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}>
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. OUR PROJECTS (SHOWCASE & CAROUSEL) */}
      {/* ======================================================== */}
      <section style={styles.projectsSection} id="projects">
        <div style={styles.sectionHeaderWrap}>
          <div style={styles.accentDivider} />
          <h2 style={styles.sectionTitle}>Our Projects</h2>
          <div style={styles.accentDivider} />
        </div>
        <p style={styles.sectionSubtitle}>Quality work. Lasting results.</p>

        <div style={styles.carouselOuterWrap}>
          {/* Left Arrow Button */}
          <button
            onClick={handlePrevProject}
            style={styles.carouselArrowBtn}
            aria-label="Previous Projects"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Cards Track */}
          <div className="landing-projects-grid" style={styles.projectCardsGrid}>
            {PROJECTS_DATA.slice(carouselIndex, carouselIndex + 4).map((p) => (
              <div
                key={p.id}
                style={styles.projectCard}
                onClick={() => setActiveProjectModal(p)}
              >
                <div style={styles.projectImgWrap}>
                  <img src={p.image} alt={p.title} style={styles.projectCoverImg} />
                  <div style={styles.projectImgOverlay}>
                    <span style={styles.viewProjectPill}>View Details</span>
                  </div>
                </div>
                <div style={styles.projectCardBody}>
                  <h4 style={styles.projectCardTitle}>{p.title}</h4>
                  <div style={styles.projectCardMeta}>{p.type}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={handleNextProject}
            style={styles.carouselArrowBtn}
            aria-label="Next Projects"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Carousel Pagination Dots */}
        <div style={styles.carouselDotsRow}>
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              onClick={() => setCarouselIndex(idx)}
              style={{
                ...styles.carouselDot,
                ...(carouselIndex === idx ? styles.carouselDotActive : {}),
              }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. OUR PRODUCTS & SERVICES */}
      {/* ======================================================== */}
      <section style={styles.productsSection} id="products">
        <div style={styles.sectionHeaderWrap}>
          <div style={styles.accentDivider} />
          <h2 style={styles.sectionTitle}>Our Products & Services</h2>
          <div style={styles.accentDivider} />
        </div>
        <p style={styles.sectionSubtitle}>
          Everything you need for a durable and beautiful deck.
        </p>

        <div className="landing-products-grid" style={styles.productsGrid5}>
          {PRODUCTS_DATA.map((item) => (
            <div key={item.id} style={styles.productCard}>
              <div style={styles.productImgFrame}>
                <img src={item.image} alt={item.title} style={styles.productImg} />
              </div>
              <div style={styles.productCardCaption}>
                <h4 style={styles.productTitle}>{item.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. READY TO RESTORE YOUR DECK? (PRE-FOOTER CTA BANNER) */}
      {/* ======================================================== */}
      <section style={styles.ctaBannerSection}>
        <div className="landing-cta-banner" style={styles.ctaBannerContainer}>
          <div className="landing-cta-banner-left" style={styles.ctaBannerLeft}>
            <div style={styles.ctaHomeIconCircle}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <h3 style={styles.ctaBannerTitle}>Ready to Restore Your Deck?</h3>
              <p style={styles.ctaBannerSubtitle}>
                Try our Deck Estimator now and get started in seconds.
              </p>
            </div>
          </div>

          <button onClick={handleLaunchEstimator} style={styles.ctaBannerBtnAmber}>
            Try Now
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}>
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. FOOTER */}
      {/* ======================================================== */}
      <footer style={styles.footer} id="contact">
        <div style={styles.footerContainer}>
          {/* Logo */}
          <div style={styles.footerBrandWrap}>
            <img src={mainLogo} alt="Deck Restoration Plus" style={styles.footerLogoImg} />
          </div>

          {/* Links */}
          <div style={styles.footerLinksWrap}>
            <Link to="/guidelines" style={styles.footerLink}>Contractor Guidelines</Link>
            <span style={styles.footerLinkSep}>|</span>
            <button
              onClick={() => alert('Deck Restoration Plus Compliance: Fully licensed, EPA Lead-Safe certified, and compliant with all local building and environmental regulations.')}
              style={styles.footerLinkBtn}
            >
              Compliance
            </button>
            <span style={styles.footerLinkSep}>|</span>
            <button
              onClick={() => alert('Deck Restoration Plus Terms of Service: Standard deck estimates are advisory based on initial user inputs. Onsite inspection validates final scope and pricing.')}
              style={styles.footerLinkBtn}
            >
              Terms
            </button>
          </div>

          {/* Social Icons */}
          <div style={styles.footerSocialWrap}>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" style={styles.socialIconLink} aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" style={styles.socialIconLink} aria-label="YouTube">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z" />
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={styles.socialIconLink} aria-label="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div style={styles.footerBottomBar}>
          © 2026 Deck Restoration Plus, LLC. All rights reserved.
        </div>
      </footer>

      {/* ======================================================== */}
      {/* PROJECT PREVIEW MODAL */}
      {/* ======================================================== */}
      {activeProjectModal && (
        <div style={styles.modalOverlay} onClick={() => setActiveProjectModal(null)}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setActiveProjectModal(null)} style={styles.modalCloseBtn}>✕</button>
            <div style={styles.modalImgWrap}>
              <img src={activeProjectModal.image} alt={activeProjectModal.title} style={styles.modalImg} />
            </div>
            <div style={styles.modalBody}>
              <span style={styles.modalTag}>{activeProjectModal.type}</span>
              <h3 style={styles.modalTitle}>{activeProjectModal.title}</h3>
              <p style={styles.modalDesc}>{activeProjectModal.desc}</p>
              <div style={styles.modalMetaRow}>
                <span>📍 Location: <strong>{activeProjectModal.location}</strong></span>
                <span>⏱ Duration: <strong>{activeProjectModal.duration}</strong></span>
              </div>
              <div style={styles.modalActionRow}>
                <button
                  onClick={() => {
                    setActiveProjectModal(null);
                    handleLaunchEstimator();
                  }}
                  style={styles.modalCtaBtn}
                >
                  Estimate a Similar Deck Project →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ======================================================================
// STYLES OBJECT (Pixel-perfect matching of screenshot themes & layouts)
// ======================================================================
const styles = {
  pageWrap: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    minHeight: '100vh',
    overflowX: 'hidden',
  },

  // 1. Navbar
  navbar: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #E2E8F0',
    padding: '10px 0',
  },
  navContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
  },
  logoImg: {
    height: '42px',
    width: 'auto',
    objectFit: 'contain',
  },
  navCenterPills: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#F8FAFC',
    padding: '4px 6px',
    borderRadius: '9999px',
    border: '1px solid #E2E8F0',
  },
  navPillBtn: {
    background: 'transparent',
    border: 'none',
    padding: '8px 18px',
    borderRadius: '9999px',
    fontSize: '13.5px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.18s ease-in-out',
  },
  navPillBtnActive: {
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.18)',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userProfileWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  notificationBtn: {
    background: '#F1F5F9',
    border: 'none',
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  notifBadge: {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: '800',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #FFFFFF',
  },
  userCapsuleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '9999px',
    padding: '4px 12px 4px 5px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  avatarCircle: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#D97706',
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userNameText: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#0F172A',
  },
  userDropdownMenu: {
    position: 'absolute',
    top: '44px',
    right: 0,
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    width: '200px',
    padding: '8px',
    zIndex: 150,
  },
  userDropdownHeader: {
    padding: '8px 10px 10px 10px',
    borderBottom: '1px solid #F1F5F9',
    marginBottom: '6px',
  },
  roleTag: {
    display: 'inline-block',
    fontSize: '10px',
    textTransform: 'uppercase',
    fontWeight: '800',
    backgroundColor: '#ECFDF5',
    color: '#059669',
    padding: '2px 6px',
    borderRadius: '4px',
    marginTop: '4px',
  },
  dropdownItemBtn: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '8px 10px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease',
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #FECACA',
    color: '#DC2626',
    borderRadius: '9999px',
    padding: '7px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  guestActionWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  loginBtn: {
    textDecoration: 'none',
    padding: '8px 18px',
    borderRadius: '9999px',
    fontSize: '13.5px',
    fontWeight: '600',
    color: '#0F172A',
    backgroundColor: '#F1F5F9',
    transition: 'background-color 0.15s ease',
  },
  registerBtn: {
    textDecoration: 'none',
    padding: '8px 18px',
    borderRadius: '9999px',
    fontSize: '13.5px',
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: '#0F172A',
    transition: 'background-color 0.15s ease',
  },
  mobileHamburgerBtn: {
    display: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  mobileMenuDrawer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '16px 24px',
    backgroundColor: '#FFFFFF',
    borderTop: '1px solid #F1F5F9',
  },
  mobileMenuLink: {
    background: 'none',
    border: 'none',
    textAlign: 'left',
    padding: '8px 0',
    fontSize: '15px',
    fontWeight: '600',
    color: '#0F172A',
    cursor: 'pointer',
  },

  // 2. Hero Section
  heroSection: {
    position: 'relative',
    padding: '48px 0 100px 0',
    overflow: 'hidden',
  },
  heroBackdropWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  heroBackdropImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: 'brightness(1.05) saturate(1.1)',
  },
  heroBackdropOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 45%, rgba(255,255,255,0.2) 100%)',
  },
  heroContentContainer: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'grid',
    gridTemplateColumns: '1.15fr 0.85fr',
    alignItems: 'center',
    gap: '32px',
  },
  heroLeftCol: {
    paddingRight: '16px',
  },
  heroTitle: {
    fontSize: '52px',
    lineHeight: '1.12',
    fontWeight: '900',
    letterSpacing: '-0.03em',
    color: '#0F172A',
    marginBottom: '16px',
  },
  heroTitleAccent: {
    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    fontSize: '17px',
    lineHeight: '1.6',
    color: '#475569',
    maxWidth: '520px',
    marginBottom: '28px',
  },
  heroCtaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    flexWrap: 'wrap',
    marginBottom: '32px',
  },
  heroPrimaryBtn: {
    backgroundColor: '#F59E0B',
    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '9999px',
    padding: '13px 28px',
    fontSize: '15px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(217, 119, 6, 0.35)',
    transition: 'all 0.18s ease-in-out',
  },
  heroSecondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    color: '#0F172A',
    border: '1.5px solid #CBD5E1',
    borderRadius: '9999px',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
    transition: 'all 0.18s ease-in-out',
  },
  heroTrustBadgesRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '22px',
    flexWrap: 'wrap',
  },
  trustBadgeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
  },
  trustIconCircle: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: '1px solid #CBD5E1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRightCol: {
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
  },
  heroPersonaCard: {
    position: 'relative',
    maxWidth: '420px',
    borderRadius: '24px',
    overflow: 'visible',
  },
  heroPersonaImg: {
    width: '100%',
    height: '420px',
    objectFit: 'cover',
    borderRadius: '24px',
    boxShadow: '0 20px 45px rgba(15, 23, 42, 0.16)',
    display: 'block',
  },
  heroFloatingBucket: {
    position: 'absolute',
    bottom: '-16px',
    right: '-16px',
    backgroundColor: '#0F172A',
    border: '3px solid #F59E0B',
    borderRadius: '16px',
    padding: '12px 18px',
    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.25)',
  },
  bucketInner: {
    textAlign: 'center',
  },
  bucketBrandText: {
    fontSize: '14px',
    fontWeight: '900',
    color: '#F59E0B',
    letterSpacing: '0.04em',
  },
  bucketSubText: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#E2E8F0',
  },

  // 3. Estimator Floating Widget
  estimatorWidgetWrapper: {
    maxWidth: '1280px',
    margin: '-56px auto 56px auto',
    padding: '0 24px',
    position: 'relative',
    zIndex: 10,
  },
  estimatorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08), 0 4px 16px rgba(15, 23, 42, 0.04)',
    border: '1px solid #E2E8F0',
    padding: '28px 32px',
    display: 'grid',
    gridTemplateColumns: '1fr 1.35fr 1fr',
    gap: '28px',
    alignItems: 'center',
  },
  estColOverview: {
    borderRight: '1px solid #F1F5F9',
    paddingRight: '20px',
  },
  estIconBox: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    backgroundColor: '#FEF3C7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
  },
  estTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: '6px',
  },
  estSubtitle: {
    fontSize: '13px',
    color: '#64748B',
    lineHeight: '1.5',
    marginBottom: '14px',
  },
  estChecklist: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 16px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  estCheckItem: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#334155',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  goldCheck: {
    color: '#D97706',
    fontWeight: '800',
    fontSize: '14px',
  },
  calculateNowBtn: {
    backgroundColor: '#F59E0B',
    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '9999px',
    padding: '10px 20px',
    fontSize: '13.5px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    boxShadow: '0 6px 16px rgba(217, 119, 6, 0.3)',
    transition: 'all 0.15s ease',
  },
  estColForm: {
    padding: '0 8px',
  },
  estFormHeader: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14.5px',
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: '16px',
  },
  formRow3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  inputLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
  },
  selectWrap: {
    position: 'relative',
  },
  selectField: {
    width: '100%',
    padding: '8px 10px',
    backgroundColor: '#F8FAFC',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#0F172A',
    outline: 'none',
    cursor: 'pointer',
  },
  getEstimateSubmitBtn: {
    width: '100%',
    backgroundColor: '#0F172A',
    background: 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 18px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 16px rgba(30, 58, 138, 0.28)',
    transition: 'all 0.15s ease',
  },
  estColCost: {
    backgroundColor: '#F0F7FF',
    border: '1px solid #DBEAFE',
    borderRadius: '18px',
    padding: '24px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  costCoinIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#FEF3C7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  estimatedCostHeader: {
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#1E3A8A',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: '4px',
  },
  estimatedCostValue: {
    fontSize: '26px',
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: '-0.02em',
    marginBottom: '2px',
  },
  approximateRangeText: {
    fontSize: '12px',
    color: '#64748B',
    marginBottom: '12px',
  },
  estDisclaimerNote: {
    fontSize: '11px',
    color: '#64748B',
    lineHeight: '1.4',
    borderTop: '1px solid #E2E8F0',
    paddingTop: '8px',
    width: '100%',
  },

  // 4. Built For Everyone Section
  builtSection: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '48px 24px',
  },
  sectionHeaderWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '6px',
  },
  accentDivider: {
    width: '60px',
    height: '2px',
    backgroundColor: '#F59E0B',
    borderRadius: '2px',
  },
  sectionTitle: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: '-0.02em',
  },
  sectionSubtitle: {
    fontSize: '15px',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: '36px',
  },
  dualCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
  },
  personaCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: '20px',
    border: '1px solid #E2E8F0',
    overflow: 'hidden',
    display: 'grid',
    gridTemplateColumns: '0.9fr 1.1fr',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  personaImgWrap: {
    height: '100%',
    minHeight: '220px',
  },
  personaImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  personaInfo: {
    padding: '24px 22px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  personaTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: '4px',
  },
  personaValueProp: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: '14px',
  },
  personaList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 18px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  personaListItem: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#334155',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  personaBtnNavy: {
    alignSelf: 'flex-start',
    backgroundColor: '#0F172A',
    background: 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '9999px',
    padding: '10px 22px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.18)',
    transition: 'all 0.15s ease',
  },

  // 5. Our Projects Carousel Section
  projectsSection: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '48px 24px',
  },
  carouselOuterWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    position: 'relative',
    marginBottom: '20px',
  },
  carouselArrowBtn: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.15s ease',
  },
  projectCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    width: '100%',
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    overflow: 'hidden',
    boxShadow: '0 6px 18px rgba(15, 23, 42, 0.04)',
    cursor: 'pointer',
    transition: 'all 0.18s ease-in-out',
  },
  projectImgWrap: {
    position: 'relative',
    height: '160px',
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  projectCoverImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
  projectImgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.2s ease',
  },
  viewProjectPill: {
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    fontSize: '11px',
    fontWeight: '700',
    padding: '6px 12px',
    borderRadius: '9999px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  projectCardBody: {
    padding: '14px 14px 16px 14px',
  },
  projectCardTitle: {
    fontSize: '14.5px',
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: '4px',
  },
  projectCardMeta: {
    fontSize: '12px',
    color: '#64748B',
  },
  carouselDotsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
  },
  carouselDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#CBD5E1',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  carouselDotActive: {
    backgroundColor: '#1E3A8A',
    width: '22px',
    borderRadius: '9999px',
  },

  // 6. Our Products & Services Section
  productsSection: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '48px 24px',
  },
  productsGrid5: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '16px',
  },
  productCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    padding: '16px 12px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
  },
  productImgFrame: {
    width: '100%',
    height: '110px',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    padding: '6px',
  },
  productCardCaption: {
    width: '100%',
  },
  productTitle: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#0F172A',
  },

  // 7. Ready To Restore CTA Banner
  ctaBannerSection: {
    maxWidth: '1280px',
    margin: '32px auto 56px auto',
    padding: '0 24px',
  },
  ctaBannerContainer: {
    background: 'linear-gradient(135deg, #0B2545 0%, #133E87 50%, #1E3A8A 100%)',
    borderRadius: '24px',
    padding: '28px 36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
    boxShadow: '0 16px 36px rgba(19, 62, 135, 0.25)',
  },
  ctaBannerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
  },
  ctaHomeIconCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    border: '1.5px solid rgba(255, 255, 255, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ctaBannerTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: '4px',
  },
  ctaBannerSubtitle: {
    fontSize: '14px',
    color: '#CBD5E1',
  },
  ctaBannerBtnAmber: {
    backgroundColor: '#F59E0B',
    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '9999px',
    padding: '12px 28px',
    fontSize: '15px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.15s ease',
  },

  // 8. Footer
  footer: {
    backgroundColor: '#0A192F',
    color: '#94A3B8',
    padding: '36px 0 24px 0',
    borderTop: '2px solid #1E293B',
  },
  footerContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
    flexWrap: 'wrap',
    paddingBottom: '24px',
    borderBottom: '1px solid #1E293B',
  },
  footerBrandWrap: {
    display: 'flex',
    alignItems: 'center',
  },
  footerLogoImg: {
    height: '38px',
    width: 'auto',
    filter: 'brightness(1.15)',
  },
  footerLinksWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  footerLink: {
    color: '#CBD5E1',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'color 0.15s ease',
  },
  footerLinkBtn: {
    background: 'none',
    border: 'none',
    color: '#CBD5E1',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    padding: 0,
    transition: 'color 0.15s ease',
  },
  footerLinkSep: {
    color: '#475569',
    fontSize: '12px',
  },
  footerSocialWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  socialIconLink: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
  },
  footerBottomBar: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '16px 24px 0 24px',
    textAlign: 'right',
    fontSize: '12px',
    color: '#64748B',
  },

  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '20px',
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: '20px',
    maxWidth: '560px',
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    border: 'none',
    fontSize: '16px',
    fontWeight: '800',
    cursor: 'pointer',
    zIndex: 10,
  },
  modalImgWrap: {
    width: '100%',
    height: '240px',
  },
  modalImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  modalBody: {
    padding: '22px 24px',
  },
  modalTag: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '700',
    color: '#1E3A8A',
    backgroundColor: '#EFF6FF',
    padding: '3px 10px',
    borderRadius: '9999px',
    marginBottom: '8px',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: '8px',
  },
  modalDesc: {
    fontSize: '13.5px',
    color: '#475569',
    lineHeight: '1.6',
    marginBottom: '16px',
  },
  modalMetaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12.5px',
    color: '#334155',
    borderTop: '1px solid #F1F5F9',
    borderBottom: '1px solid #F1F5F9',
    padding: '10px 0',
    marginBottom: '18px',
  },
  modalActionRow: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  modalCtaBtn: {
    backgroundColor: '#F59E0B',
    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '9999px',
    padding: '10px 22px',
    fontSize: '13.5px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};

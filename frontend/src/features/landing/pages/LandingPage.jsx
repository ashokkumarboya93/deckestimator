// ====================================================================
// Deck Estimator — Premium Full-Screen Landing Page
// Screen-Fitting Long Landing Page (Viewport Proportional Sections)
// Matches Reference Specification Design with Rich Animations
// ====================================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

// Image Assets
import logoImg from '../../../assets/images/landing/landing_logo.png';
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

// Projects
import proj1Img from '../../../assets/images/landing/project_1_modern.png';
import proj2Img from '../../../assets/images/landing/project_2_classic.png';
import proj3Img from '../../../assets/images/landing/project_3_poolside.png';
import proj4Img from '../../../assets/images/landing/project_4_backyard.png';

// CTA Background
import ctaDeckBgImg from '../../../assets/images/landing/cta_deck_bg.png';

export default function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Active navigation tracking for smooth scroll
  const [activeNav, setActiveNav] = useState('Home');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Testimonials Data
  const testimonials = [
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

  const handleNextTestimonial = () => {
    setActiveTestimonialIdx((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrevTestimonial = () => {
    setActiveTestimonialIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length);
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
      `}</style>

      {/* ======================================================== */}
      {/* 1. TOP NAVBAR / HEADER */}
      {/* ======================================================== */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          {/* Logo */}
          <Link to="/" style={styles.logoLink}>
            <img src={logoImg} alt="DECK Plus Restoration" style={styles.logoImg} />
          </Link>

          {/* Navigation Links */}
          <nav style={styles.navMenu}>
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
              >
                Dashboard
              </button>
            ) : (
              <Link to="/login" style={styles.signInBtn}>
                Sign In
              </Link>
            )}

            <button onClick={handleLaunchEstimator} style={styles.getFreeEstimateBtn} className="btn-hover">
              Get Free Estimate →
            </button>
          </div>
        </div>

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
            <button onClick={() => setSearchOpen(false)} style={styles.searchCloseBtn}>✕</button>
          </div>
        )}
      </header>

      {/* ======================================================== */}
      {/* 2. HERO SECTION (FULL SCREEN) */}
      {/* ======================================================== */}
      <section id="hero" style={styles.heroSection}>
        <div style={styles.heroContainer}>
          {/* Left Column: Heading, Subhead, CTAs & Trust Badges */}
          <div style={styles.heroLeft}>
            {/* Tag Badge */}
            <div style={styles.tagBadge}>
              <span style={{ fontSize: '14px', marginRight: '6px' }}>🪵</span>
              <span>Premium Deck Restoration</span>
            </div>

            {/* Headline */}
            <h1 style={styles.heroHeading}>
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

          {/* Right Column: Hero Wizard Portrait & Floating Sticker */}
          <div style={styles.heroRight}>
            <div style={styles.heroPortraitContainer}>
              <img
                src={wizardHeroImg}
                alt="Deck Restoration Plus Master Contractor with Deck Finish"
                style={styles.heroPortraitImg}
              />

              {/* Floating Wooden Sticker Badge */}
              <div style={styles.floatingWoodSticker}>
                <div style={styles.woodStickerSunburst}>☀</div>
                <div style={styles.woodStickerTextTop}>Bring Your Deck</div>
                <div style={styles.woodStickerTextBottom}>Back to Life!</div>
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
          <div style={styles.calcBox} className="hover-card">
            {/* Left: Deck Image Visual */}
            <div style={styles.calcVisualCol}>
              <img
                src={calculatorDeckImg}
                alt="Beautiful Restored Deck"
                style={styles.calcDeckImg}
              />
              <div style={styles.calcImageBadge}>
                <span>✓ Guaranteed Estimates</span>
              </div>
            </div>

            {/* Middle: Controls Form */}
            <div style={styles.calcFormCol}>
              <div style={styles.calcHeaderRow}>
                <span style={{ fontSize: '24px', marginRight: '8px' }}>🧮</span>
                <div>
                  <h3 style={styles.calcTitle}>Deck Restoration Calculator</h3>
                  <p style={styles.calcSub}>Get an instant, accurate estimate for your deck restoration project.</p>
                </div>
              </div>

              <div style={styles.calcInputsRow}>
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
                <span style={{ marginRight: '6px' }}>🧮</span>
                Calculate Estimate →
              </button>
            </div>

            {/* Right: Estimated Cost Card */}
            <div style={styles.calcResultCol}>
              <div style={styles.costBadgeHeader}>
                <span style={{ marginRight: '6px' }}>🏷️</span>
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
          <div style={styles.statsBar}>
            <div style={styles.statItem}>
              <span style={styles.statIcon}>👥</span>
              <div>
                <div style={styles.statNumber}>1,500+</div>
                <div style={styles.statLabel}>Decks Restored</div>
              </div>
            </div>

            <div style={styles.statDivider} />

            <div style={styles.statItem}>
              <span style={styles.statIcon}>⭐</span>
              <div>
                <div style={styles.statNumber}>4.9/5</div>
                <div style={styles.statLabel}>Customer Rating</div>
              </div>
            </div>

            <div style={styles.statDivider} />

            <div style={styles.statItem}>
              <span style={styles.statIcon}>📅</span>
              <div>
                <div style={styles.statNumber}>10+ Years</div>
                <div style={styles.statLabel}>of Experience</div>
              </div>
            </div>

            <div style={styles.statDivider} />

            <div style={styles.statItem}>
              <span style={styles.statIcon}>🛡️</span>
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
      <section id="services" style={styles.screenSection}>
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

        <div style={styles.servicesGrid}>
          {/* Service Card 1: Deck Cleaning */}
          <div style={styles.serviceCard} className="hover-card hover-zoom">
            <div style={styles.serviceImgWrapper}>
              <img src={cleaningImg} alt="Deck Cleaning Process" style={styles.serviceImg} />
            </div>
            <div style={styles.serviceContent}>
              <div style={styles.serviceIconPill}>
                <span style={{ fontSize: '18px' }}>💧</span>
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
              <img src={restorationImg} alt="Deck Restoration and Refinishing" style={styles.serviceImg} />
            </div>
            <div style={styles.serviceContent}>
              <div style={{ ...styles.serviceIconPill, backgroundColor: '#FEF3C7', color: '#B45309' }}>
                <span style={{ fontSize: '18px' }}>🛠️</span>
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
              <img src={protectionImg} alt="Deck Protection with Protective Sealers" style={styles.serviceImg} />
            </div>
            <div style={styles.serviceContent}>
              <div style={{ ...styles.serviceIconPill, backgroundColor: '#E0F2FE', color: '#0369A1' }}>
                <span style={{ fontSize: '18px' }}>🛡️</span>
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
      <section id="products" style={styles.screenSection}>
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

        <div style={styles.productsContainer}>
          {/* Left Grid: 5 Products */}
          <div style={styles.productsGrid}>
            <div style={styles.productCard} className="hover-card">
              <div style={styles.productImgFrame}>
                <img src={prod1Img} alt="Deck Finishes" style={styles.productImg} />
              </div>
              <div style={styles.productTitle}>Deck Finishes</div>
            </div>

            <div style={styles.productCard} className="hover-card">
              <div style={styles.productImgFrame}>
                <img src={prod2Img} alt="Restoration Sealers" style={styles.productImg} />
              </div>
              <div style={styles.productTitle}>Restoration Sealers</div>
            </div>

            <div style={styles.productCard} className="hover-card">
              <div style={styles.productImgFrame}>
                <img src={prod3Img} alt="Premium Deck Stains" style={styles.productImg} />
              </div>
              <div style={styles.productTitle}>Premium Deck Stains</div>
            </div>

            <div style={styles.productCard} className="hover-card">
              <div style={styles.productImgFrame}>
                <img src={prod4Img} alt="Deck Cleaners" style={styles.productImg} />
              </div>
              <div style={styles.productTitle}>Deck Cleaners</div>
            </div>

            <div style={styles.productCard} className="hover-card">
              <div style={styles.productImgFrame}>
                <img src={prod5Img} alt="Professional Tools" style={styles.productImg} />
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
                  <span style={styles.promoCheck}>✓</span> Weather Resistant
                </li>
                <li style={styles.promoListItem}>
                  <span style={styles.promoCheck}>✓</span> Long-Lasting Protection
                </li>
                <li style={styles.promoListItem}>
                  <span style={styles.promoCheck}>✓</span> Enhances Natural Beauty
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
      <section id="projects" style={styles.screenSection}>
        <div style={styles.projectsHeaderRow}>
          <div>
            <div style={styles.titleWithLines}>
              <span style={styles.woodAccentLine} />
              <h2 style={styles.sectionTitle}>Recent Deck Restoration Projects</h2>
              <span style={styles.woodAccentLine} />
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

        <div style={styles.projectsGrid}>
          {/* Project 1 */}
          <div style={styles.projectCard} className="hover-card" onClick={() => toggleProjectView(1)}>
            <div style={styles.projectImgBox}>
              <img src={proj1Img} alt="Modern Deck Revival" style={styles.projectImg} />
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
          <div style={styles.projectCard} className="hover-card" onClick={() => toggleProjectView(2)}>
            <div style={styles.projectImgBox}>
              <img src={proj2Img} alt="Classic Wood Restoration" style={styles.projectImg} />
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
          <div style={styles.projectCard} className="hover-card" onClick={() => toggleProjectView(3)}>
            <div style={styles.projectImgBox}>
              <img src={proj3Img} alt="Poolside Deck Upgrade" style={styles.projectImg} />
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
          <div style={styles.projectCard} className="hover-card" onClick={() => toggleProjectView(4)}>
            <div style={styles.projectImgBox}>
              <img src={proj4Img} alt="Backyard Deck Makeover" style={styles.projectImg} />
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
      <section id="how-it-works" style={styles.screenSection}>
        <div style={styles.sectionHeaderCentered}>
          <h2 style={styles.sectionTitle}>How It Works</h2>
          <p style={styles.sectionSubtitle}>A simple, hassle-free process to restore your deck.</p>
        </div>

        <div style={styles.stepsContainer}>
          {/* Step 1 */}
          <div style={styles.stepCard} className="hover-card">
            <div style={styles.stepHeaderRow}>
              <div style={styles.stepNumberBadge}>1</div>
              <span style={{ fontSize: '22px' }}>🧮</span>
            </div>
            <h4 style={styles.stepTitle}>Get an Estimate</h4>
            <p style={styles.stepDesc}>Use our calculator or request an official contractor quote in seconds.</p>
          </div>

          <div style={styles.stepArrow}>→</div>

          {/* Step 2 */}
          <div style={styles.stepCard} className="hover-card">
            <div style={styles.stepHeaderRow}>
              <div style={styles.stepNumberBadge}>2</div>
              <span style={{ fontSize: '22px' }}>📅</span>
            </div>
            <h4 style={styles.stepTitle}>Schedule Service</h4>
            <p style={styles.stepDesc}>Choose an inspection and service schedule that works best for you.</p>
          </div>

          <div style={styles.stepArrow}>→</div>

          {/* Step 3 */}
          <div style={styles.stepCard} className="hover-card">
            <div style={styles.stepHeaderRow}>
              <div style={styles.stepNumberBadge}>3</div>
              <span style={{ fontSize: '22px' }}>🖌️</span>
            </div>
            <h4 style={styles.stepTitle}>We Restore Your Deck</h4>
            <p style={styles.stepDesc}>Our licensed specialists deep clean, refinish, and protect every board.</p>
          </div>

          <div style={styles.stepArrow}>→</div>

          {/* Step 4 */}
          <div style={styles.stepCard} className="hover-card">
            <div style={styles.stepHeaderRow}>
              <div style={styles.stepNumberBadge}>4</div>
              <span style={{ fontSize: '22px' }}>☕</span>
            </div>
            <h4 style={styles.stepTitle}>Enjoy Your Space</h4>
            <p style={styles.stepDesc}>A beautiful, weather-resistant outdoor space built to last for years.</p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. WHAT OUR CUSTOMERS SAY (TESTIMONIALS) */}
      {/* ======================================================== */}
      <section style={styles.screenSection}>
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

        <div style={styles.testimonialsGrid}>
          {testimonials.map((t, idx) => (
            <div key={idx} style={styles.testimonialCard} className="hover-card">
              <div style={styles.testimonialUserRow}>
                <img src={t.avatar} alt={t.name} style={styles.testimonialAvatar} />
                <div>
                  <h4 style={styles.testimonialName}>{t.name}</h4>
                  <span style={styles.testimonialRole}>{t.role}</span>
                </div>
              </div>
              <div style={styles.starsRow}>
                {'★'.repeat(t.stars)}
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
        <div style={styles.ctaBannerContainer}>
          <img src={ctaDeckBgImg} alt="Deck background" style={styles.ctaBgImg} />
          <div style={styles.ctaDarkOverlay} />
          <div style={styles.ctaContent}>
            <h2 style={styles.ctaHeadline}>Ready to Restore Your Deck?</h2>
            <p style={styles.ctaSubhead}>
              Get a fast, accurate estimate and bring your outdoor space back to life.
            </p>
            <button onClick={handleLaunchEstimator} style={styles.ctaBannerBtn} className="btn-hover">
              <span style={{ marginRight: '8px' }}>🧮</span>
              Try Deck Calculator Now →
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 10. OFFICIAL FOOTER */}
      {/* ======================================================== */}
      <footer id="footer" style={styles.footer}>
        <div style={styles.footerContainer}>
          {/* Col 1: Brand & Tagline */}
          <div style={styles.footerColBrand}>
            <Link to="/" style={styles.footerLogoLink}>
              <img src={logoImg} alt="Deck Restoration Plus" style={styles.footerLogoImg} />
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
              <span style={styles.footerContactIcon}>📞</span>
              <a href="tel:8664403325" style={styles.footerContactLink}>
                (866) 440-DECK (3325)
              </a>
            </div>
            <div style={styles.footerContactRow}>
              <span style={styles.footerContactIcon}>✉</span>
              <a href="mailto:estimates@deckrestorationplus.com" style={styles.footerContactLink}>
                estimates@deckrestorationplus.com
              </a>
            </div>
            <div style={styles.footerContactRow}>
              <span style={styles.footerContactIcon}>📍</span>
              <span style={styles.footerContactText}>
                Serving Your Area & Nationally
              </span>
            </div>

            {/* Social Icons */}
            <div style={styles.socialRow}>
              <a href="#facebook" style={styles.socialIcon}>f</a>
              <a href="#instagram" style={styles.socialIcon}>📷</a>
              <a href="#youtube" style={styles.socialIcon}>▶</a>
              <a href="#linkedin" style={styles.socialIcon}>in</a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div style={styles.footerBottomBar}>
          <div style={styles.footerBottomInner}>
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
    overflowX: 'hidden',
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
    minHeight: '88vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px 60px 24px',
    position: 'relative',
    background: 'radial-gradient(circle at 85% 40%, rgba(224, 122, 43, 0.06) 0%, transparent 60%), #F8FAFC',
  },
  heroContainer: {
    maxWidth: '1360px',
    width: '100%',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1.05fr 0.95fr',
    alignItems: 'center',
    gap: '40px',
  },
  heroLeft: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
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
  heroRight: {
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
  },
  heroPortraitContainer: {
    position: 'relative',
    maxWidth: '520px',
    width: '100%',
  },
  heroPortraitImg: {
    width: '100%',
    height: 'auto',
    borderRadius: '24px',
    boxShadow: '0 20px 45px -10px rgba(15, 44, 89, 0.18)',
    display: 'block',
  },
  floatingWoodSticker: {
    position: 'absolute',
    top: '25px',
    right: '-15px',
    backgroundColor: '#78350F',
    backgroundImage: 'linear-gradient(135deg, #92400E 0%, #78350F 100%)',
    color: '#FEF3C7',
    padding: '12px 22px',
    borderRadius: '16px',
    boxShadow: '0 12px 25px rgba(0, 0, 0, 0.35)',
    border: '2px solid #FCD34D',
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

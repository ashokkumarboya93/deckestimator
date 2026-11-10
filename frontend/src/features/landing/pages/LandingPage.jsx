import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

// Image assets extracted directly from specification design (enhanced 2x resolution)
import logoImg from '../../../assets/images/landing/landing_logo.png';
import heroContractorImg from '../../../assets/images/landing/hero_contractor_deck.png';
import contractorWorkerImg from '../../../assets/images/landing/contractor_worker.png';
import customerCoupleImg from '../../../assets/images/landing/customer_couple.png';

import proj1Img from '../../../assets/images/landing/project_1_modern.png';
import proj2Img from '../../../assets/images/landing/project_2_classic.png';
import proj3Img from '../../../assets/images/landing/project_3_poolside.png';
import proj4Img from '../../../assets/images/landing/project_4_backyard.png';

import prod1Img from '../../../assets/images/landing/product_1_finishes.png';
import prod2Img from '../../../assets/images/landing/product_2_sealers.png';
import prod3Img from '../../../assets/images/landing/product_3_stains.png';
import prod4Img from '../../../assets/images/landing/product_4_cleaners.png';
import prod5Img from '../../../assets/images/landing/product_5_tools.png';
import ctaDeckBgImg from '../../../assets/images/landing/cta_deck_bg.png';

export default function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Quick Estimator State
  const [deckSize, setDeckSize] = useState('200');
  const [woodType, setWoodType] = useState('Composite');
  const [serviceType, setServiceType] = useState('Refinish');
  const [activeNav, setActiveNav] = useState('Home');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  // Dynamic cost calculation matching the design preview ($2,400 – $3,200 baseline for 200 sq ft)
  const calculateQuickEstimate = () => {
    const size = parseInt(deckSize, 10) || 200;
    let baseRate = 12; // default $/sq ft baseline range midpoint

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
    const low = Math.round((mid * 0.88) / 50) * 50;
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

  const projects = [
    {
      id: 1,
      title: 'Modern Deck Revival',
      type: 'Composite Deck • 320 sq ft',
      image: proj1Img,
      desc: 'Deep surface conditioning, eco-stripping of weathered polymer film, and rich protective sealant application.',
    },
    {
      id: 2,
      title: 'Classic Wood Restoration',
      type: 'Wood Deck • 280 sq ft',
      image: proj2Img,
      desc: 'Mechanical sanding, grain brightening, and penetrating oil finish restoring natural cedar warmth.',
    },
    {
      id: 3,
      title: 'Poolside Deck Upgrade',
      type: 'Composite Deck • 400 sq ft',
      image: proj3Img,
      desc: 'High-moisture zone protection, slip-resistant finish, and perimeter structural stabilization.',
    },
    {
      id: 4,
      title: 'Backyard Deck Makeover',
      type: 'Wood Deck • 350 sq ft',
      image: proj4Img,
      desc: 'Complete dual-coat semi-transparent stain, joist fungicide treatment, and railing refinishing.',
    },
  ];

  const products = [
    { name: 'Deck Finishes', image: prod1Img, desc: 'Commercial exterior wood sealers & clear protective coatings' },
    { name: 'Restoration Sealers', image: prod2Img, desc: 'Deep-penetrating natural grain preservative formulas' },
    { name: 'Premium Deck Stains', image: prod3Img, desc: 'UV-blocking semi-transparent & solid color pigments' },
    { name: 'Deck Cleaners', image: prod4Img, desc: 'Bio-wash wood brighteners & mildew stain removers' },
    { name: 'Professional Tools', image: prod5Img, desc: 'Contractor-grade applicator brushes, rollers & sprayer systems' },
  ];

  return (
    <div style={styles.pageContainer}>
      {/* ======================================================== */}
      {/* 1. TOP NAVBAR / HEADER */}
      {/* ======================================================== */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          {/* Logo */}
          <Link to="/" style={styles.logoLink}>
            <img src={logoImg} alt="DECK Plus Restoration" style={styles.logoImg} />
          </Link>

          {/* Center Navigation Links */}
          <nav style={styles.navMenu}>
            <button
              onClick={() => {
                setActiveNav('Home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={activeNav === 'Home' ? styles.navItemActive : styles.navItem}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px' }}>
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
              Home
            </button>
            <button
              onClick={() => {
                setActiveNav('Projects');
                document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={activeNav === 'Projects' ? styles.navItemActive : styles.navItem}
            >
              Projects
            </button>
            <button
              onClick={() => {
                setActiveNav('Products');
                document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={activeNav === 'Products' ? styles.navItemActive : styles.navItem}
            >
              Products
            </button>
            <button
              onClick={() => {
                setActiveNav('About');
                document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={activeNav === 'About' ? styles.navItemActive : styles.navItem}
            >
              About
            </button>
            <button
              onClick={() => {
                setActiveNav('Contact');
                document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={activeNav === 'Contact' ? styles.navItemActive : styles.navItem}
            >
              Contact
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div style={styles.headerRight}>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              title="Search Deck Estimator"
              style={styles.searchIconButton}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            <span style={styles.headerDivider} />

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

            <button onClick={handleLaunchEstimator} style={styles.getStartedBtn}>
              Get Started →
            </button>
          </div>
        </div>

        {/* Expandable Search Input */}
        {searchOpen && (
          <div style={styles.searchDropdownBar}>
            <input
              type="text"
              placeholder="Search projects, wood species, stains, deck services..."
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
      {/* 2. HERO SECTION */}
      {/* ======================================================== */}
      <section style={styles.heroSection}>
        <div style={styles.heroInner}>
          {/* Left Text & CTA */}
          <div style={styles.heroLeft}>
            <h1 style={styles.heroHeading}>
              Restore. Protect.{' '}
              <span style={styles.heroEnjoyWord}>Enjoy.</span>
            </h1>

            <p style={styles.heroSubtitle}>
              Premium deck restoration solutions for a longer-lasting, beautiful outdoor space.
            </p>

            <div style={styles.heroBtnGroup}>
              <button onClick={handleLaunchEstimator} style={styles.tryEstimatorBtn}>
                Try Deck Estimator →
              </button>
              <button
                onClick={() => document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth' })}
                style={styles.exploreProjectsBtn}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#162C46" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '7px' }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                Explore Projects
              </button>
            </div>

            {/* Trust Badges */}
            <div style={styles.trustBadgesRow}>
              <div style={styles.trustBadgeItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E3A8A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Trusted Quality</span>
              </div>

              <span style={styles.trustDivider} />

              <div style={styles.trustBadgeItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E3A8A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
                <span>Expert Support</span>
              </div>

              <span style={styles.trustDivider} />

              <div style={styles.trustBadgeItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E3A8A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>Fast Service</span>
              </div>
            </div>
          </div>

          {/* Right Visual: Contractor + Deck + Product Finish Can */}
          <div style={styles.heroRight}>
            <div style={styles.heroImageFrame}>
              <img
                src={heroContractorImg}
                alt="Deck Restoration Plus Contractor with Premium Finish"
                style={styles.heroImg}
              />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. QUICK DECK ESTIMATOR FLOATING CARD */}
        {/* ======================================================== */}
        <div style={styles.quickEstimatorCard}>
          {/* Col 1: Overview */}
          <div style={styles.qeCol1}>
            <div style={styles.qeIconSquare}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EAA428" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
              <h3 style={styles.qeTitle}>Deck Estimator</h3>
              <p style={styles.qeSubtitle}>Get an instant estimate for your deck restoration project.</p>
              <ul style={styles.qeChecklist}>
                <li style={styles.qeCheckItem}>
                  <span style={styles.qeCheckIcon}>✔</span> Select deck size & materials
                </li>
                <li style={styles.qeCheckItem}>
                  <span style={styles.qeCheckIcon}>✔</span> Choose services
                </li>
                <li style={styles.qeCheckItem}>
                  <span style={styles.qeCheckIcon}>✔</span> Get your estimate instantly
                </li>
              </ul>
            </div>
          </div>

          {/* Col 2: Inputs Form */}
          <div style={styles.qeCol2}>
            <div style={styles.qeHeaderRow}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#162C46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              </svg>
              <strong style={styles.qeFormHeader}>Estimate Your Deck Restoration</strong>
            </div>

            <div style={styles.qeInputsRow}>
              <div style={styles.qeInputGroup}>
                <label style={styles.qeInputLabel}>Deck Size</label>
                <select
                  value={deckSize}
                  onChange={(e) => setDeckSize(e.target.value)}
                  style={styles.qeSelect}
                >
                  <option value="200">200 sq ft</option>
                  <option value="320">320 sq ft</option>
                  <option value="400">400 sq ft</option>
                  <option value="550">550 sq ft</option>
                  <option value="800">800 sq ft</option>
                </select>
              </div>

              <div style={styles.qeInputGroup}>
                <label style={styles.qeInputLabel}>Wood Type</label>
                <select
                  value={woodType}
                  onChange={(e) => setWoodType(e.target.value)}
                  style={styles.qeSelect}
                >
                  <option value="Composite">Composite</option>
                  <option value="Pressure-Treated Pine">Pressure-Treated Pine</option>
                  <option value="Cedar">Cedar</option>
                  <option value="Redwood">Redwood</option>
                  <option value="Hardwood / Mahogany">Hardwood / Mahogany</option>
                </select>
              </div>

              <div style={styles.qeInputGroup}>
                <label style={styles.qeInputLabel}>Service Type</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  style={styles.qeSelect}
                >
                  <option value="Refinish">Refinish</option>
                  <option value="Clean & Seal">Clean & Seal</option>
                  <option value="Strip & Stain">Strip & Stain</option>
                  <option value="Full Restoration">Full Restoration</option>
                </select>
              </div>
            </div>

            <button onClick={handleLaunchEstimator} style={styles.qeSubmitBtn}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="8" y1="6" x2="16" y2="6" />
                <line x1="16" y1="14" x2="16" y2="18" />
              </svg>
              Get Estimate →
            </button>
          </div>

          {/* Col 3: Cost Output */}
          <div style={styles.qeCol3}>
            <div style={styles.qeCoinsIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#EAA428">
                <circle cx="12" cy="7" r="4" opacity="0.8" />
                <path d="M12 11c-4.42 0-8 1.79-8 4v2c0 2.21 3.58 4 8 4s8-1.79 8-4v-2c0-2.21-3.58-4-8-4z" />
              </svg>
            </div>
            <span style={styles.qeCostLabel}>Estimated Cost</span>
            <div style={styles.qePriceRange}>{calculateQuickEstimate()}</div>
            <span style={styles.qeApproxText}>(Approximate Range)</span>

            <div style={styles.qeNoticeBox}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>Final price may vary based on site conditions.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. BUILT FOR EVERYONE */}
      {/* ======================================================== */}
      <section style={styles.builtSection} id="about-section">
        <div style={styles.sectionHeaderCentered}>
          <div style={styles.titleWithLines}>
            <span style={styles.accentLineShort} />
            <h2 style={styles.sectionTitle}>Built for Everyone</h2>
            <span style={styles.accentLineShort} />
          </div>
          <p style={styles.sectionSubtitle}>
            Whether you're a contractor or a homeowner, we've got you covered.
          </p>
        </div>

        <div style={styles.builtCardsGrid}>
          {/* Card 1: Contractor */}
          <div style={styles.portalCard}>
            <div style={styles.portalCardImgFrame}>
              <img src={contractorWorkerImg} alt="Contractor Partner" style={styles.portalCardImg} />
            </div>
            <div style={styles.portalCardContent}>
              <div style={styles.portalCardHeader}>
                <div style={styles.portalIconYellow}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 18h20" />
                    <path d="M6 18v-4a6 6 0 0 1 12 0v4" />
                    <circle cx="12" cy="9" r="1" />
                  </svg>
                </div>
                <div>
                  <h3 style={styles.portalCardTitle}>Contractor</h3>
                  <p style={styles.portalCardSubtitle}>Grow Your Business</p>
                </div>
              </div>

              <ul style={styles.portalChecklist}>
                <li style={styles.portalCheckItem}>
                  <span style={styles.checkBulletGold}>✔</span> Get more leads & projects
                </li>
                <li style={styles.portalCheckItem}>
                  <span style={styles.checkBulletGold}>✔</span> Provide accurate estimates
                </li>
                <li style={styles.portalCheckItem}>
                  <span style={styles.checkBulletGold}>✔</span> Track your work easily
                </li>
              </ul>

              <Link to="/register?role=contractor" style={styles.portalActionBtn}>
                Join as Contractor →
              </Link>
            </div>
          </div>

          {/* Card 2: Customer */}
          <div style={styles.portalCard}>
            <div style={styles.portalCardImgFrame}>
              <img src={customerCoupleImg} alt="Homeowner Customer" style={styles.portalCardImg} />
            </div>
            <div style={styles.portalCardContent}>
              <div style={styles.portalCardHeader}>
                <div style={styles.portalIconBlue}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <div>
                  <h3 style={styles.portalCardTitle}>Customer</h3>
                  <p style={styles.portalCardSubtitleBlue}>Plan Your Deck Restoration</p>
                </div>
              </div>

              <ul style={styles.portalChecklist}>
                <li style={styles.portalCheckItem}>
                  <span style={styles.checkBulletGold}>✔</span> Get instant estimates
                </li>
                <li style={styles.portalCheckItem}>
                  <span style={styles.checkBulletGold}>✔</span> Explore trusted contractors
                </li>
                <li style={styles.portalCheckItem}>
                  <span style={styles.checkBulletGold}>✔</span> Track your requests
                </li>
              </ul>

              <Link to="/register?role=customer" style={styles.portalActionBtn}>
                Get Started →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. OUR PROJECTS */}
      {/* ======================================================== */}
      <section style={styles.projectsSection} id="projects-section">
        <div style={styles.projectsHeaderRow}>
          <div style={{ flex: 1 }}>
            <div style={styles.titleWithLines}>
              <span style={styles.accentLineShort} />
              <h2 style={styles.sectionTitle}>Our Projects</h2>
              <span style={styles.accentLineShort} />
            </div>
            <p style={styles.sectionSubtitle}>Quality work. Lasting results.</p>
          </div>
          <button
            onClick={() => {
              if (isAuthenticated) navigate('/customer/decks/new');
              else navigate('/login');
            }}
            style={styles.viewAllProjectsBtn}
          >
            View All Projects →
          </button>
        </div>

        <div style={styles.projectsGrid}>
          {projects.map((proj) => (
            <div
              key={proj.id}
              style={styles.projectCard}
              onClick={() => setSelectedProject(proj)}
            >
              <div style={styles.projectImgFrame}>
                <img src={proj.image} alt={proj.title} style={styles.projectImg} />
                <div style={styles.projectPillBefore}>Before</div>
                <div style={styles.projectPillCenter}>↔</div>
                <div style={styles.projectPillAfter}>After</div>
              </div>

              <div style={styles.projectCardBottom}>
                <div>
                  <h4 style={styles.projectTitle}>{proj.title}</h4>
                  <p style={styles.projectType}>{proj.type}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProject(proj);
                  }}
                  style={styles.projectArrowCircle}
                  title="View Project Details"
                >
                  →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. OUR PRODUCTS & SERVICES */}
      {/* ======================================================== */}
      <section style={styles.productsSection} id="products-section">
        <div style={styles.sectionHeaderCentered}>
          <div style={styles.titleWithLines}>
            <span style={styles.accentLineShort} />
            <h2 style={styles.sectionTitle}>Our Products & Services</h2>
            <span style={styles.accentLineShort} />
          </div>
          <p style={styles.sectionSubtitle}>
            Everything you need for a durable and beautiful deck.
          </p>
        </div>

        {/* 5 Product Cards */}
        <div style={styles.productsRow}>
          {products.map((p, idx) => (
            <div key={idx} style={styles.productCard}>
              <div style={styles.productImgFrame}>
                <img src={p.image} alt={p.name} style={styles.productImg} />
              </div>
              <span style={styles.productName}>{p.name}</span>
            </div>
          ))}
        </div>

        {/* 4 Feature Badges Bar */}
        <div style={styles.featuresFloatingBar}>
          <div style={styles.featureItem}>
            <div style={styles.featureIcon}>🍃</div>
            <div>
              <strong style={styles.featureTitle}>Extends Deck Life</strong>
              <p style={styles.featureSub}>Protects against weather</p>
            </div>
          </div>

          <span style={styles.featureDivider} />

          <div style={styles.featureItem}>
            <div style={styles.featureIcon}>🛡️</div>
            <div>
              <strong style={styles.featureTitle}>Enhances Beauty</strong>
              <p style={styles.featureSub}>Restores natural look</p>
            </div>
          </div>

          <span style={styles.featureDivider} />

          <div style={styles.featureItem}>
            <div style={styles.featureIcon}>💧</div>
            <div>
              <strong style={styles.featureTitle}>Repels Moisture</strong>
              <p style={styles.featureSub}>Prevents damage & rot</p>
            </div>
          </div>

          <span style={styles.featureDivider} />

          <div style={styles.featureItem}>
            <div style={styles.featureIcon}>🏢</div>
            <div>
              <strong style={styles.featureTitle}>Professional Results</strong>
              <p style={styles.featureSub}>Trusted by contractors</p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. CTA BANNER */}
      {/* ======================================================== */}
      <section style={styles.ctaBannerSection}>
        <div style={styles.ctaBannerInner}>
          <div style={styles.ctaBannerLeft}>
            <h2 style={styles.ctaTitle}>Ready to Restore Your Deck?</h2>
            <p style={styles.ctaSubtitle}>
              Try our Deck Estimator now and get started in seconds.
            </p>
          </div>

          <div style={styles.ctaBannerCenter}>
            <button onClick={handleLaunchEstimator} style={styles.ctaTryNowBtn}>
              Try Now →
            </button>
          </div>

          <div style={styles.ctaBannerRightBg}>
            <img src={ctaDeckBgImg} alt="Deck Atmosphere" style={styles.ctaBgImg} />
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. FOOTER */}
      {/* ======================================================== */}
      <footer style={styles.footer} id="contact-section">
        <div style={styles.footerInner}>
          {/* Brand Col */}
          <div style={styles.footerBrandCol}>
            <img src={logoImg} alt="DECK Plus Restoration" style={styles.footerLogoImg} />
            <p style={styles.footerTagline}>
              Premium deck restoration solutions for homes and contractors.
            </p>
            <p style={styles.footerCopyright}>
              © 2026 Deck Restoration Plus, LLC. All rights reserved.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div style={styles.footerCol}>
            <h4 style={styles.footerColHeader}>Quick Links</h4>
            <ul style={styles.footerLinksList}>
              <li>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  style={styles.footerLinkBtn}
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth' })}
                  style={styles.footerLinkBtn}
                >
                  Projects
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                  style={styles.footerLinkBtn}
                >
                  Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })}
                  style={styles.footerLinkBtn}
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' })}
                  style={styles.footerLinkBtn}
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div style={styles.footerCol}>
            <h4 style={styles.footerColHeader}>Resources</h4>
            <ul style={styles.footerLinksList}>
              <li>
                <Link to="/contractor/guidelines" style={styles.footerLink}>Contractor Guidelines</Link>
              </li>
              <li>
                <Link to="/contractor/support" style={styles.footerLink}>Compliance</Link>
              </li>
              <li>
                <Link to="/contractor/terms" style={styles.footerLink}>Terms</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Get in Touch */}
          <div style={styles.footerCol}>
            <h4 style={styles.footerColHeader}>Get in Touch</h4>
            <div style={styles.contactItem}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#EAA428" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>(866) 440-DECK (3325)</span>
            </div>
            <div style={styles.contactItem}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#EAA428" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>estimates@deckrestorationplus.com</span>
            </div>
          </div>

          {/* Col 5: Follow Us */}
          <div style={styles.footerCol}>
            <h4 style={styles.footerColHeader}>Follow Us</h4>
            <div style={styles.socialIconsRow}>
              {/* Facebook */}
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={styles.socialIconBtn} title="Facebook">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="#FFFFFF">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              {/* YouTube */}
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" style={styles.socialIconBtn} title="YouTube">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="#FFFFFF">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#081726" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={styles.socialIconBtn} title="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFFFFF">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ======================================================== */}
      {/* 9. PROJECT DETAIL MODAL */}
      {/* ======================================================== */}
      {selectedProject && (
        <div style={styles.modalOverlay} onClick={() => setSelectedProject(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>{selectedProject.title}</h3>
                <span style={styles.modalBadge}>{selectedProject.type}</span>
              </div>
              <button onClick={() => setSelectedProject(null)} style={styles.modalCloseBtn}>✕</button>
            </div>
            <div style={styles.modalImgFrame}>
              <img src={selectedProject.image} alt={selectedProject.title} style={styles.modalImg} />
            </div>
            <p style={styles.modalDesc}>{selectedProject.desc}</p>
            <div style={styles.modalActions}>
              <button onClick={() => setSelectedProject(null)} style={styles.modalCancelBtn}>
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedProject(null);
                  handleLaunchEstimator();
                }}
                style={styles.modalActionBtn}
              >
                Estimate A Project Like This →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========================================================
// STYLES (Pixel-matched to specifications)
// ========================================================
const styles = {
  pageContainer: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
  },

  // 1. HEADER
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E2E8F0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  headerInner: {
    maxWidth: '1240px',
    margin: '0 auto',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
  },
  logoImg: {
    height: '38px',
    width: 'auto',
    objectFit: 'contain',
  },
  navMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  navItem: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#334155',
    fontSize: '14px',
    fontWeight: '500',
    padding: '7px 16px',
    borderRadius: '9999px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  navItemActive: {
    backgroundColor: '#162C46',
    border: 'none',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '600',
    padding: '7px 18px',
    borderRadius: '9999px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  searchIconButton: {
    background: 'transparent',
    border: 'none',
    padding: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background-color 0.15s',
  },
  headerDivider: {
    width: '1px',
    height: '20px',
    backgroundColor: '#CBD5E1',
  },
  signInBtn: {
    backgroundColor: '#FFFFFF',
    border: '1.5px solid #162C46',
    color: '#162C46',
    fontSize: '13px',
    fontWeight: '600',
    padding: '6px 18px',
    borderRadius: '9999px',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  getStartedBtn: {
    backgroundColor: '#EAA428',
    backgroundImage: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    border: 'none',
    color: '#0F172A',
    fontSize: '13px',
    fontWeight: '700',
    padding: '8px 20px',
    borderRadius: '9999px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.35)',
    transition: 'all 0.15s ease',
  },
  searchDropdownBar: {
    maxWidth: '1240px',
    margin: '0 auto',
    padding: '8px 24px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  searchDropdownInput: {
    flex: 1,
    padding: '8px 14px',
    borderRadius: '9999px',
    border: '1px solid #CBD5E1',
    fontSize: '13px',
    outline: 'none',
  },
  searchCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#64748B',
  },

  // 2. HERO SECTION
  heroSection: {
    backgroundColor: '#F8FAFC',
    backgroundImage: 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%)',
    padding: '48px 24px 100px',
    position: 'relative',
  },
  heroInner: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1.1fr 0.9fr',
    gap: '40px',
    alignItems: 'center',
  },
  heroLeft: {
    paddingRight: '12px',
  },
  heroHeading: {
    fontSize: '52px',
    fontWeight: '800',
    color: '#0E2A47',
    lineHeight: '1.15',
    margin: '0 0 16px 0',
    letterSpacing: '-0.02em',
  },
  heroEnjoyWord: {
    color: '#EAA428',
    fontStyle: 'italic',
    fontWeight: '700',
  },
  heroSubtitle: {
    fontSize: '16px',
    color: '#475569',
    lineHeight: '1.55',
    margin: '0 0 28px 0',
    maxWidth: '460px',
  },
  heroBtnGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '32px',
    flexWrap: 'wrap',
  },
  tryEstimatorBtn: {
    backgroundColor: '#EAA428',
    backgroundImage: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    border: 'none',
    color: '#0F172A',
    fontSize: '14px',
    fontWeight: '700',
    padding: '12px 26px',
    borderRadius: '9999px',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
    transition: 'all 0.18s ease',
  },
  exploreProjectsBtn: {
    backgroundColor: '#FFFFFF',
    border: '1.5px solid #162C46',
    color: '#162C46',
    fontSize: '14px',
    fontWeight: '600',
    padding: '11px 22px',
    borderRadius: '9999px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.15s',
  },
  trustBadgesRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    paddingTop: '8px',
    borderTop: '1px solid #E2E8F0',
    maxWidth: '460px',
  },
  trustBadgeItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
  },
  trustDivider: {
    width: '1px',
    height: '14px',
    backgroundColor: '#CBD5E1',
  },
  heroRight: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImageFrame: {
    width: '100%',
    maxWidth: '520px',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 16px 40px rgba(15, 23, 42, 0.12)',
    border: '4px solid #FFFFFF',
  },
  heroImg: {
    width: '100%',
    height: 'auto',
    display: 'block',
    objectFit: 'cover',
  },

  // 3. FLOATING QUICK ESTIMATOR CARD
  quickEstimatorCard: {
    maxWidth: '1160px',
    margin: '36px auto -40px',
    backgroundColor: '#FFFFFF',
    borderRadius: '20px',
    boxShadow: '0 16px 45px rgba(15, 23, 42, 0.1)',
    border: '1px solid #E2E8F0',
    padding: '24px 28px',
    display: 'grid',
    gridTemplateColumns: '1.1fr 1.6fr 1fr',
    gap: '24px',
    alignItems: 'center',
    position: 'relative',
    zIndex: 10,
  },
  qeCol1: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    borderRight: '1px solid #F1F5F9',
    paddingRight: '16px',
  },
  qeIconSquare: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    backgroundColor: '#FEF3C7',
    border: '1px solid #FDE68A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  qeTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#0F172A',
    margin: '0 0 4px 0',
  },
  qeSubtitle: {
    fontSize: '12px',
    color: '#64748B',
    lineHeight: '1.4',
    margin: '0 0 10px 0',
  },
  qeChecklist: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  qeCheckItem: {
    fontSize: '12px',
    color: '#334155',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  qeCheckIcon: {
    color: '#D97706',
    fontWeight: '800',
    fontSize: '11px',
  },
  qeCol2: {
    borderRight: '1px solid #F1F5F9',
    paddingRight: '16px',
  },
  qeHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
  },
  qeFormHeader: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0F172A',
  },
  qeInputsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    marginBottom: '12px',
  },
  qeInputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  qeInputLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#475569',
  },
  qeSelect: {
    padding: '6px 8px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    fontSize: '12px',
    fontWeight: '500',
    color: '#0F172A',
    outline: 'none',
    cursor: 'pointer',
  },
  qeSubmitBtn: {
    width: '100%',
    backgroundColor: '#162C46',
    border: 'none',
    color: '#FFFFFF',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(22, 44, 70, 0.25)',
    transition: 'all 0.15s ease',
  },
  qeCol3: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qeCoinsIcon: {
    marginBottom: '2px',
  },
  qeCostLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  qePriceRange: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0F172A',
    margin: '3px 0 2px 0',
  },
  qeApproxText: {
    fontSize: '11px',
    color: '#94A3B8',
    marginBottom: '8px',
  },
  qeNoticeBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '5px',
    fontSize: '10.5px',
    color: '#64748B',
    textAlign: 'left',
    lineHeight: '1.3',
  },

  // 4. BUILT FOR EVERYONE
  builtSection: {
    padding: '90px 24px 60px',
    maxWidth: '1160px',
    margin: '0 auto',
    width: '100%',
  },
  sectionHeaderCentered: {
    textAlign: 'center',
    marginBottom: '36px',
  },
  titleWithLines: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '6px',
  },
  accentLineShort: {
    width: '40px',
    height: '2px',
    backgroundColor: '#EAA428',
    display: 'inline-block',
  },
  sectionTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#0F172A',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  sectionSubtitle: {
    fontSize: '13px',
    color: '#64748B',
    margin: 0,
  },
  builtCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
    gap: '24px',
  },
  portalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
    display: 'flex',
    overflow: 'hidden',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
  },
  portalCardImgFrame: {
    width: '42%',
    minHeight: '180px',
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  portalCardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  portalCardContent: {
    width: '58%',
    padding: '20px 22px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  portalCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  portalIconYellow: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#FEF3C7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  portalIconBlue: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#EFF6FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  portalCardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0F172A',
    margin: 0,
  },
  portalCardSubtitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#D97706',
    margin: 0,
  },
  portalCardSubtitleBlue: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#2563EB',
    margin: 0,
  },
  portalChecklist: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 16px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  portalCheckItem: {
    fontSize: '12px',
    color: '#334155',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  checkBulletGold: {
    color: '#D97706',
    fontWeight: '800',
    fontSize: '11px',
  },
  portalActionBtn: {
    backgroundColor: '#162C46',
    color: '#FFFFFF',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: '700',
    padding: '8px 18px',
    borderRadius: '9999px',
    textAlign: 'center',
    display: 'inline-block',
    width: 'fit-content',
    boxShadow: '0 2px 6px rgba(22, 44, 70, 0.25)',
  },

  // 5. OUR PROJECTS
  projectsSection: {
    padding: '40px 24px 60px',
    maxWidth: '1160px',
    margin: '0 auto',
    width: '100%',
  },
  projectsHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  },
  viewAllProjectsBtn: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #CBD5E1',
    color: '#162C46',
    fontSize: '12px',
    fontWeight: '600',
    padding: '6px 16px',
    borderRadius: '9999px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
    cursor: 'pointer',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
  },
  projectImgFrame: {
    width: '100%',
    height: '140px',
    backgroundColor: '#F8FAFC',
    position: 'relative',
    overflow: 'hidden',
  },
  projectImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  projectPillBefore: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    backdropFilter: 'blur(4px)',
    color: '#FFFFFF',
    fontSize: '9px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '9999px',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  projectPillCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#FFFFFF',
    color: '#162C46',
    fontSize: '11px',
    fontWeight: '900',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
  },
  projectPillAfter: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: '#EAA428',
    color: '#0F172A',
    fontSize: '9px',
    fontWeight: '800',
    padding: '2px 8px',
    borderRadius: '9999px',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  projectCardBottom: {
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  projectTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0F172A',
    margin: '0 0 2px 0',
  },
  projectType: {
    fontSize: '11px',
    color: '#64748B',
    margin: 0,
  },
  projectArrowCircle: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    backgroundColor: '#F1F5F9',
    border: 'none',
    color: '#162C46',
    fontSize: '13px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },

  // 6. OUR PRODUCTS & SERVICES
  productsSection: {
    padding: '40px 24px 60px',
    maxWidth: '1160px',
    margin: '0 auto',
    width: '100%',
  },
  productsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px',
    marginBottom: '28px',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    padding: '16px 12px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'transform 0.18s ease',
  },
  productImgFrame: {
    width: '100%',
    height: '90px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10px',
  },
  productImg: {
    maxHeight: '85px',
    maxWidth: '90%',
    objectFit: 'contain',
    display: 'block',
  },
  productName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0F172A',
  },
  featuresFloatingBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
    padding: '16px 24px',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    alignItems: 'center',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  featureIcon: {
    fontSize: '20px',
  },
  featureTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0F172A',
    display: 'block',
    lineHeight: '1.2',
  },
  featureSub: {
    fontSize: '11px',
    color: '#64748B',
    margin: '2px 0 0 0',
  },
  featureDivider: {
    width: '1px',
    height: '32px',
    backgroundColor: '#E2E8F0',
  },

  // 7. CTA BANNER
  ctaBannerSection: {
    padding: '0 24px 70px',
    maxWidth: '1160px',
    margin: '0 auto',
    width: '100%',
  },
  ctaBannerInner: {
    backgroundColor: '#0D253E',
    backgroundImage: 'linear-gradient(135deg, #0D253E 0%, #163657 100%)',
    borderRadius: '18px',
    padding: '24px 36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 12px 30px rgba(13, 37, 62, 0.25)',
  },
  ctaBannerLeft: {
    zIndex: 2,
  },
  ctaTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#FFFFFF',
    margin: '0 0 4px 0',
  },
  ctaSubtitle: {
    fontSize: '13px',
    color: '#94A3B8',
    margin: 0,
  },
  ctaBannerCenter: {
    zIndex: 2,
  },
  ctaTryNowBtn: {
    backgroundColor: '#EAA428',
    backgroundImage: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    border: 'none',
    color: '#0F172A',
    fontSize: '13px',
    fontWeight: '800',
    padding: '11px 26px',
    borderRadius: '9999px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  },
  ctaBannerRightBg: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '38%',
    opacity: 0.85,
    pointerEvents: 'none',
  },
  ctaBgImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    maskImage: 'linear-gradient(to right, transparent, black)',
    WebkitMaskImage: 'linear-gradient(to right, transparent, black)',
  },

  // 8. FOOTER
  footer: {
    backgroundColor: '#081726',
    color: '#94A3B8',
    padding: '50px 24px 30px',
    marginTop: 'auto',
  },
  footerInner: {
    maxWidth: '1160px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr 1fr 1.3fr 0.9fr',
    gap: '30px',
  },
  footerBrandCol: {
    paddingRight: '12px',
  },
  footerLogoImg: {
    height: '34px',
    width: 'auto',
    marginBottom: '12px',
    filter: 'brightness(1.1)',
  },
  footerTagline: {
    fontSize: '12px',
    lineHeight: '1.5',
    color: '#94A3B8',
    margin: '0 0 14px 0',
  },
  footerCopyright: {
    fontSize: '11px',
    color: '#64748B',
    margin: 0,
  },
  footerCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  footerColHeader: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#FFFFFF',
    margin: '0 0 4px 0',
  },
  footerLinksList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  footerLink: {
    fontSize: '12px',
    color: '#94A3B8',
    textDecoration: 'none',
    transition: 'color 0.15s ease',
  },
  footerLinkBtn: {
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    fontSize: '12px',
    cursor: 'pointer',
    padding: 0,
    textAlign: 'left',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    color: '#CBD5E1',
    marginBottom: '6px',
  },
  socialIconsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  socialIconBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#162C46',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    transition: 'background-color 0.15s',
  },

  // 9. MODAL
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    maxWidth: '560px',
    width: '100%',
    padding: '24px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0F172A',
    margin: '0 0 4px 0',
  },
  modalBadge: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#162C46',
    backgroundColor: '#F1F5F9',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#64748B',
    cursor: 'pointer',
  },
  modalImgFrame: {
    width: '100%',
    height: '240px',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    marginBottom: '16px',
  },
  modalImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  modalDesc: {
    fontSize: '13px',
    color: '#475569',
    lineHeight: '1.5',
    marginBottom: '20px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  modalCancelBtn: {
    backgroundColor: '#F1F5F9',
    border: 'none',
    color: '#475569',
    fontSize: '13px',
    fontWeight: '600',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  modalActionBtn: {
    backgroundColor: '#EAA428',
    backgroundImage: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    border: 'none',
    color: '#0F172A',
    fontSize: '13px',
    fontWeight: '700',
    padding: '8px 18px',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};

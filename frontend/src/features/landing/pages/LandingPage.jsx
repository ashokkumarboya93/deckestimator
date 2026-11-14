// ====================================================================
// Deck Estimator — Premium Full-Screen Landing Page
// Responsive across Mobile, iPad / Tablet, Laptop & Desktop
// ====================================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

// Brand & Hero Assets
import mainNavLogo from '../../../assets/images/Main_Logo_v2.png';
import footerLogo from '../../../assets/images/MainLodo.png';
import wizardHeroImg from '../../../assets/images/Wizard Hat Deck Finishing Portrait.jpg';
import calculatorDeckImg from '../../../assets/images/Round Wooden Deck with Wicker Seating.webp';

// Service Visuals (100% matched local high-resolution deck restoration assets)
import cleaningImg from '../../../assets/images/Input_images/section6/Deep Cleaning/Deep Cleaning_Main.webp';
import restorationImg from '../../../assets/images/Input_images/section6/Deck Staining (Conditioning)/Deck Staining_Main.webp';
import protectionImg from '../../../assets/images/Input_images/section6/Deck Sealing (Clear Sealing)/Deck Sealing_Main.webp';

// Products (Synced with https://www.deckandwoodstain.com/shop)
import prod1Img from '../../../assets/images/landing/drp_prod_finishes.jpg';
import prod2Img from '../../../assets/images/landing/drp_prod_sealers.png';
import prod3Img from '../../../assets/images/landing/drp_prod_stains.jpg';
import prod4Img from '../../../assets/images/landing/drp_prod_cleaners.jpg';
import prod5Img from '../../../assets/images/landing/drp_prod_tools.png';

// Projects (100% real deck restoration Before / After comparisons)
import proj1Before from '../../../assets/images/Input_images/section7/2.Weathered/Weathered_Main.webp';
import proj1After from '../../../assets/images/landing/drp_proj_1_after.jpg';

import proj2Before from '../../../assets/images/Input_images/section7/6.Peeling Coating/Peeling_Main.webp';
import proj2After from '../../../assets/images/landing/drp_proj_4_after.jpg';

import proj3Before from '../../../assets/images/Input_images/section7/5.Heavy-Mold&mildew/Mold_main.webp';
import proj3After from '../../../assets/images/Input_images/section7/1.Good-Condition/Good-Condition_Main.webp';

import proj4Before from '../../../assets/images/Input_images/section7/7.Water Damaged/Water Damaged_Main.webp';
import proj4After from '../../../assets/images/Input_images/section6/Deck Staining (Conditioning)/Deck Staining01.webp';

// CTA & Promo Background (clean high-res wood deck photograph, no ghost text)
import ctaDeckBgImg from '../../../assets/images/landing/drp_proj_4_after.jpg';

const DRP_SHOP_URL = 'https://www.deckandwoodstain.com/shop';

const PRODUCTS_LIST = [
  {
    id: 'finishes',
    title: 'Deck Finishes',
    caption: 'Deck in a Box Complete Kit',
    image: prod1Img,
    url: 'https://www.deckandwoodstain.com/shop?tag=deck%20in%20the%20box',
  },
  {
    id: 'sealers',
    title: 'Restoration Sealers',
    caption: 'DRP Sealer Plus (5 Gal)',
    image: prod2Img,
    url: DRP_SHOP_URL,
  },
  {
    id: 'stains',
    title: 'Premium Deck Stains',
    caption: 'DRP Medford Cedar Stain',
    image: prod3Img,
    url: 'https://www.deckandwoodstain.com/shop?tag=stains',
  },
  {
    id: 'cleaners',
    title: 'Deck Cleaners',
    caption: 'DRP Powdered Deck Cleaner',
    image: prod4Img,
    url: 'https://www.deckandwoodstain.com/shop?tag=cleaners',
  },
  {
    id: 'tools',
    title: 'Professional Tools',
    caption: '5.5" Pro Staining Brush',
    image: prod5Img,
    url: DRP_SHOP_URL,
  },
];

const PROJECTS_LIST = [
  {
    id: 1,
    title: 'Wrap-Around Cedar Deck Restoration',
    meta: 'Cedar Deck • 420 sq ft',
    beforeImg: proj1Before,
    afterImg: proj1After,
    beforeCaption: 'Grayed, sun-weathered boards',
    afterCaption: 'Deep-cleaned & rich espresso stain',
  },
  {
    id: 2,
    title: 'Peeling Coating Strip & Restain',
    meta: 'Pressure-Treated Pine • 320 sq ft',
    beforeImg: proj2Before,
    afterImg: proj2After,
    beforeCaption: 'Failed peeling paint & worn grain',
    afterCaption: 'Stripped bare & golden cedar finish',
  },
  {
    id: 3,
    title: 'Deep Mold Wash & Wood Brightening',
    meta: 'Natural Wood Deck • 280 sq ft',
    beforeImg: proj3Before,
    afterImg: proj3After,
    beforeCaption: 'Heavy mildew & dark algae buildup',
    afterCaption: 'Sanitized, brightened & clear-sealed',
  },
  {
    id: 4,
    title: 'Waterproof Sealing & Stain Finish',
    meta: 'Cedar & Pine Deck • 350 sq ft',
    beforeImg: proj4Before,
    afterImg: proj4After,
    beforeCaption: 'Moisture-darkened, unprotected planks',
    afterCaption: 'Roll-coated UV & water shield',
  },
];

const TESTIMONIALS_LIST = [
  {
    name: 'Sarah M.',
    role: 'Verified Homeowner',
    text: '“Our 12-year-old cedar deck had turned completely gray and was starting to splinter by the steps. The crew washed, brightened, and stained it in two days—it honestly looks better than when we bought the house.”',
    stars: 5,
    project: '320 sq ft Cedar Deck',
  },
  {
    name: 'James R.',
    role: 'Verified Homeowner',
    text: '“I was worried about stripping the old peeling stain without damaging the wood, but they took their time and explained every step. The estimate matched the final bill, and rainwater still beads right off the boards.”',
    stars: 5,
    project: '450 sq ft Mahogany Deck',
  },
  {
    name: 'Emily T.',
    role: 'Verified Homeowner',
    text: '“Used the calculator on a Sunday night to get a realistic budget before calling. Having a clear price range upfront made planning easy, and the team got all the mold off our shaded pine deck without touching the garden beds.”',
    stars: 5,
    project: '280 sq ft Pine Deck',
  },
];

export default function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Responsive state for mobile, tablets, laptops, desktops
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );
  const isMobile = viewportWidth < 1024;
  const isPhone = viewportWidth <= 768;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setViewportWidth(w);
      if (w >= 1024) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    const targetRoute = isAuthenticated ? '/customer/decks/new' : '/estimator';
    navigate(targetRoute, {
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
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;
    if (q.includes('calc') || q.includes('price') || q.includes('estimate') || q.includes('cost')) {
      scrollToSection('calculator', 'Home');
    } else if (q.includes('clean') || q.includes('service') || q.includes('protect') || q.includes('restor')) {
      scrollToSection('services', 'Services');
    } else if (q.includes('stain') || q.includes('seal') || q.includes('product') || q.includes('brush') || q.includes('finish')) {
      scrollToSection('products', 'Products');
    } else if (q.includes('project') || q.includes('before') || q.includes('after') || q.includes('cedar') || q.includes('pine')) {
      scrollToSection('projects', 'Projects');
    } else if (q.includes('contact') || q.includes('phone') || q.includes('address') || q.includes('email')) {
      scrollToSection('footer', 'Contact');
    } else {
      scrollToSection('services', 'Services');
    }
    setSearchOpen(false);
  };

  const handleNextTestimonial = () => {
    setActiveTestimonialIdx((prev) => (prev + 1) % TESTIMONIALS_LIST.length);
  };

  const handlePrevTestimonial = () => {
    setActiveTestimonialIdx((prev) => (prev - 1 + TESTIMONIALS_LIST.length) % TESTIMONIALS_LIST.length);
  };

  // Rotate testimonial order so carousel buttons work visibly on both desktop & mobile
  const orderedTestimonials = TESTIMONIALS_LIST.map(
    (_, idx) => TESTIMONIALS_LIST[(activeTestimonialIdx + idx) % TESTIMONIALS_LIST.length]
  );

  return (
    <div style={styles.pageContainer}>
      {/* Responsive & Animation Styles */}
      <style>{`
        @keyframes floatWood {
          0%, 100% {
            transform: translateY(0px) rotate(-2deg);
          }
          50% {
            transform: translateY(-9px) rotate(-1deg);
          }
        }
        .hover-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 20px 35px -8px rgba(15, 44, 89, 0.14) !important;
        }
        .hover-zoom:hover img {
          transform: scale(1.06) !important;
        }
        .btn-hover:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15) !important;
        }
        .drp-social-icon:hover {
          background-color: #E07A2B !important;
          color: #FFFFFF !important;
          transform: translateY(-2px);
        }
        .drp-footer-link:hover {
          color: #FFFFFF !important;
        }

        /* ================= LAPTOP & IPAD PRO (<= 1180px) ================= */
        @media (max-width: 1180px) {
          .landing-hero-heading {
            font-size: 46px !important;
          }
          .landing-calc-box {
            grid-template-columns: 220px 1.3fr 245px !important;
            gap: 20px !important;
            padding: 20px !important;
          }
          .landing-projects-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 20px !important;
          }
          .landing-footer-grid {
            grid-template-columns: 1.2fr 0.9fr 0.9fr 1.2fr !important;
            gap: 28px !important;
          }
        }

        /* ================= IPAD & TABLET (<= 1024px) ================= */
        @media (max-width: 1024px) {
          .landing-hero-section {
            min-height: 76vh !important;
            padding: 44px 20px 56px 20px !important;
            background-position: 65% center !important;
          }
          .landing-hero-overlay {
            background: linear-gradient(90deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.92) 48%, rgba(255,255,255,0.55) 78%, rgba(255,255,255,0.22) 100%) !important;
          }
          .landing-wood-sticker {
            top: 20px !important;
            right: 24px !important;
            padding: 10px 18px !important;
          }
          .landing-calc-box {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
            padding: 20px !important;
          }
          .landing-calc-visual {
            height: 210px !important;
          }
          .landing-products-container {
            grid-template-columns: 1fr !important;
            gap: 22px !important;
          }
          .landing-services-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 20px !important;
          }
          .landing-projects-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 18px !important;
          }
          .landing-steps-container {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }
          .landing-step-arrow {
            display: none !important;
          }
          .landing-testimonials-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 18px !important;
          }
          .landing-footer-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 28px !important;
          }
          .landing-screen-section {
            min-height: auto !important;
            padding: 52px 20px !important;
          }
        }

        /* ================= MOBILE & SMALL TABLETS (<= 768px) ================= */
        @media (max-width: 768px) {
          .landing-header-inner {
            padding: 8px 12px !important;
            gap: 8px !important;
          }
          .landing-logo-img {
            height: 32px !important;
          }
          .landing-header-cta {
            padding: 7px 11px !important;
            font-size: 11.5px !important;
            white-space: nowrap !important;
          }

          /* Hero Section Mobile */
          .landing-hero-section {
            min-height: auto !important;
            padding: 28px 14px 34px 14px !important;
            background-position: center top !important;
          }
          .landing-hero-overlay {
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(255, 255, 255, 0.90) 65%, rgba(255, 255, 255, 0.96) 100%) !important;
          }
          .landing-hero-container {
            padding: 0 !important;
          }
          .landing-hero-left {
            max-width: 100% !important;
          }
          .landing-tag-badge {
            font-size: 10.5px !important;
            padding: 4px 10px !important;
            margin-bottom: 12px !important;
          }
          .landing-hero-heading {
            font-size: clamp(26px, 7.5vw, 34px) !important;
            line-height: 1.15 !important;
            letter-spacing: -0.7px !important;
            margin-bottom: 10px !important;
          }
          .landing-hero-subtitle {
            font-size: 13.5px !important;
            line-height: 1.5 !important;
            margin-bottom: 18px !important;
          }
          .landing-hero-btn-row {
            flex-direction: column !important;
            width: 100% !important;
            gap: 10px !important;
            margin-bottom: 20px !important;
          }
          .landing-hero-btn-row button {
            width: 100% !important;
            justify-content: center !important;
            padding: 11px 16px !important;
            font-size: 13.5px !important;
          }
          .landing-wood-sticker {
            display: none !important;
          }
          .landing-trust-row {
            gap: 10px 16px !important;
            padding-top: 12px !important;
          }
          .landing-trust-item {
            font-size: 12px !important;
          }

          /* Quick Calculator Mobile */
          .landing-calc-section {
            padding: 22px 14px 30px 14px !important;
          }
          .landing-calc-box {
            grid-template-columns: 1fr !important;
            padding: 14px !important;
            gap: 14px !important;
            border-radius: 16px !important;
            margin-bottom: 22px !important;
          }
          .landing-calc-visual {
            height: 165px !important;
            width: 100% !important;
            border-radius: 12px !important;
          }
          .landing-calc-title {
            font-size: 16px !important;
          }
          .landing-calc-sub {
            font-size: 11.5px !important;
          }
          .landing-calc-inputs {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .landing-calc-select {
            padding: 8px 10px !important;
            font-size: 13px !important;
          }
          .landing-calc-result {
            width: 100% !important;
            box-sizing: border-box !important;
            padding: 14px !important;
            border-radius: 12px !important;
          }
          .landing-cost-price {
            font-size: 24px !important;
          }

          /* Trust Stats Bar Mobile */
          .landing-stats-bar {
            grid-template-columns: 1fr 1fr !important;
            gap: 14px 10px !important;
            padding: 14px 10px !important;
            border-radius: 14px !important;
          }
          .landing-stat-divider {
            display: none !important;
          }
          .landing-stat-item {
            flex-direction: column !important;
            text-align: center !important;
            gap: 4px !important;
          }
          .landing-stat-number {
            font-size: 18px !important;
          }
          .landing-stat-label {
            font-size: 11px !important;
          }

          /* Section Headers & Spacing Mobile */
          .landing-screen-section {
            min-height: auto !important;
            padding: 32px 14px !important;
          }
          .landing-section-header {
            margin-bottom: 22px !important;
          }
          .landing-title-with-lines {
            gap: 10px !important;
          }
          .landing-title-line {
            width: 20px !important;
          }
          .landing-section-title {
            font-size: 22px !important;
            line-height: 1.2 !important;
          }
          .landing-section-subtitle {
            font-size: 13px !important;
          }

          /* Services Mobile */
          .landing-services-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .landing-service-img-wrap {
            height: 175px !important;
          }
          .landing-service-content {
            padding: 16px !important;
          }
          .landing-service-pill {
            width: 38px !important;
            height: 38px !important;
            top: -19px !important;
            left: 16px !important;
          }
          .landing-service-name {
            font-size: 17px !important;
            margin: 12px 0 6px 0 !important;
          }
          .landing-service-desc {
            font-size: 13px !important;
          }

          /* Products Mobile (Compact 2-column grid + Highlight Card) */
          .landing-products-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
          .landing-product-card {
            padding: 12px 10px !important;
            border-radius: 12px !important;
          }
          .landing-product-card-last {
            grid-column: 1 / -1 !important;
          }
          .landing-product-img-frame {
            height: 78px !important;
            margin-bottom: 8px !important;
          }
          .landing-product-img {
            max-height: 74px !important;
          }
          .landing-product-title {
            font-size: 12.5px !important;
          }
          .landing-product-caption {
            font-size: 10.5px !important;
          }
          .landing-promo-card {
            padding: 22px 18px !important;
            border-radius: 16px !important;
          }
          .landing-promo-title {
            font-size: 19px !important;
            margin-bottom: 14px !important;
          }
          .landing-promo-list {
            gap: 8px !important;
            margin-bottom: 18px !important;
          }
          .landing-promo-item {
            font-size: 13px !important;
          }

          /* Projects Mobile */
          .landing-projects-header-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
            margin-bottom: 20px !important;
          }
          .landing-projects-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .landing-project-img-box {
            height: 185px !important;
          }
          .landing-project-details {
            padding: 12px 14px !important;
          }
          .landing-project-title {
            font-size: 14.5px !important;
          }

          /* Steps Mobile */
          .landing-steps-container {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .landing-step-card {
            padding: 18px 16px !important;
            border-radius: 14px !important;
          }
          .landing-step-header {
            margin-bottom: 10px !important;
          }
          .landing-step-title {
            font-size: 15.5px !important;
          }
          .landing-step-desc {
            font-size: 12.5px !important;
          }

          /* Testimonials Mobile */
          .landing-testimonial-header-row {
            margin-bottom: 20px !important;
          }
          .landing-testimonials-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .landing-testimonial-card {
            padding: 18px 16px !important;
            border-radius: 16px !important;
          }
          .landing-testimonial-text {
            font-size: 13px !important;
            margin-bottom: 12px !important;
          }

          /* Pre-Footer CTA Mobile */
          .landing-cta-section {
            padding: 0 14px !important;
            margin-bottom: 32px !important;
          }
          .landing-cta-banner {
            padding: 32px 18px !important;
            border-radius: 18px !important;
          }
          .landing-cta-headline {
            font-size: 22px !important;
            margin-bottom: 10px !important;
          }
          .landing-cta-subhead {
            font-size: 13px !important;
            margin-bottom: 18px !important;
          }
          .landing-cta-btn {
            padding: 11px 22px !important;
            font-size: 13.5px !important;
          }

          /* Footer Mobile */
          .landing-footer {
            padding-top: 32px !important;
          }
          .landing-footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 22px 16px !important;
            padding: 0 14px 28px 14px !important;
          }
          .landing-footer-brand {
            grid-column: 1 / -1 !important;
          }
          .landing-footer-contact {
            grid-column: 1 / -1 !important;
          }
          .landing-footer-bottom {
            padding: 14px !important;
          }
          .landing-footer-bottom-inner {
            justify-content: center !important;
            text-align: center !important;
          }
        }

        @media (max-width: 420px) {
          .landing-title-line {
            display: none !important;
          }
          .landing-header-cta {
            font-size: 11px !important;
            padding: 6px 10px !important;
          }
        }
      `}</style>

      {/* ======================================================== */}
      {/* 1. TOP NAVBAR / HEADER */}
      {/* ======================================================== */}
      <header style={styles.header}>
        <div style={styles.headerInner} className="landing-header-inner">
          {/* Logo */}
          <Link to="/" style={styles.logoLink}>
            <img src={mainNavLogo} alt="DECK Plus Restoration" style={styles.logoImg} className="landing-logo-img" />
          </Link>

          {/* Desktop Navigation Links */}
          {!isMobile && (
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
          )}

          {/* Header Actions */}
          <div style={{ ...styles.headerRight, gap: isPhone ? '6px' : '12px' }}>
            {!isMobile && (isAuthenticated ? (
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
            ))}

            <button
              onClick={handleLaunchEstimator}
              style={styles.getFreeEstimateBtn}
              className="btn-hover landing-header-cta"
            >
              {isPhone ? 'Free Estimate →' : 'Get Free Estimate →'}
            </button>

            {/* Mobile & Tablet Hamburger Toggle */}
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={styles.hamburgerBtn}
                aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
                title={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              >
                {mobileMenuOpen ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Drawer Menu */}
        {isMobile && mobileMenuOpen && (
          <div style={styles.mobileDrawer}>
            {[
              { id: 'hero', label: 'Home' },
              { id: 'calculator', label: 'Deck Calculator' },
              { id: 'services', label: 'Services' },
              { id: 'products', label: 'Products' },
              { id: 'projects', label: 'Projects' },
              { id: 'how-it-works', label: 'How It Works' },
              { id: 'footer', label: 'Contact' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  scrollToSection(item.id, item.label);
                  setMobileMenuOpen(false);
                }}
                style={styles.mobileNavItem}
              >
                {item.label}
              </button>
            ))}
            <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '4px 0' }} />
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (user?.role === 'admin') navigate('/admin/dashboard');
                  else if (user?.role === 'contractor') navigate('/contractor/dashboard');
                  else navigate('/customer/dashboard');
                }}
                style={{ ...styles.signInBtn, textAlign: 'center', padding: '10px 16px', width: '100%' }}
              >
                Go to Dashboard
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                style={{ ...styles.signInBtn, textAlign: 'center', padding: '10px 16px', display: 'block' }}
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </header>

      {/* ======================================================== */}
      {/* 2. HERO SECTION */}
      {/* ======================================================== */}
      <section id="hero" style={styles.heroSection} className="landing-hero-section">
        <div style={styles.heroOverlay} className="landing-hero-overlay" />

        {/* Floating Wooden Sticker Badge */}
        <div style={styles.floatingWoodSticker} className="landing-wood-sticker">
          <div style={styles.woodStickerSunburst}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#FDE047" style={{ display: 'block', margin: '0 auto 2px auto' }}>
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

        <div style={styles.heroContainer} className="landing-hero-container">
          <div style={styles.heroLeft} className="landing-hero-left">
            <div style={styles.tagBadge} className="landing-tag-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>Premium Deck Restoration</span>
            </div>

            <h1 style={styles.heroHeading} className="landing-hero-heading">
              Restore. Protect. Enjoy <br />
              <span style={styles.heroAccentWord}>Your Deck Again.</span>
            </h1>

            <p style={styles.heroSubtitle} className="landing-hero-subtitle">
              Professional deck restoration services that bring back beauty, strength, and long-lasting protection to your outdoor space.
            </p>

            <div style={styles.heroBtnRow} className="landing-hero-btn-row">
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

            <div style={styles.trustBadgesRow} className="landing-trust-row">
              <div style={styles.trustItem} className="landing-trust-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F2C59" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, flexShrink: 0 }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Trusted Professionals</span>
              </div>
              <div style={styles.trustItem} className="landing-trust-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F2C59" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, flexShrink: 0 }}>
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>Fast Service</span>
              </div>
              <div style={styles.trustItem} className="landing-trust-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F2C59" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, flexShrink: 0 }}>
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
      <section id="calculator" style={styles.calculatorSection} className="landing-calc-section">
        <div style={styles.calculatorSectionInner}>
          <div style={styles.calcBox} className="hover-card landing-calc-box">
            {/* Left: Deck Image Visual */}
            <div style={styles.calcVisualCol} className="landing-calc-visual">
              <img
                src={calculatorDeckImg}
                alt="Beautiful Restored Wooden Deck"
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
                <div style={{ marginRight: '10px', display: 'flex', alignItems: 'center', color: '#0F2C59', flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  <h3 style={styles.calcTitle} className="landing-calc-title">Deck Restoration Calculator</h3>
                  <p style={styles.calcSub} className="landing-calc-sub">Get an instant, accurate estimate for your deck restoration project.</p>
                </div>
              </div>

              <div style={styles.calcInputsRow} className="landing-calc-inputs">
                <div style={styles.calcField}>
                  <label style={styles.calcLabel}>Deck Size</label>
                  <select
                    value={deckSize}
                    onChange={(e) => setDeckSize(e.target.value)}
                    style={styles.calcSelect}
                    className="landing-calc-select"
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
                    className="landing-calc-select"
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
                    className="landing-calc-select"
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
            <div style={styles.calcResultCol} className="landing-calc-result">
              <div style={styles.costBadgeHeader}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E07A2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
                <span>Estimated Cost</span>
              </div>
              <div style={styles.costPriceDisplay} className="landing-cost-price">{calculateQuickEstimate()}</div>
              <div style={styles.costApproxNotice}>(Approximate Range)</div>
              <div style={styles.costFootnote}>
                <span style={{ marginRight: '4px' }}>ⓘ</span>
                Final price may vary based on site conditions, deck condition, and materials.
              </div>
            </div>
          </div>

          {/* 4 Trust Stats Bar */}
          <div style={styles.statsBar} className="landing-stats-bar">
            <div style={styles.statItem} className="landing-stat-item">
              <div style={{ color: '#0F2C59', display: 'flex', alignItems: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <div style={styles.statNumber} className="landing-stat-number">1,500+</div>
                <div style={styles.statLabel} className="landing-stat-label">Decks Restored</div>
              </div>
            </div>

            <div style={styles.statDivider} className="landing-stat-divider" />

            <div style={styles.statItem} className="landing-stat-item">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div>
                <div style={styles.statNumber} className="landing-stat-number">4.9/5</div>
                <div style={styles.statLabel} className="landing-stat-label">Customer Rating</div>
              </div>
            </div>

            <div style={styles.statDivider} className="landing-stat-divider" />

            <div style={styles.statItem} className="landing-stat-item">
              <div style={{ color: '#0F2C59', display: 'flex', alignItems: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <div style={styles.statNumber} className="landing-stat-number">10+ Years</div>
                <div style={styles.statLabel} className="landing-stat-label">of Experience</div>
              </div>
            </div>

            <div style={styles.statDivider} className="landing-stat-divider" />

            <div style={styles.statItem} className="landing-stat-item">
              <div style={{ color: '#0F2C59', display: 'flex', alignItems: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
              <div>
                <div style={styles.statNumber} className="landing-stat-number">100%</div>
                <div style={styles.statLabel} className="landing-stat-label">Satisfaction Guarantee</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. OUR DECK RESTORATION SERVICES */}
      {/* ======================================================== */}
      <section id="services" style={styles.screenSection} className="landing-screen-section">
        <div style={styles.sectionHeaderCentered} className="landing-section-header">
          <div style={styles.titleWithLines} className="landing-title-with-lines">
            <span style={styles.woodAccentLine} className="landing-title-line" />
            <h2 style={styles.sectionTitle} className="landing-section-title">Our Deck Restoration Services</h2>
            <span style={styles.woodAccentLine} className="landing-title-line" />
          </div>
          <p style={styles.sectionSubtitle} className="landing-section-subtitle">
            Complete solutions to clean, restore, and protect your deck for years to come.
          </p>
        </div>

        <div style={styles.servicesGrid} className="landing-services-grid">
          <div style={styles.serviceCard} className="hover-card hover-zoom">
            <div style={styles.serviceImgWrapper} className="landing-service-img-wrap">
              <img src={cleaningImg} alt="Deck Cleaning Process" style={styles.serviceImg} />
            </div>
            <div style={styles.serviceContent} className="landing-service-content">
              <div style={styles.serviceIconPill} className="landing-service-pill">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              </div>
              <h3 style={styles.serviceName} className="landing-service-name">Deck Cleaning</h3>
              <p style={styles.serviceDesc} className="landing-service-desc">
                Remove dirt, mold, mildew, and failed old finishes for a fresh, clean, and revitalized surface.
              </p>
            </div>
          </div>

          <div style={styles.serviceCard} className="hover-card hover-zoom">
            <div style={styles.serviceImgWrapper} className="landing-service-img-wrap">
              <img src={restorationImg} alt="Deck Restoration and Refinishing" style={styles.serviceImg} />
            </div>
            <div style={styles.serviceContent} className="landing-service-content">
              <div style={{ ...styles.serviceIconPill, backgroundColor: '#FEF3C7', color: '#B45309' }} className="landing-service-pill">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              <h3 style={styles.serviceName} className="landing-service-name">Deck Restoration</h3>
              <p style={styles.serviceDesc} className="landing-service-desc">
                Repair damaged boards, precision sand wood fibers, and bring back the original architectural beauty.
              </p>
            </div>
          </div>

          <div style={styles.serviceCard} className="hover-card hover-zoom">
            <div style={styles.serviceImgWrapper} className="landing-service-img-wrap">
              <img src={protectionImg} alt="Deck Protection with Protective Sealers" style={styles.serviceImg} />
            </div>
            <div style={styles.serviceContent} className="landing-service-content">
              <div style={{ ...styles.serviceIconPill, backgroundColor: '#E0F2FE', color: '#0369A1' }} className="landing-service-pill">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 style={styles.serviceName} className="landing-service-name">Deck Protection</h3>
              <p style={styles.serviceDesc} className="landing-service-desc">
                Long-lasting commercial penetrating sealers and UV-inhibiting stains that resist weather, moisture, and wear.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. OUR PRODUCTS SECTION (Synced with deckandwoodstain.com) */}
      {/* ======================================================== */}
      <section id="products" style={styles.screenSection} className="landing-screen-section">
        <div style={styles.sectionHeaderCentered} className="landing-section-header">
          <div style={styles.titleWithLines} className="landing-title-with-lines">
            <span style={styles.woodAccentLine} className="landing-title-line" />
            <h2 style={styles.sectionTitle} className="landing-section-title">Our Products</h2>
            <span style={styles.woodAccentLine} className="landing-title-line" />
          </div>
          <p style={styles.sectionSubtitle} className="landing-section-subtitle">
            Professional-grade products for durable, long-lasting, and beautiful results.
          </p>
        </div>

        <div style={styles.productsContainer} className="landing-products-container">
          {/* Left Grid: 5 Real DRP Products */}
          <div style={styles.productsGrid} className="landing-products-grid">
            {PRODUCTS_LIST.map((product, idx) => (
              <a
                key={product.id}
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.productCard}
                className={`hover-card landing-product-card ${idx === PRODUCTS_LIST.length - 1 ? 'landing-product-card-last' : ''}`}
              >
                <div style={styles.productImgFrame} className="landing-product-img-frame">
                  <img
                    src={product.image}
                    alt={`${product.title} — ${product.caption}`}
                    style={styles.productImg}
                    className="landing-product-img"
                  />
                </div>
                <div style={styles.productTitle} className="landing-product-title">{product.title}</div>
                <div style={styles.productCaption} className="landing-product-caption">{product.caption}</div>
              </a>
            ))}
          </div>

          {/* Right Highlight Promo Card */}
          <div style={styles.promoProductCard} className="hover-card landing-promo-card">
            <div style={styles.promoOverlay} />
            <div style={styles.promoContent}>
              <h3 style={styles.promoTitle} className="landing-promo-title">High-Quality Deck Restoration Products</h3>
              <ul style={styles.promoList} className="landing-promo-list">
                <li style={styles.promoListItem} className="landing-promo-item">
                  <span style={styles.promoCheck}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  Weather Resistant
                </li>
                <li style={styles.promoListItem} className="landing-promo-item">
                  <span style={styles.promoCheck}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  Long-Lasting Protection
                </li>
                <li style={styles.promoListItem} className="landing-promo-item">
                  <span style={styles.promoCheck}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  Enhances Natural Beauty
                </li>
              </ul>
              <a
                href={DRP_SHOP_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.shopProductsBtn}
                className="btn-hover"
              >
                Shop Products →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. RECENT DECK RESTORATION PROJECTS (Deck-Only Caption-Matched) */}
      {/* ======================================================== */}
      <section id="projects" style={styles.screenSection} className="landing-screen-section">
        <div style={styles.projectsHeaderRow} className="landing-projects-header-row">
          <div>
            <div style={styles.titleWithLines} className="landing-title-with-lines">
              <span style={styles.woodAccentLine} className="landing-title-line" />
              <h2 style={styles.sectionTitle} className="landing-section-title">Recent Deck Restoration Projects</h2>
              <span style={styles.woodAccentLine} className="landing-title-line" />
            </div>
            <p style={styles.sectionSubtitle} className="landing-section-subtitle">
              See the transformation for yourself — tap any card to compare Before &amp; After.
            </p>
          </div>
          <a
            href="https://www.deckrestorationplus.com/portfolio"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.viewAllProjectsBtn}
            className="btn-hover"
          >
            View All Projects →
          </a>
        </div>

        <div style={styles.projectsGrid} className="landing-projects-grid">
          {PROJECTS_LIST.map((proj) => {
            const view = projectViews[proj.id];
            const isBefore = view === 'before';
            return (
              <div
                key={proj.id}
                style={styles.projectCard}
                className="hover-card"
                onClick={() => toggleProjectView(proj.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleProjectView(proj.id);
                  }
                }}
                title="Click to toggle Before / After view"
              >
                <div style={styles.projectImgBox} className="landing-project-img-box">
                  <img
                    src={isBefore ? proj.beforeImg : proj.afterImg}
                    alt={`${proj.title} (${isBefore ? 'Before' : 'After'})`}
                    style={styles.projectImg}
                  />
                  <div style={styles.sliderPillBar}>
                    <span style={isBefore ? styles.sliderBadgeActive : styles.sliderBadgeInactive}>
                      BEFORE
                    </span>
                    <span style={styles.sliderDivider}>↔</span>
                    <span style={!isBefore ? styles.sliderBadgeActive : styles.sliderBadgeInactive}>
                      AFTER
                    </span>
                  </div>
                </div>
                <div style={styles.projectDetails} className="landing-project-details">
                  <h4 style={styles.projectTitle} className="landing-project-title">{proj.title}</h4>
                  <p style={styles.projectMeta}>{proj.meta}</p>
                  <p style={styles.projectCaption}>
                    {isBefore ? `Before: ${proj.beforeCaption}` : `After: ${proj.afterCaption}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. HOW IT WORKS SECTION */}
      {/* ======================================================== */}
      <section id="how-it-works" style={styles.screenSection} className="landing-screen-section">
        <div style={styles.sectionHeaderCentered} className="landing-section-header">
          <h2 style={styles.sectionTitle} className="landing-section-title">How It Works</h2>
          <p style={styles.sectionSubtitle} className="landing-section-subtitle">
            A simple, hassle-free process to restore your deck.
          </p>
        </div>

        <div style={styles.stepsContainer} className="landing-steps-container">
          <div style={styles.stepCard} className="hover-card landing-step-card">
            <div style={styles.stepHeaderRow} className="landing-step-header">
              <div style={styles.stepNumberBadge}>1</div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E07A2B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
            <h4 style={styles.stepTitle} className="landing-step-title">Get an Estimate</h4>
            <p style={styles.stepDesc} className="landing-step-desc">
              Use our calculator or request an official contractor quote in seconds.
            </p>
          </div>

          <div style={styles.stepArrow} className="landing-step-arrow">→</div>

          <div style={styles.stepCard} className="hover-card landing-step-card">
            <div style={styles.stepHeaderRow} className="landing-step-header">
              <div style={styles.stepNumberBadge}>2</div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E07A2B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h4 style={styles.stepTitle} className="landing-step-title">Schedule Service</h4>
            <p style={styles.stepDesc} className="landing-step-desc">
              Choose an inspection and service schedule that works best for you.
            </p>
          </div>

          <div style={styles.stepArrow} className="landing-step-arrow">→</div>

          <div style={styles.stepCard} className="hover-card landing-step-card">
            <div style={styles.stepHeaderRow} className="landing-step-header">
              <div style={styles.stepNumberBadge}>3</div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E07A2B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18.37 2.63L14 7l3 3 4.37-4.37a2.12 2.12 0 1 0-3-3z" />
                <path d="M9 12l-6 6a3 3 0 0 0 4.24 4.24l6-6" />
              </svg>
            </div>
            <h4 style={styles.stepTitle} className="landing-step-title">We Restore Your Deck</h4>
            <p style={styles.stepDesc} className="landing-step-desc">
              Our licensed specialists deep clean, refinish, and protect every board.
            </p>
          </div>

          <div style={styles.stepArrow} className="landing-step-arrow">→</div>

          <div style={styles.stepCard} className="hover-card landing-step-card">
            <div style={styles.stepHeaderRow} className="landing-step-header">
              <div style={styles.stepNumberBadge}>4</div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E07A2B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <h4 style={styles.stepTitle} className="landing-step-title">Enjoy Your Space</h4>
            <p style={styles.stepDesc} className="landing-step-desc">
              A beautiful, weather-resistant outdoor space built to last for years.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. WHAT OUR CUSTOMERS SAY (Person Icon + Human Reviews) */}
      {/* ======================================================== */}
      <section style={styles.screenSection} className="landing-screen-section">
        <div style={styles.testimonialHeaderRow} className="landing-testimonial-header-row">
          <div>
            <h2 style={styles.sectionTitle} className="landing-section-title">What Our Customers Say</h2>
            <p style={styles.sectionSubtitle} className="landing-section-subtitle">
              Real feedback from homeowners who restored their decks with us.
            </p>
          </div>
          <div style={styles.carouselBtnGroup}>
            <button onClick={handlePrevTestimonial} style={styles.carouselBtn} aria-label="Previous review" title="Previous review">
              ←
            </button>
            <button onClick={handleNextTestimonial} style={styles.carouselBtn} aria-label="Next review" title="Next review">
              →
            </button>
          </div>
        </div>

        <div style={styles.testimonialsGrid} className="landing-testimonials-grid">
          {orderedTestimonials.map((t) => (
            <div key={t.name} style={styles.testimonialCard} className="hover-card landing-testimonial-card">
              <div style={styles.testimonialUserRow}>
                <div style={styles.testimonialAvatarIcon} aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0F2C59" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <h4 style={styles.testimonialName}>{t.name}</h4>
                  <span style={styles.testimonialRole}>{t.role}</span>
                </div>
              </div>
              <div style={{ ...styles.starsRow, display: 'flex', gap: '3px' }}>
                {[...Array(t.stars || 5)].map((_, sIdx) => (
                  <svg key={sIdx} width="15" height="15" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p style={styles.testimonialText} className="landing-testimonial-text">{t.text}</p>
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
      <section style={styles.preFooterCtaSection} className="landing-cta-section">
        <div style={styles.ctaBannerContainer} className="landing-cta-banner">
          <img src={ctaDeckBgImg} alt="Restored wood deck background" style={styles.ctaBgImg} />
          <div style={styles.ctaDarkOverlay} />
          <div style={styles.ctaContent}>
            <h2 style={styles.ctaHeadline} className="landing-cta-headline">Ready to Restore Your Deck?</h2>
            <p style={styles.ctaSubhead} className="landing-cta-subhead">
              Get a fast, accurate estimate and bring your outdoor space back to life.
            </p>
            <button onClick={handleLaunchEstimator} style={styles.ctaBannerBtn} className="btn-hover landing-cta-btn">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
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
      {/* 10. OFFICIAL FOOTER (Site Map, Policies, Contact & Socials) */}
      {/* ======================================================== */}
      <footer id="footer" style={styles.footer} className="landing-footer">
        <div style={styles.footerContainer} className="landing-footer-grid">
          {/* Col 1: Brand & Socials */}
          <div style={styles.footerColBrand} className="landing-footer-brand">
            <Link to="/" style={styles.footerLogoLink}>
              <img src={footerLogo} alt="Deck Restoration Plus" style={styles.footerLogoImg} />
            </Link>
            <p style={styles.footerBrandDesc}>
              Premium deck restoration solutions for homes and contractors. Specialized formulas, licensed partner network, and guaranteed precision estimating.
            </p>
            <div style={styles.socialRow}>
              <a
                href="https://www.instagram.com/deckrestorationplus"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.socialIcon}
                className="drp-social-icon"
                aria-label="Instagram"
                title="Instagram"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/DeckRestorationPlus08088/"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.socialIcon}
                className="drp-social-icon"
                aria-label="Facebook"
                title="Facebook"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://twitter.com/DeckRestoration"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.socialIcon}
                className="drp-social-icon"
                aria-label="Twitter"
                title="Twitter / X"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/channel/UCB0oRnZ0n6s0Fw3BfA2P9qA"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.socialIcon}
                className="drp-social-icon"
                aria-label="YouTube"
                title="YouTube"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                </svg>
              </a>
              <a
                href="https://www.pinterest.com/DeckRestorationPlus/"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.socialIcon}
                className="drp-social-icon"
                aria-label="Pinterest"
                title="Pinterest"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 20l4-9" />
                  <path d="M10.7 14c.437 1.263 1.43 2 2.55 2c2.071 0 3.75 -1.554 3.75 -4a5 5 0 1 0 -9.7 1.7" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Site Map */}
          <div style={styles.footerCol}>
            <h4 style={styles.footerColHeading}>Site Map</h4>
            <ul style={styles.footerList}>
              <li><a href="https://www.deckrestorationplus.com/home" target="_blank" rel="noopener noreferrer" style={styles.footerLink} className="drp-footer-link">Home</a></li>
              <li><a href="https://www.deckrestorationplus.com/about-drp" target="_blank" rel="noopener noreferrer" style={styles.footerLink} className="drp-footer-link">About</a></li>
              <li><a href="https://www.deckrestorationplus.com/services" target="_blank" rel="noopener noreferrer" style={styles.footerLink} className="drp-footer-link">Services</a></li>
              <li><a href="https://www.deckrestorationplus.com/shop" target="_blank" rel="noopener noreferrer" style={styles.footerLink} className="drp-footer-link">Supplies</a></li>
              <li><a href="https://www.deckrestorationplus.com/portfolio" target="_blank" rel="noopener noreferrer" style={styles.footerLink} className="drp-footer-link">Portfolio</a></li>
              <li><a href="https://www.deckrestorationplus.com/shop" target="_blank" rel="noopener noreferrer" style={styles.footerLink} className="drp-footer-link">Shop</a></li>
              <li><a href="https://www.deckrestorationplus.com/blog" target="_blank" rel="noopener noreferrer" style={styles.footerLink} className="drp-footer-link">Blog</a></li>
              <li><a href="https://www.deckrestorationplus.com/distributors" target="_blank" rel="noopener noreferrer" style={styles.footerLink} className="drp-footer-link">Distributors</a></li>
              <li><a href="https://www.deckrestorationplus.com/shop/p/manual" target="_blank" rel="noopener noreferrer" style={styles.footerLink} className="drp-footer-link">Deck Restoration Manual</a></li>
            </ul>
          </div>

          {/* Col 3: Policies & Platform */}
          <div style={styles.footerCol}>
            <h4 style={styles.footerColHeading}>Policies</h4>
            <ul style={styles.footerList}>
              <li><a href="https://www.deckrestorationplus.com/privacy-policy" target="_blank" rel="noopener noreferrer" style={styles.footerLink} className="drp-footer-link">Privacy Policy</a></li>
              <li><a href="https://www.deckrestorationplus.com/refund-policy" target="_blank" rel="noopener noreferrer" style={styles.footerLink} className="drp-footer-link">Refund Policy</a></li>
              <li><a href="https://www.deckrestorationplus.com/terms-of-use" target="_blank" rel="noopener noreferrer" style={styles.footerLink} className="drp-footer-link">Terms of Use</a></li>
            </ul>

            <h4 style={{ ...styles.footerColHeading, marginTop: '22px' }}>Estimator Portal</h4>
            <ul style={styles.footerList}>
              <li><Link to="/estimator" style={styles.footerLink} className="drp-footer-link">Deck Calculator</Link></li>
              <li><Link to="/register" style={styles.footerLink} className="drp-footer-link">Contractor &amp; Customer Sign Up</Link></li>
              <li><Link to="/login" style={styles.footerLink} className="drp-footer-link">Sign In</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div style={styles.footerCol} className="landing-footer-contact">
            <h4 style={styles.footerColHeading}>Contact</h4>
            <div style={styles.footerContactCompany}>Deck Restoration Plus</div>

            <div style={styles.footerContactRow}>
              <span style={styles.footerContactIcon}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <span style={styles.footerContactText}>
                152 Indian Mills Road Unit #B<br />
                Shamong, NJ 08088
              </span>
            </div>

            <div style={styles.footerContactRow}>
              <span style={styles.footerContactIcon}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
              <a href="tel:+18664403325" style={styles.footerContactLink} className="drp-footer-link">
                Main Office: (866) 440-DECK
              </a>
            </div>

            <div style={styles.footerContactRow}>
              <span style={styles.footerContactIcon}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
              <a href="tel:+16092683436" style={styles.footerContactLink} className="drp-footer-link">
                Shamong: (609) 268-3436
              </a>
            </div>

            <div style={styles.footerContactRow}>
              <span style={styles.footerContactIcon}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <a
                href="mailto:info@deckrestorationplus.com?subject=Website%20Inquiry"
                style={{ ...styles.footerContactLink, wordBreak: 'break-word' }}
                className="drp-footer-link"
              >
                info@deckrestorationplus.com
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div style={styles.footerBottomBar} className="landing-footer-bottom">
          <div style={styles.footerBottomInner} className="landing-footer-bottom-inner">
            <span>
              Site designed by{' '}
              <a
                href="https://www.guidepostcreative.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.footerBottomLink}
                className="drp-footer-link"
              >
                Guidepost Creative
              </a>{' '}
              | © 2024 Deck Restoration Plus
            </span>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <a href="https://www.deckrestorationplus.com/privacy-policy" target="_blank" rel="noopener noreferrer" style={styles.footerBottomLink} className="drp-footer-link">
                Privacy Policy
              </a>
              <a href="https://www.deckrestorationplus.com/refund-policy" target="_blank" rel="noopener noreferrer" style={styles.footerBottomLink} className="drp-footer-link">
                Refund Policy
              </a>
              <a href="https://www.deckrestorationplus.com/terms-of-use" target="_blank" rel="noopener noreferrer" style={styles.footerBottomLink} className="drp-footer-link">
                Terms of Use
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ========================================================
// STYLES OBJECT
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(226, 232, 240, 0.85)',
    boxShadow: '0 2px 12px rgba(15, 44, 89, 0.04)',
  },
  headerInner: {
    maxWidth: '1360px',
    margin: '0 auto',
    padding: '12px 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  logoLink: {
    display: 'inline-flex',
    alignItems: 'center',
    textDecoration: 'none',
    flexShrink: 0,
  },
  logoImg: {
    height: '44px',
    width: 'auto',
    objectFit: 'contain',
  },
  navMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  navItem: {
    padding: '8px 14px',
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
    padding: '8px 14px',
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
    gap: '12px',
    flexShrink: 0,
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
    padding: '10px 20px',
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
  hamburgerBtn: {
    background: '#F1F5F9',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    width: '34px',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#0F2C59',
  },
  mobileDrawer: {
    backgroundColor: '#FFFFFF',
    borderBottom: '2px solid #E2E8F0',
    padding: '12px 16px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    boxShadow: '0 12px 24px rgba(15, 44, 89, 0.12)',
  },
  mobileNavItem: {
    padding: '10px 12px',
    fontSize: '14.5px',
    fontWeight: '600',
    color: '#1E293B',
    backgroundColor: '#F8FAFC',
    border: '1px solid #F1F5F9',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
  },
  searchDropdownBar: {
    maxWidth: '1360px',
    margin: '0 auto',
    padding: '10px 28px 14px 28px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  searchDropdownInput: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid #CBD5E1',
    fontSize: '14px',
    outline: 'none',
  },
  searchGoBtn: {
    padding: '9px 16px',
    borderRadius: '8px',
    backgroundColor: '#0F2C59',
    color: '#FFFFFF',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
  },
  searchCloseBtn: {
    padding: '9px 12px',
    borderRadius: '8px',
    backgroundColor: '#F1F5F9',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 2. HERO SECTION
  heroSection: {
    minHeight: '90vh',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    backgroundImage: `url("${wizardHeroImg}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'right 25% center',
    backgroundRepeat: 'no-repeat',
    overflow: 'hidden',
    padding: '60px 24px 72px 24px',
    scrollMarginTop: '72px',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(90deg, #FFFFFF 0%, rgba(255, 255, 255, 0.98) 32%, rgba(255, 255, 255, 0.84) 48%, rgba(255, 255, 255, 0.18) 68%, rgba(255, 255, 255, 0) 84%)',
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
    marginBottom: '18px',
  },
  heroHeading: {
    fontSize: '54px',
    fontWeight: '900',
    lineHeight: 1.12,
    color: '#0F2C59',
    margin: '0 0 18px 0',
    letterSpacing: '-1.4px',
  },
  heroAccentWord: {
    color: '#A35422',
  },
  heroSubtitle: {
    fontSize: '17px',
    lineHeight: 1.6,
    color: '#475569',
    margin: '0 0 28px 0',
    maxWidth: '540px',
  },
  heroBtnRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '32px',
    flexWrap: 'wrap',
  },
  heroPrimaryBtn: {
    padding: '14px 26px',
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
    padding: '12px 22px',
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
    gap: '22px',
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
    top: '34px',
    right: '56px',
    backgroundColor: '#78350F',
    backgroundImage: 'linear-gradient(135deg, #92400E 0%, #78350F 100%)',
    color: '#FEF3C7',
    padding: '12px 24px',
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
    fontSize: '12.5px',
    fontWeight: '800',
    letterSpacing: '0.4px',
    textTransform: 'uppercase',
  },
  woodStickerTextBottom: {
    fontSize: '15.5px',
    fontWeight: '900',
    color: '#FFFFFF',
    textShadow: '0 2px 4px rgba(0,0,0,0.4)',
  },

  // 3. CALCULATOR & STATS SECTION
  calculatorSection: {
    padding: '40px 24px 56px 24px',
    backgroundColor: '#FFFFFF',
    borderTop: '1px solid #E2E8F0',
    borderBottom: '1px solid #E2E8F0',
    scrollMarginTop: '72px',
  },
  calculatorSectionInner: {
    maxWidth: '1360px',
    margin: '0 auto',
  },
  calcBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: '22px',
    border: '1.5px solid #E2E8F0',
    boxShadow: '0 16px 36px -8px rgba(15, 44, 89, 0.08)',
    padding: '24px',
    display: 'grid',
    gridTemplateColumns: '250px 1.4fr 290px',
    gap: '26px',
    alignItems: 'center',
    marginBottom: '36px',
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
    display: 'inline-flex',
    alignItems: 'center',
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
    width: '100%',
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
    padding: '18px',
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
    gap: '12px',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: '21px',
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
    height: '40px',
    backgroundColor: '#E2E8F0',
  },

  // GENERIC SECTION
  screenSection: {
    minHeight: '82vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    maxWidth: '1360px',
    margin: '0 auto',
    padding: '64px 24px',
    scrollMarginTop: '72px',
  },
  sectionHeaderCentered: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  titleWithLines: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '16px',
    justifyContent: 'center',
    marginBottom: '8px',
    maxWidth: '100%',
  },
  woodAccentLine: {
    display: 'inline-block',
    width: '40px',
    height: '3px',
    backgroundColor: '#E07A2B',
    borderRadius: '2px',
    flexShrink: 0,
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
    gap: '28px',
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
    height: '230px',
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
    padding: '22px',
    position: 'relative',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  serviceIconPill: {
    position: 'absolute',
    top: '-22px',
    left: '22px',
    width: '44px',
    height: '44px',
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
    margin: '14px 0 8px 0',
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
    gap: '26px',
    alignItems: 'stretch',
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    padding: '16px 14px',
    textAlign: 'center',
    boxShadow: '0 4px 14px rgba(15, 44, 89, 0.04)',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
  },
  productImgFrame: {
    height: '112px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10px',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  productImg: {
    maxHeight: '104px',
    maxWidth: '100%',
    objectFit: 'contain',
    borderRadius: '8px',
  },
  productTitle: {
    fontSize: '13.5px',
    fontWeight: '800',
    color: '#0F2C59',
  },
  productCaption: {
    fontSize: '11.5px',
    fontWeight: '500',
    color: '#64748B',
    marginTop: '3px',
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
    padding: '34px 30px',
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
    fontSize: '23px',
    fontWeight: '900',
    lineHeight: 1.25,
    margin: '0 0 18px 0',
  },
  promoList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 26px 0',
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
    display: 'inline-flex',
    alignItems: 'center',
  },
  shopProductsBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '12px 24px',
    borderRadius: '9999px',
    border: 'none',
    backgroundColor: '#E07A2B',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    textDecoration: 'none',
    boxShadow: '0 4px 14px rgba(224, 122, 43, 0.4)',
    transition: 'all 0.25s',
  },

  // 6. PROJECTS SECTION
  projectsHeaderRow: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  viewAllProjectsBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '10px 20px',
    borderRadius: '9999px',
    border: '1.5px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    color: '#0F2C59',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.25s',
  },
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
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
    height: '205px',
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
    top: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    backdropFilter: 'blur(8px)',
    borderRadius: '9999px',
    padding: '4px 10px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
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
    padding: '14px 16px',
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
    fontWeight: '600',
  },
  projectCaption: {
    fontSize: '11.5px',
    color: '#A35422',
    margin: '4px 0 0 0',
    fontWeight: '600',
  },

  // 7. HOW IT WORKS
  stepsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr auto 1fr auto 1fr',
    alignItems: 'center',
    gap: '14px',
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '18px',
    border: '1px solid #E2E8F0',
    padding: '26px 20px',
    boxShadow: '0 6px 20px -4px rgba(15, 44, 89, 0.06)',
    transition: 'all 0.3s ease',
  },
  stepHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '14px',
  },
  stepNumberBadge: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    fontWeight: '900',
    fontSize: '13.5px',
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
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '14px',
  },
  carouselBtnGroup: {
    display: 'flex',
    gap: '8px',
  },
  carouselBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '1px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    color: '#0F2C59',
    fontSize: '15px',
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
    gap: '22px',
  },
  testimonialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '20px',
    border: '1px solid #E2E8F0',
    padding: '26px',
    boxShadow: '0 8px 24px -4px rgba(15, 44, 89, 0.06)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
  },
  testimonialUserRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  testimonialAvatarIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: '#EEF2F6',
    border: '1.5px solid #CBD5E1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  testimonialName: {
    fontSize: '15.5px',
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
    fontSize: '15px',
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
    margin: '0 auto 56px auto',
    padding: '0 24px',
  },
  ctaBannerContainer: {
    borderRadius: '24px',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0F2C59',
    padding: '54px 36px',
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
    fontSize: '36px',
    fontWeight: '900',
    color: '#FFFFFF',
    margin: '0 0 12px 0',
    letterSpacing: '-0.8px',
  },
  ctaSubhead: {
    fontSize: '16px',
    color: '#E2E8F0',
    lineHeight: 1.6,
    margin: '0 0 26px 0',
  },
  ctaBannerBtn: {
    padding: '14px 32px',
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
    paddingTop: '28px',
    scrollMarginTop: '72px',
  },
  footerContainer: {
    maxWidth: '1360px',
    margin: '0 auto',
    padding: '0 24px 20px 24px',
    display: 'grid',
    gridTemplateColumns: '1.35fr 0.9fr 0.95fr 1.25fr',
    gap: '22px',
  },
  footerColBrand: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  footerLogoLink: {
    display: 'inline-block',
  },
  footerLogoImg: {
    height: '32px',
    width: 'auto',
    filter: 'brightness(1.1)',
  },
  footerBrandDesc: {
    fontSize: '12px',
    lineHeight: 1.5,
    color: '#94A3B8',
    margin: 0,
    maxWidth: '290px',
  },
  footerCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  footerColHeading: {
    fontSize: '12.5px',
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    margin: '0 0 9px 0',
  },
  footerList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  footerLink: {
    fontSize: '12px',
    color: '#94A3B8',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  footerContactCompany: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: '8px',
  },
  footerContactRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '12px',
    marginBottom: '6px',
    color: '#CBD5E1',
  },
  footerContactIcon: {
    color: '#E07A2B',
    marginTop: '2px',
    flexShrink: 0,
  },
  footerContactLink: {
    color: '#CBD5E1',
    textDecoration: 'none',
    fontWeight: '500',
    lineHeight: 1.4,
  },
  footerContactText: {
    color: '#94A3B8',
    lineHeight: 1.4,
  },
  socialRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px',
    flexWrap: 'wrap',
  },
  socialIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '7px',
    backgroundColor: '#1E293B',
    color: '#CBD5E1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    transition: 'all 0.2s',
  },
  footerBottomBar: {
    borderTop: '1px solid #1E293B',
    padding: '12px 24px',
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
    color: '#94A3B8',
    textDecoration: 'none',
  },
};

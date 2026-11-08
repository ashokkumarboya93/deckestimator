// ========================================================
// Deck Estimator — Customer Help & Support Documentation
// ========================================================
// Comprehensive Guide:
// - Mobilization Minimum ($2,500) & Travel Thresholds (>45 mins = $3,000)
// - Step-by-Step Calculator Inputs & Architectural Specifications
// - Interactive Reach Out & Inquiry Form (Synced with DB via leadApi.submitReachOut)
// - Highlighted Business Contact Information & Operating Hours
// - Frequently Asked Questions (FAQ) with Interactive Accordion
// - Vector SVGs only (Strictly No Emojis)
// ========================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { leadApi } from '../api/leadApi';

export default function CustomerSupportPage() {
  const { user } = useAuth();

  // Inquiry Form State
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || user?.phoneNumber || '',
    subject: 'Estimator & Scope Guidance',
    message: '',
    deckSize: '',
    woodType: 'pressure_treated_pine',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Active FAQ Accordion Index (allows toggling)
  const [activeFaq, setActiveFaq] = useState(null);

  // Quick Copy Feedback State
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText('estimates@deckrestorationplus.com');
    }
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  // Quick navigation scroll helper
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleInputChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      setSubmitError('Please enter a brief message or question describing your request.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await leadApi.submitReachOut({
        contactSource: 'Customer Support Documentation Portal',
        subject: formData.subject,
        message: formData.message.trim(),
        additionalNotes: `Customer: ${formData.fullName} | Email: ${formData.email} | Phone: ${formData.phone || 'N/A'} | Deck Details: ${formData.deckSize || 'Unspecified sqft'}, Wood: ${formData.woodType}`,
      });
      setSubmitSuccess(true);
      setFormData((prev) => ({ ...prev, message: '' }));
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 7000);
    } catch (err) {
      setSubmitError(err.message || 'Unable to submit inquiry. Please try again or call our office.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (idx) => {
    setActiveFaq((prev) => (prev === idx ? null : idx));
  };

  const faqs = [
    {
      q: 'How does the Deck Restoration Plus continuous estimator calculate prices?',
      a: 'Our calculation engine uses a certified mathematical rate matrix based on actual usable square footage, vertical elevation staging, wood density resistance, and restorative operations. Base washing starts at $2.50 per square foot, with incremental material coatings (semi-transparent penetrating oil or solid body stain) adding standard $1.00/sq.ft tiers. All labor hours, commercial-grade chemical neutralizers, orbital abrasives, and travel mobilization are factored transparently.',
    },
    {
      q: 'Why is there a $2,500 standard mobilization minimum?',
      a: 'Every Deck Restoration Plus project deployment requires a multi-technician certified crew, commercial pressure washing and chemical regulation rigs, specialized orbital sanders, multi-coat penetrating supplies, and comprehensive job site protection. The $2,500 mobilization floor guarantees that even smaller platforms receive the full commercial-grade treatment, preparation rigor, and our 1-year certified warranty.',
    },
    {
      q: 'How does the 45-minute travel threshold ($3,000 minimum) work?',
      a: 'For properties situated beyond a 45-minute drive from our Shamong, NJ dispatch headquarters, crew travel, fuel logistics, and multi-trip staging require an elevated mobilization minimum of $3,000. When calculating your estimate, entering an address outside this radius will automatically account for transit mobilization.',
    },
    {
      q: 'Can composite or Trex decks be restored, stained, or sealed?',
      a: 'Composite materials like Trex require specialized chemical-free thermal cleaning and bio-spore removal to prevent voiding manufacturer warranties. Our estimator automatically enforces the "Trex Lock Rule": composite decks are restricted to certified cleaning and maintenance treatments, preventing incompatible stains or chemical stripping agents.',
    },
    {
      q: 'What is the difference between deck cleaning, sealing, and staining?',
      a: 'Cleaning removes accumulated mildew, algae, gray oxidized wood fibers, and atmospheric grime. Sealing provides a water-repellent barrier that keeps liquid moisture from penetrating into the grain. Staining introduces ultraviolet-blocking pigments that protect wood lignin from sun degradation while enhancing the architectural natural grain color.',
    },
    {
      q: 'What happens when I click "Inquiry this Estimation"?',
      a: 'Clicking "Inquiry this Estimation" immediately converts your calculated estimate into an active project inquiry in our central management portal. A senior Deck Restoration Plus estimator is assigned to review your parameters, verify uploaded photos, confirm your site address, and schedule an on-site inspection.',
    },
    {
      q: 'What weather conditions are required for deck restoration?',
      a: 'Deep chemical washing and orbital sanding require dry wood with moisture content below 15%. Penetrating oil stains and sealers require 24 to 48 hours of rain-free forecast with temperatures consistently above 50°F (10°C). Our dispatch team constantly monitors local meteorological radar before staging crews.',
    },
    {
      q: 'What does the 1-Year Workmanship Warranty cover?',
      a: 'Our standard 1-year warranty covers all multi-coat penetrating applications against peeling, premature fading, blistering, or flaking under standard residential usage. Should any substrate issue develop, a certified technician will inspect and remedy the treated area promptly.',
    },
    {
      q: 'How are stairs, railings, and pergolas calculated?',
      a: 'Stairs are billed dynamically at 12 square feet per step (accounting for the tread, vertical riser, stringers, and perimeter edging). Railings are computed based on linear footage covering top rails, bottom rails, and multi-sided balusters. Pergolas and privacy walls factor multi-faceted surface exposures.',
    },
    {
      q: 'How do I download or print my official estimate document?',
      a: 'On the estimator results box, or within the My Projects page under "Actions", click the "Export" or "Print" button. This dynamically compiles an official, print-ready HTML/PDF document containing your complete project specifications, customer details, guarantee badges, and company contact information.',
    },
  ];

  return (
    <div style={styles.pageContainer}>
      {/* ======================================================== */}
      {/* 1. HERO BANNER & QUICK JUMP BAR */}
      {/* ======================================================== */}
      <section style={styles.heroBanner}>
        <div style={styles.heroContent}>
          <div style={styles.heroBadgeRow}>
            <span style={styles.heroBadge}>Deck Restoration Plus</span>
            <span style={styles.heroSubBadge}>Customer Guidance &amp; Reference Hub</span>
          </div>
          <h1 style={styles.heroTitle}>Estimator Documentation &amp; Support</h1>
          <p style={styles.heroDescription}>
            Explore our architectural calculator guide, wood substrate science, standard mobilization policies, and direct contractor consultation channels.
          </p>

          {/* Quick Jump Buttons */}
          <div style={styles.jumpButtonsRow}>
            <button type="button" onClick={() => scrollToSection('rates-policies')} style={styles.jumpBtn}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span>Rates &amp; Mobilization</span>
            </button>
            <button type="button" onClick={() => scrollToSection('calculator-guide')} style={styles.jumpBtn}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="8" y1="6" x2="16" y2="6" />
                <line x1="8" y1="10" x2="16" y2="10" />
                <line x1="8" y1="14" x2="16" y2="14" />
                <line x1="8" y1="18" x2="12" y2="18" />
              </svg>
              <span>Calculator Steps</span>
            </button>
            <button type="button" onClick={() => scrollToSection('reachout-form')} style={styles.jumpBtn}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Submit Inquiry</span>
            </button>
            <button type="button" onClick={() => scrollToSection('contact-hub')} style={styles.jumpBtn}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>Contact Business</span>
            </button>
            <button type="button" onClick={() => scrollToSection('faq-section')} style={styles.jumpBtn}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>FAQ</span>
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. RATES & MOBILIZATION POLICIES (HIGHLIGHTED FIRST) */}
      {/* ======================================================== */}
      <section id="rates-policies" style={styles.sectionWrap}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionIconBadge}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <h2 style={styles.sectionTitle}>Standard Mobilization Rates &amp; Travel Policies</h2>
            <p style={styles.sectionSubtitle}>
              Essential operational minimums and staging thresholds applied transparently across all client projects.
            </p>
          </div>
        </div>

        <div style={styles.policyGrid}>
          {/* Card 1: $2,500 Base Mobilization */}
          <div style={{ ...styles.policyCard, borderTop: '4px solid #1E3A63' }}>
            <div style={styles.policyCardTop}>
              <span style={{ ...styles.policyPill, backgroundColor: '#EFF6FF', color: '#1E3A63' }}>
                Standard Deployment
              </span>
              <strong style={{ ...styles.policyAmount, color: '#1E3A63' }}>$2,500 Floor</strong>
            </div>
            <h3 style={styles.policyCardTitle}>Base Project Mobilization Minimum</h3>
            <p style={styles.policyCardText}>
              Every Deck Restoration Plus deployment mobilizes a multi-technician certified crew, commercial-grade pressure regulation equipment, orbital mechanical sanders, and proprietary chemical neutralizers.
            </p>
            <div style={styles.policyCheckList}>
              <div style={styles.policyCheckItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Applies to jobs where calculated billable area is under $2,500</span>
              </div>
              <div style={styles.policyCheckItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Guarantees commercial equipment rigor and surface preparation</span>
              </div>
              <div style={styles.policyCheckItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Full multi-stage wash, mechanical orbital prep, and premium penetrating coat</span>
              </div>
            </div>
          </div>

          {/* Card 2: 45-Min Travel Threshold */}
          <div style={{ ...styles.policyCard, borderTop: '4px solid #D97706' }}>
            <div style={styles.policyCardTop}>
              <span style={{ ...styles.policyPill, backgroundColor: '#FFFBEB', color: '#92400E' }}>
                Distance Threshold
              </span>
              <strong style={{ ...styles.policyAmount, color: '#D97706' }}>$3,000 Minimum</strong>
            </div>
            <h3 style={styles.policyCardTitle}>Travel Beyond 45 Minutes Radius</h3>
            <p style={styles.policyCardText}>
              When a job site is situated further than a 45-minute driving distance from our headquarters hub (Shamong, NJ), the job mobilization floor shifts from $2,500 to $3,000.
            </p>
            <div style={styles.policyCheckList}>
              <div style={styles.policyCheckItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Covers round-trip technician transit, fuel, and transport staging</span>
              </div>
              <div style={styles.policyCheckItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Accommodates multi-day drying inspections between chemical coats</span>
              </div>
              <div style={styles.policyCheckItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Automatically evaluated when project property address is provided</span>
              </div>
            </div>
          </div>

          {/* Card 3: Elevated Decks (8ft+) */}
          <div style={{ ...styles.policyCard, borderTop: '4px solid #475569' }}>
            <div style={styles.policyCardTop}>
              <span style={{ ...styles.policyPill, backgroundColor: '#F8FAFC', color: '#334155' }}>
                Safety &amp; Staging
              </span>
              <strong style={{ ...styles.policyAmount, color: '#334155' }}>Elevated Staging</strong>
            </div>
            <h3 style={styles.policyCardTitle}>Multi-Story Decks (8ft+ Height)</h3>
            <p style={styles.policyCardText}>
              Decks exceeding 8 feet off the grade require multi-story OSHA-compliant ladder rigging, scaffolding, safety harness anchor points, and underside joist staging protocols.
            </p>
            <div style={styles.policyCheckList}>
              <div style={styles.policyCheckItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Full perimeter ladder stabilization and worker fall protection</span>
              </div>
              <div style={styles.policyCheckItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Underside beam, post, and carriage inspection included</span>
              </div>
              <div style={styles.policyCheckItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Included seamlessly in Section 2 elevation tier calculations</span>
              </div>
            </div>
          </div>

          {/* Card 4: 1-Year Certified Warranty */}
          <div style={{ ...styles.policyCard, borderTop: '4px solid #15803D' }}>
            <div style={styles.policyCardTop}>
              <span style={{ ...styles.policyPill, backgroundColor: '#DCFCE7', color: '#15803D' }}>
                Quality Protection
              </span>
              <strong style={{ ...styles.policyAmount, color: '#15803D' }}>1-Year Guarantee</strong>
            </div>
            <h3 style={styles.policyCardTitle}>Certified Workmanship Warranty</h3>
            <p style={styles.policyCardText}>
              All multi-coat restorative staining and penetrations performed by Deck Restoration Plus include a comprehensive 1-year workmanship warranty against blistering, flaking, or peeling.
            </p>
            <div style={styles.policyCheckList}>
              <div style={styles.policyCheckItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Covers multi-coat oil stains and marine-grade penetrating sealers</span>
              </div>
              <div style={styles.policyCheckItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Backed by our licensed and certified contractor network</span>
              </div>
              <div style={styles.policyCheckItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Includes direct technical support and remedial inspection if needed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. CALCULATOR STEPS & DETAILED INPUTS BREAKDOWN */}
      {/* ======================================================== */}
      <section id="calculator-guide" style={styles.sectionWrap}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionIconBadge}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <line x1="8" y1="6" x2="16" y2="6" />
              <line x1="8" y1="10" x2="16" y2="10" />
              <line x1="8" y1="14" x2="16" y2="14" />
              <line x1="8" y1="18" x2="12" y2="18" />
            </svg>
          </div>
          <div>
            <h2 style={styles.sectionTitle}>Continuous Calculator: Step-by-Step Architecture</h2>
            <p style={styles.sectionSubtitle}>
              Detailed breakdown of how each input operates, its mathematical formulation, and its restorative impact.
            </p>
          </div>
        </div>

        <div style={styles.stepsTimeline}>
          {/* Step 1 */}
          <div style={styles.stepCard}>
            <div style={styles.stepHeaderRow}>
              <span style={styles.stepBadgeNum}>Step 1</span>
              <div>
                <h4 style={styles.stepTitle}>Deck Footprint &amp; Direct Dimensions</h4>
                <span style={styles.stepCategory}>Perimeter Geometry &bull; Usable Floor Area</span>
              </div>
            </div>
            <p style={styles.stepDesc}>
              Select your structural perimeter geometry and type the dimensions directly. The engine immediately computes your Usable Floor Area ($L \times W$) with zero estimation lag:
            </p>
            <div style={styles.stepGrid3}>
              <div style={styles.stepMiniCard}>
                <strong>Rectangle</strong>
                <p>Standard parallel joist layout with minimal lumber trimming and uniform square footage efficiency.</p>
              </div>
              <div style={styles.stepMiniCard}>
                <strong>Square</strong>
                <p>Concentric equilateral platform. Automatically copies Length into Width for rapid dimension entry.</p>
              </div>
              <div style={styles.stepMiniCard}>
                <strong>L-Shaped Wraparound</strong>
                <p>Dual-zone architectural platform wrapping building corners, featuring transitional framing runs.</p>
              </div>
              <div style={styles.stepMiniCard}>
                <strong>Multi-Level Stepped</strong>
                <p>Tiered platforms connected by wide stairs, accounting for sloped topography and structural posts.</p>
              </div>
              <div style={styles.stepMiniCard}>
                <strong>Custom Bespoke</strong>
                <p>Faceted, curved, or multi-angled perimeters designed around trees, pool margins, or architecture.</p>
              </div>
              <div style={styles.stepMiniCard}>
                <strong>Direct Numeric Inputs</strong>
                <p>Length and Width enforce direct numeric typing only (steppers and scroll-wheel increments disabled).</p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div style={styles.stepCard}>
            <div style={styles.stepHeaderRow}>
              <span style={styles.stepBadgeNum}>Step 2</span>
              <div>
                <h4 style={styles.stepTitle}>Site Accessibility &amp; Elevation Tiers</h4>
                <span style={styles.stepCategory}>Vertical Staging &bull; Rigging Complexity</span>
              </div>
            </div>
            <p style={styles.stepDesc}>
              Vertical height determines technician reach, ladder staging, and whether structural underside work is required:
            </p>
            <div style={styles.stepGrid3}>
              <div style={styles.stepMiniCard}>
                <strong>Ground Level (0–4 ft)</strong>
                <p>Walk-up platform with standard ground staging. Simplest technician staging with direct perimeter access.</p>
              </div>
              <div style={styles.stepMiniCard}>
                <strong>Elevated One-Story (4–8 ft)</strong>
                <p>Requires perimeter stepladders, elevated reach wands, and safety barriers along open edges.</p>
              </div>
              <div style={styles.stepMiniCard}>
                <strong>Multi-Story / High Elevation (8+ ft)</strong>
                <p>Requires multi-tier ladder rigging, harness anchors, and specialized underside support access.</p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div style={styles.stepCard}>
            <div style={styles.stepHeaderRow}>
              <span style={styles.stepBadgeNum}>Step 3</span>
              <div>
                <h4 style={styles.stepTitle}>Wood Species &amp; Material Substrate Science</h4>
                <span style={styles.stepCategory}>Lumber Density &bull; Absorption Rates &bull; Trex Lock Rule</span>
              </div>
            </div>
            <p style={styles.stepDesc}>
              Lumber density controls the chemical absorption speed, drying intervals, and labor hours required for deep penetration:
            </p>
            <div style={styles.stepGrid3}>
              <div style={styles.stepMiniCard}>
                <strong>Pressure Treated Pine</strong>
                <p>High porosity softwood requiring mold-clearing wash, pH balancing, and semi-transparent penetration.</p>
              </div>
              <div style={styles.stepMiniCard}>
                <strong>Western Red Cedar</strong>
                <p>Naturally rich in cedar oils; requires gentle chemical stripping to preserve softwood tannins.</p>
              </div>
              <div style={styles.stepMiniCard}>
                <strong>California Redwood</strong>
                <p>Highly resistant to decay; benefits from orbital leveling and rich oil replenishment.</p>
              </div>
              <div style={styles.stepMiniCard}>
                <strong>Hardwoods (Mahogany, Ipe, Meranti, Teak)</strong>
                <p>Ultra-dense grain; requires commercial mechanical orbital sanding to open fibers for deep oil intake.</p>
              </div>
              <div style={{ ...styles.stepMiniCard, border: '1.5px solid #1E3A63', backgroundColor: '#EFF6FF' }}>
                <strong style={{ color: '#1E3A63' }}>Trex / Composite (Rule R1)</strong>
                <p style={{ color: '#1E3A63' }}>
                  <strong>Strict Trex Lock:</strong> Composite decks are strictly limited to specialized cleaning only to protect manufacturer warranty and prevent peeling.
                </p>
              </div>
              <div style={styles.stepMiniCard}>
                <strong>Tigerwood &amp; Exotic Decking</strong>
                <p>Striated grain requiring specialized conditioning treatments to prevent cupping and surface checking.</p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div style={styles.stepCard}>
            <div style={styles.stepHeaderRow}>
              <span style={styles.stepBadgeNum}>Step 4</span>
              <div>
                <h4 style={styles.stepTitle}>Architectural Components &amp; Billable Add-ons</h4>
                <span style={styles.stepCategory}>Stairs &bull; Railings &bull; Pergolas &bull; Fascia</span>
              </div>
            </div>
            <p style={styles.stepDesc}>
              Decks are 3-dimensional structures. Additional vertical surfaces add billable surface area to the primary floor:
            </p>
            <div style={styles.stepGrid3}>
              <div style={styles.stepMiniCard}>
                <strong>Stairs &amp; Steps (12 sq ft / step)</strong>
                <p>Each step tread, riser, stringer, and nosing adds 12 billable square feet of meticulous hand work.</p>
              </div>
              <div style={styles.stepMiniCard}>
                <strong>Perimeter Railings</strong>
                <p>Includes top cap, bottom rail, and multi-sided balusters. Billed per linear foot or square foot equivalent.</p>
              </div>
              <div style={styles.stepMiniCard}>
                <strong>Pergolas &amp; Overheads</strong>
                <p>Overhead joists and beams requiring ladder staging, hand wiping, and weather shielding.</p>
              </div>
              <div style={styles.stepMiniCard}>
                <strong>Fascia Rim Boards</strong>
                <p>Outer perimeter trim boards surrounding the deck joist carriage, hand-brushed for a crisp look.</p>
              </div>
              <div style={styles.stepMiniCard}>
                <strong>Privacy Walls &amp; Lattice</strong>
                <p>Vertical tongue-and-groove or framed lattice panels requiring dual-sided chemical and stain coverage.</p>
              </div>
              <div style={styles.stepMiniCard}>
                <strong>Underside Joists</strong>
                <p>Treatment of floor framing joists for elevated decks visible from lower ground-level patios.</p>
              </div>
            </div>
          </div>

          {/* Step 5 & 6 */}
          <div style={styles.stepCard}>
            <div style={styles.stepHeaderRow}>
              <span style={styles.stepBadgeNum}>Steps 5 &amp; 6</span>
              <div>
                <h4 style={styles.stepTitle}>Substrate Condition &amp; Existing Coating Type</h4>
                <span style={styles.stepCategory}>Surface Defects &bull; Paint/Stain Removal Evaluation</span>
              </div>
            </div>
            <p style={styles.stepDesc}>
              Identifying pre-existing coatings and defect conditions determines the intensity of chemical stripping and orbital leveling:
            </p>
            <div style={styles.stepGrid3}>
              <div style={styles.stepMiniCard}>
                <strong>Weathered &amp; Gray Wood</strong>
                <p>Oxidized cellulose fibers. Requires commercial wood cleaner followed by oxalic acid brightening.</p>
              </div>
              <div style={styles.stepMiniCard}>
                <strong>Surface Cracks &amp; Checking</strong>
                <p>Micro-fissures caused by rapid moisture cycles; requires conditioning oil to restore flexibility.</p>
              </div>
              <div style={styles.stepMiniCard}>
                <strong>Rotted or Damaged Boards</strong>
                <p>Flagged for contractor confirmation; structural board replacement lines are cleanly separated.</p>
              </div>
              <div style={styles.stepMiniCard}>
                <strong>Peeling / Failed Finish</strong>
                <p>Existing solid stain or paint that has lost adhesion; mandates commercial chemical stripping and sanding.</p>
              </div>
              <div style={styles.stepMiniCard}>
                <strong>Mold &amp; Mildew Colonization</strong>
                <p>Deep bio-spore growth; treated with fungicidal detergents to prevent regrowth beneath new stains.</p>
              </div>
              <div style={styles.stepMiniCard}>
                <strong>Coating Type Categories</strong>
                <p>Clear sealer, Semi-transparent penetrating oil, Solid body stain, Acrylic/Alkyd paint, or Bare wood.</p>
              </div>
            </div>
          </div>

          {/* Step 7 */}
          <div style={styles.stepCard}>
            <div style={styles.stepHeaderRow}>
              <span style={styles.stepBadgeNum}>Step 7</span>
              <div>
                <h4 style={styles.stepTitle}>Restoration Scope of Work &amp; Operations</h4>
                <span style={styles.stepCategory}>Chemical Stripping &bull; Orbital Sanding &bull; Multi-Coat Penetration</span>
              </div>
            </div>
            <p style={styles.stepDesc}>
              Select operations tailored to your deck. Pricing starts at $2.50/sq.ft for prep with incremental +$1/sq.ft coating additions:
            </p>
            <div style={styles.stepGrid3}>
              <div style={styles.stepMiniCard}>
                <strong>Commercial Cleaning &amp; Washing</strong>
                <p>Biodegradable foaming surfactants lifted at regulated low-pressure to avoid gouging softwood grain.</p>
              </div>
              <div style={styles.stepMiniCard}>
                <strong>Chemical Coating Stripping</strong>
                <p>Dissolves failed oil and acrylic layers without harsh caustic scarring of natural lumber fibers.</p>
              </div>
              <div style={styles.stepMiniCard}>
                <strong>Mechanical Orbital Sanding</strong>
                <p>Eliminates raised wood fuzz, levels cupped boards, and creates an open pore surface for stain intake.</p>
              </div>
              <div style={styles.stepMiniCard}>
                <strong>Deep Penetrating Staining</strong>
                <p>Trans-oxide pigments suspended in rich natural oils that migrate deep into the wood cellular matrix.</p>
              </div>
              <div style={styles.stepMiniCard}>
                <strong>Marine-Grade Sealing</strong>
                <p>Silicone or wax-free paraffin barrier that shields wood against standing rain and freeze-thaw cycles.</p>
              </div>
              <div style={styles.stepMiniCard}>
                <strong>Wood Brightening &amp; pH Balance</strong>
                <p>Neutralizes alkaline wash solutions and restores the luminous natural amber tone of the wood.</p>
              </div>
            </div>
          </div>

          {/* Step 8 & 9 */}
          <div style={styles.stepCard}>
            <div style={styles.stepHeaderRow}>
              <span style={styles.stepBadgeNum}>Steps 8 &amp; 9</span>
              <div>
                <h4 style={styles.stepTitle}>Photo Documentation &amp; Instant Guaranteed Quote</h4>
                <span style={styles.stepCategory}>Visual Verification &bull; Inquiry Lead Conversion</span>
              </div>
            </div>
            <p style={styles.stepDesc}>
              Upload photos across four recommended categories (full view, close-up, stairs, problem areas). Click "Generate Official Estimate" in Section 9 to produce your guaranteed quote:
            </p>
            <div style={styles.stepGrid3}>
              <div style={styles.stepMiniCard}>
                <strong>Photo Category Guidance</strong>
                <p>Stand back for full perimeter context, then take macro shots of peeling paint, checks, or stairs.</p>
              </div>
              <div style={styles.stepMiniCard}>
                <strong>Instant Single Total Quote</strong>
                <p>Customers receive a guaranteed total figure backed by our mobilization and rate standards.</p>
              </div>
              <div style={styles.stepMiniCard}>
                <strong>Post-Estimate Action Suite</strong>
                <p>
                  <strong>Inquiry this Estimation</strong> (converts to lead for priority inspection), <strong>+ Another Estimation</strong> (reset), and <strong>Export</strong> (official PDF record).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. INTERACTIVE REACH OUT & PROJECT INQUIRY FORM */}
      {/* ======================================================== */}
      <section id="reachout-form" style={styles.sectionWrap}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionIconBadge}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <h2 style={styles.sectionTitle}>Submit Project Inquiry &amp; Reach Out</h2>
            <p style={styles.sectionSubtitle}>
              Have custom specifications, unusual framing, or need on-site contractor consultation? Send a direct request.
            </p>
          </div>
        </div>

        <div style={styles.formContainerCard}>
          {submitSuccess && (
            <div style={styles.successBanner}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <div>
                <strong style={{ color: '#15803D', fontSize: '14px', display: 'block' }}>Inquiry Successfully Submitted!</strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#166534' }}>
                  A Deck Restoration Plus senior estimator has been notified and will review your parameters. We will contact you within 24 business hours.
                </p>
              </div>
            </div>
          )}

          {submitError && (
            <div style={styles.errorBanner}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitInquiry} style={styles.inquiryForm}>
            <div style={styles.formRow2}>
              <div>
                <label style={styles.fieldLabel}>Your Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="e.g. Robert Smith"
                  required
                  style={styles.formInput}
                />
              </div>

              <div>
                <label style={styles.fieldLabel}>Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="e.g. robert@example.com"
                  required
                  style={styles.formInput}
                />
              </div>
            </div>

            <div style={styles.formRow3}>
              <div>
                <label style={styles.fieldLabel}>Contact Phone (Optional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(856) 555-0199"
                  style={styles.formInput}
                />
              </div>

              <div>
                <label style={styles.fieldLabel}>Approx. Deck Size (Sq Ft)</label>
                <input
                  type="text"
                  value={formData.deckSize}
                  onChange={(e) => handleInputChange('deckSize', e.target.value)}
                  placeholder="e.g. 450"
                  style={styles.formInput}
                />
              </div>

              <div>
                <label style={styles.fieldLabel}>Wood Substrate</label>
                <select
                  value={formData.woodType}
                  onChange={(e) => handleInputChange('woodType', e.target.value)}
                  style={styles.formSelect}
                >
                  <option value="pressure_treated_pine">Pressure Treated Pine</option>
                  <option value="cedar">Western Red Cedar</option>
                  <option value="redwood">California Redwood</option>
                  <option value="mahogany">Mahogany / Hardwood</option>
                  <option value="trex">Trex / Composite</option>
                  <option value="other">Other / Unsure</option>
                </select>
              </div>
            </div>

            <div>
              <label style={styles.fieldLabel}>Inquiry Subject *</label>
              <select
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                style={styles.formSelect}
              >
                <option value="Estimator & Scope Guidance">Estimator &amp; Scope Guidance</option>
                <option value="Custom Deck Geometry Assistance">Custom Deck Geometry Assistance</option>
                <option value="Mobilization & Travel Inquiry">Mobilization &amp; Travel Threshold Inquiry</option>
                <option value="Schedule On-Site Inspection">Schedule Certified On-Site Inspection</option>
                <option value="Structural Repair & Board Replacement">Structural Repair &amp; Board Replacement</option>
                <option value="Billing & Official Estimate Verification">Billing &amp; Official Estimate Verification</option>
              </select>
            </div>

            <div>
              <label style={styles.fieldLabel}>Detailed Message / Question *</label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Describe your deck requirements, specific areas of concern, or questions regarding our restoration process..."
                required
                style={{ ...styles.formInput, resize: 'vertical' }}
              />
            </div>

            <div style={styles.formSubmitRow}>
              <div style={styles.formPrivacyNote}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Inquiries are securely recorded and dispatched to certified estimators.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  ...styles.submitInquiryBtn,
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                <span>{isSubmitting ? 'Submitting to Estimators...' : 'Submit Support Inquiry'}</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. OFFICIAL BUSINESS CONTACT DETAILS & HEADQUARTERS HUB */}
      {/* ======================================================== */}
      <section id="contact-hub" style={styles.sectionWrap}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionIconBadge}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <div>
            <h2 style={styles.sectionTitle}>Deck Restoration Plus Contact Hub</h2>
            <p style={styles.sectionSubtitle}>
              Connect directly with our headquarters, licensed estimators, and certified field teams.
            </p>
          </div>
        </div>

        <div style={styles.contactCardGrid}>
          {/* Contact Item 1: Phone */}
          <div style={{ ...styles.contactItemCard, borderLeft: '4px solid #1E3A63' }}>
            <div style={{ ...styles.contactIconCircle, backgroundColor: '#EFF6FF', color: '#1E3A63', border: '1px solid #BFDBFE' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '3px' }}>
                <span style={styles.contactLabel}>Direct Office Line</span>
                <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '4px', backgroundColor: '#EFF6FF', color: '#1E3A63' }}>
                  Toll-Free
                </span>
              </div>
              <a href="tel:8566783325" style={{ ...styles.contactValueLink, fontSize: '15px' }}>
                (856) 678-3325
              </a>
              <span style={{ ...styles.contactSub, marginTop: '3px' }}>Toll-free customer consultation</span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                <a href="tel:8566783325" style={styles.phoneActionBtn} title="Call (856) 678-3325">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>Call Now</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Item 2: Email (Enhanced High-Visibility Mail Box & Buttons) */}
          <div style={{ ...styles.contactItemCard, borderLeft: '4px solid #E08131', backgroundColor: '#FFFFFF' }}>
            <div style={{ ...styles.contactIconCircle, backgroundColor: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '4px' }}>
                <span style={styles.contactLabel}>Estimates &amp; Inquiries</span>
                <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '4px', backgroundColor: '#FFFBEB', color: '#92400E' }}>
                  24h Turnaround
                </span>
              </div>
              
              {/* Highlighted Email Box container */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '6px 10px',
                marginTop: '4px',
                marginBottom: '6px'
              }}>
                <a
                  href="mailto:estimates@deckrestorationplus.com"
                  style={{
                    color: '#1E3A63',
                    fontSize: '13px',
                    fontWeight: '700',
                    lineHeight: 1.4,
                    textDecoration: 'none',
                    wordBreak: 'break-all',
                    overflowWrap: 'anywhere',
                    display: 'block',
                  }}
                  title="Send email to estimates@deckrestorationplus.com"
                >
                  estimates@deckrestorationplus.com
                </a>
              </div>
              <span style={{ ...styles.contactSub, marginTop: '2px' }}>Direct senior estimator inbox</span>

              {/* Action Buttons: Email Button + Quick Copy */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                <a
                  href="mailto:estimates@deckrestorationplus.com?subject=Deck%20Restoration%20Estimate%20Inquiry"
                  style={styles.mailActionBtn}
                  title="Open mail application"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  <span>Email Us</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  style={styles.mailCopyBtn}
                  title="Copy email address to clipboard"
                >
                  {copiedEmail ? (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span style={{ color: '#15803D', fontWeight: '700' }}>Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Contact Item 3: Headquarters Address */}
          <div style={{ ...styles.contactItemCard, borderLeft: '4px solid #15803D' }}>
            <div style={{ ...styles.contactIconCircle, backgroundColor: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={styles.contactLabel}>Corporate Headquarters</span>
              <strong style={styles.contactValueStatic}>
                152 Indian Mills Road
              </strong>
              <span style={{ ...styles.contactSub, marginTop: '2px' }}>Shamong, NJ 08088</span>
            </div>
          </div>

          {/* Contact Item 4: Business Hours */}
          <div style={{ ...styles.contactItemCard, borderLeft: '4px solid #475569' }}>
            <div style={{ ...styles.contactIconCircle, backgroundColor: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={styles.contactLabel}>Operating Hours</span>
              <strong style={styles.contactValueStatic}>
                Mon – Fri: 7:30 AM – 6:00 PM EST
              </strong>
              <span style={{ ...styles.contactSub, marginTop: '2px' }}>Sat: 8:00 AM – 2:00 PM | Sun: Closed</span>
            </div>
          </div>
        </div>

        {/* Credentials / Trust Banner */}
        <div style={styles.credentialsBanner}>
          <div style={styles.credentialsLeft}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <div>
              <strong style={{ fontSize: '13.5px', color: '#1E3A63' }}>DRP Certified Contractor Network &bull; Fully Licensed &amp; Insured</strong>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#475569' }}>
                All restoration technicians undergo formal training in wood substrate chemical safety, low-pressure surface cleaning, and EPA compliance.
              </p>
            </div>
          </div>
          <Link to="/customer/decks/new" style={styles.bannerStartEstBtn}>
            <span>Start New Estimate &rarr;</span>
          </Link>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. FREQUENTLY ASKED QUESTIONS (ACCORDION) */}
      {/* ======================================================== */}
      <section id="faq-section" style={styles.sectionWrap}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionIconBadge}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <h2 style={styles.sectionTitle}>Frequently Asked Questions</h2>
            <p style={styles.sectionSubtitle}>
              Authoritative answers to the most common customer questions regarding our pricing, process, and timber science.
            </p>
          </div>
        </div>

        <div style={styles.faqList}>
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} style={styles.faqCard}>
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  style={styles.faqQuestionBtn}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={styles.faqNumPill}>Q{idx + 1}</span>
                    <span style={styles.faqQuestionText}>{faq.q}</span>
                  </div>
                  <div style={{ ...styles.faqChevron, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div style={styles.faqAnswerBox}>
                    <p style={styles.faqAnswerText}>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ========================================================
// STYLES OBJECT (CLEAN NAVY BLUE #1E3A63 THEME, INTER FONT)
// ========================================================
const styles = {
  pageContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 24px 60px 24px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: '#0F172A',
  },

  // 1. Hero Banner
  heroBanner: {
    backgroundColor: '#1E3A63',
    borderRadius: '14px',
    padding: '36px 36px',
    color: '#FFFFFF',
    marginBottom: '32px',
    boxShadow: '0 10px 25px -5px rgba(30, 58, 99, 0.25)',
  },
  heroContent: {
    maxWidth: '900px',
  },
  heroBadgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
  },
  heroBadge: {
    backgroundColor: '#E08131',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: '800',
    padding: '3px 10px',
    borderRadius: '6px',
    letterSpacing: '0.6px',
    textTransform: 'uppercase',
  },
  heroSubBadge: {
    fontSize: '12px',
    color: '#BFDBFE',
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: '28px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    margin: '0 0 10px 0',
    lineHeight: 1.25,
  },
  heroDescription: {
    fontSize: '14px',
    color: '#E2E8F0',
    lineHeight: 1.6,
    margin: '0 0 22px 0',
  },
  jumpButtonsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  jumpBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '8px 14px',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },

  // Section Standard Layout
  sectionWrap: {
    marginBottom: '44px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '20px',
  },
  sectionIconBadge: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    backgroundColor: '#EFF6FF',
    border: '1px solid #BFDBFE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#1E3A63',
    margin: 0,
    letterSpacing: '-0.3px',
  },
  sectionSubtitle: {
    fontSize: '13px',
    color: '#64748B',
    margin: '3px 0 0 0',
  },

  // 2. Policy Cards Grid
  policyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '18px',
  },
  policyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    flexDirection: 'column',
  },
  policyCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  policyPill: {
    fontSize: '10px',
    fontWeight: '800',
    padding: '3px 8px',
    borderRadius: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  policyAmount: {
    fontSize: '18px',
    fontWeight: '900',
  },
  policyCardTitle: {
    fontSize: '15px',
    fontWeight: '750',
    color: '#0F172A',
    margin: '0 0 8px 0',
  },
  policyCardText: {
    fontSize: '12.5px',
    color: '#475569',
    lineHeight: 1.5,
    margin: '0 0 14px 0',
  },
  policyCheckList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
    marginTop: 'auto',
    borderTop: '1px solid #F1F5F9',
    paddingTop: '12px',
  },
  policyCheckItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '11.5px',
    color: '#334155',
    lineHeight: 1.4,
  },

  // 3. Calculator Steps
  stepsTimeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '22px 24px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
  },
  stepHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '10px',
  },
  stepBadgeNum: {
    backgroundColor: '#1E3A63',
    color: '#FFFFFF',
    fontSize: '12px',
    fontWeight: '800',
    padding: '4px 10px',
    borderRadius: '6px',
    letterSpacing: '0.4px',
  },
  stepTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#0F172A',
    margin: 0,
  },
  stepCategory: {
    fontSize: '11px',
    color: '#64748B',
    fontWeight: '600',
  },
  stepDesc: {
    fontSize: '13px',
    color: '#475569',
    lineHeight: 1.55,
    margin: '0 0 14px 0',
  },
  stepGrid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
  },
  stepMiniCard: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '12px 14px',
    fontSize: '12px',
    color: '#334155',
    lineHeight: 1.45,
  },

  // 4. Inquiry Form
  formContainerCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '14px',
    padding: '28px 32px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
  },
  inquiryForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formRow2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '16px',
  },
  formRow3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  fieldLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '6px',
  },
  formInput: {
    width: '100%',
    padding: '9px 13px',
    border: '1px solid #CBD5E1',
    borderRadius: '7px',
    fontSize: '13px',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  formSelect: {
    width: '100%',
    padding: '9px 13px',
    border: '1px solid #CBD5E1',
    borderRadius: '7px',
    fontSize: '13px',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  formSubmitRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '14px',
    paddingTop: '8px',
    borderTop: '1px solid #F1F5F9',
  },
  formPrivacyNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11.5px',
    color: '#64748B',
  },
  submitInquiryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '11px 22px',
    backgroundColor: '#1E3A63',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13.5px',
    fontWeight: '700',
    boxShadow: '0 4px 12px rgba(30, 58, 99, 0.25)',
    transition: 'all 0.15s ease',
  },
  successBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    backgroundColor: '#DCFCE7',
    border: '1px solid #86EFAC',
    borderRadius: '10px',
    padding: '14px 18px',
    marginBottom: '18px',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#FEE2E2',
    border: '1px solid #FCA5A5',
    color: '#B91C1C',
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '12.5px',
    marginBottom: '18px',
  },

  // 5. Contact Hub
  contactCardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  contactItemCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.15s ease',
  },
  mailActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    backgroundColor: '#E08131',
    color: '#FFFFFF',
    borderRadius: '6px',
    fontSize: '11.5px',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 2px 6px rgba(224, 129, 49, 0.25)',
    transition: 'background-color 0.15s ease',
  },
  mailCopyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 10px',
    backgroundColor: '#F8FAFC',
    color: '#475569',
    border: '1px solid #CBD5E1',
    borderRadius: '6px',
    fontSize: '11.5px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  phoneActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    backgroundColor: '#1E3A63',
    color: '#FFFFFF',
    borderRadius: '6px',
    fontSize: '11.5px',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 2px 6px rgba(30, 58, 99, 0.25)',
    transition: 'background-color 0.15s ease',
  },
  contactIconCircle: {
    width: '46px',
    height: '46px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  contactLabel: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  contactValueLink: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#1E3A63',
    textDecoration: 'none',
    display: 'block',
    marginTop: '2px',
  },
  contactValueStatic: {
    fontSize: '13.5px',
    fontWeight: '800',
    color: '#0F172A',
    display: 'block',
    marginTop: '2px',
  },
  contactSub: {
    display: 'block',
    fontSize: '11px',
    color: '#64748B',
    marginTop: '2px',
  },
  credentialsBanner: {
    backgroundColor: '#EFF6FF',
    border: '1.5px solid #BFDBFE',
    borderRadius: '12px',
    padding: '18px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  credentialsLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    maxWidth: '750px',
  },
  bannerStartEstBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 18px',
    backgroundColor: '#1E3A63',
    color: '#FFFFFF',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '12.5px',
    fontWeight: '700',
    boxShadow: '0 2px 8px rgba(30, 58, 99, 0.25)',
  },

  // 6. FAQ Accordion
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
  },
  faqQuestionBtn: {
    width: '100%',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
  },
  faqNumPill: {
    backgroundColor: '#EFF6FF',
    color: '#1E3A63',
    fontSize: '11px',
    fontWeight: '800',
    padding: '3px 8px',
    borderRadius: '5px',
    flexShrink: 0,
  },
  faqQuestionText: {
    fontSize: '14px',
    fontWeight: '750',
    color: '#1E3A63',
    lineHeight: 1.4,
  },
  faqChevron: {
    transition: 'transform 0.2s ease',
    flexShrink: 0,
    marginLeft: '12px',
  },
  faqAnswerBox: {
    padding: '0 20px 16px 48px',
    borderTop: '1px solid #F1F5F9',
    backgroundColor: '#FAFCFF',
  },
  faqAnswerText: {
    fontSize: '13px',
    color: '#334155',
    lineHeight: 1.6,
    margin: '12px 0 0 0',
  },
};


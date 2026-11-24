// =============================================
// Deck Estimator — Dedicated Contractor Support & Knowledge Hub
// =============================================
// Features:
// - Dynamic Pricing Cards: Minimum Job Floor ($2,500.00), Additive Tech Rate ($250.00/hr),
//   and "Current Discount" (reflects real contractor wholesale tier tuned in database)
// - Direct Office Contact Redesign matching customer/exact reference UI:
//   * 4-Card single row (Phone Lines, Official Email with Email Us/Copy pills, Headquarters with Map, Operating Hours pills)
//   * Two Structured Schedules side by side: Contracting Services (Navy header) & Office Hours (Wood grain header)
// - "Submit Partner Inquiry" form wired to Admin "All Reach Outs" & "Contractors" tabs in Lead Management
// - 10 In-depth Contractor FAQs with accordion expansion
// - Fully mobile-responsive layouts (reduced component sizes, clean font scaling, and touch targets)

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { leadApi } from '../../customer/api/leadApi';
import { getActivePricingConfiguration } from '../../admin/api/pricingApi';
import { contractorDiscountApi } from '../api/contractorDiscountApi';
import { contractorLeadApi } from '../api/contractorLeadApi';
import bannerBgImg from '../../../assets/images/Banner_BG_img.png';
import { OPERATING_HOURS_SCHEDULES } from '../../../constants/operatingHours';

export default function ContractorSupportPage() {
  const { user } = useAuth();

  // Dynamic Pricing & Discount State
  const [pricingConfig, setPricingConfig] = useState(null);
  const [currentDiscount, setCurrentDiscount] = useState(10);
  const [loadingPricing, setLoadingPricing] = useState(true);

  // UI States
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeHoursTab, setActiveHoursTab] = useState('contracting');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'ESTIMATION_FORMULA',
    priority: 'NORMAL',
    projectRef: '',
    message: '',
  });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

  // Fetch dynamic pricing config and contractor's tuned wholesale discount
  useEffect(() => {
    let isMounted = true;
    async function loadDynamicPricingData() {
      try {
        const [cfgRes, discRes, profRes] = await Promise.allSettled([
          getActivePricingConfiguration(),
          contractorDiscountApi.getEligibleDiscounts(),
          contractorLeadApi.getProfile(),
        ]);

        if (isMounted) {
          if (cfgRes.status === 'fulfilled' && cfgRes.value) {
            setPricingConfig(cfgRes.value);
          }
          if (profRes.status === 'fulfilled' && profRes.value?.data?.profile?.wholesaleDiscountTier) {
            setCurrentDiscount(Number(profRes.value.data.profile.wholesaleDiscountTier));
          } else if (discRes.status === 'fulfilled' && discRes.value?.data) {
            const d = discRes.value.data;
            const rate = d.effectiveRate || d.effectiveDiscount?.rate || (Array.isArray(d) ? d[0]?.discountValue : 10);
            if (rate) setCurrentDiscount(Number(rate));
          }
        }
      } catch (err) {
        console.warn('Error loading dynamic pricing config for contractor support:', err);
      } finally {
        if (isMounted) setLoadingPricing(false);
      }
    }
    loadDynamicPricingData();
    return () => { isMounted = false; };
  }, []);

  const handleCopyEmail = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText('info@deckrestorationplus.com');
    }
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  const toggleFaq = (idx) => {
    setActiveFaq((prev) => (prev === idx ? null : idx));
  };

  const handleFormChange = (field, val) => {
    setTicketForm((prev) => ({ ...prev, [field]: val }));
  };

  // Submit Partner Inquiry directly to Admin Leads (All Reach Outs & Contractors tabs)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const subjectText = ticketForm.subject?.trim() || 'Contractor Partner Support Ticket';
      const categoryPrefix = `[${ticketForm.category || 'PARTNER_INQUIRY'}]`;
      const refSuffix = ticketForm.projectRef ? ` (Ref: ${ticketForm.projectRef.trim()})` : '';

      await leadApi.submitReachOut({
        fullName: user?.fullName || 'Contractor Partner',
        email: user?.email || 'contractor@deckestimator.com',
        phone: user?.phone || user?.phoneNumber || '(866) 440-3325',
        subject: `${categoryPrefix} ${subjectText}${refSuffix}`,
        message: ticketForm.message?.trim() || 'Partner consultation request.',
        contactSource: 'Reach Out', // Route to All Reach Outs & Contractors in Admin Leads
        inquiryCategory: ticketForm.category,
        priority: ticketForm.priority,
      });

      setTicketSubmitted(true);
      setTimeout(() => {
        setTicketForm({
          subject: '',
          category: 'ESTIMATION_FORMULA',
          priority: 'NORMAL',
          projectRef: '',
          message: '',
        });
        setTicketSubmitted(false);
      }, 5000);
    } catch (err) {
      alert(`Submission error: ${err.message || 'Please check your connection and try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contractingSchedule =
    OPERATING_HOURS_SCHEDULES?.find((s) => s.id === 'contracting') ||
    OPERATING_HOURS_SCHEDULES?.[0] || { days: [] };
  const officeSchedule =
    OPERATING_HOURS_SCHEDULES?.find((s) => s.id === 'office') ||
    OPERATING_HOURS_SCHEDULES?.[1] || { days: [] };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Dynamic calculated rates
  const minJobPriceVal = Number(
    pricingConfig?.restorationPricing?.minJob?.near ||
    pricingConfig?.minimumJobPrice ||
    2500
  );
  const techLaborRateVal = Number(
    pricingConfig?.restorationPricing?.labourRate ||
    pricingConfig?.laborRate ||
    250
  );

  // 10 Comprehensive Contractor FAQs
  const faqs = [
    {
      q: 'How does the Deck Restoration Plus $250/hr additive rate work in calculations?',
      a: 'The estimator pricing engine computes baseline labor and chemical materials from substrate species, elevation tier, and surface area. When specialized structural prep (such as high-spindle perimeter railings, deteriorated fascia, joist underside conditioning, or historic hardwood stripping) exceeds standard productivity benchmarks, supplemental hours are automatically priced at the standard master technician rate of $250.00/hour.',
    },
    {
      q: 'What are the travel distance and mobilization minimum job thresholds?',
      a: `All residential scopes in the DRP network carry a standard baseline mobilization floor of $${minJobPriceVal.toLocaleString()} (or $3,000.00 for multi-tier and elevated commercial decks). For service locations beyond a 45-minute drive from our Shamong, NJ headquarters, a standard travel mobilization surcharge is factored in to cover certified crew transit, chemical transport rigs, and multi-visit drying window staging.`,
    },
    {
      q: 'How is my Current Wholesale Discount determined and updated?',
      a: `Every verified active contractor starts with a baseline wholesale partner discount (currently ${currentDiscount}% Off) applied automatically across all stains, sealers, cleaners, and restoration products. You can unlock higher tiers up to 20% by uploading your active State Contractor Trade License and Certificate of Insurance (COI) in Profile Settings, or by submitting a tier upgrade request for high-volume commercial contracts.`,
    },
    {
      q: 'When and how are commission earnings and referral margins disbursed?',
      a: 'Partner commission settlements are released weekly every Friday afternoon via direct ACH deposit into your registered business checking account. All project conversions that attain settled status before Wednesday 5:00 PM EST are included in that Friday\'s disbursement cycle, with comprehensive ledger statements accessible under Discounts & Earnings.',
    },
    {
      q: 'Can I print an official estimate proposal for my client directly from the portal?',
      a: 'Yes. In the My Projects page, click the Print button next to any estimation to immediately generate an official Deck Restoration Plus PDF proposal complete with company credentials, warranty disclosures, itemized breakdowns, and sign-off signature blocks ready for client presentation.',
    },
    {
      q: 'How does the system calculate labor hours and square footage across multi-section decks?',
      a: 'Square footage combines the primary deck floor dimensions with standardized component conversions: perimeter railings are calculated at 4 sq ft per linear foot, stair steps at 12 sq ft per step, and support posts at 6 sq ft each. Multipliers for elevation staging, accessibility, and substrate weathering are applied automatically to ensure rigorous job profitability.',
    },
    {
      q: 'What if a customer requests specialized stain formulations or specific wood chemistries?',
      a: 'The system natively supports all standard coating classifications: Clear Sealer, Transparent Stains, Semi-Transparent, Semi-Solid, and Solid color finishes. Contractors can source proprietary DRP Master Deck & Wood Stains, biodegradable strippers, and oxalic acid brighteners at wholesale prices directly through the portal.',
    },
    {
      q: 'How do I convert a saved estimation into an active booking or lead request?',
      a: 'Click "Inquiry this Estimation" on any saved project blueprint in your projects list. This alerts the DRP technical dispatch desk, creates a high-priority HOT record in Admin Lead Management, and transitions the project stage to In Progress with homeowner confirmation.',
    },
    {
      q: 'How do I submit verification documents to ensure continuous discount eligibility?',
      a: 'Navigate to Profile Settings > Business & Compliance. Upload your State Contractor License and General Liability COI directly into the secure document vault. Our compliance director reviews submissions within 24 business hours to verify credentials and adjust your wholesale discount tier.',
    },
    {
      q: 'Who can I contact if I need rapid on-site technical guidance or formula adjustments?',
      a: 'You can reach out directly via our toll-free contractor desk at (866) 440-DECK (or Shamong office at 609-268-3436), email info@deckrestorationplus.com, or submit a Partner Inquiry ticket below for rapid 2-hour response from a senior restoration estimator.',
    },
  ];

  return (
    <div style={styles.page}>
      <style>{`
        /* Contact Hub & Schedules Grid */
        .drp-cnt-top-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }
        .drp-cnt-schedule-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }
        .drp-cnt-two-col-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }
        .drp-cnt-form-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        /* Responsive Tablet & Mobile Media Queries */
        @media (max-width: 1080px) {
          .drp-cnt-top-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 820px) {
          .drp-cnt-schedule-grid {
            grid-template-columns: 1fr !important;
          }
          .drp-cnt-two-col-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .drp-cnt-top-grid {
            grid-template-columns: 1fr !important;
          }
          .drp-cnt-form-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* 1. Header Banner */}
      <div style={styles.headerCard}>
        <div style={styles.portalBadge}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span style={styles.portalBadgeText}>Contractor Knowledge &amp; Support Hub</span>
        </div>
        <h1 style={styles.pageTitle}>Contractor Partner Support</h1>
        <p style={styles.pageSub}>
          Comprehensive guide to estimation formulas, mobilization benchmarks, wholesale discount qualifications, and direct access to senior DRP technical estimators.
        </p>
      </div>

      {/* Direct Office Contact Redesign matching customer design specification */}
      <div style={styles.sectionCard}>
        {/* Section Header */}
        <div style={styles.sectionHeader}>
          <div style={styles.hubHeaderIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <div>
            <h2 style={styles.sectionTitle}>Direct Office Contact</h2>
            <p style={styles.sectionSubtitle}>
              Call, email, or visit Deck Restoration Plus headquarters.
            </p>
          </div>
        </div>

        {/* 4 Cards in 1 Row */}
        <div className="drp-cnt-top-grid">
          {/* Card 1: Phone Lines */}
          <div style={{ ...styles.contactPanel, borderTop: '3px solid #1E3A63' }}>
            <div>
              <div style={styles.panelTopRow}>
                <div style={{ ...styles.panelCircle, background: '#EFF6FF', color: '#1E3A63' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <span style={styles.panelTitle}>Phone Lines</span>
              </div>
              <div style={styles.panelBody}>
                <a href="tel:18664403325" style={styles.contactBoldLink}>Main: (866) 440-DECK</a>
                <a href="tel:16092683436" style={{ ...styles.contactBoldLink, fontSize: '12px' }}>Shamong: (609) 268-3436</a>
                <span style={styles.contactSubText}>Mon – Fri: 8:00 AM – 5:00 PM EST</span>
              </div>
            </div>
          </div>

          {/* Card 2: Official Email */}
          <div style={{ ...styles.contactPanel, borderTop: '3px solid #E08131' }}>
            <div>
              <div style={styles.panelTopRow}>
                <div style={{ ...styles.panelCircle, background: '#FFFBEB', color: '#D97706' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <span style={styles.panelTitle}>Official Email</span>
              </div>
              <div style={styles.panelBody}>
                <span style={{ fontWeight: '700', color: '#1E3A63', wordBreak: 'break-all' }}>info@deckrestorationplus.com</span>
              </div>
            </div>
            <div style={styles.panelActionsRow}>
              <a
                href="mailto:info@deckrestorationplus.com?subject=Contractor%20Partner%20Inquiry"
                style={{ ...styles.actionPill, ...styles.actionPillDark }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>Email Us</span>
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                style={{ ...styles.actionPill, ...styles.actionPillOutline }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Card 3: Headquarters */}
          <div style={{ ...styles.contactPanel, borderTop: '3px solid #15803D' }}>
            <div>
              <div style={styles.panelTopRow}>
                <div style={{ ...styles.panelCircle, background: '#F0FDF4', color: '#15803D' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <span style={styles.panelTitle}>Headquarters</span>
              </div>
              <div style={styles.panelBody}>
                <strong style={{ color: '#0F172A', display: 'block' }}>152 Indian Mills Rd Unit #B</strong>
                <span style={styles.contactSubText}>Shamong, NJ 08088</span>
              </div>
            </div>
            <div style={styles.panelActionsRow}>
              <a
                href="https://maps.google.com/?q=152+Indian+Mills+Road+Unit+B,+Shamong,+NJ+08088"
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...styles.actionPill, ...styles.actionPillOutline }}
              >
                <span>View on Map ↗</span>
              </a>
            </div>
          </div>

          {/* Card 4: Operating Hours Quick Switcher */}
          <div style={{ ...styles.contactPanel, borderTop: '3px solid #7C3AED' }}>
            <div>
              <div style={styles.panelTopRow}>
                <div style={{ ...styles.panelCircle, background: '#F5F3FF', color: '#7C3AED' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <span style={styles.panelTitle}>Operating Hours</span>
              </div>
              <div style={styles.hoursNavCol}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveHoursTab('contracting');
                    scrollToSection('schedule-contracting');
                  }}
                  style={{
                    ...styles.hoursNavBtn,
                    ...(activeHoursTab === 'contracting' ? styles.hoursNavBtnActive : {}),
                  }}
                >
                  <span>👷 Contracting Services</span>
                  <span>&rsaquo;</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveHoursTab('office');
                    scrollToSection('schedule-office');
                  }}
                  style={{
                    ...styles.hoursNavBtn,
                    ...(activeHoursTab === 'office' ? styles.hoursNavBtnActive : {}),
                  }}
                >
                  <span>🏢 Office Hours</span>
                  <span>&rsaquo;</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Structured Schedule Banners matching customer design */}
        <div className="drp-cnt-schedule-grid" style={{ marginTop: '16px' }}>
          {/* Left: Contracting Services (Navy blue header) */}
          <div id="schedule-contracting" style={styles.scheduleCard}>
            <div style={{ ...styles.scheduleHeader, backgroundColor: '#1E3A63' }}>
              <div style={styles.scheduleTitleWrap}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 18h20M4 14l3-6 5 2 3-5 5 9" />
                </svg>
                <span>Contracting Services</span>
              </div>
              <span style={styles.scheduleBadge}>Mon – Thu Field Ops</span>
            </div>
            <table style={styles.hoursTable}>
              <thead>
                <tr>
                  <th style={{ ...styles.hoursTh, width: '45%' }}>Day</th>
                  <th style={styles.hoursTh}>Hours</th>
                </tr>
              </thead>
              <tbody>
                {(contractingSchedule?.days || []).map((d, i) => (
                  <tr key={d.day || i} style={i % 2 === 1 ? styles.hoursRowAlt : styles.hoursRow}>
                    <td style={styles.hoursTd}>
                      <div style={styles.hoursDayCell}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>{d.day}</span>
                      </div>
                    </td>
                    <td style={styles.hoursTd}>
                      {d.closed ? (
                        <span style={styles.closedPill}>CLOSED</span>
                      ) : (
                        <span style={styles.openText}>{d.hours}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right: Office Hours (Wood grain header banner matching exact reference) */}
          <div id="schedule-office" style={styles.scheduleCard}>
            <div
              style={{
                ...styles.scheduleHeader,
                backgroundImage: `linear-gradient(90deg, rgba(30, 20, 10, 0.45) 0%, rgba(30, 20, 10, 0.25) 100%), url(${bannerBgImg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div style={styles.scheduleTitleWrap}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18M3 7v14M21 7v14M6 3h12l3 4H3l3-4z" />
                </svg>
                <span>Office Hours</span>
              </div>
              <span style={styles.scheduleBadge}>Mon – Fri Support</span>
            </div>
            <table style={styles.hoursTable}>
              <thead>
                <tr>
                  <th style={{ ...styles.hoursTh, width: '45%' }}>Day</th>
                  <th style={styles.hoursTh}>Hours</th>
                </tr>
              </thead>
              <tbody>
                {(officeSchedule?.days || []).map((d, i) => (
                  <tr key={d.day || i} style={i % 2 === 1 ? styles.hoursRowAlt : styles.hoursRow}>
                    <td style={styles.hoursTd}>
                      <div style={styles.hoursDayCell}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>{d.day}</span>
                      </div>
                    </td>
                    <td style={styles.hoursTd}>
                      {d.closed ? (
                        <span style={styles.closedPill}>CLOSED</span>
                      ) : (
                        <span style={styles.openText}>{d.hours}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Two-Column Layout: Partner Inquiry Form (Routes to Admin All Reach Outs & Contractors) + FAQ Accordion */}
      <div className="drp-cnt-two-col-grid">
        {/* Left: Submit Partner Inquiry */}
        <div style={styles.inquiryCard}>
          <div style={styles.sectionHeader}>
            <div style={styles.inquiryHeaderIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <h2 style={styles.sectionTitle}>Submit Partner Inquiry</h2>
              <p style={styles.sectionSubtitle}>
                Direct reach-out to our senior technical director. Routes to Admin Leads &amp; Reach-Out queue.
              </p>
            </div>
          </div>

          {ticketSubmitted ? (
            <div style={styles.ticketSuccessAlert}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <div>
                <strong>Inquiry Submitted to Admin Reach-Outs!</strong>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', lineHeight: 1.45 }}>
                  Your inquiry has been successfully registered under Admin Lead Management (All Reach Outs &amp; Contractors). Our technical director will respond within 2 business hours.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} style={styles.formContainer}>
              {/* Row 1: Category & Priority */}
              <div className="drp-cnt-form-row">
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Inquiry Category <span style={{ color: '#E11D48' }}>*</span>
                  </label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    style={styles.select}
                  >
                    <option value="ESTIMATION_FORMULA">Estimator Formula &amp; Pricing Question</option>
                    <option value="MOBILIZATION_FLOOR">Mobilization &amp; Distance Waiver</option>
                    <option value="DISCOUNT_TIER">Wholesale Discount Upgrade Verification</option>
                    <option value="COMMISSION_PAYOUT">Commission Settlement Inquiry</option>
                    <option value="MATERIAL_CHEMISTRY">Wood Substrate Chemistry Advice</option>
                    <option value="GENERAL_SUPPORT">General Contractor Technical Assistance</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Priority Level <span style={{ color: '#E11D48' }}>*</span>
                  </label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => handleFormChange('priority', e.target.value)}
                    style={styles.select}
                  >
                    <option value="NORMAL">Normal (Within 24 Hours)</option>
                    <option value="URGENT">Urgent (Active Client Walkthrough)</option>
                    <option value="CRITICAL">Critical Lead / Blueprint Question</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Subject / Project Reference */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Subject / Project Reference <span style={{ color: '#E11D48' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Question regarding Ipe hardwood stripping formula on EST-20261103"
                  value={ticketForm.subject}
                  onChange={(e) => handleFormChange('subject', e.target.value)}
                  style={styles.input}
                />
              </div>

              {/* Row 3: Description */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Detailed Description <span style={{ color: '#E11D48' }}>*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your inquiry, project dimensions, or substrate condition details..."
                  value={ticketForm.message}
                  onChange={(e) => handleFormChange('message', e.target.value)}
                  style={styles.textarea}
                />
              </div>

              {/* Submit Button */}
              <div style={styles.submitBtnRow}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  onMouseEnter={() => setBtnHover(true)}
                  onMouseLeave={() => setBtnHover(false)}
                  style={{
                    ...styles.submitBtnOutlined,
                    backgroundColor: btnHover ? '#EFF6FF' : '#FFFFFF',
                    borderColor: btnHover ? '#0284C7' : '#1E3A63',
                    color: btnHover ? '#0284C7' : '#1E3A63',
                    transform: btnHover ? 'translateY(-1px)' : 'none',
                    boxShadow: btnHover ? '0 4px 12px rgba(30, 58, 99, 0.12)' : '0 1px 3px rgba(30, 58, 99, 0.08)',
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  <span>{isSubmitting ? 'Submitting Reach Out...' : 'Submit Partner Inquiry'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right: Contractor FAQ Accordion (10 Comprehensive Q&As) */}
        <div style={styles.faqCard}>
          <div style={styles.sectionHeader}>
            <div style={styles.faqHeaderIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <h2 style={styles.sectionTitle}>Frequently Asked Questions</h2>
              <p style={styles.sectionSubtitle}>Standard operating guidelines &amp; technical standards for partner contractors.</p>
            </div>
          </div>

          <div style={styles.faqList}>
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} style={styles.faqItem}>
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    style={{
                      ...styles.faqQuestionBtn,
                      backgroundColor: isOpen ? '#F8FAFC' : '#FFFFFF',
                    }}
                  >
                    <span style={styles.faqQuestionText}>{faq.q}</span>
                    <span style={{ color: isOpen ? '#E08131' : '#94A3B8', fontSize: '18px', fontWeight: '800' }}>
                      {isOpen ? '−' : '+'}
                    </span>
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
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: '24px 32px 48px 32px',
    backgroundColor: '#F8FAFC',
    minHeight: '100vh',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  headerCard: {
    background: 'linear-gradient(135deg, #F0F4F9 0%, #E6EDF5 50%, #F5F8FC 100%)',
    border: '1.5px solid #CBD5E1',
    borderRadius: '16px',
    padding: '24px 30px',
    marginBottom: '20px',
    boxShadow: '0 4px 18px -2px rgba(30, 58, 99, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
  },
  portalBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    backgroundColor: '#FFFFFF',
    border: '1.5px solid #CBD5E1',
    borderRadius: '9999px',
    marginBottom: '8px',
    boxShadow: '0 1px 3px rgba(30, 58, 99, 0.06)',
  },
  portalBadgeText: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#1E3A63',
    letterSpacing: '0.4px',
    textTransform: 'uppercase',
  },
  pageTitle: {
    margin: '0 0 6px 0',
    fontSize: '26px',
    fontWeight: '800',
    color: '#1E3A63',
    letterSpacing: '-0.3px',
  },
  pageSub: {
    margin: 0,
    fontSize: '13.5px',
    color: '#475569',
    maxWidth: '780px',
    lineHeight: 1.5,
  },
  rulesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '14px',
    marginBottom: '20px',
  },
  ruleCard: {
    backgroundColor: '#FFFFFF',
    border: '1.5px solid #CBD5E1',
    borderRadius: '14px',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
  },
  ruleIconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#EFF6FF',
    color: '#1E3A63',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ruleLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  ruleValue: {
    fontSize: '19px',
    fontWeight: '800',
    color: '#1E3A63',
    marginTop: '2px',
  },
  ruleSub: {
    fontSize: '11.5px',
    color: '#64748B',
  },

  // Contact Hub Section
  sectionCard: {
    backgroundColor: '#FFFFFF',
    border: '1.5px solid #CBD5E1',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '18px',
  },
  hubHeaderIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    backgroundColor: '#EFF6FF',
    border: '1px solid #BFDBFE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sectionTitle: {
    margin: 0,
    fontSize: '17px',
    fontWeight: '800',
    color: '#1E3A63',
  },
  sectionSubtitle: {
    margin: '2px 0 0 0',
    fontSize: '12.5px',
    color: '#64748B',
  },

  // Contact Top Row Panels
  contactPanel: {
    backgroundColor: '#FFFFFF',
    border: '1.5px solid #CBD5E1',
    borderRadius: '12px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '125px',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
  },
  panelTopRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  panelCircle: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  panelTitle: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#0F172A',
  },
  panelBody: {
    fontSize: '12px',
    color: '#334155',
    lineHeight: 1.45,
  },
  contactBoldLink: {
    fontWeight: '800',
    color: '#1E3A63',
    textDecoration: 'none',
    display: 'block',
  },
  contactSubText: {
    fontSize: '11px',
    color: '#64748B',
    marginTop: '3px',
    display: 'block',
  },
  panelActionsRow: {
    display: 'flex',
    gap: '6px',
    marginTop: '10px',
  },
  actionPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    textDecoration: 'none',
    cursor: 'pointer',
    border: '1px solid transparent',
    fontFamily: 'inherit',
    transition: 'all 0.15s ease',
  },
  actionPillDark: {
    backgroundColor: '#1E3A63',
    color: '#FFFFFF',
    borderColor: '#1E3A63',
  },
  actionPillOutline: {
    backgroundColor: '#F8FAFC',
    color: '#334155',
    borderColor: '#CBD5E1',
  },

  // Operating Hours Nav Pills
  hoursNavCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    marginTop: '6px',
  },
  hoursNavBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#F8FAFC',
    color: '#334155',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s ease',
  },
  hoursNavBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#1E3A63',
    color: '#1E3A63',
  },

  // Structured Schedules
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    border: '1.5px solid #CBD5E1',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04)',
  },
  scheduleHeader: {
    padding: '11px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#FFFFFF',
  },
  scheduleTitleWrap: {
    fontSize: '13.5px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  scheduleBadge: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '999px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    color: '#FFFFFF',
  },
  hoursTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '11.5px',
  },
  hoursTh: {
    textAlign: 'left',
    padding: '7px 14px',
    backgroundColor: '#F8FAFC',
    color: '#64748B',
    fontWeight: '700',
    fontSize: '10.5px',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    borderBottom: '1px solid #E2E8F0',
  },
  hoursRow: {
    borderBottom: '1px solid #F1F5F9',
  },
  hoursRowAlt: {
    backgroundColor: '#FAFCFF',
    borderBottom: '1px solid #F1F5F9',
  },
  hoursTd: {
    padding: '7px 14px',
    color: '#0F172A',
  },
  hoursDayCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '600',
  },
  openText: {
    fontWeight: '700',
    color: '#1E3A63',
  },
  closedPill: {
    display: 'inline-block',
    padding: '2px 7px',
    borderRadius: '999px',
    fontSize: '10px',
    fontWeight: '800',
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    border: '1px solid #FCA5A5',
  },

  // Bottom Inquiry Card
  inquiryCard: {
    backgroundColor: '#FFFFFF',
    border: '1.5px solid #CBD5E1',
    borderRadius: '16px',
    padding: '22px 24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
  inquiryHeaderIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    backgroundColor: '#EFF6FF',
    border: '1px solid #BFDBFE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#1E3A63',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1.5px solid #CBD5E1',
    fontSize: '13px',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    transition: 'border-color 0.15s ease',
  },
  select: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1.5px solid #CBD5E1',
    fontSize: '12.5px',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    cursor: 'pointer',
  },
  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1.5px solid #CBD5E1',
    fontSize: '13px',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    resize: 'vertical',
    lineHeight: 1.45,
  },
  submitBtnRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: '4px',
  },
  submitBtnOutlined: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 18px',
    borderRadius: '8px',
    border: '1.5px solid',
    fontSize: '12.5px',
    fontWeight: '700',
    transition: 'all 0.18s ease',
  },
  ticketSuccessAlert: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#F0FDF4',
    border: '1px solid #BBF7D0',
    borderRadius: '10px',
    color: '#15803D',
  },

  // FAQ Card
  faqCard: {
    backgroundColor: '#FFFFFF',
    border: '1.5px solid #CBD5E1',
    borderRadius: '16px',
    padding: '22px 24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
  faqHeaderIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    backgroundColor: '#EFF6FF',
    border: '1px solid #BFDBFE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  faqItem: {
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  faqQuestionBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    gap: '12px',
    transition: 'background-color 0.15s ease',
  },
  faqQuestionText: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1E3A63',
    lineHeight: 1.4,
  },
  faqAnswerBox: {
    padding: '12px 16px',
    backgroundColor: '#F8FAFC',
    borderTop: '1px solid #E2E8F0',
  },
  faqAnswerText: {
    margin: 0,
    fontSize: '12.5px',
    color: '#475569',
    lineHeight: 1.5,
  },
};

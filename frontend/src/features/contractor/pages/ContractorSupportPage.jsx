// =============================================
// Deck Estimator — Dedicated Contractor Support & Knowledge Hub
// =============================================
// Features:
// - All 4 "Deck Restoration Plus Contact Hub" cards in a single row with shiny pale gradients & thin borders
// - Non-clipping contact cards with responsive, uniform heights & quick-action buttons
// - Fixed "Submit Partner Inquiry" form: completely contained inputs (no overflow), width-reduced colored outlined submit button
// - Frequently Asked Questions accordion (same questions preserved)
// - Top metric rule cards for mobilization floors, additive tech rate, and wholesale discount

import React, { useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { leadApi } from '../../customer/api/leadApi';
import OperatingHoursBlock from '../../../components/OperatingHoursBlock';

export default function ContractorSupportPage() {
  const { user } = useAuth();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
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
        contactSource: 'Contractor Support Portal',
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
      }, 4500);
    } catch (err) {
      alert(`Submission error: ${err.message || 'Please check your connection and try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Same FAQs preserved exactly as requested
  const faqs = [
    {
      q: 'How does the Deck Restoration Plus $250/hr additive rate work in calculations?',
      a: 'The estimator pricing engine computes raw labor & chemical materials based on substrate species, elevation tier, condition, and square footage. When structural complexities or specialized restoration tasks (such as spindle-intensive multi-tier railings or historic exotic wood stripping) exceed nominal production benchmarks, the system adds supplemental hours priced at the standard master technician rate of $250.00/hour.',
    },
    {
      q: 'What are the travel distance and mobilization minimum job thresholds?',
      a: 'All project scopes in the DRP network carry a minimum job price of $2,500.00 (or $3,000.00 for multi-tier and elevated commercial decks). For service locations beyond 35 miles from our Shamong, NJ headquarters, a standard travel mobilization surcharge is factored in to compensate crew transport, trailer mobilization, and chemical staging.',
    },
    {
      q: 'How do I unlock the maximum 20% wholesale material discount?',
      a: 'Contractors who upload their General Liability Certificate of Insurance, active State Contractor License, and complete business profile details under Profile Settings are reviewed within 24 hours. Once verified, the maximum 20% discount applies automatically across all your project estimates.',
    },
    {
      q: 'When are commission and referral earnings disbursed?',
      a: 'Commission settlements are released weekly every Friday afternoon via direct ACH deposit into your registered business checking account. All projects that have attained settled status before Wednesday 5:00 PM EST are included in that Friday\'s disbursement cycle.',
    },
    {
      q: 'Can I print an official estimate proposal for my client directly from the portal?',
      a: 'Yes. In the My Projects page, click the Print button next to any project to immediately launch our official Deck Restoration Plus PDF Estimate Proposal complete with company credentials, warranty disclosures, itemized breakdowns, and sign-off sections.',
    },
  ];

  return (
    <div style={styles.page}>
      {/* Responsive stylesheet for single-line grid & proper wrapping */}
      <style>{`
        .contact-hub-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }
        .two-col-support-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }
        .form-row-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        @media (max-width: 1080px) {
          .contact-hub-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 820px) {
          .two-col-support-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .contact-hub-grid {
            grid-template-columns: 1fr !important;
          }
          .form-row-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Header Banner */}
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

      {/* Top 3 Metric Rule Cards */}
      <div style={styles.rulesGrid}>
        <div style={{ ...styles.ruleCard, borderTop: '4px solid #1E3A63' }}>
          <div style={styles.ruleIconBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <span style={styles.ruleLabel}>Minimum Job Floor</span>
            <div style={styles.ruleValue}>$2,500.00</div>
            <span style={styles.ruleSub}>Baseline mobilization for residential scopes</span>
          </div>
        </div>

        <div style={{ ...styles.ruleCard, borderTop: '4px solid #0284C7' }}>
          <div style={{ ...styles.ruleIconBox, backgroundColor: '#EFF6FF', color: '#0284C7', border: '1px solid #BAE6FD' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <span style={styles.ruleLabel}>Additive Tech Rate</span>
            <div style={{ ...styles.ruleValue, color: '#0284C7' }}>$250.00 / hr</div>
            <span style={styles.ruleSub}>Custom carpentry &amp; intricate spindle prep</span>
          </div>
        </div>

        <div style={{ ...styles.ruleCard, borderTop: '4px solid #E08131' }}>
          <div style={{ ...styles.ruleIconBox, backgroundColor: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <span style={styles.ruleLabel}>Maximum Wholesale Discount</span>
            <div style={{ ...styles.ruleValue, color: '#C2671A' }}>Up to 20% Off</div>
            <span style={styles.ruleSub}>Unlocked via Contractor Profile Verification</span>
          </div>
        </div>
      </div>

      {/* Official Business Contact Hub — All 4 Cards in the Same Line with Shiny Pale Property */}
      <div style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <div style={styles.hubHeaderIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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

        {/* 4 Cards strictly in 1 single line on desktop with shiny pale gradients & thin borders */}
        <div className="contact-hub-grid">
          {/* Card 1: Direct Office Line */}
          <div style={{ ...styles.contactItemCard, borderTop: '3.5px solid #1E3A63', background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)' }}>
            <div>
              <div style={styles.cardTopRow}>
                <div style={{ ...styles.contactIconCircle, backgroundColor: '#EFF6FF', color: '#1E3A63', border: '1px solid #BFDBFE' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <span style={{ ...styles.contactBadge, backgroundColor: '#EFF6FF', color: '#1E3A63' }}>
                  Toll-Free
                </span>
              </div>
              <span style={styles.contactLabel}>Direct Office</span>
              <a href="tel:8664403325" style={styles.contactValueLink}>
                (866) 440-DECK
              </a>
              <span style={styles.contactSub}>Shamong: (609) 268-3436</span>
            </div>

            <div style={{ marginTop: '12px' }}>
              <a href="tel:8664403325" style={styles.phoneActionBtn} title="Call (866) 440-DECK">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>Call Now</span>
              </a>
            </div>
          </div>

          {/* Card 2: Estimates & Inquiries (Non-Clipping Email Box) */}
          <div style={{ ...styles.contactItemCard, borderTop: '3.5px solid #E08131', background: 'linear-gradient(180deg, #FFFBEB 0%, #FFFFFF 100%)' }}>
            <div>
              <div style={styles.cardTopRow}>
                <div style={{ ...styles.contactIconCircle, backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <span style={{ ...styles.contactBadge, backgroundColor: '#FEF3C7', color: '#92400E' }}>
                  Official
                </span>
              </div>
              <span style={styles.contactLabel}>Estimates &amp; Inquiries</span>

              {/* Clean non-clipping email box */}
              <div style={styles.emailBoxWrap}>
                <a
                  href="mailto:info@deckrestorationplus.com"
                  style={styles.emailLink}
                  title="Send email to info@deckrestorationplus.com"
                >
                  info@deckrestorationplus.com
                </a>
              </div>
              <span style={styles.contactSub}>Senior estimator inbox</span>
            </div>

            {/* Action buttons */}
            <div style={styles.emailBtnRow}>
              <a
                href="mailto:info@deckrestorationplus.com?subject=Contractor%20Partner%20Inquiry"
                style={styles.mailActionBtn}
                title="Send email"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                <span>Email Us</span>
              </a>

              <button
                type="button"
                onClick={handleCopyEmail}
                style={styles.mailCopyBtn}
                title="Copy email"
              >
                {copiedEmail ? (
                  <span style={{ color: '#15803D', fontWeight: '800' }}>Copied!</span>
                ) : (
                  <>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 3: Headquarters Address */}
          <div style={{ ...styles.contactItemCard, borderTop: '3.5px solid #15803D', background: 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)' }}>
            <div>
              <div style={styles.cardTopRow}>
                <div style={{ ...styles.contactIconCircle, backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <span style={{ ...styles.contactBadge, backgroundColor: '#DCFCE7', color: '#15803D' }}>
                  HQ Facility
                </span>
              </div>
              <span style={styles.contactLabel}>Headquarters</span>
              <strong style={styles.contactValueStatic}>
                152 Indian Mills Road Unit #B
              </strong>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#334155', marginTop: '2px' }}>
                Shamong, NJ 08088
              </div>
              <span style={styles.contactSub}>Distribution &amp; training facility</span>
            </div>

            <div style={{ marginTop: '12px' }}>
              <span style={styles.hqTag}>New Jersey Distribution</span>
            </div>
          </div>

          {/* Card 4: Operating Hours */}
          <div style={{ ...styles.contactItemCard, borderTop: '3.5px solid #475569', background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)' }}>
            <div>
              <div style={styles.cardTopRow}>
                <div style={{ ...styles.contactIconCircle, backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <span style={{ ...styles.contactBadge, backgroundColor: '#F1F5F9', color: '#475569' }}>
                  Live Dispatch
                </span>
              </div>
              <span style={styles.contactLabel}>Operating Hours</span>
              <OperatingHoursBlock variant="compact" style={{ marginTop: '6px' }} />
              <span style={{ ...styles.contactSub, marginTop: '6px' }}>Live senior estimator dispatch</span>
            </div>

            <div style={{ marginTop: '12px' }}>
              <span style={{ ...styles.hqTag, backgroundColor: '#EFF6FF', color: '#1E3A63', borderColor: '#BFDBFE' }}>
                Eastern Standard Time
              </span>
            </div>
          </div>
        </div>

        <OperatingHoursBlock variant="cards" style={{ marginTop: '18px' }} />
      </div>

      {/* Two-Column Layout: Support Ticket Form + FAQ Accordion */}
      <div className="two-col-support-grid">
        {/* Left: Submit Partner Inquiry (Fixed entire box, contained inputs, & width-reduced colored outlined button) */}
        <div style={styles.inquiryCard}>
          <div style={styles.sectionHeader}>
            <div style={styles.inquiryHeaderIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <h2 style={styles.sectionTitle}>Submit Partner Inquiry</h2>
              <p style={styles.sectionSubtitle}>Direct escalation to our senior technical director.</p>
            </div>
          </div>

          {ticketSubmitted ? (
            <div style={styles.ticketSuccessAlert}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <div>
                <strong>Inquiry Submitted Successfully!</strong>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', lineHeight: 1.45 }}>
                  A certified estimator ticket has been opened. You will receive an email confirmation and direct response within 2 business hours.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} style={styles.formContainer}>
              {/* Row 1: Category & Priority */}
              <div className="form-row-grid">
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
                    <option value="CRITICAL">Critical Lead Question</option>
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

              {/* Submit Button — Width Reduced & Colored Outlined */}
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
                  <span>{isSubmitting ? 'Submitting Inquiry...' : 'Submit Partner Ticket'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right: Contractor FAQ Accordion (Kept Exactly the Same) */}
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
              <p style={styles.sectionSubtitle}>Standard operating guidelines for partner contractors.</p>
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
    padding: '24px 32px',
    backgroundColor: '#F8FAFC',
    minHeight: '100vh',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  headerCard: {
    background: 'linear-gradient(135deg, #F0F4F9 0%, #E6EDF5 50%, #F5F8FC 100%)',
    border: '1.5px solid #CBD5E1',
    borderRadius: '16px',
    padding: '26px 32px',
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
    maxWidth: '750px',
    lineHeight: 1.5,
  },
  rulesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
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
    fontSize: '18px',
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

  // Contact Cards (Single Row, Shiny Pale Design)
  contactItemCard: {
    border: '1.5px solid #CBD5E1',
    borderRadius: '14px',
    padding: '16px 16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
    minWidth: 0,
    overflow: 'hidden',
  },
  cardTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '6px',
    marginBottom: '10px',
  },
  contactIconCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '9px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  contactBadge: {
    fontSize: '10px',
    fontWeight: '800',
    padding: '2px 7px',
    borderRadius: '9999px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  contactLabel: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    marginBottom: '2px',
  },
  contactValueLink: {
    fontWeight: '800',
    color: '#1E3A63',
    fontSize: '14.5px',
    textDecoration: 'none',
    display: 'block',
  },
  contactValueStatic: {
    fontSize: '13.5px',
    fontWeight: '800',
    color: '#1E3A63',
    display: 'block',
  },
  contactSub: {
    fontSize: '11px',
    color: '#64748B',
    display: 'block',
    marginTop: '3px',
    lineHeight: 1.35,
  },
  emailBoxWrap: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #CBD5E1',
    borderRadius: '6px',
    padding: '4px 6px',
    marginTop: '3px',
    marginBottom: '2px',
    wordBreak: 'break-all',
    overflowWrap: 'anywhere',
  },
  emailLink: {
    color: '#1E3A63',
    fontSize: '11.5px',
    fontWeight: '700',
    lineHeight: 1.35,
    textDecoration: 'none',
    display: 'block',
  },
  emailBtnRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '10px',
    flexWrap: 'wrap',
  },
  phoneActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 12px',
    backgroundColor: '#1E3A63',
    color: '#FFFFFF',
    borderRadius: '9999px',
    fontSize: '11.5px',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 2px 5px rgba(30, 58, 99, 0.2)',
  },
  mailActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    backgroundColor: '#E08131',
    color: '#FFFFFF',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 2px 5px rgba(224, 129, 49, 0.2)',
  },
  mailCopyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: '#FFFFFF',
    color: '#475569',
    border: '1px solid #CBD5E1',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  hqTag: {
    display: 'inline-block',
    fontSize: '10.5px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '9999px',
    backgroundColor: '#F0FDF4',
    color: '#15803D',
    border: '1px solid #BBF7D0',
  },

  // Submit Partner Inquiry Box (Fully Fixed & Contained)
  inquiryCard: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
    border: '1.5px solid #CBD5E1',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
    minWidth: 0,
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  inquiryHeaderIcon: {
    width: '36px',
    height: '36px',
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
    width: '100%',
    boxSizing: 'border-box',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    minWidth: 0,
    boxSizing: 'border-box',
  },
  label: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: '100%',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1.5px solid #CBD5E1',
    fontSize: '13px',
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    outline: 'none',
  },
  select: {
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1.5px solid #CBD5E1',
    fontSize: '13px',
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    cursor: 'pointer',
  },
  textarea: {
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: '100%',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1.5px solid #CBD5E1',
    fontSize: '13px',
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
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
    padding: '8px 20px',
    width: 'auto',
    borderRadius: '9999px',
    border: '2px solid #1E3A63',
    backgroundColor: '#FFFFFF',
    color: '#1E3A63',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  ticketSuccessAlert: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    borderRadius: '10px',
    backgroundColor: '#F0FDF4',
    border: '1.5px solid #86EFAC',
    color: '#15803D',
    fontSize: '13px',
  },

  // FAQ Accordion Card
  faqCard: {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
    border: '1.5px solid #CBD5E1',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
    minWidth: 0,
    overflow: 'hidden',
  },
  faqHeaderIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#E0F2FE',
    border: '1px solid #BAE6FD',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  faqItem: {
    border: '1.5px solid #CBD5E1',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  faqQuestionBtn: {
    width: '100%',
    padding: '13px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    textAlign: 'left',
    border: 'none',
    cursor: 'pointer',
    gap: '12px',
  },
  faqQuestionText: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1E3A63',
  },
  faqAnswerBox: {
    padding: '12px 16px 16px 16px',
    backgroundColor: '#FAFAF9',
    borderTop: '1px solid #E2E8F0',
  },
  faqAnswerText: {
    margin: 0,
    fontSize: '12.5px',
    color: '#475569',
    lineHeight: 1.5,
  },
};

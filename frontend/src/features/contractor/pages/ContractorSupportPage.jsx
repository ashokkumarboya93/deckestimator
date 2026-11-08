// =============================================
// Deck Estimator — Dedicated Contractor Support & Knowledge Hub
// =============================================
// Features: Rate formulas, mobilization floors, support ticket reachout form,
// non-clipping high-visibility contact hub, contractor FAQ accordion, SVG-only icons.

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ContractorSupportPage() {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'ESTIMATION_FORMULA',
    priority: 'NORMAL',
    projectRef: '',
    message: '',
  });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const handleCopyEmail = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText('estimates@deckrestorationplus.com');
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

  const handleFormSubmit = (e) => {
    e.preventDefault();
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
    }, 4000);
  };

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
      {/* Header Banner */}
      <div style={styles.headerCard}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', backgroundColor: '#EFF6FF', borderRadius: '6px', marginBottom: '8px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#1E3A63', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Contractor Knowledge &amp; Support Hub
          </span>
        </div>
        <h1 style={styles.pageTitle}>Contractor Partner Support</h1>
        <p style={styles.pageSub}>
          Comprehensive guide to estimation formulas, mobilization benchmarks, wholesale discount qualifications, and direct access to senior DRP technical estimators.
        </p>
      </div>

      {/* Top 3 Metric Badges */}
      <div style={styles.rulesGrid}>
        <div style={styles.ruleCard}>
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

        <div style={styles.ruleCard}>
          <div style={{ ...styles.ruleIconBox, backgroundColor: '#EFF6FF', color: '#0284C7' }}>
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

        <div style={styles.ruleCard}>
          <div style={{ ...styles.ruleIconBox, backgroundColor: '#FFFBEB', color: '#D97706' }}>
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

      {/* Official Business Contact Hub */}
      <div style={styles.sectionCard}>
        <div style={styles.sectionHeader}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

        {/* 4 Cards Grid - Fully responsive with ample card width to never clip email */}
        <div style={styles.contactCardGrid}>
          {/* Card 1: Direct Office Line */}
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
              <span style={{ ...styles.contactSub, marginTop: '3px' }}>Direct contractor consultation line</span>

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

          {/* Card 2: Email (Enhanced Non-Clipping Mail Box & Buttons) */}
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
                marginBottom: '6px',
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
                  href="mailto:estimates@deckrestorationplus.com?subject=Contractor%20Partner%20Inquiry"
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

          {/* Card 3: Headquarters Address */}
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

          {/* Card 4: Operating Hours */}
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
      </div>

      {/* Two-Column Layout: Support Ticket Form + FAQ Accordion */}
      <div style={styles.twoColGrid}>
        {/* Left: Support Request Form */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <div>
                <strong>Inquiry Submitted Successfully!</strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px' }}>
                  A certified estimator ticket has been opened. You will receive an email confirmation and direct response within 2 business hours.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} style={styles.form}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Inquiry Category</label>
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
                  <label style={styles.label}>Priority Level</label>
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

              <div style={styles.formGroup}>
                <label style={styles.label}>Subject / Project Reference</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Question regarding Ipe hardwood stripping formula on EST-20261103"
                  value={ticketForm.subject}
                  onChange={(e) => handleFormChange('subject', e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Detailed Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your inquiry, project dimensions, or substrate condition details..."
                  value={ticketForm.message}
                  onChange={(e) => handleFormChange('message', e.target.value)}
                  style={styles.textarea}
                />
              </div>

              <button type="submit" style={styles.submitBtn}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                <span>Submit Contractor Ticket</span>
              </button>
            </form>
          )}
        </div>

        {/* Right: Contractor FAQ Accordion */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  },
  pageTitle: {
    margin: '0 0 6px 0',
    fontSize: '24px',
    fontWeight: '800',
    color: '#1E3A63',
    letterSpacing: '-0.3px',
  },
  pageSub: {
    margin: 0,
    fontSize: '13.5px',
    color: '#64748B',
    maxWidth: '750px',
    lineHeight: 1.5,
  },
  rulesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  ruleCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
  },
  ruleIconBox: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: '#EFF6FF',
    color: '#1E3A63',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ruleLabel: {
    fontSize: '11.5px',
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
  sectionCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
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
  contactCardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
    gap: '16px',
    marginBottom: '8px',
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
    fontWeight: '800',
    color: '#1E3A63',
    textDecoration: 'none',
    display: 'block',
  },
  contactValueStatic: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#1E3A63',
    display: 'block',
    marginTop: '2px',
  },
  contactSub: {
    fontSize: '11.5px',
    color: '#64748B',
    display: 'block',
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
  },
  twoColGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '13px',
    color: '#1E293B',
    outline: 'none',
  },
  select: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '13px',
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    outline: 'none',
  },
  textarea: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '13px',
    color: '#1E293B',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  submitBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 18px',
    backgroundColor: '#1E3A63',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '6px',
    boxShadow: '0 2px 6px rgba(30, 58, 99, 0.25)',
  },
  ticketSuccessAlert: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    borderRadius: '8px',
    backgroundColor: '#F0FDF4',
    border: '1px solid #BBF7D0',
    color: '#15803D',
    fontSize: '13px',
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
    padding: '14px 16px',
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
    backgroundColor: '#FFFFFF',
    borderTop: '1px solid #F1F5F9',
  },
  faqAnswerText: {
    margin: 0,
    fontSize: '12.5px',
    color: '#475569',
    lineHeight: 1.5,
  },
};


// ========================================================
// Deck Estimator — Customer Help & Support Hub
// ========================================================
// Concise, Mobile-First & High-Contrast Bordered Layout:
// - Quick Policies Summary ($2,500 Floor / $3,000 >45m / 8ft+ / Warranty)
// - Interactive 9-Step Calculator Quick Reference Tabs
// - Direct Reach Out Inquiry Form (Synced with Admin /admin/leads + Notifications)
// - Official DRP Contact Hub (Shamong HQ, Phone Lines, Copyable Email)
// - Concise 7-Item FAQ Accordion
// ========================================================

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { leadApi } from '../api/leadApi';

const POLICY_CARDS = [
  {
    id: 'base-min',
    pill: 'Standard Floor',
    amount: '$2,500',
    accent: '#1E3A63',
    pillBg: '#EFF6FF',
    pillColor: '#1E3A63',
    title: 'Base Mobilization Minimum',
    bullets: [
      'Covers certified multi-tech crew & commercial wash rigs.',
      'Applies automatically when calculated scope is under $2,500.',
    ],
  },
  {
    id: 'travel-min',
    pill: '>45 Min Travel',
    amount: '$3,000',
    accent: '#D97706',
    pillBg: '#FFFBEB',
    pillColor: '#92400E',
    title: 'Extended Distance Floor',
    bullets: [
      'Applies beyond a 45-minute drive from Shamong, NJ.',
      'Covers multi-visit transit & drying window scheduling.',
    ],
  },
  {
    id: 'elevation',
    pill: 'Safety & Rigging',
    amount: '8ft+ Height',
    accent: '#475569',
    pillBg: '#F1F5F9',
    pillColor: '#334155',
    title: 'Elevated Deck Staging',
    bullets: [
      'Requires ladder stabilization & fall-protection gear.',
      'Factored transparently inside Elevation selection.',
    ],
  },
  {
    id: 'warranty',
    pill: 'Protection',
    amount: '1-Year',
    accent: '#15803D',
    pillBg: '#DCFCE7',
    pillColor: '#15803D',
    title: 'Workmanship Warranty',
    bullets: [
      'Protects penetrating coats against peeling or flaking.',
      'Backed directly by DRP certified inspection crews.',
    ],
  },
];

const CALCULATOR_STEPS = [
  {
    step: '01',
    title: 'Shape & Dimensions',
    tag: 'Usable Area (L × W)',
    summary: 'Pick Rectangle, Square, L-Shape, Multi-Level, or Custom and type exact length & width in feet.',
    points: [
      'Square auto-matches Width to Length for quick entry.',
      'Direct numeric inputs prevent accidental scroll-wheel changes.',
    ],
  },
  {
    step: '02',
    title: 'Elevation & Access',
    tag: 'Vertical Staging',
    summary: 'Select Ground (0–4 ft), One-Story (4–8 ft), or Multi-Story (8+ ft) based on deck height off grade.',
    points: [
      'Ground access uses standard perimeter setup.',
      '8+ ft decks include multi-tier ladder & underside staging.',
    ],
  },
  {
    step: '03',
    title: 'Wood / Material Type',
    tag: 'Substrate Science',
    summary: 'Choose Pressure-Treated Pine, Cedar/Redwood, Hardwoods (Ipe/Mahogany), or Composite (Trex).',
    points: [
      'Dense hardwoods require specialized oil prep.',
      'Composite decks lock to safe bio-wash cleaning only (Trex Lock Rule).',
    ],
  },
  {
    step: '04',
    title: 'Board Condition',
    tag: 'Prep Intensity',
    summary: 'Match your wood’s current state: Good, Weathered/Gray, Peeling Solid Stain, or Heavy Mold/Algae.',
    points: [
      'Previous peeling film adds chemical stripping & sanding labor.',
      'Lighter gray weathering only needs wash & brightening.',
    ],
  },
  {
    step: '05',
    title: 'Stairs, Rails & Extras',
    tag: 'Architectural Add-Ons',
    summary: 'Add staircase steps, linear feet of railing, spindles, benches, pergolas, or privacy screens.',
    points: [
      'Each step calculates ~12 sq ft covering tread, riser & stringers.',
      'Skip optional structures cleanly if your deck has none.',
    ],
  },
  {
    step: '06',
    title: 'Service Scope',
    tag: 'Wash • Seal • Stain',
    summary: 'Choose Clean & Brighten, Clean & Clear Seal, or Full Clean & Penetrating Stain System.',
    points: [
      'Cleaning starts around $2.50/sq ft base tier.',
      'Sealing or oil staining adds UV pigment & moisture protection.',
    ],
  },
  {
    step: '07',
    title: 'Photos & Notes',
    tag: 'Visual Review',
    summary: 'Optionally upload deck photos or note loose boards, railing repairs, or gate access details.',
    points: [
      'Photos help senior estimators verify scope faster.',
      'Images are automatically compressed for quick upload.',
    ],
  },
  {
    step: '08',
    title: 'Property Location',
    tag: 'Travel Radius Check',
    summary: 'Name your project and optionally enter property address & ZIP for local dispatch review.',
    points: [
      'Only a unique Project Name is required to save.',
      'Addresses >45 mins from Shamong, NJ apply the $3,000 travel floor.',
    ],
  },
  {
    step: '09',
    title: 'Official Quote & Inquiry',
    tag: 'PDF • Save • Send',
    summary: 'Review your instant itemized total, download an official printable copy, or click Inquiry to submit.',
    points: [
      'Submitting sends your project straight to DRP Admins for review.',
      'Track live status anytime inside My Projects.',
    ],
  },
];

const FAQS = [
  {
    q: 'Why is there a $2,500 standard project minimum?',
    a: 'Every project deploys a certified multi-technician crew, commercial wash equipment, neutralizers, sanders, and warranty backing—requiring a $2,500 base floor (or $3,000 beyond a 45-minute drive from Shamong, NJ).',
  },
  {
    q: 'Can Trex or composite decks be stained?',
    a: 'No. Applying film-forming stains voids composite warranties. Our estimator enforces the Trex Lock Rule so composite decks automatically receive safe wash & bio-treatment pricing only.',
  },
  {
    q: 'What is the difference between sealing and staining?',
    a: 'Cleaning strips dirt and mildew; clear sealing blocks water intrusion; penetrating oil staining adds UV pigment to stop graying while nourishing the wood grain.',
  },
  {
    q: 'What happens after I submit an estimate inquiry?',
    a: 'Your project switches to Requested status and notifies DRP Admins immediately. An estimator reviews your dimensions/photos and follows up to confirm on-site scheduling.',
  },
  {
    q: 'How are stairs and railings billed?',
    a: 'Steps calculate at ~12 sq ft per step (tread, riser, and stringer edges). Railings calculate by total linear footage covering top/bottom rails and balusters.',
  },
  {
    q: 'What weather is needed for restoration work?',
    a: 'Sealing and staining require wood moisture under 15%, dry forecasts for 24–48 hours, and temperatures above 50°F (10°C).',
  },
  {
    q: 'How do I download my official estimate PDF?',
    a: 'Open My Projects (or the final estimator screen) and click the View or Download icon under Actions to export a formatted printable copy.',
  },
];

export default function CustomerSupportPage() {
  const { user } = useAuth();

  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [activeFaq, setActiveFaq] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || user?.phoneNumber || '',
    subject: 'Estimator & Scope Guidance',
    deckSize: '',
    woodType: 'pressure_treated_pine',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Backfill profile defaults once auth finishes hydrating if fields are still untouched
  useEffect(() => {
    if (!user) return;
    setFormData((prev) => ({
      ...prev,
      fullName: prev.fullName || user.fullName || '',
      email: prev.email || user.email || '',
      phone: prev.phone || user.phone || user.phoneNumber || '',
    }));
  }, [user]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCopyEmail = (e) => {
    e.preventDefault();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText('info@deckrestorationplus.com').catch(() => {});
    }
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  const handleInputChange = (field, val) => {
    setSubmitError(null);
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    const trimmedName = formData.fullName.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedMsg = formData.message.trim();

    if (!trimmedName) {
      setSubmitError('Please enter your full name.');
      return;
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setSubmitError('Please enter a valid email address so our team can reply.');
      return;
    }
    if (trimmedMsg.length < 5) {
      setSubmitError('Please enter a short message (at least 5 characters) describing how we can help.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const response = await leadApi.submitReachOut({
        fullName: trimmedName,
        email: trimmedEmail,
        phone: formData.phone.trim(),
        contactSource: 'Customer Support Portal',
        subject: formData.subject,
        deckSize: formData.deckSize.trim(),
        woodType: formData.woodType,
        message: trimmedMsg,
        additionalNotes: `Deck Size: ${formData.deckSize.trim() || 'Unspecified'} | Wood: ${formData.woodType}`,
      });

      const leadRef = response?.data?.leadNumber || response?.leadNumber || '';
      setSubmitSuccess(
        leadRef
          ? `Inquiry sent (${leadRef}). Our Admin & Estimating team has been notified.`
          : 'Inquiry sent successfully. Our Admin & Estimating team will respond shortly.'
      );
      setFormData((prev) => ({ ...prev, message: '', deckSize: '' }));
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Unable to send inquiry right now. Please try again or call (866) 440-DECK.';
      setSubmitError(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeStep = CALCULATOR_STEPS[activeStepIdx] || CALCULATOR_STEPS[0];

  return (
    <div className="drp-sup-page">
      <style>{`
        .drp-sup-page {
          max-width: 1140px;
          margin: 0 auto;
          padding: 18px 20px 44px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #0F172A;
          box-sizing: border-box;
        }
        .drp-sup-page * {
          box-sizing: border-box;
        }
        /* Top Nav Row */
        .drp-sup-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }
        .drp-sup-back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 12px;
          background: #FFFFFF;
          border: 1.5px solid #CBD5E1;
          border-radius: 8px;
          color: #1E3A63;
          font-size: 12.5px;
          font-weight: 700;
          text-decoration: none;
          transition: border-color 0.15s, background-color 0.15s;
        }
        .drp-sup-back-link:hover {
          border-color: #1E3A63;
          background: #F8FAFC;
        }
        .drp-sup-new-est-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          background: #E08131;
          border: 1.5px solid #C2671D;
          border-radius: 8px;
          color: #FFFFFF;
          font-size: 12.5px;
          font-weight: 700;
          text-decoration: none;
        }
        .drp-sup-new-est-link:hover {
          background: #C96E22;
        }

        /* Hero Banner */
        .drp-sup-hero {
          background: linear-gradient(135deg, #163156 0%, #1E3A63 65%, #264878 100%);
          border: 1.5px solid #0F2644;
          border-radius: 12px;
          padding: 20px 22px;
          color: #FFFFFF;
          margin-bottom: 22px;
          box-shadow: 0 6px 18px rgba(15, 38, 68, 0.18);
        }
        .drp-sup-hero-badges {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }
        .drp-sup-brand-pill {
          background: #E08131;
          color: #FFFFFF;
          font-size: 10.5px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 5px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .drp-sup-sub-pill {
          font-size: 11.5px;
          color: #CBD5E1;
          font-weight: 600;
        }
        .drp-sup-hero-title {
          font-size: 22px;
          font-weight: 800;
          margin: 0 0 6px;
          line-height: 1.25;
          color: #FFFFFF;
        }
        .drp-sup-hero-desc {
          font-size: 13px;
          color: #E2E8F0;
          line-height: 1.45;
          margin: 0 0 14px;
          max-width: 720px;
        }
        .drp-sup-jump-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .drp-sup-jump-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 11px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 7px;
          color: #FFFFFF;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
        }
        .drp-sup-jump-btn:hover {
          background: rgba(255, 255, 255, 0.22);
        }
        .drp-sup-jump-cta {
          background: #E08131;
          border-color: #FDBA74;
        }
        .drp-sup-jump-cta:hover {
          background: #C96E22;
        }

        /* Section Wrapper & Header */
        .drp-sup-section {
          margin-bottom: 24px;
        }
        .drp-sup-sec-head {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .drp-sup-sec-icon {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: #EFF6FF;
          border: 1.5px solid #93C5FD;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .drp-sup-sec-title {
          font-size: 16.5px;
          font-weight: 800;
          color: #1E3A63;
          margin: 0;
          line-height: 1.25;
        }
        .drp-sup-sec-sub {
          font-size: 12px;
          color: #64748B;
          margin: 2px 0 0;
        }

        /* Policy Cards */
        .drp-sup-policy-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }
        .drp-sup-policy-card {
          background: #FFFFFF;
          border: 1.5px solid #CBD5E1;
          border-radius: 10px;
          padding: 13px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
        }
        .drp-sup-policy-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }
        .drp-sup-policy-pill {
          font-size: 10px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 5px;
          text-transform: uppercase;
          border: 1px solid rgba(15, 23, 42, 0.08);
        }
        .drp-sup-policy-amt {
          font-size: 15px;
          font-weight: 900;
        }
        .drp-sup-policy-title {
          font-size: 13.5px;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
        }
        .drp-sup-policy-list {
          margin: 0;
          padding-left: 15px;
          font-size: 11.8px;
          color: #475569;
          line-height: 1.45;
        }
        .drp-sup-policy-list li + li {
          margin-top: 4px;
        }

        /* Interactive 9-Step Guide */
        .drp-sup-step-shell {
          background: #FFFFFF;
          border: 1.5px solid #CBD5E1;
          border-radius: 12px;
          padding: 14px 16px;
          box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);
        }
        .drp-sup-tabs {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 8px;
          margin-bottom: 12px;
          border-bottom: 1px solid #E2E8F0;
          scrollbar-width: thin;
        }
        .drp-sup-tab {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 7px;
          border: 1.5px solid #CBD5E1;
          background: #F8FAFC;
          color: #334155;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          white-space: nowrap;
        }
        .drp-sup-tab:hover {
          border-color: #1E3A63;
          background: #EFF6FF;
        }
        .drp-sup-tab-active {
          background: #1E3A63;
          border-color: #1E3A63;
          color: #FFFFFF;
        }
        .drp-sup-tab-active:hover {
          background: #1E3A63;
        }
        .drp-sup-step-panel {
          background: #F8FAFC;
          border: 1.5px solid #CBD5E1;
          border-radius: 9px;
          padding: 14px 16px;
        }
        .drp-sup-step-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 6px;
        }
        .drp-sup-step-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          font-size: 15px;
          font-weight: 800;
          color: #0F172A;
        }
        .drp-sup-step-num {
          background: #1E3A63;
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 5px;
        }
        .drp-sup-step-tag {
          font-size: 11px;
          font-weight: 700;
          color: #1E3A63;
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          padding: 2px 8px;
          border-radius: 5px;
        }
        .drp-sup-step-summary {
          margin: 0 0 10px;
          font-size: 12.5px;
          color: #334155;
          line-height: 1.45;
        }
        .drp-sup-step-points {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }
        .drp-sup-step-point {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          border-radius: 7px;
          padding: 8px 10px;
          font-size: 12px;
          color: #334155;
          line-height: 1.4;
        }

        /* Reach Out Form Card */
        .drp-sup-form-card {
          background: #FFFFFF;
          border: 1.5px solid #CBD5E1;
          border-radius: 12px;
          padding: 18px 20px;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.05);
        }
        .drp-sup-alert-ok {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #DCFCE7;
          border: 1.5px solid #4ADE80;
          color: #14532D;
          border-radius: 9px;
          padding: 10px 13px;
          font-size: 12.5px;
          font-weight: 600;
          margin-bottom: 14px;
        }
        .drp-sup-alert-err {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #FEE2E2;
          border: 1.5px solid #F87171;
          color: #991B1B;
          border-radius: 9px;
          padding: 10px 13px;
          font-size: 12.5px;
          font-weight: 600;
          margin-bottom: 14px;
        }
        .drp-sup-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .drp-sup-form-2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .drp-sup-form-3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        .drp-sup-label {
          display: block;
          font-size: 11.5px;
          font-weight: 700;
          color: #334155;
          margin-bottom: 4px;
        }
        .drp-sup-input {
          width: 100%;
          padding: 8px 11px;
          border: 1.5px solid #CBD5E1;
          border-radius: 7px;
          font-size: 13px;
          color: #0F172A;
          background: #FFFFFF;
          font-family: inherit;
          outline: none;
          transition: border-color 0.15s;
        }
        .drp-sup-input:focus {
          border-color: #1E3A63;
        }
        .drp-sup-submit-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          padding-top: 10px;
          border-top: 1px solid #E2E8F0;
        }
        .drp-sup-privacy {
          font-size: 11.5px;
          color: #64748B;
        }
        .drp-sup-submit-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 9px 18px;
          background: #1E3A63;
          color: #FFFFFF;
          border: 1.5px solid #162D4E;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
        }
        .drp-sup-submit-btn:hover:not(:disabled) {
          background: #152B4A;
        }
        .drp-sup-submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* Contact Hub */
        .drp-sup-contact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 245px), 1fr));
          gap: 12px;
        }
        .drp-sup-contact-card {
          background: #FFFFFF;
          border: 1.5px solid #CBD5E1;
          border-radius: 10px;
          padding: 13px 14px;
          display: flex;
          align-items: flex-start;
          gap: 11px;
        }
        .drp-sup-contact-icon {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .drp-sup-contact-label {
          display: block;
          font-size: 10.5px;
          font-weight: 800;
          text-transform: uppercase;
          color: #64748B;
          letter-spacing: 0.3px;
        }
        .drp-sup-contact-val {
          display: block;
          font-size: 13px;
          font-weight: 800;
          color: #1E3A63;
          text-decoration: none;
          margin-top: 2px;
          word-break: break-word;
          overflow-wrap: anywhere;
        }
        .drp-sup-contact-sub {
          display: block;
          font-size: 11.2px;
          color: #64748B;
          margin-top: 2px;
        }
        .drp-sup-btn-sm {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          font-family: inherit;
        }

        /* FAQ List */
        .drp-sup-faq-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .drp-sup-faq-card {
          background: #FFFFFF;
          border: 1.5px solid #CBD5E1;
          border-radius: 9px;
          overflow: hidden;
        }
        .drp-sup-faq-btn {
          width: 100%;
          padding: 11px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          background: #FFFFFF;
          border: none;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
        }
        .drp-sup-faq-q-left {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 0;
        }
        .drp-sup-faq-num {
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          color: #1E3A63;
          font-size: 10.5px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 5px;
          flex-shrink: 0;
        }
        .drp-sup-faq-q {
          font-size: 13px;
          font-weight: 700;
          color: #0F172A;
          line-height: 1.35;
        }
        .drp-sup-faq-ans {
          padding: 9px 14px 12px 46px;
          border-top: 1px solid #CBD5E1;
          background: #F8FAFC;
          font-size: 12.2px;
          color: #334155;
          line-height: 1.5;
        }

        /* Responsive Breakpoints */
        @media (max-width: 960px) {
          .drp-sup-policy-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .drp-sup-form-3 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 640px) {
          .drp-sup-page {
            padding: 12px 10px 30px;
          }
          .drp-sup-hero {
            padding: 14px 14px;
            margin-bottom: 16px;
          }
          .drp-sup-hero-title {
            font-size: 17px !important;
          }
          .drp-sup-hero-desc {
            font-size: 12px;
            margin-bottom: 10px;
          }
          .drp-sup-sec-title {
            font-size: 14.5px !important;
          }
          .drp-sup-policy-grid,
          .drp-sup-step-points,
          .drp-sup-form-2,
          .drp-sup-form-3 {
            grid-template-columns: 1fr;
          }
          .drp-sup-form-card,
          .drp-sup-step-shell {
            padding: 12px;
          }
          .drp-sup-step-panel {
            padding: 11px 12px;
          }
          .drp-sup-submit-btn {
            width: 100%;
          }
          .drp-sup-faq-ans {
            padding: 9px 12px 11px;
          }
        }
      `}</style>

      {/* Top Quick Navigation */}
      <div className="drp-sup-topbar">
        <Link to="/customer/dashboard" className="drp-sup-back-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to Dashboard</span>
        </Link>

        <Link to="/customer/decks/new" className="drp-sup-new-est-link">
          <span>+ Create Estimate</span>
        </Link>
      </div>

      {/* 1. Compact Hero Banner */}
      <section className="drp-sup-hero">
        <div className="drp-sup-hero-badges">
          <span className="drp-sup-brand-pill">Deck Restoration Plus</span>
          <span className="drp-sup-sub-pill">Customer Help &amp; Inquiry Center</span>
        </div>
        <h1 className="drp-sup-hero-title">Help, Pricing Guide &amp; Direct Support</h1>
        <p className="drp-sup-hero-desc">
          Quick pricing rules, interactive 9-step calculator guide, direct Admin/Estimator reach-out, and key FAQs.
        </p>

        <div className="drp-sup-jump-row">
          <button type="button" onClick={() => scrollToSection('reachout-form')} className="drp-sup-jump-btn drp-sup-jump-cta">
            Reach Out Now
          </button>
          <button type="button" onClick={() => scrollToSection('rates-policies')} className="drp-sup-jump-btn">
            Pricing Rules
          </button>
          <button type="button" onClick={() => scrollToSection('calculator-guide')} className="drp-sup-jump-btn">
            9-Step Guide
          </button>
          <button type="button" onClick={() => scrollToSection('contact-hub')} className="drp-sup-jump-btn">
            Office Contact
          </button>
          <button type="button" onClick={() => scrollToSection('faq-section')} className="drp-sup-jump-btn">
            FAQs
          </button>
        </div>
      </section>

      {/* 2. Key Pricing & Policy Rules */}
      <section id="rates-policies" className="drp-sup-section">
        <div className="drp-sup-sec-head">
          <div className="drp-sup-sec-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <h2 className="drp-sup-sec-title">Key Pricing &amp; Policy Rules</h2>
            <p className="drp-sup-sec-sub">Clear project floors, travel thresholds, and warranty protection.</p>
          </div>
        </div>

        <div className="drp-sup-policy-grid">
          {POLICY_CARDS.map((card) => (
            <div
              key={card.id}
              className="drp-sup-policy-card"
              style={{ borderTop: `4px solid ${card.accent}` }}
            >
              <div className="drp-sup-policy-top">
                <span
                  className="drp-sup-policy-pill"
                  style={{ backgroundColor: card.pillBg, color: card.pillColor }}
                >
                  {card.pill}
                </span>
                <strong className="drp-sup-policy-amt" style={{ color: card.accent }}>
                  {card.amount}
                </strong>
              </div>
              <h3 className="drp-sup-policy-title">{card.title}</h3>
              <ul className="drp-sup-policy-list">
                {card.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Interactive 9-Step Calculator Quick Guide */}
      <section id="calculator-guide" className="drp-sup-section">
        <div className="drp-sup-sec-head">
          <div className="drp-sup-sec-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <line x1="8" y1="7" x2="16" y2="7" />
              <line x1="8" y1="11" x2="16" y2="11" />
              <line x1="8" y1="15" x2="12" y2="15" />
            </svg>
          </div>
          <div>
            <h2 className="drp-sup-sec-title">9-Step Calculator Guide</h2>
            <p className="drp-sup-sec-sub">Tap any step below to see what to enter.</p>
          </div>
        </div>

        <div className="drp-sup-step-shell">
          <div className="drp-sup-tabs" role="tablist" aria-label="Calculator Steps">
            {CALCULATOR_STEPS.map((item, idx) => (
              <button
                key={item.step}
                type="button"
                role="tab"
                aria-selected={activeStepIdx === idx}
                onClick={() => setActiveStepIdx(idx)}
                className={`drp-sup-tab ${activeStepIdx === idx ? 'drp-sup-tab-active' : ''}`}
              >
                <span>{item.step}.</span>
                <span>{item.title}</span>
              </button>
            ))}
          </div>

          <div className="drp-sup-step-panel">
            <div className="drp-sup-step-top">
              <h3 className="drp-sup-step-heading">
                <span className="drp-sup-step-num">Step {activeStep.step}</span>
                <span>{activeStep.title}</span>
              </h3>
              <span className="drp-sup-step-tag">{activeStep.tag}</span>
            </div>
            <p className="drp-sup-step-summary">{activeStep.summary}</p>
            <div className="drp-sup-step-points">
              {activeStep.points.map((pt, i) => (
                <div key={i} className="drp-sup-step-point">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Direct Reach Out Inquiry Form (Synced to Admin Leads + Notifications) */}
      <section id="reachout-form" className="drp-sup-section">
        <div className="drp-sup-sec-head">
          <div className="drp-sup-sec-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="drp-sup-sec-title">Reach Out to Our Team</h2>
            <p className="drp-sup-sec-sub">Need a custom quote or help with your deck? Send a direct inquiry to DRP Admins.</p>
          </div>
        </div>

        <div className="drp-sup-form-card">
          {submitSuccess && (
            <div className="drp-sup-alert-ok" role="status" data-testid="reachout-success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{submitSuccess}</span>
            </div>
          )}

          {submitError && (
            <div className="drp-sup-alert-err" role="alert" data-testid="reachout-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitInquiry} className="drp-sup-form" noValidate>
            <div className="drp-sup-form-3">
              <div>
                <label className="drp-sup-label" htmlFor="sup-fullname">Full Name *</label>
                <input
                  id="sup-fullname"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Your full name"
                  className="drp-sup-input"
                  required
                />
              </div>

              <div>
                <label className="drp-sup-label" htmlFor="sup-email">Email Address *</label>
                <input
                  id="sup-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="you@example.com"
                  className="drp-sup-input"
                  required
                />
              </div>

              <div>
                <label className="drp-sup-label" htmlFor="sup-phone">Phone (Optional)</label>
                <input
                  id="sup-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className="drp-sup-input"
                />
              </div>
            </div>

            <div className="drp-sup-form-3">
              <div>
                <label className="drp-sup-label" htmlFor="sup-subject">Topic *</label>
                <select
                  id="sup-subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="drp-sup-input"
                >
                  <option value="Estimator & Scope Guidance">Estimator &amp; Scope Guidance</option>
                  <option value="Custom Deck Geometry Assistance">Custom Deck Geometry</option>
                  <option value="Mobilization & Travel Inquiry">Mobilization &amp; Travel Check</option>
                  <option value="Schedule On-Site Inspection">Schedule On-Site Inspection</option>
                  <option value="Structural Repair & Board Replacement">Repairs &amp; Board Replacement</option>
                  <option value="Billing & Official Estimate Verification">Quote Verification</option>
                </select>
              </div>

              <div>
                <label className="drp-sup-label" htmlFor="sup-size">Approx. Deck Size (Optional)</label>
                <input
                  id="sup-size"
                  type="text"
                  value={formData.deckSize}
                  onChange={(e) => handleInputChange('deckSize', e.target.value)}
                  placeholder="e.g., 420 sq ft"
                  className="drp-sup-input"
                />
              </div>

              <div>
                <label className="drp-sup-label" htmlFor="sup-wood">Wood / Surface Type</label>
                <select
                  id="sup-wood"
                  value={formData.woodType}
                  onChange={(e) => handleInputChange('woodType', e.target.value)}
                  className="drp-sup-input"
                >
                  <option value="pressure_treated_pine">Pressure-Treated Pine</option>
                  <option value="cedar">Cedar / Redwood</option>
                  <option value="hardwood">Exotic Hardwood (Ipe/Mahogany)</option>
                  <option value="composite">Composite / Trex</option>
                  <option value="unsure">Not Sure</option>
                </select>
              </div>
            </div>

            <div>
              <label className="drp-sup-label" htmlFor="sup-message">Message / Question *</label>
              <textarea
                id="sup-message"
                rows={3}
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Tell us about your deck condition, desired timing, or question..."
                className="drp-sup-input"
                style={{ resize: 'vertical' }}
                required
              />
            </div>

            <div className="drp-sup-submit-row">
              <span className="drp-sup-privacy">
                Routed directly to DRP Admins &amp; Estimators (tracked in Admin Leads).
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="drp-sup-submit-btn"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                <span>{isSubmitting ? 'Sending Inquiry...' : 'Submit Reach Out Inquiry'}</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 5. Official Business Contact Hub */}
      <section id="contact-hub" className="drp-sup-section">
        <div className="drp-sup-sec-head">
          <div className="drp-sup-sec-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <div>
            <h2 className="drp-sup-sec-title">Direct Office Contact</h2>
            <p className="drp-sup-sec-sub">Call, email, or visit Deck Restoration Plus headquarters.</p>
          </div>
        </div>

        <div className="drp-sup-contact-grid">
          <div className="drp-sup-contact-card" style={{ borderLeft: '4px solid #1E3A63' }}>
            <div className="drp-sup-contact-icon" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E3A63' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <span className="drp-sup-contact-label">Phone Lines</span>
              <a href="tel:18664403325" className="drp-sup-contact-val">Main: (866) 440-DECK</a>
              <a href="tel:16092683436" className="drp-sup-contact-val" style={{ fontSize: '12.5px', fontWeight: 700 }}>Shamong: (609) 268-3436</a>
              <span className="drp-sup-contact-sub">Mon–Fri 7:30 AM – 6 PM EST</span>
            </div>
          </div>

          <div className="drp-sup-contact-card" style={{ borderLeft: '4px solid #E08131' }}>
            <div className="drp-sup-contact-icon" style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#D97706' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <span className="drp-sup-contact-label">Official Email</span>
              <a href="mailto:info@deckrestorationplus.com" className="drp-sup-contact-val">
                info@deckrestorationplus.com
              </a>
              <div style={{ display: 'flex', gap: '6px', marginTop: '7px', flexWrap: 'wrap' }}>
                <a
                  href="mailto:info@deckrestorationplus.com?subject=Deck%20Restoration%20Inquiry"
                  className="drp-sup-btn-sm"
                  style={{ background: '#E08131', color: '#FFFFFF', border: '1px solid #C2671D' }}
                >
                  Email
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="drp-sup-btn-sm"
                  style={{ background: '#F8FAFC', color: '#334155', border: '1px solid #CBD5E1' }}
                >
                  {copiedEmail ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          <div className="drp-sup-contact-card" style={{ borderLeft: '4px solid #15803D' }}>
            <div className="drp-sup-contact-icon" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <span className="drp-sup-contact-label">Headquarters</span>
              <a
                href="https://maps.google.com/?q=152+Indian+Mills+Road+Unit+B,+Shamong,+NJ+08088"
                target="_blank"
                rel="noopener noreferrer"
                className="drp-sup-contact-val"
              >
                152 Indian Mills Rd Unit #B
              </a>
              <span className="drp-sup-contact-sub">Shamong, NJ 08088 &bull; Sat 8 AM–2 PM</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Concise FAQ Accordion */}
      <section id="faq-section" className="drp-sup-section" style={{ marginBottom: 0 }}>
        <div className="drp-sup-sec-head">
          <div className="drp-sup-sec-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <h2 className="drp-sup-sec-title">Quick FAQs</h2>
            <p className="drp-sup-sec-sub">Short answers on pricing, weather, composites, and exports.</p>
          </div>
        </div>

        <div className="drp-sup-faq-list">
          {FAQS.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="drp-sup-faq-card">
                <button
                  type="button"
                  onClick={() => setActiveFaq((prev) => (prev === idx ? null : idx))}
                  className="drp-sup-faq-btn"
                  aria-expanded={isOpen}
                >
                  <div className="drp-sup-faq-q-left">
                    <span className="drp-sup-faq-num">Q{idx + 1}</span>
                    <span className="drp-sup-faq-q">{faq.q}</span>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1E3A63"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      flexShrink: 0,
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {isOpen && <div className="drp-sup-faq-ans">{faq.a}</div>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

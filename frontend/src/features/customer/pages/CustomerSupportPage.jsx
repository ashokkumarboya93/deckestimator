// ========================================================
// Deck Estimator — Customer Help & Support Hub
// ========================================================
// Re-engineered with:
// - Interactive 9-Step Calculator Visual Guide with Tab Selection & Category Images
// - Clean Direct Office Contact Section matching design specification
// - Interactive Collapsible Contracting Services & Office Hours schedule cards
// - 10 In-Depth Customer Restoration FAQs
// - Optimized Mobile UI with compact action buttons and responsive grids
// ========================================================

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { leadApi } from '../api/leadApi';
import bannerBgImg from '../../../assets/images/Banner_BG_img.png';
import { ESTIMATOR_IMAGES } from '../../../assets/images/Input_images/estimatorImages';
import { OPERATING_HOURS_SCHEDULES } from '../../../constants/operatingHours';

const CALCULATOR_STEPS = [
  {
    step: '01',
    title: 'Deck Footprint & Dimensions',
    tag: 'Shape & Area',
    image: ESTIMATOR_IMAGES?.shapes?.rectangle?.main || '',
    summary: 'Select your deck layout (Rectangle, Square, L-Shape, or Custom) and enter exact Length and Width dimensions in feet.',
    points: [
      'Square configuration synchronizes dimensions instantly.',
      'Supports custom multi-tier geometric footprints.',
    ],
  },
  {
    step: '02',
    title: 'Elevation & Site Access',
    tag: 'Vertical Staging',
    image: ESTIMATOR_IMAGES?.elevations?.ground?.main || '',
    summary: 'Specify ground elevation: Ground Level (0–4 ft), Low Elevation (4–8 ft), or Elevated / Second-Story (8+ ft).',
    points: [
      'Ground access uses standard perimeter equipment.',
      'Elevated structures include safety rigging and ladder staging.',
    ],
  },
  {
    step: '03',
    title: 'Wood Material & Substrate',
    tag: 'Substrate Science',
    image: ESTIMATOR_IMAGES?.woodSpecies?.pt_pine?.main || ESTIMATOR_IMAGES?.shapes?.rectangle?.main || '',
    summary: 'Identify your wood substrate: Pressure-Treated Pine, Cedar, Redwood, Hardwoods (Ipe/Mahogany), or Composite.',
    points: [
      'Hardwoods require penetrating oil formulation.',
      'Composite / Trex decks lock exclusively to safe bio-wash cleaning.',
    ],
  },
  {
    step: '04',
    title: 'Surface Condition & Prep',
    tag: 'Prep Intensity',
    image: ESTIMATOR_IMAGES?.conditions?.weathered?.main || '',
    summary: 'Diagnose current deck condition: Good Condition, Weathered Gray, Peeling Stain, or Mold & Mildew.',
    points: [
      'Peeling solid coatings include chemical stripping and sanding.',
      'Gray weathered surfaces receive active brightening wash.',
    ],
  },
  {
    step: '05',
    title: 'Stairs, Railings & Add-Ons',
    tag: 'Architectural Details',
    image: ESTIMATOR_IMAGES?.components?.stairs?.main || '',
    summary: 'Include stair steps, perimeter railing linear footage, fascia boards, under-deck ceilings, or pergolas.',
    points: [
      'Each stair step calculates ~12 sq ft of surface coverage.',
      'Railing footage incorporates balusters, top caps, and posts.',
    ],
  },
  {
    step: '06',
    title: 'Restoration Scope of Work',
    tag: 'Service Package',
    image: ESTIMATOR_IMAGES?.services?.cleaning?.main || '',
    summary: 'Select Clean & Brighten, Clean & Clear Protective Sealer, or Full Multi-Coat Penetrating Stain System.',
    points: [
      'Commercial grade EPA-compliant wood cleaners.',
      'Deep-penetrating natural oils preserve wood core integrity.',
    ],
  },
  {
    step: '07',
    title: 'Photo Upload & Special Notes',
    tag: 'Visual Verification',
    image: ESTIMATOR_IMAGES?.services?.staining?.main || '',
    summary: 'Upload deck photographs and provide access notes such as gate latches, water spigots, or damaged boards.',
    points: [
      'Photos enable Senior Estimators to confirm scope accuracy.',
      'Images are auto-compressed for rapid transfer.',
    ],
  },
  {
    step: '08',
    title: 'Project Title & Location',
    tag: 'Project Identification',
    image: ESTIMATOR_IMAGES?.shapes?.custom?.main || '',
    summary: 'Name your project and provide property address and ZIP code for contractor route dispatch.',
    points: [
      'Project Name lets you reference and compare multiple quotes.',
      'Verifies local contractor coverage across your regional area.',
    ],
  },
  {
    step: '09',
    title: 'Instant Quote & PDF Export',
    tag: 'Guaranteed Pricing',
    image: ESTIMATOR_IMAGES?.services?.sealing?.main || '',
    summary: 'Receive an instant itemized cost breakdown, export an official PDF document, or submit directly to Admin.',
    points: [
      'Itemized material and labor calculations transparently displayed.',
      'One-click PDF download for homeowner documentation.',
    ],
  },
];

const TEN_FAQS = [
  {
    q: 'Can Trex or composite decking materials be stained or sealed?',
    a: 'No. Film-forming stains or sealers should never be applied to composite boards, as they will peel and void manufacturer warranties. Our estimator applies the Trex Lock Rule to ensure composite decks receive safe, dedicated bio-wash and brightening treatments only.',
  },
  {
    q: 'What is the key difference between wood sealing and penetrating staining?',
    a: 'Clear wood sealers provide a transparent moisture barrier that blocks water intrusion without altering the wood color. Penetrating oil stains contain UV-blocking pigments that shield the wood grain from sun degradation, graying, and drying while nourishing the substrate from within.',
  },
  {
    q: 'How does the calculator measure and calculate stair steps and railings?',
    a: 'Stair steps are calculated at approximately 12 sq ft per step to account for the tread surface, vertical risers, and side stringers. Perimeter railings are calculated by total linear feet, incorporating the top and bottom rails as well as vertical spindles.',
  },
  {
    q: 'What optimal weather conditions are required for restoration work?',
    a: 'Sealing and penetrating oil staining require dry wood with moisture content under 15%, zero precipitation in the forecast for 24 to 48 hours, and outdoor temperatures consistently above 50°F (10°C) during application and initial cure.',
  },
  {
    q: 'What happens immediately after I submit an estimate inquiry?',
    a: 'Your estimate status transitions to "Requested" and generates an instant alert for the Deck Restoration Plus management team. An experienced estimator reviews your deck dimensions, scope, and photos, then contacts you to verify scheduling and details.',
  },
  {
    q: 'How do I download or print an official itemized PDF copy of my quote?',
    a: 'From the "My Estimates" page or upon completing your estimation, click the PDF icon or "Download Official PDF" button under Actions. This generates a clean, contractor-grade itemized proposal complete with scope, specifications, and terms.',
  },
  {
    q: 'Can I edit or recalculate an existing estimate after saving it?',
    a: 'Yes. In your "My Estimates" table, simply click the Edit / Recalculate icon next to any estimate. The calculator will reload all previous dimensions, wood species, and scopes so you can update measurements or test alternate finishes.',
  },
  {
    q: 'How long does a professional wood restoration treatment typically last?',
    a: 'Under normal regional exposure, a premium penetrating oil stain system protects horizontal deck flooring for 2 to 3 years, and vertical surfaces (railings, posts, and spindles) for 3 to 5 years before requiring a maintenance brightening and topcoat.',
  },
  {
    q: 'Are the cleaning detergents and stripping solutions safe for landscaping and pets?',
    a: 'Yes. Deck Restoration Plus utilizes EPA-registered, contractor-grade commercial cleaners and brighteners that are fully neutralized and thoroughly rinsed, protecting surrounding shrubbery, lawn, and pets when used per standard operating procedures.',
  },
  {
    q: 'What if my deck has rotted boards, loose railings, or structural issues?',
    a: 'In Step 04 ("Board Condition") and Step 07 ("Notes & Repairs"), you can designate localized board replacement and repairs. Our certified crew conducts a comprehensive pre-wash inspection and handles board replacement prior to finish application.',
  },
];

export default function CustomerSupportPage() {
  const { user } = useAuth();

  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [activeHoursTab, setActiveHoursTab] = useState('contracting'); // 'contracting' | 'office'

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

  useEffect(() => {
    if (!user) return;
    setFormData((prev) => ({
      ...prev,
      fullName: prev.fullName || user.fullName || '',
      email: prev.email || user.email || '',
      phone: prev.phone || user.phone || user.phoneNumber || '',
    }));
  }, [user]);

  const handleInputChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (submitError) setSubmitError(null);
    if (submitSuccess) setSubmitSuccess(null);
  };

  const handleCopyEmail = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText('info@deckrestorationplus.com');
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  };

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.message.trim()) {
      setSubmitError('Please provide your name, email address, and inquiry message.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      await leadApi.createLead({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject,
        notes: `Customer Inquiry from Help & Support Center:\n- Scope/Subject: ${formData.subject}\n- Est. Deck Size: ${formData.deckSize || 'Not specified'}\n- Wood Type: ${formData.woodType}\n\nMessage:\n${formData.message.trim()}`,
        source: 'CUSTOMER_PORTAL_SUPPORT',
        status: 'NEW',
      });

      setSubmitSuccess('Thank you! Your inquiry was delivered directly to our senior estimating team. We will contact you promptly.');
      setFormData((prev) => ({
        ...prev,
        deckSize: '',
        message: '',
      }));
    } catch (err) {
      setSubmitError(err.message || 'Unable to submit your inquiry. Please call (866) 440-DECK directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const activeStep = CALCULATOR_STEPS[activeStepIdx] || CALCULATOR_STEPS[0] || {};
  const contractingSchedule = OPERATING_HOURS_SCHEDULES?.find((s) => s.id === 'contracting') || OPERATING_HOURS_SCHEDULES?.[0] || { days: [] };
  const officeSchedule = OPERATING_HOURS_SCHEDULES?.find((s) => s.id === 'office') || OPERATING_HOURS_SCHEDULES?.[1] || { days: [] };

  return (
    <div className="drp-sup-page">
      <style>{`
        .drp-sup-page {
          max-width: 1360px;
          margin: 0 auto;
          padding: 14px 20px 48px;
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #0F172A;
        }

        /* Top Bar */
        .drp-sup-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
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
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .drp-sup-back-link:hover {
          background: #EFF6FF;
          border-color: #1E3A63;
        }
        .drp-sup-new-est-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          background: #E08131;
          border: 1.5px solid #C96E22;
          border-radius: 8px;
          color: #FFFFFF;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .drp-sup-new-est-link:hover {
          background: #C96E22;
        }

        /* Hero Banner */
        .drp-sup-hero {
          background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.26) 0%, rgba(255, 255, 255, 0.08) 25%, transparent 55%), linear-gradient(90deg, rgba(16, 38, 72, 0.72) 0%, rgba(22, 48, 88, 0.58) 28%, rgba(30, 58, 99, 0.28) 42%, rgba(30, 58, 99, 0.04) 52%, rgba(0, 0, 0, 0) 100%), url(${bannerBgImg});
          background-size: cover;
          background-position: center right;
          background-repeat: no-repeat;
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 12px;
          padding: 20px 24px;
          color: #FFFFFF;
          margin-bottom: 22px;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
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
          margin: 0 0 12px;
          line-height: 1.25;
          color: #FFFFFF;
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
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 7px;
          color: #FFFFFF;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: background-color 0.15s ease;
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

        /* Section Layout */
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

        /* 1. Interactive 9-Step Calculator Guide */
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
          padding: 6px 11px;
          border-radius: 7px;
          border: 1.5px solid #CBD5E1;
          background: #F8FAFC;
          color: #334155;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          white-space: nowrap;
          transition: all 0.15s ease;
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

        /* Interactive Step Card with Image & Details */
        .drp-sup-step-display {
          display: grid;
          grid-template-columns: 240px minmax(0, 1fr);
          gap: 16px;
          align-items: stretch;
          background: #F8FAFC;
          border: 1.5px solid #CBD5E1;
          border-radius: 10px;
          padding: 14px;
        }
        .drp-sup-step-img-box {
          border-radius: 8px;
          overflow: hidden;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 140px;
        }
        .drp-sup-step-img {
          width: 100%;
          height: 100%;
          max-height: 170px;
          object-fit: cover;
          display: block;
        }
        .drp-sup-step-info {
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          gap: 8px;
        }
        .drp-sup-step-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
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
          margin: 0;
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
          padding: 7px 9px;
          font-size: 11.5px;
          color: #334155;
          line-height: 1.4;
        }

        /* 2. Direct Reach Out Inquiry Form */
        .drp-sup-form-card {
          background: #FFFFFF;
          border: 1.5px solid #CBD5E1;
          border-radius: 12px;
          padding: 16px 18px;
          box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);
        }
        .drp-sup-alert-ok {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #DCFCE7;
          border: 1.5px solid #4ADE80;
          color: #14532D;
          border-radius: 8px;
          padding: 9px 12px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 12px;
        }
        .drp-sup-alert-err {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #FEE2E2;
          border: 1.5px solid #F87171;
          color: #991B1B;
          border-radius: 8px;
          padding: 9px 12px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 12px;
        }
        .drp-sup-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .drp-sup-form-3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }
        .drp-sup-form-2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }
        .drp-sup-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #334155;
          margin-bottom: 3px;
        }
        .drp-sup-input {
          width: 100%;
          box-sizing: border-box;
          padding: 7px 10px;
          border: 1.5px solid #CBD5E1;
          border-radius: 7px;
          font-size: 12.5px;
          color: #0F172A;
          background: #FFFFFF;
          font-family: inherit;
          outline: none;
          transition: border-color 0.15s ease;
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
          padding-top: 8px;
          border-top: 1px solid #E2E8F0;
        }
        .drp-sup-privacy {
          font-size: 11px;
          color: #64748B;
        }
        .drp-sup-submit-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 16px;
          background: #1E3A63;
          color: #FFFFFF;
          border: 1.5px solid #162D4E;
          border-radius: 7px;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: background-color 0.15s ease;
        }
        .drp-sup-submit-btn:hover:not(:disabled) {
          background: #152B4A;
        }
        .drp-sup-submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* 3. Direct Office Contact (User Uploaded Styled Design) */
        .drp-sup-office-shell {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .drp-sup-top-contact-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }
        .drp-sup-contact-panel {
          background: #FFFFFF;
          border: 1.5px solid #CBD5E1;
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          min-height: 120px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
        }
        .drp-sup-contact-top-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .drp-sup-contact-circle {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .drp-sup-contact-title {
          font-size: 13px;
          font-weight: 800;
          color: #0F172A;
        }
        .drp-sup-contact-body {
          font-size: 12px;
          color: #334155;
          line-height: 1.45;
        }
        .drp-sup-contact-bold-link {
          font-weight: 800;
          color: #1E3A63;
          text-decoration: none;
          display: block;
        }
        .drp-sup-contact-sub-text {
          font-size: 11px;
          color: #64748B;
          margin-top: 3px;
          display: block;
        }
        .drp-sup-contact-actions {
          display: flex;
          gap: 6px;
          margin-top: 8px;
        }
        .drp-sup-action-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 9px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          border: 1px solid transparent;
          font-family: inherit;
        }
        .drp-sup-action-dark {
          background: #1E3A63;
          color: #FFFFFF;
          border-color: #1E3A63;
        }
        .drp-sup-action-dark:hover {
          background: #152B4A;
        }
        .drp-sup-action-outline {
          background: #F8FAFC;
          color: #334155;
          border-color: #CBD5E1;
        }
        .drp-sup-action-outline:hover {
          background: #F1F5F9;
        }

        /* Nav Pills inside Operating Hours Card */
        .drp-sup-hours-nav {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-top: 4px;
        }
        .drp-sup-hours-pill-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 9px;
          border-radius: 6px;
          border: 1px solid #CBD5E1;
          background: #F8FAFC;
          color: #334155;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s ease;
        }
        .drp-sup-hours-pill-btn:hover {
          border-color: #1E3A63;
          background: #EFF6FF;
        }
        .drp-sup-hours-pill-active {
          background: #EFF6FF;
          border-color: #1E3A63;
          color: #1E3A63;
        }

        /* Two Large Operating Hours Schedule Banners */
        .drp-sup-schedule-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }
        .drp-sup-schedule-card {
          background: #FFFFFF;
          border: 1.5px solid #CBD5E1;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(15, 23, 42, 0.04);
        }
        .drp-sup-schedule-header {
          padding: 10px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #FFFFFF;
        }
        .drp-sup-schedule-header--navy {
          background: #1E3A63;
        }
        .drp-sup-schedule-header--wood {
          background: linear-gradient(90deg, #A0521D 0%, #B8652A 100%);
        }
        .drp-sup-schedule-title {
          font-size: 13.5px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .drp-sup-schedule-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.4);
          color: #FFFFFF;
        }
        .drp-sup-hours-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11.5px;
        }
        .drp-sup-hours-table th {
          text-align: left;
          padding: 7px 12px;
          font-size: 10.5px;
          font-weight: 800;
          color: #64748B;
          background: #F8FAFC;
          border-bottom: 1px solid #E2E8F0;
          text-transform: uppercase;
        }
        .drp-sup-hours-table td {
          padding: 6.5px 12px;
          border-bottom: 1px solid #F1F5F9;
        }
        .drp-sup-hours-row-alt {
          background: #F8FAFC;
        }
        .drp-sup-hours-day {
          font-weight: 600;
          color: #334155;
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .drp-sup-closed-pill {
          display: inline-block;
          font-size: 9.5px;
          font-weight: 800;
          color: #B91C1C;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 4px;
          padding: 1px 6px;
          letter-spacing: 0.3px;
        }

        /* 4. FAQ List */
        .drp-sup-faq-list {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .drp-sup-faq-card {
          background: #FFFFFF;
          border: 1.5px solid #CBD5E1;
          border-radius: 9px;
          overflow: hidden;
          transition: border-color 0.15s ease;
        }
        .drp-sup-faq-btn {
          width: 100%;
          padding: 10px 14px;
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
        .drp-sup-faq-btn:hover {
          background: #F8FAFC;
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
          padding: 8px 14px 11px 44px;
          border-top: 1px solid #E2E8F0;
          background: #F8FAFC;
          font-size: 12px;
          color: #334155;
          line-height: 1.5;
        }

        /* Responsive Breakpoints & Mobile Fixes */
        @media (max-width: 1024px) {
          .drp-sup-top-contact-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .drp-sup-step-display {
            grid-template-columns: 200px minmax(0, 1fr);
          }
        }

        @media (max-width: 768px) {
          .drp-sup-page {
            padding: 10px 10px 32px;
          }
          .drp-sup-hero {
            padding: 14px 14px;
            margin-bottom: 16px;
          }
          .drp-sup-hero-title {
            font-size: 17px !important;
            margin-bottom: 10px;
          }
          .drp-sup-jump-row {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
          }
          .drp-sup-jump-btn {
            justify-content: center;
            padding: 6px 4px;
            font-size: 11px;
          }
          .drp-sup-jump-cta {
            grid-column: span 2;
          }
          .drp-sup-sec-title {
            font-size: 14.5px !important;
          }
          .drp-sup-step-display {
            grid-template-columns: 1fr;
          }
          .drp-sup-step-img-box {
            max-height: 160px;
          }
          .drp-sup-step-points {
            grid-template-columns: 1fr;
          }
          .drp-sup-form-3,
          .drp-sup-form-2 {
            grid-template-columns: 1fr;
          }
          .drp-sup-top-contact-grid {
            grid-template-columns: 1fr;
          }
          .drp-sup-schedule-row {
            grid-template-columns: 1fr;
          }
          .drp-sup-submit-btn {
            width: 100%;
          }
          .drp-sup-faq-ans {
            padding: 8px 12px 10px;
          }
        }
      `}</style>

      {/* Top Navigation */}
      <div className="drp-sup-topbar">
        <Link to="/customer/dashboard" className="drp-sup-back-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to Dashboard</span>
        </Link>
        <Link to="/customer/decks/new" className="drp-sup-new-est-link">
          <span>+ Create Estimate</span>
        </Link>
      </div>

      {/* Hero Banner */}
      <section className="drp-sup-hero">
        <div className="drp-sup-hero-badges">
          <span className="drp-sup-brand-pill">Deck Restoration Plus</span>
          <span className="drp-sup-sub-pill">Customer Help &amp; Inquiry Center</span>
        </div>
        <h1 className="drp-sup-hero-title">Help, Pricing Guide &amp; Direct Support</h1>

        <div className="drp-sup-jump-row">
          <button type="button" onClick={() => scrollToSection('reachout-form')} className="drp-sup-jump-btn drp-sup-jump-cta">
            Reach Out Now
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

      {/* 1. Interactive 9-Step Calculator Guide */}
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
            <p className="drp-sup-sec-sub">Interactive visual walkthrough of the deck calculation workflow.</p>
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

          <div className="drp-sup-step-display">
            <div className="drp-sup-step-img-box">
              <img
                src={activeStep.image}
                alt={activeStep.title}
                className="drp-sup-step-img"
                loading="lazy"
              />
            </div>
            <div className="drp-sup-step-info">
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
        </div>
      </section>

      {/* 2. Direct Reach Out Inquiry Form */}
      <section id="reachout-form" className="drp-sup-section">
        <div className="drp-sup-sec-head">
          <div className="drp-sup-sec-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="drp-sup-sec-title">Reach Out to Our Team</h2>
            <p className="drp-sup-sec-sub">Submit a direct inquiry to senior estimators regarding scopes or scheduling.</p>
          </div>
        </div>

        <div className="drp-sup-form-card">
          {submitSuccess && (
            <div className="drp-sup-alert-ok" role="status">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{submitSuccess}</span>
            </div>
          )}

          {submitError && (
            <div className="drp-sup-alert-err" role="alert">
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
                <label className="drp-sup-label" htmlFor="sup-phone">Phone Number</label>
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

            <div className="drp-sup-form-2">
              <div>
                <label className="drp-sup-label" htmlFor="sup-subject">Inquiry Subject</label>
                <select
                  id="sup-subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="drp-sup-input"
                >
                  <option value="Estimator & Scope Guidance">Estimator &amp; Scope Guidance</option>
                  <option value="Wood Species & Stain Recommendations">Wood Species &amp; Stain Recommendations</option>
                  <option value="Elevated Deck Rigging & Access">Elevated Deck Rigging &amp; Access</option>
                  <option value="Scheduling On-Site Verification">Scheduling On-Site Verification</option>
                  <option value="Commercial & Multi-Unit Inquiries">Commercial &amp; Multi-Unit Inquiries</option>
                </select>
              </div>

              <div>
                <label className="drp-sup-label" htmlFor="sup-decksize">Approximate Deck Size (sq ft)</label>
                <input
                  id="sup-decksize"
                  type="text"
                  value={formData.deckSize}
                  onChange={(e) => handleInputChange('deckSize', e.target.value)}
                  placeholder="e.g. 450 sq ft"
                  className="drp-sup-input"
                />
              </div>
            </div>

            <div>
              <label className="drp-sup-label" htmlFor="sup-message">Message / Scope Questions *</label>
              <textarea
                id="sup-message"
                rows={4}
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Describe your deck condition, board repairs, stain preferences, or specific timeline..."
                className="drp-sup-input"
                style={{ resize: 'vertical' }}
                required
              />
            </div>

            <div className="drp-sup-submit-row">
              <span className="drp-sup-privacy">
                Direct inquiry routed directly to Deck Restoration Plus Admin queue.
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="drp-sup-submit-btn"
              >
                {isSubmitting ? (
                  <span>Sending Inquiry...</span>
                ) : (
                  <>
                    <span>Submit Inquiry</span>
                    <span style={{ fontSize: '13px' }}>&rarr;</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 3. Direct Office Contact & Schedule Display */}
      <section id="contact-hub" className="drp-sup-section">
        <div className="drp-sup-sec-head">
          <div className="drp-sup-sec-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A63" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div>
            <h2 className="drp-sup-sec-title">Direct Office Contact</h2>
            <p className="drp-sup-sec-sub">Phone lines, direct email, Shamong headquarters, and operating schedules.</p>
          </div>
        </div>

        <div className="drp-sup-office-shell">
          {/* Top 4 Quick Contact Panels matching user photo design */}
          <div className="drp-sup-top-contact-grid">
            {/* 1. Phone Lines */}
            <div className="drp-sup-contact-panel">
              <div>
                <div className="drp-sup-contact-top-row">
                  <div className="drp-sup-contact-circle" style={{ background: '#EFF6FF', color: '#1E3A63' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <span className="drp-sup-contact-title">Phone Lines</span>
                </div>
                <div className="drp-sup-contact-body">
                  <a href="tel:18664403325" className="drp-sup-contact-bold-link">Main: (866) 440-DECK</a>
                  <a href="tel:16092683436" className="drp-sup-contact-bold-link" style={{ fontSize: '12px' }}>Shamong: (609) 268-3436</a>
                  <span className="drp-sup-contact-sub-text">Mon – Fri: 8:00 AM – 5:00 PM EST</span>
                </div>
              </div>
            </div>

            {/* 2. Official Email */}
            <div className="drp-sup-contact-panel">
              <div>
                <div className="drp-sup-contact-top-row">
                  <div className="drp-sup-contact-circle" style={{ background: '#FFFBEB', color: '#D97706' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <span className="drp-sup-contact-title">Official Email</span>
                </div>
                <div className="drp-sup-contact-body">
                  <span style={{ fontWeight: '700', color: '#1E3A63', wordBreak: 'break-all' }}>info@deckrestorationplus.com</span>
                </div>
              </div>
              <div className="drp-sup-contact-actions">
                <a
                  href="mailto:info@deckrestorationplus.com?subject=Deck%20Restoration%20Inquiry"
                  className="drp-sup-action-pill drp-sup-action-dark"
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
                  className="drp-sup-action-pill drp-sup-action-outline"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* 3. Headquarters */}
            <div className="drp-sup-contact-panel">
              <div>
                <div className="drp-sup-contact-top-row">
                  <div className="drp-sup-contact-circle" style={{ background: '#F0FDF4', color: '#15803D' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <span className="drp-sup-contact-title">Headquarters</span>
                </div>
                <div className="drp-sup-contact-body">
                  <strong style={{ color: '#0F172A', display: 'block' }}>152 Indian Mills Rd Unit #B</strong>
                  <span className="drp-sup-contact-sub-text">Shamong, NJ 08088</span>
                </div>
              </div>
              <div className="drp-sup-contact-actions">
                <a
                  href="https://maps.google.com/?q=152+Indian+Mills+Road+Unit+B,+Shamong,+NJ+08088"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="drp-sup-action-pill drp-sup-action-outline"
                >
                  <span>View on Map ↗</span>
                </a>
              </div>
            </div>

            {/* 4. Operating Hours Quick Switcher */}
            <div className="drp-sup-contact-panel">
              <div>
                <div className="drp-sup-contact-top-row">
                  <div className="drp-sup-contact-circle" style={{ background: '#F5F3FF', color: '#7C3AED' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <span className="drp-sup-contact-title">Operating Hours</span>
                </div>
                <div className="drp-sup-hours-nav">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveHoursTab('contracting');
                      scrollToSection('schedule-contracting');
                    }}
                    className={`drp-sup-hours-pill-btn ${activeHoursTab === 'contracting' ? 'drp-sup-hours-pill-active' : ''}`}
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
                    className={`drp-sup-hours-pill-btn ${activeHoursTab === 'office' ? 'drp-sup-hours-pill-active' : ''}`}
                  >
                    <span>🏢 Office Hours</span>
                    <span>&rsaquo;</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Two Structured Schedule Banners matching uploaded image */}
          <div className="drp-sup-schedule-row">
            {/* Left: Contracting Services */}
            <div id="schedule-contracting" className="drp-sup-schedule-card">
              <div className="drp-sup-schedule-header drp-sup-schedule-header--navy">
                <div className="drp-sup-schedule-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 18h20M4 14l3-6 5 2 3-5 5 9" />
                  </svg>
                  <span>Contracting Services</span>
                </div>
                <span className="drp-sup-schedule-badge">Mon – Thu Field Ops</span>
              </div>
              <table className="drp-sup-hours-table">
                <thead>
                  <tr>
                    <th style={{ width: '45%' }}>Day</th>
                    <th>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {(contractingSchedule?.days || []).map((d, i) => (
                    <tr key={d.day || i} className={i % 2 === 1 ? 'drp-sup-hours-row-alt' : ''}>
                      <td>
                        <div className="drp-sup-hours-day">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span>{d.day}</span>
                        </div>
                      </td>
                      <td>
                        {d.closed ? (
                          <span className="drp-sup-closed-pill">CLOSED</span>
                        ) : (
                          <span style={{ fontWeight: '700', color: '#0F172A' }}>{d.hours}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Right: Office Hours */}
            <div id="schedule-office" className="drp-sup-schedule-card">
              <div className="drp-sup-schedule-header drp-sup-schedule-header--wood">
                <div className="drp-sup-schedule-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="2" />
                    <line x1="9" y1="22" x2="9" y2="22.01" />
                    <line x1="15" y1="22" x2="15" y2="22.01" />
                  </svg>
                  <span>Office Hours</span>
                </div>
                <span className="drp-sup-schedule-badge">Mon – Fri Support</span>
              </div>
              <table className="drp-sup-hours-table">
                <thead>
                  <tr>
                    <th style={{ width: '45%' }}>Day</th>
                    <th>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {(officeSchedule?.days || []).map((d, i) => (
                    <tr key={d.day || i} className={i % 2 === 1 ? 'drp-sup-hours-row-alt' : ''}>
                      <td>
                        <div className="drp-sup-hours-day">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span>{d.day}</span>
                        </div>
                      </td>
                      <td>
                        {d.closed ? (
                          <span className="drp-sup-closed-pill">CLOSED</span>
                        ) : (
                          <span style={{ fontWeight: '700', color: '#0F172A' }}>{d.hours}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Concise 10-Item FAQ Accordion */}
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
            <p className="drp-sup-sec-sub">10 essential answers on estimates, materials, weather, and scheduling.</p>
          </div>
        </div>

        <div className="drp-sup-faq-list">
          {TEN_FAQS.map((faq, idx) => {
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
                    width="15"
                    height="15"
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

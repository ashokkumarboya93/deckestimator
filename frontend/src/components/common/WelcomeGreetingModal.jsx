// =============================================
// Deck Estimator — First-Time Welcome Greeting Modal
// =============================================
// Displays a warm, professional Deck Restoration Plus greeting for newly registered
// customers and contractors. Appears exactly once per registered user/account.

import React from 'react';
import mainLogo from '../../assets/images/Main_Logo_v2.png';

export default function WelcomeGreetingModal({ isOpen, onClose, user, role = 'customer' }) {
  if (!isOpen) return null;

  const isContractor = role === 'contractor' || user?.role === 'contractor';
  const userName = user?.fullName || user?.name || (isContractor ? 'Partner Specialist' : 'Deck Owner');

  return (
    <div style={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Top Decorative Header Accent */}
        <div style={styles.headerAccent} />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={styles.closeBtn}
          aria-label="Close welcome message"
          title="Close"
        >
          ✕
        </button>

        {/* Content Body */}
        <div style={styles.content}>
          {/* Logo & Welcome Badge */}
          <div style={styles.brandRow}>
            <img src={mainLogo} alt="Deck Restoration Plus" style={styles.logo} />
            <span style={styles.badge}>
              {isContractor ? '★ CERTIFIED PARTNER ONBOARDING' : '★ OFFICIAL WELCOME'}
            </span>
          </div>

          <h2 style={styles.title}>
            Welcome to Deck Restoration Plus, {userName}!
          </h2>

          <p style={styles.description}>
            {isContractor
              ? 'Thank you for joining our elite trade contractor network. Your account is now provisioned with industry-leading wholesale pricing discounts, direct customer leads, multi-stage project dispatching, and automated timber estimation tools.'
              : 'Thank you for registering with Deck Restoration Plus, the industry standard in timber preservation. Your personal deck portal is ready—empowering you to calculate accurate deck restoration estimates, explore premium wood species treatments, and follow your project through to completion.'}
          </p>

          {/* Core Feature Highlights */}
          <div style={styles.highlightsGrid}>
            {isContractor ? (
              <>
                <div style={styles.highlightCard}>
                  <div style={styles.highlightIcon}>💼</div>
                  <div>
                    <strong style={styles.highlightTitle}>Wholesale Trade Tiers</strong>
                    <p style={styles.highlightSub}>Automatic 10% wholesale trade discount or custom individual overrides on every quote.</p>
                  </div>
                </div>
                <div style={styles.highlightCard}>
                  <div style={styles.highlightIcon}>🎯</div>
                  <div>
                    <strong style={styles.highlightTitle}>Hot Regional Leads</strong>
                    <p style={styles.highlightSub}>Direct project inquiries and reach-out bookings from verified homeowners in your territory.</p>
                  </div>
                </div>
                <div style={styles.highlightCard}>
                  <div style={styles.highlightIcon}>⚡</div>
                  <div>
                    <strong style={styles.highlightTitle}>Turnkey Estimation Suite</strong>
                    <p style={styles.highlightSub}>Instant rate-card lookups, chemical package calculations, and production speed forecasting.</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={styles.highlightCard}>
                  <div style={styles.highlightIcon}>📐</div>
                  <div>
                    <strong style={styles.highlightTitle}>Continuous Estimation Engine</strong>
                    <p style={styles.highlightSub}>Calculate accurate restoration quotes for railings, stairs, fascia, and surface areas in seconds.</p>
                  </div>
                </div>
                <div style={styles.highlightCard}>
                  <div style={styles.highlightIcon}>🌲</div>
                  <div>
                    <strong style={styles.highlightTitle}>Lumber Species Calibration</strong>
                    <p style={styles.highlightSub}>Tailored multi-coat finishes and chemical formulas for Cedar, Redwood, Mahogany, Ipe, and Treated Pine.</p>
                  </div>
                </div>
                <div style={styles.highlightCard}>
                  <div style={styles.highlightIcon}>🛡️</div>
                  <div>
                    <strong style={styles.highlightTitle}>Live 4-Stage Project Tracking</strong>
                    <p style={styles.highlightSub}>Track your project seamlessly from Estimation to Requested, In Progress, and Final Completion.</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action Button */}
          <div style={styles.actionsRow}>
            <button
              type="button"
              onClick={onClose}
              style={styles.primaryBtn}
            >
              Get Started &amp; Explore Your Portal →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '16px',
    boxSizing: 'border-box',
    animation: 'fadeIn 0.2s ease-out',
  },
  modal: {
    position: 'relative',
    width: '100%',
    maxWidth: '560px',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 25px 50px -12px rgba(15, 44, 89, 0.35), 0 0 0 1px rgba(15, 44, 89, 0.1)',
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  headerAccent: {
    height: '6px',
    background: 'linear-gradient(90deg, #034EA2 0%, #C96D22 50%, #059669 100%)',
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#F1F5F9',
    color: '#64748B',
    border: 'none',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
  },
  content: {
    padding: '28px 28px 24px',
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    gap: '12px',
    flexWrap: 'wrap',
  },
  logo: {
    height: '42px',
    objectFit: 'contain',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    backgroundColor: '#EFF6FF',
    color: '#034EA2',
    border: '1px solid #BFDBFE',
    borderRadius: '9999px',
    fontSize: '10.5px',
    fontWeight: '800',
    letterSpacing: '0.4px',
  },
  title: {
    fontSize: '21px',
    fontWeight: '800',
    color: '#0F2C59',
    margin: '0 0 8px',
    letterSpacing: '-0.3px',
    lineHeight: '1.3',
  },
  description: {
    fontSize: '13.5px',
    color: '#475569',
    lineHeight: '1.6',
    margin: '0 0 20px',
  },
  highlightsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '24px',
  },
  highlightCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '10px 14px',
    backgroundColor: '#F8FAFC',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
  },
  highlightIcon: {
    fontSize: '18px',
    lineHeight: 1,
    marginTop: '2px',
    flexShrink: 0,
  },
  highlightTitle: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '700',
    color: '#0F2C59',
    marginBottom: '2px',
  },
  highlightSub: {
    margin: 0,
    fontSize: '12px',
    color: '#64748B',
    lineHeight: '1.4',
  },
  actionsRow: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  primaryBtn: {
    width: '100%',
    padding: '12px 24px',
    backgroundColor: '#034EA2',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(3, 78, 162, 0.25)',
    transition: 'all 0.15s ease',
    textAlign: 'center',
  },
};


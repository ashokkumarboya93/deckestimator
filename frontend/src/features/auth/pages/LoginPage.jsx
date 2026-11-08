// =============================================
// Deck Estimator — Login Page
// Modern Split Layout matching UI Specification
// =============================================

import React from 'react';
import { LoginForm } from '../components/LoginForm';
import mainLogo from '../../../assets/images/MainLodo.png';

export default function LoginPage() {
  return (
    <div style={styles.pageContainer}>
      {/* Left Column: Floating Form Card */}
      <div style={styles.formColumn}>
        <div style={styles.formWrapper}>
          <LoginForm />
        </div>
      </div>

      {/* Right Column: Hero Visual Showcase */}
      <div style={styles.heroColumn}>
        <div style={styles.heroOverlay} />

        {/* Decorative Wave Overlay at bottom right */}
        <div style={styles.waveOverlay}>
          <svg viewBox="0 0 800 300" fill="none" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            <path
              d="M0 200 C 250 120, 500 280, 800 140 L 800 300 L 0 300 Z"
              fill="rgba(6, 26, 56, 0.75)"
            />
            <path
              d="M0 240 C 300 160, 550 310, 800 180 L 800 300 L 0 300 Z"
              fill="rgba(3, 18, 42, 0.9)"
            />
          </svg>
        </div>

        <div style={styles.heroContent}>
          {/* Logo on Right Hero Column */}
          <div style={styles.heroLogoWrap}>
            <img
              src={mainLogo}
              alt="Deck Restoration Plus"
              style={styles.heroLogoImg}
            />
          </div>

          {/* Orange Accent Bar */}
          <div style={styles.orangeBar} />

          {/* Main Headline */}
          <h2 style={styles.heroTitle}>
            Precision Estimates &amp; Contractor Management in One Platform.
          </h2>

          {/* Subtitle */}
          <p style={styles.heroText}>
            Join thousands of homeowners and certified contractors using DeckPro for interactive blueprints, transparent material itemization, and instant pricing.
          </p>

          {/* Feature Bullets with Orange Circles and Checkmarks */}
          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span style={styles.featureLabel}>Live Blueprint &amp; Material Calculations</span>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span style={styles.featureLabel}>Verified &amp; Licensed Contractor Network</span>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span style={styles.featureLabel}>Automated Payouts &amp; Commission Tracking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#F1F5F9',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  formColumn: {
    flex: '1 1 50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    backgroundColor: '#F1F5F9',
  },
  formWrapper: {
    width: '100%',
    maxWidth: '460px',
  },
  heroColumn: {
    flex: '1 1 50%',
    position: 'relative',
    backgroundImage: 'url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '60px 64px',
    color: '#ffffff',
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(8, 24, 48, 0.65) 0%, rgba(4, 15, 32, 0.85) 100%)',
    zIndex: 1,
  },
  waveOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '220px',
    zIndex: 2,
    pointerEvents: 'none',
  },
  heroContent: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '540px',
  },
  heroLogoWrap: {
    marginBottom: '12px',
  },
  heroLogoImg: {
    maxHeight: '48px',
    width: 'auto',
    objectFit: 'contain',
    filter: 'brightness(1.08)',
  },
  orangeBar: {
    width: '46px',
    height: '4px',
    backgroundColor: '#E08131',
    borderRadius: '2px',
    marginBottom: '20px',
  },
  heroTitle: {
    fontSize: '2.25rem',
    fontWeight: '800',
    lineHeight: '1.25',
    color: '#ffffff',
    margin: '0 0 16px 0',
    letterSpacing: '-0.4px',
  },
  heroText: {
    fontSize: '1rem',
    lineHeight: '1.65',
    color: '#CBD5E1',
    margin: '0 0 32px 0',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  featureIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#E08131',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 2px 6px rgba(224, 129, 49, 0.4)',
  },
  featureLabel: {
    fontSize: '0.98rem',
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: '-0.1px',
  },
};

// =============================================
// Deck Estimator — Register Page
// Modern SaaS Split View: Bright White & Light Navy Blue
// =============================================

import React from 'react';
import { RegistrationForm } from '../components/RegistrationForm';

export default function RegisterPage() {
  return (
    <div style={styles.pageContainer}>
      {/* Left Column: Form Container */}
      <div style={styles.formColumn}>
        <div style={styles.formWrapper}>
          <RegistrationForm />
        </div>
      </div>

      {/* Right Column: Hero Visual Showcase */}
      <div style={styles.heroColumn}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <div style={styles.brandBadge}>JOIN DECKPRO PLATFORM</div>
          <h2 style={styles.heroTitle}>
            Start Estimating Decks with Commercial Precision.
          </h2>
          <p style={styles.heroText}>
            Whether you are a homeowner calculating restoration costs or a licensed contractor expanding your pipeline, DeckPro provides end-to-end tooling.
          </p>

          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span>For Homeowners: Free transparent restoration quotes</span>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span>For Contractors: High-intent leads and discount policies</span>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span>Automated compliance and license verification</span>
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
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  formColumn: {
    flex: '1 1 50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    backgroundColor: '#ffffff',
  },
  formWrapper: {
    width: '100%',
    maxWidth: '480px',
  },
  heroColumn: {
    flex: '1 1 50%',
    position: 'relative',
    backgroundImage: 'url("https://images.unsplash.com/photo-1695550056778-de79c8cd909e?auto=format&fit=crop&w=1400&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '60px 50px',
    color: '#ffffff',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.4) 0%, rgba(15, 23, 42, 0.88) 100%)',
  },
  heroContent: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '520px',
  },
  brandBadge: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1px',
    padding: '4px 12px',
    borderRadius: '20px',
    backgroundColor: 'rgba(29, 78, 216, 0.65)',
    border: '1px solid rgba(147, 197, 253, 0.3)',
    marginBottom: '16px',
  },
  heroTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    lineHeight: '1.25',
    color: '#ffffff',
    margin: '0 0 16px 0',
  },
  heroText: {
    fontSize: '1rem',
    lineHeight: '1.6',
    color: '#cbd5e1',
    margin: '0 0 28px 0',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '0.92rem',
    color: '#f1f5f9',
    fontWeight: '500',
  },
  featureIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'rgba(29, 78, 216, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
};

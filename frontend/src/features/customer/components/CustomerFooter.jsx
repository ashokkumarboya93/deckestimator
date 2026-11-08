// =============================================
// Deck Estimator — Customer Dedicated Modern Footer
// =============================================
// Features:
// - Medium Navy Blue Theme (#1E3A63)
// - Official Deck Restoration Plus verified links and social media
// - Dynamic interactive guide modal trigger
// - Fully responsive 4-column layout with copyright sub-bar

import React from 'react';
import { Link } from 'react-router-dom';
import mainLogo from '../../../assets/images/MainLodo.png';

export default function CustomerFooter({ onOpenGuide }) {
  return (
    <footer style={styles.footerContainer}>
      <div style={styles.footerMainGrid}>
        {/* Column 1: Brand & Headquarters */}
        <div style={styles.footerColBrand}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={mainLogo}
              alt="Deck Restoration Plus"
              style={styles.footerLogo}
            />
          </div>
          <h5 style={styles.footerBrandTitle}>Precision Deck Restoration</h5>
          <p style={styles.footerBrandDesc}>
            Professional restoration, protection, and long-lasting beauty for outdoor decks and wood structures nationwide.
          </p>
          <div style={styles.addressBlock}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>152 Indian Mills Road, Unit A, Shamong, NJ 08088</span>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div style={styles.footerCol}>
          <h5 style={styles.footerColTitle}>Quick Links</h5>
          <ul style={styles.footerList}>
            <li>
              <Link to="/customer/dashboard" style={styles.footerLink}>Dashboard Overview</Link>
            </li>
            <li>
              <Link to="/customer/decks/new" style={styles.footerLink}>Deck Estimator Builder</Link>
            </li>
            <li>
              <Link to="/customer/estimates" style={styles.footerLink}>My Projects &amp; Estimates</Link>
            </li>
            <li>
              <Link to="/customer/profile" style={styles.footerLink}>Profile &amp; Account</Link>
            </li>
            <li>
              <Link to="/customer/support" style={styles.footerLink}>Help &amp; Support Documentation</Link>
            </li>
            <li>
              <button
                type="button"
                onClick={onOpenGuide}
                style={styles.footerLinkBtn}
              >
                Restoration Calculator Guide
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact & Support */}
        <div style={styles.footerCol}>
          <h5 style={styles.footerColTitle}>Contact &amp; Support</h5>
          <div style={styles.footerContactList}>
            <a href="tel:18664403325" style={styles.footerContactItem} title="Call Toll Free">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>1 (866) 440-DECK (3325)</span>
            </a>
            <a href="tel:16092683436" style={styles.footerContactItem} title="Call Office">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>(609) 268-3436 (Office)</span>
            </a>
            <a href="mailto:info@deckrestorationplus.com" style={styles.footerContactItem} title="Email Us">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>info@deckrestorationplus.com</span>
            </a>
            <div style={styles.footerContactItem}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Mon – Fri: 8:00 AM – 6:00 PM EST</span>
            </div>
          </div>
        </div>

        {/* Column 4: Official Sites & Social Media */}
        <div style={styles.footerCol}>
          <h5 style={styles.footerColTitle}>Connect With Us</h5>
          <p style={{ ...styles.footerBrandDesc, margin: '0 0 14px 0', fontSize: '12px' }}>
            Official social channels &amp; product store by the Wizard of Wood:
          </p>

          <div style={styles.socialIconsRow}>
            {/* Facebook */}
            <a
              href="https://www.facebook.com/DeckRestorationPlus"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.socialIconBtn}
              title="Deck Restoration Plus on Facebook"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            {/* Instagram */}
            <a
              href="https://www.instagram.com/deckrestorationplusproducts"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.socialIconBtn}
              title="Deck Restoration Plus Products on Instagram"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            {/* YouTube */}
            <a
              href="https://www.youtube.com/@EverettAbramsWizardofWood"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.socialIconBtn}
              title="Everett Abrams Wizard of Wood on YouTube"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/company/deck-restoration-plus"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.socialIconBtn}
              title="Deck Restoration Plus on LinkedIn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
          </div>

          <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <a
              href="https://www.deckrestorationplus.com"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.externalSiteLink}
            >
              <span>Main Website: deckrestorationplus.com</span>
              <span style={{ fontSize: '11px' }}>&nearr;</span>
            </a>
            <a
              href="https://deckandwoodstain.com"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.externalSiteLink}
            >
              <span>Product Store: deckandwoodstain.com</span>
              <span style={{ fontSize: '11px' }}>&nearr;</span>
            </a>
          </div>
        </div>
      </div>

      {/* Footer Sub-Bar with Divider */}
      <div style={styles.footerSubBar}>
        <div style={styles.footerCopyright}>
          &copy; {new Date().getFullYear()} Deck Restoration Plus. All rights reserved.
        </div>
        <div style={styles.footerPolicyLinks}>
          <a
            href="https://www.deckrestorationplus.com"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.footerPolicyLink}
          >
            Privacy Policy
          </a>
          <span style={styles.footerPolicyDivider}>|</span>
          <a
            href="https://www.deckrestorationplus.com"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.footerPolicyLink}
          >
            Terms of Service
          </a>
          <span style={styles.footerPolicyDivider}>|</span>
          <a
            href="https://www.deckrestorationplus.com"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.footerPolicyLink}
          >
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footerContainer: {
    backgroundColor: '#1E3A63',
    color: '#ffffff',
    padding: '36px 32px 20px 32px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    marginTop: 'auto',
  },
  footerMainGrid: {
    display: 'grid',
    gridTemplateColumns: '1.3fr 1fr 1.3fr 1.1fr',
    gap: '32px',
    marginBottom: '28px',
  },
  footerColBrand: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  footerLogo: {
    height: '36px',
    maxWidth: '190px',
    objectFit: 'contain',
  },
  footerBrandTitle: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    fontWeight: '700',
    color: '#ffffff',
  },
  footerBrandDesc: {
    margin: 0,
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.72)',
    lineHeight: '1.5',
    maxWidth: '320px',
  },
  addressBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11.5px',
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: '4px',
  },

  footerCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  footerColTitle: {
    margin: '0 0 14px 0',
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '0.2px',
  },
  footerList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '9px',
  },
  footerLink: {
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: '12.5px',
    textDecoration: 'none',
    transition: 'color 0.15s ease',
  },
  footerLinkBtn: {
    background: 'none',
    border: 'none',
    padding: 0,
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: '12.5px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'color 0.15s ease',
  },

  footerContactList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  footerContactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12.5px',
    color: 'rgba(255, 255, 255, 0.82)',
    textDecoration: 'none',
  },

  socialIconsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    justifyContent: 'flex-start',
  },
  socialIconBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    textDecoration: 'none',
    transition: 'all 0.18s ease',
  },
  externalSiteLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11.5px',
    color: '#60A5FA',
    textDecoration: 'none',
    fontWeight: '500',
  },

  footerSubBar: {
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    paddingTop: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  footerCopyright: {
    fontSize: '11.5px',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  footerPolicyLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '11.5px',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  footerPolicyLink: {
    color: 'rgba(255, 255, 255, 0.6)',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'color 0.15s ease',
  },
  footerPolicyDivider: {
    opacity: 0.4,
  },
};


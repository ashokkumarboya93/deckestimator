// =============================================
// Deck Estimator — Dedicated Contractor Portal Footer
// =============================================
// Features:
// - Medium Navy Blue Theme (#1E3A63)
// - Contractor wholesale & network quick links
// - Official headquarters contact & licensing
// - Responsive grid matching customer footer design

import React from 'react';
import { Link } from 'react-router-dom';
import mainLogo from '../../../assets/images/MainLodo.png';

export default function ContractorFooter() {
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
          <h5 style={styles.footerBrandTitle}>Contractor Partner Network</h5>
          <p style={styles.footerBrandDesc}>
            Professional contractor portal providing automated estimating formulas, 20% wholesale material pricing, and dedicated senior estimator technical support.
          </p>
          <div style={styles.addressBlock}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>152 Indian Mills Road, Unit A, Shamong, NJ 08088</span>
          </div>
        </div>

        {/* Column 2: Contractor Navigation */}
        <div style={styles.footerCol}>
          <h5 style={styles.footerColTitle}>Contractor Portal</h5>
          <ul style={styles.footerList}>
            <li>
              <Link to="/contractor/dashboard" style={styles.footerLink}>Dashboard Overview</Link>
            </li>
            <li>
              <Link to="/contractor/decks/new" style={styles.footerLink}>New Deck Estimation</Link>
            </li>
            <li>
              <Link to="/contractor/projects" style={styles.footerLink}>My Projects &amp; Estimates</Link>
            </li>
            <li>
              <Link to="/contractor/discounts-earnings" style={styles.footerLink}>Discounts &amp; Earnings</Link>
            </li>
            <li>
              <Link to="/contractor/profile" style={styles.footerLink}>Profile &amp; Verification</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Direct Contact Hub */}
        <div style={styles.footerCol}>
          <h5 style={styles.footerColTitle}>Contractor Support</h5>
          <div style={styles.footerContactList}>
            <a href="tel:8566783325" style={styles.footerContactItem} title="Call Contractor Line">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>(856) 678-3325 (Direct Office)</span>
            </a>
            <a href="tel:18664403325" style={styles.footerContactItem} title="Call Toll Free">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>1 (866) 440-DECK (3325)</span>
            </a>
            <a href="mailto:estimates@deckrestorationplus.com" style={styles.footerContactItem} title="Email Estimators">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>estimates@deckrestorationplus.com</span>
            </a>
            <div style={styles.footerContactItem}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Mon – Fri: 7:30 AM – 6:00 PM EST</span>
            </div>
          </div>
        </div>

        {/* Column 4: Wholesale Program & Standards */}
        <div style={styles.footerCol}>
          <h5 style={styles.footerColTitle}>Wholesale Standards</h5>
          <p style={{ ...styles.footerBrandDesc, margin: '0 0 12px 0' }}>
            Verified contractor accounts unlock 20% off commercial stains, strippers, and chemical restorative sealers.
          </p>
          <div style={styles.trustBadgeBox}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <strong style={{ fontSize: '12px', color: '#F8FAFC' }}>DRP Certified Partner</strong>
            </div>
            <span style={{ fontSize: '11px', color: '#94A3B8', display: 'block', lineHeight: 1.4 }}>
              EPA Lead-Safe Certified &bull; OSHA Substrate Safety &bull; Master Chemical Restoration
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Sub-bar */}
      <div style={styles.footerBottomBar}>
        <div style={styles.footerBottomContent}>
          <span style={styles.copyrightText}>
            &copy; {new Date().getFullYear()} Deck Restoration Plus, LLC. All rights reserved. Contractor Partner Platform.
          </span>
          <div style={styles.legalLinks}>
            <Link to="/contractor/support" style={styles.legalLink}>Contractor Guidelines</Link>
            <span style={styles.legalDot}>&bull;</span>
            <Link to="/contractor/profile" style={styles.legalLink}>Compliance Status</Link>
            <span style={styles.legalDot}>&bull;</span>
            <Link to="/contractor/discounts-earnings" style={styles.legalLink}>Commission Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footerContainer: {
    backgroundColor: '#1E3A63',
    color: '#E2E8F0',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    marginTop: 'auto',
    borderTop: '3px solid #E08131',
  },
  footerMainGrid: {
    maxWidth: '1360px',
    margin: '0 auto',
    padding: '26px 32px 20px 32px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '24px',
  },
  footerColBrand: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  footerLogo: {
    height: '30px',
    maxWidth: '180px',
    objectFit: 'contain',
    filter: 'brightness(0) invert(1)',
  },
  footerBrandTitle: {
    margin: '2px 0 0 0',
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: '0.4px',
    textTransform: 'uppercase',
  },
  footerBrandDesc: {
    margin: 0,
    fontSize: '11.5px',
    lineHeight: 1.5,
    color: '#CBD5E1',
  },
  addressBlock: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '6px',
    marginTop: '4px',
    fontSize: '11.5px',
    color: '#94A3B8',
    lineHeight: 1.4,
  },
  footerCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  footerColTitle: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    borderBottom: '2px solid rgba(224, 129, 49, 0.4)',
    paddingBottom: '6px',
    display: 'inline-block',
  },
  footerList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  footerLink: {
    color: '#CBD5E1',
    textDecoration: 'none',
    fontSize: '12px',
    transition: 'color 0.15s ease',
  },
  footerContactList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '9px',
  },
  footerContactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#CBD5E1',
    textDecoration: 'none',
    fontSize: '12px',
  },
  trustBadgeBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '8px',
    padding: '10px',
  },
  footerBottomBar: {
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: '#162C4B',
    padding: '10px 32px',
  },
  footerBottomContent: {
    maxWidth: '1360px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  copyrightText: {
    fontSize: '12px',
    color: '#94A3B8',
  },
  legalLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  legalLink: {
    fontSize: '12px',
    color: '#CBD5E1',
    textDecoration: 'none',
  },
  legalDot: {
    fontSize: '12px',
    color: '#64748B',
  },
};


// =============================================
// Deck Estimator — Dedicated Contractor Portal Footer
// =============================================
// Features:
// - Deep Navy Theme (#0B2447) matching exact UI specification
// - Column 1: Official Logo with orange accent swoosh, portal description, 3 outlined quick-action icons (Mail, Phone, Location)
// - Column 2: "Portal" section with orange underline bar, clean icons & links (Dashboard, Projects, Estimates, My Profile)
// - Column 3: "Support" section with orange underline bar, direct phone & email links
// - Column 4: DRP Certified Partner framed badge (Safety • Compliance • Quality)
// - Bottom Bar: Copyright + Contractor Guidelines | Compliance | Terms

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import mainLogo from '../../../assets/images/MainLodo.png';

export default function ContractorFooter() {
  const [hoveredBtn, setHoveredBtn] = useState(null);

  return (
    <footer style={styles.footerContainer}>
      {/* Background subtle curve accent */}
      <div style={styles.bgWaveOverlay} />

      <div style={styles.footerContent}>
        {/* Main 4-Column Modular Grid with subtle vertical dividers */}
        <div style={styles.footerMainGrid}>
          {/* Column 1: Brand Logo, Description & 3 Outlined Icon Buttons */}
          <div style={styles.col1}>
            <div style={styles.logoWrap}>
              <img
                src={mainLogo}
                alt="Deck Restoration Plus"
                style={styles.logoImg}
              />
            </div>

            {/* Orange Curved Swoosh Accent (Matches exact UI mock) */}
            <svg
              width="175"
              height="18"
              viewBox="0 0 175 18"
              fill="none"
              style={{ margin: '6px 0 14px 0', display: 'block' }}
              aria-hidden="true"
            >
              <path
                d="M 3 14 C 32 6, 105 3, 172 11 C 120 6, 48 8, 3 14 Z"
                fill="#E08131"
              />
            </svg>

            <p style={styles.col1Desc}>
              Contractor portal for deck restoration — estimates, projects, and wholesale materials.
            </p>

            {/* 3 Outlined Square/Rounded Icon Buttons in a Row */}
            <div style={styles.iconButtonsRow}>
              {/* Mail */}
              <a
                href="mailto:estimates@deckrestorationplus.com?subject=Contractor%20Portal%20Inquiry"
                style={{
                  ...styles.iconBtn,
                  backgroundColor: hoveredBtn === 'mail' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  borderColor: hoveredBtn === 'mail' ? '#E08131' : 'rgba(255, 255, 255, 0.25)',
                  color: hoveredBtn === 'mail' ? '#FFFFFF' : '#CBD5E1',
                }}
                onMouseEnter={() => setHoveredBtn('mail')}
                onMouseLeave={() => setHoveredBtn(null)}
                title="Email Contractor Support"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </a>

              {/* Phone */}
              <a
                href="tel:18664403325"
                style={{
                  ...styles.iconBtn,
                  backgroundColor: hoveredBtn === 'phone' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  borderColor: hoveredBtn === 'phone' ? '#E08131' : 'rgba(255, 255, 255, 0.25)',
                  color: hoveredBtn === 'phone' ? '#FFFFFF' : '#CBD5E1',
                }}
                onMouseEnter={() => setHoveredBtn('phone')}
                onMouseLeave={() => setHoveredBtn(null)}
                title="Call 1 (866) 440-DECK"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </a>

              {/* Location Pin */}
              <a
                href="https://maps.google.com/?q=152+Indian+Mills+Road,+Shamong,+NJ+08088"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...styles.iconBtn,
                  backgroundColor: hoveredBtn === 'pin' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  borderColor: hoveredBtn === 'pin' ? '#E08131' : 'rgba(255, 255, 255, 0.25)',
                  color: hoveredBtn === 'pin' ? '#FFFFFF' : '#CBD5E1',
                }}
                onMouseEnter={() => setHoveredBtn('pin')}
                onMouseLeave={() => setHoveredBtn(null)}
                title="Headquarters: Shamong, NJ 08088"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Portal Navigation with Orange Underline */}
          <div style={styles.col2}>
            <div style={styles.headerBlock}>
              <h4 style={styles.colTitle}>Portal</h4>
              <div style={styles.titleUnderline} />
            </div>

            <ul style={styles.linkList}>
              <li>
                <Link to="/contractor/dashboard" style={styles.portalLink}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to="/contractor/projects" style={styles.portalLink}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                  <span>Projects</span>
                </Link>
              </li>
              <li>
                <Link to="/contractor/decks/new" style={styles.portalLink}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  <span>Estimates</span>
                </Link>
              </li>
              <li>
                <Link to="/contractor/profile" style={styles.portalLink}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>My Profile</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support with Orange Underline */}
          <div style={styles.col3}>
            <div style={styles.headerBlock}>
              <h4 style={styles.colTitle}>Support</h4>
              <div style={styles.titleUnderline} />
            </div>

            <div style={styles.supportList}>
              <a href="tel:18664403325" style={styles.supportItem} title="Call Toll-Free Support">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>(866) 440-DECK (3325)</span>
              </a>

              <a href="mailto:estimates@deckrestorationplus.com" style={styles.supportItem} title="Email Estimator Support">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>estimates@deckrestorationplus.com</span>
              </a>
            </div>
          </div>

          {/* Column 4: DRP Certified Partner Badge / Card */}
          <div style={styles.col4}>
            <div style={styles.certifiedBadgeCard}>
              <div style={styles.badgeTopRow}>
                <div style={styles.shieldIconWrap}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E08131" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                </div>
                <div style={styles.badgeTitle}>DRP Certified Partner</div>
              </div>
              <div style={styles.badgeSub}>Safety &bull; Compliance &bull; Quality</div>
            </div>
          </div>
        </div>

        {/* Horizontal Divider Line */}
        <div style={styles.dividerLine} />

        {/* Bottom Sub-Bar: Copyright (Left) & Contractor Guidelines | Compliance | Terms (Right) */}
        <div style={styles.bottomBar}>
          <div style={styles.copyrightText}>
            &copy; {new Date().getFullYear()} Deck Restoration Plus, LLC. All rights reserved.
          </div>

          <div style={styles.legalLinks}>
            <Link to="/contractor/support" style={styles.legalLink}>Contractor Guidelines</Link>
            <span style={styles.legalSeparator}>|</span>
            <Link to="/contractor/profile" style={styles.legalLink}>Compliance</Link>
            <span style={styles.legalSeparator}>|</span>
            <Link to="/contractor/support" style={styles.legalLink}>Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footerContainer: {
    backgroundColor: '#0A1E3F',
    backgroundImage: 'linear-gradient(135deg, #071933 0%, #0B2447 50%, #06162C 100%)',
    color: '#E2E8F0',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    marginTop: 'auto',
    position: 'relative',
    overflow: 'hidden',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  },
  bgWaveOverlay: {
    position: 'absolute',
    right: '-10%',
    bottom: '-30%',
    width: '600px',
    height: '400px',
    background: 'radial-gradient(ellipse at bottom right, rgba(14, 42, 82, 0.6) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  footerContent: {
    maxWidth: '1360px',
    margin: '0 auto',
    padding: '36px 36px 20px 36px',
    position: 'relative',
    zIndex: 1,
  },
  footerMainGrid: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr 1.2fr 1.1fr',
    gap: '32px',
    alignItems: 'flex-start',
  },

  // Column 1
  col1: {
    display: 'flex',
    flexDirection: 'column',
    paddingRight: '16px',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '4px',
  },
  logoImg: {
    maxHeight: '44px',
    width: 'auto',
    objectFit: 'contain',
    filter: 'brightness(1.05)',
  },
  orangeSwoosh: {
    width: '130px',
    height: '4px',
    background: 'linear-gradient(90deg, #E08131 0%, #F59E0B 75%, transparent 100%)',
    borderRadius: '2px',
    margin: '8px 0 14px 0',
  },
  col1Desc: {
    fontSize: '13px',
    color: '#94A3B8',
    lineHeight: 1.5,
    margin: '0 0 18px 0',
    maxWidth: '300px',
  },
  iconButtonsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  iconBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '7px',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#CBD5E1',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
  },

  // Column 2: Portal
  col2: {
    display: 'flex',
    flexDirection: 'column',
    paddingRight: '16px',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
  },
  headerBlock: {
    marginBottom: '14px',
  },
  colTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#FFFFFF',
    margin: '0 0 4px 0',
    letterSpacing: '-0.2px',
  },
  titleUnderline: {
    width: '30px',
    height: '2.5px',
    backgroundColor: '#E08131',
    borderRadius: '2px',
  },
  linkList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  portalLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    color: '#E2E8F0',
    textDecoration: 'none',
    fontSize: '13.5px',
    fontWeight: '500',
    transition: 'color 0.15s ease, transform 0.15s ease',
  },

  // Column 3: Support
  col3: {
    display: 'flex',
    flexDirection: 'column',
    paddingRight: '16px',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
  },
  supportList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  supportItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    color: '#E2E8F0',
    textDecoration: 'none',
    fontSize: '13.5px',
    fontWeight: '500',
    wordBreak: 'break-all',
    transition: 'color 0.15s ease',
  },

  // Column 4: Certified Partner Card
  col4: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  certifiedBadgeCard: {
    border: '1.5px solid #E08131',
    backgroundColor: 'rgba(224, 129, 49, 0.05)',
    borderRadius: '10px',
    padding: '18px 22px',
    width: '100%',
    maxWidth: '280px',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  badgeTopRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  shieldIconWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  badgeTitle: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: '-0.2px',
  },
  badgeSub: {
    fontSize: '11px',
    color: '#94A3B8',
    letterSpacing: '0.4px',
    paddingLeft: '32px',
  },

  // Bottom Sub-bar
  dividerLine: {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    margin: '28px 0 16px 0',
  },
  bottomBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '14px',
  },
  copyrightText: {
    fontSize: '12.5px',
    color: '#94A3B8',
  },
  legalLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  legalLink: {
    fontSize: '12.5px',
    color: '#CBD5E1',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.15s ease',
  },
  legalSeparator: {
    color: 'rgba(255, 255, 255, 0.25)',
    fontSize: '12px',
  },
};

// =============================================
// Deck Estimator — Contractor Dedicated Compact Footer
// =============================================
// Responsive 4-Column Desktop -> 2-Column Tablet/Mobile compact footprint
// Official Deck Restoration Plus Contact Info, Social Links, Site Map & Policies

import React from 'react';
import { Link } from 'react-router-dom';
import mainLogo from '../../../assets/images/MainLodo.png';

const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/deckrestorationplus',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/DeckRestorationPlus08088/',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    name: 'X (Twitter)',
    href: 'https://x.com/DeckRestoration',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
        <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/channel/UCB0oRnZ0n6s0Fw3BfA2P9qA',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </svg>
    ),
  },
  {
    name: 'Pinterest',
    href: 'https://www.pinterest.com/deckrestorationplus/',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 20l4-9" />
        <path d="M10.7 14c.437 1.263 1.43 2 2.55 2c2.071 0 3.75-1.554 3.75-4a5 5 0 1 0-9.7 1.7" />
      </svg>
    ),
  },
];

const SITE_MAP_LINKS = [
  { label: 'Home', href: 'https://www.deckrestorationplus.com/home' },
  { label: 'About', href: 'https://www.deckrestorationplus.com/about-drp' },
  { label: 'Services', href: 'https://www.deckrestorationplus.com/services' },
  { label: 'Shop / Supplies', href: 'https://www.deckrestorationplus.com/shop' },
  { label: 'Portfolio', href: 'https://www.deckrestorationplus.com/portfolio' },
  { label: 'Blog', href: 'https://www.deckrestorationplus.com/blog' },
  { label: 'Distributors', href: 'https://www.deckrestorationplus.com/distributors' },
  { label: 'Manual', href: 'https://www.deckrestorationplus.com/shop/p/manual' },
];

export default function ContractorFooter() {
  return (
    <footer className="drp-portal-footer">
      <style>{`
        .drp-portal-footer {
          background-color: #0A1E3F;
          background-image: linear-gradient(135deg, #071933 0%, #0B2447 50%, #06162C 100%);
          color: #E2E8F0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin-top: auto;
          position: relative;
          overflow: hidden;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .drp-footer-inner {
          max-width: 1360px;
          margin: 0 auto;
          padding: 14px 24px 10px;
          position: relative;
          z-index: 1;
        }
        .drp-footer-grid {
          display: grid;
          grid-template-columns: 1.15fr 1.2fr 1.15fr 0.85fr;
          gap: 14px;
          align-items: start;
        }
        .drp-footer-col {
          display: flex;
          flex-direction: column;
          padding-right: 12px;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          min-width: 0;
        }
        .drp-footer-col:last-child {
          padding-right: 0;
          border-right: none;
        }
        .drp-footer-logo {
          max-height: 28px;
          width: auto;
          object-fit: contain;
        }
        .drp-footer-social-btn {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.22);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #CBD5E1;
          text-decoration: none;
          transition: all 0.16s ease;
          background: rgba(255, 255, 255, 0.03);
        }
        .drp-footer-social-btn:hover {
          background-color: rgba(224, 129, 49, 0.18);
          border-color: #E08131;
          color: #FFFFFF;
          transform: translateY(-1px);
        }
        .drp-footer-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #E2E8F0;
          text-decoration: none;
          font-size: 11px;
          font-weight: 500;
          line-height: 1.3;
          transition: color 0.15s ease;
        }
        .drp-footer-link:hover {
          color: #FDBA74;
        }
        .drp-portal-links-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 4px 8px;
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .drp-sitemap-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 3px 8px;
          margin-top: 6px;
          padding-top: 6px;
          border-top: 1px dashed rgba(255, 255, 255, 0.12);
        }
        .drp-sitemap-link {
          color: #94A3B8;
          text-decoration: none;
          font-size: 10.5px;
          font-weight: 500;
          line-height: 1.3;
          transition: color 0.15s ease;
        }
        .drp-sitemap-link:hover {
          color: #FDBA74;
        }
        @media (max-width: 1024px) {
          .drp-footer-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
          }
          .drp-footer-col {
            padding-right: 0;
            border-right: none;
          }
          .drp-portal-links-grid,
          .drp-sitemap-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 640px) {
          .drp-footer-inner {
            padding: 12px 14px 10px;
          }
          .drp-footer-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .drp-footer-logo {
            max-height: 24px;
          }
          .drp-footer-desc {
            display: none;
          }
          .drp-portal-links-grid,
          .drp-sitemap-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 4px 8px;
          }
          .drp-footer-social-btn {
            width: 25px;
            height: 25px;
          }
          .drp-footer-bottom {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 4px !important;
          }
        }
      `}</style>

      <div className="drp-footer-inner">
        <div className="drp-footer-grid">
          {/* Column 1: Brand & Social */}
          <div className="drp-footer-col">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
              <img src={mainLogo} alt="Deck Restoration Plus" className="drp-footer-logo" loading="lazy" />
            </div>
            <p className="drp-footer-desc" style={{ fontSize: '11.5px', color: '#94A3B8', lineHeight: 1.4, margin: '0 0 10px', maxWidth: '280px' }}>
              Contractor partner portal for exterior wood deck restoration — commercial estimating &amp; partner pricing.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="drp-footer-social-btn"
                  title={s.name}
                  aria-label={`Deck Restoration Plus on ${s.name}`}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Contractor Portal & Site Map */}
          <div className="drp-footer-col">
            <div style={styles.headerBlock}>
              <h4 style={styles.colTitle}>Portal &amp; Site Map</h4>
              <div style={styles.titleUnderline} />
            </div>
            <ul className="drp-portal-links-grid">
              <li><Link to="/contractor/dashboard" className="drp-footer-link">Dashboard</Link></li>
              <li><Link to="/contractor/decks/new" className="drp-footer-link">New Estimation</Link></li>
              <li><Link to="/contractor/projects" className="drp-footer-link">My Projects</Link></li>
              <li><Link to="/contractor/discounts-earnings" className="drp-footer-link">Discounts &amp; Earnings</Link></li>
              <li><Link to="/contractor/profile" className="drp-footer-link">Profile Settings</Link></li>
            </ul>
            <div className="drp-sitemap-grid">
              {SITE_MAP_LINKS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="drp-sitemap-link"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* Column 3: Official Contact */}
          <div className="drp-footer-col">
            <div style={styles.headerBlock}>
              <h4 style={styles.colTitle}>Contact</h4>
              <div style={styles.titleUnderline} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <a
                href="https://maps.google.com/?q=152+Indian+Mills+Road+Unit+B,+Shamong,+NJ+08088"
                target="_blank"
                rel="noopener noreferrer"
                className="drp-footer-link"
                style={{ alignItems: 'flex-start' }}
                title="View Headquarters in Google Maps"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E08131" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Deck Restoration Plus &bull; 152 Indian Mills Rd Unit #B, Shamong, NJ 08088</span>
              </a>

              <a href="tel:18664403325" className="drp-footer-link" title="Call Main Office">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E08131" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>Main: (866) 440-DECK</span>
              </a>

              <a href="tel:16092683436" className="drp-footer-link" title="Call Shamong Office">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E08131" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>Shamong: (609) 268-3436</span>
              </a>

              <a href="mailto:info@deckrestorationplus.com?subject=Website%20Inquiry" className="drp-footer-link" style={{ wordBreak: 'break-all' }} title="Email Deck Restoration Plus">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E08131" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>info@deckrestorationplus.com</span>
              </a>
            </div>
          </div>

          {/* Column 4: DRP Certified & Policies */}
          <div className="drp-footer-col">
            <div style={styles.certifiedBadgeCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#E08131" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#FFFFFF', lineHeight: 1.2 }}>DRP Certified Partner</div>
                  <div style={{ fontSize: '10px', color: '#94A3B8' }}>Safety &bull; Compliance &bull; Quality</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px 12px' }}>
              <a href="https://www.deckrestorationplus.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="drp-sitemap-link">Privacy Policy</a>
              <a href="https://www.deckrestorationplus.com/refund-policy" target="_blank" rel="noopener noreferrer" className="drp-sitemap-link">Refund Policy</a>
              <a href="https://www.deckrestorationplus.com/terms-of-use" target="_blank" rel="noopener noreferrer" className="drp-sitemap-link">Terms of Use</a>
            </div>
          </div>
        </div>

        <div style={styles.dividerLine} />

        <div className="drp-footer-bottom" style={styles.bottomBar}>
          <div style={{ fontSize: '11px', color: '#94A3B8' }}>
            &copy; {new Date().getFullYear()} Deck Restoration Plus, LLC. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Link to="/contractor/support" className="drp-sitemap-link">Contractor Guidelines</Link>
            <span style={styles.legalSeparator}>|</span>
            <a href="https://www.deckrestorationplus.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="drp-sitemap-link">Privacy Policy</a>
            <span style={styles.legalSeparator}>|</span>
            <a href="https://www.deckrestorationplus.com/terms-of-use" target="_blank" rel="noopener noreferrer" className="drp-sitemap-link">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  headerBlock: {
    marginBottom: '8px',
  },
  colTitle: {
    fontSize: '12.5px',
    fontWeight: '800',
    color: '#FFFFFF',
    margin: '0 0 3px 0',
    letterSpacing: '-0.1px',
  },
  titleUnderline: {
    width: '24px',
    height: '2px',
    backgroundColor: '#E08131',
    borderRadius: '2px',
  },
  certifiedBadgeCard: {
    border: '1px solid rgba(224, 129, 49, 0.7)',
    backgroundColor: 'rgba(224, 129, 49, 0.06)',
    borderRadius: '8px',
    padding: '8px 11px',
    width: '100%',
    boxSizing: 'border-box',
  },
  dividerLine: {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: '12px 0 8px 0',
  },
  bottomBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '8px',
  },
  legalSeparator: {
    color: 'rgba(255, 255, 255, 0.25)',
    fontSize: '11px',
  },
};

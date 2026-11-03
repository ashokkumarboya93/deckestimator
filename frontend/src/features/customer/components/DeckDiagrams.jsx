// =============================================
// Deck Estimator — Crisp Architectural SVG Icons & Plan
// =============================================
// Provides modern, clean vector line & fill icons for deck shapes, heights, levels, and services.

import React from 'react';

// 1.1 DECK SHAPE ICONS
export function RectangleDeckIcon({ width = 48, height = 48, active = false }) {
  const stroke = active ? '#16a34a' : '#2563eb';
  const fill = active ? '#dcfce7' : '#eff6ff';

  return (
    <svg width={width} height={height} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="10" width="36" height="28" rx="4" fill={fill} stroke={stroke} strokeWidth="2" />
      {/* Planks */}
      <line x1="14" y1="10" x2="14" y2="38" stroke={stroke} strokeWidth="1.2" strokeDasharray="1 1" opacity="0.6" />
      <line x1="22" y1="10" x2="22" y2="38" stroke={stroke} strokeWidth="1.2" strokeDasharray="1 1" opacity="0.6" />
      <line x1="30" y1="10" x2="30" y2="38" stroke={stroke} strokeWidth="1.2" strokeDasharray="1 1" opacity="0.6" />
      <line x1="38" y1="10" x2="38" y2="38" stroke={stroke} strokeWidth="1.2" strokeDasharray="1 1" opacity="0.6" />
      {/* Corner posts */}
      <circle cx="6" cy="10" r="2.5" fill={stroke} />
      <circle cx="42" cy="10" r="2.5" fill={stroke} />
      <circle cx="6" cy="38" r="2.5" fill={stroke} />
      <circle cx="42" cy="38" r="2.5" fill={stroke} />
    </svg>
  );
}

export function LShapeDeckIcon({ width = 48, height = 48, active = false }) {
  const stroke = active ? '#16a34a' : '#2563eb';
  const fill = active ? '#dcfce7' : '#eff6ff';

  return (
    <svg width={width} height={height} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 10H42V24H24V38H6V10Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Planks */}
      <line x1="14" y1="10" x2="14" y2="38" stroke={stroke} strokeWidth="1.2" opacity="0.5" />
      <line x1="22" y1="10" x2="22" y2="24" stroke={stroke} strokeWidth="1.2" opacity="0.5" />
      <line x1="32" y1="10" x2="32" y2="24" stroke={stroke} strokeWidth="1.2" opacity="0.5" />
      <circle cx="6" cy="10" r="2.5" fill={stroke} />
      <circle cx="42" cy="10" r="2.5" fill={stroke} />
      <circle cx="42" cy="24" r="2.5" fill={stroke} />
      <circle cx="24" cy="38" r="2.5" fill={stroke} />
      <circle cx="6" cy="38" r="2.5" fill={stroke} />
    </svg>
  );
}

export function MultiLevelDeckIcon({ width = 48, height = 48, active = false }) {
  const stroke = active ? '#16a34a' : '#2563eb';
  const fill = active ? '#dcfce7' : '#eff6ff';

  return (
    <svg width={width} height={height} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Upper tier */}
      <rect x="8" y="8" width="32" height="14" rx="2" fill={fill} stroke={stroke} strokeWidth="2" />
      {/* Connecting step */}
      <rect x="18" y="22" width="12" height="6" fill="#cbd5e1" stroke={stroke} strokeWidth="1.5" />
      {/* Lower tier */}
      <rect x="4" y="28" width="40" height="14" rx="2" fill={fill} stroke={stroke} strokeWidth="2" />
      {/* Planks */}
      <line x1="16" y1="8" x2="16" y2="22" stroke={stroke} strokeWidth="1" opacity="0.5" />
      <line x1="24" y1="8" x2="24" y2="22" stroke={stroke} strokeWidth="1" opacity="0.5" />
      <line x1="32" y1="8" x2="32" y2="22" stroke={stroke} strokeWidth="1" opacity="0.5" />
      <line x1="14" y1="28" x2="14" y2="42" stroke={stroke} strokeWidth="1" opacity="0.5" />
      <line x1="24" y1="28" x2="24" y2="42" stroke={stroke} strokeWidth="1" opacity="0.5" />
      <line x1="34" y1="28" x2="34" y2="42" stroke={stroke} strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

export function CustomDeckIcon({ width = 48, height = 48, active = false }) {
  const stroke = active ? '#16a34a' : '#2563eb';
  const fill = active ? '#dcfce7' : '#eff6ff';

  return (
    <svg width={width} height={height} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14 8H34L44 24L34 40H14L4 24L14 8Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="24" r="6" stroke={stroke} strokeWidth="1.5" fill="none" opacity="0.7" />
      <line x1="24" y1="8" x2="24" y2="18" stroke={stroke} strokeWidth="1.2" opacity="0.5" />
      <line x1="24" y1="30" x2="24" y2="40" stroke={stroke} strokeWidth="1.2" opacity="0.5" />
      <line x1="8" y1="24" x2="18" y2="24" stroke={stroke} strokeWidth="1.2" opacity="0.5" />
      <line x1="30" y1="24" x2="40" y2="24" stroke={stroke} strokeWidth="1.2" opacity="0.5" />
    </svg>
  );
}

// 1.3 DECK HEIGHT ICONS
export function HeightGroundIcon({ width = 44, height = 44, active = false }) {
  const stroke = active ? '#16a34a' : '#475569';
  const fill = active ? '#dcfce7' : '#f1f5f9';

  return (
    <svg width={width} height={height} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ground line */}
      <line x1="2" y1="38" x2="42" y2="38" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 2" />
      {/* Flush Platform (0 - 2 ft) */}
      <rect x="6" y="30" width="32" height="7" rx="1.5" fill={fill} stroke={stroke} strokeWidth="1.8" />
      {/* Short riser blocks */}
      <rect x="10" y="37" width="4" height="2" fill={stroke} />
      <rect x="30" y="37" width="4" height="2" fill={stroke} />
      {/* Level measurement arrow */}
      <path d="M40 30L40 37" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function HeightLowIcon({ width = 44, height = 44, active = false }) {
  const stroke = active ? '#16a34a' : '#475569';
  const fill = active ? '#dcfce7' : '#f1f5f9';

  return (
    <svg width={width} height={height} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="2" y1="38" x2="42" y2="38" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 2" />
      {/* Low Platform (2 - 4 ft) */}
      <rect x="6" y="24" width="32" height="6" rx="1.5" fill={fill} stroke={stroke} strokeWidth="1.8" />
      {/* Posts */}
      <rect x="10" y="30" width="4" height="8" fill={stroke} />
      <rect x="30" y="30" width="4" height="8" fill={stroke} />
      {/* Railing */}
      <line x1="6" y1="16" x2="38" y2="16" stroke={stroke} strokeWidth="1.5" />
      <line x1="6" y1="16" x2="6" y2="24" stroke={stroke} strokeWidth="1.5" />
      <line x1="38" y1="16" x2="38" y2="24" stroke={stroke} strokeWidth="1.5" />
    </svg>
  );
}

export function HeightMediumIcon({ width = 44, height = 44, active = false }) {
  const stroke = active ? '#16a34a' : '#475569';
  const fill = active ? '#dcfce7' : '#f1f5f9';

  return (
    <svg width={width} height={height} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="2" y1="38" x2="42" y2="38" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 2" />
      {/* Medium Platform (4 - 8 ft) */}
      <rect x="6" y="18" width="32" height="6" rx="1.5" fill={fill} stroke={stroke} strokeWidth="1.8" />
      {/* Taller Posts */}
      <rect x="10" y="24" width="4" height="14" fill={stroke} />
      <rect x="30" y="24" width="4" height="14" fill={stroke} />
      {/* Cross bracing */}
      <line x1="14" y1="25" x2="30" y2="37" stroke={stroke} strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
      {/* Railing */}
      <line x1="6" y1="10" x2="38" y2="10" stroke={stroke} strokeWidth="1.5" />
      <line x1="6" y1="10" x2="6" y2="18" stroke={stroke} strokeWidth="1.5" />
      <line x1="38" y1="10" x2="38" y2="18" stroke={stroke} strokeWidth="1.5" />
    </svg>
  );
}

export function HeightHighIcon({ width = 44, height = 44, active = false }) {
  const stroke = active ? '#16a34a' : '#475569';
  const fill = active ? '#dcfce7' : '#f1f5f9';

  return (
    <svg width={width} height={height} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="2" y1="38" x2="42" y2="38" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 2" />
      {/* High Platform (8+ ft) */}
      <rect x="6" y="12" width="32" height="6" rx="1.5" fill={fill} stroke={stroke} strokeWidth="1.8" />
      {/* Tall Posts */}
      <rect x="10" y="18" width="4" height="20" fill={stroke} />
      <rect x="30" y="18" width="4" height="20" fill={stroke} />
      {/* Diagonal brace */}
      <line x1="14" y1="19" x2="30" y2="37" stroke={stroke} strokeWidth="1.2" opacity="0.6" />
      <line x1="30" y1="19" x2="14" y2="37" stroke={stroke} strokeWidth="1.2" opacity="0.6" />
      {/* Stairs representation */}
      <path d="M38 18L42 38" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
      {/* Railing */}
      <line x1="6" y1="5" x2="38" y2="5" stroke={stroke} strokeWidth="1.5" />
      <line x1="6" y1="5" x2="6" y2="12" stroke={stroke} strokeWidth="1.5" />
      <line x1="38" y1="5" x2="38" y2="12" stroke={stroke} strokeWidth="1.5" />
    </svg>
  );
}

// 1.4 NUMBER OF LEVELS ICONS
export function LevelSingleIcon({ width = 44, height = 44, active = false }) {
  const stroke = active ? '#16a34a' : '#2563eb';
  const fill = active ? '#dcfce7' : '#eff6ff';

  return (
    <svg width={width} height={height} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="16" width="32" height="14" rx="3" fill={fill} stroke={stroke} strokeWidth="2" />
      <line x1="14" y1="16" x2="14" y2="30" stroke={stroke} strokeWidth="1" opacity="0.5" />
      <line x1="22" y1="16" x2="22" y2="30" stroke={stroke} strokeWidth="1" opacity="0.5" />
      <line x1="30" y1="16" x2="30" y2="30" stroke={stroke} strokeWidth="1" opacity="0.5" />
      <text x="22" y="38" textAnchor="middle" fontSize="10" fontWeight="700" fill={stroke}>1 Level</text>
    </svg>
  );
}

export function LevelTwoIcon({ width = 44, height = 44, active = false }) {
  const stroke = active ? '#16a34a' : '#2563eb';
  const fill = active ? '#dcfce7' : '#eff6ff';

  return (
    <svg width={width} height={height} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="8" width="24" height="12" rx="2" fill={fill} stroke={stroke} strokeWidth="1.8" />
      <rect x="6" y="20" width="24" height="12" rx="2" fill={fill} stroke={stroke} strokeWidth="1.8" />
      <text x="22" y="40" textAnchor="middle" fontSize="10" fontWeight="700" fill={stroke}>2 Levels</text>
    </svg>
  );
}

export function LevelMultiIcon({ width = 44, height = 44, active = false }) {
  const stroke = active ? '#16a34a' : '#2563eb';
  const fill = active ? '#dcfce7' : '#eff6ff';

  return (
    <svg width={width} height={height} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="6" width="20" height="9" rx="1.5" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <rect x="12" y="16" width="20" height="9" rx="1.5" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <rect x="4" y="26" width="20" height="9" rx="1.5" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <text x="22" y="42" textAnchor="middle" fontSize="9" fontWeight="700" fill={stroke}>3+ Levels</text>
    </svg>
  );
}

// TOP-DOWN ARCHITECTURAL BLUEPRINT PLAN
export function TopDownDeckPlanSvg({ length = 20, width = 12 }) {
  return (
    <svg width="100%" height="150" viewBox="0 0 280 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="gridPattern" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
        </pattern>
      </defs>
      {/* Blueprint Grid Background */}
      <rect width="280" height="150" rx="8" fill="#f8fafc" />
      <rect width="280" height="150" rx="8" fill="url(#gridPattern)" />

      {/* Main Deck Floor Plan */}
      <rect x="45" y="30" width="180" height="90" rx="4" fill="#b45309" stroke="#78350f" strokeWidth="2" />

      {/* Deck Planks */}
      <g stroke="#92400e" strokeWidth="1" opacity="0.6">
        <line x1="45" y1="45" x2="225" y2="45" />
        <line x1="45" y1="60" x2="225" y2="60" />
        <line x1="45" y1="75" x2="225" y2="75" />
        <line x1="45" y1="90" x2="225" y2="90" />
        <line x1="45" y1="105" x2="225" y2="105" />
      </g>

      {/* Patio Furniture (Sofa & Table) */}
      <rect x="160" y="40" width="50" height="20" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
      <rect x="190" y="60" width="20" height="35" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
      <rect x="160" y="66" width="22" height="22" rx="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />

      {/* Planter Pots */}
      <circle cx="58" cy="42" r="5" fill="#15803d" />
      <circle cx="58" cy="108" r="5" fill="#15803d" />

      {/* Dimension Line: Length */}
      <line x1="45" y1="16" x2="225" y2="16" stroke="#0f172a" strokeWidth="1.5" />
      <line x1="45" y1="12" x2="45" y2="20" stroke="#0f172a" strokeWidth="1.5" />
      <line x1="225" y1="12" x2="225" y2="20" stroke="#0f172a" strokeWidth="1.5" />
      <rect x="105" y="7" width="60" height="18" rx="4" fill="#0f172a" />
      <text x="135" y="20" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="700">
        Length: {length || 20} ft
      </text>

      {/* Dimension Line: Width */}
      <line x1="26" y1="30" x2="26" y2="120" stroke="#0f172a" strokeWidth="1.5" />
      <line x1="22" y1="30" x2="30" y2="30" stroke="#0f172a" strokeWidth="1.5" />
      <line x1="22" y1="120" x2="30" y2="120" stroke="#0f172a" strokeWidth="1.5" />
      <rect x="5" y="68" width="40" height="16" rx="4" fill="#0f172a" />
      <text x="25" y="80" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="700">
        {width || 12} ft
      </text>
    </svg>
  );
}

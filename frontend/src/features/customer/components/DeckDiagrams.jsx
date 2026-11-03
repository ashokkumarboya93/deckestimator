// =============================================
// Deck Estimator — High-Fidelity SVG Illustrations
// =============================================
// Provides crisp, scalable SVG illustrations matching the reference mockups.

import React from 'react';

export function RectangleDeckSvg({ width = 160, height = 90 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rectWood" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id="rectPlank" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
      </defs>
      {/* Garden Greenery Background */}
      <rect x="0" y="0" width="160" height="90" rx="6" fill="#14532d" />
      <circle cx="20" cy="15" r="16" fill="#166534" opacity="0.6" />
      <circle cx="140" cy="20" r="18" fill="#15803d" opacity="0.5" />
      <circle cx="80" cy="10" r="14" fill="#166534" opacity="0.7" />

      {/* 3D Isometric Deck Surface */}
      <polygon points="25,48 135,48 150,78 10,78" fill="url(#rectWood)" stroke="#78350f" strokeWidth="1.5" />
      {/* Planks */}
      <line x1="38" y1="48" x2="26" y2="78" stroke="url(#rectPlank)" strokeWidth="1.5" opacity="0.6" />
      <line x1="58" y1="48" x2="48" y2="78" stroke="url(#rectPlank)" strokeWidth="1.5" opacity="0.6" />
      <line x1="80" y1="48" x2="74" y2="78" stroke="url(#rectPlank)" strokeWidth="1.5" opacity="0.6" />
      <line x1="102" y1="48" x2="100" y2="78" stroke="url(#rectPlank)" strokeWidth="1.5" opacity="0.6" />
      <line x1="122" y1="48" x2="126" y2="78" stroke="url(#rectPlank)" strokeWidth="1.5" opacity="0.6" />

      {/* Front Skirt */}
      <polygon points="10,78 150,78 150,84 10,84" fill="#78350f" />

      {/* Perimeter Railing */}
      <polyline points="25,48 25,32 135,32 135,48" stroke="#92400e" strokeWidth="2.5" fill="none" />
      <polyline points="10,78 10,60 25,32" stroke="#92400e" strokeWidth="2.5" fill="none" />
      <polyline points="150,78 150,60 135,32" stroke="#92400e" strokeWidth="2.5" fill="none" />

      {/* Railing Spindles */}
      <line x1="45" y1="48" x2="45" y2="32" stroke="#78350f" strokeWidth="1" />
      <line x1="65" y1="48" x2="65" y2="32" stroke="#78350f" strokeWidth="1" />
      <line x1="85" y1="48" x2="85" y2="32" stroke="#78350f" strokeWidth="1" />
      <line x1="105" y1="48" x2="105" y2="32" stroke="#78350f" strokeWidth="1" />
      <line x1="125" y1="48" x2="125" y2="32" stroke="#78350f" strokeWidth="1" />
    </svg>
  );
}

export function LShapeDeckSvg({ width = 160, height = 90 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="160" height="90" rx="6" fill="#14532d" />
      <circle cx="25" cy="18" r="15" fill="#166534" opacity="0.6" />
      <circle cx="135" cy="15" r="16" fill="#15803d" opacity="0.5" />

      {/* L-Shape Main Deck Surface */}
      <polygon points="20,40 90,40 90,52 145,52 135,80 10,80" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
      {/* Planks */}
      <line x1="40" y1="40" x2="32" y2="80" stroke="#78350f" strokeWidth="1.5" opacity="0.6" />
      <line x1="65" y1="40" x2="60" y2="80" stroke="#78350f" strokeWidth="1.5" opacity="0.6" />
      <line x1="90" y1="52" x2="88" y2="80" stroke="#78350f" strokeWidth="1.5" opacity="0.6" />
      <line x1="115" y1="52" x2="114" y2="80" stroke="#78350f" strokeWidth="1.5" opacity="0.6" />

      {/* Front Skirt */}
      <polygon points="10,80 135,80 135,85 10,85" fill="#78350f" />

      {/* Railings */}
      <polyline points="20,40 20,26 90,26 90,38 145,38 145,52" stroke="#92400e" strokeWidth="2.5" fill="none" />
      <polyline points="10,80 10,64 20,40" stroke="#92400e" strokeWidth="2.5" fill="none" />
      <polyline points="135,80 135,66 145,52" stroke="#92400e" strokeWidth="2.5" fill="none" />
    </svg>
  );
}

export function MultiLevelDeckSvg({ width = 160, height = 90 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="160" height="90" rx="6" fill="#14532d" />

      {/* Upper Deck */}
      <polygon points="35,32 125,32 135,52 25,52" fill="#d97706" stroke="#78350f" strokeWidth="1.5" />
      <polyline points="35,32 35,18 125,18 125,32" stroke="#92400e" strokeWidth="2.5" fill="none" />

      {/* Connecting Stairs */}
      <polygon points="65,52 95,52 92,62 62,62" fill="#92400e" />
      <line x1="64" y1="55" x2="94" y2="55" stroke="#78350f" strokeWidth="1" />
      <line x1="63" y1="58" x2="93" y2="58" stroke="#78350f" strokeWidth="1" />

      {/* Lower Deck */}
      <polygon points="15,62 145,62 152,82 8,82" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
      <polygon points="8,82 152,82 152,86 8,86" fill="#78350f" />
      <polyline points="8,82 8,68 15,62" stroke="#92400e" strokeWidth="2.5" fill="none" />
      <polyline points="152,82 152,68 145,62" stroke="#92400e" strokeWidth="2.5" fill="none" />
    </svg>
  );
}

export function CustomDeckSvg({ width = 160, height = 90 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="160" height="90" rx="6" fill="#14532d" />
      <ellipse cx="80" cy="58" rx="65" ry="24" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
      {/* Planks curved */}
      <line x1="45" y1="42" x2="45" y2="74" stroke="#78350f" strokeWidth="1.5" opacity="0.6" />
      <line x1="62" y1="37" x2="62" y2="79" stroke="#78350f" strokeWidth="1.5" opacity="0.6" />
      <line x1="80" y1="35" x2="80" y2="82" stroke="#78350f" strokeWidth="1.5" opacity="0.6" />
      <line x1="98" y1="37" x2="98" y2="79" stroke="#78350f" strokeWidth="1.5" opacity="0.6" />
      <line x1="115" y1="42" x2="115" y2="74" stroke="#78350f" strokeWidth="1.5" opacity="0.6" />

      {/* Curved Perimeter Railing */}
      <path d="M 18,52 C 30,22 130,22 142,52" stroke="#92400e" strokeWidth="2.5" fill="none" />
      <line x1="40" y1="45" x2="40" y2="33" stroke="#78350f" strokeWidth="1" />
      <line x1="60" y1="38" x2="60" y2="28" stroke="#78350f" strokeWidth="1" />
      <line x1="80" y1="35" x2="80" y2="26" stroke="#78350f" strokeWidth="1" />
      <line x1="100" y1="38" x2="100" y2="28" stroke="#78350f" strokeWidth="1" />
      <line x1="120" y1="45" x2="120" y2="33" stroke="#78350f" strokeWidth="1" />
    </svg>
  );
}

// Top-Down Architectural Blueprint with patio furniture & dimensions
export function TopDownDeckPlanSvg({ width = 300, height = 180, lengthVal = 20, widthVal = 12, unit = 'ft' }) {
  return (
    <svg width={width} height={height} viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background lawn */}
      <rect x="0" y="0" width="300" height="180" rx="8" fill="#dcfce7" />

      {/* Length Dimension Indicator (Top) */}
      <line x1="60" y1="20" x2="240" y2="20" stroke="#0f172a" strokeWidth="1.5" />
      <polygon points="60,20 66,17 66,23" fill="#0f172a" />
      <polygon points="240,20 234,17 234,23" fill="#0f172a" />
      <rect x="110" y="8" width="80" height="18" rx="3" fill="#0f172a" />
      <text x="150" y="21" fill="#ffffff" fontSize="10" fontWeight="700" textAnchor="middle">
        Length: {lengthVal} {unit}
      </text>

      {/* Width Dimension Indicator (Left) */}
      <line x1="30" y1="40" x2="30" y2="150" stroke="#0f172a" strokeWidth="1.5" />
      <polygon points="30,40 27,46 33,46" fill="#0f172a" />
      <polygon points="30,150 27,144 33,144" fill="#0f172a" />
      <rect x="4" y="85" width="52" height="18" rx="3" fill="#0f172a" />
      <text x="30" y="98" fill="#ffffff" fontSize="10" fontWeight="700" textAnchor="middle">
        {widthVal} {unit}
      </text>

      {/* Wooden Deck Surface */}
      <rect x="60" y="40" width="180" height="110" rx="4" fill="#d97706" stroke="#92400e" strokeWidth="2" />
      {/* Horizontal Wood Planks */}
      {[50, 60, 70, 80, 90, 100, 110, 120, 130, 140].map((y) => (
        <line key={y} x1="60" y1={y} x2="240" y2={y} stroke="#b45309" strokeWidth="1" />
      ))}

      {/* Potted Plants on Corners */}
      <circle cx="70" cy="50" r="8" fill="#15803d" />
      <circle cx="70" cy="50" r="5" fill="#166534" />

      <circle cx="70" cy="140" r="8" fill="#15803d" />
      <circle cx="70" cy="140" r="5" fill="#166534" />

      {/* Patio Furniture (L-Couch & Coffee Table) */}
      <rect x="170" y="55" width="55" height="20" rx="3" fill="#f1f5f9" stroke="#94a3b8" />
      <rect x="205" y="75" width="20" height="40" rx="3" fill="#f1f5f9" stroke="#94a3b8" />
      {/* Cushions */}
      <rect x="173" y="58" width="16" height="14" rx="2" fill="#e2e8f0" />
      <rect x="191" y="58" width="16" height="14" rx="2" fill="#e2e8f0" />
      <rect x="208" y="80" width="14" height="16" rx="2" fill="#e2e8f0" />
      <rect x="208" y="98" width="14" height="16" rx="2" fill="#e2e8f0" />
      {/* Coffee Table */}
      <rect x="175" y="85" width="22" height="18" rx="2" fill="#78350f" />
    </svg>
  );
}

// Elevation & Height Diagrams
export function HeightGroundSvg({ width = 140, height = 75 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 140 75" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="140" height="75" rx="6" fill="#f8fafc" />
      {/* Lawn */}
      <rect x="10" y="58" width="120" height="6" fill="#16a34a" rx="2" />
      {/* Low Deck Planks */}
      <rect x="25" y="46" width="90" height="12" fill="#d97706" stroke="#92400e" strokeWidth="1.5" rx="2" />
      <line x1="55" y1="46" x2="55" y2="58" stroke="#92400e" strokeWidth="1" />
      <line x1="85" y1="46" x2="85" y2="58" stroke="#92400e" strokeWidth="1" />
      {/* Height Indicator: 0-2 ft */}
      <line x1="120" y1="46" x2="120" y2="58" stroke="#0f172a" strokeWidth="1.5" />
      <text x="70" y="32" fill="#0f172a" fontSize="11" fontWeight="700" textAnchor="middle">0 – 2 ft</text>
    </svg>
  );
}

export function HeightLowSvg({ width = 140, height = 75 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 140 75" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="140" height="75" rx="6" fill="#f8fafc" />
      <rect x="10" y="60" width="120" height="6" fill="#16a34a" rx="2" />
      {/* Posts */}
      <rect x="35" y="38" width="6" height="22" fill="#78350f" />
      <rect x="95" y="38" width="6" height="22" fill="#78350f" />
      {/* Deck Platform */}
      <rect x="25" y="30" width="85" height="10" fill="#d97706" stroke="#92400e" strokeWidth="1.5" rx="2" />
      {/* 2-Step Stairs */}
      <rect x="110" y="44" width="12" height="6" fill="#b45309" />
      <rect x="116" y="52" width="12" height="8" fill="#b45309" />
      <text x="68" y="20" fill="#0f172a" fontSize="11" fontWeight="700" textAnchor="middle">2 – 4 ft</text>
    </svg>
  );
}

export function HeightMediumSvg({ width = 140, height = 75 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 140 75" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="140" height="75" rx="6" fill="#f8fafc" />
      <rect x="10" y="62" width="120" height="6" fill="#16a34a" rx="2" />
      {/* Tall Posts */}
      <rect x="30" y="24" width="6" height="38" fill="#78350f" />
      <rect x="85" y="24" width="6" height="38" fill="#78350f" />
      {/* Deck Platform */}
      <rect x="20" y="18" width="80" height="10" fill="#d97706" stroke="#92400e" strokeWidth="1.5" rx="2" />
      {/* Railing */}
      <line x1="20" y1="8" x2="100" y2="8" stroke="#92400e" strokeWidth="2" />
      {/* Flight of steps */}
      <line x1="100" y1="20" x2="125" y2="62" stroke="#78350f" strokeWidth="2.5" />
      <text x="60" y="14" fill="#0f172a" fontSize="11" fontWeight="700" textAnchor="middle">4 – 8 ft</text>
    </svg>
  );
}

export function HeightHighSvg({ width = 140, height = 75 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 140 75" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="140" height="75" rx="6" fill="#f8fafc" />
      <rect x="10" y="64" width="120" height="6" fill="#16a34a" rx="2" />
      {/* 2nd Story Columns */}
      <rect x="25" y="18" width="6" height="46" fill="#78350f" />
      <rect x="75" y="18" width="6" height="46" fill="#78350f" />
      {/* Deck */}
      <rect x="15" y="12" width="75" height="8" fill="#d97706" stroke="#92400e" strokeWidth="1.5" rx="2" />
      {/* Railing */}
      <line x1="15" y1="4" x2="90" y2="4" stroke="#92400e" strokeWidth="2" />
      {/* Full Staircase */}
      <line x1="90" y1="14" x2="130" y2="64" stroke="#78350f" strokeWidth="3" />
      <text x="52" y="10" fill="#0f172a" fontSize="11" fontWeight="700" textAnchor="middle">8+ ft</text>
    </svg>
  );
}


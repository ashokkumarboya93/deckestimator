import React from 'react';

export default function DeckHomeLogo({ size = 26, color = '#ffffff', strokeWidth = 2.2, style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      {/* Pitched House Roof Gable */}
      <path d="M2.5 10.5L12 2.8l9.5 7.7" />
      {/* Roof Sub-fascia / Eaves Trim */}
      <path d="M5 10.5h14" />
      {/* Attached Deck Railing Top */}
      <path d="M5.5 14.5h13" />
      {/* Railing Balusters */}
      <path d="M8 14.5v3" />
      <path d="M12 14.5v3" />
      <path d="M16 14.5v3" />
      {/* Main Deck Floor Platform */}
      <path d="M3 17.5h18" />
      {/* Deck Foundation Support Posts */}
      <path d="M5.5 17.5v4" />
      <path d="M12 17.5v4" />
      <path d="M18.5 17.5v4" />
    </svg>
  );
}


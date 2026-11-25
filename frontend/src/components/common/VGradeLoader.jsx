// =============================================
// Deck Estimator — V-Grade Triple Dots Loader
// Pure CSS animation, no JS animation logic, no external dependencies
// Exact markup: <div className="ld-dots"><i></i><i></i><i></i></div>
// =============================================

import React from 'react';

export default function VGradeLoader({ color = 'currentColor', style = {} }) {
  return (
    <div
      className="ld-dots"
      style={{
        '--ink': color,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
      aria-label="Loading..."
      role="status"
    >
      <i />
      <i />
      <i />
    </div>
  );
}


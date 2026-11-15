// =============================================
// Deck Estimator — Enterprise Loading Spinner Component
// =============================================
// Lightweight, zero-dependency, theme-consistent loader.
// Supports inline, button, container, and overlay variants.

import React from 'react';

export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  label = null,
  fullHeight = false,
  overlay = false,
  style = {},
  className = '',
}) {
  const sizeMap = {
    xs: 14,
    sm: 18,
    md: 30,
    lg: 44,
    xl: 60,
  };
  const pixelSize = typeof size === 'number' ? size : sizeMap[size] || 30;
  const strokeWidth = pixelSize <= 18 ? 2.5 : pixelSize <= 30 ? 3 : 3.5;

  const colorMap = {
    primary: '#0A58CA',
    white: '#FFFFFF',
    slate: '#64748B',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  };
  const spinnerColor = colorMap[color] || color || '#0A58CA';

  const spinner = (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        ...style,
      }}
      className={`deck-spinner-wrap ${className}`}
      role="status"
      aria-live="polite"
    >
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 50 50"
        style={{
          animation: 'deckSpin 0.85s linear infinite',
          flexShrink: 0,
        }}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={color === 'white' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(10, 88, 202, 0.15)'}
          strokeWidth={strokeWidth * 1.5}
        />
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={spinnerColor}
          strokeWidth={strokeWidth * 1.5}
          strokeLinecap="round"
          strokeDasharray="95, 150"
          strokeDashoffset="0"
        />
      </svg>
      {label && (
        <span
          style={{
            fontSize: pixelSize <= 20 ? '12px' : '13.5px',
            fontWeight: '600',
            color: color === 'white' ? '#FFFFFF' : '#475569',
            letterSpacing: '-0.2px',
            textAlign: 'center',
          }}
        >
          {label}
        </span>
      )}
      <style>{`
        @keyframes deckSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (overlay) {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          borderRadius: 'inherit',
        }}
      >
        {spinner}
      </div>
    );
  }

  if (fullHeight) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '260px',
          width: '100%',
        }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
}

export default LoadingSpinner;


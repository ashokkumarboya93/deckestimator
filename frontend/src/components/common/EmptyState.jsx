// =============================================
// Deck Estimator — Enterprise Empty State Component
// =============================================
// Displays clean, engaging visual feedback when records,
// search results, or leads queues are empty.

import React from 'react';
import { Link } from 'react-router-dom';

const ICONS = {
  search: (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#0A58CA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="8.01" />
      <line x1="11" y1="12" x2="11" y2="14" />
    </svg>
  ),
  folder: (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#0A58CA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  ),
  clipboard: (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#0A58CA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  ),
  inbox: (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#0A58CA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  ),
  filter: (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#0A58CA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  check: (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
};

export function EmptyState({
  icon = 'folder',
  title = 'No records found',
  description = 'There are no items to display at this time.',
  actionLabel = null,
  onAction = null,
  actionHref = null,
  secondaryActionLabel = null,
  onSecondaryAction = null,
  bordered = false,
  style = {},
  className = '',
}) {
  const renderedIcon = typeof icon === 'string' ? ICONS[icon] || ICONS.folder : icon;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: bordered ? '1px dashed #CBD5E1' : 'none',
        minHeight: '260px',
        width: '100%',
        boxSizing: 'border-box',
        ...style,
      }}
      className={`deck-empty-state ${className}`}
    >
      {/* Icon Badge */}
      <div
        style={{
          width: '68px',
          height: '68px',
          borderRadius: '20px',
          backgroundColor: '#F0F6FF',
          border: '1px solid #D0E1F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '18px',
          boxShadow: '0 4px 14px rgba(10, 88, 202, 0.08)',
          flexShrink: 0,
        }}
      >
        {renderedIcon}
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#0F172A',
          margin: '0 0 8px 0',
          letterSpacing: '-0.3px',
        }}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          style={{
            fontSize: '14px',
            color: '#64748B',
            maxWidth: '460px',
            margin: '0 0 22px 0',
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      )}

      {/* Action Buttons */}
      {(actionLabel || secondaryActionLabel) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          {actionLabel && actionHref && (
            <Link
              to={actionHref}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: '40px',
                padding: '0 20px',
                borderRadius: '10px',
                background: 'linear-gradient(180deg, #0A58CA 0%, #033B85 100%)',
                color: '#FFFFFF',
                fontSize: '13.5px',
                fontWeight: '600',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(3, 59, 133, 0.25)',
                transition: 'all 0.15s ease',
              }}
            >
              {actionLabel}
            </Link>
          )}

          {actionLabel && onAction && !actionHref && (
            <button
              type="button"
              onClick={onAction}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: '40px',
                padding: '0 20px',
                borderRadius: '10px',
                background: 'linear-gradient(180deg, #0A58CA 0%, #033B85 100%)',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '13.5px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(3, 59, 133, 0.25)',
                transition: 'all 0.15s ease',
              }}
            >
              {actionLabel}
            </button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              style={{
                height: '40px',
                padding: '0 16px',
                borderRadius: '10px',
                backgroundColor: '#F1F5F9',
                color: '#475569',
                border: '1px solid #CBD5E1',
                fontSize: '13.5px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;


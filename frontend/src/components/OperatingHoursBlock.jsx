// =============================================
// Deck Estimator — Shared Operating Hours UI Component
// =============================================
// Renders both Standard Hours of Operation (Contracting Services & Office Hours)
// uniformly across Customer and Contractor portals.
// Variants:
// - "cards": 2-column responsive detailed cards (Support Pages & Dashboard Hubs)
// - "stacked": Compact single-column detailed schedule cards (narrow sidebars)
// - "compact": Tight paired summary box (inside summary contact cards)
// - "dark": Footer schedule block for deep navy #0B2447 portal footers

import React from 'react';
import { OPERATING_HOURS_SCHEDULES } from '../constants/operatingHours';

function ClockIcon({ color = 'currentColor', size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export default function OperatingHoursBlock({ variant = 'cards', style = {} }) {
  if (variant === 'dark') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px', ...style }}>
        {OPERATING_HOURS_SCHEDULES.map((schedule) => (
          <div
            key={schedule.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '9px',
              padding: '7px 10px',
              borderRadius: '7px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ marginTop: '2px' }}>
              <ClockIcon color="#E08131" size={14} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#FFFFFF', lineHeight: 1.3 }}>
                {schedule.shortTitle}
              </div>
              <div style={{ fontSize: '11px', color: '#CBD5E1', lineHeight: 1.4, marginTop: '1px' }}>
                {schedule.summary}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px', ...style }}>
        {OPERATING_HOURS_SCHEDULES.map((schedule) => (
          <div
            key={schedule.id}
            style={{
              padding: '6px 9px',
              borderRadius: '7px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderLeft: `3px solid ${schedule.accentColor}`,
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#1E3A63', lineHeight: 1.3 }}>
              {schedule.shortTitle}
            </div>
            <div style={{ fontSize: '11.5px', fontWeight: '600', color: '#334155', lineHeight: 1.35, marginTop: '1px' }}>
              {schedule.summary}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const isStacked = variant === 'stacked';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isStacked ? '1fr' : 'repeat(auto-fit, minmax(min(100%, 270px), 1fr))',
        gap: isStacked ? '10px' : '14px',
        ...style,
      }}
    >
      {OPERATING_HOURS_SCHEDULES.map((schedule) => (
        <div
          key={schedule.id}
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderTop: `3px solid ${schedule.accentColor}`,
            borderRadius: '10px',
            padding: isStacked ? '11px 12px' : '15px 18px',
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              paddingBottom: isStacked ? '7px' : '9px',
              marginBottom: isStacked ? '6px' : '8px',
              borderBottom: '1px solid #F1F5F9',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
              <ClockIcon color={schedule.accentColor} size={isStacked ? 14 : 16} />
              <span
                style={{
                  fontSize: isStacked ? '11.5px' : '13px',
                  fontWeight: '800',
                  color: '#0F172A',
                  lineHeight: 1.3,
                }}
              >
                {schedule.title}
              </span>
            </div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: '700',
                padding: '2px 7px',
                borderRadius: '999px',
                backgroundColor: schedule.tintBg,
                color: schedule.accentColor,
                border: `1px solid ${schedule.tintBorder}`,
                whiteSpace: 'nowrap',
              }}
            >
              {schedule.badge}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: isStacked ? '3px' : '5px' }}>
            {schedule.days.map((entry) => (
              <div
                key={entry.day}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  fontSize: isStacked ? '11.5px' : '12.5px',
                  lineHeight: 1.45,
                  padding: isStacked ? '2px 4px' : '3px 6px',
                  borderRadius: '5px',
                  backgroundColor: entry.closed ? '#F8FAFC' : 'transparent',
                }}
              >
                <span style={{ fontWeight: '600', color: entry.closed ? '#64748B' : '#334155' }}>
                  {entry.day}
                </span>
                <span
                  style={
                    entry.closed
                      ? {
                          fontSize: isStacked ? '10px' : '10.5px',
                          fontWeight: '800',
                          color: '#B91C1C',
                          backgroundColor: '#FEF2F2',
                          border: '1px solid #FECACA',
                          borderRadius: '4px',
                          padding: '1px 6px',
                          letterSpacing: '0.3px',
                        }
                      : {
                          fontWeight: '700',
                          color: '#1E3A63',
                          fontVariantNumeric: 'tabular-nums',
                        }
                  }
                >
                  {entry.hours}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}


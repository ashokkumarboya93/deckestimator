import React from 'react';

/**
 * Universal Skeleton Shimmer Component
 * 60fps GPU-accelerated animated placeholder matching exact layout shapes.
 */
export const SkeletonShimmer = ({
  width = '100%',
  height = '16px',
  borderRadius = '6px',
  style = {},
  className = '',
}) => {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius,
        display: 'inline-block',
        ...style,
      }}
      aria-hidden="true"
    />
  );
};

/**
 * Skeleton Table Loader for Data Tables
 * Renders realistic pulsing header & multi-column rows
 */
export const SkeletonTable = ({
  rows = 5,
  columns = 7,
  columnWidths = ['18%', '16%', '14%', '12%', '12%', '14%', '14%'],
  style = {},
}) => {
  const rowList = Array.from({ length: rows });
  const colList = Array.from({ length: columns });

  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        ...style,
      }}
      aria-label="Loading table data"
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <th style={{ padding: '14px 16px', width: '40px' }}>
              <SkeletonShimmer width="18px" height="18px" borderRadius="4px" />
            </th>
            {colList.map((_, cIdx) => (
              <th key={cIdx} style={{ padding: '14px 16px', width: columnWidths[cIdx] || 'auto' }}>
                <SkeletonShimmer
                  width={cIdx % 2 === 0 ? '70px' : '90px'}
                  height="12px"
                  borderRadius="4px"
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowList.map((_, rIdx) => (
            <tr
              key={rIdx}
              style={{
                borderBottom: '1px solid #f1f5f9',
                backgroundColor: rIdx % 2 === 1 ? '#fafbfd' : '#ffffff',
              }}
            >
              <td style={{ padding: '16px', width: '40px' }}>
                <SkeletonShimmer width="16px" height="16px" borderRadius="4px" />
              </td>
              {colList.map((_, cIdx) => {
                // Varying widths create realistic tabular visual feel
                const widths = ['80%', '60%', '75%', '50%', '85%', '65%', '90%'];
                const w = widths[(rIdx + cIdx) % widths.length];
                return (
                  <td key={cIdx} style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <SkeletonShimmer width={w} height="13px" />
                      {cIdx === 0 && <SkeletonShimmer width="45%" height="10px" />}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Skeleton Metric Card Loader for KPI Stat Cards
 */
export const SkeletonCard = ({ style = {} }) => {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        ...style,
      }}
      aria-label="Loading metric"
    >
      <SkeletonShimmer width="42px" height="42px" borderRadius="10px" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <SkeletonShimmer width="90px" height="11px" />
        <SkeletonShimmer width="45px" height="24px" borderRadius="4px" />
      </div>
    </div>
  );
};

export default SkeletonShimmer;


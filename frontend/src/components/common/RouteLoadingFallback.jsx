// =============================================
// Deck Estimator — Route Loading Fallback
// =============================================

import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export default function RouteLoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '65vh',
        width: '100%',
      }}
    >
      <LoadingSpinner size="lg" color="primary" label="Loading portal..." />
    </div>
  );
}

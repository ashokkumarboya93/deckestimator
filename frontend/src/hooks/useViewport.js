// =============================================
// Deck Estimator — Responsive Viewport Hooks
// =============================================
// Uses MediaQueryList subscriptions without triggering
// synchronous state updates inside effects.

import { useState, useEffect } from 'react';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const mediaQueryList = window.matchMedia(query);
    const onChange = (event) => setMatches(event.matches);

    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', onChange);
      return () => mediaQueryList.removeEventListener('change', onChange);
    }

    mediaQueryList.addListener(onChange);
    return () => mediaQueryList.removeListener(onChange);
  }, [query]);

  return matches;
}

export function useViewport() {
  const isCompact = useMediaQuery('(max-width: 480px)');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  return {
    isCompact,
    isMobile,
    isTablet,
  };
}


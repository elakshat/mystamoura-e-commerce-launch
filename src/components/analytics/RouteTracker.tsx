import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { initGA, trackPageView } from '@/lib/gtag';

export function RouteTracker() {
  const location = useLocation();
  const initialized = useRef(false);

  // Initialize GA once the component mounts (React is ready, DOM available)
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initGA();
    }
  }, []);

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
}

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { initGA, trackPageView } from '@/lib/gtag';
import { supabase } from '@/integrations/supabase/client';

export function RouteTracker() {
  const location = useLocation();
  const initialized = useRef(false);

  // Fetch GA Measurement ID from site_settings, then initialize
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      try {
        // Try DB first (admin-configurable)
        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'ga_measurement_id')
          .maybeSingle();

        const dbId = data?.value as string | null;
        const envId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
        const measurementId = dbId || envId;

        if (measurementId) {
          initGA(measurementId);
        }
      } catch {
        // Silently fail - analytics is non-critical
        const envId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
        if (envId) initGA(envId);
      }
    })();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
}

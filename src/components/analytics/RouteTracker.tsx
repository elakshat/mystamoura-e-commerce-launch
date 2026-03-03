import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { initGA, trackPageView } from '@/lib/gtag';
import { initMetaPixel, trackPixelPageView } from '@/lib/meta-pixel';
import { supabase } from '@/integrations/supabase/client';

export function RouteTracker() {
  const location = useLocation();
  const initialized = useRef(false);

  // Fetch GA Measurement ID + Meta Pixel ID from site_settings, then initialize
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('key, value')
          .in('key', ['ga_measurement_id', 'meta_pixel_id']);

        const settingsMap: Record<string, string> = {};
        data?.forEach((row: { key: string; value: unknown }) => {
          settingsMap[row.key] = row.value as string;
        });

        // GA4
        const gaId = settingsMap.ga_measurement_id || (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined);
        if (gaId) initGA(gaId);

        // Meta Pixel
        const pixelId = settingsMap.meta_pixel_id || (import.meta.env.VITE_META_PIXEL_ID as string | undefined);
        if (pixelId) initMetaPixel(pixelId);
      } catch {
        const envGa = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
        if (envGa) initGA(envGa);
        const envPixel = import.meta.env.VITE_META_PIXEL_ID as string | undefined;
        if (envPixel) initMetaPixel(envPixel);
      }
    })();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname + location.search);
    trackPixelPageView();
  }, [location]);

  return null;
}

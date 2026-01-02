import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TaxSettings {
  rate: number;
}

export interface ShippingSettings {
  base_price: number;
  free_threshold: number;
  tax_percentage?: number;
}

// Single source of truth for tax calculations
export function useTaxSettings() {
  return useQuery({
    queryKey: ['tax-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['tax', 'shipping']);

      if (error) throw error;

      const settings: { tax: TaxSettings; shipping: ShippingSettings } = {
        tax: { rate: 0 },
        shipping: { base_price: 99, free_threshold: 999 },
      };

      data.forEach((item) => {
        if (item.key === 'tax') {
          settings.tax = item.value as unknown as TaxSettings;
        } else if (item.key === 'shipping') {
          settings.shipping = item.value as unknown as ShippingSettings;
        }
      });

      return settings;
    },
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: true,
  });
}

// Calculate tax amount - single source of truth
export function calculateTax(subtotal: number, taxRate: number): number {
  return Math.round((subtotal * taxRate / 100) * 100) / 100;
}

// Calculate shipping - single source of truth  
export function calculateShipping(subtotal: number, settings: ShippingSettings): number {
  return subtotal >= settings.free_threshold ? 0 : settings.base_price;
}

// Calculate total - single source of truth
export function calculateTotal(
  subtotal: number,
  discount: number,
  shipping: number,
  tax: number
): number {
  return Math.round((subtotal - discount + shipping + tax) * 100) / 100;
}

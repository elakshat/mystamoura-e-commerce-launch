-- Create product_variants table
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size TEXT NOT NULL DEFAULT '100ml',
    sku TEXT,
    price NUMERIC NOT NULL,
    sale_price NUMERIC,
    stock INTEGER DEFAULT 0,
    images TEXT[] DEFAULT '{}'::text[],
    is_visible BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    weight NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(product_id, size)
);

-- Enable RLS
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view visible variants"
ON public.product_variants
FOR SELECT
USING (is_visible = true);

CREATE POLICY "Admins can view all variants"
ON public.product_variants
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage variants"
ON public.product_variants
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add variant_id to order_items
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.product_variants(id),
ADD COLUMN IF NOT EXISTS variant_size TEXT,
ADD COLUMN IF NOT EXISTS variant_sku TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);

-- Auto-create variants for existing products
INSERT INTO public.product_variants (product_id, size, sku, price, sale_price, stock, images, is_visible, is_default)
SELECT 
    p.id,
    COALESCE(p.size, '100ml'),
    p.sku,
    p.price,
    p.sale_price,
    p.stock,
    p.images,
    p.is_visible,
    true
FROM public.products p
WHERE NOT EXISTS (
    SELECT 1 FROM public.product_variants pv WHERE pv.product_id = p.id
);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_variant_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_product_variants_updated_at ON public.product_variants;
CREATE TRIGGER update_product_variants_updated_at
BEFORE UPDATE ON public.product_variants
FOR EACH ROW
EXECUTE FUNCTION public.update_variant_updated_at();
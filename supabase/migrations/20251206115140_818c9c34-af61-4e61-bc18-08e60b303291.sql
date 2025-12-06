-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create order_status enum
CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Create categories table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    sku TEXT UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    currency TEXT DEFAULT 'INR',
    images TEXT[] DEFAULT '{}',
    stock INTEGER DEFAULT 0,
    category_id UUID REFERENCES public.categories(id),
    tags TEXT[] DEFAULT '{}',
    is_visible BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    size TEXT DEFAULT '100ml',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create addresses table
CREATE TABLE public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'India',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create coupons table
CREATE TABLE public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id),
    guest_email TEXT,
    status order_status DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    coupon_id UUID REFERENCES public.coupons(id),
    shipping_address JSONB,
    payment_method TEXT,
    payment_id TEXT,
    payment_status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id),
    product_name TEXT NOT NULL,
    product_image TEXT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create site_settings table
CREATE TABLE public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity_log table
CREATE TABLE public.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    )
$$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    new_number TEXT;
BEGIN
    new_number := 'MYS-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN new_number;
END;
$$;

-- RLS Policies

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- User roles: Only admins can manage roles
CREATE POLICY "Users can view own role" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Categories: Public read, admin write
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage categories" ON public.categories
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Products: Public read visible products, admin full access
CREATE POLICY "Anyone can view visible products" ON public.products
    FOR SELECT USING (is_visible = TRUE);

CREATE POLICY "Admins can view all products" ON public.products
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Addresses: Users manage their own
CREATE POLICY "Users can manage own addresses" ON public.addresses
    FOR ALL USING (auth.uid() = user_id);

-- Coupons: Public read active coupons, admin manage
CREATE POLICY "Anyone can view active coupons" ON public.coupons
    FOR SELECT USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Admins can manage coupons" ON public.coupons
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Orders: Users view own, admins view all
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can manage all orders" ON public.orders
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Order items: Users view own order items
CREATE POLICY "Users can view own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create order items" ON public.order_items
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can manage order items" ON public.order_items
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Site settings: Public read, admin write
CREATE POLICY "Anyone can view settings" ON public.site_settings
    FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage settings" ON public.site_settings
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Activity log: Only admins can view
CREATE POLICY "Admins can view activity log" ON public.activity_log
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert activity log" ON public.activity_log
    FOR INSERT WITH CHECK (TRUE);

-- Insert default categories
INSERT INTO public.categories (name, slug, description) VALUES
    ('For Him', 'for-him', 'Luxurious fragrances crafted for the modern gentleman'),
    ('For Her', 'for-her', 'Elegant perfumes designed for the sophisticated woman'),
    ('Unisex', 'unisex', 'Versatile scents that transcend boundaries');

-- Insert sample products
INSERT INTO public.products (name, slug, sku, description, price, sale_price, images, stock, category_id, is_featured, notes) VALUES
    ('Noir Mystique', 'noir-mystique', 'MYS-001', 'A captivating blend of dark woods and exotic spices that commands attention.', 2499.00, NULL, ARRAY['https://images.unsplash.com/photo-1541643600914-78b084683601?w=800'], 50, (SELECT id FROM categories WHERE slug = 'for-him'), TRUE, 'Top: Bergamot, Black Pepper | Heart: Oud, Rose | Base: Sandalwood, Musk'),
    ('Rose Éternelle', 'rose-eternelle', 'MYS-002', 'A timeless rose bouquet with a modern twist of fresh citrus and warm amber.', 2299.00, 1999.00, ARRAY['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800'], 35, (SELECT id FROM categories WHERE slug = 'for-her'), TRUE, 'Top: Bergamot, Lemon | Heart: Damask Rose, Peony | Base: Amber, White Musk'),
    ('Ocean Breeze', 'ocean-breeze', 'MYS-003', 'Fresh aquatic notes with hints of sea salt and driftwood.', 1899.00, NULL, ARRAY['https://images.unsplash.com/photo-1595425964071-2c1ecb10b52d?w=800'], 60, (SELECT id FROM categories WHERE slug = 'unisex'), TRUE, 'Top: Sea Salt, Citrus | Heart: Jasmine, Lily | Base: Driftwood, Musk'),
    ('Velvet Oud', 'velvet-oud', 'MYS-004', 'Rich oud enhanced with velvety vanilla and precious saffron.', 3499.00, NULL, ARRAY['https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800'], 25, (SELECT id FROM categories WHERE slug = 'for-him'), FALSE, 'Top: Saffron, Rose | Heart: Oud, Leather | Base: Vanilla, Amber'),
    ('Jasmine Dreams', 'jasmine-dreams', 'MYS-005', 'Intoxicating night-blooming jasmine with creamy sandalwood.', 2199.00, NULL, ARRAY['https://images.unsplash.com/photo-1619994403073-2cec844b8e63?w=800'], 40, (SELECT id FROM categories WHERE slug = 'for-her'), FALSE, 'Top: Mandarin, Pear | Heart: Jasmine, Tuberose | Base: Sandalwood, Vanilla'),
    ('Amber Nights', 'amber-nights', 'MYS-006', 'Warm amber wrapped in oriental spices and exotic resins.', 2799.00, 2399.00, ARRAY['https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=800'], 30, (SELECT id FROM categories WHERE slug = 'unisex'), TRUE, 'Top: Cardamom, Pink Pepper | Heart: Amber, Incense | Base: Benzoin, Tonka');

-- Insert default site settings
INSERT INTO public.site_settings (key, value) VALUES
    ('announcement', '{"text": "Free shipping on orders above ₹1500 | Use code FIRST10 for 10% off", "enabled": true}'),
    ('hero', '{"title": "Discover Your Signature Scent", "subtitle": "Luxury fragrances crafted with passion", "cta_text": "Shop Now", "cta_link": "/products"}'),
    ('footer', '{"about": "Mystamoura brings you luxury fragrances that tell your unique story.", "email": "hello@mystamoura.in", "phone": "+91 9876543210"}'),
    ('social', '{"instagram": "https://instagram.com/mystamoura", "facebook": "https://facebook.com/mystamoura", "twitter": "https://twitter.com/mystamoura"}'),
    ('shipping', '{"base_price": 99, "free_threshold": 1500, "tax_percentage": 18}');

-- Create indexes for better performance
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_visible ON public.products(is_visible);
CREATE INDEX idx_products_featured ON public.products(is_featured);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
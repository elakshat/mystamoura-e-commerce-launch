export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  price: number;
  sale_price: number | null;
  currency: string;
  images: string[];
  stock: number;
  category_id: string | null;
  tags: string[];
  is_visible: boolean;
  is_featured: boolean;
  size: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  guest_email: string | null;
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  tax_amount: number;
  total: number;
  coupon_id: string | null;
  shipping_address: Address | null;
  payment_method: string | null;
  payment_id: string | null;
  payment_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  variant_id?: string | null;
  variant_size?: string | null;
  variant_sku?: string | null;
}

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
}

export interface SiteSettings {
  announcement: {
    text: string;
    enabled: boolean;
  };
  hero: {
    title: string;
    subtitle: string;
    cta_text: string;
    cta_link: string;
  };
  footer: {
    about_text: string;
    email: string;
    phone: string;
    instagram: string;
    facebook: string;
    twitter: string;
  };
  social: {
    instagram: string;
    facebook: string;
    twitter: string;
  };
  shipping: {
    base_price: number;
    free_threshold: number;
    tax_percentage: number;
  };
  tax: {
    rate: number;
  };
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
}


-- Grant INSERT permission to anon role on orders table for guest checkout
GRANT INSERT ON public.orders TO anon;

-- Grant INSERT permission to anon role on order_items table for guest checkout
GRANT INSERT ON public.order_items TO anon;

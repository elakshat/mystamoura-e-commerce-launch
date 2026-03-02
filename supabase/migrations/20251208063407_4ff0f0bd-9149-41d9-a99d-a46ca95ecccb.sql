-- Fix: Replace SECURITY DEFINER view with a regular view
-- The customers view doesn't need SECURITY DEFINER since admins have proper RLS

DROP VIEW IF EXISTS public.customers;

-- Recreate as a simple view - RLS on underlying tables will apply
CREATE VIEW public.customers WITH (security_invoker = true) AS
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.phone,
    p.avatar_url,
    p.created_at,
    COUNT(DISTINCT o.id) as order_count,
    COALESCE(SUM(o.total), 0) as total_spent,
    MAX(o.created_at) as last_order_at
FROM public.profiles p
LEFT JOIN public.orders o ON o.user_id = p.id
GROUP BY p.id, p.email, p.full_name, p.phone, p.avatar_url, p.created_at;

-- Grant access to authenticated users (admin check will be in the application)
GRANT SELECT ON public.customers TO authenticated;
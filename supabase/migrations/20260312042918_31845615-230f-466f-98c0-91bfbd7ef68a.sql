
-- Drop the restrictive INSERT policy and recreate as permissive
DROP POLICY IF EXISTS "Users and guests can create orders" ON public.orders;

CREATE POLICY "Users and guests can create orders"
ON public.orders
FOR INSERT
TO public
WITH CHECK (
  (auth.uid() = user_id) OR (user_id IS NULL AND guest_email IS NOT NULL)
);

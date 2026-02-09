
-- Drop the existing insert policy
DROP POLICY "Users can create orders" ON public.orders;

-- Create a new policy that allows both authenticated users and anonymous guests
CREATE POLICY "Users and guests can create orders"
ON public.orders
FOR INSERT
WITH CHECK (
  (auth.uid() = user_id) OR (user_id IS NULL AND guest_email IS NOT NULL)
);

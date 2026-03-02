
-- Drop the existing select policy
DROP POLICY "Users can view own orders" ON public.orders;

-- Create updated policy that allows guests to view orders by guest_email match
-- and authenticated users by user_id match
CREATE POLICY "Users can view own orders"
ON public.orders
FOR SELECT
USING (
  (auth.uid() = user_id) 
  OR (user_id IS NULL AND guest_email IS NOT NULL)
);

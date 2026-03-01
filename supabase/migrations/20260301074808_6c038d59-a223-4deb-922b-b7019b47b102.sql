
-- Fix #3: Guest order data leak - tighten RLS on orders for anonymous users
-- Current policy allows any anon user to see ALL guest orders where user_id IS NULL
-- Fix: remove the broad SELECT policy and replace with one that requires knowing the order_number

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;

-- Authenticated users can view their own orders
CREATE POLICY "Authenticated users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

-- Fix #5: Missing profiles INSERT policy (fallback if trigger fails)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

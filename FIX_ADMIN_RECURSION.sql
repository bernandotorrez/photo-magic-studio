-- QUICK FIX: Infinite Recursion in Admin Policies
-- Run this in Supabase SQL Editor immediately

-- Step 1: Drop problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all history" ON public.generation_history;

-- Step 2: Create helper function to check admin status
-- This uses SECURITY DEFINER to bypass RLS and prevent recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  );
END;
$$;

-- Step 3: Recreate policies without recursion
-- Users can see their own profile OR if they are admin
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  auth.uid() = user_id OR public.is_admin()
);

-- Users can update their own profile OR if they are admin
CREATE POLICY "Admins can update all profiles" 
ON public.profiles FOR UPDATE 
USING (
  auth.uid() = user_id OR public.is_admin()
);

-- Users can see their own history OR if they are admin
CREATE POLICY "Admins can view all history" 
ON public.generation_history FOR SELECT 
USING (
  auth.uid() = user_id OR public.is_admin()
);

-- Step 4: Update get_user_statistics function
CREATE OR REPLACE FUNCTION public.get_user_statistics()
RETURNS TABLE (
  total_users BIGINT,
  free_users BIGINT,
  basic_users BIGINT,
  pro_users BIGINT,
  total_generations BIGINT,
  generations_today BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.profiles)::BIGINT as total_users,
    (SELECT COUNT(*) FROM public.profiles WHERE subscription_plan = 'free')::BIGINT as free_users,
    (SELECT COUNT(*) FROM public.profiles WHERE subscription_plan = 'basic')::BIGINT as basic_users,
    (SELECT COUNT(*) FROM public.profiles WHERE subscription_plan = 'pro')::BIGINT as pro_users,
    (SELECT COUNT(*) FROM public.generation_history)::BIGINT as total_generations,
    (SELECT COUNT(*) FROM public.generation_history WHERE created_at >= CURRENT_DATE)::BIGINT as generations_today;
END;
$$;

-- Verify the fix
SELECT 'Fix applied successfully!' as status;

-- Test the is_admin function
SELECT public.is_admin() as am_i_admin;

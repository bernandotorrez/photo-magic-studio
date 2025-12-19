-- Fix infinite recursion in admin policies
-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all history" ON public.generation_history;

-- Create a function to check if current user is admin
-- This function uses SECURITY DEFINER to bypass RLS
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

-- Recreate policies using the function (no recursion)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  auth.uid() = user_id OR public.is_admin()
);

CREATE POLICY "Admins can update all profiles" 
ON public.profiles FOR UPDATE 
USING (
  auth.uid() = user_id OR public.is_admin()
);

CREATE POLICY "Admins can view all history" 
ON public.generation_history FOR SELECT 
USING (
  auth.uid() = user_id OR public.is_admin()
);

-- Update the get_user_statistics function to use the new is_admin function
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
  -- Check if user is admin using the helper function
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

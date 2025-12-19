-- Add is_admin column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_admin BOOLEAN DEFAULT false;

-- Create index for faster admin queries
CREATE INDEX idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = true;

-- Add RLS policy for admin to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Add RLS policy for admin to update all profiles
CREATE POLICY "Admins can update all profiles" 
ON public.profiles FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Add RLS policy for admin to view all generation history
CREATE POLICY "Admins can view all history" 
ON public.generation_history FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Function to get user statistics (admin only)
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
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  ) THEN
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

-- Comment for documentation
COMMENT ON COLUMN public.profiles.is_admin IS 'Admin flag: true for admin users who can manage all users and view statistics';

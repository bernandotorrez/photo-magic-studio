-- Add email column to generation_history table
ALTER TABLE public.generation_history 
ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_generation_history_email ON public.generation_history(user_email);

-- Backfill existing records with email from auth.users
UPDATE public.generation_history gh
SET user_email = u.email
FROM auth.users u
WHERE gh.user_id = u.id AND gh.user_email IS NULL;

-- Create function to get generation count by email
CREATE OR REPLACE FUNCTION public.get_generation_count_by_email(p_email TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
  v_reset_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get the first day of current month
  v_reset_date := date_trunc('month', CURRENT_DATE);
  
  -- Count generations for this email in current month
  SELECT COUNT(*)
  INTO v_count
  FROM public.generation_history
  WHERE user_email = p_email
    AND created_at >= v_reset_date;
  
  RETURN COALESCE(v_count, 0);
END;
$$;

-- Create function to increment generation count (now tracks by email)
CREATE OR REPLACE FUNCTION public.increment_generation_count(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_email TEXT;
  v_current_count INTEGER;
  v_reset_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get user email
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = p_user_id;
  
  IF v_user_email IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Get the first day of current month
  v_reset_date := date_trunc('month', CURRENT_DATE);
  
  -- Count generations for this email in current month
  SELECT COUNT(*)
  INTO v_current_count
  FROM public.generation_history
  WHERE user_email = v_user_email
    AND created_at >= v_reset_date;
  
  -- Update profile with current count
  UPDATE public.profiles
  SET 
    current_month_generates = v_current_count,
    last_reset_at = CASE 
      WHEN last_reset_at < v_reset_date THEN v_reset_date
      ELSE last_reset_at
    END
  WHERE user_id = p_user_id;
END;
$$;

-- Create function to check if user can generate (by email)
CREATE OR REPLACE FUNCTION public.can_user_generate(p_email TEXT, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_limit INTEGER;
  v_current_count INTEGER;
  v_reset_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get user's limit
  SELECT monthly_generate_limit
  INTO v_limit
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  IF v_limit IS NULL THEN
    v_limit := 5; -- Default free tier
  END IF;
  
  -- Get the first day of current month
  v_reset_date := date_trunc('month', CURRENT_DATE);
  
  -- Count generations for this email in current month
  SELECT COUNT(*)
  INTO v_current_count
  FROM public.generation_history
  WHERE user_email = p_email
    AND created_at >= v_reset_date;
  
  RETURN v_current_count < v_limit;
END;
$$;

-- Update RLS policies to allow service role to insert with email
DROP POLICY IF EXISTS "Users can insert own history" ON public.generation_history;
CREATE POLICY "Users can insert own history" ON public.generation_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR auth.jwt()->>'role' = 'service_role');

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_generation_count_by_email(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_user_generate(TEXT, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_generation_count(UUID) TO authenticated, service_role;

-- Add email column to profiles for persistent token tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index for email lookup
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Update handle_new_user function to store email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public 
AS $$
DECLARE
  existing_profile_id UUID;
BEGIN
  -- Check if profile exists with same email (for re-registering users)
  SELECT id INTO existing_profile_id
  FROM public.profiles
  WHERE email = NEW.email;
  
  IF existing_profile_id IS NOT NULL THEN
    -- Update existing profile with new user_id
    UPDATE public.profiles
    SET user_id = NEW.id,
        full_name = COALESCE(NEW.raw_user_meta_data ->> 'full_name', full_name),
        updated_at = now()
    WHERE id = existing_profile_id;
  ELSE
    -- Insert new profile
    INSERT INTO public.profiles (user_id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update increment_generation_count to work with email
CREATE OR REPLACE FUNCTION public.increment_generation_count(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_last_reset TIMESTAMP WITH TIME ZONE;
  v_current_month INTEGER;
  v_reset_month INTEGER;
  v_email TEXT;
BEGIN
  -- Get user's email first
  SELECT email INTO v_email FROM profiles WHERE user_id = p_user_id;
  
  -- Get last reset date using email to ensure persistence
  SELECT last_reset_at INTO v_last_reset
  FROM profiles
  WHERE email = v_email;
  
  -- Get current month and reset month
  v_current_month := EXTRACT(MONTH FROM NOW());
  v_reset_month := EXTRACT(MONTH FROM v_last_reset);
  
  -- Check if we need to reset (new month)
  IF v_last_reset IS NULL OR v_current_month != v_reset_month OR EXTRACT(YEAR FROM NOW()) != EXTRACT(YEAR FROM v_last_reset) THEN
    -- Reset count for new month
    UPDATE profiles
    SET 
      current_month_generates = 1,
      last_reset_at = NOW()
    WHERE email = v_email;
  ELSE
    -- Just increment the count
    UPDATE profiles
    SET current_month_generates = current_month_generates + 1
    WHERE email = v_email;
  END IF;
END;
$function$;
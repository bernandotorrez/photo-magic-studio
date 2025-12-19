-- Create function to increment generation count with monthly reset
CREATE OR REPLACE FUNCTION public.increment_generation_count(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_reset TIMESTAMP WITH TIME ZONE;
  v_current_month INTEGER;
  v_reset_month INTEGER;
BEGIN
  -- Get user's last reset date
  SELECT last_reset_at INTO v_last_reset
  FROM profiles
  WHERE user_id = p_user_id;
  
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
    WHERE user_id = p_user_id;
  ELSE
    -- Just increment the count
    UPDATE profiles
    SET current_month_generates = current_month_generates + 1
    WHERE user_id = p_user_id;
  END IF;
END;
$$;
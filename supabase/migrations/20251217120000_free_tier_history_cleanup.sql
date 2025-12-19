-- Function to cleanup old history for free tier users
CREATE OR REPLACE FUNCTION public.cleanup_free_tier_history()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete generation history older than 7 days for free tier users
  DELETE FROM public.generation_history
  WHERE user_id IN (
    SELECT user_id 
    FROM public.profiles 
    WHERE subscription_plan = 'free'
  )
  AND created_at < NOW() - INTERVAL '7 days';
END;
$$;

-- Create a scheduled job to run cleanup daily (requires pg_cron extension)
-- Note: This requires pg_cron extension to be enabled in Supabase
-- Alternatively, you can call this function from an edge function or cron job

-- Grant execute permission to authenticated users (for manual cleanup if needed)
GRANT EXECUTE ON FUNCTION public.cleanup_free_tier_history() TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.cleanup_free_tier_history() IS 'Cleans up generation history older than 7 days for free tier users';

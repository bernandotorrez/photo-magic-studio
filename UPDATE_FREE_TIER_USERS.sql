-- Quick fix: Update all existing free tier users to 3 generations limit
-- Run this in Supabase SQL Editor if migration hasn't been applied

-- Update default for new users
ALTER TABLE public.profiles 
ALTER COLUMN monthly_generate_limit SET DEFAULT 3;

-- Update existing free tier users
UPDATE public.profiles 
SET monthly_generate_limit = 3 
WHERE subscription_plan = 'free' 
AND monthly_generate_limit = 5;

-- Verify the changes
SELECT 
  subscription_plan,
  COUNT(*) as user_count,
  monthly_generate_limit
FROM profiles
GROUP BY subscription_plan, monthly_generate_limit
ORDER BY subscription_plan, monthly_generate_limit;

-- Show affected users
SELECT 
  u.email,
  p.full_name,
  p.subscription_plan,
  p.monthly_generate_limit,
  p.current_month_generates
FROM profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE p.subscription_plan = 'free'
ORDER BY p.created_at DESC;

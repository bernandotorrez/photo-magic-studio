-- Update default monthly_generate_limit for free tier from 5 to 3
ALTER TABLE public.profiles 
ALTER COLUMN monthly_generate_limit SET DEFAULT 3;

-- Update existing free tier users to have 3 generations limit
UPDATE public.profiles 
SET monthly_generate_limit = 3 
WHERE subscription_plan = 'free' 
AND monthly_generate_limit = 5;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.monthly_generate_limit IS 'Monthly generation limit: Free tier = 3, Basic = 50, Pro = unlimited';

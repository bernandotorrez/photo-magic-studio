-- =====================================================
-- ADD SUBSCRIPTION_PLAN COLUMN TO PAYMENTS TABLE
-- =====================================================

-- Add subscription_plan column to track which subscription tier was purchased
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50);

-- Add index for faster lookup
CREATE INDEX IF NOT EXISTS idx_payments_subscription_plan 
ON public.payments(subscription_plan);

-- Add comment
COMMENT ON COLUMN public.payments.subscription_plan IS 'Subscription tier ID (e.g., free, basic, pro) for subscription purchases';

-- Update existing records (optional - set to NULL for non-subscription purchases)
UPDATE public.payments
SET subscription_plan = NULL
WHERE token_type = 'purchased' AND subscription_plan IS NOT NULL;

-- Test query
SELECT 
  id,
  user_email,
  amount,
  tokens_purchased,
  bonus_tokens,
  token_type,
  subscription_plan,
  payment_status,
  created_at
FROM public.payments
ORDER BY created_at DESC
LIMIT 5;

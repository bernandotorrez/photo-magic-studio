-- =====================================================
-- DUAL TOKEN SYSTEM - RUN THIS SQL
-- =====================================================
-- Run this SQL in Supabase SQL Editor to setup dual token system
-- This will add subscription_tokens and purchased_tokens columns

-- Step 1: Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS purchased_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- Step 2: Migrate existing tokens to subscription_tokens (for development phase)
-- Set expiry to 30 days from now
UPDATE profiles 
SET 
  subscription_tokens = COALESCE(tokens, 0),
  subscription_expires_at = NOW() + INTERVAL '30 days'
WHERE tokens > 0;

-- Step 3: Add token_type column to payments table
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS token_type TEXT DEFAULT 'purchased';

-- Step 4: Create function to deduct tokens (subscription first, then purchased)
CREATE OR REPLACE FUNCTION deduct_tokens_dual(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription_tokens INTEGER;
  v_purchased_tokens INTEGER;
  v_deduct_from_subscription INTEGER;
  v_deduct_from_purchased INTEGER;
BEGIN
  -- Get current token balances
  SELECT subscription_tokens, purchased_tokens
  INTO v_subscription_tokens, v_purchased_tokens
  FROM profiles
  WHERE user_id = p_user_id;
  
  -- Check if user has enough total tokens
  IF (v_subscription_tokens + v_purchased_tokens) < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate how much to deduct from each type
  IF v_subscription_tokens >= p_amount THEN
    -- Deduct all from subscription tokens
    v_deduct_from_subscription := p_amount;
    v_deduct_from_purchased := 0;
  ELSE
    -- Deduct all subscription tokens, rest from purchased
    v_deduct_from_subscription := v_subscription_tokens;
    v_deduct_from_purchased := p_amount - v_subscription_tokens;
  END IF;
  
  -- Update token balances
  UPDATE profiles
  SET 
    subscription_tokens = subscription_tokens - v_deduct_from_subscription,
    purchased_tokens = purchased_tokens - v_deduct_from_purchased,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$;

-- Step 5: Create function to add subscription tokens (with expiry)
CREATE OR REPLACE FUNCTION add_subscription_tokens(
  p_user_id UUID,
  p_amount INTEGER,
  p_days INTEGER DEFAULT 30
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET 
    subscription_tokens = subscription_tokens + p_amount,
    subscription_expires_at = NOW() + (p_days || ' days')::INTERVAL,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$;

-- Step 6: Create function to add purchased tokens (never expire)
CREATE OR REPLACE FUNCTION add_purchased_tokens(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET 
    purchased_tokens = purchased_tokens + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$;

-- Step 7: Create function to check expiring subscriptions (for notifications)
CREATE OR REPLACE FUNCTION check_expiring_subscriptions()
RETURNS TABLE (
  user_id UUID,
  user_email TEXT,
  subscription_tokens INTEGER,
  days_until_expiry INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    u.email,
    p.subscription_tokens,
    EXTRACT(DAY FROM (p.subscription_expires_at - NOW()))::INTEGER as days_until_expiry
  FROM profiles p
  JOIN auth.users u ON u.id = p.user_id
  WHERE 
    p.subscription_tokens > 0
    AND p.subscription_expires_at IS NOT NULL
    AND p.subscription_expires_at > NOW()
    AND p.subscription_expires_at <= NOW() + INTERVAL '7 days'
  ORDER BY p.subscription_expires_at ASC;
END;
$$;

-- Step 8: Create function to expire old subscription tokens
CREATE OR REPLACE FUNCTION expire_subscription_tokens()
RETURNS TABLE (
  user_id UUID,
  expired_tokens INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  UPDATE profiles
  SET 
    subscription_tokens = 0,
    subscription_expires_at = NULL,
    updated_at = NOW()
  WHERE 
    subscription_tokens > 0
    AND subscription_expires_at IS NOT NULL
    AND subscription_expires_at <= NOW()
  RETURNING 
    profiles.user_id,
    subscription_tokens as expired_tokens;
END;
$$;

-- Step 9: Grant execute permissions
GRANT EXECUTE ON FUNCTION deduct_tokens_dual TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION add_subscription_tokens TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION add_purchased_tokens TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION check_expiring_subscriptions TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION expire_subscription_tokens TO service_role;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if columns were added successfully
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' 
AND column_name IN ('subscription_tokens', 'purchased_tokens', 'subscription_expires_at');

-- Check token balances for all users
SELECT 
  user_id,
  subscription_tokens,
  purchased_tokens,
  (subscription_tokens + purchased_tokens) as total_tokens,
  subscription_expires_at,
  CASE 
    WHEN subscription_expires_at IS NULL THEN 'No expiry'
    WHEN subscription_expires_at <= NOW() THEN 'Expired'
    WHEN subscription_expires_at <= NOW() + INTERVAL '7 days' THEN 'Expiring soon'
    ELSE 'Active'
  END as status
FROM profiles
WHERE subscription_tokens > 0 OR purchased_tokens > 0
ORDER BY subscription_expires_at ASC NULLS LAST;

-- =====================================================
-- TESTING QUERIES (Optional - for development)
-- =====================================================

-- Test 1: Add subscription tokens (30 days expiry)
-- SELECT add_subscription_tokens('your-user-id', 50, 30);

-- Test 2: Add purchased tokens (never expire)
-- SELECT add_purchased_tokens('your-user-id', 25);

-- Test 3: Deduct tokens (subscription first)
-- SELECT deduct_tokens_dual('your-user-id', 1);

-- Test 4: Check expiring subscriptions
-- SELECT * FROM check_expiring_subscriptions();

-- Test 5: Expire old tokens (run manually for testing)
-- SELECT * FROM expire_subscription_tokens();

-- =====================================================
-- NEXT STEPS
-- =====================================================
-- 1. Deploy edge function: npx supabase functions deploy expire-subscription-tokens
-- 2. Setup cron job in Supabase Dashboard (schedule: 0 0 * * *)
-- 3. Update payment success handler to use add_subscription_tokens or add_purchased_tokens
-- 4. Test the system with real payments

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================
-- Uncomment and run these if you need to rollback changes:

-- DROP FUNCTION IF EXISTS deduct_tokens_dual;
-- DROP FUNCTION IF EXISTS add_subscription_tokens;
-- DROP FUNCTION IF EXISTS add_purchased_tokens;
-- DROP FUNCTION IF EXISTS check_expiring_subscriptions;
-- DROP FUNCTION IF EXISTS expire_subscription_tokens;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS subscription_tokens;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS purchased_tokens;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS subscription_expires_at;
-- ALTER TABLE payments DROP COLUMN IF EXISTS token_type;

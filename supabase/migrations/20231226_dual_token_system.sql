-- =====================================================
-- DUAL TOKEN SYSTEM
-- Separate subscription tokens (expire) from purchased tokens (permanent)
-- =====================================================

-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS purchased_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_expiry_warning_sent TIMESTAMP WITH TIME ZONE;

-- Migrate existing tokens to subscription_tokens (since we're in development)
UPDATE public.profiles
SET subscription_tokens = monthly_generate_limit - current_month_generates,
    purchased_tokens = 0
WHERE monthly_generate_limit > 0;

-- Add token_type to payments table to track which type was purchased
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS token_type VARCHAR(20) DEFAULT 'subscription' CHECK (token_type IN ('subscription', 'purchased'));

-- Add expiry_date to payments for subscription tokens
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP WITH TIME ZONE;

-- Create function to deduct tokens with priority (subscription first, then purchased)
CREATE OR REPLACE FUNCTION deduct_user_tokens(p_user_id UUID, p_amount INTEGER DEFAULT 1)
RETURNS TABLE (
  success BOOLEAN,
  subscription_used INTEGER,
  purchased_used INTEGER,
  remaining_subscription INTEGER,
  remaining_purchased INTEGER,
  message TEXT
) AS $$
DECLARE
  v_subscription_tokens INTEGER;
  v_purchased_tokens INTEGER;
  v_subscription_used INTEGER := 0;
  v_purchased_used INTEGER := 0;
  v_remaining INTEGER;
BEGIN
  -- Get current token balances
  SELECT 
    COALESCE(subscription_tokens, 0),
    COALESCE(purchased_tokens, 0)
  INTO v_subscription_tokens, v_purchased_tokens
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  -- Check if user has enough tokens
  IF (v_subscription_tokens + v_purchased_tokens) < p_amount THEN
    RETURN QUERY SELECT 
      FALSE,
      0,
      0,
      v_subscription_tokens,
      v_purchased_tokens,
      'Insufficient tokens'::TEXT;
    RETURN;
  END IF;
  
  -- Deduct from subscription tokens first
  IF v_subscription_tokens >= p_amount THEN
    -- All from subscription
    v_subscription_used := p_amount;
    v_subscription_tokens := v_subscription_tokens - p_amount;
  ELSE
    -- Use all subscription tokens, rest from purchased
    v_subscription_used := v_subscription_tokens;
    v_purchased_used := p_amount - v_subscription_tokens;
    v_subscription_tokens := 0;
    v_purchased_tokens := v_purchased_tokens - v_purchased_used;
  END IF;
  
  -- Update the database
  UPDATE public.profiles
  SET 
    subscription_tokens = v_subscription_tokens,
    purchased_tokens = v_purchased_tokens,
    current_month_generates = current_month_generates + 1
  WHERE user_id = p_user_id;
  
  RETURN QUERY SELECT 
    TRUE,
    v_subscription_used,
    v_purchased_used,
    v_subscription_tokens,
    v_purchased_tokens,
    'Tokens deducted successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to add tokens (used when payment is approved)
CREATE OR REPLACE FUNCTION add_user_tokens(
  p_user_id UUID,
  p_amount INTEGER,
  p_token_type VARCHAR(20) DEFAULT 'subscription',
  p_expiry_days INTEGER DEFAULT 30
)
RETURNS BOOLEAN AS $$
DECLARE
  v_expiry_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate expiry date for subscription tokens
  IF p_token_type = 'subscription' THEN
    v_expiry_date := timezone('utc'::text, now()) + (p_expiry_days || ' days')::INTERVAL;
  ELSE
    v_expiry_date := NULL; -- Purchased tokens never expire
  END IF;
  
  -- Update tokens based on type
  IF p_token_type = 'subscription' THEN
    UPDATE public.profiles
    SET 
      subscription_tokens = COALESCE(subscription_tokens, 0) + p_amount,
      subscription_expires_at = v_expiry_date,
      monthly_generate_limit = COALESCE(monthly_generate_limit, 0) + p_amount
    WHERE user_id = p_user_id;
  ELSE
    UPDATE public.profiles
    SET 
      purchased_tokens = COALESCE(purchased_tokens, 0) + p_amount,
      monthly_generate_limit = COALESCE(monthly_generate_limit, 0) + p_amount
    WHERE user_id = p_user_id;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update process_approved_payment to use new token system
CREATE OR REPLACE FUNCTION process_approved_payment(payment_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_tokens INTEGER;
  v_token_type VARCHAR(20);
  v_expiry_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get payment details
  SELECT user_id, tokens_purchased, token_type, expiry_date
  INTO v_user_id, v_tokens, v_token_type, v_expiry_date
  FROM public.payments
  WHERE id = payment_id AND payment_status = 'approved';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Add tokens using the new function
  PERFORM add_user_tokens(
    v_user_id,
    v_tokens,
    COALESCE(v_token_type, 'subscription'),
    CASE 
      WHEN v_expiry_date IS NOT NULL THEN 
        EXTRACT(DAY FROM (v_expiry_date - timezone('utc'::text, now())))::INTEGER
      ELSE 30
    END
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to expire subscription tokens
CREATE OR REPLACE FUNCTION expire_subscription_tokens()
RETURNS TABLE (
  user_id UUID,
  expired_tokens INTEGER,
  user_email TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH expired_users AS (
    UPDATE public.profiles
    SET 
      subscription_tokens = 0,
      subscription_expires_at = NULL,
      last_expiry_warning_sent = NULL
    WHERE 
      subscription_expires_at IS NOT NULL
      AND subscription_expires_at <= timezone('utc'::text, now())
      AND subscription_tokens > 0
    RETURNING 
      profiles.user_id,
      profiles.subscription_tokens as expired_tokens,
      profiles.email
  )
  SELECT * FROM expired_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get users who need expiry warning (7 days before)
CREATE OR REPLACE FUNCTION get_users_needing_expiry_warning()
RETURNS TABLE (
  user_id UUID,
  user_email TEXT,
  subscription_tokens INTEGER,
  expires_at TIMESTAMP WITH TIME ZONE,
  days_remaining INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.email,
    p.subscription_tokens,
    p.subscription_expires_at,
    EXTRACT(DAY FROM (p.subscription_expires_at - timezone('utc'::text, now())))::INTEGER as days_remaining
  FROM public.profiles p
  WHERE 
    p.subscription_expires_at IS NOT NULL
    AND p.subscription_tokens > 0
    AND p.subscription_expires_at > timezone('utc'::text, now())
    AND p.subscription_expires_at <= timezone('utc'::text, now()) + INTERVAL '7 days'
    AND (
      p.last_expiry_warning_sent IS NULL 
      OR p.last_expiry_warning_sent < timezone('utc'::text, now()) - INTERVAL '24 hours'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark warning as sent
CREATE OR REPLACE FUNCTION mark_expiry_warning_sent(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.profiles
  SET last_expiry_warning_sent = timezone('utc'::text, now())
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user token balance
CREATE OR REPLACE FUNCTION get_user_token_balance(p_user_id UUID)
RETURNS TABLE (
  subscription_tokens INTEGER,
  purchased_tokens INTEGER,
  total_tokens INTEGER,
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  days_until_expiry INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(p.subscription_tokens, 0) as subscription_tokens,
    COALESCE(p.purchased_tokens, 0) as purchased_tokens,
    COALESCE(p.subscription_tokens, 0) + COALESCE(p.purchased_tokens, 0) as total_tokens,
    p.subscription_expires_at,
    CASE 
      WHEN p.subscription_expires_at IS NOT NULL THEN
        EXTRACT(DAY FROM (p.subscription_expires_at - timezone('utc'::text, now())))::INTEGER
      ELSE NULL
    END as days_until_expiry
  FROM public.profiles p
  WHERE p.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION deduct_user_tokens(UUID, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION add_user_tokens(UUID, INTEGER, VARCHAR, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION expire_subscription_tokens() TO service_role;
GRANT EXECUTE ON FUNCTION get_users_needing_expiry_warning() TO service_role;
GRANT EXECUTE ON FUNCTION mark_expiry_warning_sent(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION get_user_token_balance(UUID) TO authenticated, service_role;

-- Create index for expiry queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_expires_at 
ON public.profiles(subscription_expires_at) 
WHERE subscription_expires_at IS NOT NULL;

-- Comments
COMMENT ON COLUMN public.profiles.subscription_tokens IS 'Tokens from monthly subscription (expire after 30 days)';
COMMENT ON COLUMN public.profiles.purchased_tokens IS 'Tokens from one-time purchase (never expire)';
COMMENT ON COLUMN public.profiles.subscription_expires_at IS 'When subscription tokens will expire';
COMMENT ON COLUMN public.profiles.last_expiry_warning_sent IS 'Last time user was warned about expiring tokens';
COMMENT ON FUNCTION deduct_user_tokens(UUID, INTEGER) IS 'Deduct tokens with priority: subscription first, then purchased';
COMMENT ON FUNCTION add_user_tokens(UUID, INTEGER, VARCHAR, INTEGER) IS 'Add tokens to user account (subscription or purchased)';
COMMENT ON FUNCTION expire_subscription_tokens() IS 'Expire all subscription tokens past their expiry date';
COMMENT ON FUNCTION get_users_needing_expiry_warning() IS 'Get users who need warning about expiring tokens (7 days before)';

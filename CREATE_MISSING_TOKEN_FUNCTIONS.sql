-- =====================================================
-- CREATE MISSING TOKEN FUNCTIONS
-- =====================================================

-- Function to add subscription tokens (with expiry)
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
    subscription_tokens = COALESCE(subscription_tokens, 0) + p_amount,
    subscription_expires_at = NOW() + (p_days || ' days')::INTERVAL,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RAISE NOTICE 'Added % subscription tokens to user % (expires in % days)', p_amount, p_user_id, p_days;
END;
$$;

-- Function to add purchased tokens (never expire)
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
    purchased_tokens = COALESCE(purchased_tokens, 0) + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RAISE NOTICE 'Added % purchased tokens to user %', p_amount, p_user_id;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION add_subscription_tokens TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION add_purchased_tokens TO authenticated, service_role;

-- Verification
SELECT 
  '=== VERIFICATION ===' as info;

SELECT 
  proname as function_name,
  pronargs as num_args
FROM pg_proc
WHERE proname IN ('add_subscription_tokens', 'add_purchased_tokens');

-- Test (optional - will add 0 tokens to test)
-- SELECT add_subscription_tokens('00000000-0000-0000-0000-000000000000'::UUID, 0, 30);

SELECT 
  '✅ Token functions created successfully' as status;

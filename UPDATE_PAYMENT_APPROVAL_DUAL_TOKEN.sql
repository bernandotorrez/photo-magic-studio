-- =====================================================
-- UPDATE PAYMENT APPROVAL FOR DUAL TOKEN SYSTEM
-- =====================================================
-- This updates the process_approved_payment function to support dual token system

-- Drop old function if exists
DROP FUNCTION IF EXISTS process_approved_payment(UUID);

-- Create new function that handles dual token system
CREATE OR REPLACE FUNCTION process_approved_payment(payment_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_tokens_purchased INTEGER;
  v_bonus_tokens INTEGER;
  v_total_tokens INTEGER;
  v_token_type TEXT;
BEGIN
  -- Get payment details
  SELECT 
    user_id,
    user_email,
    tokens_purchased,
    COALESCE(bonus_tokens, 0),
    COALESCE(token_type, 'purchased') -- Default to 'purchased' for backward compatibility
  INTO 
    v_user_id,
    v_user_email,
    v_tokens_purchased,
    v_bonus_tokens,
    v_token_type
  FROM payments
  WHERE id = payment_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Payment not found';
  END IF;
  
  -- Calculate total tokens (purchased + bonus)
  v_total_tokens := v_tokens_purchased + v_bonus_tokens;
  
  -- Add tokens based on token_type
  IF v_token_type = 'subscription' THEN
    -- Add to subscription_tokens with 30 days expiry
    PERFORM add_subscription_tokens(v_user_id, v_total_tokens, 30);
    
    RAISE NOTICE 'Added % subscription tokens (% purchased + % bonus) to user %', 
      v_total_tokens, v_tokens_purchased, v_bonus_tokens, v_user_email;
  ELSE
    -- Add to purchased_tokens (never expire)
    PERFORM add_purchased_tokens(v_user_id, v_total_tokens);
    
    RAISE NOTICE 'Added % purchased tokens (% purchased + % bonus) to user %', 
      v_total_tokens, v_tokens_purchased, v_bonus_tokens, v_user_email;
  END IF;
  
  RETURN TRUE;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error processing payment: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION process_approved_payment TO authenticated, service_role;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Test the function (replace with actual payment_id)
-- SELECT process_approved_payment('your-payment-id');

-- Check user tokens after approval
-- SELECT 
--   user_id,
--   subscription_tokens,
--   purchased_tokens,
--   (subscription_tokens + purchased_tokens) as total_tokens,
--   subscription_expires_at
-- FROM profiles
-- WHERE user_id = 'your-user-id';

-- =====================================================
-- NOTES
-- =====================================================
-- Token Type Logic:
-- - 'subscription': Tokens from monthly packages (expire in 30 days)
-- - 'purchased': Tokens from top-up (never expire)
-- 
-- Bonus tokens are added to the same type as purchased tokens
-- Example: Buy 50 tokens with 1456 unique code = 50 + 1 bonus = 51 total

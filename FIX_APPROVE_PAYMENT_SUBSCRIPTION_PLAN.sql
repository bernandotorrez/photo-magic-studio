-- =====================================================
-- FIX: APPROVE PAYMENT SUBSCRIPTION PLAN TYPE ERROR
-- =====================================================
-- Jalankan SQL ini di Supabase SQL Editor untuk fix error:
-- "column subscription_plan is of type subscription_plan but expression is of type text"
-- =====================================================

-- Update process_approved_payment function with proper type casting
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
  v_subscription_plan TEXT;
BEGIN
  -- Get payment details
  SELECT 
    user_id,
    user_email,
    tokens_purchased,
    COALESCE(bonus_tokens, 0),
    COALESCE(token_type, 'purchased'),
    subscription_plan
  INTO 
    v_user_id,
    v_user_email,
    v_tokens_purchased,
    v_bonus_tokens,
    v_token_type,
    v_subscription_plan
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
    
    -- Update subscription_plan if provided (with proper type casting)
    IF v_subscription_plan IS NOT NULL THEN
      UPDATE profiles
      SET subscription_plan = v_subscription_plan::subscription_plan
      WHERE user_id = v_user_id;
      
      RAISE NOTICE 'Updated user % to plan %', v_user_email, v_subscription_plan;
    END IF;
    
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

SELECT 'Function updated successfully!' as status;

-- Test query to check function
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'process_approved_payment';


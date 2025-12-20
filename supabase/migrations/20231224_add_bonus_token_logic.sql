-- =====================================================
-- ADD BONUS TOKEN LOGIC
-- =====================================================
-- Bonus token from unique code (not from excess payment)
-- If unique_code >= 1000, bonus = unique_code / 1000 (rounded down)
-- Example: unique_code 1456 → bonus 1 token
--          unique_code 456 → bonus 0 token
--          unique_code 1999 → bonus 1 token

-- Add column for bonus tracking
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS bonus_tokens INTEGER DEFAULT 0;

-- Comment
COMMENT ON COLUMN public.payments.bonus_tokens IS 'Bonus tokens from unique code (unique_code / 1000, rounded down)';

-- Update process_approved_payment function to include bonus tokens
CREATE OR REPLACE FUNCTION process_approved_payment(payment_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_tokens INTEGER;
  v_bonus_tokens INTEGER;
  v_total_tokens INTEGER;
  v_current_limit INTEGER;
BEGIN
  -- Get payment details
  SELECT 
    user_id, 
    tokens_purchased,
    COALESCE(bonus_tokens, 0)
  INTO 
    v_user_id, 
    v_tokens,
    v_bonus_tokens
  FROM public.payments
  WHERE id = payment_id AND payment_status = 'approved';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate total tokens (purchased + bonus)
  v_total_tokens := v_tokens + v_bonus_tokens;
  
  -- Get current monthly limit
  SELECT monthly_generate_limit INTO v_current_limit
  FROM public.profiles
  WHERE user_id = v_user_id;
  
  -- Update user's monthly limit with total tokens
  UPDATE public.profiles
  SET monthly_generate_limit = COALESCE(v_current_limit, 0) + v_total_tokens
  WHERE user_id = v_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION process_approved_payment(UUID) TO authenticated;

-- Comment
COMMENT ON FUNCTION process_approved_payment(UUID) IS 'Add tokens (including bonus) to user account when payment is approved';

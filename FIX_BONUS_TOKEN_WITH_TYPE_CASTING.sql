-- =====================================================
-- FIX BONUS TOKEN CALCULATION + TYPE CASTING
-- =====================================================
-- Fix untuk:
-- 1. Perhitungan bonus token dari paket + kode unik
-- 2. Type casting error untuk subscription_plan
-- =====================================================

CREATE OR REPLACE FUNCTION process_approved_payment(payment_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_tokens INTEGER;
  v_subscription_plan TEXT;
  v_unique_code INTEGER;
  v_bonus_from_package INTEGER := 0;
  v_bonus_from_unique_code INTEGER := 0;
  v_total_bonus INTEGER := 0;
  v_total_tokens INTEGER;
  v_current_limit INTEGER;
BEGIN
  -- Get payment details
  SELECT 
    user_id, 
    tokens_purchased,
    subscription_plan,
    unique_code,
    COALESCE(bonus_tokens, 0) -- bonus dari paket sudah diisi oleh frontend
  INTO 
    v_user_id, 
    v_tokens,
    v_subscription_plan,
    v_unique_code,
    v_bonus_from_package
  FROM public.payments
  WHERE id = payment_id AND payment_status = 'approved';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate bonus from unique code (kelipatan 1000)
  -- Contoh: 1334 / 1000 = 1 bonus token
  IF v_unique_code IS NOT NULL AND v_unique_code >= 1000 THEN
    v_bonus_from_unique_code := FLOOR(v_unique_code / 1000);
  END IF;
  
  -- Total bonus = bonus dari paket + bonus dari kode unik
  v_total_bonus := v_bonus_from_package + v_bonus_from_unique_code;
  
  -- Update payment record with calculated total bonus
  UPDATE public.payments
  SET bonus_tokens = v_total_bonus
  WHERE id = payment_id;
  
  -- Calculate total tokens (purchased + total bonus)
  v_total_tokens := v_tokens + v_total_bonus;
  
  -- Get current monthly limit
  SELECT monthly_generate_limit INTO v_current_limit
  FROM public.profiles
  WHERE user_id = v_user_id;
  
  -- Update user's monthly limit with total tokens
  -- FIX: Proper type casting for subscription_plan
  IF v_subscription_plan IS NOT NULL THEN
    UPDATE public.profiles
    SET 
      monthly_generate_limit = COALESCE(v_current_limit, 0) + v_total_tokens,
      subscription_plan = v_subscription_plan::subscription_plan
    WHERE user_id = v_user_id;
  ELSE
    UPDATE public.profiles
    SET 
      monthly_generate_limit = COALESCE(v_current_limit, 0) + v_total_tokens
    WHERE user_id = v_user_id;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION process_approved_payment(UUID) TO authenticated, service_role;

-- Comment
COMMENT ON FUNCTION process_approved_payment(UUID) IS 'Add tokens (including bonus from package and unique code) to user account when payment is approved. Bonus = bonus_from_package + (unique_code / 1000)';

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT 'Function updated successfully! ✅' as status;

-- =====================================================
-- CONTOH PERHITUNGAN
-- =====================================================
-- User beli paket Pro Max (100 tokens + 10 bonus dari paket)
-- Kode unik: 1334
-- Bonus dari kode unik: 1334 / 1000 = 1 token
-- Total bonus: 10 + 1 = 11 token
-- Total token yang didapat: 100 + 11 = 111 token
-- =====================================================

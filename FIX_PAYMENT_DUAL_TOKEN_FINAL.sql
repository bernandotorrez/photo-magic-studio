-- =====================================================
-- FIX PAYMENT APPROVAL - DUAL TOKEN SYSTEM
-- =====================================================
-- Problem: Token ditambahkan ke monthly_generate_limit (sistem lama)
-- Solution: Update ke subscription_tokens/purchased_tokens (dual token system)
-- =====================================================

-- Cek apakah fungsi add_subscription_tokens dan add_purchased_tokens sudah ada
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'add_subscription_tokens'
    ) THEN
        RAISE EXCEPTION 'Function add_subscription_tokens not found! Run RUN_THIS_SQL_DUAL_TOKEN.sql first';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'add_purchased_tokens'
    ) THEN
        RAISE EXCEPTION 'Function add_purchased_tokens not found! Run RUN_THIS_SQL_DUAL_TOKEN.sql first';
    END IF;
END $$;

-- =====================================================
-- UPDATE PROCESS_APPROVED_PAYMENT FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION process_approved_payment(payment_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_tokens INTEGER;
  v_subscription_plan TEXT;
  v_token_type TEXT;
  v_unique_code INTEGER;
  v_bonus_from_package INTEGER := 0;
  v_bonus_from_unique_code INTEGER := 0;
  v_total_bonus INTEGER := 0;
  v_total_tokens INTEGER;
BEGIN
  -- Get payment details
  SELECT 
    user_id, 
    tokens_purchased,
    subscription_plan,
    COALESCE(token_type, 'purchased'), -- default to 'purchased' if null
    unique_code,
    COALESCE(bonus_tokens, 0)
  INTO 
    v_user_id, 
    v_tokens,
    v_subscription_plan,
    v_token_type,
    v_unique_code,
    v_bonus_from_package
  FROM public.payments
  WHERE id = payment_id AND payment_status = 'approved';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment not found or not approved';
  END IF;
  
  -- Calculate bonus from unique code (kelipatan 1000)
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
  
  -- Add tokens based on token_type (DUAL TOKEN SYSTEM)
  IF v_token_type = 'subscription' THEN
    -- Add to subscription_tokens with 30 days expiry
    PERFORM add_subscription_tokens(v_user_id, v_total_tokens, 30);
    
    -- Update subscription_plan if provided
    IF v_subscription_plan IS NOT NULL THEN
      UPDATE public.profiles
      SET subscription_plan = v_subscription_plan::subscription_plan
      WHERE user_id = v_user_id;
    END IF;
    
    RAISE NOTICE 'Added % subscription tokens (% purchased + % bonus) to user %', 
      v_total_tokens, v_tokens, v_total_bonus, v_user_id;
  ELSE
    -- Add to purchased_tokens (never expire)
    PERFORM add_purchased_tokens(v_user_id, v_total_tokens);
    
    RAISE NOTICE 'Added % purchased tokens (% purchased + % bonus) to user %', 
      v_total_tokens, v_tokens, v_total_bonus, v_user_id;
  END IF;
  
  RETURN TRUE;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error processing payment: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION process_approved_payment(UUID) TO authenticated, service_role;

-- Comment
COMMENT ON FUNCTION process_approved_payment(UUID) IS 'Process approved payment and add tokens to user account using dual token system. Supports subscription tokens (30 days expiry) and purchased tokens (never expire).';

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT 'Function updated successfully! ✅' as status;

-- Check function exists
SELECT 
  proname as function_name,
  pronargs as num_args,
  pg_get_function_result(oid) as return_type
FROM pg_proc
WHERE proname = 'process_approved_payment';

-- =====================================================
-- MANUAL FIX FOR EXISTING PAYMENT
-- =====================================================
-- Jika payment sudah di-approve tapi token belum masuk,
-- jalankan query ini (ganti payment_id dengan ID payment yang bermasalah):

/*
-- 1. Cek payment details
SELECT 
  id,
  user_id,
  user_email,
  tokens_purchased,
  bonus_tokens,
  token_type,
  subscription_plan,
  payment_status
FROM payments
WHERE id = 'YOUR-PAYMENT-ID-HERE';

-- 2. Manual add tokens (pilih salah satu sesuai token_type)

-- Jika token_type = 'subscription':
SELECT add_subscription_tokens(
  'USER-ID-HERE'::UUID,
  110,  -- total tokens (100 purchased + 10 bonus)
  30    -- 30 days expiry
);

-- Jika token_type = 'purchased' atau NULL:
SELECT add_purchased_tokens(
  'USER-ID-HERE'::UUID,
  110   -- total tokens (100 purchased + 10 bonus)
);

-- 3. Update subscription_plan jika perlu
UPDATE profiles
SET subscription_plan = 'pro_max'::subscription_plan
WHERE user_id = 'USER-ID-HERE';

-- 4. Verifikasi tokens sudah masuk
SELECT 
  user_id,
  subscription_tokens,
  purchased_tokens,
  subscription_plan,
  subscription_expires_at
FROM profiles
WHERE user_id = 'USER-ID-HERE';
*/

-- =====================================================
-- CONTOH PERHITUNGAN
-- =====================================================
-- Payment: Pro Max (100 tokens + 10 bonus dari paket)
-- Kode unik: 1334
-- Bonus dari kode unik: 1334 / 1000 = 1 token
-- Total bonus: 10 + 1 = 11 token
-- Total token yang didapat: 100 + 11 = 111 token
-- Token type: subscription → masuk ke subscription_tokens (expire 30 hari)
-- Token type: purchased → masuk ke purchased_tokens (never expire)
-- =====================================================

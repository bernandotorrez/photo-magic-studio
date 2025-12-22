-- =====================================================
-- MANUAL FIX - PAYMENT YANG SUDAH DI-APPROVE
-- =====================================================
-- Untuk payment yang sudah di-approve tapi token belum masuk
-- karena fungsi masih pakai sistem lama (monthly_generate_limit)
-- =====================================================

-- Step 1: Cek payment details
SELECT 
  id,
  user_id,
  user_email,
  tokens_purchased,
  bonus_tokens,
  token_type,
  subscription_plan,
  unique_code,
  payment_status,
  created_at
FROM payments
WHERE user_id = 'ded1284d-6b99-4fee-8cdc-42390db2b2ab'
AND payment_status = 'approved'
ORDER BY created_at DESC
LIMIT 5;

-- Step 2: Cek current tokens user
SELECT 
  user_id,
  subscription_tokens,
  purchased_tokens,
  subscription_plan,
  subscription_expires_at,
  monthly_generate_limit  -- sistem lama (harusnya 109)
FROM profiles
WHERE user_id = 'ded1284d-6b99-4fee-8cdc-42390db2b2ab';

-- =====================================================
-- Step 3: ADD TOKENS MANUALLY
-- =====================================================
-- Ganti nilai sesuai dengan payment yang bermasalah

-- Untuk payment Pro Max (100 tokens + 10 bonus)
-- Token type: subscription (expire 30 hari)
SELECT add_subscription_tokens(
  'ded1284d-6b99-4fee-8cdc-42390db2b2ab'::UUID,
  110,  -- 100 purchased + 10 bonus
  30    -- 30 days expiry
);

-- ATAU jika token_type = 'purchased' (never expire):
/*
SELECT add_purchased_tokens(
  'ded1284d-6b99-4fee-8cdc-42390db2b2ab'::UUID,
  110   -- 100 purchased + 10 bonus
);
*/

-- =====================================================
-- Step 4: Update subscription_plan
-- =====================================================

UPDATE profiles
SET subscription_plan = 'pro_max'::subscription_plan
WHERE user_id = 'ded1284d-6b99-4fee-8cdc-42390db2b2ab';

-- =====================================================
-- Step 5: VERIFIKASI
-- =====================================================

-- Cek tokens sudah masuk
SELECT 
  user_id,
  subscription_tokens,  -- harusnya 110 (atau 111 jika ada bonus dari kode unik)
  purchased_tokens,
  subscription_plan,    -- harusnya 'pro_max'
  subscription_expires_at,  -- harusnya ~30 hari dari sekarang
  monthly_generate_limit    -- sistem lama (bisa diabaikan)
FROM profiles
WHERE user_id = 'ded1284d-6b99-4fee-8cdc-42390db2b2ab';

-- =====================================================
-- CLEANUP (OPSIONAL)
-- =====================================================
-- Reset monthly_generate_limit ke 0 karena sudah tidak dipakai
/*
UPDATE profiles
SET monthly_generate_limit = 0
WHERE user_id = 'ded1284d-6b99-4fee-8cdc-42390db2b2ab';
*/

-- =====================================================
-- SELESAI!
-- =====================================================
-- Setelah ini, refresh browser dan token harusnya sudah muncul
-- subscription_tokens: 110 (atau 111 jika ada bonus dari kode unik)
-- purchased_tokens: 0
-- =====================================================

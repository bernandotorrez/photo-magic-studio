-- =====================================================
-- UPDATE FREE TIER: 5 TOKEN → 2 TOKEN PER BULAN
-- =====================================================
-- Jalankan SQL ini di Supabase SQL Editor
-- untuk mengubah free tier dari 5 token menjadi 2 token per bulan
-- =====================================================

-- 1. Update subscription_tiers table
UPDATE subscription_tiers
SET 
  tokens = 2,
  features = '["2 token per bulan", "Akses fitur dasar", "Support email", "Bisa top-up token tambahan"]'::jsonb,
  updated_at = NOW()
WHERE tier_id = 'free';

-- 2. Verify the update
SELECT 
  tier_id,
  tier_name,
  tokens,
  bonus_tokens,
  features,
  updated_at
FROM subscription_tiers
WHERE tier_id = 'free';

-- =====================================================
-- EXPECTED RESULT:
-- =====================================================
-- tier_id | tier_name | tokens | bonus_tokens | features
-- --------|-----------|--------|--------------|----------
-- free    | Free      | 2      | 0            | ["2 token per bulan", ...]
-- =====================================================

-- 3. Test RPC function
SELECT * FROM get_active_subscription_tiers()
WHERE tier_id = 'free';

-- =====================================================
-- NOTES:
-- =====================================================
-- ✅ Ini hanya update data di tabel subscription_tiers
-- ✅ Tidak mengubah token user yang sudah ada
-- ✅ User baru yang daftar akan dapat 2 token per bulan
-- ✅ Frontend akan otomatis menampilkan "2 token per bulan"
-- =====================================================

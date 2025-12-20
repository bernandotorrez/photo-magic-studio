-- =====================================================
-- CHECK SUBSCRIPTION TIERS STATUS
-- =====================================================
-- Jalankan query ini untuk cek status tabel dan data

-- 1. Cek apakah tabel subscription_tiers ada
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'subscription_tiers'
) AS table_exists;

-- 2. Cek jumlah data di tabel (jika ada)
SELECT COUNT(*) as total_tiers FROM subscription_tiers;

-- 3. Lihat semua data tiers
SELECT 
  tier_id, 
  tier_name, 
  price, 
  tokens, 
  bonus_tokens, 
  is_active,
  is_popular,
  display_order
FROM subscription_tiers 
ORDER BY display_order;

-- 4. Cek apakah function get_active_subscription_tiers ada
SELECT EXISTS (
  SELECT FROM pg_proc 
  WHERE proname = 'get_active_subscription_tiers'
) AS function_exists;

-- 5. Test function (jika ada)
SELECT * FROM get_active_subscription_tiers();

-- =====================================================
-- HASIL INTERPRETASI:
-- =====================================================
-- Jika table_exists = true dan ada data:
--   → Tabel sudah ada, jalankan FIX_SUBSCRIPTION_TIERS_FUNCTION.sql
--
-- Jika table_exists = false:
--   → Tabel belum ada, jalankan RUN_THIS_SQL_SUBSCRIPTION_TIERS.sql
--
-- Jika function test berhasil return data:
--   → Semuanya OK! Cek browser, pricing seharusnya muncul
--
-- Jika function test error:
--   → Jalankan FIX_SUBSCRIPTION_TIERS_FUNCTION.sql
-- =====================================================

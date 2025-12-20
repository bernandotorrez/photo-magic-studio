-- =====================================================
-- ADD DUAL TOKEN COLUMNS TO PROFILES
-- =====================================================
-- Jalankan SQL ini untuk menambahkan column dual token system

-- 1. Add new columns for dual token system
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_tokens INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS purchased_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days');

-- 2. Migrate existing users to dual token system
-- Convert current_month_generates to subscription_tokens
UPDATE profiles 
SET subscription_tokens = GREATEST(0, monthly_generate_limit - current_month_generates)
WHERE subscription_tokens IS NULL OR subscription_tokens = 5;

-- 3. Set expiry date for existing subscription tokens (30 days from now)
UPDATE profiles 
SET subscription_expires_at = NOW() + INTERVAL '30 days'
WHERE subscription_expires_at IS NULL;

-- 4. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_expires_at 
ON profiles(subscription_expires_at);

-- 5. Verify the changes
SELECT 
  user_id,
  subscription_plan,
  subscription_tokens,
  purchased_tokens,
  subscription_expires_at,
  monthly_generate_limit,
  current_month_generates
FROM profiles 
LIMIT 10;

-- =====================================================
-- NOTES:
-- =====================================================
-- - subscription_tokens: Token dari paket bulanan (expire 30 hari)
-- - purchased_tokens: Token dari top-up (tidak expire)
-- - subscription_expires_at: Tanggal expiry token bulanan
-- 
-- Kolom lama (monthly_generate_limit, current_month_generates) 
-- masih ada untuk backward compatibility, tapi tidak digunakan lagi
-- =====================================================

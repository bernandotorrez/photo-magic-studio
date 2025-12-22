-- =====================================================
-- CHECK & FIX SUBSCRIPTION_TIERS TABLE
-- =====================================================
-- Pastikan tabel subscription_tiers ada dan bisa diakses

-- =====================================================
-- 1. CHECK IF TABLE EXISTS
-- =====================================================
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'subscription_tiers'
) as table_exists;

-- =====================================================
-- 2. CHECK TABLE DATA
-- =====================================================
SELECT * FROM subscription_tiers ORDER BY display_order;

-- =====================================================
-- 3. CHECK RLS POLICIES
-- =====================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'subscription_tiers';

-- =====================================================
-- 4. FIX RLS POLICIES (if needed)
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read active subscription tiers" ON subscription_tiers;
DROP POLICY IF EXISTS "Only admins can manage subscription tiers" ON subscription_tiers;

-- Enable RLS
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone (including authenticated and anon) can read active tiers
CREATE POLICY "Anyone can read subscription tiers"
  ON subscription_tiers FOR SELECT
  TO authenticated, anon
  USING (true); -- Allow reading all tiers, not just active ones

-- Policy: Only admins can manage tiers
CREATE POLICY "Only admins can manage subscription tiers"
  ON subscription_tiers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- =====================================================
-- 5. GRANT PERMISSIONS
-- =====================================================
GRANT SELECT ON subscription_tiers TO authenticated, anon;
GRANT ALL ON subscription_tiers TO service_role;

-- =====================================================
-- 6. TEST QUERY AS AUTHENTICATED USER
-- =====================================================
-- This should return all tiers
SELECT tier_id, tier_name, is_active, display_order 
FROM subscription_tiers 
WHERE is_active = true
ORDER BY display_order;

-- =====================================================
-- 7. COUNT USERS PER TIER
-- =====================================================
SELECT 
  st.tier_id,
  st.tier_name,
  COUNT(p.user_id) as user_count
FROM subscription_tiers st
LEFT JOIN profiles p ON p.subscription_plan = st.tier_id
WHERE st.is_active = true
GROUP BY st.tier_id, st.tier_name, st.display_order
ORDER BY st.display_order;

-- =====================================================
-- TROUBLESHOOTING
-- =====================================================

-- If table doesn't exist, run this first:
-- RUN_THIS_SQL_SUBSCRIPTION_TIERS.sql

-- If you see "permission denied" error:
-- Make sure you're logged in as admin or service_role

-- If tiers are empty:
-- Run the INSERT statements from RUN_THIS_SQL_SUBSCRIPTION_TIERS.sql

-- If user counts are all 0:
-- Check if profiles.subscription_plan column exists and has correct values

-- =====================================================
-- FIX SUBSCRIPTION TIERS FUNCTION
-- =====================================================
-- Jalankan ini jika sudah ada function lama yang conflict

-- =====================================================
-- 1. DROP EXISTING FUNCTIONS
-- =====================================================

DROP FUNCTION IF EXISTS get_subscription_tier(TEXT);
DROP FUNCTION IF EXISTS get_active_subscription_tiers();

-- =====================================================
-- 2. CREATE NEW FUNCTION TO GET ACTIVE TIERS
-- =====================================================

CREATE OR REPLACE FUNCTION get_active_subscription_tiers()
RETURNS TABLE (
  id UUID,
  tier_id TEXT,
  tier_name TEXT,
  display_order INTEGER,
  price INTEGER,
  tokens INTEGER,
  bonus_tokens INTEGER,
  description TEXT,
  features JSONB,
  limitations JSONB,
  api_rate_limit INTEGER,
  is_popular BOOLEAN,
  color TEXT,
  bg_color TEXT,
  icon TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.id,
    st.tier_id,
    st.tier_name,
    st.display_order,
    st.price,
    st.tokens,
    st.bonus_tokens,
    st.description,
    st.features,
    st.limitations,
    st.api_rate_limit,
    st.is_popular,
    st.color,
    st.bg_color,
    st.icon
  FROM subscription_tiers st
  WHERE st.is_active = true
  ORDER BY st.display_order ASC;
END;
$$;

-- =====================================================
-- 3. CREATE NEW FUNCTION TO GET SPECIFIC TIER
-- =====================================================

CREATE OR REPLACE FUNCTION get_subscription_tier(p_tier_id TEXT)
RETURNS TABLE (
  id UUID,
  tier_id TEXT,
  tier_name TEXT,
  display_order INTEGER,
  price INTEGER,
  tokens INTEGER,
  bonus_tokens INTEGER,
  description TEXT,
  features JSONB,
  limitations JSONB,
  api_rate_limit INTEGER,
  is_popular BOOLEAN,
  color TEXT,
  bg_color TEXT,
  icon TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.id,
    st.tier_id,
    st.tier_name,
    st.display_order,
    st.price,
    st.tokens,
    st.bonus_tokens,
    st.description,
    st.features,
    st.limitations,
    st.api_rate_limit,
    st.is_popular,
    st.color,
    st.bg_color,
    st.icon
  FROM subscription_tiers st
  WHERE st.tier_id = p_tier_id
  AND st.is_active = true;
END;
$$;

-- =====================================================
-- 4. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION get_active_subscription_tiers TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION get_subscription_tier TO authenticated, anon, service_role;

-- =====================================================
-- 5. TEST QUERY
-- =====================================================

-- Test: Get all active tiers
SELECT * FROM get_active_subscription_tiers();

-- Test: Get specific tier
SELECT * FROM get_subscription_tier('basic');

-- =====================================================
-- SELESAI!
-- =====================================================

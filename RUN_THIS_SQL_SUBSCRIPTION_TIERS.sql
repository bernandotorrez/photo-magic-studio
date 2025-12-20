-- =====================================================
-- JALANKAN SQL INI DI SUPABASE SQL EDITOR
-- =====================================================
-- Untuk membuat tabel subscription_tiers dan function-nya

-- =====================================================
-- 1. CREATE SUBSCRIPTION TIERS TABLE
-- =====================================================
DROP TABLE IF EXISTS subscription_tiers;
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id TEXT UNIQUE NOT NULL,
  tier_name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  price INTEGER NOT NULL DEFAULT 0,
  tokens INTEGER NOT NULL DEFAULT 0,
  bonus_tokens INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  limitations JSONB DEFAULT '[]'::jsonb,
  api_rate_limit INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  color TEXT DEFAULT 'text-gray-500',
  bg_color TEXT DEFAULT 'bg-gray-500/10',
  icon TEXT DEFAULT 'Sparkles',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_tier_id ON subscription_tiers(tier_id);
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_active ON subscription_tiers(is_active);

-- =====================================================
-- 2. INSERT DEFAULT TIERS
-- =====================================================

INSERT INTO subscription_tiers (tier_id, tier_name, display_order, price, tokens, bonus_tokens, description, features, limitations, api_rate_limit, is_active, is_popular, color, bg_color, icon) VALUES
  ('free', 'Free', 1, 0, 5, 0, 'Untuk mencoba fitur dasar', 
   '["5 token per bulan", "Akses fitur dasar", "Support email", "Bisa top-up token tambahan"]'::jsonb,
   '["Tidak ada akses API", "Tidak ada priority support"]'::jsonb,
   0, true, false, 'text-gray-500', 'bg-gray-500/10', 'Sparkles'),
  
  ('basic', 'Basic', 2, 30000, 40, 0, 'Untuk bisnis kecil', 
   '["40 token per bulan", "Semua fitur enhancement", "Tanpa watermark", "Export HD quality", "Email support", "Bisa top-up token tambahan"]'::jsonb,
   '[]'::jsonb,
   5, true, false, 'text-blue-500', 'bg-blue-500/10', 'Zap'),
  
  ('basic_plus', 'Basic+', 3, 50000, 50, 2, 'Untuk UMKM',
   '["50 token + 2 bonus token", "Semua fitur Basic", "API Access (5 req/min)", "Priority email support", "Bulk processing", "Bisa top-up token tambahan"]'::jsonb,
   '[]'::jsonb,
   5, true, true, 'text-primary', 'bg-primary/10', 'Zap'),
  
  ('pro', 'Pro', 4, 75000, 75, 5, 'Untuk bisnis berkembang',
   '["75 token + 5 bonus token", "Semua fitur Basic+", "API Access (10 req/min)", "Custom enhancement prompts", "Priority support (WhatsApp)", "Advanced analytics", "Bisa top-up token tambahan"]'::jsonb,
   '[]'::jsonb,
   10, true, false, 'text-yellow-500', 'bg-yellow-500/10', 'Crown'),
  
  ('pro_max', 'Pro Max', 5, 100000, 100, 10, 'Untuk bisnis besar',
   '["100 token + 10 bonus token", "Semua fitur Pro", "API Access (20 req/min)", "Dedicated support", "Custom AI training", "White-label option", "Early access to beta features", "Bisa top-up token tambahan"]'::jsonb,
   '[]'::jsonb,
   20, true, false, 'text-purple-500', 'bg-purple-500/10', 'Crown')
ON CONFLICT (tier_id) DO UPDATE SET
  tier_name = EXCLUDED.tier_name,
  display_order = EXCLUDED.display_order,
  price = EXCLUDED.price,
  tokens = EXCLUDED.tokens,
  bonus_tokens = EXCLUDED.bonus_tokens,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  limitations = EXCLUDED.limitations,
  api_rate_limit = EXCLUDED.api_rate_limit,
  is_active = EXCLUDED.is_active,
  is_popular = EXCLUDED.is_popular,
  color = EXCLUDED.color,
  bg_color = EXCLUDED.bg_color,
  icon = EXCLUDED.icon;

-- =====================================================
-- 3. CREATE FUNCTION TO GET ACTIVE TIERS
-- =====================================================

-- Drop existing function first to avoid conflicts
DROP FUNCTION IF EXISTS get_active_subscription_tiers();

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
-- 4. CREATE FUNCTION TO GET SPECIFIC TIER
-- =====================================================

-- Drop existing function first to avoid conflicts
DROP FUNCTION IF EXISTS get_subscription_tier(TEXT);

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
-- 5. UPDATE TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_subscription_tiers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_subscription_tiers_updated_at ON subscription_tiers;
CREATE TRIGGER trigger_update_subscription_tiers_updated_at
  BEFORE UPDATE ON subscription_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_tiers_updated_at();

-- =====================================================
-- 6. ENABLE RLS & CREATE POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can read active subscription tiers" ON subscription_tiers;
DROP POLICY IF EXISTS "Only admins can manage subscription tiers" ON subscription_tiers;

-- Policy: Everyone can read active tiers
CREATE POLICY "Anyone can read active subscription tiers"
  ON subscription_tiers FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

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
-- 7. GRANT PERMISSIONS
-- =====================================================

GRANT SELECT ON subscription_tiers TO authenticated, anon;
GRANT ALL ON subscription_tiers TO service_role;
GRANT EXECUTE ON FUNCTION get_active_subscription_tiers TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION get_subscription_tier TO authenticated, anon, service_role;

-- =====================================================
-- 8. TEST QUERY
-- =====================================================

-- Test: Get all active tiers
SELECT * FROM get_active_subscription_tiers();

-- Test: Get specific tier
SELECT * FROM get_subscription_tier('basic');

-- =====================================================
-- SELESAI!
-- =====================================================
-- Jika berhasil, Anda akan melihat data pricing tiers
-- di halaman Index (landing page)

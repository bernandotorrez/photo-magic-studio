-- =====================================================
-- SYSTEM SETTINGS & SUBSCRIPTION TIERS
-- =====================================================
-- Create tables for system-wide settings and subscription tiers

-- =====================================================
-- 1. SUBSCRIPTION TIERS TABLE
-- =====================================================

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

-- Create index
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_tier_id ON subscription_tiers(tier_id);
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_active ON subscription_tiers(is_active);

-- Insert default tiers
INSERT INTO subscription_tiers (tier_id, tier_name, display_order, price, tokens, bonus_tokens, description, features, limitations, api_rate_limit, is_active, is_popular, color, bg_color, icon) VALUES
  ('free', 'Gratis', 1, 0, 5, 0, 'Cocok untuk mencoba fitur dasar EnhanceAI', 
   '["5 token per bulan", "Akses fitur dasar", "Support email", "Watermark pada hasil"]'::jsonb,
   '["Tidak ada akses API", "Tidak ada priority support", "Tidak ada custom enhancement"]'::jsonb,
   0, true, false, 'text-gray-500', 'bg-gray-500/10', 'Sparkles'),
  
  ('basic', 'Basic', 2, 30000, 40, 0, 'Cocok untuk bisnis kecil yang baru memulai', 
   '["40 token per bulan", "Semua fitur enhancement", "Tanpa watermark", "Export HD quality", "Email support"]'::jsonb,
   '[]'::jsonb,
   0, true, false, 'text-blue-500', 'bg-blue-500/10', 'Zap'),
  
  ('basic_plus', 'Basic+', 3, 50000, 50, 2, 'Cocok untuk UMKM yang sedang berkembang',
   '["50 token + 2 bonus token", "Semua fitur Basic", "API Access (5 req/min)", "Priority email support", "Bulk processing"]'::jsonb,
   '[]'::jsonb,
   5, true, true, 'text-primary', 'bg-primary/10', 'Zap'),
  
  ('pro', 'Pro', 4, 75000, 75, 5, 'Cocok untuk bisnis yang sudah berkembang pesat',
   '["75 token + 5 bonus token", "Semua fitur Basic+", "API Access (10 req/min)", "Custom enhancement prompts", "Priority support (WhatsApp)", "Advanced analytics"]'::jsonb,
   '[]'::jsonb,
   10, true, false, 'text-yellow-500', 'bg-yellow-500/10', 'Crown'),
  
  ('pro_max', 'Pro Max', 5, 100000, 100, 10, 'Cocok untuk enterprise dan bisnis besar',
   '["100 token + 10 bonus token", "Semua fitur Pro", "API Access (20 req/min)", "Dedicated support", "Custom AI training", "White-label option", "Early access to beta features"]'::jsonb,
   '[]'::jsonb,
   20, true, false, 'text-purple-500', 'bg-purple-500/10', 'Crown')
ON CONFLICT (tier_id) DO NOTHING;

-- =====================================================
-- 2. SYSTEM SETTINGS TABLE
-- =====================================================

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
  ('default_user_tier', '"free"'::jsonb, 'Default tier for new users'),
  ('maintenance_mode', 'false'::jsonb, 'Enable/disable maintenance mode'),
  ('max_file_size_mb', '5'::jsonb, 'Maximum file upload size in MB')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- 3. FUNCTIONS FOR SUBSCRIPTION TIERS
-- =====================================================

-- Get all active tiers
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

-- Get tier by ID
CREATE OR REPLACE FUNCTION get_subscription_tier(p_tier_id TEXT)
RETURNS TABLE (
  id UUID,
  tier_id TEXT,
  tier_name TEXT,
  price INTEGER,
  tokens INTEGER,
  bonus_tokens INTEGER,
  api_rate_limit INTEGER
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
    st.price,
    st.tokens,
    st.bonus_tokens,
    st.api_rate_limit
  FROM subscription_tiers st
  WHERE st.tier_id = p_tier_id
  AND st.is_active = true;
END;
$$;

-- =====================================================
-- 4. FUNCTIONS FOR SYSTEM SETTINGS
-- =====================================================

-- Create function to get setting
CREATE OR REPLACE FUNCTION get_system_setting(p_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_value JSONB;
BEGIN
  SELECT setting_value INTO v_value
  FROM system_settings
  WHERE setting_key = p_key;
  
  RETURN v_value;
END;
$$;

-- Create function to update setting
CREATE OR REPLACE FUNCTION update_system_setting(
  p_key TEXT,
  p_value JSONB,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE system_settings
  SET 
    setting_value = p_value,
    updated_by = p_user_id,
    updated_at = NOW()
  WHERE setting_key = p_key;
  
  RETURN FOUND;
END;
$$;

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_system_settings_updated_at ON system_settings;
CREATE TRIGGER trigger_update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_system_settings_updated_at();

-- Grant permissions
GRANT SELECT ON system_settings TO authenticated;
GRANT ALL ON system_settings TO service_role;
GRANT EXECUTE ON FUNCTION get_system_setting TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_system_setting TO authenticated, service_role;

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read settings
CREATE POLICY "Anyone can read system settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only admins can update settings
CREATE POLICY "Only admins can update system settings"
  ON system_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- =====================================================
-- 5. UPDATE PROFILES TABLE TO USE SYSTEM SETTINGS
-- =====================================================

-- Create function to apply default settings to new users
CREATE OR REPLACE FUNCTION apply_default_user_settings()
RETURNS TRIGGER AS $$
DECLARE
  v_default_tier TEXT;
  v_tier_data RECORD;
BEGIN
  -- Get default tier from settings
  v_default_tier := COALESCE((get_system_setting('default_user_tier')#>>'{}')::TEXT, 'free');
  
  -- Get tier details
  SELECT tokens, tier_id INTO v_tier_data
  FROM subscription_tiers
  WHERE tier_id = v_default_tier
  AND is_active = true;
  
  IF v_tier_data IS NOT NULL THEN
    NEW.subscription_plan := v_tier_data.tier_id;
    -- For free tier, give initial tokens as subscription tokens
    IF v_tier_data.tier_id = 'free' THEN
      NEW.subscription_tokens := v_tier_data.tokens;
      NEW.subscription_expires_at := NOW() + INTERVAL '30 days';
    END IF;
  ELSE
    -- Fallback to free tier
    NEW.subscription_plan := 'free';
    NEW.subscription_tokens := 5;
    NEW.subscription_expires_at := NOW() + INTERVAL '30 days';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to apply defaults on user creation
DROP TRIGGER IF EXISTS trigger_apply_default_user_settings ON profiles;
CREATE TRIGGER trigger_apply_default_user_settings
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION apply_default_user_settings();

-- =====================================================
-- 6. TRIGGERS
-- =====================================================

-- Update trigger for subscription_tiers
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
-- 7. PERMISSIONS & RLS
-- =====================================================

-- Subscription Tiers permissions
GRANT SELECT ON subscription_tiers TO authenticated, anon;
GRANT ALL ON subscription_tiers TO service_role;
GRANT EXECUTE ON FUNCTION get_active_subscription_tiers TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION get_subscription_tier TO authenticated, anon, service_role;

-- Enable RLS on subscription_tiers
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;

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
-- 9. HELPER FUNCTIONS FOR PAYMENT PROCESSING
-- =====================================================

-- Update process_approved_payment to also update subscription_plan
CREATE OR REPLACE FUNCTION process_approved_payment_with_tier(payment_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_tokens_purchased INTEGER;
  v_bonus_tokens INTEGER;
  v_total_tokens INTEGER;
  v_token_type TEXT;
  v_subscription_plan TEXT;
BEGIN
  -- Get payment details
  SELECT 
    user_id,
    user_email,
    tokens_purchased,
    COALESCE(bonus_tokens, 0),
    COALESCE(token_type, 'purchased'),
    subscription_plan
  INTO 
    v_user_id,
    v_user_email,
    v_tokens_purchased,
    v_bonus_tokens,
    v_token_type,
    v_subscription_plan
  FROM payments
  WHERE id = payment_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Payment not found';
  END IF;
  
  -- Calculate total tokens (purchased + bonus)
  v_total_tokens := v_tokens_purchased + v_bonus_tokens;
  
  -- Add tokens based on token_type
  IF v_token_type = 'subscription' THEN
    -- Add to subscription_tokens with 30 days expiry
    PERFORM add_subscription_tokens(v_user_id, v_total_tokens, 30);
    
    -- Update subscription_plan if provided
    IF v_subscription_plan IS NOT NULL THEN
      UPDATE profiles
      SET subscription_plan = v_subscription_plan
      WHERE user_id = v_user_id;
    END IF;
    
    RAISE NOTICE 'Added % subscription tokens (% purchased + % bonus) to user % with plan %', 
      v_total_tokens, v_tokens_purchased, v_bonus_tokens, v_user_email, v_subscription_plan;
  ELSE
    -- Add to purchased_tokens (never expire)
    PERFORM add_purchased_tokens(v_user_id, v_total_tokens);
    
    RAISE NOTICE 'Added % purchased tokens (% purchased + % bonus) to user %', 
      v_total_tokens, v_tokens_purchased, v_bonus_tokens, v_user_email;
  END IF;
  
  RETURN TRUE;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error processing payment: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION process_approved_payment_with_tier TO authenticated, service_role;

-- =====================================================
-- 10. VERIFICATION QUERIES
-- =====================================================

-- Check subscription tiers
SELECT * FROM subscription_tiers ORDER BY display_order;

-- Check system settings
SELECT * FROM system_settings ORDER BY setting_key;

-- Test get active tiers function
SELECT * FROM get_active_subscription_tiers();

-- Test get tier function
SELECT * FROM get_subscription_tier('basic_plus');

-- Test get setting function
SELECT get_system_setting('default_user_tier');

-- =====================================================
-- 11. ROLLBACK (if needed)
-- =====================================================
-- Uncomment to rollback:

-- DROP FUNCTION IF EXISTS process_approved_payment_with_tier;
-- DROP TRIGGER IF EXISTS trigger_apply_default_user_settings ON profiles;
-- DROP FUNCTION IF EXISTS apply_default_user_settings;
-- DROP POLICY IF EXISTS "Only admins can manage subscription tiers" ON subscription_tiers;
-- DROP POLICY IF EXISTS "Anyone can read active subscription tiers" ON subscription_tiers;
-- DROP POLICY IF EXISTS "Only admins can update system settings" ON system_settings;
-- DROP POLICY IF EXISTS "Anyone can read system settings" ON system_settings;
-- DROP FUNCTION IF EXISTS get_subscription_tier;
-- DROP FUNCTION IF EXISTS get_active_subscription_tiers;
-- DROP FUNCTION IF EXISTS update_system_setting;
-- DROP FUNCTION IF EXISTS get_system_setting;
-- DROP TRIGGER IF EXISTS trigger_update_subscription_tiers_updated_at ON subscription_tiers;
-- DROP FUNCTION IF EXISTS update_subscription_tiers_updated_at;
-- DROP TRIGGER IF EXISTS trigger_update_system_settings_updated_at ON system_settings;
-- DROP FUNCTION IF EXISTS update_system_settings_updated_at;
-- DROP TABLE IF EXISTS subscription_tiers;
-- DROP TABLE IF EXISTS system_settings;

-- =====================================================
-- VERIFY SECURITY TRIGGERS
-- Pastikan semua security triggers aktif kembali
-- =====================================================

-- 1. Check all triggers on profiles table
-- =====================================================
SELECT 
  tgname AS trigger_name,
  tgenabled AS status,
  CASE tgenabled
    WHEN 'O' THEN '✅ ENABLED'
    WHEN 'D' THEN '❌ DISABLED'
    WHEN 'R' THEN '✅ ENABLED (REPLICA)'
    WHEN 'A' THEN '✅ ENABLED (ALWAYS)'
    ELSE 'UNKNOWN'
  END AS status_text,
  pg_get_triggerdef(oid) AS trigger_definition
FROM pg_trigger
WHERE tgrelid = 'profiles'::regclass
  AND tgisinternal = false
ORDER BY tgname;

-- 2. Re-enable any disabled triggers (just in case)
-- =====================================================
DO $$
DECLARE
  trigger_rec RECORD;
  v_disabled_count INTEGER := 0;
BEGIN
  -- Check for disabled triggers
  FOR trigger_rec IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'profiles'::regclass 
    AND tgisinternal = false
    AND tgenabled = 'D'
  LOOP
    EXECUTE format('ALTER TABLE profiles ENABLE TRIGGER %I', trigger_rec.tgname);
    RAISE NOTICE '✅ Re-enabled trigger: %', trigger_rec.tgname;
    v_disabled_count := v_disabled_count + 1;
  END LOOP;
  
  IF v_disabled_count = 0 THEN
    RAISE NOTICE '✅ All triggers are already enabled!';
  ELSE
    RAISE NOTICE '✅ Re-enabled % trigger(s)', v_disabled_count;
  END IF;
END $$;

-- 3. Verify free tier token fix
-- =====================================================
SELECT 
  '✅ Free Tier Configuration' AS check_type,
  tier_id,
  tier_name,
  tokens AS subscription_tokens,
  bonus_tokens,
  tokens + bonus_tokens AS total_tokens
FROM subscription_tiers
WHERE tier_id = 'free';

-- 4. Check free tier users
-- =====================================================
SELECT 
  '✅ Free Tier Users' AS check_type,
  COUNT(*) AS total_users,
  COUNT(*) FILTER (WHERE subscription_tokens = 2) AS users_with_2_tokens,
  COUNT(*) FILTER (WHERE subscription_tokens != 2) AS users_with_wrong_tokens,
  AVG(subscription_tokens)::NUMERIC(10,2) AS avg_subscription_tokens,
  AVG(purchased_tokens)::NUMERIC(10,2) AS avg_purchased_tokens
FROM profiles
WHERE subscription_plan = 'free';

-- 5. Sample of free tier users
-- =====================================================
SELECT 
  email,
  subscription_plan,
  subscription_tokens,
  purchased_tokens,
  subscription_tokens + purchased_tokens AS total_tokens,
  current_month_generates AS usage,
  subscription_expires_at,
  created_at
FROM profiles
WHERE subscription_plan = 'free'
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- EXPECTED RESULTS:
-- =====================================================
-- 1. All triggers should show status = '✅ ENABLED'
-- 2. Free tier should have tokens = 2
-- 3. Most free tier users should have subscription_tokens = 2
-- 4. Security is intact and working

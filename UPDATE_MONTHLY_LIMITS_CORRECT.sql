-- ============================================
-- UPDATE MONTHLY LIMITS - CORRECT VALUES
-- Update subscription tiers dengan limits yang benar
-- ============================================

-- 1. Update subscription_tiers table
-- ============================================
UPDATE subscription_tiers
SET monthly_generate_limit = CASE tier_id
  WHEN 'free' THEN 2
  WHEN 'basic' THEN 30
  WHEN 'basic_plus' THEN 52   -- 50 base + 2 bonus
  WHEN 'pro' THEN 78           -- 75 base + 3 bonus
  WHEN 'pro_max' THEN 105      -- 100 base + 5 bonus
  ELSE monthly_generate_limit
END
WHERE tier_id IN ('free', 'basic', 'basic_plus', 'pro', 'pro_max');

-- 2. Update existing users' monthly_generate_limit
-- ============================================
UPDATE profiles
SET monthly_generate_limit = CASE subscription_plan
  WHEN 'free' THEN 2
  WHEN 'basic' THEN 30
  WHEN 'basic_plus' THEN 52
  WHEN 'pro' THEN 78
  WHEN 'pro_max' THEN 105
  ELSE monthly_generate_limit
END
WHERE subscription_plan IN ('free', 'basic', 'basic_plus', 'pro', 'pro_max');

-- 3. Verification
-- ============================================
DO $$
DECLARE
  v_free_limit INTEGER;
  v_basic_limit INTEGER;
  v_basic_plus_limit INTEGER;
  v_pro_limit INTEGER;
  v_pro_max_limit INTEGER;
BEGIN
  -- Get limits from subscription_tiers
  SELECT monthly_generate_limit INTO v_free_limit
  FROM subscription_tiers WHERE tier_id = 'free';
  
  SELECT monthly_generate_limit INTO v_basic_limit
  FROM subscription_tiers WHERE tier_id = 'basic';
  
  SELECT monthly_generate_limit INTO v_basic_plus_limit
  FROM subscription_tiers WHERE tier_id = 'basic_plus';
  
  SELECT monthly_generate_limit INTO v_pro_limit
  FROM subscription_tiers WHERE tier_id = 'pro';
  
  SELECT monthly_generate_limit INTO v_pro_max_limit
  FROM subscription_tiers WHERE tier_id = 'pro_max';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MONTHLY LIMITS VERIFICATION';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Subscription Tiers Limits:';
  RAISE NOTICE '- Free: % (expected: 2)', v_free_limit;
  RAISE NOTICE '- Basic: % (expected: 30)', v_basic_limit;
  RAISE NOTICE '- Basic Plus: % (expected: 52)', v_basic_plus_limit;
  RAISE NOTICE '- Pro: % (expected: 78)', v_pro_limit;
  RAISE NOTICE '- Pro Max: % (expected: 105)', v_pro_max_limit;
  RAISE NOTICE '';
  
  -- Verify all correct
  IF v_free_limit = 2 AND v_basic_limit = 30 AND v_basic_plus_limit = 52 
     AND v_pro_limit = 78 AND v_pro_max_limit = 105 THEN
    RAISE NOTICE '✅ ALL LIMITS CORRECT!';
  ELSE
    RAISE NOTICE '❌ SOME LIMITS INCORRECT - Please check!';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;

-- 4. Show updated subscription_tiers
-- ============================================
SELECT 
  tier_id,
  tier_name,
  monthly_generate_limit,
  CASE tier_id
    WHEN 'free' THEN '2 base'
    WHEN 'basic' THEN '30 base'
    WHEN 'basic_plus' THEN '50 base + 2 bonus'
    WHEN 'pro' THEN '75 base + 3 bonus'
    WHEN 'pro_max' THEN '100 base + 5 bonus'
  END AS breakdown,
  is_active
FROM subscription_tiers
WHERE is_active = true
ORDER BY 
  CASE tier_id
    WHEN 'free' THEN 1
    WHEN 'basic' THEN 2
    WHEN 'basic_plus' THEN 3
    WHEN 'pro' THEN 4
    WHEN 'pro_max' THEN 5
  END;

-- 5. Show count of users per tier
-- ============================================
SELECT 
  subscription_plan,
  COUNT(*) AS user_count,
  MAX(monthly_generate_limit) AS limit_set
FROM profiles
WHERE subscription_plan IN ('free', 'basic', 'basic_plus', 'pro', 'pro_max')
GROUP BY subscription_plan
ORDER BY 
  CASE subscription_plan
    WHEN 'free' THEN 1
    WHEN 'basic' THEN 2
    WHEN 'basic_plus' THEN 3
    WHEN 'pro' THEN 4
    WHEN 'pro_max' THEN 5
  END;

-- ============================================
-- DONE!
-- ============================================
-- Expected Results:
-- free: 2
-- basic: 30
-- basic_plus: 52 (50+2)
-- pro: 78 (75+3)
-- pro_max: 105 (100+5)

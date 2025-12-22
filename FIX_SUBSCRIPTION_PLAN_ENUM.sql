-- =====================================================
-- FIX SUBSCRIPTION PLAN ENUM
-- =====================================================
-- Error: invalid input value for enum subscription_plan: "pro_max"
-- 
-- PILIH SALAH SATU SOLUSI:
-- Solusi 1: Update enum (recommended)
-- Solusi 2: Ubah ke TEXT type
-- =====================================================

-- =====================================================
-- SOLUSI 1: UPDATE ENUM (RECOMMENDED)
-- =====================================================
-- Tambahkan nilai yang hilang ke enum subscription_plan

-- Cek nilai enum yang ada saat ini
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'subscription_plan'::regtype
ORDER BY enumsortorder;

-- Tambahkan nilai yang hilang (jika belum ada)
DO $$ 
BEGIN
    -- Tambahkan 'pro_max' jika belum ada
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = 'subscription_plan'::regtype 
        AND enumlabel = 'pro_max'
    ) THEN
        ALTER TYPE subscription_plan ADD VALUE 'pro_max';
        RAISE NOTICE 'Added pro_max to subscription_plan enum';
    END IF;
    
    -- Tambahkan 'basic_plus' jika belum ada
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = 'subscription_plan'::regtype 
        AND enumlabel = 'basic_plus'
    ) THEN
        ALTER TYPE subscription_plan ADD VALUE 'basic_plus';
        RAISE NOTICE 'Added basic_plus to subscription_plan enum';
    END IF;
END $$;

-- Verifikasi enum values setelah update
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'subscription_plan'::regtype
ORDER BY enumsortorder;

-- =====================================================
-- SOLUSI 2: UBAH KE TEXT TYPE (ALTERNATIF)
-- =====================================================
-- Jika Solusi 1 tidak berhasil, gunakan ini
-- PERINGATAN: Ini akan mengubah tipe data kolom

/*
-- Backup data dulu
CREATE TABLE profiles_backup AS SELECT * FROM profiles;

-- Ubah tipe kolom dari enum ke text
ALTER TABLE profiles 
ALTER COLUMN subscription_plan TYPE TEXT;

-- Drop enum type (opsional)
-- DROP TYPE IF EXISTS subscription_plan CASCADE;

-- Verifikasi
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'subscription_plan';
*/

-- =====================================================
-- UPDATE FUNCTION (SETELAH ENUM DIUPDATE)
-- =====================================================

CREATE OR REPLACE FUNCTION process_approved_payment(payment_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_tokens INTEGER;
  v_subscription_plan TEXT;
  v_unique_code INTEGER;
  v_bonus_from_package INTEGER := 0;
  v_bonus_from_unique_code INTEGER := 0;
  v_total_bonus INTEGER := 0;
  v_total_tokens INTEGER;
  v_current_limit INTEGER;
BEGIN
  -- Get payment details
  SELECT 
    user_id, 
    tokens_purchased,
    subscription_plan,
    unique_code,
    COALESCE(bonus_tokens, 0)
  INTO 
    v_user_id, 
    v_tokens,
    v_subscription_plan,
    v_unique_code,
    v_bonus_from_package
  FROM public.payments
  WHERE id = payment_id AND payment_status = 'approved';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate bonus from unique code
  IF v_unique_code IS NOT NULL AND v_unique_code >= 1000 THEN
    v_bonus_from_unique_code := FLOOR(v_unique_code / 1000);
  END IF;
  
  -- Total bonus
  v_total_bonus := v_bonus_from_package + v_bonus_from_unique_code;
  
  -- Update payment record
  UPDATE public.payments
  SET bonus_tokens = v_total_bonus
  WHERE id = payment_id;
  
  -- Calculate total tokens
  v_total_tokens := v_tokens + v_total_bonus;
  
  -- Get current monthly limit
  SELECT monthly_generate_limit INTO v_current_limit
  FROM public.profiles
  WHERE user_id = v_user_id;
  
  -- Update user profile
  IF v_subscription_plan IS NOT NULL THEN
    -- Cast to enum (akan berhasil setelah enum diupdate)
    UPDATE public.profiles
    SET 
      monthly_generate_limit = COALESCE(v_current_limit, 0) + v_total_tokens,
      subscription_plan = v_subscription_plan::subscription_plan
    WHERE user_id = v_user_id;
  ELSE
    UPDATE public.profiles
    SET 
      monthly_generate_limit = COALESCE(v_current_limit, 0) + v_total_tokens
    WHERE user_id = v_user_id;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION process_approved_payment(UUID) TO authenticated, service_role;

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT 'Fix completed! ✅' as status;

-- Test enum values
SELECT 'Available subscription_plan values:' as info;
SELECT enumlabel as available_values
FROM pg_enum 
WHERE enumtypid = 'subscription_plan'::regtype
ORDER BY enumsortorder;

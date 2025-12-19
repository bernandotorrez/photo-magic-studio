-- Insert Admin Account
-- This migration creates a default admin user

-- IMPORTANT: Change these values before running!
-- Email: admin@example.com
-- Password: Admin123!@# (CHANGE THIS!)

-- Note: Supabase auth.users table cannot be directly inserted via SQL in production
-- This is a template. You need to:
-- 1. Create user via Supabase Dashboard > Authentication > Users > Add User
-- 2. Or use Supabase Auth API to create user
-- 3. Then run the UPDATE query below to set as admin

-- After creating user via Dashboard/API, run this to set as admin:
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get user ID by email
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@example.com'; -- CHANGE THIS EMAIL
  
  IF admin_user_id IS NOT NULL THEN
    -- Update profile to set as admin
    UPDATE profiles
    SET is_admin = true,
        subscription_plan = 'pro',
        monthly_generate_limit = 999999
    WHERE user_id = admin_user_id;
    
    RAISE NOTICE 'Admin user set successfully: %', admin_user_id;
  ELSE
    RAISE NOTICE 'User not found. Please create user first via Supabase Dashboard.';
  END IF;
END $$;

-- Verify admin users
SELECT 
  p.user_id,
  u.email,
  p.full_name,
  p.is_admin,
  p.subscription_plan,
  p.monthly_generate_limit,
  p.created_at
FROM profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE p.is_admin = true;

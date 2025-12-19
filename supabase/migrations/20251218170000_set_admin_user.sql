-- Set admin user
-- IMPORTANT: Replace 'your-email@example.com' with your actual admin email address

-- Method 1: Set admin by email (RECOMMENDED)
-- Uncomment and replace email below:
/*
UPDATE profiles 
SET is_admin = true 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
*/

-- Method 2: Set admin by user_id (if you know the UUID)
-- Uncomment and replace user_id below:
/*
UPDATE profiles 
SET is_admin = true 
WHERE user_id = 'your-user-uuid-here';
*/

-- Verify admin users
SELECT 
  p.user_id,
  u.email,
  p.full_name,
  p.is_admin,
  p.subscription_plan,
  p.created_at
FROM profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE p.is_admin = true;

-- Note: If no results, uncomment one of the methods above and replace with your email/user_id

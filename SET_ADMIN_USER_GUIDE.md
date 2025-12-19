# Set Admin User Guide

Ada beberapa cara untuk set user sebagai admin.

## Method 1: Using Node.js Script (RECOMMENDED)

### Prerequisites
1. Install dependencies: `npm install`
2. Add `SUPABASE_SERVICE_ROLE_KEY` to your `.env` file

### Get Service Role Key
1. Buka Supabase Dashboard
2. Go to Project Settings > API
3. Copy "service_role" key (bukan anon key!)
4. Add to `.env`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

### Usage

#### Set user as admin by email:
```bash
npm run set-admin admin@example.com
```

#### List all admin users:
```bash
npm run list-admins
```

### Example Output
```
🔍 Looking for user with email: admin@example.com
✅ Found user: admin@example.com (uuid-here)
✅ Successfully set user as admin!

📊 User details:
  Email: admin@example.com
  User ID: uuid-here
  Name: Admin User
  Plan: free
  Admin: true

🎉 User can now access admin panel at /admin
```

## Method 2: Using SQL (Manual)

### Via Supabase Dashboard
1. Buka Supabase Dashboard
2. Go to SQL Editor
3. Run query:

```sql
-- Set admin by email
UPDATE profiles 
SET is_admin = true 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'admin@example.com'
);

-- Verify
SELECT 
  p.user_id,
  u.email,
  p.full_name,
  p.is_admin,
  p.subscription_plan
FROM profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE p.is_admin = true;
```

### Via Migration File
1. Edit file: `supabase/migrations/20251218170000_set_admin_user.sql`
2. Uncomment dan ganti email:
   ```sql
   UPDATE profiles 
   SET is_admin = true 
   WHERE user_id = (
     SELECT id FROM auth.users WHERE email = 'your-email@example.com'
   );
   ```
3. Run migration:
   ```bash
   supabase db push
   ```

## Method 3: Using Supabase CLI

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run SQL command
supabase db execute "UPDATE profiles SET is_admin = true WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@example.com')"
```

## Verification

### Check in Database
```sql
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
```

### Check in Application
1. Login dengan user yang sudah di-set sebagai admin
2. Lihat dashboard header
3. Button "Admin" harus muncul
4. Klik button untuk akses admin panel
5. Verify bisa lihat statistics dan user management

## Troubleshooting

### "Profile not found"
**Problem**: User belum pernah login, jadi profile belum dibuat.

**Solution**: 
1. User harus login minimal 1x dulu
2. Trigger `handle_new_user()` akan create profile
3. Baru bisa set `is_admin = true`

### "User not found with email"
**Problem**: Email salah atau user belum register.

**Solution**:
1. Check typo di email
2. Verify user sudah register di auth.users
3. List all users: `npm run set-admin` (tanpa parameter)

### "Missing SUPABASE_SERVICE_ROLE_KEY"
**Problem**: Environment variable tidak ada.

**Solution**:
1. Add ke `.env` file
2. Restart terminal/server
3. Verify dengan: `echo $SUPABASE_SERVICE_ROLE_KEY` (Linux/Mac) atau `echo %SUPABASE_SERVICE_ROLE_KEY%` (Windows)

### Admin button tidak muncul
**Problem**: Frontend belum refresh atau cache.

**Solution**:
1. Logout dan login lagi
2. Hard refresh browser (Ctrl+Shift+R)
3. Clear browser cache
4. Check console untuk errors

## Security Notes

⚠️ **IMPORTANT:**
- **NEVER** commit `SUPABASE_SERVICE_ROLE_KEY` to Git
- Service role key punya full access ke database
- Hanya gunakan di server-side atau local development
- Jangan expose di frontend code
- Add ke `.gitignore` (sudah included)

## Multiple Admins

Untuk set multiple admins, jalankan command berkali-kali:

```bash
npm run set-admin admin1@example.com
npm run set-admin admin2@example.com
npm run set-admin admin3@example.com
```

Atau via SQL:

```sql
UPDATE profiles 
SET is_admin = true 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('admin1@example.com', 'admin2@example.com', 'admin3@example.com')
);
```

## Remove Admin Access

Untuk remove admin access:

```bash
# Via SQL
UPDATE profiles 
SET is_admin = false 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);
```

Atau buat script `remove-admin.js` yang similar dengan `set-admin.js`.

## Best Practices

1. ✅ Set minimal 1 admin user saat setup
2. ✅ Use email yang trusted dan secure
3. ✅ Enable 2FA untuk admin accounts (Supabase feature)
4. ✅ Monitor admin actions (future: audit log)
5. ✅ Regularly review admin list
6. ✅ Remove admin access when no longer needed
7. ❌ Jangan set semua user sebagai admin
8. ❌ Jangan share admin credentials

## Quick Start

Untuk first-time setup:

```bash
# 1. Add service role key to .env
echo "SUPABASE_SERVICE_ROLE_KEY=your_key_here" >> .env

# 2. Set your email as admin
npm run set-admin your-email@example.com

# 3. Login and access /admin
# Done! 🎉
```

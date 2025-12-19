# Fix Email in Profiles - User Management

## Problem
Email di halaman "Kelola User" menampilkan "Email not available" padahal user register dengan email.

## Root Cause
- Tabel `profiles` tidak memiliki kolom `email`
- Email hanya tersimpan di `auth.users` (internal Supabase)
- Edge function `get-users-list` belum di-deploy atau gagal
- Client tidak bisa akses `auth.users` langsung

## Solution
Menambahkan kolom `email` di tabel `profiles` dan sync otomatis dari `auth.users`.

## Migration

### File: `supabase/migrations/20251219000000_add_email_to_profiles.sql`

Migration ini akan:
1. ✅ Menambahkan kolom `email` di tabel `profiles`
2. ✅ Membuat index untuk performa
3. ✅ Update existing profiles dengan email dari `auth.users`
4. ✅ Update trigger `handle_new_user` untuk include email
5. ✅ Membuat trigger sync email saat user update email

## How to Apply

### Option 1: Supabase CLI (Recommended)
```bash
# Apply migration
supabase db push

# Or if using migrations
supabase migration up
```

### Option 2: Supabase Dashboard
1. Buka Supabase Dashboard
2. Pilih project Anda
3. Klik "SQL Editor"
4. Copy paste isi file `20251219000000_add_email_to_profiles.sql`
5. Klik "Run"

### Option 3: Manual SQL
Jalankan SQL berikut di Supabase SQL Editor:

```sql
-- Add email column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Update existing profiles with email from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.user_id = u.id AND p.email IS NULL;

-- Update the handle_new_user function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Create function to sync email updates
CREATE OR REPLACE FUNCTION public.sync_user_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$;

-- Create trigger to sync email on update
DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW 
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.sync_user_email();
```

## Verification

### 1. Check Column Added
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'email';
```

Expected: Should return one row with `email` column.

### 2. Check Existing Data
```sql
SELECT id, user_id, full_name, email 
FROM profiles 
WHERE is_admin = false 
LIMIT 5;
```

Expected: Email column should have values (not NULL).

### 3. Test New User Registration
1. Register new user
2. Check profiles table
3. Email should be automatically populated

### 4. Test Email Update
1. Update user email in Supabase Auth
2. Check profiles table
3. Email should be synced automatically

## Code Changes

### UserManagement.tsx
Simplified to fetch directly from profiles:

```typescript
const fetchUsers = async () => {
  const { data: profilesData, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_admin', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  setUsers(profilesData || []);
};
```

**Benefits:**
- ✅ No need for edge function
- ✅ Faster query (direct table access)
- ✅ Simpler code
- ✅ Real-time email updates

## Rollback

If needed, rollback with:

```sql
-- Remove trigger
DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;

-- Remove function
DROP FUNCTION IF EXISTS public.sync_user_email();

-- Remove column (optional - will lose email data)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;
```

## Notes

### Edge Function Alternative
Edge function `get-users-list` masih bisa digunakan sebagai backup, tapi tidak diperlukan lagi karena email sudah ada di profiles.

### Performance
- Index `idx_profiles_email` memastikan search by email tetap cepat
- Trigger sync minimal overhead (hanya saat email update)

### Security
- Email di profiles mengikuti RLS policies yang sama
- Admin bisa lihat semua email (sesuai admin policies)
- User biasa hanya bisa lihat email sendiri

## Testing Checklist

- [ ] Migration applied successfully
- [ ] Existing users have email populated
- [ ] New user registration includes email
- [ ] Email update syncs to profiles
- [ ] Admin panel shows emails correctly
- [ ] Search by email works
- [ ] No performance issues

## Troubleshooting

### Email still NULL after migration
```sql
-- Manually sync emails
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.user_id = u.id;
```

### Trigger not working
```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_email_updated';

-- Recreate trigger if needed
-- (run the CREATE TRIGGER command again)
```

### Permission issues
Pastikan function memiliki `SECURITY DEFINER` untuk akses auth.users.

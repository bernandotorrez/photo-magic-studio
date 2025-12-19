# Email-Based Generation Tracking

## Overview
Sistem tracking generation telah diubah dari berbasis `user_id` menjadi berbasis `email` untuk mencegah user bypass limit dengan cara delete akun dan register ulang.

## Changes Made

### 1. Database Migration
**File**: `supabase/migrations/20251219120000_add_email_to_generation_history.sql`

- Menambahkan kolom `user_email` ke tabel `generation_history`
- Membuat index untuk performa query email
- Backfill data existing dengan email dari `auth.users`
- Membuat function baru:
  - `get_generation_count_by_email(p_email TEXT)` - Menghitung generation berdasarkan email
  - `can_user_generate(p_email TEXT, p_user_id UUID)` - Cek apakah user bisa generate
  - Update `increment_generation_count(p_user_id UUID)` - Sekarang count berdasarkan email

### 2. Edge Function Updates
**File**: `supabase/functions/generate-enhanced-image/index.ts`

**Perubahan**:
- Mengambil `userEmail` dari auth token
- Check generation limit menggunakan `can_user_generate()` dengan email
- Save history dengan `user_email` field
- Update count tetap menggunakan `increment_generation_count()` yang sudah diupdate

**Before**:
```typescript
// Check by user_id only
const { data: profileData } = await supabase
  .from('profiles')
  .select('monthly_generate_limit, current_month_generates')
  .eq('user_id', userId)
  .maybeSingle();

if (currentGenerates >= limit) {
  return error;
}
```

**After**:
```typescript
// Check by email
const { data: canGenerate } = await supabase
  .rpc('can_user_generate', { 
    p_email: userEmail,
    p_user_id: userId 
  });

if (canGenerate === false) {
  return error;
}
```

### 3. Frontend Updates
**Files Updated**:
- `src/pages/Dashboard.tsx`
- `src/pages/DashboardNew.tsx`
- `src/pages/DashboardStats.tsx`
- `src/pages/Settings.tsx`
- `src/components/Layout.tsx`

**Perubahan**:
Semua `fetchProfile()` function sekarang menggunakan `get_generation_count_by_email()` untuk mendapatkan count yang akurat:

```typescript
const fetchProfile = async () => {
  if (!user) return;
  
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  
  if (data && user.email) {
    // Get actual generation count by email
    const { data: emailCount } = await supabase
      .rpc('get_generation_count_by_email', { p_email: user.email });
    
    // Update profile with email-based count
    setProfile({
      ...data,
      current_month_generates: emailCount || 0
    });
  }
};
```

## How It Works

### Generation Tracking Flow

1. **User Generate Request**:
   - User melakukan generate image
   - System extract `user_id` dan `user_email` dari auth token

2. **Check Limit**:
   - Call `can_user_generate(email, user_id)`
   - Function menghitung total generation untuk email tersebut di bulan ini
   - Compare dengan `monthly_generate_limit` dari profile

3. **Save History**:
   - Jika allowed, save ke `generation_history` dengan `user_email`
   - Call `increment_generation_count(user_id)` untuk update profile

4. **Display Count**:
   - Frontend call `get_generation_count_by_email(email)`
   - Display count yang akurat berdasarkan email

### Prevention of Bypass

**Scenario**: User mencoba bypass limit dengan delete & re-register

**Before** (user_id based):
```
1. User A (user_id: 123) generate 5x (limit reached)
2. User A delete account
3. User A register ulang dengan email sama (user_id: 456)
4. ❌ Count reset ke 0 (karena user_id baru)
```

**After** (email based):
```
1. User A (email: user@example.com) generate 5x (limit reached)
2. User A delete account
3. User A register ulang dengan email sama
4. ✅ Count tetap 5 (karena track by email)
5. ✅ User tidak bisa generate lagi sampai bulan depan
```

## Database Schema

### generation_history Table
```sql
CREATE TABLE public.generation_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,  -- NEW COLUMN
  original_image_path TEXT,
  generated_image_path TEXT,
  classification_result TEXT,
  enhancement_type TEXT,
  prompt_used TEXT,
  presigned_url TEXT,
  presigned_url_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_generation_history_email ON generation_history(user_email);
```

## Functions

### get_generation_count_by_email
```sql
-- Returns: INTEGER (count of generations this month)
SELECT public.get_generation_count_by_email('user@example.com');
```

### can_user_generate
```sql
-- Returns: BOOLEAN (true if can generate, false if limit reached)
SELECT public.can_user_generate('user@example.com', 'user-uuid');
```

### increment_generation_count
```sql
-- Updates profile.current_month_generates based on email count
SELECT public.increment_generation_count('user-uuid');
```

## Testing

### Test Bypass Prevention

1. **Setup**:
   ```sql
   -- Set user limit to 2
   UPDATE profiles SET monthly_generate_limit = 2 WHERE user_id = 'test-user-id';
   ```

2. **Test Steps**:
   ```
   a. Login as test@example.com
   b. Generate 2 images (limit reached)
   c. Try generate 3rd image → Should fail
   d. Delete account from Supabase Auth
   e. Register again with test@example.com
   f. Try generate → Should still fail (count = 2)
   ```

3. **Verify**:
   ```sql
   SELECT get_generation_count_by_email('test@example.com');
   -- Should return: 2
   
   SELECT can_user_generate('test@example.com', 'new-user-id');
   -- Should return: false
   ```

## Migration Steps

1. **Run Migration**:
   ```bash
   # Apply migration
   supabase db push
   ```

2. **Verify**:
   ```sql
   -- Check if column exists
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'generation_history' AND column_name = 'user_email';
   
   -- Check if functions exist
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_name IN (
     'get_generation_count_by_email',
     'can_user_generate',
     'increment_generation_count'
   );
   ```

3. **Deploy Edge Functions**:
   ```bash
   supabase functions deploy generate-enhanced-image
   ```

4. **Deploy Frontend**:
   ```bash
   npm run build
   # Deploy to your hosting
   ```

## Rollback Plan

If issues occur, rollback steps:

1. **Revert Edge Function**:
   - Deploy previous version of `generate-enhanced-image`

2. **Revert Frontend**:
   - Remove `get_generation_count_by_email` calls
   - Use `current_month_generates` directly from profile

3. **Database** (if needed):
   ```sql
   -- Drop new functions
   DROP FUNCTION IF EXISTS get_generation_count_by_email(TEXT);
   DROP FUNCTION IF EXISTS can_user_generate(TEXT, UUID);
   
   -- Revert increment_generation_count to old version
   -- (restore from backup)
   ```

## Notes

- Email tracking tidak mempengaruhi user yang sudah ada
- Backfill otomatis mengisi `user_email` untuk history lama
- Monthly reset tetap berjalan normal (first day of month)
- Admin users tidak terpengaruh oleh limit ini
- API key users juga menggunakan email-based tracking

## Security Considerations

- Email tidak bisa diubah di Supabase Auth (by design)
- User harus verify email untuk register
- Disposable email sudah diblock di registration
- RLS policies tetap enforce user_id untuk data access
- Service role key required untuk bypass RLS saat insert history

# Migration Fix Guide

## ❌ Error yang Terjadi

### Error 1: Column `profiles.role` does not exist
```
ERROR: 42703: column profiles.role does not exist
```
**Penyebab:** Migration menggunakan `profiles.role` tapi seharusnya `profiles.is_admin`

### Error 2: Relation does not exist
```
ERROR: 42P01: relation "public.enhancement_prompts" does not exist
```
**Penyebab:** Migration dijalankan dalam urutan yang salah

## ✅ Solusi

### Option 1: Run Single Complete Migration (RECOMMENDED)

Gunakan file migration yang sudah di-fix dan complete:

**File:** `supabase/migrations/20231220000000_enhancement_system_complete.sql`

**Cara Run:**

1. **Via Supabase Dashboard:**
   ```
   1. Buka Supabase Dashboard
   2. Database → SQL Editor → New query
   3. Copy paste isi file: 20231220000000_enhancement_system_complete.sql
   4. Klik Run
   ```

2. **Via Supabase CLI:**
   ```bash
   # Jika sudah ada migration sebelumnya yang error, reset dulu
   supabase db reset
   
   # Atau apply migration baru
   supabase db push
   ```

### Option 2: Run Individual Migrations (Manual)

Jika ingin run satu per satu, **HARUS dalam urutan ini:**

1. ✅ **PERTAMA:** `20231220_create_enhancement_prompts.sql` (sudah di-fix)
2. ✅ **KEDUA:** `20231220_create_classification_system.sql` (sudah di-fix)
3. ❌ **JANGAN RUN:** `20231220_add_classification_mapping.sql` (sudah dihapus, tidak perlu)

## 🔍 Verify Migration Berhasil

Setelah running migration, cek dengan query ini:

```sql
-- 1. Cek table enhancement_prompts
SELECT COUNT(*) FROM enhancement_prompts;
-- Expected: 28 rows (24 specific + 4 general)

-- 2. Cek table image_categories
SELECT COUNT(*) FROM image_categories;
-- Expected: 7 rows

-- 3. Cek table category_enhancements (mappings)
SELECT COUNT(*) FROM category_enhancements;
-- Expected: 50+ rows (tergantung mappings)

-- 4. Cek function works
SELECT * FROM get_enhancements_by_category('clothing');
-- Expected: Return fashion enhancements + general enhancements

-- 5. Cek categories with counts
SELECT * FROM get_categories_with_counts();
-- Expected: Return 7 categories with their enhancement counts
```

## 📊 Expected Results

### Table: enhancement_prompts
```
Total: 28 rows
- Interior: 8
- Exterior: 6
- Fashion: 6
- Furniture: 4
- General: 4
```

### Table: image_categories
```
Total: 7 rows
- clothing
- shoes
- accessories
- interior
- exterior
- furniture
- product
```

### Table: category_enhancements
```
Total: 50+ rows (mappings)
Example:
- clothing → all fashion enhancements + general
- interior → all interior enhancements + general
- etc.
```

## 🐛 Troubleshooting

### Error: "relation already exists"

Jika table sudah ada tapi ada error:

```sql
-- Drop tables (HATI-HATI: Ini akan hapus data!)
DROP TABLE IF EXISTS public.category_enhancements CASCADE;
DROP TABLE IF EXISTS public.image_categories CASCADE;
DROP TABLE IF EXISTS public.enhancement_prompts CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS get_enhancements_by_category(VARCHAR);
DROP FUNCTION IF EXISTS get_categories_with_counts();

-- Kemudian run migration lagi
```

### Error: "policy already exists"

```sql
-- Drop policies
DROP POLICY IF EXISTS "Anyone can view active enhancement prompts" ON public.enhancement_prompts;
DROP POLICY IF EXISTS "Only admins can manage enhancement prompts" ON public.enhancement_prompts;
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.image_categories;
DROP POLICY IF EXISTS "Only admins can manage categories" ON public.image_categories;
DROP POLICY IF EXISTS "Anyone can view category enhancements" ON public.category_enhancements;
DROP POLICY IF EXISTS "Only admins can manage category enhancements" ON public.category_enhancements;

-- Kemudian run migration lagi
```

### Error: "function already exists"

```sql
-- Drop functions
DROP FUNCTION IF EXISTS get_enhancements_by_category(VARCHAR);
DROP FUNCTION IF EXISTS get_categories_with_counts();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Kemudian run migration lagi
```

## ✅ Clean Migration (Start Fresh)

Jika ingin start dari awal yang bersih:

```sql
-- 1. Drop everything
DROP TABLE IF EXISTS public.category_enhancements CASCADE;
DROP TABLE IF EXISTS public.image_categories CASCADE;
DROP TABLE IF EXISTS public.enhancement_prompts CASCADE;
DROP FUNCTION IF EXISTS get_enhancements_by_category(VARCHAR);
DROP FUNCTION IF EXISTS get_categories_with_counts();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 2. Run complete migration
-- Copy paste isi file: 20231220000000_enhancement_system_complete.sql
```

## 📝 What Was Fixed

### Fix #1: Changed `profiles.role` to `profiles.is_admin`

**Before:**
```sql
WHERE profiles.role = 'admin'
```

**After:**
```sql
WHERE profiles.is_admin = true
```

### Fix #2: Combined all migrations into one file

**Before:**
- 3 separate files
- Dependencies not clear
- Easy to run in wrong order

**After:**
- 1 complete file
- All dependencies handled
- Can't run in wrong order

### Fix #3: Added `ON CONFLICT DO NOTHING`

**Before:**
```sql
INSERT INTO enhancement_prompts (...) VALUES (...);
```

**After:**
```sql
INSERT INTO enhancement_prompts (...) VALUES (...)
ON CONFLICT (enhancement_type) DO NOTHING;
```

This prevents errors if you run migration twice.

### Fix #4: Added `IF NOT EXISTS` and `IF EXISTS`

**Before:**
```sql
CREATE TABLE enhancement_prompts (...);
DROP POLICY "policy_name" ON table;
```

**After:**
```sql
CREATE TABLE IF NOT EXISTS enhancement_prompts (...);
DROP POLICY IF EXISTS "policy_name" ON table;
```

This makes migration idempotent (safe to run multiple times).

## 🚀 Next Steps

After successful migration:

1. ✅ Verify data with queries above
2. ✅ Test Admin UI (Admin Panel → Enhancement Prompts)
3. ✅ Test Category Mapping (Admin Panel → Category Mapping)
4. ✅ Test API endpoints
5. ✅ Test frontend integration

## 📞 Support

If you still have issues:
1. Check Supabase logs for detailed error messages
2. Verify your `profiles` table has `is_admin` column
3. Make sure you're running as admin user
4. Contact development team

---

**Status:** ✅ Fixed and Ready  
**Date:** December 20, 2024  
**Migration File:** `20231220000000_enhancement_system_complete.sql`

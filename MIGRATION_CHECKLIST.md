# Migration Checklist - Complete Enhancement System

## Overview

Checklist lengkap untuk menjalankan semua migration yang diperlukan untuk sistem enhancement yang lengkap dengan multiple images dan featured support.

## Migration Files

### 1. ✅ Base Enhancement System (Already Exists)
**File:** `supabase/migrations/20231220000000_enhancement_system_complete.sql`

**What it does:**
- Creates `enhancement_prompts` table
- Creates `image_categories` table
- Creates `category_enhancements` mapping table
- Adds base enhancements (interior, exterior, fashion, furniture, general)
- Creates helper functions

**Status:** ✅ Should already be applied

---

### 2. 🆕 Complete Enhancements (NEW)
**File:** `supabase/migrations/20231221000000_add_complete_enhancements.sql`

**What it does:**
- Adds 68 complete enhancements across all categories
- Food: 24 enhancements
- Fashion: 10 enhancements
- Interior: 12 enhancements
- Exterior: 12 enhancements
- Portrait: 10 enhancements
- General: 10 enhancements

**Run this:** ✅ YES

```bash
# Via Supabase CLI
supabase db push

# Or copy-paste to Supabase SQL Editor
# File: supabase/migrations/20231221000000_add_complete_enhancements.sql
```

---

### 3. 🆕 Multiple Images Support (NEW)
**File:** `RUN_THIS_SQL_COMPLETE_WITH_BASE.sql`

**What it does:**
- Adds columns for multiple images support:
  - `requires_multiple_images`
  - `min_images`
  - `max_images`
  - `multiple_images_description`
- Updates enhancements that need multiple images
- Adds new multiple-image enhancements
- Creates helper functions

**Run this:** ✅ YES

```bash
# Copy-paste to Supabase SQL Editor
# File: RUN_THIS_SQL_COMPLETE_WITH_BASE.sql
```

---

### 4. 🆕 More Enhancements (OPTIONAL)
**File:** `RUN_THIS_SQL_ADD_MORE_ENHANCEMENTS.sql`

**What it does:**
- Adds 85 additional enhancements
- Food: +15 (total 39)
- Fashion: +15 (total 25)
- Interior: +15 (total 27)
- Exterior: +10 (total 22)
- Portrait: +10 (total 20)
- Product: +20 (NEW category!)

**Run this:** ⚠️ OPTIONAL (if you want more variety)

```bash
# Copy-paste to Supabase SQL Editor
# File: RUN_THIS_SQL_ADD_MORE_ENHANCEMENTS.sql
```

---

### 5. 🆕 Featured Enhancements (NEW)
**File:** `supabase/migrations/20231222000000_add_featured_enhancements.sql`

**What it does:**
- Adds `is_featured` column
- Auto-marks enhancements with emoji as featured
- Updates sort order (featured first)
- Updates query functions to sort by featured

**Run this:** ✅ YES

```bash
# Via Supabase CLI
supabase db push

# Or copy-paste to Supabase SQL Editor
# File: supabase/migrations/20231222000000_add_featured_enhancements.sql
```

---

## Recommended Order

### Step 1: Check Existing Migrations
```sql
-- Check if base system exists
SELECT COUNT(*) FROM enhancement_prompts;
-- If returns error, run migration #1 first
-- If returns 0 or small number, continue to step 2
```

### Step 2: Run Complete Enhancements
```bash
# Run migration file #2
supabase db push
# Or copy-paste: 20231221000000_add_complete_enhancements.sql
```

### Step 3: Add Multiple Images Support
```bash
# Copy-paste to SQL Editor
# File: RUN_THIS_SQL_COMPLETE_WITH_BASE.sql
```

### Step 4: (Optional) Add More Enhancements
```bash
# Copy-paste to SQL Editor
# File: RUN_THIS_SQL_ADD_MORE_ENHANCEMENTS.sql
```

### Step 5: Add Featured Support
```bash
# Run migration file #5
supabase db push
# Or copy-paste: 20231222000000_add_featured_enhancements.sql
```

---

## Verification After Each Step

### After Step 2 (Complete Enhancements)
```sql
-- Should show ~68 enhancements
SELECT category, COUNT(*) as total
FROM enhancement_prompts
WHERE is_active = true
GROUP BY category
ORDER BY category;
```

Expected:
```
category  | total
----------|------
exterior  | 12
fashion   | 10
food      | 24
furniture | 4
general   | 10
interior  | 12
portrait  | 10
```

### After Step 3 (Multiple Images)
```sql
-- Should show columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'enhancement_prompts' 
  AND column_name IN ('requires_multiple_images', 'min_images', 'max_images');

-- Should show some enhancements require multiple images
SELECT COUNT(*) 
FROM enhancement_prompts 
WHERE requires_multiple_images = true;
```

Expected: ~10-15 enhancements require multiple images

### After Step 4 (More Enhancements - Optional)
```sql
-- Should show ~153 enhancements
SELECT category, COUNT(*) as total
FROM enhancement_prompts
WHERE is_active = true
GROUP BY category
ORDER BY category;
```

Expected:
```
category  | total
----------|------
exterior  | 22
fashion   | 25
food      | 39
interior  | 27
portrait  | 20
product   | 20  ← NEW!
```

### After Step 5 (Featured)
```sql
-- Should show is_featured column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'enhancement_prompts' 
  AND column_name = 'is_featured';

-- Should show featured enhancements
SELECT category, 
       COUNT(*) as total,
       COUNT(*) FILTER (WHERE is_featured = true) as featured
FROM enhancement_prompts
WHERE is_active = true
GROUP BY category
ORDER BY category;
```

Expected: Each category should have some featured enhancements

---

## Quick Start (Minimal Setup)

If you just want to get started quickly:

```bash
# 1. Run complete enhancements
supabase db push
# (This runs 20231221000000_add_complete_enhancements.sql)

# 2. Add multiple images support
# Copy-paste RUN_THIS_SQL_COMPLETE_WITH_BASE.sql to SQL Editor

# 3. Add featured support
supabase db push
# (This runs 20231222000000_add_featured_enhancements.sql)
```

**Result:** You'll have ~68 enhancements with multiple images and featured support.

---

## Full Setup (Maximum Features)

If you want all features and maximum variety:

```bash
# 1. Run complete enhancements
supabase db push

# 2. Add multiple images support
# Copy-paste RUN_THIS_SQL_COMPLETE_WITH_BASE.sql

# 3. Add more enhancements (85 additional)
# Copy-paste RUN_THIS_SQL_ADD_MORE_ENHANCEMENTS.sql

# 4. Add featured support
supabase db push
```

**Result:** You'll have ~153 enhancements with multiple images and featured support.

---

## Troubleshooting

### Error: Column already exists
```
ERROR: column "is_featured" already exists
```

**Solution:** Column already added, skip that part or use:
```sql
ALTER TABLE enhancement_prompts 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
```

### Error: Function already exists
```
ERROR: function get_enhancements_by_category already exists
```

**Solution:** Use `CREATE OR REPLACE FUNCTION` (already in migration files)

### Error: Duplicate key value
```
ERROR: duplicate key value violates unique constraint
```

**Solution:** Enhancement already exists, use:
```sql
ON CONFLICT (enhancement_type) DO UPDATE SET ...
```

### Check Current State
```sql
-- Check total enhancements
SELECT COUNT(*) FROM enhancement_prompts;

-- Check columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'enhancement_prompts';

-- Check functions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%enhancement%';
```

---

## Summary

### Minimal Setup (Recommended)
- ✅ Migration #2: Complete Enhancements (68 items)
- ✅ SQL File: Multiple Images Support
- ✅ Migration #5: Featured Support

**Total:** ~68 enhancements with all features

### Full Setup (Maximum)
- ✅ Migration #2: Complete Enhancements (68 items)
- ✅ SQL File: Multiple Images Support
- ✅ SQL File: More Enhancements (+85 items)
- ✅ Migration #5: Featured Support

**Total:** ~153 enhancements with all features

---

## Next Steps After Migration

1. ✅ **Test Database**
   ```sql
   SELECT * FROM get_enhancements_by_category('interior') LIMIT 5;
   ```

2. ✅ **Test Frontend**
   - Open any generate page
   - Upload image
   - Check if enhancements load
   - Check if featured appear first
   - Check if multiple images work

3. ✅ **Update Edge Functions** (if needed)
   - Handle `imageUrls` array for multiple images
   - Validate min/max images

4. ✅ **Deploy**
   - Push frontend changes
   - Test in production
   - Monitor for errors

---

**Ready to migrate!** 🚀

Choose your setup (Minimal or Full) and follow the steps above.

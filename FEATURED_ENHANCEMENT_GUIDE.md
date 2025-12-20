# Featured Enhancement Guide

## Overview

Enhancement yang **unggulan/featured** (biasanya yang ada emoji) sekarang akan ditampilkan **paling atas** dalam list, dengan badge "Unggulan" dan styling khusus.

## Database Changes

### New Column: `is_featured`

```sql
ALTER TABLE public.enhancement_prompts 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
```

**Purpose:** Menandai enhancement mana yang unggulan/featured

### Automatic Detection

Enhancement dengan emoji di `display_name` otomatis ditandai sebagai featured:

```sql
UPDATE public.enhancement_prompts
SET is_featured = true
WHERE display_name ~ '[🎨🛋️🌈💡🪟🖼️🌿✨🏠🎭🌸🏛️...]'
  AND is_active = true;
```

### Sort Order Update

Featured enhancements mendapat `sort_order` negatif (ditampilkan lebih dulu):

```sql
-- Featured enhancements: sort_order - 1000
-- Regular enhancements: sort_order tetap positif

-- Example:
-- ✨ Virtual Staging: sort_order = -950 (featured)
-- Regular enhancement: sort_order = 50
```

## Query Changes

### Updated `get_enhancements_by_category()`

Sekarang sort dengan featured first:

```sql
ORDER BY 
  ep.is_featured DESC,  -- Featured first (true > false)
  ce.sort_order ASC,    -- Then by sort order
  ep.display_name ASC;  -- Then alphabetically
```

**Result:**
```
1. 🛋️ Virtual Staging (featured, sort: -950)
2. 🎨 Style Transformation (featured, sort: -949)
3. 🌈 Ubah Color Scheme (featured, sort: -948)
4. Regular Enhancement 1 (not featured, sort: 50)
5. Regular Enhancement 2 (not featured, sort: 51)
```

## Frontend Changes

### EnhancementOptions Component

#### 1. Updated Interface

```typescript
interface EnhancementOption {
  id: string;
  enhancement_type: string;
  display_name: string;
  description?: string;
  is_default?: boolean;
  is_featured?: boolean;  // ← NEW
}
```

#### 2. Featured Badge

Featured enhancements show "Unggulan" badge:

```tsx
{isFeatured && (
  <Badge variant="secondary" className="text-xs">
    <Sparkles className="w-3 h-3 mr-1" />
    Unggulan
  </Badge>
)}
```

#### 3. Special Styling

Featured enhancements have gradient background:

```tsx
className={`
  ${isFeatured
    ? 'border-primary/30 bg-gradient-to-r from-primary/5 to-transparent'
    : 'border-border'
  }
`}
```

## UI Preview

### Before (No Featured):
```
┌─────────────────────────────────┐
│ Regular Enhancement 1           │
├─────────────────────────────────┤
│ Regular Enhancement 2           │
├─────────────────────────────────┤
│ 🛋️ Virtual Staging             │
├─────────────────────────────────┤
│ Regular Enhancement 3           │
└─────────────────────────────────┘
```

### After (With Featured):
```
┌─────────────────────────────────┐
│ 🛋️ Virtual Staging  [✨Unggulan]│ ← Gradient bg
├─────────────────────────────────┤
│ 🎨 Style Transform  [✨Unggulan]│ ← Gradient bg
├─────────────────────────────────┤
│ 🌈 Color Scheme     [✨Unggulan]│ ← Gradient bg
├─────────────────────────────────┤
│ Regular Enhancement 1           │
├─────────────────────────────────┤
│ Regular Enhancement 2           │
└─────────────────────────────────┘
```

## How to Mark Enhancement as Featured

### Method 1: Automatic (By Emoji)

Enhancement dengan emoji otomatis featured:

```sql
-- Run this to auto-detect emoji
UPDATE public.enhancement_prompts
SET is_featured = true
WHERE display_name ~ '[🎨🛋️🌈💡🪟🖼️🌿✨...]'
  AND is_active = true;
```

### Method 2: Manual (Specific Enhancement)

```sql
-- Mark specific enhancement as featured
UPDATE public.enhancement_prompts
SET is_featured = true
WHERE enhancement_type = 'interior_virtual_staging';

-- Mark multiple enhancements
UPDATE public.enhancement_prompts
SET is_featured = true
WHERE enhancement_type IN (
  'interior_virtual_staging',
  'portrait_couple',
  'food_angle_top_down',
  'fashion_female_model'
);
```

### Method 3: By Pattern

```sql
-- Mark enhancements with specific emoji
UPDATE public.enhancement_prompts
SET is_featured = true
WHERE 
  (display_name LIKE '%✨%' OR
   display_name LIKE '%🛋️%' OR
   display_name LIKE '%💡%' OR
   display_name LIKE '%🎨%')
  AND is_active = true;
```

### Method 4: By Category

```sql
-- Mark top 5 enhancements per category as featured
WITH ranked AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY category ORDER BY sort_order) as rank
  FROM public.enhancement_prompts
  WHERE is_active = true
)
UPDATE public.enhancement_prompts ep
SET is_featured = true
FROM ranked r
WHERE ep.id = r.id AND r.rank <= 5;
```

## Unmark Featured

```sql
-- Remove featured status
UPDATE public.enhancement_prompts
SET is_featured = false
WHERE enhancement_type = 'some_enhancement';

-- Remove all featured status
UPDATE public.enhancement_prompts
SET is_featured = false;
```

## Testing

### 1. Check Featured Count

```sql
SELECT 
  category,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_featured = true) as featured_count
FROM public.enhancement_prompts
WHERE is_active = true
GROUP BY category;
```

Expected result:
```
category  | total | featured_count
----------|-------|---------------
food      | 39    | 15
interior  | 27    | 12
exterior  | 22    | 10
fashion   | 25    | 10
portrait  | 20    | 8
```

### 2. Check Sort Order

```sql
-- Featured should appear first
SELECT 
  display_name,
  is_featured,
  sort_order
FROM public.enhancement_prompts
WHERE category = 'interior'
  AND is_active = true
ORDER BY 
  is_featured DESC,
  sort_order ASC
LIMIT 10;
```

Expected result:
```
display_name                    | is_featured | sort_order
--------------------------------|-------------|------------
🛋️ Virtual Staging             | true        | -950
🎨 Style Transformation         | true        | -949
🌈 Ubah Color Scheme            | true        | -948
Regular Enhancement 1           | false       | 50
Regular Enhancement 2           | false       | 51
```

### 3. Test Frontend

1. Open any generate page (Food, Interior, etc.)
2. Upload an image
3. Check enhancement list:
   - ✅ Featured enhancements appear first
   - ✅ Featured enhancements have "Unggulan" badge
   - ✅ Featured enhancements have gradient background
   - ✅ Regular enhancements appear after featured

## Migration Steps

### 1. Run SQL Migration

```bash
# Run the featured sort SQL
psql -d your_database < RUN_THIS_SQL_FEATURED_SORT.sql

# Or copy-paste to Supabase SQL Editor
```

### 2. Verify Database

```sql
-- Check if is_featured column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'enhancement_prompts' 
  AND column_name = 'is_featured';

-- Check featured count
SELECT COUNT(*) FROM enhancement_prompts WHERE is_featured = true;
```

### 3. Test Frontend

- ✅ EnhancementOptions.tsx already updated
- ✅ Interface includes `is_featured` field
- ✅ Badge and styling applied
- Test in browser

### 4. Adjust Featured List (Optional)

If you want to manually adjust which enhancements are featured:

```sql
-- Add more featured
UPDATE public.enhancement_prompts
SET is_featured = true
WHERE enhancement_type IN ('list', 'of', 'types');

-- Remove some featured
UPDATE public.enhancement_prompts
SET is_featured = false
WHERE enhancement_type IN ('list', 'of', 'types');
```

## Best Practices

### 1. Don't Over-Feature

Keep featured enhancements to **top 30-40%** of each category:
- ✅ 10-15 featured out of 30 total
- ❌ 25 featured out of 30 total (too many)

### 2. Feature Popular Ones

Mark as featured:
- ✅ Most commonly used enhancements
- ✅ New/special features
- ✅ High-quality results
- ✅ Enhancements with emoji (visual appeal)

### 3. Update Regularly

Review and update featured list:
- Monthly: Check usage statistics
- Add new popular enhancements
- Remove less-used featured ones

### 4. Consistent Across Categories

Try to have similar number of featured per category:
- Food: ~12-15 featured
- Interior: ~10-12 featured
- Exterior: ~8-10 featured
- Fashion: ~8-10 featured
- Portrait: ~8-10 featured

## Summary

✅ **Database:** Added `is_featured` column
✅ **Auto-detection:** Emoji-based automatic marking
✅ **Sorting:** Featured appear first
✅ **Frontend:** Badge and special styling
✅ **Query:** Updated to sort by featured first

**Result:** Enhancement unggulan dengan emoji sekarang tampil paling atas dengan badge "Unggulan" dan styling khusus! ✨

---

**Questions?** Check RUN_THIS_SQL_FEATURED_SORT.sql for complete SQL commands.

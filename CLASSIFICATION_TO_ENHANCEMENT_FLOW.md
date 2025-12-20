# Classification to Enhancement Flow

## 📊 System Architecture

```
┌─────────────────┐
│  Upload Image   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Classify      │ ──► Returns: "clothing", "interior", "exterior", etc.
│     Image       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Query DB for   │ ──► SELECT * FROM get_enhancements_by_category('clothing')
│  Enhancements   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Show Options   │ ──► User selects: "casual_chic", "business_formal", etc.
│   to User       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Query Prompt   │ ──► SELECT prompt_template FROM enhancement_prompts
│   from DB       │     WHERE enhancement_type = 'casual_chic'
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Generate      │ ──► Send prompt to AI API
│     Image       │
└─────────────────┘
```

## 🗄️ Database Structure

### 1. image_categories
Kategori gambar hasil klasifikasi

```sql
id                  UUID
category_code       VARCHAR   -- 'clothing', 'interior', 'exterior', etc.
category_name       VARCHAR   -- 'Clothing & Fashion'
description         TEXT
icon                VARCHAR   -- '👕'
is_active           BOOLEAN
sort_order          INTEGER
```

**Data:**
- clothing (👕)
- shoes (👟)
- accessories (👜)
- interior (🏠)
- exterior (🏛️)
- furniture (🪑)
- product (📦)

### 2. enhancement_prompts
Template prompt untuk AI

```sql
id                  UUID
enhancement_type    VARCHAR   -- 'casual_chic', 'modern_minimalist', etc.
display_name        VARCHAR   -- 'Casual Chic'
prompt_template     TEXT      -- AI prompt
description         TEXT
category            VARCHAR   -- 'fashion', 'interior', etc.
is_active           BOOLEAN
sort_order          INTEGER
```

### 3. category_enhancements (Mapping Table)
Relasi many-to-many antara categories dan enhancements

```sql
id                  UUID
category_id         UUID      -- FK to image_categories
enhancement_id      UUID      -- FK to enhancement_prompts
is_default          BOOLEAN
sort_order          INTEGER
```

## 🔄 Flow Detail

### Step 1: Classify Image

```typescript
// Frontend calls classify function
const { data } = await supabase.functions.invoke('classify-image', {
  body: { imageUrl }
});

// Returns: { classification: 'clothing', confidence: 0.95 }
```

### Step 2: Get Enhancement Options

```typescript
// Query enhancements for this category
import { getEnhancementsByCategory } from '@/lib/enhancementPrompts';

const enhancements = await getEnhancementsByCategory('clothing');

// Returns:
// [
//   { id: '...', type: 'casual_chic', title: 'Casual Chic', ... },
//   { id: '...', type: 'business_formal', title: 'Business Formal', ... },
//   ...
// ]
```

### Step 3: User Selects Enhancement

```typescript
// User clicks on "Casual Chic"
const selectedEnhancement = 'casual_chic';
```

### Step 4: Generate with Prompt from DB

```typescript
// Backend automatically queries prompt from DB
const { data } = await supabase.functions.invoke('generate-enhanced-image', {
  body: {
    imageUrl,
    enhancement: selectedEnhancement, // 'casual_chic'
    classification: 'clothing'
  }
});

// Backend does:
// 1. Query: SELECT prompt_template FROM enhancement_prompts 
//           WHERE enhancement_type = 'casual_chic'
// 2. Use prompt_template for AI generation
// 3. Return generated image
```

## 🎯 Key Functions

### Database Functions

#### get_enhancements_by_category(category_code)
Returns all enhancements for a specific category

```sql
SELECT * FROM get_enhancements_by_category('clothing');
```

Returns:
```
enhancement_id | enhancement_type | display_name    | prompt_template | ...
---------------|------------------|-----------------|-----------------|----
uuid-1         | casual_chic      | Casual Chic     | Transform...    | ...
uuid-2         | business_formal  | Business Formal | Redesign...     | ...
```

#### get_categories_with_counts()
Returns all categories with enhancement counts

```sql
SELECT * FROM get_categories_with_counts();
```

Returns:
```
category_code | category_name        | enhancement_count
--------------|----------------------|------------------
clothing      | Clothing & Fashion   | 6
interior      | Interior Design      | 8
exterior      | Exterior & Arch.     | 6
```

### Frontend Functions

```typescript
// Get all categories
const categories = await getImageCategories();

// Get enhancements for category
const enhancements = await getEnhancementsByCategory('clothing');

// Get single prompt
const prompt = await getEnhancementPrompt('casual_chic');
```

## 🔧 Admin Management

### 1. Manage Enhancement Prompts
**Admin Panel → Enhancement Prompts**

- Create/Edit/Delete prompts
- Set category (fashion, interior, etc.)
- Write prompt templates
- Toggle active/inactive

### 2. Map Categories to Enhancements
**Admin Panel → Category Mapping**

- Select category (e.g., "Clothing")
- Check/uncheck enhancements
- Enhancements will appear for that category

Example:
```
Category: Clothing (👕)
✅ Casual Chic
✅ Business Formal
✅ Streetwear
✅ Elegant Evening
❌ Modern Minimalist (interior only)
❌ Scandinavian (interior only)
```

## 📝 Example Usage

### Complete Flow Example

```typescript
// 1. User uploads image
const imageFile = ...;

// 2. Classify image
const { data: classifyResult } = await supabase.functions.invoke('classify-image', {
  body: { imageUrl: uploadedUrl }
});
// Result: { classification: 'clothing' }

// 3. Get enhancement options for 'clothing'
const enhancements = await getEnhancementsByCategory('clothing');
// Result: [
//   { type: 'casual_chic', title: 'Casual Chic' },
//   { type: 'business_formal', title: 'Business Formal' },
//   ...
// ]

// 4. Show options to user, user selects 'casual_chic'

// 5. Generate image
const { data: generated } = await supabase.functions.invoke('generate-enhanced-image', {
  body: {
    imageUrl: uploadedUrl,
    enhancement: 'casual_chic',
    classification: 'clothing'
  }
});
// Backend queries prompt from DB and generates image
```

## 🎨 Benefits

### Before (Hardcoded)
```typescript
// ❌ Hardcoded mapping
if (classification === 'clothing') {
  options = ['casual_chic', 'business_formal', ...];
}
```

### After (Database-driven)
```typescript
// ✅ Dynamic from database
const options = await getEnhancementsByCategory(classification);
```

**Advantages:**
1. ✅ Admin can add/remove enhancements without code changes
2. ✅ Easy to map new categories
3. ✅ Flexible and maintainable
4. ✅ No deploy needed for changes
5. ✅ Centralized management

## 🚀 Migration Steps

### 1. Run Migrations

```bash
# Run in order:
1. 20231220_create_enhancement_prompts.sql
2. 20231220_create_classification_system.sql
```

### 2. Verify Data

```sql
-- Check categories
SELECT * FROM image_categories;
-- Should have 7 categories

-- Check mappings
SELECT 
  ic.category_name,
  COUNT(ce.id) as enhancement_count
FROM image_categories ic
LEFT JOIN category_enhancements ce ON ic.id = ce.category_id
GROUP BY ic.category_name;
```

### 3. Test Flow

1. Upload image → Classify
2. Check enhancements returned
3. Select enhancement → Generate
4. Verify prompt used from database

## 📞 Support

For questions or issues, refer to:
- `ENHANCEMENT_PROMPTS_SYSTEM.md` - Complete system docs
- `ENHANCEMENT_PROMPTS_QUICK_START.md` - Quick start guide

---

**Version:** 1.0.0  
**Date:** December 20, 2024  
**Status:** Production Ready 🚀

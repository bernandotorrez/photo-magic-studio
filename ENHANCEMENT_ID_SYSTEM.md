# Enhancement ID System - Solusi Mapping yang Lebih Baik

## Masalah Sebelumnya

Sistem lama menggunakan **mapping manual** yang ribet:
1. Frontend mapping manual `enhanceType` → text display name
2. Backend mapping manual text → `enhancement_type` → query database
3. Banyak hardcoded mapping yang harus di-maintain di 2 tempat

## Solusi Baru: ID-Based System

Sistem baru menggunakan **ID langsung dari database**:

```
Frontend → Enhancement ID → Backend → Query by ID → Prompt Template
```

### Alur Kerja

#### 1. API Classify (Backend)
**File:** `supabase/functions/classify-food/index.ts`

```typescript
// Query enhancements dari database
const { data: enhancements } = await supabase
  .rpc('get_enhancements_by_category', { p_category_code: 'food' });

// Return dengan ID
const enhancementOptions = enhancements.map((enh) => ({
  id: enh.enhancement_id,              // UUID dari database
  enhancement_type: enh.enhancement_type,
  display_name: enh.display_name,      // Untuk ditampilkan di UI
  description: enh.description,
  is_default: enh.is_default,
}));
```

**Response:**
```json
{
  "classification": "food",
  "enhancementOptions": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "enhancement_type": "food_angle_top_down",
      "display_name": "📐 Top-Down View (Flat Lay)",
      "description": "Foto dari atas dengan sudut 90 derajat",
      "is_default": false
    },
    ...
  ]
}
```

#### 2. Frontend (React)
**File:** `src/components/dashboard/EnhancementOptions.tsx`

```typescript
// Terima enhancement options (support both format)
interface EnhancementOption {
  id: string;
  enhancement_type: string;
  display_name: string;
  description?: string;
}

// User pilih enhancement → simpan ID nya
const selectedEnhancements = ['123e4567-e89b-12d3-a456-426614174000', ...];

// Kirim ke backend
const { data } = await supabase.functions.invoke('generate-enhanced-image', {
  body: {
    enhancementIds: selectedEnhancements,  // Kirim array of IDs
    ...
  }
});
```

#### 3. API Generate (Backend)
**File:** `supabase/functions/generate-enhanced-image/index.ts`

```typescript
// Terima enhancement IDs
const { enhancementIds } = await req.json();

// Query langsung by ID - TIDAK PERLU MAPPING!
for (const enhId of enhancementIds) {
  const { data: promptData } = await supabase
    .from('enhancement_prompts')
    .select('display_name, prompt_template')
    .eq('id', enhId)
    .eq('is_active', true)
    .maybeSingle();
  
  if (promptData) {
    prompts.push(promptData.prompt_template);
  }
}
```

## Keuntungan

### ✅ Tidak Ada Mapping Manual
- Tidak perlu hardcode mapping `display_name` → `enhancement_type`
- Tidak perlu maintain mapping di 2 tempat (frontend & backend)

### ✅ Single Source of Truth
- Semua data enhancement ada di database
- Update di database langsung apply ke semua

### ✅ Lebih Mudah Maintain
- Tambah enhancement baru? Tinggal insert ke database
- Edit prompt? Tinggal update di database
- Tidak perlu deploy ulang code

### ✅ Backward Compatible
- Sistem masih support format lama (string array)
- Migrasi bertahap tanpa breaking changes

## Database Structure

### Table: `enhancement_prompts`
```sql
CREATE TABLE enhancement_prompts (
  id UUID PRIMARY KEY,
  enhancement_type VARCHAR UNIQUE,
  display_name VARCHAR,
  description TEXT,
  prompt_template TEXT,
  category VARCHAR,
  is_active BOOLEAN
);
```

### Table: `category_enhancements`
```sql
CREATE TABLE category_enhancements (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES image_categories(id),
  enhancement_id UUID REFERENCES enhancement_prompts(id),
  is_default BOOLEAN,
  sort_order INTEGER
);
```

### Function: `get_enhancements_by_category`
```sql
CREATE FUNCTION get_enhancements_by_category(p_category_code VARCHAR)
RETURNS TABLE (
  enhancement_id UUID,
  enhancement_type VARCHAR,
  display_name VARCHAR,
  description TEXT,
  prompt_template TEXT,
  category VARCHAR,
  is_default BOOLEAN,
  sort_order INTEGER
)
```

## Migration Guide

### Untuk Classify Functions Lain

Update semua classify functions (interior, exterior, fashion, dll):

```typescript
// OLD WAY ❌
const ENHANCEMENT_OPTIONS = [
  '🛋️ Virtual Staging',
  '🎨 Style Transformation',
  ...
];

return { classification: 'interior', enhancementOptions: ENHANCEMENT_OPTIONS };

// NEW WAY ✅
const { data: enhancements } = await supabase
  .rpc('get_enhancements_by_category', { p_category_code: 'interior' });

const enhancementOptions = enhancements.map((enh) => ({
  id: enh.enhancement_id,
  enhancement_type: enh.enhancement_type,
  display_name: enh.display_name,
  description: enh.description,
  is_default: enh.is_default,
}));

return { classification: 'interior', enhancementOptions };
```

### Untuk Pages Lain

Update type definition di pages:

```typescript
// OLD ❌
const [enhancementOptions, setEnhancementOptions] = useState<string[]>([]);

// NEW ✅
const [enhancementOptions, setEnhancementOptions] = useState<any[]>([]);
```

## Testing

### 1. Test Classify API
```bash
curl -X POST https://your-project.supabase.co/functions/v1/classify-food \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://example.com/food.jpg"}'
```

Expected response:
```json
{
  "classification": "food",
  "enhancementOptions": [
    {
      "id": "uuid-here",
      "enhancement_type": "food_angle_top_down",
      "display_name": "📐 Top-Down View (Flat Lay)",
      ...
    }
  ]
}
```

### 2. Test Generate API
```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-enhanced-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "originalImagePath": "path/to/image.jpg",
    "classification": "food",
    "enhancementIds": ["uuid-1", "uuid-2"]
  }'
```

## Checklist

- [x] Update `classify-food` function
- [x] Update `classify-interior` function
- [x] Update `classify-exterior` function
- [x] Update `classify-portrait` function
- [x] Update `classify-fashion` function (with AI detection)
- [x] Update `classify-image` function (general/fallback with AI detection)
- [x] Update `generate-enhanced-image` function
- [x] Update `api-generate` function (external API endpoint - uses display_name)
- [x] Update `EnhancementOptions` component
- [x] Update `ImageUploader` component
- [x] Update `FoodEnhancement` page
- [x] Update `InteriorDesign` page
- [x] Update `ExteriorDesign` page
- [x] Update `AiPhotographer` page
- [x] Update `Dashboard` page
- [x] Update `DashboardNew` page
- [x] Verify token deduction prioritizes subscription tokens first
- [ ] Test end-to-end flow for each category
- [ ] Deploy all functions to production

## Next Steps

1. **Deploy classify-food function**
   ```bash
   supabase functions deploy classify-food
   ```

2. **Deploy generate-enhanced-image function**
   ```bash
   supabase functions deploy generate-enhanced-image
   ```

3. **Test di production**
   - Upload food image
   - Verify enhancement options show with descriptions
   - Select multiple enhancements
   - Generate and verify result

4. **Migrate other categories**
   - Apply same pattern to interior, exterior, fashion
   - Update all classify functions
   - Update all pages

## Troubleshooting

### Enhancement options tidak muncul
- Check database: `SELECT * FROM enhancement_prompts WHERE category = 'food' AND is_active = true`
- Check function: `SELECT * FROM get_enhancements_by_category('food')`
- Check logs: Supabase Functions logs

### Generate gagal dengan "Enhancement ID not found"
- Verify ID is valid UUID
- Check enhancement is active: `SELECT * FROM enhancement_prompts WHERE id = 'your-uuid'`
- Check logs for query errors

### Legacy format masih digunakan
- Normal! Sistem support both formats
- Frontend akan detect format otomatis
- Backend handle both ID dan string

---

**Kesimpulan:** Sistem baru jauh lebih clean, maintainable, dan scalable. Tidak ada lagi mapping manual yang ribet! 🎉

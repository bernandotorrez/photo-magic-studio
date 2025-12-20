# API Generate - External API Documentation

## Overview

`api-generate` adalah endpoint untuk external users yang menggunakan API key. 

**Important:** External API menggunakan **display_name** (string) untuk enhancement, BUKAN enhancement ID. Ini lebih user-friendly dan tidak expose internal database structure.

## How It Works

### For External API Users (via API Key)

**Use display_name (string):**
```json
{
  "imageUrl": "https://example.com/product.jpg",
  "enhancement": "📐 Top-Down View (Flat Lay)",  // ✅ Display name
  "classification": "food"
}
```

**Backend Query Logic:**
1. Query by `display_name` first (primary)
2. Fallback to `enhancement_type` if not found
3. Ultimate fallback to simple prompt

```typescript
// Query by display_name
const { data } = await supabase
  .from('enhancement_prompts')
  .select('*')
  .eq('display_name', enhancement)  // User-friendly string
  .eq('is_active', true);
```

### For Internal Frontend (via Supabase Auth)

**Use enhancement ID (UUID):**
```typescript
// Frontend sends IDs
await supabase.functions.invoke('generate-enhanced-image', {
  body: { 
    enhancementIds: ['uuid-123', 'uuid-456']  // ✅ Internal IDs
  }
});
```

## Why Different Approaches?

### External API (Display Name)
✅ **User-friendly** - Easy to read and understand  
✅ **Stable** - Display names rarely change  
✅ **No exposure** - Don't expose internal database IDs  
✅ **Self-documenting** - Clear what each enhancement does  

### Internal Frontend (Enhancement ID)
✅ **Performance** - Direct ID lookup is faster  
✅ **Flexibility** - Can change display names without breaking  
✅ **Type-safe** - UUIDs are unique and validated  
✅ **Relational** - Proper foreign key relationships  

## API Request Format

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `imageUrl` | string | Yes | URL of the image to enhance |
| `enhancement` | string | Yes | **Display name** of enhancement (e.g., "📐 Top-Down View (Flat Lay)") |
| `classification` | string | No | Image category (food, fashion, interior, etc) |
| `watermark` | object | No | Watermark configuration |
| `customPose` | string | No | Custom pose description |
| `customFurniture` | string | No | Custom furniture items |

### Example Requests

#### Food Enhancement
```bash
curl -X POST https://your-project.supabase.co/functions/v1/api-generate \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/food.jpg",
    "enhancement": "📐 Top-Down View (Flat Lay)",
    "classification": "food"
  }'
```

#### Fashion Enhancement
```bash
curl -X POST https://your-project.supabase.co/functions/v1/api-generate \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/dress.jpg",
    "enhancement": "👗 Dipakai oleh Model Wanita",
    "classification": "fashion"
  }'
```

#### Interior Enhancement
```bash
curl -X POST https://your-project.supabase.co/functions/v1/api-generate \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/room.jpg",
    "enhancement": "🛋️ Virtual Staging (Tambah Furniture)",
    "classification": "interior",
    "customFurniture": "sofa, coffee table, floor lamp"
  }'
```

## Getting Available Enhancements

External users can query available enhancements for each category:

### Via SQL (if you have database access)
```sql
SELECT 
  ep.display_name,
  ep.description,
  ic.category_code
FROM enhancement_prompts ep
JOIN category_enhancements ce ON ep.id = ce.enhancement_id
JOIN image_categories ic ON ce.category_id = ic.id
WHERE ep.is_active = true
  AND ic.category_code = 'food'
ORDER BY ce.sort_order;
```

### Via Supabase REST API
```bash
curl -X POST https://your-project.supabase.co/rest/v1/rpc/get_enhancements_by_category \
  -H "apikey: your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"p_category_code": "food"}'
```

Response:
```json
[
  {
    "enhancement_id": "uuid-123",
    "enhancement_type": "food_angle_top_down",
    "display_name": "📐 Top-Down View (Flat Lay)",
    "description": "Foto dari atas dengan sudut 90 derajat",
    "category": "food",
    "is_default": false,
    "sort_order": 1
  },
  ...
]
```

**Use the `display_name` field in your API requests!**

## Available Enhancement Display Names

### Food Category
- `📐 Top-Down View (Flat Lay)`
- `📐 45-Degree Angle`
- `📐 Extreme Close-Up`
- `🥕 Tampilkan Bahan-Bahan`
- `🥕 Bahan Melayang (Floating)`
- `🎨 Banner Promosi`
- `🎨 Banner Menu Restoran`
- `🎨 Banner Delivery App`
- `🍴 Plating Mewah`
- `🍴 Plating Rustic/Homey`
- `🍴 Tambah Props & Dekorasi`
- `💡 Natural Light`
- `💡 Dramatic Lighting`
- `💡 Warm & Cozy`
- `✨ Tambah Efek Uap/Steam`
- `✨ Sauce Drip/Pour Effect`
- `✨ Warna Lebih Vibrant`
- `✨ Blur Background (Bokeh)`
- `🌳 Complete Table Setting`
- `🌳 Outdoor/Picnic Style`
- `🌳 Restaurant Ambiance`
- `🎯 Adjust Portion Size`
- `🎯 Enhance Garnish`
- `🎯 Enhance Texture`

### Fashion Category
- `👗 Dipakai oleh Model Wanita`
- `🧕 Dipakai oleh Model Wanita Berhijab`
- `👔 Dipakai oleh Model Pria`
- `📸 Foto Lifestyle dengan Model`
- `🎭 Ditampilkan pada Manekin`
- `🔎 Foto Close-up Detail`
- `🎨 Buat Varian Warna`
- `✨ Ubah Material/Tekstur`
- `🔄 Generate 360° View`
- `📏 Tampilkan Size Comparison`

### Interior Category
- `🛋️ Virtual Staging (Tambah Furniture)`
- `🎨 Style Transformation (Modern/Minimalist/Classic)`
- `🌈 Ubah Color Scheme`
- `💡 Lighting Enhancement`
- `🪟 Ubah Wallpaper/Cat Dinding`
- `🖼️ Tambah Dekorasi & Artwork`
- `🌿 Tambah Tanaman Hias`
- `✨ Luxury Interior Upgrade`
- `🏠 Scandinavian Style`
- `🎭 Industrial Style`
- `🌸 Bohemian Style`
- `🏛️ Classic/Traditional Style`

### Exterior Category
- `🏠 Facade Renovation (Ubah Tampilan Depan)`
- `🌳 Landscaping Enhancement (Taman & Tanaman)`
- `🌅 Ubah Waktu (Day/Night/Golden Hour)`
- `⛅ Ubah Cuaca (Sunny/Cloudy/Rainy)`
- `🎨 Ubah Warna Cat Eksterior`
- `🪟 Upgrade Jendela & Pintu`
- `💡 Tambah Outdoor Lighting`
- `🏊 Tambah Pool/Water Feature`
- `🚗 Tambah Driveway & Parking`
- `🌺 Tambah Garden & Flowers`
- `🏗️ Modern Architecture Style`
- `🏛️ Classic Architecture Style`

### Portrait Category
- `🎨 Virtual Outfit Change (Ganti Baju)`
- `💃 Ubah Pose (Pose Variation)`
- `🌆 Ganti Background`
- `📸 Professional Portrait Enhancement`
- `✨ Beauty Enhancement (Smooth Skin)`
- `🎭 Ubah Ekspresi Wajah`
- `💼 Business Portrait Style`
- `🌟 Fashion Editorial Style`
- `🎬 Cinematic Look`
- `🖼️ Studio Portrait dengan Lighting Profesional`

## Response Format

### Success Response
```json
{
  "success": true,
  "generatedImageUrl": "https://your-project.supabase.co/storage/v1/object/sign/generated-images/...",
  "prompt": "The actual prompt used for generation",
  "taskId": "kie-ai-task-id"
}
```

### Error Responses

#### Invalid Enhancement Name
```json
{
  "error": "Enhancement not found in database, using fallback prompt"
}
```
Note: This won't fail the request, just uses a generic prompt.

#### Missing Parameters
```json
{
  "error": "enhancement is required"
}
```
Status: 400

## Best Practices for External API Users

### 1. Cache Enhancement Names
Store the display names in your application:

```javascript
const FOOD_ENHANCEMENTS = {
  TOP_DOWN: '📐 Top-Down View (Flat Lay)',
  ANGLE_45: '📐 45-Degree Angle',
  CLOSE_UP: '📐 Extreme Close-Up',
  // ... more
};

// Use in API call
const response = await fetch(apiUrl, {
  body: JSON.stringify({
    imageUrl: imageUrl,
    enhancement: FOOD_ENHANCEMENTS.TOP_DOWN
  })
});
```

### 2. Handle Fallback Gracefully
If enhancement name not found, API will use fallback prompt:

```javascript
// Even if enhancement name is wrong, API will still work
const response = await fetch(apiUrl, {
  body: JSON.stringify({
    imageUrl: imageUrl,
    enhancement: 'Some Random Enhancement',  // Will use fallback
    classification: 'food'
  })
});
```

### 3. Query Available Enhancements Periodically
Refresh your enhancement list periodically to get new options:

```javascript
// Query once per day or on app startup
async function refreshEnhancements() {
  const response = await fetch(
    'https://your-project.supabase.co/rest/v1/rpc/get_enhancements_by_category',
    {
      method: 'POST',
      headers: {
        'apikey': 'your-anon-key',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ p_category_code: 'food' })
    }
  );
  
  const enhancements = await response.json();
  
  // Store display_name values
  const displayNames = enhancements.map(e => e.display_name);
  localStorage.setItem('food_enhancements', JSON.stringify(displayNames));
}
```

## Monitoring & Debugging

### Check if Enhancement Exists
```sql
SELECT 
  display_name,
  enhancement_type,
  description,
  is_active
FROM enhancement_prompts
WHERE display_name = '📐 Top-Down View (Flat Lay)';
```

### View Recent API Generations
```sql
SELECT 
  created_at,
  user_email,
  enhancement_type,
  classification_result,
  original_image_path
FROM generation_history
WHERE original_image_path = 'api-upload'
ORDER BY created_at DESC
LIMIT 20;
```

### Check Most Popular Enhancements
```sql
SELECT 
  enhancement_type,
  COUNT(*) as usage_count
FROM generation_history
WHERE original_image_path = 'api-upload'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY enhancement_type
ORDER BY usage_count DESC;
```

## Summary

✅ **External API uses display_name (string)**
- User-friendly and self-documenting
- No internal IDs exposed
- Query by display_name → fallback to enhancement_type

✅ **Internal Frontend uses enhancement ID (UUID)**
- Better performance with direct ID lookup
- Type-safe and relational
- Flexible for future changes

✅ **Both approaches work seamlessly**
- External users get simple string-based API
- Internal frontend gets optimized ID-based system
- Backend handles both transparently

---

**Recommendation for External API Users:** Use the exact display_name strings from the enhancement list. They include emojis and are designed to be descriptive and easy to understand.

## Token Deduction

Token deduction menggunakan function yang benar dengan proper logging:

```typescript
// Deduct tokens using dual token system (subscription tokens first)
const { data: deductResult } = await supabase.rpc('deduct_user_tokens', {
  p_user_id: userId,
  p_amount: 1
});

// With proper logging
if (deductResult && deductResult[0].success) {
  console.log('✅ Token deducted:', {
    subscription_used: deductResult[0].subscription_used,
    purchased_used: deductResult[0].purchased_used,
    remaining_subscription: deductResult[0].remaining_subscription,
    remaining_purchased: deductResult[0].remaining_purchased
  });
}
```

## Testing

### Test with Display Name

```bash
# Use display name directly
curl -X POST https://your-project.supabase.co/functions/v1/api-generate \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/food.jpg",
    "enhancement": "📐 Top-Down View (Flat Lay)"
  }'
```

Should work perfectly!

## Monitoring

### Check Token Deduction

```sql
-- View recent API generations
SELECT 
  gh.created_at,
  gh.user_email,
  gh.enhancement_type,
  p.subscription_tokens,
  p.purchased_tokens
FROM generation_history gh
JOIN profiles p ON gh.user_id = p.user_id
WHERE gh.original_image_path = 'api-upload'
ORDER BY gh.created_at DESC
LIMIT 20;
```

### Check Enhancement Usage

```sql
-- Most popular enhancements via API
SELECT 
  enhancement_type,
  COUNT(*) as usage_count
FROM generation_history
WHERE original_image_path = 'api-upload'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY enhancement_type
ORDER BY usage_count DESC;
```

## Summary

✅ **api-generate for external API:**
- Uses display_name (user-friendly string)
- Query by display_name → fallback to enhancement_type
- No internal IDs exposed to external users
- Simple and self-documenting

✅ **generate-enhanced-image for internal frontend:**
- Uses enhancement IDs (UUID)
- Better performance with direct ID lookup
- Type-safe and relational
- Flexible for future changes

✅ **Best of both worlds:**
- External users get simple string-based API
- Internal frontend gets optimized ID-based system
- Both approaches work seamlessly

---

**Recommendation:** External API users should use display_name strings (with emojis) as shown in the documentation. They're descriptive, stable, and easy to use.

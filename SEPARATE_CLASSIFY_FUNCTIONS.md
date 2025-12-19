# Separate Classify Functions per Category

## Overview

Sistem sekarang menggunakan edge functions terpisah untuk setiap kategori, membuat kode lebih clean, mudah maintain, dan menghindari confusion.

---

## Edge Functions Created

### 1. classify-fashion
**Path:** `supabase/functions/classify-fashion/index.ts`
**Used by:** Fashion & Product page (`/dashboard`)
**Classification:** `fashion`

**Enhancement Options:**
- Model enhancements (Wanita/Wanita Berhijab/Pria)
- Mannequin display
- Close-up shots
- Body part placement
- 360° view
- Color variants
- Material/texture change
- Size comparison
- Base enhancements

---

### 2. classify-portrait
**Path:** `supabase/functions/classify-portrait/index.ts`
**Used by:** AI Photographer page (`/ai-photographer`)
**Classification:** `portrait`

**Enhancement Options:**
- 🎨 Virtual Outfit Change
- 💃 Pose Variation
- 🌆 Background Change
- 📸 Professional Portrait Enhancement
- ✨ Beauty Enhancement
- 🎭 Expression Change
- 💼 Business Portrait Style
- 🌟 Fashion Editorial Style
- 🎬 Cinematic Look
- 🖼️ Studio Portrait with Professional Lighting
- Base enhancements

---

### 3. classify-interior
**Path:** `supabase/functions/classify-interior/index.ts`
**Used by:** Interior Design page (`/interior-design`)
**Classification:** `interior`

**Enhancement Options:**
- 🛋️ Virtual Staging
- 🎨 Style Transformation
- 🌈 Color Scheme Change
- 💡 Lighting Enhancement
- 🪟 Wallpaper/Paint Change
- 🖼️ Decoration & Artwork
- 🌿 Indoor Plants
- ✨ Luxury Upgrade
- 🏠 Scandinavian Style
- 🎭 Industrial Style
- 🌸 Bohemian Style
- 🏛️ Classic/Traditional Style
- Base enhancements

---

### 4. classify-exterior
**Path:** `supabase/functions/classify-exterior/index.ts`
**Used by:** Exterior Design page (`/exterior-design`)
**Classification:** `exterior`

**Enhancement Options:**
- 🏠 Facade Renovation
- 🌳 Landscaping Enhancement
- 🌅 Time of Day Change
- ⛅ Weather Change
- 🎨 Exterior Paint Color
- 🪟 Windows & Doors Upgrade
- 💡 Outdoor Lighting
- 🏊 Pool/Water Feature
- 🚗 Driveway & Parking
- 🌺 Garden & Flowers
- 🏗️ Modern Architecture Style
- 🏛️ Classic Architecture Style
- Base enhancements

---

## Implementation

### ImageUploader Component

Added `classifyFunction` prop:

```typescript
interface ImageUploaderProps {
  onImageUploaded: (url: string, path: string, classification: string, options: string[]) => void;
  profile: Profile | null;
  classifyFunction?: string; // Edge function name
}

export function ImageUploader({ 
  onImageUploaded, 
  profile, 
  classifyFunction = 'classify-image' // Default fallback
}: ImageUploaderProps) {
  // ...
  
  // Use specified classify function
  const { data, error } = await supabase.functions.invoke(classifyFunction, {
    body: { imageUrl: signedUrlData.signedUrl },
  });
}
```

### Page Usage

#### Fashion & Product
```typescript
<ImageUploader
  onImageUploaded={handleImageUploaded}
  profile={profile}
  classifyFunction="classify-fashion"
/>
```

#### AI Photographer
```typescript
<ImageUploader
  onImageUploaded={handleImageUploaded}
  profile={profile}
  classifyFunction="classify-portrait"
/>
```

#### Interior Design
```typescript
<ImageUploader
  onImageUploaded={handleImageUploaded}
  profile={profile}
  classifyFunction="classify-interior"
/>
```

#### Exterior Design
```typescript
<ImageUploader
  onImageUploaded={handleImageUploaded}
  profile={profile}
  classifyFunction="classify-exterior"
/>
```

---

## Benefits

### 1. Clean Separation
✅ Each category has its own function
✅ No complex if/else logic
✅ Easy to understand and maintain

### 2. Easy Maintenance
✅ Update one category without affecting others
✅ Add new enhancements per category easily
✅ Clear responsibility per function

### 3. Better Performance
✅ No unnecessary classification logic
✅ Direct return of relevant options
✅ Faster response time

### 4. Scalability
✅ Easy to add new categories
✅ Easy to customize per category
✅ Independent deployment

### 5. Debugging
✅ Clear logs per category
✅ Easy to trace issues
✅ Isolated testing

---

## Migration from Old System

### Before (classify-image)
```typescript
// One function for all categories
// Complex logic with multiple if/else
// Hard to maintain

if (category === 'person') {
  // AI Photographer options
} else if (category === 'interior') {
  // Interior options
} else if (category === 'exterior') {
  // Exterior options
} else {
  // Fashion options
}
```

### After (Separate Functions)
```typescript
// classify-portrait: Only portrait options
// classify-interior: Only interior options
// classify-exterior: Only exterior options
// classify-fashion: Only fashion options

// Simple, direct, clean
const enhancementOptions = [
  ...CATEGORY_SPECIFIC_OPTIONS,
  ...BASE_ENHANCEMENTS,
];
```

---

## Testing

### Test Each Function

#### classify-fashion
```bash
curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/classify-fashion \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://example.com/shirt.jpg"}'
```

**Expected Response:**
```json
{
  "classification": "fashion",
  "enhancementOptions": [
    "Dipakai oleh Model Wanita",
    "Dipakai oleh Model Wanita Berhijab",
    ...
  ]
}
```

#### classify-portrait
```bash
curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/classify-portrait \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://example.com/portrait.jpg"}'
```

**Expected Response:**
```json
{
  "classification": "portrait",
  "enhancementOptions": [
    "🎨 Virtual Outfit Change (Ganti Baju)",
    "💃 Ubah Pose (Pose Variation)",
    ...
  ]
}
```

---

## Deployment

### Deploy All Functions
```bash
# Deploy all at once
supabase functions deploy classify-fashion
supabase functions deploy classify-portrait
supabase functions deploy classify-interior
supabase functions deploy classify-exterior
```

### Or Deploy Individually
```bash
# Deploy one by one
supabase functions deploy classify-fashion
# Test...
supabase functions deploy classify-portrait
# Test...
# etc.
```

---

## Monitoring

### Logs per Function
```bash
# Fashion logs
supabase functions logs classify-fashion

# Portrait logs
supabase functions logs classify-portrait

# Interior logs
supabase functions logs classify-interior

# Exterior logs
supabase functions logs classify-exterior
```

### Metrics to Track
- Invocation count per function
- Average response time
- Error rate
- Most used enhancements per category

---

## Future Enhancements

### Easy to Add New Categories
```typescript
// Just create new function
// supabase/functions/classify-jewelry/index.ts

const JEWELRY_OPTIONS = [
  'Show on Model Hand',
  'Close-up Detail Shot',
  'Lifestyle with Outfit',
  ...
];
```

### Easy to Customize
```typescript
// Add category-specific logic
// Example: Different options based on sub-category

if (imageUrl.includes('ring')) {
  return RING_OPTIONS;
} else if (imageUrl.includes('necklace')) {
  return NECKLACE_OPTIONS;
}
```

---

## Troubleshooting

### Function Not Found
**Problem:** `classify-portrait` returns 404
**Solution:** 
1. Check if function is deployed
2. Verify function name spelling
3. Check Supabase dashboard

### Wrong Options Returned
**Problem:** Fashion page shows portrait options
**Solution:**
1. Check `classifyFunction` prop value
2. Verify page is using correct function name
3. Check ImageUploader implementation

### Slow Response
**Problem:** Classification takes too long
**Solution:**
1. Check function logs for errors
2. Verify image URL is accessible
3. Check network latency

---

## Conclusion

Separate classify functions provide:
- ✅ **Cleaner Code** - Each function has single responsibility
- ✅ **Better Maintenance** - Easy to update per category
- ✅ **Faster Performance** - No unnecessary logic
- ✅ **Easier Debugging** - Clear logs per category
- ✅ **Better Scalability** - Easy to add new categories

This architecture makes the system more professional and production-ready!

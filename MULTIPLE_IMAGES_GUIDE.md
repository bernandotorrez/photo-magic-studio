# Multiple Images Enhancement Guide

## Overview

Beberapa enhancement memerlukan **lebih dari 1 foto** sebagai input, seperti couple portrait, family portrait, product comparison, dll. Sistem sekarang sudah mendukung multiple images dengan field khusus di database.

## Database Schema

### New Columns in `enhancement_prompts` table:

```sql
- requires_multiple_images: BOOLEAN  -- Apakah butuh multiple images
- min_images: INTEGER                -- Minimum jumlah foto yang dibutuhkan
- max_images: INTEGER                -- Maximum jumlah foto yang diperbolehkan
- multiple_images_description: TEXT  -- Deskripsi foto apa saja yang dibutuhkan
```

## Enhancements yang Memerlukan Multiple Images

### 👥 Portrait Category

| Enhancement | Min | Max | Description |
|-------------|-----|-----|-------------|
| **Couple Portrait** | 2 | 2 | 2 person photos - one for each person |
| **Family Portrait** | 2 | 10 | Multiple person photos - one for each family member |
| **Group Photo** | 3 | 20 | 3-20 person photos to combine into group photo |
| **Before/After Transformation** | 2 | 2 | 2 photos - before and after transformation |

### 📦 Product Category

| Enhancement | Min | Max | Description |
|-------------|-----|-----|-------------|
| **Product Comparison** | 2 | 4 | 2-4 product photos for side-by-side comparison |
| **Multiple Angles Grid** | 2 | 8 | 2-8 photos from different angles |
| **360° Product Spin** | 8 | 36 | 8-36 photos in sequence for 360-degree rotation |
| **Product Collage** | 2 | 12 | 2-12 product photos to arrange in collage |
| **Size Comparison** | 2 | 5 | 2-5 photos of different product sizes |

### 👗 Fashion Category

| Enhancement | Min | Max | Description |
|-------------|-----|-----|-------------|
| **360° View** | 8 | 36 | 8-36 photos in sequence for 360-degree rotation |
| **Outfit Combination** | 2 | 6 | 2-6 photos of different clothing items to combine |
| **Fashion Lookbook** | 2 | 8 | 2-8 outfit photos for lookbook layout |

### 🍽️ Food Category

| Enhancement | Min | Max | Description |
|-------------|-----|-----|-------------|
| **Before/After** | 2 | 2 | 2 photos - before and after cooking |
| **Menu Grid Layout** | 4 | 16 | 4-16 food photos to arrange in menu grid |

### 🏠 Interior Category

| Enhancement | Min | Max | Description |
|-------------|-----|-----|-------------|
| **Room Tour Layout** | 3 | 8 | 3-8 photos of the same room from different angles |

### 🏛️ Exterior Category

| Enhancement | Min | Max | Description |
|-------------|-----|-----|-------------|
| **Property Showcase** | 3 | 10 | 3-10 exterior photos from different angles |

## API Usage

### Single Image (Standard)

Untuk enhancement yang hanya butuh 1 foto, gunakan `imageUrl` (singular):

```json
{
  "imageUrl": "https://example.com/product.jpg",
  "enhancement": "remove_background",
  "classification": "product"
}
```

### Multiple Images (New)

Untuk enhancement yang butuh multiple images, gunakan `imageUrls` (plural - array):

```json
{
  "imageUrls": [
    "https://example.com/person1.jpg",
    "https://example.com/person2.jpg"
  ],
  "enhancement": "portrait_couple",
  "classification": "portrait"
}
```

## API Request Examples

### Example 1: Couple Portrait (2 images)

```bash
curl -X POST https://your-project.supabase.co/functions/v1/api-generate \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrls": [
      "https://example.com/person1.jpg",
      "https://example.com/person2.jpg"
    ],
    "enhancement": "portrait_couple",
    "classification": "portrait"
  }'
```

### Example 2: Family Portrait (4 images)

```bash
curl -X POST https://your-project.supabase.co/functions/v1/api-generate \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrls": [
      "https://example.com/dad.jpg",
      "https://example.com/mom.jpg",
      "https://example.com/kid1.jpg",
      "https://example.com/kid2.jpg"
    ],
    "enhancement": "portrait_family",
    "classification": "portrait"
  }'
```

### Example 3: Product 360° Spin (12 images)

```bash
curl -X POST https://your-project.supabase.co/functions/v1/api-generate \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrls": [
      "https://example.com/product-0deg.jpg",
      "https://example.com/product-30deg.jpg",
      "https://example.com/product-60deg.jpg",
      "https://example.com/product-90deg.jpg",
      "https://example.com/product-120deg.jpg",
      "https://example.com/product-150deg.jpg",
      "https://example.com/product-180deg.jpg",
      "https://example.com/product-210deg.jpg",
      "https://example.com/product-240deg.jpg",
      "https://example.com/product-270deg.jpg",
      "https://example.com/product-300deg.jpg",
      "https://example.com/product-330deg.jpg"
    ],
    "enhancement": "product_360_spin",
    "classification": "product"
  }'
```

### Example 4: Product Comparison (3 images)

```bash
curl -X POST https://your-project.supabase.co/functions/v1/api-generate \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrls": [
      "https://example.com/product-v1.jpg",
      "https://example.com/product-v2.jpg",
      "https://example.com/product-v3.jpg"
    ],
    "enhancement": "product_comparison",
    "classification": "product"
  }'
```

## Query Enhancement Info

### Check if Enhancement Requires Multiple Images

```sql
-- Get enhancement details
SELECT * FROM get_enhancement_details('portrait_couple');

-- Result:
-- enhancement_type: portrait_couple
-- requires_multiple_images: true
-- min_images: 2
-- max_images: 2
-- multiple_images_description: "2 person photos - one for each person in the couple"
```

### Get All Multiple-Image Enhancements

```sql
-- Get all enhancements that require multiple images
SELECT * FROM get_multiple_image_enhancements();
```

### Via REST API

```bash
# Get enhancement details
curl -X POST https://your-project.supabase.co/rest/v1/rpc/get_enhancement_details \
  -H "apikey: your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"p_enhancement_type": "portrait_couple"}'

# Get all multiple-image enhancements
curl -X POST https://your-project.supabase.co/rest/v1/rpc/get_multiple_image_enhancements \
  -H "apikey: your-anon-key" \
  -H "Content-Type: application/json"
```

## Frontend Implementation

### JavaScript Example

```javascript
// Check if enhancement requires multiple images
async function checkEnhancement(enhancementType) {
  const { data } = await supabase
    .rpc('get_enhancement_details', { 
      p_enhancement_type: enhancementType 
    });
  
  if (data && data.requires_multiple_images) {
    console.log(`This enhancement requires ${data.min_images}-${data.max_images} images`);
    console.log(`Description: ${data.multiple_images_description}`);
    return {
      requiresMultiple: true,
      min: data.min_images,
      max: data.max_images,
      description: data.multiple_images_description
    };
  }
  
  return { requiresMultiple: false };
}

// Generate with multiple images
async function generateWithMultipleImages(imageUrls, enhancement) {
  const response = await fetch('/functions/v1/api-generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    },
    body: JSON.stringify({
      imageUrls: imageUrls,  // Array of URLs
      enhancement: enhancement,
      classification: 'portrait'
    })
  });
  
  return await response.json();
}

// Usage
const enhancementInfo = await checkEnhancement('portrait_couple');
if (enhancementInfo.requiresMultiple) {
  // Show file upload for multiple images
  const imageUrls = [
    'https://example.com/person1.jpg',
    'https://example.com/person2.jpg'
  ];
  
  if (imageUrls.length >= enhancementInfo.min && 
      imageUrls.length <= enhancementInfo.max) {
    const result = await generateWithMultipleImages(imageUrls, 'portrait_couple');
    console.log('Generated:', result.generatedImageUrl);
  } else {
    console.error(`Please provide ${enhancementInfo.min}-${enhancementInfo.max} images`);
  }
}
```

### React Component Example

```tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

function MultipleImageUpload({ enhancement }) {
  const [enhancementInfo, setEnhancementInfo] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  
  useEffect(() => {
    loadEnhancementInfo();
  }, [enhancement]);
  
  const loadEnhancementInfo = async () => {
    const { data } = await supabase
      .rpc('get_enhancement_details', { 
        p_enhancement_type: enhancement 
      });
    
    if (data && data.requires_multiple_images) {
      setEnhancementInfo(data);
    }
  };
  
  if (!enhancementInfo?.requires_multiple_images) {
    return <SingleImageUpload />;
  }
  
  return (
    <div>
      <h3>Upload {enhancementInfo.min_images}-{enhancementInfo.max_images} Images</h3>
      <p>{enhancementInfo.multiple_images_description}</p>
      
      <input 
        type="file" 
        multiple 
        accept="image/*"
        onChange={(e) => {
          const files = Array.from(e.target.files);
          if (files.length < enhancementInfo.min_images) {
            alert(`Please select at least ${enhancementInfo.min_images} images`);
            return;
          }
          if (files.length > enhancementInfo.max_images) {
            alert(`Maximum ${enhancementInfo.max_images} images allowed`);
            return;
          }
          // Upload files and get URLs
          uploadFiles(files).then(urls => setImageUrls(urls));
        }}
      />
      
      <div className="preview">
        {imageUrls.map((url, i) => (
          <img key={i} src={url} alt={`Image ${i+1}`} />
        ))}
      </div>
      
      <button 
        onClick={() => generateImage(imageUrls, enhancement)}
        disabled={imageUrls.length < enhancementInfo.min_images}
      >
        Generate
      </button>
    </div>
  );
}
```

## Validation Rules

### Backend Validation (Edge Function)

```typescript
// In api-generate edge function
const { imageUrl, imageUrls, enhancement } = await req.json();

// Get enhancement info
const { data: enhancementInfo } = await supabase
  .rpc('get_enhancement_details', { p_enhancement_type: enhancement });

if (enhancementInfo?.requires_multiple_images) {
  // Validate multiple images
  if (!imageUrls || !Array.isArray(imageUrls)) {
    return new Response(
      JSON.stringify({ 
        error: 'This enhancement requires multiple images. Use imageUrls array.' 
      }),
      { status: 400 }
    );
  }
  
  if (imageUrls.length < enhancementInfo.min_images) {
    return new Response(
      JSON.stringify({ 
        error: `Minimum ${enhancementInfo.min_images} images required. ${enhancementInfo.multiple_images_description}` 
      }),
      { status: 400 }
    );
  }
  
  if (imageUrls.length > enhancementInfo.max_images) {
    return new Response(
      JSON.stringify({ 
        error: `Maximum ${enhancementInfo.max_images} images allowed` 
      }),
      { status: 400 }
    );
  }
} else {
  // Validate single image
  if (!imageUrl) {
    return new Response(
      JSON.stringify({ error: 'imageUrl is required' }),
      { status: 400 }
    );
  }
}
```

## Pricing Considerations

### Token Deduction for Multiple Images

Multiple images akan mengurangi token lebih banyak:

```typescript
// Calculate token cost
let tokenCost = 1; // Base cost for single image

if (imageUrls && imageUrls.length > 1) {
  // Additional cost for each extra image
  tokenCost = 1 + (imageUrls.length - 1) * 0.5;
  // Example: 2 images = 1.5 tokens, 4 images = 2.5 tokens
}

// Or flat rate per image
tokenCost = imageUrls ? imageUrls.length : 1;
```

## Best Practices

### 1. Clear UI Indication

Tampilkan dengan jelas berapa foto yang dibutuhkan:

```
✅ "Upload 2 person photos (one for each person)"
✅ "Upload 3-8 room photos from different angles"
❌ "Upload images"
```

### 2. Image Order Matters

Untuk beberapa enhancement, urutan foto penting:

- **Couple Portrait**: [Person 1, Person 2]
- **Before/After**: [Before, After]
- **360° Spin**: [0°, 30°, 60°, ..., 330°]

### 3. Validation

Selalu validasi:
- Jumlah foto sesuai min/max
- Format file valid
- Ukuran file tidak terlalu besar
- Semua URL accessible

### 4. Error Handling

Berikan error message yang jelas:

```javascript
if (imageUrls.length < minImages) {
  throw new Error(
    `Please upload at least ${minImages} images. ` +
    `${multiple_images_description}`
  );
}
```

## Summary

✅ **Database sudah support multiple images** dengan field khusus
✅ **API menerima `imageUrls` array** untuk multiple images
✅ **Validation otomatis** berdasarkan min/max images
✅ **Helper functions** untuk query enhancement info
✅ **Clear documentation** untuk setiap enhancement

**Next Steps:**
1. Run SQL migration untuk add columns
2. Update API edge function untuk handle `imageUrls`
3. Update frontend untuk show multiple file upload
4. Add validation di frontend dan backend
5. Update pricing logic untuk multiple images

---

**Questions?** Check the main API documentation or contact support.

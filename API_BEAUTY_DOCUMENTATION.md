# Beauty Enhancement API Documentation 💄

## Overview

API untuk beauty enhancement dengan deteksi gender otomatis dan pilihan hair style serta makeup yang disesuaikan.

## Base URL
```
https://your-project.supabase.co/functions/v1
```

## Authentication
Semua endpoint memerlukan authentication token di header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Endpoints

### 1. Classify Beauty Image

Mendeteksi gender dari foto portrait dan mengembalikan pilihan enhancement yang sesuai.

**Endpoint:** `POST /classify-beauty`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "imageUrl": "https://example.com/portrait.jpg"
}
```

**Response Success (200):**
```json
{
  "classification": "beauty",
  "gender": "female",
  "detectedLabel": "woman",
  "classificationSuccess": true,
  "subcategories": {
    "hair_style": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "enhancement_type": "hair_style_female_long_straight",
        "display_name": "💇‍♀️ Long Straight Hair",
        "description": "Rambut panjang lurus mengkilap",
        "supports_custom_prompt": false
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "enhancement_type": "hair_style_female_beach_waves",
        "display_name": "💇‍♀️ Beach Waves",
        "description": "Gaya rambut beach waves natural",
        "supports_custom_prompt": false
      }
    ],
    "makeup": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440020",
        "enhancement_type": "makeup_natural_look",
        "display_name": "💄 Natural Makeup Look",
        "description": "Makeup natural sehari-hari",
        "supports_custom_prompt": true
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440021",
        "enhancement_type": "makeup_bold_red_lips",
        "display_name": "💋 Bold Red Lips",
        "description": "Lipstik merah bold (custom warna)",
        "supports_custom_prompt": true
      }
    ]
  },
  "enhancementOptions": [
    // Flat array combining hair_style and makeup
  ]
}
```

**Response for Male:**
```json
{
  "classification": "beauty",
  "gender": "male",
  "detectedLabel": "man",
  "classificationSuccess": true,
  "subcategories": {
    "hair_style": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440100",
        "enhancement_type": "hair_style_male_undercut",
        "display_name": "💇‍♂️ Modern Undercut",
        "description": "Gaya rambut undercut modern",
        "supports_custom_prompt": false
      }
    ],
    "makeup": [
      // Same makeup options for all genders
    ]
  }
}
```

**Response Error (400):**
```json
{
  "error": "imageUrl is required"
}
```

**Response Error (500):**
```json
{
  "error": "API key not configured"
}
```

---

### 2. Generate Beauty Enhancement

Generate gambar dengan hair style atau makeup enhancement.

**Endpoint:** `POST /generate-enhanced-image`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

#### 2.1 Hair Style Enhancement

**Request Body:**
```json
{
  "imageUrl": "https://example.com/portrait.jpg",
  "enhancementIds": ["550e8400-e29b-41d4-a716-446655440001"],
  "classification": "beauty"
}
```

**Response Success (200):**
```json
{
  "generatedImageUrl": "https://storage.supabase.co/object/sign/generated-images/user123_1234567890.png?token=...",
  "prompt": "Create natural beach waves with loose, flowing curls. Effortless and romantic styling."
}
```

#### 2.2 Makeup Enhancement (Basic)

**Request Body:**
```json
{
  "imageUrl": "https://example.com/portrait.jpg",
  "enhancementIds": ["550e8400-e29b-41d4-a716-446655440020"],
  "classification": "beauty"
}
```

**Response Success (200):**
```json
{
  "generatedImageUrl": "https://storage.supabase.co/...",
  "prompt": "Apply natural, everyday makeup with subtle enhancement..."
}
```

#### 2.3 Makeup Enhancement (With Custom Color)

**Request Body:**
```json
{
  "imageUrl": "https://example.com/portrait.jpg",
  "enhancementIds": ["550e8400-e29b-41d4-a716-446655440021"],
  "classification": "beauty",
  "customPrompt": "deep burgundy red with matte finish"
}
```

**Response Success (200):**
```json
{
  "generatedImageUrl": "https://storage.supabase.co/...",
  "prompt": "Apply bold red lipstick with perfect application, matte or glossy finish. Classic and confident. Custom color: deep burgundy red with matte finish"
}
```

#### 2.4 Multiple Enhancements

**Request Body:**
```json
{
  "imageUrl": "https://example.com/portrait.jpg",
  "enhancementIds": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440020",
    "550e8400-e29b-41d4-a716-446655440021"
  ],
  "classification": "beauty",
  "customPrompt": "soft pink lipstick, rose gold eyeshadow"
}
```

**Response Success (200):**
```json
{
  "generatedImageUrl": "https://storage.supabase.co/...",
  "prompt": "Create natural beach waves... Apply natural makeup... Apply bold red lipstick... Custom: soft pink lipstick, rose gold eyeshadow"
}
```

**Response Error (400):**
```json
{
  "error": "enhancement, enhancements, or enhancementIds is required"
}
```

**Response Error (403):**
```json
{
  "error": "Token Anda sudah habis. Silakan top up untuk melanjutkan.",
  "subscription_tokens": 0,
  "purchased_tokens": 0,
  "total_tokens": 0
}
```

---

## Enhancement Types

### Hair Style - Male (15 types)
| Enhancement Type | Display Name | Custom Prompt |
|-----------------|--------------|---------------|
| `hair_style_male_classic_pompadour` | 💇‍♂️ Classic Pompadour | ❌ |
| `hair_style_male_undercut` | 💇‍♂️ Modern Undercut | ❌ |
| `hair_style_male_fade` | 💇‍♂️ Fade Haircut | ❌ |
| `hair_style_male_crew_cut` | 💇‍♂️ Crew Cut | ❌ |
| `hair_style_male_quiff` | 💇‍♂️ Textured Quiff | ❌ |
| `hair_style_male_slick_back` | 💇‍♂️ Slick Back | ❌ |
| `hair_style_male_side_part` | 💇‍♂️ Side Part | ❌ |
| `hair_style_male_messy_textured` | 💇‍♂️ Messy Textured | ❌ |
| `hair_style_male_buzz_cut` | 💇‍♂️ Buzz Cut | ❌ |
| `hair_style_male_man_bun` | 💇‍♂️ Man Bun | ❌ |
| `hair_style_male_curly_top` | 💇‍♂️ Curly Top | ❌ |
| `hair_style_male_french_crop` | 💇‍♂️ French Crop | ❌ |
| `hair_style_male_mohawk` | 💇‍♂️ Mohawk/Faux Hawk | ❌ |
| `hair_style_male_ivy_league` | 💇‍♂️ Ivy League | ❌ |
| `hair_style_male_spiky` | 💇‍♂️ Spiky Hair | ❌ |

### Hair Style - Female (20 types)
| Enhancement Type | Display Name | Custom Prompt |
|-----------------|--------------|---------------|
| `hair_style_female_long_straight` | 💇‍♀️ Long Straight Hair | ❌ |
| `hair_style_female_beach_waves` | 💇‍♀️ Beach Waves | ❌ |
| `hair_style_female_curly_voluminous` | 💇‍♀️ Voluminous Curls | ❌ |
| `hair_style_female_bob_cut` | 💇‍♀️ Bob Cut | ❌ |
| `hair_style_female_pixie_cut` | 💇‍♀️ Pixie Cut | ❌ |
| `hair_style_female_layered_cut` | 💇‍♀️ Layered Cut | ❌ |
| `hair_style_female_ponytail_high` | 💇‍♀️ High Ponytail | ❌ |
| `hair_style_female_messy_bun` | 💇‍♀️ Messy Bun | ❌ |
| `hair_style_female_braided` | 💇‍♀️ Braided Hair | ❌ |
| `hair_style_female_half_up` | 💇‍♀️ Half-Up Half-Down | ❌ |
| `hair_style_female_sleek_low_bun` | 💇‍♀️ Sleek Low Bun | ❌ |
| `hair_style_female_side_swept` | 💇‍♀️ Side Swept | ❌ |
| `hair_style_female_bangs_fringe` | 💇‍♀️ Bangs/Fringe | ❌ |
| `hair_style_female_balayage` | 💇‍♀️ Balayage Highlights | ❌ |
| `hair_style_female_ombre` | 💇‍♀️ Ombre Color | ❌ |
| `hair_style_female_vintage_waves` | 💇‍♀️ Vintage Hollywood Waves | ❌ |
| `hair_style_female_shag_cut` | 💇‍♀️ Shag Cut | ❌ |
| `hair_style_female_top_knot` | 💇‍♀️ Top Knot | ❌ |
| `hair_style_female_space_buns` | 💇‍♀️ Space Buns | ❌ |
| `hair_style_female_sleek_straight` | 💇‍♀️ Ultra Sleek Straight | ❌ |

### Makeup (25 types)
| Enhancement Type | Display Name | Custom Prompt |
|-----------------|--------------|---------------|
| `makeup_natural_look` | 💄 Natural Makeup Look | ✅ |
| `makeup_glam_evening` | 💄 Glamorous Evening Makeup | ✅ |
| `makeup_smokey_eyes` | 💄 Smokey Eyes | ✅ |
| `makeup_bold_red_lips` | 💋 Bold Red Lips | ✅ |
| `makeup_nude_lips` | 💋 Nude/Natural Lips | ✅ |
| `makeup_pink_lips` | 💋 Pink Lips | ✅ |
| `makeup_berry_lips` | 💋 Berry/Plum Lips | ✅ |
| `makeup_glossy_lips` | 💋 Glossy Lips | ✅ |
| `makeup_matte_lips` | 💋 Matte Lips | ✅ |
| `makeup_cat_eye` | 👁️ Cat Eye Liner | ❌ |
| `makeup_natural_eye` | 👁️ Natural Eye Makeup | ❌ |
| `makeup_colorful_eye` | 👁️ Colorful Eye Makeup | ✅ |
| `makeup_glitter_eye` | 👁️ Glitter Eye Makeup | ❌ |
| `makeup_cut_crease` | 👁️ Cut Crease Eye | ❌ |
| `makeup_contour_highlight` | ✨ Contour & Highlight | ❌ |
| `makeup_dewy_skin` | ✨ Dewy Glowing Skin | ❌ |
| `makeup_matte_skin` | ✨ Matte Flawless Skin | ❌ |
| `makeup_rosy_cheeks` | 🌸 Rosy Blush Cheeks | ✅ |
| `makeup_bronzed_look` | 🌸 Bronzed Sun-Kissed | ❌ |
| `makeup_korean_style` | 🎀 Korean Beauty Style | ❌ |
| `makeup_editorial_artistic` | 🎨 Editorial/Artistic Makeup | ❌ |
| `makeup_bridal_elegant` | 👰 Bridal Makeup | ❌ |
| `makeup_no_makeup_look` | ✨ No-Makeup Makeup | ❌ |
| `makeup_festival_fun` | 🎉 Festival/Party Makeup | ❌ |
| `makeup_vintage_retro` | 🕰️ Vintage/Retro Makeup | ❌ |

---

## Custom Prompt Examples

### Lipstick Colors
```json
{
  "customPrompt": "deep burgundy red with matte finish"
}
```
```json
{
  "customPrompt": "soft baby pink with glossy shine"
}
```
```json
{
  "customPrompt": "coral peach with satin finish"
}
```

### Eye Makeup Colors
```json
{
  "customPrompt": "purple and gold eyeshadow with shimmer"
}
```
```json
{
  "customPrompt": "bronze and copper tones with metallic finish"
}
```
```json
{
  "customPrompt": "emerald green with silver glitter"
}
```

### Blush Colors
```json
{
  "customPrompt": "peachy coral blush"
}
```
```json
{
  "customPrompt": "rosy pink with subtle shimmer"
}
```

### Multiple Custom Prompts
```json
{
  "customPrompt": "soft pink lipstick, rose gold eyeshadow, peachy blush"
}
```

---

## Error Codes

| Status Code | Error Message | Description |
|------------|---------------|-------------|
| 400 | `imageUrl is required` | Missing imageUrl in request |
| 400 | `enhancement, enhancements, or enhancementIds is required` | Missing enhancement parameter |
| 401 | `Invalid API key` | API key tidak valid (untuk API endpoint) |
| 403 | `Token Anda sudah habis` | User kehabisan token |
| 500 | `API key not configured` | Hugging Face API key tidak dikonfigurasi |
| 500 | `Failed to fetch enhancements` | Error mengambil data dari database |

---

## Rate Limits

- **Free Tier:** 10 requests/day
- **Basic Tier:** 100 requests/month
- **Pro Tier:** 500 requests/month
- **Enterprise Tier:** Unlimited

---

## Best Practices

### 1. Image Requirements
- Format: JPG, PNG, WEBP
- Size: 512x512px minimum, 2048x2048px maximum
- File size: Max 5MB
- Content: Clear portrait photo with visible face

### 2. Gender Detection
- Sistem otomatis mendeteksi gender
- Akurasi ~85-90%
- Bisa manual override jika salah

### 3. Custom Prompts
- Gunakan deskripsi warna yang spesifik
- Hindari deskripsi ambigu
- Bisa combine multiple colors

### 4. Multiple Enhancements
- Maksimal 3-4 enhancements per request
- Combine hair + makeup works well
- Terlalu banyak bisa konflik

---

## Code Examples

### JavaScript/TypeScript
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Classify image
const classifyBeauty = async (imageUrl: string) => {
  const { data, error } = await supabase.functions.invoke('classify-beauty', {
    body: { imageUrl }
  });
  return data;
};

// Generate hair style
const generateHairStyle = async (imageUrl: string, enhancementId: string) => {
  const { data, error } = await supabase.functions.invoke('generate-enhanced-image', {
    body: {
      imageUrl,
      enhancementIds: [enhancementId],
      classification: 'beauty'
    }
  });
  return data;
};

// Generate makeup with custom color
const generateMakeup = async (
  imageUrl: string, 
  enhancementId: string,
  customColor: string
) => {
  const { data, error } = await supabase.functions.invoke('generate-enhanced-image', {
    body: {
      imageUrl,
      enhancementIds: [enhancementId],
      classification: 'beauty',
      customPrompt: customColor
    }
  });
  return data;
};
```

### Python
```python
import requests

SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_KEY = "your-anon-key"

# Classify image
def classify_beauty(image_url):
    response = requests.post(
        f"{SUPABASE_URL}/functions/v1/classify-beauty",
        headers={
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        },
        json={"imageUrl": image_url}
    )
    return response.json()

# Generate enhancement
def generate_enhancement(image_url, enhancement_ids, custom_prompt=None):
    body = {
        "imageUrl": image_url,
        "enhancementIds": enhancement_ids,
        "classification": "beauty"
    }
    if custom_prompt:
        body["customPrompt"] = custom_prompt
    
    response = requests.post(
        f"{SUPABASE_URL}/functions/v1/generate-enhanced-image",
        headers={
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        },
        json=body
    )
    return response.json()
```

---

## Changelog

### Version 1.0.0 (December 2025)
- ✅ Initial release
- ✅ Gender detection
- ✅ 15 male hair styles
- ✅ 20 female hair styles
- ✅ 25 makeup options
- ✅ Custom color support for makeup

---

## Support

- 📖 Documentation: https://docs.pixelnova.ai
- 💬 WhatsApp: +62 896-8761-0639
- 📧 Email: support@pixelnova.ai
- 🐛 Bug Reports: https://github.com/pixelnova/issues

---

**Last Updated:** December 21, 2025

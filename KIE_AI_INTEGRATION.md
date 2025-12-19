# KIE AI Integration

## Overview
Fungsi `generate-enhanced-image` telah diupdate untuk menggunakan KIE AI API dengan model `google/nano-banana-edit`.

## API Configuration

### Environment Variable
Tambahkan `KIE_AI_API_KEY` ke file `.env`:
```
KIE_AI_API_KEY=your_kie_ai_api_key
```

### API Endpoint
```
POST https://api.aiquickdraw.com/v1/images/generations
```

### Request Format
```json
{
  "model": "google/nano-banana-edit",
  "prompt": "your enhancement prompt",
  "image_urls": ["https://example.com/image.png"],
  "output_format": "png",
  "image_size": "1:1"
}
```

## Model Reference Images

Ketika user memilih enhancement "Dipakai oleh Model", sistem akan otomatis menambahkan model reference image:

- **Model Female Hijab**: `https://dcfnvebphjuwtlfuudcd.supabase.co/storage/v1/object/public/model-assets/model_female_hijab.png`
- **Model Female**: `https://dcfnvebphjuwtlfuudcd.supabase.co/storage/v1/object/public/model-assets/model_female.png`
- **Model Male**: `https://dcfnvebphjuwtlfuudcd.supabase.co/storage/v1/object/public/model-assets/model_male.png`

## How It Works

1. User upload product image
2. User pilih enhancement type (e.g., "Dipakai oleh Model - Female")
3. System build prompt berdasarkan enhancement type
4. Jika enhancement menggunakan model, system tambahkan model reference image ke `image_urls` array
5. KIE AI generate enhanced image dengan model `google/nano-banana-edit`
6. Generated image disimpan ke Supabase storage bucket `generated-images`

## Enhancement Types

### With Model Reference
- Female with Hijab Model
- Female Model
- Male Model
- Accessories (worn on body)
- Shoes (on-feet)
- Lifestyle shots

### Without Model Reference
- Mannequin/Dress Form
- Background Enhancement
- Lighting Improvement
- Background Removal

## Response Format
```json
{
  "data": [
    {
      "url": "https://generated-image-url.png"
    }
  ]
}
```

## Generation Limits

### Free Tier
- **3 generations per month**
- Resets automatically setiap bulan
- Error message: "Kuota generate bulanan Anda sudah habis" (403 status)

### Paid Tiers
- Basic: 50 generations per month
- Pro: Unlimited generations

## Error Handling
- 403: Quota exceeded (monthly limit reached)
- 429: Rate limit exceeded
- 402: API credits exhausted
- 500: Generation failed

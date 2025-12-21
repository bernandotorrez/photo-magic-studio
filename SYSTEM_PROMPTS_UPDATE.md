# System Prompts Update

## Apa itu System Prompts?

System prompts adalah instruksi role/persona yang diberikan ke AI sebelum enhancement prompt. Ini membuat AI lebih fokus dan menghasilkan output yang lebih sesuai dengan kategori.

## Format

```
[System Prompt] + [Enhancement Prompt] = Final Prompt ke KIE AI
```

**Contoh:**
- **Fashion:** "You are an expert fashion photographer..." + "Add female model wearing this product"
- **Food:** "You are a professional food photographer..." + "Make this food look more appetizing"
- **Portrait:** "You are a professional portrait photographer..." + "Change pose to sitting"

## Kategori & System Prompts

### 1. Fashion / Clothing
**Role:** Expert fashion photographer and e-commerce product specialist
**Focus:** Product photography, styling, lighting, clean backgrounds, product details

### 2. Food
**Role:** Professional food photographer specializing in culinary photography
**Focus:** Food styling, appetizing presentation, color harmony, restaurant photography

### 3. Portrait / Person / AI Photographer
**Role:** Professional portrait photographer
**Focus:** Studio lighting, posing, retouching, facial features, skin tones, magazine-quality

### 4. Interior Design
**Role:** Expert interior designer
**Focus:** Spatial design, color schemes, furniture placement, lighting, harmonious spaces

### 5. Exterior / Architecture
**Role:** Professional architect and exterior designer
**Focus:** Building facades, landscaping, outdoor spaces, curb appeal, property value

### 6. Product (General)
**Role:** Expert product photographer
**Focus:** E-commerce photography, clean images, proper lighting, color accuracy

### 7. Default (Other Categories)
**Role:** Expert AI image enhancement specialist
**Focus:** General photography, design, visual aesthetics, professional results

## Cara Update System Prompts

### 1. Jalankan SQL
```bash
# Buka Supabase Dashboard > SQL Editor
# Copy paste isi file: UPDATE_SYSTEM_PROMPTS.sql
# Klik Run
```

### 2. Verifikasi
SQL akan otomatis menampilkan:
- Semua kategori dengan system prompt preview
- Total kategori yang punya system prompt

### 3. Test
Generate gambar di dashboard dan cek console log:
```
✅ Using system prompt for category: fashion
System prompt preview: You are an expert fashion photographer...
```

## Implementasi di Code

### Edge Function (generate-enhanced-image)
```typescript
// 1. Get system prompt from database
const { data: categoryData } = await supabase
  .from('image_categories')
  .select('system_prompt')
  .or(`category_name.eq.${classification},category_code.eq.${classification}`)
  .eq('is_active', true)
  .maybeSingle();

// 2. Combine with enhancement prompt
if (systemPrompt) {
  enhancementPrompt = `${systemPrompt}\n\n${mainPrompt}`;
} else {
  enhancementPrompt = mainPrompt;
}

// 3. Send to KIE AI
const response = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
  body: JSON.stringify({
    input: {
      prompt: enhancementPrompt, // System + Enhancement
      image_urls: imageUrls
    }
  })
});
```

## Benefits

✅ **Lebih Fokus:** AI tahu role-nya sebagai photographer/designer
✅ **Hasil Konsisten:** Output sesuai dengan kategori
✅ **Kualitas Lebih Baik:** AI menggunakan expertise yang tepat
✅ **Konteks Lebih Jelas:** AI paham apa yang diharapkan

## Troubleshooting

### System prompt tidak muncul di log
- Cek apakah SQL sudah dijalankan
- Cek apakah `classification` parameter terisi saat generate
- Cek apakah category_code/category_name match dengan database

### Hasil generate tidak sesuai
- Pastikan system prompt sudah sesuai dengan kategori
- Edit system prompt di database jika perlu
- Test dengan enhancement prompt yang berbeda

## Update History

- **2023-12-25:** Initial system prompts implementation
- **2023-12-22:** Added food category system prompt
- **Today:** Updated all categories with comprehensive system prompts

# Beauty Enhancement - Quick Start Guide 💄

## Setup (5 Menit)

### Step 1: Jalankan SQL
```sql
-- Copy paste ke Supabase SQL Editor
-- File: RUN_THIS_SQL_BEAUTY_ENHANCEMENTS.sql
```

Jalankan file `RUN_THIS_SQL_BEAUTY_ENHANCEMENTS.sql` di Supabase SQL Editor untuk:
- ✅ Menambahkan kategori Beauty
- ✅ Menambahkan 15 hair style male
- ✅ Menambahkan 20 hair style female  
- ✅ Menambahkan 25 makeup options
- ✅ Mapping ke kategori

### Step 2: Deploy Edge Function
```bash
# Deploy classify-beauty function
supabase functions deploy classify-beauty

# Test function
supabase functions invoke classify-beauty --data '{"imageUrl":"https://example.com/portrait.jpg"}'
```

### Step 3: Update classify-image
File `supabase/functions/classify-image/index.ts` sudah diupdate untuk mendeteksi kategori beauty.

Deploy ulang:
```bash
supabase functions deploy classify-image
```

## Penggunaan Dasar

### 1. Classify Image (Deteksi Gender)
```typescript
const { data } = await supabase.functions.invoke('classify-beauty', {
  body: { imageUrl: 'https://example.com/portrait.jpg' }
});

console.log(data.gender); // 'male' atau 'female'
console.log(data.subcategories.hair_style); // Array hair styles
console.log(data.subcategories.makeup); // Array makeup options
```

### 2. Generate Hair Style
```typescript
// Untuk pria
const { data } = await supabase.functions.invoke('generate-enhanced-image', {
  body: {
    imageUrl: 'https://example.com/male-portrait.jpg',
    enhancementIds: ['hair_style_male_undercut'],
    classification: 'beauty'
  }
});

// Untuk wanita
const { data } = await supabase.functions.invoke('generate-enhanced-image', {
  body: {
    imageUrl: 'https://example.com/female-portrait.jpg',
    enhancementIds: ['hair_style_female_beach_waves'],
    classification: 'beauty'
  }
});
```

### 3. Generate Makeup
```typescript
// Natural makeup
const { data } = await supabase.functions.invoke('generate-enhanced-image', {
  body: {
    imageUrl: 'https://example.com/portrait.jpg',
    enhancementIds: ['makeup_natural_look'],
    classification: 'beauty'
  }
});
```

### 4. Generate Makeup dengan Custom Warna
```typescript
// Red lipstick dengan custom warna
const { data } = await supabase.functions.invoke('generate-enhanced-image', {
  body: {
    imageUrl: 'https://example.com/portrait.jpg',
    enhancementIds: ['makeup_bold_red_lips'],
    classification: 'beauty',
    customPrompt: 'deep burgundy red with matte finish'
  }
});
```

### 5. Multiple Enhancements
```typescript
// Hair style + makeup sekaligus
const { data } = await supabase.functions.invoke('generate-enhanced-image', {
  body: {
    imageUrl: 'https://example.com/portrait.jpg',
    enhancementIds: [
      'hair_style_female_beach_waves',
      'makeup_natural_look',
      'makeup_pink_lips'
    ],
    classification: 'beauty',
    customPrompt: 'soft pink lipstick'
  }
});
```

## Frontend UI Example

### React Component
```typescript
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export const BeautyEnhancer = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [hairStyles, setHairStyles] = useState([]);
  const [makeupOptions, setMakeupOptions] = useState([]);
  const [selectedEnhancements, setSelectedEnhancements] = useState<string[]>([]);
  const [customColor, setCustomColor] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  // Step 1: Classify image
  const classifyImage = async () => {
    setLoading(true);
    const { data } = await supabase.functions.invoke('classify-beauty', {
      body: { imageUrl }
    });
    
    setGender(data.gender);
    setHairStyles(data.subcategories.hair_style);
    setMakeupOptions(data.subcategories.makeup);
    setLoading(false);
  };

  // Step 2: Generate enhancement
  const generateEnhancement = async () => {
    setLoading(true);
    const { data } = await supabase.functions.invoke('generate-enhanced-image', {
      body: {
        imageUrl,
        enhancementIds: selectedEnhancements,
        classification: 'beauty',
        customPrompt: customColor
      }
    });
    
    setResult(data.generatedImageUrl);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Upload Image */}
      <input 
        type="text" 
        placeholder="Image URL"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />
      <button onClick={classifyImage}>Classify Image</button>

      {/* Hair Style Options */}
      {hairStyles.length > 0 && (
        <div>
          <h3>Hair Styles ({gender})</h3>
          {hairStyles.map((style: any) => (
            <label key={style.id}>
              <input
                type="checkbox"
                value={style.id}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedEnhancements([...selectedEnhancements, style.id]);
                  } else {
                    setSelectedEnhancements(
                      selectedEnhancements.filter(id => id !== style.id)
                    );
                  }
                }}
              />
              {style.display_name}
            </label>
          ))}
        </div>
      )}

      {/* Makeup Options */}
      {makeupOptions.length > 0 && (
        <div>
          <h3>Makeup</h3>
          {makeupOptions.map((makeup: any) => (
            <label key={makeup.id}>
              <input
                type="checkbox"
                value={makeup.id}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedEnhancements([...selectedEnhancements, makeup.id]);
                  } else {
                    setSelectedEnhancements(
                      selectedEnhancements.filter(id => id !== makeup.id)
                    );
                  }
                }}
              />
              {makeup.display_name}
              {makeup.supports_custom_prompt && ' (Custom Color)'}
            </label>
          ))}
        </div>
      )}

      {/* Custom Color Input */}
      <input
        type="text"
        placeholder="Custom color (e.g., 'soft pink', 'burgundy red')"
        value={customColor}
        onChange={(e) => setCustomColor(e.target.value)}
      />

      {/* Generate Button */}
      <button 
        onClick={generateEnhancement}
        disabled={selectedEnhancements.length === 0 || loading}
      >
        {loading ? 'Generating...' : 'Generate Enhancement'}
      </button>

      {/* Result */}
      {result && (
        <div>
          <h3>Result:</h3>
          <img src={result} alt="Enhanced" />
        </div>
      )}
    </div>
  );
};
```

## API Examples

### cURL Examples

#### 1. Classify Beauty Image
```bash
curl -X POST https://your-project.supabase.co/functions/v1/classify-beauty \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "imageUrl": "https://example.com/portrait.jpg"
  }'
```

#### 2. Generate Hair Style (Male)
```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-enhanced-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "imageUrl": "https://example.com/male-portrait.jpg",
    "enhancementIds": ["hair_style_male_undercut"],
    "classification": "beauty"
  }'
```

#### 3. Generate Hair Style (Female)
```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-enhanced-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "imageUrl": "https://example.com/female-portrait.jpg",
    "enhancementIds": ["hair_style_female_beach_waves"],
    "classification": "beauty"
  }'
```

#### 4. Generate Makeup with Custom Color
```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-enhanced-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "imageUrl": "https://example.com/portrait.jpg",
    "enhancementIds": ["makeup_bold_red_lips"],
    "classification": "beauty",
    "customPrompt": "deep wine red with matte finish"
  }'
```

#### 5. Multiple Enhancements
```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-enhanced-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "imageUrl": "https://example.com/portrait.jpg",
    "enhancementIds": [
      "hair_style_female_beach_waves",
      "makeup_natural_look",
      "makeup_pink_lips"
    ],
    "classification": "beauty",
    "customPrompt": "soft pink lipstick, rose gold eyeshadow"
  }'
```

## Verification

### Check Database
```sql
-- Check beauty category
SELECT * FROM image_categories WHERE category_code = 'beauty';

-- Check hair style male enhancements
SELECT enhancement_type, display_name, category 
FROM enhancement_prompts 
WHERE category = 'hair_style_male' AND is_active = true;

-- Check hair style female enhancements
SELECT enhancement_type, display_name, category 
FROM enhancement_prompts 
WHERE category = 'hair_style_female' AND is_active = true;

-- Check makeup enhancements
SELECT enhancement_type, display_name, supports_custom_prompt 
FROM enhancement_prompts 
WHERE category = 'makeup' AND is_active = true;

-- Check total enhancements
SELECT category, COUNT(*) as total
FROM enhancement_prompts
WHERE category IN ('hair_style_male', 'hair_style_female', 'makeup') 
  AND is_active = true
GROUP BY category;
```

Expected results:
- hair_style_male: 15 enhancements
- hair_style_female: 20 enhancements
- makeup: 25 enhancements
- Total: 60 beauty enhancements

## Common Use Cases

### Use Case 1: Virtual Hair Salon
```typescript
// User upload foto, pilih gaya rambut baru
const tryNewHairStyle = async (photo: string, styleId: string) => {
  const { data } = await supabase.functions.invoke('generate-enhanced-image', {
    body: {
      imageUrl: photo,
      enhancementIds: [styleId],
      classification: 'beauty'
    }
  });
  return data.generatedImageUrl;
};
```

### Use Case 2: Virtual Makeup Try-On
```typescript
// User coba berbagai warna lipstik
const tryLipstickColor = async (photo: string, color: string) => {
  const { data } = await supabase.functions.invoke('generate-enhanced-image', {
    body: {
      imageUrl: photo,
      enhancementIds: ['makeup_bold_red_lips'],
      classification: 'beauty',
      customPrompt: color
    }
  });
  return data.generatedImageUrl;
};
```

### Use Case 3: Complete Makeover
```typescript
// Hair + makeup sekaligus
const completeMakeover = async (
  photo: string, 
  hairStyleId: string,
  makeupIds: string[],
  customColors: string
) => {
  const { data } = await supabase.functions.invoke('generate-enhanced-image', {
    body: {
      imageUrl: photo,
      enhancementIds: [hairStyleId, ...makeupIds],
      classification: 'beauty',
      customPrompt: customColors
    }
  });
  return data.generatedImageUrl;
};
```

## Tips & Best Practices

### 1. Image Quality
- ✅ Gunakan foto portrait dengan wajah jelas
- ✅ Pencahayaan yang baik
- ✅ Resolusi minimal 512x512px
- ❌ Hindari foto blur atau gelap

### 2. Gender Detection
- Sistem otomatis detect gender
- Jika salah, bisa manual override
- Default ke female jika tidak terdeteksi

### 3. Custom Colors
- Gunakan deskripsi spesifik: "soft pink", "burgundy red"
- Bisa combine multiple colors: "pink lips, gold eyeshadow"
- Check `supports_custom_prompt` field

### 4. Multiple Enhancements
- Maksimal 3-4 enhancements untuk hasil optimal
- Combine hair + makeup works well
- Terlalu banyak enhancement bisa konflik

## Troubleshooting

### Problem: Gender detection salah
**Solution:** Force gender di request
```typescript
const { data } = await supabase.functions.invoke('classify-beauty', {
  body: { 
    imageUrl: '...',
    forceGender: 'male' // or 'female'
  }
});
```

### Problem: Custom color tidak terpakai
**Solution:** Check enhancement support custom prompt
```typescript
// Check field supports_custom_prompt
if (enhancement.supports_custom_prompt) {
  // Bisa pakai customPrompt
}
```

### Problem: Enhancement tidak muncul
**Solution:** Check database
```sql
SELECT * FROM enhancement_prompts 
WHERE enhancement_type = 'makeup_bold_red_lips';
-- Check is_active = true
```

## Next Steps

1. ✅ Setup database (SQL)
2. ✅ Deploy edge functions
3. ✅ Test API endpoints
4. 🔄 Build frontend UI
5. 🔄 Add to main menu
6. 🔄 User testing

## Support

Butuh bantuan?
- 📖 Full Guide: `BEAUTY_ENHANCEMENT_GUIDE.md`
- 💬 WhatsApp: +62 896-8761-0639
- 📧 Email: support@pixelnova.ai

---

**Ready to go!** 🚀

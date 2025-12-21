# Beauty Enhancement Guide 💄

## Overview

Beauty Enhancement adalah fitur baru yang memungkinkan transformasi hair style dan makeup pada foto portrait. Sistem ini menggunakan AI untuk mendeteksi gender dan memberikan pilihan enhancement yang sesuai.

## Kategori Beauty

### 1. Hair Style - Male (15 Styles)
Pilihan gaya rambut untuk pria:

- **💇‍♂️ Classic Pompadour** - Gaya rambut pompadour klasik dengan volume di atas
- **💇‍♂️ Modern Undercut** - Undercut modern dengan sisi pendek
- **💇‍♂️ Fade Haircut** - Potongan fade dengan gradasi
- **💇‍♂️ Crew Cut** - Crew cut pendek dan rapi
- **💇‍♂️ Textured Quiff** - Quiff bertekstur dengan volume
- **💇‍♂️ Slick Back** - Rambut disisir ke belakang
- **💇‍♂️ Side Part** - Side part klasik profesional
- **💇‍♂️ Messy Textured** - Gaya messy natural
- **💇‍♂️ Buzz Cut** - Buzz cut sangat pendek
- **💇‍♂️ Man Bun** - Man bun modern
- **💇‍♂️ Curly Top** - Rambut keriting di atas
- **💇‍♂️ French Crop** - French crop modern
- **💇‍♂️ Mohawk/Faux Hawk** - Mohawk berani
- **💇‍♂️ Ivy League** - Ivy League sophisticated
- **💇‍♂️ Spiky Hair** - Rambut spike berdiri

### 2. Hair Style - Female (20 Styles)
Pilihan gaya rambut untuk wanita:

- **💇‍♀️ Long Straight Hair** - Rambut panjang lurus mengkilap
- **💇‍♀️ Beach Waves** - Beach waves natural
- **💇‍♀️ Voluminous Curls** - Rambut keriting voluminous
- **💇‍♀️ Bob Cut** - Bob cut modern
- **💇‍♀️ Pixie Cut** - Pixie cut pendek
- **💇‍♀️ Layered Cut** - Potongan layer bertingkat
- **💇‍♀️ High Ponytail** - Ponytail tinggi
- **💇‍♀️ Messy Bun** - Messy bun chic
- **💇‍♀️ Braided Hair** - Gaya rambut kepang
- **💇‍♀️ Half-Up Half-Down** - Half-up half-down
- **💇‍♀️ Sleek Low Bun** - Low bun elegant
- **💇‍♀️ Side Swept** - Side swept glamor
- **💇‍♀️ Bangs/Fringe** - Tambahkan poni/fringe
- **💇‍♀️ Balayage Highlights** - Highlight balayage
- **💇‍♀️ Ombre Color** - Warna ombre gradasi
- **💇‍♀️ Vintage Hollywood Waves** - Vintage Hollywood waves
- **💇‍♀️ Shag Cut** - Shag cut bertekstur
- **💇‍♀️ Top Knot** - Top knot modern
- **💇‍♀️ Space Buns** - Space buns playful
- **💇‍♀️ Ultra Sleek Straight** - Ultra sleek straight

### 3. Make Up (25 Options)
Pilihan makeup dengan dukungan custom prompt untuk warna:

#### Face Makeup
- **💄 Natural Makeup Look** - Makeup natural sehari-hari
- **💄 Glamorous Evening Makeup** - Makeup glamor malam
- **✨ Contour & Highlight** - Contour dan highlight profesional
- **✨ Dewy Glowing Skin** - Kulit glowing dewy
- **✨ Matte Flawless Skin** - Kulit matte flawless
- **🌸 Rosy Blush Cheeks** - Blush on pipi merona (custom warna)
- **🌸 Bronzed Sun-Kissed** - Bronzer sun-kissed

#### Eye Makeup
- **💄 Smokey Eyes** - Smokey eyes dramatis
- **👁️ Cat Eye Liner** - Eyeliner cat eye
- **👁️ Natural Eye Makeup** - Makeup mata natural
- **👁️ Colorful Eye Makeup** - Makeup mata warna-warni (custom warna)
- **👁️ Glitter Eye Makeup** - Makeup mata glitter
- **👁️ Cut Crease Eye** - Cut crease dramatis

#### Lip Makeup (Mendukung Custom Warna)
- **💋 Bold Red Lips** - Lipstik merah bold
- **💋 Nude/Natural Lips** - Lipstik nude natural
- **💋 Pink Lips** - Lipstik pink
- **💋 Berry/Plum Lips** - Lipstik berry/plum
- **💋 Glossy Lips** - Lipstik glossy mengkilap
- **💋 Matte Lips** - Lipstik matte

#### Style Makeup
- **🎀 Korean Beauty Style** - Makeup style Korea
- **🎨 Editorial/Artistic Makeup** - Makeup editorial artistik
- **👰 Bridal Makeup** - Makeup pengantin
- **✨ No-Makeup Makeup** - Makeup natural "no-makeup"
- **🎉 Festival/Party Makeup** - Makeup festival fun
- **🕰️ Vintage/Retro Makeup** - Makeup vintage retro

## Custom Prompt Support

Beberapa enhancement makeup mendukung custom prompt untuk spesifikasi warna:

### Contoh Custom Prompt untuk Lipstik:
```json
{
  "enhancementIds": ["makeup_bold_red_lips"],
  "customPrompt": "dark burgundy red with matte finish"
}
```

### Contoh Custom Prompt untuk Eye Makeup:
```json
{
  "enhancementIds": ["makeup_colorful_eye"],
  "customPrompt": "purple and gold eyeshadow with shimmer"
}
```

### Contoh Custom Prompt untuk Blush:
```json
{
  "enhancementIds": ["makeup_rosy_cheeks"],
  "customPrompt": "peachy coral blush"
}
```

## API Endpoints

### 1. Classify Beauty Image (Deteksi Gender)

**Endpoint:** `POST /classify-beauty`

**Request:**
```json
{
  "imageUrl": "https://example.com/portrait.jpg"
}
```

**Response:**
```json
{
  "classification": "beauty",
  "gender": "female",
  "detectedLabel": "woman",
  "classificationSuccess": true,
  "subcategories": {
    "hair_style": [
      {
        "id": "uuid",
        "enhancement_type": "hair_style_female_long_straight",
        "display_name": "💇‍♀️ Long Straight Hair",
        "description": "Rambut panjang lurus mengkilap",
        "supports_custom_prompt": false
      }
    ],
    "makeup": [
      {
        "id": "uuid",
        "enhancement_type": "makeup_natural_look",
        "display_name": "💄 Natural Makeup Look",
        "description": "Makeup natural sehari-hari",
        "supports_custom_prompt": true
      }
    ]
  },
  "enhancementOptions": [...]
}
```

### 2. Generate Beauty Enhancement

**Endpoint:** `POST /generate-enhanced-image`

**Request (Hair Style):**
```json
{
  "imageUrl": "https://example.com/portrait.jpg",
  "enhancementIds": ["hair_style_female_beach_waves"],
  "classification": "beauty"
}
```

**Request (Makeup dengan Custom Prompt):**
```json
{
  "imageUrl": "https://example.com/portrait.jpg",
  "enhancementIds": ["makeup_bold_red_lips", "makeup_smokey_eyes"],
  "classification": "beauty",
  "customPrompt": "deep wine red lipstick with matte finish"
}
```

**Request (Multiple Enhancements):**
```json
{
  "imageUrl": "https://example.com/portrait.jpg",
  "enhancementIds": [
    "hair_style_female_beach_waves",
    "makeup_natural_look",
    "makeup_pink_lips"
  ],
  "classification": "beauty",
  "customPrompt": "soft pink lipstick, rose gold eyeshadow"
}
```

**Response:**
```json
{
  "generatedImageUrl": "https://storage.supabase.co/...",
  "prompt": "Transform the hairstyle to beach waves..."
}
```

## Frontend Integration

### 1. Classify Image untuk Beauty
```typescript
const classifyBeautyImage = async (imageUrl: string) => {
  const response = await supabase.functions.invoke('classify-beauty', {
    body: { imageUrl }
  });
  
  return response.data;
};
```

### 2. Generate dengan Hair Style
```typescript
const generateHairStyle = async (imageUrl: string, enhancementId: string) => {
  const response = await supabase.functions.invoke('generate-enhanced-image', {
    body: {
      imageUrl,
      enhancementIds: [enhancementId],
      classification: 'beauty'
    }
  });
  
  return response.data;
};
```

### 3. Generate dengan Makeup + Custom Color
```typescript
const generateMakeup = async (
  imageUrl: string, 
  enhancementId: string,
  customColor: string
) => {
  const response = await supabase.functions.invoke('generate-enhanced-image', {
    body: {
      imageUrl,
      enhancementIds: [enhancementId],
      classification: 'beauty',
      customPrompt: customColor
    }
  });
  
  return response.data;
};
```

### 4. UI Component Example
```typescript
// Beauty Enhancement Selector
const BeautyEnhancementSelector = ({ gender, onSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState('hair_style');
  const [customColor, setCustomColor] = useState('');
  
  return (
    <div>
      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          <TabsTrigger value="hair_style">
            Hair Style
          </TabsTrigger>
          <TabsTrigger value="makeup">
            Make Up
          </TabsTrigger>
        </TabsList>
        
        {/* Hair Style Options */}
        <TabsContent value="hair_style">
          {gender === 'male' ? (
            <MaleHairStyleOptions onSelect={onSelect} />
          ) : (
            <FemaleHairStyleOptions onSelect={onSelect} />
          )}
        </TabsContent>
        
        {/* Makeup Options */}
        <TabsContent value="makeup">
          <MakeupOptions 
            onSelect={onSelect}
            customColor={customColor}
            onColorChange={setCustomColor}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

## Database Schema

### Enhancement Prompts Table
```sql
CREATE TABLE enhancement_prompts (
  id UUID PRIMARY KEY,
  enhancement_type TEXT UNIQUE,
  display_name TEXT,
  prompt_template TEXT,
  description TEXT,
  category TEXT, -- 'hair_style_male', 'hair_style_female', 'makeup'
  sort_order INTEGER,
  supports_custom_prompt BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true
);
```

### Category Enhancements Mapping
```sql
CREATE TABLE category_enhancements (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES image_categories(id),
  enhancement_id UUID REFERENCES enhancement_prompts(id),
  sort_order INTEGER,
  UNIQUE(category_id, enhancement_id)
);
```

## Testing

### 1. Test Gender Detection
```bash
curl -X POST https://your-project.supabase.co/functions/v1/classify-beauty \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "imageUrl": "https://example.com/male-portrait.jpg"
  }'
```

### 2. Test Hair Style Generation
```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-enhanced-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "imageUrl": "https://example.com/portrait.jpg",
    "enhancementIds": ["hair_style_female_beach_waves"],
    "classification": "beauty"
  }'
```

### 3. Test Makeup with Custom Color
```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-enhanced-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "imageUrl": "https://example.com/portrait.jpg",
    "enhancementIds": ["makeup_bold_red_lips"],
    "classification": "beauty",
    "customPrompt": "burgundy red with matte finish"
  }'
```

## Best Practices

### 1. Gender Detection
- Sistem otomatis mendeteksi gender dari foto
- Default ke female jika tidak terdeteksi
- User bisa manual override jika deteksi salah

### 2. Custom Prompt
- Gunakan deskripsi warna yang spesifik
- Contoh bagus: "soft pink", "deep burgundy", "coral peach"
- Hindari deskripsi ambigu: "nice color", "pretty"

### 3. Multiple Enhancements
- Bisa combine hair style + makeup
- Maksimal 3-4 enhancements sekaligus untuk hasil optimal
- Contoh: beach waves + natural makeup + pink lips

### 4. Image Quality
- Gunakan foto portrait dengan wajah jelas
- Pencahayaan yang baik
- Resolusi minimal 512x512px

## Troubleshooting

### Gender Detection Salah
**Solusi:** Tambahkan parameter `forceGender` di request:
```json
{
  "imageUrl": "...",
  "forceGender": "male"
}
```

### Custom Color Tidak Terpakai
**Pastikan:**
- Enhancement yang dipilih support custom prompt
- Check field `supports_custom_prompt: true`
- Format customPrompt sudah benar

### Enhancement Tidak Muncul
**Check:**
1. SQL sudah dijalankan dengan benar
2. Category mapping sudah dibuat
3. Enhancement is_active = true

## Roadmap

### Phase 1 (Current)
- ✅ Gender detection
- ✅ Hair style enhancements (male & female)
- ✅ Makeup enhancements
- ✅ Custom color support

### Phase 2 (Planned)
- 🔄 Face shape detection untuk rekomendasi hair style
- 🔄 Skin tone detection untuk rekomendasi makeup
- 🔄 Virtual try-on untuk accessories
- 🔄 Before/After comparison slider

### Phase 3 (Future)
- 📋 AI-powered style recommendations
- 📋 Seasonal trend suggestions
- 📋 Celebrity look-alike styling
- 📋 Video support untuk hair/makeup tutorials

## Support

Untuk bantuan lebih lanjut:
- WhatsApp: +62 896-8761-0639
- Email: support@pixelnova.ai
- Documentation: https://docs.pixelnova.ai

---

**Last Updated:** December 2025
**Version:** 1.0.0

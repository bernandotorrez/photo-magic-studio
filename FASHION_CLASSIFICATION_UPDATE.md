# Fashion Classification Update - Hugging Face Integration

## Perubahan

### Sebelumnya:
- `classify-fashion` hanya return kategori "fashion" generic
- Enhancement options sama untuk semua produk fashion
- Tidak ada emoji di enhancement options

### Sekarang:
- ✅ Menggunakan **Hugging Face API** untuk klasifikasi gambar
- ✅ Membedakan **11 kategori**: `clothing`, `shoes`, `bags`, `accessories`, `jewelry`, `headwear`, `eyewear`, `beauty`, `electronics`, `home`, `sports`, `kids`
- ✅ Enhancement options **spesifik per kategori**
- ✅ Semua enhancement options memiliki **emoji yang sesuai**

## Kategori Fashion & Product

Sekarang mendukung **11 kategori** produk fashion, beauty, electronics, dan lifestyle:

### 1. Clothing (Pakaian)
**Deteksi:** shirt, dress, jacket, coat, sweater, jeans, pants, skirt, blouse, hoodie, cardigan, suit, vest, polo, t-shirt, shorts, legging, swimsuit

**Enhancement Options:**
- 👗 Dipakai oleh Model Wanita
- 🧕 Dipakai oleh Model Wanita Berhijab
- 👔 Dipakai oleh Model Pria
- 📸 Foto Lifestyle dengan Model
- 🎭 Ditampilkan pada Manekin
- 🔎 Foto Close-up Detail
- 🎨 Buat Varian Warna
- ✨ Ubah Material/Tekstur
- 🔄 Generate 360° View
- 📏 Tampilkan Size Comparison

### 2. Shoes (Sepatu)
**Deteksi:** shoe, boot, sneaker, sandal, heel, slipper, loafer, oxford, moccasin

**Enhancement Options:**
- 👟 On-Feet Shot (Dipakai di Kaki)
- 👗 Dipakai oleh Model Wanita
- 👔 Dipakai oleh Model Pria
- 📸 Foto Lifestyle dengan Model
- 🔎 Detail Close-up (Tekstur & Material)
- 🎨 Buat Varian Warna
- 🔄 Generate 360° View
- 📏 Tampilkan Size Comparison
- ✨ Highlight Fitur Khusus
- 🌟 Professional Product Shot

### 3. Bags (Tas)
**Deteksi:** bag, purse, backpack, wallet, handbag, clutch, tote, satchel, briefcase, luggage, suitcase

**Enhancement Options:**
- 👜 Dipakai oleh Model (Shoulder/Hand)
- 👗 Dipakai oleh Model Wanita
- 👔 Dipakai oleh Model Pria
- 📸 Foto Lifestyle dengan Model
- 🔎 Detail Close-up (Tekstur & Hardware)
- 🎨 Buat Varian Warna
- 🔄 Generate 360° View
- 📏 Tampilkan Size Comparison
- ✨ Highlight Kompartemen Interior
- 🌟 Professional Product Shot

### 4. Accessories (Aksesoris)
**Deteksi:** tie, scarf, belt, glove, sock, stocking, bandana, bow tie, suspender

**Enhancement Options:**
- 🧤 Dipakai oleh Model
- 👗 Dipakai oleh Model Wanita
- 👔 Dipakai oleh Model Pria
- 📸 Foto Lifestyle dengan Model
- 🔎 Detail Close-up (Material & Detail)
- 🎨 Buat Varian Warna
- ✨ Highlight Fitur Khusus
- 🌟 Professional Product Shot

### 5. Jewelry (Perhiasan)
**Deteksi:** watch, bracelet, necklace, ring, earring, jewelry, pendant, chain, brooch, anklet, cufflink

**Enhancement Options:**
- 💍 Dipakai di Jari/Tangan
- 📿 Dipakai di Leher
- ⌚ Dipakai di Pergelangan Tangan
- 👂 Dipakai di Telinga
- 👗 Dipakai oleh Model Wanita
- 👔 Dipakai oleh Model Pria
- 📸 Foto Lifestyle dengan Model
- 🔎 Detail Close-up (Gemstone & Craftsmanship)
- 💎 Luxury Jewelry Styling
- ✨ Highlight Sparkle & Shine
- 🎨 Buat Varian Material (Gold/Silver/Rose Gold)
- 🌟 Professional Product Shot

### 6. Headwear (Topi)
**Deteksi:** hat, cap, beanie, helmet, beret, fedora, visor, turban

**Enhancement Options:**
- 🎩 Dipakai di Kepala Model
- 👗 Dipakai oleh Model Wanita
- 👔 Dipakai oleh Model Pria
- 📸 Foto Lifestyle dengan Model
- 🔎 Detail Close-up (Material & Logo)
- 🎨 Buat Varian Warna
- 🔄 Generate 360° View
- ✨ Highlight Fitur Khusus
- 🌟 Professional Product Shot

### 7. Eyewear (Kacamata)
**Deteksi:** sunglasses, glasses, eyewear, spectacle, goggles

**Enhancement Options:**
- 👓 Dipakai di Wajah Model
- 👗 Dipakai oleh Model Wanita
- 👔 Dipakai oleh Model Pria
- 📸 Foto Lifestyle dengan Model
- 🔎 Detail Close-up (Frame & Lensa)
- 🎨 Buat Varian Warna Frame
- ✨ Highlight Material & Design
- 🌟 Professional Product Shot

### 8. Beauty & Cosmetics (Parfum, Makeup, Skincare)
**Deteksi:** perfume, bottle, cosmetic, lotion, cream, lipstick, makeup, fragrance, serum, moisturizer, foundation, powder, mascara, eyeliner, blush

**Enhancement Options:**
- 💄 Digunakan oleh Model (Makeup/Skincare)
- 👗 Dipakai oleh Model Wanita
- 👔 Dipakai oleh Model Pria
- 📸 Foto Lifestyle dengan Model
- 🔎 Detail Close-up (Tekstur & Packaging)
- ✨ Highlight Ingredients & Benefits
- 🎨 Buat Varian Warna/Shade
- 🔄 Generate 360° View
- 📏 Tampilkan Size Comparison
- 🌟 Professional Product Shot
- 💎 Luxury Product Styling
- 🌸 Natural/Organic Aesthetic

### 9. Electronics & Gadgets
**Deteksi:** phone, laptop, tablet, headphone, earphone, speaker, camera, keyboard, mouse, charger, cable, gadget, smartwatch, airpod

**Enhancement Options:**
- 📱 Digunakan oleh Model
- 👗 Dipakai oleh Model Wanita
- 👔 Dipakai oleh Model Pria
- 📸 Foto Lifestyle dengan Model
- 🔎 Detail Close-up (Features & Specs)
- ✨ Highlight Tech Features
- 🎨 Buat Varian Warna
- 🔄 Generate 360° View
- 📏 Tampilkan Size Comparison
- 🌟 Professional Product Shot
- 💻 Tech Product Styling
- ⚡ Modern/Futuristic Look

### 10. Home & Living
**Deteksi:** pillow, cushion, blanket, towel, rug, mat, curtain, lamp, vase, candle, frame, clock, mirror, basket

**Enhancement Options:**
- 🏠 Tampilkan dalam Setting Rumah
- 📸 Foto Lifestyle dengan Model
- 🔎 Detail Close-up (Tekstur & Material)
- ✨ Highlight Quality & Comfort
- 🎨 Buat Varian Warna/Pattern
- 🔄 Generate 360° View
- 📏 Tampilkan Size Comparison
- 🌟 Professional Product Shot
- 🛋️ Cozy Home Aesthetic
- 🌿 Natural/Minimalist Style

### 11. Sports & Fitness
**Deteksi:** dumbbell, yoga, fitness, sport, ball, racket, gym, exercise, athletic

**Enhancement Options:**
- 🏃 Digunakan saat Olahraga
- 💪 Dipakai oleh Atlet/Model
- 👗 Dipakai oleh Model Wanita
- 👔 Dipakai oleh Model Pria
- 📸 Foto Lifestyle dengan Model
- 🔎 Detail Close-up (Material & Technology)
- ✨ Highlight Performance Features
- 🎨 Buat Varian Warna
- 🔄 Generate 360° View
- 🌟 Professional Product Shot
- ⚡ Dynamic Action Shot
- 🏋️ Gym/Fitness Setting

### 12. Kids & Baby Products
**Deteksi:** toy, baby, kid, child, stroller, diaper, bottle, pacifier

**Enhancement Options:**
- 👶 Digunakan oleh Anak/Baby
- 👨‍👩‍👧 Foto dengan Orang Tua
- 📸 Foto Lifestyle dengan Model
- 🔎 Detail Close-up (Safety & Quality)
- ✨ Highlight Safety Features
- 🎨 Buat Varian Warna
- 🔄 Generate 360° View
- 📏 Tampilkan Size Comparison
- 🌟 Professional Product Shot
- 🎈 Fun & Playful Aesthetic
- 🌈 Colorful & Cheerful Look

## Base Enhancements (Semua Kategori)

Setiap kategori juga mendapat base enhancements dengan emoji:
- ✨ Tingkatkan Kualitas Gambar
- 💡 Perbaiki Pencahayaan
- 🎨 Hapus Background
- 🌈 Sesuaikan Warna
- ✂️ Crop & Center
- 🌑 Tambah Bayangan
- 🔍 Pertajam Detail
- ⚖️ White Balance
- ☀️ Sesuaikan Brightness
- 📊 Tingkatkan Kontras

## Implementasi

### Hugging Face API Integration
```typescript
// Fetch image
const imageResponse = await fetch(imageUrl);
const imageBlob = await imageResponse.blob();
const imageBuffer = await imageBlob.arrayBuffer();

// Classify with Hugging Face
const response = await fetch('https://router.huggingface.co/hf-inference/models/google/vit-base-patch16-224', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
    'Content-Type': imageBlob.type || 'image/jpeg',
  },
  body: imageBuffer,
});

// Map labels to categories
const data = await response.json();
const topLabel = data[0].label.toLowerCase();

if (topLabel.includes('shirt') || topLabel.includes('dress')) {
  category = 'clothing';
} else if (topLabel.includes('shoe')) {
  category = 'shoes';
}
// ... etc
```

### Category-Specific Options
```typescript
switch (category) {
  case 'clothing':
    enhancementOptions = [
      '👗 Dipakai oleh Model Wanita',
      '🧕 Dipakai oleh Model Wanita Berhijab',
      // ... clothing-specific options
      ...BASE_ENHANCEMENTS,
    ];
    break;
    
  case 'shoes':
    enhancementOptions = [
      '👟 On-Feet Shot (Dipakai di Kaki)',
      // ... shoes-specific options
      ...BASE_ENHANCEMENTS,
    ];
    break;
  // ... other categories
}
```

## Benefits

✅ **Klasifikasi Akurat:** Menggunakan Hugging Face Vision Transformer model
✅ **Enhancement Relevan:** Setiap kategori mendapat options yang sesuai
✅ **User Experience:** Emoji membuat options lebih visual dan mudah dipahami
✅ **Flexibility:** Mudah menambah kategori baru
✅ **Fallback:** Jika klasifikasi gagal, gunakan default category

## Testing

1. **Upload Clothing:**
   - Hasil: kategori "clothing"
   - Options: Model wanita/pria, manekin, varian warna, dll

2. **Upload Shoes:**
   - Hasil: kategori "shoes"
   - Options: On-feet shot, detail close-up, 360° view, dll

3. **Upload Jewelry (Watch/Necklace):**
   - Hasil: kategori "jewelry"
   - Options: Dipakai di pergelangan/leher, luxury styling, dll

4. **Upload Bags:**
   - Hasil: kategori "bags"
   - Options: Dipakai di shoulder, detail hardware, interior, dll

5. **Upload Hat:**
   - Hasil: kategori "headwear"
   - Options: Dipakai di kepala, detail logo, dll

6. **Upload Sunglasses:**
   - Hasil: kategori "eyewear"
   - Options: Dipakai di wajah, detail frame, dll

7. **Upload Parfum/Kosmetik:**
   - Hasil: kategori "beauty"
   - Options: Digunakan model, detail packaging, luxury styling, dll

8. **Upload Headphone/Gadget:**
   - Hasil: kategori "electronics"
   - Options: Digunakan model, tech features, modern look, dll

9. **Upload Pillow/Home Decor:**
   - Hasil: kategori "home"
   - Options: Setting rumah, cozy aesthetic, natural style, dll

10. **Upload Dumbbell/Sports Equipment:**
    - Hasil: kategori "sports"
    - Options: Action shot, gym setting, performance features, dll

11. **Upload Toy/Baby Product:**
    - Hasil: kategori "kids"
    - Options: Digunakan anak, safety features, playful aesthetic, dll

## Environment Variable

Pastikan `HUGGING_FACE_API_KEY` sudah di-set di Supabase Edge Functions:
```bash
supabase secrets set HUGGING_FACE_API_KEY=your_api_key_here
```

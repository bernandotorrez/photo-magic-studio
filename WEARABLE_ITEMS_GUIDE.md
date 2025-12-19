# Panduan Wearable Items dengan Model

## Overview

Sistem sekarang mendukung penggunaan model untuk semua produk wearable (yang bisa dipakai). AI akan menggunakan model assets sebagai reference untuk menghasilkan gambar yang konsisten.

## Kategori Produk yang Didukung

### 1. Clothing (Pakaian)

**Produk:**
- Baju (T-shirt, kemeja, blouse, dll)
- Celana (jeans, chinos, rok, dll)
- Dress
- Jaket & Outerwear
- Pakaian dalam

**Enhancement Options:**
- ✅ **Digunakan oleh Model Manusia (Male)** - Model pria memakai pakaian
- ✅ **Digunakan oleh Model Manusia (Female)** - Model wanita memakai pakaian
- ✅ **Digunakan oleh Model Manusia (Female with Hijab)** - Model wanita berhijab memakai pakaian
- ✅ **Digunakan oleh Model (Manekin)** - Pakaian dipasang di manekin
- ✅ **Lifestyle shot dengan model manusia** - Model memakai pakaian dalam setting natural

**Contoh Prompt AI:**
```
Use the model from reference image. Place the clothing item on this model, 
maintaining exact pose and appearance. Studio lighting with clean background.
```

---

### 2. Shoes (Sepatu)

**Produk:**
- Sepatu sneakers
- Sepatu formal
- Sandal
- Boots
- High heels

**Enhancement Options:**
- ✅ **Digunakan oleh Model Manusia (Male/Female)** - Model memakai sepatu
- ✅ **Close-up saat dipakai (On-feet)** - Fokus pada sepatu yang sedang dipakai
- ✅ **Lifestyle shot dengan model manusia** - Model memakai sepatu dalam aktivitas

**Contoh Prompt AI:**
```
Use the model from reference image. Show the shoes being worn on the model's feet. 
Focus on the shoes while showing them in use. Natural standing pose.
```

---

### 3. Accessories (Aksesoris)

#### 3.1 Kalung (Necklace)

**Enhancement Options:**
- ✅ **Dipakai di bagian tubuh relevan (Leher)** - Kalung dipakai di leher model
- ✅ **Digunakan oleh Model Manusia (Female)** - Model wanita memakai kalung

**Contoh Prompt AI:**
```
Use the model from reference image. Show the necklace being worn on the model's neck. 
The model should be in an elegant pose that showcases the necklace naturally.
```

#### 3.2 Gelang (Bracelet)

**Enhancement Options:**
- ✅ **Dipakai di bagian tubuh relevan (Pergelangan)** - Gelang dipakai di pergelangan tangan
- ✅ **Digunakan oleh Model Manusia (Female)** - Model wanita memakai gelang

**Contoh Prompt AI:**
```
Use the model from reference image. Show the bracelet being worn on the model's wrist. 
Focus on the bracelet while showing it in use.
```

#### 3.3 Cincin (Ring)

**Enhancement Options:**
- ✅ **Dipakai di bagian tubuh relevan (Jari)** - Cincin dipakai di jari model

**Contoh Prompt AI:**
```
Use the model from reference image. Show the ring being worn on the model's finger. 
Elegant hand pose that showcases the ring naturally.
```

#### 3.4 Anting (Earring)

**Enhancement Options:**
- ✅ **Dipakai di bagian tubuh relevan (Telinga)** - Anting dipakai di telinga model

**Contoh Prompt AI:**
```
Use the model from reference image. Show the earring being worn on the model's ear. 
Side profile or three-quarter view that showcases the earring.
```

#### 3.5 Topi (Hat)

**Enhancement Options:**
- ✅ **Dipakai di bagian tubuh relevan (Kepala)** - Topi dipakai di kepala model
- ✅ **Digunakan oleh Model Manusia (Male/Female)** - Model memakai topi

**Contoh Prompt AI:**
```
Use the model from reference image. Show the hat being worn on the model's head. 
Natural pose that showcases the hat style.
```

#### 3.6 Jam Tangan (Watch)

**Enhancement Options:**
- ✅ **Dipakai di bagian tubuh relevan (Pergelangan)** - Jam dipakai di pergelangan tangan
- ✅ **Digunakan oleh Model Manusia (Male/Female)** - Model memakai jam tangan

**Contoh Prompt AI:**
```
Use the model from reference image. Show the watch being worn on the model's wrist. 
Focus on the watch while showing it in use.
```

---

## Cara Kerja Sistem

### 1. Upload & Classification
```
User upload gambar → AI classify produk → Sistem tentukan enhancement options
```

### 2. Enhancement Selection
```
User pilih enhancement → Sistem tentukan model yang sesuai → Build prompt dengan reference image
```

### 3. Image Generation
```
AI terima prompt + reference image → Generate gambar dengan model yang konsisten
```

---

## Model Assets yang Digunakan

Sistem menggunakan 3 model assets:

1. **model_male.png** - Model pria
   - Digunakan untuk: Clothing (male), Shoes (male), Accessories (male)
   
2. **model_female.png** - Model wanita
   - Digunakan untuk: Clothing (female), Shoes (female), Accessories (female)
   
3. **model_female_hijab.png** - Model wanita berhijab
   - Digunakan untuk: Clothing (female with hijab)

---

## Contoh Use Cases

### Use Case 1: Toko Baju Online
```
Produk: Kemeja pria
Enhancement: "Digunakan oleh Model Manusia (Male)"
Hasil: Kemeja dipakai oleh model pria dengan pose dan lighting profesional
```

### Use Case 2: Toko Sepatu
```
Produk: Sneakers
Enhancement: "Close-up saat dipakai (On-feet)"
Hasil: Sneakers dipakai di kaki model, fokus pada sepatu
```

### Use Case 3: Toko Aksesoris
```
Produk: Kalung emas
Enhancement: "Dipakai di bagian tubuh relevan (Leher)"
Hasil: Kalung dipakai di leher model wanita dengan pose elegan
```

### Use Case 4: Toko Fashion Muslimah
```
Produk: Gamis
Enhancement: "Digunakan oleh Model Manusia (Female with Hijab)"
Hasil: Gamis dipakai oleh model wanita berhijab
```

---

## Tips untuk Hasil Terbaik

### 1. Kualitas Gambar Input
- Upload gambar dengan resolusi tinggi (minimal 1024x1024px)
- Pastikan produk terlihat jelas
- Background bersih lebih baik

### 2. Pilih Enhancement yang Tepat
- **Clothing** → Gunakan model manusia atau manekin
- **Shoes** → Gunakan on-feet untuk menunjukkan fit
- **Accessories** → Gunakan "dipakai di bagian tubuh" untuk konteks

### 3. Model Assets
- Pastikan model assets sudah diupload ke Supabase Storage
- Gunakan gambar model dengan pose netral dan lighting baik
- Model harus terlihat profesional dan sesuai target market

---

## Troubleshooting

### Produk tidak terdeteksi dengan benar
**Solusi:** AI classification mungkin salah. Sistem tetap akan memberikan enhancement options umum.

### Model tidak muncul di hasil generate
**Solusi:** 
- Cek apakah model assets sudah diupload
- Verifikasi URL model assets bisa diakses
- Pastikan enhancement option yang dipilih memang menggunakan model

### Hasil tidak sesuai ekspektasi
**Solusi:**
- Coba enhancement option yang berbeda
- Pastikan gambar input berkualitas baik
- Ganti model assets jika perlu dengan yang lebih sesuai

---

## Menambah Kategori Baru

Jika ingin menambah kategori wearable baru (misalnya: tas, kacamata, ikat pinggang):

1. **Update classify-image function:**
   ```typescript
   const WEARABLE_WITH_HUMAN_MODEL = [
     'clothing', 'shoes', 'accessories', 'bags', 'eyewear', 'belts'
   ];
   ```

2. **Update buildEnhancementPrompt function:**
   ```typescript
   if (titleLower.includes('tas') || titleLower.includes('bag')) {
     return `Show the bag being carried by the model...`;
   }
   ```

3. **Test dengan produk baru**

---

## API Reference

### Enhancement Options Format

```typescript
interface EnhancementOption {
  id?: string;
  title: string;
  description?: string;
}
```

### Supported Enhancement Titles

- "Digunakan oleh Model Manusia (Male)"
- "Digunakan oleh Model Manusia (Female)"
- "Digunakan oleh Model Manusia (Female with Hijab)"
- "Digunakan oleh Model (Manekin)"
- "Close-up saat dipakai (On-feet)"
- "Dipakai di bagian tubuh relevan (Leher / Tangan / Pergelangan)"
- "Lifestyle shot dengan model manusia"

---

## Kesimpulan

Sistem sekarang mendukung berbagai macam wearable items dengan model yang konsisten. AI akan secara otomatis menentukan di mana menempatkan produk pada model berdasarkan jenis produk (kalung di leher, gelang di pergelangan, dll).

Untuk pertanyaan lebih lanjut, lihat dokumentasi:
- `MODEL_ASSETS_UPDATE.md` - Detail teknis implementasi
- `MODEL_ASSETS_SETUP.md` - Cara setup model assets
- `QUICK_START_MODEL_ASSETS.md` - Quick start guide

# Update: Penggunaan Model Assets dari Storage

## Perubahan yang Dilakukan

Sistem sekarang menggunakan model assets yang tersimpan di Supabase Storage sebagai reference untuk AI generate image, bukan lagi menggunakan deskripsi text.

### File yang Diubah

1. **supabase/functions/generate-enhanced-image/index.ts**
   - Fungsi `buildEnhancementPrompt()` sekarang menggunakan URL model assets dari Supabase Storage
   - Prompt AI sekarang menyertakan reference image URL untuk model male, female, dan female hijab
   - Model assets path:
     - Male: `/storage/v1/object/public/model-assets/model_male.png`
     - Female: `/storage/v1/object/public/model-assets/model_female.png`
     - Female Hijab: `/storage/v1/object/public/model-assets/model_female_hijab.png`

2. **supabase/migrations/20251218120000_model_assets_storage.sql** (Baru)
   - Membuat storage bucket `model-assets` dengan public access
   - Menambahkan policy untuk public read access
   - Menambahkan policy untuk authenticated users upload

3. **supabase/MODEL_ASSETS_SETUP.md** (Baru)
   - Dokumentasi lengkap cara upload model assets
   - Troubleshooting guide

4. **scripts/upload-model-assets.js** (Baru)
   - Script helper untuk upload model assets secara otomatis
   - Menggunakan Supabase Service Role Key

## Model Assets yang Digunakan

Model assets berasal dari folder `public/model/`:
- `model_male.png` - Model pria untuk clothing items
- `model_female.png` - Model wanita untuk clothing items
- `model_female_hijab.png` - Model wanita berhijab untuk clothing items

## Cara Setup

### 1. Jalankan Migration
```bash
# Jika menggunakan Supabase CLI
supabase db push

# Atau apply migration manual via Supabase Dashboard
```

### 2. Upload Model Assets

**Opsi A: Via Script (Recommended)**
```bash
node scripts/upload-model-assets.js
```

**Opsi B: Via Supabase Dashboard**
1. Buka Supabase Dashboard → Storage
2. Pilih bucket `model-assets`
3. Upload ketiga file dari `public/model/`

**Opsi C: Via Supabase CLI**
```bash
supabase storage cp public/model/model_male.png model-assets/model_male.png
supabase storage cp public/model/model_female.png model-assets/model_female.png
supabase storage cp public/model/model_female_hijab.png model-assets/model_female_hijab.png
```

### 3. Verifikasi
Akses URL berikut untuk memastikan model assets sudah terupload:
```
https://[PROJECT_REF].supabase.co/storage/v1/object/public/model-assets/model_male.png
https://[PROJECT_REF].supabase.co/storage/v1/object/public/model-assets/model_female.png
https://[PROJECT_REF].supabase.co/storage/v1/object/public/model-assets/model_female_hijab.png
```

## Cara Kerja

### Sebelum Update
```typescript
// Prompt hanya menggunakan deskripsi text
'add_male_model': 'Add a professional male model (age 25-30, Asian ethnicity...'
```

### Setelah Update
```typescript
// Prompt menggunakan reference image URL
'add_male_model': `Use the model from this reference image: ${modelAssets.male}. 
Place the product item on this male model, maintaining his exact pose and appearance...`
```

AI sekarang akan:
1. Melihat reference image dari model asset
2. Menggunakan pose dan appearance yang sama persis
3. Menempatkan product item pada model tersebut
4. Menghasilkan gambar yang lebih konsisten

## Produk yang Didukung

Sistem sekarang mendukung model untuk semua wearable items:

### Clothing (Pakaian)
- Baju, celana, dress, jaket, dll
- Enhancement: "Digunakan oleh Model Manusia (Male/Female/Female with Hijab)"
- Enhancement: "Digunakan oleh Model (Manekin)"

### Shoes (Sepatu)
- Sepatu, sandal, boots, dll
- Enhancement: "Digunakan oleh Model Manusia"
- Enhancement: "Close-up saat dipakai (On-feet)"

### Accessories (Aksesoris)
- **Kalung (Necklace)** - Dipakai di leher
- **Gelang (Bracelet)** - Dipakai di pergelangan tangan
- **Cincin (Ring)** - Dipakai di jari
- **Anting (Earring)** - Dipakai di telinga
- **Topi (Hat)** - Dipakai di kepala
- **Jam Tangan (Watch)** - Dipakai di pergelangan tangan
- Enhancement: "Dipakai di bagian tubuh relevan"
- Enhancement: "Digunakan oleh Model Manusia"

### Lifestyle Shot
- Semua produk wearable bisa menggunakan "Lifestyle shot dengan model manusia"
- Menampilkan produk dalam konteks penggunaan sehari-hari

## Keuntungan

✅ **Konsistensi**: Model yang dihasilkan selalu sama (pose, appearance, lighting)
✅ **Kualitas**: AI menggunakan reference image yang sudah dioptimasi
✅ **Kontrol**: Anda bisa mengganti model assets kapan saja dengan upload file baru
✅ **Fleksibilitas**: Mudah menambah model baru (misalnya model anak-anak, plus size, dll)
✅ **Multi-Kategori**: Mendukung clothing, shoes, accessories (kalung, gelang, topi, jam, dll)
✅ **Context-Aware**: AI tahu di mana menempatkan item (leher untuk kalung, pergelangan untuk gelang, dll)

## Mengganti Model Assets

Jika ingin mengganti model dengan yang baru:
1. Siapkan gambar model baru (format PNG, minimal 1024x1024px)
2. Upload ke bucket `model-assets` dengan nama yang sama (akan overwrite)
3. Atau upload dengan nama baru dan update `buildEnhancementPrompt()` function

## Environment Variables yang Dibutuhkan

Pastikan `.env` memiliki:
```env
VITE_SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Testing

Setelah setup selesai, test dengan berbagai produk:

### Test Clothing
1. Upload baju/celana/dress
2. Pilih enhancement "Digunakan oleh Model Manusia (Male/Female/Female with Hijab)"
3. Generate image
4. Hasil harus menggunakan model dari asset yang diupload

### Test Shoes
1. Upload sepatu
2. Pilih enhancement "Close-up saat dipakai (On-feet)"
3. Generate image
4. Hasil harus menampilkan sepatu dipakai di kaki model

### Test Accessories
1. Upload kalung/gelang/topi/jam tangan
2. Pilih enhancement "Dipakai di bagian tubuh relevan"
3. Generate image
4. Hasil harus menampilkan aksesoris dipakai di bagian tubuh yang sesuai:
   - Kalung → di leher
   - Gelang/Jam → di pergelangan tangan
   - Topi → di kepala
   - Cincin → di jari
   - Anting → di telinga

### Test Lifestyle
1. Upload produk wearable apapun
2. Pilih enhancement "Lifestyle shot dengan model manusia"
3. Generate image
4. Hasil harus menampilkan model menggunakan produk dalam setting natural

## Troubleshooting

Lihat file `supabase/MODEL_ASSETS_SETUP.md` untuk troubleshooting lengkap.

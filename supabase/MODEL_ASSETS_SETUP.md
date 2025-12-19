# Setup Model Assets

## Deskripsi
File ini menjelaskan cara mengupload model assets ke Supabase Storage agar dapat digunakan oleh AI untuk generate gambar dengan model.

## Model Assets yang Dibutuhkan
Lokasi file di project: `public/model/`

1. **Model Male**: `model_male.png`
2. **Model Female**: `model_female.png`
3. **Model Female Hijab**: `model_female_hijab.png`

## Cara Upload ke Supabase Storage

### Opsi 1: Via Supabase Dashboard (Recommended)
1. Buka Supabase Dashboard project Anda
2. Pergi ke **Storage** di sidebar
3. Pilih bucket **model-assets** (akan otomatis dibuat setelah migration dijalankan)
4. Klik **Upload Files**
5. Upload ketiga file model dari folder `public/model/`:
   - `model_male.png`
   - `model_female.png`
   - `model_female_hijab.png`
6. Pastikan file diupload langsung ke root bucket (bukan dalam subfolder)

### Opsi 2: Via Supabase CLI
```bash
# Upload model male
supabase storage cp public/model/model_male.png model-assets/model_male.png

# Upload model female
supabase storage cp public/model/model_female.png model-assets/model_female.png

# Upload model female hijab
supabase storage cp public/model/model_female_hijab.png model-assets/model_female_hijab.png
```

### Opsi 3: Via API (untuk automation)
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Upload model male
const malePath = 'public/model/model_male.png'
const maleFile = await fs.readFile(malePath)
await supabase.storage
  .from('model-assets')
  .upload('model_male.png', maleFile, {
    contentType: 'image/png',
    upsert: true
  })

// Ulangi untuk model female dan female hijab
```

## Verifikasi Upload
Setelah upload, Anda bisa mengakses model assets via URL:
- Male: `https://[PROJECT_REF].supabase.co/storage/v1/object/public/model-assets/model_male.png`
- Female: `https://[PROJECT_REF].supabase.co/storage/v1/object/public/model-assets/model_female.png`
- Female Hijab: `https://[PROJECT_REF].supabase.co/storage/v1/object/public/model-assets/model_female_hijab.png`

Ganti `[PROJECT_REF]` dengan project reference Anda.

## Cara Kerja
Setelah model assets diupload, fungsi `generate-enhanced-image` akan:
1. Mengambil URL model asset yang sesuai (male/female/female hijab)
2. Mengirim URL tersebut ke AI sebagai reference image
3. AI akan menggunakan model dari reference image untuk menempatkan clothing item
4. Hasil generate akan menggunakan pose dan appearance yang sama dengan model asset

## Troubleshooting

### Model tidak muncul di hasil generate
- Pastikan file sudah diupload dengan nama yang benar
- Cek apakah bucket `model-assets` sudah dibuat (jalankan migration)
- Verifikasi URL model asset bisa diakses secara public

### Error "Failed to fetch model asset"
- Pastikan bucket policy sudah di-set untuk public access
- Cek apakah SUPABASE_URL di environment variables sudah benar

### Model tidak sesuai dengan yang diharapkan
- Pastikan file yang diupload adalah file yang benar dari `public/model/`
- Cek ukuran dan kualitas gambar model (recommended: minimal 1024x1024px)

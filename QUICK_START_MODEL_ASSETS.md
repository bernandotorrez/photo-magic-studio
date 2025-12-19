# Quick Start: Setup Model Assets

## Langkah Cepat

### 1. Install Dependencies
```bash
npm install
```

### 2. Jalankan Migration
```bash
# Via Supabase CLI
supabase db push

# Atau copy-paste SQL dari file ini ke Supabase Dashboard SQL Editor:
# supabase/migrations/20251218120000_model_assets_storage.sql
```

### 3. Upload Model Assets
```bash
npm run upload-models
```

### 4. Selesai! 🎉

Sistem sekarang akan menggunakan model assets dari:
- `public/model/model_male.png`
- `public/model/model_female.png`
- `public/model/model_female_hijab.png`

## Verifikasi

Test dengan cara:
1. Login ke aplikasi
2. Upload gambar clothing item
3. Pilih enhancement "Add Male Model" atau "Add Female Model"
4. Generate
5. Hasil harus menggunakan model dari asset yang sudah diupload

## Troubleshooting

### Script upload gagal
- Pastikan `.env` memiliki `VITE_SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY`
- Pastikan migration sudah dijalankan (bucket `model-assets` harus sudah ada)

### Model tidak muncul di hasil generate
- Cek apakah file sudah terupload di Supabase Dashboard → Storage → model-assets
- Verifikasi URL bisa diakses: `https://[PROJECT_REF].supabase.co/storage/v1/object/public/model-assets/model_male.png`

## Dokumentasi Lengkap

Lihat `MODEL_ASSETS_UPDATE.md` untuk penjelasan detail.

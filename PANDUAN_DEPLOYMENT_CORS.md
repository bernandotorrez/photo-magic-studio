# 🚀 Panduan Deployment CORS Update

## Ringkasan Singkat

Semua 18 Edge Functions telah diupdate dengan CORS policy yang aman. Sekarang tinggal deploy ke Supabase.

---

## ⚡ Quick Deploy (Recommended)

### Opsi 1: Deploy via Supabase CLI (Tercepat)

```bash
# Login ke Supabase
supabase login

# Link project (jika belum)
supabase link --project-ref [your-project-ref]

# Deploy semua functions sekaligus
supabase functions deploy
```

**Selesai!** Semua 18 functions akan ter-deploy otomatis.

---

### Opsi 2: Deploy Manual via Dashboard

Jika tidak bisa pakai CLI, deploy manual satu per satu:

1. **Buka Supabase Dashboard**
   - https://supabase.com/dashboard
   - Pilih project Anda

2. **Masuk ke Edge Functions**
   - Klik "Edge Functions" di sidebar kiri

3. **Deploy Setiap Function**
   
   **Public APIs (2 functions):**
   - `api-generate`
   - `api-check-status`
   
   **Private APIs (16 functions):**
   - `classify-image`
   - `classify-fashion`
   - `classify-food`
   - `classify-portrait`
   - `classify-beauty`
   - `classify-interior`
   - `classify-exterior`
   - `generate-enhanced-image`
   - `get-enhancements-by-classification`
   - `get-presigned-url`
   - `create-api-key`
   - `get-users-list`
   - `verify-captcha`
   - `expire-subscription-tokens`
   - `send-verification-email`
   - (dan function lainnya)

4. **Cara Deploy Per Function:**
   - Klik nama function
   - Klik "Edit Function" atau "Deploy"
   - Copy-paste code dari `supabase/functions/[nama-function]/index.ts`
   - Klik "Deploy"
   - Tunggu sampai status "Deployed" ✅

---

## 🧪 Testing Setelah Deploy

### Test 1: Public API (Harus Berhasil dari Mana Saja)

```bash
curl -X POST https://[project-ref].supabase.co/functions/v1/api-generate \
  -H "x-api-key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/test.jpg",
    "enhancements": ["background_removal"]
  }'
```

**Expected:** Status 200 atau 202 (accepted)

---

### Test 2: Private API dari Origin yang Diizinkan

```bash
curl -X POST https://[project-ref].supabase.co/functions/v1/classify-image \
  -H "Origin: https://pixel-nova-ai.vercel.app" \
  -H "Authorization: Bearer your-supabase-token" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/test.jpg"
  }'
```

**Expected:** Status 200 dengan classification result

---

### Test 3: Private API dari Origin Tidak Diizinkan (Harus Ditolak)

```bash
curl -X POST https://[project-ref].supabase.co/functions/v1/classify-image \
  -H "Origin: https://unauthorized-site.com" \
  -H "Authorization: Bearer your-supabase-token" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/test.jpg"
  }'
```

**Expected:** CORS error atau 403 Forbidden

---

## ✅ Checklist Verifikasi

Setelah deploy, pastikan:

- [ ] Web app di `pixel-nova-ai.vercel.app` masih berfungsi normal
- [ ] Login/Register masih bisa
- [ ] Upload gambar masih bisa
- [ ] Generate gambar masih bisa
- [ ] Classification masih berfungsi
- [ ] API keys masih valid
- [ ] Development di localhost:5173 masih bisa akses
- [ ] External API calls (via API key) masih berfungsi

---

## 🔧 Troubleshooting

### Problem 1: "CORS Error" di Web App

**Penyebab:** Origin belum ditambahkan ke whitelist

**Solusi:**
1. Cek domain web app Anda
2. Tambahkan ke `ALLOWED_ORIGINS` di setiap Private API function:
   ```typescript
   const ALLOWED_ORIGINS = [
     'https://pixel-nova-ai.vercel.app',
     'https://ai-magic-photo.lovable.app',
     'https://your-new-domain.com',  // Tambahkan di sini
     'http://localhost:8080',
     'http://localhost:5173',
   ];
   ```
3. Re-deploy function yang diupdate

---

### Problem 2: "API Key Invalid" di Public API

**Penyebab:** API key tidak dikirim dengan benar

**Solusi:**
- Pastikan header `x-api-key` ada
- Cek API key masih aktif di database
- Verify format: `x-api-key: pk_xxxxxxxxxxxxx`

---

### Problem 3: Rate Limit Exceeded

**Penyebab:** Lebih dari 60 requests per menit ke api-generate

**Solusi:**
- Tunggu 1 menit
- Atau adjust rate limit di `api-generate/index.ts`:
  ```typescript
  const RATE_LIMIT = 100; // Naikkan dari 60 ke 100
  ```

---

### Problem 4: Function Tidak Ter-deploy

**Penyebab:** Syntax error atau missing dependencies

**Solusi:**
1. Check logs di Supabase Dashboard
2. Verify syntax dengan:
   ```bash
   deno check supabase/functions/[nama-function]/index.ts
   ```
3. Fix errors dan re-deploy

---

## 📊 Monitoring

### Check Function Logs:

1. Buka Supabase Dashboard
2. Klik "Edge Functions"
3. Pilih function
4. Klik "Logs" tab
5. Monitor untuk errors atau CORS rejections

### Metrics to Watch:

- **Request Count:** Berapa banyak requests per function
- **Error Rate:** Persentase requests yang gagal
- **CORS Rejections:** Requests dari unauthorized origins
- **Rate Limit Hits:** Berapa kali rate limit tercapai

---

## 🎯 Rollback Plan (Jika Ada Masalah)

Jika setelah deploy ada masalah kritis:

### Quick Rollback:

1. **Buka function yang bermasalah**
2. **Temporary fix - Allow all origins:**
   ```typescript
   const corsHeaders = {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
   };
   ```
3. **Deploy ulang**
4. **Fix issue di local**
5. **Deploy proper fix**

---

## 📞 Support

Jika ada masalah:

1. **Check Documentation:**
   - [ALL_FUNCTIONS_UPDATED.md](./ALL_FUNCTIONS_UPDATED.md)
   - [OPEN_API_CORS_STRATEGY.md](./OPEN_API_CORS_STRATEGY.md)
   - [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md)

2. **Check Logs:**
   - Supabase Dashboard > Edge Functions > Logs
   - Browser Console (F12) untuk CORS errors

3. **Test Locally:**
   ```bash
   supabase functions serve [function-name]
   ```

---

## 🎉 Selesai!

Setelah semua ter-deploy dan verified:

✅ **18/18 Functions deployed**  
✅ **CORS security implemented**  
✅ **Rate limiting active**  
✅ **Production ready**

**Aplikasi Anda sekarang AMAN dan SIAP PRODUCTION!** 🚀🛡️

---

**Last Updated:** 22 Desember 2025  
**Status:** Ready to Deploy

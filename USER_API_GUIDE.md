# Panduan API untuk User

Dokumentasi lengkap cara menggunakan API untuk generate gambar produk secara otomatis.

## 📋 Daftar Isi

1. [Apa itu API?](#apa-itu-api)
2. [Cara Mendapatkan API Key](#cara-mendapatkan-api-key)
3. [Cara Menggunakan API](#cara-menggunakan-api)
4. [Contoh Penggunaan](#contoh-penggunaan)
5. [Troubleshooting](#troubleshooting)

---

## Apa itu API?

API (Application Programming Interface) memungkinkan Anda untuk mengintegrasikan fitur generate gambar ke dalam aplikasi, website, atau sistem Anda sendiri secara otomatis.

### Keuntungan Menggunakan API:

✅ **Otomatis** - Generate gambar tanpa perlu login ke dashboard  
✅ **Batch Processing** - Process banyak gambar sekaligus  
✅ **Integrasi** - Integrasikan ke e-commerce, marketplace, atau aplikasi Anda  
✅ **Efisien** - Hemat waktu untuk processing gambar dalam jumlah besar  

### Siapa yang Bisa Menggunakan?

- ❌ **Free Plan**: Tidak ada akses API
- ✅ **Basic Plan**: 5 requests/menit, 50 generations/bulan
- ✅ **Pro Plan**: 10 requests/menit, 200 generations/bulan

---

## Cara Mendapatkan API Key

### Step 1: Upgrade Paket

Pastikan Anda sudah upgrade ke paket **Basic** atau **Pro**.

### Step 2: Buka Halaman API Keys

1. Login ke dashboard
2. Klik menu **"API Keys"** di sidebar
3. Atau buka: `https://your-app.com/api-keys`

### Step 3: Create API Key

1. Klik tombol **"Create New API Key"**
2. Masukkan nama untuk API key (contoh: "Production API", "Development", dll)
3. Klik **"Create"**

### Step 4: Simpan API Key

⚠️ **PENTING**: API Key hanya ditampilkan **SEKALI**!

```
eak_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

- Copy dan simpan di tempat yang aman
- Jangan share ke orang lain
- Jangan commit ke Git/GitHub
- Gunakan environment variables

### Step 5: Kelola API Keys

Di halaman API Keys, Anda bisa:
- ✅ Lihat semua API keys yang aktif
- ✅ Lihat kapan terakhir digunakan
- ✅ Revoke (nonaktifkan) API key
- ✅ Create API key baru

---

## Cara Menggunakan API

### Endpoint

```
POST https://[your-project-id].supabase.co/functions/v1/api-generate
```

### Headers

```
Content-Type: application/json
x-api-key: eak_your_api_key_here
```

### Request Body

```json
{
  "imageUrl": "https://example.com/product.jpg",
  "enhancement": "add_female_model",
  "classification": "clothing",
  "watermark": {
    "type": "text",
    "text": "My Brand"
  }
}
```

### Parameters

| Parameter | Required | Deskripsi |
|-----------|----------|-----------|
| `imageUrl` | ✅ Yes | URL gambar produk (harus publicly accessible) |
| `enhancement` | ✅ Yes | Jenis enhancement (lihat tabel di bawah) |
| `classification` | ❌ No | Kategori produk (clothing, shoes, accessories) |
| `watermark` | ❌ No | Konfigurasi watermark |

### Enhancement Types

| Enhancement | Deskripsi | Cocok Untuk |
|-------------|-----------|-------------|
| `add_female_model` | Tampilkan produk dipakai model wanita | Pakaian wanita, aksesoris |
| `add_male_model` | Tampilkan produk dipakai model pria | Pakaian pria |
| `add_female_hijab_model` | Model wanita berhijab | Pakaian muslimah |
| `add_mannequin` | Tampilkan di mannequin | Semua pakaian |
| `remove_background` | Hapus background (pure white) | Semua produk |
| `improve_lighting` | Perbaiki pencahayaan | Foto gelap |
| `enhance_background` | Tingkatkan background | Background jelek |
| `lifestyle` | Foto lifestyle dengan model | Semua produk |

### Response Success

```json
{
  "success": true,
  "generatedImageUrl": "https://example.com/generated-image.png",
  "prompt": "Generated prompt used",
  "taskId": "task_123456"
}
```

### Response Error

```json
{
  "error": "Error message here"
}
```

---

## Contoh Penggunaan

### 1. JavaScript (Browser/Node.js)

```javascript
async function generateImage() {
  const response = await fetch('https://[project-id].supabase.co/functions/v1/api-generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'eak_your_api_key'
    },
    body: JSON.stringify({
      imageUrl: 'https://example.com/product.jpg',
      enhancement: 'add_female_model',
      classification: 'clothing'
    })
  });

  const data = await response.json();
  console.log('Generated:', data.generatedImageUrl);
}

generateImage();
```

### 2. Python

```python
import requests

response = requests.post(
    'https://[project-id].supabase.co/functions/v1/api-generate',
    json={
        'imageUrl': 'https://example.com/product.jpg',
        'enhancement': 'add_female_model',
        'classification': 'clothing'
    },
    headers={
        'Content-Type': 'application/json',
        'x-api-key': 'eak_your_api_key'
    }
)

data = response.json()
print('Generated:', data['generatedImageUrl'])
```

### 3. PHP

```php
<?php
$ch = curl_init('https://[project-id].supabase.co/functions/v1/api-generate');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'imageUrl' => 'https://example.com/product.jpg',
    'enhancement' => 'add_female_model',
    'classification' => 'clothing'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'x-api-key: eak_your_api_key'
]);

$response = curl_exec($ch);
$data = json_decode($response, true);
echo 'Generated: ' . $data['generatedImageUrl'];
?>
```

### 4. cURL (Terminal)

```bash
curl -X POST https://[project-id].supabase.co/functions/v1/api-generate \
  -H "Content-Type: application/json" \
  -H "x-api-key: eak_your_api_key" \
  -d '{
    "imageUrl": "https://example.com/product.jpg",
    "enhancement": "add_female_model",
    "classification": "clothing"
  }'
```

---

## Troubleshooting

### ❌ Error: "Invalid API key"

**Penyebab:**
- API key salah atau typo
- API key sudah di-revoke
- Header salah (harus `x-api-key`, bukan `X-API-Key`)

**Solusi:**
1. Copy ulang API key dari dashboard
2. Pastikan tidak ada spasi di awal/akhir
3. Check apakah API key masih aktif di halaman API Keys

---

### ❌ Error: "Monthly generation quota exceeded"

**Penyebab:**
- Kuota bulanan sudah habis

**Solusi:**
1. Upgrade ke paket Pro (200 generations/bulan)
2. Tunggu hingga bulan berikutnya (reset otomatis)
3. Optimize dengan caching hasil generation

---

### ❌ Error: "Rate limit exceeded"

**Penyebab:**
- Terlalu banyak request dalam waktu singkat
- Basic: max 5 requests/menit
- Pro: max 10 requests/menit

**Solusi:**
1. Tambahkan delay antar requests (minimal 12 detik untuk Basic)
2. Implementasikan queue system
3. Upgrade ke Pro untuk rate limit lebih tinggi

---

### ❌ Error: "Image generation timed out"

**Penyebab:**
- Server sedang sibuk
- Image terlalu besar
- Image URL tidak accessible

**Solusi:**
1. Coba lagi setelah beberapa saat
2. Compress image sebelum upload (<5MB)
3. Pastikan image URL publicly accessible (test di browser)

---

### ❌ Error: "API key is required"

**Penyebab:**
- Header `x-api-key` tidak disertakan

**Solusi:**
```javascript
// ❌ SALAH
headers: {
  'Content-Type': 'application/json'
}

// ✅ BENAR
headers: {
  'Content-Type': 'application/json',
  'x-api-key': 'eak_your_api_key'
}
```

---

## Best Practices

### 1. Keamanan API Key

```javascript
// ❌ JANGAN seperti ini (hardcode)
const API_KEY = 'eak_1234567890abcdef';

// ✅ Gunakan environment variables
const API_KEY = process.env.API_KEY;
```

### 2. Error Handling

```javascript
try {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  const data = await response.json();
  return data;
} catch (error) {
  console.error('Generation failed:', error.message);
  // Handle error (show to user, retry, etc)
}
```

### 3. Retry Logic

```javascript
async function generateWithRetry(imageUrl, enhancement, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generate(imageUrl, enhancement);
    } catch (error) {
      if (error.message.includes('Rate limit')) {
        // Wait 60 seconds and retry
        await new Promise(resolve => setTimeout(resolve, 60000));
        continue;
      }
      throw error;
    }
  }
}
```

### 4. Caching

```javascript
const cache = new Map();

async function generateWithCache(imageUrl, enhancement) {
  const cacheKey = `${imageUrl}-${enhancement}`;
  
  // Check cache first
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  // Generate if not in cache
  const result = await generate(imageUrl, enhancement);
  cache.set(cacheKey, result);
  
  return result;
}
```

---

## FAQ

### Q: Berapa lama proses generation?

**A:** Biasanya 10-30 detik, tergantung kompleksitas enhancement.

### Q: Apakah bisa generate multiple images sekaligus?

**A:** Ya, tapi perhatikan rate limit. Gunakan queue system untuk batch processing.

### Q: Format image apa yang didukung?

**A:** JPG, PNG, WebP. Maksimal 10MB.

### Q: Apakah hasil generation disimpan?

**A:** Ya, disimpan di storage dan bisa diakses via signed URL (valid 7 hari).

### Q: Bisa custom enhancement sendiri?

**A:** Saat ini belum, tapi akan ditambahkan di versi mendatang.

### Q: Bagaimana cara monitor usage?

**A:** Lihat di dashboard > API Keys > Usage Statistics.

---

## Support

Butuh bantuan? Hubungi kami:

- 📧 **Email**: support@yourapp.com
- 💬 **Discord**: discord.gg/yourapp
- 📚 **Docs**: docs.yourapp.com
- 🐛 **Report Bug**: github.com/yourapp/issues

---

**Selamat menggunakan API! 🚀**

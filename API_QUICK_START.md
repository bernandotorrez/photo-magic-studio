# Quick Start Guide - Photo Enhancement API

Panduan cepat untuk mulai menggunakan API dalam 5 menit.

## Step 1: Dapatkan API Key

1. Login ke dashboard: `https://your-app-url.com`
2. Pastikan Anda sudah upgrade ke paket **Basic** atau **Pro**
3. Buka menu **API Keys**
4. Klik tombol **"Create API Key"**
5. Beri nama API key (contoh: "Production API")
6. **PENTING**: Simpan API key yang ditampilkan (hanya muncul sekali!)

```
eak_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

## Step 2: Test dengan cURL

Copy dan paste command ini ke terminal (ganti `YOUR_API_KEY` dan `PROJECT_ID`):

```bash
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/api-generate \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "imageUrl": "https://images.unsplash.com/photo-1523381210434-271e8be1f52b",
    "enhancement": "add_female_model",
    "classification": "clothing"
  }'
```

Response yang berhasil:

```json
{
  "success": true,
  "generatedImageUrl": "https://...",
  "prompt": "...",
  "taskId": "..."
}
```

## Step 3: Implementasi di Aplikasi

### JavaScript/Node.js

```javascript
const API_KEY = 'eak_your_api_key';
const BASE_URL = 'https://your-project.supabase.co/functions/v1';

async function generateImage(imageUrl, enhancement) {
  const response = await fetch(`${BASE_URL}/api-generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    },
    body: JSON.stringify({
      imageUrl,
      enhancement,
      classification: 'clothing'
    })
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return await response.json();
}

// Usage
generateImage(
  'https://example.com/product.jpg',
  'add_female_model'
).then(result => {
  console.log('Generated:', result.generatedImageUrl);
}).catch(error => {
  console.error('Error:', error);
});
```

### Python

```python
import requests

API_KEY = 'eak_your_api_key'
BASE_URL = 'https://your-project.supabase.co/functions/v1'

def generate_image(image_url, enhancement):
    response = requests.post(
        f'{BASE_URL}/api-generate',
        json={
            'imageUrl': image_url,
            'enhancement': enhancement,
            'classification': 'clothing'
        },
        headers={
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
        }
    )
    response.raise_for_status()
    return response.json()

# Usage
result = generate_image(
    'https://example.com/product.jpg',
    'add_female_model'
)
print('Generated:', result['generatedImageUrl'])
```

### PHP

```php
<?php
$apiKey = 'eak_your_api_key';
$baseUrl = 'https://your-project.supabase.co/functions/v1';

function generateImage($imageUrl, $enhancement) {
    global $apiKey, $baseUrl;
    
    $ch = curl_init("$baseUrl/api-generate");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'imageUrl' => $imageUrl,
        'enhancement' => $enhancement,
        'classification' => 'clothing'
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        "x-api-key: $apiKey"
    ]);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

// Usage
$result = generateImage(
    'https://example.com/product.jpg',
    'add_female_model'
);
echo "Generated: " . $result['generatedImageUrl'];
?>
```

## Step 4: Enhancement Options

Pilih enhancement yang sesuai dengan kebutuhan:

| Enhancement | Deskripsi | Cocok untuk |
|-------------|-----------|-------------|
| `add_female_model` | Model wanita | Pakaian wanita, aksesoris |
| `add_male_model` | Model pria | Pakaian pria |
| `add_female_hijab_model` | Model wanita berhijab | Pakaian muslimah |
| `add_mannequin` | Mannequin/manekin | Semua pakaian |
| `remove_background` | Hapus background | Semua produk |
| `improve_lighting` | Perbaiki pencahayaan | Foto gelap/kurang cahaya |
| `enhance_background` | Tingkatkan background | Foto dengan background jelek |
| `lifestyle` | Foto lifestyle | Semua produk |

## Step 5: Tambahkan Watermark (Opsional)

### Text Watermark

```javascript
{
  "imageUrl": "https://example.com/product.jpg",
  "enhancement": "add_female_model",
  "watermark": {
    "type": "text",
    "text": "My Brand"
  }
}
```

### Logo Watermark

```javascript
{
  "imageUrl": "https://example.com/product.jpg",
  "enhancement": "add_female_model",
  "watermark": {
    "type": "logo",
    "logoUrl": "https://example.com/logo.png"
  }
}
```

## Common Issues & Solutions

### ❌ Error: "Invalid API key"

**Solusi:**
- Pastikan API key benar (copy-paste dengan hati-hati)
- Check apakah API key masih aktif di dashboard
- Pastikan header `x-api-key` ditulis dengan benar (lowercase)

### ❌ Error: "Monthly generation quota exceeded"

**Solusi:**
- Upgrade ke paket yang lebih tinggi
- Tunggu hingga bulan berikutnya
- Optimize dengan caching hasil

### ❌ Error: "Rate limit exceeded"

**Solusi:**
- Tunggu 1 menit sebelum request lagi
- Implementasikan delay antar requests
- Upgrade ke Pro untuk rate limit lebih tinggi

### ❌ Error: "Image generation timed out"

**Solusi:**
- Coba lagi (kadang server sibuk)
- Pastikan image URL accessible
- Gunakan image dengan ukuran lebih kecil (<5MB)

## Next Steps

1. ✅ Baca [API Documentation](./API_DOCUMENTATION.md) lengkap
2. ✅ Lihat [Code Examples](./API_EXAMPLES.md) untuk bahasa lain
3. ✅ Test dengan [Postman Collection](./postman_collection.json)
4. ✅ Join komunitas Discord untuk support
5. ✅ Monitor usage di dashboard

## Rate Limits & Quotas

| Plan | Rate Limit | Monthly Quota |
|------|------------|---------------|
| Free | ❌ No API Access | - |
| Basic | 5 req/min | 50 generations |
| Pro | 10 req/min | 200 generations |

## Support

Butuh bantuan? Hubungi kami:

- 📧 Email: support@yourapp.com
- 💬 Discord: discord.gg/yourapp
- 📚 Docs: docs.yourapp.com
- 🐛 Issues: github.com/yourapp/issues

---

**Happy Coding! 🚀**

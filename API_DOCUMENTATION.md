# API Documentation - Photo Enhancement API

## Overview

API ini memungkinkan Anda untuk menghasilkan gambar produk yang telah ditingkatkan secara otomatis menggunakan AI. Cocok untuk e-commerce, marketplace, atau aplikasi yang membutuhkan foto produk profesional.

## Base URL

```
https://[your-project-id].supabase.co/functions/v1
```

## Authentication

Semua request API memerlukan API Key yang valid. API Key harus disertakan dalam header request:

```
x-api-key: eak_your_api_key_here
```

### Cara Mendapatkan API Key

1. Login ke dashboard aplikasi
2. Upgrade ke paket Basic atau Pro (API Key tidak tersedia untuk paket Free)
3. Buka halaman API Keys
4. Klik "Create API Key"
5. Berikan nama untuk API Key Anda
6. Simpan API Key dengan aman (hanya ditampilkan sekali)

## Endpoints

### 1. Generate Enhanced Image

Generate gambar produk yang telah ditingkatkan dengan berbagai enhancement.

**Endpoint:** `POST /api-generate`

**Headers:**
```
Content-Type: application/json
x-api-key: eak_your_api_key_here
```

**Request Body:**

```json
{
  "imageUrl": "https://example.com/product-image.jpg",
  "enhancement": "add_female_model",
  "classification": "clothing",
  "watermark": {
    "type": "text",
    "text": "My Brand"
  }
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `imageUrl` | string | Yes | URL gambar produk yang akan di-enhance (harus publicly accessible) |
| `enhancement` | string | Yes | Jenis enhancement yang diinginkan (lihat daftar di bawah) |
| `classification` | string | No | Klasifikasi produk (clothing, shoes, accessories, dll) |
| `watermark` | object | No | Konfigurasi watermark |
| `watermark.type` | string | No | Tipe watermark: "none", "text", atau "logo" |
| `watermark.text` | string | No | Text watermark (jika type = "text") |
| `watermark.logoUrl` | string | No | URL logo watermark (jika type = "logo") |

**Enhancement Types:**

| Enhancement | Description |
|-------------|-------------|
| `add_male_model` | Tampilkan produk dipakai oleh model pria |
| `add_female_model` | Tampilkan produk dipakai oleh model wanita |
| `add_female_hijab_model` | Tampilkan produk dipakai oleh model wanita berhijab |
| `add_mannequin` | Tampilkan produk di mannequin |
| `enhance_background` | Tingkatkan kualitas background |
| `improve_lighting` | Perbaiki pencahayaan foto |
| `remove_background` | Hapus background (pure white) |
| `lifestyle` | Foto lifestyle dengan model |
| `on-feet` | Sepatu saat dipakai (untuk produk sepatu) |

**Response Success (200):**

```json
{
  "success": true,
  "generatedImageUrl": "https://example.com/generated-image.png",
  "prompt": "Generated prompt used for AI",
  "taskId": "task_123456"
}
```

**Response Error (400 - Bad Request):**

```json
{
  "error": "imageUrl is required"
}
```

**Response Error (401 - Unauthorized):**

```json
{
  "error": "Invalid API key"
}
```

**Response Error (403 - Quota Exceeded):**

```json
{
  "error": "Monthly generation quota exceeded",
  "current": 100,
  "limit": 100
}
```

**Response Error (429 - Rate Limit):**

```json
{
  "error": "Rate limit exceeded. Please try again later."
}
```

**Response Error (500 - Server Error):**

```json
{
  "error": "Failed to generate image",
  "details": "Error details here"
}
```

### 2. Check Generation Status

Check status dari task generation yang sedang berjalan.

**Endpoint:** `POST /api-check-status`

**Headers:**
```
Content-Type: application/json
x-api-key: eak_your_api_key_here
```

**Request Body:**

```json
{
  "taskId": "task_123456"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `taskId` | string | Yes | Task ID yang didapat dari response `/api-generate` |

**Response Success (200) - Task Completed:**

```json
{
  "taskId": "task_123456",
  "state": "success",
  "success": true,
  "generatedImageUrl": "https://example.com/generated.png",
  "resultUrls": ["https://example.com/generated.png"]
}
```

**Response Success (200) - Task Processing:**

```json
{
  "taskId": "task_123456",
  "state": "processing",
  "success": false,
  "status": "processing",
  "message": "Task is still processing"
}
```

**Response Success (200) - Task Failed:**

```json
{
  "taskId": "task_123456",
  "state": "fail",
  "success": false,
  "error": "Generation failed"
}
```

**Response Error (400 - Bad Request):**

```json
{
  "error": "taskId is required"
}
```

**Response Error (401 - Unauthorized):**

```json
{
  "error": "Invalid API key"
}
```

## Rate Limits

- **Free Plan:** Tidak ada akses API
- **Basic Plan:** 5 requests per menit, 50 generations per bulan
- **Pro Plan:** 10 requests per menit, 200 generations per bulan

## Code Examples

### cURL

```bash
curl -X POST https://[your-project-id].supabase.co/functions/v1/api-generate \
  -H "Content-Type: application/json" \
  -H "x-api-key: eak_your_api_key_here" \
  -d '{
    "imageUrl": "https://example.com/product.jpg",
    "enhancement": "add_female_model",
    "classification": "clothing"
  }'
```

### JavaScript (Fetch)

```javascript
// Generate image
const response = await fetch('https://[your-project-id].supabase.co/functions/v1/api-generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'eak_your_api_key_here'
  },
  body: JSON.stringify({
    imageUrl: 'https://example.com/product.jpg',
    enhancement: 'add_female_model',
    classification: 'clothing',
    watermark: {
      type: 'text',
      text: 'My Brand'
    }
  })
});

const data = await response.json();
console.log('Generated:', data.generatedImageUrl);
console.log('Task ID:', data.taskId);

// Check status (optional - if you want to poll)
const checkStatus = async (taskId) => {
  const statusResponse = await fetch('https://[your-project-id].supabase.co/functions/v1/api-check-status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'eak_your_api_key_here'
    },
    body: JSON.stringify({ taskId })
  });
  
  const statusData = await statusResponse.json();
  return statusData;
};

// Usage
const status = await checkStatus(data.taskId);
console.log('Status:', status);
```

### Python

```python
import requests

url = 'https://[your-project-id].supabase.co/functions/v1/api-generate'
headers = {
    'Content-Type': 'application/json',
    'x-api-key': 'eak_your_api_key_here'
}
payload = {
    'imageUrl': 'https://example.com/product.jpg',
    'enhancement': 'add_female_model',
    'classification': 'clothing'
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()
print(data['generatedImageUrl'])
```

### PHP

```php
<?php
$url = 'https://[your-project-id].supabase.co/functions/v1/api-generate';
$data = [
    'imageUrl' => 'https://example.com/product.jpg',
    'enhancement' => 'add_female_model',
    'classification' => 'clothing'
];

$options = [
    'http' => [
        'header'  => "Content-Type: application/json\r\n" .
                     "x-api-key: eak_your_api_key_here\r\n",
        'method'  => 'POST',
        'content' => json_encode($data)
    ]
];

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);
$response = json_decode($result, true);

echo $response['generatedImageUrl'];
?>
```

### Node.js (Axios)

```javascript
const axios = require('axios');

async function generateImage() {
  try {
    const response = await axios.post(
      'https://[your-project-id].supabase.co/functions/v1/api-generate',
      {
        imageUrl: 'https://example.com/product.jpg',
        enhancement: 'add_female_model',
        classification: 'clothing'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'eak_your_api_key_here'
        }
      }
    );
    
    console.log(response.data.generatedImageUrl);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

generateImage();
```

## Best Practices

1. **Simpan API Key dengan Aman**
   - Jangan commit API key ke version control
   - Gunakan environment variables
   - Rotate API key secara berkala

2. **Handle Rate Limits**
   - Implementasikan retry logic dengan exponential backoff
   - Monitor usage untuk menghindari quota exceeded

3. **Image URL Requirements**
   - Pastikan image URL publicly accessible
   - Gunakan HTTPS untuk keamanan
   - Ukuran file maksimal: 10MB
   - Format yang didukung: JPG, PNG, WebP

4. **Error Handling**
   - Selalu check response status code
   - Implementasikan proper error handling
   - Log errors untuk debugging

5. **Optimization**
   - Batch multiple requests jika memungkinkan
   - Cache hasil generation untuk menghindari duplicate requests
   - Compress images sebelum upload untuk performa lebih baik

## Troubleshooting

### Error: "Invalid API key"
- Pastikan API key benar dan aktif
- Check apakah API key sudah expired atau di-revoke
- Pastikan header `x-api-key` ditulis dengan benar

### Error: "Monthly generation quota exceeded"
- Upgrade ke paket yang lebih tinggi
- Tunggu hingga bulan berikutnya untuk reset quota
- Optimize penggunaan dengan caching

### Error: "Image generation timed out"
- Coba lagi dengan image yang lebih kecil
- Pastikan image URL accessible
- Contact support jika masalah berlanjut

### Error: "Rate limit exceeded"
- Implementasikan delay antar requests
- Upgrade ke paket Pro untuk rate limit lebih tinggi
- Gunakan queue system untuk batch processing

## Support

Jika Anda mengalami masalah atau memiliki pertanyaan:

1. Check dokumentasi ini terlebih dahulu
2. Lihat FAQ di dashboard
3. Contact support melalui email atau live chat
4. Join komunitas Discord untuk diskusi

## Changelog

### Version 1.0.0 (2024-12-19)
- Initial release
- Support untuk 9 enhancement types
- Watermark support (text & logo)
- Rate limiting & quota management
- Multi-language support (ID/EN)

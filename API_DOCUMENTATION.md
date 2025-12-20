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
  "enhancement": "👗 Dipakai oleh Model Wanita",
  "classification": "clothing",
  "customPose": "standing with arms crossed, smiling confidently",
  "customFurniture": "sofa, meja TV, rak buku, lemari",
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
| `enhancement` | string | Yes | Jenis enhancement yang diinginkan (gunakan emoji + text lengkap, lihat daftar di bawah) |
| `classification` | string | No | Klasifikasi produk: `clothing`, `shoes`, `bags`, `accessories`, `jewelry`, `headwear`, `eyewear`, `beauty`, `electronics`, `home`, `sports`, `kids`, `person`, `interior`, `exterior` |
| `customPose` | string | No | **[NEW]** Deskripsi pose spesifik untuk AI Photographer (hanya untuk classification="person") |
| `customFurniture` | string | No | **[NEW]** Item furniture spesifik untuk Interior Design (hanya untuk classification="interior", pisahkan dengan koma) |
| `watermark` | object | No | Konfigurasi watermark |
| `watermark.type` | string | No | Tipe watermark: "none", "text", atau "logo" |
| `watermark.text` | string | No | Text watermark (jika type = "text") |
| `watermark.logoUrl` | string | No | URL logo watermark (jika type = "logo") |

**Enhancement Types:**

Sistem sekarang mendukung **12 kategori produk** dengan enhancement options yang spesifik:

### Fashion & Apparel

#### Clothing (Pakaian)
- `👗 Dipakai oleh Model Wanita` - Tampilkan pakaian dipakai model wanita
- `🧕 Dipakai oleh Model Wanita Berhijab` - Tampilkan pakaian dipakai model berhijab
- `👔 Dipakai oleh Model Pria` - Tampilkan pakaian dipakai model pria
- `📸 Foto Lifestyle dengan Model` - Foto lifestyle natural
- `🎭 Ditampilkan pada Manekin` - Tampilkan di mannequin
- `🔎 Foto Close-up Detail` - Detail close-up produk
- `🎨 Buat Varian Warna` - Generate varian warna
- `✨ Ubah Material/Tekstur` - Ubah material atau tekstur
- `🔄 Generate 360° View` - Buat tampilan 360 derajat
- `📏 Tampilkan Size Comparison` - Perbandingan ukuran

#### Shoes (Sepatu)
- `👟 On-Feet Shot (Dipakai di Kaki)` - Sepatu saat dipakai
- `👗 Dipakai oleh Model Wanita` - Model wanita memakai sepatu
- `👔 Dipakai oleh Model Pria` - Model pria memakai sepatu
- `📸 Foto Lifestyle dengan Model` - Lifestyle shot
- `🔎 Detail Close-up (Tekstur & Material)` - Detail material
- `🎨 Buat Varian Warna` - Varian warna sepatu
- `🔄 Generate 360° View` - Tampilan 360°
- `📏 Tampilkan Size Comparison` - Size comparison
- `✨ Highlight Fitur Khusus` - Highlight features
- `🌟 Professional Product Shot` - Professional photography

#### Bags (Tas)
- `👜 Dipakai oleh Model (Shoulder/Hand)` - Model memakai tas
- `👗 Dipakai oleh Model Wanita` - Model wanita dengan tas
- `👔 Dipakai oleh Model Pria` - Model pria dengan tas
- `📸 Foto Lifestyle dengan Model` - Lifestyle photography
- `🔎 Detail Close-up (Tekstur & Hardware)` - Detail hardware
- `🎨 Buat Varian Warna` - Color variants
- `🔄 Generate 360° View` - 360° view
- `📏 Tampilkan Size Comparison` - Size comparison
- `✨ Highlight Kompartemen Interior` - Interior compartments
- `🌟 Professional Product Shot` - Professional shot

#### Jewelry (Perhiasan)
- `💍 Dipakai di Jari/Tangan` - Ring on finger/hand
- `📿 Dipakai di Leher` - Necklace on neck
- `⌚ Dipakai di Pergelangan Tangan` - Watch/bracelet on wrist
- `👂 Dipakai di Telinga` - Earrings on ears
- `👗 Dipakai oleh Model Wanita` - Female model wearing
- `👔 Dipakai oleh Model Pria` - Male model wearing
- `📸 Foto Lifestyle dengan Model` - Lifestyle shot
- `🔎 Detail Close-up (Gemstone & Craftsmanship)` - Detail craftsmanship
- `💎 Luxury Jewelry Styling` - Luxury styling
- `✨ Highlight Sparkle & Shine` - Sparkle enhancement
- `🎨 Buat Varian Material (Gold/Silver/Rose Gold)` - Material variants
- `🌟 Professional Product Shot` - Professional photography

#### Accessories (Aksesoris)
- `🧤 Dipakai oleh Model` - Worn by model
- `👗 Dipakai oleh Model Wanita` - Female model
- `👔 Dipakai oleh Model Pria` - Male model
- `📸 Foto Lifestyle dengan Model` - Lifestyle shot
- `🔎 Detail Close-up (Material & Detail)` - Material details
- `🎨 Buat Varian Warna` - Color variants
- `✨ Highlight Fitur Khusus` - Special features
- `🌟 Professional Product Shot` - Professional shot

#### Headwear (Topi)
- `🎩 Dipakai di Kepala Model` - Worn on head
- `👗 Dipakai oleh Model Wanita` - Female model
- `👔 Dipakai oleh Model Pria` - Male model
- `📸 Foto Lifestyle dengan Model` - Lifestyle shot
- `🔎 Detail Close-up (Material & Logo)` - Material & logo details
- `🎨 Buat Varian Warna` - Color variants
- `🔄 Generate 360° View` - 360° view
- `✨ Highlight Fitur Khusus` - Special features
- `🌟 Professional Product Shot` - Professional shot

#### Eyewear (Kacamata)
- `👓 Dipakai di Wajah Model` - Worn on face
- `👗 Dipakai oleh Model Wanita` - Female model
- `👔 Dipakai oleh Model Pria` - Male model
- `📸 Foto Lifestyle dengan Model` - Lifestyle shot
- `🔎 Detail Close-up (Frame & Lensa)` - Frame & lens details
- `🎨 Buat Varian Warna Frame` - Frame color variants
- `✨ Highlight Material & Design` - Material & design
- `🌟 Professional Product Shot` - Professional shot

### Beauty & Lifestyle

#### Beauty & Cosmetics (Parfum, Makeup, Skincare)
- `💄 Digunakan oleh Model (Makeup/Skincare)` - Model using product
- `👗 Dipakai oleh Model Wanita` - Female model
- `👔 Dipakai oleh Model Pria` - Male model
- `📸 Foto Lifestyle dengan Model` - Lifestyle shot
- `🔎 Detail Close-up (Tekstur & Packaging)` - Texture & packaging
- `✨ Highlight Ingredients & Benefits` - Ingredients highlight
- `🎨 Buat Varian Warna/Shade` - Color/shade variants
- `🔄 Generate 360° View` - 360° view
- `📏 Tampilkan Size Comparison` - Size comparison
- `🌟 Professional Product Shot` - Professional shot
- `💎 Luxury Product Styling` - Luxury styling
- `🌸 Natural/Organic Aesthetic` - Natural aesthetic

#### Electronics & Gadgets
- `📱 Digunakan oleh Model` - Model using device
- `👗 Dipakai oleh Model Wanita` - Female model
- `👔 Dipakai oleh Model Pria` - Male model
- `📸 Foto Lifestyle dengan Model` - Lifestyle shot
- `🔎 Detail Close-up (Features & Specs)` - Features & specs
- `✨ Highlight Tech Features` - Tech features
- `🎨 Buat Varian Warna` - Color variants
- `🔄 Generate 360° View` - 360° view
- `📏 Tampilkan Size Comparison` - Size comparison
- `🌟 Professional Product Shot` - Professional shot
- `💻 Tech Product Styling` - Tech styling
- `⚡ Modern/Futuristic Look` - Modern look

#### Home & Living
- `🏠 Tampilkan dalam Setting Rumah` - Home setting display
- `📸 Foto Lifestyle dengan Model` - Lifestyle shot
- `🔎 Detail Close-up (Tekstur & Material)` - Texture & material
- `✨ Highlight Quality & Comfort` - Quality & comfort
- `🎨 Buat Varian Warna/Pattern` - Color/pattern variants
- `🔄 Generate 360° View` - 360° view
- `📏 Tampilkan Size Comparison` - Size comparison
- `🌟 Professional Product Shot` - Professional shot
- `🛋️ Cozy Home Aesthetic` - Cozy aesthetic
- `🌿 Natural/Minimalist Style` - Minimalist style

#### Sports & Fitness
- `🏃 Digunakan saat Olahraga` - Used during exercise
- `💪 Dipakai oleh Atlet/Model` - Athletic model
- `👗 Dipakai oleh Model Wanita` - Female model
- `👔 Dipakai oleh Model Pria` - Male model
- `📸 Foto Lifestyle dengan Model` - Lifestyle shot
- `🔎 Detail Close-up (Material & Technology)` - Material & tech
- `✨ Highlight Performance Features` - Performance features
- `🎨 Buat Varian Warna` - Color variants
- `🔄 Generate 360° View` - 360° view
- `🌟 Professional Product Shot` - Professional shot
- `⚡ Dynamic Action Shot` - Action shot
- `🏋️ Gym/Fitness Setting` - Gym setting

#### Kids & Baby Products
- `👶 Digunakan oleh Anak/Baby` - Child/baby using
- `👨‍👩‍👧 Foto dengan Orang Tua` - Photo with parents
- `📸 Foto Lifestyle dengan Model` - Lifestyle shot
- `🔎 Detail Close-up (Safety & Quality)` - Safety & quality
- `✨ Highlight Safety Features` - Safety features
- `🎨 Buat Varian Warna` - Color variants
- `🔄 Generate 360° View` - 360° view
- `📏 Tampilkan Size Comparison` - Size comparison
- `🌟 Professional Product Shot` - Professional shot
- `🎈 Fun & Playful Aesthetic` - Playful aesthetic
- `🌈 Colorful & Cheerful Look` - Colorful look

### AI Photography & Design

#### AI Photographer (Person)
- `🎨 Virtual Outfit Change (Ganti Baju)` - Change outfit
- `💃 Ubah Pose (Pose Variation)` - Change pose (use `customPose` parameter)
- `🌆 Ganti Background` - Change background
- `📸 Professional Portrait Enhancement` - Portrait enhancement
- `✨ Beauty Enhancement (Smooth Skin)` - Beauty enhancement
- `🎭 Ubah Ekspresi Wajah` - Change expression
- `💼 Business Portrait Style` - Business style
- `🌟 Fashion Editorial Style` - Fashion editorial
- `🎬 Cinematic Look` - Cinematic look
- `🖼️ Studio Portrait dengan Lighting Profesional` - Studio portrait

#### Interior Design
- `🛋️ Virtual Staging (Tambah Furniture)` - Virtual staging (use `customFurniture` parameter)
- `🎨 Style Transformation (Modern/Minimalist/Classic)` - Style transformation
- `🌈 Ubah Color Scheme` - Change color scheme
- `💡 Lighting Enhancement` - Lighting enhancement
- `🪟 Ubah Wallpaper/Cat Dinding` - Change wallpaper/paint
- `🖼️ Tambah Dekorasi & Artwork` - Add decoration
- `🌿 Tambah Tanaman Hias` - Add plants
- `✨ Luxury Interior Upgrade` - Luxury upgrade
- `🏠 Scandinavian Style` - Scandinavian style
- `🎭 Industrial Style` - Industrial style
- `🌸 Bohemian Style` - Bohemian style
- `🏛️ Classic/Traditional Style` - Classic style

#### Exterior Design
- `🏠 Facade Renovation (Ubah Tampilan Depan)` - Facade renovation
- `🌳 Landscaping Enhancement (Taman & Tanaman)` - Landscaping
- `🌅 Ubah Waktu (Day/Night/Golden Hour)` - Change time
- `⛅ Ubah Cuaca (Sunny/Cloudy/Rainy)` - Change weather
- `🎨 Ubah Warna Cat Eksterior` - Change exterior paint
- `🪟 Upgrade Jendela & Pintu` - Upgrade windows & doors
- `💡 Tambah Outdoor Lighting` - Add outdoor lighting
- `🏊 Tambah Pool/Water Feature` - Add pool
- `🚗 Tambah Driveway & Parking` - Add driveway
- `🌺 Tambah Garden & Flowers` - Add garden
- `🏗️ Modern Architecture Style` - Modern architecture
- `🏛️ Classic Architecture Style` - Classic architecture

**Note:** Gunakan emoji dan text lengkap sebagai value untuk parameter `enhancement`. Contoh: `"enhancement": "👗 Dipakai oleh Model Wanita"`

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

**Example 1: Fashion Product with Model**
```bash
curl -X POST https://[your-project-id].supabase.co/functions/v1/api-generate \
  -H "Content-Type: application/json" \
  -H "x-api-key: eak_your_api_key_here" \
  -d '{
    "imageUrl": "https://example.com/dress.jpg",
    "enhancement": "👗 Dipakai oleh Model Wanita",
    "classification": "clothing"
  }'
```

**Example 2: Jewelry Product**
```bash
curl -X POST https://[your-project-id].supabase.co/functions/v1/api-generate \
  -H "Content-Type: application/json" \
  -H "x-api-key: eak_your_api_key_here" \
  -d '{
    "imageUrl": "https://example.com/necklace.jpg",
    "enhancement": "📿 Dipakai di Leher",
    "classification": "jewelry"
  }'
```

**Example 3: Beauty Product with Luxury Styling**
```bash
curl -X POST https://[your-project-id].supabase.co/functions/v1/api-generate \
  -H "Content-Type: application/json" \
  -H "x-api-key: eak_your_api_key_here" \
  -d '{
    "imageUrl": "https://example.com/perfume.jpg",
    "enhancement": "💎 Luxury Product Styling",
    "classification": "beauty"
  }'
```

**Example 4: AI Photographer with Custom Pose**
```bash
curl -X POST https://[your-project-id].supabase.co/functions/v1/api-generate \
  -H "Content-Type: application/json" \
  -H "x-api-key: eak_your_api_key_here" \
  -d '{
    "imageUrl": "https://example.com/portrait.jpg",
    "enhancement": "💃 Ubah Pose (Pose Variation)",
    "classification": "person",
    "customPose": "standing with arms crossed, looking confident and professional"
  }'
```

**Example 5: Interior Design with Custom Furniture**
```bash
curl -X POST https://[your-project-id].supabase.co/functions/v1/api-generate \
  -H "Content-Type: application/json" \
  -H "x-api-key": "eak_your_api_key_here" \
  -d '{
    "imageUrl": "https://example.com/empty-room.jpg",
    "enhancement": "🛋️ Virtual Staging (Tambah Furniture)",
    "classification": "interior",
    "customFurniture": "sofa modern, meja TV minimalis, rak buku, karpet abu-abu"
  }'
```

### JavaScript (Fetch)

**Example 1: Fashion Product**
```javascript
const response = await fetch('https://[your-project-id].supabase.co/functions/v1/api-generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'eak_your_api_key_here'
  },
  body: JSON.stringify({
    imageUrl: 'https://example.com/dress.jpg',
    enhancement: '👗 Dipakai oleh Model Wanita',
    classification: 'clothing',
    watermark: {
      type: 'text',
      text: 'My Brand'
    }
  })
});

const data = await response.json();
console.log('Generated:', data.generatedImageUrl);
```

**Example 2: Jewelry Product**
```javascript
const response = await fetch('https://[your-project-id].supabase.co/functions/v1/api-generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'eak_your_api_key_here'
  },
  body: JSON.stringify({
    imageUrl: 'https://example.com/ring.jpg',
    enhancement: '💍 Dipakai di Jari/Tangan',
    classification: 'jewelry'
  })
});

const data = await response.json();
console.log('Generated:', data.generatedImageUrl);
```

**Example 3: Beauty Product**
```javascript
const response = await fetch('https://[your-project-id].supabase.co/functions/v1/api-generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'eak_your_api_key_here'
  },
  body: JSON.stringify({
    imageUrl: 'https://example.com/perfume.jpg',
    enhancement: '💎 Luxury Product Styling',
    classification: 'beauty'
  })
});

const data = await response.json();
console.log('Generated:', data.generatedImageUrl);
```

**Example 4: AI Photographer with Custom Pose**
```javascript
const response = await fetch('https://[your-project-id].supabase.co/functions/v1/api-generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'eak_your_api_key_here'
  },
  body: JSON.stringify({
    imageUrl: 'https://example.com/portrait.jpg',
    enhancement: '💃 Ubah Pose (Pose Variation)',
    classification: 'person',
    customPose: 'sitting on a chair, hands on lap, smiling warmly'
  })
});

const data = await response.json();
console.log('Generated:', data.generatedImageUrl);
```

**Example 5: Interior Design with Custom Furniture**
```javascript
const response = await fetch('https://[your-project-id].supabase.co/functions/v1/api-generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'eak_your_api_key_here'
  },
  body: JSON.stringify({
    imageUrl: 'https://example.com/empty-room.jpg',
    enhancement: '🛋️ Virtual Staging (Tambah Furniture)',
    classification: 'interior',
    customFurniture: 'sofa L-shape, coffee table, floor lamp, wall art, indoor plants'
  })
});

const data = await response.json();
console.log('Generated:', data.generatedImageUrl);
```

### Python

**Example 1: Fashion Product**
```python
import requests

url = 'https://[your-project-id].supabase.co/functions/v1/api-generate'
headers = {
    'Content-Type': 'application/json',
    'x-api-key': 'eak_your_api_key_here'
}
payload = {
    'imageUrl': 'https://example.com/dress.jpg',
    'enhancement': '👗 Dipakai oleh Model Wanita',
    'classification': 'clothing'
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()
print(data['generatedImageUrl'])
```

**Example 2: Jewelry Product**
```python
import requests

url = 'https://[your-project-id].supabase.co/functions/v1/api-generate'
headers = {
    'Content-Type': 'application/json',
    'x-api-key': 'eak_your_api_key_here'
}
payload = {
    'imageUrl': 'https://example.com/necklace.jpg',
    'enhancement': '📿 Dipakai di Leher',
    'classification': 'jewelry'
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()
print(data['generatedImageUrl'])
```

**Example 3: AI Photographer with Custom Pose**
```python
import requests

url = 'https://[your-project-id].supabase.co/functions/v1/api-generate'
headers = {
    'Content-Type': 'application/json',
    'x-api-key': 'eak_your_api_key_here'
}
payload = {
    'imageUrl': 'https://example.com/portrait.jpg',
    'enhancement': '💃 Ubah Pose (Pose Variation)',
    'classification': 'person',
    'customPose': 'leaning against a wall, casual pose, friendly smile'
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()
print(data['generatedImageUrl'])
```

**Example 4: Interior Design with Custom Furniture**
```python
import requests

url = 'https://[your-project-id].supabase.co/functions/v1/api-generate'
headers = {
    'Content-Type': 'application/json',
    'x-api-key': 'eak_your_api_key_here'
}
payload = {
    'imageUrl': 'https://example.com/empty-room.jpg',
    'enhancement': '🛋️ Virtual Staging (Tambah Furniture)',
    'classification': 'interior',
    'customFurniture': 'dining table, 6 chairs, chandelier, sideboard, decorative vase'
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

### Version 2.0.0 (2025-12-20)
- **NEW:** 12 kategori produk lengkap (clothing, shoes, bags, accessories, jewelry, headwear, eyewear, beauty, electronics, home, sports, kids)
- **NEW:** Enhancement options dengan emoji untuk setiap kategori
- **NEW:** Hugging Face AI classification untuk deteksi kategori otomatis
- **NEW:** Prompt spesifik untuk setiap kategori produk
- **NEW:** Support untuk beauty products, electronics, home decor, sports equipment, dan kids products
- Improved classification accuracy dengan Vision Transformer model
- Enhanced prompt generation untuk hasil lebih profesional
- Updated documentation dengan contoh lengkap untuk semua kategori

### Version 1.1.0 (2025-12-19)
- **NEW:** Custom pose input untuk AI Photographer
- **NEW:** Custom furniture items input untuk Interior Design
- Improved flexibility untuk user-defined enhancements
- Updated documentation dengan contoh lengkap

### Version 1.0.0 (2025-12-19)
- Initial release
- Support untuk 9 enhancement types
- Watermark support (text & logo)
- Rate limiting & quota management
- Multi-language support (ID/EN)

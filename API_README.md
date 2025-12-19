# API Documentation

Dokumentasi lengkap untuk Photo Enhancement API.

## 📚 Dokumentasi Tersedia

1. **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Dokumentasi lengkap API
   - Overview & Base URL
   - Authentication
   - Endpoints & Parameters
   - Response Format
   - Code Examples (cURL, JavaScript, Python, PHP, Node.js)
   - Best Practices
   - Troubleshooting

2. **[API_QUICK_START.md](./API_QUICK_START.md)** - Panduan Quick Start
   - Cara mendapatkan API Key
   - Test dengan cURL
   - Implementasi di berbagai bahasa
   - Common Issues & Solutions

3. **[API_EXAMPLES.md](./API_EXAMPLES.md)** - Contoh Code Lengkap
   - JavaScript/TypeScript
   - Python (Requests & Async)
   - PHP
   - Ruby
   - Go
   - Java
   - C#
   - React
   - Vue.js
   - Next.js

4. **[USER_API_GUIDE.md](./USER_API_GUIDE.md)** - Panduan untuk User
   - Penjelasan API untuk non-developer
   - Step-by-step guide
   - FAQ
   - Troubleshooting

5. **[postman_collection.json](./postman_collection.json)** - Postman Collection
   - Import ke Postman untuk testing
   - Pre-configured requests

## 🚀 Quick Start

### 1. Dapatkan API Key

```bash
1. Login ke dashboard
2. Upgrade ke Basic/Pro
3. Buka halaman API Keys
4. Klik "Create New Key"
5. Simpan API key dengan aman
```

### 2. Test API

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

### 3. Implementasi

```javascript
// JavaScript Example
const response = await fetch('https://[project-id].supabase.co/functions/v1/api-generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.API_KEY
  },
  body: JSON.stringify({
    imageUrl: 'https://example.com/product.jpg',
    enhancement: 'add_female_model'
  })
});

const data = await response.json();
console.log(data.generatedImageUrl);
```

## 📖 Dokumentasi UI

Akses dokumentasi interaktif di dashboard:

```
https://your-app.com/api-documentation
```

Fitur:
- ✅ Interactive code examples
- ✅ Copy-paste ready snippets
- ✅ Error handling guide
- ✅ Rate limits & quotas
- ✅ Enhancement types reference

## 🔑 Enhancement Types

| Enhancement | Description |
|-------------|-------------|
| `add_female_model` | Tampilkan produk dipakai model wanita |
| `add_male_model` | Tampilkan produk dipakai model pria |
| `add_female_hijab_model` | Model wanita berhijab |
| `add_mannequin` | Tampilkan di mannequin |
| `remove_background` | Hapus background (pure white) |
| `improve_lighting` | Perbaiki pencahayaan |
| `enhance_background` | Tingkatkan background |
| `lifestyle` | Foto lifestyle dengan model |

## 📊 Rate Limits

| Plan | Rate Limit | Monthly Quota |
|------|------------|---------------|
| Free | ❌ No Access | - |
| Basic | 5 req/min | 50 generations |
| Pro | 10 req/min | 200 generations |

## 🛠️ Support

- 📧 Email: support@yourapp.com
- 💬 Discord: discord.gg/yourapp
- 📚 Docs: docs.yourapp.com
- 🐛 Issues: github.com/yourapp/issues

## 📝 Changelog

### v1.0.0 (2024-12-19)
- Initial API release
- 9 enhancement types
- Watermark support
- Rate limiting
- Multi-language examples

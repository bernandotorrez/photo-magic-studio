# Struktur Dokumentasi API

Dokumentasi API tersedia dalam berbagai format untuk memenuhi kebutuhan semua user.

## 📁 File Dokumentasi

### 1. Dokumentasi Markdown

| File | Target Audience | Isi |
|------|----------------|-----|
| `API_README.md` | Semua | Index & overview semua dokumentasi |
| `API_DOCUMENTATION.md` | Developer | Dokumentasi teknis lengkap, endpoints, parameters |
| `API_QUICK_START.md` | Developer | Panduan cepat 5 menit untuk mulai |
| `API_EXAMPLES.md` | Developer | Contoh code 10+ bahasa pemrograman |
| `USER_API_GUIDE.md` | Non-developer | Panduan user-friendly dengan penjelasan sederhana |
| `postman_collection.json` | Developer | Collection untuk testing di Postman |

### 2. UI Components (React)

| Component | Path | Deskripsi |
|-----------|------|-----------|
| `UserApiGuide` | `src/components/api/UserApiGuide.tsx` | Panduan user-friendly dengan tabs interaktif |
| `ApiDocumentation` | `src/components/api/ApiDocumentation.tsx` | Dokumentasi developer dengan code examples |
| `ApiPlayground` | `src/components/api/ApiPlayground.tsx` | Testing playground tanpa coding |

### 3. Pages

| Page | Route | Deskripsi |
|------|-------|-----------|
| `ApiKeys` | `/api-keys` | Manage API keys, create/revoke |
| `ApiDocumentation` | `/api-documentation` | Halaman dokumentasi dengan toggle User/Developer |

## 🎯 Target Audience

### User (Non-Developer)
**Akses:** `/api-documentation` → Tab "Panduan User"

**Fitur:**
- ✅ Penjelasan sederhana "Apa itu API?"
- ✅ Step-by-step cara mulai (3 langkah)
- ✅ Contoh penggunaan dengan penjelasan
- ✅ API Playground untuk test tanpa coding
- ✅ FAQ & troubleshooting
- ✅ Tips & best practices

**Cocok untuk:**
- Pemilik toko online
- Marketing team
- Product manager
- User Basic/Pro yang ingin integrasi tapi tidak coding sendiri

### Developer
**Akses:** `/api-documentation` → Tab "Developer Docs"

**Fitur:**
- ✅ Technical API reference
- ✅ Endpoints & parameters detail
- ✅ Request/response examples
- ✅ Code snippets (JavaScript, Python, PHP, dll)
- ✅ Error codes & handling
- ✅ Rate limits & authentication

**Cocok untuk:**
- Frontend/Backend developer
- DevOps engineer
- Technical integrator

## 📖 Cara Menggunakan

### Untuk User Baru

1. **Buka halaman API Keys** (`/api-keys`)
2. **Upgrade ke Basic/Pro** (jika masih Free)
3. **Klik "📖 Panduan Lengkap API"**
4. **Pilih tab "Panduan User"**
5. **Ikuti step-by-step guide**
6. **Test di Playground** (tab 🎮 Playground)

### Untuk Developer

1. **Buka halaman API Keys** (`/api-keys`)
2. **Create API Key**
3. **Klik "💻 Developer Docs"**
4. **Pilih tab "Developer Docs"**
5. **Copy code examples**
6. **Implementasi di aplikasi**

## 🔗 Navigation Flow

```
/api-keys (API Keys Management)
    ↓
    ├─→ 📖 Panduan Lengkap API
    │       ↓
    │   /api-documentation
    │       ├─→ Tab: Panduan User (UserApiGuide)
    │       │       ├─→ Apa itu API?
    │       │       ├─→ Cara Mulai (3 steps)
    │       │       ├─→ Cara Pakai (code examples)
    │       │       ├─→ 🎮 Playground (test API)
    │       │       └─→ FAQ & Tips
    │       │
    │       └─→ Tab: Developer Docs (ApiDocumentation)
    │               ├─→ Overview (Base URL, Rate Limits)
    │               ├─→ Authentication
    │               ├─→ Endpoint (POST /api-generate)
    │               ├─→ Examples (JS, Python, PHP)
    │               └─→ Errors (Error codes & solutions)
    │
    └─→ 💻 Developer Docs (same as above)
```

## 🎨 UI Features

### UserApiGuide Component

**Tabs:**
1. **Apa itu API?** - Penjelasan sederhana + use cases
2. **Cara Mulai** - 3 langkah mudah dengan visual
3. **Cara Pakai** - Code examples dengan copy button
4. **🎮 Playground** - Test API langsung tanpa coding
5. **FAQ & Tips** - Troubleshooting & best practices

**Visual Elements:**
- 🎨 Color-coded cards (green = success, orange = warning, red = error)
- 📋 Copy-paste code blocks
- ✅ Checklist & step indicators
- 🎯 Enhancement type cards dengan deskripsi
- 💡 Tips & warnings dengan icons

### ApiDocumentation Component

**Tabs:**
1. **Overview** - Base URL, Rate Limits
2. **Authentication** - API key setup
3. **Endpoint** - Request/response format
4. **Examples** - Multi-language code
5. **Errors** - Error handling guide

**Features:**
- 📝 Syntax-highlighted code blocks
- 📋 One-click copy
- 📊 Parameter tables
- 🔗 Links to external docs

### ApiPlayground Component

**Features:**
- 🔑 API key input (password field)
- 🖼️ Image URL input
- 🎨 Enhancement type selector
- ▶️ Test button
- ✅ Success result with image preview
- ❌ Error display
- 📊 Response details (URL, Task ID, Prompt)

## 🚀 Quick Links

### Untuk User
- [Panduan User (Markdown)](./USER_API_GUIDE.md)
- [Quick Start](./API_QUICK_START.md)
- UI: `/api-documentation` → Tab "Panduan User"

### Untuk Developer
- [API Documentation (Markdown)](./API_DOCUMENTATION.md)
- [Code Examples](./API_EXAMPLES.md)
- [Postman Collection](./postman_collection.json)
- UI: `/api-documentation` → Tab "Developer Docs"

## 📞 Support

Jika ada pertanyaan atau butuh bantuan:
- 📧 Email: support@yourapp.com
- 💬 Live Chat di dashboard
- 📚 Dokumentasi lengkap di `/api-documentation`
- 🎮 Test di Playground: `/api-documentation` → 🎮 Playground

---

**Last Updated:** 2025-12-19
**Version:** 1.0.0

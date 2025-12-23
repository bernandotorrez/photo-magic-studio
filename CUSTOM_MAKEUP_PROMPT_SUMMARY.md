# Custom Makeup Prompt - Quick Summary

## 🎯 Apa yang Ditambahkan?

Field **Custom Makeup Prompt** di halaman **Make Up Artist** untuk kontrol detail makeup seperti warna lipstik, eyeshadow, dan blush.

## 📍 Lokasi

**Frontend:** `/makeup-artist` (Make Up Artist page)  
**Backend:** `supabase/functions/api-generate/index.ts`  
**API:** Parameter `customMakeup` di endpoint `/api-generate`

## 💡 Cara Pakai

### Di Frontend (Make Up Artist Page):
1. Upload foto portrait
2. Pilih style makeup
3. **Isi field "Custom Makeup Details"** (opsional):
   - Contoh: `"red lipstick, smokey eyes, pink blush"`
   - Contoh: `"rose gold eyeshadow, nude pink lipstick"`
4. Generate

### Di API:
```bash
curl -X POST https://[project-id].supabase.co/functions/v1/api-generate \
  -H "x-api-key: your-key" \
  -d '{
    "imageUrl": "https://example.com/portrait.jpg",
    "enhancement": "💄 Glamorous Evening Makeup",
    "classification": "beauty",
    "customMakeup": "rose gold eyeshadow, nude pink lipstick, peachy blush"
  }'
```

```javascript
// JavaScript
const response = await fetch('https://[project-id].supabase.co/functions/v1/api-generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-key'
  },
  body: JSON.stringify({
    imageUrl: 'https://example.com/portrait.jpg',
    enhancement: '💋 Bold Red Lips',
    classification: 'beauty',
    customMakeup: 'deep burgundy red with matte finish'
  })
});
```

## 📝 Contoh Input

| Input | Hasil |
|-------|-------|
| `"red lipstick"` | Lipstik merah |
| `"smokey eyes"` | Eyeshadow smokey |
| `"pink blush"` | Blush on pink |
| `"red lipstick, smokey eyes, pink blush"` | Kombinasi lengkap |
| `"rose gold eyeshadow, nude pink lipstick"` | Warna spesifik |
| `"deep burgundy red with matte finish"` | Detail finish |

## 🔒 Security

- Input di-sanitize otomatis
- Max 500 karakter
- Menghapus script tags & HTML
- Mencegah XSS attacks

## 📚 Dokumentasi Lengkap

- **Update Detail:** `MAKEUP_CUSTOM_PROMPT_UPDATE.md`
- **API Docs:** `API_DOCUMENTATION.md` (section customMakeup)
- **Menu Split:** `HAIR_MAKEUP_MENU_SPLIT.md`

## ✅ Status

- [x] Frontend implemented
- [x] Backend implemented
- [x] API documented
- [x] Security tested
- [x] Ready for production

**Happy Generating! 💄✨**

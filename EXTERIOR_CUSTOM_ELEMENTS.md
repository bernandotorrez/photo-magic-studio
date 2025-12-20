# Custom Exterior Elements Feature

## Overview
Fitur untuk menambahkan elemen eksterior spesifik pada Exterior Design, mirip dengan custom furniture di Interior Design.

## Fitur Baru

### Frontend (UI)
**File:** `src/components/dashboard/EnhancementOptions.tsx`

Menambahkan input field untuk custom exterior elements yang muncul ketika:
- `classification === 'exterior'`
- User memilih enhancement seperti "Facade Renovation" atau "Landscaping"

**Contoh Elemen Eksterior:**
- Canopy / Kanopi
- Taman Vertikal
- Kolam Ikan / Koi Pond
- Gazebo / Pergola
- Lampu Taman
- Pot Tanaman Besar
- Pagar Tanaman
- Jalur Batu / Pathway
- Fountain / Air Mancur
- Outdoor Furniture
- Teras Kayu / Deck
- Tanaman Rambat

### Backend (API)

#### 1. `supabase/functions/generate-enhanced-image/index.ts`
- Tambah parameter `customExterior` di request body
- Update function `buildEnhancementPrompt()` untuk menerima `customExterior`
- Logika untuk "Facade Renovation" dan "Landscaping":
  - Jika `customExterior` ada: tambahkan elemen spesifik ke prompt
  - Jika kosong: gunakan prompt default

#### 2. `supabase/functions/api-generate/index.ts`
- Tambah parameter `customExterior` di request body
- Update function `buildEnhancementPrompt()` untuk menerima `customExterior`
- Tambah logika untuk facade renovation dan landscaping dengan custom elements

### Dokumentasi API
**File:** `USER_API_GUIDE.md`

Menambahkan:
- Parameter `customExterior` di tabel parameter
- Enhancement types untuk exterior design
- Contoh code untuk exterior design dengan custom elements

## Cara Penggunaan

### Via UI (Web App)
1. Buka menu "Exterior Design AI"
2. Upload foto eksterior bangunan
3. Pilih enhancement (misal: "Landscaping Enhancement")
4. Isi field "Custom Exterior Elements" dengan elemen yang diinginkan
   - Contoh: `canopy modern, taman vertikal, kolam ikan koi, gazebo kayu`
5. Klik "Generate"

### Via API
```javascript
const response = await fetch('https://[project-id].supabase.co/functions/v1/api-generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'eak_your_api_key'
  },
  body: JSON.stringify({
    imageUrl: 'https://example.com/building.jpg',
    enhancement: 'landscaping',
    classification: 'exterior',
    customExterior: 'canopy modern, taman vertikal, kolam ikan koi, gazebo kayu, lampu taman LED'
  })
});
```

## Implementasi Detail

### Prompt Engineering
Ketika user memberikan `customExterior`, prompt akan menjadi:

**Facade Renovation:**
```
Renovate the facade of this building and add the following exterior elements: 
{customExterior}. Modernize the exterior appearance with updated materials, 
colors, and architectural details. Professional architectural renovation.
```

**Landscaping:**
```
Add professional landscaping to this property with the following elements: 
{customExterior}. Include lawn, trees, shrubs, flowers, and garden design. 
Create an attractive, well-maintained landscape. Professional landscape architecture.
```

## Files Modified
1. ✅ `src/components/dashboard/EnhancementOptions.tsx` - UI untuk input custom exterior
2. ✅ `supabase/functions/generate-enhanced-image/index.ts` - Backend logic
3. ✅ `supabase/functions/api-generate/index.ts` - API endpoint
4. ✅ `USER_API_GUIDE.md` - Dokumentasi API

## Testing
Untuk test fitur ini:
1. Upload foto eksterior bangunan
2. Pilih "Landscaping Enhancement"
3. Isi custom exterior: "canopy, kolam ikan, gazebo"
4. Generate dan lihat hasilnya

## Notes
- Field `customExterior` bersifat opsional
- Jika kosong, AI akan menambahkan elemen secara otomatis
- Pisahkan multiple items dengan koma
- Mendukung bahasa Indonesia dan Inggris

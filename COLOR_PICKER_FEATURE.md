# Color Picker Feature - Wall & Paint Color

## Overview
Fitur color picker untuk memilih warna dinding (interior) dan warna cat eksterior (exterior) secara spesifik menggunakan color picker atau preset warna populer.

## Fitur

### 1. Color Picker Input
- **Native HTML5 Color Picker**: Input type="color" untuk memilih warna dengan UI native browser
- **Hex Input Field**: Input manual untuk kode hex color (contoh: #ADD8E6)
- **Live Preview**: Preview warna yang dipilih dalam kotak besar

### 2. Preset Warna Populer
Grid 16 warna populer yang bisa dipilih langsung:

**Warna Terang:**
- Putih (#FFFFFF)
- Krem (#F5F5DC)
- Abu-abu Muda (#D3D3D3)
- Biru Muda (#ADD8E6)
- Hijau Mint (#98FF98)
- Peach (#FFDAB9)
- Lavender (#E6E6FA)
- Kuning Lembut (#FFFACD)

**Warna Gelap:**
- Abu-abu (#808080)
- Biru (#4682B4)
- Hijau (#90EE90)
- Coklat (#D2B48C)
- Navy (#000080)
- Maroon (#800000)
- Olive (#808000)
- Hitam (#000000)

### 3. Conditional Display
Color picker hanya muncul ketika user memilih enhancement yang relevan:

**Interior Design:**
- 🪟 Ubah Wallpaper/Cat Dinding
- 🌈 Ubah Color Scheme

**Exterior Design:**
- 🎨 Ubah Warna Cat Eksterior

## Implementasi

### Frontend (UI)
**File:** `src/components/dashboard/EnhancementOptions.tsx`

```typescript
// State
const [customWallColor, setCustomWallColor] = useState('#FFFFFF');

// Conditional rendering
{((classification === 'interior' && selectedEnhancements.some(e => 
    e.toLowerCase().includes('wallpaper') || 
    e.toLowerCase().includes('cat dinding') || 
    e.toLowerCase().includes('color scheme')
  )) || 
  (classification === 'exterior' && selectedEnhancements.some(e => 
    e.toLowerCase().includes('warna cat') || 
    e.toLowerCase().includes('paint color')
  ))) && (
  // Color picker UI
)}
```

### Backend (API)
**Files:** 
- `supabase/functions/generate-enhanced-image/index.ts`
- `supabase/functions/api-generate/index.ts`

**Parameter:** `customWallColor?: string`

**Prompt Engineering:**

**Interior - Wallpaper/Cat Dinding:**
```
Change the wall treatment in this interior to {customWallColor} color. 
Apply new paint color that enhances the space. Professional interior 
wall design with the specified color.
```

**Interior - Color Scheme:**
```
Change the color scheme of this interior with {customWallColor} as 
the primary wall color. Apply a harmonious, professional color palette.
```

**Exterior - Paint Color:**
```
Change the exterior paint color of this building to {customWallColor}. 
Apply this fresh, attractive color that enhances the architecture.
```

## Cara Penggunaan

### Via Web App
1. Upload foto interior/exterior
2. Pilih enhancement yang relevan (misal: "Ubah Wallpaper/Cat Dinding")
3. Section "Pilih Warna Dinding" akan muncul
4. Pilih warna dengan 3 cara:
   - Klik color picker dan pilih warna
   - Ketik kode hex langsung (contoh: #ADD8E6)
   - Klik salah satu preset warna populer
5. Lihat preview warna di kotak preview
6. Klik "Generate"

### Via API
```javascript
const response = await fetch('https://[project-id].supabase.co/functions/v1/api-generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'eak_your_api_key'
  },
  body: JSON.stringify({
    imageUrl: 'https://example.com/room.jpg',
    enhancement: 'ubah wallpaper/cat dinding',
    classification: 'interior',
    customWallColor: '#ADD8E6' // Biru muda
  })
});
```

## UI Components

### Color Picker Section
```tsx
<div className="flex items-center gap-3">
  <div className="flex-1">
    <Label>Warna yang Diinginkan</Label>
    <div className="flex gap-2">
      {/* Native color picker */}
      <input type="color" value={customWallColor} />
      
      {/* Hex input */}
      <Input type="text" value={customWallColor} />
    </div>
  </div>
  
  {/* Preview box */}
  <div style={{ backgroundColor: customWallColor }} />
</div>
```

### Preset Colors Grid
```tsx
<div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
  {presetColors.map((preset) => (
    <button
      onClick={() => setCustomWallColor(preset.color)}
      style={{ backgroundColor: preset.color }}
      className={customWallColor === preset.color ? 'selected' : ''}
    />
  ))}
</div>
```

## Behavior

### Default Value
- Default: `#FFFFFF` (putih)
- Jika user tidak mengubah atau memilih putih, AI akan memilih warna otomatis
- Jika user memilih warna lain, AI akan menggunakan warna tersebut

### Visual Feedback
- Selected preset color: border primary + ring + scale up
- Live preview: kotak besar menampilkan warna yang dipilih
- Hex input: sinkron dengan color picker

### Responsive Design
- Mobile: Grid 6 kolom untuk preset colors
- Desktop: Grid 8 kolom untuk preset colors
- Color picker dan input tetap accessible di semua ukuran layar

## Files Modified
1. ✅ `src/components/dashboard/EnhancementOptions.tsx` - UI color picker
2. ✅ `supabase/functions/generate-enhanced-image/index.ts` - Backend logic
3. ✅ `supabase/functions/api-generate/index.ts` - API endpoint
4. ✅ `USER_API_GUIDE.md` - Dokumentasi API

## Testing Checklist
- [ ] Color picker muncul untuk enhancement yang tepat
- [ ] Native color picker berfungsi
- [ ] Hex input berfungsi dan sinkron dengan color picker
- [ ] Preset colors bisa diklik dan mengubah nilai
- [ ] Preview box menampilkan warna yang benar
- [ ] Generate dengan custom color menghasilkan warna yang sesuai
- [ ] Default (putih) menghasilkan warna otomatis dari AI

## Notes
- Format warna: Hex color code (contoh: #ADD8E6, #FF5733)
- Opsional: Jika tidak diisi atau putih, AI pilih otomatis
- Mendukung semua warna hex valid
- UI responsive untuk mobile dan desktop

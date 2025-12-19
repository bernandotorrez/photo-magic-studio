# Custom Input Feature - AI Photographer & Interior Design

## 📋 Overview

Fitur baru yang memungkinkan user untuk menentukan **pose spesifik** (AI Photographer) dan **item furniture spesifik** (Interior Design) saat melakukan generation, bukan hanya mengandalkan hasil random dari AI.

## ✨ Fitur Baru

### 1. AI Photographer - Custom Pose Input

**Sebelumnya:**
- Pose yang dihasilkan AI adalah random
- User tidak bisa kontrol pose yang diinginkan

**Sekarang:**
- User bisa input deskripsi pose spesifik
- Contoh: "standing with arms crossed, looking confident"
- Jika tidak diisi, tetap menggunakan pose random (backward compatible)

**Lokasi UI:**
- Halaman: `/ai-photographer`
- Component: `EnhancementOptions.tsx`
- Input field muncul ketika `classification === 'person'`

**Contoh Penggunaan:**
```typescript
// Frontend
{
  originalImagePath: imagePath,
  classification: 'person',
  enhancement: 'ubah pose',
  customPose: 'sitting on a chair, hands on lap, smiling warmly'
}

// API
{
  imageUrl: 'https://example.com/portrait.jpg',
  enhancement: 'ubah pose',
  classification: 'person',
  customPose: 'leaning against a wall, casual pose, friendly smile'
}
```

### 2. Interior Design - Custom Furniture Input

**Sebelumnya:**
- Furniture yang ditambahkan AI adalah random
- User tidak bisa tentukan item furniture apa yang diinginkan

**Sekarang:**
- User bisa input item furniture spesifik (pisahkan dengan koma)
- Contoh: "sofa, meja TV, rak buku, lemari, karpet"
- Jika tidak diisi, tetap menggunakan furniture random (backward compatible)

**Lokasi UI:**
- Halaman: `/interior-design`
- Component: `EnhancementOptions.tsx`
- Input field muncul ketika `classification === 'interior'`

**Contoh Penggunaan:**
```typescript
// Frontend
{
  originalImagePath: imagePath,
  classification: 'interior',
  enhancement: 'virtual staging',
  customFurniture: 'sofa modern, meja TV minimalis, rak buku, karpet abu-abu'
}

// API
{
  imageUrl: 'https://example.com/empty-room.jpg',
  enhancement: 'virtual staging',
  classification: 'interior',
  customFurniture: 'dining table, 6 chairs, chandelier, sideboard'
}
```

## 🔧 Technical Implementation

### Frontend Changes

**File:** `src/components/dashboard/EnhancementOptions.tsx`

1. Added state untuk custom input:
```typescript
const [customPose, setCustomPose] = useState('');
const [customFurniture, setCustomFurniture] = useState('');
```

2. Added conditional UI section:
```tsx
{(classification === 'person' || classification === 'interior') && (
  <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 rounded-xl border border-border bg-muted/20">
    {/* Custom input fields */}
  </div>
)}
```

3. Pass custom input ke API:
```typescript
await supabase.functions.invoke('generate-enhanced-image', {
  body: {
    originalImagePath: imagePath,
    classification,
    enhancement,
    customPose: customPose || undefined,
    customFurniture: customFurniture || undefined,
    // ...
  },
});
```

### Backend Changes

**File:** `supabase/functions/generate-enhanced-image/index.ts`

1. Extract custom input dari request:
```typescript
const { imageUrl, originalImagePath, imagePath, enhancement, classification, 
        watermark, customPose, customFurniture, debugMode } = await req.json();
```

2. Update function signature:
```typescript
function buildEnhancementPrompt(
  enhancement: { id: string; title: string; description: string }, 
  customPose?: string, 
  customFurniture?: string
): string
```

3. Conditional prompt building:
```typescript
// AI Photographer
if (titleLower.includes('ubah pose') || titleLower.includes('pose variation')) {
  const poseInstruction = customPose 
    ? `Change the person's pose to: ${customPose}. Keep the person's face and clothing the same...`
    : `Change the person's pose to a more dynamic and professional pose...`;
  return poseInstruction;
}

// Interior Design
if (titleLower.includes('virtual staging') || titleLower.includes('tambah furniture')) {
  const furnitureInstruction = customFurniture
    ? `Add the following furniture and decor items to this room: ${customFurniture}...`
    : `Add professional furniture and decor to this empty room...`;
  return furnitureInstruction;
}
```

**File:** `supabase/functions/api-generate/index.ts`

Same changes applied untuk API eksternal.

## 📚 Documentation Updates

### Updated Files:

1. **API_DOCUMENTATION.md**
   - Added `customPose` parameter
   - Added `customFurniture` parameter
   - Added examples untuk kedua fitur
   - Updated changelog ke v1.1.0

2. **API_EXAMPLES.md**
   - Added contoh JavaScript dengan custom input
   - Added contoh React component usage
   - Updated interface definitions

3. **USER_API_GUIDE.md**
   - Added parameter documentation
   - Added usage examples (JS, Python, PHP)
   - Updated FAQ section
   - Updated enhancement types table

4. **postman_collection.json**
   - Added "AI Photographer - Custom Pose" request
   - Added "Interior Design - Custom Furniture" request
   - Updated version to 1.1.0

## 🧪 Testing

### Manual Testing Steps:

**AI Photographer:**
1. Go to `/ai-photographer`
2. Upload portrait photo
3. Select "Ubah Pose" enhancement
4. Enter custom pose: "standing with arms crossed, smiling confidently"
5. Click Generate
6. Verify hasil sesuai dengan pose yang diminta

**Interior Design:**
1. Go to `/interior-design`
2. Upload empty room photo
3. Select "Virtual Staging" enhancement
4. Enter custom furniture: "sofa, meja TV, rak buku, karpet"
5. Click Generate
6. Verify furniture items yang diminta muncul di hasil

**API Testing:**
```bash
# Test AI Photographer
curl -X POST https://[project-id].supabase.co/functions/v1/api-generate \
  -H "Content-Type: application/json" \
  -H "x-api-key: eak_your_key" \
  -d '{
    "imageUrl": "https://example.com/portrait.jpg",
    "enhancement": "ubah pose",
    "classification": "person",
    "customPose": "sitting on a chair, hands on lap"
  }'

# Test Interior Design
curl -X POST https://[project-id].supabase.co/functions/v1/api-generate \
  -H "Content-Type: application/json" \
  -H "x-api-key: eak_your_key" \
  -d '{
    "imageUrl": "https://example.com/empty-room.jpg",
    "enhancement": "virtual staging",
    "classification": "interior",
    "customFurniture": "sofa, meja TV, rak buku"
  }'
```

## 🎯 Use Cases

### AI Photographer Use Cases:

1. **Professional Headshots**
   - Input: "standing straight, hands by sides, professional smile"
   - Use: LinkedIn, resume, business cards

2. **Casual Portraits**
   - Input: "leaning against a wall, relaxed pose, friendly smile"
   - Use: Social media, dating apps

3. **Fashion Photography**
   - Input: "hand on hip, looking over shoulder, confident expression"
   - Use: Fashion portfolios, modeling

4. **Corporate Photos**
   - Input: "sitting at desk, hands folded, looking at camera"
   - Use: Company website, team pages

### Interior Design Use Cases:

1. **Living Room Staging**
   - Input: "sofa L-shape, coffee table, TV unit, floor lamp, wall art"
   - Use: Real estate listings

2. **Bedroom Design**
   - Input: "king bed, nightstands, dresser, mirror, bedside lamps"
   - Use: Property marketing

3. **Dining Room**
   - Input: "dining table, 6 chairs, chandelier, sideboard, decorative vase"
   - Use: Interior design proposals

4. **Home Office**
   - Input: "desk, office chair, bookshelf, desk lamp, computer"
   - Use: Remote work setup visualization

## 🚀 Benefits

### For Users:

✅ **More Control** - Tidak lagi random, user bisa tentukan hasil yang diinginkan  
✅ **Better Results** - Hasil lebih sesuai dengan kebutuhan spesifik  
✅ **Time Saving** - Tidak perlu regenerate berkali-kali untuk dapat hasil yang pas  
✅ **Flexibility** - Bisa tetap pakai random (kosongkan input) atau spesifik (isi input)  

### For Business:

✅ **Higher Satisfaction** - User lebih puas karena hasil sesuai ekspektasi  
✅ **Reduced Credits Usage** - User tidak perlu regenerate berkali-kali  
✅ **Competitive Advantage** - Fitur yang tidak dimiliki kompetitor  
✅ **API Value** - API lebih powerful untuk integration  

## 📊 Backward Compatibility

✅ **Fully Backward Compatible**

- Jika `customPose` atau `customFurniture` tidak diisi (undefined/null/empty), sistem tetap menggunakan prompt default (random)
- Existing API calls tanpa parameter baru tetap berfungsi normal
- No breaking changes untuk existing users

## 🔮 Future Enhancements

Potential improvements untuk versi mendatang:

1. **Preset Poses/Furniture**
   - Dropdown dengan preset populer
   - User bisa pilih dari preset atau custom input

2. **AI Suggestions**
   - AI suggest pose/furniture berdasarkan image analysis
   - "Recommended for this room: sofa, coffee table, rug"

3. **Multi-language Support**
   - Support input dalam bahasa Indonesia
   - "berdiri dengan tangan dilipat, senyum percaya diri"

4. **Image Reference**
   - Upload reference image untuk pose/furniture
   - AI match dengan reference yang diberikan

5. **Style Presets**
   - "Modern minimalist furniture set"
   - "Professional business pose"

## 📝 Notes

- Custom input adalah **optional** - backward compatible dengan existing behavior
- Input dalam bahasa Inggris memberikan hasil terbaik (AI model trained in English)
- Untuk furniture, pisahkan dengan koma untuk clarity
- Untuk pose, gunakan deskripsi yang jelas dan spesifik
- Maximum input length: 500 characters (reasonable limit)

## 🎉 Summary

Fitur custom input ini memberikan **kontrol lebih besar** kepada user untuk menentukan hasil generation yang diinginkan, sambil tetap mempertahankan **backward compatibility** dengan sistem existing. Implementasi dilakukan di frontend (UI), backend (API functions), dan dokumentasi lengkap untuk user dan developer.

**Version:** 1.1.0  
**Release Date:** December 19, 2024  
**Status:** ✅ Ready for Production

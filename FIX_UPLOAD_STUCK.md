# Fix: Upload Stuck Issue - Interior & Exterior Design

## Masalah
Saat upload gambar di Interior Design dan Exterior Design, proses stuck di "Mengupload & Menganalisis..." dan tidak pernah selesai.

## Root Cause

### Issue 1: `classifyImage` Function Recreation
Function `classifyImage` di-recreate setiap render karena tidak di-wrap dengan `useCallback`. Ini menyebabkan:
1. `onDrop` callback dependency berubah terus
2. Infinite re-render loop
3. Classification request tidak pernah selesai

### Issue 2: Wrong Hook Usage
InteriorDesign.tsx dan ExteriorDesign.tsx menggunakan `useState` untuk fetch profile, seharusnya `useEffect`:
```typescript
// ❌ Wrong
useState(() => {
  const fetchProfile = async () => { ... }
  fetchProfile();
});

// ✅ Correct
useEffect(() => {
  const fetchProfile = async () => { ... }
  fetchProfile();
}, [user]);
```

## Solusi

### Fix 1: ImageUploader.tsx

**Sebelum:**
```typescript
// Helper function to classify image
const classifyImage = async (imageUrl: string) => {
  console.log('Calling classify function:', classifyFunction);
  const { data, error } = await supabase.functions.invoke(classifyFunction, {
    body: { imageUrl },
  });
  // ...
};

const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
  // ...
  const classificationData = await classifyImage(signedUrlData.signedUrl);
  // ...
}, [user, canGenerate, onImageUploaded, toast, classifyImage]); // ❌ classifyImage berubah terus
```

**Sesudah:**
```typescript
// Helper function to classify image - wrapped in useCallback
const classifyImage = useCallback(async (imageUrl: string) => {
  console.log('Calling classify function:', classifyFunction);
  const { data, error } = await supabase.functions.invoke(classifyFunction, {
    body: { imageUrl },
  });
  // ...
}, [classifyFunction]); // ✅ Stable reference

const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
  // ...
  const classificationData = await classifyImage(signedUrlData.signedUrl);
  // ...
}, [user, canGenerate, profile, onImageUploaded, toast, classifyImage]); // ✅ classifyImage stable
```

### Fix 2: InteriorDesign.tsx & ExteriorDesign.tsx

**Sebelum:**
```typescript
import { useState } from 'react';

// ❌ Wrong hook
useState(() => {
  const fetchProfile = async () => {
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('monthly_generate_limit, current_month_generates')
        .eq('user_id', user.id)
        .single();
      
      if (data) setProfile(data);
    }
  };
  
  fetchProfile();
});
```

**Sesudah:**
```typescript
import { useState, useEffect } from 'react';

// ✅ Correct hook
useEffect(() => {
  const fetchProfile = async () => {
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('monthly_generate_limit, current_month_generates')
        .eq('user_id', user.id)
        .single();
      
      if (data) setProfile(data);
    }
  };
  
  fetchProfile();
}, [user]);
```

## Perubahan Detail

### 1. ImageUploader.tsx

#### Wrap `classifyImage` dengan `useCallback`
```typescript
const classifyImage = useCallback(async (imageUrl: string) => {
  console.log('Calling classify function:', classifyFunction);
  const { data, error } = await supabase.functions.invoke(classifyFunction, {
    body: { imageUrl },
  });

  if (error) {
    console.error('Classification error:', error);
    throw error;
  }

  console.log('Classification response:', data);
  return data;
}, [classifyFunction]);
```

#### Update dependency array `onDrop`
```typescript
}, [user, canGenerate, profile, onImageUploaded, toast, classifyImage]);
```

Tambahkan `profile` yang sebelumnya hilang.

### 2. InteriorDesign.tsx

#### Import useEffect
```typescript
import { useState, useEffect } from 'react';
```

#### Ganti useState dengan useEffect
```typescript
useEffect(() => {
  const fetchProfile = async () => {
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('monthly_generate_limit, current_month_generates')
        .eq('user_id', user.id)
        .single();
      
      if (data) setProfile(data);
    }
  };
  
  fetchProfile();
}, [user]);
```

### 3. ExteriorDesign.tsx

Same fix as InteriorDesign.tsx.

## Testing

### Test Case 1: Interior Design - Upload File
1. Buka Interior Design
2. Upload gambar via drag & drop atau click
3. ✅ Harus muncul "Mengupload & Menganalisis..."
4. ✅ Harus selesai dalam beberapa detik
5. ✅ Muncul enhancement options untuk interior

### Test Case 2: Interior Design - Upload URL
1. Buka Interior Design
2. Masukkan URL gambar
3. Klik "Upload dari URL"
4. ✅ Harus muncul "Menganalisis gambar..."
5. ✅ Harus selesai dalam beberapa detik
6. ✅ Muncul enhancement options untuk interior

### Test Case 3: Exterior Design - Upload File
1. Buka Exterior Design
2. Upload gambar
3. ✅ Harus muncul "Mengupload & Menganalisis..."
4. ✅ Harus selesai dalam beberapa detik
5. ✅ Muncul enhancement options untuk exterior

### Test Case 4: Exterior Design - Upload URL
1. Buka Exterior Design
2. Masukkan URL gambar
3. Klik "Upload dari URL"
4. ✅ Harus muncul "Menganalisis gambar..."
5. ✅ Harus selesai dalam beberapa detik
6. ✅ Muncul enhancement options untuk exterior

### Test Case 5: Profile Loading
1. Refresh halaman Interior/Exterior Design
2. ✅ Profile harus di-fetch sekali saja
3. ✅ Tidak ada infinite loop
4. ✅ Token count muncul dengan benar

## Files Modified
- ✅ `src/components/dashboard/ImageUploader.tsx` - Fix classifyImage useCallback
- ✅ `src/pages/InteriorDesign.tsx` - Fix useState → useEffect
- ✅ `src/pages/ExteriorDesign.tsx` - Fix useState → useEffect

## Impact

### Before Fix:
- ❌ Upload stuck di "Mengupload & Menganalisis..."
- ❌ Infinite re-render loop
- ❌ Memory leak
- ❌ Classification timeout
- ❌ Profile fetch tidak berfungsi dengan benar

### After Fix:
- ✅ Upload selesai dalam beberapa detik
- ✅ No infinite re-render
- ✅ No memory leak
- ✅ Classification berfungsi normal
- ✅ Profile fetch berfungsi dengan benar

## Notes
- Issue ini mempengaruhi **Interior Design** dan **Exterior Design**
- Dashboard biasa tidak terpengaruh karena menggunakan default `classify-image`
- Fix ini juga mencegah memory leak dari infinite re-render
- `useState` untuk side effects adalah anti-pattern, selalu gunakan `useEffect`

## Prevention
Untuk mencegah issue serupa di masa depan:
1. Selalu wrap async functions dengan `useCallback` jika digunakan di dependency array
2. Pastikan semua dependencies di-list dengan benar
3. Gunakan `useEffect` untuk side effects, bukan `useState`
4. Test upload flow setelah perubahan di ImageUploader atau page components
5. Monitor console untuk warning tentang missing dependencies

## Related Issues
- Infinite re-render
- Memory leak
- Classification timeout
- Upload stuck/hanging
- Wrong hook usage (useState vs useEffect)

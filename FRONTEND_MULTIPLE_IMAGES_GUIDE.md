# Frontend Multiple Images Implementation Guide

## Overview

Frontend sekarang sudah support **automatic detection** untuk enhancement yang memerlukan multiple images. Sistem akan otomatis switch antara single image uploader dan multiple image uploader berdasarkan enhancement yang dipilih.

## New Components

### 1. `MultipleImageUploader.tsx`

Komponen untuk upload multiple images dengan fitur:
- ✅ Drag & drop multiple files sekaligus
- ✅ Upload dari URL (satu per satu)
- ✅ Preview semua gambar yang sudah diupload
- ✅ Remove individual images
- ✅ Progress indicator (X/Y images)
- ✅ Validation min/max images
- ✅ File size & format validation per image

### 2. `SmartImageUploader.tsx`

Komponen wrapper yang otomatis detect enhancement requirements:
- ✅ Query database untuk check `requires_multiple_images`
- ✅ Auto switch antara single/multiple uploader
- ✅ Pass min/max images ke MultipleImageUploader
- ✅ Show loading state saat checking

### 3. Updated `ImageUploader.tsx`

Komponen existing yang sudah di-update untuk support:
- ✅ Optional `selectedEnhancement` prop
- ✅ Optional `onMultipleImagesUploaded` callback

## Usage Examples

### Example 1: Basic Usage (Auto-detect)

```tsx
import { SmartImageUploader } from '@/components/dashboard/SmartImageUploader';

function GeneratePage() {
  const [selectedEnhancement, setSelectedEnhancement] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);

  return (
    <div>
      {/* Enhancement Selector */}
      <Select value={selectedEnhancement} onValueChange={setSelectedEnhancement}>
        <SelectItem value="remove_background">Remove Background</SelectItem>
        <SelectItem value="portrait_couple">Couple Portrait (2 images)</SelectItem>
        <SelectItem value="portrait_family">Family Portrait (2-10 images)</SelectItem>
      </Select>

      {/* Smart Image Uploader - Auto switches based on enhancement */}
      <SmartImageUploader
        selectedEnhancement={selectedEnhancement}
        profile={profile}
        onImageUploaded={(url, path, classification, options) => {
          // Handle single image
          console.log('Single image uploaded:', url);
        }}
        onMultipleImagesUploaded={(images) => {
          // Handle multiple images
          console.log('Multiple images uploaded:', images);
          setUploadedImages(images);
        }}
      />
    </div>
  );
}
```

### Example 2: Force Multiple Images

```tsx
import { MultipleImageUploader } from '@/components/dashboard/MultipleImageUploader';

function CouplePortraitPage() {
  return (
    <MultipleImageUploader
      minImages={2}
      maxImages={2}
      description="Upload 2 person photos - one for each person in the couple"
      profile={profile}
      onImagesUploaded={(images) => {
        console.log('Uploaded images:', images);
        // images = [
        //   { url: '...', path: '...', preview: '...' },
        //   { url: '...', path: '...', preview: '...' }
        // ]
      }}
    />
  );
}
```

### Example 3: Force Single Image

```tsx
import { ImageUploader } from '@/components/dashboard/ImageUploader';

function RemoveBackgroundPage() {
  return (
    <ImageUploader
      profile={profile}
      onImageUploaded={(url, path, classification, options) => {
        console.log('Image uploaded:', url);
      }}
    />
  );
}
```

## Component Props

### SmartImageUploader Props

```typescript
interface SmartImageUploaderProps {
  // Single image callback
  onImageUploaded: (
    url: string, 
    path: string, 
    classification: string, 
    options: any[]
  ) => void;
  
  // Multiple images callback (optional)
  onMultipleImagesUploaded?: (
    images: Array<{
      url: string;
      path: string;
      preview: string;
    }>
  ) => void;
  
  // User profile for token checking
  profile: Profile | null;
  
  // Selected enhancement to check requirements
  selectedEnhancement: string | null;
  
  // Edge function for classification (default: 'classify-image')
  classifyFunction?: string;
}
```

### MultipleImageUploader Props

```typescript
interface MultipleImageUploaderProps {
  // Callback when images uploaded
  onImagesUploaded: (
    images: Array<{
      url: string;
      path: string;
      preview: string;
    }>
  ) => void;
  
  // User profile for token checking
  profile: Profile | null;
  
  // Minimum images required
  minImages: number;
  
  // Maximum images allowed
  maxImages: number;
  
  // Description text to show user
  description?: string;
}
```

## How It Works

### 1. User Selects Enhancement

```tsx
<Select value={enhancement} onValueChange={setEnhancement}>
  <SelectItem value="portrait_couple">Couple Portrait</SelectItem>
</Select>
```

### 2. SmartImageUploader Checks Database

```typescript
// Automatically queries database
const { data } = await supabase
  .from('enhancement_prompts')
  .select('requires_multiple_images, min_images, max_images, multiple_images_description')
  .eq('enhancement_type', 'portrait_couple')
  .single();

// Result:
// {
//   requires_multiple_images: true,
//   min_images: 2,
//   max_images: 2,
//   multiple_images_description: "2 person photos - one for each person"
// }
```

### 3. Renders Appropriate Uploader

```typescript
if (enhancementInfo?.requires_multiple_images) {
  return <MultipleImageUploader minImages={2} maxImages={2} ... />;
} else {
  return <ImageUploader ... />;
}
```

### 4. User Uploads Images

**Single Image:**
- Drag & drop or select 1 file
- Callback: `onImageUploaded(url, path, classification, options)`

**Multiple Images:**
- Drag & drop or select multiple files
- Can add one by one
- Can remove individual images
- Callback: `onMultipleImagesUploaded([{url, path, preview}, ...])`

## UI Features

### MultipleImageUploader UI

```
┌─────────────────────────────────────────┐
│ ℹ️ Upload 2-10 gambar                   │
│ Multiple person photos - one for each   │
│ family member (2-10 people)             │
│ Progress: 3/10 (Minimal 2 gambar)       │
└─────────────────────────────────────────┘

┌───────┬───────┬───────┬───────┐
│ #1    │ #2    │ #3    │       │
│ [img] │ [img] │ [img] │       │
│   ❌  │   ❌  │   ❌  │       │
└───────┴───────┴───────┴───────┘

┌─────────────────────────────────────────┐
│         📁 Upload File | 🔗 Dari URL    │
├─────────────────────────────────────────┤
│                                         │
│              ➕ Tambah gambar           │
│     PNG, JPG, JPEG, WebP (Max 2MB)     │
│     Bisa upload multiple sekaligus      │
│                                         │
└─────────────────────────────────────────┘
```

### Features:

1. **Progress Indicator**
   - Shows current/max images
   - Highlights when minimum reached
   - Warning if below minimum

2. **Image Grid**
   - Numbered thumbnails (#1, #2, #3...)
   - Remove button on hover
   - Preview of uploaded images

3. **Upload Area**
   - Tabs: Upload File / Dari URL
   - Drag & drop multiple files
   - Add one by one from URL
   - Disabled when max reached

4. **Validation**
   - File size per image (2MB)
   - File format (PNG, JPG, JPEG, WebP)
   - Min/max images count
   - Token availability

## Integration with Generate Flow

### Update Generate Component

```tsx
function GenerateComponent() {
  const [selectedEnhancement, setSelectedEnhancement] = useState<string | null>(null);
  const [singleImage, setSingleImage] = useState<any>(null);
  const [multipleImages, setMultipleImages] = useState<any[]>([]);

  const handleGenerate = async () => {
    // Check if multiple images
    if (multipleImages.length > 0) {
      // Generate with multiple images
      const imageUrls = multipleImages.map(img => img.url);
      
      const response = await fetch('/functions/v1/api-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          imageUrls: imageUrls,  // Array of URLs
          enhancement: selectedEnhancement,
          classification: 'portrait'
        })
      });
    } else if (singleImage) {
      // Generate with single image
      const response = await fetch('/functions/v1/api-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          imageUrl: singleImage.url,  // Single URL
          enhancement: selectedEnhancement,
          classification: 'product'
        })
      });
    }
  };

  return (
    <div>
      {/* Enhancement Selector */}
      <EnhancementSelector 
        value={selectedEnhancement}
        onChange={setSelectedEnhancement}
      />

      {/* Smart Image Uploader */}
      <SmartImageUploader
        selectedEnhancement={selectedEnhancement}
        profile={profile}
        onImageUploaded={(url, path, classification, options) => {
          setSingleImage({ url, path, classification, options });
          setMultipleImages([]); // Clear multiple images
        }}
        onMultipleImagesUploaded={(images) => {
          setMultipleImages(images);
          setSingleImage(null); // Clear single image
        }}
      />

      {/* Generate Button */}
      <Button 
        onClick={handleGenerate}
        disabled={!singleImage && multipleImages.length === 0}
      >
        Generate
      </Button>
    </div>
  );
}
```

## Validation & Error Handling

### Frontend Validation

```typescript
// Check minimum images
if (multipleImages.length < minImages) {
  toast({
    title: 'Gambar Kurang',
    description: `Minimal ${minImages} gambar diperlukan`,
    variant: 'destructive'
  });
  return;
}

// Check maximum images
if (multipleImages.length > maxImages) {
  toast({
    title: 'Terlalu Banyak Gambar',
    description: `Maksimal ${maxImages} gambar`,
    variant: 'destructive'
  });
  return;
}

// Check file size per image
if (file.size > 2 * 1024 * 1024) {
  toast({
    title: 'File Terlalu Besar',
    description: 'Ukuran maksimal 2MB per gambar',
    variant: 'destructive'
  });
  return;
}
```

### Backend Validation

Backend edge function juga harus validate:

```typescript
// In api-generate edge function
const { imageUrl, imageUrls, enhancement } = await req.json();

// Get enhancement info
const { data: enhancementInfo } = await supabase
  .from('enhancement_prompts')
  .select('requires_multiple_images, min_images, max_images')
  .eq('enhancement_type', enhancement)
  .single();

if (enhancementInfo?.requires_multiple_images) {
  if (!imageUrls || !Array.isArray(imageUrls)) {
    return new Response(
      JSON.stringify({ error: 'This enhancement requires multiple images' }),
      { status: 400 }
    );
  }
  
  if (imageUrls.length < enhancementInfo.min_images) {
    return new Response(
      JSON.stringify({ 
        error: `Minimum ${enhancementInfo.min_images} images required` 
      }),
      { status: 400 }
    );
  }
}
```

## Testing Checklist

### Single Image Enhancement
- [ ] Upload file works
- [ ] Upload from URL works
- [ ] Preview shows correctly
- [ ] Classification works
- [ ] Generate works with single image

### Multiple Images Enhancement
- [ ] Upload multiple files at once works
- [ ] Upload from URL one by one works
- [ ] Preview grid shows all images
- [ ] Remove individual image works
- [ ] Progress indicator updates correctly
- [ ] Min/max validation works
- [ ] Generate works with multiple images

### Smart Switching
- [ ] Detects single image enhancement correctly
- [ ] Detects multiple images enhancement correctly
- [ ] Shows loading state while checking
- [ ] Switches UI automatically
- [ ] Handles enhancement change correctly

## Migration Steps

1. **Run SQL Migration**
   ```bash
   # Run RUN_THIS_SQL_COMPLETE_WITH_BASE.sql
   ```

2. **Update Edge Function**
   - Add support for `imageUrls` array parameter
   - Add validation for multiple images
   - Update AI prompt to handle multiple images

3. **Update Frontend Components**
   - ✅ Created `MultipleImageUploader.tsx`
   - ✅ Created `SmartImageUploader.tsx`
   - ✅ Updated `ImageUploader.tsx`
   - [ ] Update generate page to use `SmartImageUploader`
   - [ ] Update API playground to support multiple images

4. **Test All Flows**
   - Test single image enhancements
   - Test multiple images enhancements
   - Test switching between enhancements
   - Test validation and error handling

## Summary

✅ **Frontend sudah siap untuk multiple images!**

**Key Features:**
- Auto-detect enhancement requirements
- Smart switching between single/multiple uploader
- Beautiful UI with progress indicator
- Drag & drop multiple files
- Remove individual images
- Full validation
- Token checking

**Next Steps:**
1. Update generate page to use `SmartImageUploader`
2. Update edge function to handle `imageUrls`
3. Test end-to-end flow
4. Deploy!

---

**Questions?** Check the component source code or MULTIPLE_IMAGES_GUIDE.md for API details.

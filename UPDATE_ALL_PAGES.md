# Batch Update - All Pages to SmartImageUploader

## Files to Update:
1. ✅ FoodEnhancement.tsx - DONE
2. ✅ InteriorDesign.tsx - DONE
3. ⏳ ExteriorDesign.tsx
4. ⏳ AiPhotographer.tsx
5. ⏳ Dashboard.tsx
6. ⏳ DashboardNew.tsx

## Changes Needed for Each File:

### 1. Import Statement
```typescript
// OLD:
import { ImageUploader } from '@/components/dashboard/ImageUploader';

// NEW:
import { SmartImageUploader } from '@/components/dashboard/SmartImageUploader';
```

### 2. Add State for Multiple Images
```typescript
// ADD after selectedEnhancements state:
const [multipleImages, setMultipleImages] = useState<Array<{url: string, path: string, preview: string}>>([]);
```

### 3. Update handleImageUploaded
```typescript
// OLD:
const handleImageUploaded = (url: string, path: string, classif: string, options: string[]) => {
  setImageUrl(url);
  setImagePath(path);
  setClassification(classif);
  setEnhancementOptions(options);
  setSelectedEnhancements([]);
  setGeneratedResults([]);
};

// NEW:
const handleImageUploaded = (url: string, path: string, classif: string, options: string[]) => {
  setImageUrl(url);
  setImagePath(path);
  setClassification(classif);
  setEnhancementOptions(options);
  setSelectedEnhancements([]);
  setMultipleImages([]); // Clear multiple images
  setGeneratedResults([]);
};
```

### 4. Add handleMultipleImagesUploaded
```typescript
// ADD new function:
const handleMultipleImagesUploaded = (images: Array<{url: string, path: string, preview: string}>) => {
  setMultipleImages(images);
  setImageUrl(null);
  setImagePath(null);
  setClassification('CATEGORY_HERE'); // food, interior, exterior, portrait
  setEnhancementOptions([]);
  setSelectedEnhancements([]);
  setGeneratedResults([]);
};
```

### 5. Update handleBack
```typescript
// OLD:
const handleBack = () => {
  setImageUrl(null);
  setImagePath(null);
  setClassification(null);
  setEnhancementOptions([]);
  setSelectedEnhancements([]);
  setGeneratedResults([]);
};

// NEW:
const handleBack = () => {
  setImageUrl(null);
  setImagePath(null);
  setClassification(null);
  setEnhancementOptions([]);
  setSelectedEnhancements([]);
  setMultipleImages([]); // Clear multiple images
  setGeneratedResults([]);
};
```

### 6. Replace ImageUploader Component
```typescript
// OLD:
<ImageUploader
  onImageUploaded={handleImageUploaded}
  profile={profile}
  classifyFunction="classify-CATEGORY"
/>

// NEW:
<SmartImageUploader
  selectedEnhancement={selectedEnhancements[0] || null}
  onImageUploaded={handleImageUploaded}
  onMultipleImagesUploaded={handleMultipleImagesUploaded}
  profile={profile}
  classifyFunction="classify-CATEGORY"
/>
```

## Category Mapping:
- FoodEnhancement.tsx → 'food' → classify-food
- InteriorDesign.tsx → 'interior' → classify-interior
- ExteriorDesign.tsx → 'exterior' → classify-exterior
- AiPhotographer.tsx → 'portrait' → classify-portrait
- Dashboard.tsx → 'clothing' → classify-image
- DashboardNew.tsx → 'clothing' → classify-image

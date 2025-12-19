# Image Magnifier Guide

## Overview

Image Magnifier adalah komponen React yang menampilkan kaca pembesar (magnifying glass) saat user hover pada gambar. Fitur ini memungkinkan user melihat detail gambar dengan zoom 2.5x.

## Cara Kerja

### Visual Effect
```
Normal State:
┌─────────────────┐
│                 │
│     Image       │
│                 │
└─────────────────┘

Hover State:
┌─────────────────┐
│        ⭕       │  ← Circular magnifier follows cursor
│     Image       │
│                 │
└─────────────────┘
```

### Technical Flow
```
1. User hovers on image
   ↓
2. Component tracks mouse position
   ↓
3. Calculate relative position to image
   ↓
4. Render circular div at cursor position
   ↓
5. Set background to zoomed image
   ↓
6. Adjust background position to show correct area
```

## Component Props

```typescript
interface ImageMagnifierProps {
  src: string;           // Image URL (required)
  alt: string;           // Alt text (required)
  magnifierSize?: number; // Diameter in pixels (default: 150)
  zoomLevel?: number;     // Zoom multiplier (default: 2.5)
  className?: string;     // Additional CSS classes
}
```

## Usage Examples

### Basic Usage
```tsx
import { ImageMagnifier } from '@/components/ui/image-magnifier';

<ImageMagnifier
  src="/path/to/image.jpg"
  alt="Product image"
/>
```

### Custom Size and Zoom
```tsx
<ImageMagnifier
  src="/path/to/image.jpg"
  alt="Product image"
  magnifierSize={200}  // 200px diameter
  zoomLevel={3}        // 3x zoom
/>
```

### With Custom Styling
```tsx
<ImageMagnifier
  src="/path/to/image.jpg"
  alt="Product image"
  className="w-full h-auto"
/>
```

## Styling Customization

### Magnifier Appearance
Default styling:
```css
.magnifier {
  border: 2px solid white;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border-radius: 50%;
  pointer-events: none;
  z-index: 50;
}
```

### Custom Magnifier Style
Untuk mengubah appearance magnifier, edit di `image-magnifier.tsx`:

```tsx
<div
  className="absolute border-4 border-primary shadow-xl rounded-full"
  // ... other props
/>
```

## Configuration Options

### Magnifier Size
- **Small**: 100-150px - Untuk detail kecil
- **Medium**: 150-200px - Default, balanced
- **Large**: 200-300px - Untuk area lebih luas

### Zoom Level
- **Low**: 1.5-2x - Subtle zoom
- **Medium**: 2-3x - Default, good balance
- **High**: 3-5x - Extreme detail

## Performance Considerations

### Optimization Tips
1. **Image Size**: Gunakan gambar dengan resolusi cukup untuk zoom
2. **Event Throttling**: Mouse move events sudah optimal
3. **Conditional Rendering**: Magnifier hanya render saat hover

### Best Practices
```tsx
// ✅ Good: High resolution image
<ImageMagnifier src="/high-res-image.jpg" />

// ❌ Bad: Low resolution image (akan blur saat zoom)
<ImageMagnifier src="/low-res-thumbnail.jpg" />
```

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Optimal performance |
| Firefox | ✅ Full | Optimal performance |
| Safari | ✅ Full | Optimal performance |
| Edge | ✅ Full | Optimal performance |
| Mobile Safari | ⚠️ Partial | No hover, needs touch implementation |
| Mobile Chrome | ⚠️ Partial | No hover, needs touch implementation |

## Mobile Support

Current implementation menggunakan mouse events (`onMouseMove`, `onMouseEnter`, `onMouseLeave`), yang tidak bekerja di mobile.

### Future Mobile Implementation
```tsx
// Touch events untuk mobile
const handleTouchStart = (e: TouchEvent) => {
  setShowMagnifier(true);
};

const handleTouchMove = (e: TouchEvent) => {
  const touch = e.touches[0];
  // Update magnifier position
};

const handleTouchEnd = () => {
  setShowMagnifier(false);
};
```

## Troubleshooting

### Magnifier tidak muncul
**Penyebab:**
- Image belum loaded
- Mouse position tidak terdeteksi
- CSS z-index conflict

**Solusi:**
```tsx
// Pastikan image loaded
<img onLoad={() => console.log('Image loaded')} />

// Check z-index
className="relative z-10"
```

### Magnifier posisi tidak tepat
**Penyebab:**
- Parent container memiliki transform/position
- Image size calculation salah

**Solusi:**
```tsx
// Pastikan parent tidak memiliki transform
<div className="relative"> {/* No transform */}
  <ImageMagnifier />
</div>
```

### Zoom blur/pixelated
**Penyebab:**
- Image resolution terlalu rendah
- Zoom level terlalu tinggi

**Solusi:**
```tsx
// Gunakan image dengan resolusi lebih tinggi
// Atau kurangi zoom level
<ImageMagnifier zoomLevel={2} />
```

### Performance issues
**Penyebab:**
- Image terlalu besar
- Terlalu banyak re-renders

**Solusi:**
```tsx
// Optimize image size
// Use memoization if needed
const MemoizedMagnifier = React.memo(ImageMagnifier);
```

## Advanced Customization

### Custom Magnifier Shape
```tsx
// Square magnifier
style={{
  borderRadius: '8px', // Instead of 50%
}}
```

### Multiple Magnifiers
```tsx
// Different zoom levels for different images
<ImageMagnifier src={img1} zoomLevel={2} />
<ImageMagnifier src={img2} zoomLevel={3} />
<ImageMagnifier src={img3} zoomLevel={4} />
```

### Magnifier with Overlay Info
```tsx
{showMagnifier && (
  <>
    <div className="magnifier" />
    <div className="absolute top-0 left-0 bg-black/50 text-white p-2">
      Zoom: {zoomLevel}x
    </div>
  </>
)}
```

## Integration with Modal

Current implementation di `GenerationResult.tsx`:

```tsx
<Dialog>
  <DialogContent>
    <ImageMagnifier
      src={previewImage.url}
      alt={previewImage.title}
      magnifierSize={200}
      zoomLevel={2.5}
    />
  </DialogContent>
</Dialog>
```

## Testing

### Manual Testing
1. Hover pada gambar → Magnifier muncul
2. Move cursor → Magnifier mengikuti
3. Move cursor keluar → Magnifier hilang
4. Check zoom detail → Gambar jelas dan tidak blur

### Automated Testing
```tsx
import { render, fireEvent } from '@testing-library/react';

test('magnifier appears on hover', () => {
  const { container } = render(
    <ImageMagnifier src="/test.jpg" alt="test" />
  );
  
  const img = container.querySelector('img');
  fireEvent.mouseEnter(img);
  
  // Check if magnifier is visible
  expect(container.querySelector('.magnifier')).toBeInTheDocument();
});
```

## FAQ

**Q: Apakah magnifier bekerja di mobile?**
A: Tidak, current implementation hanya untuk desktop dengan mouse. Perlu implementasi touch events untuk mobile.

**Q: Bisakah mengubah bentuk magnifier?**
A: Ya, ubah `borderRadius` dari `50%` (circle) ke nilai lain untuk bentuk berbeda.

**Q: Apakah bisa zoom lebih dari 2.5x?**
A: Ya, set `zoomLevel` prop ke nilai yang diinginkan. Tapi pastikan image resolution cukup tinggi.

**Q: Bagaimana cara disable magnifier?**
A: Gunakan regular `<img>` tag tanpa `ImageMagnifier` component.

**Q: Apakah magnifier mempengaruhi performance?**
A: Minimal impact. Magnifier hanya render saat hover dan menggunakan CSS background untuk zoom.

## Resources

- Component: `src/components/ui/image-magnifier.tsx`
- Usage: `src/components/dashboard/GenerationResult.tsx`
- Documentation: `PREVIEW_FEATURE.md`

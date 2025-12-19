# File Size Limit Update

## Overview
Validasi ukuran file upload telah diubah dari **10MB** menjadi **2MB** untuk meningkatkan performa dan mengurangi biaya storage.

---

## Changes Made

### File Modified
- `src/components/dashboard/ImageUploader.tsx`

### Validations Updated

#### 1. Dropzone maxSize
```typescript
// Before
maxSize: 10 * 1024 * 1024, // 10MB

// After
maxSize: 2 * 1024 * 1024, // 2MB
```

#### 2. URL Upload Validation
```typescript
// Before
if (blob.size > 10 * 1024 * 1024) {
  throw new Error('Ukuran gambar terlalu besar (max 10MB)');
}

// After
if (blob.size > 2 * 1024 * 1024) {
  throw new Error('Ukuran gambar terlalu besar (max 2MB)');
}
```

#### 3. UI Text Updates
- Upload area: "Max 10MB" → "Max 2MB"
- URL input help text: "Max 10MB" → "Max 2MB"

#### 4. Enhanced Error Handling
Added detailed error messages for rejected files:
- **File too large:** "Ukuran file maksimal 2MB. Silakan kompres gambar terlebih dahulu."
- **Invalid format:** "Hanya file PNG, JPG, JPEG, dan WebP yang diperbolehkan."
- **Other errors:** Display specific error message

---

## Benefits

### 1. Performance
✅ **Faster Upload** - Smaller files upload quicker
✅ **Faster Processing** - AI processes smaller images faster
✅ **Better UX** - Reduced waiting time for users

### 2. Cost Savings
✅ **Storage Costs** - Less storage space needed
✅ **Bandwidth Costs** - Less data transfer
✅ **Processing Costs** - Faster AI processing = lower costs

### 3. Quality Control
✅ **Optimal Size** - 2MB is sufficient for high-quality images
✅ **Prevents Abuse** - Limits extremely large uploads
✅ **Consistent Quality** - Encourages optimized images

---

## User Impact

### What Users Need to Know
- Maximum file size is now **2MB**
- Supported formats: PNG, JPG, JPEG, WebP
- Clear error messages if file is too large
- Recommendation to compress images before upload

### Recommended Image Specs
- **Resolution:** 1024x1024px to 2048x2048px
- **Format:** JPG (best compression) or PNG (transparency)
- **Quality:** 80-90% (good balance of quality and size)
- **File Size:** Under 2MB

---

## Image Compression Tools

### Online Tools (Free)
1. **TinyPNG** - https://tinypng.com/
   - Excellent compression
   - Maintains quality
   - Supports PNG & JPG

2. **Squoosh** - https://squoosh.app/
   - Google's tool
   - Advanced options
   - Compare before/after

3. **Compressor.io** - https://compressor.io/
   - Simple interface
   - Fast compression
   - Good results

### Desktop Tools
1. **ImageOptim** (Mac) - Free
2. **FileOptimizer** (Windows) - Free
3. **GIMP** - Free, cross-platform

### Photoshop
- Save for Web (Legacy)
- Export As
- Quality: 80-90%

---

## Technical Details

### Validation Flow

#### File Upload
```
1. User selects file
2. Dropzone checks file size
3. If > 2MB → Show error, reject file
4. If ≤ 2MB → Accept and upload
```

#### URL Upload
```
1. User enters URL
2. Fetch image from URL
3. Check blob size
4. If > 2MB → Show error, stop
5. If ≤ 2MB → Upload to storage
```

### Error Messages

#### File Too Large (Dropzone)
```
Title: "File Terlalu Besar"
Description: "Ukuran file maksimal 2MB. Silakan kompres gambar terlebih dahulu."
Variant: destructive
```

#### File Too Large (URL)
```
Title: "Upload Gagal"
Description: "Ukuran gambar terlalu besar (max 2MB)"
Variant: destructive
```

#### Invalid Format
```
Title: "Format File Tidak Valid"
Description: "Hanya file PNG, JPG, JPEG, dan WebP yang diperbolehkan."
Variant: destructive
```

---

## Testing Checklist

### Test Cases

#### ✅ File Upload - Valid
- [ ] Upload 1MB JPG → Success
- [ ] Upload 1.5MB PNG → Success
- [ ] Upload 2MB WebP → Success

#### ✅ File Upload - Invalid Size
- [ ] Upload 3MB JPG → Error: "File Terlalu Besar"
- [ ] Upload 5MB PNG → Error: "File Terlalu Besar"
- [ ] Upload 10MB WebP → Error: "File Terlalu Besar"

#### ✅ File Upload - Invalid Format
- [ ] Upload PDF → Error: "Format File Tidak Valid"
- [ ] Upload GIF → Error: "Format File Tidak Valid"
- [ ] Upload BMP → Error: "Format File Tidak Valid"

#### ✅ URL Upload - Valid
- [ ] URL with 1MB image → Success
- [ ] URL with 2MB image → Success

#### ✅ URL Upload - Invalid Size
- [ ] URL with 3MB image → Error: "Ukuran gambar terlalu besar"
- [ ] URL with 5MB image → Error: "Ukuran gambar terlalu besar"

---

## FAQ

### Q: Why 2MB instead of 10MB?
**A:** 2MB is optimal for:
- Fast upload and processing
- High-quality images (1024x1024 to 2048x2048)
- Cost efficiency
- Better user experience

### Q: What if my image is larger than 2MB?
**A:** Compress your image using:
- Online tools (TinyPNG, Squoosh)
- Desktop software (Photoshop, GIMP)
- Mobile apps (Photo Compress, Image Size)

### Q: Will image quality be affected?
**A:** No! 2MB is sufficient for high-quality images. Most professional product photos are under 2MB when properly optimized.

### Q: Can I upload RAW files?
**A:** No. Only PNG, JPG, JPEG, and WebP are supported. Convert RAW files to JPG first.

### Q: What resolution should I use?
**A:** Recommended:
- Minimum: 1024x1024px
- Optimal: 1500x1500px to 2048x2048px
- Maximum: 4096x4096px (if under 2MB)

---

## Migration Notes

### For Existing Users
- No action required
- Existing uploaded images are not affected
- New uploads must be under 2MB

### For API Users
- Update API documentation
- Add file size validation in API
- Return clear error messages

---

## Future Considerations

### Potential Improvements
1. **Progressive Upload**
   - Show upload progress
   - Allow cancellation

2. **Auto-Compression**
   - Compress images client-side before upload
   - Maintain quality while reducing size

3. **Smart Resize**
   - Auto-resize large images
   - Maintain aspect ratio

4. **Batch Upload**
   - Multiple files at once
   - Total size limit: 10MB

---

## Monitoring

### Metrics to Track
- Average file size uploaded
- Number of rejected uploads (too large)
- User feedback on file size limit
- Storage costs before/after change

### Success Criteria
- ✅ 95%+ of uploads under 2MB
- ✅ Reduced storage costs by 50%+
- ✅ Faster average processing time
- ✅ Positive user feedback

---

## Support

### User Support
If users have issues with file size:
1. Recommend compression tools
2. Provide compression tutorial
3. Offer to help optimize images
4. Consider premium tier with higher limits

### Technical Support
- Monitor error logs for file size rejections
- Track user feedback
- Adjust limit if needed based on data

---

## Conclusion

The 2MB file size limit provides:
- ✅ Better performance
- ✅ Lower costs
- ✅ Optimal quality
- ✅ Better user experience

Most users won't be affected as properly optimized images are typically under 2MB.

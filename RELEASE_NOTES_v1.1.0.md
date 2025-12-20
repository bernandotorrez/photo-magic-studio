# Release Notes - Version 1.1.0

**Release Date:** December 19, 2025

## 🎉 What's New

### Custom Input Feature

Fitur baru yang memungkinkan user untuk menentukan hasil generation secara spesifik, tidak lagi random!

#### 1. AI Photographer - Custom Pose Input ✨

- **Fitur:** Input deskripsi pose spesifik yang diinginkan
- **Contoh:** "standing with arms crossed, looking confident"
- **Benefit:** Tidak perlu regenerate berkali-kali untuk dapat pose yang pas
- **Location:** AI Photographer page → Enhancement Options

#### 2. Interior Design - Custom Furniture Input ✨

- **Fitur:** Input item furniture spesifik yang diinginkan (pisahkan dengan koma)
- **Contoh:** "sofa, meja TV, rak buku, lemari, karpet"
- **Benefit:** Kontrol penuh atas furniture yang ditambahkan ke ruangan
- **Location:** Interior Design page → Enhancement Options

## 🔧 Technical Changes

### Frontend
- ✅ Added custom input fields di `EnhancementOptions.tsx`
- ✅ Conditional rendering berdasarkan classification (person/interior)
- ✅ State management untuk `customPose` dan `customFurniture`

### Backend
- ✅ Updated `generate-enhanced-image/index.ts` untuk support custom input
- ✅ Updated `api-generate/index.ts` untuk API eksternal
- ✅ Enhanced prompt building dengan conditional logic

### API
- ✅ New parameters: `customPose` dan `customFurniture`
- ✅ Fully backward compatible (optional parameters)
- ✅ Updated API version to 1.1.0

### Documentation
- ✅ Updated `API_DOCUMENTATION.md` dengan contoh lengkap
- ✅ Updated `API_EXAMPLES.md` dengan code examples
- ✅ Updated `USER_API_GUIDE.md` dengan panduan user
- ✅ Updated `postman_collection.json` dengan test cases baru
- ✅ Created `CUSTOM_INPUT_FEATURE.md` untuk technical reference

## 📚 API Changes

### New Parameters

```typescript
interface GenerateRequest {
  imageUrl: string;
  enhancement: string;
  classification?: string;
  customPose?: string;        // NEW - For AI Photographer
  customFurniture?: string;   // NEW - For Interior Design
  watermark?: WatermarkConfig;
}
```

### Example Usage

**AI Photographer:**
```javascript
{
  imageUrl: 'https://example.com/portrait.jpg',
  enhancement: 'ubah pose',
  classification: 'person',
  customPose: 'sitting on a chair, hands on lap, smiling warmly'
}
```

**Interior Design:**
```javascript
{
  imageUrl: 'https://example.com/empty-room.jpg',
  enhancement: 'virtual staging',
  classification: 'interior',
  customFurniture: 'sofa modern, meja TV, rak buku, karpet'
}
```

## ✅ Backward Compatibility

- ✅ All existing API calls work without changes
- ✅ Custom input parameters are **optional**
- ✅ If not provided, system uses default random behavior
- ✅ No breaking changes

## 🎯 Benefits

### For Users
- ✅ More control over generation results
- ✅ Better accuracy - results match expectations
- ✅ Time saving - less regeneration needed
- ✅ Flexibility - can use random or specific input

### For Developers
- ✅ More powerful API capabilities
- ✅ Better integration options
- ✅ Clear documentation with examples
- ✅ Postman collection for easy testing

## 📊 Affected Files

### Frontend
- `src/components/dashboard/EnhancementOptions.tsx`
- `src/pages/AiPhotographer.tsx` (no changes, uses EnhancementOptions)
- `src/pages/InteriorDesign.tsx` (no changes, uses EnhancementOptions)

### Backend
- `supabase/functions/generate-enhanced-image/index.ts`
- `supabase/functions/api-generate/index.ts`

### Documentation
- `API_DOCUMENTATION.md`
- `API_EXAMPLES.md`
- `USER_API_GUIDE.md`
- `postman_collection.json`
- `CUSTOM_INPUT_FEATURE.md` (new)
- `RELEASE_NOTES_v1.1.0.md` (new)

## 🧪 Testing

### Manual Testing
1. ✅ AI Photographer dengan custom pose
2. ✅ Interior Design dengan custom furniture
3. ✅ Backward compatibility (tanpa custom input)
4. ✅ API testing dengan Postman

### Test Cases Added
- AI Photographer - Custom Pose (Postman)
- Interior Design - Custom Furniture (Postman)

## 🚀 Deployment

### Steps
1. Deploy frontend changes (EnhancementOptions.tsx)
2. Deploy backend functions (generate-enhanced-image, api-generate)
3. Update API documentation on website
4. Announce new feature to users

### Rollback Plan
- All changes are backward compatible
- Can rollback without affecting existing users
- Custom input will simply be ignored if backend is rolled back

## 📝 Migration Guide

### For Existing Users
**No migration needed!** All existing code continues to work.

### For New Features
Simply add optional parameters:

```javascript
// Before (still works)
{
  imageUrl: url,
  enhancement: 'ubah pose'
}

// After (with new feature)
{
  imageUrl: url,
  enhancement: 'ubah pose',
  customPose: 'your custom pose description'
}
```

## 🔮 Future Roadmap

Potential enhancements for next versions:

1. **Preset Library**
   - Pre-defined popular poses
   - Pre-defined furniture sets

2. **AI Suggestions**
   - Smart recommendations based on image analysis
   - "Recommended furniture for this room type"

3. **Multi-language Support**
   - Support Indonesian language input
   - Better localization

4. **Reference Images**
   - Upload reference image for pose/furniture
   - AI matches with reference

## 📞 Support

If you encounter any issues:
- Check documentation: `CUSTOM_INPUT_FEATURE.md`
- Test with Postman collection
- Contact support team

## 🎊 Credits

Developed by: Kiro AI Assistant  
Requested by: User  
Version: 1.1.0  
Status: ✅ Production Ready

---

**Happy Generating! 🚀**

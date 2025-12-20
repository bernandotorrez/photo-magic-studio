# API Documentation V2.0 Update

## Summary

Updated `API_DOCUMENTATION.md` dengan informasi lengkap tentang 12 kategori produk baru dan enhancement options dengan emoji.

## What's New in V2.0

### 1. 12 Product Categories

Sebelumnya hanya support kategori umum, sekarang support 12 kategori spesifik:

**Fashion & Apparel:**
1. Clothing (Pakaian)
2. Shoes (Sepatu)
3. Bags (Tas)
4. Accessories (Aksesoris)
5. Jewelry (Perhiasan)
6. Headwear (Topi)
7. Eyewear (Kacamata)

**Beauty & Lifestyle:**
8. Beauty & Cosmetics
9. Electronics & Gadgets
10. Home & Living
11. Sports & Fitness
12. Kids & Baby Products

**AI Photography & Design:**
- AI Photographer (Person)
- Interior Design
- Exterior Design

### 2. Emoji-Based Enhancement Options

Semua enhancement options sekarang menggunakan emoji + text:
- `👗 Dipakai oleh Model Wanita`
- `💍 Dipakai di Jari/Tangan`
- `💄 Digunakan oleh Model (Makeup/Skincare)`
- `📱 Digunakan oleh Model`
- `🏃 Digunakan saat Olahraga`
- `👶 Digunakan oleh Anak/Baby`
- dll.

### 3. Category-Specific Enhancements

Setiap kategori memiliki enhancement options yang spesifik dan relevan:

**Jewelry:**
- Worn on specific body parts (finger, neck, wrist, ears)
- Luxury styling
- Sparkle & shine enhancement
- Material variants (gold/silver/rose gold)

**Beauty:**
- Model using product
- Luxury product styling
- Natural/organic aesthetic
- Ingredients highlight

**Electronics:**
- Model using device
- Tech features highlight
- Modern/futuristic look
- Tech product styling

**Home:**
- Home setting display
- Cozy aesthetic
- Natural/minimalist style
- Quality & comfort highlight

**Sports:**
- Equipment in use
- Athletic model
- Dynamic action shot
- Gym/fitness setting

**Kids:**
- Child/baby using product
- Photo with parents
- Fun & playful aesthetic
- Safety features highlight

### 4. Updated Code Examples

Semua code examples (cURL, JavaScript, Python, PHP, Node.js) updated dengan:
- New enhancement format (emoji + text)
- Multiple category examples
- Jewelry, beauty, electronics examples
- Updated classification parameter

### 5. Enhanced Documentation Structure

**Parameters Table:**
- Updated `enhancement` parameter description
- Updated `classification` parameter dengan 15 kategori
- Clear explanation untuk emoji usage

**Enhancement Types Section:**
- Organized by category
- Complete list dengan emoji
- Description untuk setiap enhancement
- Usage notes

**Code Examples:**
- 5 examples untuk berbagai kategori
- Fashion, jewelry, beauty, AI photographer, interior design
- Real-world use cases

## API Usage Changes

### Before (V1.x):
```javascript
{
  "imageUrl": "https://example.com/product.jpg",
  "enhancement": "add_female_model",
  "classification": "clothing"
}
```

### After (V2.0):
```javascript
{
  "imageUrl": "https://example.com/dress.jpg",
  "enhancement": "👗 Dipakai oleh Model Wanita",
  "classification": "clothing"
}
```

## Backward Compatibility

✅ **Old enhancement format masih didukung** untuk backward compatibility:
- `add_female_model` → masih berfungsi
- `add_male_model` → masih berfungsi
- `enhance_background` → masih berfungsi
- dll.

✅ **New emoji format** direkomendasikan untuk:
- Better readability
- Category-specific options
- Consistent dengan UI frontend

## Documentation Files Updated

1. **API_DOCUMENTATION.md** ✅
   - Complete enhancement types list (12 categories)
   - Updated parameters table
   - Updated code examples (5 examples)
   - Updated changelog (V2.0)

## Testing Checklist

- [ ] Test dengan old enhancement format (backward compatibility)
- [ ] Test dengan new emoji enhancement format
- [ ] Test semua 12 kategori produk
- [ ] Test custom pose untuk AI Photographer
- [ ] Test custom furniture untuk Interior Design
- [ ] Verify code examples (cURL, JS, Python)
- [ ] Check API response format
- [ ] Verify error handling

## Deployment Notes

1. **Backend Functions:**
   ```bash
   supabase functions deploy classify-fashion
   supabase functions deploy generate-enhanced-image
   supabase functions deploy api-generate
   ```

2. **Environment Variables:**
   - Ensure `HUGGING_FACE_API_KEY` is set
   - Ensure `KIE_AI_API_KEY` is set

3. **Frontend:**
   - No changes required (already using emoji format)
   - API documentation page will show updated info

## Support & Migration

**For API Users:**
- Old format masih berfungsi (no breaking changes)
- Recommended to migrate ke emoji format untuk consistency
- Check updated documentation untuk enhancement options baru

**For New Users:**
- Use emoji format dari awal
- Refer to category-specific enhancement options
- Follow code examples dalam dokumentasi

## Version History

- **V2.0.0** (2024-12-20) - 12 categories, emoji enhancements, Hugging Face AI
- **V1.1.0** (2024-12-19) - Custom pose & furniture
- **V1.0.0** (2024-12-19) - Initial release

## Contact & Support

- 📚 Full Documentation: `API_DOCUMENTATION.md`
- 🎮 Interactive Testing: `/api-documentation` → Playground tab
- 💬 Support: Dashboard live chat
- 📧 Email: support@yourapp.com

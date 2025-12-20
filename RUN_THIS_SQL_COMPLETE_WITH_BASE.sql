-- =====================================================
-- COMPLETE ENHANCEMENT UPDATE
-- Includes: Base enhancements + Multiple images support
-- =====================================================

-- =====================================================
-- PART 1: ADD MISSING COLUMNS FOR MULTIPLE IMAGES
-- =====================================================

-- Add columns to enhancement_prompts table
ALTER TABLE public.enhancement_prompts 
ADD COLUMN IF NOT EXISTS requires_multiple_images BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS min_images INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_images INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS multiple_images_description TEXT;

COMMENT ON COLUMN public.enhancement_prompts.requires_multiple_images IS 'Whether this enhancement requires multiple input images';
COMMENT ON COLUMN public.enhancement_prompts.min_images IS 'Minimum number of images required';
COMMENT ON COLUMN public.enhancement_prompts.max_images IS 'Maximum number of images allowed';
COMMENT ON COLUMN public.enhancement_prompts.multiple_images_description IS 'Description of what images are needed (e.g., "2 person photos for couple portrait")';

-- =====================================================
-- PART 2: ADD BASE/GENERAL ENHANCEMENTS
-- =====================================================

INSERT INTO public.enhancement_prompts (enhancement_type, display_name, prompt_template, description, category, sort_order) VALUES
-- Base/General Enhancements
('remove_background', '🎨 Remove Background', 'Remove the background completely and replace with pure white (#FFFFFF). Ensure clean edges around the subject with no artifacts or halos.', 'Hapus background, ganti putih bersih', 'general', 1000),
('improve_lighting', '💡 Improve Lighting', 'Enhance and improve the lighting. Add professional lighting setup with proper key light, fill light, and balanced illumination. Remove harsh shadows and create even, flattering light.', 'Perbaiki dan tingkatkan pencahayaan', 'general', 1001),
('enhance_quality', '✨ Enhance Quality', 'Enhance overall image quality. Improve sharpness, clarity, color accuracy, contrast, and remove noise. Make the image look professional and high-quality.', 'Tingkatkan kualitas gambar keseluruhan', 'general', 1002),
('color_correction', '🎨 Color Correction', 'Apply professional color correction and grading. Balance white balance, adjust exposure, enhance colors, and create a cohesive, professional color palette.', 'Koreksi warna profesional', 'general', 1003),
('upscale_resolution', '📐 Upscale Resolution', 'Upscale image resolution while maintaining quality. Increase size and detail using AI enhancement for sharper, larger images.', 'Perbesar resolusi dengan AI', 'general', 1004),
('denoise_clean', '🧹 Denoise & Clean', 'Remove noise, grain, and artifacts from the image. Clean up compression artifacts and create a smooth, professional result.', 'Hilangkan noise dan artifacts', 'general', 1005),
('sharpen_details', '🔍 Sharpen Details', 'Sharpen image details and enhance edge definition. Make textures and fine details more visible and crisp.', 'Pertajam detail dan tekstur', 'general', 1006),
('auto_enhance', '⚡ Auto Enhance', 'Automatically enhance the image with AI-powered adjustments. Optimize brightness, contrast, colors, and sharpness in one click.', 'Auto enhance dengan AI', 'general', 1007),
('professional_retouch', '✨ Professional Retouch', 'Apply professional retouching including blemish removal, skin smoothing, and overall polish while maintaining natural appearance.', 'Retouch profesional natural', 'general', 1008),
('hdr_effect', '🌈 HDR Effect', 'Apply HDR (High Dynamic Range) effect to bring out details in both shadows and highlights. Create balanced, detailed images.', 'Efek HDR untuk detail shadow dan highlight', 'general', 1009)
ON CONFLICT (enhancement_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  prompt_template = EXCLUDED.prompt_template,
  description = EXCLUDED.description,
  updated_at = timezone('utc'::text, now());

-- =====================================================
-- PART 3: UPDATE ENHANCEMENTS THAT NEED MULTIPLE IMAGES
-- =====================================================

-- Update couple portrait
UPDATE public.enhancement_prompts 
SET 
  requires_multiple_images = true,
  min_images = 2,
  max_images = 2,
  multiple_images_description = '2 person photos - one for each person in the couple'
WHERE enhancement_type = 'portrait_couple';

-- Update family portrait
UPDATE public.enhancement_prompts 
SET 
  requires_multiple_images = true,
  min_images = 2,
  max_images = 10,
  multiple_images_description = 'Multiple person photos - one for each family member (2-10 people)'
WHERE enhancement_type = 'portrait_family';

-- Update product comparison
UPDATE public.enhancement_prompts 
SET 
  requires_multiple_images = true,
  min_images = 2,
  max_images = 4,
  multiple_images_description = '2-4 product photos for side-by-side comparison'
WHERE enhancement_type = 'product_comparison';

-- Update before/after
UPDATE public.enhancement_prompts 
SET 
  requires_multiple_images = true,
  min_images = 2,
  max_images = 2,
  multiple_images_description = '2 photos - before and after state'
WHERE enhancement_type = 'food_before_after';

-- Update multiple angles
UPDATE public.enhancement_prompts 
SET 
  requires_multiple_images = true,
  min_images = 2,
  max_images = 8,
  multiple_images_description = '2-8 photos from different angles of the same product'
WHERE enhancement_type = 'product_multiple_angles';

-- Update 360 views
UPDATE public.enhancement_prompts 
SET 
  requires_multiple_images = true,
  min_images = 8,
  max_images = 36,
  multiple_images_description = '8-36 photos in sequence for 360-degree rotation'
WHERE enhancement_type IN ('product_360_spin', 'fashion_360_view');

-- Update outfit combination
UPDATE public.enhancement_prompts 
SET 
  requires_multiple_images = true,
  min_images = 2,
  max_images = 6,
  multiple_images_description = '2-6 photos of different clothing items and accessories to combine'
WHERE enhancement_type = 'fashion_outfit_combination';

-- =====================================================
-- PART 4: ADD NEW ENHANCEMENTS FOR MULTIPLE IMAGES
-- =====================================================

INSERT INTO public.enhancement_prompts (
  enhancement_type, 
  display_name, 
  prompt_template, 
  description, 
  category, 
  sort_order,
  requires_multiple_images,
  min_images,
  max_images,
  multiple_images_description
) VALUES
-- Multiple Images Enhancements
(
  'portrait_group_photo', 
  '👥 Group Photo (3+ People)', 
  'Create a group photo composition with multiple people. Arrange people naturally with good spacing, balanced composition, and cohesive lighting.',
  'Foto grup dengan 3+ orang',
  'portrait',
  110,
  true,
  3,
  20,
  '3-20 person photos to combine into group photo'
),
(
  'product_collage', 
  '🖼️ Product Collage', 
  'Create an attractive product collage combining multiple product images in creative layout with consistent styling.',
  'Kolase produk dari beberapa foto',
  'product',
  220,
  true,
  2,
  12,
  '2-12 product photos to arrange in collage'
),
(
  'fashion_lookbook', 
  '📚 Fashion Lookbook', 
  'Create fashion lookbook layout combining multiple outfit photos in magazine-style presentation.',
  'Lookbook fashion dengan multiple outfit',
  'fashion',
  55,
  true,
  2,
  8,
  '2-8 outfit photos for lookbook layout'
),
(
  'interior_room_tour', 
  '🏠 Room Tour Layout', 
  'Create room tour layout showing multiple angles of the same room in organized grid or sequence.',
  'Layout tour ruangan dari berbagai sudut',
  'interior',
  77,
  true,
  3,
  8,
  '3-8 photos of the same room from different angles'
),
(
  'food_menu_grid', 
  '🍽️ Menu Grid Layout', 
  'Create menu grid layout combining multiple food dishes in organized, appetizing presentation.',
  'Grid menu dengan beberapa hidangan',
  'food',
  40,
  true,
  4,
  16,
  '4-16 food photos to arrange in menu grid'
),
(
  'exterior_property_showcase', 
  '🏘️ Property Showcase', 
  'Create property showcase combining exterior photos from multiple angles - front, back, sides, and aerial views.',
  'Showcase properti dari berbagai sudut',
  'exterior',
  92,
  true,
  3,
  10,
  '3-10 exterior photos from different angles'
),
(
  'product_size_comparison', 
  '📏 Size Comparison Visual', 
  'Create size comparison visual showing different product sizes side by side with clear labeling.',
  'Perbandingan visual berbagai ukuran',
  'product',
  221,
  true,
  2,
  5,
  '2-5 photos of different product sizes'
),
(
  'portrait_transformation', 
  '✨ Before/After Transformation', 
  'Create before and after transformation comparison showing dramatic change in appearance, styling, or setting.',
  'Perbandingan transformasi sebelum/sesudah',
  'portrait',
  111,
  true,
  2,
  2,
  '2 photos - before and after transformation'
)
ON CONFLICT (enhancement_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  prompt_template = EXCLUDED.prompt_template,
  description = EXCLUDED.description,
  requires_multiple_images = EXCLUDED.requires_multiple_images,
  min_images = EXCLUDED.min_images,
  max_images = EXCLUDED.max_images,
  multiple_images_description = EXCLUDED.multiple_images_description,
  updated_at = timezone('utc'::text, now());

-- =====================================================
-- PART 5: MAP GENERAL ENHANCEMENTS TO ALL CATEGORIES
-- =====================================================

DO $$
DECLARE
  cat_id UUID;
  enh_id UUID;
BEGIN
  -- Map general enhancements to all categories
  FOR enh_id IN 
    SELECT id FROM public.enhancement_prompts WHERE category = 'general' AND is_active = true
  LOOP
    FOR cat_id IN 
      SELECT id FROM public.image_categories WHERE is_active = true
    LOOP
      INSERT INTO public.category_enhancements (category_id, enhancement_id, sort_order)
      VALUES (cat_id, enh_id, 999)
      ON CONFLICT (category_id, enhancement_id) DO UPDATE SET sort_order = EXCLUDED.sort_order;
    END LOOP;
  END LOOP;
END $$;

-- Map new multiple-image enhancements to their categories
DO $$
DECLARE
  cat_id UUID;
  enh_id UUID;
  enh_cat TEXT;
BEGIN
  FOR enh_id IN 
    SELECT id, category FROM public.enhancement_prompts 
    WHERE requires_multiple_images = true AND is_active = true
  LOOP
    -- Get category for this enhancement
    SELECT category INTO enh_cat FROM public.enhancement_prompts WHERE id = enh_id;
    
    -- Map to appropriate category
    IF enh_cat = 'portrait' THEN
      SELECT id INTO cat_id FROM public.image_categories WHERE category_code = 'portrait';
    ELSIF enh_cat = 'product' THEN
      SELECT id INTO cat_id FROM public.image_categories WHERE category_code = 'product';
    ELSIF enh_cat = 'fashion' THEN
      SELECT id INTO cat_id FROM public.image_categories WHERE category_code = 'clothing';
    ELSIF enh_cat = 'interior' THEN
      SELECT id INTO cat_id FROM public.image_categories WHERE category_code = 'interior';
    ELSIF enh_cat = 'exterior' THEN
      SELECT id INTO cat_id FROM public.image_categories WHERE category_code = 'exterior';
    ELSIF enh_cat = 'food' THEN
      SELECT id INTO cat_id FROM public.image_categories WHERE category_code = 'food';
    END IF;
    
    IF cat_id IS NOT NULL THEN
      INSERT INTO public.category_enhancements (category_id, enhancement_id, sort_order)
      SELECT cat_id, enh_id, sort_order FROM public.enhancement_prompts WHERE id = enh_id
      ON CONFLICT (category_id, enhancement_id) DO UPDATE SET sort_order = EXCLUDED.sort_order;
    END IF;
  END LOOP;
END $$;

-- =====================================================
-- PART 6: CREATE HELPER FUNCTION
-- =====================================================

-- Function to get enhancement details including multiple images info
CREATE OR REPLACE FUNCTION get_enhancement_details(p_enhancement_type VARCHAR)
RETURNS TABLE (
  enhancement_id UUID,
  enhancement_type VARCHAR,
  display_name VARCHAR,
  description TEXT,
  prompt_template TEXT,
  category VARCHAR,
  requires_multiple_images BOOLEAN,
  min_images INTEGER,
  max_images INTEGER,
  multiple_images_description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ep.id as enhancement_id,
    ep.enhancement_type,
    ep.display_name,
    ep.description,
    ep.prompt_template,
    ep.category,
    ep.requires_multiple_images,
    ep.min_images,
    ep.max_images,
    ep.multiple_images_description
  FROM public.enhancement_prompts ep
  WHERE 
    ep.enhancement_type = p_enhancement_type
    AND ep.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_enhancement_details(VARCHAR) TO anon, authenticated;

-- Function to get all enhancements that require multiple images
CREATE OR REPLACE FUNCTION get_multiple_image_enhancements()
RETURNS TABLE (
  enhancement_id UUID,
  enhancement_type VARCHAR,
  display_name VARCHAR,
  description TEXT,
  category VARCHAR,
  min_images INTEGER,
  max_images INTEGER,
  multiple_images_description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ep.id as enhancement_id,
    ep.enhancement_type,
    ep.display_name,
    ep.description,
    ep.category,
    ep.min_images,
    ep.max_images,
    ep.multiple_images_description
  FROM public.enhancement_prompts ep
  WHERE 
    ep.requires_multiple_images = true
    AND ep.is_active = true
  ORDER BY ep.category, ep.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_multiple_image_enhancements() TO anon, authenticated;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check enhancements that require multiple images
SELECT 
  enhancement_type,
  display_name,
  category,
  min_images,
  max_images,
  multiple_images_description
FROM public.enhancement_prompts
WHERE requires_multiple_images = true
ORDER BY category, sort_order;

-- Check total enhancements per category
SELECT 
  category,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE requires_multiple_images = true) as multiple_images_count
FROM public.enhancement_prompts
WHERE is_active = true
GROUP BY category
ORDER BY category;

-- Check general enhancements
SELECT 
  enhancement_type,
  display_name,
  description
FROM public.enhancement_prompts
WHERE category = 'general'
ORDER BY sort_order;

-- =====================================================
-- API USAGE EXAMPLES
-- =====================================================

-- Example 1: Single image enhancement
/*
{
  "imageUrl": "https://example.com/product.jpg",
  "enhancement": "remove_background",
  "classification": "product"
}
*/

-- Example 2: Multiple images enhancement (Couple Portrait)
/*
{
  "imageUrls": [
    "https://example.com/person1.jpg",
    "https://example.com/person2.jpg"
  ],
  "enhancement": "portrait_couple",
  "classification": "portrait"
}
*/

-- Example 3: Multiple images enhancement (Family Portrait)
/*
{
  "imageUrls": [
    "https://example.com/dad.jpg",
    "https://example.com/mom.jpg",
    "https://example.com/kid1.jpg",
    "https://example.com/kid2.jpg"
  ],
  "enhancement": "portrait_family",
  "classification": "portrait"
}
*/

-- Example 4: Product 360 view
/*
{
  "imageUrls": [
    "https://example.com/product-angle-1.jpg",
    "https://example.com/product-angle-2.jpg",
    "https://example.com/product-angle-3.jpg",
    // ... up to 36 images
  ],
  "enhancement": "product_360_spin",
  "classification": "product"
}
*/

COMMENT ON FUNCTION get_enhancement_details(VARCHAR) IS 'Get detailed information about a specific enhancement including multiple images requirements';
COMMENT ON FUNCTION get_multiple_image_enhancements() IS 'Get all enhancements that require multiple input images';

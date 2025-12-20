-- =====================================================
-- UPDATE ENHANCEMENT SORTING - FEATURED FIRST
-- Enhancement dengan emoji/unggulan tampil paling atas
-- =====================================================

-- =====================================================
-- PART 1: ADD is_featured COLUMN
-- =====================================================

ALTER TABLE public.enhancement_prompts 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.enhancement_prompts.is_featured IS 'Featured/unggulan enhancements with emoji - shown first';

-- =====================================================
-- PART 2: MARK FEATURED ENHANCEMENTS (WITH EMOJI)
-- =====================================================

-- Mark enhancements that have emoji in display_name as featured
UPDATE public.enhancement_prompts
SET is_featured = true
WHERE 
  -- Check if display_name contains emoji (Unicode range for emoji)
  display_name ~ '[🎨🛋️🌈💡🪟🖼️🌿✨🏠🎭🌸🏛️🏰🌅⛩️🏡🤠🌱🔒🍖⛱️🔥👤🧍💑👨‍👩‍👧‍👦🎓🤰💪📷⚫⚪📐🥕🍴💨🌳🎯📸👗🧕👔🎭🔎🔄📏⚪🌓💎🔄📦🎁💥👉⚖️🍽️🏘️📋🍜📰🏙️📻🏷️🌾💎🕰️🥐🕌🤖🧸💼📚🎄🌑☀️👐📱⚖️🔪💦❄️⭐👻🪝🏖️🌴🏊🚗🌺🏗️🌆🎬🖼️]'
  AND is_active = true;

-- =====================================================
-- PART 3: UPDATE SORT ORDER - FEATURED FIRST
-- =====================================================

-- Update sort order for featured enhancements to be negative (shown first)
-- Food featured enhancements
UPDATE public.enhancement_prompts
SET sort_order = sort_order - 1000
WHERE category = 'food' 
  AND is_featured = true
  AND sort_order >= 0;

-- Fashion featured enhancements
UPDATE public.enhancement_prompts
SET sort_order = sort_order - 1000
WHERE category = 'fashion' 
  AND is_featured = true
  AND sort_order >= 0;

-- Interior featured enhancements
UPDATE public.enhancement_prompts
SET sort_order = sort_order - 1000
WHERE category = 'interior' 
  AND is_featured = true
  AND sort_order >= 0;

-- Exterior featured enhancements
UPDATE public.enhancement_prompts
SET sort_order = sort_order - 1000
WHERE category = 'exterior' 
  AND is_featured = true
  AND sort_order >= 0;

-- Portrait featured enhancements
UPDATE public.enhancement_prompts
SET sort_order = sort_order - 1000
WHERE category = 'portrait' 
  AND is_featured = true
  AND sort_order >= 0;

-- Product featured enhancements
UPDATE public.enhancement_prompts
SET sort_order = sort_order - 1000
WHERE category = 'product' 
  AND is_featured = true
  AND sort_order >= 0;

-- General featured enhancements
UPDATE public.enhancement_prompts
SET sort_order = sort_order - 1000
WHERE category = 'general' 
  AND is_featured = true
  AND sort_order >= 0;

-- =====================================================
-- PART 4: UPDATE CATEGORY MAPPINGS SORT ORDER
-- =====================================================

-- Update category_enhancements sort order to match enhancement_prompts
UPDATE public.category_enhancements ce
SET sort_order = ep.sort_order
FROM public.enhancement_prompts ep
WHERE ce.enhancement_id = ep.id;

-- =====================================================
-- PART 5: UPDATE QUERY FUNCTIONS TO SORT BY FEATURED
-- =====================================================

-- Update get_enhancements_by_category function to sort featured first
CREATE OR REPLACE FUNCTION get_enhancements_by_category(p_category_code VARCHAR)
RETURNS TABLE (
  enhancement_id UUID,
  enhancement_type VARCHAR,
  display_name VARCHAR,
  description TEXT,
  prompt_template TEXT,
  category VARCHAR,
  is_default BOOLEAN,
  is_featured BOOLEAN,
  sort_order INTEGER
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
    ce.is_default,
    ep.is_featured,
    ce.sort_order
  FROM public.image_categories ic
  JOIN public.category_enhancements ce ON ic.id = ce.category_id
  JOIN public.enhancement_prompts ep ON ce.enhancement_id = ep.id
  WHERE 
    ic.category_code = p_category_code
    AND ic.is_active = true
    AND ep.is_active = true
  ORDER BY 
    ep.is_featured DESC,  -- Featured first
    ce.sort_order ASC,    -- Then by sort order
    ep.display_name ASC;  -- Then alphabetically
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_enhancement_details function
CREATE OR REPLACE FUNCTION get_enhancement_details(p_enhancement_type VARCHAR)
RETURNS TABLE (
  enhancement_id UUID,
  enhancement_type VARCHAR,
  display_name VARCHAR,
  description TEXT,
  prompt_template TEXT,
  category VARCHAR,
  is_featured BOOLEAN,
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
    ep.is_featured,
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

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check featured enhancements per category
SELECT 
  category,
  COUNT(*) as total_enhancements,
  COUNT(*) FILTER (WHERE is_featured = true) as featured_count,
  COUNT(*) FILTER (WHERE is_featured = false) as regular_count
FROM public.enhancement_prompts
WHERE is_active = true
GROUP BY category
ORDER BY category;

-- Show featured enhancements (should appear first in each category)
SELECT 
  category,
  display_name,
  is_featured,
  sort_order
FROM public.enhancement_prompts
WHERE is_active = true
ORDER BY 
  category,
  is_featured DESC,
  sort_order ASC
LIMIT 50;

-- Test query for food category (featured should be first)
SELECT 
  display_name,
  is_featured,
  sort_order
FROM public.enhancement_prompts ep
JOIN public.category_enhancements ce ON ep.id = ce.enhancement_id
JOIN public.image_categories ic ON ce.category_id = ic.id
WHERE ic.category_code = 'food'
  AND ep.is_active = true
ORDER BY 
  ep.is_featured DESC,
  ce.sort_order ASC
LIMIT 20;

-- =====================================================
-- MANUAL FEATURED MARKING (OPTIONAL)
-- =====================================================

-- If you want to manually mark specific enhancements as featured:

-- Example: Mark Virtual Staging as featured
UPDATE public.enhancement_prompts
SET is_featured = true
WHERE enhancement_type = 'interior_virtual_staging';

-- Example: Mark Couple Portrait as featured
UPDATE public.enhancement_prompts
SET is_featured = true
WHERE enhancement_type = 'portrait_couple';

-- Example: Mark specific food enhancements as featured
UPDATE public.enhancement_prompts
SET is_featured = true
WHERE enhancement_type IN (
  'food_angle_top_down',
  'food_angle_45_degree',
  'food_plating_elegant',
  'food_add_steam'
);

-- Example: Mark specific fashion enhancements as featured
UPDATE public.enhancement_prompts
SET is_featured = true
WHERE enhancement_type IN (
  'fashion_female_model',
  'fashion_male_model',
  'fashion_female_hijab_model',
  'fashion_mannequin'
);

-- =====================================================
-- ALTERNATIVE: MARK BY DISPLAY NAME PATTERN
-- =====================================================

-- Mark enhancements with specific emoji patterns as featured
UPDATE public.enhancement_prompts
SET is_featured = true
WHERE 
  (display_name LIKE '%✨%' OR
   display_name LIKE '%🛋️%' OR
   display_name LIKE '%💡%' OR
   display_name LIKE '%🎨%' OR
   display_name LIKE '%📸%' OR
   display_name LIKE '%👗%' OR
   display_name LIKE '%🏠%' OR
   display_name LIKE '%🍽️%')
  AND is_active = true;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION get_enhancements_by_category(VARCHAR) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_enhancement_details(VARCHAR) TO anon, authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION get_enhancements_by_category(VARCHAR) IS 'Get enhancements for a category, sorted with featured first';
COMMENT ON FUNCTION get_enhancement_details(VARCHAR) IS 'Get detailed information about a specific enhancement including featured status';

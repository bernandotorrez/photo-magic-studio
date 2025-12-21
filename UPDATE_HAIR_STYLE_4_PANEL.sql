-- =====================================================
-- UPDATE HAIR STYLE PROMPTS - 4 PANEL VIEW
-- Tambahkan instruksi 4 panel (depan, kiri, kanan, belakang)
-- untuk semua hair style enhancements
-- =====================================================

-- Update semua hair style male prompts
UPDATE public.enhancement_prompts
SET prompt_template = prompt_template || ' Generate the result in a 4-panel layout showing the hairstyle from 4 different angles: front view (facing camera), left side view (profile from left), right side view (profile from right), and back view (from behind). Each panel should clearly show the hairstyle from that specific angle in a professional salon photography style.'
WHERE category = 'hair_style_male' 
  AND is_active = true
  AND prompt_template NOT LIKE '%4-panel layout%';

-- Update semua hair style female prompts
UPDATE public.enhancement_prompts
SET prompt_template = prompt_template || ' Generate the result in a 4-panel layout showing the hairstyle from 4 different angles: front view (facing camera), left side view (profile from left), right side view (profile from right), and back view (from behind). Each panel should clearly show the hairstyle from that specific angle in a professional salon photography style.'
WHERE category = 'hair_style_female' 
  AND is_active = true
  AND prompt_template NOT LIKE '%4-panel layout%';

-- Verification: Check updated prompts
SELECT 
  enhancement_type,
  display_name,
  category,
  CASE 
    WHEN prompt_template LIKE '%4-panel layout%' THEN '✓ Updated'
    ELSE '✗ Not Updated'
  END as status,
  LENGTH(prompt_template) as prompt_length
FROM public.enhancement_prompts
WHERE category IN ('hair_style_male', 'hair_style_female')
  AND is_active = true
ORDER BY category, sort_order;

-- Count updated prompts
SELECT 
  category,
  COUNT(*) as total,
  SUM(CASE WHEN prompt_template LIKE '%4-panel layout%' THEN 1 ELSE 0 END) as updated,
  SUM(CASE WHEN prompt_template NOT LIKE '%4-panel layout%' THEN 1 ELSE 0 END) as not_updated
FROM public.enhancement_prompts
WHERE category IN ('hair_style_male', 'hair_style_female')
  AND is_active = true
GROUP BY category;

-- Show sample of updated prompts
SELECT 
  enhancement_type,
  display_name,
  LEFT(prompt_template, 100) || '...' as prompt_preview
FROM public.enhancement_prompts
WHERE category IN ('hair_style_male', 'hair_style_female')
  AND is_active = true
  AND prompt_template LIKE '%4-panel layout%'
LIMIT 5;

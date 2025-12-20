-- ============================================
-- GENERATE ENHANCEMENT MAPPING
-- ============================================
-- Query ini akan generate mapping untuk display_name -> enhancement_type
-- Copy hasil query ini dan paste ke generate-enhanced-image/index.ts

SELECT 
  CONCAT(
    '      ''', 
    display_name, 
    ''': ''', 
    enhancement_type, 
    ''','
  ) as mapping_line
FROM enhancement_prompts
WHERE is_active = true
ORDER BY category, sort_order;

-- ============================================
-- HASIL QUERY (Copy ke TypeScript)
-- ============================================
-- Paste hasil di atas ke dalam object displayNameToType
-- di file: supabase/functions/generate-enhanced-image/index.ts
-- 
-- Format:
-- const displayNameToType: { [key: string]: string } = {
--   'Display Name': 'enhancement_type',
--   ...
-- };
-- ============================================

-- ============================================
-- VERIFY MAPPING
-- ============================================
-- Check semua enhancement yang aktif
SELECT 
  category,
  enhancement_type,
  display_name,
  is_active
FROM enhancement_prompts
WHERE is_active = true
ORDER BY category, sort_order;

-- Count by category
SELECT 
  category,
  COUNT(*) as total_enhancements
FROM enhancement_prompts
WHERE is_active = true
GROUP BY category
ORDER BY category;

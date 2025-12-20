-- Query untuk generate dokumentasi API
-- Copy hasil query ini ke API_DOCUMENTATION.md

-- ============================================
-- FOOD ENHANCEMENTS
-- ============================================
SELECT 
  '### Food Category' as section,
  '' as blank_line,
  '| Display Name | Enhancement Type | Description |' as header,
  '|--------------|------------------|-------------|' as separator
UNION ALL
SELECT 
  '',
  '',
  '| ' || ep.display_name || ' | `' || ep.enhancement_type || '` | ' || COALESCE(ep.description, '-') || ' |',
  ''
FROM enhancement_prompts ep
JOIN category_enhancements ce ON ep.id = ce.enhancement_id
JOIN image_categories ic ON ce.category_id = ic.id
WHERE ic.category_code = 'food'
  AND ep.is_active = true
ORDER BY ce.sort_order;

-- ============================================
-- FASHION ENHANCEMENTS
-- ============================================
SELECT 
  '',
  '',
  '### Fashion Category',
  ''
UNION ALL
SELECT 
  '',
  '',
  '| Display Name | Enhancement Type | Description |',
  '|--------------|------------------|-------------|'
UNION ALL
SELECT 
  '',
  '',
  '| ' || ep.display_name || ' | `' || ep.enhancement_type || '` | ' || COALESCE(ep.description, '-') || ' |',
  ''
FROM enhancement_prompts ep
JOIN category_enhancements ce ON ep.id = ce.enhancement_id
JOIN image_categories ic ON ce.category_id = ic.id
WHERE ic.category_code = 'fashion'
  AND ep.is_active = true
ORDER BY ce.sort_order;

-- ============================================
-- INTERIOR ENHANCEMENTS
-- ============================================
SELECT 
  '',
  '',
  '### Interior Category',
  ''
UNION ALL
SELECT 
  '',
  '',
  '| Display Name | Enhancement Type | Description |',
  '|--------------|------------------|-------------|'
UNION ALL
SELECT 
  '',
  '',
  '| ' || ep.display_name || ' | `' || ep.enhancement_type || '` | ' || COALESCE(ep.description, '-') || ' |',
  ''
FROM enhancement_prompts ep
JOIN category_enhancements ce ON ep.id = ce.enhancement_id
JOIN image_categories ic ON ce.category_id = ic.id
WHERE ic.category_code = 'interior'
  AND ep.is_active = true
ORDER BY ce.sort_order;

-- ============================================
-- EXTERIOR ENHANCEMENTS
-- ============================================
SELECT 
  '',
  '',
  '### Exterior Category',
  ''
UNION ALL
SELECT 
  '',
  '',
  '| Display Name | Enhancement Type | Description |',
  '|--------------|------------------|-------------|'
UNION ALL
SELECT 
  '',
  '',
  '| ' || ep.display_name || ' | `' || ep.enhancement_type || '` | ' || COALESCE(ep.description, '-') || ' |',
  ''
FROM enhancement_prompts ep
JOIN category_enhancements ce ON ep.id = ce.enhancement_id
JOIN image_categories ic ON ce.category_id = ic.id
WHERE ic.category_code = 'exterior'
  AND ep.is_active = true
ORDER BY ce.sort_order;

-- ============================================
-- PORTRAIT ENHANCEMENTS
-- ============================================
SELECT 
  '',
  '',
  '### Portrait Category',
  ''
UNION ALL
SELECT 
  '',
  '',
  '| Display Name | Enhancement Type | Description |',
  '|--------------|------------------|-------------|'
UNION ALL
SELECT 
  '',
  '',
  '| ' || ep.display_name || ' | `' || ep.enhancement_type || '` | ' || COALESCE(ep.description, '-') || ' |',
  ''
FROM enhancement_prompts ep
JOIN category_enhancements ce ON ep.id = ce.enhancement_id
JOIN image_categories ic ON ce.category_id = ic.id
WHERE ic.category_code = 'portrait'
  AND ep.is_active = true
ORDER BY ce.sort_order;

-- ============================================
-- SUMMARY QUERY - Untuk melihat semua kategori
-- ============================================
SELECT 
  ic.category_code,
  ic.category_name,
  COUNT(ce.id) as total_enhancements
FROM image_categories ic
LEFT JOIN category_enhancements ce ON ic.id = ce.category_id
LEFT JOIN enhancement_prompts ep ON ce.enhancement_id = ep.id AND ep.is_active = true
WHERE ic.is_active = true
GROUP BY ic.category_code, ic.category_name
ORDER BY ic.sort_order;

-- ============================================
-- SIMPLE QUERY - Untuk copy-paste ke dokumentasi
-- ============================================
-- Food
SELECT 
  ep.display_name,
  ep.enhancement_type,
  ep.description
FROM enhancement_prompts ep
JOIN category_enhancements ce ON ep.id = ce.enhancement_id
JOIN image_categories ic ON ce.category_id = ic.id
WHERE ic.category_code = 'food'
  AND ep.is_active = true
ORDER BY ce.sort_order;

-- Fashion
SELECT 
  ep.display_name,
  ep.enhancement_type,
  ep.description
FROM enhancement_prompts ep
JOIN category_enhancements ce ON ep.id = ce.enhancement_id
JOIN image_categories ic ON ce.category_id = ic.id
WHERE ic.category_code = 'fashion'
  AND ep.is_active = true
ORDER BY ce.sort_order;

-- Interior
SELECT 
  ep.display_name,
  ep.enhancement_type,
  ep.description
FROM enhancement_prompts ep
JOIN category_enhancements ce ON ep.id = ce.enhancement_id
JOIN image_categories ic ON ce.category_id = ic.id
WHERE ic.category_code = 'interior'
  AND ep.is_active = true
ORDER BY ce.sort_order;

-- Exterior
SELECT 
  ep.display_name,
  ep.enhancement_type,
  ep.description
FROM enhancement_prompts ep
JOIN category_enhancements ce ON ep.id = ce.enhancement_id
JOIN image_categories ic ON ce.category_id = ic.id
WHERE ic.category_code = 'exterior'
  AND ep.is_active = true
ORDER BY ce.sort_order;

-- Portrait
SELECT 
  ep.display_name,
  ep.enhancement_type,
  ep.description
FROM enhancement_prompts ep
JOIN category_enhancements ce ON ep.id = ce.enhancement_id
JOIN image_categories ic ON ce.category_id = ic.id
WHERE ic.category_code = 'portrait'
  AND ep.is_active = true
ORDER BY ce.sort_order;

-- Test query enhancement by ID
-- Ganti UUID dengan ID enhancement yang kamu pilih

-- 1. Cek semua enhancement yang aktif
SELECT 
  id,
  enhancement_type,
  display_name,
  category,
  is_featured,
  is_active
FROM public.enhancement_prompts
WHERE is_active = true
ORDER BY category, is_featured DESC, display_name;

-- 2. Test query specific enhancement (ganti UUID-nya)
SELECT 
  id,
  enhancement_type,
  display_name,
  prompt_template,
  category,
  is_featured
FROM public.enhancement_prompts
WHERE id = 'PASTE-UUID-DISINI'  -- Ganti dengan ID yang error
  AND is_active = true;

-- 3. Cek token user (ganti dengan user_id kamu)
SELECT 
  user_id,
  subscription_tokens,
  purchased_tokens,
  (subscription_tokens + purchased_tokens) as total_tokens
FROM public.profiles
WHERE user_id = 'PASTE-USER-ID-DISINI';  -- Ganti dengan user ID kamu

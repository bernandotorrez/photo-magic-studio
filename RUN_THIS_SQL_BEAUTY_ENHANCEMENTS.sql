-- =====================================================
-- BEAUTY ENHANCEMENTS - Hair Style & Make Up
-- Copy dan paste semua SQL ini ke Supabase SQL Editor
-- =====================================================

-- Add supports_custom_prompt column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'enhancement_prompts' 
    AND column_name = 'supports_custom_prompt'
  ) THEN
    ALTER TABLE public.enhancement_prompts 
    ADD COLUMN supports_custom_prompt BOOLEAN DEFAULT false;
    
    RAISE NOTICE 'Column supports_custom_prompt added successfully';
  ELSE
    RAISE NOTICE 'Column supports_custom_prompt already exists';
  END IF;
END $$;

-- Add Beauty category
INSERT INTO public.image_categories (category_code, category_name, description, icon, sort_order) VALUES
('beauty', 'Beauty & Personal Care', 'Hair styling, makeup, and beauty enhancements', '💄', 9)
ON CONFLICT (category_code) DO UPDATE SET
  category_name = EXCLUDED.category_name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order;

-- Hair Style Enhancements - Male (15 items)
INSERT INTO public.enhancement_prompts (enhancement_type, display_name, prompt_template, description, category, sort_order) VALUES
('hair_style_male_classic_pompadour', '💇‍♂️ Classic Pompadour', 'Transform the hairstyle to a classic pompadour with volume on top, slicked back sides, and a polished, sophisticated look. Perfect for formal occasions.', 'Gaya rambut pompadour klasik untuk pria', 'hair_style_male', 100),
('hair_style_male_undercut', '💇‍♂️ Modern Undercut', 'Apply a modern undercut hairstyle with short or shaved sides and longer hair on top. Clean, edgy, and versatile styling.', 'Gaya rambut undercut modern', 'hair_style_male', 101),
('hair_style_male_fade', '💇‍♂️ Fade Haircut', 'Create a fade haircut with gradual transition from short to long hair. Choose from low fade, mid fade, or high fade styling.', 'Gaya rambut fade dengan gradasi', 'hair_style_male', 102),
('hair_style_male_crew_cut', '💇‍♂️ Crew Cut', 'Apply a classic crew cut with short, uniform length on top and tapered sides. Clean, masculine, and low-maintenance.', 'Gaya rambut crew cut pendek', 'hair_style_male', 103),
('hair_style_male_quiff', '💇‍♂️ Textured Quiff', 'Style hair into a textured quiff with volume and height at the front, modern and stylish appearance.', 'Gaya rambut quiff bertekstur', 'hair_style_male', 104),
('hair_style_male_slick_back', '💇‍♂️ Slick Back', 'Create a slicked-back hairstyle with all hair combed backward, polished and professional look.', 'Gaya rambut slick back rapi', 'hair_style_male', 105),
('hair_style_male_side_part', '💇‍♂️ Side Part', 'Apply a classic side part hairstyle with clean parting line, timeless and professional styling.', 'Gaya rambut side part klasik', 'hair_style_male', 106),
('hair_style_male_messy_textured', '💇‍♂️ Messy Textured', 'Create a messy, textured hairstyle with natural movement and casual, effortless appearance.', 'Gaya rambut messy natural', 'hair_style_male', 107),
('hair_style_male_buzz_cut', '💇‍♂️ Buzz Cut', 'Apply a buzz cut with very short, uniform length all over. Clean, simple, and masculine.', 'Gaya rambut buzz cut sangat pendek', 'hair_style_male', 108),
('hair_style_male_man_bun', '💇‍♂️ Man Bun', 'Style longer hair into a man bun, modern and trendy look for men with medium to long hair.', 'Gaya rambut man bun', 'hair_style_male', 109),
('hair_style_male_curly_top', '💇‍♂️ Curly Top', 'Enhance natural curls on top with defined texture and volume, keeping sides shorter.', 'Gaya rambut keriting di atas', 'hair_style_male', 110),
('hair_style_male_french_crop', '💇‍♂️ French Crop', 'Apply a French crop with short fringe and textured top, modern European styling.', 'Gaya rambut French crop', 'hair_style_male', 111),
('hair_style_male_mohawk', '💇‍♂️ Mohawk/Faux Hawk', 'Create a mohawk or faux hawk style with center strip of longer hair, edgy and bold.', 'Gaya rambut mohawk berani', 'hair_style_male', 112),
('hair_style_male_ivy_league', '💇‍♂️ Ivy League', 'Apply an Ivy League cut, slightly longer than crew cut with side part, sophisticated and preppy.', 'Gaya rambut Ivy League', 'hair_style_male', 113),
('hair_style_male_spiky', '💇‍♂️ Spiky Hair', 'Style hair into spikes with texture and height, youthful and energetic appearance.', 'Gaya rambut spike berdiri', 'hair_style_male', 114)
ON CONFLICT (enhancement_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  prompt_template = EXCLUDED.prompt_template,
  description = EXCLUDED.description,
  updated_at = timezone('utc'::text, now());

-- Hair Style Enhancements - Female (20 items)
INSERT INTO public.enhancement_prompts (enhancement_type, display_name, prompt_template, description, category, sort_order) VALUES
('hair_style_female_long_straight', '💇‍♀️ Long Straight Hair', 'Transform to long, straight, sleek hair with smooth texture and healthy shine. Classic and elegant.', 'Rambut panjang lurus mengkilap', 'hair_style_female', 120),
('hair_style_female_beach_waves', '💇‍♀️ Beach Waves', 'Create natural beach waves with loose, flowing curls. Effortless and romantic styling.', 'Gaya rambut beach waves natural', 'hair_style_female', 121),
('hair_style_female_curly_voluminous', '💇‍♀️ Voluminous Curls', 'Apply voluminous curly hair with defined, bouncy curls and lots of body.', 'Rambut keriting voluminous', 'hair_style_female', 122),
('hair_style_female_bob_cut', '💇‍♀️ Bob Cut', 'Style hair into a classic bob cut at chin or shoulder length, chic and modern.', 'Gaya rambut bob pendek', 'hair_style_female', 123),
('hair_style_female_pixie_cut', '💇‍♀️ Pixie Cut', 'Apply a short pixie cut with textured layers, bold and confident styling.', 'Gaya rambut pixie sangat pendek', 'hair_style_female', 124),
('hair_style_female_layered_cut', '💇‍♀️ Layered Cut', 'Create layered haircut with dimension and movement, versatile and flattering.', 'Potongan rambut layer bertingkat', 'hair_style_female', 125),
('hair_style_female_ponytail_high', '💇‍♀️ High Ponytail', 'Style hair into a high ponytail, sleek and polished or textured and casual.', 'Gaya rambut ponytail tinggi', 'hair_style_female', 126),
('hair_style_female_messy_bun', '💇‍♀️ Messy Bun', 'Create a messy bun updo, effortless and chic styling perfect for casual or elegant looks.', 'Gaya rambut messy bun', 'hair_style_female', 127),
('hair_style_female_braided', '💇‍♀️ Braided Hair', 'Apply braided hairstyle - side braid, crown braid, or fishtail braid. Romantic and intricate.', 'Gaya rambut kepang', 'hair_style_female', 128),
('hair_style_female_half_up', '💇‍♀️ Half-Up Half-Down', 'Style hair half-up half-down with top section pulled back, versatile and feminine.', 'Gaya rambut half-up half-down', 'hair_style_female', 129),
('hair_style_female_sleek_low_bun', '💇‍♀️ Sleek Low Bun', 'Create a sleek low bun at the nape, elegant and sophisticated for formal occasions.', 'Gaya rambut low bun elegant', 'hair_style_female', 130),
('hair_style_female_side_swept', '💇‍♀️ Side Swept', 'Style hair swept to one side with volume and flow, glamorous and red-carpet ready.', 'Gaya rambut side swept glamor', 'hair_style_female', 131),
('hair_style_female_bangs_fringe', '💇‍♀️ Bangs/Fringe', 'Add bangs or fringe - blunt, side-swept, or curtain bangs. Frame the face beautifully.', 'Tambahkan poni/fringe', 'hair_style_female', 132),
('hair_style_female_balayage', '💇‍♀️ Balayage Highlights', 'Apply balayage highlighting technique with natural-looking color gradients and dimension.', 'Highlight balayage natural', 'hair_style_female', 133),
('hair_style_female_ombre', '💇‍♀️ Ombre Color', 'Create ombre hair color effect with gradual transition from dark roots to lighter ends.', 'Warna rambut ombre gradasi', 'hair_style_female', 134),
('hair_style_female_vintage_waves', '💇‍♀️ Vintage Hollywood Waves', 'Style hair into vintage Hollywood waves with defined S-curves, glamorous retro look.', 'Gaya rambut vintage Hollywood', 'hair_style_female', 135),
('hair_style_female_shag_cut', '💇‍♀️ Shag Cut', 'Apply a shag cut with lots of layers and texture, edgy and rock-and-roll vibe.', 'Potongan rambut shag bertekstur', 'hair_style_female', 136),
('hair_style_female_top_knot', '💇‍♀️ Top Knot', 'Create a top knot bun at the crown, modern and trendy styling.', 'Gaya rambut top knot', 'hair_style_female', 137),
('hair_style_female_space_buns', '💇‍♀️ Space Buns', 'Style hair into playful space buns (two buns), fun and youthful appearance.', 'Gaya rambut space buns lucu', 'hair_style_female', 138),
('hair_style_female_sleek_straight', '💇‍♀️ Ultra Sleek Straight', 'Create ultra-sleek, pin-straight hair with mirror-like shine, polished and modern.', 'Rambut lurus ultra sleek', 'hair_style_female', 139)
ON CONFLICT (enhancement_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  prompt_template = EXCLUDED.prompt_template,
  description = EXCLUDED.description,
  updated_at = timezone('utc'::text, now());

-- Make Up Enhancements (25 items with custom prompt support)
INSERT INTO public.enhancement_prompts (enhancement_type, display_name, prompt_template, description, category, sort_order, supports_custom_prompt) VALUES
('makeup_natural_look', '💄 Natural Makeup Look', 'Apply natural, everyday makeup with subtle enhancement. Light foundation, neutral eyeshadow, natural blush, and nude lipstick. Fresh and effortless appearance. {customPrompt}', 'Makeup natural sehari-hari', 'makeup', 150, true),
('makeup_glam_evening', '💄 Glamorous Evening Makeup', 'Create glamorous evening makeup with dramatic eyes, contoured face, bold lips, and radiant finish. Red carpet ready. {customPrompt}', 'Makeup glamor untuk malam', 'makeup', 151, true),
('makeup_smokey_eyes', '💄 Smokey Eyes', 'Apply classic smokey eye makeup with blended dark eyeshadow, defined liner, and volumized lashes. Sultry and dramatic. {customPrompt}', 'Makeup smokey eyes dramatis', 'makeup', 152, true),
('makeup_bold_red_lips', '💋 Bold Red Lips', 'Apply bold red lipstick with perfect application, matte or glossy finish. Classic and confident. Custom color: {customPrompt}', 'Lipstik merah bold (custom warna)', 'makeup', 153, true),
('makeup_nude_lips', '💋 Nude/Natural Lips', 'Apply nude or natural lip color matching skin tone, subtle and sophisticated. Custom shade: {customPrompt}', 'Lipstik nude natural (custom warna)', 'makeup', 154, true),
('makeup_pink_lips', '💋 Pink Lips', 'Apply pink lipstick in various shades - baby pink, hot pink, or rose pink. Feminine and fresh. Custom shade: {customPrompt}', 'Lipstik pink (custom warna)', 'makeup', 155, true),
('makeup_berry_lips', '💋 Berry/Plum Lips', 'Apply berry or plum lip color, deep and sophisticated. Perfect for fall/winter. Custom shade: {customPrompt}', 'Lipstik berry/plum (custom warna)', 'makeup', 156, true),
('makeup_glossy_lips', '💋 Glossy Lips', 'Apply high-shine glossy lips with plump appearance and reflective finish. Custom color: {customPrompt}', 'Lipstik glossy mengkilap (custom warna)', 'makeup', 157, true),
('makeup_matte_lips', '💋 Matte Lips', 'Apply matte lipstick with velvety, non-shiny finish. Long-lasting and modern. Custom color: {customPrompt}', 'Lipstik matte (custom warna)', 'makeup', 158, true),
('makeup_cat_eye', '👁️ Cat Eye Liner', 'Create dramatic cat eye with winged eyeliner, elongated and lifted eye shape. Bold and fierce.', 'Eyeliner cat eye dramatis', 'makeup', 159, false),
('makeup_natural_eye', '👁️ Natural Eye Makeup', 'Apply natural eye makeup with neutral tones, subtle definition, and enhanced lashes. Everyday elegance.', 'Makeup mata natural', 'makeup', 160, false),
('makeup_colorful_eye', '👁️ Colorful Eye Makeup', 'Create colorful eye makeup with vibrant eyeshadow shades. Artistic and bold. Custom colors: {customPrompt}', 'Makeup mata warna-warni (custom warna)', 'makeup', 161, true),
('makeup_glitter_eye', '👁️ Glitter Eye Makeup', 'Apply glitter or shimmer eye makeup with sparkle and shine. Festive and glamorous.', 'Makeup mata glitter berkilau', 'makeup', 162, false),
('makeup_cut_crease', '👁️ Cut Crease Eye', 'Create cut crease eye makeup technique with defined crease line and contrasting colors. Dramatic and editorial.', 'Makeup mata cut crease', 'makeup', 163, false),
('makeup_contour_highlight', '✨ Contour & Highlight', 'Apply professional contouring and highlighting to sculpt face shape, enhance cheekbones, and create dimension.', 'Contour dan highlight wajah', 'makeup', 164, false),
('makeup_dewy_skin', '✨ Dewy Glowing Skin', 'Create dewy, glowing skin finish with luminous, hydrated appearance. Fresh and youthful.', 'Kulit glowing dewy', 'makeup', 165, false),
('makeup_matte_skin', '✨ Matte Flawless Skin', 'Apply matte foundation with flawless, poreless finish. Smooth and perfected complexion.', 'Kulit matte flawless', 'makeup', 166, false),
('makeup_rosy_cheeks', '🌸 Rosy Blush Cheeks', 'Apply rosy blush to cheeks for healthy, flushed appearance. Natural and youthful glow. Custom shade: {customPrompt}', 'Blush on pipi merona (custom warna)', 'makeup', 167, true),
('makeup_bronzed_look', '🌸 Bronzed Sun-Kissed', 'Apply bronzer for sun-kissed, warm complexion. Healthy and radiant appearance.', 'Bronzer sun-kissed', 'makeup', 168, false),
('makeup_korean_style', '🎀 Korean Beauty Style', 'Apply Korean beauty makeup style with gradient lips, straight brows, aegyo sal, and dewy skin. Youthful and fresh.', 'Makeup style Korea', 'makeup', 169, false),
('makeup_editorial_artistic', '🎨 Editorial/Artistic Makeup', 'Create editorial or artistic makeup with creative colors, bold shapes, and avant-garde styling. Fashion-forward.', 'Makeup editorial artistik', 'makeup', 170, false),
('makeup_bridal_elegant', '👰 Bridal Makeup', 'Apply elegant bridal makeup with long-lasting formula, romantic styling, and timeless beauty. Perfect for weddings.', 'Makeup pengantin elegant', 'makeup', 171, false),
('makeup_no_makeup_look', '✨ No-Makeup Makeup', 'Create "no-makeup" makeup look that enhances natural features subtly. Barely-there perfection.', 'Makeup natural "no-makeup"', 'makeup', 172, false),
('makeup_festival_fun', '🎉 Festival/Party Makeup', 'Apply fun festival or party makeup with glitter, gems, bold colors, and creative elements. Playful and festive.', 'Makeup festival fun', 'makeup', 173, false),
('makeup_vintage_retro', '🕰️ Vintage/Retro Makeup', 'Create vintage or retro makeup inspired by different eras - 1920s, 1950s, 1960s, or 1980s. Classic and nostalgic.', 'Makeup vintage retro', 'makeup', 174, false)
ON CONFLICT (enhancement_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  prompt_template = EXCLUDED.prompt_template,
  description = EXCLUDED.description,
  supports_custom_prompt = EXCLUDED.supports_custom_prompt,
  updated_at = timezone('utc'::text, now());

-- Map enhancements to beauty category
DO $$
DECLARE
  cat_id UUID;
  enh_id UUID;
BEGIN
  -- Get beauty category ID
  SELECT id INTO cat_id FROM public.image_categories WHERE category_code = 'beauty';
  
  IF cat_id IS NOT NULL THEN
    -- Map hair_style_male enhancements
    FOR enh_id IN SELECT id FROM public.enhancement_prompts WHERE category = 'hair_style_male' AND is_active = true
    LOOP
      INSERT INTO public.category_enhancements (category_id, enhancement_id, sort_order)
      SELECT cat_id, enh_id, sort_order FROM public.enhancement_prompts WHERE id = enh_id
      ON CONFLICT (category_id, enhancement_id) DO UPDATE SET sort_order = EXCLUDED.sort_order;
    END LOOP;
    
    -- Map hair_style_female enhancements
    FOR enh_id IN SELECT id FROM public.enhancement_prompts WHERE category = 'hair_style_female' AND is_active = true
    LOOP
      INSERT INTO public.category_enhancements (category_id, enhancement_id, sort_order)
      SELECT cat_id, enh_id, sort_order FROM public.enhancement_prompts WHERE id = enh_id
      ON CONFLICT (category_id, enhancement_id) DO UPDATE SET sort_order = EXCLUDED.sort_order;
    END LOOP;
    
    -- Map makeup enhancements
    FOR enh_id IN SELECT id FROM public.enhancement_prompts WHERE category = 'makeup' AND is_active = true
    LOOP
      INSERT INTO public.category_enhancements (category_id, enhancement_id, sort_order)
      SELECT cat_id, enh_id, sort_order FROM public.enhancement_prompts WHERE id = enh_id
      ON CONFLICT (category_id, enhancement_id) DO UPDATE SET sort_order = EXCLUDED.sort_order;
    END LOOP;
  END IF;
END $$;

-- Verification: Check beauty enhancements
SELECT 
  category,
  COUNT(*) as total
FROM public.enhancement_prompts
WHERE category IN ('hair_style_male', 'hair_style_female', 'makeup') AND is_active = true
GROUP BY category
ORDER BY category;

-- Verification: Check category mapping
SELECT 
  ic.category_code,
  ic.category_name,
  COUNT(ce.id) as total_enhancements
FROM public.image_categories ic
LEFT JOIN public.category_enhancements ce ON ic.id = ce.category_id
WHERE ic.category_code = 'beauty'
GROUP BY ic.category_code, ic.category_name;

-- Show all beauty enhancements
SELECT 
  enhancement_type,
  display_name,
  category,
  supports_custom_prompt,
  sort_order
FROM public.enhancement_prompts
WHERE category IN ('hair_style_male', 'hair_style_female', 'makeup') AND is_active = true
ORDER BY category, sort_order;

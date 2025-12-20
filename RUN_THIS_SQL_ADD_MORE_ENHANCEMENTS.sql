-- =====================================================
-- ADD MORE ENHANCEMENTS - EXTENDED VERSION
-- Total tambahan: 50+ enhancements baru
-- =====================================================

-- =====================================================
-- FOOD ENHANCEMENTS - TAMBAHAN (15 items)
-- =====================================================

INSERT INTO public.enhancement_prompts (enhancement_type, display_name, prompt_template, description, category, sort_order) VALUES
-- Food Additional
('food_seasonal_theme', '🎄 Seasonal Theme (Christmas/Halloween/etc)', 'Add seasonal decorations and theme elements around the food - Christmas, Halloween, Valentine, Easter, etc. Create festive atmosphere.', 'Tambahkan tema musiman (Natal, Halloween, dll)', 'food', 25),
('food_minimalist_clean', '⚪ Minimalist Clean Style', 'Create ultra-minimalist food photography with clean white background, simple composition, and focus on the food itself.', 'Style minimalis bersih dengan fokus pada makanan', 'food', 26),
('food_dark_moody', '🌑 Dark & Moody Style', 'Transform to dark and moody food photography with dramatic shadows, deep colors, and mysterious atmosphere.', 'Style gelap dan moody dengan bayangan dramatis', 'food', 27),
('food_bright_airy', '☀️ Bright & Airy Style', 'Create bright and airy food photography with lots of natural light, white tones, and fresh feeling.', 'Style terang dan lapang dengan cahaya natural', 'food', 28),
('food_add_hands', '👐 Add Hands Interaction', 'Add hands interacting with the food - holding, cutting, pouring, or preparing. Create human connection.', 'Tambahkan tangan yang berinteraksi dengan makanan', 'food', 29),
('food_action_shot', '💨 Action Shot (Pouring/Cutting)', 'Create dynamic action shot showing food being poured, cut, sprinkled, or prepared in motion.', 'Foto aksi dinamis (menuang, memotong, dll)', 'food', 30),
('food_overhead_grid', '📱 Overhead Grid Layout', 'Arrange multiple food items in organized grid layout from overhead view, perfect for social media.', 'Layout grid dari atas untuk social media', 'food', 31),
('food_recipe_card', '📋 Recipe Card Format', 'Transform into recipe card format with space for ingredients list, instructions, and professional layout.', 'Format kartu resep dengan ruang untuk instruksi', 'food', 32),
('food_before_after', '⚖️ Before/After Comparison', 'Show before and after cooking comparison, or raw vs cooked presentation side by side.', 'Perbandingan sebelum dan sesudah dimasak', 'food', 33),
('food_cross_section', '🔪 Cross Section View', 'Show cross-section or inside view of the food to reveal layers, filling, or internal texture.', 'Tampilan potongan melintang untuk lihat isi', 'food', 34),
('food_splash_effect', '💦 Splash/Liquid Effect', 'Add dynamic splash or liquid effect with water, milk, sauce, or other liquids for dramatic impact.', 'Efek percikan air atau cairan dinamis', 'food', 35),
('food_smoke_effect', '💨 Smoke Effect', 'Add atmospheric smoke effect around the food for dramatic, mysterious, or BBQ-style presentation.', 'Efek asap untuk tampilan dramatis', 'food', 36),
('food_ice_frost', '❄️ Ice & Frost Effect', 'Add ice, frost, or condensation effects for cold drinks or frozen desserts.', 'Efek es dan embun untuk minuman dingin', 'food', 37),
('food_gourmet_plating', '⭐ Gourmet Fine Dining', 'Transform to gourmet fine dining plating with artistic presentation, microgreens, and Michelin-star style.', 'Plating gourmet ala restoran bintang Michelin', 'food', 38),
('food_street_food', '🍜 Street Food Style', 'Transform to authentic street food style with casual, rustic presentation and local atmosphere.', 'Style street food kasual dan autentik', 'food', 39)
ON CONFLICT (enhancement_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  prompt_template = EXCLUDED.prompt_template,
  description = EXCLUDED.description,
  updated_at = timezone('utc'::text, now());

-- =====================================================
-- FASHION ENHANCEMENTS - TAMBAHAN (15 items)
-- =====================================================

INSERT INTO public.enhancement_prompts (enhancement_type, display_name, prompt_template, description, category, sort_order) VALUES
-- Fashion Additional
('fashion_ghost_mannequin', '👻 Ghost Mannequin Effect', 'Create ghost mannequin effect showing the product as if worn but without visible mannequin or model.', 'Efek ghost mannequin tanpa model terlihat', 'fashion', 40),
('fashion_flat_lay', '📐 Flat Lay Style', 'Arrange fashion items in flat lay composition from top-down view with complementary accessories.', 'Flat lay dari atas dengan aksesoris', 'fashion', 41),
('fashion_hanger_display', '🪝 On Hanger Display', 'Display fashion product on elegant hanger with professional styling and clean background.', 'Tampilan di hanger dengan styling profesional', 'fashion', 42),
('fashion_outfit_combination', '👔 Complete Outfit Styling', 'Show complete outfit combination with matching accessories, shoes, and complementary items.', 'Kombinasi outfit lengkap dengan aksesoris', 'fashion', 43),
('fashion_texture_detail', '🔍 Fabric Texture Close-up', 'Extreme close-up of fabric texture, weave pattern, stitching details, and material quality.', 'Close-up ekstrem tekstur kain dan jahitan', 'fashion', 44),
('fashion_runway_style', '🎭 Runway Fashion Show', 'Transform to runway fashion show style with dramatic lighting, professional model pose, and catwalk aesthetic.', 'Style fashion show runway dengan pose dramatis', 'fashion', 45),
('fashion_editorial_magazine', '📰 Editorial Magazine Style', 'Create editorial magazine style with artistic composition, dramatic lighting, and high-fashion aesthetic.', 'Style editorial majalah fashion', 'fashion', 46),
('fashion_casual_lifestyle', '☕ Casual Lifestyle Scene', 'Show product in casual lifestyle scene - coffee shop, park, street, or everyday setting.', 'Scene lifestyle kasual di kafe, taman, dll', 'fashion', 47),
('fashion_studio_white', '⚪ Studio White Background', 'Professional studio photography with pure white background, even lighting, and commercial quality.', 'Foto studio background putih profesional', 'fashion', 48),
('fashion_outdoor_natural', '🌳 Outdoor Natural Setting', 'Outdoor fashion photography in natural setting with natural light and environmental context.', 'Foto outdoor dengan setting natural', 'fashion', 49),
('fashion_urban_street', '🏙️ Urban Street Style', 'Urban street style photography with city background, graffiti, or modern architecture.', 'Style urban street dengan background kota', 'fashion', 50),
('fashion_vintage_retro', '📻 Vintage/Retro Style', 'Transform to vintage or retro fashion photography with film-like colors and nostalgic aesthetic.', 'Style vintage/retro dengan warna film', 'fashion', 51),
('fashion_size_guide', '📏 Size Guide Visualization', 'Create size guide visualization showing measurements, fit comparison, or sizing information.', 'Visualisasi panduan ukuran dan fit', 'fashion', 52),
('fashion_care_label', '🏷️ Care Label & Details', 'Highlight care labels, brand tags, and product details in professional close-up shots.', 'Detail label perawatan dan brand tag', 'fashion', 53),
('fashion_packaging', '📦 Product Packaging Shot', 'Show product with packaging, tags, and presentation as received by customer.', 'Foto produk dengan packaging lengkap', 'fashion', 54)
ON CONFLICT (enhancement_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  prompt_template = EXCLUDED.prompt_template,
  description = EXCLUDED.description,
  updated_at = timezone('utc'::text, now());

-- =====================================================
-- INTERIOR ENHANCEMENTS - TAMBAHAN (15 items)
-- =====================================================

INSERT INTO public.enhancement_prompts (enhancement_type, display_name, prompt_template, description, category, sort_order) VALUES
-- Interior Additional
('interior_mid_century', '🕰️ Mid-Century Modern', 'Transform to mid-century modern style with iconic furniture, warm wood tones, and retro aesthetic.', 'Style mid-century modern dengan furniture ikonik', 'interior', 62),
('interior_farmhouse', '🌾 Farmhouse/Rustic', 'Transform to farmhouse or rustic style with reclaimed wood, vintage elements, and cozy country aesthetic.', 'Style farmhouse rustic dengan kayu vintage', 'interior', 63),
('interior_contemporary', '✨ Contemporary Chic', 'Transform to contemporary chic style with current trends, mixed materials, and sophisticated design.', 'Style contemporary chic dengan tren terkini', 'interior', 64),
('interior_art_deco', '💎 Art Deco Glamour', 'Transform to Art Deco style with geometric patterns, luxurious materials, gold accents, and 1920s glamour.', 'Style Art Deco dengan pola geometris mewah', 'interior', 65),
('interior_coastal_beach', '🏖️ Coastal/Beach House', 'Transform to coastal or beach house style with light colors, natural textures, and breezy atmosphere.', 'Style coastal dengan warna terang dan tekstur natural', 'interior', 66),
('interior_tropical', '🌴 Tropical Paradise', 'Transform to tropical style with lush plants, natural materials, rattan furniture, and resort-like atmosphere.', 'Style tropical dengan tanaman dan furniture rotan', 'interior', 67),
('interior_moroccan', '🕌 Moroccan/Mediterranean', 'Transform to Moroccan or Mediterranean style with colorful tiles, arches, lanterns, and exotic patterns.', 'Style Moroccan dengan tiles warna-warni', 'interior', 68),
('interior_french_country', '🥐 French Country', 'Transform to French country style with elegant furniture, soft colors, vintage elements, and romantic aesthetic.', 'Style French country dengan furniture elegant', 'interior', 69),
('interior_maximalist', '🎨 Maximalist Bold', 'Transform to maximalist style with bold colors, patterns, textures, and eclectic mix of elements.', 'Style maximalist dengan warna dan pola berani', 'interior', 70),
('interior_smart_home', '🤖 Smart Home Tech', 'Add smart home technology elements - smart lighting, displays, automated systems, and modern tech integration.', 'Tambahkan elemen teknologi smart home', 'interior', 71),
('interior_kids_room', '🧸 Kids Room Design', 'Transform to kid-friendly design with playful colors, fun furniture, toys, and child-appropriate elements.', 'Design kamar anak dengan warna playful', 'interior', 72),
('interior_home_office', '💼 Home Office Setup', 'Transform to functional home office with desk, ergonomic chair, storage, and professional work environment.', 'Setup home office fungsional dan profesional', 'interior', 73),
('interior_reading_nook', '📚 Cozy Reading Nook', 'Create cozy reading nook with comfortable seating, good lighting, bookshelves, and relaxing atmosphere.', 'Sudut baca nyaman dengan pencahayaan bagus', 'interior', 74),
('interior_gallery_wall', '🖼️ Gallery Wall Art', 'Add gallery wall with curated artwork, photos, and decorative frames in professional arrangement.', 'Dinding galeri dengan artwork dan foto', 'interior', 75),
('interior_seasonal_decor', '🎄 Seasonal Decoration', 'Add seasonal decorations - Christmas, Halloween, Spring, Summer themes with appropriate decor elements.', 'Dekorasi musiman (Natal, Halloween, dll)', 'interior', 76)
ON CONFLICT (enhancement_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  prompt_template = EXCLUDED.prompt_template,
  description = EXCLUDED.description,
  updated_at = timezone('utc'::text, now());

-- =====================================================
-- EXTERIOR ENHANCEMENTS - TAMBAHAN (10 items)
-- =====================================================

INSERT INTO public.enhancement_prompts (enhancement_type, display_name, prompt_template, description, category, sort_order) VALUES
-- Exterior Additional
('exterior_victorian', '🏰 Victorian Style', 'Transform to Victorian architectural style with ornate details, turrets, decorative trim, and historic elegance.', 'Style Victorian dengan detail ornamen', 'exterior', 82),
('exterior_mediterranean_villa', '🌅 Mediterranean Villa', 'Transform to Mediterranean villa style with stucco walls, terracotta tiles, arches, and courtyard elements.', 'Style villa Mediterranean dengan stucco', 'exterior', 83),
('exterior_japanese_style', '⛩️ Japanese Architecture', 'Transform to Japanese architectural style with clean lines, natural materials, zen garden, and Asian aesthetic.', 'Style arsitektur Jepang dengan zen garden', 'exterior', 84),
('exterior_cottage', '🏡 English Cottage', 'Transform to English cottage style with stone walls, thatched roof, climbing plants, and charming garden.', 'Style cottage Inggris dengan taman menawan', 'exterior', 85),
('exterior_ranch', '🤠 Ranch/Farmhouse', 'Transform to ranch or farmhouse style with horizontal layout, wide porches, and rural aesthetic.', 'Style ranch/farmhouse dengan teras luas', 'exterior', 86),
('exterior_eco_green', '🌱 Eco-Friendly/Green Building', 'Add eco-friendly elements - solar panels, green roof, rainwater harvesting, sustainable materials.', 'Tambahkan elemen ramah lingkungan', 'exterior', 87),
('exterior_security', '🔒 Security Features', 'Add security features - cameras, lighting, fencing, gates, and safety elements.', 'Tambahkan fitur keamanan lengkap', 'exterior', 88),
('exterior_outdoor_kitchen', '🍖 Outdoor Kitchen/BBQ', 'Add outdoor kitchen or BBQ area with cooking facilities, dining space, and entertainment zone.', 'Tambahkan dapur outdoor dan area BBQ', 'exterior', 89),
('exterior_pergola_gazebo', '⛱️ Pergola/Gazebo', 'Add pergola, gazebo, or covered outdoor structure for shade and outdoor living space.', 'Tambahkan pergola atau gazebo', 'exterior', 90),
('exterior_fire_pit', '🔥 Fire Pit/Outdoor Fireplace', 'Add fire pit or outdoor fireplace for cozy gathering space and evening ambiance.', 'Tambahkan fire pit atau perapian outdoor', 'exterior', 91)
ON CONFLICT (enhancement_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  prompt_template = EXCLUDED.prompt_template,
  description = EXCLUDED.description,
  updated_at = timezone('utc'::text, now());

-- =====================================================
-- PORTRAIT ENHANCEMENTS - TAMBAHAN (10 items)
-- =====================================================

INSERT INTO public.enhancement_prompts (enhancement_type, display_name, prompt_template, description, category, sort_order) VALUES
-- Portrait Additional
('portrait_headshot', '👤 Professional Headshot', 'Transform to professional headshot with clean background, proper framing, and corporate-appropriate styling.', 'Headshot profesional untuk corporate', 'portrait', 100),
('portrait_full_body', '🧍 Full Body Portrait', 'Transform to full body portrait showing complete outfit and pose from head to toe.', 'Portrait full body dari kepala sampai kaki', 'portrait', 101),
('portrait_couple', '💑 Couple Portrait', 'Transform to couple portrait with romantic composition, natural interaction, and emotional connection.', 'Portrait pasangan dengan komposisi romantis', 'portrait', 102),
('portrait_family', '👨‍👩‍👧‍👦 Family Portrait', 'Transform to family portrait with multiple people, natural grouping, and warm family atmosphere.', 'Portrait keluarga dengan suasana hangat', 'portrait', 103),
('portrait_graduation', '🎓 Graduation Portrait', 'Transform to graduation portrait with academic regalia, diploma, and celebratory atmosphere.', 'Portrait wisuda dengan toga dan ijazah', 'portrait', 104),
('portrait_maternity', '🤰 Maternity Portrait', 'Transform to maternity portrait highlighting pregnancy with elegant pose and soft, beautiful lighting.', 'Portrait kehamilan dengan pose elegant', 'portrait', 105),
('portrait_fitness', '💪 Fitness/Athletic Portrait', 'Transform to fitness or athletic portrait showing physique, strength, and active lifestyle.', 'Portrait fitness menampilkan atletis', 'portrait', 106),
('portrait_artistic', '🎨 Artistic/Creative Portrait', 'Transform to artistic portrait with creative composition, unique angles, and artistic expression.', 'Portrait artistik dengan komposisi kreatif', 'portrait', 107),
('portrait_vintage_film', '📷 Vintage Film Look', 'Apply vintage film photography look with grain, faded colors, and nostalgic aesthetic.', 'Tampilan film vintage dengan grain', 'portrait', 108),
('portrait_black_white', '⚫⚪ Black & White Classic', 'Transform to classic black and white portrait with dramatic contrast and timeless aesthetic.', 'Portrait hitam putih klasik dramatis', 'portrait', 109)
ON CONFLICT (enhancement_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  prompt_template = EXCLUDED.prompt_template,
  description = EXCLUDED.description,
  updated_at = timezone('utc'::text, now());

-- =====================================================
-- PRODUCT GENERAL ENHANCEMENTS - BARU (20 items)
-- =====================================================

INSERT INTO public.enhancement_prompts (enhancement_type, display_name, prompt_template, description, category, sort_order) VALUES
-- Product General
('product_white_bg', '⚪ Pure White Background', 'Remove background and replace with pure white (#FFFFFF) for e-commerce product photography.', 'Background putih bersih untuk e-commerce', 'product', 200),
('product_shadow', '🌓 Add Natural Shadow', 'Add natural drop shadow or reflection shadow to create depth and realistic product presentation.', 'Tambahkan bayangan natural untuk depth', 'product', 201),
('product_reflection', '💎 Add Reflection', 'Add mirror reflection effect below the product for premium, polished presentation.', 'Tambahkan efek refleksi cermin', 'product', 202),
('product_360_spin', '🔄 360° Product Spin', 'Create 360-degree spin view showing product from all angles for interactive presentation.', 'Tampilan 360 derajat interaktif', 'product', 203),
('product_scale_reference', '📏 Add Scale Reference', 'Add scale reference objects (coin, ruler, hand) to show actual product size.', 'Tambahkan referensi ukuran produk', 'product', 204),
('product_lifestyle_use', '🏠 Lifestyle In-Use Shot', 'Show product being used in real-life context or lifestyle setting.', 'Foto produk sedang digunakan', 'product', 205),
('product_packaging', '📦 With Packaging', 'Show product with original packaging, box, and presentation as received.', 'Tampilkan dengan packaging asli', 'product', 206),
('product_unboxing', '🎁 Unboxing Scene', 'Create unboxing scene showing product being revealed from packaging.', 'Scene unboxing produk dari kemasan', 'product', 207),
('product_multiple_angles', '📐 Multiple Angles Grid', 'Show product from multiple angles in organized grid layout.', 'Grid dengan berbagai sudut pandang', 'product', 208),
('product_color_variants', '🎨 Color Variants Display', 'Show multiple color variants of the same product side by side.', 'Tampilkan varian warna berdampingan', 'product', 209),
('product_size_variants', '📏 Size Variants Display', 'Show different size variants of the product for comparison.', 'Tampilkan varian ukuran berbeda', 'product', 210),
('product_exploded_view', '💥 Exploded View Diagram', 'Create exploded view showing product components and assembly parts.', 'Diagram exploded view komponen produk', 'product', 211),
('product_feature_callout', '👉 Feature Callouts', 'Add callout labels highlighting key features, specifications, and benefits.', 'Tambahkan label fitur dan spesifikasi', 'product', 212),
('product_comparison', '⚖️ Product Comparison', 'Show product comparison with competitor or different models side by side.', 'Perbandingan dengan produk lain', 'product', 213),
('product_premium_luxury', '💎 Premium Luxury Style', 'Transform to premium luxury product photography with high-end aesthetic and sophisticated presentation.', 'Style premium luxury mewah', 'product', 214),
('product_minimalist', '⚪ Minimalist Clean', 'Ultra-minimalist product photography with clean background and simple composition.', 'Style minimalis bersih dan simple', 'product', 215),
('product_creative_artistic', '🎨 Creative Artistic', 'Creative and artistic product photography with unique composition and visual storytelling.', 'Foto produk kreatif dan artistik', 'product', 216),
('product_seasonal_theme', '🎄 Seasonal Theme', 'Add seasonal theme decorations - Christmas, Halloween, Valentine, etc.', 'Tema musiman (Natal, Halloween, dll)', 'product', 217),
('product_gift_ready', '🎁 Gift-Ready Presentation', 'Present product as gift-ready with wrapping, ribbon, and festive presentation.', 'Presentasi siap hadiah dengan pita', 'product', 218),
('product_eco_sustainable', '🌱 Eco/Sustainable Focus', 'Highlight eco-friendly and sustainable aspects with natural, green presentation.', 'Fokus pada aspek ramah lingkungan', 'product', 219)
ON CONFLICT (enhancement_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  prompt_template = EXCLUDED.prompt_template,
  description = EXCLUDED.description,
  updated_at = timezone('utc'::text, now());

-- =====================================================
-- MAP NEW ENHANCEMENTS TO CATEGORIES
-- =====================================================

-- Map food enhancements
DO $$
DECLARE
  cat_id UUID;
  enh_id UUID;
BEGIN
  SELECT id INTO cat_id FROM public.image_categories WHERE category_code = 'food';
  IF cat_id IS NOT NULL THEN
    FOR enh_id IN SELECT id FROM public.enhancement_prompts WHERE category = 'food' AND is_active = true
    LOOP
      INSERT INTO public.category_enhancements (category_id, enhancement_id, sort_order)
      SELECT cat_id, enh_id, sort_order FROM public.enhancement_prompts WHERE id = enh_id
      ON CONFLICT (category_id, enhancement_id) DO UPDATE SET sort_order = EXCLUDED.sort_order;
    END LOOP;
  END IF;
END $$;

-- Map fashion enhancements to clothing
DO $$
DECLARE
  cat_id UUID;
  enh_id UUID;
BEGIN
  SELECT id INTO cat_id FROM public.image_categories WHERE category_code = 'clothing';
  IF cat_id IS NOT NULL THEN
    FOR enh_id IN SELECT id FROM public.enhancement_prompts WHERE category = 'fashion' AND is_active = true
    LOOP
      INSERT INTO public.category_enhancements (category_id, enhancement_id, sort_order)
      SELECT cat_id, enh_id, sort_order FROM public.enhancement_prompts WHERE id = enh_id
      ON CONFLICT (category_id, enhancement_id) DO UPDATE SET sort_order = EXCLUDED.sort_order;
    END LOOP;
  END IF;
END $$;

-- Map interior enhancements
DO $$
DECLARE
  cat_id UUID;
  enh_id UUID;
BEGIN
  SELECT id INTO cat_id FROM public.image_categories WHERE category_code = 'interior';
  IF cat_id IS NOT NULL THEN
    FOR enh_id IN SELECT id FROM public.enhancement_prompts WHERE category = 'interior' AND is_active = true
    LOOP
      INSERT INTO public.category_enhancements (category_id, enhancement_id, sort_order)
      SELECT cat_id, enh_id, sort_order FROM public.enhancement_prompts WHERE id = enh_id
      ON CONFLICT (category_id, enhancement_id) DO UPDATE SET sort_order = EXCLUDED.sort_order;
    END LOOP;
  END IF;
END $$;

-- Map exterior enhancements
DO $$
DECLARE
  cat_id UUID;
  enh_id UUID;
BEGIN
  SELECT id INTO cat_id FROM public.image_categories WHERE category_code = 'exterior';
  IF cat_id IS NOT NULL THEN
    FOR enh_id IN SELECT id FROM public.enhancement_prompts WHERE category = 'exterior' AND is_active = true
    LOOP
      INSERT INTO public.category_enhancements (category_id, enhancement_id, sort_order)
      SELECT cat_id, enh_id, sort_order FROM public.enhancement_prompts WHERE id = enh_id
      ON CONFLICT (category_id, enhancement_id) DO UPDATE SET sort_order = EXCLUDED.sort_order;
    END LOOP;
  END IF;
END $$;

-- Map portrait enhancements
DO $$
DECLARE
  cat_id UUID;
  enh_id UUID;
BEGIN
  SELECT id INTO cat_id FROM public.image_categories WHERE category_code = 'portrait';
  IF cat_id IS NOT NULL THEN
    FOR enh_id IN SELECT id FROM public.enhancement_prompts WHERE category = 'portrait' AND is_active = true
    LOOP
      INSERT INTO public.category_enhancements (category_id, enhancement_id, sort_order)
      SELECT cat_id, enh_id, sort_order FROM public.enhancement_prompts WHERE id = enh_id
      ON CONFLICT (category_id, enhancement_id) DO UPDATE SET sort_order = EXCLUDED.sort_order;
    END LOOP;
  END IF;
END $$;

-- Map product enhancements to product category
DO $$
DECLARE
  cat_id UUID;
  enh_id UUID;
BEGIN
  SELECT id INTO cat_id FROM public.image_categories WHERE category_code = 'product';
  IF cat_id IS NOT NULL THEN
    FOR enh_id IN SELECT id FROM public.enhancement_prompts WHERE category = 'product' AND is_active = true
    LOOP
      INSERT INTO public.category_enhancements (category_id, enhancement_id, sort_order)
      SELECT cat_id, enh_id, sort_order FROM public.enhancement_prompts WHERE id = enh_id
      ON CONFLICT (category_id, enhancement_id) DO UPDATE SET sort_order = EXCLUDED.sort_order;
    END LOOP;
  END IF;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check total enhancements per category
SELECT 
  category,
  COUNT(*) as total
FROM public.enhancement_prompts
WHERE is_active = true
GROUP BY category
ORDER BY category;

-- Expected results after this migration:
-- category  | total
-- ----------|------
-- exterior  | 22   (12 + 10 new)
-- fashion   | 25   (10 + 15 new)
-- food      | 39   (24 + 15 new)
-- interior  | 27   (12 + 15 new)
-- portrait  | 20   (10 + 10 new)
-- product   | 20   (NEW category)
-- TOTAL     | 153  enhancements!

-- Check category mappings
SELECT 
  ic.category_code,
  ic.category_name,
  COUNT(ce.id) as total_enhancements,
  ic.sort_order
FROM public.image_categories ic
LEFT JOIN public.category_enhancements ce ON ic.id = ce.category_id
WHERE ic.is_active = true
GROUP BY ic.category_code, ic.category_name, ic.sort_order
ORDER BY ic.sort_order;

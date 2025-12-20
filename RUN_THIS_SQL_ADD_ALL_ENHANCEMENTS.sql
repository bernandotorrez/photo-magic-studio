-- =====================================================
-- QUICK RUN: ADD ALL ENHANCEMENTS
-- Copy dan paste semua SQL ini ke Supabase SQL Editor
-- =====================================================

-- Food Enhancements (24 items)
INSERT INTO public.enhancement_prompts (enhancement_type, display_name, prompt_template, description, category, sort_order) VALUES
('food_angle_top_down', '📐 Top-Down View (Flat Lay)', 'Transform this food photo to a top-down view (90-degree angle) perfect for flat lay photography. Show the food from directly above with even lighting and clear composition.', 'Foto dari atas dengan sudut 90 derajat, cocok untuk flat lay photography', 'food', 1),
('food_angle_45_degree', '📐 45-Degree Angle', 'Capture this food at a 45-degree angle to show depth and dimension. This angle should highlight the height and layers of the food while maintaining visual appeal.', 'Sudut 45 derajat untuk menampilkan depth dan dimensi makanan', 'food', 2),
('food_angle_close_up', '📐 Extreme Close-Up', 'Create an extreme close-up shot of this food, highlighting intricate textures, details, and appetizing qualities. Focus on the most visually appealing part.', 'Close-up ekstrem untuk highlight tekstur dan detail', 'food', 3),
('food_ingredient_overlay', '🥕 Tampilkan Bahan-Bahan', 'Display the main ingredients around the food in an organized, visually appealing way. Show fresh ingredients that complement the dish.', 'Tampilkan bahan-bahan di sekitar makanan', 'food', 4),
('food_ingredient_floating', '🥕 Bahan Melayang (Floating)', 'Create a dynamic composition with ingredients floating in the air around the food. Add motion and energy to the image with suspended ingredients.', 'Bahan-bahan melayang di udara untuk efek dinamis', 'food', 5),
('food_banner_promo', '🎨 Banner Promosi', 'Transform this into a promotional banner with space for text, attractive composition, and commercial appeal. Optimize for marketing use.', 'Tambahkan elemen banner promosi', 'food', 6),
('food_banner_menu', '🎨 Banner Menu Restoran', 'Create a restaurant menu banner format with professional presentation, clear focus on the dish, and space for menu text.', 'Format banner untuk menu restoran', 'food', 7),
('food_banner_delivery', '🎨 Banner Delivery App', 'Optimize this food photo for delivery app banners with appetizing presentation, clear visibility, and mobile-friendly composition.', 'Format banner untuk aplikasi delivery', 'food', 8),
('food_plating_elegant', '🍴 Plating Mewah', 'Elevate the plating to an elegant, fine-dining style with sophisticated presentation, garnishes, and upscale aesthetic.', 'Plating dengan style mewah dan elegant', 'food', 9),
('food_plating_rustic', '🍴 Plating Rustic/Homey', 'Transform the plating to a rustic, homey style with warm, comforting presentation and casual, inviting aesthetic.', 'Plating dengan style rustic dan homey', 'food', 10),
('food_add_props', '🍴 Tambah Props & Dekorasi', 'Add complementary props and decorations around the food such as utensils, napkins, herbs, or contextual items that enhance the composition.', 'Tambahkan props dan dekorasi pendukung', 'food', 11),
('food_lighting_natural', '💡 Natural Light', 'Apply natural lighting that mimics sunlight, creating soft shadows and a fresh, organic feel to the food photography.', 'Pencahayaan natural seperti cahaya matahari', 'food', 12),
('food_lighting_dramatic', '💡 Dramatic Lighting', 'Create dramatic lighting with high contrast, deep shadows, and focused highlights to add mood and visual impact.', 'Pencahayaan dramatis dengan kontras tinggi', 'food', 13),
('food_lighting_warm', '💡 Warm & Cozy', 'Apply warm, cozy lighting that creates an inviting, comfortable atmosphere with golden tones and soft illumination.', 'Pencahayaan hangat dan cozy', 'food', 14),
('food_add_steam', '✨ Tambah Efek Uap/Steam', 'Add realistic steam effects to show the food is hot and freshly prepared, enhancing the appetizing appeal.', 'Tambahkan efek uap untuk makanan panas', 'food', 15),
('food_add_sauce_drip', '✨ Sauce Drip/Pour Effect', 'Add dynamic sauce dripping or pouring effects to create movement and enhance the visual appeal of the dish.', 'Efek sauce yang menetes atau dituang', 'food', 16),
('food_color_vibrant', '✨ Warna Lebih Vibrant', 'Enhance the vibrancy and saturation of colors to make the food look more appetizing and visually striking.', 'Tingkatkan vibrancy warna makanan', 'food', 17),
('food_background_blur', '✨ Blur Background (Bokeh)', 'Apply background blur with bokeh effect to create depth and focus attention on the food subject.', 'Background blur dengan efek bokeh', 'food', 18),
('food_table_setting', '🌳 Complete Table Setting', 'Create a complete table setting with plates, utensils, glasses, and other dining elements for a full dining experience presentation.', 'Setting meja lengkap dengan peralatan makan', 'food', 19),
('food_outdoor_picnic', '🌳 Outdoor/Picnic Style', 'Transform the setting to an outdoor or picnic style with natural surroundings, casual presentation, and fresh-air ambiance.', 'Style outdoor atau picnic', 'food', 20),
('food_restaurant_ambiance', '🌳 Restaurant Ambiance', 'Create a professional restaurant ambiance with upscale setting, proper lighting, and commercial dining atmosphere.', 'Suasana restaurant yang profesional', 'food', 21),
('food_portion_size', '🎯 Adjust Portion Size', 'Adjust the portion size of the food to look more generous and appealing while maintaining realistic proportions.', 'Sesuaikan ukuran porsi makanan', 'food', 22),
('food_garnish_enhance', '🎯 Enhance Garnish', 'Enhance and add garnishes such as fresh herbs, microgreens, or decorative elements to elevate the presentation.', 'Tingkatkan tampilan garnish', 'food', 23),
('food_texture_enhance', '🎯 Enhance Texture', 'Enhance the visible texture of the food to show crispiness, juiciness, or other appetizing textural qualities.', 'Tingkatkan detail tekstur makanan', 'food', 24)
ON CONFLICT (enhancement_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  prompt_template = EXCLUDED.prompt_template,
  description = EXCLUDED.description,
  updated_at = timezone('utc'::text, now());

-- Fashion Enhancements (10 items)
INSERT INTO public.enhancement_prompts (enhancement_type, display_name, prompt_template, description, category, sort_order) VALUES
('fashion_female_model', '👗 Dipakai oleh Model Wanita', 'Show this fashion product worn by a female model in a professional fashion photography style. The model should complement the product with appropriate pose and styling.', 'Tampilkan produk dipakai oleh model wanita', 'fashion', 30),
('fashion_female_hijab_model', '🧕 Dipakai oleh Model Wanita Berhijab', 'Show this fashion product worn by a female model wearing hijab in a professional, modest fashion photography style.', 'Tampilkan produk dipakai oleh model wanita berhijab', 'fashion', 31),
('fashion_male_model', '👔 Dipakai oleh Model Pria', 'Show this fashion product worn by a male model in a professional fashion photography style with appropriate styling and pose.', 'Tampilkan produk dipakai oleh model pria', 'fashion', 32),
('fashion_lifestyle_model', '📸 Foto Lifestyle dengan Model', 'Create a natural lifestyle photo with the product worn by a model in a real-life setting, showing authentic usage and context.', 'Foto lifestyle natural dengan model', 'fashion', 33),
('fashion_mannequin', '🎭 Ditampilkan pada Manekin', 'Display the fashion product on a professional mannequin with proper styling and presentation.', 'Tampilkan produk di mannequin', 'fashion', 34),
('fashion_close_up_detail', '🔎 Foto Close-up Detail', 'Create detailed close-up shots highlighting the fabric texture, stitching, patterns, and quality details of the fashion product.', 'Detail close-up produk', 'fashion', 35),
('fashion_color_variant', '🎨 Buat Varian Warna', 'Generate color variants of the fashion product while maintaining the same style, fit, and design details.', 'Generate varian warna produk', 'fashion', 36),
('fashion_material_change', '✨ Ubah Material/Tekstur', 'Change the material or texture of the fashion product (e.g., cotton to silk, denim to leather) while keeping the design.', 'Ubah material atau tekstur produk', 'fashion', 37),
('fashion_360_view', '🔄 Generate 360° View', 'Create a 360-degree view of the fashion product showing all angles and details for comprehensive product visualization.', 'Buat tampilan 360 derajat', 'fashion', 38),
('fashion_size_comparison', '📏 Tampilkan Size Comparison', 'Show size comparison of the fashion product with reference objects or multiple sizes displayed together.', 'Perbandingan ukuran produk', 'fashion', 39)
ON CONFLICT (enhancement_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  prompt_template = EXCLUDED.prompt_template,
  description = EXCLUDED.description,
  updated_at = timezone('utc'::text, now());

-- Interior Enhancements (12 items) - TERMASUK VIRTUAL STAGING!
INSERT INTO public.enhancement_prompts (enhancement_type, display_name, prompt_template, description, category, sort_order) VALUES
('interior_virtual_staging', '🛋️ Virtual Staging (Tambah Furniture)', 'Add furniture and decor to this empty or sparsely furnished room. Create a fully staged interior that showcases the space potential. Use customFurniture parameter for specific items.', 'Tambahkan furniture ke ruangan kosong (gunakan customFurniture)', 'interior', 50),
('interior_style_transformation', '🎨 Style Transformation (Modern/Minimalist/Classic)', 'Transform the interior style completely - modern, minimalist, classic, contemporary, or other specified style while maintaining the room structure.', 'Ubah style interior', 'interior', 51),
('interior_color_scheme', '🌈 Ubah Color Scheme', 'Change the color scheme of the interior including walls, furniture, and decor to create a cohesive new palette.', 'Ubah skema warna ruangan', 'interior', 52),
('interior_lighting_enhancement', '💡 Lighting Enhancement', 'Enhance the lighting in the interior space with better natural light, ambient lighting, or strategic light fixtures for improved atmosphere.', 'Tingkatkan pencahayaan ruangan', 'interior', 53),
('interior_wallpaper_change', '🪟 Ubah Wallpaper/Cat Dinding', 'Change the wallpaper or wall paint color/pattern while keeping other elements of the room intact.', 'Ubah wallpaper atau cat dinding', 'interior', 54),
('interior_add_decoration', '🖼️ Tambah Dekorasi & Artwork', 'Add decorative elements such as artwork, wall decor, sculptures, and accessories to enhance the interior aesthetic.', 'Tambahkan dekorasi dan artwork', 'interior', 55),
('interior_add_plants', '🌿 Tambah Tanaman Hias', 'Add indoor plants and greenery to bring life and freshness to the interior space.', 'Tambahkan tanaman hias', 'interior', 56),
('interior_luxury_upgrade', '✨ Luxury Interior Upgrade', 'Upgrade the interior to luxury style with high-end furniture, premium materials, elegant finishes, and sophisticated design elements.', 'Upgrade ke style luxury', 'interior', 57),
('interior_scandinavian_style', '🏠 Scandinavian Style', 'Transform to Scandinavian style with light wood, white walls, minimalist furniture, natural materials, and cozy hygge elements.', 'Style Scandinavian minimalis', 'interior', 58),
('interior_industrial_style', '🎭 Industrial Style', 'Transform to industrial style with exposed brick, metal fixtures, concrete elements, Edison bulbs, and raw urban aesthetic.', 'Style industrial modern', 'interior', 59),
('interior_bohemian_style', '🌸 Bohemian Style', 'Transform to bohemian style with eclectic patterns, vibrant colors, layered textiles, plants, and artistic global-inspired decor.', 'Style bohemian colorful', 'interior', 60),
('interior_classic_style', '🏛️ Classic/Traditional Style', 'Transform to classic or traditional style with timeless furniture, elegant details, rich colors, and sophisticated traditional elements.', 'Style classic/traditional', 'interior', 61)
ON CONFLICT (enhancement_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  prompt_template = EXCLUDED.prompt_template,
  description = EXCLUDED.description,
  updated_at = timezone('utc'::text, now());

-- Exterior Enhancements (12 items)
INSERT INTO public.enhancement_prompts (enhancement_type, display_name, prompt_template, description, category, sort_order) VALUES
('exterior_facade_renovation', '🏠 Facade Renovation (Ubah Tampilan Depan)', 'Renovate and modernize the building facade with updated materials, colors, windows, and architectural elements.', 'Renovasi tampilan depan bangunan', 'exterior', 70),
('exterior_landscaping', '🌳 Landscaping Enhancement (Taman & Tanaman)', 'Enhance the landscaping with beautiful gardens, trees, shrubs, flowers, and well-maintained greenery.', 'Tingkatkan landscaping dan taman', 'exterior', 71),
('exterior_time_change', '🌅 Ubah Waktu (Day/Night/Golden Hour)', 'Change the time of day - transform to daytime, nighttime, golden hour, or blue hour with appropriate lighting and atmosphere.', 'Ubah waktu (siang/malam/golden hour)', 'exterior', 72),
('exterior_weather_change', '⛅ Ubah Cuaca (Sunny/Cloudy/Rainy)', 'Change the weather conditions - sunny, cloudy, rainy, or other weather with appropriate sky and lighting adjustments.', 'Ubah kondisi cuaca', 'exterior', 73),
('exterior_paint_color', '🎨 Ubah Warna Cat Eksterior', 'Change the exterior paint color of the building while maintaining texture and architectural details.', 'Ubah warna cat eksterior', 'exterior', 74),
('exterior_window_door_upgrade', '🪟 Upgrade Jendela & Pintu', 'Upgrade windows and doors with modern, stylish alternatives that enhance the building appearance.', 'Upgrade jendela dan pintu', 'exterior', 75),
('exterior_outdoor_lighting', '💡 Tambah Outdoor Lighting', 'Add outdoor lighting fixtures including pathway lights, wall sconces, landscape lighting, and accent lights.', 'Tambahkan pencahayaan outdoor', 'exterior', 76),
('exterior_add_pool', '🏊 Tambah Pool/Water Feature', 'Add a swimming pool or water feature to the exterior space with appropriate landscaping and hardscaping.', 'Tambahkan kolam atau water feature', 'exterior', 77),
('exterior_add_driveway', '🚗 Tambah Driveway & Parking', 'Add or improve driveway and parking area with proper paving, landscaping, and functional design.', 'Tambahkan driveway dan area parkir', 'exterior', 78),
('exterior_add_garden', '🌺 Tambah Garden & Flowers', 'Add beautiful gardens with colorful flowers, organized beds, and attractive garden design.', 'Tambahkan taman dan bunga', 'exterior', 79),
('exterior_modern_architecture', '🏗️ Modern Architecture Style', 'Transform to modern architectural style with clean lines, large windows, mixed materials, and contemporary design.', 'Style arsitektur modern', 'exterior', 80),
('exterior_classic_architecture', '🏛️ Classic Architecture Style', 'Transform to classic architectural style with traditional elements, symmetry, and timeless design features.', 'Style arsitektur classic', 'exterior', 81)
ON CONFLICT (enhancement_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  prompt_template = EXCLUDED.prompt_template,
  description = EXCLUDED.description,
  updated_at = timezone('utc'::text, now());

-- Portrait Enhancements (10 items)
INSERT INTO public.enhancement_prompts (enhancement_type, display_name, prompt_template, description, category, sort_order) VALUES
('portrait_outfit_change', '🎨 Virtual Outfit Change (Ganti Baju)', 'Virtually change the outfit in the portrait while maintaining the person pose and appearance.', 'Ganti outfit secara virtual', 'portrait', 90),
('portrait_pose_variation', '💃 Ubah Pose (Pose Variation)', 'Change the pose of the person in the portrait. Use customPose parameter to specify desired pose.', 'Ubah pose (gunakan parameter customPose)', 'portrait', 91),
('portrait_background_change', '🌆 Ganti Background', 'Change the background of the portrait to a different setting while maintaining natural lighting and perspective.', 'Ganti background foto', 'portrait', 92),
('portrait_professional_enhancement', '📸 Professional Portrait Enhancement', 'Apply professional portrait enhancements including lighting, color grading, and overall quality improvements.', 'Enhancement portrait profesional', 'portrait', 93),
('portrait_beauty_enhancement', '✨ Beauty Enhancement (Smooth Skin)', 'Apply beauty enhancements including skin smoothing, blemish removal, and natural retouching.', 'Beauty enhancement dan smooth skin', 'portrait', 94),
('portrait_expression_change', '🎭 Ubah Ekspresi Wajah', 'Change the facial expression in the portrait (smile, serious, confident, etc.) while maintaining natural appearance.', 'Ubah ekspresi wajah', 'portrait', 95),
('portrait_business_style', '💼 Business Portrait Style', 'Transform to professional business portrait style with appropriate styling, lighting, and corporate aesthetic.', 'Style portrait bisnis profesional', 'portrait', 96),
('portrait_fashion_editorial', '🌟 Fashion Editorial Style', 'Transform to fashion editorial style with dramatic lighting, artistic composition, and high-fashion aesthetic.', 'Style fashion editorial', 'portrait', 97),
('portrait_cinematic_look', '🎬 Cinematic Look', 'Apply cinematic look with film-like color grading, dramatic lighting, and movie-quality aesthetic.', 'Tampilan sinematik', 'portrait', 98),
('portrait_studio_lighting', '🖼️ Studio Portrait dengan Lighting Profesional', 'Apply professional studio lighting setup with proper key light, fill light, and rim light for polished portrait.', 'Portrait studio dengan lighting profesional', 'portrait', 99)
ON CONFLICT (enhancement_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  prompt_template = EXCLUDED.prompt_template,
  description = EXCLUDED.description,
  updated_at = timezone('utc'::text, now());

-- Add categories if not exist
INSERT INTO public.image_categories (category_code, category_name, description, icon, sort_order) VALUES
('food', 'Food & Culinary', 'Food photography, dishes, ingredients, and culinary presentations', '🍽️', 1),
('portrait', 'Portrait & People', 'Portrait photography, people, and human subjects', '👤', 8)
ON CONFLICT (category_code) DO NOTHING;

-- Map enhancements to categories
DO $$
DECLARE
  cat_id UUID;
  enh_id UUID;
  cat_code TEXT;
  enh_cat TEXT;
BEGIN
  -- Map food enhancements
  SELECT id INTO cat_id FROM public.image_categories WHERE category_code = 'food';
  IF cat_id IS NOT NULL THEN
    FOR enh_id IN SELECT id FROM public.enhancement_prompts WHERE category = 'food' AND is_active = true
    LOOP
      INSERT INTO public.category_enhancements (category_id, enhancement_id, sort_order)
      SELECT cat_id, enh_id, sort_order FROM public.enhancement_prompts WHERE id = enh_id
      ON CONFLICT (category_id, enhancement_id) DO UPDATE SET sort_order = EXCLUDED.sort_order;
    END LOOP;
  END IF;

  -- Map fashion enhancements to clothing
  SELECT id INTO cat_id FROM public.image_categories WHERE category_code = 'clothing';
  IF cat_id IS NOT NULL THEN
    FOR enh_id IN SELECT id FROM public.enhancement_prompts WHERE category = 'fashion' AND is_active = true
    LOOP
      INSERT INTO public.category_enhancements (category_id, enhancement_id, sort_order)
      SELECT cat_id, enh_id, sort_order FROM public.enhancement_prompts WHERE id = enh_id
      ON CONFLICT (category_id, enhancement_id) DO UPDATE SET sort_order = EXCLUDED.sort_order;
    END LOOP;
  END IF;

  -- Map interior enhancements
  SELECT id INTO cat_id FROM public.image_categories WHERE category_code = 'interior';
  IF cat_id IS NOT NULL THEN
    FOR enh_id IN SELECT id FROM public.enhancement_prompts WHERE category = 'interior' AND is_active = true
    LOOP
      INSERT INTO public.category_enhancements (category_id, enhancement_id, sort_order)
      SELECT cat_id, enh_id, sort_order FROM public.enhancement_prompts WHERE id = enh_id
      ON CONFLICT (category_id, enhancement_id) DO UPDATE SET sort_order = EXCLUDED.sort_order;
    END LOOP;
  END IF;

  -- Map exterior enhancements
  SELECT id INTO cat_id FROM public.image_categories WHERE category_code = 'exterior';
  IF cat_id IS NOT NULL THEN
    FOR enh_id IN SELECT id FROM public.enhancement_prompts WHERE category = 'exterior' AND is_active = true
    LOOP
      INSERT INTO public.category_enhancements (category_id, enhancement_id, sort_order)
      SELECT cat_id, enh_id, sort_order FROM public.enhancement_prompts WHERE id = enh_id
      ON CONFLICT (category_id, enhancement_id) DO UPDATE SET sort_order = EXCLUDED.sort_order;
    END LOOP;
  END IF;

  -- Map portrait enhancements
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

-- Verification: Check total enhancements
SELECT 
  category,
  COUNT(*) as total
FROM public.enhancement_prompts
WHERE is_active = true
GROUP BY category
ORDER BY category;

-- Verification: Check category mappings
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

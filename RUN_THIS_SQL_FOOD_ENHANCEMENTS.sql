-- ============================================
-- FOOD ENHANCEMENT PROMPTS
-- ============================================
-- Menambahkan enhancement prompts khusus untuk kategori makanan
-- Run this SQL in Supabase SQL Editor

-- Insert Food Enhancement Prompts
INSERT INTO enhancement_prompts (
  enhancement_type,
  display_name,
  prompt_template,
  description,
  category,
  sort_order,
  is_active
) VALUES

-- 1. Edit Angle / Perspective
(
  'food_angle_top_down',
  'Top-Down View (Flat Lay)',
  'Transform this food photo into a professional top-down flat lay perspective. Position the camera directly above the food at 90 degrees. Arrange the food and props symmetrically and aesthetically. Perfect for social media and food blogging. Maintain natural lighting and shadows.',
  'Ubah sudut foto menjadi tampilan dari atas (flat lay) yang sempurna',
  'food',
  10,
  true
),

(
  'food_angle_45_degree',
  '45-Degree Angle',
  'Adjust this food photo to a professional 45-degree angle perspective. This is the most natural and appetizing angle for food photography. Show depth and dimension while highlighting the food''s best features. Maintain proper composition and focus.',
  'Sudut 45 derajat yang paling natural dan menggugah selera',
  'food',
  20,
  true
),

(
  'food_angle_close_up',
  'Extreme Close-Up',
  'Transform this into an extreme close-up food shot that highlights texture, details, and appetizing qualities. Focus on the most delicious part of the dish. Show moisture, steam, garnishes, and intricate details. Create a mouth-watering macro perspective.',
  'Close-up ekstrem yang menampilkan detail dan tekstur makanan',
  'food',
  30,
  true
),

-- 2. Ingredient Overlay
(
  'food_ingredient_overlay',
  'Tampilkan Bahan-Bahan',
  'Add elegant ingredient overlays to this food photo. Display the main ingredients around the dish with clean labels and icons. Use modern, minimalist design with semi-transparent backgrounds. Show ingredient names in Indonesian. Create an infographic-style presentation that is informative yet visually appealing.',
  'Tambahkan overlay bahan-bahan masakan dengan desain modern',
  'food',
  40,
  true
),

(
  'food_ingredient_floating',
  'Bahan Melayang (Floating)',
  'Create a dynamic composition with fresh ingredients floating around the main dish. Show raw ingredients (vegetables, spices, herbs) suspended in mid-air with natural shadows. Create a sense of freshness and movement. Professional food advertising style.',
  'Bahan-bahan segar melayang di sekitar makanan utama',
  'food',
  50,
  true
),

-- 3. Banner & Advertising
(
  'food_banner_promo',
  'Banner Promosi',
  'Transform this food photo into a professional promotional banner. Add space for text overlay (top or bottom). Enhance colors to be vibrant and appetizing. Add subtle gradient backgrounds. Perfect for restaurant menus, social media ads, and promotional materials. Maintain focus on the food while creating advertising appeal.',
  'Buat banner promosi profesional untuk iklan dan media sosial',
  'food',
  60,
  true
),

(
  'food_banner_menu',
  'Banner Menu Restoran',
  'Create a restaurant menu-style banner from this food photo. Add elegant borders and frames. Include space for dish name, price, and description. Use warm, inviting colors. Professional restaurant menu photography style with proper lighting and composition.',
  'Banner untuk menu restoran dengan frame elegan',
  'food',
  70,
  true
),

(
  'food_banner_delivery',
  'Banner Delivery App',
  'Optimize this food photo for food delivery app banners. Make it look fresh, hot, and irresistible. Add subtle steam effects if appropriate. Enhance colors to stand out on mobile screens. Square or horizontal format suitable for app interfaces.',
  'Banner untuk aplikasi delivery dengan tampilan menggugah selera',
  'food',
  80,
  true
),

-- 4. Styling & Presentation
(
  'food_plating_elegant',
  'Plating Mewah',
  'Transform this dish into an elegant fine-dining presentation. Improve plating with artistic arrangement, garnishes, and sauce drizzles. Add microgreens, edible flowers, or elegant garnishes. Create a Michelin-star restaurant aesthetic. Professional food styling.',
  'Ubah menjadi presentasi fine dining yang mewah',
  'food',
  90,
  true
),

(
  'food_plating_rustic',
  'Plating Rustic/Homey',
  'Style this food photo with a warm, rustic, homey presentation. Use wooden boards, ceramic plates, and natural textures. Add casual garnishes like fresh herbs. Create a cozy, comfort food atmosphere. Perfect for home cooking and casual dining.',
  'Tampilan rustic dan homey yang hangat dan nyaman',
  'food',
  100,
  true
),

(
  'food_add_props',
  'Tambah Props & Dekorasi',
  'Enhance this food photo by adding complementary props and decorations. Include items like cutlery, napkins, herbs, spices, ingredients, or drinks. Arrange props to create a complete dining scene. Maintain focus on the main dish while adding context and atmosphere.',
  'Tambahkan properti dan dekorasi pelengkap yang sesuai',
  'food',
  110,
  true
),

-- 5. Lighting & Mood
(
  'food_lighting_natural',
  'Natural Light',
  'Enhance this food photo with beautiful natural lighting. Create soft, diffused daylight effect with gentle shadows. Highlight freshness and natural colors. Perfect for healthy food, breakfast, and fresh ingredients. Bright and airy atmosphere.',
  'Pencahayaan alami yang lembut dan cerah',
  'food',
  120,
  true
),

(
  'food_lighting_dramatic',
  'Dramatic Lighting',
  'Apply dramatic, moody lighting to this food photo. Use dark backgrounds with focused spotlight on the dish. Create strong contrast and shadows. Perfect for gourmet, luxury, or evening dining atmosphere. Professional food photography with cinematic quality.',
  'Pencahayaan dramatis dengan kontras tinggi',
  'food',
  130,
  true
),

(
  'food_lighting_warm',
  'Warm & Cozy',
  'Add warm, inviting lighting to this food photo. Create a cozy atmosphere with golden hour tones. Perfect for comfort food, baked goods, and hearty meals. Make the food look hot, fresh, and inviting.',
  'Pencahayaan hangat yang mengundang selera',
  'food',
  140,
  true
),

-- 6. Effects & Enhancements
(
  'food_add_steam',
  'Tambah Efek Uap/Steam',
  'Add realistic steam effects to this hot food photo. Create wisps of steam rising from the dish to emphasize freshness and temperature. Subtle and natural-looking steam that enhances the appetizing quality. Perfect for soups, hot dishes, and beverages.',
  'Tambahkan efek uap untuk makanan panas',
  'food',
  150,
  true
),

(
  'food_add_sauce_drip',
  'Sauce Drip/Pour Effect',
  'Add dynamic sauce dripping or pouring effect to this food photo. Show sauce, syrup, chocolate, or dressing being poured over the dish. Create movement and visual interest. Professional food advertising style.',
  'Efek saus atau sirup yang dituang',
  'food',
  160,
  true
),

(
  'food_color_vibrant',
  'Warna Lebih Vibrant',
  'Enhance colors to make this food photo more vibrant and appetizing. Boost saturation of natural food colors while maintaining realism. Make reds redder, greens greener, and overall more eye-catching. Perfect for social media and advertising.',
  'Tingkatkan warna agar lebih cerah dan menggugah selera',
  'food',
  170,
  true
),

(
  'food_background_blur',
  'Blur Background (Bokeh)',
  'Apply professional bokeh effect to blur the background while keeping the food in sharp focus. Create depth of field similar to DSLR photography. Make the dish stand out with creamy, smooth background blur.',
  'Blur background dengan efek bokeh profesional',
  'food',
  180,
  true
),

-- 7. Context & Scene
(
  'food_table_setting',
  'Complete Table Setting',
  'Transform this into a complete dining table setting. Add plates, cutlery, glasses, napkins, and other table elements. Create a full dining experience scene. Perfect for restaurant photography and lifestyle content.',
  'Lengkapi dengan setting meja makan yang sempurna',
  'food',
  190,
  true
),

(
  'food_outdoor_picnic',
  'Outdoor/Picnic Style',
  'Style this food photo for outdoor or picnic setting. Add natural outdoor elements, picnic blankets, or garden backgrounds. Create a fresh, casual, outdoor dining atmosphere. Perfect for summer food and casual dining.',
  'Tampilan outdoor atau piknik yang segar',
  'food',
  200,
  true
),

(
  'food_restaurant_ambiance',
  'Restaurant Ambiance',
  'Place this dish in an upscale restaurant ambiance. Add blurred restaurant background with ambient lighting, other diners, or elegant interior. Create a fine dining atmosphere. Professional restaurant photography.',
  'Suasana restoran mewah di background',
  'food',
  210,
  true
),

-- 8. Special Effects
(
  'food_portion_size',
  'Adjust Portion Size',
  'Adjust the portion size to look more generous and appetizing. Make the serving look abundant and satisfying without looking excessive. Perfect for menu photography and promotional materials.',
  'Sesuaikan porsi agar terlihat lebih menarik',
  'food',
  220,
  true
),

(
  'food_garnish_enhance',
  'Enhance Garnish',
  'Improve and enhance garnishes on this dish. Add fresh herbs, microgreens, edible flowers, or appropriate garnishes. Make garnishes look fresh, vibrant, and professionally placed. Elevate the overall presentation.',
  'Tingkatkan garnish dan hiasan makanan',
  'food',
  230,
  true
),

(
  'food_texture_enhance',
  'Enhance Texture',
  'Enhance the visible texture of this food. Highlight crispiness, creaminess, juiciness, or other textural qualities. Make the food look more tactile and appetizing. Show details that make viewers want to taste it.',
  'Tingkatkan tekstur makanan agar lebih jelas',
  'food',
  240,
  true
);

-- Verify insertion
SELECT 
  enhancement_type,
  display_name,
  category,
  sort_order,
  is_active
FROM enhancement_prompts
WHERE category = 'food'
ORDER BY sort_order;

-- ============================================
-- SUMMARY
-- ============================================
-- Total Food Enhancements Added: 24
-- 
-- Categories:
-- 1. Angle/Perspective (3): Top-down, 45-degree, Close-up
-- 2. Ingredients (2): Overlay, Floating
-- 3. Banners (3): Promo, Menu, Delivery
-- 4. Plating (3): Elegant, Rustic, Props
-- 5. Lighting (3): Natural, Dramatic, Warm
-- 6. Effects (4): Steam, Sauce, Vibrant, Bokeh
-- 7. Context (3): Table, Outdoor, Restaurant
-- 8. Special (3): Portion, Garnish, Texture
-- ============================================

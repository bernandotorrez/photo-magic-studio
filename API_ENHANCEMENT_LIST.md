# API Enhancement List - Complete Reference

## Overview

Dokumentasi lengkap enhancement options yang tersedia untuk API. Anda bisa menggunakan **Display Name** (dengan emoji) atau **Enhancement Type** (tanpa emoji) sebagai value untuk parameter `enhancement`.

## How to Use

### Option 1: Display Name (Recommended)
```json
{
  "imageUrl": "https://example.com/food.jpg",
  "enhancement": "📐 Top-Down View (Flat Lay)",  // ✅ Dengan emoji
  "classification": "food"
}
```

### Option 2: Enhancement Type
```json
{
  "imageUrl": "https://example.com/food.jpg",
  "enhancement": "food_angle_top_down",  // ✅ Tanpa emoji
  "classification": "food"
}
```

**Keduanya valid dan menghasilkan hasil yang sama!**

---

## Food Category

Untuk `"classification": "food"`

| Display Name | Enhancement Type | Description |
|--------------|------------------|-------------|
| 📐 Top-Down View (Flat Lay) | `food_angle_top_down` | Foto dari atas dengan sudut 90 derajat, cocok untuk flat lay photography |
| 📐 45-Degree Angle | `food_angle_45_degree` | Sudut 45 derajat untuk menampilkan depth dan dimensi makanan |
| 📐 Extreme Close-Up | `food_angle_close_up` | Close-up ekstrem untuk highlight tekstur dan detail |
| 🥕 Tampilkan Bahan-Bahan | `food_ingredient_overlay` | Tampilkan bahan-bahan di sekitar makanan |
| 🥕 Bahan Melayang (Floating) | `food_ingredient_floating` | Bahan-bahan melayang di udara untuk efek dinamis |
| 🎨 Banner Promosi | `food_banner_promo` | Tambahkan elemen banner promosi |
| 🎨 Banner Menu Restoran | `food_banner_menu` | Format banner untuk menu restoran |
| 🎨 Banner Delivery App | `food_banner_delivery` | Format banner untuk aplikasi delivery |
| 🍴 Plating Mewah | `food_plating_elegant` | Plating dengan style mewah dan elegant |
| 🍴 Plating Rustic/Homey | `food_plating_rustic` | Plating dengan style rustic dan homey |
| 🍴 Tambah Props & Dekorasi | `food_add_props` | Tambahkan props dan dekorasi pendukung |
| 💡 Natural Light | `food_lighting_natural` | Pencahayaan natural seperti cahaya matahari |
| 💡 Dramatic Lighting | `food_lighting_dramatic` | Pencahayaan dramatis dengan kontras tinggi |
| 💡 Warm & Cozy | `food_lighting_warm` | Pencahayaan hangat dan cozy |
| ✨ Tambah Efek Uap/Steam | `food_add_steam` | Tambahkan efek uap untuk makanan panas |
| ✨ Sauce Drip/Pour Effect | `food_add_sauce_drip` | Efek sauce yang menetes atau dituang |
| ✨ Warna Lebih Vibrant | `food_color_vibrant` | Tingkatkan vibrancy warna makanan |
| ✨ Blur Background (Bokeh) | `food_background_blur` | Background blur dengan efek bokeh |
| 🌳 Complete Table Setting | `food_table_setting` | Setting meja lengkap dengan peralatan makan |
| 🌳 Outdoor/Picnic Style | `food_outdoor_picnic` | Style outdoor atau picnic |
| 🌳 Restaurant Ambiance | `food_restaurant_ambiance` | Suasana restaurant yang profesional |
| 🎯 Adjust Portion Size | `food_portion_size` | Sesuaikan ukuran porsi makanan |
| 🎯 Enhance Garnish | `food_garnish_enhance` | Tingkatkan tampilan garnish |
| 🎯 Enhance Texture | `food_texture_enhance` | Tingkatkan detail tekstur makanan |

### Example Request (Food)

```bash
# Using Display Name
curl -X POST https://your-project.supabase.co/functions/v1/api-generate \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/food.jpg",
    "enhancement": "📐 Top-Down View (Flat Lay)",
    "classification": "food"
  }'

# Using Enhancement Type
curl -X POST https://your-project.supabase.co/functions/v1/api-generate \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/food.jpg",
    "enhancement": "food_angle_top_down",
    "classification": "food"
  }'
```

---

## Fashion Category

Untuk `"classification": "fashion"`

| Display Name | Enhancement Type | Description |
|--------------|------------------|-------------|
| 👗 Dipakai oleh Model Wanita | `fashion_female_model` | Tampilkan produk dipakai oleh model wanita |
| 🧕 Dipakai oleh Model Wanita Berhijab | `fashion_female_hijab_model` | Tampilkan produk dipakai oleh model wanita berhijab |
| 👔 Dipakai oleh Model Pria | `fashion_male_model` | Tampilkan produk dipakai oleh model pria |
| 📸 Foto Lifestyle dengan Model | `fashion_lifestyle_model` | Foto lifestyle natural dengan model |
| 🎭 Ditampilkan pada Manekin | `fashion_mannequin` | Tampilkan produk di mannequin |
| 🔎 Foto Close-up Detail | `fashion_close_up_detail` | Detail close-up produk |
| 🎨 Buat Varian Warna | `fashion_color_variant` | Generate varian warna produk |
| ✨ Ubah Material/Tekstur | `fashion_material_change` | Ubah material atau tekstur produk |
| 🔄 Generate 360° View | `fashion_360_view` | Buat tampilan 360 derajat |
| 📏 Tampilkan Size Comparison | `fashion_size_comparison` | Perbandingan ukuran produk |

### Example Request (Fashion)

```bash
# Using Display Name
curl -X POST https://your-project.supabase.co/functions/v1/api-generate \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/dress.jpg",
    "enhancement": "👗 Dipakai oleh Model Wanita",
    "classification": "fashion"
  }'

# Using Enhancement Type
curl -X POST https://your-project.supabase.co/functions/v1/api-generate \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/dress.jpg",
    "enhancement": "fashion_female_model",
    "classification": "fashion"
  }'
```

---

## Interior Category

Untuk `"classification": "interior"`

| Display Name | Enhancement Type | Description |
|--------------|------------------|-------------|
| 🛋️ Virtual Staging (Tambah Furniture) | `interior_virtual_staging` | Tambahkan furniture ke ruangan kosong (gunakan customFurniture) |
| 🎨 Style Transformation (Modern/Minimalist/Classic) | `interior_style_transformation` | Ubah style interior |
| 🌈 Ubah Color Scheme | `interior_color_scheme` | Ubah skema warna ruangan |
| 💡 Lighting Enhancement | `interior_lighting_enhancement` | Tingkatkan pencahayaan ruangan |
| 🪟 Ubah Wallpaper/Cat Dinding | `interior_wallpaper_change` | Ubah wallpaper atau cat dinding |
| 🖼️ Tambah Dekorasi & Artwork | `interior_add_decoration` | Tambahkan dekorasi dan artwork |
| 🌿 Tambah Tanaman Hias | `interior_add_plants` | Tambahkan tanaman hias |
| ✨ Luxury Interior Upgrade | `interior_luxury_upgrade` | Upgrade ke style luxury |
| 🏠 Scandinavian Style | `interior_scandinavian_style` | Style Scandinavian minimalis |
| 🎭 Industrial Style | `interior_industrial_style` | Style industrial modern |
| 🌸 Bohemian Style | `interior_bohemian_style` | Style bohemian colorful |
| 🏛️ Classic/Traditional Style | `interior_classic_style` | Style classic/traditional |

### Example Request (Interior)

```bash
# Using Display Name with Custom Furniture
curl -X POST https://your-project.supabase.co/functions/v1/api-generate \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/empty-room.jpg",
    "enhancement": "🛋️ Virtual Staging (Tambah Furniture)",
    "classification": "interior",
    "customFurniture": "sofa modern, coffee table, floor lamp, wall art"
  }'

# Using Enhancement Type
curl -X POST https://your-project.supabase.co/functions/v1/api-generate \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/room.jpg",
    "enhancement": "interior_scandinavian_style",
    "classification": "interior"
  }'
```

---

## Exterior Category

Untuk `"classification": "exterior"`

| Display Name | Enhancement Type | Description |
|--------------|------------------|-------------|
| 🏠 Facade Renovation (Ubah Tampilan Depan) | `exterior_facade_renovation` | Renovasi tampilan depan bangunan |
| 🌳 Landscaping Enhancement (Taman & Tanaman) | `exterior_landscaping` | Tingkatkan landscaping dan taman |
| 🌅 Ubah Waktu (Day/Night/Golden Hour) | `exterior_time_change` | Ubah waktu (siang/malam/golden hour) |
| ⛅ Ubah Cuaca (Sunny/Cloudy/Rainy) | `exterior_weather_change` | Ubah kondisi cuaca |
| 🎨 Ubah Warna Cat Eksterior | `exterior_paint_color` | Ubah warna cat eksterior |
| 🪟 Upgrade Jendela & Pintu | `exterior_window_door_upgrade` | Upgrade jendela dan pintu |
| 💡 Tambah Outdoor Lighting | `exterior_outdoor_lighting` | Tambahkan pencahayaan outdoor |
| 🏊 Tambah Pool/Water Feature | `exterior_add_pool` | Tambahkan kolam atau water feature |
| 🚗 Tambah Driveway & Parking | `exterior_add_driveway` | Tambahkan driveway dan area parkir |
| 🌺 Tambah Garden & Flowers | `exterior_add_garden` | Tambahkan taman dan bunga |
| 🏗️ Modern Architecture Style | `exterior_modern_architecture` | Style arsitektur modern |
| 🏛️ Classic Architecture Style | `exterior_classic_architecture` | Style arsitektur classic |

### Example Request (Exterior)

```bash
# Using Display Name
curl -X POST https://your-project.supabase.co/functions/v1/api-generate \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/house.jpg",
    "enhancement": "🌳 Landscaping Enhancement (Taman & Tanaman)",
    "classification": "exterior"
  }'

# Using Enhancement Type
curl -X POST https://your-project.supabase.co/functions/v1/api-generate \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/building.jpg",
    "enhancement": "exterior_modern_architecture",
    "classification": "exterior"
  }'
```

---

## Portrait Category

Untuk `"classification": "portrait"`

| Display Name | Enhancement Type | Description |
|--------------|------------------|-------------|
| 🎨 Virtual Outfit Change (Ganti Baju) | `portrait_outfit_change` | Ganti outfit secara virtual |
| 💃 Ubah Pose (Pose Variation) | `portrait_pose_variation` | Ubah pose (gunakan parameter customPose) |
| 🌆 Ganti Background | `portrait_background_change` | Ganti background foto |
| 📸 Professional Portrait Enhancement | `portrait_professional_enhancement` | Enhancement portrait profesional |
| ✨ Beauty Enhancement (Smooth Skin) | `portrait_beauty_enhancement` | Beauty enhancement dan smooth skin |
| 🎭 Ubah Ekspresi Wajah | `portrait_expression_change` | Ubah ekspresi wajah |
| 💼 Business Portrait Style | `portrait_business_style` | Style portrait bisnis profesional |
| 🌟 Fashion Editorial Style | `portrait_fashion_editorial` | Style fashion editorial |
| 🎬 Cinematic Look | `portrait_cinematic_look` | Tampilan sinematik |
| 🖼️ Studio Portrait dengan Lighting Profesional | `portrait_studio_lighting` | Portrait studio dengan lighting profesional |

### Example Request (Portrait)

```bash
# Using Display Name with Custom Pose
curl -X POST https://your-project.supabase.co/functions/v1/api-generate \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/portrait.jpg",
    "enhancement": "💃 Ubah Pose (Pose Variation)",
    "classification": "portrait",
    "customPose": "sitting on a chair, hands on lap, smiling warmly"
  }'

# Using Enhancement Type
curl -X POST https://your-project.supabase.co/functions/v1/api-generate \
  -H "x-api-key": "your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/portrait.jpg",
    "enhancement": "portrait_business_style",
    "classification": "portrait"
  }'
```

---

## Query Available Enhancements

Anda bisa query enhancement yang tersedia secara programmatic:

### Via Supabase REST API

```bash
curl -X POST https://your-project.supabase.co/rest/v1/rpc/get_enhancements_by_category \
  -H "apikey: your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"p_category_code": "food"}'
```

Response:
```json
[
  {
    "enhancement_id": "uuid-here",
    "enhancement_type": "food_angle_top_down",
    "display_name": "📐 Top-Down View (Flat Lay)",
    "description": "Foto dari atas dengan sudut 90 derajat...",
    "category": "food",
    "is_default": false,
    "sort_order": 1
  },
  ...
]
```

### Via SQL (if you have database access)

```sql
-- Get all enhancements for a category
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
```

---

## Best Practices

### 1. Cache Enhancement Lists
Store enhancement options in your application to avoid repeated queries:

```javascript
const ENHANCEMENTS = {
  food: {
    TOP_DOWN: 'food_angle_top_down',
    ANGLE_45: 'food_angle_45_degree',
    // ... more
  },
  fashion: {
    FEMALE_MODEL: 'fashion_female_model',
    MALE_MODEL: 'fashion_male_model',
    // ... more
  }
};
```

### 2. Use Enhancement Type for Code
For cleaner code, use `enhancement_type` (without emoji):

```javascript
const enhancement = 'food_angle_top_down';  // ✅ Clean
// vs
const enhancement = '📐 Top-Down View (Flat Lay)';  // Works but harder to type
```

### 3. Use Display Name for UI
Show `display_name` to users in your UI:

```javascript
// In your dropdown/select
<option value="food_angle_top_down">
  📐 Top-Down View (Flat Lay)
</option>
```

### 4. Validate Enhancement Exists
Check if enhancement exists before sending request:

```javascript
const validEnhancements = await fetchEnhancements('food');
if (!validEnhancements.includes(userInput)) {
  console.error('Invalid enhancement');
}
```

---

## Summary

✅ **Two ways to specify enhancement:**
- Display Name (with emoji): `"📐 Top-Down View (Flat Lay)"`
- Enhancement Type (without emoji): `"food_angle_top_down"`

✅ **Both are valid and produce the same result**

✅ **Recommendation:**
- Use **Enhancement Type** in your code (easier to type, no emoji issues)
- Show **Display Name** to users (more descriptive and user-friendly)

✅ **Query available enhancements:**
- Use `get_enhancements_by_category()` function
- Cache results in your application
- Refresh periodically to get new options

---

**Need help?** Check the main API documentation or contact support.

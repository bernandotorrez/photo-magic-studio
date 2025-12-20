# 🍽️ Food Enhancement - Quick Start

> Setup fitur Food Enhancement AI dalam 5 menit

## 🚀 Setup (3 Langkah)

### 1️⃣ Run SQL Migration

```bash
# 1. Buka Supabase Dashboard
# 2. Go to: Database > SQL Editor
# 3. Copy paste isi file: RUN_THIS_SQL_FOOD_ENHANCEMENTS.sql
# 4. Click "Run"
```

**Verify:**
```sql
SELECT COUNT(*) FROM enhancement_prompts WHERE category = 'food';
-- Expected: 24
```

### 2️⃣ Add Food Menu to Navigation

```typescript
// src/components/Navigation.tsx
const menuItems = [
  { path: '/interior', label: 'Interior', icon: '🏠' },
  { path: '/exterior', label: 'Exterior', icon: '🏛️' },
  { path: '/fashion', label: 'Fashion', icon: '👔' },
  { path: '/furniture', label: 'Furniture', icon: '🪑' },
  { path: '/food', label: 'Food', icon: '🍽️' }, // ← ADD THIS
];
```

### 3️⃣ Test API

```typescript
// Test single enhancement
const { data } = await supabase.functions.invoke('generate-enhanced-image', {
  body: {
    imageUrl: 'https://your-food-image.jpg',
    enhancement: 'food_angle_top_down',
    classification: 'food'
  }
});

console.log('Result:', data.generatedImageUrl);
```

## ✅ Done! 

Food Enhancement AI siap digunakan dengan 24 enhancement options.

## 📋 24 Enhancement Options

### 📐 Angle (3)
- `food_angle_top_down` - Top-Down View
- `food_angle_45_degree` - 45-Degree Angle  
- `food_angle_close_up` - Extreme Close-Up

### 🥕 Ingredients (2)
- `food_ingredient_overlay` - Tampilkan Bahan-Bahan
- `food_ingredient_floating` - Bahan Melayang

### 🎨 Banners (3)
- `food_banner_promo` - Banner Promosi
- `food_banner_menu` - Banner Menu Restoran
- `food_banner_delivery` - Banner Delivery App

### 🍴 Plating (3)
- `food_plating_elegant` - Plating Mewah
- `food_plating_rustic` - Plating Rustic/Homey
- `food_add_props` - Tambah Props & Dekorasi

### 💡 Lighting (3)
- `food_lighting_natural` - Natural Light
- `food_lighting_dramatic` - Dramatic Lighting
- `food_lighting_warm` - Warm & Cozy

### ✨ Effects (4)
- `food_add_steam` - Tambah Efek Uap
- `food_add_sauce_drip` - Sauce Drip Effect
- `food_color_vibrant` - Warna Lebih Vibrant
- `food_background_blur` - Blur Background

### 🌳 Context (3)
- `food_table_setting` - Complete Table Setting
- `food_outdoor_picnic` - Outdoor/Picnic Style
- `food_restaurant_ambiance` - Restaurant Ambiance

### 🎯 Special (3)
- `food_portion_size` - Adjust Portion Size
- `food_garnish_enhance` - Enhance Garnish
- `food_texture_enhance` - Enhance Texture

## 🎯 Quick Examples

### Example 1: Restaurant Menu
```typescript
const enhancements = [
  'food_angle_45_degree',
  'food_lighting_warm',
  'food_plating_elegant',
  'food_banner_menu'
];
```

### Example 2: Social Media
```typescript
const enhancements = [
  'food_angle_top_down',
  'food_color_vibrant',
  'food_add_props'
];
```

### Example 3: Delivery App
```typescript
const enhancements = [
  'food_angle_45_degree',
  'food_add_steam',
  'food_banner_delivery'
];
```

## 📖 Full Documentation

Read `FOOD_ENHANCEMENT_GUIDE.md` untuk:
- Detailed explanation setiap enhancement
- Best practices & tips
- Use cases & combinations
- Frontend implementation
- Admin management

## 🆘 Troubleshooting

**Enhancement tidak muncul?**
```sql
-- Check if active
SELECT * FROM enhancement_prompts 
WHERE category = 'food' AND is_active = false;
```

**Error saat generate?**
- Pastikan classification = 'food'
- Pastikan enhancement_type valid
- Check Supabase logs

## 🎉 Ready!

Sekarang user bisa enhance foto makanan dengan 24 options berbeda!

---

**Next Steps:**
1. ✅ Test semua enhancements
2. ✅ Create UI untuk food page
3. ✅ Add to main navigation
4. ✅ Train users on best combinations

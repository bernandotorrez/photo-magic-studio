# Enhancement Prompts Management System

## Overview

Sistem baru untuk mengelola enhancement prompts secara dinamis menggunakan database Supabase. Ini menggantikan hardcoded prompts di backend function dengan sistem yang lebih maintainable dan mudah diupdate.

## Keuntungan

✅ **Mudah Dikelola**: Admin bisa update prompts tanpa deploy ulang
✅ **Scalable**: Tambah enhancement baru dengan mudah
✅ **Organized**: Prompts dikelompokkan berdasarkan kategori
✅ **Flexible**: Support active/inactive status dan sorting
✅ **Maintainable**: Tidak perlu edit code untuk update prompts

## Database Schema

### Table: `enhancement_prompts`

```sql
- id (UUID): Primary key
- enhancement_type (VARCHAR): Unique identifier (e.g., 'modern_minimalist')
- display_name (VARCHAR): Nama yang ditampilkan ke user
- prompt_template (TEXT): Template prompt untuk AI
- description (TEXT): Deskripsi singkat untuk user
- is_active (BOOLEAN): Status aktif/nonaktif
- category (VARCHAR): Kategori (interior, exterior, fashion, furniture, general)
- sort_order (INTEGER): Urutan tampilan
- created_at (TIMESTAMP): Waktu dibuat
- updated_at (TIMESTAMP): Waktu terakhir diupdate
```

## Kategori Enhancement

1. **interior** - Interior design enhancements
2. **exterior** - Exterior/architecture enhancements
3. **fashion** - Fashion/clothing enhancements
4. **furniture** - Furniture replacement enhancements
5. **general** - General enhancements

## Admin Interface

### Akses Admin Panel

1. Login sebagai admin user
2. Klik tombol "Admin" di dashboard
3. Pilih menu "Enhancement Prompts"

### Fitur Admin

- **View All Prompts**: Lihat semua prompts yang ada, dikelompokkan per kategori
- **Create New**: Tambah enhancement prompt baru
- **Edit**: Update prompt yang sudah ada
- **Delete**: Hapus prompt (dengan konfirmasi)
- **Toggle Active**: Aktifkan/nonaktifkan prompt
- **Sort Order**: Atur urutan tampilan

### Form Fields

- **Enhancement Type** (required): Identifier unik, tidak bisa diubah setelah dibuat
- **Display Name** (required): Nama yang ditampilkan ke user
- **Prompt Template** (required): Template prompt untuk AI
- **Description**: Deskripsi singkat untuk user
- **Category**: Pilih kategori (interior/exterior/fashion/furniture/general)
- **Sort Order**: Angka untuk urutan tampilan (semakin kecil semakin atas)
- **Active**: Toggle untuk mengaktifkan/menonaktifkan

## Backend Integration

### Generate Enhanced Image Function

Function `generate-enhanced-image` sekarang:

1. Cek database untuk prompt berdasarkan `enhancement_type`
2. Jika ada di database, gunakan prompt dari database
3. Jika tidak ada, fallback ke legacy function `buildEnhancementPrompt()`

```typescript
// Try to get prompt from database first
const { data: promptData } = await supabase
  .from('enhancement_prompts')
  .select('prompt_template')
  .eq('enhancement_type', enhancementType)
  .eq('is_active', true)
  .maybeSingle();

if (promptData?.prompt_template) {
  // Use database prompt
  enhancementPrompt = promptData.prompt_template;
} else {
  // Fallback to legacy function
  enhancementPrompt = buildEnhancementPrompt(...);
}
```

## Frontend Integration

### Helper Functions

File: `src/lib/enhancementPrompts.ts`

```typescript
// Get all active prompts
const prompts = await getActiveEnhancementPrompts();

// Get prompts by category
const interiorPrompts = await getEnhancementPromptsByCategory('interior');

// Get single prompt
const prompt = await getEnhancementPrompt('modern_minimalist');
```

## Migration

### Running Migration

```bash
# Migration file sudah dibuat di:
supabase/migrations/20231220_create_enhancement_prompts.sql

# Untuk apply migration:
# 1. Via Supabase Dashboard: Database > Migrations > Run new migration
# 2. Via CLI: supabase db push
```

### Data Seeding

Migration sudah include INSERT statements untuk semua enhancement yang ada:

- 8 Interior enhancements
- 6 Exterior enhancements
- 6 Fashion enhancements
- 4 Furniture enhancements

Total: 24 enhancement prompts

## Security

### Row Level Security (RLS)

- **SELECT**: Semua user bisa lihat prompts yang aktif
- **INSERT/UPDATE/DELETE**: Hanya admin yang bisa manage prompts

### Policies

```sql
-- Anyone can view active prompts
CREATE POLICY "Anyone can view active enhancement prompts"
  ON enhancement_prompts FOR SELECT
  USING (is_active = true);

-- Only admins can manage
CREATE POLICY "Only admins can manage enhancement prompts"
  ON enhancement_prompts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

## Usage Example

### Menambah Enhancement Baru

1. Login sebagai admin
2. Buka Admin Panel > Enhancement Prompts
3. Klik "Add New Prompt"
4. Isi form:
   - Enhancement Type: `vintage_retro`
   - Display Name: `Vintage Retro`
   - Prompt Template: `Transform this interior into vintage retro style...`
   - Description: `Classic 60s-70s aesthetic`
   - Category: `interior`
   - Sort Order: `9`
   - Active: ✓
5. Klik "Save"

### Update Prompt yang Ada

1. Cari prompt yang ingin diupdate
2. Klik tombol Edit (icon pensil)
3. Update field yang diperlukan
4. Klik "Save"

### Menonaktifkan Enhancement

1. Cari prompt yang ingin dinonaktifkan
2. Toggle switch "Active" menjadi OFF
3. Prompt tidak akan muncul di frontend tapi data tetap tersimpan

## Best Practices

1. **Enhancement Type**: Gunakan snake_case, descriptive, dan unik
2. **Display Name**: Gunakan Title Case, user-friendly
3. **Prompt Template**: Jelas, spesifik, dan detail
4. **Description**: Singkat tapi informatif (max 1-2 kalimat)
5. **Sort Order**: Gunakan kelipatan 10 (10, 20, 30) untuk mudah insert di tengah
6. **Testing**: Test prompt baru sebelum mengaktifkan untuk production

## Troubleshooting

### Prompt tidak muncul di frontend

- Cek apakah `is_active = true`
- Cek apakah `enhancement_type` match dengan yang digunakan di frontend
- Cek RLS policies

### Error saat save

- Pastikan `enhancement_type` unik
- Pastikan semua required fields terisi
- Cek apakah user memiliki role admin

### Prompt tidak digunakan oleh backend

- Cek logs di Supabase Edge Functions
- Pastikan `enhancement_type` match persis (case-sensitive)
- Cek apakah fallback ke legacy function

## Future Enhancements

Potential improvements:

- [ ] Versioning system untuk prompts
- [ ] A/B testing untuk compare prompts
- [ ] Analytics untuk track prompt performance
- [ ] Bulk import/export prompts
- [ ] Prompt templates dengan variables
- [ ] Multi-language support
- [ ] Prompt preview/testing tool

## Support

Untuk pertanyaan atau issues, hubungi tim development.

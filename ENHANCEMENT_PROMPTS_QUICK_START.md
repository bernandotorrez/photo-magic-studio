# Enhancement Prompts System - Quick Start Guide

## 🚀 Setup (5 menit)

### 1. Run Migration

Jalankan migration untuk membuat table dan data:

**Via Supabase Dashboard:**
1. Buka Supabase Dashboard
2. Pilih project Anda
3. Klik **Database** > **SQL Editor**
4. Copy paste isi file `supabase/migrations/20231220_create_enhancement_prompts.sql`
5. Klik **Run**

**Via Supabase CLI:**
```bash
supabase db push
```

### 2. Verify Table Created

Cek di Supabase Dashboard > Database > Tables:
- Table `enhancement_prompts` harus ada
- Harus ada 24 rows data (8 interior, 6 exterior, 6 fashion, 4 furniture)

### 3. Test Admin Access

1. Login ke aplikasi sebagai admin user
2. Klik tombol **Admin** di dashboard
3. Pilih menu **Enhancement Prompts**
4. Anda harus bisa lihat semua prompts yang sudah di-seed

## 📝 Cara Pakai

### Menambah Enhancement Baru

```
1. Klik "Add New Prompt"
2. Isi form:
   - Enhancement Type: modern_luxury (unique identifier)
   - Display Name: Modern Luxury
   - Prompt Template: Transform this interior into modern luxury...
   - Description: High-end contemporary design
   - Category: interior
   - Sort Order: 100
   - Active: ✓
3. Klik "Save"
```

### Edit Enhancement

```
1. Cari prompt yang ingin diedit
2. Klik icon pensil (Edit)
3. Update field yang diperlukan
4. Klik "Save"
```

### Nonaktifkan Enhancement

```
1. Toggle switch "Active" menjadi OFF
2. Prompt tidak akan muncul di frontend
3. Data tetap tersimpan di database
```

### Hapus Enhancement

```
1. Klik icon trash (Delete)
2. Konfirmasi penghapusan
3. Data akan dihapus permanent
```

## 🔍 Testing

### Test Backend Integration

1. Upload gambar di aplikasi
2. Pilih enhancement yang ada di database
3. Generate image
4. Cek logs di Supabase Edge Functions:
   - Harus ada log "Using database prompt for: [enhancement_type]"
   - Jika ada "No database prompt found", berarti fallback ke legacy

### Test Admin UI

1. Create new prompt
2. Edit existing prompt
3. Toggle active/inactive
4. Delete prompt
5. Verify changes reflected immediately

## 📊 Data Structure

### Enhancement Type Naming Convention

```
✅ Good:
- modern_minimalist
- scandinavian_style
- luxury_furniture
- business_formal

❌ Bad:
- ModernMinimalist (PascalCase)
- modern-minimalist (kebab-case)
- modern minimalist (spaces)
```

### Prompt Template Best Practices

```
✅ Good:
"Transform this interior into modern minimalist style with clean lines, 
neutral colors (whites, grays, beiges), minimal furniture, and uncluttered 
surfaces. Focus on functionality and simplicity."

❌ Bad:
"Make it modern" (too vague)
"Modern style" (not descriptive enough)
```

### Category Options

- `interior` - Interior design
- `exterior` - Exterior/architecture
- `fashion` - Fashion/clothing
- `furniture` - Furniture replacement
- `general` - General enhancements

## 🐛 Troubleshooting

### Error: "relation enhancement_prompts does not exist"

**Solution:** Migration belum dijalankan. Run migration dulu.

### Error: "permission denied for table enhancement_prompts"

**Solution:** 
1. Cek RLS policies sudah dibuat
2. Pastikan user memiliki role admin di table `profiles`

### Prompt tidak muncul di frontend

**Checklist:**
- [ ] `is_active = true`
- [ ] `enhancement_type` match dengan yang digunakan di code
- [ ] RLS policy allow SELECT untuk authenticated users

### Backend masih pakai legacy function

**Checklist:**
- [ ] `enhancement_type` di database match persis (case-sensitive)
- [ ] Prompt status `is_active = true`
- [ ] Cek logs untuk error messages

## 💡 Tips

1. **Sort Order**: Gunakan kelipatan 10 (10, 20, 30...) untuk mudah insert di tengah
2. **Testing**: Test prompt baru di staging dulu sebelum production
3. **Backup**: Export data sebelum bulk delete/update
4. **Naming**: Gunakan descriptive names yang mudah dipahami
5. **Prompts**: Semakin detail prompt, semakin baik hasil AI

## 📚 Next Steps

Setelah setup selesai:

1. ✅ Migrate existing enhancements dari hardcoded ke database
2. ✅ Test semua enhancement types
3. ✅ Update documentation untuk team
4. ⏳ Train admin users cara manage prompts
5. ⏳ Monitor performance dan user feedback
6. ⏳ Iterate dan improve prompts based on results

## 🆘 Need Help?

- Baca dokumentasi lengkap: `ENHANCEMENT_PROMPTS_SYSTEM.md`
- Cek example data di migration file
- Contact development team

---

**Status:** ✅ Ready to use
**Version:** 1.0.0
**Last Updated:** December 20, 2025

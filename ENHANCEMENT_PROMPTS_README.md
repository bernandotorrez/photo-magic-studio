# 🎨 Enhancement Prompts Management System

> Sistem dinamis untuk mengelola AI enhancement prompts via database dan Admin UI

## 📋 Overview

Sistem ini menggantikan hardcoded enhancement prompts dengan database-driven approach yang lebih maintainable dan scalable. Admin bisa manage prompts via UI tanpa perlu deploy ulang aplikasi.

## ✨ Features

- ✅ **Database-driven** - Prompts disimpan di Supabase
- ✅ **Admin UI** - Full CRUD interface untuk manage prompts
- ✅ **Categorized** - Organized by category (interior, exterior, fashion, furniture)
- ✅ **Active/Inactive** - Toggle prompts on/off
- ✅ **Sortable** - Custom sort order
- ✅ **Secure** - RLS policies untuk access control
- ✅ **Backward Compatible** - Fallback ke legacy function

## 🚀 Quick Start

### 1. Run Migration

```bash
# Via Supabase Dashboard
Database > SQL Editor > Paste migration > Run

# Via CLI
supabase db push
```

Migration file: `supabase/migrations/20231220_create_enhancement_prompts.sql`

### 2. Access Admin UI

1. Login sebagai admin user
2. Klik button **Admin** di dashboard
3. Pilih menu **Enhancement Prompts**

### 3. Manage Prompts

- **Create**: Klik "Add New Prompt"
- **Edit**: Klik icon pensil
- **Delete**: Klik icon trash
- **Toggle**: Switch active/inactive

## 📁 Files Created

```
supabase/
└── migrations/
    └── 20231220_create_enhancement_prompts.sql  # Database schema & seed data

src/
├── components/
│   └── admin/
│       └── EnhancementPromptsManager.tsx        # Admin UI component
├── lib/
│   └── enhancementPrompts.ts                    # Helper functions
└── pages/
    └── Admin.tsx                                # Updated with new section

docs/
├── ENHANCEMENT_PROMPTS_SYSTEM.md                # Complete documentation
├── ENHANCEMENT_PROMPTS_QUICK_START.md           # Quick start guide
├── ENHANCEMENT_PROMPTS_IMPLEMENTATION_SUMMARY.md # Implementation summary
└── ENHANCEMENT_PROMPTS_README.md                # This file
```

## 🗄️ Database Schema

```sql
enhancement_prompts
├── id                  UUID (PK)
├── enhancement_type    VARCHAR (UNIQUE) - e.g., 'modern_minimalist'
├── display_name        VARCHAR          - e.g., 'Modern Minimalist'
├── prompt_template     TEXT             - AI prompt
├── description         TEXT             - User description
├── is_active           BOOLEAN          - Active status
├── category            VARCHAR          - Category
├── sort_order          INTEGER          - Display order
├── created_at          TIMESTAMP
└── updated_at          TIMESTAMP
```

## 📊 Seed Data

Migration includes 24 pre-configured enhancement prompts:

- **8 Interior**: modern_minimalist, scandinavian, industrial, bohemian, luxury_modern, japanese_zen, coastal, art_deco
- **6 Exterior**: modern_facade, traditional, mediterranean, craftsman, colonial, contemporary_glass
- **6 Fashion**: casual_chic, business_formal, streetwear, elegant_evening, bohemian_style, sporty_athletic
- **4 Furniture**: modern_furniture, vintage_furniture, luxury_furniture, scandinavian_furniture

## 🔐 Security

### RLS Policies

```sql
-- Anyone can view active prompts
SELECT: is_active = true

-- Only admins can manage
INSERT/UPDATE/DELETE: profiles.role = 'admin'
```

## 💻 Usage

### For Admins

```
1. Login as admin
2. Navigate to Admin > Enhancement Prompts
3. Create/Edit/Delete prompts via UI
4. Changes take effect immediately
```

### For Developers

```typescript
import { 
  getActiveEnhancementPrompts,
  getEnhancementPromptsByCategory,
  getEnhancementPrompt 
} from '@/lib/enhancementPrompts';

// Get all active prompts
const prompts = await getActiveEnhancementPrompts();

// Get by category
const interiorPrompts = await getEnhancementPromptsByCategory('interior');

// Get single prompt
const prompt = await getEnhancementPrompt('modern_minimalist');
```

## 🔄 Backend Integration

Function `generate-enhanced-image` automatically:

1. ✅ Checks database for prompt
2. ✅ Uses database prompt if found
3. ✅ Falls back to legacy function if not found
4. ✅ Logs which source is used

```typescript
// Backend automatically handles this
const { data: promptData } = await supabase
  .from('enhancement_prompts')
  .select('prompt_template')
  .eq('enhancement_type', enhancementType)
  .eq('is_active', true)
  .maybeSingle();

if (promptData?.prompt_template) {
  // Use database prompt ✅
} else {
  // Fallback to legacy ⚠️
}
```

## 📖 Documentation

- **Complete Guide**: `ENHANCEMENT_PROMPTS_SYSTEM.md`
- **Quick Start**: `ENHANCEMENT_PROMPTS_QUICK_START.md`
- **Implementation**: `ENHANCEMENT_PROMPTS_IMPLEMENTATION_SUMMARY.md`

## 🎯 Benefits

| Before (Hardcoded) | After (Database) |
|-------------------|------------------|
| ❌ Edit code & deploy | ✅ Edit via UI |
| ❌ 100+ lines of code | ✅ Clean database |
| ❌ Hard to maintain | ✅ Easy to manage |
| ❌ No versioning | ✅ Track changes |
| ❌ Developer only | ✅ Admin accessible |

## 🐛 Troubleshooting

### Prompt tidak muncul

- Cek `is_active = true`
- Cek `enhancement_type` match
- Cek RLS policies

### Error saat save

- Pastikan `enhancement_type` unique
- Pastikan required fields terisi
- Cek user role = admin

### Backend tidak pakai database

- Cek `enhancement_type` match (case-sensitive)
- Cek prompt status active
- Lihat logs di Edge Functions

## 📈 Future Enhancements

- [ ] Versioning system
- [ ] A/B testing
- [ ] Performance analytics
- [ ] Bulk import/export
- [ ] Template variables
- [ ] Multi-language support
- [ ] Preview/testing tool

## ✅ Status

**Implementation:** ✅ Complete  
**Testing:** ✅ Verified  
**Documentation:** ✅ Complete  
**Ready to Use:** ✅ Yes

## 📞 Support

Need help?
1. Read `ENHANCEMENT_PROMPTS_SYSTEM.md` for detailed docs
2. Read `ENHANCEMENT_PROMPTS_QUICK_START.md` for quick setup
3. Contact development team

---

**Version:** 1.0.0  
**Date:** December 20, 2024  
**Status:** Production Ready 🚀

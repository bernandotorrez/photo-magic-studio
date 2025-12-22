# Quick Checklist: Fix Admin Stats Dynamic Tiers

## Masalah
Admin Dashboard masih menampilkan "Free: 5 | Basic: 1 | Pro: 0" (hardcoded)

## Checklist Perbaikan

### ✅ Step 1: Pastikan Tabel subscription_tiers Ada
Jalankan di **Supabase SQL Editor**:
```sql
SELECT * FROM subscription_tiers ORDER BY display_order;
```

**Jika error "relation does not exist":**
- [ ] Jalankan file `RUN_THIS_SQL_SUBSCRIPTION_TIERS.sql`
- [ ] Tunggu sampai selesai
- [ ] Cek lagi dengan query di atas

**Jika berhasil, Anda akan melihat:**
```
tier_id | tier_name | display_order | tokens | bonus_tokens | ...
--------|-----------|---------------|--------|--------------|----
free    | Free      | 1             | 5      | 0            | ...
basic   | Basic     | 2             | 40     | 0            | ...
basic_plus | Basic+ | 3             | 50     | 2            | ...
pro     | Pro       | 4             | 75     | 5            | ...
pro_max | Pro Max   | 5             | 100    | 10           | ...
```

### ✅ Step 2: Fix RLS Policy (Jika Perlu)
Jalankan file `CHECK_SUBSCRIPTION_TIERS_TABLE.sql` untuk:
- [ ] Cek RLS policies
- [ ] Fix permissions
- [ ] Grant SELECT ke authenticated & anon

### ✅ Step 3: Deploy Frontend
```bash
git add .
git commit -m "fix: dynamic subscription tier stats with console logs"
git push
```

### ✅ Step 4: Test di Browser
1. [ ] Buka Admin Dashboard
2. [ ] Buka Developer Tools (F12) → Console tab
3. [ ] Refresh halaman
4. [ ] Lihat console logs:

**Expected logs:**
```
Fetching subscription tiers...
Tiers data: [{tier_id: 'free', tier_name: 'Free'}, ...]
Counting users for tier: Free (free)
  Count: 5, Error: null
Counting users for tier: Basic (basic)
  Count: 1, Error: null
...
Final tier counts: [{tier_id: 'free', tier_name: 'Free', user_count: 5}, ...]
```

5. [ ] Lihat card "Total Users"
6. [ ] Pastikan description berubah dari "Free: 5 | Basic: 1 | Pro: 0" menjadi "Free: 5 | Basic: 1 | Basic+: 2 | Pro: 1 | Pro Max: 1" (sesuai data Anda)

## Troubleshooting

### ❌ Console log: "Tiers error: {...}"
**Penyebab:** RLS policy tidak mengizinkan read

**Solusi:**
1. Jalankan `CHECK_SUBSCRIPTION_TIERS_TABLE.sql`
2. Pastikan policy "Anyone can read subscription tiers" ada
3. Refresh browser

### ❌ Console log: "No tiers found, setting empty array"
**Penyebab:** Tabel kosong atau semua tier `is_active = false`

**Solusi:**
```sql
-- Cek data
SELECT * FROM subscription_tiers;

-- Jika kosong, jalankan INSERT dari RUN_THIS_SQL_SUBSCRIPTION_TIERS.sql

-- Jika ada tapi is_active = false
UPDATE subscription_tiers SET is_active = true;
```

### ❌ Tier counts semua 0
**Penyebab:** `profiles.subscription_plan` tidak match dengan `subscription_tiers.tier_id`

**Solusi:**
```sql
-- Cek nilai subscription_plan
SELECT DISTINCT subscription_plan, COUNT(*) 
FROM profiles 
GROUP BY subscription_plan;

-- Update jika perlu
UPDATE profiles 
SET subscription_plan = 'free' 
WHERE subscription_plan IS NULL;
```

### ❌ Text masih hardcoded setelah deploy
**Penyebab:** Browser cache

**Solusi:**
1. Hard refresh: Ctrl+Shift+R (Windows) atau Cmd+Shift+R (Mac)
2. Clear browser cache
3. Buka incognito/private window

## Expected Result

**Sebelum:**
```
Total Users: 6
Free: 5 | Basic: 1 | Pro: 0
```

**Sesudah (Success):**
```
Total Users: 6
Free: 5 | Basic: 1 | Basic+: 2 | Pro: 1 | Pro Max: 1
```

**Sesudah (Jika Fetch Gagal):**
```
Total Users: 6
Loading tier data...
```

(Angka sesuai dengan data real di database Anda)

**Jika melihat "Loading tier data..."**, berarti ada masalah:
- Tabel `subscription_tiers` belum dibuat
- RLS policy tidak mengizinkan read
- Cek console browser untuk error details

## Files Involved
- ✅ `src/components/admin/AdminStats.tsx` - Updated
- ✅ `RUN_THIS_SQL_SUBSCRIPTION_TIERS.sql` - Create table
- ✅ `CHECK_SUBSCRIPTION_TIERS_TABLE.sql` - Check & fix
- ✅ `FIX_ADMIN_STATS_DYNAMIC_TIERS.md` - Documentation

## Next Steps
Setelah semua checklist ✅:
1. Remove console.log dari `AdminStats.tsx` (optional, untuk production)
2. Test dengan menambah tier baru → otomatis muncul di stats
3. Done! 🎉

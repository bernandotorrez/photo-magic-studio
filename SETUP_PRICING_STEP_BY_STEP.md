# Setup Pricing Tiers - Step by Step

## Error yang Anda Alami
```
ERROR: 42P13: cannot change return type of existing function
HINT: Use DROP FUNCTION get_subscription_tier(text) first.
```

Ini terjadi karena function sudah ada dengan struktur berbeda.

## Solusi: Ikuti Langkah Berikut

### STEP 1: Cek Status Database

1. Buka **Supabase Dashboard**
2. Klik **SQL Editor**
3. Copy-paste isi file `CHECK_SUBSCRIPTION_TIERS.sql`
4. Klik **Run** (atau Ctrl+Enter)

**Lihat hasilnya:**

#### Scenario A: Tabel Sudah Ada
```
table_exists: true
total_tiers: 5
(menampilkan data Free, Basic, Basic+, Pro, Pro Max)
```
→ **Lanjut ke STEP 2A**

#### Scenario B: Tabel Belum Ada
```
table_exists: false
ERROR: relation "subscription_tiers" does not exist
```
→ **Lanjut ke STEP 2B**

---

### STEP 2A: Jika Tabel Sudah Ada (Fix Function)

1. Di SQL Editor yang sama
2. **Clear** query sebelumnya
3. Copy-paste isi file `FIX_SUBSCRIPTION_TIERS_FUNCTION.sql`
4. Klik **Run**
5. Pastikan semua query success (hijau)
6. **Lanjut ke STEP 3**

---

### STEP 2B: Jika Tabel Belum Ada (Create All)

1. Di SQL Editor yang sama
2. **Clear** query sebelumnya
3. Copy-paste isi file `RUN_THIS_SQL_SUBSCRIPTION_TIERS.sql` (yang sudah diupdate)
4. Klik **Run**
5. Pastikan semua query success (hijau)
6. **Lanjut ke STEP 3**

---

### STEP 3: Verify Setup

Jalankan query test ini:

```sql
-- Test 1: Cek data
SELECT tier_id, tier_name, price, tokens, is_active 
FROM subscription_tiers 
ORDER BY display_order;

-- Test 2: Test function
SELECT * FROM get_active_subscription_tiers();
```

**Expected Result:**
```
tier_id    | tier_name | price   | tokens | is_active
-----------+-----------+---------+--------+-----------
free       | Free      | 0       | 5      | true
basic      | Basic     | 30000   | 40     | true
basic_plus | Basic+    | 50000   | 50     | true
pro        | Pro       | 75000   | 75     | true
pro_max    | Pro Max   | 100000  | 100    | true
```

Jika muncul data seperti di atas → **SUCCESS!** Lanjut ke STEP 4

---

### STEP 4: Test di Browser

1. Buka aplikasi di browser
2. Pergi ke halaman **Index** (landing page) `/`
3. Scroll ke bagian **"Pilih Paket Anda"**
4. Pricing cards seharusnya muncul dengan data dari database

**Yang Seharusnya Muncul:**
```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│   Free   │  Basic   │ Basic+   │   Pro    │ Pro Max  │
│          │          │ PALING   │          │          │
│          │          │ POPULER  │          │          │
├──────────┼──────────┼──────────┼──────────┼──────────┤
│ Rp 0     │ Rp 30k   │ Rp 50k   │ Rp 75k   │ Rp 100k  │
│ /bulan   │ /bulan   │ /bulan   │ /bulan   │ /bulan   │
│          │          │          │          │          │
│ 5 gen    │ 40 gen   │ 50 gen   │ 75 gen   │ 100 gen  │
│          │          │ +2 bonus │ +5 bonus │ +10 bonus│
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

---

## Troubleshooting

### Masih Muncul "Pricing plans tidak tersedia"?

1. **Buka Developer Console** (F12)
2. Lihat tab **Console**
3. Cari error message

#### Error: "function get_active_subscription_tiers does not exist"
**Solusi:** Jalankan ulang `FIX_SUBSCRIPTION_TIERS_FUNCTION.sql`

#### Error: "permission denied"
**Solusi:** Jalankan ini di SQL Editor:
```sql
GRANT EXECUTE ON FUNCTION get_active_subscription_tiers 
TO authenticated, anon, service_role;
```

#### Error: "relation subscription_tiers does not exist"
**Solusi:** Jalankan `RUN_THIS_SQL_SUBSCRIPTION_TIERS.sql`

#### Tidak ada error tapi data kosong
**Solusi:** Cek apakah ada data aktif:
```sql
SELECT * FROM subscription_tiers WHERE is_active = true;
```

Jika kosong, aktifkan:
```sql
UPDATE subscription_tiers SET is_active = true;
```

---

## Quick Reference

### File SQL yang Tersedia:

1. **CHECK_SUBSCRIPTION_TIERS.sql**
   - Untuk cek status database
   - Jalankan ini dulu!

2. **FIX_SUBSCRIPTION_TIERS_FUNCTION.sql**
   - Untuk fix function yang conflict
   - Gunakan jika tabel sudah ada

3. **RUN_THIS_SQL_SUBSCRIPTION_TIERS.sql**
   - Setup lengkap dari awal
   - Gunakan jika tabel belum ada

### Command Penting:

```sql
-- Drop function jika conflict
DROP FUNCTION IF EXISTS get_subscription_tier(TEXT);
DROP FUNCTION IF EXISTS get_active_subscription_tiers();

-- Test function
SELECT * FROM get_active_subscription_tiers();

-- Lihat data
SELECT * FROM subscription_tiers ORDER BY display_order;

-- Aktifkan semua tiers
UPDATE subscription_tiers SET is_active = true;
```

---

## Summary

1. ✅ Jalankan `CHECK_SUBSCRIPTION_TIERS.sql` untuk cek status
2. ✅ Pilih file SQL yang sesuai (FIX atau RUN)
3. ✅ Jalankan SQL dan pastikan success
4. ✅ Test dengan query SELECT
5. ✅ Refresh browser dan cek halaman Index
6. ✅ Pricing cards seharusnya muncul!

Jika masih ada masalah, lihat `TROUBLESHOOTING_PRICING.md` untuk panduan lengkap.

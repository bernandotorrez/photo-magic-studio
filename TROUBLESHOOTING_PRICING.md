# Troubleshooting - Pricing Plans Tidak Muncul

## Problem
Halaman Index menampilkan "Pricing plans tidak tersedia saat ini" padahal data sudah ada di database.

## Penyebab Umum

### 1. Migration Belum Dijalankan
Tabel `subscription_tiers` dan function `get_active_subscription_tiers()` belum dibuat di Supabase.

**Solusi:**
1. Buka Supabase Dashboard
2. Pergi ke SQL Editor
3. Jalankan file `RUN_THIS_SQL_SUBSCRIPTION_TIERS.sql`
4. Pastikan tidak ada error
5. Refresh halaman Index

### 2. RLS Policy Terlalu Ketat
Row Level Security (RLS) policy mungkin memblokir akses anonymous user.

**Cek:**
```sql
-- Cek apakah RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'subscription_tiers';

-- Cek policies
SELECT * FROM pg_policies 
WHERE tablename = 'subscription_tiers';
```

**Solusi:**
Pastikan policy "Anyone can read active subscription tiers" ada dan mengizinkan `anon` role:
```sql
CREATE POLICY "Anyone can read active subscription tiers"
  ON subscription_tiers FOR SELECT
  TO authenticated, anon
  USING (is_active = true);
```

### 3. Data Tidak Ada atau Tidak Aktif
Semua tiers mungkin di-set `is_active = false`.

**Cek:**
```sql
SELECT tier_id, tier_name, is_active 
FROM subscription_tiers;
```

**Solusi:**
Aktifkan minimal satu tier:
```sql
UPDATE subscription_tiers 
SET is_active = true 
WHERE tier_id IN ('free', 'basic', 'pro');
```

### 4. Function Tidak Bisa Diakses
Function `get_active_subscription_tiers()` tidak memiliki permission yang benar.

**Cek:**
```sql
-- Test function
SELECT * FROM get_active_subscription_tiers();
```

**Solusi:**
Grant permission:
```sql
GRANT EXECUTE ON FUNCTION get_active_subscription_tiers 
TO authenticated, anon, service_role;
```

### 5. CORS atau Network Issue
Browser memblokir request ke Supabase.

**Cek:**
1. Buka Developer Console (F12)
2. Lihat tab Network
3. Cari request ke Supabase
4. Lihat error message

**Solusi:**
- Pastikan Supabase URL dan Anon Key benar di `.env`
- Cek apakah Supabase project masih aktif
- Coba clear browser cache

## Debugging Steps

### Step 1: Cek Console Browser
```javascript
// Buka halaman Index
// Tekan F12 untuk Developer Tools
// Lihat tab Console
// Cari error message atau log:
// "Fetched pricing plans: [...]"
// "RPC Error: ..."
```

### Step 2: Test Function di Supabase
```sql
-- Di Supabase SQL Editor
SELECT * FROM get_active_subscription_tiers();

-- Jika error "function does not exist"
-- Jalankan RUN_THIS_SQL_SUBSCRIPTION_TIERS.sql

-- Jika error "permission denied"
-- Jalankan GRANT commands
```

### Step 3: Test Direct Query
```sql
-- Bypass function, query langsung
SELECT * FROM subscription_tiers 
WHERE is_active = true 
ORDER BY display_order;

-- Jika berhasil tapi function gagal
-- Berarti masalah di function permission
```

### Step 4: Cek Environment Variables
```bash
# File: .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Pastikan tidak ada typo
# Pastikan key masih valid
```

### Step 5: Test dengan Postman/cURL
```bash
# Test RPC call langsung
curl -X POST 'https://your-project.supabase.co/rest/v1/rpc/get_active_subscription_tiers' \
  -H "apikey: your-anon-key" \
  -H "Content-Type: application/json"

# Jika berhasil return data
# Berarti masalah di frontend code
```

## Quick Fix

Jika masih tidak bisa, gunakan fallback hardcoded data sementara:

```typescript
// src/pages/Index.tsx
const fetchPricingPlans = async () => {
  try {
    const { data, error } = await supabase
      .rpc('get_active_subscription_tiers');

    if (error) throw error;
    setPricingPlans(data || []);
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    
    // FALLBACK: Use hardcoded data
    setPricingPlans([
      {
        id: '1',
        tier_id: 'free',
        tier_name: 'Free',
        display_order: 1,
        price: 0,
        tokens: 5,
        bonus_tokens: 0,
        description: 'Untuk mencoba fitur dasar',
        features: ['5x generate/bulan', 'History 7 hari', 'Basic support'],
        limitations: [],
        api_rate_limit: 0,
        is_popular: false,
        color: 'text-gray-500',
        bg_color: 'bg-gray-500/10',
        icon: 'Sparkles'
      },
      // ... more tiers
    ]);
  } finally {
    setLoading(false);
  }
};
```

## Verification Checklist

✅ Tabel `subscription_tiers` sudah dibuat
✅ Data tiers sudah di-insert
✅ Function `get_active_subscription_tiers()` sudah dibuat
✅ RLS policies sudah dibuat
✅ Permissions sudah di-grant
✅ Environment variables benar
✅ Browser console tidak ada error
✅ Network request berhasil (status 200)

## Common Error Messages

### "function get_active_subscription_tiers does not exist"
**Solusi:** Jalankan `RUN_THIS_SQL_SUBSCRIPTION_TIERS.sql`

### "permission denied for function get_active_subscription_tiers"
**Solusi:** 
```sql
GRANT EXECUTE ON FUNCTION get_active_subscription_tiers 
TO authenticated, anon;
```

### "relation subscription_tiers does not exist"
**Solusi:** Jalankan CREATE TABLE di `RUN_THIS_SQL_SUBSCRIPTION_TIERS.sql`

### "RPC Error: {...}"
**Solusi:** Cek detail error di console, biasanya permission atau data issue

### Network Error / CORS
**Solusi:** 
- Cek Supabase URL dan key
- Cek internet connection
- Cek Supabase project status

## Support

Jika masih bermasalah setelah mengikuti semua langkah:
1. Screenshot error di console
2. Screenshot hasil query di Supabase SQL Editor
3. Cek file `.env` (jangan share key!)
4. Hubungi support dengan informasi di atas

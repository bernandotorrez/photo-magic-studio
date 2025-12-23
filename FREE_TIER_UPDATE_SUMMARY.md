# 🔄 Free Tier Update: 5 Token → 2 Token

## 📋 Problem

Free tier masih menampilkan **"5 token per bulan"** di halaman Index dan Pricing, padahal sudah diubah menjadi **2 token per bulan**.

## 🔍 Root Cause

Data pricing di frontend diambil dari **database** via RPC function `get_active_subscription_tiers()`, bukan hardcoded. Jadi kalau masih tampil "5 token", berarti **data di database belum diupdate**.

## ✅ Solution

Update data di tabel `subscription_tiers` untuk tier Free.

### SQL Query:

```sql
-- Update subscription_tiers table
UPDATE subscription_tiers
SET 
  tokens = 2,
  features = '["2 token per bulan", "Akses fitur dasar", "Support email", "Bisa top-up token tambahan"]'::jsonb,
  updated_at = NOW()
WHERE tier_id = 'free';
```

## 📁 Files Updated

1. ✅ **`UPDATE_FREE_TIER_TO_2_TOKENS.sql`** - SQL query untuk update database
2. ✅ **`RUN_THIS_SQL_SUBSCRIPTION_TIERS.sql`** - Updated untuk future reference

## 🚀 Deployment Steps

### 1. Update Database

Jalankan SQL di **Supabase SQL Editor**:

```bash
# Copy isi file UPDATE_FREE_TIER_TO_2_TOKENS.sql
# Paste di Supabase SQL Editor
# Run query
```

### 2. Verify Update

```sql
-- Cek data tier Free
SELECT tier_id, tier_name, tokens, features
FROM subscription_tiers
WHERE tier_id = 'free';

-- Expected result:
-- tier_id | tier_name | tokens | features
-- --------|-----------|--------|----------
-- free    | Free      | 2      | ["2 token per bulan", ...]
```

### 3. Test Frontend

1. Refresh halaman **Index** (`/`)
2. Refresh halaman **Pricing** (`/pricing`)
3. Verify bahwa Free tier menampilkan **"2 token per bulan"**

## 📊 Before vs After

### Before:
```json
{
  "tier_id": "free",
  "tier_name": "Free",
  "tokens": 5,
  "features": ["5 token per bulan", ...]
}
```

### After:
```json
{
  "tier_id": "free",
  "tier_name": "Free",
  "tokens": 2,
  "features": ["2 token per bulan", ...]
}
```

## 🎯 Impact

### Frontend Display:

**Index.tsx:**
```typescript
// Data diambil dari database via RPC
const { data } = await supabase.rpc('get_active_subscription_tiers');

// Otomatis menampilkan:
{plan.tokens} generate/bulan  // → "2 generate/bulan"
```

**PricingNew.tsx:**
```typescript
// Data diambil dari database via RPC
const { data } = await supabase.rpc('get_active_subscription_tiers');

// Otomatis menampilkan features dari database
{plan.features.map(feature => ...)}  // → "2 token per bulan"
```

## ⚠️ Important Notes

1. **Tidak mengubah token user yang sudah ada** - Hanya update data tier definition
2. **User baru** yang daftar akan dapat 2 token per bulan
3. **Frontend otomatis update** setelah database diupdate (tidak perlu deploy frontend)
4. **Cache** - Mungkin perlu refresh browser (Ctrl+F5) untuk clear cache

## ✅ Verification Checklist

- [ ] SQL query berhasil dijalankan di Supabase
- [ ] Verify data di database: `SELECT * FROM subscription_tiers WHERE tier_id = 'free'`
- [ ] Test RPC function: `SELECT * FROM get_active_subscription_tiers() WHERE tier_id = 'free'`
- [ ] Refresh halaman Index - tampil "2 token per bulan" ✅
- [ ] Refresh halaman Pricing - tampil "2 token per bulan" ✅
- [ ] Clear browser cache jika masih tampil "5 token"

## 🎉 Done!

Setelah SQL dijalankan, frontend akan otomatis menampilkan **"2 token per bulan"** untuk Free tier.

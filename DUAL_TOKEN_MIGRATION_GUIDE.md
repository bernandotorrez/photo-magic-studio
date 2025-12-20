# Dual Token System - Migration Guide

## Overview
Sistem token telah diupgrade dari single token system ke dual token system untuk memberikan fleksibilitas lebih kepada user.

## Perbedaan System

### Old System (Single Token)
```
- monthly_generate_limit: Batas generate per bulan
- current_month_generates: Jumlah generate yang sudah digunakan
- Semua token reset setiap bulan
- Tidak ada token yang permanen
```

### New System (Dual Token)
```
- subscription_tokens: Token dari paket bulanan (expire 30 hari)
- purchased_tokens: Token dari top-up (tidak expire)
- subscription_expires_at: Tanggal expiry token bulanan
- Token top-up tidak akan hangus
```

## Keuntungan Dual Token System

### 1. Fairness
- Token yang dibeli dengan top-up tidak akan hangus
- User tidak rugi jika tidak menggunakan semua token dalam sebulan

### 2. Flexibility
- User bisa top-up kapan saja tanpa khawatir token hangus
- Token bulanan dan top-up digunakan secara terpisah

### 3. Transparency
- User bisa melihat berapa token bulanan dan berapa token top-up
- Jelas mana yang akan expire dan mana yang permanen

## Migration Steps

### Step 1: Add Columns to Database

Jalankan SQL ini di Supabase SQL Editor:

```sql
-- File: ADD_DUAL_TOKEN_COLUMNS.sql

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_tokens INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS purchased_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days');

-- Migrate existing data
UPDATE profiles 
SET subscription_tokens = GREATEST(0, monthly_generate_limit - current_month_generates)
WHERE subscription_tokens IS NULL OR subscription_tokens = 5;

UPDATE profiles 
SET subscription_expires_at = NOW() + INTERVAL '30 days'
WHERE subscription_expires_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_subscription_expires_at 
ON profiles(subscription_expires_at);
```

### Step 2: Update Frontend Code

Semua file berikut sudah diupdate:

**Components:**
- ✅ `src/components/TokenAlert.tsx` - Display dual token info
- ✅ `src/components/dashboard/EnhancementOptions.tsx` - Check dual token
- ✅ `src/components/dashboard/ImageUploader.tsx` - Use dual token interface
- ✅ `src/components/dashboard/UsageStats.tsx` - Display dual token stats

**Pages:**
- ✅ `src/pages/DashboardNew.tsx` - Show dual token
- ✅ `src/pages/DashboardStats.tsx` - Show dual token
- ✅ `src/pages/AiPhotographer.tsx` - Use dual token
- ✅ `src/pages/InteriorDesign.tsx` - Use dual token
- ✅ `src/pages/ExteriorDesign.tsx` - Use dual token

### Step 3: Update Backend Functions

Pastikan edge functions sudah menggunakan `deduct_tokens_dual()`:

```sql
-- Function untuk deduct token dengan prioritas
CREATE OR REPLACE FUNCTION deduct_tokens_dual(
  p_user_id UUID,
  p_amount INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription_tokens INTEGER;
  v_purchased_tokens INTEGER;
  v_subscription_expires_at TIMESTAMPTZ;
  v_deducted_from_subscription INTEGER := 0;
  v_deducted_from_purchased INTEGER := 0;
BEGIN
  -- Get current tokens
  SELECT subscription_tokens, purchased_tokens, subscription_expires_at
  INTO v_subscription_tokens, v_purchased_tokens, v_subscription_expires_at
  FROM profiles
  WHERE user_id = p_user_id;

  -- Check if subscription tokens are expired
  IF v_subscription_expires_at < NOW() THEN
    v_subscription_tokens := 0;
  END IF;

  -- Calculate total available
  IF (v_subscription_tokens + v_purchased_tokens) < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient tokens'
    );
  END IF;

  -- Deduct from subscription tokens first (they expire)
  IF v_subscription_tokens >= p_amount THEN
    v_deducted_from_subscription := p_amount;
  ELSE
    v_deducted_from_subscription := v_subscription_tokens;
    v_deducted_from_purchased := p_amount - v_subscription_tokens;
  END IF;

  -- Update tokens
  UPDATE profiles
  SET 
    subscription_tokens = subscription_tokens - v_deducted_from_subscription,
    purchased_tokens = purchased_tokens - v_deducted_from_purchased
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'deducted_from_subscription', v_deducted_from_subscription,
    'deducted_from_purchased', v_deducted_from_purchased,
    'remaining_subscription', v_subscription_tokens - v_deducted_from_subscription,
    'remaining_purchased', v_purchased_tokens - v_deducted_from_purchased
  );
END;
$$;
```

## Token Deduction Priority

Sistem akan mengurangi token dengan prioritas:

1. **Subscription Tokens First** (yang akan expire)
2. **Purchased Tokens Second** (yang permanen)

Contoh:
```
User punya:
- 10 subscription tokens (expire 5 hari lagi)
- 50 purchased tokens (tidak expire)

Generate 1x:
- Deduct 1 dari subscription tokens
- Sisa: 9 subscription + 50 purchased

Generate 15x:
- Deduct 10 dari subscription tokens (habis)
- Deduct 5 dari purchased tokens
- Sisa: 0 subscription + 45 purchased
```

## Display Format

### Token Alert
```
┌─────────────────────────────────────────┐
│ ⚠️ Token Hampir Habis                   │
├─────────────────────────────────────────┤
│ Sisa token Anda: 10 token bulanan +     │
│ 5 token top-up = 15 total               │
│                                         │
│ [Top Up Token]                          │
└─────────────────────────────────────────┘
```

### Usage Stats
```
┌─────────────────────────────────────────┐
│ 💎 Token Bulanan                        │
│ 40 / 50 token                           │
│ Expire: 25 hari lagi                    │
├─────────────────────────────────────────┤
│ 🎁 Token Top-Up                         │
│ 100 token                               │
│ Tidak akan hangus                       │
└─────────────────────────────────────────┘
```

### Enhancement Options
```
Sisa token: 140 token
(40 bulanan + 100 top-up)
```

## Testing Checklist

### Database
- ✅ Column `subscription_tokens` ada di profiles
- ✅ Column `purchased_tokens` ada di profiles
- ✅ Column `subscription_expires_at` ada di profiles
- ✅ Function `deduct_tokens_dual()` berfungsi
- ✅ Function `add_subscription_tokens()` berfungsi
- ✅ Function `add_purchased_tokens()` berfungsi

### Frontend
- ✅ TokenAlert menampilkan dual token info
- ✅ UsageStats menampilkan dual token dengan expiry
- ✅ EnhancementOptions check dual token sebelum generate
- ✅ Tidak ada error "mencapai batas generate"
- ✅ Generate berhasil jika ada token

### Payment Flow
- ✅ Top-up menambah `purchased_tokens`
- ✅ Subscription menambah `subscription_tokens`
- ✅ Bonus tokens ditambahkan ke tipe yang sesuai
- ✅ Expiry date di-set untuk subscription tokens

## Troubleshooting

### Error: "column subscription_tokens does not exist"
**Solusi:** Jalankan `ADD_DUAL_TOKEN_COLUMNS.sql`

### Error: "Anda sudah mencapai batas generate"
**Solusi:** 
1. Cek apakah column sudah ada di database
2. Cek apakah frontend sudah menggunakan dual token interface
3. Clear browser cache dan reload

### Token tidak berkurang setelah generate
**Solusi:** 
1. Cek apakah edge function menggunakan `deduct_tokens_dual()`
2. Cek console untuk error
3. Verify function di Supabase

### Subscription tokens tidak expire
**Solusi:**
1. Cek `subscription_expires_at` di database
2. Pastikan ada cron job atau trigger untuk cleanup
3. Manual cleanup dengan SQL:
```sql
UPDATE profiles 
SET subscription_tokens = 0 
WHERE subscription_expires_at < NOW() 
AND subscription_tokens > 0;
```

## Backward Compatibility

Column lama (`monthly_generate_limit`, `current_month_generates`) masih ada untuk backward compatibility, tapi tidak digunakan lagi di frontend baru.

Jika ada code lama yang masih menggunakan column tersebut, akan tetap berfungsi tapi tidak akan sync dengan dual token system.

## Rollback Plan

Jika perlu rollback ke system lama:

```sql
-- Restore old system
UPDATE profiles 
SET current_month_generates = monthly_generate_limit - subscription_tokens
WHERE subscription_tokens IS NOT NULL;

-- Revert frontend code to use old interface
-- (Restore from git history)
```

## Support

Jika ada masalah setelah migration:
1. Cek `TROUBLESHOOTING_PRICING.md`
2. Verify database dengan `CHECK_SUBSCRIPTION_TIERS.sql`
3. Check console browser untuk error
4. Hubungi support dengan screenshot error

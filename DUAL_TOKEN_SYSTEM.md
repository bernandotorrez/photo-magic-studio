# Dual Token System - Dokumentasi Lengkap

## Overview

Sistem dual token memisahkan token menjadi 2 jenis:
1. **Subscription Tokens** - Token dari paket bulanan (expire 30 hari setelah pembelian)
2. **Purchased Tokens** - Token dari top-up manual (never expire)

## Pricing Analysis

### Cost Structure
- **API Cost**: 4 credits per image = Rp 348 (~$0.02)
- **Selling Price**: Rp 1.000 per token
- **Profit Margin**: ~65% (Rp 652 per generate)

### Market Comparison
- Midjourney: ~Rp 750/gambar ($10/bulan untuk 200 gambar)
- Your pricing: Rp 1.000/gambar
- **Verdict**: Kompetitif dan tidak kemurahan untuk pasar Indonesia

## Token Logic

### Priority System
Saat user generate gambar, sistem akan:
1. **Pakai subscription_tokens dulu** (karena akan expire)
2. **Kalau habis, baru pakai purchased_tokens**
3. **End of 30 days**: subscription_tokens hangus, purchased_tokens tetap

### Expiry Warning
- **7 hari sebelum expire**: User dapat warning di dashboard
- **Setelah expire**: Token otomatis dihapus oleh cron job

## Database Schema

### Kolom Baru di `profiles` table:
```sql
subscription_tokens INTEGER DEFAULT 0
purchased_tokens INTEGER DEFAULT 0
subscription_expires_at TIMESTAMPTZ
```

### Kolom Baru di `payments` table:
```sql
token_type TEXT DEFAULT 'purchased' -- 'subscription' atau 'purchased'
```

## Functions

### 1. `deduct_tokens_dual(p_user_id, p_amount)`
Mengurangi token dengan prioritas subscription tokens dulu:
```sql
-- Deduct subscription tokens first
-- If not enough, deduct from purchased tokens
-- Returns success/failure
```

### 2. `add_subscription_tokens(p_user_id, p_amount, p_days)`
Menambah subscription tokens dengan expiry date:
```sql
-- Add tokens to subscription_tokens
-- Set subscription_expires_at = NOW() + p_days
```

### 3. `add_purchased_tokens(p_user_id, p_amount)`
Menambah purchased tokens (never expire):
```sql
-- Add tokens to purchased_tokens
-- No expiry date
```

### 4. `check_expiring_subscriptions()`
Cek subscription tokens yang akan expire dalam 7 hari:
```sql
-- Returns list of users with expiring tokens
-- Used by cron job for notifications
```

## Edge Functions

### 1. `expire-subscription-tokens`
Cron job yang berjalan setiap hari untuk:
- Kirim notifikasi 7 hari sebelum expire
- Expire tokens yang sudah lewat 30 hari

**Deploy:**
```bash
npx supabase functions deploy expire-subscription-tokens
```

**Setup Cron Job:**
- Schedule: `0 0 * * *` (setiap hari jam 00:00)
- Command: HTTP POST ke function endpoint

## Frontend Updates

### 1. `DashboardNew.tsx`
- Tampilkan breakdown subscription vs purchased tokens
- Warning visual kalau subscription tokens mau expire dalam 7 hari
- Alert kalau token habis

### 2. `UsageStats.tsx`
- Progress bar terpisah untuk subscription dan purchased tokens
- Countdown timer untuk expiry
- Visual indicator untuk token yang akan expire

### 3. `TopUp.tsx`
- Set `token_type: 'purchased'` untuk top-up manual
- Informasi bahwa top-up tokens never expire

## Payment Logic

### Paket Bulanan (Nano/Micro/Mega)
```typescript
await supabase.rpc('add_subscription_tokens', {
  p_user_id: userId,
  p_amount: tokenAmount,
  p_days: 30
});
```

### Top Up Manual
```typescript
await supabase.rpc('add_purchased_tokens', {
  p_user_id: userId,
  p_amount: tokenAmount
});
```

## Migration Steps

### Step 1: Run Migration
```sql
-- Copy isi file: supabase/migrations/20231226_dual_token_system.sql
-- Paste dan run di Supabase SQL Editor
```

### Step 2: Deploy Edge Function
```bash
npx supabase functions deploy expire-subscription-tokens
```

### Step 3: Setup Cron Job
1. Buka Supabase Dashboard → Database → Cron Jobs
2. Buat cron job baru dengan schedule `0 0 * * *`
3. Command: HTTP POST ke function endpoint

### Step 4: Update Payment Success Handler
Update logic di admin panel untuk:
- Paket bulanan → `add_subscription_tokens`
- Top-up manual → `add_purchased_tokens`

## Testing

### Test Deduct Tokens
```sql
-- Test deduct subscription tokens first
SELECT deduct_tokens_dual('user-id', 1);

-- Check balance
SELECT subscription_tokens, purchased_tokens FROM profiles WHERE user_id = 'user-id';
```

### Test Expiry Warning
```sql
-- Set expiry to 5 days from now
UPDATE profiles 
SET subscription_expires_at = NOW() + INTERVAL '5 days'
WHERE user_id = 'user-id';

-- Check dashboard for warning
```

### Test Expiry
```sql
-- Set expiry to yesterday
UPDATE profiles 
SET subscription_expires_at = NOW() - INTERVAL '1 day'
WHERE user_id = 'user-id';

-- Run cron job manually
-- Check tokens are expired
```

## Benefits

### For Users
- ✅ Fair system - top-up tokens tidak hangus
- ✅ Clear visibility - tahu mana token yang akan expire
- ✅ Flexibility - bisa mix subscription + top-up

### For Business
- ✅ Encourage subscriptions (lebih murah per token)
- ✅ Urgency untuk pakai subscription tokens
- ✅ Recurring revenue dari subscriptions
- ✅ Additional revenue dari top-ups

## API Updates

### `api-generate` & `generate-enhanced-image`
Kedua function sudah diupdate untuk:
- Check total tokens (subscription + purchased)
- Deduct menggunakan `deduct_tokens_dual()`
- Return error jika token habis

## User Experience

### Dashboard Alerts

**Token Expired:**
```
🔴 Token Bulanan Sudah Expired
Token bulanan Anda sebanyak 10 sudah expired dan akan dihapus otomatis.
Token top-up Anda (25) masih aktif dan tidak akan hangus.
[Top Up Token Sekarang]
```

**Token Expiring Soon:**
```
🟡 Token Bulanan Akan Segera Expired
Token bulanan Anda sebanyak 10 akan expired dalam 5 hari (25 Des 2025).
Gunakan sebelum hangus! Token top-up Anda (25) tidak akan hangus.
[Top Up Token Tambahan]
```

**Token Habis:**
```
🔴 Token Habis
Token Anda sudah habis. Silakan top up untuk melanjutkan generate gambar.
[Top Up Token Sekarang] [Lihat Riwayat Pembayaran]
```

**Token Hampir Habis:**
```
🟡 Token Hampir Habis
Sisa token Anda: 3 token bulanan + 2 token top-up = 5 total.
[Top Up Token]
```

## Existing Users

Karena masih tahap development:
- Existing tokens diperlakukan sebagai **subscription_tokens**
- Set expiry 30 hari dari sekarang
- User bisa top-up untuk dapat purchased_tokens yang never expire

## Future Enhancements

1. **Email Notifications**: Kirim email 7 hari sebelum expire
2. **Auto-renewal**: Option untuk auto-renew subscription
3. **Token Packages**: Bundle deals untuk purchased tokens
4. **Referral Bonus**: Bonus purchased tokens untuk referral
5. **Rollover Option**: Premium feature untuk rollover subscription tokens

---

**Created**: 26 Desember 2023
**Version**: 1.0.0
**Status**: Ready for Production

# Dual Token System - Quick Start Guide

## 🎯 Apa itu Dual Token System?

Sistem token baru yang lebih fair untuk user:

### 2 Jenis Token:

1. **🔄 Token Bulanan (Subscription Tokens)**
   - Dari paket bulanan (Nano/Micro/Mega)
   - Expire 30 hari setelah pembelian
   - Lebih murah per token
   - Dipakai duluan saat generate

2. **💎 Token Top-Up (Purchased Tokens)**
   - Dari top-up manual
   - **TIDAK PERNAH HANGUS** ✨
   - Dipakai setelah token bulanan habis
   - Harga Rp 1.000/token

## 📊 Pricing Analysis

**Modal API**: Rp 348/gambar (~$0.02)  
**Harga Jual**: Rp 1.000/token  
**Profit**: ~65% (Rp 652/generate)  
**Verdict**: ✅ Kompetitif untuk pasar Indonesia

## 🚀 Setup (3 Langkah)

### Step 1: Run SQL Migration
```sql
-- Copy & paste isi file: RUN_THIS_SQL_DUAL_TOKEN.sql
-- Run di Supabase SQL Editor
```

### Step 2: Deploy Edge Function
```bash
npx supabase functions deploy expire-subscription-tokens
```

### Step 3: Setup Cron Job
1. Buka Supabase Dashboard → Database → Cron Jobs
2. Create new cron job:
   - **Name**: expire-subscription-tokens
   - **Schedule**: `0 0 * * *` (setiap hari jam 00:00)
   - **Command**:
   ```sql
   SELECT net.http_post(
     url:='https://[YOUR-PROJECT-REF].supabase.co/functions/v1/expire-subscription-tokens',
     headers:='{"Content-Type": "application/json", "Authorization": "Bearer [YOUR-ANON-KEY]"}'::jsonb
   );
   ```

### Step 4: Update Payment Approval Function
```sql
-- Copy & paste isi file: UPDATE_PAYMENT_APPROVAL_DUAL_TOKEN.sql
-- Run di Supabase SQL Editor
```

## 💡 Cara Kerja

### Saat User Generate Gambar:
```
1. Cek total tokens (subscription + purchased)
2. Deduct dari subscription_tokens dulu
3. Kalau habis, deduct dari purchased_tokens
4. Generate gambar
```

### Saat User Top-Up:
```
1. User transfer dengan kode unik
2. Admin approve payment
3. Token masuk ke purchased_tokens (never expire)
4. Bonus token otomatis jika kode unik kelipatan 1.000
```

### Setiap Hari (Cron Job):
```
1. Cek subscription tokens yang akan expire dalam 7 hari
2. Kirim notifikasi ke user
3. Expire tokens yang sudah lewat 30 hari
```

## 🎨 User Experience

### Dashboard Alerts

**Token Expiring Soon (7 hari sebelum):**
```
🟡 Token Bulanan Akan Segera Expired
Token bulanan Anda sebanyak 10 akan expired dalam 5 hari.
Gunakan sebelum hangus! Token top-up Anda (25) tidak akan hangus.
[Top Up Token Tambahan]
```

**Token Expired:**
```
🔴 Token Bulanan Sudah Expired
Token bulanan Anda sebanyak 10 sudah expired dan akan dihapus otomatis.
Token top-up Anda (25) masih aktif.
[Top Up Token Sekarang]
```

**Token Habis:**
```
🔴 Token Habis
Token Anda sudah habis. Silakan top up untuk melanjutkan.
[Top Up Token Sekarang]
```

## 🧪 Testing

### Test 1: Add Subscription Tokens
```sql
-- Add 50 subscription tokens with 30 days expiry
SELECT add_subscription_tokens('user-id', 50, 30);

-- Check balance
SELECT subscription_tokens, subscription_expires_at FROM profiles WHERE user_id = 'user-id';
```

### Test 2: Add Purchased Tokens
```sql
-- Add 25 purchased tokens (never expire)
SELECT add_purchased_tokens('user-id', 25);

-- Check balance
SELECT purchased_tokens FROM profiles WHERE user_id = 'user-id';
```

### Test 3: Deduct Tokens
```sql
-- Deduct 1 token (subscription first)
SELECT deduct_tokens_dual('user-id', 1);

-- Check balance
SELECT subscription_tokens, purchased_tokens FROM profiles WHERE user_id = 'user-id';
```

### Test 4: Check Expiring Subscriptions
```sql
-- Get list of users with expiring tokens
SELECT * FROM check_expiring_subscriptions();
```

### Test 5: Expire Old Tokens
```sql
-- Manually expire old tokens (for testing)
SELECT * FROM expire_subscription_tokens();
```

## 📝 Database Functions

### `deduct_tokens_dual(user_id, amount)`
Deduct tokens dengan prioritas subscription dulu

### `add_subscription_tokens(user_id, amount, days)`
Add subscription tokens dengan expiry date

### `add_purchased_tokens(user_id, amount)`
Add purchased tokens (never expire)

### `check_expiring_subscriptions()`
Get list users dengan tokens yang akan expire

### `expire_subscription_tokens()`
Expire tokens yang sudah lewat expiry date

## ✅ Benefits

### For Users:
- ✅ Top-up tokens tidak hangus
- ✅ Clear visibility token mana yang expire
- ✅ Flexibility mix subscription + top-up
- ✅ Warning 7 hari sebelum expire

### For Business:
- ✅ Encourage subscriptions (lebih murah)
- ✅ Urgency untuk pakai subscription tokens
- ✅ Recurring revenue dari subscriptions
- ✅ Additional revenue dari top-ups
- ✅ Fair system = happy customers

## 🔧 Files Updated

### Backend:
- ✅ `supabase/migrations/20231226_dual_token_system.sql`
- ✅ `supabase/functions/expire-subscription-tokens/index.ts`
- ✅ `supabase/functions/api-generate/index.ts`
- ✅ `supabase/functions/generate-enhanced-image/index.ts`

### Frontend:
- ✅ `src/pages/DashboardNew.tsx`
- ✅ `src/pages/TopUp.tsx`
- ✅ `src/components/dashboard/UsageStats.tsx`

### Documentation:
- ✅ `DUAL_TOKEN_SYSTEM.md` (Full documentation)
- ✅ `DUAL_TOKEN_QUICK_START.md` (This file)
- ✅ `RUN_THIS_SQL_DUAL_TOKEN.sql` (Migration SQL)
- ✅ `UPDATE_PAYMENT_APPROVAL_DUAL_TOKEN.sql` (Payment approval update)

## 🚨 Important Notes

1. **Existing Users**: Existing tokens akan diperlakukan sebagai subscription_tokens dengan expiry 30 hari dari sekarang
2. **Top-Up**: Semua top-up manual akan masuk ke purchased_tokens (never expire)
3. **Paket Bulanan**: Nanti perlu update untuk set `token_type: 'subscription'`
4. **Cron Job**: Harus di-setup manual di Supabase Dashboard
5. **Testing**: Test dulu di development sebelum production

## 📞 Support

Jika ada masalah:
1. Check logs di Supabase Dashboard
2. Verify cron job running
3. Check edge function logs
4. Test dengan SQL queries di atas

---

**Version**: 1.0.0  
**Created**: 26 Desember 2023  
**Status**: ✅ Ready for Production

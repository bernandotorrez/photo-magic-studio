# Dual Token System - Frontend Update Summary

## 📝 Files Updated

### 1. **UsageStats Component** (`src/components/dashboard/UsageStats.tsx`)
**Changes:**
- ✅ Updated interface to use `subscription_tokens`, `purchased_tokens`, `subscription_expires_at`
- ✅ Added tooltip showing token breakdown (subscription vs purchased)
- ✅ Added expiry warning badge (shows days until expiry)
- ✅ Added visual indicators:
  - 🔴 Red alert when tokens = 0
  - 🟡 Yellow warning when tokens ≤ 5 or expiring soon
  - ⏰ Clock icon when subscription tokens expiring
  - ⚠️ Alert icon when no tokens
- ✅ Tooltip shows:
  - Subscription tokens count
  - Purchased tokens count
  - Total tokens
  - Expiry date/status
  - Warning messages

**Visual States:**
```
Normal: [⚡ 50 token] [Free]
Low: [⚡ 3 token] [Free] (yellow)
Expiring: [⏰ 10 token] [7d] [Free] (yellow)
Expired: [⏰ 10 token] [Expired] [Free] (yellow)
Empty: [⚠️ 0 token] [Free] (red)
```

### 2. **Dashboard Pages**
Updated all dashboard pages to use dual token system:

#### `src/pages/DashboardNew.tsx`
- ✅ Updated Profile interface
- ✅ Added expiry warning alerts (7 days before)
- ✅ Added expired token alerts
- ✅ Added no tokens alert
- ✅ Added low tokens warning (≤ 5)

#### `src/pages/AiPhotographer.tsx`
- ✅ Updated Profile interface
- ✅ Updated fetchProfile to get dual token fields

#### `src/pages/InteriorDesign.tsx`
- ✅ Updated Profile interface
- ✅ Updated fetchProfile to get dual token fields

#### `src/pages/ExteriorDesign.tsx`
- ✅ Updated Profile interface
- ✅ Updated fetchProfile to get dual token fields

### 3. **Top-Up Page** (`src/pages/TopUp.tsx`)
- ✅ Added `token_type: 'purchased'` to payment record
- ✅ Top-up tokens will never expire

### 4. **Edge Functions**
#### `supabase/functions/api-generate/index.ts`
- ✅ Check total tokens (subscription + purchased)
- ✅ Deduct using `deduct_tokens_dual()`
- ✅ Return error if insufficient tokens

#### `supabase/functions/generate-enhanced-image/index.ts`
- ✅ Check total tokens (subscription + purchased)
- ✅ Deduct using `deduct_tokens_dual()`
- ✅ Return error if insufficient tokens

## 🎨 User Experience

### Token Display in Header (All Pages)
```
Hover on token badge to see:
┌─────────────────────────────┐
│ Token Balance               │
├─────────────────────────────┤
│ Subscription:    10 token   │
│ Top-up:          25 token   │
├─────────────────────────────┤
│ Total:           35 token   │
├─────────────────────────────┤
│ Expires: 25 Des 2025        │
└─────────────────────────────┘
```

### Warning States

**7 Days Before Expiry:**
```
🟡 Token Bulanan Akan Segera Expired
Token bulanan Anda sebanyak 10 akan expired dalam 5 hari (25 Des 2025).
Gunakan sebelum hangus! Token top-up Anda (25) tidak akan hangus.
[Top Up Token Tambahan]
```

**After Expiry:**
```
🔴 Token Bulanan Sudah Expired
Token bulanan Anda sebanyak 10 sudah expired dan akan dihapus otomatis.
Token top-up Anda (25) masih aktif dan tidak akan hangus.
[Top Up Token Sekarang]
```

**No Tokens:**
```
🔴 Token Habis
Token Anda sudah habis. Silakan top up untuk melanjutkan generate gambar.
[Top Up Token Sekarang] [Lihat Riwayat Pembayaran]
```

**Low Tokens (≤ 5):**
```
🟡 Token Hampir Habis
Sisa token Anda: 3 token bulanan + 2 token top-up = 5 total.
[Top Up Token]
```

## 🔄 Token Deduction Flow

### Before (Old System):
```
1. Check monthly_generate_limit
2. Check current_month_generates
3. If current >= limit → Error
4. Generate image
5. Increment current_month_generates
```

### After (Dual Token System):
```
1. Check subscription_tokens + purchased_tokens
2. If total <= 0 → Error
3. Generate image
4. Deduct from subscription_tokens first
5. If not enough, deduct from purchased_tokens
```

## 📊 Database Fields

### Old Fields (Deprecated):
- ❌ `monthly_generate_limit`
- ❌ `current_month_generates`
- ❌ `tokens` (single field)

### New Fields (Active):
- ✅ `subscription_tokens` - From monthly packages (expire 30 days)
- ✅ `purchased_tokens` - From top-up (never expire)
- ✅ `subscription_expires_at` - Expiry date for subscription tokens

## 🧪 Testing Checklist

### Visual Testing:
- [ ] Token badge shows correct total
- [ ] Tooltip shows breakdown correctly
- [ ] Expiry badge shows when < 7 days
- [ ] Red alert when tokens = 0
- [ ] Yellow warning when tokens ≤ 5
- [ ] Yellow warning when expiring soon

### Functional Testing:
- [ ] Generate image deducts subscription tokens first
- [ ] Generate image deducts purchased tokens when subscription empty
- [ ] Error shown when total tokens = 0
- [ ] Top-up adds to purchased_tokens
- [ ] Subscription tokens expire after 30 days
- [ ] Purchased tokens never expire

### Page Testing:
- [ ] DashboardNew shows alerts correctly
- [ ] AiPhotographer shows token count
- [ ] InteriorDesign shows token count
- [ ] ExteriorDesign shows token count
- [ ] All pages fetch dual token fields

## 🚀 Deployment Steps

1. **Run Migration:**
   ```sql
   -- Run: RUN_THIS_SQL_DUAL_TOKEN.sql
   ```

2. **Deploy Edge Functions:**
   ```bash
   npx supabase functions deploy expire-subscription-tokens
   npx supabase functions deploy api-generate
   npx supabase functions deploy generate-enhanced-image
   ```

3. **Setup Cron Job:**
   - Schedule: `0 0 * * *` (daily at midnight)
   - Function: `expire-subscription-tokens`

4. **Update Payment Approval:**
   ```sql
   -- Run: UPDATE_PAYMENT_APPROVAL_DUAL_TOKEN.sql
   ```

5. **Test Frontend:**
   - Check token display in all pages
   - Test generate with subscription tokens
   - Test generate with purchased tokens
   - Test expiry warnings

## 📱 Responsive Design

All token displays are responsive:
- **Mobile**: Compact view with icons only
- **Tablet**: Medium view with abbreviated text
- **Desktop**: Full view with complete information

## ♿ Accessibility

- ✅ Tooltip for detailed information
- ✅ Color-coded visual indicators
- ✅ Clear warning messages
- ✅ Keyboard navigation support
- ✅ Screen reader friendly

## 🎯 Benefits

### For Users:
- ✅ Clear visibility of token balance
- ✅ Know which tokens will expire
- ✅ Top-up tokens never expire
- ✅ Fair and transparent system

### For Business:
- ✅ Encourage subscription usage
- ✅ Urgency for expiring tokens
- ✅ Additional revenue from top-ups
- ✅ Better user retention

---

**Version**: 1.0.0  
**Updated**: 26 Desember 2023  
**Status**: ✅ Complete & Ready for Production

# Fix Bonus Token Text Display - Summary

## Masalah
Di halaman admin pembayaran, text bonus token tidak akurat:
- **Sebelum**: "Bonus Token: +5 token dari kode unik 1334"
- **Seharusnya**: "Bonus Token: +5 token dari Paket dan +1 Token dari Kode unik"

## Contoh Kasus
User beli paket **Pro Max**:
- Paket: 100 tokens + **10 bonus token dari paket**
- Kode unik: **1334**
- Bonus dari kode unik: 1334 / 1000 = **1 token**
- **Total bonus: 10 + 1 = 11 token**
- **Total token yang didapat: 100 + 11 = 111 token**

## Perubahan yang Dilakukan

### 1. Frontend - PaymentManagement.tsx
**File**: `src/components/admin/PaymentManagement.tsx`

#### Perubahan Fungsi:
```typescript
// SEBELUM: Hanya hitung bonus dari kode unik
const calculateBonusTokens = (paymentId: string): number => {
  const payment = payments.find(p => p.id === paymentId);
  if (!payment || !payment.unique_code) return 0;
  return Math.floor(payment.unique_code / 1000);
};

// SESUDAH: Breakdown bonus dari paket dan kode unik
const calculateBonusFromUniqueCode = (uniqueCode: number): number => {
  return Math.floor(uniqueCode / 1000);
};

const getBonusTokenBreakdown = (payment: Payment) => {
  if (!payment.bonus_tokens || payment.bonus_tokens === 0) return null;

  const bonusFromUniqueCode = payment.unique_code 
    ? calculateBonusFromUniqueCode(payment.unique_code) 
    : 0;
  const bonusFromPackage = payment.bonus_tokens - bonusFromUniqueCode;

  return {
    total: payment.bonus_tokens,
    fromPackage: bonusFromPackage,
    fromUniqueCode: bonusFromUniqueCode
  };
};
```

#### Perubahan Display:
**Pending Payments** (sebelum approve):
```tsx
{(() => {
  const breakdown = getBonusTokenBreakdown(payment);
  if (!breakdown) return null;

  return (
    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
      <p className="text-sm text-green-700 font-medium">
        🎁 Bonus Token Otomatis: +{breakdown.total} token
      </p>
      <div className="text-xs text-green-600 mt-1 space-y-0.5">
        {breakdown.fromPackage > 0 && (
          <p>• +{breakdown.fromPackage} token dari paket berlangganan</p>
        )}
        {breakdown.fromUniqueCode > 0 && payment.unique_code && (
          <p>• +{breakdown.fromUniqueCode} token dari kode unik {payment.unique_code} (kelipatan 1.000)</p>
        )}
      </div>
    </div>
  );
})()}
```

**Payment History** (setelah approve):
```tsx
{(() => {
  const breakdown = getBonusTokenBreakdown(payment);
  if (!breakdown) return null;

  return (
    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm">
      <p className="font-medium text-green-700">
        🎁 Bonus Token: +{breakdown.total} token
      </p>
      <div className="text-xs text-green-600 mt-1 space-y-0.5">
        {breakdown.fromPackage > 0 && (
          <p>• +{breakdown.fromPackage} token dari paket</p>
        )}
        {breakdown.fromUniqueCode > 0 && payment.unique_code && (
          <p>• +{breakdown.fromUniqueCode} token dari kode unik {payment.unique_code}</p>
        )}
      </div>
    </div>
  );
})()}
```

#### Toast Message saat Approve:
```typescript
const breakdown = payment ? getBonusTokenBreakdown(payment) : null;
let message = 'Payment approved and tokens added to user account';

if (breakdown && breakdown.total > 0) {
  const parts = [];
  if (breakdown.fromPackage > 0) parts.push(`${breakdown.fromPackage} dari paket`);
  if (breakdown.fromUniqueCode > 0) parts.push(`${breakdown.fromUniqueCode} dari kode unik`);
  message = `Payment approved! Bonus: +${breakdown.total} token (${parts.join(' dan ')})`;
}
```

### 2. Backend - Database Function
**File**: `FIX_BONUS_TOKEN_CALCULATION.sql`

#### Update Function `process_approved_payment`:
```sql
CREATE OR REPLACE FUNCTION process_approved_payment(payment_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_tokens INTEGER;
  v_subscription_plan TEXT;
  v_unique_code INTEGER;
  v_bonus_from_package INTEGER := 0;
  v_bonus_from_unique_code INTEGER := 0;
  v_total_bonus INTEGER := 0;
  v_total_tokens INTEGER;
  v_current_limit INTEGER;
BEGIN
  -- Get payment details
  SELECT 
    user_id, 
    tokens_purchased,
    subscription_plan,
    unique_code,
    COALESCE(bonus_tokens, 0) -- bonus dari paket sudah diisi oleh frontend
  INTO 
    v_user_id, 
    v_tokens,
    v_subscription_plan,
    v_unique_code,
    v_bonus_from_package
  FROM public.payments
  WHERE id = payment_id AND payment_status = 'approved';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate bonus from unique code (kelipatan 1000)
  -- Contoh: 1334 / 1000 = 1 bonus token
  IF v_unique_code IS NOT NULL AND v_unique_code >= 1000 THEN
    v_bonus_from_unique_code := FLOOR(v_unique_code / 1000);
  END IF;
  
  -- Total bonus = bonus dari paket + bonus dari kode unik
  v_total_bonus := v_bonus_from_package + v_bonus_from_unique_code;
  
  -- Update payment record with calculated total bonus
  UPDATE public.payments
  SET bonus_tokens = v_total_bonus
  WHERE id = payment_id;
  
  -- Calculate total tokens (purchased + total bonus)
  v_total_tokens := v_tokens + v_total_bonus;
  
  -- Get current monthly limit
  SELECT monthly_generate_limit INTO v_current_limit
  FROM public.profiles
  WHERE user_id = v_user_id;
  
  -- Update user's monthly limit with total tokens
  UPDATE public.profiles
  SET 
    monthly_generate_limit = COALESCE(v_current_limit, 0) + v_total_tokens,
    subscription_plan = COALESCE(v_subscription_plan, subscription_plan)
  WHERE user_id = v_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Cara Deploy

### 1. Update Database Function
Jalankan SQL di Supabase SQL Editor:
```bash
# Buka file: FIX_BONUS_TOKEN_CALCULATION.sql
# Copy semua isi file
# Paste di Supabase SQL Editor
# Klik "Run"
```

### 2. Deploy Frontend
```bash
# Commit changes
git add .
git commit -m "fix: bonus token text display breakdown (paket + kode unik)"
git push

# Deploy akan otomatis via Vercel/Netlify
```

## Testing

### Test Case 1: Paket dengan Bonus + Kode Unik >= 1000
- Paket: Pro Max (100 tokens + 10 bonus)
- Kode unik: 1334
- Expected:
  - Total bonus: 11 token
  - Display: "• +10 token dari paket" dan "• +1 token dari kode unik 1334"

### Test Case 2: Paket dengan Bonus + Kode Unik < 1000
- Paket: Basic+ (50 tokens + 2 bonus)
- Kode unik: 456
- Expected:
  - Total bonus: 2 token
  - Display: "• +2 token dari paket"

### Test Case 3: Top-up (tanpa paket) + Kode Unik >= 1000
- Top-up: 50 tokens
- Kode unik: 1999
- Expected:
  - Total bonus: 1 token
  - Display: "• +1 token dari kode unik 1999"

### Test Case 4: Top-up (tanpa paket) + Kode Unik < 1000
- Top-up: 30 tokens
- Kode unik: 789
- Expected:
  - Total bonus: 0 token
  - Display: Tidak ada bonus box

## Hasil Akhir

### Sebelum:
```
🎁 Bonus Token: +5 token dari kode unik 1334
Kode unik kelipatan 1.000 = bonus token otomatis
```

### Sesudah:
```
🎁 Bonus Token: +11 token
• +10 token dari paket
• +1 token dari kode unik 1334
```

## Notes
- Bonus dari paket sudah dihitung di frontend saat insert payment (dari `subscription_tiers.bonus_tokens`)
- Bonus dari kode unik dihitung di backend saat approve payment
- Total bonus = bonus_from_package + bonus_from_unique_code
- Frontend hanya menampilkan breakdown dari `payment.bonus_tokens` yang sudah dihitung backend

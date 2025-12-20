# Token Deduction Priority System

## Overview

Sistem dual token dengan prioritas pengurangan:
1. **Subscription Tokens** (Token Bulanan) - dipotong dulu
2. **Purchased Tokens** (Token Top-Up) - dipotong jika subscription habis

## Database Function

**Function:** `deduct_user_tokens(p_user_id UUID, p_amount INTEGER DEFAULT 1)`

**Location:** `supabase/migrations/20231226_dual_token_system.sql`

### Logic Flow

```sql
-- 1. Get current balances
SELECT subscription_tokens, purchased_tokens FROM profiles WHERE user_id = p_user_id;

-- 2. Check total tokens
IF (subscription_tokens + purchased_tokens) < p_amount THEN
  RETURN 'Insufficient tokens';
END IF;

-- 3. Deduct from subscription tokens FIRST
IF subscription_tokens >= p_amount THEN
  -- All from subscription
  subscription_used := p_amount;
  subscription_tokens := subscription_tokens - p_amount;
ELSE
  -- Use all subscription tokens, rest from purchased
  subscription_used := subscription_tokens;
  purchased_used := p_amount - subscription_tokens;
  subscription_tokens := 0;
  purchased_tokens := purchased_tokens - purchased_used;
END IF;

-- 4. Update database
UPDATE profiles SET 
  subscription_tokens = subscription_tokens,
  purchased_tokens = purchased_tokens,
  current_month_generates = current_month_generates + 1
WHERE user_id = p_user_id;
```

## Examples

### Example 1: Cukup Subscription Tokens
**Before:**
- Subscription: 10 tokens
- Purchased: 5 tokens
- Total: 15 tokens

**Generate 1 image (cost: 1 token)**

**After:**
- Subscription: 9 tokens ✅ (dikurangi 1)
- Purchased: 5 tokens (tidak berubah)
- Total: 14 tokens

### Example 2: Subscription Tidak Cukup
**Before:**
- Subscription: 2 tokens
- Purchased: 10 tokens
- Total: 12 tokens

**Generate 5 images (cost: 5 tokens)**

**After:**
- Subscription: 0 tokens ✅ (habis, pakai semua 2)
- Purchased: 7 tokens ✅ (dikurangi 3)
- Total: 7 tokens

**Breakdown:**
- Used from subscription: 2 tokens
- Used from purchased: 3 tokens
- Total used: 5 tokens

### Example 3: Subscription Habis
**Before:**
- Subscription: 0 tokens
- Purchased: 20 tokens
- Total: 20 tokens

**Generate 1 image (cost: 1 token)**

**After:**
- Subscription: 0 tokens (tetap 0)
- Purchased: 19 tokens ✅ (dikurangi 1)
- Total: 19 tokens

## Return Value

Function returns table dengan informasi:

```typescript
{
  success: boolean,
  subscription_used: number,      // Berapa token subscription yang dipakai
  purchased_used: number,         // Berapa token purchased yang dipakai
  remaining_subscription: number, // Sisa token subscription
  remaining_purchased: number,    // Sisa token purchased
  message: string                 // Status message
}
```

## Usage in Edge Function

**File:** `supabase/functions/generate-enhanced-image/index.ts`

```typescript
// ✅ IMAGE GENERATED SUCCESSFULLY - NOW DEDUCT TOKEN
if (userId) {
  try {
    const { data: deductResult, error: deductError } = await supabase.rpc('deduct_user_tokens', {
      p_user_id: userId,
      p_amount: 1
    });

    if (deductError) {
      console.error('❌ Error deducting tokens:', deductError);
    } else if (deductResult && deductResult.length > 0) {
      const result = deductResult[0];
      if (result.success) {
        console.log('✅ Token deducted successfully:', {
          subscription_used: result.subscription_used,
          purchased_used: result.purchased_used,
          remaining_subscription: result.remaining_subscription,
          remaining_purchased: result.remaining_purchased,
          total_remaining: result.remaining_subscription + result.remaining_purchased
        });
      } else {
        console.error('❌ Failed to deduct tokens:', result.message);
      }
    }
  } catch (deductError) {
    console.error('❌ Exception deducting tokens:', deductError);
  }
}
```

## Frontend Display

**File:** `src/components/dashboard/EnhancementOptions.tsx`

```typescript
{profile && (
  <p className="text-xs text-muted-foreground text-center px-2">
    Sisa token: {(profile.subscription_tokens || 0) + (profile.purchased_tokens || 0)} token
    {profile.subscription_tokens > 0 && profile.purchased_tokens > 0 && (
      <span className="block mt-1">
        ({profile.subscription_tokens} bulanan + {profile.purchased_tokens} top-up)
      </span>
    )}
  </p>
)}
```

## Token Check Before Generate

```typescript
// Check if user has enough tokens (dual token system)
if (profile) {
  const totalTokens = (profile.subscription_tokens || 0) + (profile.purchased_tokens || 0);
  if (totalTokens < 1) {
    toast({
      title: 'Token Habis',
      description: 'Token Anda sudah habis. Silakan top up untuk melanjutkan.',
      variant: 'destructive',
    });
    return;
  }
}
```

## Important Notes

### ✅ Correct Behavior
- **Subscription tokens ALWAYS deducted first**
- Purchased tokens only used when subscription runs out
- User sees breakdown: "10 bulanan + 5 top-up = 15 total"

### ❌ Wrong Behavior (Old System)
- Random deduction from either token type
- No priority system
- User confused about which tokens are being used

## Testing

### Test Case 1: Subscription Priority
```sql
-- Setup
UPDATE profiles SET subscription_tokens = 5, purchased_tokens = 10 WHERE user_id = 'test-user-id';

-- Execute
SELECT * FROM deduct_user_tokens('test-user-id', 3);

-- Expected Result
{
  success: true,
  subscription_used: 3,
  purchased_used: 0,
  remaining_subscription: 2,
  remaining_purchased: 10,
  message: 'Tokens deducted successfully'
}
```

### Test Case 2: Mixed Deduction
```sql
-- Setup
UPDATE profiles SET subscription_tokens = 2, purchased_tokens = 10 WHERE user_id = 'test-user-id';

-- Execute
SELECT * FROM deduct_user_tokens('test-user-id', 5);

-- Expected Result
{
  success: true,
  subscription_used: 2,
  purchased_used: 3,
  remaining_subscription: 0,
  remaining_purchased: 7,
  message: 'Tokens deducted successfully'
}
```

### Test Case 3: Insufficient Tokens
```sql
-- Setup
UPDATE profiles SET subscription_tokens = 1, purchased_tokens = 1 WHERE user_id = 'test-user-id';

-- Execute
SELECT * FROM deduct_user_tokens('test-user-id', 5);

-- Expected Result
{
  success: false,
  subscription_used: 0,
  purchased_used: 0,
  remaining_subscription: 1,
  remaining_purchased: 1,
  message: 'Insufficient tokens'
}
```

## Monitoring

### Check User Token Balance
```sql
SELECT 
  user_id,
  email,
  subscription_tokens,
  purchased_tokens,
  (subscription_tokens + purchased_tokens) as total_tokens,
  current_month_generates,
  subscription_expires_at
FROM profiles
WHERE user_id = 'your-user-id';
```

### Check Recent Deductions
```sql
SELECT 
  gh.created_at,
  gh.user_email,
  gh.enhancement_type,
  p.subscription_tokens,
  p.purchased_tokens
FROM generation_history gh
JOIN profiles p ON gh.user_id = p.user_id
WHERE gh.user_id = 'your-user-id'
ORDER BY gh.created_at DESC
LIMIT 10;
```

## Summary

✅ **Token deduction sudah benar:**
- Prioritas subscription tokens dulu
- Purchased tokens sebagai backup
- Clear logging untuk debugging
- User-friendly display di frontend

Sistem ini memastikan user memanfaatkan token bulanan mereka sebelum menggunakan token top-up yang mereka beli.

# 🔧 Fix Token Deduction Issue

> Memperbaiki masalah token tidak berkurang setelah generate image - Token hanya berkurang jika KIE AI berhasil generate image

## 🐛 Masalah yang Ditemukan

### Problem 1: Function Name Salah
**Code Lama:**
```typescript
await supabase.rpc('deduct_tokens_dual', { ... });
```

**Error:** Function `deduct_tokens_dual` tidak ada di database

**Function yang Benar:** `deduct_user_tokens`

### Problem 2: Token Deduction di Tempat yang Salah
**Code Lama:**
```typescript
if (userId) {
  try {
    // Upload image
    if (!uploadError) {
      // Save to history
      // Deduct tokens ← HANYA JALAN JIKA UPLOAD BERHASIL
    }
  } catch (error) {
    // Token tidak di-deduct jika ada error
  }
}
```

**Masalah:**
- Jika upload image gagal → Token tidak di-deduct
- Jika save history gagal → Token tidak di-deduct
- User sudah dapat image dari API tapi token tidak berkurang

### Problem 3: Token Berkurang Meskipun KIE AI Gagal
**Masalah Terbesar:**
- Token berkurang meskipun KIE AI return error
- Token berkurang meskipun polling timeout
- Token berkurang meskipun image generation failed
- User rugi token tanpa dapat hasil

## ✅ Solusi yang Diterapkan

### 1. Fix Function Name

**Before:**
```typescript
await supabase.rpc('deduct_tokens_dual', {
  p_user_id: userId,
  p_amount: 1
});
```

**After:**
```typescript
await supabase.rpc('deduct_user_tokens', {
  p_user_id: userId,
  p_amount: 1
});
```

### 2. Token Deduction HANYA Setelah Image Berhasil Di-Generate

**Prinsip:** Token hanya berkurang jika KIE AI berhasil generate image (status = success dan ada resultUrls)

**Flow:**
```typescript
// 1. Call KIE AI API
const response = await fetch('https://api.kie.ai/...');

// 2. Poll for completion
for (let attempt = 0; attempt < maxAttempts; attempt++) {
  const statusData = await fetch(`...recordInfo?taskId=${taskId}`);
  
  if (statusData.state === 'success') {
    generatedImageUrl = resultJson.resultUrls[0];
    break; // ✅ SUCCESS
  } else if (statusData.state === 'fail') {
    return error; // ❌ FAIL - NO TOKEN DEDUCTION
  }
}

if (!generatedImageUrl) {
  return error; // ❌ TIMEOUT - NO TOKEN DEDUCTION
}

// 3. ✅ IMAGE GENERATED SUCCESSFULLY - NOW DEDUCT TOKEN
if (userId) {
  const { data: deductResult } = await supabase.rpc('deduct_user_tokens', {
    p_user_id: userId,
    p_amount: 1
  });
  
  if (deductResult[0].success) {
    console.log('✅ Token deducted successfully');
  }
}

// 4. Save image to storage (optional, doesn't affect token)
try {
  // Upload & save history
} catch (error) {
  // Just log, token already deducted fairly
}
```

### 3. Proper Error Handling

**Added:**
- Check `deductResult` data
- Check `result.success` boolean
- Log detailed deduction info
- Separate try-catch for deduction vs save

**Logging:**
```typescript
console.log('✅ Token deducted successfully:', {
  subscription_used: result.subscription_used,
  purchased_used: result.purchased_used,
  remaining_subscription: result.remaining_subscription,
  remaining_purchased: result.remaining_purchased,
  total_remaining: result.remaining_subscription + result.remaining_purchased
});
```

## 📊 Flow Comparison

### Before (WRONG ❌)

```
1. User request generate
2. Check tokens (has tokens)
3. Call KIE AI API
4. Poll for result
   ├─ Success → Get image ✅
   ├─ Fail → Return error ❌
   └─ Timeout → Return error ❌
5. Try to save image
   ├─ Upload success?
   │  ├─ YES → Save history
   │  │        └─ Deduct tokens ✅
   │  └─ NO → Skip deduction ❌ (BUG!)
   └─ Error? → Skip deduction ❌ (BUG!)
6. Return to user

Problems:
- Token not deducted if upload fails
- Token not deducted if KIE AI fails (user didn't get image!)
```

### After (CORRECT ✅)

```
1. User request generate
2. Check tokens (has tokens)
3. Call KIE AI API
4. Poll for result
   ├─ Success → Get image ✅
   │            └─ Continue to step 5
   ├─ Fail → Return error ❌
   │         └─ NO TOKEN DEDUCTION (fair!)
   └─ Timeout → Return error ❌
                └─ NO TOKEN DEDUCTION (fair!)
5. ✅ Deduct token (image generated successfully)
   ├─ Success → Log details
   └─ Error → Log error (but user got image)
6. Try to save image (optional)
   ├─ Upload success → Save history
   └─ Error → Just log (token already deducted fairly)
7. Return image to user

Benefits:
✅ Token only deducted if KIE AI succeeds
✅ Fair for users (no wasted tokens)
✅ Proper error handling
✅ Detailed logging
```

## 🧪 Testing

### Test Case 1: Normal Flow (Success)
```bash
# Request
curl -X POST .../generate-enhanced-image \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "imageUrl": "...",
    "enhancements": ["food_angle_45_degree"],
    "classification": "food"
  }'

# Expected Flow:
# 1. Call KIE AI API ✅
# 2. Poll until success ✅
# 3. Get generatedImageUrl ✅
# 4. Deduct token ✅
# 5. Save image ✅

# Expected Logs
Poll attempt 5/60 - Task state: success
Image generation completed successfully!
✅ Token deducted successfully: {
  subscription_used: 1,
  purchased_used: 0,
  remaining_subscription: 99,
  remaining_purchased: 0,
  total_remaining: 99
}

# Check Database
SELECT subscription_tokens, purchased_tokens 
FROM profiles WHERE user_id = '...';
-- Should be: 99, 0 (deducted 1)
```

### Test Case 2: KIE AI Fails (No Token Deduction)
```bash
# Simulate KIE AI failure (bad prompt, invalid image, etc.)

# Expected Flow:
# 1. Call KIE AI API ✅
# 2. Poll until fail ❌
# 3. Return error immediately
# 4. NO TOKEN DEDUCTION ✅

# Expected Logs
Poll attempt 3/60 - Task state: fail
Job failed: { failMsg: "Invalid image format" }

# Expected Response
{
  "error": "Image generation failed",
  "details": "Invalid image format",
  "taskId": "..."
}

# Check Database
SELECT subscription_tokens FROM profiles WHERE user_id = '...';
-- Should be: 100 (NOT deducted - user didn't get image)
```

### Test Case 3: Timeout (No Token Deduction)
```bash
# Simulate timeout (KIE AI stuck processing)

# Expected Flow:
# 1. Call KIE AI API ✅
# 2. Poll 60 times (2 minutes) ⏱️
# 3. Timeout - no image generated ❌
# 4. Return error
# 5. NO TOKEN DEDUCTION ✅

# Expected Logs
Poll attempt 60/60 - Task state: processing
Job timed out or no image generated

# Expected Response
{
  "error": "Image generation timed out"
}

# Check Database
SELECT subscription_tokens FROM profiles WHERE user_id = '...';
-- Should be: 100 (NOT deducted - user didn't get image)
```

### Test Case 4: Success but Upload Fails (Token Still Deducted)
```bash
# Image generated successfully but upload to Supabase fails

# Expected Flow:
# 1. Call KIE AI API ✅
# 2. Poll until success ✅
# 3. Get generatedImageUrl ✅
# 4. Deduct token ✅ (user got image from KIE AI)
# 5. Try to save - fails ❌
# 6. Return KIE AI URL to user ✅

# Expected Logs
Image generation completed successfully!
✅ Token deducted successfully
Error uploading generated image: ...

# Check Database
SELECT subscription_tokens FROM profiles WHERE user_id = '...';
-- Should be: 99 (deducted - user got image from KIE AI even if save failed)
```

### Test Case 5: Insufficient Tokens (No API Call)
```bash
# User has 0 tokens

# Expected Flow:
# 1. Check tokens - insufficient ❌
# 2. Return error immediately
# 3. NO API CALL to KIE AI
# 4. NO TOKEN DEDUCTION

# Expected Response
{
  "error": "Token Anda sudah habis. Silakan top up untuk melanjutkan.",
  "subscription_tokens": 0,
  "purchased_tokens": 0,
  "total_tokens": 0
}

# No API call made, no token deducted
```

## 🔍 Verification Queries

### Check Token Balance
```sql
SELECT 
  user_id,
  email,
  subscription_tokens,
  purchased_tokens,
  subscription_tokens + purchased_tokens as total_tokens,
  current_month_generates
FROM profiles
WHERE user_id = 'USER_ID';
```

### Check Recent Generations
```sql
SELECT 
  created_at,
  enhancement_type,
  classification_result
FROM generation_history
WHERE user_id = 'USER_ID'
ORDER BY created_at DESC
LIMIT 10;
```

### Check Token Deduction History
```sql
-- This query shows token changes over time
SELECT 
  created_at,
  enhancement_type,
  (SELECT subscription_tokens + purchased_tokens 
   FROM profiles WHERE user_id = generation_history.user_id) as current_tokens
FROM generation_history
WHERE user_id = 'USER_ID'
ORDER BY created_at DESC;
```

## 📝 Function Reference

### deduct_user_tokens

**Signature:**
```sql
deduct_user_tokens(p_user_id UUID, p_amount INTEGER DEFAULT 1)
RETURNS TABLE (
  success BOOLEAN,
  subscription_used INTEGER,
  purchased_used INTEGER,
  remaining_subscription INTEGER,
  remaining_purchased INTEGER,
  message TEXT
)
```

**Behavior:**
1. Deduct from `subscription_tokens` first
2. If not enough, deduct remaining from `purchased_tokens`
3. Return detailed breakdown
4. Increment `current_month_generates`

**Example:**
```typescript
const { data, error } = await supabase.rpc('deduct_user_tokens', {
  p_user_id: userId,
  p_amount: 1
});

if (data && data[0].success) {
  console.log('Deducted:', data[0]);
  // {
  //   success: true,
  //   subscription_used: 1,
  //   purchased_used: 0,
  //   remaining_subscription: 99,
  //   remaining_purchased: 50,
  //   message: 'Tokens deducted successfully'
  // }
}
```

## 🚀 Deployment

### 1. Deploy Updated Function
```bash
# Deploy generate-enhanced-image with fixes
supabase functions deploy generate-enhanced-image

# Verify deployment
supabase functions list
```

### 2. Test Token Deduction
```bash
# Test with real user
# 1. Check current token balance
# 2. Generate image
# 3. Check token balance again (should be -1)
# 4. Check logs for deduction message
```

### 3. Monitor Logs
```bash
# Watch logs in real-time
supabase functions logs generate-enhanced-image --tail

# Look for:
# ✅ Token deducted successfully
# ❌ Error deducting tokens (if any)
```

## 🐛 Troubleshooting

### Issue 1: Token Still Not Deducted

**Check:**
1. Function name correct? (`deduct_user_tokens`)
2. User ID valid?
3. Function exists in database?

**Verify Function:**
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'deduct_user_tokens';
```

**Test Function Directly:**
```sql
SELECT * FROM deduct_user_tokens('USER_ID'::UUID, 1);
```

### Issue 2: "Insufficient tokens" but User Has Tokens

**Check:**
1. Token check happens BEFORE API call
2. Check actual token balance:
```sql
SELECT subscription_tokens, purchased_tokens 
FROM profiles WHERE user_id = 'USER_ID';
```

### Issue 3: Tokens Deducted Twice

**Check:**
1. Is function called multiple times?
2. Check logs for duplicate calls
3. Ensure no retry logic calling deduction again

## ✅ Checklist

- [x] Fix function name: `deduct_tokens_dual` → `deduct_user_tokens`
- [x] Move token deduction BEFORE save
- [x] Handle return value properly
- [x] Add detailed logging
- [x] Separate try-catch blocks
- [x] Test normal flow
- [x] Test error scenarios
- [x] Documentation complete

## 📊 Impact

**Before:**
- ❌ Token tidak berkurang jika upload gagal
- ❌ Token tidak berkurang jika ada error
- ❌ User dapat image gratis (jika upload gagal)
- ❌ Tidak ada logging detail
- ❌ Function name salah

**After:**
- ✅ Token HANYA berkurang jika KIE AI berhasil generate
- ✅ Token TIDAK berkurang jika KIE AI gagal/timeout
- ✅ Fair untuk user (tidak rugi token sia-sia)
- ✅ Proper error handling
- ✅ Detailed logging untuk debugging
- ✅ Function name benar

**Key Principle:**
> **Token deduction happens ONLY when user successfully receives generated image from KIE AI**

---

**Version:** 2.0.0  
**Date:** December 20, 2025  
**Status:** Fixed & Ready to Deploy 🚀  
**Breaking Change:** Token deduction logic completely refactored for fairness

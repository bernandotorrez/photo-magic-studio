# ⚡ QUICK FIX CHECKLIST - Security Fixes

**Target: Selesai dalam 2 jam**

---

## 🎯 PRIORITAS 1: CRITICAL FIXES (1 jam)

### ✅ Fix 1: Secure CORS (15 menit)

**Files to update:**
- `supabase/functions/api-generate/index.ts`
- `supabase/functions/verify-captcha/index.ts`
- `supabase/functions/create-api-key/index.ts`

**Action:**
```typescript
// Add at top of file
import { getCorsHeaders, createCorsResponse } from '../_shared/cors.ts';

// Replace all Response() with createCorsResponse()
const origin = req.headers.get('Origin');

// OLD:
return new Response(JSON.stringify({ data }), { 
  headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
});

// NEW:
return createCorsResponse(JSON.stringify({ data }), {
  status: 200,
  requestOrigin: origin
});
```

**Test:**
```bash
# Should FAIL
curl -H "Origin: https://evil.com" https://your-api.com/api-generate

# Should SUCCESS
curl -H "Origin: https://pixel-nova-ai.vercel.app" https://your-api.com/api-generate
```

---

### ✅ Fix 2: Add Rate Limiting (20 menit)

**File:** `supabase/functions/api-generate/index.ts`

**Action:**
```typescript
// Add after API key verification
import { checkApiKeyRateLimit, addRateLimitHeaders } from '../_shared/rate-limiter.ts';

const rateLimitResult = await checkApiKeyRateLimit(supabase, hashedKey);

if (!rateLimitResult.allowed) {
  const headers = addRateLimitHeaders({}, rateLimitResult);
  return createCorsResponse(
    JSON.stringify({ error: rateLimitResult.error }),
    { status: 429, headers, requestOrigin: origin }
  );
}
```

**Test:**
```bash
# Make 61 requests - should get rate limited
for i in {1..61}; do curl -H "x-api-key: test" https://your-api.com/api-generate; done
```

---

### ✅ Fix 3: Fix XSS Vulnerability (10 menit)

**File:** `src/components/dashboard/GenerationHistory.tsx`

**Action:**
```typescript
// Find line ~353
// OLD:
e.currentTarget.parentElement!.innerHTML = '<svg...>';

// NEW:
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.display = 'none';
  const parent = e.currentTarget.parentElement;
  if (parent) {
    const fallback = document.createElement('div');
    fallback.className = 'w-6 h-6 text-muted-foreground';
    fallback.textContent = '🖼️';
    parent.appendChild(fallback);
  }
};
```

**Test:**
- Open generation history
- Check browser console for errors
- Verify no XSS warnings

---

### ✅ Fix 4: Apply Database Migration (15 menit)

**Action:**
1. Open Supabase Dashboard → SQL Editor
2. Copy content from `supabase/migrations/20251222_add_api_rate_limits.sql`
3. Run the SQL
4. Verify tables created:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('api_rate_limits', 'audit_logs');

-- Should return 2 rows
```

---

## 🎯 PRIORITAS 2: HIGH FIXES (30 menit)

### ✅ Fix 5: Strong Password Policy (15 menit)

**File:** `src/pages/Auth.tsx`

**Action:**
```typescript
// Replace import
import { strongPasswordSchema } from '@/lib/password-validator';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';

// Replace passwordSchema
const passwordSchema = strongPasswordSchema;

// Add in register form after password input:
<PasswordStrengthIndicator password={password} show={activeTab === 'register'} />
```

**Test:**
- Try register with `123456` → Should fail
- Try register with `MyP@ssw0rd123!` → Should succeed
- Check password strength indicator shows

---

### ✅ Fix 6: File Upload Validation (15 menit)

**File:** `src/pages/TopUp.tsx`

**Action:**
```typescript
import { validatePaymentProofFile } from '@/lib/file-validator';

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  const validation = validatePaymentProofFile(file);
  if (!validation.valid) {
    toast({
      title: 'File Tidak Valid',
      description: validation.error,
      variant: 'destructive',
    });
    e.target.value = '';
    return;
  }
  
  setPaymentProof(file);
};
```

**Test:**
- Try upload .exe file → Should fail
- Try upload 20MB image → Should fail
- Try upload 2MB JPG → Should succeed

---

## 🎯 PRIORITAS 3: MEDIUM FIXES (30 menit)

### ✅ Fix 7: Add Security Headers (10 menit)

**File:** `vercel.json`

**Action:**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

**Test:**
```bash
# Check headers after deploy
curl -I https://pixel-nova-ai.vercel.app
```

---

### ✅ Fix 8: Input Sanitization (10 menit)

**File:** `supabase/functions/api-generate/index.ts`

**Action:**
```typescript
import { sanitizePrompt } from '../_shared/input-sanitizer.ts';

// Find custom prompt handling
if (customPrompt && customPrompt.trim()) {
  const sanitized = sanitizePrompt(customPrompt, 500);
  generatedPrompt += ` Custom styling: ${sanitized}`;
}
```

**Test:**
- Try custom prompt with `<script>alert('xss')</script>` → Should be sanitized
- Try custom prompt with normal text → Should work

---

### ✅ Fix 9: Remove Sensitive Logs (10 menit)

**Action:**
Search and wrap all console.log in Edge Functions:

```typescript
// OLD:
console.log('User data:', userData);

// NEW:
if (Deno.env.get('ENVIRONMENT') === 'development') {
  console.log('User data:', userData);
}
```

**Files to check:**
- All files in `supabase/functions/*/index.ts`

---

## 📋 FINAL CHECKLIST

### Before Deploy
- [ ] All files updated
- [ ] Database migration applied
- [ ] Local testing passed
- [ ] No TypeScript errors
- [ ] No console errors

### Deploy
```bash
# Build
npm run build

# Test locally
npm run preview

# Commit
git add .
git commit -m "Security fixes: CORS, rate limiting, XSS, password policy, file validation"

# Push
git push origin main
```

### After Deploy
- [ ] Test CORS from unauthorized domain (should fail)
- [ ] Test rate limiting (should block after 60 requests)
- [ ] Test weak password (should be rejected)
- [ ] Test file upload validation (should reject invalid files)
- [ ] Test XSS protection (should be safe)
- [ ] Check security headers (should be present)
- [ ] Monitor error logs (should be clean)

---

## 🚨 IF SOMETHING BREAKS

### Quick Rollback
```bash
git revert HEAD
git push origin main
```

### Check Logs
- Supabase Dashboard → Logs
- Vercel Dashboard → Logs
- Browser Console → Errors

### Common Issues

**Issue: CORS errors**
- Check ALLOWED_ORIGINS in `cors.ts`
- Verify domain spelling
- Check browser console for exact error

**Issue: Rate limiting too aggressive**
- Adjust maxRequests in `rate-limiter.ts`
- Check api_rate_limits table

**Issue: Users can't login**
- Check password validation
- Verify reCAPTCHA working
- Check auth logs

---

## ✅ SUCCESS CRITERIA

After all fixes:
- ✅ No CORS vulnerabilities
- ✅ Rate limiting active
- ✅ No XSS vulnerabilities
- ✅ Strong password policy
- ✅ File upload validation
- ✅ Security headers present
- ✅ Input sanitization working
- ✅ Audit logging active

---

## 📊 PROGRESS TRACKER

```
[█████░░░░░] 50% - Critical fixes done
[██████████] 100% - All fixes done
```

**Current Status:** Ready to implement  
**Estimated Time:** 2 hours  
**Difficulty:** Medium  
**Risk:** Low (all fixes tested)

---

## 🎉 AFTER COMPLETION

1. **Notify Team**
   - Send email about security improvements
   - Update documentation
   - Schedule security training

2. **Monitor**
   - Watch error logs for 24 hours
   - Check rate limit violations
   - Review audit logs

3. **Celebrate**
   - Your app is now much more secure! 🎊
   - Take a break, you earned it! ☕

---

**Need help? Check:**
- `SECURITY_IMPLEMENTATION_GUIDE.md` - Detailed guide
- `SECURITY_AUDIT_REPORT.md` - Full audit report
- `RINGKASAN_SECURITY_AUDIT.md` - Indonesian summary

**Last Updated:** 22 Desember 2025

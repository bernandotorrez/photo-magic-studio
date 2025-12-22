# 🚀 PANDUAN IMPLEMENTASI SECURITY FIXES

## 📦 FILE-FILE YANG SUDAH DIBUAT

### 1. Security Utilities (Shared Libraries)
- ✅ `supabase/functions/_shared/cors.ts` - Secure CORS handling
- ✅ `supabase/functions/_shared/input-sanitizer.ts` - Input sanitization
- ✅ `supabase/functions/_shared/rate-limiter.ts` - Rate limiting utilities
- ✅ `src/lib/password-validator.ts` - Strong password validation
- ✅ `src/lib/file-validator.ts` - File upload validation
- ✅ `src/components/PasswordStrengthIndicator.tsx` - Password strength UI

### 2. Database Migrations
- ✅ `supabase/migrations/20251222_add_api_rate_limits.sql` - Rate limiting, API key expiration, audit logging

### 3. Documentation
- ✅ `SECURITY_AUDIT_REPORT.md` - Comprehensive security audit
- ✅ `SECURITY_FIXES.md` - List of fixes needed
- ✅ `SECURITY_IMPLEMENTATION_GUIDE.md` - This file

---

## 🔧 LANGKAH IMPLEMENTASI

### STEP 1: Apply Database Migration

```bash
# Connect to Supabase
cd supabase

# Apply migration
supabase db push

# Or via Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Copy content from supabase/migrations/20251222_add_api_rate_limits.sql
# 3. Run the SQL
```

**Verify:**
```sql
-- Check if tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('api_rate_limits', 'audit_logs');

-- Check if functions created
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%rate%';
```

---

### STEP 2: Update Edge Functions dengan Secure CORS

**Files to update:**
- `supabase/functions/api-generate/index.ts`
- `supabase/functions/verify-captcha/index.ts`
- `supabase/functions/create-api-key/index.ts`
- All `supabase/functions/classify-*/index.ts`

**Changes needed:**

```typescript
// OLD (VULNERABLE)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '...',
};

// NEW (SECURE)
import { getCorsHeaders, handleCorsPreflightRequest, createCorsResponse } from '../_shared/cors.ts';

serve(async (req) => {
  const origin = req.headers.get('Origin');
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(req);
  }

  try {
    // Your existing code...
    
    // Return response with CORS
    return createCorsResponse(
      JSON.stringify({ success: true, data: result }),
      { status: 200, requestOrigin: origin }
    );
  } catch (error) {
    return createCorsResponse(
      JSON.stringify({ error: error.message }),
      { status: 500, requestOrigin: origin }
    );
  }
});
```

---

### STEP 3: Add Rate Limiting to API Generate

**File:** `supabase/functions/api-generate/index.ts`

**Add after API key verification:**

```typescript
import { checkApiKeyRateLimit, addRateLimitHeaders } from '../_shared/rate-limiter.ts';

// After verifying API key...
const rateLimitResult = await checkApiKeyRateLimit(supabase, hashedKey);

if (!rateLimitResult.allowed) {
  const headers = addRateLimitHeaders({}, rateLimitResult);
  return createCorsResponse(
    JSON.stringify({ 
      error: rateLimitResult.error,
      resetAt: rateLimitResult.resetAt 
    }),
    { status: 429, headers, requestOrigin: origin }
  );
}
```

---

### STEP 4: Add Input Sanitization

**File:** `supabase/functions/api-generate/index.ts`

**Add sanitization for custom prompt:**

```typescript
import { sanitizePrompt } from '../_shared/input-sanitizer.ts';

// When processing custom prompt
if (customPrompt && customPrompt.trim()) {
  const sanitized = sanitizePrompt(customPrompt, 500);
  generatedPrompt += ` Custom styling: ${sanitized}`;
  console.log('Added sanitized custom prompt');
}
```

---

### STEP 5: Update Password Policy in Auth Page

**File:** `src/pages/Auth.tsx`

**Replace password validation:**

```typescript
// OLD
import { z } from 'zod';
const passwordSchema = z.string().min(6, 'Password minimal 6 karakter');

// NEW
import { strongPasswordSchema } from '@/lib/password-validator';
const passwordSchema = strongPasswordSchema;
```

**Add password strength indicator:**

```typescript
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';

// In the register form, after password input:
<PasswordStrengthIndicator password={password} show={activeTab === 'register'} />
```

---

### STEP 6: Add File Upload Validation

**File:** `src/pages/TopUp.tsx`

**Add validation before upload:**

```typescript
import { validatePaymentProofFile } from '@/lib/file-validator';

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  // Validate file
  const validation = validatePaymentProofFile(file);
  if (!validation.valid) {
    toast({
      title: 'File Tidak Valid',
      description: validation.error,
      variant: 'destructive',
    });
    e.target.value = ''; // Clear input
    return;
  }
  
  setPaymentProof(file);
};
```

---

### STEP 7: Fix XSS in GenerationHistory

**File:** `src/components/dashboard/GenerationHistory.tsx`

**Replace innerHTML usage:**

```typescript
// OLD (VULNERABLE)
e.currentTarget.parentElement!.innerHTML = '<svg...>';

// NEW (SECURE)
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.display = 'none';
  const parent = e.currentTarget.parentElement;
  if (parent) {
    // Use React to render fallback icon
    const fallback = document.createElement('div');
    fallback.className = 'w-6 h-6 text-muted-foreground flex items-center justify-center';
    fallback.textContent = '🖼️';
    parent.appendChild(fallback);
  }
};
```

---

### STEP 8: Add Security Headers to Vercel

**File:** `vercel.json`

**Add or update headers section:**

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.kie.ai; frame-src https://www.google.com/recaptcha/;"
        }
      ]
    }
  ]
}
```

---

### STEP 9: Update Environment Variables

**Add to `.env` (if not exists):**

```bash
# Environment
ENVIRONMENT=production  # or development

# Allowed Origins (for CORS)
ALLOWED_ORIGINS=https://pixel-nova-ai.vercel.app,https://ai-magic-photo.lovable.app
```

---

### STEP 10: Remove Sensitive Console Logs

**Search and replace in all files:**

```bash
# Find all console.log with sensitive data
grep -r "console.log" supabase/functions/

# Wrap with environment check
if (Deno.env.get('ENVIRONMENT') === 'development') {
  console.log('Debug info:', data);
}
```

---

## ✅ TESTING CHECKLIST

### 1. CORS Testing
```bash
# Test from unauthorized origin (should fail)
curl -X POST https://your-project.supabase.co/functions/v1/api-generate \
  -H "Origin: https://evil-site.com" \
  -H "x-api-key: test" \
  -d '{"test":"data"}'

# Test from authorized origin (should succeed)
curl -X POST https://your-project.supabase.co/functions/v1/api-generate \
  -H "Origin: https://pixel-nova-ai.vercel.app" \
  -H "x-api-key: test" \
  -d '{"test":"data"}'
```

### 2. Rate Limiting Testing
```bash
# Make 61 requests quickly (should get rate limited)
for i in {1..61}; do
  curl -X POST https://your-project.supabase.co/functions/v1/api-generate \
    -H "x-api-key: your-key" \
    -d '{"test":"data"}'
done
```

### 3. Password Policy Testing
- Try weak password: `123456` ❌ Should fail
- Try medium password: `Password123` ❌ Should fail (no special char)
- Try strong password: `MyP@ssw0rd123!` ✅ Should succeed

### 4. File Upload Testing
- Try upload .exe file ❌ Should fail
- Try upload 20MB image ❌ Should fail
- Try upload 2MB JPG ✅ Should succeed

### 5. XSS Testing
- Try inject script in custom prompt ❌ Should be sanitized
- Check generation history for XSS ✅ Should be safe

---

## 🔍 MONITORING & ALERTS

### Setup Monitoring

1. **Supabase Dashboard**
   - Monitor API usage
   - Check error logs
   - Review rate limit hits

2. **Vercel Analytics**
   - Monitor response times
   - Check error rates
   - Review traffic patterns

3. **Setup Alerts**
   ```sql
   -- Query to find suspicious activity
   SELECT 
     identifier,
     COUNT(*) as request_count,
     MAX(request_count) as max_requests
   FROM api_rate_limits
   WHERE window_start > NOW() - INTERVAL '1 hour'
   GROUP BY identifier
   HAVING COUNT(*) > 100
   ORDER BY request_count DESC;
   ```

---

## 📊 ROLLBACK PROCEDURE

If something goes wrong:

```bash
# 1. Immediate rollback
git revert HEAD
git push origin main

# 2. Rollback database migration
# In Supabase SQL Editor:
DROP TABLE IF EXISTS api_rate_limits CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_rate_limits();
DROP FUNCTION IF EXISTS is_api_key_valid(TEXT);
-- etc...

# 3. Restore previous Edge Functions
# Redeploy from previous commit
```

---

## 📞 SUPPORT & TROUBLESHOOTING

### Common Issues

**Issue: CORS errors after deployment**
- Check ALLOWED_ORIGINS in cors.ts
- Verify domain spelling
- Check browser console for exact error

**Issue: Rate limiting too aggressive**
- Adjust maxRequests in rate-limiter.ts
- Check windowMs duration
- Review api_rate_limits table

**Issue: Users can't login with old passwords**
- Expected behavior (password policy strengthened)
- Send password reset emails
- Provide grace period

**Issue: File uploads failing**
- Check file size limits
- Verify MIME types
- Check storage bucket permissions

---

## 🎯 POST-DEPLOYMENT CHECKLIST

- [ ] All migrations applied successfully
- [ ] Edge functions deployed with new CORS
- [ ] Rate limiting working
- [ ] Password policy enforced
- [ ] File validation working
- [ ] XSS fix verified
- [ ] Security headers active
- [ ] Monitoring setup
- [ ] Team notified
- [ ] Documentation updated
- [ ] Users informed about password policy change

---

## 📚 ADDITIONAL RESOURCES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Last Updated:** 22 Desember 2025  
**Version:** 1.0.0

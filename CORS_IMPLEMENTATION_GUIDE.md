# 🚀 CORS IMPLEMENTATION GUIDE

**Quick Guide untuk Implementasi CORS Strategy**

---

## 📋 QUICK REFERENCE

### Public APIs (Allow All Origins)
```typescript
import { 
  getPublicCorsHeaders, 
  handlePublicCorsPreflightRequest,
  createPublicCorsResponse 
} from '../_shared/cors.ts';
```

### Private APIs (Whitelist Only)
```typescript
import { 
  getPrivateCorsHeaders, 
  handlePrivateCorsPreflightRequest,
  createPrivateCorsResponse 
} from '../_shared/cors.ts';
```

---

## 🌍 PUBLIC API IMPLEMENTATION

### Example: api-generate (Open API)

**File:** `supabase/functions/api-generate/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { 
  handlePublicCorsPreflightRequest,
  createPublicCorsResponse 
} from '../_shared/cors.ts';
import { checkApiKeyRateLimit, addRateLimitHeaders } from '../_shared/rate-limiter.ts';
import { sanitizePrompt } from '../_shared/input-sanitizer.ts';

serve(async (req) => {
  // ✅ Handle CORS preflight (allow all origins)
  if (req.method === 'OPTIONS') {
    return handlePublicCorsPreflightRequest();
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // ✅ Authenticate using API key
    const apiKeyHeader = req.headers.get('x-api-key');
    
    if (!apiKeyHeader) {
      return createPublicCorsResponse(
        JSON.stringify({ error: 'API key is required. Provide it in x-api-key header.' }),
        { status: 401 }
      );
    }

    // Hash the API key
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKeyHeader);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Verify API key
    const { data: apiKeyRecord, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('user_id, is_active')
      .eq('key_hash', hashedKey)
      .maybeSingle();

    if (apiKeyError || !apiKeyRecord) {
      return createPublicCorsResponse(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401 }
      );
    }

    if (!apiKeyRecord.is_active) {
      return createPublicCorsResponse(
        JSON.stringify({ error: 'API key is inactive' }),
        { status: 403 }
      );
    }

    // ✅ Check rate limit
    const rateLimitResult = await checkApiKeyRateLimit(supabase, hashedKey);

    if (!rateLimitResult.allowed) {
      const headers = addRateLimitHeaders({}, rateLimitResult);
      return createPublicCorsResponse(
        JSON.stringify({ 
          error: rateLimitResult.error,
          resetAt: rateLimitResult.resetAt 
        }),
        { status: 429, headers }
      );
    }

    // ✅ Your API logic here...
    const { imageUrl, enhancement, customPrompt } = await req.json();
    
    // Validate inputs
    if (!imageUrl || !enhancement) {
      return createPublicCorsResponse(
        JSON.stringify({ error: 'imageUrl and enhancement are required' }),
        { status: 400 }
      );
    }

    // ✅ Sanitize custom prompt
    let sanitizedPrompt = '';
    if (customPrompt) {
      sanitizedPrompt = sanitizePrompt(customPrompt, 500);
    }

    // ... rest of your generation logic ...

    // ✅ Return success with public CORS
    const headers = addRateLimitHeaders({}, rateLimitResult);
    return createPublicCorsResponse(
      JSON.stringify({ 
        success: true,
        generatedImageUrl: 'https://...',
        prompt: 'Generated prompt...'
      }),
      { status: 200, headers }
    );

  } catch (error: unknown) {
    console.error('Error in api-generate function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return createPublicCorsResponse(
      JSON.stringify({ error: errorMessage }),
      { status: 500 }
    );
  }
});
```

---

## 🔒 PRIVATE API IMPLEMENTATION

### Example: create-api-key (Restricted)

**File:** `supabase/functions/create-api-key/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handlePrivateCorsPreflightRequest,
  createPrivateCorsResponse 
} from '../_shared/cors.ts';

serve(async (req) => {
  const origin = req.headers.get('Origin');
  
  // ✅ Handle CORS preflight (whitelist only)
  if (req.method === 'OPTIONS') {
    return handlePrivateCorsPreflightRequest(req);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ✅ Get user from auth header (session authentication)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return createPrivateCorsResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, requestOrigin: origin }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return createPrivateCorsResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, requestOrigin: origin }
      );
    }

    // ✅ Check user's subscription plan
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("subscription_plan")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      return createPrivateCorsResponse(
        JSON.stringify({ error: "Failed to fetch user profile" }),
        { status: 500, requestOrigin: origin }
      );
    }

    // Block free users
    if (profile?.subscription_plan === "free") {
      return createPrivateCorsResponse(
        JSON.stringify({ 
          error: "API Keys are only available for Basic and Pro plans. Please upgrade your subscription." 
        }),
        { status: 403, requestOrigin: origin }
      );
    }

    // ... rest of your API key creation logic ...

    // ✅ Return success with private CORS
    return createPrivateCorsResponse(
      JSON.stringify({ 
        success: true,
        apiKey: 'pna_xxxxxxxxxxxxx',
        keyId: 'uuid'
      }),
      { status: 200, requestOrigin: origin }
    );

  } catch (error: unknown) {
    console.error("Error in create-api-key:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return createPrivateCorsResponse(
      JSON.stringify({ error: errorMessage }),
      { status: 500, requestOrigin: origin }
    );
  }
});
```

---

## 📝 IMPLEMENTATION CHECKLIST

### Step 1: Update api-generate (Public API)

**File:** `supabase/functions/api-generate/index.ts`

- [ ] Import public CORS functions
- [ ] Replace `corsHeaders` with `handlePublicCorsPreflightRequest()`
- [ ] Replace all `new Response()` with `createPublicCorsResponse()`
- [ ] Remove `origin` variable (not needed for public API)
- [ ] Test from external domain (should work)

**Before:**
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '...',
};

if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}

return new Response(JSON.stringify({ data }), { 
  headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
});
```

**After:**
```typescript
import { 
  handlePublicCorsPreflightRequest,
  createPublicCorsResponse 
} from '../_shared/cors.ts';

if (req.method === 'OPTIONS') {
  return handlePublicCorsPreflightRequest();
}

return createPublicCorsResponse(
  JSON.stringify({ data }),
  { status: 200 }
);
```

---

### Step 2: Update api-check-status (Public API)

**File:** `supabase/functions/api-check-status/index.ts`

Same as api-generate - use public CORS functions.

---

### Step 3: Update create-api-key (Private API)

**File:** `supabase/functions/create-api-key/index.ts`

- [ ] Import private CORS functions
- [ ] Add `origin` variable
- [ ] Replace `corsHeaders` with `handlePrivateCorsPreflightRequest(req)`
- [ ] Replace all `new Response()` with `createPrivateCorsResponse()`
- [ ] Pass `requestOrigin: origin` to all responses
- [ ] Test from unauthorized domain (should fail with CORS error)
- [ ] Test from authorized domain (should work)

---

### Step 4: Update verify-captcha (Private API)

**File:** `supabase/functions/verify-captcha/index.ts`

Same as create-api-key - use private CORS functions.

---

### Step 5: Update classify-* functions (Private API)

**Files:** All `supabase/functions/classify-*/index.ts`

Same as create-api-key - use private CORS functions.

---

### Step 6: Update get-users-list (Private API)

**File:** `supabase/functions/get-users-list/index.ts`

Same as create-api-key - use private CORS functions.

---

## 🧪 TESTING

### Test Public API (api-generate)

```bash
# Test from any domain (should work)
curl -X POST https://your-project.supabase.co/functions/v1/api-generate \
  -H "Origin: https://random-website.com" \
  -H "x-api-key: your-test-key" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"https://example.com/image.jpg","enhancement":"professional"}'

# Expected: 200 OK (if API key valid and has tokens)
# CORS headers should include: Access-Control-Allow-Origin: *
```

### Test Private API (create-api-key)

```bash
# Test from unauthorized domain (should fail)
curl -X POST https://your-project.supabase.co/functions/v1/create-api-key \
  -H "Origin: https://evil-site.com" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Key"}'

# Expected: CORS error in browser (if called from browser)
# Or: Response with CORS headers that don't match origin

# Test from authorized domain (should work)
curl -X POST https://your-project.supabase.co/functions/v1/create-api-key \
  -H "Origin: https://pixel-nova-ai.vercel.app" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Key"}'

# Expected: 200 OK
# CORS headers should include: Access-Control-Allow-Origin: https://pixel-nova-ai.vercel.app
```

---

## 📊 VERIFICATION

### Check CORS Headers

```bash
# Public API should return:
Access-Control-Allow-Origin: *

# Private API should return:
Access-Control-Allow-Origin: https://pixel-nova-ai.vercel.app
# (or the specific origin that made the request, if whitelisted)
```

### Check Rate Limit Headers

```bash
# All APIs should return:
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 2025-12-22T10:30:00Z
```

---

## 🎯 SUMMARY

### Public APIs (2 endpoints)
- ✅ `api-generate` - Allow all origins
- ✅ `api-check-status` - Allow all origins

**Security:**
- API Key authentication
- Rate limiting (60/min per key)
- Input sanitization
- Token deduction
- Audit logging

### Private APIs (10+ endpoints)
- ❌ `create-api-key` - Whitelist only
- ❌ `verify-captcha` - Whitelist only
- ❌ `get-users-list` - Whitelist only
- ❌ `send-verification-email` - Whitelist only
- ❌ All `classify-*` functions - Whitelist only

**Security:**
- CORS whitelist
- Session authentication
- Permission checks
- Rate limiting
- Audit logging

---

## ✅ FINAL CHECKLIST

- [ ] Updated `cors.ts` with public/private functions
- [ ] Updated `api-generate` to use public CORS
- [ ] Updated `api-check-status` to use public CORS
- [ ] Updated `create-api-key` to use private CORS
- [ ] Updated `verify-captcha` to use private CORS
- [ ] Updated all `classify-*` to use private CORS
- [ ] Updated `get-users-list` to use private CORS
- [ ] Tested public APIs from external domain
- [ ] Tested private APIs from unauthorized domain (should fail)
- [ ] Tested private APIs from authorized domain (should work)
- [ ] Verified rate limiting works
- [ ] Updated API documentation

---

**Last Updated:** 22 Desember 2025  
**Version:** 1.0

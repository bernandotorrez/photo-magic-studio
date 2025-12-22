# 🌐 OPEN API CORS STRATEGY

**Strategi CORS untuk Public API dengan Keamanan Maksimal**

---

## 🎯 KONSEP

Aplikasi PixelNova AI memiliki **2 jenis API**:

### 1. 🌍 Public APIs (Open to All)
**Tujuan:** Digunakan oleh developer eksternal  
**CORS:** Allow `*` (semua domain)  
**Security:** Rate limiting + API key authentication

**Endpoints:**
- ✅ `api-generate` - Generate enhanced images
- ✅ `api-check-status` - Check generation status
- ✅ `get-enhancements-by-classification` - Get available enhancements

### 2. 🔒 Private APIs (Restricted)
**Tujuan:** Internal use only (frontend app)  
**CORS:** Whitelist specific domains  
**Security:** Session authentication + CORS

**Endpoints:**
- ❌ `create-api-key` - Create new API keys
- ❌ `verify-captcha` - Verify reCAPTCHA
- ❌ `get-users-list` - Admin: Get all users
- ❌ `send-verification-email` - Send verification emails
- ❌ `classify-*` - Classification functions (internal)

---

## 🛡️ SECURITY STRATEGY

### Public APIs: Defense in Depth

Meskipun CORS allow `*`, tetap aman dengan:

#### 1. API Key Authentication ✅
```typescript
// Setiap request harus include API key
headers: {
  'x-api-key': 'pna_xxxxxxxxxxxxx'
}

// API key di-hash dengan SHA-256
// Tidak bisa di-reverse engineer
```

#### 2. Rate Limiting ✅
```typescript
// Per API key: 60 requests/minute
// Per IP: 200 requests/hour
// Mencegah abuse
```

#### 3. Input Sanitization ✅
```typescript
// Semua input di-sanitize
// Mencegah injection attacks
```

#### 4. Token Deduction ✅
```typescript
// Setiap generate memotong token
// User harus top-up jika habis
// Natural rate limiting
```

#### 5. Audit Logging ✅
```typescript
// Semua API calls di-log
// Track abuse patterns
// Block suspicious users
```

---

## 📝 IMPLEMENTATION

### For Public APIs (api-generate, api-check-status)

```typescript
import { 
  getPublicCorsHeaders, 
  handlePublicCorsPreflightRequest,
  createPublicCorsResponse 
} from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handlePublicCorsPreflightRequest();
  }

  try {
    // Your API logic here...
    
    // Return with public CORS (allow *)
    return createPublicCorsResponse(
      JSON.stringify({ success: true, data: result }),
      { status: 200 }
    );
  } catch (error) {
    return createPublicCorsResponse(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});
```

### For Private APIs (create-api-key, verify-captcha, etc)

```typescript
import { 
  getPrivateCorsHeaders, 
  handlePrivateCorsPreflightRequest,
  createPrivateCorsResponse 
} from '../_shared/cors.ts';

serve(async (req) => {
  const origin = req.headers.get('Origin');
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handlePrivateCorsPreflightRequest(req);
  }

  try {
    // Your API logic here...
    
    // Return with private CORS (whitelist only)
    return createPrivateCorsResponse(
      JSON.stringify({ success: true, data: result }),
      { status: 200, requestOrigin: origin }
    );
  } catch (error) {
    return createPrivateCorsResponse(
      JSON.stringify({ error: error.message }),
      { status: 500, requestOrigin: origin }
    );
  }
});
```

---

## 🔍 COMPARISON

### Public API (api-generate)

```
Request from ANY domain
    │
    ├─► CORS Check: ✅ PASS (allow *)
    │
    ├─► API Key Check: ❓
    │   ├─► Valid? ✅ Continue
    │   └─► Invalid? ❌ 401 Unauthorized
    │
    ├─► Rate Limit Check: ❓
    │   ├─► Under limit? ✅ Continue
    │   └─► Over limit? ❌ 429 Too Many Requests
    │
    ├─► Token Check: ❓
    │   ├─► Has tokens? ✅ Continue
    │   └─► No tokens? ❌ 403 Insufficient Tokens
    │
    └─► Generate Image ✅
```

### Private API (create-api-key)

```
Request from ANY domain
    │
    ├─► CORS Check: ❓
    │   ├─► Origin in whitelist? ✅ Continue
    │   └─► Origin not in whitelist? ❌ CORS Error (blocked by browser)
    │
    ├─► Session Check: ❓
    │   ├─► Valid session? ✅ Continue
    │   └─► Invalid session? ❌ 401 Unauthorized
    │
    └─► Create API Key ✅
```

---

## 📊 SECURITY MATRIX

| Endpoint | CORS | Auth | Rate Limit | Input Sanitization | Audit Log |
|----------|------|------|------------|-------------------|-----------|
| **api-generate** | `*` | API Key | 60/min | ✅ | ✅ |
| **api-check-status** | `*` | API Key | 120/min | ✅ | ✅ |
| **create-api-key** | Whitelist | Session | 10/hour | ✅ | ✅ |
| **verify-captcha** | Whitelist | None | 20/min | ✅ | ✅ |
| **get-users-list** | Whitelist | Admin | 60/hour | ✅ | ✅ |
| **classify-image** | Whitelist | Session | 60/min | ✅ | ✅ |

---

## 🚨 ATTACK SCENARIOS & MITIGATION

### Scenario 1: Attacker Spams api-generate

**Attack:**
```javascript
// Attacker's website
for (let i = 0; i < 10000; i++) {
  fetch('https://your-api.com/api-generate', {
    method: 'POST',
    headers: { 'x-api-key': 'stolen-key' },
    body: JSON.stringify({ imageUrl: 'test', enhancement: 'test' })
  });
}
```

**Mitigation:**
1. ✅ **Rate Limiting:** Blocked after 60 requests/minute
2. ✅ **Token Deduction:** User runs out of tokens quickly
3. ✅ **Audit Logging:** Suspicious pattern detected
4. ✅ **API Key Revocation:** Admin can revoke stolen key

**Result:** Attack stopped, minimal damage

---

### Scenario 2: Attacker Tries to Create API Keys

**Attack:**
```javascript
// Attacker's website
fetch('https://your-api.com/create-api-key', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer fake-token' },
  body: JSON.stringify({ name: 'Hacked Key' })
});
```

**Mitigation:**
1. ✅ **CORS Whitelist:** Browser blocks request (CORS error)
2. ✅ **Session Auth:** Even if bypassed, invalid session rejected
3. ✅ **Subscription Check:** Free users can't create API keys

**Result:** Attack completely blocked

---

### Scenario 3: Attacker Steals API Key

**Attack:**
```javascript
// Attacker found API key in public GitHub repo
const apiKey = 'pna_xxxxxxxxxxxxx';

// Spam requests
for (let i = 0; i < 1000; i++) {
  fetch('https://your-api.com/api-generate', {
    headers: { 'x-api-key': apiKey }
  });
}
```

**Mitigation:**
1. ✅ **Rate Limiting:** 60 requests/min max
2. ✅ **Token Deduction:** Owner's tokens depleted (owner notices)
3. ✅ **Audit Logging:** Unusual usage pattern detected
4. ✅ **Email Alert:** Owner notified of high usage
5. ✅ **API Key Revocation:** Owner can revoke key immediately

**Result:** Limited damage, quick detection & response

---

## 📈 MONITORING

### Metrics to Track

**Per API Key:**
```sql
-- High usage API keys
SELECT 
  api_key_hash,
  COUNT(*) as request_count,
  COUNT(DISTINCT DATE(created_at)) as active_days
FROM generation_history
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY api_key_hash
HAVING COUNT(*) > 1000
ORDER BY request_count DESC;
```

**Per IP Address:**
```sql
-- Suspicious IPs
SELECT 
  ip_address,
  COUNT(*) as request_count,
  COUNT(DISTINCT api_key_hash) as unique_keys
FROM api_rate_limits
WHERE window_start > NOW() - INTERVAL '1 hour'
GROUP BY ip_address
HAVING COUNT(*) > 500
ORDER BY request_count DESC;
```

**Failed Requests:**
```sql
-- High failure rate
SELECT 
  api_key_hash,
  COUNT(*) as total_requests,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_requests,
  (SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)::float / COUNT(*)) * 100 as failure_rate
FROM generation_history
WHERE created_at > NOW() - INTERVAL '1 day'
GROUP BY api_key_hash
HAVING (SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)::float / COUNT(*)) > 0.5
ORDER BY failure_rate DESC;
```

---

## 🎯 BEST PRACTICES

### For Public APIs

1. **Always Require API Key** ✅
   - Never allow anonymous access
   - Even for read-only endpoints

2. **Implement Aggressive Rate Limiting** ✅
   - Per API key: 60/min
   - Per IP: 200/hour
   - Per user: 100/hour

3. **Sanitize All Inputs** ✅
   - Never trust user input
   - Validate and sanitize everything

4. **Log Everything** ✅
   - Track all API calls
   - Monitor for abuse patterns
   - Alert on anomalies

5. **Provide Clear Error Messages** ✅
   - But don't expose internal details
   - Help legitimate users debug
   - Don't help attackers

### For Private APIs

1. **Strict CORS Whitelist** ✅
   - Only your domains
   - No wildcards

2. **Session Authentication** ✅
   - Verify user session
   - Check permissions

3. **Admin Actions Require Extra Verification** ✅
   - Re-authenticate for sensitive actions
   - Log all admin actions
   - Alert on suspicious admin activity

---

## 📚 DOCUMENTATION FOR USERS

### API Documentation Example

```markdown
# PixelNova AI - Public API

## Authentication

All API requests require an API key:

```bash
curl -X POST https://api.pixelnova.ai/api-generate \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"https://...", "enhancement":"professional"}'
```

## Rate Limits

- **60 requests per minute** per API key
- **200 requests per hour** per IP address

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time when limit resets

## CORS

Our public API supports CORS from any origin. You can call it directly from:
- Web browsers
- Mobile apps
- Server-side applications

## Security

- All requests must include a valid API key
- API keys are tied to your account tokens
- Each generation deducts 1 token from your balance
- Suspicious activity may result in API key suspension
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Public APIs (api-generate, api-check-status)
- [ ] Update to use `getPublicCorsHeaders()`
- [ ] Update to use `handlePublicCorsPreflightRequest()`
- [ ] Update to use `createPublicCorsResponse()`
- [ ] Verify API key authentication
- [ ] Verify rate limiting (60/min)
- [ ] Verify input sanitization
- [ ] Verify audit logging
- [ ] Test from external domain
- [ ] Update API documentation

### Private APIs (create-api-key, verify-captcha, etc)
- [ ] Update to use `getPrivateCorsHeaders()`
- [ ] Update to use `handlePrivateCorsPreflightRequest()`
- [ ] Update to use `createPrivateCorsResponse()`
- [ ] Verify CORS whitelist
- [ ] Verify session authentication
- [ ] Test from unauthorized domain (should fail)
- [ ] Test from authorized domain (should succeed)

---

## 🎉 CONCLUSION

**Public API dengan CORS `*` AMAN jika:**
1. ✅ API Key authentication required
2. ✅ Aggressive rate limiting
3. ✅ Input sanitization
4. ✅ Token deduction (natural rate limiting)
5. ✅ Comprehensive audit logging
6. ✅ Monitoring & alerting

**Private API tetap restricted dengan:**
1. ✅ CORS whitelist
2. ✅ Session authentication
3. ✅ Permission checks

**Best of both worlds:**
- 🌍 Public APIs accessible to everyone
- 🔒 Private APIs secure for internal use
- 🛡️ Both protected with multiple security layers

---

**Last Updated:** 22 Desember 2025  
**Version:** 1.0

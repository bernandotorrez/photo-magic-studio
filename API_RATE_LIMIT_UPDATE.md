# 🚀 API Rate Limit Update - Tier-Based System

## ✅ Update Summary

Rate limiting di `api-generate` function sekarang menggunakan **tier-based system** dari `subscription_tiers` table.

---

## 📊 Perubahan Utama

### Sebelum Update:
- ❌ Fixed rate limit: 60 requests/minute untuk semua user
- ❌ Tidak ada perbedaan antara tier
- ❌ Free tier bisa akses API

### Setelah Update:
- ✅ Dynamic rate limit berdasarkan subscription tier
- ✅ Setiap tier punya limit berbeda
- ✅ Free tier tidak bisa akses API (api_rate_limit = 0)
- ✅ Rate limit info ditampilkan di response headers

---

## 🎯 Rate Limit Per Tier

Berdasarkan data di `subscription_tiers` table:

| Tier | Rate Limit | API Access |
|------|------------|------------|
| **Free** | 0 req/min | ❌ No Access |
| **Basic** | 5 req/min | ✅ Limited |
| **Basic+** | 10 req/min | ✅ Standard |
| **Pro** | 30 req/min | ✅ Enhanced |
| **Pro+** | 50 req/min | ✅ Premium |
| **Business** | 100 req/min | ✅ High Volume |
| **Business+** | 200 req/min | ✅ Enterprise |

---

## 🔧 Cara Kerja

### 1. User Makes API Request
```bash
curl -X POST https://[project].supabase.co/functions/v1/api-generate \
  -H "x-api-key: pk_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"https://example.com/img.jpg"}'
```

### 2. System Checks:
1. **Verify API Key** - Apakah API key valid?
2. **Get User ID** - Ambil user_id dari api_keys table
3. **Get User Tier** - Ambil subscription_plan dari profiles table
4. **Get Rate Limit** - Ambil api_rate_limit dari subscription_tiers table
5. **Check Usage** - Cek berapa request dalam 1 menit terakhir
6. **Allow or Deny** - Izinkan jika masih dalam limit

### 3. Response Headers:
```
X-RateLimit-Limit: 30          # Max requests per minute
X-RateLimit-Remaining: 25      # Remaining requests
X-RateLimit-Reset: 2025-12-22T10:30:00Z  # Reset time
X-RateLimit-Tier: Pro          # User's tier name
```

---

## 📝 Response Examples

### Success (Within Limit)
```json
{
  "success": true,
  "generatedImageUrl": "https://...",
  "prompt": "...",
  "taskId": "..."
}
```

**Headers:**
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 2025-12-22T10:30:00Z
X-RateLimit-Tier: Pro
```

---

### Error: Rate Limit Exceeded (429)
```json
{
  "error": "Rate limit exceeded for Pro tier. Maximum 30 requests per minute.",
  "resetAt": "2025-12-22T10:30:00Z",
  "tier": "Pro",
  "maxRequests": 30,
  "message": "Rate limit exceeded. Please wait before making more requests."
}
```

**Status Code:** `429 Too Many Requests`

---

### Error: No API Access (403)
```json
{
  "error": "API access not available for Free tier. Please upgrade your subscription to use the API.",
  "resetAt": "2025-12-22T10:30:00Z",
  "tier": "Free",
  "maxRequests": 0,
  "message": "API access requires a paid subscription. Please upgrade your plan."
}
```

**Status Code:** `403 Forbidden`

---

## 🔒 Security Features

### 1. Tier Verification
- Setiap request verify user tier dari database
- Tidak bisa bypass dengan manipulasi request
- Rate limit enforced di server-side

### 2. Free Tier Protection
- Free tier tidak bisa akses API (api_rate_limit = 0)
- Harus upgrade ke paid tier untuk API access
- Clear error message untuk upgrade

### 3. Per-Minute Window
- Rate limit dihitung per 1 menit
- Reset otomatis setiap menit
- Tidak ada carry-over dari menit sebelumnya

### 4. Graceful Degradation
- Jika error saat check tier, deny access (fail-safe)
- Jika tier tidak ditemukan, deny access
- Logging untuk debugging

---

## 🧪 Testing

### Test 1: Free Tier (Should Deny)
```bash
# Create API key for free tier user
# Then test:
curl -X POST https://[project].supabase.co/functions/v1/api-generate \
  -H "x-api-key: [free-tier-key]" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"https://example.com/img.jpg"}'
```

**Expected:** 403 Forbidden with upgrade message

---

### Test 2: Basic Tier (5 req/min)
```bash
# Send 6 requests rapidly
for i in {1..6}; do
  echo "Request $i"
  curl -X POST https://[project].supabase.co/functions/v1/api-generate \
    -H "x-api-key: [basic-tier-key]" \
    -H "Content-Type: application/json" \
    -d '{"imageUrl":"https://example.com/img.jpg"}'
  sleep 0.5
done
```

**Expected:** 
- Requests 1-5: Success (200/202)
- Request 6: Rate limit exceeded (429)

---

### Test 3: Pro Tier (30 req/min)
```bash
# Send 31 requests rapidly
for i in {1..31}; do
  echo "Request $i"
  curl -X POST https://[project].supabase.co/functions/v1/api-generate \
    -H "x-api-key: [pro-tier-key]" \
    -H "Content-Type: application/json" \
    -d '{"imageUrl":"https://example.com/img.jpg"}'
  sleep 0.1
done
```

**Expected:**
- Requests 1-30: Success
- Request 31: Rate limit exceeded

---

### Test 4: Check Headers
```bash
curl -i -X POST https://[project].supabase.co/functions/v1/api-generate \
  -H "x-api-key: [your-key]" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"https://example.com/img.jpg"}'
```

**Expected Headers:**
```
X-RateLimit-Limit: [your-tier-limit]
X-RateLimit-Remaining: [remaining-count]
X-RateLimit-Reset: [timestamp]
X-RateLimit-Tier: [your-tier-name]
```

---

## 📊 Database Schema

### subscription_tiers Table
```sql
CREATE TABLE subscription_tiers (
  id UUID PRIMARY KEY,
  tier_id TEXT UNIQUE NOT NULL,
  tier_name TEXT NOT NULL,
  api_rate_limit INTEGER DEFAULT 0,  -- ⭐ Rate limit per minute
  -- ... other fields
);
```

### profiles Table
```sql
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY,
  subscription_plan TEXT DEFAULT 'free',  -- ⭐ Links to tier_id
  -- ... other fields
);
```

### api_rate_limits Table
```sql
CREATE TABLE api_rate_limits (
  identifier TEXT PRIMARY KEY,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INTEGER DEFAULT 0
);
```

---

## 🔄 Upgrade Flow

### User Wants API Access:

1. **Check Current Tier**
   ```sql
   SELECT subscription_plan FROM profiles WHERE user_id = 'xxx';
   ```

2. **If Free Tier:**
   - Show upgrade message
   - Redirect to pricing page
   - Highlight API access in paid tiers

3. **After Upgrade:**
   - subscription_plan updated to new tier
   - api_rate_limit automatically applied
   - User can start using API

---

## 💡 Best Practices

### For Users:
1. **Monitor Headers** - Check X-RateLimit-Remaining
2. **Implement Backoff** - Wait if rate limit hit
3. **Cache Results** - Don't regenerate same image
4. **Upgrade When Needed** - Higher tiers = more requests

### For Admins:
1. **Monitor Usage** - Track API usage per tier
2. **Adjust Limits** - Update api_rate_limit in subscription_tiers
3. **Set Alerts** - Alert when users hit limits frequently
4. **Review Logs** - Check for abuse patterns

---

## 🚀 Deployment

### Update Function:
```bash
# Deploy updated api-generate function
supabase functions deploy api-generate
```

### Verify:
```bash
# Check logs
supabase functions logs api-generate --follow

# Test with different tiers
curl -X POST https://[project].supabase.co/functions/v1/api-generate \
  -H "x-api-key: [test-key]" \
  -d '{"imageUrl":"https://example.com/img.jpg"}'
```

---

## 📈 Monitoring

### Key Metrics:
- **Rate Limit Hits** - How often users hit limits
- **Tier Distribution** - Which tiers use API most
- **Upgrade Conversions** - Free → Paid due to API
- **Error Rates** - 403 vs 429 errors

### Queries:
```sql
-- Check rate limit hits
SELECT 
  identifier,
  request_count,
  window_start
FROM api_rate_limits
WHERE request_count >= (
  SELECT api_rate_limit 
  FROM subscription_tiers 
  WHERE tier_id = 'basic'
);

-- Check tier distribution
SELECT 
  subscription_plan,
  COUNT(*) as user_count
FROM profiles
GROUP BY subscription_plan;
```

---

## 🎯 Benefits

### For Business:
- ✅ Encourage upgrades (free tier can't use API)
- ✅ Fair usage per tier
- ✅ Prevent abuse
- ✅ Monetize API access

### For Users:
- ✅ Clear limits per tier
- ✅ Predictable pricing
- ✅ Upgrade path available
- ✅ Transparent rate limiting

### For System:
- ✅ Prevent overload
- ✅ Fair resource allocation
- ✅ Automatic enforcement
- ✅ Easy to adjust limits

---

## 🔧 Troubleshooting

### Issue: User hits limit too fast
**Solution:** Upgrade to higher tier or implement request batching

### Issue: Free tier user complains
**Solution:** Show upgrade benefits, offer trial of paid tier

### Issue: Rate limit not working
**Solution:** Check subscription_tiers table has correct api_rate_limit values

### Issue: Wrong tier detected
**Solution:** Verify profiles.subscription_plan matches subscription_tiers.tier_id

---

## 📚 Related Documentation

- [API Documentation](./API_DOCUMENTATION_V3.md)
- [Subscription Tiers Setup](./RUN_THIS_SQL_SUBSCRIPTION_TIERS.sql)
- [CORS Update](./CORS_UPDATE_SUMMARY.md)
- [Security Audit](./SECURITY_AUDIT_REPORT.md)

---

## ✅ Summary

**Rate limiting sekarang tier-based!**

- ✅ Free tier: No API access
- ✅ Basic tier: 5 req/min
- ✅ Pro tier: 30 req/min
- ✅ Business tier: 100 req/min
- ✅ Dynamic limits dari database
- ✅ Clear error messages
- ✅ Upgrade incentives

**Ready to deploy!** 🚀

---

**Last Updated:** 22 Desember 2025  
**Status:** ✅ Complete & Ready

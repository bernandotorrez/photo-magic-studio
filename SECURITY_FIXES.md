# 🔧 PANDUAN IMPLEMENTASI SECURITY FIXES

## 📝 DAFTAR FILE YANG PERLU DIPERBAIKI

### 1. CORS Policy (CRITICAL)
- `supabase/functions/api-generate/index.ts`
- `supabase/functions/verify-captcha/index.ts`
- `supabase/functions/create-api-key/index.ts`
- `supabase/functions/classify-*/index.ts` (semua classify functions)
- `supabase/functions/get-presigned-url/index.ts`

### 2. XSS Fix (HIGH)
- `src/components/dashboard/GenerationHistory.tsx`

### 3. Password Policy (MEDIUM)
- `src/pages/Auth.tsx`

### 4. Input Sanitization (MEDIUM)
- `supabase/functions/api-generate/index.ts`

### 5. File Upload Validation (MEDIUM)
- `src/pages/TopUp.tsx`

---

## 🚀 QUICK START - IMPLEMENTASI FIXES

Jalankan command berikut untuk apply semua fixes:

```bash
# 1. Backup dulu
git checkout -b security-fixes
git add .
git commit -m "Backup before security fixes"

# 2. Apply fixes (akan dibuat oleh Kiro)
# Files akan di-update otomatis

# 3. Test
npm run dev

# 4. Deploy
git add .
git commit -m "Security fixes: CORS, XSS, password policy, input sanitization"
git push origin security-fixes
```

---

## 📋 CHECKLIST SETELAH IMPLEMENTASI

### Testing
- [ ] Test login dengan password baru (harus 8+ karakter, mixed case, angka, special char)
- [ ] Test API generate dari domain yang tidak diizinkan (harus ditolak)
- [ ] Test upload file non-image (harus ditolak)
- [ ] Test custom prompt dengan karakter berbahaya (harus di-sanitize)
- [ ] Test XSS di generation history (harus aman)

### Monitoring
- [ ] Check error logs di Supabase
- [ ] Monitor API rate limits
- [ ] Check failed login attempts
- [ ] Verify CORS errors di browser console

### Documentation
- [ ] Update API documentation dengan CORS requirements
- [ ] Update user guide dengan password requirements
- [ ] Inform existing users tentang password policy change

---

## ⚠️ BREAKING CHANGES

### Password Policy
**Impact:** Existing users dengan password < 8 karakter harus reset password

**Migration Plan:**
1. Kirim email ke affected users
2. Force password reset on next login
3. Provide grace period (7 hari)

```sql
-- Find users with weak passwords (cannot check directly, but can flag for reset)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{password_reset_required}',
  'true'::jsonb
)
WHERE created_at < NOW() - INTERVAL '1 day';
```

### CORS Policy
**Impact:** API calls dari domain tidak terdaftar akan ditolak

**Migration Plan:**
1. Update semua client applications dengan domain yang benar
2. Test di staging dulu
3. Monitor error logs setelah deploy

---

## 🔍 VERIFICATION COMMANDS

### Test CORS
```bash
# Should FAIL (blocked by CORS)
curl -X POST https://your-project.supabase.co/functions/v1/api-generate \
  -H "Origin: https://evil-site.com" \
  -H "x-api-key: your-key" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"test","enhancement":"test"}'

# Should SUCCESS
curl -X POST https://your-project.supabase.co/functions/v1/api-generate \
  -H "Origin: https://pixel-nova-ai.vercel.app" \
  -H "x-api-key: your-key" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"test","enhancement":"test"}'
```

### Test Rate Limiting
```bash
# Run 61 times quickly - should get rate limited
for i in {1..61}; do
  curl -X POST https://your-project.supabase.co/functions/v1/api-generate \
    -H "x-api-key: your-key" \
    -H "Content-Type: application/json" \
    -d '{"imageUrl":"test","enhancement":"test"}'
done
```

### Test Password Policy
```javascript
// In browser console
const weakPasswords = ['123456', 'password', 'abc123'];
const strongPassword = 'MyP@ssw0rd123!';

// Test each - weak should fail, strong should pass
```

---

## 📊 ROLLBACK PLAN

Jika ada masalah setelah deploy:

```bash
# Quick rollback
git revert HEAD
git push origin main

# Or restore from backup
git checkout main
git reset --hard <commit-before-fixes>
git push origin main --force
```

---

## 🎓 TRAINING UNTUK TEAM

### Security Best Practices
1. Never trust user input
2. Always validate and sanitize
3. Use parameterized queries
4. Implement least privilege
5. Log everything (except sensitive data)
6. Regular security audits

### Code Review Checklist
- [ ] Input validation present?
- [ ] Output encoding present?
- [ ] Authentication checked?
- [ ] Authorization checked?
- [ ] Rate limiting implemented?
- [ ] Error handling secure?
- [ ] Logging appropriate?

---

## 📞 SUPPORT

Jika ada masalah saat implementasi:
1. Check logs di Supabase Dashboard
2. Check browser console untuk CORS errors
3. Review error messages
4. Contact security team

**Emergency Rollback:** Jika production down, rollback immediately dan investigate offline.

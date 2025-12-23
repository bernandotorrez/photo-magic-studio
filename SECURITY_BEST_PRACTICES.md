# 🛡️ SECURITY BEST PRACTICES - Quick Reference

## 📋 DAILY SECURITY CHECKLIST

### Untuk Developer
- [ ] Review code untuk input validation sebelum commit
- [ ] Check tidak ada hardcoded secrets
- [ ] Verify RLS policies untuk table baru
- [ ] Test authentication flow
- [ ] Review error messages (jangan expose sensitive info)

### Untuk DevOps
- [ ] Monitor failed login attempts
- [ ] Check rate limit violations
- [ ] Review audit logs
- [ ] Verify backup status
- [ ] Check SSL certificate expiry

### Untuk Admin
- [ ] Review suspicious user activities
- [ ] Check payment approval logs
- [ ] Monitor API usage patterns
- [ ] Review admin action logs

---

## 🔐 CODING SECURITY RULES

### 1. Input Validation (ALWAYS!)

```typescript
// ❌ BAD - No validation
const name = req.body.name;
await db.insert({ name });

// ✅ GOOD - Validated and sanitized
import { sanitizeText } from '@/lib/input-sanitizer';
const name = sanitizeText(req.body.name, 100);
if (!name) {
  throw new Error('Invalid name');
}
await db.insert({ name });
```

### 2. Output Encoding

```typescript
// ❌ BAD - Direct innerHTML
element.innerHTML = userInput;

// ✅ GOOD - Use textContent or React
element.textContent = userInput;
// Or in React:
<div>{userInput}</div>
```

### 3. Authentication Check

```typescript
// ❌ BAD - No auth check
export async function handler(req) {
  const data = await getData();
  return data;
}

// ✅ GOOD - Auth required
export async function handler(req) {
  const user = await getUser(req);
  if (!user) {
    return { error: 'Unauthorized', status: 401 };
  }
  const data = await getData(user.id);
  return data;
}
```

### 4. Authorization Check

```typescript
// ❌ BAD - No ownership check
export async function deletePost(postId: string) {
  await db.posts.delete(postId);
}

// ✅ GOOD - Verify ownership
export async function deletePost(postId: string, userId: string) {
  const post = await db.posts.findOne(postId);
  if (post.userId !== userId) {
    throw new Error('Forbidden');
  }
  await db.posts.delete(postId);
}
```

### 5. SQL Injection Prevention

```typescript
// ❌ BAD - String concatenation
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ GOOD - Parameterized query
const query = supabase
  .from('users')
  .select('*')
  .eq('email', email);
```

### 6. Secure Password Handling

```typescript
// ❌ BAD - Weak password
const password = '123456';

// ✅ GOOD - Strong password with validation
import { validatePassword } from '@/lib/password-validator';
const result = validatePassword(password);
if (!result.valid) {
  throw new Error(result.errors.join(', '));
}
```

### 7. File Upload Security

```typescript
// ❌ BAD - No validation
const file = req.files[0];
await storage.upload(file);

// ✅ GOOD - Validated
import { validateImageFile } from '@/lib/file-validator';
const file = req.files[0];
const validation = validateImageFile(file);
if (!validation.valid) {
  throw new Error(validation.error);
}
await storage.upload(file);
```

### 8. CORS Configuration

```typescript
// ❌ BAD - Allow all origins
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
};

// ✅ GOOD - Whitelist specific origins
import { getCorsHeaders } from '@/lib/cors';
const origin = req.headers.get('Origin');
const corsHeaders = getCorsHeaders(origin);
```

### 9. Rate Limiting

```typescript
// ❌ BAD - No rate limiting
export async function apiHandler(req) {
  return await processRequest(req);
}

// ✅ GOOD - Rate limited
import { checkRateLimit } from '@/lib/rate-limiter';
export async function apiHandler(req) {
  const rateLimit = await checkRateLimit(req.userId);
  if (!rateLimit.allowed) {
    return { error: 'Rate limit exceeded', status: 429 };
  }
  return await processRequest(req);
}
```

### 10. Error Handling

```typescript
// ❌ BAD - Expose internal errors
try {
  await db.query();
} catch (error) {
  return { error: error.message }; // Might expose DB structure
}

// ✅ GOOD - Generic error message
try {
  await db.query();
} catch (error) {
  console.error('DB error:', error); // Log internally
  return { error: 'An error occurred. Please try again.' };
}
```

---

## 🚨 SECURITY INCIDENT RESPONSE

### If You Detect a Security Breach:

1. **IMMEDIATE (0-15 minutes)**
   - [ ] Isolate affected systems
   - [ ] Notify security team
   - [ ] Document everything
   - [ ] Don't delete evidence

2. **SHORT TERM (15-60 minutes)**
   - [ ] Assess impact
   - [ ] Identify attack vector
   - [ ] Block attacker (IP, API key, etc.)
   - [ ] Notify affected users if needed

3. **MEDIUM TERM (1-24 hours)**
   - [ ] Patch vulnerability
   - [ ] Reset compromised credentials
   - [ ] Review audit logs
   - [ ] Implement additional monitoring

4. **LONG TERM (1-7 days)**
   - [ ] Post-mortem analysis
   - [ ] Update security policies
   - [ ] Train team on lessons learned
   - [ ] Improve detection systems

---

## 🔍 SECURITY REVIEW QUESTIONS

Before deploying any feature, ask:

### Authentication & Authorization
- [ ] Is authentication required?
- [ ] Is authorization checked?
- [ ] Can users access other users' data?
- [ ] Are admin functions protected?

### Input Validation
- [ ] Are all inputs validated?
- [ ] Are inputs sanitized?
- [ ] Is there a max length check?
- [ ] Are file uploads validated?

### Output Encoding
- [ ] Is user input properly encoded?
- [ ] Are we using innerHTML safely?
- [ ] Is XSS prevented?

### Data Protection
- [ ] Is sensitive data encrypted?
- [ ] Are passwords hashed?
- [ ] Is PII protected?
- [ ] Are API keys secure?

### Rate Limiting
- [ ] Is rate limiting implemented?
- [ ] Are limits appropriate?
- [ ] Is abuse prevented?

### Error Handling
- [ ] Are errors logged?
- [ ] Are error messages safe?
- [ ] Is sensitive info hidden?

### Dependencies
- [ ] Are dependencies up to date?
- [ ] Are there known vulnerabilities?
- [ ] Are we using trusted packages?

---

## 📊 SECURITY METRICS TO TRACK

### Weekly
- Failed login attempts
- Rate limit violations
- API key usage
- File upload rejections
- Password reset requests

### Monthly
- Security audit findings
- Vulnerability scan results
- Dependency updates
- User permission changes
- Admin actions

### Quarterly
- Penetration test results
- Security training completion
- Incident response drills
- Policy updates
- Compliance status

---

## 🎓 SECURITY TRAINING RESOURCES

### For Developers
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Secure Coding Guidelines](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
- [Web Security Academy](https://portswigger.net/web-security)

### For Admins
- [Supabase Security](https://supabase.com/docs/guides/auth/security)
- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

### For Everyone
- [Security Awareness Training](https://www.sans.org/security-awareness-training/)
- [Phishing Awareness](https://www.phishing.org/)
- [Password Security](https://www.ncsc.gov.uk/collection/passwords)

---

## 🛠️ SECURITY TOOLS

### Code Analysis
- ESLint with security plugins
- Snyk (dependency scanning)
- SonarQube (code quality)

### Penetration Testing
- OWASP ZAP
- Burp Suite
- Metasploit

### Monitoring
- Sentry (error tracking)
- Datadog (infrastructure monitoring)
- Supabase Dashboard (database monitoring)

### Password Management
- 1Password (team)
- Bitwarden (open source)
- LastPass (enterprise)

---

## 📞 SECURITY CONTACTS

### Internal
- Security Team: security@company.com
- DevOps Team: devops@company.com
- CTO: cto@company.com

### External
- Supabase Support: support@supabase.io
- Vercel Support: support@vercel.com
- Security Researcher: security-reports@company.com

---

## 🎯 SECURITY GOALS 2025

- [ ] Zero critical vulnerabilities
- [ ] 100% RLS coverage
- [ ] < 0.1% failed auth rate
- [ ] < 1% rate limit violations
- [ ] Monthly security audits
- [ ] Quarterly penetration tests
- [ ] Annual security certification

---

**Remember:** Security is not a one-time task, it's a continuous process!

**Last Updated:** 22 Desember 2025

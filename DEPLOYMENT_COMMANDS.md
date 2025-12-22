# 🚀 Deployment Commands - Quick Copy-Paste

## 📋 Prerequisites

Pastikan sudah install Supabase CLI:
```bash
# Install via npm
npm install -g supabase

# Atau via homebrew (Mac)
brew install supabase/tap/supabase
```

---

## 🔐 Login & Setup

```bash
# Login ke Supabase
supabase login

# Link project (ganti [your-project-ref] dengan project ref Anda)
supabase link --project-ref [your-project-ref]

# Verify link
supabase status
```

---

## 🚀 Deploy Commands

### Deploy Semua Functions (Recommended)
```bash
supabase functions deploy
```

### Deploy Individual Functions

#### Public APIs
```bash
supabase functions deploy api-generate
supabase functions deploy api-check-status
```

#### Classification Functions
```bash
supabase functions deploy classify-image
supabase functions deploy classify-fashion
supabase functions deploy classify-food
supabase functions deploy classify-portrait
supabase functions deploy classify-beauty
supabase functions deploy classify-interior
supabase functions deploy classify-exterior
```

#### Core Functions
```bash
supabase functions deploy generate-enhanced-image
supabase functions deploy get-enhancements-by-classification
supabase functions deploy get-presigned-url
supabase functions deploy create-api-key
supabase functions deploy get-users-list
supabase functions deploy verify-captcha
supabase functions deploy expire-subscription-tokens
supabase functions deploy send-verification-email
```

---

## 🧪 Test Commands

### Test Public API (api-generate)
```bash
# Ganti [project-ref] dan [your-api-key]
curl -X POST https://[project-ref].supabase.co/functions/v1/api-generate \
  -H "x-api-key: [your-api-key]" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/test.jpg",
    "enhancements": ["background_removal"]
  }'
```

### Test Public API (api-check-status)
```bash
curl -X POST https://[project-ref].supabase.co/functions/v1/api-check-status \
  -H "x-api-key: [your-api-key]" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "your-task-id"
  }'
```

### Test Private API (classify-image)
```bash
# Ganti [project-ref] dan [your-token]
curl -X POST https://[project-ref].supabase.co/functions/v1/classify-image \
  -H "Origin: https://pixel-nova-ai.vercel.app" \
  -H "Authorization: Bearer [your-token]" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/test.jpg"
  }'
```

### Test Unauthorized Origin (Should Fail)
```bash
curl -X POST https://[project-ref].supabase.co/functions/v1/classify-image \
  -H "Origin: https://unauthorized-site.com" \
  -H "Authorization: Bearer [your-token]" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/test.jpg"
  }'
```

### Test Rate Limiting
```bash
# Send 61 requests rapidly (should hit rate limit on 61st)
for i in {1..61}; do
  echo "Request $i"
  curl -X POST https://[project-ref].supabase.co/functions/v1/api-generate \
    -H "x-api-key: [your-api-key]" \
    -H "Content-Type: application/json" \
    -d '{"imageUrl":"https://example.com/test.jpg"}'
  sleep 0.1
done
```

---

## 📊 Monitoring Commands

### List All Functions
```bash
supabase functions list
```

### Check Function Logs
```bash
# View logs for specific function
supabase functions logs api-generate

# Follow logs in real-time
supabase functions logs api-generate --follow

# View logs with limit
supabase functions logs api-generate --limit 100
```

### Check Function Status
```bash
# Get function details
supabase functions inspect api-generate
```

---

## 🔄 Update Commands

### Update Single Function
```bash
# Edit code locally, then deploy
supabase functions deploy [function-name]
```

### Update Environment Variables
```bash
# Set environment variable
supabase secrets set VARIABLE_NAME=value

# List all secrets
supabase secrets list

# Unset secret
supabase secrets unset VARIABLE_NAME
```

---

## 🧹 Cleanup Commands

### Delete Function (Careful!)
```bash
supabase functions delete [function-name]
```

### Clear Logs
```bash
# Logs are automatically rotated, no manual cleanup needed
```

---

## 🔧 Development Commands

### Run Function Locally
```bash
# Serve single function
supabase functions serve [function-name]

# Serve all functions
supabase functions serve

# Serve with environment variables
supabase functions serve --env-file .env.local
```

### Test Locally
```bash
# Test local function
curl -X POST http://localhost:54321/functions/v1/[function-name] \
  -H "Authorization: Bearer [local-token]" \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

---

## 📦 Backup Commands

### Backup Function Code
```bash
# List all functions and save to file
supabase functions list > functions_backup.txt

# Backup entire functions directory
tar -czf functions_backup.tar.gz supabase/functions/
```

### Restore from Backup
```bash
# Extract backup
tar -xzf functions_backup.tar.gz

# Deploy all functions
supabase functions deploy
```

---

## 🚨 Emergency Rollback

### Quick Rollback (Via Dashboard)
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "Edge Functions"
4. Select function
5. Click "Versions" tab
6. Click "Rollback" on previous version

### Rollback via CLI (If you have backup)
```bash
# Restore from backup
tar -xzf functions_backup.tar.gz

# Deploy old version
supabase functions deploy [function-name]
```

---

## 📝 Useful Aliases (Optional)

Add to your `.bashrc` or `.zshrc`:

```bash
# Supabase aliases
alias sbl='supabase login'
alias sblink='supabase link'
alias sbd='supabase functions deploy'
alias sbl='supabase functions list'
alias sblog='supabase functions logs'
alias sbs='supabase functions serve'

# Deploy all functions
alias sbdall='supabase functions deploy'

# View logs for common functions
alias sblog-gen='supabase functions logs api-generate --follow'
alias sblog-class='supabase functions logs classify-image --follow'
```

---

## 🎯 Common Workflows

### Deploy New Changes
```bash
# 1. Make changes to function code
# 2. Test locally
supabase functions serve [function-name]

# 3. Deploy to production
supabase functions deploy [function-name]

# 4. Check logs
supabase functions logs [function-name] --follow
```

### Debug Function Issues
```bash
# 1. Check logs
supabase functions logs [function-name] --limit 100

# 2. Test locally
supabase functions serve [function-name]

# 3. Test with curl
curl -X POST http://localhost:54321/functions/v1/[function-name] \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'

# 4. Fix and redeploy
supabase functions deploy [function-name]
```

### Update Environment Variables
```bash
# 1. Set new variable
supabase secrets set NEW_VAR=value

# 2. Verify
supabase secrets list

# 3. Redeploy functions that use it
supabase functions deploy [function-name]
```

---

## 📚 Documentation Links

- Supabase CLI Docs: https://supabase.com/docs/reference/cli
- Edge Functions Docs: https://supabase.com/docs/guides/functions
- Deployment Guide: https://supabase.com/docs/guides/functions/deploy

---

## 💡 Tips

1. **Always test locally first** before deploying to production
2. **Use `--follow` flag** when checking logs in real-time
3. **Set up aliases** for frequently used commands
4. **Keep backups** before major deployments
5. **Monitor logs** for first 24h after deployment
6. **Use environment variables** for sensitive data
7. **Deploy during low-traffic hours** if possible

---

## ✅ Quick Deployment Checklist

```bash
# 1. Login
supabase login

# 2. Link project
supabase link --project-ref [your-project-ref]

# 3. Deploy all functions
supabase functions deploy

# 4. Verify deployment
supabase functions list

# 5. Check logs
supabase functions logs api-generate --limit 50

# 6. Test endpoints
# (use test commands above)

# 7. Monitor for issues
supabase functions logs api-generate --follow
```

---

**Ready to deploy? Copy-paste the commands above!** 🚀

**Last Updated:** 22 Desember 2025

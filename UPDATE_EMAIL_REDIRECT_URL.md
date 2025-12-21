# Update Email Redirect URL

## Changes Made

### 1. Code Changes

#### src/lib/auth.tsx
Updated `signUp` function to use production URL:

```typescript
const signUp = async (email: string, password: string, fullName?: string) => {
  // Use production URL for email verification
  const isProduction = window.location.hostname !== 'localhost';
  const redirectUrl = isProduction 
    ? 'https://pixel-nova-ai.vercel.app/auth/callback'
    : `${window.location.origin}/auth/callback`;
  
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        full_name: fullName,
      },
    },
  });
  return { error };
};
```

**Benefits:**
- ✅ Production: Uses `https://pixel-nova-ai.vercel.app/auth/callback`
- ✅ Development: Uses `http://localhost:5173/auth/callback`
- ✅ Auto-detects environment

#### supabase/functions/send-verification-email/index.ts
Updated email template:
- Title: "PixelNova AI"
- Footer: "© 2025 PixelNova AI"
- Description: "AI-powered image enhancement for product photos"

### 2. Supabase Dashboard Configuration

You need to update Supabase settings to allow the new redirect URL.

#### Step 1: Add Redirect URL to Allowed List

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication Settings**
   - Click "Authentication" in sidebar
   - Click "URL Configuration"

3. **Add Redirect URLs**
   Add these URLs to "Redirect URLs" list:
   ```
   https://pixel-nova-ai.vercel.app/auth/callback
   https://pixel-nova-ai.vercel.app/**
   http://localhost:5173/auth/callback
   http://localhost:5173/**
   ```

4. **Site URL**
   Set "Site URL" to:
   ```
   https://pixel-nova-ai.vercel.app
   ```

5. **Save Changes**

#### Step 2: Update Email Templates (Optional)

1. **Navigate to Email Templates**
   - Authentication → Email Templates

2. **Update Confirmation Email**
   - Click "Confirm signup"
   - Update template if needed
   - Use variables: `{{ .ConfirmationURL }}`

3. **Save Template**

### 3. Environment Variables

Make sure these are set in Vercel:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Testing

#### Test in Development
```bash
npm run dev
# Register with email
# Check email for verification link
# Link should work with localhost
```

#### Test in Production
```bash
# Deploy to Vercel
vercel --prod

# Register with email
# Check email for verification link
# Link should redirect to https://pixel-nova-ai.vercel.app/auth/callback
```

### 5. Verification Flow

```
User registers
    ↓
Supabase sends email
    ↓
User clicks verification link
    ↓
Redirects to: https://pixel-nova-ai.vercel.app/auth/callback
    ↓
AuthCallback page processes token
    ↓
Redirects to: /dashboard
    ↓
Shows success toast
```

## Troubleshooting

### Error: "Invalid redirect URL"

**Cause:** URL not in allowed list

**Solution:**
1. Check Supabase Dashboard → Authentication → URL Configuration
2. Add `https://pixel-nova-ai.vercel.app/**` to Redirect URLs
3. Save and try again

### Email link redirects to wrong URL

**Cause:** `emailRedirectTo` not set correctly

**Solution:**
1. Check code in `src/lib/auth.tsx`
2. Verify `isProduction` logic
3. Test with `console.log(redirectUrl)`

### Email not received

**Cause:** Email service not configured

**Solution:**
1. Check Supabase Dashboard → Project Settings → Auth
2. Verify email settings
3. Check spam folder
4. Use Supabase's built-in email service or configure SMTP

### Callback page shows error

**Cause:** Token expired or invalid

**Solution:**
1. Check AuthCallback.tsx error handling
2. Verify token in URL
3. Try registering again with fresh email

## Custom Domain Setup

If you have a custom domain:

1. **Update auth.tsx**
   ```typescript
   const redirectUrl = isProduction 
     ? 'https://yourdomain.com/auth/callback'
     : `${window.location.origin}/auth/callback`;
   ```

2. **Update Supabase**
   - Add `https://yourdomain.com/**` to Redirect URLs
   - Set Site URL to `https://yourdomain.com`

3. **Update Vercel**
   - Add custom domain in Vercel Dashboard
   - Configure DNS records

## Security Notes

- ✅ Only whitelisted URLs can be used for redirect
- ✅ Supabase validates redirect URL against allowed list
- ✅ Tokens expire after 1 hour
- ✅ One-time use tokens (can't be reused)

## Deployment Checklist

- [ ] Code updated in `src/lib/auth.tsx`
- [ ] Email template updated in edge function
- [ ] Redirect URLs added to Supabase Dashboard
- [ ] Site URL set in Supabase Dashboard
- [ ] Environment variables set in Vercel
- [ ] Deployed to Vercel
- [ ] Tested registration flow
- [ ] Tested email verification
- [ ] Tested callback redirect

## Support

If issues persist:
1. Check Supabase logs: Dashboard → Logs
2. Check browser console for errors
3. Verify network requests in DevTools
4. Test with different email providers

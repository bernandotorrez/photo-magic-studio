# Email Template Setup untuk EnhanceAI

## Custom Email Verification Template

Email verifikasi telah dikustomisasi dengan design yang modern dan profesional sesuai dengan branding EnhanceAI.

## Setup untuk Production (Supabase Dashboard)

### 1. Akses Email Templates
1. Buka Supabase Dashboard: https://app.supabase.com
2. Pilih project Anda
3. Navigate ke **Authentication** → **Email Templates**

### 2. Edit Confirmation Email Template

Pilih **Confirm signup** template dan ganti dengan konten berikut:

**Subject:**
```
Confirm your email - EnhanceAI
```

**Body (HTML):**
Copy seluruh konten dari file `supabase/templates/confirmation.html`

### 3. Variables yang Tersedia

Supabase menyediakan variables berikut yang bisa digunakan di template:

- `{{ .Email }}` - Email address user
- `{{ .ConfirmationURL }}` - URL untuk konfirmasi email
- `{{ .Token }}` - Token verifikasi
- `{{ .TokenHash }}` - Hash dari token
- `{{ .SiteURL }}` - Site URL dari konfigurasi

### 4. Testing

Setelah setup:
1. Daftar dengan email baru di aplikasi
2. Cek inbox email
3. Pastikan email terlihat sesuai design
4. Klik tombol "Verify Email" untuk test

## Design Features

✨ **Modern Design:**
- Gradient header (Blue to Purple)
- Clean typography
- Responsive layout
- Professional button styling

🎨 **Branding:**
- EnhanceAI logo (✨)
- Brand colors
- Consistent spacing

📱 **Mobile Friendly:**
- Responsive design
- Max-width 600px
- Touch-friendly buttons

## Troubleshooting

### Email tidak terkirim?
- Cek SMTP settings di Supabase Dashboard
- Pastikan email verification enabled
- Cek spam folder

### Design tidak sesuai?
- Pastikan copy HTML lengkap
- Cek inline CSS tidak terpotong
- Test di berbagai email client

### Link tidak bekerja?
- Pastikan `{{ .ConfirmationURL }}` tidak diubah
- Cek redirect URL di auth settings
- Pastikan site URL sudah benar

## Production Checklist

- [ ] Update email template di Supabase Dashboard
- [ ] Test dengan email real
- [ ] Cek tampilan di Gmail, Outlook, Apple Mail
- [ ] Verify link redirect ke aplikasi
- [ ] Update site URL untuk production domain
- [ ] Test spam score (mail-tester.com)

## Support

Jika ada masalah dengan email template, hubungi tim development atau cek dokumentasi Supabase:
https://supabase.com/docs/guides/auth/auth-email-templates

# PixelNova AI

AI-powered image enhancement platform for product photography.

## Project info

Transform your product photos with professional AI enhancement in seconds.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Backend & Auth)
- Google reCAPTCHA v2

## Subscription Tiers

### Free Tier
- ✅ 3 generations per month
- ✅ 7-day history retention
- ✅ Basic support
- ❌ No API access

### Basic Tier
- ✅ 50 generations per month
- ✅ Unlimited history
- ✅ Priority support
- ✅ API access

### Pro Tier
- ✅ Unlimited generations
- ✅ Unlimited history
- ✅ Dedicated support
- ✅ API access
- ✅ Custom integrations

## Admin Panel

Admin panel tersedia di `/admin` untuk mengelola users dan melihat statistik platform.

### Features
- 📊 Dashboard statistics (total users, generations, etc.)
- 👥 User management (search, filter, edit)
- 🔄 Change user subscription tier
- ♻️ Reset user generation quota
- 🔍 Search by name or user ID
- 🎯 Filter by subscription plan

### Quick Setup
```bash
# Method 1: Via Script (Recommended)
npm run set-admin admin@example.com

# Method 2: Via SQL
# Run in Supabase SQL Editor:
UPDATE profiles SET is_admin = true 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
```

### Documentation
- 📖 [CREATE_ADMIN_GUIDE.md](./CREATE_ADMIN_GUIDE.md) - Step-by-step guide
- 📋 [ADMIN_QUICK_REFERENCE.md](./ADMIN_QUICK_REFERENCE.md) - Quick commands
- 📚 [ADMIN_PANEL_GUIDE.md](./ADMIN_PANEL_GUIDE.md) - Complete documentation
- 🔧 [SET_ADMIN_USER_GUIDE.md](./SET_ADMIN_USER_GUIDE.md) - Script usage

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

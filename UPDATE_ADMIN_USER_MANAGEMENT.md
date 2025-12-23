# ✅ Update: Admin User Management - 5 Subscription Tiers

## 📋 Yang Diupdate

File: `src/components/admin/UserManagement.tsx`

### Changes:

1. ✅ **Interface UserProfile** - Tambah `basic_plus` dan `pro_max`
2. ✅ **Filter dropdown** - Tambah opsi Basic Plus dan Pro Max
3. ✅ **Update plan dropdown** - Tambah opsi Basic Plus dan Pro Max
4. ✅ **Monthly limits** - Update limits untuk semua tiers
5. ✅ **Plan colors** - Tambah colors untuk new tiers

---

## 🎯 Subscription Tiers & Limits

### Monthly Generate Limits:

| Tier | Monthly Limit | Bonus | Total | Description |
|------|---------------|-------|-------|-------------|
| **Free** | 2 | 0 | 2 | Trial tier |
| **Basic** | 30 | 0 | 30 | Entry tier |
| **Basic Plus** | 50 | +2 | 52 | Enhanced tier |
| **Pro** | 75 | +3 | 78 | Professional tier |
| **Pro Max** | 100 | +5 | 105 | Premium tier |

**Note:** Bonus tokens diberikan setiap bulan sebagai tambahan dari base limit.

---

## 📊 Updated Features

### 1. Filter Dropdown

**Before:**
```
- All Plans
- Free
- Basic
- Pro
```

**After:**
```
- All Plans
- Free
- Basic
- Basic Plus ← NEW
- Pro
- Pro Max ← NEW
```

### 2. Plan Selection Dropdown

**Before:**
```
- Free
- Basic
- Pro
```

**After:**
```
- Free
- Basic
- Basic Plus ← NEW
- Pro
- Pro Max ← NEW
```

### 3. Monthly Limits

**Before:**
```typescript
const limits = {
  free: 3,
  basic: 50,
  pro: 999999,
};
```

**After:**
```typescript
const limits = {
  free: 2,
  basic: 30,
  basic_plus: 52,    // 50+2 bonus ← NEW
  pro: 78,           // 75+3 bonus ← CHANGED
  pro_max: 105,      // 100+5 bonus ← NEW
};
```

**Note:** Limits include bonus tokens:
- Basic Plus: 50 base + 2 bonus = 52
- Pro: 75 base + 3 bonus = 78
- Pro Max: 100 base + 5 bonus = 105

---

## 🎨 UI Changes

### Dropdown Width
- Changed from `w-[100px]` to `w-[120px]` untuk accommodate "Basic Plus" text

### Plan Colors
```typescript
free: 'secondary'      // Gray
basic: 'default'       // Blue
basic_plus: 'default'  // Blue (same as basic)
pro: 'destructive'     // Red
pro_max: 'destructive' // Red (same as pro)
```

---

## 🧪 Testing

### Test 1: Filter Users by Plan

1. Go to Admin Panel → Kelola User
2. Click filter dropdown
3. Select "Basic Plus"
4. Verify: Only users with Basic Plus plan shown

### Test 2: Update User Plan

1. Find a user in the list
2. Click plan dropdown
3. Select "Basic Plus" or "Pro Max"
4. Verify: Plan updated successfully
5. Check: Monthly limit updated correctly

### Test 3: Monthly Limits

| Plan | Expected Limit | Breakdown |
|------|----------------|-----------|
| Free | 2 | 2 base |
| Basic | 30 | 30 base |
| Basic Plus | 52 | 50 base + 2 bonus |
| Pro | 78 | 75 base + 3 bonus |
| Pro Max | 105 | 100 base + 5 bonus |

---

## 📝 SQL Verification

Verify limits in database:

```sql
-- Check subscription_tiers table
SELECT 
  tier_id,
  tier_name,
  monthly_generate_limit,
  is_active
FROM subscription_tiers
WHERE is_active = true
ORDER BY 
  CASE tier_id
    WHEN 'free' THEN 1
    WHEN 'basic' THEN 2
    WHEN 'basic_plus' THEN 3
    WHEN 'pro' THEN 4
    WHEN 'pro_max' THEN 5
  END;

-- Expected output:
-- free       | Free       | 2   | true
-- basic      | Basic      | 30  | true
-- basic_plus | Basic Plus | 52  | true  (50+2 bonus)
-- pro        | Pro        | 78  | true  (75+3 bonus)
-- pro_max    | Pro Max    | 105 | true  (100+5 bonus)
```

---

## ⚠️ Important Notes

### 1. Limits Include Bonus Tokens

**Breakdown:**
- **Free:** 2 (no bonus)
- **Basic:** 30 (no bonus)
- **Basic Plus:** 50 base + 2 bonus = 52 total
- **Pro:** 75 base + 3 bonus = 78 total
- **Pro Max:** 100 base + 5 bonus = 105 total

**Impact:**
- Bonus tokens are included in monthly_generate_limit
- Users get the total amount each month
- No separate bonus token field needed

**Migration Query (Optional):**
```sql
-- Update all users to correct limits based on their tier
UPDATE profiles
SET monthly_generate_limit = CASE subscription_plan
  WHEN 'free' THEN 2
  WHEN 'basic' THEN 30
  WHEN 'basic_plus' THEN 52
  WHEN 'pro' THEN 78
  WHEN 'pro_max' THEN 105
  ELSE monthly_generate_limit
END
WHERE subscription_plan IN ('free', 'basic', 'basic_plus', 'pro', 'pro_max');
```

### 2. Consistency Check

Make sure limits in code match database:

```sql
-- Update profiles table to correct limits
UPDATE profiles
SET monthly_generate_limit = CASE subscription_plan
  WHEN 'free' THEN 2
  WHEN 'basic' THEN 30
  WHEN 'basic_plus' THEN 52
  WHEN 'pro' THEN 78
  WHEN 'pro_max' THEN 105
  ELSE monthly_generate_limit
END
WHERE subscription_plan IN ('free', 'basic', 'basic_plus', 'pro', 'pro_max');
```

---

## ✅ Checklist

- [x] Update interface UserProfile
- [x] Update filter dropdown
- [x] Update plan selection dropdown
- [x] Update monthly limits
- [x] Update plan colors
- [x] Increase dropdown width
- [ ] Test filter functionality
- [ ] Test plan update functionality
- [ ] Verify limits in database
- [ ] (Optional) Update existing users' limits to match new values

---

## 🚀 Deployment

### Step 1: Commit Changes
```bash
git add src/components/admin/UserManagement.tsx
git commit -m "feat: add basic_plus and pro_max tiers to admin user management"
```

### Step 2: Deploy
```bash
# Deploy to production
git push origin main

# Or if using Vercel/Netlify, it will auto-deploy
```

### Step 3: Verify
1. Login as admin
2. Go to Kelola User
3. Check filter dropdown has 5 options
4. Check plan dropdown has 5 options
5. Test updating a user's plan

---

## 📊 Summary

**Updated:** Admin User Management component
**Added:** 2 new subscription tiers (basic_plus, pro_max)
**Changed:** Monthly limits to include bonus tokens
**Status:** ✅ Ready to deploy

**Monthly Limits:**
- Free: 2
- Basic: 30
- Basic Plus: 52 (50+2)
- Pro: 78 (75+3)
- Pro Max: 105 (100+5)

**Files Modified:**
- `src/components/admin/UserManagement.tsx`

**Next Steps:**
1. Test in development
2. Deploy to production
3. (Optional) Run migration query to update existing users' limits
4. Update admin documentation

---

**Version:** 1.0  
**Last Updated:** 2024-12-24  
**Status:** Ready for deployment

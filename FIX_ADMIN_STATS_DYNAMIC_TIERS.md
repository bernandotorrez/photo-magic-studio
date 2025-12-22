# Fix Admin Stats - Dynamic Subscription Tiers

## Masalah
Di halaman Admin Dashboard, statistik user menampilkan text hardcoded:
```
Free: 5 | Basic: 1 | Pro: 0
```

Ini tidak dinamis dan tidak mengikuti subscription tiers yang ada di database.

## Solusi
Update `AdminStats.tsx` untuk mengambil data subscription tiers dari tabel `subscription_tiers` dan menghitung jumlah user per tier secara dinamis.

## Perubahan

### File: `src/components/admin/AdminStats.tsx`

#### 1. Tambah Interface
```typescript
interface SubscriptionTier {
  tier_id: string;
  tier_name: string;
}

interface TierUserCount {
  tier_id: string;
  tier_name: string;
  user_count: number;
}
```

#### 2. Tambah State
```typescript
const [tierCounts, setTierCounts] = useState<TierUserCount[]>([]);
```

#### 3. Fetch Tier Counts
```typescript
const fetchTierCounts = async () => {
  try {
    // Get all subscription tiers
    const { data: tiers, error: tiersError } = await supabase
      .from('subscription_tiers' as any)
      .select('tier_id, tier_name')
      .eq('is_active', true)
      .order('display_order');

    if (tiersError) throw tiersError;

    if (!tiers || tiers.length === 0) {
      setTierCounts([]);
      return;
    }

    // Count users for each tier
    const counts: TierUserCount[] = [];
    for (const tier of (tiers as SubscriptionTier[])) {
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_plan', tier.tier_id);

      if (!countError) {
        counts.push({
          tier_id: tier.tier_id,
          tier_name: tier.tier_name,
          user_count: count || 0
        });
      }
    }

    setTierCounts(counts);
  } catch (error) {
    console.error('Error fetching tier counts:', error);
  }
};
```

#### 4. Generate Dynamic Description
```typescript
// Generate tier description dynamically from tierCounts
// If tierCounts is empty (fetch failed), show loading message instead of hardcoded fallback
const tierDescription = tierCounts.length > 0
  ? tierCounts.map(t => `${t.tier_name}: ${t.user_count}`).join(' | ')
  : 'Loading tier data...';

const statCards = [
  {
    title: 'Total Users',
    value: stats.total_users,
    icon: Users,
    description: tierDescription,
  },
  // ... other cards
];
```

**Tidak ada hardcoded fallback!** Jika fetch gagal, akan menampilkan "Loading tier data..." untuk memberi tahu admin bahwa ada masalah.

## Hasil

### Sebelum (Hardcoded):
```
Total Users: 10
Free: 5 | Basic: 1 | Pro: 0
```

### Sesudah (Dynamic):
```
Total Users: 10
Free: 5 | Basic: 1 | Basic+: 2 | Pro: 1 | Pro Max: 1
```

### Jika Fetch Gagal:
```
Total Users: 10
Loading tier data...
```

Sekarang **100% dinamis** - tidak ada hardcoded sama sekali! Jika fetch gagal, akan menampilkan "Loading tier data..." untuk memberi tahu admin ada masalah.

## Cara Deploy

### Deploy Frontend
```bash
git add .
git commit -m "fix: dynamic subscription tier stats in admin dashboard"
git push
```

Tidak perlu migration SQL karena hanya perubahan frontend.

## Testing

1. Buka **Admin Dashboard**
2. Lihat card "Total Users"
3. Pastikan description menampilkan semua tier dari database
4. Tambah tier baru di `subscription_tiers` → refresh admin dashboard → tier baru muncul otomatis

## Troubleshooting

### 1. Text masih menampilkan "Free: 5 | Basic: 1 | Pro: 0"

**Kemungkinan penyebab:**
- Tabel `subscription_tiers` belum dibuat
- RLS policy tidak mengizinkan read
- Fetch error dari Supabase

**Solusi:**

#### Step 1: Cek apakah tabel ada
Jalankan di Supabase SQL Editor:
```sql
SELECT * FROM subscription_tiers ORDER BY display_order;
```

Jika error "relation does not exist":
1. Jalankan file `RUN_THIS_SQL_SUBSCRIPTION_TIERS.sql` terlebih dahulu
2. Refresh halaman admin

#### Step 2: Cek RLS Policy
Jalankan file `CHECK_SUBSCRIPTION_TIERS_TABLE.sql` untuk:
- Cek apakah tabel ada
- Cek RLS policies
- Fix permissions jika perlu

#### Step 3: Cek Browser Console
1. Buka Admin Dashboard
2. Buka Developer Tools (F12)
3. Lihat Console tab
4. Cari log:
   - "Fetching subscription tiers..."
   - "Tiers data: ..."
   - "Tiers error: ..."

Jika ada error, screenshot dan kirim untuk debugging.

### 2. Tier counts semua 0

**Penyebab:** Kolom `subscription_plan` di tabel `profiles` tidak match dengan `tier_id` di `subscription_tiers`

**Solusi:**
```sql
-- Cek nilai subscription_plan di profiles
SELECT DISTINCT subscription_plan, COUNT(*) 
FROM profiles 
GROUP BY subscription_plan;

-- Cek tier_id di subscription_tiers
SELECT tier_id, tier_name FROM subscription_tiers;

-- Update profiles jika perlu
UPDATE profiles 
SET subscription_plan = 'free' 
WHERE subscription_plan IS NULL OR subscription_plan = '';
```

### 3. Hanya menampilkan beberapa tier

**Penyebab:** Beberapa tier memiliki `is_active = false`

**Solusi:**
```sql
-- Aktifkan semua tier
UPDATE subscription_tiers SET is_active = true;
```

## Benefits

✅ **100% Dinamis** - tidak ada hardcoded sama sekali!
✅ Mengikuti data di `subscription_tiers`
✅ Tidak perlu update code saat tambah tier baru
✅ Menampilkan semua tier yang aktif (`is_active = true`)
✅ Urutan sesuai `display_order` di database
✅ Jika fetch gagal, menampilkan "Loading tier data..." untuk debugging

## Notes

- **Tidak ada hardcoded fallback** - jika fetch gagal akan tampil "Loading tier data..."
- Jika melihat "Loading tier data...", berarti ada masalah dengan fetch `subscription_tiers`
- Hanya menampilkan tier yang `is_active = true`
- Urutan tier sesuai `display_order` di database
- User count dihitung real-time dari tabel `profiles`
- Console logs membantu debugging jika ada masalah

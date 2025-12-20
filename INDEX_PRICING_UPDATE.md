# Update Index Page - Dynamic Pricing from Database

## Perubahan

Halaman Index (landing page) sekarang mengambil data pricing tiers secara dinamis dari tabel `subscription_tiers` di database, bukan lagi hardcoded.

## Fitur Baru

### 1. Dynamic Pricing Plans
- Data pricing diambil dari database saat halaman dimuat
- Otomatis update jika admin mengubah pricing di admin panel
- Menampilkan loading state saat fetch data
- Fallback ke empty state jika terjadi error

### 2. Informasi yang Ditampilkan
Setiap pricing card menampilkan:
- **Display Name**: Nama paket yang user-friendly
- **Price**: Harga dalam format Rupiah
- **Subscription Tokens**: Jumlah token per bulan
- **Bonus Tokens**: Token bonus (jika ada, ditampilkan dengan warna hijau)
- **Features**: List fitur dari database (array)
- **Highlighted**: Paket "Basic" otomatis di-highlight sebagai "Paling Populer"

### 3. Format Data

#### Interface TypeScript:
```typescript
interface SubscriptionTier {
  id: string;
  tier_name: string;        // e.g., "free", "basic", "pro"
  display_name: string;     // e.g., "Free", "Basic", "Pro"
  price: number;            // e.g., 0, 30000, 99000
  subscription_tokens: number;  // e.g., 5, 50, 200
  bonus_tokens: number;     // e.g., 0, 2, 10
  features: string[];       // Array of feature strings
  is_active: boolean;       // Only active tiers shown
  sort_order: number;       // Display order
}
```

#### Contoh Data dari Database:
```json
{
  "id": "uuid-123",
  "tier_name": "basic",
  "display_name": "Basic",
  "price": 30000,
  "subscription_tokens": 40,
  "bonus_tokens": 0,
  "features": [
    "40 token per bulan",
    "Semua fitur enhancement",
    "API access",
    "Priority support",
    "Bisa top-up token tambahan"
  ],
  "is_active": true,
  "sort_order": 2
}
```

## Implementasi

### Fetch Data dari Database:
```typescript
const fetchPricingPlans = async () => {
  try {
    const { data, error } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    setPricingPlans(data || []);
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    setPricingPlans([]);
  } finally {
    setLoading(false);
  }
};
```

### Format Harga:
```typescript
const formatPrice = (price: number) => {
  if (price === 0) return 'Rp 0';
  return `Rp ${price.toLocaleString('id-ID')}`;
};
```

### Highlight Logic:
```typescript
const isHighlighted = (tierName: string) => {
  return tierName.toLowerCase() === 'basic';
};
```

## UI States

### 1. Loading State
```
┌─────────────────────────────────┐
│                                 │
│         ⟳ Loading...            │
│                                 │
└─────────────────────────────────┘
```

### 2. Empty State
```
┌─────────────────────────────────┐
│  Pricing plans tidak tersedia   │
│         saat ini                │
└─────────────────────────────────┘
```

### 3. Success State
```
┌──────────────┬──────────────┬──────────────┐
│    Free      │    Basic     │     Pro      │
│              │ PALING       │              │
│              │ POPULER      │              │
├──────────────┼──────────────┼──────────────┤
│ Rp 0         │ Rp 30.000    │ Rp 99.000    │
│ /bulan       │ /bulan       │ /bulan       │
│              │              │              │
│ 5 generate   │ 40 generate  │ 200 generate │
│ /bulan       │ /bulan       │ /bulan       │
│              │ +2 bonus     │ +10 bonus    │
│              │              │              │
│ ✓ Feature 1  │ ✓ Feature 1  │ ✓ Feature 1  │
│ ✓ Feature 2  │ ✓ Feature 2  │ ✓ Feature 2  │
│              │              │              │
│ [Pilih Paket]│ [Pilih Paket]│ [Pilih Paket]│
└──────────────┴──────────────┴──────────────┘
```

## Keuntungan

### 1. Fleksibilitas
- Admin bisa mengubah pricing tanpa deploy ulang
- Bisa menambah/mengurangi tier dengan mudah
- Update features langsung dari admin panel

### 2. Konsistensi
- Pricing di Index dan Pricing page bisa sync
- Single source of truth dari database
- Tidak ada hardcoded values

### 3. Maintainability
- Lebih mudah maintain
- Tidak perlu edit code untuk update pricing
- Centralized pricing management

## Testing

### Test Cases:
1. ✅ Halaman load dengan data pricing dari database
2. ✅ Loading state muncul saat fetch data
3. ✅ Empty state jika tidak ada data
4. ✅ Bonus tokens ditampilkan dengan warna hijau
5. ✅ Paket "Basic" di-highlight sebagai populer
6. ✅ Format harga dalam Rupiah
7. ✅ Features ditampilkan sebagai list dengan checkmark
8. ✅ Button "Pilih Paket" redirect ke /auth

## File yang Diubah

- `src/pages/Index.tsx` - Update untuk fetch dari database

## Dependencies

- `@supabase/supabase-js` - Untuk query database
- `date-fns` - Untuk format tanggal (sudah ada)

## Database Table

Menggunakan tabel `subscription_tiers` yang sudah dibuat di:
- `supabase/migrations/20231227_system_settings.sql`

## Admin Management

Admin bisa manage pricing tiers di:
- `/admin` → Tab "Subscription Tiers"
- CRUD operations: Create, Read, Update, Delete
- Toggle active/inactive
- Reorder dengan sort_order

## Next Steps

Jika diperlukan, halaman `/pricing` juga bisa diupdate untuk menggunakan data dari database. Namun halaman tersebut memiliki checkout flow yang kompleks, jadi perlu testing lebih lanjut.

## Notes

- Fallback ke empty array jika error (tidak crash)
- Type assertion `as any` digunakan karena TypeScript types belum ter-generate
- Loading state menggunakan spinner animation
- Responsive design untuk mobile, tablet, dan desktop

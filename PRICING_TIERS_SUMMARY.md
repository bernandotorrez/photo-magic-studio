# Token Pricing Tiers - Summary

## 🎯 Sistem Harga Bertingkat

Sistem top up token sekarang menggunakan harga bertingkat (volume discount):

### 💰 Pricing Tiers

| Jumlah Token | Harga per Token | Diskon | Total (Contoh) |
|--------------|-----------------|--------|----------------|
| **1 - 100**  | Rp 1.000        | 0%     | 100 token = Rp 100.000 |
| **101 - 200** | Rp 950         | 5%     | 150 token = Rp 142.500 |
| **201+**     | Rp 900          | 10%    | 250 token = Rp 225.000 |

### ✨ Keuntungan

- **Otomatis**: Sistem menghitung harga berdasarkan jumlah token
- **Transparan**: User melihat pricing tiers sebelum membeli
- **Hemat**: Semakin banyak beli, semakin murah per token
- **Fleksibel**: Bisa beli jumlah berapa saja, harga menyesuaikan

### 📍 Lokasi Tampilan

1. **Halaman Top Up** (`/top-up`):
   - Card "Harga Bertingkat" dengan highlight tier aktif
   - Badge "Hemat X%" untuk tier dengan diskon
   - Perhitungan real-time saat user input jumlah token

2. **Homepage** (`/`):
   - Section "Top Up Token Tambahan"
   - Grid pricing tiers dengan badge
   - Info lengkap cara pembayaran

### 🔧 Technical Implementation

**Database**: `token_pricing` table
```sql
min_tokens | max_tokens | price_per_token | discount_percentage
-----------|------------|-----------------|--------------------
1          | 100        | 1000            | 0
101        | 200        | 950             | 5
201        | NULL       | 900             | 10
```

**Frontend**: Dynamic calculation
```typescript
const tier = pricing.find(p => 
  tokenAmount >= p.min_tokens && 
  (p.max_tokens === null || tokenAmount <= p.max_tokens)
);

const total = tokenAmount * tier.price_per_token;
```

### 📦 Files Changed

- ✅ `supabase/migrations/20231222_update_token_pricing.sql` - Database migration
- ✅ `src/pages/TopUp.tsx` - Top up page dengan pricing display
- ✅ `src/pages/Index.tsx` - Homepage dengan pricing info
- ✅ `TOP_UP_INDONESIAN_UPDATE.md` - Full documentation
- ✅ `PRICING_TIERS_SUMMARY.md` - This file

### 🚀 Deployment

1. Apply migration: `supabase db push`
2. Deploy frontend: `npm run build`
3. Test pricing calculation
4. Verify all tiers work correctly

### 💡 Example Calculations

```
Input: 50 token
Tier: 1-100 (Rp 1.000/token)
Total: 50 × 1.000 = Rp 50.000

Input: 150 token
Tier: 101-200 (Rp 950/token)
Total: 150 × 950 = Rp 142.500
Hemat: 5% vs tier 1

Input: 250 token
Tier: 201+ (Rp 900/token)
Total: 250 × 900 = Rp 225.000
Hemat: 10% vs tier 1
```

### ✅ Benefits for Users

- **Jelas**: Harga transparan sebelum checkout
- **Adil**: Diskon otomatis untuk pembelian banyak
- **Mudah**: Tidak perlu kode promo atau voucher
- **Instant**: Langsung dapat harga terbaik

### 🎨 UI/UX Features

- **Visual Tiers**: Card dengan border highlight untuk tier aktif
- **Badge Discount**: Badge "Hemat X%" untuk tier dengan diskon
- **Real-time Calc**: Total harga update otomatis saat input berubah
- **Clear Info**: Breakdown harga (token × harga per token = total)

---

**Status**: ✅ Implemented & Ready to Deploy
**Last Updated**: December 22, 2023

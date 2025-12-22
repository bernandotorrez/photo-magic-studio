# Quick Guide: Fix Bonus Token Display

## Masalah
Text bonus token di halaman admin tidak akurat. Menampilkan perhitungan yang salah karena `payment.bonus_tokens` di database sudah berisi total, tapi frontend menguranginya lagi dengan bonus dari kode unik.

**Contoh Error:**
- User beli paket dengan 5 bonus + kode unik 1334 (1 bonus)
- Seharusnya: +5 dari paket, +1 dari kode unik = **+6 total**
- Yang muncul: +4 dari paket, +1 dari kode unik = +5 total ❌

## Solusi

Frontend sekarang mengambil data bonus dari paket langsung dari tabel `subscription_tiers`, bukan menghitung mundur dari `payment.bonus_tokens`.

### Logika Baru:
```typescript
// 1. Ambil bonus dari paket dari subscription_tiers
const tier = subscriptionTiers.find(t => t.tier_id === payment.subscription_plan);
const bonusFromPackage = tier?.bonus_tokens || 0;

// 2. Hitung bonus dari kode unik
const bonusFromUniqueCode = Math.floor(unique_code / 1000);

// 3. Total bonus
const totalBonus = bonusFromPackage + bonusFromUniqueCode;
```

## Deploy

### Step 1: Update Database Function
1. Buka **Supabase Dashboard** → **SQL Editor**
2. Copy isi file `FIX_BONUS_TOKEN_CALCULATION.sql`
3. Paste dan klik **Run**

### Step 2: Deploy Frontend
```bash
git add .
git commit -m "fix: bonus token display calculation from subscription_tiers"
git push
```

## Cara Kerja Bonus Token

### Formula:
```
Total Bonus = Bonus dari Paket + Bonus dari Kode Unik

Bonus dari Paket = subscription_tiers.bonus_tokens (lookup by tier_id)
Bonus dari Kode Unik = FLOOR(unique_code / 1000)
```

### Contoh:
**User beli paket Pro Max dengan kode unik 1334:**
- Paket Pro Max: 100 tokens + **10 bonus** (dari subscription_tiers)
- Kode unik: 1334 → 1334 / 1000 = **1 bonus**
- **Total bonus: 10 + 1 = 11 token** ✅
- **Total token: 100 + 11 = 111 token**

**Display di admin:**
```
🎁 Bonus Token: +11 token
• +10 token dari paket
• +1 token dari kode unik 1334
```

## Verifikasi

Setelah deploy, cek di halaman admin:
1. Buka **Admin** → **Payment Management**
2. Lihat payment dengan bonus token
3. Pastikan perhitungan benar:
   - Bonus dari paket = sesuai subscription_tiers
   - Bonus dari kode unik = unique_code / 1000
   - Total = keduanya dijumlahkan

## Troubleshooting

### Bonus token tidak muncul?
- Pastikan `subscription_plan` terisi di payment record
- Pastikan `unique_code >= 1000` untuk dapat bonus dari kode unik
- Pastikan tabel `subscription_tiers` sudah ada dan terisi

### Text masih salah?
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Cek apakah frontend sudah ter-deploy
- Cek console browser untuk error

### Function error?
- Pastikan tabel `subscription_tiers` sudah ada
- Pastikan kolom `bonus_tokens` ada di tabel `payments`
- Cek log error di Supabase Dashboard

## Files Changed
1. `src/components/admin/PaymentManagement.tsx` - Frontend display (fetch subscription_tiers)
2. `FIX_BONUS_TOKEN_CALCULATION.sql` - Backend function

## Done! ✅
Bonus token sekarang menampilkan breakdown yang akurat dengan mengambil data langsung dari `subscription_tiers`:
- ✅ Bonus dari paket subscription (dari subscription_tiers.bonus_tokens)
- ✅ Bonus dari kode unik (kelipatan 1000)
- ✅ Total = keduanya dijumlahkan dengan benar

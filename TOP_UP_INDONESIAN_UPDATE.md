# Update Top Up - Bahasa Indonesia & Info Rekening

## Perubahan yang Dilakukan

### 1. Halaman Top Up (`src/pages/TopUp.tsx`)
✅ **Sudah diubah ke Bahasa Indonesia lengkap**

#### Detail Perubahan:
- **Informasi Rekening Bank (Hardcoded)**:
  - Bank: **BCA**
  - Nama Penerima: **Bernand Dayamuntari Hermawan**
  - Nomor Rekening: **2040239483**

- **Pricing Tiers (Harga Bertingkat)**:
  - **1-100 token**: Rp 1.000/token (tanpa diskon)
  - **101-200 token**: Rp 950/token (hemat 5%)
  - **201+ token**: Rp 900/token (hemat 10%)
  - Sistem otomatis menghitung harga berdasarkan jumlah token yang dibeli
  - Semakin banyak beli, semakin murah harga per token

- **Deskripsi Halaman**:
  - Ditambahkan: "Konfirmasi pembayaran maksimal 1 hari kerja"

- **Langkah-langkah Pembayaran**:
  1. Transfer sejumlah **Rp xxx** ke rekening BCA **2040239483** a.n. **Bernand Dayamuntari Hermawan**
  2. Screenshot bukti transfer dari mobile banking Anda
  3. Upload screenshot sebagai bukti pembayaran di form ini
  4. Klik tombol "Submit Pembayaran" dan tunggu verifikasi admin
  5. Konfirmasi pembayaran maksimal **1 hari kerja**

- **Informasi Status Pembayaran** (Lebih detail):
  - **Pending**: Pembayaran sedang dalam proses verifikasi. Konfirmasi maksimal 1 hari kerja.
  - **Disetujui**: Pembayaran berhasil diverifikasi. Token sudah ditambahkan ke akun.
  - **Ditolak**: Verifikasi pembayaran gagal. Silakan hubungi admin.

- **Removed**:
  - Dihapus fetch dari database `bank_accounts` (tidak diperlukan lagi)
  - Info rekening sekarang hardcoded langsung di kode

### 2. Halaman Home/Index (`src/pages/Index.tsx`)
✅ **Ditambahkan informasi Top Up Token**

#### Detail Perubahan:
- **Hero Section**: 
  - Ditambahkan: "Bisa top up token tambahan kapan saja!"

- **Pricing Section**:
  - Subtitle diubah: "Semua paket bisa top up token tambahan!"

- **Section Baru: Top Up Info**:
  - Card khusus menjelaskan sistem top up
  - **Pricing Tiers ditampilkan**:
    - 1-100 token: Rp 1.000/token
    - 101-200 token: Rp 950/token
    - 201+ token: Rp 900/token
  - Informasi lengkap:
    ✓ Transfer ke rekening BCA 2040239483 a.n. Bernand Dayamuntari Hermawan
    ✓ Upload bukti transfer untuk konfirmasi pembayaran
    ✓ Konfirmasi pembayaran maksimal 1 hari kerja
    ✓ Token langsung masuk ke akun setelah diverifikasi

### 3. Fitur Pricing Plans
Semua paket (Free, Basic, Pro) sudah include:
- "Bisa top-up token tambahan" di list features

## Cara Menggunakan

### Untuk User:
1. Login ke dashboard
2. Klik menu "Top Up" atau tombol "Top Up Token"
3. Pilih jumlah token yang ingin dibeli
4. Lihat total harga yang harus ditransfer
5. Transfer ke rekening:
   - **Bank**: BCA
   - **Nomor**: 2040239483
   - **Atas Nama**: Bernand Dayamuntari Hermawan
6. Screenshot bukti transfer
7. Upload bukti transfer di form
8. Klik "Submit Pembayaran"
9. Tunggu verifikasi admin (maksimal 1 hari kerja)
10. Token akan otomatis masuk ke akun setelah diverifikasi

### Untuk Admin:
1. Login sebagai admin
2. Buka halaman "Payment Management"
3. Lihat daftar pembayaran pending
4. Verifikasi bukti transfer
5. Approve atau Reject pembayaran
6. Token akan otomatis ditambahkan ke user jika approved

## Technical Notes

### Type Assertions
Karena tabel `token_pricing` dan `payments` baru dibuat via migration, TypeScript belum mengenali tipe-tipe ini. Solusi sementara menggunakan type assertion:

```typescript
// Fetch pricing
const { data } = await supabase
  .from('token_pricing' as any)
  .select('*')
  .eq('is_active', true)
  .order('sort_order');

if (data) setPricing(data as unknown as TokenPricing[]);

// Insert payment
const { error } = await supabase
  .from('payments' as any)
  .insert({...});
```

### Hardcoded Bank Info
Info rekening bank sekarang hardcoded di kode untuk memastikan selalu tampil dengan benar:
- Tidak perlu setup di database
- Tidak perlu admin input rekening
- Langsung siap pakai

## Files Modified

1. ✅ `src/pages/TopUp.tsx` - Halaman top up dengan bahasa Indonesia lengkap + pricing tiers
2. ✅ `src/pages/Index.tsx` - Homepage dengan info top up token + pricing tiers
3. ✅ `supabase/migrations/20231222_update_token_pricing.sql` - Update pricing tiers di database
4. ✅ `TOP_UP_INDONESIAN_UPDATE.md` - Dokumentasi ini

## Database Changes

### Migration: `20231222_update_token_pricing.sql`
Update pricing tiers di tabel `token_pricing`:
- **Tier 1**: 1-50 token @ Rp 1.000/token (0% discount)
- **Tier 2**: 51-200 token @ Rp 900/token (10% discount)
- **Tier 3**: 201+ token @ Rp 800/token (20% discount)

Untuk apply migration:
```bash
# Jika menggunakan Supabase CLI
supabase db push

# Atau jalankan manual di Supabase Dashboard > SQL Editor
```

## Testing Checklist

- [ ] Halaman Top Up tampil dengan bahasa Indonesia
- [ ] Info rekening BCA tampil dengan benar
- [ ] Nomor rekening: 2040239483
- [ ] Nama penerima: Bernand Dayamuntari Hermawan
- [ ] **Pricing tiers tampil dengan benar**:
  - [ ] 1-100 token: Rp 1.000/token
  - [ ] 101-200 token: Rp 950/token (badge "Hemat 5%")
  - [ ] 201+ token: Rp 900/token (badge "Hemat 10%")
- [ ] **Perhitungan harga otomatis**:
  - [ ] Input 50 token → Rp 50.000 (1000 x 50)
  - [ ] Input 150 token → Rp 142.500 (950 x 150)
  - [ ] Input 250 token → Rp 225.000 (900 x 250)
- [ ] Info "Konfirmasi maksimal 1 hari kerja" tampil
- [ ] Langkah-langkah pembayaran jelas dan lengkap
- [ ] Homepage menampilkan info top up token dengan pricing
- [ ] Section top up info di homepage tampil dengan baik
- [ ] Upload bukti transfer berfungsi
- [ ] Submit pembayaran berfungsi
- [ ] Status pembayaran tampil dengan jelas

## Next Steps

1. **Apply Database Migration**:
   ```bash
   # Jalankan migration untuk update pricing tiers
   supabase db push
   # Atau copy-paste SQL dari file migration ke Supabase Dashboard
   ```

2. **Jalankan aplikasi**: `npm run dev`

3. **Test Pricing Tiers**:
   - Coba input 50 token → harus Rp 1.000/token = Rp 50.000
   - Coba input 150 token → harus Rp 950/token = Rp 142.500
   - Coba input 250 token → harus Rp 900/token = Rp 225.000

4. **Test flow pembayaran lengkap**

5. **Verifikasi semua teks sudah bahasa Indonesia**

6. **Test admin approval flow**

## Support

Jika ada pertanyaan atau issue, silakan hubungi developer.

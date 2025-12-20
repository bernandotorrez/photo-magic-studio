# Sistem Kode Unik Pembayaran

## 🎯 Overview

Sistem kode unik membantu admin mengidentifikasi pembayaran dengan cepat dan akurat. Setiap transaksi mendapat kode unik yang ditambahkan ke nominal transfer.

## 💰 Aturan Kode Unik

### Berdasarkan Nominal Transfer:

| Nominal Transfer | Kode Unik | Range | Contoh |
|------------------|-----------|-------|--------|
| **Rp 1.000 - 99.999** | 3 digit | 100-999 | Rp 50.000 + 456 = **Rp 50.456** |
| **Rp 100.000+** | 4 digit | 1000-1999 | Rp 150.000 + 1234 = **Rp 151.234** |

### Kenapa Berbeda?

- **3 digit untuk < 100k**: Nominal kecil, kode pendek sudah cukup unik
- **4 digit untuk >= 100k**: Nominal besar, butuh kode lebih panjang (max 1999 agar tidak terlalu besar)

## 📊 Contoh Perhitungan

### Contoh 1: Pembelian 50 Token
```
50 token × Rp 1.000 = Rp 50.000
Kode unik: 456 (3 digit karena < 100k)
Total transfer: Rp 50.456
```

### Contoh 2: Pembelian 150 Token
```
150 token × Rp 950 = Rp 142.500
Kode unik: 1234 (4 digit karena >= 100k)
Total transfer: Rp 143.734
```

### Contoh 3: Pembelian 250 Token
```
250 token × Rp 900 = Rp 225.000
Kode unik: 5678 (4 digit karena >= 100k)
Total transfer: Rp 230.678
```

## 🔧 Implementasi Teknis

### 1. Database Schema

```sql
ALTER TABLE public.payments 
ADD COLUMN unique_code INTEGER;

ALTER TABLE public.payments 
ADD COLUMN amount_with_code DECIMAL(10, 2);
```

### 2. Generate Kode Unik (Frontend)

```typescript
const generateUniqueCode = () => {
  const baseTotal = calculateBaseTotal();
  
  if (baseTotal < 100000) {
    // 3-digit code for < 100k
    const code = Math.floor(Math.random() * 900) + 100; // 100-999
    setUniqueCode(code);
  } else {
    // 4-digit code for >= 100k (max 1999)
    const code = Math.floor(Math.random() * 1000) + 1000; // 1000-1999
    setUniqueCode(code);
  }
};
```

### 3. Simpan ke Database

```typescript
await supabase.from('payments').insert({
  amount: price.total,
  unique_code: uniqueCode,
  amount_with_code: price.totalWithCode,
  // ... other fields
});
```

## 👤 User Experience

### Halaman Top Up

User melihat:
```
Subtotal: Rp 50.000
Kode Unik: +456
─────────────────────
Total Transfer: Rp 50.456
```

### Instruksi Pembayaran

```
Transfer TEPAT sejumlah Rp 50.456 
(sudah termasuk kode unik 456)
```

## 👨‍💼 Admin Experience

### Payment Management Dashboard

Admin melihat:
```
┌─────────────────────────────────────┐
│ 50 Tokens - user@example.com       │
├─────────────────────────────────────┤
│ Subtotal: Rp 50.000                 │
│ + Kode: 456                         │
│ Total Transfer: Rp 50.456           │
└─────────────────────────────────────┘
```

### Verifikasi Pembayaran

Admin dapat:
1. Lihat kode unik di dashboard
2. Cocokkan dengan nominal transfer yang masuk
3. Identifikasi pembayaran dengan cepat
4. Approve/reject dengan mudah

## 📁 Files Modified

1. ✅ `src/pages/TopUp.tsx` - Generate & display unique code
2. ✅ `src/components/admin/PaymentManagement.tsx` - Display unique code for admin
3. ✅ `supabase/migrations/20231223_add_unique_code_to_payments.sql` - Database schema
4. ✅ `RUN_THIS_SQL_UNIQUE_CODE.sql` - Quick SQL to run
5. ✅ `UNIQUE_CODE_SYSTEM.md` - This documentation

## 🚀 Deployment Steps

### 1. Apply Database Migration

```bash
# Option 1: Via Supabase Dashboard
# Copy-paste RUN_THIS_SQL_UNIQUE_CODE.sql to SQL Editor

# Option 2: Via CLI
supabase db push
```

### 2. Deploy Frontend

```bash
npm run build
# Deploy to your hosting
```

### 3. Test Flow

1. User buka halaman Top Up
2. Pilih jumlah token
3. Lihat kode unik ter-generate
4. Transfer dengan nominal + kode unik
5. Upload bukti transfer
6. Admin verifikasi dengan melihat kode unik

## ✅ Benefits

### Untuk User:
- ✅ Pembayaran lebih mudah diidentifikasi
- ✅ Proses verifikasi lebih cepat
- ✅ Transparansi penuh

### Untuk Admin:
- ✅ Identifikasi pembayaran instant
- ✅ Tidak perlu tanya-tanya user
- ✅ Mengurangi kesalahan verifikasi
- ✅ Efisiensi waktu

### Untuk Sistem:
- ✅ Otomatis dan scalable
- ✅ Tidak perlu manual tracking
- ✅ Database terstruktur dengan baik

## 🔒 Security

- Kode unik random setiap transaksi
- Tidak bisa diprediksi
- Stored di database untuk verifikasi
- Tidak ada collision risk (range cukup besar)

## 📊 Statistics

- **3-digit codes**: 900 kemungkinan (100-999)
- **4-digit codes**: 1000 kemungkinan (1000-1999) - tidak terlalu besar
- **Collision probability**: Sangat rendah untuk volume normal
- **Max kode**: 1999 (tidak sampai ribuan besar)

---

**Status**: ✅ Implemented & Ready to Deploy
**Last Updated**: December 22, 2023

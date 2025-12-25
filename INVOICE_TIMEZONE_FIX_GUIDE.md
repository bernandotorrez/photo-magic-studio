# Fix Invoice Timezone Issue

## 🐛 Masalah

Invoice menampilkan tanggal yang salah:
- **Tanggal sebenarnya (WIB):** 24 Desember 2025
- **Invoice number:** INV/23122025/0005 ❌
- **Seharusnya:** INV/24122025/0001 ✅

## 🔍 Penyebab

Fungsi `generate_invoice_no()` menggunakan `CURRENT_DATE` yang menggunakan **UTC timezone**, bukan **WIB (UTC+7)**.

Ketika di Indonesia sudah jam 00:00 WIB (tanggal 24), di UTC masih jam 17:00 (tanggal 23).

### Kode Lama (Salah):
```sql
-- Menggunakan UTC
today_prefix := 'INV/' || TO_CHAR(CURRENT_DATE, 'DDMMYYYY') || '/';
```

### Kode Baru (Benar):
```sql
-- Menggunakan WIB (Asia/Jakarta)
jakarta_date := (timezone('Asia/Jakarta', now()))::DATE;
today_prefix := 'INV/' || TO_CHAR(jakarta_date, 'DDMMYYYY') || '/';
```

## 🔧 Solusi

Jalankan file SQL ini di Supabase SQL Editor:

```
FIX_INVOICE_TIMEZONE_CORRECT.sql
```

File ini akan:
1. ✅ Update fungsi `generate_invoice_no()` untuk menggunakan timezone WIB
2. ✅ Menampilkan perbandingan UTC vs WIB
3. ✅ Test generate invoice dengan tanggal yang benar
4. ✅ Menampilkan invoice yang sudah ada dengan info timezone

## 📋 Cara Deploy

### 1. Buka Supabase Dashboard
- Login ke Supabase
- Pilih project Anda
- Buka **SQL Editor**

### 2. Jalankan SQL Fix
- Copy isi file `FIX_INVOICE_TIMEZONE_CORRECT.sql`
- Paste di SQL Editor
- Klik **Run**

### 3. Verifikasi
Setelah run, Anda akan melihat output seperti:

```
=== TIMEZONE COMPARISON ===
UTC Date: 2025-12-23 (format: 23122025)
WIB Date: 2025-12-24 (format: 24122025)
⚠️  DIFFERENT! This is why invoice was wrong.

=== INVOICE GENERATION TEST ===
Expected date (WIB): 24122025
Generated invoice: INV/24122025/0001
✅ SUCCESS! Invoice uses correct WIB date.
```

## 🧪 Testing

Setelah fix, test dengan:

1. **Approve payment baru** di admin panel
2. **Cek invoice number** - seharusnya menggunakan tanggal hari ini (WIB)
3. **Verifikasi reset harian** - besok invoice akan mulai dari 0001 lagi

### Expected Results:

**Hari ini (24 Des 2025):**
- INV/24122025/0001
- INV/24122025/0002
- INV/24122025/0003

**Besok (25 Des 2025):**
- INV/25122025/0001 ← Reset ke 0001
- INV/25122025/0002
- INV/25122025/0003

## 🎯 Logic Penomoran (Sudah Benar)

Logic penomoran Anda sudah benar, hanya perlu fix timezone:

```sql
-- 1. Cek invoice hari ini
SELECT MAX(sequence_number) 
FROM payments 
WHERE invoice_no LIKE 'INV/24122025/%'

-- 2. Jika tidak ada → mulai dari 0001
-- 3. Jika ada (misal max = 5) → next = 0006
```

## ⚠️ Catatan Penting

1. **Trigger sudah ada** - Tidak perlu update trigger, hanya update fungsi
2. **Invoice lama tidak berubah** - Invoice yang sudah ada tetap seperti semula
3. **Invoice baru** - Mulai sekarang akan menggunakan tanggal WIB yang benar
4. **Reset harian** - Invoice reset ke 0001 setiap hari pada jam 00:00 WIB

## 🔍 Troubleshooting

### Invoice masih salah setelah fix?

1. **Cek apakah fungsi sudah terupdate:**
```sql
SELECT generate_invoice_no();
```

2. **Cek timezone Supabase:**
```sql
SELECT 
  now() as utc_time,
  timezone('Asia/Jakarta', now()) as wib_time;
```

3. **Cek trigger masih aktif:**
```sql
SELECT * FROM pg_trigger WHERE tgname = 'trigger_set_invoice_no';
```

### Invoice duplicate?

Tidak akan terjadi karena:
- Advisory lock mencegah race condition
- Safety check sebelum return
- Unique index pada invoice_no

## 📊 Monitoring

Query untuk monitoring invoice harian:

```sql
-- Invoice hari ini (WIB)
SELECT 
  invoice_no,
  user_email,
  amount,
  timezone('Asia/Jakarta', created_at) as created_wib
FROM payments
WHERE invoice_no LIKE 'INV/' || TO_CHAR((timezone('Asia/Jakarta', now()))::DATE, 'DDMMYYYY') || '/%'
ORDER BY invoice_no;
```

## ✅ Checklist

- [ ] Jalankan `FIX_INVOICE_TIMEZONE_CORRECT.sql`
- [ ] Verifikasi output menunjukkan SUCCESS
- [ ] Test approve payment baru
- [ ] Cek invoice number menggunakan tanggal WIB
- [ ] Dokumentasikan untuk tim

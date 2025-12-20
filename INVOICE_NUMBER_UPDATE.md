# Update Invoice Number System

## Perubahan yang Dilakukan

### 1. Database Changes
- Menambahkan kolom `invoice_no` di table `payments` dengan tipe TEXT dan constraint UNIQUE
- Membuat function `generate_invoice_no()` untuk generate nomor invoice otomatis
- Membuat trigger `set_invoice_no()` yang otomatis generate invoice number saat insert payment baru
- Update semua data existing dengan invoice number yang sesuai

### 2. Format Invoice Number
Format: `INV/DDMMYYYY/XXXX`

Contoh:
- `INV/20122025/0001` - Invoice pertama pada tanggal 20 Desember 2025
- `INV/20122025/0002` - Invoice kedua pada tanggal 20 Desember 2025
- `INV/21122025/0001` - Invoice pertama pada tanggal 21 Desember 2025

**Komponen:**
- `INV` - Prefix tetap
- `DD` - Tanggal (2 digit)
- `MM` - Bulan (2 digit)
- `YYYY` - Tahun (4 digit)
- `XXXX` - Sequence number per hari (4 digit dengan leading zeros)

### 3. Frontend Changes

#### File yang Diupdate:
1. **src/pages/MyPayments.tsx**
   - Menambahkan field `invoice_no` di interface Payment
   - Menampilkan `invoice_no` jika ada, fallback ke format lama jika null

2. **src/lib/invoiceGenerator.ts**
   - Menambahkan field `invoice_no` di interface Payment
   - Menggunakan `invoice_no` untuk generate PDF invoice

### 4. Cara Menjalankan

1. **Jalankan SQL Script:**
   ```bash
   # Login ke Supabase Dashboard
   # Buka SQL Editor
   # Copy paste isi file ADD_INVOICE_NO_FIELD.sql
   # Execute
   ```

2. **Verifikasi:**
   - Cek table payments untuk memastikan kolom `invoice_no` sudah ada
   - Cek data existing sudah ter-update dengan invoice number
   - Test create payment baru untuk memastikan trigger berjalan

3. **Test di Frontend:**
   - Buka halaman "Pembayaran Saya"
   - Pastikan nomor invoice tampil dengan format baru
   - Download invoice PDF dan pastikan nomor invoice sesuai

### 5. Fitur Otomatis

- **Auto-generate:** Setiap payment baru akan otomatis mendapat invoice number
- **Sequence per hari:** Sequence number akan reset setiap hari
- **Unique constraint:** Tidak ada duplikasi invoice number
- **Backward compatible:** Data lama yang belum punya invoice_no akan di-generate otomatis

### 6. Contoh Query

```sql
-- Lihat invoice number terbaru
SELECT invoice_no, created_at, payment_status, amount_with_code
FROM payments
ORDER BY created_at DESC
LIMIT 10;

-- Hitung jumlah invoice per hari
SELECT 
  DATE(created_at) as tanggal,
  COUNT(*) as jumlah_invoice
FROM payments
GROUP BY DATE(created_at)
ORDER BY tanggal DESC;

-- Cari invoice berdasarkan nomor
SELECT *
FROM payments
WHERE invoice_no = 'INV/20122025/0001';
```

## Keuntungan

1. **Professional:** Format invoice number yang lebih profesional dan mudah dibaca
2. **Traceable:** Mudah tracking invoice berdasarkan tanggal
3. **Sequential:** Sequence number yang teratur per hari
4. **Unique:** Tidak ada duplikasi nomor invoice
5. **Automatic:** Tidak perlu manual input, semua otomatis

## Notes

- Invoice number akan di-generate saat payment dibuat (INSERT)
- Jika ada payment yang dibuat di hari yang sama, sequence akan increment otomatis
- Format tanggal menggunakan timezone server database
- Existing data akan di-update dengan sequence berdasarkan urutan created_at

# Panduan Lengkap: Fix Invoice Timezone

## 🔍 Masalah

Invoice menampilkan tanggal **23/12/2025** padahal seharusnya **24/12/2025**.

**Penyebab:** Database Supabase menggunakan timezone UTC, sedangkan Indonesia menggunakan WIB (UTC+7). Ketika di Indonesia sudah jam 00:00 tanggal 24, di UTC masih jam 17:00 tanggal 23.

## ✅ Solusi (Pilih Salah Satu)

### Opsi 1: Set Timezone Database (RECOMMENDED)

Ini solusi paling bersih karena semua query otomatis pakai timezone Jakarta.

#### Langkah-langkah:

1. **Buka Supabase SQL Editor**

2. **Jalankan command ini:**
```sql
ALTER DATABASE postgres SET timezone TO 'Asia/Jakarta';
```

3. **Reconnect ke database** (refresh browser atau reconnect)

4. **Verify:**
```sql
SHOW timezone;
-- Harusnya tampil: Asia/Jakarta

SELECT CURRENT_DATE;
-- Harusnya tampil tanggal hari ini (WIB)
```

5. **Selesai!** Semua fungsi otomatis pakai timezone Jakarta.

#### Keuntungan:
- ✅ Permanent untuk semua connection
- ✅ Tidak perlu ubah code
- ✅ Semua `CURRENT_DATE`, `now()`, dll otomatis pakai WIB
- ✅ Konsisten di seluruh database

#### Kekurangan:
- ⚠️ Perlu akses superuser/admin
- ⚠️ Affect semua table dan function

---

### Opsi 2: Update Fungsi Invoice Saja

Jika tidak bisa ubah timezone database, update fungsi `generate_invoice_no()`.

#### Langkah-langkah:

1. **Buka Supabase SQL Editor**

2. **Jalankan file:** `FIX_INVOICE_SIMPLE.sql`

3. **Verify:**
```sql
SELECT generate_invoice_no() as test_invoice;
-- Harusnya tampil: INV/24122025/XXXX (dengan tanggal hari ini WIB)
```

#### Keuntungan:
- ✅ Tidak perlu akses admin
- ✅ Hanya affect fungsi invoice
- ✅ Aman dan terisolasi

#### Kekurangan:
- ⚠️ Harus manual ubah setiap fungsi yang butuh timezone
- ⚠️ Code jadi lebih panjang

---

## 🧪 Testing

Setelah apply salah satu solusi:

### Test 1: Check Timezone
```sql
-- Jika pakai Opsi 1
SHOW timezone;
-- Expected: Asia/Jakarta

-- Jika pakai Opsi 2
SELECT 
  CURRENT_DATE as utc_date,
  (timezone('Asia/Jakarta', now()))::DATE as wib_date;
-- Expected: wib_date = tanggal hari ini
```

### Test 2: Generate Invoice
```sql
SELECT generate_invoice_no() as test_invoice;
-- Expected: INV/24122025/XXXX (dengan tanggal hari ini)
```

### Test 3: Create Payment
Buat payment baru dan verify invoice number-nya menggunakan tanggal yang benar.

---

## 📋 Checklist

**Opsi 1 (Set Timezone Database):**
- [ ] Jalankan `ALTER DATABASE postgres SET timezone TO 'Asia/Jakarta';`
- [ ] Reconnect ke database
- [ ] Verify dengan `SHOW timezone;`
- [ ] Test dengan `SELECT CURRENT_DATE;`
- [ ] Test generate invoice

**Opsi 2 (Update Fungsi):**
- [ ] Jalankan `FIX_INVOICE_SIMPLE.sql`
- [ ] Test dengan `SELECT generate_invoice_no();`
- [ ] Verify tanggal di invoice benar
- [ ] Test create payment baru

---

## 🎯 Hasil yang Diharapkan

**Sebelum Fix:**
- Invoice: `INV/23122025/0005` (salah, 1 hari mundur)
- Tanggal: 24 Des 2025
- ❌ Tidak match!

**Setelah Fix:**
- Invoice: `INV/24122025/0001` (benar!)
- Tanggal: 24 Des 2025
- ✅ Match!

---

## 💡 Rekomendasi

**Gunakan Opsi 1** jika memungkinkan karena:
1. Lebih bersih dan konsisten
2. Tidak perlu ubah code
3. Semua fungsi otomatis benar
4. Lebih mudah maintenance

**Gunakan Opsi 2** jika:
1. Tidak punya akses admin
2. Shared database dengan aplikasi lain
3. Tidak bisa ubah timezone database

---

## 🔧 Troubleshooting

### Invoice masih salah setelah fix?

1. **Cek timezone:**
```sql
SHOW timezone;
```

2. **Cek fungsi:**
```sql
SELECT generate_invoice_no();
```

3. **Cek trigger masih aktif:**
```sql
SELECT * FROM pg_trigger WHERE tgname = 'trigger_set_invoice_no';
```

4. **Clear cache dan reconnect**

### Timezone tidak berubah?

- Pastikan sudah reconnect setelah `ALTER DATABASE`
- Coba logout dan login lagi ke Supabase
- Restart connection pool jika ada

---

## 📝 Catatan Penting

1. **Invoice lama tidak berubah** - Hanya invoice baru yang akan pakai tanggal benar
2. **Reset harian** - Sequence reset ke 0001 setiap hari (midnight WIB)
3. **Race condition** - Sudah di-handle dengan advisory lock
4. **Timezone aware** - Semua timestamp di database tetap disimpan dalam UTC, hanya display yang pakai WIB

---

## 🚀 Deploy

Setelah test berhasil:

1. Commit perubahan (jika ada)
2. Deploy ke production
3. Monitor invoice generation
4. Verify tanggal benar di production

---

## 📞 Support

Jika masih ada masalah, cek:
- Supabase Dashboard > Settings > Database
- Logs di Supabase
- Browser console untuk error

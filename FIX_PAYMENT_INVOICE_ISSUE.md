# Fix Payment Invoice Issue

## Problem
Error saat submit payment: `duplicate key value violates unique constraint "payments_invoice_no_key"`

## Root Cause
Kolom `invoice_no` memiliki UNIQUE constraint yang tidak mengizinkan multiple NULL values di beberapa konfigurasi PostgreSQL.

## Solution - JALANKAN INI

### ⚡ FINAL FIX (Gunakan ini!)
Jalankan file **`FIX_INVOICE_FINAL.sql`** di Supabase SQL Editor.

File ini menggunakan **PostgreSQL Advisory Lock** untuk mencegah race condition:

1. ✅ Advisory lock mencegah concurrent execution
2. ✅ Trigger auto-generate invoice_no (100% thread-safe)
3. ✅ Update semua record yang NULL
4. ✅ Verifikasi tidak ada duplicate
5. ✅ Menampilkan distribusi invoice per tanggal

**Mengapa menggunakan Advisory Lock?**
- Lock hanya aktif selama transaction (tidak blocking permanent)
- Mencegah 2 request generate invoice number yang sama secara bersamaan
- Lock key berbeda per tanggal, jadi tidak blocking request di hari berbeda

### Setelah Menjalankan SQL:
1. Coba submit payment dari halaman Pricing
2. Invoice number akan otomatis terisi dengan format: `INV/DDMMYYYY/XXXX`
3. Tidak perlu restart aplikasi

## Invoice Number Format
Format: `INV/DDMMYYYY/XXXX`

Contoh:
- `INV/20122024/0001` - Payment pertama tanggal 20 Desember 2024
- `INV/20122024/0002` - Payment kedua tanggal 20 Desember 2024
- `INV/21122024/0001` - Payment pertama tanggal 21 Desember 2024

## How It Works

### Trigger Flow:
```
User Submit Payment
    ↓
INSERT INTO payments (invoice_no = NULL)
    ↓
TRIGGER: trigger_set_invoice_no (BEFORE INSERT)
    ↓
FUNCTION: generate_invoice_no()
    ↓
Generate: INV/DDMMYYYY/XXXX
    ↓
Set NEW.invoice_no = generated number
    ↓
Record saved with invoice_no
```

## Verification

### Check if trigger is active:
```sql
SELECT 
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger 
WHERE tgname = 'trigger_set_invoice_no';
```

### Check recent payments:
```sql
SELECT 
  id,
  invoice_no,
  user_email,
  amount,
  created_at
FROM payments
ORDER BY created_at DESC
LIMIT 10;
```

### Check for NULL invoice_no:
```sql
SELECT COUNT(*) as null_count
FROM payments
WHERE invoice_no IS NULL;
```

Should return **0** after running the fix.

## Troubleshooting

### If invoice_no still NULL after insert:
1. Pastikan trigger sudah dijalankan: `ENSURE_INVOICE_AUTO_GENERATE.sql`
2. Check trigger status dengan query di atas
3. Restart Supabase connection (refresh browser)

### If duplicate key error persists:
1. Pastikan partial unique index sudah dibuat
2. Check dengan: 
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'payments' 
AND indexname = 'payments_invoice_no_unique_idx';
```

## Notes
- ✅ Invoice number di-generate otomatis oleh database trigger
- ✅ Tidak perlu mengirim invoice_no dari frontend
- ✅ Sequence number direset setiap hari (mulai dari 0001)
- ✅ Invoice number bersifat immutable (tidak berubah setelah di-generate)
- ✅ Thread-safe (tidak akan ada duplicate meskipun concurrent inserts)

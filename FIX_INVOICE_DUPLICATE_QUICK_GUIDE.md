# Quick Fix: Invoice Duplicate Error

## Error Message
```
Failed to submit payment: duplicate key value violates unique constraint "idx_payments_invoice_unique"
```

## Penyebab
Invoice number tidak di-generate dengan benar, menyebabkan duplicate invoice_no.

## Solusi Cepat

### Step 1: Jalankan SQL Fix
Di **Supabase SQL Editor**, jalankan file:
```
FIX_INVOICE_DUPLICATE_ERROR.sql
```

File ini akan:
1. ✅ Drop trigger & function lama yang bermasalah
2. ✅ Create function baru dengan **advisory lock** (mencegah race condition)
3. ✅ Create trigger baru
4. ✅ Test function
5. ✅ Fix existing NULL invoices

### Step 2: Verify
Setelah jalankan SQL, cek di SQL Editor:

```sql
-- Test generate invoice
SELECT generate_invoice_no() as test1;
SELECT generate_invoice_no() as test2;
SELECT generate_invoice_no() as test3;

-- Harusnya return:
-- INV/22122025/0001
-- INV/22122025/0002
-- INV/22122025/0003
```

### Step 3: Test Submit Payment
1. Buka halaman Pricing
2. Pilih paket
3. Upload bukti transfer
4. Submit payment
5. Seharusnya berhasil tanpa error

## Penjelasan Fix

### Logic Invoice Generation (Sesuai Requirement)

**Query yang dijalankan:**
```sql
-- Cek max invoice untuk hari ini
SELECT MAX(invoice_no) 
FROM payments 
WHERE invoice_no LIKE 'INV/22122025/%';

-- Jika tidak ditemukan (NULL) → return 0001
-- Jika ditemukan (misal: INV/22122025/0005) → return 0006
```

**Contoh Skenario:**

**Hari 1 (22 Dec 2025):**
```
Payment 1: INV/22122025/0001
Payment 2: INV/22122025/0002
Payment 3: INV/22122025/0003
```

**Hari 2 (23 Dec 2025) - RESET ke 0001:**
```
Payment 1: INV/23122025/0001  ← Reset karena prefix berubah
Payment 2: INV/23122025/0002
Payment 3: INV/23122025/0003
```

**Hari 3 (24 Dec 2025) - RESET lagi:**
```
Payment 1: INV/24122025/0001  ← Reset lagi
Payment 2: INV/24122025/0002
```

### Advisory Lock
Function baru menggunakan **3 layer protection** untuk mencegah race condition:

#### Layer 1: Advisory Lock (Transaction Level)
```sql
-- Lock berdasarkan tanggal
lock_key := ('x' || md5(CURRENT_DATE::TEXT))::bit(64)::bigint;
PERFORM pg_advisory_xact_lock(lock_key);
```

Ini memastikan hanya 1 transaction yang bisa generate invoice number pada saat yang sama.

**Contoh:**
```
Payment A: Lock → Generate INV/22122025/0001 → Unlock
Payment B: Wait → Lock → Generate INV/22122025/0002 → Unlock
Payment C: Wait → Lock → Generate INV/22122025/0003 → Unlock
```

#### Layer 2: Row-Level Lock
```sql
-- Lock rows dulu di subquery, baru aggregate
SELECT MAX(sequence) 
FROM (
  SELECT invoice_no
  FROM payments
  WHERE invoice_no LIKE 'INV/22122025/%'
  FOR UPDATE  -- Lock di subquery
) locked_rows;
```

**Kenapa pakai subquery?**
PostgreSQL tidak mengizinkan `FOR UPDATE` dengan aggregate function (MAX, COUNT, dll). Solusinya:
1. Lock rows di subquery dulu
2. Baru aggregate di outer query

Backup protection untuk mencegah dirty read.

#### Layer 3: Retry Mechanism
```sql
LOOP
  BEGIN
    generated_invoice := generate_invoice_no();
    EXIT;  -- Success
  EXCEPTION
    WHEN unique_violation THEN
      retry_count := retry_count + 1;
      PERFORM pg_sleep(0.01);  -- Wait 10ms
      -- Retry...
  END;
END LOOP;
```

Jika masih terjadi duplicate (sangat jarang), retry otomatis 3x.

### Format Invoice
```
INV/DDMMYYYY/XXXX

Contoh:
Hari 1 (22 Dec 2025):
  INV/22122025/0001
  INV/22122025/0002
  INV/22122025/0003

Hari 2 (23 Dec 2025) - RESET:
  INV/23122025/0001  ← Reset ke 0001
  INV/23122025/0002
  INV/23122025/0003

Hari 3 (24 Dec 2025) - RESET lagi:
  INV/24122025/0001  ← Reset ke 0001 lagi
```

**Reset otomatis setiap hari** karena prefix (DDMMYYYY) berubah!

### Sequence Logic
```sql
-- Step 1: Build prefix untuk hari ini
today_prefix := 'INV/' || TO_CHAR(CURRENT_DATE, 'DDMMYYYY') || '/';
-- Hasil: 'INV/22122025/'

-- Step 2: Cek max sequence untuk hari ini
SELECT MAX(sequence_number) 
FROM payments
WHERE invoice_no LIKE 'INV/22122025/%';
-- Jika tidak ada → NULL → COALESCE jadi 0
-- Jika ada INV/22122025/0005 → return 5

-- Step 3: Next sequence = max + 1
next_seq := COALESCE(max_seq, 0) + 1;
-- Jika max_seq = NULL → next_seq = 1
-- Jika max_seq = 5 → next_seq = 6

-- Step 4: Format dengan padding 4 digit
new_invoice := today_prefix || LPAD(next_seq::TEXT, 4, '0');
-- Hasil: INV/22122025/0001 atau INV/22122025/0006
```

**Kenapa reset otomatis setiap hari?**
Karena `today_prefix` berubah setiap hari:
- Hari ini: `INV/22122025/` → query cari max di prefix ini
- Besok: `INV/23122025/` → query cari max di prefix baru (tidak ada) → mulai dari 0001

## Troubleshooting

### Error masih muncul setelah fix?

**Check 1: Apakah trigger aktif?**
```sql
SELECT 
  tgname,
  tgenabled
FROM pg_trigger 
WHERE tgrelid = 'payments'::regclass
AND tgname = 'set_invoice_no_trigger';

-- tgenabled should be 'O' (enabled)
```

**Check 2: Apakah ada duplicate invoice?**
```sql
SELECT 
  invoice_no, 
  COUNT(*) 
FROM payments 
GROUP BY invoice_no 
HAVING COUNT(*) > 1;

-- Should return empty (no duplicates)
```

**Check 3: Apakah ada multiple triggers?**
```sql
SELECT * 
FROM pg_trigger 
WHERE tgrelid = 'payments'::regclass;

-- Should only have 1 trigger: set_invoice_no_trigger
```

### Jika ada multiple triggers:
```sql
-- Drop semua trigger invoice
DROP TRIGGER IF EXISTS set_invoice_no_trigger ON payments;
DROP TRIGGER IF EXISTS trg_set_invoice ON payments;
DROP TRIGGER IF EXISTS trigger_set_invoice_no ON payments;

-- Jalankan ulang FIX_INVOICE_DUPLICATE_ERROR.sql
```

### Jika ada duplicate invoice existing:
```sql
-- Find duplicates
SELECT invoice_no, array_agg(id) as payment_ids
FROM payments
GROUP BY invoice_no
HAVING COUNT(*) > 1;

-- Fix manually (keep first, regenerate others)
UPDATE payments
SET invoice_no = generate_invoice_no()
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY invoice_no ORDER BY created_at) as rn
    FROM payments
    WHERE invoice_no IS NOT NULL
  ) sub
  WHERE rn > 1
);
```

## Expected Result

**Sebelum Fix:**
```
❌ Error: duplicate key value violates unique constraint
```

**Setelah Fix:**
```
✅ Payment submitted! Waiting for admin verification.
```

**Invoice Numbers:**
```
Payment 1: INV/22122025/0001
Payment 2: INV/22122025/0002
Payment 3: INV/22122025/0003
```

## Files
- `FIX_INVOICE_DUPLICATE_ERROR.sql` - SQL fix (WAJIB dijalankan)
- `FIX_INVOICE_DUPLICATE_QUICK_GUIDE.md` - This guide

## Status
✅ Ready to fix - Jalankan SQL file sekarang!

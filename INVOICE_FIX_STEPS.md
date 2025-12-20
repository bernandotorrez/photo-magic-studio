# Invoice Number Fix - Step by Step

## Problem
Duplicate key error: `payments_invoice_no_unique_idx`

## Root Cause
Function `generate_invoice_no()` tidak mengambil MAX sequence dengan benar, sehingga menghasilkan invoice number yang sudah ada.

## Solution Steps

### Step 1: Debug (Optional)
Jalankan `DEBUG_INVOICE_ISSUE.sql` untuk melihat:
- Invoice yang sudah ada hari ini
- Apakah regex pattern bekerja
- Apa yang dikembalikan oleh function

### Step 2: Apply Fix
Jalankan **`FIX_INVOICE_ROBUST.sql`**

File ini akan:
1. ✅ Membuat function dengan loop + existence check
2. ✅ Menggunakan regex pattern yang lebih ketat: `^INV/DDMMYYYY/\d{4}$`
3. ✅ Advisory lock untuk prevent race condition
4. ✅ Fallback mechanism jika terjadi infinite loop
5. ✅ Logging untuk debugging

### Step 3: Test
Setelah menjalankan SQL:

1. Lihat output NOTICE di SQL Editor
2. Cek invoice yang sudah ada
3. Coba submit payment dari aplikasi
4. Verify invoice number bertambah dengan benar

## How It Works

### New Logic:
```sql
1. Lock transaction dengan advisory lock
2. Query MAX sequence dari invoice hari ini
3. Loop:
   a. Generate invoice dengan sequence + attempt offset
   b. Check apakah invoice sudah exist
   c. Jika tidak exist → return
   d. Jika exist → increment attempt dan coba lagi
4. Jika loop > 100x → gunakan timestamp sebagai fallback
```

### Example Flow:
```
Existing: INV/20122025/0001
          INV/20122025/0002

Query MAX: 2
Next sequence: 3
Generated: INV/20122025/0003 ✅
```

## Verification Queries

### Check today's invoices:
```sql
SELECT invoice_no, user_email, created_at
FROM payments
WHERE invoice_no ~ ('^INV/' || TO_CHAR(CURRENT_DATE, 'DDMMYYYY') || '/\d{4}$')
ORDER BY invoice_no;
```

### Test function manually:
```sql
SELECT generate_invoice_no();
```

### Check for duplicates:
```sql
SELECT invoice_no, COUNT(*) as count
FROM payments
WHERE invoice_no IS NOT NULL
GROUP BY invoice_no
HAVING COUNT(*) > 1;
```

## Troubleshooting

### If still getting duplicates:

1. **Check if trigger is active:**
```sql
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname = 'trigger_set_invoice_no';
```

2. **Check function definition:**
```sql
SELECT prosrc 
FROM pg_proc 
WHERE proname = 'generate_invoice_no';
```

3. **Manual test:**
```sql
-- Run this multiple times and check if numbers increment
SELECT generate_invoice_no();
SELECT generate_invoice_no();
SELECT generate_invoice_no();
```

4. **Check for concurrent inserts:**
   - Jika ada multiple users submit payment bersamaan
   - Advisory lock seharusnya handle ini
   - Check log NOTICE untuk melihat sequence yang di-generate

### If function returns NULL:
- Check if there's an error in the function
- Look at PostgreSQL logs
- Try running DEBUG_INVOICE_ISSUE.sql

## Notes

- ✅ Function menggunakan regex `~` operator untuk pattern matching yang lebih ketat
- ✅ Advisory lock mencegah concurrent execution
- ✅ Loop + existence check memastikan tidak ada duplicate
- ✅ Fallback mechanism untuk edge cases
- ✅ RAISE NOTICE untuk debugging

## Expected Behavior

After fix:
1. User submit payment → trigger fires
2. Function generates next invoice number
3. Invoice saved with unique number
4. No duplicate key error

Invoice format: `INV/DDMMYYYY/XXXX`
- DD: Day (01-31)
- MM: Month (01-12)
- YYYY: Year (2025)
- XXXX: Sequence (0001, 0002, 0003, ...)

Sequence resets daily automatically.

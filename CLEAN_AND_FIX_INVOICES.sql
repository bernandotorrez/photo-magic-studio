-- =====================================================
-- CLEAN AND FIX INVOICES - REMOVE DUPLICATES FIRST
-- =====================================================

-- Step 1: Check for duplicates
SELECT 
  'Checking for duplicate invoices...' as status;

SELECT 
  invoice_no,
  COUNT(*) as count,
  array_agg(id) as payment_ids
FROM payments
WHERE invoice_no IS NOT NULL
GROUP BY invoice_no
HAVING COUNT(*) > 1;

-- Step 2: Remove duplicates - keep oldest, set others to NULL
DO $$
DECLARE
  dup_record RECORD;
  keep_id UUID;
  remove_ids UUID[];
BEGIN
  FOR dup_record IN 
    SELECT 
      invoice_no,
      array_agg(id ORDER BY created_at) as ids
    FROM payments
    WHERE invoice_no IS NOT NULL
    GROUP BY invoice_no
    HAVING COUNT(*) > 1
  LOOP
    -- Keep the first (oldest) payment
    keep_id := dup_record.ids[1];
    
    -- Set others to NULL
    UPDATE payments
    SET invoice_no = NULL
    WHERE invoice_no = dup_record.invoice_no
      AND id != keep_id;
    
    RAISE NOTICE 'Kept invoice % for payment %, set % others to NULL', 
      dup_record.invoice_no, keep_id, array_length(dup_record.ids, 1) - 1;
  END LOOP;
END $$;

-- Step 3: Drop and recreate index
DROP INDEX IF EXISTS payments_invoice_no_unique_idx;
CREATE UNIQUE INDEX payments_invoice_no_unique_idx 
ON payments(invoice_no) 
WHERE invoice_no IS NOT NULL;

-- Step 4: Verify no duplicates
SELECT 
  'Verification after cleanup:' as status;

SELECT 
  COUNT(*) as total_payments,
  COUNT(invoice_no) as with_invoice,
  COUNT(*) - COUNT(invoice_no) as null_invoices
FROM payments;

SELECT 
  invoice_no,
  COUNT(*) as count
FROM payments
WHERE invoice_no IS NOT NULL
GROUP BY invoice_no
HAVING COUNT(*) > 1;

-- If above returns no rows, we're good!

-- Step 5: Now regenerate NULL invoices properly
DO $$
DECLARE
  rec RECORD;
  date_str TEXT;
  max_seq INTEGER;
  next_seq INTEGER;
  inv TEXT;
BEGIN
  FOR rec IN 
    SELECT id, created_at 
    FROM payments 
    WHERE invoice_no IS NULL 
    ORDER BY created_at
  LOOP
    date_str := TO_CHAR(rec.created_at, 'DDMMYYYY');
    
    -- Find max sequence for this date
    SELECT COALESCE(
      MAX(CAST(SUBSTRING(invoice_no FROM '\d{4}$') AS INTEGER)),
      0
    ) INTO max_seq
    FROM payments
    WHERE invoice_no LIKE 'INV/' || date_str || '/%';
    
    next_seq := max_seq + 1;
    inv := 'INV/' || date_str || '/' || LPAD(next_seq::TEXT, 4, '0');
    
    -- Make sure it doesn't exist
    WHILE EXISTS (SELECT 1 FROM payments WHERE invoice_no = inv) LOOP
      next_seq := next_seq + 1;
      inv := 'INV/' || date_str || '/' || LPAD(next_seq::TEXT, 4, '0');
    END LOOP;
    
    -- Update record
    UPDATE payments SET invoice_no = inv WHERE id = rec.id;
    
    RAISE NOTICE 'Updated payment % with invoice %', rec.id, inv;
  END LOOP;
END $$;

-- Step 6: Final verification
SELECT 
  '=== FINAL STATUS ===' as status;

SELECT 
  COUNT(*) as total_payments,
  COUNT(invoice_no) as with_invoice,
  COUNT(*) - COUNT(invoice_no) as null_invoices,
  COUNT(DISTINCT invoice_no) as unique_invoices
FROM payments;

-- Step 7: Show recent payments
SELECT 
  id,
  invoice_no,
  user_email,
  amount,
  payment_status,
  created_at
FROM payments
ORDER BY created_at DESC
LIMIT 15;

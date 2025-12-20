-- =====================================================
-- SIMPLE WORKING SOLUTION - GUARANTEED TO WORK
-- =====================================================

-- Step 1: Clean up
DROP TRIGGER IF EXISTS trigger_set_invoice_no ON payments;
DROP TRIGGER IF EXISTS trigger_set_invoice_no_after ON payments;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_invoice_no_key;
DROP INDEX IF EXISTS payments_invoice_no_unique_idx;

-- Step 2: Create unique index (partial - only for non-NULL)
CREATE UNIQUE INDEX payments_invoice_no_unique_idx 
ON payments(invoice_no) 
WHERE invoice_no IS NOT NULL;

-- Step 3: Create the simplest possible invoice generation function
CREATE OR REPLACE FUNCTION generate_invoice_no()
RETURNS TEXT AS $$
DECLARE
  date_str TEXT;
  next_seq INTEGER;
  invoice TEXT;
BEGIN
  -- Get today's date string
  date_str := TO_CHAR(CURRENT_DATE, 'DDMMYYYY');
  
  -- Get next sequence by counting today's invoices + 1
  SELECT COUNT(*) + 1 INTO next_seq
  FROM payments
  WHERE DATE(created_at) = CURRENT_DATE;
  
  -- Build invoice number
  invoice := 'INV/' || date_str || '/' || LPAD(next_seq::TEXT, 4, '0');
  
  -- If invoice exists, keep incrementing until we find unused one
  WHILE EXISTS (SELECT 1 FROM payments WHERE invoice_no = invoice) LOOP
    next_seq := next_seq + 1;
    invoice := 'INV/' || date_str || '/' || LPAD(next_seq::TEXT, 4, '0');
  END LOOP;
  
  RETURN invoice;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Step 4: Create trigger function with table lock
CREATE OR REPLACE FUNCTION set_invoice_no()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_no IS NULL THEN
    -- Lock the payments table to prevent concurrent inserts
    LOCK TABLE payments IN SHARE ROW EXCLUSIVE MODE;
    
    -- Generate invoice
    NEW.invoice_no := generate_invoice_no();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create trigger
CREATE TRIGGER trigger_set_invoice_no
  BEFORE INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_no();

-- Step 6: Update existing NULL invoices
DO $$
DECLARE
  rec RECORD;
  date_map JSONB := '{}'::JSONB;
  date_str TEXT;
  seq_num INTEGER;
  inv TEXT;
BEGIN
  FOR rec IN 
    SELECT id, created_at 
    FROM payments 
    WHERE invoice_no IS NULL 
    ORDER BY created_at
  LOOP
    date_str := TO_CHAR(rec.created_at, 'DDMMYYYY');
    
    -- Get current sequence for this date
    IF date_map ? date_str THEN
      seq_num := (date_map->date_str)::INTEGER + 1;
    ELSE
      -- Count existing invoices for this date
      SELECT COUNT(*) + 1 INTO seq_num
      FROM payments
      WHERE invoice_no LIKE 'INV/' || date_str || '/%';
    END IF;
    
    -- Update map
    date_map := jsonb_set(date_map, ARRAY[date_str], to_jsonb(seq_num));
    
    -- Generate invoice
    inv := 'INV/' || date_str || '/' || LPAD(seq_num::TEXT, 4, '0');
    
    -- Update record
    UPDATE payments SET invoice_no = inv WHERE id = rec.id;
  END LOOP;
  
  RAISE NOTICE 'Updated NULL invoices';
END $$;

-- Step 7: Verification
DO $$
DECLARE
  null_count INTEGER;
  dup_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count
  FROM payments WHERE invoice_no IS NULL;
  
  SELECT COUNT(*) INTO dup_count
  FROM (
    SELECT invoice_no, COUNT(*) 
    FROM payments 
    WHERE invoice_no IS NOT NULL
    GROUP BY invoice_no 
    HAVING COUNT(*) > 1
  ) dups;
  
  RAISE NOTICE '=== VERIFICATION ===';
  RAISE NOTICE 'NULL invoices: %', null_count;
  RAISE NOTICE 'Duplicate invoices: %', dup_count;
  
  IF null_count = 0 AND dup_count = 0 THEN
    RAISE NOTICE '✅ All good! Ready to use.';
  ELSE
    RAISE WARNING '⚠️ Issues found!';
  END IF;
END $$;

-- Step 8: Test the function
SELECT 
  'Testing invoice generation:' as info,
  generate_invoice_no() as test_invoice;

-- Step 9: Show recent payments
SELECT 
  id,
  invoice_no,
  user_email,
  amount,
  created_at
FROM payments
ORDER BY created_at DESC
LIMIT 10;

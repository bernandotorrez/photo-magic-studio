-- =====================================================
-- FIX INVOICE NUMBER GENERATION - FINAL SOLUTION
-- =====================================================

-- Step 1: Drop existing constraints and indexes
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_invoice_no_key;
DROP INDEX IF EXISTS payments_invoice_no_unique_idx;

-- Step 2: Create partial unique index
CREATE UNIQUE INDEX payments_invoice_no_unique_idx 
ON payments(invoice_no) 
WHERE invoice_no IS NOT NULL;

-- Step 3: Create a simple, robust invoice generation function with advisory lock
CREATE OR REPLACE FUNCTION generate_invoice_no()
RETURNS TEXT AS $$
DECLARE
  current_date_str TEXT;
  sequence_num INTEGER;
  sequence_str TEXT;
  invoice_number TEXT;
  lock_key BIGINT;
BEGIN
  -- Use advisory lock to prevent concurrent execution
  -- Lock key based on current date to allow parallel processing on different days
  lock_key := EXTRACT(EPOCH FROM CURRENT_DATE)::BIGINT;
  PERFORM pg_advisory_xact_lock(lock_key);
  
  -- Get current date in DDMMYYYY format
  current_date_str := TO_CHAR(CURRENT_DATE, 'DDMMYYYY');
  
  -- Find the highest sequence number for today and add 1
  -- Use regex to extract only the last 4 digits from matching invoice numbers
  SELECT COALESCE(
    MAX(
      CAST(
        SUBSTRING(invoice_no FROM 'INV/' || current_date_str || '/(\d{4})$') 
        AS INTEGER
      )
    ), 0
  ) + 1
  INTO sequence_num
  FROM payments
  WHERE invoice_no LIKE 'INV/' || current_date_str || '/%';
  
  -- Format sequence number with leading zeros (4 digits)
  sequence_str := LPAD(sequence_num::TEXT, 4, '0');
  
  -- Construct invoice number: INV/DDMMYYYY/XXXX
  invoice_number := 'INV/' || current_date_str || '/' || sequence_str;
  
  -- Log for debugging
  RAISE NOTICE 'Generated invoice: % (sequence: %)', invoice_number, sequence_num;
  
  RETURN invoice_number;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Step 4: Create trigger function
CREATE OR REPLACE FUNCTION set_invoice_no()
RETURNS TRIGGER AS $$
BEGIN
  -- Always generate invoice_no if it's NULL
  IF NEW.invoice_no IS NULL THEN
    NEW.invoice_no := generate_invoice_no();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Drop and recreate the trigger
DROP TRIGGER IF EXISTS trigger_set_invoice_no ON payments;

CREATE TRIGGER trigger_set_invoice_no
  BEFORE INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_no();

-- Step 6: Update existing NULL invoice_no records
DO $$
DECLARE
  payment_record RECORD;
  date_str TEXT;
  seq_num INTEGER;
  seq_str TEXT;
  inv_no TEXT;
  last_date DATE;
  date_seq_map JSONB := '{}'::JSONB;
BEGIN
  last_date := NULL;
  seq_num := 0;
  
  -- Loop through payments with NULL invoice_no, ordered by date and time
  FOR payment_record IN
    SELECT id, created_at
    FROM payments
    WHERE invoice_no IS NULL
    ORDER BY created_at
  LOOP
    date_str := TO_CHAR(payment_record.created_at, 'DDMMYYYY');
    
    -- Get or initialize sequence for this date
    IF date_seq_map ? date_str THEN
      seq_num := (date_seq_map->date_str)::INTEGER + 1;
    ELSE
      -- Find max sequence for this date
      SELECT COALESCE(
        MAX(
          CASE 
            WHEN invoice_no LIKE 'INV/' || date_str || '/%'
            THEN CAST(SUBSTRING(invoice_no FROM '\d{4}$') AS INTEGER)
            ELSE 0
          END
        ), 0
      ) + 1
      INTO seq_num
      FROM payments
      WHERE invoice_no IS NOT NULL;
    END IF;
    
    -- Store updated sequence
    date_seq_map := jsonb_set(date_seq_map, ARRAY[date_str], to_jsonb(seq_num));
    
    -- Format sequence
    seq_str := LPAD(seq_num::TEXT, 4, '0');
    inv_no := 'INV/' || date_str || '/' || seq_str;
    
    -- Update the record
    UPDATE payments
    SET invoice_no = inv_no
    WHERE id = payment_record.id;
    
    RAISE NOTICE 'Updated payment % with invoice %', payment_record.id, inv_no;
  END LOOP;
  
  RAISE NOTICE 'Completed updating NULL invoice numbers';
END $$;

-- Step 7: Verification
DO $$
DECLARE
  trigger_exists BOOLEAN;
  function_exists BOOLEAN;
  null_count INTEGER;
  duplicate_count INTEGER;
BEGIN
  -- Check if trigger exists
  SELECT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_set_invoice_no'
  ) INTO trigger_exists;
  
  -- Check if function exists
  SELECT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'generate_invoice_no'
  ) INTO function_exists;
  
  -- Count NULL invoice_no
  SELECT COUNT(*) INTO null_count
  FROM payments
  WHERE invoice_no IS NULL;
  
  -- Check for duplicates
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT invoice_no, COUNT(*) as cnt
    FROM payments
    WHERE invoice_no IS NOT NULL
    GROUP BY invoice_no
    HAVING COUNT(*) > 1
  ) duplicates;
  
  -- Report results
  RAISE NOTICE '=== VERIFICATION RESULTS ===';
  RAISE NOTICE 'Trigger exists: %', trigger_exists;
  RAISE NOTICE 'Function exists: %', function_exists;
  RAISE NOTICE 'Records with NULL invoice_no: %', null_count;
  RAISE NOTICE 'Duplicate invoice numbers: %', duplicate_count;
  
  IF trigger_exists AND function_exists AND null_count = 0 AND duplicate_count = 0 THEN
    RAISE NOTICE '✅ Setup complete! Invoice numbers will auto-generate without duplicates.';
  ELSE
    RAISE WARNING '⚠️ Setup incomplete or has issues. Please check the errors above.';
  END IF;
END $$;

-- Step 8: Show recent payments
SELECT 
  id,
  invoice_no,
  user_email,
  amount,
  payment_status,
  created_at
FROM payments
ORDER BY created_at DESC
LIMIT 10;

-- Step 9: Show invoice number distribution by date
SELECT 
  DATE(created_at) as payment_date,
  COUNT(*) as total_payments,
  COUNT(DISTINCT invoice_no) as unique_invoices,
  MIN(invoice_no) as first_invoice,
  MAX(invoice_no) as last_invoice
FROM payments
WHERE invoice_no IS NOT NULL
GROUP BY DATE(created_at)
ORDER BY payment_date DESC
LIMIT 5;

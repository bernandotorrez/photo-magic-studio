-- =====================================================
-- FIX INVOICE NUMBER GENERATION WITH SEQUENCE
-- =====================================================

-- Step 1: Drop existing constraint and create partial unique index
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_invoice_no_key;

DROP INDEX IF EXISTS payments_invoice_no_unique_idx;

CREATE UNIQUE INDEX payments_invoice_no_unique_idx 
ON payments(invoice_no) 
WHERE invoice_no IS NOT NULL;

-- Step 2: Create a sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS invoice_sequence START 1;

-- Step 3: Create function to reset sequence daily
CREATE OR REPLACE FUNCTION reset_invoice_sequence_if_needed()
RETURNS INTEGER AS $$
DECLARE
  last_reset_date DATE;
  current_seq_date DATE;
BEGIN
  -- Get the date from the last invoice number
  SELECT DATE(created_at) INTO last_reset_date
  FROM payments
  WHERE invoice_no IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 1;
  
  current_seq_date := CURRENT_DATE;
  
  -- Reset sequence if it's a new day
  IF last_reset_date IS NULL OR last_reset_date < current_seq_date THEN
    PERFORM setval('invoice_sequence', 1, false);
    RETURN 1;
  END IF;
  
  RETURN 0;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Step 4: Create invoice generation function using sequence
CREATE OR REPLACE FUNCTION generate_invoice_no()
RETURNS TEXT AS $$
DECLARE
  current_date_str TEXT;
  sequence_num INTEGER;
  sequence_str TEXT;
  invoice_number TEXT;
  max_attempts INTEGER := 50;
  attempt INTEGER := 0;
BEGIN
  -- Reset sequence if needed
  PERFORM reset_invoice_sequence_if_needed();
  
  LOOP
    -- Get current date in DDMMYYYY format
    current_date_str := TO_CHAR(CURRENT_DATE, 'DDMMYYYY');
    
    -- Get next sequence number
    sequence_num := nextval('invoice_sequence');
    
    -- Format sequence number with leading zeros (4 digits)
    sequence_str := LPAD(sequence_num::TEXT, 4, '0');
    
    -- Construct invoice number: INV/DDMMYYYY/XXXX
    invoice_number := 'INV/' || current_date_str || '/' || sequence_str;
    
    -- Check if this invoice number already exists (safety check)
    IF NOT EXISTS (SELECT 1 FROM payments WHERE invoice_no = invoice_number) THEN
      RETURN invoice_number;
    END IF;
    
    -- Increment attempt counter (should rarely happen)
    attempt := attempt + 1;
    IF attempt >= max_attempts THEN
      -- Fallback: use timestamp-based unique number
      invoice_number := 'INV/' || current_date_str || '/' || LPAD(EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::TEXT, 10, '0');
      RETURN invoice_number;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Step 5: Create trigger function
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

-- Step 6: Drop and recreate the trigger
DROP TRIGGER IF EXISTS trigger_set_invoice_no ON payments;

CREATE TRIGGER trigger_set_invoice_no
  BEFORE INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_no();

-- Step 7: Update existing NULL invoice_no records
DO $$
DECLARE
  payment_record RECORD;
  date_str TEXT;
  seq_num INTEGER;
  seq_str TEXT;
  inv_no TEXT;
  last_date DATE;
BEGIN
  last_date := NULL;
  seq_num := 0;
  
  -- Loop through payments with NULL invoice_no, ordered by date and time
  FOR payment_record IN
    SELECT id, created_at
    FROM payments
    WHERE invoice_no IS NULL
    ORDER BY DATE(created_at), created_at
  LOOP
    -- Reset sequence if date changes
    IF last_date IS NULL OR last_date != DATE(payment_record.created_at) THEN
      last_date := DATE(payment_record.created_at);
      seq_num := 0;
    END IF;
    
    seq_num := seq_num + 1;
    
    -- Format date and sequence
    date_str := TO_CHAR(payment_record.created_at, 'DDMMYYYY');
    seq_str := LPAD(seq_num::TEXT, 4, '0');
    
    -- Generate invoice number
    inv_no := 'INV/' || date_str || '/' || seq_str;
    
    -- Check if invoice already exists, if so add suffix
    WHILE EXISTS (SELECT 1 FROM payments WHERE invoice_no = inv_no) LOOP
      seq_num := seq_num + 1;
      seq_str := LPAD(seq_num::TEXT, 4, '0');
      inv_no := 'INV/' || date_str || '/' || seq_str;
    END LOOP;
    
    -- Update the record
    UPDATE payments
    SET invoice_no = inv_no
    WHERE id = payment_record.id;
  END LOOP;
  
  RAISE NOTICE 'Updated records with invoice numbers';
END $$;

-- Step 8: Sync sequence with existing invoices for today
DO $$
DECLARE
  max_seq INTEGER;
  current_date_str TEXT;
BEGIN
  current_date_str := TO_CHAR(CURRENT_DATE, 'DDMMYYYY');
  
  -- Find the highest sequence number for today
  SELECT COALESCE(
    MAX(
      CASE 
        WHEN invoice_no ~ ('^INV/' || current_date_str || '/[0-9]{4}$')
        THEN CAST(SUBSTRING(invoice_no FROM '[0-9]{4}$') AS INTEGER)
        ELSE 0
      END
    ), 0
  )
  INTO max_seq
  FROM payments;
  
  -- Set sequence to max + 1
  PERFORM setval('invoice_sequence', max_seq + 1, false);
  
  RAISE NOTICE 'Sequence set to start at %', max_seq + 1;
END $$;

-- Step 9: Verification
DO $$
DECLARE
  trigger_exists BOOLEAN;
  function_exists BOOLEAN;
  sequence_exists BOOLEAN;
  null_count INTEGER;
  current_seq_val BIGINT;
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
  
  -- Check if sequence exists
  SELECT EXISTS (
    SELECT 1 FROM pg_class 
    WHERE relname = 'invoice_sequence' AND relkind = 'S'
  ) INTO sequence_exists;
  
  -- Count NULL invoice_no
  SELECT COUNT(*) INTO null_count
  FROM payments
  WHERE invoice_no IS NULL;
  
  -- Get current sequence value
  SELECT last_value INTO current_seq_val
  FROM invoice_sequence;
  
  -- Report results
  RAISE NOTICE '=== VERIFICATION RESULTS ===';
  RAISE NOTICE 'Trigger exists: %', trigger_exists;
  RAISE NOTICE 'Function exists: %', function_exists;
  RAISE NOTICE 'Sequence exists: %', sequence_exists;
  RAISE NOTICE 'Current sequence value: %', current_seq_val;
  RAISE NOTICE 'Records with NULL invoice_no: %', null_count;
  
  IF trigger_exists AND function_exists AND sequence_exists AND null_count = 0 THEN
    RAISE NOTICE '✅ Setup complete! Invoice numbers will auto-generate.';
  ELSE
    RAISE WARNING '⚠️ Setup incomplete. Please check the errors above.';
  END IF;
END $$;

-- Step 10: Test query - show recent payments with invoice numbers
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

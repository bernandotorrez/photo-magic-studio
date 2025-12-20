-- =====================================================
-- ENSURE INVOICE_NO AUTO-GENERATES ON PAYMENT INSERT
-- =====================================================

-- Step 1: Drop existing constraint and create partial unique index
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_invoice_no_key;

CREATE UNIQUE INDEX IF NOT EXISTS payments_invoice_no_unique_idx 
ON payments(invoice_no) 
WHERE invoice_no IS NOT NULL;

-- Step 2: Create or replace the invoice generation function
CREATE OR REPLACE FUNCTION generate_invoice_no()
RETURNS TEXT AS $$
DECLARE
  current_date_str TEXT;
  sequence_num INTEGER;
  sequence_str TEXT;
  invoice_number TEXT;
  max_attempts INTEGER := 100;
  attempt INTEGER := 0;
BEGIN
  LOOP
    -- Get current date in DDMMYYYY format
    current_date_str := TO_CHAR(CURRENT_TIMESTAMP, 'DDMMYYYY');
    
    -- Get the next sequence number by finding the max existing sequence for today
    SELECT COALESCE(
      MAX(
        CASE 
          WHEN invoice_no ~ ('^INV/' || current_date_str || '/[0-9]{4}$')
          THEN CAST(SUBSTRING(invoice_no FROM '[0-9]{4}$') AS INTEGER)
          ELSE 0
        END
      ), 0
    ) + 1 + attempt
    INTO sequence_num
    FROM payments;
    
    -- Format sequence number with leading zeros (4 digits)
    sequence_str := LPAD(sequence_num::TEXT, 4, '0');
    
    -- Construct invoice number: INV/DDMMYYYY/XXXX
    invoice_number := 'INV/' || current_date_str || '/' || sequence_str;
    
    -- Check if this invoice number already exists
    IF NOT EXISTS (SELECT 1 FROM payments WHERE invoice_no = invoice_number) THEN
      RETURN invoice_number;
    END IF;
    
    -- Increment attempt counter
    attempt := attempt + 1;
    IF attempt >= max_attempts THEN
      -- Fallback: use random number to ensure uniqueness
      sequence_num := FLOOR(RANDOM() * 9000 + 1000)::INTEGER;
      sequence_str := sequence_num::TEXT;
      invoice_number := 'INV/' || current_date_str || '/' || sequence_str;
      RETURN invoice_number;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Step 3: Create or replace the trigger function
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

-- Step 4: Drop and recreate the trigger
DROP TRIGGER IF EXISTS trigger_set_invoice_no ON payments;

CREATE TRIGGER trigger_set_invoice_no
  BEFORE INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_no();

-- Step 5: Update existing NULL invoice_no records
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
    
    -- Update the record
    UPDATE payments
    SET invoice_no = inv_no
    WHERE id = payment_record.id;
  END LOOP;
  
  RAISE NOTICE 'Updated % records with invoice numbers', seq_num;
END $$;

-- Step 6: Verify the setup
DO $$
DECLARE
  trigger_exists BOOLEAN;
  function_exists BOOLEAN;
  null_count INTEGER;
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
  
  -- Report results
  RAISE NOTICE '=== VERIFICATION RESULTS ===';
  RAISE NOTICE 'Trigger exists: %', trigger_exists;
  RAISE NOTICE 'Function exists: %', function_exists;
  RAISE NOTICE 'Records with NULL invoice_no: %', null_count;
  
  IF trigger_exists AND function_exists AND null_count = 0 THEN
    RAISE NOTICE '✅ Setup complete! Invoice numbers will auto-generate.';
  ELSE
    RAISE WARNING '⚠️ Setup incomplete. Please check the errors above.';
  END IF;
END $$;

-- Step 7: Test query - show recent payments with invoice numbers
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

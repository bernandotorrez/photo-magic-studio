-- =====================================================
-- FIX WITH SEQUENCE - ATOMIC SOLUTION
-- =====================================================

-- Step 1: Create a sequence for each day
-- We'll use a single sequence and reset it via function

CREATE SEQUENCE IF NOT EXISTS daily_invoice_seq START 1;

-- Step 2: Create function to get next invoice number (atomic)
CREATE OR REPLACE FUNCTION generate_invoice_no()
RETURNS TEXT AS $$
DECLARE
  date_str TEXT;
  seq_val INTEGER;
  invoice TEXT;
  last_invoice_date DATE;
  today DATE;
BEGIN
  today := CURRENT_DATE;
  date_str := TO_CHAR(today, 'DDMMYYYY');
  
  -- Check if we need to reset sequence (new day)
  SELECT MAX(DATE(created_at)) INTO last_invoice_date
  FROM payments
  WHERE invoice_no IS NOT NULL;
  
  -- Reset sequence if it's a new day or no invoices yet
  IF last_invoice_date IS NULL OR last_invoice_date < today THEN
    PERFORM setval('daily_invoice_seq', 1, false);
  END IF;
  
  -- Get next value from sequence (atomic operation)
  seq_val := nextval('daily_invoice_seq');
  
  -- Build invoice
  invoice := 'INV/' || date_str || '/' || LPAD(seq_val::TEXT, 4, '0');
  
  -- Double check it doesn't exist (should never happen with sequence)
  WHILE EXISTS (SELECT 1 FROM payments WHERE invoice_no = invoice) LOOP
    seq_val := nextval('daily_invoice_seq');
    invoice := 'INV/' || date_str || '/' || LPAD(seq_val::TEXT, 4, '0');
  END LOOP;
  
  RETURN invoice;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Step 3: Sync sequence with existing invoices
DO $$
DECLARE
  max_seq INTEGER;
  date_str TEXT;
BEGIN
  date_str := TO_CHAR(CURRENT_DATE, 'DDMMYYYY');
  
  -- Find max sequence for today
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(invoice_no FROM '\d{4}$') AS INTEGER)),
    0
  ) INTO max_seq
  FROM payments
  WHERE invoice_no LIKE 'INV/' || date_str || '/%';
  
  -- Set sequence to max + 1
  PERFORM setval('daily_invoice_seq', max_seq + 1, false);
  
  RAISE NOTICE 'Sequence set to start at %', max_seq + 1;
END $$;

-- Step 4: Test
SELECT 
  'Testing sequence-based generation:' as status,
  generate_invoice_no() as test1,
  generate_invoice_no() as test2,
  generate_invoice_no() as test3;

-- Should return 0002, 0003, 0004 (or next available numbers)

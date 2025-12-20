-- =====================================================
-- ROBUST INVOICE GENERATION - GUARANTEED NO DUPLICATES
-- =====================================================

-- Drop existing constraint and create partial unique index
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_invoice_no_key;
DROP INDEX IF EXISTS payments_invoice_no_unique_idx;

CREATE UNIQUE INDEX payments_invoice_no_unique_idx 
ON payments(invoice_no) 
WHERE invoice_no IS NOT NULL;

-- Create the most robust invoice generation function
CREATE OR REPLACE FUNCTION generate_invoice_no()
RETURNS TEXT AS $$
DECLARE
  current_date_str TEXT;
  sequence_num INTEGER;
  sequence_str TEXT;
  invoice_number TEXT;
  lock_key BIGINT;
  max_attempts INTEGER := 100;
  attempt INTEGER := 0;
BEGIN
  -- Use advisory lock to prevent concurrent execution
  lock_key := EXTRACT(EPOCH FROM CURRENT_DATE)::BIGINT;
  PERFORM pg_advisory_xact_lock(lock_key);
  
  -- Get current date in DDMMYYYY format
  current_date_str := TO_CHAR(CURRENT_DATE, 'DDMMYYYY');
  
  LOOP
    -- Find the highest sequence number for today
    SELECT COALESCE(MAX(seq), 0) + 1
    INTO sequence_num
    FROM (
      SELECT 
        CAST(SUBSTRING(invoice_no FROM '\d{4}$') AS INTEGER) as seq
      FROM payments
      WHERE invoice_no ~ ('^INV/' || current_date_str || '/\d{4}$')
    ) subquery;
    
    -- Add attempt offset to handle edge cases
    sequence_num := sequence_num + attempt;
    
    -- Format sequence number with leading zeros (4 digits)
    sequence_str := LPAD(sequence_num::TEXT, 4, '0');
    
    -- Construct invoice number: INV/DDMMYYYY/XXXX
    invoice_number := 'INV/' || current_date_str || '/' || sequence_str;
    
    -- Check if this invoice already exists
    IF NOT EXISTS (SELECT 1 FROM payments WHERE invoice_no = invoice_number) THEN
      RAISE NOTICE 'Generated invoice: % (attempt: %)', invoice_number, attempt + 1;
      RETURN invoice_number;
    END IF;
    
    -- Increment attempt
    attempt := attempt + 1;
    
    -- Safety check to prevent infinite loop
    IF attempt >= max_attempts THEN
      -- Use timestamp as fallback
      invoice_number := 'INV/' || current_date_str || '/' || LPAD(EXTRACT(EPOCH FROM CLOCK_TIMESTAMP())::TEXT, 10, '0');
      RAISE WARNING 'Using fallback invoice number: %', invoice_number;
      RETURN invoice_number;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Create trigger function
CREATE OR REPLACE FUNCTION set_invoice_no()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_no IS NULL THEN
    NEW.invoice_no := generate_invoice_no();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS trigger_set_invoice_no ON payments;

CREATE TRIGGER trigger_set_invoice_no
  BEFORE INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_no();

-- Verification
DO $$
DECLARE
  test_invoice TEXT;
BEGIN
  RAISE NOTICE '=== TESTING INVOICE GENERATION ===';
  
  -- Test the function
  test_invoice := generate_invoice_no();
  RAISE NOTICE 'Test generated: %', test_invoice;
  
  -- Show existing invoices for today
  RAISE NOTICE 'Existing invoices for today:';
  FOR test_invoice IN 
    SELECT invoice_no 
    FROM payments 
    WHERE invoice_no ~ ('^INV/' || TO_CHAR(CURRENT_DATE, 'DDMMYYYY') || '/\d{4}$')
    ORDER BY invoice_no
  LOOP
    RAISE NOTICE '  - %', test_invoice;
  END LOOP;
END $$;

-- Show current state
SELECT 
  'Current invoices for today:' as info,
  COUNT(*) as count
FROM payments
WHERE invoice_no ~ ('^INV/' || TO_CHAR(CURRENT_DATE, 'DDMMYYYY') || '/\d{4}$');

SELECT 
  invoice_no,
  user_email,
  created_at
FROM payments
WHERE invoice_no ~ ('^INV/' || TO_CHAR(CURRENT_DATE, 'DDMMYYYY') || '/\d{4}$')
ORDER BY invoice_no;

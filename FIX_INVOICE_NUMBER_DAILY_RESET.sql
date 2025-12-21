-- =====================================================
-- FIX: INVOICE NUMBER DAILY RESET
-- =====================================================
-- Invoice format: INV/DDMMYYYY/XXXX
-- Reset sequence to 0001 every day
-- =====================================================

-- Drop existing function and recreate
DROP FUNCTION IF EXISTS generate_invoice_no();

CREATE OR REPLACE FUNCTION generate_invoice_no()
RETURNS TEXT AS $$
DECLARE
  current_date_str TEXT;
  max_sequence INTEGER;
  next_sequence INTEGER;
  sequence_str TEXT;
  invoice_number TEXT;
  lock_key BIGINT;
BEGIN
  -- Use advisory lock to prevent concurrent execution
  lock_key := EXTRACT(EPOCH FROM CURRENT_DATE)::BIGINT;
  PERFORM pg_advisory_xact_lock(lock_key);
  
  -- Get current date in DDMMYYYY format
  current_date_str := TO_CHAR(CURRENT_DATE, 'DDMMYYYY');
  
  -- Find the highest sequence number for today
  -- Extract the last 4 digits from invoice_no that matches today's date
  SELECT COALESCE(
    MAX(
      CAST(
        RIGHT(invoice_no, 4) AS INTEGER
      )
    ), 0
  )
  INTO max_sequence
  FROM payments
  WHERE invoice_no LIKE 'INV/' || current_date_str || '/%';
  
  -- Next sequence is max + 1
  next_sequence := max_sequence + 1;
  
  -- Format sequence number with leading zeros (4 digits)
  sequence_str := LPAD(next_sequence::TEXT, 4, '0');
  
  -- Construct invoice number: INV/DDMMYYYY/XXXX
  invoice_number := 'INV/' || current_date_str || '/' || sequence_str;
  
  -- Log for debugging
  RAISE NOTICE 'Date: %, Max sequence: %, Next: %, Invoice: %', 
    current_date_str, max_sequence, next_sequence, invoice_number;
  
  RETURN invoice_number;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Update trigger function to use the new generator
DROP FUNCTION IF EXISTS set_invoice_no() CASCADE;

CREATE OR REPLACE FUNCTION set_invoice_no()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if invoice_no is NULL
  IF NEW.invoice_no IS NULL THEN
    NEW.invoice_no := generate_invoice_no();
    RAISE NOTICE 'Auto-generated invoice_no: %', NEW.invoice_no;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS trigger_set_invoice_no ON payments;

CREATE TRIGGER trigger_set_invoice_no
  BEFORE INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_no();

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Test the function
SELECT generate_invoice_no() as test_invoice_1;
SELECT generate_invoice_no() as test_invoice_2;
SELECT generate_invoice_no() as test_invoice_3;

-- Show existing invoices for today
SELECT 
  invoice_no,
  user_email,
  amount,
  created_at
FROM payments
WHERE invoice_no LIKE 'INV/' || TO_CHAR(CURRENT_DATE, 'DDMMYYYY') || '/%'
ORDER BY invoice_no;

-- Show all invoices (last 20)
SELECT 
  invoice_no,
  user_email,
  amount,
  TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI') as created
FROM payments
WHERE invoice_no IS NOT NULL
ORDER BY created_at DESC
LIMIT 20;

-- =====================================================
-- NOTES
-- =====================================================
-- Format: INV/DDMMYYYY/XXXX
-- Example: INV/21122025/0001
--
-- Logic:
-- 1. Get current date in DDMMYYYY format (21122025)
-- 2. Find all invoices with pattern INV/21122025/%
-- 3. Extract last 4 digits (sequence number)
-- 4. Get MAX sequence, add 1
-- 5. If no invoices today, start from 0001
--
-- Daily reset:
-- - Every day, the LIKE pattern changes (different date)
-- - So MAX will return 0 (no invoices for new date)
-- - Sequence starts from 0001 again


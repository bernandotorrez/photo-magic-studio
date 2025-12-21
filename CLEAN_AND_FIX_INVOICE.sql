-- =====================================================
-- CLEAN AND FIX INVOICE NUMBER SYSTEM
-- =====================================================
-- Complete cleanup and rebuild
-- =====================================================

-- Step 1: Drop ALL triggers related to invoice
DROP TRIGGER IF EXISTS trigger_set_invoice_no ON payments;
DROP TRIGGER IF EXISTS trigger_set_invoice_no_after ON payments;
DROP TRIGGER IF EXISTS trg_invoice_before_insert ON payments;
DROP TRIGGER IF EXISTS trg_set_invoice ON payments;

-- Step 2: Drop ALL functions related to invoice
DROP FUNCTION IF EXISTS generate_invoice_no() CASCADE;
DROP FUNCTION IF EXISTS set_invoice_no() CASCADE;
DROP FUNCTION IF EXISTS trg_set_invoice() CASCADE;

-- Step 3: Drop ALL sequences related to invoice
DROP SEQUENCE IF EXISTS invoice_sequence CASCADE;
DROP SEQUENCE IF EXISTS invoice_daily_seq CASCADE;
DROP SEQUENCE IF EXISTS payments_invoice_seq CASCADE;

-- Step 4: Make sure invoice_no column is nullable and has no default
ALTER TABLE payments ALTER COLUMN invoice_no DROP DEFAULT;
ALTER TABLE payments ALTER COLUMN invoice_no DROP NOT NULL;

-- Step 5: Create NEW simple function with advisory lock
CREATE OR REPLACE FUNCTION generate_invoice_no()
RETURNS TEXT AS $$
DECLARE
  current_date_str TEXT;
  max_invoice TEXT;
  last_sequence INTEGER;
  next_sequence INTEGER;
  new_invoice TEXT;
  lock_key BIGINT;
BEGIN
  -- Get current date in DDMMYYYY format
  current_date_str := TO_CHAR(CURRENT_DATE, 'DDMMYYYY');
  
  -- Create lock key from current date (unique per day)
  -- This ensures only one transaction can generate invoice at a time per day
  lock_key := CAST(current_date_str AS BIGINT);
  
  -- Acquire advisory lock (will wait if another transaction has the lock)
  -- Lock is automatically released at end of transaction
  PERFORM pg_advisory_xact_lock(lock_key);
  
  -- Get MAX invoice for today (now safe from race condition)
  SELECT MAX(invoice_no)
  INTO max_invoice
  FROM payments
  WHERE invoice_no LIKE 'INV/' || current_date_str || '/%';
  
  -- If no invoice today, start from 0001
  IF max_invoice IS NULL THEN
    next_sequence := 1;
  ELSE
    -- Extract last 4 digits and add 1
    last_sequence := CAST(RIGHT(max_invoice, 4) AS INTEGER);
    next_sequence := last_sequence + 1;
  END IF;
  
  -- Format: INV/DDMMYYYY/XXXX
  new_invoice := 'INV/' || current_date_str || '/' || LPAD(next_sequence::TEXT, 4, '0');
  
  RETURN new_invoice;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Step 6: Create NEW trigger function
CREATE OR REPLACE FUNCTION set_invoice_no()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_no IS NULL THEN
    NEW.invoice_no := generate_invoice_no();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create NEW trigger
CREATE TRIGGER trigger_set_invoice_no
  BEFORE INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_no();

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT 'Invoice system cleaned and rebuilt successfully!' as status;

-- Test generate function
SELECT generate_invoice_no() as test_next_invoice;

-- Show current invoices for today
SELECT 
  COUNT(*) as total_today,
  MAX(invoice_no) as max_invoice_today
FROM payments
WHERE invoice_no LIKE 'INV/' || TO_CHAR(CURRENT_DATE, 'DDMMYYYY') || '/%';

-- Show last 10 invoices
SELECT 
  invoice_no,
  user_email,
  TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI') as created
FROM payments
WHERE invoice_no IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;


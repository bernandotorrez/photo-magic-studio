-- =====================================================
-- FIX TRIGGER WITH STRONG ADVISORY LOCK
-- =====================================================

-- Update trigger function to use advisory lock properly
CREATE OR REPLACE FUNCTION set_invoice_no()
RETURNS TRIGGER AS $$
DECLARE
  lock_obtained BOOLEAN;
BEGIN
  IF NEW.invoice_no IS NULL THEN
    -- Try to get advisory lock (wait if needed)
    -- Use a fixed lock ID for invoice generation
    PERFORM pg_advisory_xact_lock(123456789);
    
    -- Generate invoice (now protected by lock)
    NEW.invoice_no := generate_invoice_no();
    
    -- Lock will be released automatically at end of transaction
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

-- Test
SELECT 'Trigger updated with advisory lock' as status;

-- Show current setup
SELECT 
  'Current invoices for today:' as info;
  
SELECT 
  invoice_no,
  user_email,
  created_at
FROM payments
WHERE invoice_no LIKE 'INV/' || TO_CHAR(CURRENT_DATE, 'DDMMYYYY') || '/%'
ORDER BY invoice_no;

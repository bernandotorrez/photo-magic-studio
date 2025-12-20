-- =====================================================
-- FIX FUNCTION - CORRECT VERSION
-- =====================================================

-- Replace the generate_invoice_no function with correct logic
CREATE OR REPLACE FUNCTION generate_invoice_no()
RETURNS TEXT AS $$
DECLARE
  date_str TEXT;
  max_seq INTEGER;
  next_seq INTEGER;
  invoice TEXT;
  attempt INTEGER := 0;
BEGIN
  -- Get today's date string
  date_str := TO_CHAR(CURRENT_DATE, 'DDMMYYYY');
  
  -- Find the MAXIMUM sequence number for today's invoices
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(invoice_no FROM '\d{4}$') AS INTEGER)),
    0
  ) INTO max_seq
  FROM payments
  WHERE invoice_no LIKE 'INV/' || date_str || '/%';
  
  -- Next sequence is max + 1
  next_seq := max_seq + 1;
  
  -- Build invoice number
  invoice := 'INV/' || date_str || '/' || LPAD(next_seq::TEXT, 4, '0');
  
  -- Safety check: if invoice exists, keep incrementing
  WHILE EXISTS (SELECT 1 FROM payments WHERE invoice_no = invoice) LOOP
    attempt := attempt + 1;
    next_seq := next_seq + 1;
    invoice := 'INV/' || date_str || '/' || LPAD(next_seq::TEXT, 4, '0');
    
    -- Prevent infinite loop
    IF attempt > 100 THEN
      RAISE EXCEPTION 'Could not generate unique invoice after 100 attempts';
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Generated invoice: % (max was: %, next: %)', invoice, max_seq, next_seq;
  
  RETURN invoice;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Test the function
SELECT 
  'Testing function...' as status,
  generate_invoice_no() as test_result;

-- Show what invoices exist for today
SELECT 
  'Existing invoices for today:' as status;

SELECT 
  invoice_no,
  user_email,
  created_at
FROM payments
WHERE invoice_no LIKE 'INV/' || TO_CHAR(CURRENT_DATE, 'DDMMYYYY') || '/%'
ORDER BY invoice_no;

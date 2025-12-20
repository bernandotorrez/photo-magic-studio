-- =====================================================
-- UPDATE INVOICE GENERATION FUNCTION ONLY
-- Run this if you already ran FIX_INVOICE_FINAL.sql
-- =====================================================

-- Update the invoice generation function with better regex
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

-- Test the function
SELECT generate_invoice_no() as test_invoice_number;

-- Show existing invoices for today
SELECT 
  invoice_no,
  user_email,
  amount,
  created_at
FROM payments
WHERE invoice_no LIKE 'INV/' || TO_CHAR(CURRENT_DATE, 'DDMMYYYY') || '/%'
ORDER BY invoice_no;

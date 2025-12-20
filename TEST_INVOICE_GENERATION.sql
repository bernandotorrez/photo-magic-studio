-- =====================================================
-- TEST INVOICE GENERATION
-- =====================================================

-- Step 1: Check existing invoices for today
SELECT 
  invoice_no,
  user_email,
  created_at
FROM payments
WHERE invoice_no LIKE 'INV/' || TO_CHAR(CURRENT_DATE, 'DDMMYYYY') || '/%'
ORDER BY invoice_no;

-- Step 2: Test the generate_invoice_no function
SELECT generate_invoice_no() as next_invoice_number;

-- Step 3: Check what the MAX query returns
DO $$
DECLARE
  current_date_str TEXT;
  max_seq INTEGER;
BEGIN
  current_date_str := TO_CHAR(CURRENT_DATE, 'DDMMYYYY');
  
  -- Test the MAX query
  SELECT COALESCE(
    MAX(
      CAST(
        SUBSTRING(invoice_no FROM 'INV/' || current_date_str || '/(\d{4})$') 
        AS INTEGER
      )
    ), 0
  )
  INTO max_seq
  FROM payments
  WHERE invoice_no LIKE 'INV/' || current_date_str || '/%';
  
  RAISE NOTICE 'Current date string: %', current_date_str;
  RAISE NOTICE 'Max sequence found: %', max_seq;
  RAISE NOTICE 'Next sequence should be: %', max_seq + 1;
END $$;

-- Step 4: Show all invoices with their sequence numbers
SELECT 
  invoice_no,
  SUBSTRING(invoice_no FROM '\d{4}$') as sequence_part,
  CAST(SUBSTRING(invoice_no FROM '\d{4}$') AS INTEGER) as sequence_number,
  created_at
FROM payments
WHERE invoice_no IS NOT NULL
ORDER BY created_at DESC
LIMIT 20;

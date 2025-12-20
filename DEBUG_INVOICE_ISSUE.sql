-- =====================================================
-- DEBUG INVOICE ISSUE
-- =====================================================

-- Check 1: Show all invoices for today
SELECT 
  'Existing invoices for today:' as info;

SELECT 
  invoice_no,
  user_email,
  created_at
FROM payments
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at;

-- Check 2: Test the LIKE pattern
SELECT 
  'Testing LIKE pattern:' as info;

SELECT 
  invoice_no,
  CASE 
    WHEN invoice_no LIKE 'INV/' || TO_CHAR(CURRENT_DATE, 'DDMMYYYY') || '/%' 
    THEN 'MATCHES'
    ELSE 'NO MATCH'
  END as pattern_match
FROM payments
WHERE invoice_no IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- Check 3: Test SUBSTRING extraction
SELECT 
  'Testing SUBSTRING extraction:' as info;

SELECT 
  invoice_no,
  SUBSTRING(invoice_no FROM '\d{4}$') as extracted_digits,
  SUBSTRING(invoice_no FROM 'INV/\d{8}/(\d{4})$') as extracted_with_group,
  CAST(SUBSTRING(invoice_no FROM '\d{4}$') AS INTEGER) as as_integer
FROM payments
WHERE invoice_no IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- Check 4: Test the MAX query manually
SELECT 
  'Testing MAX query:' as info;

SELECT 
  MAX(
    CAST(
      SUBSTRING(invoice_no FROM '\d{4}$') 
      AS INTEGER
    )
  ) as max_sequence
FROM payments
WHERE invoice_no LIKE 'INV/' || TO_CHAR(CURRENT_DATE, 'DDMMYYYY') || '/%';

-- Check 5: Show what generate_invoice_no() returns
SELECT 
  'Testing generate_invoice_no() function:' as info;

SELECT generate_invoice_no() as generated_invoice;

-- Check 6: Check for any NULL or malformed invoice_no
SELECT 
  'Checking for issues:' as info;

SELECT 
  COUNT(*) as total_payments,
  COUNT(invoice_no) as with_invoice,
  COUNT(*) - COUNT(invoice_no) as null_invoices
FROM payments;

-- Check 7: Look for duplicate invoice numbers
SELECT 
  'Checking for duplicates:' as info;

SELECT 
  invoice_no,
  COUNT(*) as count
FROM payments
WHERE invoice_no IS NOT NULL
GROUP BY invoice_no
HAVING COUNT(*) > 1;

-- =====================================================
-- FIX INVOICE NUMBER TIMEZONE ISSUE
-- Problem: Invoice shows wrong date (23/12/2025 instead of 24/12/2025)
-- Cause: CURRENT_DATE uses UTC, not Indonesia timezone (WIB/UTC+7)
-- Solution: Use timezone('Asia/Jakarta', now()) for date calculation
-- =====================================================

-- Step 1: Update the invoice generation function with Indonesia timezone
CREATE OR REPLACE FUNCTION generate_invoice_no()
RETURNS TEXT AS $$
DECLARE
  current_date_str TEXT;
  sequence_num INTEGER;
  sequence_str TEXT;
  invoice_number TEXT;
  lock_key BIGINT;
  jakarta_date DATE;
BEGIN
  -- Use advisory lock to prevent concurrent execution
  -- Lock key based on current date to allow parallel processing on different days
  jakarta_date := (timezone('Asia/Jakarta', now()))::DATE;
  lock_key := EXTRACT(EPOCH FROM jakarta_date)::BIGINT;
  PERFORM pg_advisory_xact_lock(lock_key);
  
  -- Get current date in DDMMYYYY format using Indonesia timezone
  current_date_str := TO_CHAR(timezone('Asia/Jakarta', now()), 'DDMMYYYY');
  
  -- Find the highest sequence number for today and add 1
  -- Use LIKE pattern to match invoice numbers for today
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
  RAISE NOTICE 'Generated invoice: % (sequence: %, date: %)', invoice_number, sequence_num, current_date_str;
  
  RETURN invoice_number;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Step 2: Verify the function works correctly
DO $$
DECLARE
  test_invoice TEXT;
  expected_date TEXT;
BEGIN
  -- Get expected date in Indonesia timezone
  expected_date := TO_CHAR(timezone('Asia/Jakarta', now()), 'DDMMYYYY');
  
  -- Test the function
  test_invoice := generate_invoice_no();
  
  RAISE NOTICE '=== TIMEZONE FIX VERIFICATION ===';
  RAISE NOTICE 'Expected date (WIB): %', expected_date;
  RAISE NOTICE 'Generated invoice: %', test_invoice;
  
  IF test_invoice LIKE 'INV/' || expected_date || '/%' THEN
    RAISE NOTICE '✅ Timezone fix successful! Invoice uses correct Indonesia date.';
  ELSE
    RAISE WARNING '⚠️ Timezone fix may have issues. Please check.';
  END IF;
END $$;

-- Step 3: Show current timezone info
SELECT 
  'UTC Time' as timezone,
  now() as current_time,
  CURRENT_DATE as current_date,
  TO_CHAR(CURRENT_DATE, 'DDMMYYYY') as date_format
UNION ALL
SELECT 
  'WIB Time (Asia/Jakarta)' as timezone,
  timezone('Asia/Jakarta', now()) as current_time,
  (timezone('Asia/Jakarta', now()))::DATE as current_date,
  TO_CHAR(timezone('Asia/Jakarta', now()), 'DDMMYYYY') as date_format;

-- Step 4: Show recent invoices
SELECT 
  invoice_no,
  user_email,
  amount,
  created_at,
  timezone('Asia/Jakarta', created_at) as created_at_wib
FROM payments
WHERE invoice_no IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- Step 5: Instructions
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== NEXT STEPS ===';
  RAISE NOTICE '1. Trigger sudah otomatis menggunakan fungsi yang baru';
  RAISE NOTICE '2. Invoice baru akan menggunakan tanggal Indonesia (WIB)';
  RAISE NOTICE '3. Test dengan membuat payment baru';
  RAISE NOTICE '4. Verifikasi invoice number menggunakan tanggal hari ini';
END $$;

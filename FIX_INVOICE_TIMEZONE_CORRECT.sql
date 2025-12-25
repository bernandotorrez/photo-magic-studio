-- =====================================================
-- FIX INVOICE TIMEZONE - CORRECT VERSION
-- Problem: Invoice shows 23122025 when it should be 24122025
-- Cause: CURRENT_DATE uses UTC, not WIB (UTC+7)
-- Solution: Replace CURRENT_DATE with timezone('Asia/Jakarta', now())::DATE
-- =====================================================

CREATE OR REPLACE FUNCTION generate_invoice_no()
RETURNS TEXT AS $$
DECLARE
  today_prefix TEXT;
  max_seq INTEGER;
  next_seq INTEGER;
  new_invoice TEXT;
  lock_key BIGINT;
  jakarta_date DATE;
BEGIN
  -- Get current date in Indonesia timezone (WIB)
  jakarta_date := (timezone('Asia/Jakarta', now()))::DATE;
  
  -- Advisory lock untuk prevent race condition
  lock_key := ('x' || md5('invoice_' || jakarta_date::TEXT))::bit(64)::bigint;
  PERFORM pg_advisory_xact_lock(lock_key);
  
  -- Build prefix: INV/24122025/ (using WIB date, not UTC)
  today_prefix := 'INV/' || TO_CHAR(jakarta_date, 'DDMMYYYY') || '/';
  
  -- Get max sequence untuk hari ini
  -- Logic: Cari max(sequence_number) dari invoice hari ini
  WITH valid_invoices AS (
    SELECT SUBSTRING(invoice_no FROM LENGTH(today_prefix) + 1) as seq_str
    FROM payments
    WHERE invoice_no LIKE today_prefix || '%'
      AND LENGTH(invoice_no) > LENGTH(today_prefix)
  )
  SELECT MAX(CAST(seq_str AS INTEGER))
  INTO max_seq
  FROM valid_invoices
  WHERE seq_str IS NOT NULL 
    AND seq_str != ''
    AND seq_str ~ '^[0-9]+$';
  
  -- Calculate next sequence
  -- Jika max_seq = NULL → tidak ada invoice hari ini → mulai dari 1
  -- Jika max_seq = 5 → sudah ada sampai 0005 → next = 6
  IF max_seq IS NULL THEN
    next_seq := 1;
  ELSE
    next_seq := max_seq + 1;
  END IF;
  
  -- Format invoice number: INV/24122025/0001
  new_invoice := today_prefix || LPAD(next_seq::TEXT, 4, '0');
  
  -- Safety check
  IF EXISTS (SELECT 1 FROM payments WHERE invoice_no = new_invoice) THEN
    RAISE EXCEPTION 'Invoice % already exists!', new_invoice;
  END IF;
  
  -- Log for debugging
  RAISE NOTICE 'Generated invoice: % (WIB date: %, sequence: %)', new_invoice, jakarta_date, next_seq;
  
  RETURN new_invoice;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- =====================================================
-- VERIFICATION & TESTING
-- =====================================================

-- Test 1: Compare UTC vs WIB dates
DO $$
DECLARE
  utc_date DATE;
  wib_date DATE;
  utc_str TEXT;
  wib_str TEXT;
BEGIN
  utc_date := CURRENT_DATE;
  wib_date := (timezone('Asia/Jakarta', now()))::DATE;
  utc_str := TO_CHAR(utc_date, 'DDMMYYYY');
  wib_str := TO_CHAR(wib_date, 'DDMMYYYY');
  
  RAISE NOTICE '=== TIMEZONE COMPARISON ===';
  RAISE NOTICE 'UTC Date: % (format: %)', utc_date, utc_str;
  RAISE NOTICE 'WIB Date: % (format: %)', wib_date, wib_str;
  
  IF utc_str != wib_str THEN
    RAISE NOTICE '⚠️  DIFFERENT! This is why invoice was wrong.';
  ELSE
    RAISE NOTICE '✅ Same date in both timezones.';
  END IF;
END $$;

-- Test 2: Generate test invoice
DO $$
DECLARE
  test_invoice TEXT;
  expected_date TEXT;
BEGIN
  expected_date := TO_CHAR((timezone('Asia/Jakarta', now()))::DATE, 'DDMMYYYY');
  test_invoice := generate_invoice_no();
  
  RAISE NOTICE '';
  RAISE NOTICE '=== INVOICE GENERATION TEST ===';
  RAISE NOTICE 'Expected date (WIB): %', expected_date;
  RAISE NOTICE 'Generated invoice: %', test_invoice;
  
  IF test_invoice LIKE 'INV/' || expected_date || '/%' THEN
    RAISE NOTICE '✅ SUCCESS! Invoice uses correct WIB date.';
  ELSE
    RAISE WARNING '❌ FAILED! Invoice still uses wrong date.';
  END IF;
END $$;

-- Test 3: Show recent invoices with timezone info
SELECT 
  invoice_no,
  user_email,
  amount,
  payment_status,
  created_at as created_utc,
  timezone('Asia/Jakarta', created_at) as created_wib,
  TO_CHAR(timezone('Asia/Jakarta', created_at), 'DD/MM/YYYY HH24:MI:SS') as created_wib_formatted
FROM payments
WHERE invoice_no IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- Test 4: Check today's invoices
DO $$
DECLARE
  wib_date TEXT;
  invoice_count INTEGER;
BEGIN
  wib_date := TO_CHAR((timezone('Asia/Jakarta', now()))::DATE, 'DDMMYYYY');
  
  SELECT COUNT(*)
  INTO invoice_count
  FROM payments
  WHERE invoice_no LIKE 'INV/' || wib_date || '/%';
  
  RAISE NOTICE '';
  RAISE NOTICE '=== TODAY''S INVOICES (WIB) ===';
  RAISE NOTICE 'Date: %', wib_date;
  RAISE NOTICE 'Count: %', invoice_count;
  
  IF invoice_count > 0 THEN
    RAISE NOTICE 'Next invoice will be: INV/%/%', wib_date, LPAD((invoice_count + 1)::TEXT, 4, '0');
  ELSE
    RAISE NOTICE 'Next invoice will be: INV/%/0001', wib_date;
  END IF;
END $$;

-- Final summary
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== SUMMARY ===';
  RAISE NOTICE '✅ Function updated to use WIB timezone';
  RAISE NOTICE '✅ Invoice numbers will now use correct Indonesia date';
  RAISE NOTICE '✅ Trigger will automatically use this function';
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '1. Test dengan approve payment baru';
  RAISE NOTICE '2. Verifikasi invoice number menggunakan tanggal hari ini (WIB)';
  RAISE NOTICE '3. Invoice akan reset ke 0001 setiap hari (WIB midnight)';
END $$;

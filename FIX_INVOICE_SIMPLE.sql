-- =====================================================
-- FIX INVOICE - SIMPLE VERSION
-- Ganti CURRENT_DATE dengan timezone('Asia/Jakarta', now())::DATE
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
  -- PENTING: Gunakan timezone Jakarta, bukan CURRENT_DATE
  jakarta_date := (timezone('Asia/Jakarta', now()))::DATE;
  
  -- Advisory lock untuk prevent race condition
  lock_key := ('x' || md5('invoice_' || jakarta_date::TEXT))::bit(64)::bigint;
  PERFORM pg_advisory_xact_lock(lock_key);
  
  -- Build prefix: INV/24122025/
  today_prefix := 'INV/' || TO_CHAR(jakarta_date, 'DDMMYYYY') || '/';
  
  -- Get max sequence untuk hari ini
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
  
  RETURN new_invoice;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Test
SELECT generate_invoice_no() as test_invoice;

-- Verify
SELECT 
  'UTC' as timezone,
  CURRENT_DATE as date,
  TO_CHAR(CURRENT_DATE, 'DDMMYYYY') as format
UNION ALL
SELECT 
  'WIB' as timezone,
  (timezone('Asia/Jakarta', now()))::DATE as date,
  TO_CHAR((timezone('Asia/Jakarta', now()))::DATE, 'DDMMYYYY') as format;

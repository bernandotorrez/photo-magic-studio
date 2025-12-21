-- =====================================================
-- FIX INVOICE NUMBER - EXACT LOGIC
-- =====================================================
-- Logic: 
-- 1. Cek ke tbl payments WHERE invoice_no LIKE 'INV/21122025/%'
-- 2. Ambil MAX(invoice_no)
-- 3. Kalau tidak ada data → 0001
-- 4. Kalau ada → ambil 4 digit terakhir + 1
-- =====================================================

-- Drop semua yang berhubungan dengan invoice sequence
DROP SEQUENCE IF EXISTS invoice_sequence CASCADE;
DROP SEQUENCE IF EXISTS invoice_daily_seq CASCADE;

-- Drop dan recreate function
DROP FUNCTION IF EXISTS generate_invoice_no() CASCADE;

CREATE OR REPLACE FUNCTION generate_invoice_no()
RETURNS TEXT AS $$
DECLARE
  current_date_str TEXT;
  max_invoice TEXT;
  last_sequence INTEGER;
  next_sequence INTEGER;
  new_invoice TEXT;
BEGIN
  -- 1. Get current date in DDMMYYYY format
  current_date_str := TO_CHAR(CURRENT_DATE, 'DDMMYYYY');
  
  -- 2. Cek ke tbl payments WHERE invoice_no LIKE 'INV/21122025/%'
  SELECT MAX(invoice_no)
  INTO max_invoice
  FROM payments
  WHERE invoice_no LIKE 'INV/' || current_date_str || '/%';
  
  -- 3. Kalau tidak ada data → 0001
  IF max_invoice IS NULL THEN
    next_sequence := 1;
    RAISE NOTICE 'No invoice found for today, starting from 0001';
  ELSE
    -- 4. Kalau ada → ambil 4 digit terakhir + 1
    last_sequence := CAST(RIGHT(max_invoice, 4) AS INTEGER);
    next_sequence := last_sequence + 1;
    RAISE NOTICE 'Found max invoice: %, last sequence: %, next: %', max_invoice, last_sequence, next_sequence;
  END IF;
  
  -- Format: INV/DDMMYYYY/XXXX
  new_invoice := 'INV/' || current_date_str || '/' || LPAD(next_sequence::TEXT, 4, '0');
  
  RAISE NOTICE 'Generated invoice: %', new_invoice;
  
  RETURN new_invoice;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Drop dan recreate trigger function
DROP FUNCTION IF EXISTS set_invoice_no() CASCADE;

CREATE OR REPLACE FUNCTION set_invoice_no()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if invoice_no is NULL
  IF NEW.invoice_no IS NULL THEN
    NEW.invoice_no := generate_invoice_no();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop dan recreate trigger
DROP TRIGGER IF EXISTS trigger_set_invoice_no ON payments;

CREATE TRIGGER trigger_set_invoice_no
  BEFORE INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_no();

-- =====================================================
-- TEST
-- =====================================================

-- Test 1: Cek invoice hari ini
SELECT 
  'Current invoices for today:' as info,
  COUNT(*) as total,
  MAX(invoice_no) as max_invoice
FROM payments
WHERE invoice_no LIKE 'INV/' || TO_CHAR(CURRENT_DATE, 'DDMMYYYY') || '/%';

-- Test 2: Generate invoice number (dry run)
SELECT generate_invoice_no() as next_invoice_number;

-- Test 3: Show last 10 invoices
SELECT 
  invoice_no,
  user_email,
  TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI') as created
FROM payments
WHERE invoice_no IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to check if it's working correctly:

SELECT 
  TO_CHAR(created_at::DATE, 'DD/MM/YYYY') as date,
  COUNT(*) as total,
  MIN(invoice_no) as first,
  MAX(invoice_no) as last
FROM payments
WHERE invoice_no IS NOT NULL
GROUP BY created_at::DATE
ORDER BY created_at::DATE DESC
LIMIT 7;


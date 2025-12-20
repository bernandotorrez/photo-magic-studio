-- =====================================================
-- COMPLETE RESET AND FIX - START FRESH
-- =====================================================

-- Step 1: Drop ALL triggers
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'payments'::regclass 
      AND tgname LIKE '%invoice%'
  LOOP
    EXECUTE 'DROP TRIGGER IF EXISTS ' || r.tgname || ' ON payments';
    RAISE NOTICE 'Dropped trigger: %', r.tgname;
  END LOOP;
END $$;

-- Step 2: Drop ALL constraints and indexes related to invoice_no
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_invoice_no_key;
DROP INDEX IF EXISTS payments_invoice_no_unique_idx;
DROP INDEX IF EXISTS idx_payments_invoice_no;

-- Step 3: Clean up sequences
DROP SEQUENCE IF EXISTS daily_invoice_seq CASCADE;
DROP SEQUENCE IF EXISTS invoice_sequence CASCADE;

-- Step 4: Show current state
SELECT 
  '=== CURRENT STATE ===' as info;

SELECT 
  COUNT(*) as total_payments,
  COUNT(invoice_no) as with_invoice,
  COUNT(*) - COUNT(invoice_no) as null_invoices
FROM payments;

SELECT 
  invoice_no,
  user_email,
  created_at
FROM payments
ORDER BY created_at DESC
LIMIT 5;

-- Step 5: Create new sequence
CREATE SEQUENCE invoice_daily_seq START 1;

-- Step 6: Create NEW simple function
CREATE OR REPLACE FUNCTION gen_invoice()
RETURNS TEXT AS $$
DECLARE
  d TEXT;
  s INTEGER;
BEGIN
  d := TO_CHAR(CURRENT_DATE, 'DDMMYYYY');
  s := nextval('invoice_daily_seq');
  RETURN 'INV/' || d || '/' || LPAD(s::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Step 7: Sync sequence with existing data
DO $$
DECLARE
  max_seq INTEGER;
  d TEXT;
BEGIN
  d := TO_CHAR(CURRENT_DATE, 'DDMMYYYY');
  
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(invoice_no FROM '\d{4}$') AS INTEGER)),
    0
  ) INTO max_seq
  FROM payments
  WHERE invoice_no LIKE 'INV/' || d || '/%';
  
  PERFORM setval('invoice_daily_seq', max_seq, true);
  
  RAISE NOTICE 'Sequence synced. Last value: %, next will be: %', max_seq, max_seq + 1;
END $$;

-- Step 8: Create NEW trigger function
CREATE OR REPLACE FUNCTION trg_set_invoice()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_no IS NULL THEN
    NEW.invoice_no := gen_invoice();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create NEW trigger
CREATE TRIGGER trg_invoice_before_insert
  BEFORE INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION trg_set_invoice();

-- Step 10: Create partial unique index
CREATE UNIQUE INDEX idx_payments_invoice_unique 
ON payments(invoice_no) 
WHERE invoice_no IS NOT NULL;

-- Step 11: Test the function multiple times
SELECT 
  '=== TESTING ===' as info;

SELECT gen_invoice() as test1;
SELECT gen_invoice() as test2;
SELECT gen_invoice() as test3;

-- Step 12: Verify setup
DO $$
DECLARE
  trig_count INTEGER;
  func_exists BOOLEAN;
  seq_exists BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO trig_count
  FROM pg_trigger
  WHERE tgrelid = 'payments'::regclass;
  
  SELECT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'gen_invoice'
  ) INTO func_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM pg_class WHERE relname = 'invoice_daily_seq'
  ) INTO seq_exists;
  
  RAISE NOTICE '=== VERIFICATION ===';
  RAISE NOTICE 'Triggers on payments table: %', trig_count;
  RAISE NOTICE 'Function gen_invoice exists: %', func_exists;
  RAISE NOTICE 'Sequence invoice_daily_seq exists: %', seq_exists;
  
  IF trig_count = 1 AND func_exists AND seq_exists THEN
    RAISE NOTICE '✅ Setup complete and clean!';
  ELSE
    RAISE WARNING '⚠️ Setup may have issues';
  END IF;
END $$;

-- Step 13: Show final state
SELECT 
  '=== READY TO USE ===' as status;

SELECT 
  'Try submitting a payment now. Invoice should be auto-generated.' as instruction;

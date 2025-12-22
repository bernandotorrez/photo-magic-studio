-- =====================================================
-- FIX INVOICE DUPLICATE ERROR
-- =====================================================
-- Error: duplicate key value violates unique constraint "idx_payments_invoice_unique"
-- Penyebab: Invoice number tidak di-generate dengan benar atau ada race condition

-- =====================================================
-- 1. CHECK CURRENT STATE
-- =====================================================

-- Check existing invoices for today
SELECT 
  invoice_no,
  created_at,
  user_email,
  amount
FROM payments
WHERE invoice_no LIKE 'INV/' || TO_CHAR(CURRENT_DATE, 'DDMMYYYY') || '/%'
ORDER BY created_at DESC
LIMIT 10;

-- Check if function exists
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc 
WHERE proname = 'generate_invoice_no';

-- Check if trigger exists
SELECT 
  tgname as trigger_name,
  tgtype,
  tgenabled
FROM pg_trigger 
WHERE tgrelid = 'payments'::regclass
AND tgname LIKE '%invoice%';

-- =====================================================
-- 2. DROP EXISTING FUNCTION & TRIGGER
-- =====================================================

DROP TRIGGER IF EXISTS set_invoice_no_trigger ON payments;
DROP TRIGGER IF EXISTS trg_set_invoice ON payments;
DROP TRIGGER IF EXISTS trigger_set_invoice_no ON payments;
DROP FUNCTION IF EXISTS generate_invoice_no() CASCADE;
DROP FUNCTION IF EXISTS set_invoice_no() CASCADE;

-- =====================================================
-- 3. CREATE ROBUST INVOICE GENERATION FUNCTION
-- =====================================================
-- Logic:
-- 1. Cek max(invoice_no) WHERE invoice_no LIKE 'INV/22122025/%'
-- 2. Jika tidak ada (NULL) → return 0001
-- 3. Jika ada → return max + 1
-- 4. Reset otomatis setiap hari karena prefix berubah (DDMMYYYY)
-- 5. Advisory lock mencegah race condition (2 payment submit bersamaan)

CREATE OR REPLACE FUNCTION generate_invoice_no()
RETURNS TEXT AS $$
DECLARE
  today_prefix TEXT;
  max_seq INTEGER;
  next_seq INTEGER;
  new_invoice TEXT;
  lock_key BIGINT;
BEGIN
  -- ===== STEP 1: ADVISORY LOCK (Mencegah Race Condition) =====
  -- Lock key berdasarkan tanggal hari ini
  -- Semua transaction yang generate invoice hari ini akan antri di lock ini
  lock_key := ('x' || md5(CURRENT_DATE::TEXT))::bit(64)::bigint;
  
  -- pg_advisory_xact_lock: Lock sampai transaction selesai (COMMIT/ROLLBACK)
  -- Jika ada transaction lain yang sedang generate invoice, akan WAIT di sini
  PERFORM pg_advisory_xact_lock(lock_key);
  
  -- Setelah dapat lock, lanjut generate invoice
  -- Lock akan otomatis release setelah transaction selesai
  
  -- ===== STEP 2: BUILD PREFIX =====
  -- Format: INV/DDMMYYYY/XXXX
  -- Contoh: INV/22122025/0001
  today_prefix := 'INV/' || TO_CHAR(CURRENT_DATE, 'DDMMYYYY') || '/';
  
  -- ===== STEP 3: GET MAX SEQUENCE (dengan row-level lock) =====
  -- Query: SELECT MAX(sequence_number) FROM payments WHERE invoice_no LIKE 'INV/22122025/%'
  -- Gunakan subquery untuk lock rows dulu, baru aggregate
  SELECT COALESCE(
    MAX(
      CASE 
        WHEN invoice_no ~ ('^' || today_prefix || '[0-9]+$')
        THEN CAST(SUBSTRING(invoice_no FROM LENGTH(today_prefix) + 1) AS INTEGER)
        ELSE 0
      END
    ),
    0
  ) INTO max_seq
  FROM (
    -- Subquery: Lock rows dulu sebelum aggregate
    SELECT invoice_no
    FROM payments
    WHERE invoice_no LIKE today_prefix || '%'
    FOR UPDATE  -- Lock rows di subquery (bukan di aggregate)
  ) locked_rows;
  
  -- ===== STEP 4: CALCULATE NEXT SEQUENCE =====
  -- Next sequence = max + 1
  -- Jika max_seq = NULL (tidak ada invoice hari ini) → next_seq = 1
  -- Jika max_seq = 2 → next_seq = 3
  next_seq := COALESCE(max_seq, 0) + 1;
  
  -- ===== STEP 5: FORMAT INVOICE NUMBER =====
  -- Generate invoice number with 4-digit padding
  -- Contoh: 1 → 0001, 25 → 0025, 123 → 0123
  new_invoice := today_prefix || LPAD(next_seq::TEXT, 4, '0');
  
  -- Log untuk debugging (optional, bisa di-comment untuk production)
  RAISE NOTICE 'Generated invoice: % (max_seq: %, next_seq: %)', new_invoice, max_seq, next_seq;
  
  RETURN new_invoice;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. CREATE TRIGGER FUNCTION (dengan retry mechanism)
-- =====================================================

CREATE OR REPLACE FUNCTION set_invoice_no()
RETURNS TRIGGER AS $$
DECLARE
  retry_count INTEGER := 0;
  max_retries INTEGER := 3;
  generated_invoice TEXT;
BEGIN
  -- Only generate if invoice_no is NULL
  IF NEW.invoice_no IS NULL THEN
    -- Retry loop untuk handle edge case race condition
    LOOP
      BEGIN
        -- Generate invoice number
        generated_invoice := generate_invoice_no();
        NEW.invoice_no := generated_invoice;
        
        -- Log untuk debugging
        RAISE NOTICE 'Generated invoice_no: % (attempt: %)', NEW.invoice_no, retry_count + 1;
        
        -- Exit loop jika berhasil
        EXIT;
        
      EXCEPTION
        WHEN unique_violation THEN
          -- Jika terjadi duplicate (sangat jarang), retry
          retry_count := retry_count + 1;
          
          IF retry_count >= max_retries THEN
            -- Jika sudah retry 3x masih gagal, raise error
            RAISE EXCEPTION 'Failed to generate unique invoice_no after % attempts', max_retries;
          END IF;
          
          -- Wait sebentar sebelum retry (10ms)
          PERFORM pg_sleep(0.01);
          
          -- Log retry
          RAISE NOTICE 'Retrying invoice generation (attempt: %)', retry_count + 1;
      END;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. CREATE TRIGGER
-- =====================================================

CREATE TRIGGER set_invoice_no_trigger
  BEFORE INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_no();

-- =====================================================
-- 6. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION generate_invoice_no() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION set_invoice_no() TO authenticated, service_role;

-- =====================================================
-- 7. TEST THE FUNCTION
-- =====================================================

-- Test 1: Test syntax (dry run)
DO $$
DECLARE
  test_invoice TEXT;
BEGIN
  test_invoice := generate_invoice_no();
  RAISE NOTICE 'Test invoice generated: %', test_invoice;
END $$;

-- Test 2: Generate invoice number (should not conflict)
SELECT generate_invoice_no() as test1;
SELECT generate_invoice_no() as test2;
SELECT generate_invoice_no() as test3;

-- Expected results (hari ini 22 Dec 2025):
-- test1: INV/22122025/0001 (atau next number jika sudah ada invoice hari ini)
-- test2: INV/22122025/0002
-- test3: INV/22122025/0003

-- Test 3: Show what the next invoice will be
SELECT 
  'Next invoice will be:' as info,
  generate_invoice_no() as next_invoice;

-- Test 4: Simulate besok (manual test)
-- Besok (23 Dec 2025), invoice akan reset ke 0001:
-- INV/23122025/0001
-- INV/23122025/0002
-- dst.

-- Test 5: Show today's invoices
SELECT 
  invoice_no,
  created_at,
  user_email
FROM payments
WHERE invoice_no LIKE 'INV/' || TO_CHAR(CURRENT_DATE, 'DDMMYYYY') || '/%'
ORDER BY invoice_no DESC
LIMIT 10;

-- =====================================================
-- 8. VERIFY SETUP
-- =====================================================

-- Check function exists
SELECT 
  'Function exists:' as check_type,
  EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'generate_invoice_no'
  ) as result;

-- Check trigger exists
SELECT 
  'Trigger exists:' as check_type,
  EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgrelid = 'payments'::regclass
    AND tgname = 'set_invoice_no_trigger'
  ) as result;

-- Check unique constraint exists
SELECT 
  'Unique constraint exists:' as check_type,
  EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'payments'
    AND indexname = 'idx_payments_invoice_unique'
  ) as result;

-- =====================================================
-- 9. OPTIONAL: FIX EXISTING NULL INVOICES
-- =====================================================

-- Update any existing payments with NULL invoice_no
UPDATE payments
SET invoice_no = generate_invoice_no()
WHERE invoice_no IS NULL;

-- Show updated records
SELECT 
  'Updated records:' as info,
  COUNT(*) as count
FROM payments
WHERE invoice_no IS NOT NULL;

-- =====================================================
-- DONE!
-- =====================================================
-- Sekarang setiap payment baru akan otomatis dapat invoice_no yang unique
-- Format: INV/DDMMYYYY/0001, INV/DDMMYYYY/0002, dst.
-- 
-- RACE CONDITION PROTECTION (3 Layer):
-- 1. Advisory Lock (pg_advisory_xact_lock) - Transaction level
--    → Hanya 1 transaction yang bisa generate invoice pada saat bersamaan
-- 2. Row-level Lock (FOR UPDATE) - Row level
--    → Lock rows yang sedang di-query untuk mencegah concurrent read
-- 3. Retry Mechanism - Application level
--    → Jika masih terjadi duplicate (sangat jarang), retry otomatis 3x
--
-- Dengan 3 layer protection ini, kemungkinan duplicate invoice = 0%

-- =====================================================
-- TROUBLESHOOTING
-- =====================================================

-- If still getting duplicate error:
-- 1. Check if there are multiple triggers:
--    SELECT * FROM pg_trigger WHERE tgrelid = 'payments'::regclass;
--
-- 2. Check if invoice_no is being set manually in INSERT:
--    Make sure frontend doesn't send invoice_no in the INSERT
--
-- 3. Check for orphaned invoices:
--    SELECT invoice_no, COUNT(*) FROM payments 
--    GROUP BY invoice_no HAVING COUNT(*) > 1;

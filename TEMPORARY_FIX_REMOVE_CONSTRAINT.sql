-- =====================================================
-- TEMPORARY FIX - REMOVE UNIQUE CONSTRAINT
-- This allows payments to be created without invoice_no
-- Then we can add invoice_no later via UPDATE
-- =====================================================

-- Step 1: Drop the unique constraint/index
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_invoice_no_key;
DROP INDEX IF EXISTS payments_invoice_no_unique_idx;

-- Step 2: Make invoice_no nullable (it should already be)
ALTER TABLE payments ALTER COLUMN invoice_no DROP NOT NULL;

-- Step 3: Verify constraint is removed
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'payments'::regclass
  AND conname LIKE '%invoice%';

SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'payments'
  AND indexname LIKE '%invoice%';

-- Step 4: Show current state
SELECT 
  'Constraints and indexes removed. Payments can now be created without invoice_no.' as status;

-- Step 5: Test - this should work now
SELECT 
  'You can now submit payments. Invoice numbers can be added later.' as info;

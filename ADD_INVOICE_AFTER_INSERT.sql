-- =====================================================
-- ALTERNATIVE SOLUTION: ADD INVOICE_NO AFTER INSERT
-- Generate invoice_no AFTER payment is created, not during INSERT
-- =====================================================

-- Step 1: Remove trigger that runs BEFORE INSERT
DROP TRIGGER IF EXISTS trigger_set_invoice_no ON payments;

-- Step 2: Create function to add invoice_no to existing payment
CREATE OR REPLACE FUNCTION add_invoice_to_payment(payment_id UUID)
RETURNS TEXT AS $$
DECLARE
  current_date_str TEXT;
  payment_date DATE;
  sequence_num INTEGER;
  sequence_str TEXT;
  invoice_number TEXT;
  lock_key BIGINT;
BEGIN
  -- Get payment date
  SELECT DATE(created_at) INTO payment_date
  FROM payments
  WHERE id = payment_id;
  
  IF payment_date IS NULL THEN
    RAISE EXCEPTION 'Payment not found: %', payment_id;
  END IF;
  
  -- Use advisory lock
  lock_key := EXTRACT(EPOCH FROM payment_date)::BIGINT;
  PERFORM pg_advisory_xact_lock(lock_key);
  
  -- Get date string
  current_date_str := TO_CHAR(payment_date, 'DDMMYYYY');
  
  -- Find max sequence for that date
  SELECT COALESCE(MAX(seq), 0) + 1
  INTO sequence_num
  FROM (
    SELECT 
      CAST(SUBSTRING(invoice_no FROM '\d{4}$') AS INTEGER) as seq
    FROM payments
    WHERE invoice_no ~ ('^INV/' || current_date_str || '/\d{4}$')
  ) subquery;
  
  -- Format and create invoice
  sequence_str := LPAD(sequence_num::TEXT, 4, '0');
  invoice_number := 'INV/' || current_date_str || '/' || sequence_str;
  
  -- Update payment with invoice number
  UPDATE payments
  SET invoice_no = invoice_number
  WHERE id = payment_id;
  
  RETURN invoice_number;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Step 3: Create trigger that runs AFTER INSERT
CREATE OR REPLACE FUNCTION set_invoice_no_after_insert()
RETURNS TRIGGER AS $$
DECLARE
  new_invoice TEXT;
BEGIN
  -- Generate invoice for the newly inserted payment
  IF NEW.invoice_no IS NULL THEN
    new_invoice := add_invoice_to_payment(NEW.id);
    RAISE NOTICE 'Generated invoice % for payment %', new_invoice, NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invoice_no_after
  AFTER INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_no_after_insert();

-- Step 4: Add back the unique index (partial)
CREATE UNIQUE INDEX IF NOT EXISTS payments_invoice_no_unique_idx 
ON payments(invoice_no) 
WHERE invoice_no IS NOT NULL;

-- Step 5: Update any NULL invoice_no
DO $$
DECLARE
  payment_rec RECORD;
  new_invoice TEXT;
BEGIN
  FOR payment_rec IN 
    SELECT id FROM payments WHERE invoice_no IS NULL ORDER BY created_at
  LOOP
    new_invoice := add_invoice_to_payment(payment_rec.id);
    RAISE NOTICE 'Updated payment % with invoice %', payment_rec.id, new_invoice;
  END LOOP;
END $$;

-- Verification
SELECT 
  id,
  invoice_no,
  user_email,
  created_at
FROM payments
ORDER BY created_at DESC
LIMIT 10;

SELECT 
  COUNT(*) as total,
  COUNT(invoice_no) as with_invoice,
  COUNT(*) - COUNT(invoice_no) as without_invoice
FROM payments;

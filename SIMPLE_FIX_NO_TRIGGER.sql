-- =====================================================
-- SIMPLE FIX: NO TRIGGER, MANUAL INVOICE GENERATION
-- =====================================================

-- Step 1: Remove ALL triggers
DROP TRIGGER IF EXISTS trigger_set_invoice_no ON payments;
DROP TRIGGER IF EXISTS trigger_set_invoice_no_after ON payments;

-- Step 2: Remove unique constraint
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_invoice_no_key;
DROP INDEX IF EXISTS payments_invoice_no_unique_idx;

-- Step 3: Allow NULL invoice_no
ALTER TABLE payments ALTER COLUMN invoice_no DROP NOT NULL;

-- Step 4: Create function to generate and assign invoice numbers
CREATE OR REPLACE FUNCTION generate_missing_invoices()
RETURNS TABLE (
  payment_id UUID,
  new_invoice_no TEXT
) AS $$
DECLARE
  payment_rec RECORD;
  date_str TEXT;
  seq_num INTEGER;
  seq_str TEXT;
  inv_no TEXT;
  date_seq_map JSONB := '{}'::JSONB;
BEGIN
  -- Process all payments without invoice_no
  FOR payment_rec IN 
    SELECT id, created_at
    FROM payments
    WHERE invoice_no IS NULL
    ORDER BY created_at
  LOOP
    date_str := TO_CHAR(payment_rec.created_at, 'DDMMYYYY');
    
    -- Get or initialize sequence for this date
    IF date_seq_map ? date_str THEN
      seq_num := (date_seq_map->date_str)::INTEGER + 1;
    ELSE
      -- Find max sequence for this date
      SELECT COALESCE(
        MAX(
          CAST(SUBSTRING(invoice_no FROM '\d{4}$') AS INTEGER)
        ), 0
      ) + 1
      INTO seq_num
      FROM payments
      WHERE invoice_no ~ ('^INV/' || date_str || '/\d{4}$');
    END IF;
    
    -- Store updated sequence
    date_seq_map := jsonb_set(date_seq_map, ARRAY[date_str], to_jsonb(seq_num));
    
    -- Format invoice
    seq_str := LPAD(seq_num::TEXT, 4, '0');
    inv_no := 'INV/' || date_str || '/' || seq_str;
    
    -- Update payment
    UPDATE payments
    SET invoice_no = inv_no
    WHERE id = payment_rec.id;
    
    -- Return result
    payment_id := payment_rec.id;
    new_invoice_no := inv_no;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Run the function to generate invoices for existing payments
SELECT * FROM generate_missing_invoices();

-- Step 6: Create a simple index (not unique) for performance
CREATE INDEX IF NOT EXISTS idx_payments_invoice_no ON payments(invoice_no);

-- Step 7: Verification
SELECT 
  'Setup complete. Invoice numbers are NOT auto-generated.' as status,
  'Run generate_missing_invoices() periodically to add invoice numbers.' as instruction;

SELECT 
  COUNT(*) as total_payments,
  COUNT(invoice_no) as with_invoice,
  COUNT(*) - COUNT(invoice_no) as without_invoice
FROM payments;

-- Show recent payments
SELECT 
  id,
  invoice_no,
  user_email,
  amount,
  payment_status,
  created_at
FROM payments
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- FIX INVOICE_NO UNIQUE CONSTRAINT
-- =====================================================

-- Drop the existing unique constraint
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_invoice_no_key;

-- Create a partial unique index that only applies to non-NULL values
CREATE UNIQUE INDEX IF NOT EXISTS payments_invoice_no_unique_idx 
ON payments(invoice_no) 
WHERE invoice_no IS NOT NULL;

-- Ensure the trigger function exists
CREATE OR REPLACE FUNCTION generate_invoice_no()
RETURNS TEXT AS $$
DECLARE
  current_date_str TEXT;
  current_month_str TEXT;
  current_year_str TEXT;
  sequence_num INTEGER;
  sequence_str TEXT;
  invoice_number TEXT;
BEGIN
  -- Get current date components
  current_date_str := TO_CHAR(CURRENT_DATE, 'DD');
  current_month_str := TO_CHAR(CURRENT_DATE, 'MM');
  current_year_str := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  -- Get the count of payments for today to determine sequence
  SELECT COUNT(*) + 1 INTO sequence_num
  FROM payments
  WHERE DATE(created_at) = CURRENT_DATE;
  
  -- Format sequence number with leading zeros (4 digits)
  sequence_str := LPAD(sequence_num::TEXT, 4, '0');
  
  -- Construct invoice number: INV/DDMMYYYY/XXXX
  invoice_number := 'INV/' || current_date_str || current_month_str || current_year_str || '/' || sequence_str;
  
  RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger function exists
CREATE OR REPLACE FUNCTION set_invoice_no()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_no IS NULL THEN
    NEW.invoice_no := generate_invoice_no();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_set_invoice_no ON payments;
CREATE TRIGGER trigger_set_invoice_no
  BEFORE INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_no();

-- Update any existing NULL invoice_no records
DO $$
DECLARE
  payment_record RECORD;
  date_str TEXT;
  month_str TEXT;
  year_str TEXT;
  seq_num INTEGER;
  seq_str TEXT;
  inv_no TEXT;
  date_counts RECORD;
BEGIN
  -- Loop through each unique date and assign sequence numbers
  FOR date_counts IN 
    SELECT DATE(created_at) as payment_date, COUNT(*) as count
    FROM payments
    WHERE invoice_no IS NULL
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at)
  LOOP
    seq_num := 0;
    
    -- Loop through payments for this date
    FOR payment_record IN
      SELECT id, created_at
      FROM payments
      WHERE DATE(created_at) = date_counts.payment_date
        AND invoice_no IS NULL
      ORDER BY created_at
    LOOP
      seq_num := seq_num + 1;
      
      -- Format date components
      date_str := TO_CHAR(payment_record.created_at, 'DD');
      month_str := TO_CHAR(payment_record.created_at, 'MM');
      year_str := TO_CHAR(payment_record.created_at, 'YYYY');
      seq_str := LPAD(seq_num::TEXT, 4, '0');
      
      -- Generate invoice number
      inv_no := 'INV/' || date_str || month_str || year_str || '/' || seq_str;
      
      -- Update the record
      UPDATE payments
      SET invoice_no = inv_no
      WHERE id = payment_record.id;
    END LOOP;
  END LOOP;
END $$;

-- Test: Verify the results
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

-- Test: Check for any NULL invoice_no
SELECT COUNT(*) as null_invoice_count
FROM payments
WHERE invoice_no IS NULL;

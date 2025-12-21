-- =====================================================
-- FIX EXISTING INVOICE NUMBERS
-- =====================================================
-- Regenerate invoice numbers for existing payments
-- with proper daily reset
-- =====================================================

-- Backup existing invoice numbers (optional)
-- CREATE TABLE IF NOT EXISTS invoice_backup AS 
-- SELECT id, invoice_no, created_at FROM payments WHERE invoice_no IS NOT NULL;

-- Function to regenerate invoice numbers
CREATE OR REPLACE FUNCTION regenerate_all_invoice_numbers()
RETURNS TABLE (
  payment_id UUID,
  old_invoice TEXT,
  new_invoice TEXT,
  payment_date DATE
) AS $$
DECLARE
  payment_rec RECORD;
  date_str TEXT;
  seq_num INTEGER;
  seq_str TEXT;
  new_inv TEXT;
  date_sequences JSONB := '{}'::JSONB;
BEGIN
  -- Process all payments with invoice_no, ordered by created_at
  FOR payment_rec IN 
    SELECT id, invoice_no, created_at::DATE as payment_date
    FROM payments
    WHERE invoice_no IS NOT NULL
    ORDER BY created_at
  LOOP
    -- Get date string
    date_str := TO_CHAR(payment_rec.payment_date, 'DDMMYYYY');
    
    -- Get or initialize sequence for this date
    IF date_sequences ? date_str THEN
      seq_num := (date_sequences->date_str)::INTEGER + 1;
    ELSE
      seq_num := 1;
    END IF;
    
    -- Update sequence map
    date_sequences := jsonb_set(date_sequences, ARRAY[date_str], to_jsonb(seq_num));
    
    -- Format new invoice number
    seq_str := LPAD(seq_num::TEXT, 4, '0');
    new_inv := 'INV/' || date_str || '/' || seq_str;
    
    -- Update payment
    UPDATE payments
    SET invoice_no = new_inv
    WHERE id = payment_rec.id;
    
    -- Return result
    payment_id := payment_rec.id;
    old_invoice := payment_rec.invoice_no;
    new_invoice := new_inv;
    payment_date := payment_rec.payment_date;
    
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- EXECUTE REGENERATION
-- =====================================================

-- Run the regeneration
SELECT * FROM regenerate_all_invoice_numbers()
ORDER BY payment_date, new_invoice;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check invoices grouped by date
SELECT 
  TO_CHAR(created_at::DATE, 'DD/MM/YYYY') as date,
  COUNT(*) as total_invoices,
  MIN(invoice_no) as first_invoice,
  MAX(invoice_no) as last_invoice
FROM payments
WHERE invoice_no IS NOT NULL
GROUP BY created_at::DATE
ORDER BY created_at::DATE DESC;

-- Show all invoices for last 3 days
SELECT 
  invoice_no,
  user_email,
  amount,
  TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI') as created
FROM payments
WHERE invoice_no IS NOT NULL
  AND created_at >= CURRENT_DATE - INTERVAL '3 days'
ORDER BY created_at;

-- =====================================================
-- CLEANUP
-- =====================================================

-- Drop the temporary function
DROP FUNCTION IF EXISTS regenerate_all_invoice_numbers();

-- =====================================================
-- NOTES
-- =====================================================
-- This script will:
-- 1. Process all existing payments in chronological order
-- 2. Regenerate invoice numbers with proper daily reset
-- 3. Each day starts from 0001
--
-- Example results:
-- 20/12/2025: INV/20122025/0001, INV/20122025/0002, ...
-- 21/12/2025: INV/21122025/0001, INV/21122025/0002, ...
-- 22/12/2025: INV/22122025/0001, INV/22122025/0002, ...


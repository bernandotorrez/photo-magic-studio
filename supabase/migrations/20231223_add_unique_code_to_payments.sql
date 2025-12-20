-- =====================================================
-- ADD UNIQUE CODE TO PAYMENTS TABLE
-- =====================================================
-- Add unique_code column to payments table for payment verification
-- Unique code helps admin identify which payment belongs to which user

-- Add unique_code column
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS unique_code INTEGER;

-- Add amount_with_code column (amount + unique_code)
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS amount_with_code DECIMAL(10, 2);

-- Add index for faster lookup
CREATE INDEX IF NOT EXISTS idx_payments_unique_code ON public.payments(unique_code);

-- Comment
COMMENT ON COLUMN public.payments.unique_code IS 'Unique 3-4 digit code added to payment amount for verification (100-999 for <100k, 1000-1999 for >=100k, max 2000)';
COMMENT ON COLUMN public.payments.amount_with_code IS 'Total amount including unique code (amount + unique_code)';

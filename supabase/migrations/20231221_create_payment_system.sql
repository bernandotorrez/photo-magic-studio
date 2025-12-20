-- =====================================================
-- PAYMENT & TOP-UP SYSTEM
-- =====================================================

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  tokens_purchased INTEGER NOT NULL,
  price_per_token DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'bank_transfer',
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_proof_url TEXT,
  bank_name VARCHAR(100),
  account_name VARCHAR(255),
  account_number VARCHAR(100),
  transfer_date TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(payment_status);
CREATE INDEX idx_payments_created_at ON public.payments(created_at DESC);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own payments"
  ON public.payments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments"
  ON public.payments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending payments"
  ON public.payments
  FOR UPDATE
  USING (auth.uid() = user_id AND payment_status = 'pending');

CREATE POLICY "Admins can view all payments"
  ON public.payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update all payments"
  ON public.payments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create token pricing table
CREATE TABLE IF NOT EXISTS public.token_pricing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  min_tokens INTEGER NOT NULL,
  max_tokens INTEGER,
  price_per_token DECIMAL(10, 2) NOT NULL,
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.token_pricing ENABLE ROW LEVEL SECURITY;

-- RLS Policy - Everyone can view active pricing
CREATE POLICY "Anyone can view active token pricing"
  ON public.token_pricing
  FOR SELECT
  USING (is_active = true);

-- Insert token pricing tiers
INSERT INTO public.token_pricing (min_tokens, max_tokens, price_per_token, discount_percentage, sort_order) VALUES
(1, 50, 1000, 0, 1),      -- 1-50 tokens: Rp 1.000/token (no discount)
(51, 100, 900, 10, 2),    -- 51-100 tokens: Rp 900/token (10% discount)
(101, NULL, 800, 20, 3);  -- 101+ tokens: Rp 800/token (20% discount)

-- Create bank accounts table
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_name VARCHAR(100) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Anyone can view active bank accounts"
  ON public.bank_accounts
  FOR SELECT
  USING (is_active = true);

-- Insert bank account
INSERT INTO public.bank_accounts (bank_name, account_name, account_number, sort_order) VALUES
('BCA', 'Bernand Dayamuntari Hermawan', '2040239483', 1);

-- Function to calculate token price
CREATE OR REPLACE FUNCTION calculate_token_price(token_amount INTEGER)
RETURNS TABLE (
  total_price DECIMAL,
  price_per_token DECIMAL,
  discount_percentage DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (token_amount * tp.price_per_token) as total_price,
    tp.price_per_token,
    tp.discount_percentage
  FROM public.token_pricing tp
  WHERE 
    tp.is_active = true
    AND token_amount >= tp.min_tokens
    AND (tp.max_tokens IS NULL OR token_amount <= tp.max_tokens)
  ORDER BY tp.sort_order DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process approved payment
CREATE OR REPLACE FUNCTION process_approved_payment(payment_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_tokens INTEGER;
  v_current_limit INTEGER;
BEGIN
  -- Get payment details
  SELECT user_id, tokens_purchased INTO v_user_id, v_tokens
  FROM public.payments
  WHERE id = payment_id AND payment_status = 'approved';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Get current monthly limit
  SELECT monthly_generate_limit INTO v_current_limit
  FROM public.profiles
  WHERE user_id = v_user_id;
  
  -- Update user's monthly limit
  UPDATE public.profiles
  SET monthly_generate_limit = COALESCE(v_current_limit, 0) + v_tokens
  WHERE user_id = v_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updated_at
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_token_pricing_updated_at
    BEFORE UPDATE ON public.token_pricing
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT SELECT ON public.token_pricing TO anon, authenticated;
GRANT SELECT ON public.bank_accounts TO anon, authenticated;
GRANT ALL ON public.payments TO service_role;
GRANT ALL ON public.token_pricing TO service_role;
GRANT ALL ON public.bank_accounts TO service_role;
GRANT EXECUTE ON FUNCTION calculate_token_price(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION process_approved_payment(UUID) TO authenticated;

-- Comments
COMMENT ON TABLE public.payments IS 'Payment records for token purchases';
COMMENT ON TABLE public.token_pricing IS 'Token pricing tiers with volume discounts';
COMMENT ON TABLE public.bank_accounts IS 'Bank account information for payments';
COMMENT ON FUNCTION calculate_token_price(INTEGER) IS 'Calculate total price based on token amount';
COMMENT ON FUNCTION process_approved_payment(UUID) IS 'Add tokens to user account when payment is approved';

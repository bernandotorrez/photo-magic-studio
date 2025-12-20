-- =====================================================
-- JALANKAN SQL INI DI SUPABASE SQL EDITOR
-- =====================================================
-- Pricing Tiers:
-- 1-100 tokens: Rp 1.000/token (no discount)
-- 101-200 tokens: Rp 950/token (5% discount)
-- 201+ tokens: Rp 900/token (10% discount)
-- =====================================================

-- Delete existing pricing tiers
DELETE FROM public.token_pricing;

-- Insert new pricing tiers
INSERT INTO public.token_pricing (min_tokens, max_tokens, price_per_token, discount_percentage, sort_order) VALUES
(1, 100, 1000, 0, 1),        -- 1-100 tokens: Rp 1.000/token
(101, 200, 950, 5, 2),       -- 101-200 tokens: Rp 950/token
(201, NULL, 900, 10, 3);     -- 201+ tokens: Rp 900/token

-- Verify the data
SELECT * FROM public.token_pricing ORDER BY sort_order;

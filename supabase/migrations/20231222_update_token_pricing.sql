-- =====================================================
-- UPDATE TOKEN PRICING TIERS
-- =====================================================
-- Update pricing tiers to match new requirements:
-- 1-100 tokens: Rp 1.000/token (no discount)
-- 101-200 tokens: Rp 950/token (5% discount)
-- 201+ tokens: Rp 900/token (10% discount)

-- Delete existing pricing tiers
DELETE FROM public.token_pricing;

-- Insert new pricing tiers
INSERT INTO public.token_pricing (min_tokens, max_tokens, price_per_token, discount_percentage, sort_order) VALUES
(1, 100, 1000, 0, 1),        -- 1-100 tokens: Rp 1.000/token (no discount)
(101, 200, 950, 5, 2),       -- 101-200 tokens: Rp 950/token (5% discount)
(201, NULL, 900, 10, 3);     -- 201+ tokens: Rp 900/token (10% discount)

-- Comment
COMMENT ON TABLE public.token_pricing IS 'Token pricing tiers: 1-100 (Rp1000), 101-200 (Rp950), 201+ (Rp900)';

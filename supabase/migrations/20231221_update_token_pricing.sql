-- Update existing token pricing to correct values
-- 1 token = Rp 1.000 (bukan Rp 100)

UPDATE public.token_pricing
SET price_per_token = 1000
WHERE min_tokens = 1 AND max_tokens = 50;

UPDATE public.token_pricing
SET price_per_token = 900
WHERE min_tokens = 51 AND max_tokens = 100;

UPDATE public.token_pricing
SET price_per_token = 800
WHERE min_tokens = 101 AND max_tokens IS NULL;

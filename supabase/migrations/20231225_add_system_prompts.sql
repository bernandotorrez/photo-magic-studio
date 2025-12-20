-- =====================================================
-- ADD SYSTEM PROMPTS TO IMAGE CATEGORIES
-- =====================================================
-- Add system/role prompts to make AI more focused and professional
-- Example: "You're an expert Photographer..." before enhancement prompts

-- Add system_prompt column to image_categories
ALTER TABLE public.image_categories 
ADD COLUMN IF NOT EXISTS system_prompt TEXT;

-- Add is_active flag for categories
ALTER TABLE public.image_categories 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Comment
COMMENT ON COLUMN public.image_categories.system_prompt IS 'System/role prompt that defines AI expertise (e.g., "You are an expert photographer...")';
COMMENT ON COLUMN public.image_categories.is_active IS 'Whether this category is active and available for use';

-- Update existing categories with system prompts
UPDATE public.image_categories 
SET system_prompt = CASE category_name
  WHEN 'fashion' THEN 'You are an expert fashion photographer and e-commerce product specialist. Your expertise includes professional product photography, styling, lighting, and creating compelling product images that drive sales. You understand color theory, composition, and how to showcase products in their best light.'
  
  WHEN 'ai_photographer' THEN 'You are a professional portrait photographer with expertise in studio lighting, posing, retouching, and creating stunning portraits. You understand facial features, skin tones, lighting techniques, and how to capture the best version of every subject. Your work combines technical excellence with artistic vision.'
  
  WHEN 'interior_design' THEN 'You are an expert interior designer with deep knowledge of spatial design, color schemes, furniture placement, lighting design, and creating harmonious living spaces. You understand design principles, architectural styles, and how to transform spaces to be both beautiful and functional.'
  
  WHEN 'exterior_design' THEN 'You are a professional architect and exterior designer specializing in building facades, landscaping, outdoor spaces, and architectural visualization. You understand structural design, materials, environmental factors, and how to create stunning exterior transformations that enhance property value.'
  
  ELSE 'You are an expert AI image enhancement specialist with deep knowledge of photography, design, and visual aesthetics. You understand composition, lighting, color theory, and how to transform images to their highest potential.'
END
WHERE system_prompt IS NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_image_categories_active ON public.image_categories(is_active);

-- Verify the changes
SELECT category_name, system_prompt, is_active 
FROM public.image_categories 
ORDER BY category_name;

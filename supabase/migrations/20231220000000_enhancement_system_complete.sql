-- =====================================================
-- COMPLETE ENHANCEMENT SYSTEM MIGRATION
-- Run this single file to create everything
-- =====================================================

-- =====================================================
-- PART 1: ENHANCEMENT PROMPTS TABLE
-- =====================================================

-- Create enhancement_prompts table
CREATE TABLE IF NOT EXISTS public.enhancement_prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enhancement_type VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  prompt_template TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  category VARCHAR(50) DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_enhancement_prompts_type ON public.enhancement_prompts(enhancement_type);
CREATE INDEX IF NOT EXISTS idx_enhancement_prompts_active ON public.enhancement_prompts(is_active);
CREATE INDEX IF NOT EXISTS idx_enhancement_prompts_category ON public.enhancement_prompts(category);

-- Enable RLS
ALTER TABLE public.enhancement_prompts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active enhancement prompts" ON public.enhancement_prompts;
DROP POLICY IF EXISTS "Only admins can manage enhancement prompts" ON public.enhancement_prompts;

-- Policy: Everyone can read active enhancements
CREATE POLICY "Anyone can view active enhancement prompts"
  ON public.enhancement_prompts
  FOR SELECT
  USING (is_active = true);

-- Policy: Only admins can insert/update/delete
CREATE POLICY "Only admins can manage enhancement prompts"
  ON public.enhancement_prompts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Insert existing enhancement data
INSERT INTO public.enhancement_prompts (enhancement_type, display_name, prompt_template, description, category, sort_order) VALUES
-- Interior Enhancements
('modern_minimalist', 'Modern Minimalist', 'Transform this interior into a modern minimalist space with clean lines, neutral colors (whites, grays, beiges), minimal furniture, and uncluttered surfaces. Focus on functionality and simplicity.', 'Clean, simple, and functional design', 'interior', 1),
('scandinavian', 'Scandinavian', 'Redesign this interior in Scandinavian style with light wood tones, white walls, cozy textiles, natural materials, and plenty of natural light. Include hygge elements and functional furniture.', 'Nordic-inspired cozy and bright spaces', 'interior', 2),
('industrial', 'Industrial', 'Convert this interior to industrial style with exposed brick walls, metal fixtures, concrete floors, Edison bulb lighting, and raw materials. Include vintage industrial furniture and open spaces.', 'Raw, urban, and edgy aesthetic', 'interior', 3),
('bohemian', 'Bohemian', 'Transform this interior into a bohemian space with eclectic patterns, vibrant colors, layered textiles, plants, vintage furniture, and global-inspired decor. Create a relaxed, artistic atmosphere.', 'Eclectic, colorful, and artistic', 'interior', 4),
('luxury_modern', 'Luxury Modern', 'Redesign this interior as a luxury modern space with high-end materials (marble, velvet, brass), designer furniture, sophisticated color palette, statement lighting, and elegant finishes.', 'High-end contemporary elegance', 'interior', 5),
('japanese_zen', 'Japanese Zen', 'Transform this interior into a Japanese Zen space with tatami mats, shoji screens, low furniture, natural materials, minimal decoration, and a focus on tranquility and balance.', 'Peaceful and harmonious design', 'interior', 6),
('coastal', 'Coastal', 'Redesign this interior in coastal style with light blues and whites, natural textures (rattan, jute), nautical elements, airy fabrics, and beach-inspired decor. Create a breezy, relaxed atmosphere.', 'Beach-inspired and breezy', 'interior', 7),
('art_deco', 'Art Deco', 'Transform this interior into Art Deco style with geometric patterns, rich colors (gold, black, emerald), luxurious materials, mirrored surfaces, and glamorous 1920s-inspired furniture.', 'Glamorous and geometric', 'interior', 8),

-- Exterior Enhancements
('modern_facade', 'Modern Facade', 'Transform this exterior with a modern facade featuring clean geometric lines, large windows, mixed materials (glass, steel, concrete), flat or low-slope roof, and minimalist landscaping.', 'Contemporary architectural design', 'exterior', 9),
('traditional', 'Traditional', 'Redesign this exterior in traditional style with classic architectural elements, symmetrical design, pitched roof, brick or stone facade, shuttered windows, and formal landscaping.', 'Classic and timeless architecture', 'exterior', 10),
('mediterranean', 'Mediterranean', 'Transform this exterior into Mediterranean style with stucco walls, terracotta roof tiles, arched windows and doorways, wrought iron details, and lush landscaping with olive trees.', 'Warm and inviting European style', 'exterior', 11),
('craftsman', 'Craftsman', 'Redesign this exterior in Craftsman style with low-pitched roof, exposed rafters, front porch with columns, natural materials (wood, stone), and detailed woodwork.', 'Handcrafted and natural', 'exterior', 12),
('colonial', 'Colonial', 'Transform this exterior into Colonial style with symmetrical facade, multi-pane windows, centered door with decorative crown, columns, and traditional landscaping.', 'Historic American elegance', 'exterior', 13),
('contemporary_glass', 'Contemporary Glass', 'Redesign this exterior with contemporary glass design featuring floor-to-ceiling windows, transparent walls, steel frames, open spaces, and integration with surrounding landscape.', 'Transparent and light-filled', 'exterior', 14),

-- Fashion Enhancements
('casual_chic', 'Casual Chic', 'Transform this outfit into casual chic style with relaxed yet polished pieces, neutral colors with pops of color, quality basics, minimal accessories, and effortless elegance.', 'Effortlessly stylish everyday wear', 'fashion', 15),
('business_formal', 'Business Formal', 'Redesign this outfit as business formal attire with tailored suit, crisp dress shirt, conservative tie, polished dress shoes, and professional accessories. Maintain a sharp, authoritative look.', 'Professional corporate attire', 'fashion', 16),
('streetwear', 'Streetwear', 'Transform this outfit into streetwear style with oversized hoodies, graphic tees, sneakers, joggers, caps, and urban-inspired accessories. Create a bold, contemporary street look.', 'Urban and trendy fashion', 'fashion', 17),
('elegant_evening', 'Elegant Evening', 'Redesign this outfit as elegant evening wear with sophisticated dress or suit, luxurious fabrics (silk, velvet), refined accessories, elegant shoes, and glamorous styling.', 'Sophisticated formal wear', 'fashion', 18),
('bohemian_style', 'Bohemian Style', 'Transform this outfit into bohemian style with flowing fabrics, earthy colors, layered pieces, ethnic patterns, fringe details, and natural accessories. Create a free-spirited look.', 'Free-spirited and artistic', 'fashion', 19),
('sporty_athletic', 'Sporty Athletic', 'Redesign this outfit as sporty athletic wear with performance fabrics, athletic shoes, activewear pieces, sporty accessories, and a dynamic, energetic look.', 'Active and performance-focused', 'fashion', 20),

-- Furniture Enhancements
('modern_furniture', 'Modern Furniture', 'Replace furniture with modern pieces featuring clean lines, minimal ornamentation, neutral colors, geometric shapes, and contemporary materials like metal and glass.', 'Contemporary furniture design', 'furniture', 21),
('vintage_furniture', 'Vintage Furniture', 'Replace furniture with vintage pieces from 1920s-1970s featuring classic designs, rich wood tones, ornate details, and timeless appeal.', 'Classic retro furniture', 'furniture', 22),
('luxury_furniture', 'Luxury Furniture', 'Replace furniture with luxury high-end pieces featuring premium materials (leather, marble, velvet), designer brands, sophisticated finishes, and elegant craftsmanship.', 'High-end designer furniture', 'furniture', 23),
('scandinavian_furniture', 'Scandinavian Furniture', 'Replace furniture with Scandinavian pieces featuring light wood, simple forms, functional design, natural materials, and minimalist aesthetic.', 'Nordic functional design', 'furniture', 24),

-- General Enhancements
('enhance_quality', 'Enhance Quality', 'Enhance the overall quality of this image. Improve sharpness, clarity, color accuracy, and lighting. Make it look professional and high-quality.', 'Improve overall image quality', 'general', 100),
('remove_background', 'Remove Background', 'Remove the background completely and replace with pure white (#FFFFFF). Ensure clean edges around the subject with no artifacts.', 'Clean white background', 'general', 101),
('improve_lighting', 'Improve Lighting', 'Apply professional lighting. Add soft fill lights to eliminate shadows, enhance details, and create a polished commercial look.', 'Professional lighting', 'general', 102),
('color_correction', 'Color Correction', 'Apply professional color correction and grading. Balance colors, enhance vibrancy, and create a cohesive color palette.', 'Professional color grading', 'general', 103)
ON CONFLICT (enhancement_type) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_enhancement_prompts_updated_at ON public.enhancement_prompts;

-- Create trigger for updated_at
CREATE TRIGGER update_enhancement_prompts_updated_at
    BEFORE UPDATE ON public.enhancement_prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT ON public.enhancement_prompts TO anon, authenticated;
GRANT ALL ON public.enhancement_prompts TO service_role;

-- =====================================================
-- PART 2: IMAGE CATEGORIES & MAPPING
-- =====================================================

-- Create image_categories table
CREATE TABLE IF NOT EXISTS public.image_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_code VARCHAR(50) NOT NULL UNIQUE,
  category_name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create category_enhancements mapping table (many-to-many)
CREATE TABLE IF NOT EXISTS public.category_enhancements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.image_categories(id) ON DELETE CASCADE,
  enhancement_id UUID NOT NULL REFERENCES public.enhancement_prompts(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(category_id, enhancement_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_image_categories_code ON public.image_categories(category_code);
CREATE INDEX IF NOT EXISTS idx_image_categories_active ON public.image_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_category_enhancements_category ON public.category_enhancements(category_id);
CREATE INDEX IF NOT EXISTS idx_category_enhancements_enhancement ON public.category_enhancements(enhancement_id);

-- Enable RLS
ALTER TABLE public.image_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_enhancements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.image_categories;
DROP POLICY IF EXISTS "Only admins can manage categories" ON public.image_categories;
DROP POLICY IF EXISTS "Anyone can view category enhancements" ON public.category_enhancements;
DROP POLICY IF EXISTS "Only admins can manage category enhancements" ON public.category_enhancements;

-- RLS Policies for image_categories
CREATE POLICY "Anyone can view active categories"
  ON public.image_categories
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can manage categories"
  ON public.image_categories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- RLS Policies for category_enhancements
CREATE POLICY "Anyone can view category enhancements"
  ON public.category_enhancements
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage category enhancements"
  ON public.category_enhancements
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Insert image categories
INSERT INTO public.image_categories (category_code, category_name, description, icon, sort_order) VALUES
('clothing', 'Clothing & Fashion', 'Shirts, dresses, pants, jackets, and other wearable items', '👕', 1),
('shoes', 'Shoes & Footwear', 'Sneakers, boots, sandals, and all types of footwear', '👟', 2),
('accessories', 'Accessories', 'Bags, watches, jewelry, hats, and fashion accessories', '👜', 3),
('interior', 'Interior Design', 'Living rooms, bedrooms, kitchens, and interior spaces', '🏠', 4),
('exterior', 'Exterior & Architecture', 'Building facades, houses, and architectural exteriors', '🏛️', 5),
('furniture', 'Furniture', 'Chairs, tables, sofas, beds, and furniture items', '🪑', 6),
('product', 'General Product', 'General products and items', '📦', 7)
ON CONFLICT (category_code) DO NOTHING;

-- Function to get enhancements by category code
CREATE OR REPLACE FUNCTION get_enhancements_by_category(p_category_code VARCHAR)
RETURNS TABLE (
  enhancement_id UUID,
  enhancement_type VARCHAR,
  display_name VARCHAR,
  description TEXT,
  prompt_template TEXT,
  category VARCHAR,
  is_default BOOLEAN,
  sort_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ep.id as enhancement_id,
    ep.enhancement_type,
    ep.display_name,
    ep.description,
    ep.prompt_template,
    ep.category,
    ce.is_default,
    ce.sort_order
  FROM public.image_categories ic
  JOIN public.category_enhancements ce ON ic.id = ce.category_id
  JOIN public.enhancement_prompts ep ON ce.enhancement_id = ep.id
  WHERE 
    ic.category_code = p_category_code
    AND ic.is_active = true
    AND ep.is_active = true
  ORDER BY ce.sort_order ASC, ep.display_name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all categories with enhancement count
CREATE OR REPLACE FUNCTION get_categories_with_counts()
RETURNS TABLE (
  category_id UUID,
  category_code VARCHAR,
  category_name VARCHAR,
  description TEXT,
  icon VARCHAR,
  enhancement_count BIGINT,
  sort_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ic.id as category_id,
    ic.category_code,
    ic.category_name,
    ic.description,
    ic.icon,
    COUNT(ce.id) as enhancement_count,
    ic.sort_order
  FROM public.image_categories ic
  LEFT JOIN public.category_enhancements ce ON ic.id = ce.category_id
  WHERE ic.is_active = true
  GROUP BY ic.id, ic.category_code, ic.category_name, ic.description, ic.icon, ic.sort_order
  ORDER BY ic.sort_order ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT ON public.image_categories TO anon, authenticated;
GRANT SELECT ON public.category_enhancements TO anon, authenticated;
GRANT ALL ON public.image_categories TO service_role;
GRANT ALL ON public.category_enhancements TO service_role;
GRANT EXECUTE ON FUNCTION get_enhancements_by_category(VARCHAR) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_categories_with_counts() TO anon, authenticated;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_image_categories_updated_at ON public.image_categories;

-- Triggers for updated_at
CREATE TRIGGER update_image_categories_updated_at
    BEFORE UPDATE ON public.image_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PART 3: DEFAULT MAPPINGS
-- =====================================================

-- Insert default mappings for clothing category
DO $$
DECLARE
  clothing_id UUID;
  enh_id UUID;
BEGIN
  SELECT id INTO clothing_id FROM public.image_categories WHERE category_code = 'clothing';
  
  IF clothing_id IS NOT NULL THEN
    FOR enh_id IN 
      SELECT id FROM public.enhancement_prompts WHERE category = 'fashion' AND is_active = true
    LOOP
      INSERT INTO public.category_enhancements (category_id, enhancement_id, sort_order)
      VALUES (clothing_id, enh_id, (SELECT COUNT(*) FROM public.category_enhancements WHERE category_id = clothing_id))
      ON CONFLICT (category_id, enhancement_id) DO NOTHING;
    END LOOP;
  END IF;
END $$;

-- Insert default mappings for interior category
DO $$
DECLARE
  interior_id UUID;
  enh_id UUID;
BEGIN
  SELECT id INTO interior_id FROM public.image_categories WHERE category_code = 'interior';
  
  IF interior_id IS NOT NULL THEN
    FOR enh_id IN 
      SELECT id FROM public.enhancement_prompts WHERE category = 'interior' AND is_active = true
    LOOP
      INSERT INTO public.category_enhancements (category_id, enhancement_id, sort_order)
      VALUES (interior_id, enh_id, (SELECT COUNT(*) FROM public.category_enhancements WHERE category_id = interior_id))
      ON CONFLICT (category_id, enhancement_id) DO NOTHING;
    END LOOP;
  END IF;
END $$;

-- Insert default mappings for exterior category
DO $$
DECLARE
  exterior_id UUID;
  enh_id UUID;
BEGIN
  SELECT id INTO exterior_id FROM public.image_categories WHERE category_code = 'exterior';
  
  IF exterior_id IS NOT NULL THEN
    FOR enh_id IN 
      SELECT id FROM public.enhancement_prompts WHERE category = 'exterior' AND is_active = true
    LOOP
      INSERT INTO public.category_enhancements (category_id, enhancement_id, sort_order)
      VALUES (exterior_id, enh_id, (SELECT COUNT(*) FROM public.category_enhancements WHERE category_id = exterior_id))
      ON CONFLICT (category_id, enhancement_id) DO NOTHING;
    END LOOP;
  END IF;
END $$;

-- Insert default mappings for furniture category
DO $$
DECLARE
  furniture_id UUID;
  enh_id UUID;
BEGIN
  SELECT id INTO furniture_id FROM public.image_categories WHERE category_code = 'furniture';
  
  IF furniture_id IS NOT NULL THEN
    FOR enh_id IN 
      SELECT id FROM public.enhancement_prompts WHERE category = 'furniture' AND is_active = true
    LOOP
      INSERT INTO public.category_enhancements (category_id, enhancement_id, sort_order)
      VALUES (furniture_id, enh_id, (SELECT COUNT(*) FROM public.category_enhancements WHERE category_id = furniture_id))
      ON CONFLICT (category_id, enhancement_id) DO NOTHING;
    END LOOP;
  END IF;
END $$;

-- Add general enhancements to all categories
DO $$
DECLARE
  cat_id UUID;
  enh_id UUID;
BEGIN
  FOR enh_id IN 
    SELECT id FROM public.enhancement_prompts WHERE category = 'general' AND is_active = true
  LOOP
    FOR cat_id IN 
      SELECT id FROM public.image_categories WHERE is_active = true
    LOOP
      INSERT INTO public.category_enhancements (category_id, enhancement_id, sort_order)
      VALUES (cat_id, enh_id, 999)
      ON CONFLICT (category_id, enhancement_id) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Add comments
COMMENT ON TABLE public.enhancement_prompts IS 'AI enhancement prompt templates';
COMMENT ON TABLE public.image_categories IS 'Categories for image classification';
COMMENT ON TABLE public.category_enhancements IS 'Mapping between categories and enhancements';
COMMENT ON FUNCTION get_enhancements_by_category(VARCHAR) IS 'Get enhancements for a category';
COMMENT ON FUNCTION get_categories_with_counts() IS 'Get all categories with counts';

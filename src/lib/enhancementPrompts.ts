import { supabase } from '@/integrations/supabase/client';

export interface EnhancementPrompt {
  id: string;
  enhancement_type: string;
  display_name: string;
  prompt_template: string;
  description: string | null;
  is_active: boolean;
  category: string;
  sort_order: number;
}

export interface ImageCategory {
  category_id: string;
  category_code: string;
  category_name: string;
  description: string | null;
  icon: string | null;
  enhancement_count: number;
  sort_order: number;
}

export interface CategoryEnhancement {
  id: string;
  type: string;
  title: string;
  description: string | null;
  category: string;
  isDefault: boolean;
}

/**
 * Get all image categories with enhancement counts
 */
export async function getImageCategories(): Promise<ImageCategory[]> {
  const { data, error } = await supabase
    .rpc('get_categories_with_counts');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return ((data as any) || []) as ImageCategory[];
}

/**
 * Get enhancements for a specific category code
 */
export async function getEnhancementsByCategory(categoryCode: string): Promise<CategoryEnhancement[]> {
  const { data, error } = await supabase
    .rpc('get_enhancements_by_category', { 
      p_category_code: categoryCode.toLowerCase() 
    });

  if (error) {
    console.error('Error fetching enhancements by category:', error);
    return [];
  }

  return ((data as any) || []).map((item: any) => ({
    id: item.enhancement_id,
    type: item.enhancement_type,
    title: item.display_name,
    description: item.description,
    category: item.category,
    isDefault: item.is_default,
  }));
}

/**
 * Fetch all active enhancement prompts from database
 */
export async function getActiveEnhancementPrompts(): Promise<EnhancementPrompt[]> {
  const { data, error } = await supabase
    .from('enhancement_prompts' as any)
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching enhancement prompts:', error);
    return [];
  }

  return ((data || []) as any) as EnhancementPrompt[];
}

/**
 * Fetch enhancement prompts by category
 */
export async function getEnhancementPromptsByCategory(category: string): Promise<EnhancementPrompt[]> {
  const { data, error } = await supabase
    .from('enhancement_prompts' as any)
    .select('*')
    .eq('is_active', true)
    .eq('category', category)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching enhancement prompts:', error);
    return [];
  }

  return ((data || []) as any) as EnhancementPrompt[];
}

/**
 * Get a single enhancement prompt by type
 */
export async function getEnhancementPrompt(
  enhancementType: string
): Promise<EnhancementPrompt | null> {
  const { data, error } = await supabase
    .from('enhancement_prompts' as any)
    .select('*')
    .eq('enhancement_type', enhancementType)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching enhancement prompt:', error);
    return null;
  }

  return (data as any) as EnhancementPrompt | null;
}

/**
 * Get multiple enhancement prompts by types
 */
export async function getMultipleEnhancementPrompts(
  enhancementTypes: string[]
): Promise<EnhancementPrompt[]> {
  if (enhancementTypes.length === 0) return [];

  const { data, error } = await supabase
    .from('enhancement_prompts' as any)
    .select('*')
    .in('enhancement_type', enhancementTypes)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching multiple enhancement prompts:', error);
    return [];
  }

  return ((data || []) as any) as EnhancementPrompt[];
}

/**
 * Combine multiple prompts into one
 */
export function combinePrompts(prompts: EnhancementPrompt[]): string {
  if (prompts.length === 0) return '';
  if (prompts.length === 1) return prompts[0].prompt_template;

  const combinedPrompt = `Apply the following enhancements to this image:\n\n${prompts
    .map((p, i) => `${i + 1}. ${p.prompt_template}`)
    .join('\n\n')}\n\nEnsure all enhancements work together harmoniously and create a cohesive final result.`;

  return combinedPrompt;
}

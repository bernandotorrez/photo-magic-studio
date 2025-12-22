import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// ============================================
// INLINE CORS UTILITIES (Private API)
// ============================================
const ALLOWED_ORIGINS = [
  'https://pixel-nova-ai.vercel.app',
  'https://ai-magic-photo.lovable.app',
  'http://localhost:8080',
  'http://localhost:5173',
];

function getPrivateCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const isAllowed = requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin);
  
  if (isAllowed) {
    return {
      'Access-Control-Allow-Origin': requestOrigin,
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    };
  }
  
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };
}
// ============================================

serve(async (req) => {
  // ✅ GET ORIGIN FOR CORS CHECK
  const origin = req.headers.get('Origin');
  const corsHeaders = getPrivateCorsHeaders(origin);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'imageUrl is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Classifying makeup image:', imageUrl);

    // Get Supabase client
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

    // Query enhancements from database for makeup category
    const { data: beautyCategory } = await supabase
      .from('image_categories')
      .select('id')
      .eq('category_code', 'beauty')
      .single();

    if (!beautyCategory) {
      return new Response(
        JSON.stringify({ error: 'Beauty category not found' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get makeup enhancements
    const { data: allEnhancements, error: enhError } = await supabase
      .from('category_enhancements')
      .select(`
        enhancement_id,
        enhancement_prompts (
          id,
          enhancement_type,
          display_name,
          description,
          category,
          supports_custom_prompt
        )
      `)
      .eq('category_id', beautyCategory.id)
      .order('sort_order');

    if (enhError) {
      console.error('Error fetching enhancements:', enhError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch enhancements' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter only makeup enhancements
    const makeupOptions: any[] = [];

    allEnhancements?.forEach((item: any) => {
      const enh = item.enhancement_prompts;
      if (!enh) return;

      if (enh.category === 'makeup') {
        makeupOptions.push({
          id: enh.id,
          enhancement_type: enh.enhancement_type,
          display_name: enh.display_name,
          description: enh.description,
          supports_custom_prompt: enh.supports_custom_prompt || false,
        });
      }
    });

    // Prepare response
    const response = {
      classification: 'beauty', // Return beauty as classification
      enhancementOptions: makeupOptions,
    };

    console.log(`✅ Found ${makeupOptions.length} makeup options`);
    console.log(`✅ Classification: beauty`);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in classify-makeup:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unexpected error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

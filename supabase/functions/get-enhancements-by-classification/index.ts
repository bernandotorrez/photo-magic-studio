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
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { categoryCode } = await req.json();
    
    if (!categoryCode) {
      return new Response(
        JSON.stringify({ error: 'categoryCode is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get enhancements for this category using the database function
    const { data: enhancements, error } = await supabase
      .rpc('get_enhancements_by_category', { 
        p_category_code: categoryCode.toLowerCase() 
      });

    if (error) {
      console.error('Error fetching enhancements:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch enhancements', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format response
    const formattedEnhancements = enhancements.map((item: any) => ({
      id: item.enhancement_id,
      type: item.enhancement_type,
      title: item.display_name,
      description: item.description,
      category: item.category,
      isDefault: item.is_default,
    }));

    return new Response(
      JSON.stringify({ 
        categoryCode,
        enhancements: formattedEnhancements,
        total: enhancements.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in get-enhancements-by-classification function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

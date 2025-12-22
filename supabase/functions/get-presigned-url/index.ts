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
    const { imagePath, historyId } = await req.json();
    
    if (!imagePath) {
      return new Response(
        JSON.stringify({ error: 'imagePath is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Create signed URL for the generated image (7 days expiry)
    const expiresIn = 60 * 60 * 24 * 7; // 7 days in seconds
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('generated-images')
      .createSignedUrl(imagePath, expiresIn);

    if (signedUrlError) {
      console.error('Error creating signed URL:', signedUrlError);
      return new Response(
        JSON.stringify({ error: 'Failed to create signed URL', details: signedUrlError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const signedUrl = signedUrlData?.signedUrl;

    // Update the history record with the new presigned URL if historyId provided
    if (historyId && signedUrl) {
      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
      
      const { error: updateError } = await supabase
        .from('generation_history')
        .update({
          presigned_url: signedUrl,
          presigned_url_expires_at: expiresAt,
        })
        .eq('id', historyId);

      if (updateError) {
        console.error('Error updating history record:', updateError);
        // Don't fail the request, just log the error
      }
    }

    console.log('Generated presigned URL for:', imagePath);

    return new Response(
      JSON.stringify({ signedUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in get-presigned-url function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

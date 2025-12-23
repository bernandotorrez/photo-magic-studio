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

    const HUGGING_FACE_API_KEY = Deno.env.get('HUGGING_FACE_API_KEY');
    if (!HUGGING_FACE_API_KEY) {
      console.error('HUGGING_FACE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Classifying hair style image for gender detection:', imageUrl);

    let gender = 'female'; // Default to female
    let detectedLabel = 'default';
    let classificationSuccess = false;
    
    // Try to detect gender using Hugging Face
    try {
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch image');
      }
      
      const imageBlob = await imageResponse.blob();
      const imageBuffer = await imageBlob.arrayBuffer();

      console.log('Image fetched, size:', imageBuffer.byteLength, 'bytes');

      // Use specialized gender classification model (96% accuracy)
      const response = await fetch('https://router.huggingface.co/hf-inference/models/rizvandwiki/gender-classification', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
          'Content-Type': imageBlob.type || 'image/jpeg',
        },
        body: imageBuffer,
      });

      console.log('Hugging Face API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Hugging Face response:', JSON.stringify(data));
        
        if (Array.isArray(data) && data.length > 0) {
          // Model returns: [{ label: "male", score: 0.99 }, { label: "female", score: 0.01 }]
          const topPrediction = data[0];
          detectedLabel = topPrediction.label.toLowerCase();
          classificationSuccess = true;
          
          console.log('Gender prediction:', topPrediction.label, 'with confidence:', topPrediction.score);
          
          // Direct gender assignment from model
          if (detectedLabel === 'male') {
            gender = 'male';
          } else if (detectedLabel === 'female') {
            gender = 'female';
          }
          
          console.log('✅ Gender detected with high confidence:', gender, `(${(topPrediction.score * 100).toFixed(1)}%)`);
        }
      } else {
        const errorText = await response.text();
        console.log('Hugging Face API error:', errorText);
      }
    } catch (apiError) {
      console.log('Classification error, using default:', apiError);
    }

    console.log('Final gender:', gender, '| Classification success:', classificationSuccess);

    // Get Supabase client
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

    // Query enhancements from database for hair style category
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

    // Get hair style enhancements based on detected gender
    const categoryFilter = gender === 'male' ? 'hair_style_male' : 'hair_style_female';

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

    // Filter only hair style enhancements for detected gender
    const hairStyleOptions: any[] = [];

    allEnhancements?.forEach((item: any) => {
      const enh = item.enhancement_prompts;
      if (!enh) return;

      if (enh.category === categoryFilter) {
        hairStyleOptions.push({
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
      classification: gender, // Return gender as classification (male or female)
      gender: gender,
      detectedLabel: detectedLabel,
      classificationSuccess: classificationSuccess,
      enhancementOptions: hairStyleOptions,
    };

    console.log(`✅ Found ${hairStyleOptions.length} hair styles for ${gender}`);
    console.log(`✅ Classification: ${gender}`);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in classify-hairstyle:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unexpected error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

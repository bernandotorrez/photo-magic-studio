import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, forceCategory } = await req.json();
    
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

    console.log('Classifying image:', imageUrl);

    // If forceCategory is provided, use it directly
    let category = forceCategory || 'fashion'; // Default to fashion for general products
    
    // Only classify if no forceCategory is provided
    if (!forceCategory) {
      // Try to classify with Hugging Face
      try {
        // Fetch the image first
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error('Failed to fetch image');
        }
        
        const imageBlob = await imageResponse.blob();
        const imageBuffer = await imageBlob.arrayBuffer();

        // Use Hugging Face Inference API with router endpoint
        const response = await fetch('https://router.huggingface.co/hf-inference/models/google/vit-base-patch16-224', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
            'Content-Type': imageBlob.type || 'image/jpeg',
          },
          body: imageBuffer,
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Hugging Face response:', data);
          
          // Map Hugging Face labels to our categories
          if (Array.isArray(data) && data.length > 0) {
            const topLabel = data[0].label.toLowerCase();
            
            // Map to our category codes
            if (topLabel.includes('shirt') || topLabel.includes('dress') || topLabel.includes('jacket') || 
                topLabel.includes('coat') || topLabel.includes('sweater') || topLabel.includes('jean') ||
                topLabel.includes('shoe') || topLabel.includes('boot') || topLabel.includes('sneaker') ||
                topLabel.includes('bag') || topLabel.includes('watch') || topLabel.includes('sunglasses') ||
                topLabel.includes('hat') || topLabel.includes('tie')) {
              category = 'fashion';
            } else if (topLabel.includes('person') || topLabel.includes('face') || topLabel.includes('people')) {
              // Check if it's beauty-related (hair, makeup, cosmetics)
              if (topLabel.includes('hair') || topLabel.includes('makeup') || topLabel.includes('lipstick') ||
                  topLabel.includes('cosmetic') || topLabel.includes('beauty') || topLabel.includes('hairstyle')) {
                category = 'beauty';
              } else {
                category = 'portrait';
              }
            } else if (topLabel.includes('room') || topLabel.includes('furniture') || topLabel.includes('interior') ||
                       topLabel.includes('living') || topLabel.includes('bedroom') || topLabel.includes('kitchen')) {
              category = 'interior';
            } else if (topLabel.includes('house') || topLabel.includes('building') || topLabel.includes('exterior') ||
                       topLabel.includes('facade') || topLabel.includes('architecture')) {
              category = 'exterior';
            } else if (topLabel.includes('food') || topLabel.includes('dish') || topLabel.includes('meal') ||
                       topLabel.includes('pizza') || topLabel.includes('burger') || topLabel.includes('salad')) {
              category = 'food';
            } else if (topLabel.includes('hair') || topLabel.includes('makeup') || topLabel.includes('lipstick') ||
                       topLabel.includes('cosmetic') || topLabel.includes('beauty') || topLabel.includes('hairstyle')) {
              category = 'beauty';
            }
            
            console.log('Detected label:', topLabel, '-> Mapped to category:', category);
          }
        } else {
          const errorText = await response.text();
          console.log('Hugging Face API error:', errorText);
        }
      } catch (apiError) {
        console.log('Classification error, using default category:', apiError);
      }
    }
    
    console.log('Final category:', category);

    // Get Supabase client
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

    // Query enhancements from database using the function
    const { data: enhancements, error } = await supabase
      .rpc('get_enhancements_by_category', { p_category_code: category });

    if (error) {
      console.error('Error fetching enhancements:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch enhancements' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format enhancements with ID for frontend
    const enhancementOptions = enhancements.map((enh: any) => ({
      id: enh.enhancement_id,
      enhancement_type: enh.enhancement_type,
      display_name: enh.display_name,
      description: enh.description,
      is_default: enh.is_default,
    }));

    console.log(`Found ${enhancementOptions.length} enhancements for ${category} category`);

    return new Response(
      JSON.stringify({
        classification: category,
        enhancementOptions,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in classify-image:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unexpected error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

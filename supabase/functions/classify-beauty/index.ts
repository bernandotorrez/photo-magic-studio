import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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

    console.log('Classifying beauty image for gender detection:', imageUrl);

    let gender = 'female'; // Default to female for beauty
    let detectedLabel = 'default';
    let classificationSuccess = false;
    let subcategory = 'makeup'; // Default subcategory
    
    // Try to detect gender using Hugging Face
    try {
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch image');
      }
      
      const imageBlob = await imageResponse.blob();
      const imageBuffer = await imageBlob.arrayBuffer();

      console.log('Image fetched, size:', imageBuffer.byteLength, 'bytes');

      // Use Hugging Face Vision Transformer for classification
      const response = await fetch('https://router.huggingface.co/hf-inference/models/google/vit-base-patch16-224', {
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
          const topLabel = data[0].label.toLowerCase();
          detectedLabel = topLabel;
          classificationSuccess = true;
          
          console.log('Top label detected:', topLabel);
          
          // Detect gender from labels
          if (topLabel.includes('man') || topLabel.includes('male') || topLabel.includes('boy') || 
              topLabel.includes('gentleman') || topLabel.includes('guy') || topLabel.includes('beard') ||
              topLabel.includes('mustache') || topLabel.includes('suit') || topLabel.includes('tie')) {
            gender = 'male';
          } else if (topLabel.includes('woman') || topLabel.includes('female') || topLabel.includes('girl') || 
                     topLabel.includes('lady') || topLabel.includes('dress') || topLabel.includes('makeup') ||
                     topLabel.includes('lipstick') || topLabel.includes('cosmetic')) {
            gender = 'female';
          }
          
          // Detect if it's more about hair or makeup
          if (topLabel.includes('hair') || topLabel.includes('hairstyle') || topLabel.includes('haircut') ||
              topLabel.includes('braid') || topLabel.includes('ponytail') || topLabel.includes('bun')) {
            subcategory = gender === 'male' ? 'hair_style_male' : 'hair_style_female';
          } else {
            subcategory = 'makeup'; // Default to makeup
          }
          
          console.log('Detected gender:', gender, '| Subcategory:', subcategory);
        }
      } else {
        const errorText = await response.text();
        console.log('Hugging Face API error:', errorText);
      }
    } catch (apiError) {
      console.log('Classification error, using default:', apiError);
    }

    console.log('Final gender:', gender, '| Subcategory:', subcategory, '| Classification success:', classificationSuccess);

    // Get Supabase client
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

    // Query enhancements from database for beauty category
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

    // Get all enhancements for beauty category
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

    // Filter enhancements based on detected gender and organize by subcategory
    const hairStyleMale: any[] = [];
    const hairStyleFemale: any[] = [];
    const makeup: any[] = [];

    allEnhancements?.forEach((item: any) => {
      const enh = item.enhancement_prompts;
      if (!enh) return;

      const enhancementData = {
        id: enh.id,
        enhancement_type: enh.enhancement_type,
        display_name: enh.display_name,
        description: enh.description,
        supports_custom_prompt: enh.supports_custom_prompt || false,
      };

      if (enh.category === 'hair_style_male') {
        hairStyleMale.push(enhancementData);
      } else if (enh.category === 'hair_style_female') {
        hairStyleFemale.push(enhancementData);
      } else if (enh.category === 'makeup') {
        makeup.push(enhancementData);
      }
    });

    // IMPORTANT: Return hair_style based on detected gender
    const hairStyleForGender = gender === 'male' ? hairStyleMale : hairStyleFemale;

    // Prepare response based on detected gender
    const response = {
      classification: 'beauty',
      gender: gender,
      detectedLabel: detectedLabel,
      classificationSuccess: classificationSuccess,
      subcategories: {
        hair_style: hairStyleForGender, // Only return hair styles for detected gender
        makeup: makeup, // Makeup is gender-neutral
      },
      // For backward compatibility, provide flat list of relevant enhancements
      enhancementOptions: [
        ...hairStyleForGender,
        ...makeup,
      ],
    };

    console.log(`✅ Found ${hairStyleMale.length} male hair styles, ${hairStyleFemale.length} female hair styles, ${makeup.length} makeup options`);
    console.log(`✅ Detected gender: ${gender} - Returning ${hairStyleForGender.length} hair styles for ${gender}`);
    console.log(`✅ Total enhancements in response: ${response.enhancementOptions.length} (${hairStyleForGender.length} hair + ${makeup.length} makeup)`);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in classify-beauty:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unexpected error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

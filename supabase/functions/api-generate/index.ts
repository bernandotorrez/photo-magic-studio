import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Authenticate using API key
    const apiKeyHeader = req.headers.get('x-api-key');
    
    if (!apiKeyHeader) {
      return new Response(
        JSON.stringify({ error: 'API key is required. Provide it in x-api-key header.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Hash the provided API key
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKeyHeader);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Verify API key
    const { data: apiKeyRecord, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('user_id, is_active')
      .eq('key_hash', hashedKey)
      .maybeSingle();

    if (apiKeyError || !apiKeyRecord) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!apiKeyRecord.is_active) {
      return new Response(
        JSON.stringify({ error: 'API key is inactive' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = apiKeyRecord.user_id;

    // Get user email
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    const userEmail = userData?.user?.email;

    // Parse request body
    const { imageUrl, enhancement, classification, watermark, customPose, customFurniture } = await req.json();
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'imageUrl is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!enhancement) {
      return new Response(
        JSON.stringify({ error: 'enhancement is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check user's remaining generations
    const { data: profileData } = await supabase
      .from('profiles')
      .select('monthly_generate_limit')
      .eq('user_id', userId)
      .maybeSingle();

    const limit = profileData?.monthly_generate_limit || 5;
    
    const { data: canGenerate } = await supabase
      .rpc('can_user_generate', { 
        p_email: userEmail,
        p_user_id: userId 
      });

    if (canGenerate === false) {
      const { data: currentCount } = await supabase
        .rpc('get_generation_count_by_email', { p_email: userEmail });
      
      return new Response(
        JSON.stringify({ 
          error: 'Monthly generation quota exceeded',
          current: currentCount || 0,
          limit: limit
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build enhancement prompt
    const enhancementPrompt = buildEnhancementPrompt(enhancement, customPose, customFurniture);

    // Build watermark instruction
    let watermarkInstruction = '';
    if (watermark && watermark.type !== 'none') {
      if (watermark.type === 'text' && watermark.text) {
        watermarkInstruction = ` Add a subtle watermark text "${watermark.text}" in the top-right corner of the image. Make it semi-transparent (about 30% opacity) and use a professional font.`;
      } else if (watermark.type === 'logo' && watermark.logoUrl) {
        watermarkInstruction = ` Add a small watermark logo in the top-right corner of the image. Make it semi-transparent (about 30% opacity). Logo reference: ${watermark.logoUrl}`;
      }
    } else {
      watermarkInstruction = ' Remove any existing watermarks, text overlays, logos, or branding from the image. Ensure the final image is clean without any text or logo elements.';
    }

    // Determine if model is needed
    const titleLower = enhancement.toLowerCase();
    const needsModel = 
      titleLower.includes('model') || 
      titleLower.includes('dipakai') || 
      titleLower.includes('worn') ||
      titleLower.includes('lifestyle') ||
      titleLower.includes('manekin') ||
      titleLower.includes('mannequin') ||
      titleLower.includes('on-feet') ||
      titleLower.includes('saat dipakai') ||
      titleLower.includes('bagian tubuh') ||
      titleLower.includes('leher') ||
      titleLower.includes('tangan') ||
      titleLower.includes('pergelangan');
    
    const imageUrls = [imageUrl];
    
    if (needsModel) {
      if (titleLower.includes('hijab') || titleLower.includes('berhijab')) {
        imageUrls.push('https://dcfnvebphjuwtlfuudcd.supabase.co/storage/v1/object/public/model-assets/model_female_hijab.png');
      } else if (titleLower.includes('wanita') || titleLower.includes('female') || titleLower.includes('woman')) {
        imageUrls.push('https://dcfnvebphjuwtlfuudcd.supabase.co/storage/v1/object/public/model-assets/model_female.png');
      } else if (titleLower.includes('pria') || titleLower.includes('male') || titleLower.includes('man')) {
        imageUrls.push('https://dcfnvebphjuwtlfuudcd.supabase.co/storage/v1/object/public/model-assets/model_male.png');
      } else {
        imageUrls.push('https://dcfnvebphjuwtlfuudcd.supabase.co/storage/v1/object/public/model-assets/model_female.png');
      }
    }

    let generatedPrompt = enhancementPrompt;
    if (needsModel && imageUrls.length === 2) {
      const productType = titleLower.includes('shirt') || titleLower.includes('kaos') || titleLower.includes('baju') ? 'shirt' :
                         titleLower.includes('dress') || titleLower.includes('gaun') ? 'dress' :
                         titleLower.includes('jacket') || titleLower.includes('jaket') ? 'jacket' :
                         titleLower.includes('pants') || titleLower.includes('celana') ? 'pants' :
                         titleLower.includes('shoe') || titleLower.includes('sepatu') ? 'shoes' :
                         titleLower.includes('bag') || titleLower.includes('tas') ? 'bag' :
                         titleLower.includes('watch') || titleLower.includes('jam') ? 'watch' :
                         titleLower.includes('necklace') || titleLower.includes('kalung') ? 'necklace' :
                         titleLower.includes('bracelet') || titleLower.includes('gelang') ? 'bracelet' :
                         'clothing';
      
      generatedPrompt = `Make the ${productType} from file 1 worn by the model from file 2. The model should use a natural professional pose like a fashion model to showcase the ${productType}. Keep the exact face, body, and appearance of the model from file 2. Preserve any text, logos, or branding that exists on the ${productType} from file 1 - do not remove or alter them. Use professional e-commerce photography style with clean background and studio lighting. The ${productType} should fit naturally on the model's body.`;
    }
    generatedPrompt += watermarkInstruction;

    // Call KIE AI API
    const KIE_AI_API_KEY = Deno.env.get('KIE_AI_API_KEY');
    
    if (!KIE_AI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestPayload = {
      model: 'google/nano-banana-edit',
      input: {
        prompt: generatedPrompt,
        image_urls: imageUrls,
        output_format: 'png',
        image_size: '1:1'
      }
    };

    const imageGenResponse = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KIE_AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    if (!imageGenResponse.ok) {
      const errorText = await imageGenResponse.text();
      
      if (imageGenResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (imageGenResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'API credits exhausted. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to generate image', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const imageGenData = await imageGenResponse.json();
    const taskId = imageGenData.data?.taskId;
    
    if (!taskId) {
      return new Response(
        JSON.stringify({ error: 'No task ID received from API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Poll for completion
    let generatedImageUrl = null;
    const maxAttempts = 60;
    const pollInterval = 2000;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      const statusResponse = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, {
        headers: {
          'Authorization': `Bearer ${KIE_AI_API_KEY}`,
        },
      });
      
      if (!statusResponse.ok) continue;
      
      const statusData = await statusResponse.json();
      
      if (statusData.code !== 200 || !statusData.data) continue;
      
      const taskData = statusData.data;
      
      if (taskData.state === 'success') {
        if (taskData.resultJson) {
          const resultJson = JSON.parse(taskData.resultJson);
          if (resultJson.resultUrls && resultJson.resultUrls.length > 0) {
            generatedImageUrl = resultJson.resultUrls[0];
            break;
          }
        }
      } else if (taskData.state === 'fail') {
        return new Response(
          JSON.stringify({ 
            error: 'Image generation failed', 
            details: taskData.failMsg || 'Unknown error'
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    if (!generatedImageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image generation timed out' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save to storage
    let savedImageUrl = generatedImageUrl;
    
    try {
      let imageBlob;
      if (generatedImageUrl.startsWith('data:')) {
        const base64Data = generatedImageUrl.split(',')[1];
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        imageBlob = new Blob([binaryData], { type: 'image/png' });
      } else {
        const imageResponse = await fetch(generatedImageUrl);
        imageBlob = await imageResponse.blob();
      }

      const fileName = `${userId}/${Date.now()}-enhanced.png`;
      
      const { error: uploadError } = await supabase.storage
        .from('generated-images')
        .upload(fileName, imageBlob, {
          contentType: 'image/png',
          upsert: false
        });

      if (!uploadError) {
        const { data: signedUrlData } = await supabase.storage
          .from('generated-images')
          .createSignedUrl(fileName, 60 * 60 * 24 * 7);

        if (signedUrlData?.signedUrl) {
          savedImageUrl = signedUrlData.signedUrl;
        }

        // Save to history
        await supabase
          .from('generation_history')
          .insert({
            user_id: userId,
            user_email: userEmail,
            original_image_path: 'api-upload',
            generated_image_path: fileName,
            enhancement_type: enhancement,
            classification_result: classification || 'unknown',
            prompt_used: generatedPrompt
          });

        // Update count
        await supabase.rpc('increment_generation_count', {
          p_user_id: userId
        });
      }
    } catch (saveError) {
      console.error('Error saving generated image:', saveError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        generatedImageUrl: savedImageUrl,
        prompt: generatedPrompt,
        taskId: taskId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in api-generate function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildEnhancementPrompt(enhancement: string, customPose?: string, customFurniture?: string): string {
  const basePrompts: Record<string, string> = {
    'add_male_model': `turn this product into a professional e-commerce photo with a male model wearing/using it. The model should be in a natural pose. Studio lighting with a clean white or gradient background. Professional product photography style.`,
    'add_female_model': `turn this product into a professional e-commerce photo with a female model wearing/using it. The model should be in a natural pose. Soft studio lighting with a minimalist background. Professional product photography style.`,
    'add_female_hijab_model': `turn this product into a professional e-commerce photo with a female model wearing hijab using/wearing it. The model should be in a natural pose. Soft studio lighting with a minimalist background. Professional product photography style.`,
    'add_mannequin': 'Display the clothing on a professional mannequin/dress form. Clean product photography style with even lighting and a pure white background. Focus on showing the garment structure and details.',
    'enhance_background': 'Enhance the background to a professional e-commerce standard. Use a clean gradient or contextual lifestyle background that complements the product. Maintain focus on the product while adding visual interest.',
    'improve_lighting': 'Apply professional product photography lighting. Add soft fill lights to eliminate shadows, enhance product details, and create a polished commercial look.',
    'remove_background': 'Remove the background completely and replace with pure white (#FFFFFF). Ensure clean edges around the product with no artifacts.',
  };

  const titleLower = enhancement.toLowerCase();
  
  if (titleLower.includes('female with hijab') || titleLower.includes('hijab')) {
    return basePrompts['add_female_hijab_model'];
  }
  if (titleLower.includes('female') || titleLower.includes('wanita')) {
    return basePrompts['add_female_model'];
  }
  if (titleLower.includes('male') || titleLower.includes('pria')) {
    return basePrompts['add_male_model'];
  }
  if (titleLower.includes('manekin') || titleLower.includes('mannequin')) {
    return basePrompts['add_mannequin'];
  }
  if (titleLower.includes('on-feet') || titleLower.includes('saat dipakai')) {
    return `turn this into a professional product photo showing the shoes being worn on feet. Show the shoes in use with a natural standing pose. Studio lighting with clean background. Professional e-commerce photography style.`;
  }
  
  // AI Photographer - Pose Variation with custom pose
  if (titleLower.includes('ubah pose') || titleLower.includes('pose variation')) {
    const poseInstruction = customPose 
      ? `Change the person's pose to: ${customPose}. Keep the person's face and clothing the same. The pose should be natural and suitable for professional photography. Studio lighting.`
      : `Change the person's pose to a more dynamic and professional pose. Keep the person's face and clothing the same. The new pose should be natural and suitable for professional photography. Studio lighting.`;
    return poseInstruction;
  }
  
  // Interior Design - Virtual Staging with custom furniture
  if (titleLower.includes('virtual staging') || titleLower.includes('tambah furniture')) {
    const furnitureInstruction = customFurniture
      ? `Add the following furniture and decor items to this room: ${customFurniture}. Create a fully staged, inviting interior space. Use modern, stylish furniture that fits the room's proportions. Professional interior design staging.`
      : `Add professional furniture and decor to this empty room. Create a fully staged, inviting interior space. Use modern, stylish furniture that fits the room's proportions. Professional interior design staging.`;
    return furnitureInstruction;
  }
  if (titleLower.includes('dipakai di bagian tubuh') || 
      titleLower.includes('leher') || 
      titleLower.includes('tangan') || 
      titleLower.includes('pergelangan')) {
    let itemType = 'accessory';
    let bodyPart = 'appropriate body part';
    
    if (titleLower.includes('kalung') || titleLower.includes('necklace') || titleLower.includes('leher')) {
      itemType = 'necklace';
      bodyPart = 'neck';
    } else if (titleLower.includes('gelang') || titleLower.includes('bracelet') || titleLower.includes('pergelangan')) {
      itemType = 'bracelet';
      bodyPart = 'wrist';
    } else if (titleLower.includes('cincin') || titleLower.includes('ring')) {
      itemType = 'ring';
      bodyPart = 'finger';
    } else if (titleLower.includes('anting') || titleLower.includes('earring')) {
      itemType = 'earring';
      bodyPart = 'ear';
    } else if (titleLower.includes('topi') || titleLower.includes('hat')) {
      itemType = 'hat';
      bodyPart = 'head';
    } else if (titleLower.includes('jam') || titleLower.includes('watch')) {
      itemType = 'watch';
      bodyPart = 'wrist';
    }
    
    return `turn this into a professional product photo showing the ${itemType} being worn on a model's ${bodyPart}. The model should be in an elegant pose that showcases the ${itemType} naturally. Focus on the ${itemType} while showing it in use. Soft studio lighting with minimalist background. Professional e-commerce photography style.`;
  }
  if (titleLower.includes('lifestyle')) {
    return `turn this into a lifestyle product photo showing the product being used/worn in a natural, everyday setting. The model should look relaxed and natural. Soft natural lighting with a lifestyle background (e.g., cafe, outdoor, home setting). Professional lifestyle photography style.`;
  }

  /* ============================
     JEWELRY & ACCESSORIES
     ============================ */
  
  // Jewelry worn on body parts
  if (titleLower.includes('💍') && titleLower.includes('jari')) {
    return `turn this into a professional product photo showing the ring being worn on a model's finger. The model should have elegant hands in a natural pose. Focus on the ring while showing it in use. Soft studio lighting with minimalist background. Professional jewelry photography style.`;
  }
  
  if (titleLower.includes('📿') && titleLower.includes('leher')) {
    return `turn this into a professional product photo showing the necklace being worn on a model's neck. The model should be in an elegant pose that showcases the necklace naturally. Focus on the necklace while showing it in use. Soft studio lighting with minimalist background. Professional jewelry photography style.`;
  }
  
  if (titleLower.includes('⌚') && titleLower.includes('pergelangan')) {
    return `turn this into a professional product photo showing the watch/bracelet being worn on a model's wrist. The model should have elegant hands in a natural pose. Focus on the watch/bracelet while showing it in use. Soft studio lighting with minimalist background. Professional jewelry photography style.`;
  }
  
  if (titleLower.includes('👂') && titleLower.includes('telinga')) {
    return `turn this into a professional product photo showing the earrings being worn on a model's ears. The model should be in an elegant pose that showcases the earrings naturally. Focus on the earrings while showing it in use. Soft studio lighting with minimalist background. Professional jewelry photography style.`;
  }
  
  // Luxury Jewelry Styling
  if (titleLower.includes('💎') && titleLower.includes('luxury')) {
    return `Transform this into a luxury jewelry product photo. High-end styling, dramatic lighting, elegant presentation. Use premium background and professional jewelry photography techniques. Luxury brand aesthetic.`;
  }

  /* ============================
     BEAUTY & COSMETICS
     ============================ */
  
  // Beauty product used by model
  if (titleLower.includes('💄') && (titleLower.includes('makeup') || titleLower.includes('skincare'))) {
    return `turn this into a professional beauty product photo showing the product being used by a model. The model should look natural and beautiful. Focus on the product while showing it in use. Soft beauty lighting with clean background. Professional beauty photography style.`;
  }
  
  // Luxury Product Styling
  if (titleLower.includes('💎') && titleLower.includes('luxury') && titleLower.includes('product')) {
    return `Transform this into a luxury beauty product photo. Premium packaging presentation, elegant styling, sophisticated lighting. High-end beauty brand aesthetic. Professional luxury product photography.`;
  }
  
  // Natural/Organic Aesthetic
  if (titleLower.includes('🌸') && (titleLower.includes('natural') || titleLower.includes('organic'))) {
    return `Transform this into a natural/organic beauty product photo. Use natural elements (leaves, flowers, wood), soft natural lighting, earthy tones. Eco-friendly, organic brand aesthetic. Professional natural product photography.`;
  }

  /* ============================
     ELECTRONICS & GADGETS
     ============================ */
  
  // Electronics used by model
  if (titleLower.includes('📱') && titleLower.includes('digunakan')) {
    return `turn this into a professional tech product photo showing the device being used by a model. The model should look natural and engaged with the device. Modern lifestyle setting. Professional tech product photography style.`;
  }
  
  // Tech Product Styling
  if (titleLower.includes('💻') && titleLower.includes('tech')) {
    return `Transform this into a professional tech product photo. Modern, sleek styling, clean background, perfect lighting. Showcase the device's design and build quality. Professional technology photography.`;
  }
  
  // Modern/Futuristic Look
  if (titleLower.includes('⚡') && (titleLower.includes('modern') || titleLower.includes('futuristic'))) {
    return `Transform this into a modern/futuristic tech product photo. Use dramatic lighting, sleek styling, contemporary aesthetic. High-tech, cutting-edge product photography.`;
  }

  /* ============================
     HOME & LIVING
     ============================ */
  
  // Home setting display
  if (titleLower.includes('🏠') && titleLower.includes('setting rumah')) {
    return `Display this home product in a beautiful home setting. Show it in use in a cozy, well-decorated room. Natural lighting, lifestyle photography style. Professional home decor photography.`;
  }
  
  // Cozy Home Aesthetic
  if (titleLower.includes('🛋️') && titleLower.includes('cozy')) {
    return `Transform this into a cozy home product photo. Warm lighting, comfortable setting, inviting atmosphere. Create a feeling of comfort and home. Professional lifestyle home photography.`;
  }
  
  // Natural/Minimalist Style
  if (titleLower.includes('🌿') && (titleLower.includes('natural') || titleLower.includes('minimalist'))) {
    return `Transform this into a natural/minimalist home product photo. Clean lines, neutral colors, natural materials, simple styling. Scandinavian-inspired aesthetic. Professional minimalist product photography.`;
  }

  /* ============================
     SPORTS & FITNESS
     ============================ */
  
  // Sports equipment in use
  if (titleLower.includes('🏃') && titleLower.includes('olahraga')) {
    return `turn this into a professional sports product photo showing the equipment being used during exercise. The model should be athletic and in action. Dynamic, energetic photography. Professional sports product photography style.`;
  }
  
  // Athlete/Model using product
  if (titleLower.includes('💪') && titleLower.includes('atlet')) {
    return `turn this into a professional fitness product photo with an athletic model using the product. Show strength, fitness, and performance. Gym or outdoor athletic setting. Professional fitness photography style.`;
  }
  
  // Dynamic Action Shot
  if (titleLower.includes('⚡') && titleLower.includes('dynamic')) {
    return `Create a dynamic action shot of this sports product in use. Capture movement, energy, and performance. Professional sports action photography with motion and intensity.`;
  }
  
  // Gym/Fitness Setting
  if (titleLower.includes('🏋️') && (titleLower.includes('gym') || titleLower.includes('fitness'))) {
    return `Display this fitness product in a professional gym setting. Modern fitness equipment, clean environment, motivational atmosphere. Professional gym product photography.`;
  }

  /* ============================
     KIDS & BABY PRODUCTS
     ============================ */
  
  // Kids/Baby using product
  if (titleLower.includes('👶') && (titleLower.includes('anak') || titleLower.includes('baby'))) {
    return `turn this into a professional kids product photo showing a child/baby using or enjoying the product. The child should look happy and natural. Bright, cheerful setting. Professional children's product photography style.`;
  }
  
  // Photo with Parents
  if (titleLower.includes('👨‍👩‍👧') && titleLower.includes('orang tua')) {
    return `Create a professional family product photo showing parents with their child using the product. Warm, loving atmosphere, natural interactions. Professional family lifestyle photography.`;
  }
  
  // Fun & Playful Aesthetic
  if (titleLower.includes('🎈') && (titleLower.includes('fun') || titleLower.includes('playful'))) {
    return `Transform this into a fun, playful kids product photo. Bright colors, cheerful atmosphere, engaging presentation. Create excitement and joy. Professional children's product photography.`;
  }
  
  // Colorful & Cheerful Look
  if (titleLower.includes('🌈') && (titleLower.includes('colorful') || titleLower.includes('cheerful'))) {
    return `Transform this into a colorful, cheerful kids product photo. Vibrant colors, happy atmosphere, playful styling. Create a joyful, child-friendly aesthetic. Professional children's product photography.`;
  }

  return `${enhancement}. Apply this enhancement professionally for e-commerce product photography.`;
}

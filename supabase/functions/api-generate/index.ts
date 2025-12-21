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
    const { imageUrl, enhancement, classification, watermark, customPose, customFurniture, customPrompt } = await req.json();
    
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

    // Check user's remaining tokens (dual token system)
    const { data: profileData } = await supabase
      .from('profiles')
      .select('subscription_tokens, purchased_tokens')
      .eq('user_id', userId)
      .maybeSingle();

    const subscriptionTokens = profileData?.subscription_tokens || 0;
    const purchasedTokens = profileData?.purchased_tokens || 0;
    const totalTokens = subscriptionTokens + purchasedTokens;
    
    if (totalTokens <= 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient tokens. Please top up to continue.',
          subscription_tokens: subscriptionTokens,
          purchased_tokens: purchasedTokens,
          total_tokens: totalTokens
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build enhancement prompt from database
    let enhancementPrompt = '';
    let enhancementDisplayName = enhancement;
    
    // Query by display_name OR enhancement_type (flexible for users)
    console.log('Querying enhancement:', enhancement);
    
    // Try display_name first (with emoji, user-friendly)
    let { data: promptData } = await supabase
      .from('enhancement_prompts')
      .select('prompt_template, display_name, enhancement_type')
      .eq('display_name', enhancement)
      .eq('is_active', true)
      .maybeSingle();
    
    // If not found, try by enhancement_type (without emoji, code-friendly)
    if (!promptData) {
      console.log('Not found by display_name, trying enhancement_type...');
      const result = await supabase
        .from('enhancement_prompts')
        .select('prompt_template, display_name, enhancement_type')
        .eq('enhancement_type', enhancement)
        .eq('is_active', true)
        .maybeSingle();
      promptData = result.data;
    }
    
    if (promptData?.prompt_template) {
      enhancementPrompt = promptData.prompt_template;
      enhancementDisplayName = promptData.display_name;
      console.log('✅ Using database prompt for:', enhancement, '→', promptData.display_name);
    } else {
      // Ultimate fallback: simple prompt
      console.log('⚠️ No database prompt found, using simple fallback for:', enhancement);
      enhancementPrompt = `Apply ${enhancement} enhancement professionally for e-commerce product photography.`;
    }

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

    // Determine if model is needed based on enhancement name
    const titleLower = enhancementDisplayName.toLowerCase();
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
    
    // Add custom prompt if provided (for beauty enhancements with custom colors)
    if (customPrompt && customPrompt.trim()) {
      generatedPrompt += ` Custom styling: ${customPrompt.trim()}`;
      console.log('Added custom prompt:', customPrompt.trim());
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
            enhancement_type: enhancementDisplayName,
            classification_result: classification || 'unknown',
            prompt_used: generatedPrompt
          });

        // Deduct tokens using dual token system (subscription tokens first)
        const { data: deductResult, error: deductError } = await supabase.rpc('deduct_user_tokens', {
          p_user_id: userId,
          p_amount: 1
        });

        if (deductError) {
          console.error('❌ Error deducting tokens:', deductError);
        } else if (deductResult && deductResult.length > 0) {
          const result = deductResult[0];
          if (result.success) {
            console.log('✅ Token deducted successfully:', {
              subscription_used: result.subscription_used,
              purchased_used: result.purchased_used,
              remaining_subscription: result.remaining_subscription,
              remaining_purchased: result.remaining_purchased
            });
          } else {
            console.error('❌ Failed to deduct tokens:', result.message);
          }
        }
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


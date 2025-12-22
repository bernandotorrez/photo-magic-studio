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
    const { imageUrl, originalImagePath, imagePath, enhancement, enhancements, enhancementIds, classification, watermark, customPose, customFurniture, customPrompt, debugMode } = await req.json();
    
    // Get user ID and email from authorization header
    const authHeader = req.headers.get('authorization');
    let userId: string | null = null;
    let userEmail: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
      const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
      const supabaseAuth = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
      const { data: { user } } = await supabaseAuth.auth.getUser(token);
      userId = user?.id || null;
      userEmail = user?.email || null;
    }
    
    // Accept either imageUrl or originalImagePath
    const storagePath = originalImagePath || imagePath;
    
    // Support both enhancement IDs (new way) and legacy enhancement objects/strings
    let enhancementList = enhancements || (enhancement ? [enhancement] : []);
    
    // If enhancementIds provided, use the new way
    if (enhancementIds && enhancementIds.length > 0) {
      enhancementList = enhancementIds;
    }
    
    if (!enhancementList || enhancementList.length === 0) {
      return new Response(
        JSON.stringify({ error: 'enhancement, enhancements, or enhancementIds is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Check user's remaining tokens (dual token system)
    if (userId && userEmail) {
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
            error: 'Token Anda sudah habis. Silakan top up untuk melanjutkan.',
            subscription_tokens: subscriptionTokens,
            purchased_tokens: purchasedTokens,
            total_tokens: totalTokens
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get image URL from storage if not provided directly
    let finalImageUrl = imageUrl;
    if (!finalImageUrl && storagePath) {
      const { data: signedUrlData } = await supabase.storage
        .from('upload-images')
        .createSignedUrl(storagePath, 3600);
      
      if (signedUrlData?.signedUrl) {
        finalImageUrl = signedUrlData.signedUrl;
      }
    }
    
    if (!finalImageUrl) {
      return new Response(
        JSON.stringify({ error: 'Could not resolve image URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle enhancement as string, object, or ID
    const enhancementTitles: string[] = [];
    const prompts: string[] = [];
    
    // Get system prompt based on classification/category
    let systemPrompt = '';
    if (classification) {
      // Try to get system prompt from image_categories table
      // classification could be category_name or category_code
      const { data: categoryData } = await supabase
        .from('image_categories')
        .select('system_prompt, category_name, category_code')
        .or(`category_name.eq.${classification},category_code.eq.${classification}`)
        .eq('is_active', true)
        .maybeSingle();
      
      if (categoryData?.system_prompt) {
        systemPrompt = categoryData.system_prompt;
        console.log('✅ Using system prompt for category:', categoryData.category_name || classification);
        console.log('System prompt preview:', systemPrompt.substring(0, 100) + '...');
      } else {
        console.log('⚠️ No system prompt found for classification:', classification);
      }
    }
    
    // Process each enhancement
    for (const enh of enhancementList) {
      let enhancementData = null;
      
      // Check if it's an ID (UUID format) or legacy format
      if (typeof enh === 'string' && enh.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        // It's an ID - query from database
        console.log('Querying enhancement by ID:', enh);
        const { data: promptData, error: queryError } = await supabase
          .from('enhancement_prompts')
          .select('enhancement_type, display_name, prompt_template')
          .eq('id', enh)
          .eq('is_active', true)
          .maybeSingle();
        
        if (queryError) {
          console.error('❌ Error querying enhancement:', queryError);
          return new Response(
            JSON.stringify({ 
              error: 'Failed to query enhancement data',
              details: queryError.message,
              enhancementId: enh
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (promptData) {
          enhancementData = promptData;
          enhancementTitles.push(promptData.display_name);
          prompts.push(promptData.prompt_template);
          console.log('✅ Found enhancement:', promptData.display_name);
        } else {
          console.log('⚠️ Enhancement ID not found:', enh);
          return new Response(
            JSON.stringify({ 
              error: 'Enhancement not found',
              details: `Enhancement ID ${enh} tidak ditemukan atau tidak aktif`,
              enhancementId: enh
            }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        // Legacy format - string or object with title
        const displayName = typeof enh === 'string' ? enh : enh.title;
        enhancementTitles.push(displayName);
        
        // Try to find in database by display_name as fallback
        const { data: promptData } = await supabase
          .from('enhancement_prompts')
          .select('prompt_template')
          .eq('display_name', displayName)
          .eq('is_active', true)
          .maybeSingle();
        
        if (promptData?.prompt_template) {
          prompts.push(promptData.prompt_template);
          console.log('✅ Found legacy enhancement by name:', displayName);
        } else {
          // Ultimate fallback: use display name as prompt
          prompts.push(`${displayName}: Apply this enhancement professionally.`);
          console.log('⚠️ Using fallback prompt for:', displayName);
        }
      }
    }
    
    console.log('Generating enhanced image for:', enhancementTitles.join(', '));
    
    // Add custom prompts if provided
    if (customFurniture && customFurniture.trim()) {
      prompts.push(`Custom furniture request: ${customFurniture.trim()}`);
      console.log('Added custom furniture prompt:', customFurniture.trim());
    }
    
    if (customPose && customPose.trim()) {
      prompts.push(`Custom pose request: ${customPose.trim()}`);
      console.log('Added custom pose prompt:', customPose.trim());
    }
    
    if (customPrompt && customPrompt.trim()) {
      prompts.push(`Custom styling request: ${customPrompt.trim()}`);
      console.log('Added custom prompt:', customPrompt.trim());
    }
    
    // Combine multiple prompts
    let mainPrompt = '';
    if (prompts.length === 1) {
      mainPrompt = prompts[0];
    } else {
      // Combine multiple prompts with proper formatting
      mainPrompt = `Apply the following enhancements to this image:\n\n${prompts.map((p, i) => `${i + 1}. ${p}`).join('\n\n')}\n\nEnsure all enhancements work together harmoniously and create a cohesive final result.`;
    }
    
    // Prepend system prompt if available
    let enhancementPrompt = '';
    if (systemPrompt) {
      enhancementPrompt = `${systemPrompt}\n\n${mainPrompt}`;
    } else {
      enhancementPrompt = mainPrompt;
    }

    // Use KIE AI API
    const KIE_AI_API_KEY = Deno.env.get('KIE_AI_API_KEY');
    
    if (!KIE_AI_API_KEY) {
      console.error('KIE_AI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build watermark instruction if provided
    let watermarkInstruction = '';
    if (watermark && watermark.type !== 'none') {
      if (watermark.type === 'text' && watermark.text) {
        watermarkInstruction = ` Add a subtle watermark text "${watermark.text}" in the top-right corner of the image. Make it semi-transparent (about 30% opacity) and use a professional font.`;
      } else if (watermark.type === 'logo' && watermark.logoUrl) {
        watermarkInstruction = ` Add a small watermark logo in the top-right corner of the image. Make it semi-transparent (about 30% opacity). Logo reference: ${watermark.logoUrl}`;
      }
    } else {
      // If no watermark is requested, explicitly remove any existing text/logos
      watermarkInstruction = ' Remove any existing watermarks, text overlays, logos, or branding from the image. Ensure the final image is clean without any text or logo elements.';
    }

    // Determine if we need to add model reference image
    const imageUrls = [finalImageUrl];
    const enhancementObj = typeof enhancement === 'string' ? null : enhancement;
    // Get title from either string or object
    const titleLower = typeof enhancement === 'string' 
      ? enhancement.toLowerCase() 
      : (enhancement?.title?.toLowerCase() || '');
    
    // Check if this is a wearable/clothing enhancement that needs a model
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
    
    let modelType = '';
    // Add model reference image if using model enhancement
    if (needsModel) {
      // Determine which model to use based on gender/type
      if (titleLower.includes('hijab') || titleLower.includes('berhijab')) {
        imageUrls.push('https://dcfnvebphjuwtlfuudcd.supabase.co/storage/v1/object/public/model-assets/model_female_hijab.png');
        modelType = 'female with hijab';
        console.log('Adding female hijab model reference');
      } else if (titleLower.includes('wanita') || titleLower.includes('female') || titleLower.includes('woman')) {
        imageUrls.push('https://dcfnvebphjuwtlfuudcd.supabase.co/storage/v1/object/public/model-assets/model_female.png');
        modelType = 'female';
        console.log('Adding female model reference');
      } else if (titleLower.includes('pria') || titleLower.includes('male') || titleLower.includes('man')) {
        imageUrls.push('https://dcfnvebphjuwtlfuudcd.supabase.co/storage/v1/object/public/model-assets/model_male.png');
        modelType = 'male';
        console.log('Adding male model reference');
      } else {
        // Default to female model for accessories and unspecified items
        imageUrls.push('https://dcfnvebphjuwtlfuudcd.supabase.co/storage/v1/object/public/model-assets/model_female.png');
        modelType = 'female';
        console.log('Adding default female model reference');
      }
    }

    // Build final prompt with context about multiple images
    let generatedPrompt = enhancementPrompt;
    if (needsModel && imageUrls.length === 2) {
      // Use clear format that explicitly references file 1 and file 2
      // File 1 = Product, File 2 = Model (this is the correct order)
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
      
      // Enhanced prompt with explicit file references and better instructions
      generatedPrompt = `Make the ${productType} from file 1 worn by the model from file 2. The model should use a natural professional pose like a fashion model to showcase the ${productType}. Keep the exact face, body, and appearance of the model from file 2. Preserve any text, logos, or branding that exists on the ${productType} from file 1 - do not remove or alter them. Use professional e-commerce photography style with clean background and studio lighting. The ${productType} should fit naturally on the model's body.`;
      
      console.log('Using 2 images: Product (file 1) + Model (file 2)');
    }
    generatedPrompt += watermarkInstruction;
    
    console.log('=== Image Generation Request ===');
    console.log('Total images:', imageUrls.length, needsModel ? '(Product + Model)' : '(Product only)');
    console.log('Image URLs:');
    imageUrls.forEach((url, index) => {
      console.log(`  [${index}]: ${url.substring(0, 80)}...`);
    });
    console.log('Generated prompt:', generatedPrompt);
    console.log('================================');

    // Prepare request payload
    const requestPayload = {
      model: 'google/nano-banana-edit',
      input: {
        prompt: generatedPrompt,
        image_urls: imageUrls,
        output_format: 'png',
        image_size: '1:1'
      }
    };

    console.log('Request payload:', JSON.stringify(requestPayload, null, 2));

    // DEBUG MODE: Skip API call and return payload for testing
    if (debugMode === true) {
      console.log('🔍 DEBUG MODE: Skipping API call to save credits');
      return new Response(
        JSON.stringify({ 
          debugMode: true,
          message: 'Debug mode - API call skipped',
          payload: requestPayload,
          imageUrls: imageUrls,
          prompt: generatedPrompt,
          modelType: modelType || 'none',
          needsModel: needsModel
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use KIE AI for image generation with correct API endpoint
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
      console.error('Image generation API error:', imageGenResponse.status, errorText);
      
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
    console.log('Image generation response received:', imageGenData);

    // KIE AI returns a taskId that we need to poll
    const taskId = imageGenData.data?.taskId;
    
    if (!taskId) {
      console.error('No task ID in response:', JSON.stringify(imageGenData));
      return new Response(
        JSON.stringify({ error: 'No task ID received from API', details: imageGenData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Task created successfully. Task ID:', taskId);
    console.log('Starting to poll for job completion...');

    // Poll for job completion (max 2 minutes for complex generations)
    let generatedImageUrl = null;
    const maxAttempts = 60; // 60 attempts
    const pollInterval = 2000; // 2 seconds = max 2 minutes total
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Wait before polling (don't poll immediately on first attempt)
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      try {
        const statusResponse = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, {
          headers: {
            'Authorization': `Bearer ${KIE_AI_API_KEY}`,
          },
        });
        
        if (!statusResponse.ok) {
          console.error(`Poll attempt ${attempt + 1} failed with status:`, statusResponse.status);
          continue; // Try again
        }
        
        const statusData = await statusResponse.json();
        
        // Check if response has expected structure
        if (statusData.code !== 200 || !statusData.data) {
          console.error(`Poll attempt ${attempt + 1} - unexpected response:`, statusData);
          continue;
        }
        
        const taskData = statusData.data;
        console.log(`Poll attempt ${attempt + 1}/${maxAttempts} - Task state: ${taskData.state}`);
        
        // Check for success
        if (taskData.state === 'success') {
          if (taskData.resultJson) {
            try {
              const resultJson = JSON.parse(taskData.resultJson);
              if (resultJson.resultUrls && resultJson.resultUrls.length > 0) {
                generatedImageUrl = resultJson.resultUrls[0];
                console.log('Image generation completed successfully!');
                break;
              } else {
                console.error('Success but no resultUrls found:', resultJson);
              }
            } catch (parseError) {
              console.error('Failed to parse resultJson:', parseError);
            }
          } else {
            console.error('Success but no resultJson in response');
          }
        } 
        // Check for failure
        else if (taskData.state === 'fail') {
          console.error('Job failed:', taskData);
          return new Response(
            JSON.stringify({ 
              error: 'Image generation failed', 
              details: taskData.failMsg || taskData.failCode || 'Unknown error',
              taskId: taskId
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        // Still processing
        else if (taskData.state === 'processing' || taskData.state === 'pending') {
          // Continue polling
          continue;
        }
        
      } catch (pollError) {
        console.error(`Poll attempt ${attempt + 1} error:`, pollError);
        // Continue trying
      }
    }
    
    if (!generatedImageUrl) {
      console.error('Job timed out or no image generated');
      return new Response(
        JSON.stringify({ error: 'Image generation timed out' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ IMAGE GENERATED SUCCESSFULLY - NOW DEDUCT TOKEN
    if (userId) {
      try {
        const { data: deductResult, error: deductError } = await supabase.rpc('deduct_user_tokens', {
          p_user_id: userId,
          p_amount: 1
        });

        if (deductError) {
          console.error('❌ Error deducting tokens:', deductError);
          // Log error but continue (user got the image, we'll fix token manually if needed)
        } else if (deductResult && deductResult.length > 0) {
          const result = deductResult[0];
          if (result.success) {
            console.log('✅ Token deducted successfully:', {
              subscription_used: result.subscription_used,
              purchased_used: result.purchased_used,
              remaining_subscription: result.remaining_subscription,
              remaining_purchased: result.remaining_purchased,
              total_remaining: result.remaining_subscription + result.remaining_purchased
            });
          } else {
            console.error('❌ Failed to deduct tokens:', result.message);
          }
        }
      } catch (deductError) {
        console.error('❌ Exception deducting tokens:', deductError);
      }
    }

    // Save the generated image to Supabase storage
    let savedImageUrl = generatedImageUrl;
    
    if (userId) {
      // Save the image to storage
      try {
        // Convert base64 to blob if needed
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
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('generated-images')
          .upload(fileName, imageBlob, {
            contentType: 'image/png',
            upsert: false
          });

        if (uploadError) {
          console.error('Error uploading generated image:', uploadError);
        } else {
          // Create signed URL for the generated image
          const { data: signedUrlData } = await supabase.storage
            .from('generated-images')
            .createSignedUrl(fileName, 60 * 60 * 24 * 7); // 7 days

          if (signedUrlData?.signedUrl) {
            savedImageUrl = signedUrlData.signedUrl;
          }

          // Save to generation history with email
          const { error: historyError } = await supabase
            .from('generation_history')
            .insert({
              user_id: userId,
              user_email: userEmail,
              original_image_path: storagePath || 'unknown',
              generated_image_path: fileName,
              enhancement_type: enhancementTitles.join(', '),
              classification_result: classification || 'unknown',
              prompt_used: generatedPrompt
            });

          if (historyError) {
            console.error('Error saving to history:', historyError);
          }
        }
      } catch (saveError) {
        console.error('Error saving generated image:', saveError);
        // Continue with the base64 URL if saving fails
      }
    }

    return new Response(
      JSON.stringify({ 
        generatedImageUrl: savedImageUrl,
        prompt: generatedPrompt 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in generate-enhanced-image function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

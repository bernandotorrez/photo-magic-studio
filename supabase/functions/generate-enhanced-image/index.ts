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
    const { imageUrl, originalImagePath, imagePath, enhancement, classification, watermark, customPose, customFurniture, debugMode } = await req.json();
    
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
    
    if (!enhancement) {
      return new Response(
        JSON.stringify({ error: 'enhancement is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Check user's remaining generations (by email to prevent bypass)
    if (userId && userEmail) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('monthly_generate_limit')
        .eq('user_id', userId)
        .maybeSingle();

      const limit = profileData?.monthly_generate_limit || 5; // Free tier default: 5 generations per month
      
      // Count generations by email in current month
      const { data: canGenerate, error: checkError } = await supabase
        .rpc('can_user_generate', { 
          p_email: userEmail,
          p_user_id: userId 
        });

      if (checkError) {
        console.error('Error checking generation limit:', checkError);
      } else if (canGenerate === false) {
        // Get actual count for error message
        const { data: currentCount } = await supabase
          .rpc('get_generation_count_by_email', { p_email: userEmail });
        
        return new Response(
          JSON.stringify({ 
            error: 'Kuota generate bulanan Anda sudah habis',
            current: currentCount || 0,
            limit: limit
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

    // Handle enhancement as string or object
    const enhancementTitle = typeof enhancement === 'string' ? enhancement : enhancement.title;
    console.log('Generating enhanced image for:', enhancementTitle);

    // Build enhancement prompt - always use buildEnhancementPrompt for consistency
    let enhancementPrompt;
    if (typeof enhancement === 'string') {
      // Convert string to object format for buildEnhancementPrompt
      enhancementPrompt = buildEnhancementPrompt({ 
        id: 'custom', 
        title: enhancement, 
        description: enhancement 
      }, customPose, customFurniture);
    } else {
      enhancementPrompt = buildEnhancementPrompt(enhancement, customPose, customFurniture);
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

    // Save the generated image to Supabase storage
    let savedImageUrl = generatedImageUrl;
    
    if (userId) {
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
              enhancement_type: enhancementTitle,
              classification_result: classification || 'unknown',
              prompt_used: generatedPrompt
            });

          if (historyError) {
            console.error('Error saving to history:', historyError);
          }

          // Update user's generation count (this will count by email)
          const { error: updateError } = await supabase.rpc('increment_generation_count', {
            p_user_id: userId
          });

          if (updateError) {
            console.error('Error updating generation count:', updateError);
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

function buildEnhancementPrompt(enhancement: { id: string; title: string; description: string }, customPose?: string, customFurniture?: string): string {
  // Model assets URLs from Supabase storage
  const modelAssets = {
    male: 'https://dcfnvebphjuwtlfuudcd.supabase.co/storage/v1/object/public/model-assets/model_male.png',
    female: 'https://dcfnvebphjuwtlfuudcd.supabase.co/storage/v1/object/public/model-assets/model_female.png',
    female_hijab: 'https://dcfnvebphjuwtlfuudcd.supabase.co/storage/v1/object/public/model-assets/model_female_hijab.png',
  };

  const basePrompts: Record<string, string> = {
    'add_male_model': `turn this product into a professional e-commerce photo with a male model wearing/using it. The model should be in a natural pose. Studio lighting with a clean white or gradient background. Professional product photography style.`,
    'add_female_model': `turn this product into a professional e-commerce photo with a female model wearing/using it. The model should be in a natural pose. Soft studio lighting with a minimalist background. Professional product photography style.`,
    'add_female_hijab_model': `turn this product into a professional e-commerce photo with a female model wearing hijab using/wearing it. The model should be in a natural pose. Soft studio lighting with a minimalist background. Professional product photography style.`,
    'add_mannequin': 'Display the clothing on a professional mannequin/dress form. Clean product photography style with even lighting and a pure white background. Focus on showing the garment structure and details.',
    'enhance_background': 'Enhance the background to a professional e-commerce standard. Use a clean gradient or contextual lifestyle background that complements the product. Maintain focus on the product while adding visual interest.',
    'improve_lighting': 'Apply professional product photography lighting. Add soft fill lights to eliminate shadows, enhance product details, and create a polished commercial look.',
    'remove_background': 'Remove the background completely and replace with pure white (#FFFFFF). Ensure clean edges around the product with no artifacts.',
  };

  // Check for Indonesian titles - support for all wearable items
  const titleLower = enhancement.title.toLowerCase();
  
  // Female with Hijab model
  if (titleLower.includes('female with hijab') || titleLower.includes('hijab')) {
    return basePrompts['add_female_hijab_model'];
  }
  
  // Female model
  if (titleLower.includes('female') || titleLower.includes('wanita')) {
    return basePrompts['add_female_model'];
  }
  
  // Male model
  if (titleLower.includes('male') || titleLower.includes('pria')) {
    return basePrompts['add_male_model'];
  }
  
  // Mannequin
  if (titleLower.includes('manekin') || titleLower.includes('mannequin')) {
    return basePrompts['add_mannequin'];
  }
  
  // Specific wearable item enhancements
  if (titleLower.includes('digunakan oleh model manusia')) {
    // Determine which model based on gender in title
    if (titleLower.includes('female with hijab') || titleLower.includes('hijab')) {
      return basePrompts['add_female_hijab_model'];
    } else if (titleLower.includes('female') || titleLower.includes('wanita')) {
      return basePrompts['add_female_model'];
    } else if (titleLower.includes('male') || titleLower.includes('pria')) {
      return basePrompts['add_male_model'];
    }
  }
  
  // Shoes - on feet
  if (titleLower.includes('on-feet') || titleLower.includes('saat dipakai')) {
    return `turn this into a professional product photo showing the shoes being worn on feet. Show the shoes in use with a natural standing pose. Studio lighting with clean background. Professional e-commerce photography style.`;
  }
  
  // Accessories - worn on body
  if (titleLower.includes('dipakai di bagian tubuh') || 
      titleLower.includes('leher') || 
      titleLower.includes('tangan') || 
      titleLower.includes('pergelangan')) {
    // Determine item type and model
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
  
  // Lifestyle shot with human model
  if (titleLower.includes('lifestyle')) {
    return `turn this into a lifestyle product photo showing the product being used/worn in a natural, everyday setting. The model should look relaxed and natural. Soft natural lighting with a lifestyle background (e.g., cafe, outdoor, home setting). Professional lifestyle photography style.`;
  }

  /* ============================
     AI PHOTOGRAPHER (PERSON)
     ============================ */
  
  // Virtual Outfit Change
  if (titleLower.includes('virtual outfit') || titleLower.includes('ganti baju')) {
    return `Change the person's outfit to a stylish, modern clothing. Keep the person's face, pose, and background exactly the same. Only change the clothing to something fashionable and appropriate. Professional portrait photography style.`;
  }
  
  // Pose Variation
  if (titleLower.includes('ubah pose') || titleLower.includes('pose variation')) {
    const poseInstruction = customPose 
      ? `Change the person's pose to: ${customPose}. Keep the person's face and clothing the same. The pose should be natural and suitable for professional photography. Studio lighting.`
      : `Change the person's pose to a more dynamic and professional pose. Keep the person's face and clothing the same. The new pose should be natural and suitable for professional photography. Studio lighting.`;
    return poseInstruction;
  }
  
  // Background Change
  if (titleLower.includes('ganti background') && titleLower.includes('🌆')) {
    return `Change the background to a professional, aesthetic background. Keep the person exactly the same. Use a clean, modern background that complements the subject. Professional portrait photography.`;
  }
  
  // Professional Portrait Enhancement
  if (titleLower.includes('professional portrait enhancement')) {
    return `Enhance this portrait to professional photography standards. Improve lighting, color grading, and overall quality. Make it suitable for professional use (LinkedIn, resume, business card). Studio portrait style.`;
  }
  
  // Beauty Enhancement
  if (titleLower.includes('beauty enhancement') || titleLower.includes('smooth skin')) {
    return `Apply professional beauty retouching. Smooth skin naturally, enhance features subtly, improve skin tone. Keep it natural-looking, not over-processed. Professional beauty photography style.`;
  }
  
  // Expression Change
  if (titleLower.includes('ubah ekspresi') || titleLower.includes('ekspresi wajah')) {
    return `Change the person's facial expression to a warm, friendly smile. Keep everything else the same. The expression should look natural and genuine. Professional portrait photography.`;
  }
  
  // Business Portrait
  if (titleLower.includes('business portrait')) {
    return `Transform this into a professional business portrait. Professional attire, clean background, confident pose, studio lighting. Suitable for LinkedIn, corporate website, or business card.`;
  }
  
  // Fashion Editorial
  if (titleLower.includes('fashion editorial')) {
    return `Transform this into a high-fashion editorial style photo. Dramatic lighting, artistic composition, fashion-forward styling. Magazine-quality fashion photography.`;
  }
  
  // Cinematic Look
  if (titleLower.includes('cinematic')) {
    return `Apply cinematic color grading and lighting. Create a movie-like atmosphere with dramatic lighting and professional color correction. Film photography aesthetic.`;
  }
  
  // Studio Portrait with Professional Lighting
  if (titleLower.includes('studio portrait') && titleLower.includes('lighting profesional')) {
    return `Transform this into a professional studio portrait with perfect lighting. Use three-point lighting setup, clean background, professional color grading. High-end portrait photography.`;
  }

  /* ============================
     INTERIOR DESIGN
     ============================ */
  
  // Virtual Staging
  if (titleLower.includes('virtual staging') || titleLower.includes('tambah furniture')) {
    const furnitureInstruction = customFurniture
      ? `Add the following furniture and decor items to this room: ${customFurniture}. Create a fully staged, inviting interior space. Use modern, stylish furniture that fits the room's proportions. Professional interior design staging.`
      : `Add professional furniture and decor to this empty room. Create a fully staged, inviting interior space. Use modern, stylish furniture that fits the room's proportions. Professional interior design staging.`;
    return furnitureInstruction;
  }
  
  // Style Transformation
  if (titleLower.includes('style transformation')) {
    if (titleLower.includes('modern')) {
      return `Transform this interior into a modern style. Clean lines, minimalist furniture, neutral colors with accent pieces. Contemporary interior design.`;
    } else if (titleLower.includes('minimalist')) {
      return `Transform this interior into a minimalist style. Simple, functional furniture, neutral color palette, uncluttered space. Scandinavian-inspired minimalism.`;
    } else if (titleLower.includes('classic')) {
      return `Transform this interior into a classic/traditional style. Elegant furniture, rich colors, ornate details. Timeless classic interior design.`;
    }
    return `Transform this interior with a cohesive design style. Professional interior design with matching furniture, colors, and decor.`;
  }
  
  // Color Scheme Change
  if (titleLower.includes('ubah color scheme') || titleLower.includes('🌈')) {
    return `Change the color scheme of this interior. Apply a harmonious, professional color palette. Update walls, furniture, and decor colors while maintaining the room's structure. Professional interior design color coordination.`;
  }
  
  // Lighting Enhancement
  if (titleLower.includes('lighting enhancement') && titleLower.includes('💡')) {
    return `Enhance the lighting in this interior. Add natural light, improve artificial lighting, create a warm and inviting atmosphere. Professional interior lighting design.`;
  }
  
  // Wallpaper/Paint Change
  if (titleLower.includes('wallpaper') || titleLower.includes('cat dinding')) {
    return `Change the wall treatment in this interior. Apply new wallpaper or paint color that enhances the space. Professional interior wall design.`;
  }
  
  // Add Decoration & Artwork
  if (titleLower.includes('dekorasi') || titleLower.includes('artwork')) {
    return `Add tasteful decorations and artwork to this interior. Include wall art, decorative objects, and accessories that enhance the space. Professional interior styling.`;
  }
  
  // Add Plants
  if (titleLower.includes('tanaman hias') || titleLower.includes('🌿')) {
    return `Add indoor plants and greenery to this interior. Place plants strategically to enhance the space and create a fresh, natural atmosphere. Professional interior plant styling.`;
  }
  
  // Luxury Upgrade
  if (titleLower.includes('luxury') && titleLower.includes('interior')) {
    return `Transform this interior into a luxury space. High-end furniture, premium materials, elegant decor, sophisticated color palette. Luxury interior design.`;
  }
  
  // Scandinavian Style
  if (titleLower.includes('scandinavian')) {
    return `Transform this interior into Scandinavian style. Light wood, white walls, minimalist furniture, cozy textiles, natural light. Nordic interior design.`;
  }
  
  // Industrial Style
  if (titleLower.includes('industrial')) {
    return `Transform this interior into industrial style. Exposed brick, metal elements, concrete, vintage furniture, Edison bulbs. Urban industrial design.`;
  }
  
  // Bohemian Style
  if (titleLower.includes('bohemian')) {
    return `Transform this interior into bohemian style. Colorful textiles, eclectic furniture, plants, artistic decor, layered textures. Boho interior design.`;
  }

  /* ============================
     EXTERIOR / ARCHITECTURE
     ============================ */
  
  // Facade Renovation
  if (titleLower.includes('facade renovation') || titleLower.includes('tampilan depan')) {
    return `Renovate the facade of this building. Modernize the exterior appearance with updated materials, colors, and architectural details. Professional architectural renovation.`;
  }
  
  // Landscaping Enhancement
  if (titleLower.includes('landscaping') || titleLower.includes('taman')) {
    return `Add professional landscaping to this property. Include lawn, trees, shrubs, flowers, and garden design. Create an attractive, well-maintained landscape. Professional landscape architecture.`;
  }
  
  // Time of Day Change
  if (titleLower.includes('ubah waktu')) {
    if (titleLower.includes('night')) {
      return `Transform this exterior to nighttime. Add outdoor lighting, illuminated windows, evening atmosphere. Professional architectural night photography.`;
    } else if (titleLower.includes('golden hour')) {
      return `Transform this exterior to golden hour lighting. Warm, soft sunlight, long shadows, beautiful sky. Professional architectural photography at sunset.`;
    }
    return `Change the time of day for this exterior photo. Adjust lighting and atmosphere accordingly. Professional architectural photography.`;
  }
  
  // Weather Change
  if (titleLower.includes('ubah cuaca')) {
    if (titleLower.includes('sunny')) {
      return `Change the weather to sunny. Clear blue sky, bright sunlight, vibrant colors. Beautiful weather for architectural photography.`;
    } else if (titleLower.includes('cloudy')) {
      return `Change the weather to partly cloudy. Soft, diffused light, interesting cloud formations. Professional architectural photography.`;
    }
    return `Improve the weather conditions in this exterior photo. Create ideal conditions for architectural photography.`;
  }
  
  // Exterior Paint Color
  if (titleLower.includes('warna cat eksterior')) {
    return `Change the exterior paint color of this building. Apply a fresh, attractive color scheme that enhances the architecture. Professional exterior color design.`;
  }
  
  // Windows & Doors Upgrade
  if (titleLower.includes('jendela') || titleLower.includes('pintu')) {
    return `Upgrade the windows and doors of this building. Install modern, attractive windows and doors that enhance the facade. Professional architectural upgrade.`;
  }
  
  // Outdoor Lighting
  if (titleLower.includes('outdoor lighting')) {
    return `Add professional outdoor lighting to this property. Include pathway lights, accent lighting, security lights. Create an attractive nighttime appearance. Professional landscape lighting design.`;
  }
  
  // Pool/Water Feature
  if (titleLower.includes('pool') || titleLower.includes('water feature')) {
    return `Add a swimming pool or water feature to this property. Design it to complement the architecture and landscape. Professional pool and water feature design.`;
  }
  
  // Driveway & Parking
  if (titleLower.includes('driveway') || titleLower.includes('parking')) {
    return `Add or improve the driveway and parking area. Professional paving, landscaping borders, attractive design. Professional hardscape design.`;
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
  
  // Highlight Sparkle & Shine
  if (titleLower.includes('sparkle') || titleLower.includes('shine')) {
    return `Enhance the sparkle and shine of this jewelry. Highlight gemstones, metal reflections, and brilliant details. Professional jewelry photography with perfect lighting to showcase brilliance.`;
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
  
  // Highlight Ingredients & Benefits
  if (titleLower.includes('ingredients') || titleLower.includes('benefits')) {
    return `Create a professional beauty product photo that highlights ingredients and benefits. Show the product with natural ingredients or visual representations of benefits. Clean, informative product photography.`;
  }

  /* ============================
     ELECTRONICS & GADGETS
     ============================ */
  
  // Electronics used by model
  if (titleLower.includes('📱') && titleLower.includes('digunakan')) {
    return `turn this into a professional tech product photo showing the device being used by a model. The model should look natural and engaged with the device. Modern lifestyle setting. Professional tech product photography style.`;
  }
  
  // Highlight Tech Features
  if (titleLower.includes('tech features') || titleLower.includes('✨')) {
    return `Create a professional tech product photo that highlights key features and specifications. Use clean, modern styling with focus on design and functionality. Professional technology product photography.`;
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
  
  // Highlight Quality & Comfort
  if (titleLower.includes('quality') || titleLower.includes('comfort')) {
    return `Create a professional home product photo that highlights quality and comfort. Show texture, craftsmanship, and comfort features. Inviting, high-quality product photography.`;
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
  
  // Highlight Performance Features
  if (titleLower.includes('performance features')) {
    return `Create a professional sports product photo that highlights performance features and technology. Show innovation, quality, and athletic benefits. Professional sports equipment photography.`;
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
  
  // Highlight Safety Features
  if (titleLower.includes('safety features')) {
    return `Create a professional kids product photo that highlights safety features and quality. Show certifications, safe materials, and child-friendly design. Trustworthy, professional product photography.`;
  }
  
  // Garden & Flowers
  if (titleLower.includes('garden') || titleLower.includes('flowers')) {
    return `Add beautiful gardens and flower beds to this property. Colorful flowers, well-designed garden beds, professional landscaping. Professional garden design.`;
  }
  
  // Modern Architecture
  if (titleLower.includes('modern architecture')) {
    return `Transform this building into modern architectural style. Clean lines, contemporary materials, minimalist design. Modern architecture.`;
  }
  
  // Classic Architecture
  if (titleLower.includes('classic architecture')) {
    return `Transform this building into classic architectural style. Traditional details, elegant proportions, timeless design. Classic architecture.`;
  }

  /* ============================
     PRODUCT ENHANCEMENTS
     ============================ */
  
  // 360° View
  if (titleLower.includes('360') || titleLower.includes('view')) {
    return `Generate additional angles of this product to create a 360° view. Show the product from different perspectives (front, side, back, top). Professional product photography from multiple angles.`;
  }
  
  // Color Variants
  if (titleLower.includes('varian warna') || titleLower.includes('color variant')) {
    return `Create color variants of this product. Generate the same product in different colors (black, white, red, blue, etc.). Keep the product design identical, only change the color. Professional product photography.`;
  }
  
  // Material/Texture Change
  if (titleLower.includes('material') || titleLower.includes('tekstur')) {
    return `Change the material or texture of this product. Transform it to different materials (leather, fabric, metal, wood, etc.) while keeping the same design. Professional product visualization.`;
  }
  
  // Size Comparison
  if (titleLower.includes('size comparison')) {
    return `Create a size comparison visualization for this product. Show the product next to common reference objects or with measurements indicated. Help customers understand the product's actual size. Professional product photography with scale reference.`;
  }

  return basePrompts[enhancement.id] || `${enhancement.title}: ${enhancement.description}. Apply this enhancement professionally for e-commerce product photography.`;
}

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

    console.log('Classifying fashion/product image:', imageUrl);

    // Default category
    let category = 'fashion'; // Default to fashion
    let detectedLabel = 'default';
    let classificationSuccess = false;
    
    // Try to classify with Hugging Face to detect specific product type
    try {
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch image');
      }
      
      const imageBlob = await imageResponse.blob();
      const imageBuffer = await imageBlob.arrayBuffer();

      console.log('Image fetched, size:', imageBuffer.byteLength, 'bytes');

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
          
          // Define fashion keywords in arrays for easy maintenance
          const fashionKeywords = {
            clothing: [
              // Pakaian Atas (Upper Body)
              'shirt', 'blouse', 'tshirt', 't-shirt', 'polo', 'tank', 'top', 'tunic', 'halter',
              // Pakaian Luar (Outerwear)
              'jacket', 'coat', 'blazer', 'cardigan', 'hoodie', 'sweater', 'pullover', 'vest', 
              'waistcoat', 'poncho', 'cape', 'shawl', 'parka', 'trench', 'windbreaker', 'bomber',
              'denim jacket', 'leather jacket',
              // Pakaian Bawah (Lower Body)
              'pants', 'trousers', 'jean', 'shorts', 'skirt', 'legging', 'jogger', 'cargo', 
              'chino', 'culottes', 'palazzo', 'capri',
              // Pakaian Lengkap (Full Body)
              'dress', 'gown', 'jumpsuit', 'romper', 'overall', 'coverall', 'suit', 'tuxedo', 'uniform',
              // Pakaian Tradisional & Khusus
              'kimono', 'kaftan', 'sarong', 'sari', 'abaya', 'thobe', 'hanbok', 'cheongsam', 'qipao',
              // Pakaian Olahraga & Santai
              'tracksuit', 'sportswear', 'activewear', 'swimsuit', 'bikini', 'swimwear', 'rash guard', 'wetsuit',
              // Pakaian Dalam & Tidur
              'lingerie', 'underwear', 'bra', 'pajama', 'nightgown', 'robe', 'sleepwear'
            ],
            footwear: [
              'shoe', 'boot', 'sneaker', 'sandal', 'heel', 'slipper', 'loafer', 'oxford', 'moccasin',
              'pump', 'stiletto', 'wedge', 'platform', 'ankle boot', 'knee boot', 'chelsea', 
              'combat boot', 'hiking boot', 'running shoe', 'basketball shoe', 'cleat', 
              'flip flop', 'espadrille', 'ballet flat', 'derby', 'brogue', 'monk strap'
            ],
            bags: [
              'bag', 'purse', 'backpack', 'wallet', 'handbag', 'clutch', 'tote', 'satchel', 
              'briefcase', 'messenger', 'crossbody', 'shoulder bag', 'duffel', 'luggage', 
              'suitcase', 'pouch', 'cosmetic bag', 'fanny pack', 'belt bag', 'bucket bag'
            ]
          };
          
          // Check if label matches any fashion category
          let isFashion = false;
          for (const categoryType in fashionKeywords) {
            const keywords = fashionKeywords[categoryType as keyof typeof fashionKeywords];
            for (const keyword of keywords) {
              if (topLabel.includes(keyword)) {
                isFashion = true;
                break;
              }
            }
            if (isFashion) break;
          }
          
          // Set category
          category = isFashion ? 'fashion' : 'fashion'; // Default to fashion for all products
          
          console.log('Mapped to category:', category);
        }
      } else {
        const errorText = await response.text();
        console.log('Hugging Face API error:', errorText);
      }
    } catch (apiError) {
      console.log('Classification error, using default category:', apiError);
    }

    console.log('Final category:', category, '| Classification success:', classificationSuccess, '| Detected label:', detectedLabel);

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
    console.error('Error in classify-fashion:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unexpected error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

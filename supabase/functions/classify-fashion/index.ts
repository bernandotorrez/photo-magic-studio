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
          
          // Map to specific fashion sub-categories for better enhancement selection
          // But we'll still use 'fashion' as the main category code
          if (topLabel.includes('shirt') || topLabel.includes('dress') || topLabel.includes('jacket') || 
              topLabel.includes('coat') || topLabel.includes('sweater') || topLabel.includes('jean') ||
              topLabel.includes('pants') || topLabel.includes('skirt') || topLabel.includes('blouse') ||
              topLabel.includes('hoodie') || topLabel.includes('cardigan') || topLabel.includes('suit') ||
              topLabel.includes('vest') || topLabel.includes('polo') || topLabel.includes('tshirt') ||
              topLabel.includes('shorts') || topLabel.includes('legging') || topLabel.includes('swimsuit')) {
            category = 'fashion';
          } else if (topLabel.includes('shoe') || topLabel.includes('boot') || topLabel.includes('sneaker') ||
                     topLabel.includes('sandal') || topLabel.includes('heel') || topLabel.includes('slipper') ||
                     topLabel.includes('loafer') || topLabel.includes('oxford') || topLabel.includes('moccasin')) {
            category = 'fashion';
          } else if (topLabel.includes('bag') || topLabel.includes('purse') || topLabel.includes('backpack') ||
                     topLabel.includes('wallet') || topLabel.includes('handbag') || topLabel.includes('clutch') ||
                     topLabel.includes('tote') || topLabel.includes('satchel') || topLabel.includes('briefcase')) {
            category = 'fashion';
          } else {
            category = 'fashion'; // Default to fashion for all products
          }
          
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

    console.log('Classifying fashion/product image:', imageUrl);

    // Default category
    let category = 'clothing';
    let detectedLabel = 'default';
    let classificationSuccess = false;
    
    // Try to classify with Hugging Face
    try {
      // Fetch the image first
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch image');
      }
      
      const imageBlob = await imageResponse.blob();
      const imageBuffer = await imageBlob.arrayBuffer();

      console.log('Image fetched, size:', imageBuffer.byteLength, 'bytes');

      // Use Hugging Face Inference API
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
        
        // Map Hugging Face labels to fashion categories
        if (Array.isArray(data) && data.length > 0) {
          const topLabel = data[0].label.toLowerCase();
          detectedLabel = topLabel;
          classificationSuccess = true;
          
          console.log('Top label detected:', topLabel);
          
          // Detailed fashion & product category mapping
          if (topLabel.includes('shirt') || topLabel.includes('dress') || topLabel.includes('jacket') || 
              topLabel.includes('coat') || topLabel.includes('sweater') || topLabel.includes('jean') ||
              topLabel.includes('pants') || topLabel.includes('skirt') || topLabel.includes('blouse') ||
              topLabel.includes('hoodie') || topLabel.includes('cardigan') || topLabel.includes('suit') ||
              topLabel.includes('vest') || topLabel.includes('polo') || topLabel.includes('tshirt') ||
              topLabel.includes('shorts') || topLabel.includes('legging') || topLabel.includes('swimsuit')) {
            category = 'clothing';
          } else if (topLabel.includes('shoe') || topLabel.includes('boot') || topLabel.includes('sneaker') ||
                     topLabel.includes('sandal') || topLabel.includes('heel') || topLabel.includes('slipper') ||
                     topLabel.includes('loafer') || topLabel.includes('oxford') || topLabel.includes('moccasin')) {
            category = 'shoes';
          } else if (topLabel.includes('bag') || topLabel.includes('purse') || topLabel.includes('backpack') ||
                     topLabel.includes('wallet') || topLabel.includes('handbag') || topLabel.includes('clutch') ||
                     topLabel.includes('tote') || topLabel.includes('satchel') || topLabel.includes('briefcase') ||
                     topLabel.includes('luggage') || topLabel.includes('suitcase')) {
            category = 'bags';
          } else if (topLabel.includes('watch') || topLabel.includes('bracelet') || topLabel.includes('necklace') ||
                     topLabel.includes('ring') || topLabel.includes('earring') || topLabel.includes('jewelry') ||
                     topLabel.includes('pendant') || topLabel.includes('chain') || topLabel.includes('brooch') ||
                     topLabel.includes('anklet') || topLabel.includes('cufflink')) {
            category = 'jewelry';
          } else if (topLabel.includes('hat') || topLabel.includes('cap') || topLabel.includes('beanie') ||
                     topLabel.includes('helmet') || topLabel.includes('beret') || topLabel.includes('fedora') ||
                     topLabel.includes('visor') || topLabel.includes('turban')) {
            category = 'headwear';
          } else if (topLabel.includes('sunglasses') || topLabel.includes('glasses') || topLabel.includes('eyewear') ||
                     topLabel.includes('spectacle') || topLabel.includes('goggles')) {
            category = 'eyewear';
          } else if (topLabel.includes('tie') || topLabel.includes('scarf') || topLabel.includes('belt') ||
                     topLabel.includes('glove') || topLabel.includes('sock') || topLabel.includes('stocking') ||
                     topLabel.includes('bandana') || topLabel.includes('bow tie') || topLabel.includes('suspender')) {
            category = 'accessories';
          } else if (topLabel.includes('perfume') || topLabel.includes('bottle') || topLabel.includes('cosmetic') ||
                     topLabel.includes('lotion') || topLabel.includes('cream') || topLabel.includes('lipstick') ||
                     topLabel.includes('makeup') || topLabel.includes('fragrance') || topLabel.includes('serum') ||
                     topLabel.includes('moisturizer') || topLabel.includes('foundation') || topLabel.includes('powder') ||
                     topLabel.includes('mascara') || topLabel.includes('eyeliner') || topLabel.includes('blush')) {
            category = 'beauty';
          } else if (topLabel.includes('phone') || topLabel.includes('laptop') || topLabel.includes('tablet') ||
                     topLabel.includes('headphone') || topLabel.includes('earphone') || topLabel.includes('speaker') ||
                     topLabel.includes('camera') || topLabel.includes('keyboard') || topLabel.includes('mouse') ||
                     topLabel.includes('charger') || topLabel.includes('cable') || topLabel.includes('gadget') ||
                     topLabel.includes('smartwatch') || topLabel.includes('airpod')) {
            category = 'electronics';
          } else if (topLabel.includes('pillow') || topLabel.includes('cushion') || topLabel.includes('blanket') ||
                     topLabel.includes('towel') || topLabel.includes('rug') || topLabel.includes('mat') ||
                     topLabel.includes('curtain') || topLabel.includes('lamp') || topLabel.includes('vase') ||
                     topLabel.includes('candle') || topLabel.includes('frame') || topLabel.includes('clock') ||
                     topLabel.includes('mirror') || topLabel.includes('basket')) {
            category = 'home';
          } else if (topLabel.includes('dumbbell') || topLabel.includes('yoga') || topLabel.includes('fitness') ||
                     topLabel.includes('sport') || topLabel.includes('ball') || topLabel.includes('racket') ||
                     topLabel.includes('gym') || topLabel.includes('exercise') || topLabel.includes('athletic')) {
            category = 'sports';
          } else if (topLabel.includes('toy') || topLabel.includes('baby') || topLabel.includes('kid') ||
                     topLabel.includes('child') || topLabel.includes('stroller') || topLabel.includes('diaper') ||
                     topLabel.includes('bottle') || topLabel.includes('pacifier')) {
            category = 'kids';
          } else {
            // If not recognized, keep as clothing (default)
            category = 'clothing';
          }
          
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

    // Base enhancements for all fashion products
    const BASE_ENHANCEMENTS = [
      '✨ Tingkatkan Kualitas Gambar',
      '💡 Perbaiki Pencahayaan',
      '🎨 Hapus Background',
      '🌈 Sesuaikan Warna',
      '✂️ Crop & Center',
      '🌑 Tambah Bayangan',
      '🔍 Pertajam Detail',
      '⚖️ White Balance',
      '☀️ Sesuaikan Brightness',
      '📊 Tingkatkan Kontras',
    ];

    let enhancementOptions: string[] = [];

    // Category-specific enhancements with emojis
    switch (category) {
      case 'clothing':
        enhancementOptions = [
          '👗 Dipakai oleh Model Wanita',
          '🧕 Dipakai oleh Model Wanita Berhijab',
          '👔 Dipakai oleh Model Pria',
          '📸 Foto Lifestyle dengan Model',
          '🎭 Ditampilkan pada Manekin',
          '🔎 Foto Close-up Detail',
          '🎨 Buat Varian Warna',
          '✨ Ubah Material/Tekstur',
          '🔄 Generate 360° View',
          '📏 Tampilkan Size Comparison',
          ...BASE_ENHANCEMENTS,
        ];
        break;

      case 'shoes':
        enhancementOptions = [
          '👟 On-Feet Shot (Dipakai di Kaki)',
          '👗 Dipakai oleh Model Wanita',
          '👔 Dipakai oleh Model Pria',
          '📸 Foto Lifestyle dengan Model',
          '🔎 Detail Close-up (Tekstur & Material)',
          '🎨 Buat Varian Warna',
          '🔄 Generate 360° View',
          '📏 Tampilkan Size Comparison',
          '✨ Highlight Fitur Khusus',
          '🌟 Professional Product Shot',
          ...BASE_ENHANCEMENTS,
        ];
        break;

      case 'bags':
        enhancementOptions = [
          '👜 Dipakai oleh Model (Shoulder/Hand)',
          '👗 Dipakai oleh Model Wanita',
          '👔 Dipakai oleh Model Pria',
          '📸 Foto Lifestyle dengan Model',
          '🔎 Detail Close-up (Tekstur & Hardware)',
          '🎨 Buat Varian Warna',
          '🔄 Generate 360° View',
          '📏 Tampilkan Size Comparison',
          '✨ Highlight Kompartemen Interior',
          '🌟 Professional Product Shot',
          ...BASE_ENHANCEMENTS,
        ];
        break;

      case 'accessories':
        enhancementOptions = [
          '🧤 Dipakai oleh Model',
          '�  Dipakai oleh Model Wanita',
          '� Dippakai oleh Model Pria',
          '� Fioto Lifestyle dengan Model',
          '�  Detail Close-up (Material & Detail)',
          '🎨 Buat Varian Warna',
          '✨ Highlight Fitur Khusus',
          '�  Professional Product Shot',
          ...BASE_ENHANCEMENTS,
        ];
        break;

      case 'jewelry':
        enhancementOptions = [
          '💍 Dipakai di Jari/Tangan',
          '📿 Dipakai di Leher',
          '⌚ Dipakai di Pergelangan Tangan',
          '👂 Dipakai di Telinga',
          '👗 Dipakai oleh Model Wanita',
          '👔 Dipakai oleh Model Pria',
          '📸 Foto Lifestyle dengan Model',
          '🔎 Detail Close-up (Gemstone & Craftsmanship)',
          '💎 Luxury Jewelry Styling',
          '✨ Highlight Sparkle & Shine',
          '🎨 Buat Varian Material (Gold/Silver/Rose Gold)',
          '🌟 Professional Product Shot',
          ...BASE_ENHANCEMENTS,
        ];
        break;

      case 'headwear':
        enhancementOptions = [
          '🎩 Dipakai di Kepala Model',
          '👗 Dipakai oleh Model Wanita',
          '👔 Dipakai oleh Model Pria',
          '📸 Foto Lifestyle dengan Model',
          '🔎 Detail Close-up (Material & Logo)',
          '🎨 Buat Varian Warna',
          '🔄 Generate 360° View',
          '✨ Highlight Fitur Khusus',
          '🌟 Professional Product Shot',
          ...BASE_ENHANCEMENTS,
        ];
        break;

      case 'eyewear':
        enhancementOptions = [
          '👓 Dipakai di Wajah Model',
          '👗 Dipakai oleh Model Wanita',
          '👔 Dipakai oleh Model Pria',
          '📸 Foto Lifestyle dengan Model',
          '🔎 Detail Close-up (Frame & Lensa)',
          '🎨 Buat Varian Warna Frame',
          '✨ Highlight Material & Design',
          '🌟 Professional Product Shot',
          ...BASE_ENHANCEMENTS,
        ];
        break;

      case 'beauty':
        enhancementOptions = [
          '💄 Digunakan oleh Model (Makeup/Skincare)',
          '👗 Dipakai oleh Model Wanita',
          '👔 Dipakai oleh Model Pria',
          '📸 Foto Lifestyle dengan Model',
          '🔎 Detail Close-up (Tekstur & Packaging)',
          '✨ Highlight Ingredients & Benefits',
          '🎨 Buat Varian Warna/Shade',
          '🔄 Generate 360° View',
          '📏 Tampilkan Size Comparison',
          '🌟 Professional Product Shot',
          '💎 Luxury Product Styling',
          '🌸 Natural/Organic Aesthetic',
          ...BASE_ENHANCEMENTS,
        ];
        break;

      case 'electronics':
        enhancementOptions = [
          '📱 Digunakan oleh Model',
          '👗 Dipakai oleh Model Wanita',
          '👔 Dipakai oleh Model Pria',
          '📸 Foto Lifestyle dengan Model',
          '🔎 Detail Close-up (Features & Specs)',
          '✨ Highlight Tech Features',
          '🎨 Buat Varian Warna',
          '🔄 Generate 360° View',
          '📏 Tampilkan Size Comparison',
          '🌟 Professional Product Shot',
          '💻 Tech Product Styling',
          '⚡ Modern/Futuristic Look',
          ...BASE_ENHANCEMENTS,
        ];
        break;

      case 'home':
        enhancementOptions = [
          '🏠 Tampilkan dalam Setting Rumah',
          '📸 Foto Lifestyle dengan Model',
          '🔎 Detail Close-up (Tekstur & Material)',
          '✨ Highlight Quality & Comfort',
          '🎨 Buat Varian Warna/Pattern',
          '🔄 Generate 360° View',
          '📏 Tampilkan Size Comparison',
          '🌟 Professional Product Shot',
          '🛋️ Cozy Home Aesthetic',
          '🌿 Natural/Minimalist Style',
          ...BASE_ENHANCEMENTS,
        ];
        break;

      case 'sports':
        enhancementOptions = [
          '🏃 Digunakan saat Olahraga',
          '💪 Dipakai oleh Atlet/Model',
          '👗 Dipakai oleh Model Wanita',
          '👔 Dipakai oleh Model Pria',
          '📸 Foto Lifestyle dengan Model',
          '🔎 Detail Close-up (Material & Technology)',
          '✨ Highlight Performance Features',
          '🎨 Buat Varian Warna',
          '🔄 Generate 360° View',
          '🌟 Professional Product Shot',
          '⚡ Dynamic Action Shot',
          '🏋️ Gym/Fitness Setting',
          ...BASE_ENHANCEMENTS,
        ];
        break;

      case 'kids':
        enhancementOptions = [
          '👶 Digunakan oleh Anak/Baby',
          '👨‍👩‍👧 Foto dengan Orang Tua',
          '📸 Foto Lifestyle dengan Model',
          '🔎 Detail Close-up (Safety & Quality)',
          '✨ Highlight Safety Features',
          '🎨 Buat Varian Warna',
          '🔄 Generate 360° View',
          '📏 Tampilkan Size Comparison',
          '🌟 Professional Product Shot',
          '🎈 Fun & Playful Aesthetic',
          '🌈 Colorful & Cheerful Look',
          ...BASE_ENHANCEMENTS,
        ];
        break;

      default:
        // Generic product enhancements
        enhancementOptions = [
          '👗 Dipakai oleh Model Wanita',
          '🧕 Dipakai oleh Model Wanita Berhijab',
          '👔 Dipakai oleh Model Pria',
          '📸 Foto Lifestyle dengan Model',
          '🎭 Ditampilkan pada Manekin',
          '🔎 Foto Close-up Detail',
          '🎨 Buat Varian Warna',
          '✨ Ubah Material/Tekstur',
          '🔄 Generate 360° View',
          '📏 Tampilkan Size Comparison',
          ...BASE_ENHANCEMENTS,
        ];
    }

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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    console.log('Classifying image:', imageUrl);

    // Default category for e-commerce products
    let category = 'product';
    
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
          
          // Simple mapping based on common ImageNet labels
          if (topLabel.includes('shirt') || topLabel.includes('dress') || topLabel.includes('jacket') || 
              topLabel.includes('coat') || topLabel.includes('sweater') || topLabel.includes('jean')) {
            category = 'clothing';
          } else if (topLabel.includes('shoe') || topLabel.includes('boot') || topLabel.includes('sneaker')) {
            category = 'shoes';
          } else if (topLabel.includes('bag') || topLabel.includes('watch') || topLabel.includes('sunglasses') ||
                     topLabel.includes('hat') || topLabel.includes('tie')) {
            category = 'accessories';
          }
        }
      } else {
        const errorText = await response.text();
        console.log('Hugging Face API error:', errorText);
      }
    } catch (apiError) {
      console.log('Classification error, using default category:', apiError);
    }
    // Default enhancement options for all products
    const baseEnhancementOptions = [
      'Tingkatkan Kualitas Gambar',
      'Perbaiki Pencahayaan',
      'Hapus Background',
      'Sesuaikan Warna',
      'Crop & Center',
      'Tambah Bayangan',
      'Pertajam Detail',
      'White Balance',
      'Sesuaikan Brightness',
      'Tingkatkan Kontras',
    ];

    /* ============================
       WEARABLE & MODEL LOGIC
       ============================ */

    // For product category (default), assume it could be wearable
    // Show all model options to give users flexibility
    const HUMAN_MODEL_OPTIONS = [
      'Dipakai oleh Model Wanita',
      'Dipakai oleh Model Wanita Berhijab',
      'Dipakai oleh Model Pria',
      'Foto Lifestyle dengan Model',
    ];

    const ADDITIONAL_MODEL_OPTIONS = [
      'Ditampilkan pada Manekin',
      'Foto Close-up saat Dipakai',
      'Dipakai di Bagian Tubuh (Leher/Tangan/Pergelangan)',
    ];

    // Combine all options: model options first, then base enhancements
    const enhancementStrings = [
      ...HUMAN_MODEL_OPTIONS,
      ...ADDITIONAL_MODEL_OPTIONS,
      ...baseEnhancementOptions,
    ];

    return new Response(
      JSON.stringify({
        classification: category,
        enhancementOptions: enhancementStrings,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unexpected error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

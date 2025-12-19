import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    console.log('Classifying exterior image:', imageUrl);

    // Exterior Design specific enhancements
    const EXTERIOR_DESIGN_OPTIONS = [
      '🏠 Facade Renovation (Ubah Tampilan Depan)',
      '🌳 Landscaping Enhancement (Taman & Tanaman)',
      '🌅 Ubah Waktu (Day/Night/Golden Hour)',
      '⛅ Ubah Cuaca (Sunny/Cloudy/Rainy)',
      '🎨 Ubah Warna Cat Eksterior',
      '🪟 Upgrade Jendela & Pintu',
      '💡 Tambah Outdoor Lighting',
      '🏊 Tambah Pool/Water Feature',
      '🚗 Tambah Driveway & Parking',
      '🌺 Tambah Garden & Flowers',
      '🏗️ Modern Architecture Style',
      '🏛️ Classic Architecture Style',
    ];

    const BASE_ENHANCEMENTS = [
      'Tingkatkan Kualitas Gambar',
      'Perbaiki Pencahayaan',
      'Sesuaikan Warna',
      'Crop & Center',
      'Pertajam Detail',
      'White Balance',
      'Sesuaikan Brightness',
      'Tingkatkan Kontras',
    ];

    const enhancementOptions = [
      ...EXTERIOR_DESIGN_OPTIONS,
      ...BASE_ENHANCEMENTS,
    ];

    return new Response(
      JSON.stringify({
        classification: 'exterior',
        enhancementOptions,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in classify-exterior:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unexpected error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

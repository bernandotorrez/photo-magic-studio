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

    console.log('Classifying interior image:', imageUrl);

    // Interior Design specific enhancements
    const INTERIOR_DESIGN_OPTIONS = [
      '🛋️ Virtual Staging (Tambah Furniture)',
      '🎨 Style Transformation (Modern/Minimalist/Classic)',
      '🌈 Ubah Color Scheme',
      '💡 Lighting Enhancement',
      '🪟 Ubah Wallpaper/Cat Dinding',
      '🖼️ Tambah Dekorasi & Artwork',
      '🌿 Tambah Tanaman Hias',
      '✨ Luxury Interior Upgrade',
      '🏠 Scandinavian Style',
      '🎭 Industrial Style',
      '🌸 Bohemian Style',
      '🏛️ Classic/Traditional Style',
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
      ...INTERIOR_DESIGN_OPTIONS,
      ...BASE_ENHANCEMENTS,
    ];

    return new Response(
      JSON.stringify({
        classification: 'interior',
        enhancementOptions,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in classify-interior:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unexpected error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

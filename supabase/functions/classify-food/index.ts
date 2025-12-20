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

    console.log('Classifying food image:', imageUrl);

    // Food Enhancement specific options
    const FOOD_ENHANCEMENT_OPTIONS = [
      // Angles
      '📐 Top-Down View (Flat Lay)',
      '📐 45-Degree Angle',
      '📐 Extreme Close-Up',
      
      // Ingredients
      '🥕 Tampilkan Bahan-Bahan',
      '🥕 Bahan Melayang (Floating)',
      
      // Banners
      '🎨 Banner Promosi',
      '🎨 Banner Menu Restoran',
      '🎨 Banner Delivery App',
      
      // Plating
      '🍴 Plating Mewah',
      '🍴 Plating Rustic/Homey',
      '🍴 Tambah Props & Dekorasi',
      
      // Lighting
      '💡 Natural Light',
      '💡 Dramatic Lighting',
      '💡 Warm & Cozy',
      
      // Effects
      '✨ Tambah Efek Uap/Steam',
      '✨ Sauce Drip/Pour Effect',
      '✨ Warna Lebih Vibrant',
      '✨ Blur Background (Bokeh)',
      
      // Context
      '🌳 Complete Table Setting',
      '🌳 Outdoor/Picnic Style',
      '🌳 Restaurant Ambiance',
      
      // Special
      '🎯 Adjust Portion Size',
      '🎯 Enhance Garnish',
      '🎯 Enhance Texture',
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
      ...FOOD_ENHANCEMENT_OPTIONS,
      ...BASE_ENHANCEMENTS,
    ];

    return new Response(
      JSON.stringify({
        classification: 'food',
        enhancementOptions,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in classify-food:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unexpected error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

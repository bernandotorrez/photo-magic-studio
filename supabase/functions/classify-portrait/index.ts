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

    console.log('Classifying portrait image:', imageUrl);

    // AI Photographer specific enhancements
    const AI_PHOTOGRAPHER_OPTIONS = [
      '🎨 Virtual Outfit Change (Ganti Baju)',
      '💃 Ubah Pose (Pose Variation)',
      '🌆 Ganti Background',
      '📸 Professional Portrait Enhancement',
      '✨ Beauty Enhancement (Smooth Skin)',
      '🎭 Ubah Ekspresi Wajah',
      '💼 Business Portrait Style',
      '🌟 Fashion Editorial Style',
      '🎬 Cinematic Look',
      '🖼️ Studio Portrait dengan Lighting Profesional',
    ];

    const BASE_ENHANCEMENTS = [
      'Tingkatkan Kualitas Gambar',
      'Perbaiki Pencahayaan',
      'Hapus Background',
      'Sesuaikan Warna',
      'Crop & Center',
      'Pertajam Detail',
      'White Balance',
      'Sesuaikan Brightness',
      'Tingkatkan Kontras',
    ];

    const enhancementOptions = [
      ...AI_PHOTOGRAPHER_OPTIONS,
      ...BASE_ENHANCEMENTS,
    ];

    return new Response(
      JSON.stringify({
        classification: 'portrait',
        enhancementOptions,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in classify-portrait:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unexpected error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

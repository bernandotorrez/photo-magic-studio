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

    console.log('Classifying fashion/product image:', imageUrl);

    // Fashion & Product specific enhancements
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

    const PRODUCT_ENHANCEMENTS = [
      'Generate 360° View',
      'Buat Varian Warna',
      'Ubah Material/Tekstur',
      'Tampilkan Size Comparison',
    ];

    const BASE_ENHANCEMENTS = [
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

    const enhancementOptions = [
      ...HUMAN_MODEL_OPTIONS,
      ...ADDITIONAL_MODEL_OPTIONS,
      ...PRODUCT_ENHANCEMENTS,
      ...BASE_ENHANCEMENTS,
    ];

    return new Response(
      JSON.stringify({
        classification: 'fashion',
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// ============================================
// CORS Headers (Public API - Allow all origins)
// ============================================
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
};
// ============================================

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Authenticate using API key
    const apiKeyHeader = req.headers.get('x-api-key');
    
    if (!apiKeyHeader) {
      return new Response(
        JSON.stringify({ error: 'API key is required. Provide it in x-api-key header.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Hash the provided API key
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKeyHeader);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Verify API key
    const { data: apiKeyRecord, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('user_id, is_active, id')
      .eq('key_hash', hashedKey)
      .maybeSingle();

    if (apiKeyError || !apiKeyRecord) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!apiKeyRecord.is_active) {
      return new Response(
        JSON.stringify({ error: 'API key is inactive' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = apiKeyRecord.user_id;
    const apiKeyId = apiKeyRecord.id;

    // Parse request body
    const { taskId } = await req.json();
    
    if (!taskId) {
      return new Response(
        JSON.stringify({ error: 'taskId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check task status from KIE AI
    const KIE_AI_API_KEY = Deno.env.get('KIE_AI_API_KEY');
    
    if (!KIE_AI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const statusResponse = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, {
      headers: {
        'Authorization': `Bearer ${KIE_AI_API_KEY}`,
      },
    });

    if (!statusResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to check task status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const statusData = await statusResponse.json();

    if (statusData.code !== 200 || !statusData.data) {
      return new Response(
        JSON.stringify({ error: 'Invalid response from generation service' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const taskData = statusData.data;
    
    // Parse response based on state
    let response: any = {
      taskId: taskId,
      state: taskData.state,
    };

    if (taskData.state === 'success') {
      if (taskData.resultJson) {
        const resultJson = JSON.parse(taskData.resultJson);
        response.success = true;
        response.generatedImageUrl = resultJson.resultUrls?.[0] || null;
        response.resultUrls = resultJson.resultUrls || [];
      }
    } else if (taskData.state === 'fail') {
      response.success = false;
      response.error = taskData.failMsg || 'Generation failed';
    } else if (taskData.state === 'pending' || taskData.state === 'processing') {
      response.success = false;
      response.status = 'processing';
      response.message = 'Task is still processing';
    } else {
      response.success = false;
      response.status = 'unknown';
      response.message = 'Unknown task state';
    }

    // ✅ LOG API KEY USAGE
    try {
      await supabase.rpc('log_api_key_usage', {
        p_api_key_id: apiKeyId,
        p_user_id: userId,
        p_endpoint: 'api-check-status',
        p_request_method: 'POST',
        p_request_payload: { taskId: taskId },
        p_response_status: 200,
        p_ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        p_user_agent: req.headers.get('user-agent') || 'unknown'
      });
    } catch (logError) {
      console.error('Failed to log API usage:', logError);
      // Don't fail the request if logging fails
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in api-check-status function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

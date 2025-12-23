import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

interface CaptchaRequest {
  token: string;
  action?: string;
}

interface LoginRateLimitRequest {
  email: string;
  checkOnly?: boolean;
}

serve(async (req) => {
  // ✅ GET ORIGIN FOR CORS CHECK
  const origin = req.headers.get('Origin');
  const corsHeaders = getPrivateCorsHeaders(origin);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, action, email, checkOnly } = await req.json() as CaptchaRequest & LoginRateLimitRequest;

    // If checking rate limit
    if (email && !token) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const windowStart = new Date();
      windowStart.setMinutes(windowStart.getMinutes() - 15); // 15-minute window

      // Get login attempts for this email
      const { data: attempts, error: fetchError } = await supabase
        .from("login_attempts")
        .select("*")
        .eq("email", email.toLowerCase())
        .gte("attempted_at", windowStart.toISOString());

      if (fetchError) {
        console.error("Error fetching login attempts:", fetchError);
      }

      const attemptCount = attempts?.length || 0;
      const maxAttempts = 5; // Max 5 attempts per 15 minutes
      const isBlocked = attemptCount >= maxAttempts;

      if (checkOnly) {
        return new Response(
          JSON.stringify({
            success: true,
            isBlocked,
            remainingAttempts: Math.max(0, maxAttempts - attemptCount),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Record the login attempt
      if (!checkOnly) {
        const { error: insertError } = await supabase
          .from("login_attempts")
          .insert({
            email: email.toLowerCase(),
            attempted_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error("Error recording login attempt:", insertError);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          isBlocked,
          remainingAttempts: Math.max(0, maxAttempts - attemptCount - 1),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify reCAPTCHA token
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: "CAPTCHA token diperlukan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recaptchaSecretKey = Deno.env.get("RECAPTCHA_SECRET_KEY");
    if (!recaptchaSecretKey) {
      console.error("RECAPTCHA_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "CAPTCHA tidak dikonfigurasi" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify with Google reCAPTCHA
    const verifyUrl = "https://www.google.com/recaptcha/api/siteverify";
    const verifyResponse = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: recaptchaSecretKey,
        response: token,
      }),
    });

    const verifyResult = await verifyResponse.json();
    console.log("reCAPTCHA verification result:", verifyResult);

    if (!verifyResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Verifikasi CAPTCHA gagal. Silakan coba lagi.",
          details: verifyResult["error-codes"],
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in verify-captcha:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

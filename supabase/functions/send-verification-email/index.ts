import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

const EMAIL_TEMPLATE = (email: string, verificationUrl: string) => `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Konfirmasi Email - PixelNova AI</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      width: 60px;
      height: 60px;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }
    .logo-text {
      color: white;
      font-size: 24px;
      font-weight: bold;
    }
    .header h1 {
      color: white;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 40px 30px;
    }
    .content p {
      color: #6b7280;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 20px 0;
    }
    .app-name {
      color: #1f2937;
      font-weight: 600;
    }
    .email-address {
      color: #3b82f6;
      text-decoration: underline;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .verify-button {
      display: inline-block;
      background-color: #000000;
      color: #ffffff;
      text-decoration: none;
      padding: 16px 48px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      transition: background-color 0.3s;
    }
    .verify-button:hover {
      background-color: #1f2937;
    }
    .footer {
      padding: 30px;
      text-align: center;
      color: #9ca3af;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
    }
    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <span class="logo-text">✨</span>
      </div>
      <h1>Confirm your email</h1>
    </div>
    
    <div class="content">
      <p>Thanks for signing up for <span class="app-name">PixelNova AI</span>!</p>
      
      <p>Please confirm your email address (<span class="email-address">${email}</span>) by clicking the button below:</p>
      
      <div class="button-container">
        <a href="${verificationUrl}" class="verify-button">Verify Email</a>
      </div>
      
      <div class="divider"></div>
      
      <p style="color: #9ca3af; font-size: 14px;">
        If you didn't create an account, you can safely ignore this email.
      </p>
      
      <p style="color: #9ca3af; font-size: 14px; margin-top: 20px;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${verificationUrl}" style="color: #3b82f6; word-break: break-all;">${verificationUrl}</a>
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 0;">© 2025 PixelNova AI. All rights reserved.</p>
      <p style="margin: 10px 0 0 0;">AI-powered image enhancement for product photos</p>
    </div>
  </div>
</body>
</html>
`;

serve(async (req) => {
  // ✅ GET ORIGIN FOR CORS CHECK
  const origin = req.headers.get('Origin');
  const corsHeaders = getPrivateCorsHeaders(origin);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, confirmationUrl } = await req.json();

    if (!email || !confirmationUrl) {
      return new Response(
        JSON.stringify({ error: "Email and confirmation URL are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send email using Supabase's built-in email service or external service
    // Note: This is a placeholder. You'll need to configure your email service
    const emailHtml = EMAIL_TEMPLATE(email, confirmationUrl);

    // For now, just return success
    // In production, integrate with SendGrid, Resend, or other email service
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Verification email sent",
        // For testing, you can return the HTML
        html: emailHtml
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error sending verification email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

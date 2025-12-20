// Cron job to expire subscription tokens and send warnings
// Run this daily via Supabase Edge Functions cron or external scheduler

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserWarning {
  user_id: string;
  email: string;
  subscription_tokens: number;
  days_until_expiry: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Step 1: Expire tokens that have passed their expiry date
    const { data: expireResult, error: expireError } = await supabaseClient
      .rpc('expire_subscription_tokens');

    if (expireError) throw expireError;

    console.log(`Expired tokens for ${expireResult} users`);

    // Step 2: Get users who need expiry warning (7 days before)
    const { data: usersNeedingWarning, error: warningError } = await supabaseClient
      .rpc('get_users_needing_expiry_warning');

    if (warningError) throw warningError;

    const warnings: UserWarning[] = usersNeedingWarning || [];
    console.log(`Found ${warnings.length} users needing expiry warning`);

    // Step 3: Send warning emails (you can integrate with your email service)
    for (const user of warnings) {
      try {
        // TODO: Integrate with your email service (Resend, SendGrid, etc.)
        console.log(`Warning for ${user.email}: ${user.subscription_tokens} tokens expire in ${user.days_until_expiry} days`);
        
        // For now, we'll just mark as sent
        // In production, send email first, then mark as sent
        await supabaseClient.rpc('mark_expiry_warning_sent', {
          user_id: user.user_id
        });
      } catch (emailError) {
        console.error(`Failed to send warning to ${user.email}:`, emailError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        expired_users: expireResult,
        warnings_sent: warnings.length,
        warnings: warnings
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in expire-subscription-tokens:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

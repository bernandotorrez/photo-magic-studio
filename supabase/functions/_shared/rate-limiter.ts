/**
 * Rate Limiting Utilities
 * 
 * Provides rate limiting functionality to prevent abuse
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier: string; // user_id, api_key_hash, ip_address, etc.
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  error?: string;
}

/**
 * Check and enforce rate limit
 */
export async function checkRateLimit(
  supabase: ReturnType<typeof createClient>,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - config.windowMs);
  
  try {
    // Get existing rate limit record
    const { data: existing, error: fetchError } = await supabase
      .from('api_rate_limits')
      .select('*')
      .eq('identifier', config.identifier)
      .gte('window_start', windowStart.toISOString())
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Rate limit fetch error:', fetchError);
      // Fail open - allow request if we can't check rate limit
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetAt: new Date(Date.now() + config.windowMs),
      };
    }
    
    const now = new Date();
    
    // If no existing record or window expired, create new
    if (!existing || new Date(existing.window_start) < windowStart) {
      const { error: insertError } = await supabase
        .from('api_rate_limits')
        .upsert({
          identifier: config.identifier,
          window_start: now.toISOString(),
          request_count: 1,
        }, {
          onConflict: 'identifier',
        });
      
      if (insertError) {
        console.error('Rate limit insert error:', insertError);
      }
      
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: new Date(now.getTime() + config.windowMs),
      };
    }
    
    // Check if limit exceeded
    if (existing.request_count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(new Date(existing.window_start).getTime() + config.windowMs),
        error: `Rate limit exceeded. Maximum ${config.maxRequests} requests per ${config.windowMs / 1000} seconds.`,
      };
    }
    
    // Increment counter
    const { error: updateError } = await supabase
      .from('api_rate_limits')
      .update({
        request_count: existing.request_count + 1,
      })
      .eq('identifier', config.identifier);
    
    if (updateError) {
      console.error('Rate limit update error:', updateError);
    }
    
    return {
      allowed: true,
      remaining: config.maxRequests - existing.request_count - 1,
      resetAt: new Date(new Date(existing.window_start).getTime() + config.windowMs),
    };
    
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail open - allow request if there's an error
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: new Date(Date.now() + config.windowMs),
    };
  }
}

/**
 * Rate limit for API key (60 requests per minute)
 */
export async function checkApiKeyRateLimit(
  supabase: ReturnType<typeof createClient>,
  apiKeyHash: string
): Promise<RateLimitResult> {
  return checkRateLimit(supabase, {
    maxRequests: 60,
    windowMs: 60 * 1000, // 1 minute
    identifier: `api_key:${apiKeyHash}`,
  });
}

/**
 * Rate limit for user (100 requests per hour)
 */
export async function checkUserRateLimit(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<RateLimitResult> {
  return checkRateLimit(supabase, {
    maxRequests: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
    identifier: `user:${userId}`,
  });
}

/**
 * Rate limit for IP address (200 requests per hour)
 */
export async function checkIpRateLimit(
  supabase: ReturnType<typeof createClient>,
  ipAddress: string
): Promise<RateLimitResult> {
  return checkRateLimit(supabase, {
    maxRequests: 200,
    windowMs: 60 * 60 * 1000, // 1 hour
    identifier: `ip:${ipAddress}`,
  });
}

/**
 * Get client IP address from request
 */
export function getClientIp(req: Request): string {
  // Check various headers for IP address
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip', // Cloudflare
    'x-client-ip',
  ];
  
  for (const header of headers) {
    const value = req.headers.get(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return value.split(',')[0].trim();
    }
  }
  
  return 'unknown';
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  headers: Record<string, string>,
  result: RateLimitResult
): Record<string, string> {
  return {
    ...headers,
    'X-RateLimit-Limit': result.allowed ? String(result.remaining + 1) : '0',
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': result.resetAt.toISOString(),
  };
}

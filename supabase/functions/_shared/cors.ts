/**
 * Secure CORS Configuration
 * 
 * This module provides flexible CORS headers with two modes:
 * 1. Public API mode: Allow all origins (for open APIs like api-generate)
 * 2. Private API mode: Whitelist only (for sensitive endpoints)
 */

// Whitelist of allowed origins for private APIs
const ALLOWED_ORIGINS = [
  'https://pixel-nova-ai.vercel.app',
  'https://ai-magic-photo.lovable.app',
  // Add development origin only in non-production
  ...(Deno.env.get('ENVIRONMENT') !== 'production' ? ['http://localhost:5173'] : []),
];

/**
 * Get CORS headers for PUBLIC APIs (Open API)
 * Allows all origins but with security considerations
 */
export function getPublicCorsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

/**
 * Get CORS headers for PRIVATE APIs (Restricted)
 * Only returns permissive headers if origin is whitelisted
 */
export function getPrivateCorsHeaders(requestOrigin: string | null): Record<string, string> {
  // Check if origin is in whitelist
  const isAllowed = requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin);
  
  // If allowed, return permissive headers
  if (isAllowed) {
    return {
      'Access-Control-Allow-Origin': requestOrigin,
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400', // 24 hours
    };
  }
  
  // If not allowed, return restrictive headers (will cause CORS error in browser)
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0], // Default to first allowed origin
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };
}

/**
 * Get CORS headers based on request origin (backward compatible)
 * Use getPublicCorsHeaders() or getPrivateCorsHeaders() instead
 * @deprecated Use getPublicCorsHeaders() or getPrivateCorsHeaders()
 */
export function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  return getPrivateCorsHeaders(requestOrigin);
}

/**
 * Handle CORS preflight requests for PUBLIC APIs
 */
export function handlePublicCorsPreflightRequest(): Response {
  const headers = getPublicCorsHeaders();
  
  return new Response(null, {
    status: 204,
    headers,
  });
}

/**
 * Handle CORS preflight requests for PRIVATE APIs
 */
export function handlePrivateCorsPreflightRequest(req: Request): Response {
  const origin = req.headers.get('Origin');
  const headers = getPrivateCorsHeaders(origin);
  
  return new Response(null, {
    status: 204,
    headers,
  });
}

/**
 * Handle CORS preflight requests (backward compatible)
 * @deprecated Use handlePublicCorsPreflightRequest() or handlePrivateCorsPreflightRequest()
 */
export function handleCorsPreflightRequest(req: Request): Response {
  return handlePrivateCorsPreflightRequest(req);
}

/**
 * Create response with CORS headers for PUBLIC APIs
 */
export function createPublicCorsResponse(
  body: string | null,
  options: {
    status?: number;
    headers?: Record<string, string>;
  }
): Response {
  const corsHeaders = getPublicCorsHeaders();
  
  return new Response(body, {
    status: options.status || 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

/**
 * Create response with CORS headers for PRIVATE APIs
 */
export function createPrivateCorsResponse(
  body: string | null,
  options: {
    status?: number;
    headers?: Record<string, string>;
    requestOrigin: string | null;
  }
): Response {
  const corsHeaders = getPrivateCorsHeaders(options.requestOrigin);
  
  return new Response(body, {
    status: options.status || 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

/**
 * Create response with CORS headers (backward compatible)
 * @deprecated Use createPublicCorsResponse() or createPrivateCorsResponse()
 */
export function createCorsResponse(
  body: string | null,
  options: {
    status?: number;
    headers?: Record<string, string>;
    requestOrigin: string | null;
  }
): Response {
  return createPrivateCorsResponse(body, options);
}

/**
 * Validate origin is allowed
 * Use this for additional security checks
 */
export function isOriginAllowed(origin: string | null): boolean {
  return origin !== null && ALLOWED_ORIGINS.includes(origin);
}

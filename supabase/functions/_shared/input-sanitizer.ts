/**
 * Input Sanitization Utilities
 * 
 * Provides functions to sanitize user input and prevent injection attacks
 */

/**
 * Sanitize text input to prevent XSS and injection attacks
 */
export function sanitizeText(input: string, maxLength: number = 1000): string {
  if (!input) return '';
  
  return input
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove potentially dangerous characters
    .replace(/[<>\"'`]/g, '')
    // Remove null bytes
    .replace(/\0/g, '')
    // Trim whitespace
    .trim()
    // Limit length
    .substring(0, maxLength);
}

/**
 * Sanitize prompt input for AI generation
 * More permissive than sanitizeText but still safe
 */
export function sanitizePrompt(input: string, maxLength: number = 500): string {
  if (!input) return '';
  
  return input
    // Remove script-related keywords
    .replace(/\b(script|eval|function|exec|system|cmd|bash|sh)\b/gi, '')
    // Remove HTML/XML tags
    .replace(/<[^>]*>/g, '')
    // Remove dangerous characters but keep punctuation
    .replace(/[<>\"'`]/g, '')
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Trim
    .trim()
    // Limit length
    .substring(0, maxLength);
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';
  
  return email
    .toLowerCase()
    .trim()
    // Remove any characters that aren't valid in email
    .replace(/[^a-z0-9@._+-]/g, '')
    .substring(0, 255); // Max email length
}

/**
 * Sanitize filename for storage
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'unnamed';
  
  return filename
    // Remove path traversal attempts
    .replace(/\.\./g, '')
    .replace(/[\/\\]/g, '')
    // Remove dangerous characters
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    // Limit length
    .substring(0, 255);
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  if (!url) return null;
  
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize integer input
 */
export function sanitizeInteger(input: any, min?: number, max?: number): number | null {
  const num = parseInt(input, 10);
  
  if (isNaN(num)) return null;
  if (min !== undefined && num < min) return min;
  if (max !== undefined && num > max) return max;
  
  return num;
}

/**
 * Sanitize boolean input
 */
export function sanitizeBoolean(input: any): boolean {
  if (typeof input === 'boolean') return input;
  if (typeof input === 'string') {
    return input.toLowerCase() === 'true' || input === '1';
  }
  return Boolean(input);
}

/**
 * Validate file type
 */
export function validateFileType(
  file: File,
  allowedTypes: string[]
): { valid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }
  return { valid: true };
}

/**
 * Validate file size
 */
export function validateFileSize(
  file: File,
  maxSizeBytes: number
): { valid: boolean; error?: string } {
  if (file.size > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSizeMB}MB`,
    };
  }
  return { valid: true };
}

/**
 * Comprehensive file validation
 */
export function validateFile(
  file: File,
  options: {
    allowedTypes: string[];
    maxSizeBytes: number;
  }
): { valid: boolean; error?: string } {
  // Check type
  const typeCheck = validateFileType(file, options.allowedTypes);
  if (!typeCheck.valid) return typeCheck;
  
  // Check size
  const sizeCheck = validateFileSize(file, options.maxSizeBytes);
  if (!sizeCheck.valid) return sizeCheck;
  
  return { valid: true };
}

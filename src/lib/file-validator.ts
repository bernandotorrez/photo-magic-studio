/**
 * File Upload Validation
 * 
 * Provides secure file validation to prevent malicious uploads
 */

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Allowed MIME types for different file categories
 */
export const ALLOWED_MIME_TYPES = {
  images: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  all: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
  ],
};

/**
 * Maximum file sizes (in bytes)
 */
export const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024, // 10MB
  document: 5 * 1024 * 1024, // 5MB
  paymentProof: 5 * 1024 * 1024, // 5MB
};

/**
 * Validate file type by MIME type
 */
export function validateFileType(
  file: File,
  allowedTypes: string[]
): FileValidationResult {
  if (!allowedTypes.includes(file.type)) {
    const allowedExtensions = allowedTypes
      .map(type => type.split('/')[1].toUpperCase())
      .join(', ');
    
    return {
      valid: false,
      error: `Tipe file tidak diperbolehkan. Hanya file ${allowedExtensions} yang diizinkan.`,
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
): FileValidationResult {
  if (file.size > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(1);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    
    return {
      valid: false,
      error: `File terlalu besar (${fileSizeMB}MB). Ukuran maksimal ${maxSizeMB}MB.`,
    };
  }
  
  if (file.size === 0) {
    return {
      valid: false,
      error: 'File kosong atau corrupt.',
    };
  }
  
  return { valid: true };
}

/**
 * Validate file name for security
 */
export function validateFileName(file: File): FileValidationResult {
  const fileName = file.name;
  
  // Check for path traversal attempts
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return {
      valid: false,
      error: 'Nama file tidak valid.',
    };
  }
  
  // Check for executable extensions
  const dangerousExtensions = [
    '.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs', '.js', '.jar',
    '.app', '.deb', '.rpm', '.dmg', '.pkg', '.msi',
  ];
  
  const lowerFileName = fileName.toLowerCase();
  if (dangerousExtensions.some(ext => lowerFileName.endsWith(ext))) {
    return {
      valid: false,
      error: 'Tipe file tidak diperbolehkan untuk alasan keamanan.',
    };
  }
  
  // Check file name length
  if (fileName.length > 255) {
    return {
      valid: false,
      error: 'Nama file terlalu panjang.',
    };
  }
  
  return { valid: true };
}

/**
 * Validate image file (comprehensive check)
 */
export function validateImageFile(file: File): FileValidationResult {
  // Check file name
  const nameCheck = validateFileName(file);
  if (!nameCheck.valid) return nameCheck;
  
  // Check file type
  const typeCheck = validateFileType(file, ALLOWED_MIME_TYPES.images);
  if (!typeCheck.valid) return typeCheck;
  
  // Check file size
  const sizeCheck = validateFileSize(file, MAX_FILE_SIZES.image);
  if (!sizeCheck.valid) return sizeCheck;
  
  return { valid: true };
}

/**
 * Validate payment proof file
 */
export function validatePaymentProofFile(file: File): FileValidationResult {
  // Check file name
  const nameCheck = validateFileName(file);
  if (!nameCheck.valid) return nameCheck;
  
  // Check file type (images only for payment proof)
  const typeCheck = validateFileType(file, ALLOWED_MIME_TYPES.images);
  if (!typeCheck.valid) return typeCheck;
  
  // Check file size
  const sizeCheck = validateFileSize(file, MAX_FILE_SIZES.paymentProof);
  if (!sizeCheck.valid) return sizeCheck;
  
  return { valid: true };
}

/**
 * Validate file before upload (async - can check file content)
 */
export async function validateFileContent(file: File): Promise<FileValidationResult> {
  try {
    // Read first few bytes to verify file signature (magic numbers)
    const buffer = await file.slice(0, 4).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // Check for common image file signatures
    const signatures: Record<string, number[]> = {
      'image/jpeg': [0xFF, 0xD8, 0xFF],
      'image/png': [0x89, 0x50, 0x4E, 0x47],
      'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF
    };
    
    // Verify file signature matches declared MIME type
    const declaredType = file.type;
    const expectedSignature = signatures[declaredType];
    
    if (expectedSignature) {
      const matches = expectedSignature.every((byte, index) => bytes[index] === byte);
      
      if (!matches) {
        return {
          valid: false,
          error: 'File tidak sesuai dengan tipe yang dideklarasikan. File mungkin corrupt atau berbahaya.',
        };
      }
    }
    
    return { valid: true };
  } catch (error) {
    console.error('Error validating file content:', error);
    return {
      valid: false,
      error: 'Gagal memvalidasi file. Silakan coba lagi.',
    };
  }
}

/**
 * Comprehensive file validation (use this for all uploads)
 */
export async function validateFile(
  file: File,
  options: {
    allowedTypes: string[];
    maxSize: number;
    checkContent?: boolean;
  }
): Promise<FileValidationResult> {
  // Check file name
  const nameCheck = validateFileName(file);
  if (!nameCheck.valid) return nameCheck;
  
  // Check file type
  const typeCheck = validateFileType(file, options.allowedTypes);
  if (!typeCheck.valid) return typeCheck;
  
  // Check file size
  const sizeCheck = validateFileSize(file, options.maxSize);
  if (!sizeCheck.valid) return sizeCheck;
  
  // Optionally check file content
  if (options.checkContent) {
    const contentCheck = await validateFileContent(file);
    if (!contentCheck.valid) return contentCheck;
  }
  
  return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file extension
 */
export function getFileExtension(fileName: string): string {
  return fileName.slice((fileName.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return ALLOWED_MIME_TYPES.images.includes(file.type);
}

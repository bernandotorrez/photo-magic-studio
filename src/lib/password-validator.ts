/**
 * Strong Password Validation
 * 
 * Enforces secure password requirements to prevent weak passwords
 */

import { z } from 'zod';

/**
 * Password requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const strongPasswordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .regex(/[A-Z]/, 'Password harus mengandung minimal 1 huruf besar (A-Z)')
  .regex(/[a-z]/, 'Password harus mengandung minimal 1 huruf kecil (a-z)')
  .regex(/[0-9]/, 'Password harus mengandung minimal 1 angka (0-9)')
  .regex(/[^A-Za-z0-9]/, 'Password harus mengandung minimal 1 karakter spesial (!@#$%^&*)');

/**
 * Check password strength and return detailed feedback
 */
export interface PasswordStrength {
  score: number; // 0-4 (0=very weak, 4=very strong)
  feedback: string[];
  isStrong: boolean;
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('Password terlalu pendek (minimal 8 karakter)');
  }

  if (password.length >= 12) {
    score++;
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Tambahkan huruf besar (A-Z)');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push('Tambahkan huruf kecil (a-z)');
  }

  // Number check
  if (/[0-9]/.test(password)) {
    score++;
  } else {
    feedback.push('Tambahkan angka (0-9)');
  }

  // Special character check
  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
  } else {
    feedback.push('Tambahkan karakter spesial (!@#$%^&*)');
  }

  // Common password check
  const commonPasswords = [
    'password', 'password123', '12345678', 'qwerty', 'abc123',
    'password1', '123456789', 'letmein', 'welcome', 'admin',
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    score = 0;
    feedback.push('Password terlalu umum, gunakan kombinasi yang lebih unik');
  }

  // Sequential characters check
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Hindari karakter berulang (aaa, 111)');
    score = Math.max(0, score - 1);
  }

  // Normalize score to 0-4
  const normalizedScore = Math.min(4, Math.floor(score / 1.5));

  return {
    score: normalizedScore,
    feedback,
    isStrong: normalizedScore >= 3 && feedback.length === 0,
  };
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0:
      return 'Sangat Lemah';
    case 1:
      return 'Lemah';
    case 2:
      return 'Sedang';
    case 3:
      return 'Kuat';
    case 4:
      return 'Sangat Kuat';
    default:
      return 'Unknown';
  }
}

/**
 * Get password strength color
 */
export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'text-red-500';
    case 2:
      return 'text-yellow-500';
    case 3:
      return 'text-blue-500';
    case 4:
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
}

/**
 * Validate password meets all requirements
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const result = strongPasswordSchema.safeParse(password);
  
  if (result.success) {
    return { valid: true, errors: [] };
  }
  
  return {
    valid: false,
    errors: result.error.errors.map(err => err.message),
  };
}

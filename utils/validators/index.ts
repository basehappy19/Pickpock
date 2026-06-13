/**
 * Validator utilities - input validation helpers
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Thai phone number
 */
export function isValidThaiPhone(phone: string): boolean {
  const phoneRegex = /^0[689]\d{8}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  issues: string[];
} {
  const issues: string[] = [];

  if (password.length < 8) {
    issues.push('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
  }

  if (!/[A-Z]/.test(password)) {
    issues.push('ต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว');
  }

  if (!/[a-z]/.test(password)) {
    issues.push('ต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว');
  }

  if (!/[0-9]/.test(password)) {
    issues.push('ต้องมีตัวเลขอย่างน้อย 1 ตัว');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    issues.push('ต้องมีอักขระพิเศษอย่างน้อย 1 ตัว');
  }

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (issues.length <= 1 && password.length >= 8) strength = 'medium';
  if (issues.length === 0 && password.length >= 12) strength = 'strong';

  return {
    isValid: issues.length === 0,
    strength,
    issues
  };
}

/**
 * Validate product data
 */
export function validateProductData(product: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!product.name || product.name.trim().length < 3) {
    errors.push('ชื่อสินค้าต้องมีอย่างน้อย 3 ตัวอักษร');
  }

  if (!product.price || product.price < 0) {
    errors.push('ราคาต้องไม่ติดลบ');
  }

  if (!product.category || product.category.trim().length === 0) {
    errors.push('กรุณาระบุหมวดหมู่สินค้า');
  }

  if (product.stock === undefined || product.stock < 0) {
    errors.push('จำนวนสต็อกต้องไม่ติดลบ');
  }

  if (!product.image || product.image.trim().length === 0) {
    errors.push('กรุณาอัปโหลดรูปสินค้า');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate Thai ID
 */
export function isValidThaiID(id: string): boolean {
  const idStr = id.replace(/\D/g, '');
  if (idStr.length !== 13) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(idStr[i]) * (13 - i);
  }

  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === parseInt(idStr[12]);
}

/**
 * Validate URL
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate file type for upload
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size
 */
export function isValidFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

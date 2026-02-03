import crypto from 'crypto';

/**
 * Generate a URL-safe unique paste ID.
 */
export function generatePasteId() {
  return crypto.randomBytes(12).toString('base64url');
}

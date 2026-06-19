const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16

// Helper to get 32-byte key from environment or fallback
function getKey() {
  const secret = process.env.ENCRYPTION_KEY || 'default_super_secret_key_change_me_in_production';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypt a text
 * @param {string} text 
 * @returns {object} { encryptedData: string (hex), iv: string (hex) }
 */
function encrypt(text) {
  if (!text) return { encryptedData: '', iv: '' };
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    encryptedData: encrypted,
    iv: iv.toString('hex')
  };
}

/**
 * Decrypt a text
 * @param {string} encryptedData (hex)
 * @param {string} ivString (hex)
 * @returns {string} decrypted text
 */
function decrypt(encryptedData, ivString) {
  if (!encryptedData || !ivString) return '';
  try {
    const iv = Buffer.from(ivString, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error.message);
    return '[Decryption Error]';
  }
}

module.exports = { encrypt, decrypt };

import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32; // 256-bit
    this.ivLength = 12; // GCM recommends 12 bytes IV
    this.tagLength = 16; // Auth tag length

    const envKey = process.env.ENCRYPTION_KEY;
    if (!envKey || envKey.length < this.keyLength) {
      console.warn('⚠️  ENCRYPTION_KEY not set or too short, using default key (NOT SECURE FOR PRODUCTION)');
      this.key = crypto.createHash('sha256').update('default-key-not-secure-change-me').digest().slice(0, 32);
    } else {
      this.key = Buffer.from(envKey.slice(0, 32), 'utf-8');
    }
  }

  encrypt(text) {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

      const encrypted = Buffer.concat([
        cipher.update(text, 'utf8'),
        cipher.final()
      ]);
      const authTag = cipher.getAuthTag();

      const payload = Buffer.concat([iv, authTag, encrypted]);
      return payload.toString('base64');
    } catch (err) {
      console.error('Encryption error:', err);
      throw new Error('Failed to encrypt data');
    }
  }

  decrypt(encryptedData) {
    try {
      const data = Buffer.from(encryptedData, 'base64');
      const iv = data.slice(0, this.ivLength);
      const authTag = data.slice(this.ivLength, this.ivLength + this.tagLength);
      const encrypted = data.slice(this.ivLength + this.tagLength);

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]);

      return decrypted.toString('utf8');
    } catch (err) {
      console.error('Decryption error:', err);
      throw new Error('Failed to decrypt data');
    }
  }

  createHash(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  generateSessionId() {
    return crypto.randomBytes(16).toString('hex');
  }
}

export const encryptionService = new EncryptionService();
export default EncryptionService;

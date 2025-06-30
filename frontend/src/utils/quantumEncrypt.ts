import { getQuantumKey } from './quantumSetup';

class QuantumEncryptor {
  private key: number[] = [];

  async generateQuantumKey(length: number): Promise<number[]> {
    return await getQuantumKey(length); // Use the mock from quantumSetup.ts
  }

  encrypt(data: string, key: number[]): string {
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(data);
    const encrypted = dataBytes.map((byte, i) => byte ^ key[i % key.length]);
    const binary = String.fromCharCode(...encrypted);
    return btoa(binary); // Browser base64 encode
  }

  decrypt(encryptedData: string, key: number[]): string {
    const binary = atob(encryptedData); // Browser base64 decode
    const encryptedBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      encryptedBytes[i] = binary.charCodeAt(i);
    }
    const decrypted = encryptedBytes.map((byte, i) => byte ^ key[i % key.length]);
    return new TextDecoder().decode(new Uint8Array(decrypted));
  }

  async getSessionKey(): Promise<number[]> {
    if (!this.key.length) this.key = await this.generateQuantumKey(16);
    return this.key;
  }
}

export const quantumEncryptor = new QuantumEncryptor();
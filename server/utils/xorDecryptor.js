// utils/xorDecryptor.js

export const xorDecrypt = (encryptedBase64, keyArray) => {
  const encryptedBuffer = Buffer.from(encryptedBase64, 'base64');
  const decryptedBuffer = Buffer.alloc(encryptedBuffer.length);

  for (let i = 0; i < encryptedBuffer.length; i++) {
    decryptedBuffer[i] = encryptedBuffer[i] ^ keyArray[i % keyArray.length];
  }

  return JSON.parse(decryptedBuffer.toString('utf-8'));
};

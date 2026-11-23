import axiosClient from '../api/axiosClient';

const CIPHER_PREFIX = 'enc:v1:';
let cachedCryptoKey = null;

const pemToArrayBuffer = (pem) => {
  const cleanB64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\s+/g, '');

  const binaryString = atob(cleanB64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const clearCachedPublicKey = () => {
  cachedCryptoKey = null;
};

const loadServerPublicKey = async (forceRefresh = false) => {
  if (cachedCryptoKey && !forceRefresh) {
    return cachedCryptoKey;
  }

  const { data } = await axiosClient.get('/auth/public-key');
  const pem = data?.data?.publicKey;
  if (!pem) {
    throw new Error('Failed to retrieve server encryption key.');
  }

  const spkiBuffer = pemToArrayBuffer(pem);
  cachedCryptoKey = await globalThis.crypto.subtle.importKey(
    'spki',
    spkiBuffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['encrypt']
  );

  return cachedCryptoKey;
};

/**
 * Encrypts a plaintext password in the browser using RSA-OAEP-SHA256
 * so plaintext passwords never appear in DevTools Network payloads.
 */
export const encryptPasswordForTransport = async (plainPassword, forceRefreshKey = false) => {
  if (!plainPassword || String(plainPassword).startsWith(CIPHER_PREFIX)) {
    return plainPassword;
  }

  if (!globalThis.crypto?.subtle) {
    throw new Error('Web Crypto API is required for secure password encryption.');
  }

  const publicKey = await loadServerPublicKey(forceRefreshKey);
  const encodedBytes = new TextEncoder().encode(String(plainPassword));
  const cipherBuffer = await globalThis.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    encodedBytes
  );

  return `${CIPHER_PREFIX}${arrayBufferToBase64(cipherBuffer)}`;
};

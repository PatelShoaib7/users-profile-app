const crypto = require('crypto');
const ApiError = require('./ApiError');

const CIPHER_PREFIX = 'enc:v1:';

// Generate an ephemeral 2048-bit RSA keypair for transport-layer password encryption
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
});

const getPublicKeyPem = () => publicKey;

/**
 * Encrypts plaintext with RSA-OAEP-SHA256 (used in automated tests and server utilities).
 */
const encryptPasswordServerSide = (plainText) => {
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(String(plainText), 'utf8')
  );
  return `${CIPHER_PREFIX}${encrypted.toString('base64')}`;
};

/**
 * Decrypts an `enc:v1:<base64>` RSA-OAEP-SHA256 password payload.
 */
const decryptPasswordValue = (value) => {
  if (typeof value !== 'string' || !value.startsWith(CIPHER_PREFIX)) {
    return value;
  }

  const base64Payload = value.slice(CIPHER_PREFIX.length);
  try {
    const decryptedBuffer = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(base64Payload, 'base64')
    );
    return decryptedBuffer.toString('utf8');
  } catch {
    throw new ApiError(
      400,
      'Password encryption key expired or invalid (server may have restarted). Please retry.'
    );
  }
};

/**
 * Express middleware that decrypts `req.body.password` before Joi validation & bcrypt hashing.
 */
const decryptPasswordMiddleware = (req, _res, next) => {
  try {
    if (req.body && typeof req.body.password === 'string' && req.body.password.startsWith(CIPHER_PREFIX)) {
      req.body.password = decryptPasswordValue(req.body.password);
    }
    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  CIPHER_PREFIX,
  getPublicKeyPem,
  encryptPasswordServerSide,
  decryptPasswordValue,
  decryptPasswordMiddleware,
};

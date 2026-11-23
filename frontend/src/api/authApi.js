import axiosClient from './axiosClient';
import {
  clearCachedPublicKey,
  encryptPasswordForTransport,
} from '../utils/passwordCrypto';

export const loginRequest = async ({ email, password }) => {
  try {
    const encryptedPassword = await encryptPasswordForTransport(password);
    const { data } = await axiosClient.post('/auth/login', {
      email,
      password: encryptedPassword,
    });
    return data.data;
  } catch (error) {
    // If backend restarted and generated a new ephemeral RSA keypair, refresh key and retry once
    if (error.message?.includes('encryption key expired')) {
      clearCachedPublicKey();
      const retryCipher = await encryptPasswordForTransport(password, true);
      const { data } = await axiosClient.post('/auth/login', {
        email,
        password: retryCipher,
      });
      return data.data;
    }
    throw error;
  }
};

export const demoLoginRequest = async (role) => {
  const { data } = await axiosClient.post('/auth/demo-login', { role });
  return data.data;
};

export const getMeRequest = async () => {
  const { data } = await axiosClient.get('/auth/me');
  return data.data.user;
};

import axiosClient from './axiosClient';

export const loginRequest = async (credentials) => {
  const { data } = await axiosClient.post('/auth/login', credentials);
  return data.data;
};

export const getMeRequest = async () => {
  const { data } = await axiosClient.get('/auth/me');
  return data.data.user;
};

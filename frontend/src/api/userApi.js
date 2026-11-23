import axiosClient from './axiosClient';
import { encryptPasswordForTransport } from '../utils/passwordCrypto';

const encryptPayloadPassword = async (payload) => {
  if (payload instanceof FormData) {
    const rawPass = payload.get('password');
    if (rawPass && String(rawPass).trim()) {
      const cipher = await encryptPasswordForTransport(String(rawPass).trim());
      payload.set('password', cipher);
    }
    return payload;
  }

  if (payload && typeof payload === 'object' && payload.password) {
    const cipher = await encryptPasswordForTransport(payload.password);
    return { ...payload, password: cipher };
  }

  return payload;
};

export const fetchUsersRequest = async (params) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );
  const { data } = await axiosClient.get('/users', { params: cleanParams });
  return data;
};

export const fetchUserByIdRequest = async (id) => {
  const { data } = await axiosClient.get(`/users/${id}`);
  return data.data;
};

export const createUserRequest = async (formDataOrPayload) => {
  const prepared = await encryptPayloadPassword(formDataOrPayload);
  const isFormData = prepared instanceof FormData;
  const { data } = await axiosClient.post('/users', prepared, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  });
  return data;
};

export const updateUserRequest = async ({ id, payload }) => {
  const prepared = await encryptPayloadPassword(payload);
  const isFormData = prepared instanceof FormData;
  const { data } = await axiosClient.put(`/users/${id}`, prepared, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  });
  return data;
};

export const updateUserStatusRequest = async ({ id, status }) => {
  const { data } = await axiosClient.patch(`/users/${id}/status`, { status });
  return data;
};

export const uploadUserAvatarRequest = async ({ id, file }) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const { data } = await axiosClient.post(`/users/${id}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteUserRequest = async (id) => {
  const { data } = await axiosClient.delete(`/users/${id}`);
  return data;
};

export const assignTaskRequest = async ({ userId, task }) => {
  const { data } = await axiosClient.post(`/users/${userId}/tasks`, task);
  return data;
};

export const removeTaskRequest = async ({ userId, taskId }) => {
  const { data } = await axiosClient.delete(`/users/${userId}/tasks/${taskId}`);
  return data;
};

export const assignTrainingRequest = async ({ userId, training }) => {
  const { data } = await axiosClient.post(`/users/${userId}/trainings`, training);
  return data;
};

export const removeTrainingRequest = async ({ userId, trainingId }) => {
  const { data } = await axiosClient.delete(`/users/${userId}/trainings/${trainingId}`);
  return data;
};

export const assignTargetRequest = async ({ userId, target }) => {
  const { data } = await axiosClient.post(`/users/${userId}/targets`, target);
  return data;
};

export const removeTargetRequest = async ({ userId, targetId }) => {
  const { data } = await axiosClient.delete(`/users/${userId}/targets/${targetId}`);
  return data;
};

export const logAttendanceRequest = async ({ userId, entry }) => {
  const { data } = await axiosClient.post(`/users/${userId}/attendance`, entry);
  return data;
};

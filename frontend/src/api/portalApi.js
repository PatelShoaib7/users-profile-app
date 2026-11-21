import axiosClient from './axiosClient';

export const fetchMyPortalRequest = async () => {
  const { data } = await axiosClient.get('/portal/me');
  return data.data;
};

export const updateMyProfileRequest = async (payload) => {
  const { data } = await axiosClient.put('/portal/profile', payload);
  return data;
};

export const uploadMyAvatarRequest = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const { data } = await axiosClient.post('/portal/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updateMyTaskStatusRequest = async ({ taskId, status }) => {
  const { data } = await axiosClient.patch(`/portal/tasks/${taskId}`, { status });
  return data;
};

export const updateMyTrainingProgressRequest = async ({ trainingId, progress }) => {
  const { data } = await axiosClient.patch(`/portal/trainings/${trainingId}`, { progress });
  return data;
};

export const updateMyTargetProgressRequest = async ({ targetId, achievedValue, status }) => {
  const { data } = await axiosClient.patch(`/portal/targets/${targetId}`, {
    achievedValue,
    ...(status ? { status } : {}),
  });
  return data;
};

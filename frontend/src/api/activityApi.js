import axiosClient from './axiosClient';

export const fetchActivityLogsRequest = async (params) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );
  const { data } = await axiosClient.get('/activities', { params: cleanParams });
  return data;
};

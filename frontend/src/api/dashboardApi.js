import axiosClient from './axiosClient';

export const fetchDashboardStatsRequest = async () => {
  const { data } = await axiosClient.get('/dashboard/stats');
  return data.data;
};

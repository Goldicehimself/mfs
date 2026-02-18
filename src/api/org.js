import axiosInstance from './axiosConfig';

export const fetchMembers = async (params = {}) => {
  const response = await axiosInstance.get('/org/members', { params });
  return response.data?.data;
};

export const fetchInvites = async (params = {}) => {
  const response = await axiosInstance.get('/org/invites', { params });
  return response.data?.data;
};

export const disableOrg = async () => {
  const response = await axiosInstance.patch('/org/disable');
  return response.data?.data;
};

export const enableOrg = async () => {
  const response = await axiosInstance.patch('/org/enable');
  return response.data?.data;
};

export const setUserActive = async (userId, active) => {
  const response = await axiosInstance.patch(`/org/users/${userId}/active`, { active });
  return response.data?.data;
};

export const revokeInvite = async (code) => {
  const response = await axiosInstance.delete(`/org/invites/${code}`);
  return response.data?.data;
};

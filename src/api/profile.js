import axiosInstance from './axiosConfig';

export const getProfile = async () => {
  const response = await axiosInstance.get('/auth/profile');
  return response.data?.data;
};

export const updateProfile = async (payload = {}, avatarFile = null) => {
  if (avatarFile) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    formData.append('avatar', avatarFile);
    const response = await axiosInstance.put('/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data;
  }

  const response = await axiosInstance.put('/auth/profile', payload);
  return response.data?.data;
};

export const uploadCertificates = async (files = []) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('certificates', file);
  });

  const response = await axiosInstance.post('/auth/certificates', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data?.data;
};

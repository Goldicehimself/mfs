import axiosInstance from './axiosConfig';

export const getAssets = async (params = {}) => {
  const response = await axiosInstance.get('/assets', { params });
  return response.data;
};

export const getAsset = async (id) => {
  const response = await axiosInstance.get(`/assets/${id}`);
  return response.data;
};

export const createAsset = async (data) => {
  const response = await axiosInstance.post('/assets', data);
  return response.data;
};

export const updateAsset = async (id, data) => {
  const response = await axiosInstance.put(`/assets/${id}`, data);
  return response.data;
};

export const deleteAsset = async (id) => {
  const response = await axiosInstance.delete(`/assets/${id}`);
  return response.data;
};

export const getAssetHistory = async (id) => {
  const response = await axiosInstance.get(`/assets/${id}/history`);
  return response.data;
};

export const generateAssetQR = async (id) => {
  const response = await axiosInstance.get(`/assets/${id}/qr-code`);
  return response.data;
};

export const bulkImportAssets = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axiosInstance.post('/assets/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getAssetCategories = async () => {
  const response = await axiosInstance.get('/assets/categories');
  return response.data;
};
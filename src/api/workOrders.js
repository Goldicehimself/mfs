import axiosInstance from './axiosConfig';

export const getWorkOrders = async (params = {}) => {
  const response = await axiosInstance.get('/work-orders', { params });
  return response.data;
};

export const getWorkOrder = async (id) => {
  const response = await axiosInstance.get(`/work-orders/${id}`);
  return response.data;
};

export const createWorkOrder = async (data) => {
  const response = await axiosInstance.post('/work-orders', data);
  return response.data;
};

export const updateWorkOrder = async (id, data) => {
  const response = await axiosInstance.put(`/work-orders/${id}`, data);
  return response.data;
};

export const deleteWorkOrder = async (id) => {
  const response = await axiosInstance.delete(`/work-orders/${id}`);
  return response.data;
};

export const updateWorkOrderStatus = async (id, status, notes = '') => {
  const response = await axiosInstance.patch(`/work-orders/${id}/status`, {
    status,
    notes,
  });
  return response.data;
};

export const assignWorkOrder = async (id, assigneeId) => {
  const response = await axiosInstance.post(`/work-orders/${id}/assign`, {
    assigneeId,
  });
  return response.data;
};

export const addWorkOrderComment = async (id, comment) => {
  const response = await axiosInstance.post(`/work-orders/${id}/comments`, {
    comment,
  });
  return response.data;
};

export const uploadWorkOrderPhoto = async (id, file) => {
  const formData = new FormData();
  formData.append('photo', file);
  
  const response = await axiosInstance.post(
    `/work-orders/${id}/photos`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

export const getWorkOrderStats = async () => {
  const response = await axiosInstance.get('/work-orders/stats');
  return response.data;
};
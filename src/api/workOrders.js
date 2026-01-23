import axiosInstance from './axiosConfig';
import * as workOrderService from '../services/workOrderService';

export const getWorkOrders = async (params = {}) => {
  return await workOrderService.getWorkOrders(params);
};

export const getWorkOrder = async (id) => {
  try {
    const response = await axiosInstance.get(`/work-orders/${id}`);
    return response.data;
  } catch (error) {
    return await workOrderService.getWorkOrder(id);
  }
};

export const createWorkOrder = async (data) => {
  try {
    const response = await axiosInstance.post('/work-orders', data);
    return response.data;
  } catch (error) {
    return await workOrderService.createWorkOrder(data);
  }
};

export const updateWorkOrder = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/work-orders/${id}`, data);
    return response.data;
  } catch (error) {
    // Best-effort: update in local mock if present
    const existing = await workOrderService.getWorkOrder(id);
    if (existing) {
      const updated = { ...existing, ...data };
      await workOrderService.deleteWorkOrder(id);
      await workOrderService.createWorkOrder(updated);
      return updated;
    }
    throw error;
  }
};

export const deleteWorkOrder = async (id) => {
  try {
    const response = await axiosInstance.delete(`/work-orders/${id}`);
    return response.data;
  } catch (error) {
    return await workOrderService.deleteWorkOrder(id);
  }
};

export const updateWorkOrderStatus = async (id, status, notes = '') => {
  try {
    const response = await axiosInstance.patch(`/work-orders/${id}/status`, {
      status,
      notes,
    });
    return response.data;
  } catch (error) {
    const wo = await workOrderService.getWorkOrder(id);
    if (wo) {
      const updated = { ...wo, status };
      await workOrderService.deleteWorkOrder(id);
      await workOrderService.createWorkOrder(updated);
      return updated;
    }
    throw error;
  }
};

export const assignWorkOrder = async (id, assigneeId) => {
  try {
    const response = await axiosInstance.post(`/work-orders/${id}/assign`, {
      assigneeId,
    });
    return response.data;
  } catch (error) {
    // Not implemented in mock
    throw error;
  }
};

export const addWorkOrderComment = async (id, comment) => {
  try {
    const response = await axiosInstance.post(`/work-orders/${id}/comments`, {
      comment,
    });
    return response.data;
  } catch (error) {
    // Not implemented in mock
    throw error;
  }
};

export const uploadWorkOrderPhoto = async (id, file) => {
  const formData = new FormData();
  formData.append('photo', file);
  
  try {
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
  } catch (error) {
    throw error;
  }
};

export const getWorkOrderStats = async () => {
  try {
    const response = await axiosInstance.get('/work-orders/stats');
    return response.data;
  } catch (error) {
    // Basic local stats fallback
    const arr = await workOrderService.getWorkOrders();
    return {
      total: arr.length,
      open: arr.filter(w => w.status === 'open').length,
      inProgress: arr.filter(w => w.status === 'in_progress').length,
      completed: arr.filter(w => w.status === 'completed').length,
      overdue: arr.filter(w => w.status === 'overdue').length,
    };
  }
};

export const bulkAssignWorkOrders = async ({ ids = null, assignee = null, filters = {} } = {}) => {
  try {
    const response = await axiosInstance.post('/work-orders/bulk-assign', { ids, assignee, filters });
    return response.data;
  } catch (error) {
    // Fallback to local mock
    return await workOrderService.bulkAssignWorkOrders({ ids, assignee, filters });
  }
};

import axiosInstance from './axiosConfig';

export const getDashboardData = async () => {
  try {
    const response = await axiosInstance.get('/dashboard');
    return response.data;
  } catch (error) {
    // Return mock data if API fails
    return {
      openWorkOrders: 24,
      overdueWorkOrders: 5,
      pmCompliance: 87,
      pendingRequests: 12,
      activeAssets: 156,
      vendorPerformance: 92,
      complianceTrend: [],
      costAnalysis: [],
      serviceCategories: [
        { name: 'HVAC', count: 45, trend: 'up' },
        { name: 'Electrical', count: 32, trend: 'down' },
        { name: 'Plumbing', count: 28, trend: 'up' },
        { name: 'General', count: 51, trend: 'up' },
      ],
    };
  }
};

export const getRecentActivities = async () => {
  try {
    const response = await axiosInstance.get('/dashboard/activities');
    return response.data;
  } catch (error) {
    // Return mock data if API fails
    return [];
  }
};


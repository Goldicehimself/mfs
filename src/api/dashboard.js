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

import { getWorkOrders } from './workOrders';

export const getRecentActivities = async () => {
  try {
    const response = await axiosInstance.get('/dashboard/activities');
    return response.data;
  } catch (error) {
    // Return mock recent activities derived from local work orders
    const workOrders = await getWorkOrders();
    const now = () => new Date().toISOString();

    const activities = [
      ...workOrders.slice(0, 5).map((wo, idx) => ({
        id: `act-${wo.id}`,
        type: wo.status === 'completed' ? 'completed' : wo.status === 'overdue' ? 'overdue' : 'work_order',
        title: wo.title,
        description: `${wo.woNumber} — ${wo.assignedTo?.name || 'Unassigned'}`,
        timestamp: wo.createdAt || now(),
      })),
      {
        id: 'act-manual-1',
        type: 'maintenance',
        title: 'PM schedule created',
        description: 'New PM schedule created for HVAC units',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
    ];

    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
};


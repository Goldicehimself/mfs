import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Clock, BarChart3 } from 'lucide-react';

// Components
import KPICard from '../components/dashboard/KPICards';
import RecentActivity from '../components/dashboard/RecentActivity';
import ComplianceChart from '../components/dashboard/Charts/ComplianceChart';
import CostAnalysisChart from '../components/dashboard/Charts/CostAnalysisChart';

// API
import { getDashboardData } from '../api/dashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useActivity } from '../contexts/ActivityContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { addActivity } = useActivity();
  const { data: dashboardData, isLoading } = useQuery(
    'dashboard',
    getDashboardData,
    {
      refetchInterval: 30000,
      onError: (error) => {
        toast.error('Failed to load dashboard data');
      },
    }
  );

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || token.startsWith('local-')) return;

    const apiBase = import.meta.env.VITE_API_URL || '/api';
    const streamUrl = `${apiBase.replace(/\/$/, '')}/activities/stream?token=${encodeURIComponent(token)}`;
    const stream = new EventSource(streamUrl);

    const iconForType = (type) => {
      if (type.startsWith('workorder')) return 'WO';
      if (type.startsWith('asset')) return 'AS';
      if (type.startsWith('maintenance')) return 'PM';
      return 'EV';
    };

    const mapActivity = (payload) => {
      const type = payload.type || 'event';
      const action = type.includes('created')
        ? 'created'
        : type.includes('deleted')
        ? 'deleted'
        : type.includes('comment')
        ? 'comment'
        : type.includes('assigned')
        ? 'assigned'
        : type.includes('status')
        ? 'status'
        : 'updated';

      return {
        id: `${type}-${payload.entityId || Date.now()}`,
        type,
        action,
        title: payload.message || 'Activity',
        description: payload.entityType || '',
        timestamp: payload.createdAt || new Date().toISOString(),
        icon: iconForType(type),
        status: null,
      };
    };

    stream.addEventListener('activity', (event) => {
      try {
        const payload = JSON.parse(event.data);
        const mapped = mapActivity(payload);
        setRecentActivities((prev) => [mapped, ...prev].slice(0, 20));
      } catch (e) {
        // ignore parse errors
      }
    });

    return () => {
      stream.close();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-3"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const defaultDashboardData = {
    openWorkOrders: 24,
    overdueWorkOrders: 5,
    pmCompliance: 87,
    pendingRequests: 12,
    activeAssets: 156,
    vendorPerformance: 92,
    complianceTrend: [
      { month: 'Jan', compliance: 78, target: 85, completed: 45, pending: 12 },
      { month: 'Feb', compliance: 82, target: 85, completed: 52, pending: 8 },
      { month: 'Mar', compliance: 80, target: 85, completed: 48, pending: 10 },
      { month: 'Apr', compliance: 85, target: 85, completed: 56, pending: 6 },
      { month: 'May', compliance: 88, target: 85, completed: 62, pending: 5 },
      { month: 'Jun', compliance: 87, target: 85, completed: 59, pending: 4 },
    ],
    costAnalysis: null,
    serviceCategories: [
      { name: 'HVAC', count: 45, trend: 'up' },
      { name: 'Electrical', count: 32, trend: 'down' },
      { name: 'Plumbing', count: 28, trend: 'up' },
      { name: 'General', count: 51, trend: 'up' },
    ],
  };

  const safeDashboardData = dashboardData && Object.keys(dashboardData).length
    ? dashboardData
    : defaultDashboardData;

  const kpis = [
    {
      title: 'Open Work Orders',
      value: safeDashboardData.openWorkOrders || 0,
      change: '+12%',
      trend: 'up',
      icon: '📋',
      color: 'primary',
      link: '/work-orders?status=open',
    },
    {
      title: 'Overdue',
      value: safeDashboardData.overdueWorkOrders || 0,
      change: '-5%',
      trend: 'down',
      icon: '⚠️',
      color: 'error',
      link: '/work-orders?status=overdue',
    },
    {
      title: 'PM Compliance',
      value: `${safeDashboardData.pmCompliance || 0}%`,
      change: '+8%',
      trend: 'up',
      icon: '✓',
      color: 'success',
      link: '/preventive-maintenance',
    },
    {
      title: 'Pending Requests',
      value: safeDashboardData.pendingRequests || 0,
      change: '+3%',
      trend: 'up',
      icon: '📝',
      color: 'warning',
      link: '/service-requests',
    },
    {
      title: 'Active Assets',
      value: safeDashboardData.activeAssets || 0,
      change: '+2%',
      trend: 'up',
      icon: '🏭',
      color: 'info',
      link: '/assets',
    },
    {
      title: 'Vendor Performance',
      value: `${safeDashboardData.vendorPerformance || 0}%`,
      change: '+4%',
      trend: 'up',
      icon: '👥',
      color: 'secondary',
      link: '/vendors',
    },
  ];


  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 rounded-lg p-6 border border-indigo-200 dark:border-indigo-800">
        <h1 className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">Dashboard</h1>
        <p className="text-indigo-700 dark:text-indigo-300 mt-1">
          Complete overview of your facility maintenance operations
        </p>
      </div>

      {/* Quick Actions Banner */}
      <Card className="border-0 shadow-md bg-blue-800 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">Quick Actions</h2>
              <p className="text-indigo-100">
                Quickly submit a maintenance request or create a new work order
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                className="bg-white text-indigo-600 hover:bg-indigo-50 font-medium"
                onClick={() => {
                  addActivity({
                    type: 'user_action',
                    action: 'created',
                    title: 'New Service Request Initiated',
                    description: 'User started creating a new maintenance request',
                    user: 'Current User',
                    status: 'pending',
                  });
                  navigate('/service-requests/new');
                }}
              >
                📝 New Request
              </Button>
              <Button 
                variant="outline"
                className="border-white text-white hover:bg-blue-800"
                onClick={() => {
                  addActivity({
                    type: 'work_order',
                    action: 'created',
                    title: 'New Work Order Created',
                    description: 'User initiated work order creation',
                    user: 'Current User',
                    status: 'pending',
                  });
                  navigate('/work-orders/new');
                }}
              >
                🔧 Create Work Order
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Charts (Left) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Compliance Chart */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Preventive Maintenance Compliance
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track PM compliance trends over time
                  </p>
                </div>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ComplianceChart data={safeDashboardData.complianceTrend} />
            </CardContent>
          </Card>

          {/* Cost Analysis Chart */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Maintenance Cost Analysis
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Monthly maintenance expenses
                  </p>
                </div>
                <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CostAnalysisChart data={safeDashboardData.costAnalysis} />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity (Right) */}
        <div>
          <Card className="border-0 shadow-md h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Recent Activity
                </h3>
                <div className="p-2 bg-amber-50 dark:bg-amber-950 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RecentActivity activities={recentActivities} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Service Categories */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Service Categories
            </h3>
            <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {safeDashboardData.serviceCategories?.map((category) => (
              <div key={category.name} className="text-center p-4 rounded-lg bg-gray-50 dark:bg-zinc-800 hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                  {category.count}
                </div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  {category.name}
                </p>
                <Badge 
                  variant={category.trend === 'up' ? 'default' : 'secondary'}
                  className={category.trend === 'up' 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100' 
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100'
                  }
                >
                  {category.trend === 'up' ? 'Up' : 'Down'} {category.trend === 'up' ? 'Increasing' : 'Decreasing'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;



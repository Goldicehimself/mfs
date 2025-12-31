import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Assignment,
  Warning,
  CheckCircle,
  Schedule,
  Build,
  Business,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Components
import KPICard from '../components/dashboard/KPICards';
import RecentActivity from '../components/dashboard/RecentActivity';
import ComplianceChart from '../components/dashboard/Charts/ComplianceChart';
import CostAnalysisChart from '../components/dashboard/Charts/CostAnalysisChart';

// API
import { getDashboardData, getRecentActivities } from '../api/dashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const { data: dashboardData, isLoading } = useQuery(
    'dashboard',
    getDashboardData,
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      onError: (error) => {
        toast.error('Failed to load dashboard data');
      },
    }
  );

  const { data: recentActivities } = useQuery(
    'recentActivities',
    getRecentActivities
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  const kpis = [
    {
      title: 'Open Work Orders',
      value: dashboardData?.openWorkOrders || 0,
      change: '+12%',
      trend: 'up',
      icon: <Assignment />,
      color: 'primary',
      link: '/work-orders?status=open',
    },
    {
      title: 'Overdue',
      value: dashboardData?.overdueWorkOrders || 0,
      change: '-5%',
      trend: 'down',
      icon: <Warning />,
      color: 'error',
      link: '/work-orders?status=overdue',
    },
    {
      title: 'PM Compliance',
      value: `${dashboardData?.pmCompliance || 0}%`,
      change: '+8%',
      trend: 'up',
      icon: <CheckCircle />,
      color: 'success',
      link: '/preventive-maintenance',
    },
    {
      title: 'Pending Requests',
      value: dashboardData?.pendingRequests || 0,
      change: '+3%',
      trend: 'up',
      icon: <Schedule />,
      color: 'warning',
      link: '/service-requests',
    },
    {
      title: 'Active Assets',
      value: dashboardData?.activeAssets || 0,
      change: '+2%',
      trend: 'up',
      icon: <Business />,
      color: 'info',
      link: '/assets',
    },
    {
      title: 'Vendor Performance',
      value: `${dashboardData?.vendorPerformance || 0}%`,
      change: '+4%',
      trend: 'up',
      icon: <Build />,
      color: 'secondary',
      link: '/vendors',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of your facility maintenance operations
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 4, backgroundColor: 'primary.light', color: 'white' }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Need to report an issue?
            </Typography>
            <Typography variant="body2">
              Quickly submit a maintenance request or create a new work order
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Assignment />}
                onClick={() => navigate('/service-requests/new')}
                fullWidth
              >
                New Request
              </Button>
              <Button
                variant="outlined"
                sx={{ color: 'white', borderColor: 'white' }}
                startIcon={<Build />}
                onClick={() => navigate('/work-orders/new')}
                fullWidth
              >
                Create Work Order
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* KPIs Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpis.map((kpi, index) => (
          <Grid item xs={12} sm={6} lg={4} key={index}>
            <KPICard {...kpi} />
          </Grid>
        ))}
      </Grid>

      {/* Charts and Recent Activity */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          <Grid container spacing={3}>
            {/* Compliance Chart */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Preventive Maintenance Compliance
                </Typography>
                <ComplianceChart data={dashboardData?.complianceTrend} />
              </Paper>
            </Grid>

            {/* Cost Analysis */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Maintenance Cost Analysis
                </Typography>
                <CostAnalysisChart data={dashboardData?.costAnalysis} />
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Right Column - Recent Activity */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Activity
            </Typography>
            <RecentActivity activities={recentActivities} />
          </Paper>
        </Grid>
      </Grid>

      {/* Service Category Summary */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Service Categories Summary
        </Typography>
        <Grid container spacing={2}>
          {dashboardData?.serviceCategories?.map((category) => (
            <Grid item xs={6} sm={4} md={2} key={category.name}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="primary" sx={{ mb: 1 }}>
                    {category.count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.name}
                  </Typography>
                  <Chip
                    label={category.trend}
                    size="small"
                    sx={{ mt: 1 }}
                    color={category.trend === 'up' ? 'success' : 'error'}
                    icon={category.trend === 'up' ? <TrendingUp /> : <TrendingDown />}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default Dashboard;
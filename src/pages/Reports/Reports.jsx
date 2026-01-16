import React, { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tooltip as MuiTooltip,
  Divider,
  Container,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
} from 'lucide-react';
import { fetchReports, exportReport } from '../../api/reports';

const ReportsPage = () => {
  const [timeRange, setTimeRange] = useState('Last 30 days');
  const [activeFilter, setActiveFilter] = useState('All Status');

  const { data: reports = {} } = useQuery('reports', fetchReports);

  const {
    summary = {},
    workOrderTrends = [],
    costBreakdown = [],
    assetPerformance = {},
    scheduleOverview = [],
  } = reports;

  const handleExportReport = async () => {
    await exportReport('pdf');
  };

  const getTrendColor = (value) => {
    return value >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';
  };

  const getTrendBgColor = (value) => {
    return value >= 0
      ? 'bg-emerald-100 dark:bg-emerald-900'
      : 'bg-rose-100 dark:bg-rose-900';
  };

  return (
    <Container maxWidth="xl" sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)', py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: '#1f2937' }}>
            Reports & Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 400 }}>
            Monitor maintenance performance and analyze operational trends
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="Last 7 days">Last 7 days</MenuItem>
              <MenuItem value="Last 30 days">Last 30 days</MenuItem>
              <MenuItem value="Last 90 days">Last 90 days</MenuItem>
              <MenuItem value="Last Year">Last Year</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" size="small" startIcon={<Download size={14} />} sx={{ fontWeight: 600, textTransform: 'none', fontSize: '0.85rem' }}>
            Export Report
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Work Orders */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderLeft: '6px solid #4f46e5', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.12)', transform: 'translateY(-2px)' } }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Total Work Orders
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>
                    {summary.totalWorkOrders?.toLocaleString() || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#4f46e520', width: 42, height: 42, color: '#4f46e5' }}>
                  <TrendingUp size={18} />
                </Avatar>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip
                  label="+8%"
                  size="small"
                  color="success"
                  variant="filled"
                  sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                  Last 30 days
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Completion Rate */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderLeft: '6px solid #059669', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.12)', transform: 'translateY(-2px)' } }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Completion Rate
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>
                    {summary.completionRate || 0}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#05966920', width: 42, height: 42, color: '#059669' }}>
                  <TrendingUp size={18} />
                </Avatar>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip
                  label="+3%"
                  size="small"
                  color="success"
                  variant="filled"
                  sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                  Last 30 days
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Avg Response Time */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderLeft: '6px solid #dc2626', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.12)', transform: 'translateY(-2px)' } }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Avg Response Time
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>
                    {summary.avgResponseTime || 0}h
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#dc262620', width: 42, height: 42, color: '#dc2626' }}>
                  <TrendingDown size={18} />
                </Avatar>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip
                  label="-12%"
                  size="small"
                  color="error"
                  variant="filled"
                  sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                  Last 30 days
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Costs */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderLeft: '6px solid #d97706', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.12)', transform: 'translateY(-2px)' } }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Total Costs
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>
                    ${(summary.totalCosts / 1000).toFixed(1)}K
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#d9770620', width: 42, height: 42, color: '#d97706' }}>
                  <DollarSign size={18} />
                </Avatar>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip
                  label="+3%"
                  size="small"
                  color="success"
                  variant="filled"
                  sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                  Last 30 days
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Grid - Top Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Work Order Trends */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: '#4f46e520', color: '#4f46e5', width: 36, height: 36 }}>
                    <TrendingUp size={16} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>Work Order Trends</Typography>
                </Box>
                <Button size="small" variant="text" sx={{ textTransform: 'none', fontWeight: 600, color: '#4f46e5', fontSize: '0.8rem' }}>View Details</Button>
              </Box>
              <Divider sx={{ mb: 2.5 }} />
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workOrderTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                  <Bar dataKey="overdue" fill="#ef4444" name="Overdue" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Cost Breakdown */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: '#d9770620', color: '#d97706', width: 36, height: 36 }}>
                    <DollarSign size={16} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>Cost Breakdown</Typography>
                </Box>
                <Button size="small" variant="text" sx={{ textTransform: 'none', fontWeight: 600, color: '#4f46e5', fontSize: '0.8rem' }}>View Details</Button>
              </Box>
              <Divider sx={{ mb: 2.5 }} />
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={costBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {costBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                    }}
                    formatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry) => `${value}: $${(entry.payload.value / 1000).toFixed(0)}K`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Grid - Bottom Row */}
      <Grid container spacing={3}>
        {/* Asset Performance */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: '#05966920', color: '#059669', width: 36, height: 36 }}>
                    <CheckCircle size={16} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>Asset Performance</Typography>
                </Box>
                <Button size="small" variant="text" sx={{ textTransform: 'none', fontWeight: 600, color: '#4f46e5', fontSize: '0.8rem' }}>View All</Button>
              </Box>
              <Divider sx={{ mb: 2.5 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Active Assets */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                    Active Assets
                  </Typography>
                  <Chip label={`${assetPerformance.assetsTrend >= 0 ? '+' : ''}${assetPerformance.assetsTrend}%`} size="small" color={assetPerformance.assetsTrend >= 0 ? 'success' : 'error'} variant="outlined" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827' }}>
                  {assetPerformance.activeAssets || 0}
                </Typography>

                {/* Uptime */}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                    Uptime
                  </Typography>
                  <Chip label={`${assetPerformance.uptimeTrend >= 0 ? '+' : ''}${assetPerformance.uptimeTrend}%`} size="small" color={assetPerformance.uptimeTrend >= 0 ? 'success' : 'error'} variant="outlined" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827' }}>
                  {assetPerformance.uptime || 0}%
                </Typography>

                {/* Critical Issues */}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                    Critical Issues
                  </Typography>
                  <Chip label={`${assetPerformance.criticalTrend >= 0 ? '+' : ''}${assetPerformance.criticalTrend}%`} size="small" color={assetPerformance.criticalTrend >= 0 ? 'success' : 'error'} variant="outlined" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827' }}>
                  {assetPerformance.criticalIssues || 0}
                </Typography>

                {/* Repair Costs */}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                    Repair Costs
                  </Typography>
                  <Chip label={`${assetPerformance.repairTrend >= 0 ? '+' : ''}${assetPerformance.repairTrend}%`} size="small" color={assetPerformance.repairTrend >= 0 ? 'success' : 'error'} variant="outlined" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827' }}>
                  ${(assetPerformance.repairCosts / 1000).toFixed(1)}K
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Schedule Overview */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: '#4f46e520', color: '#4f46e5', width: 36, height: 36 }}>
                    <Clock size={16} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>Schedule Overview</Typography>
                </Box>
                <Button size="small" variant="text" sx={{ textTransform: 'none', fontWeight: 600, color: '#4f46e5', fontSize: '0.8rem' }}>Manage</Button>
              </Box>
              <Divider sx={{ mb: 2.5 }} />
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={scheduleOverview}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="scheduled"
                    stroke="#4f46e5"
                    dot={{ fill: '#4f46e5', r: 5 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Alert + Quick Filters */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Alert */}
            <Card sx={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                  <AlertCircle size={20} />
                  <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.5 }}>
                    HVAC system efficiency down 15% this week. Schedule preventive maintenance.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" size="small" sx={{ flex: 1, backgroundColor: 'white', color: '#4f46e5', fontWeight: 600, textTransform: 'none', '&:hover': { backgroundColor: '#f3f4f6' } }}>
                    Schedule Now
                  </Button>
                  <Button variant="outlined" size="small" sx={{ borderColor: 'white', color: 'white', fontWeight: 600, textTransform: 'none', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'white' } }}>
                    Later
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Quick Filters */}
            <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem', mb: 2 }}>
                  Quick Filters
                </Typography>
                <Divider sx={{ mb: 2.5 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {['This Week', 'This Month', 'Custom'].map((filter) => (
                    <Chip
                      key={filter}
                      label={filter}
                      clickable
                      variant={timeRange === filter ? 'filled' : 'outlined'}
                      color={timeRange === filter ? 'primary' : 'default'}
                      size="small"
                      onClick={() => setTimeRange(filter)}
                      sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {['All Status', 'Critical'].map((filter) => (
                    <Chip
                      key={filter}
                      label={filter}
                      clickable
                      variant={activeFilter === filter ? 'filled' : 'outlined'}
                      color={activeFilter === filter ? 'primary' : 'default'}
                      size="small"
                      onClick={() => setActiveFilter(filter)}
                      sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ReportsPage;


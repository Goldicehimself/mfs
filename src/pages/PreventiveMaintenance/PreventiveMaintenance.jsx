import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  Container,
} from '@mui/material';
import { Plus, Calendar, TrendingUp, AlertCircle, DownloadCloud, FilePlus, Clock, ChevronRight } from 'lucide-react';
import PMCalendar from '../../components/preventiveMaintenance/PMCalendar';
import ComplianceChart from '../../components/preventiveMaintenance/ComplianceChart';
import { useActivity } from '../../contexts/ActivityContext';

const PreventiveMaintenance = () => {
  const navigate = useNavigate();
  const { addActivity } = useActivity();
  const [currentMonth] = useState(new Date(2024, 11)); // December 2024
  const pmTasks = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('pm_tasks') || '[]');
    } catch (error) {
      return [];
    }
  }, []);

  const kpiData = [
    { label: 'Scheduled Tasks', value: '247', trend: '+3%', color: '#4f46e5', icon: <Calendar size={18} /> },
    { label: 'Compliance Rate', value: '94.2%', trend: '+2%', color: '#059669', icon: <TrendingUp size={18} /> },
    { label: 'Overdue Tasks', value: '18', trend: '-5%', color: '#dc2626', icon: <AlertCircle size={18} /> },
    { label: 'Monthly Spending', value: '$82K', trend: '+8%', color: '#d97706', icon: <DownloadCloud size={18} /> },
  ];

  const complianceMetrics = [
    { name: 'Overall Compliance', value: 94.2, color: '#10b981' },
    { name: 'Safety Compliance', value: 98.5, color: '#06b6d4' },
    { name: 'Equipment Compliance', value: 87.3, color: '#f59e0b' },
    { name: 'Environmental', value: 88.1, color: '#8b5cf6' },
  ];

  const quickActions = [
    { label: 'Create Maintenance Task', icon: <FilePlus size={16} />, color: '#4f46e5' },
    { label: 'Schedule Inspection', icon: <Calendar size={16} />, color: '#059669' },
    { label: 'Generate Report', icon: <DownloadCloud size={16} />, color: '#d97706' },
    { label: 'View Overdue Tasks', icon: <AlertCircle size={16} />, color: '#dc2626' },
  ];

  const upcomingDeadlines = [
    { task: 'Fire Safety Inspection', daysLeft: 7, priority: 'high', date: 'Jan 17 2026' },
    { task: 'HVAC Filter Replacement', daysLeft: 14, priority: 'medium', date: 'Jan 24 2026' },
    { task: 'Elevator Maintenance', daysLeft: 11, priority: 'high', date: 'Jan 20 2026' },
  ];

  return (
    <Container maxWidth="xl" sx={{ minHeight: '100vh', py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, p: 3, background: 'linear-gradient(to right, rgba(99, 102, 241, 0.05), rgba(59, 130, 246, 0.05))', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: '#1e3a8a' }}>
          Preventive Maintenance
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 400, color: '#3f4a5a' }}>
          Real-time monitoring of scheduled tasks, compliance metrics, and maintenance schedules
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiData.map((kpi, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{ height: '100%', borderLeft: `6px solid ${kpi.color}`, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.12)', transform: 'translateY(-2px)' } }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box>
                    <Typography variant="caption" color="#9ca3af" sx={{ mb: 0.5, display: 'block', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      {kpi.label}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>
                      {kpi.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: `${kpi.color}20`, width: 42, height: 42, color: kpi.color }}>
                    {kpi.icon}
                  </Avatar>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    label={kpi.trend}
                    size="small"
                    color={kpi.trend.includes('+') && !kpi.label.includes('Overdue') ? 'success' : 'error'}
                    variant="filled"
                    sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                  />
                  <Typography variant="caption" color="#9ca3af" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                    Last 30 days
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Calendar and Compliance */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Calendar */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: '#4f46e520', color: '#4f46e5', width: 36, height: 36 }}>
                    <Calendar size={16} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>Maintenance Calendar</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Button size="small" variant="outlined" startIcon={<Clock size={12} />} sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', borderColor: '#e5e7eb', color: '#6b7280', '&:hover': { bgcolor: '#f9fafb', borderColor: '#d1d5db' } }}>
                    This Month
                  </Button>
                  <Button size="small" variant="contained" startIcon={<Plus size={14} />} sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', py: 0.75, px: 1.5 }}>
                    Schedule
                  </Button>
                </Box>
              </Box>
              <Divider sx={{ mb: 2.5 }} />
              <PMCalendar />
            </CardContent>
          </Card>
        </Grid>

        {/* Compliance Overview */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: '#05966920', color: '#059669', width: 36, height: 36 }}>
                    <TrendingUp size={16} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>Compliance Overview</Typography>
                </Box>
                <Button 
                  size="small" 
                  variant="text" 
                  onClick={() => alert('Viewing compliance details...')}
                  sx={{ textTransform: 'none', fontWeight: 600, color: '#4f46e5', fontSize: '0.8rem' }}
                >
                  Details
                </Button>
              </Box>
              <Divider sx={{ mb: 2.5 }} />
              <Stack spacing={2.5}>
                {complianceMetrics.map((metric, idx) => (
                  <Box key={idx}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75, alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>
                        {metric.name}
                      </Typography>
                      <Chip label={`${metric.value}%`} size="small" sx={{ fontWeight: 700, color: metric.color, fontSize: '0.75rem' }} />
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={metric.value}
                      sx={{
                        height: 8,
                        borderRadius: 8,
                        backgroundColor: '#e5e7eb',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: metric.color,
                          borderRadius: 8,
                          boxShadow: `0 0 8px ${metric.color}40`,
                        }
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Trends and Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Trends Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: '#d9760020', color: '#d97706', width: 36, height: 36 }}>
                    <TrendingUp size={16} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>Maintenance Trends</Typography>
                </Box>
                <Button 
                  size="small" 
                  variant="text" 
                  onClick={() => alert('Viewing maintenance trends report...')}
                  sx={{ textTransform: 'none', fontWeight: 600, color: '#4f46e5', fontSize: '0.8rem' }}
                >
                  View Report
                </Button>
              </Box>
              <Divider sx={{ mb: 2.5 }} />
              <ComplianceChart />
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Avatar sx={{ bgcolor: '#4f46e520', color: '#4f46e5', width: 36, height: 36 }}>
                  <Plus size={16} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>
                  Quick Actions
                </Typography>
              </Box>
              <Divider sx={{ mb: 2.5 }} />
              <Stack spacing={1}>
                {quickActions.map((action, idx) => {
                  const getActionHandler = () => {
                    const handlers = {
                      0: () => {
                        addActivity({
                          type: 'pm_scheduled',
                          action: 'created',
                          title: 'New PM Task Created',
                          description: 'User initiated PM task creation',
                          user: 'Current User',
                          status: 'pending',
                        });
                        navigate('/preventive-maintenance/new');
                      },
                      1: () => {
                        addActivity({
                          type: 'system',
                          action: 'viewed',
                          title: 'Asset Schedule Viewed',
                          description: 'User accessed asset maintenance schedule',
                          user: 'Current User',
                          status: 'in_progress',
                        });
                        navigate('/preventive-maintenance/schedule');
                      },
                      2: () => {
                        addActivity({
                          type: 'report_generated',
                          action: 'viewed',
                          title: 'Compliance Report Viewed',
                          description: 'User checked compliance metrics',
                          user: 'Current User',
                          status: 'active',
                        });
                        navigate('/preventive-maintenance/compliance');
                      },
                      3: () => {
                        addActivity({
                          type: 'alert',
                          action: 'viewed',
                          title: 'Overdue Tasks Reviewed',
                          description: 'User checked overdue maintenance tasks',
                          user: 'Current User',
                          status: 'pending',
                        });
                        navigate('/preventive-maintenance/overdue');
                      },
                    };
                    return handlers[idx] || (() => {});
                  };
                  
                  return (
                    <Button
                      key={idx}
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={getActionHandler()}
                      sx={{
                        justifyContent: 'flex-start',
                        p: 1,
                        borderColor: '#e5e7eb',
                        color: '#111827',
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: `${action.color}10`,
                          borderColor: action.color,
                          color: action.color,
                        }
                      }}
                    >
                      <Avatar sx={{ width: 28, height: 28, bgcolor: `${action.color}20`, color: action.color, mr: 1, fontSize: '0.75rem' }}>
                        {action.icon}
                      </Avatar>
                      <span style={{ textAlign: 'left', fontSize: '0.85rem' }}>{action.label}</span>
                    </Button>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tasks and Deadlines */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: '#2563eb20', color: '#2563eb', width: 36, height: 36 }}>
                    <FilePlus size={16} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>Recent PM Tasks</Typography>
                </Box>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => navigate('/preventive-maintenance/new')}
                  sx={{ textTransform: 'none', fontWeight: 600, color: '#4f46e5', fontSize: '0.8rem' }}
                >
                  New Task
                </Button>
              </Box>
              <Divider sx={{ mb: 2.5 }} />
              {pmTasks.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No PM tasks yet. Create one to see it here.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {pmTasks.slice(0, 5).map((task) => (
                    <Box
                      key={task.id}
                      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: '#f9fafb', borderRadius: 1 }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem' }}>
                          {task.title}
                        </Typography>
                        <Typography variant="caption" color="#6b7280" sx={{ fontWeight: 500 }}>
                          {task.asset} • Due {task.dueDate || 'TBD'}
                        </Typography>
                      </Box>
                      <Chip
                        label={(task.priority || 'medium').charAt(0).toUpperCase() + (task.priority || 'medium').slice(1)}
                        size="small"
                        color={task.priority === 'critical' || task.priority === 'high' ? 'error' : 'warning'}
                        variant="filled"
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: '#dc262620', color: '#dc2626', width: 36, height: 36 }}>
                    <AlertCircle size={16} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>Upcoming Deadlines</Typography>
                </Box>
                <Button 
                  size="small" 
                  variant="text" 
                  onClick={() => alert('Viewing all upcoming deadlines...')}
                  sx={{ textTransform: 'none', fontWeight: 600, color: '#4f46e5', fontSize: '0.8rem' }}
                >
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 2.5 }} />
              <Stack spacing={0}>
                {upcomingDeadlines.map((deadline, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: idx % 2 === 0 ? '#f9fafb' : '#ffffff', borderRadius: idx === 0 ? '8px 8px 0 0' : idx === upcomingDeadlines.length - 1 ? '0 0 8px 8px' : '0', borderBottom: idx !== upcomingDeadlines.length - 1 ? '1px solid #e5e7eb' : 'none', transition: 'all 0.2s ease', '&:hover': { bgcolor: '#f3f4f6' } }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: '#111827', mb: 0.25, fontSize: '0.9rem' }}>{deadline.task}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Typography variant="caption" color="#6b7280" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>{deadline.date}</Typography>
                        <Box sx={{ width: 3, height: 3, bgcolor: '#d1d5db', borderRadius: '50%' }} />
                        <Typography variant="caption" color="#6b7280" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>Due in {deadline.daysLeft}d</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={`${deadline.priority.charAt(0).toUpperCase() + deadline.priority.slice(1)}`} size="small" color={deadline.priority === 'high' ? 'error' : 'warning'} variant="filled" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PreventiveMaintenance;


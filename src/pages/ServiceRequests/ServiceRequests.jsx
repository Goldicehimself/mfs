import React, { useState } from 'react';
import {
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Avatar,
  Pagination,
  InputAdornment,
} from '@mui/material';
import { Search, Plus, TrendingUp, Clock, AlertCircle } from 'lucide-react';

const ServiceRequests = () => {
  const [currentTab, setCurrentTab] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // KPI Data with better structure
  const kpiData = [
    {
      label: 'Total Requests',
      value: '247',
      trend: '+8%',
      icon: Clock,
      color: '#3b82f6',
      bgColor: '#eff6ff',
      description: 'Total service requests',
    },
    {
      label: 'Pending Review',
      value: '43',
      trend: '+12%',
      icon: AlertCircle,
      color: '#f59e0b',
      bgColor: '#fffbeb',
      description: 'Awaiting assignment',
    },
    {
      label: 'In Progress',
      value: '67',
      trend: '+5%',
      icon: TrendingUp,
      color: '#10b981',
      bgColor: '#f0fdf4',
      description: 'Currently being worked on',
    },
    {
      label: 'Completed Today',
      value: '15',
      trend: '+3%',
      icon: '✓',
      color: '#06b6d4',
      bgColor: '#ecfdf5',
      description: 'Finished requests',
    },
  ];

  // Mock Service Requests Data
  const allRequests = [
    {
      id: '#2847',
      title: 'HVAC System Not Cooling',
      description: 'Air conditioning unit in conference room',
      requester: { name: 'Sarah Chen', role: 'Marketing', avatar: '👩', initials: 'SC' },
      location: 'Conference Room A',
      priority: 'high',
      status: 'pending',
      statusAssignee: 'pending 2 hours ago',
      action: 'Assign',
    },
    {
      id: '#2846',
      title: 'Leaky Faucet in Restroom',
      description: 'Water dripping from main sink',
      requester: { name: 'Mike Johnson', role: 'Operations', avatar: '👨', initials: 'MJ' },
      location: 'Floor 2 Restroom',
      priority: 'medium',
      status: 'assigned',
      statusAssignee: 'Assigned Tom Wilson',
      action: 'View',
    },
    {
      id: '#2845',
      title: 'Broken Office Chair',
      description: 'Armrest detached, needs repair',
      requester: { name: 'Lisa Park', role: 'Finance', avatar: '👩‍💼', initials: 'LP' },
      location: 'Desk 238',
      priority: 'low',
      status: 'in-progress',
      statusAssignee: '',
      action: 'View',
    },
    {
      id: '#2844',
      title: 'Light Bulb Replacement',
      description: 'Ceiling light flickering in hallway',
      requester: { name: 'Emma Davis', role: 'HR', avatar: '👩', initials: 'ED' },
      location: 'Main Hallway',
      priority: 'low',
      status: 'completed',
      statusAssignee: 'Yesterday',
      action: 'View',
    },
    {
      id: '#2843',
      title: 'Printer Paper Jam',
      description: 'Main printer needs servicing',
      requester: { name: 'Alex Rodriguez', role: 'IT', avatar: '👨', initials: 'AR' },
      location: 'Copy Room',
      priority: 'medium',
      status: 'pending',
      statusAssignee: 'pending 4 hours ago',
      action: 'Assign',
    },
  ];

  // Filter requests
  const filteredRequests =
    currentTab === 'all'
      ? allRequests
      : allRequests.filter((r) => r.status === currentTab);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const displayedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const tabs = [
    { label: 'All', value: 'all', count: allRequests.length },
    { label: 'Pending', value: 'pending', count: allRequests.filter(r => r.status === 'pending').length },
    { label: 'Assigned', value: 'assigned', count: allRequests.filter(r => r.status === 'assigned').length },
    { label: 'In Progress', value: 'in-progress', count: allRequests.filter(r => r.status === 'in-progress').length },
    { label: 'Completed', value: 'completed', count: allRequests.filter(r => r.status === 'completed').length },
  ];

  const getPriorityColor = (priority) => {
    const colors = {
      high: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
      medium: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
      low: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
    };
    return colors[priority] || { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' };
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: '#fef3c7', text: '#92400e', border: '#fde68a', label: 'Pending' },
      assigned: { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe', label: 'Assigned' },
      'in-progress': { bg: '#dbeafe', text: '#0c4a6e', border: '#7dd3fc', label: 'In Progress' },
      completed: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0', label: 'Completed' },
    };
    return colors[status] || { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' };
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 0.5,
            color: '#0f172a',
            fontSize: { xs: '28px', md: '32px' },
          }}
        >
          Service Requests
        </Typography>
        <Typography variant="body2" color="#64748b" sx={{ fontSize: '15px' }}>
          Manage and track maintenance service requests across your facility
        </Typography>
      </Box>

      {/* KPI Cards - Enhanced Design */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiData.map((kpi, idx) => {
          const Icon = typeof kpi.icon === 'string' ? null : kpi.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    borderColor: kpi.color,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '10px',
                      background: kpi.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: kpi.color,
                    }}
                  >
                    {Icon ? <Icon size={24} /> : <span style={{ fontSize: '24px' }}>{kpi.icon}</span>}
                  </Box>
                  <Chip
                    label={kpi.trend}
                    size="small"
                    sx={{
                      background: kpi.trend.includes('+') ? '#dcfce7' : '#fee2e2',
                      color: kpi.trend.includes('+') ? '#166534' : '#991b1b',
                      fontWeight: 700,
                      fontSize: '12px',
                    }}
                  />
                </Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}
                >
                  {kpi.value}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '13px' }}>
                  {kpi.description}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Main Content Paper */}
      <Paper
        elevation={0}
        sx={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          overflow: 'hidden',
        }}
      >
        {/* Toolbar */}
        <Box sx={{ p: 4, borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          {/* Tab Filters */}
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              {tabs.map((tab) => (
                <Button
                  key={tab.value}
                  variant={currentTab === tab.value ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => {
                    setCurrentTab(tab.value);
                    setCurrentPage(1);
                  }}
                  sx={{
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '13px',
                    textTransform: 'none',
                    ...(currentTab === tab.value
                      ? {
                          background: '#3b82f6',
                          color: '#fff',
                          border: 'none',
                        }
                      : {
                          color: '#64748b',
                          borderColor: '#e2e8f0',
                          '&:hover': {
                            background: '#f1f5f9',
                            borderColor: '#cbd5e1',
                          },
                        }),
                  }}
                >
                  {tab.label} <span style={{ marginLeft: '6px', opacity: 0.7 }}>({tab.count})</span>
                </Button>
              ))}
            </Stack>
          </Box>

          {/* Search and Controls */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              alignItems: { xs: 'stretch', md: 'center' },
              justifyContent: 'space-between',
            }}
          >
            <TextField
              placeholder="Search requests by ID, title, or requester..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} style={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  background: '#fff',
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: '#e2e8f0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#cbd5e1',
                  },
                },
              }}
            />
            <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
              <TextField
                select
                size="small"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{
                  minWidth: 150,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '& fieldset': {
                      borderColor: '#e2e8f0',
                    },
                  },
                }}
              >
                <MenuItem value="date">Sort by Date</MenuItem>
                <MenuItem value="priority">Sort by Priority</MenuItem>
                <MenuItem value="status">Sort by Status</MenuItem>
              </TextField>
              <Button
                variant="contained"
                startIcon={<Plus size={18} />}
                sx={{
                  background: '#3b82f6',
                  color: '#fff',
                  borderRadius: '8px',
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 3,
                  '&:hover': {
                    background: '#2563eb',
                  },
                }}
              >
                New Request
              </Button>
            </Stack>
          </Box>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>Request</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>Requester</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedRequests.map((request, idx) => {
                const priorityColor = getPriorityColor(request.priority);
                const statusColor = getStatusColor(request.status);
                return (
                  <TableRow
                    key={idx}
                    sx={{
                      borderBottom: '1px solid #e2e8f0',
                      '&:hover': {
                        background: '#f8fafc',
                      },
                      '&:last-child td, &:last-child th': {
                        border: 0,
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: '#3b82f6',
                        fontSize: '13px',
                      }}
                    >
                      {request.id}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: '14px',
                            color: '#0f172a',
                            mb: 0.5,
                          }}
                        >
                          {request.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: '#64748b', fontSize: '12px' }}
                        >
                          {request.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            fontSize: '16px',
                            background: '#dbeafe',
                            color: '#0c4a6e',
                            fontWeight: 600,
                          }}
                        >
                          {request.requester.initials}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                            {request.requester.name}
                          </Typography>
                          <Typography sx={{ fontSize: '11px', color: '#64748b' }}>
                            {request.requester.role}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#475569', fontSize: '13px' }}>
                      {request.location}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                        size="small"
                        sx={{
                          background: priorityColor.bg,
                          color: priorityColor.text,
                          fontWeight: 700,
                          fontSize: '11px',
                          border: `1px solid ${priorityColor.border}`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={statusColor.label}
                          size="small"
                          sx={{
                            background: statusColor.bg,
                            color: statusColor.text,
                            fontWeight: 700,
                            fontSize: '11px',
                            border: `1px solid ${statusColor.border}`,
                          }}
                        />
                        {request.statusAssignee && (
                          <Typography
                            variant="caption"
                            sx={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap' }}
                          >
                            {request.statusAssignee}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{
                          color: '#3b82f6',
                          borderColor: '#bfdbfe',
                          fontWeight: 600,
                          fontSize: '12px',
                          textTransform: 'none',
                          borderRadius: '6px',
                          '&:hover': {
                            borderColor: '#3b82f6',
                            background: '#eff6ff',
                          },
                        }}
                      >
                        {request.action}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 3,
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
          }}
        >
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '13px', fontWeight: 500 }}>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredRequests.length)} of {filteredRequests.length} results
          </Typography>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
            size="small"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
              },
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default ServiceRequests;


import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Fab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// API
import { getWorkOrders, deleteWorkOrder } from '../../api/workOrders';

const WorkOrders = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);

  const { data: workOrders, isLoading } = useQuery(
    ['workOrders', { statusFilter, priorityFilter, search }],
    () => getWorkOrders({ status: statusFilter, priority: priorityFilter, search })
  );

  const deleteMutation = useMutation(deleteWorkOrder, {
    onSuccess: () => {
      queryClient.invalidateQueries('workOrders');
      toast.success('Work order deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete work order');
    },
  });

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleMenuOpen = (event, workOrder) => {
    setAnchorEl(event.currentTarget);
    setSelectedWorkOrder(workOrder);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedWorkOrder(null);
  };

  const handleView = () => {
    if (selectedWorkOrder) {
      navigate(`/work-orders/${selectedWorkOrder.id}`);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedWorkOrder) {
      navigate(`/work-orders/${selectedWorkOrder.id}/edit`);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedWorkOrder) {
      if (window.confirm('Are you sure you want to delete this work order?')) {
        deleteMutation.mutate(selectedWorkOrder.id);
      }
    }
    handleMenuClose();
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      open: { color: 'warning', label: 'Open', icon: <ScheduleIcon /> },
      assigned: { color: 'info', label: 'Assigned', icon: <AssignmentIcon /> },
      in_progress: { color: 'primary', label: 'In Progress', icon: <AssignmentIcon /> },
      completed: { color: 'success', label: 'Completed', icon: <CheckCircleIcon /> },
      verified: { color: 'success', label: 'Verified', icon: <CheckCircleIcon /> },
      closed: { color: 'default', label: 'Closed', icon: <CheckCircleIcon /> },
      overdue: { color: 'error', label: 'Overdue', icon: <WarningIcon /> },
    };
    
    const config = statusConfig[status] || { color: 'default', label: status };
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
      />
    );
  };

  const getPriorityChip = (priority) => {
    const priorityConfig = {
      critical: { color: 'error', label: 'Critical' },
      high: { color: 'warning', label: 'High' },
      medium: { color: 'info', label: 'Medium' },
      low: { color: 'success', label: 'Low' },
    };
    
    const config = priorityConfig[priority] || { color: 'default', label: priority };
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
      />
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Work Orders
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and track all maintenance work orders
        </Typography>
      </Box>

      {/* Filters and Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search work orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Work Orders Table */}
      <Paper sx={{ p: 0 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'woNumber'}
                    direction={orderBy === 'woNumber' ? order : 'asc'}
                    onClick={() => handleRequestSort('woNumber')}
                  >
                    WO Number
                  </TableSortLabel>
                </TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Asset/Location</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'status'}
                    direction={orderBy === 'status' ? order : 'asc'}
                    onClick={() => handleRequestSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'createdAt'}
                    direction={orderBy === 'createdAt' ? order : 'asc'}
                    onClick={() => handleRequestSort('createdAt')}
                  >
                    Created
                  </TableSortLabel>
                </TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : workOrders?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No work orders found
                  </TableCell>
                </TableRow>
              ) : (
                workOrders
                  ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((workOrder) => (
                    <TableRow key={workOrder.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {workOrder.woNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" className="truncate-2" sx={{ maxWidth: 200 }}>
                          {workOrder.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {workOrder.serviceType}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {workOrder.asset?.name || workOrder.location?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {workOrder.location?.fullPath}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(workOrder.status)}
                      </TableCell>
                      <TableCell>
                        {getPriorityChip(workOrder.priority)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(workOrder.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(workOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {workOrder.assignedTo ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">
                              {workOrder.assignedTo.name}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Unassigned
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, workOrder)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={workOrders?.length || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <VisibilityIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/work-orders/new')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default WorkOrders;
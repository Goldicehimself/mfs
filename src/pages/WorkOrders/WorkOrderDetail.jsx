import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Stack,
  TextField,
  MenuItem,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

import {
  getWorkOrder,
  updateWorkOrderStatus,
  assignWorkOrder,
  addWorkOrderComment,
  uploadWorkOrderPhoto,
} from '../../api/workOrders';

const WorkOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  const { data: workOrder, isLoading } = useQuery(['workOrder', id], () => getWorkOrder(id));

  const statusMut = useMutation(({ status, notes }) => updateWorkOrderStatus(id, status, notes), {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['workOrder', id]);
      toast.success('Status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const assignMut = useMutation((assignee) => assignWorkOrder(id, assignee), {
    onSuccess: () => {
      queryClient.invalidateQueries(['workOrder', id]);
      toast.success('Assigned');
    },
    onError: () => toast.error('Assign failed'),
  });

  const commentMut = useMutation((text) => addWorkOrderComment(id, text), {
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries(['workOrder', id]);
      toast.success('Comment added');
    },
    onError: () => toast.error('Failed to add comment'),
  });

  const photoMut = useMutation((file) => uploadWorkOrderPhoto(id, file), {
    onSuccess: () => {
      queryClient.invalidateQueries(['workOrder', id]);
      toast.success('Photo uploaded');
    },
    onError: () => toast.error('Photo upload failed'),
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
        <Typography>Loading work order...</Typography>
      </Box>
    );
  }

  if (!workOrder) {
    return (
      <Box>
        <Typography variant="h5">Work order not found</Typography>
        <Button onClick={() => navigate('/work-orders')}>Back to list</Button>
      </Box>
    );
  }

  const handleChangeStatus = (newStatus) => {
    statusMut.mutate({ status: newStatus });
  };

  const handleAssign = () => {
    if (!assigneeId) return toast.error('Select an assignee');
    assignMut.mutate(assigneeId);
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    commentMut.mutate(comment.trim());
  };

  return (
    <Box className="p-6 space-y-4">
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper className="bg-card p-4">
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <div className="flex items-center gap-3">
                  <Button variant="text" startIcon={<ArrowBack />} onClick={() => navigate(-1)}>Back</Button>
                  <div>
                    <Typography variant="h5">{workOrder.title || workOrder.woNumber}</Typography>
                    <Typography variant="body2" color="text.secondary">WO#: {workOrder.woNumber}</Typography>
                  </div>
                </div>

              <div>
                <Chip label={workOrder.status} color={workOrder.status === 'completed' ? 'success' : workOrder.status === 'open' ? 'warning' : 'default'} />
              </div>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" sx={{ mb: 1 }}>Description</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{workOrder.description || '—'}</Typography>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6} sm={4}>
                <Typography variant="caption" color="text.secondary">Priority</Typography>
                <Typography>{workOrder.priority || '—'}</Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="caption" color="text.secondary">Asset</Typography>
                <Typography>{workOrder.asset?.name || workOrder.location?.name || '—'}</Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="caption" color="text.secondary">Due</Typography>
                <Typography>{workOrder.dueDate ? new Date(workOrder.dueDate).toLocaleString() : '—'}</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ mb: 1 }}>Attachments</Typography>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {(workOrder.photos || []).map((p, i) => (
                <img key={i} src={p.url || p} alt={`photo-${i}`} className="w-full h-24 object-cover rounded" />
              ))}
            </div>

            <div className="flex gap-2 items-center mb-3">
              <input
                id="wo-photo-input"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0];
                  if (file) photoMut.mutate(file);
                }}
              />
              {photoMut.isLoading && <div className="text-sm">Uploading...</div>}
            </div>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>Comments</Typography>
            <List dense>
              {(workOrder.comments || []).map((c, i) => (
                <ListItem key={i} alignItems="flex-start">
                  <Avatar src={c.user?.avatar || ''} sx={{ width: 32, height: 32, mr: 2 }}>{(!c.user?.avatar && c.user?.name) ? c.user.name[0] : 'U'}</Avatar>
                  <ListItemText primary={c.text} secondary={c.createdAt ? new Date(c.createdAt).toLocaleString() : ''} />
                </ListItem>
              ))}
            </List>

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <TextField fullWidth placeholder="Add a comment" value={comment} onChange={(e) => setComment(e.target.value)} />
              <Button variant="contained" onClick={handleAddComment} disabled={commentMut.isLoading}>Add</Button>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ mb: 1 }}>Activity</Typography>
            <div className="space-y-2">
              {(
                (workOrder.activities && workOrder.activities.length > 0)
                  ? workOrder.activities
                  : [
                      ...(workOrder.comments || []).map((c) => ({ type: 'comment', ts: c.createdAt, text: c.text, user: c.user })),
                      { type: 'status', ts: workOrder.updatedAt || workOrder.createdAt, text: `Status: ${workOrder.status}`, user: workOrder.updatedBy },
                    ]
              ).sort((a,b) => new Date(b.ts) - new Date(a.ts)).map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">{a.user?.name ? a.user.name[0] : (a.type === 'status' ? 'S' : 'U')}</div>
                  <div>
                    <div className="text-sm">{a.text}</div>
                    <div className="text-xs text-gray-500">{a.ts ? new Date(a.ts).toLocaleString() : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper className="bg-card p-4 space-y-3">
            <Typography variant="subtitle1">Actions</Typography>

            <Stack spacing={1}>
              <Button variant="contained" color="primary" onClick={() => handleChangeStatus('in_progress')} disabled={statusMut.isLoading}>Start</Button>
              <Button variant="contained" color="success" onClick={() => handleChangeStatus('completed')} disabled={statusMut.isLoading}>Complete</Button>
              <Button variant="outlined" color="error" onClick={() => handleChangeStatus('cancelled')}>Cancel</Button>
            </Stack>

            <Divider sx={{ my: 1 }} />

            <Typography variant="subtitle2">Assign</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField select size="small" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} sx={{ minWidth: 160 }}>
                <MenuItem value="">Select technician</MenuItem>
                {(workOrder.potentialAssignees || []).map((u) => (
                  <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                ))}
              </TextField>
              <Button variant="contained" onClick={handleAssign} disabled={assignMut.isLoading}>Assign</Button>
            </Stack>

            <Divider sx={{ my: 1 }} />

            <Typography variant="subtitle2">Details</Typography>
            <div>
              <Typography variant="caption" color="text.secondary">Created</Typography>
              <Typography>{workOrder.createdAt ? new Date(workOrder.createdAt).toLocaleString() : '—'}</Typography>
            </div>
            <div>
              <Typography variant="caption" color="text.secondary">Reported By</Typography>
              <Typography>{workOrder.reportedBy?.name || '—'}</Typography>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WorkOrderDetail;


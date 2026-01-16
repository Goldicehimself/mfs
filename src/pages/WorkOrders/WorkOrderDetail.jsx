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
import { ArrowBack, CloudUpload } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
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
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 4 }}>
      {/* Header Bar */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e2e8f0', py: 2, px: 3, mb: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button variant="text" startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ color: '#4f46e5' }}>Back</Button>
            <div>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>{workOrder.title || workOrder.woNumber}</Typography>
              <Typography variant="body2" color="text.secondary">WO#: {workOrder.woNumber} • {workOrder.asset?.name || workOrder.location?.name || '—'}</Typography>
            </div>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={workOrder.status?.toUpperCase()} sx={{ fontWeight: 700 }} color={workOrder.status === 'completed' ? 'success' : workOrder.status === 'open' ? 'warning' : 'default'} />
            <Button variant="outlined" startIcon={<ArrowBack sx={{ transform: 'rotate(180deg)' }} />} onClick={() => handleChangeStatus('in_progress')}>Start</Button>
            <Button variant="contained" color="success" onClick={() => handleChangeStatus('completed')}>Complete</Button>
          </Stack>
        </Box>
      </Box>

      <Box sx={{ px: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700, color: '#0f172a' }}>Description</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>{workOrder.description || '—'}</Typography>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" color="text.secondary">Priority</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{workOrder.priority || '—'}</Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="caption" color="text.secondary">Due</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{workOrder.dueDate ? new Date(workOrder.dueDate).toLocaleString() : '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary">Reported By</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{workOrder.reportedBy?.name || '—'}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>Attachments</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 2, mb: 2 }}>
                {(workOrder.photos || []).map((p, i) => (
                  <Paper key={i} sx={{ overflow: 'hidden', borderRadius: 1, border: '1px solid #e6edf3' }} elevation={0}>
                    {/* Use existing AssetImage for fallback + lazy */}
                    <img src={p.url || p} alt={`photo-${i}`} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                  </Paper>
                ))}
                {((workOrder.photos || []).length === 0) && (
                  <Paper sx={{ p: 3, textAlign: 'center', color: '#94a3b8' }}>No attachments</Paper>
                )}
              </Box>

              <Button variant="outlined" component="label" startIcon={<CloudUpload />}>
                Upload Photo
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    if (file) photoMut.mutate(file);
                  }}
                />
              </Button>
              {photoMut.isLoading && <Typography variant="caption" sx={{ ml: 2 }}>Uploading...</Typography>}

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>Comments</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {(workOrder.comments || []).map((c, i) => (
                  <Paper key={i} sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'flex-start' }} elevation={0}>
                    <Avatar src={c.user?.avatar || ''} sx={{ width: 40, height: 40 }}>{(!c.user?.avatar && c.user?.name) ? c.user.name[0] : 'U'}</Avatar>
                    <div>
                      <Typography sx={{ fontWeight: 700 }}>{c.user?.name || 'Unknown'}</Typography>
                      <Typography variant="body2" sx={{ color: '#334155' }}>{c.text}</Typography>
                      <Typography variant="caption" color="text.secondary">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</Typography>
                    </div>
                  </Paper>
                ))}

                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                  <TextField fullWidth placeholder="Add a comment" value={comment} onChange={(e) => setComment(e.target.value)} />
                  <Button variant="contained" onClick={handleAddComment} disabled={commentMut.isLoading}>Add</Button>
                </Stack>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>Activity</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {(
                  (workOrder.activities && workOrder.activities.length > 0)
                    ? workOrder.activities
                    : [
                        ...(workOrder.comments || []).map((c) => ({ type: 'comment', ts: c.createdAt, text: c.text, user: c.user })),
                        { type: 'status', ts: workOrder.updatedAt || workOrder.createdAt, text: `Status: ${workOrder.status}`, user: workOrder.updatedBy },
                      ]
                ).sort((a,b) => new Date(b.ts) - new Date(a.ts)).map((a, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{a.user?.name ? a.user.name[0] : (a.type === 'status' ? 'S' : 'U')}</Box>
                    <div>
                      <Typography sx={{ fontWeight: 700 }}>{a.text}</Typography>
                      <Typography variant="caption" color="text.secondary">{a.ts ? new Date(a.ts).toLocaleString() : ''}</Typography>
                    </div>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0', position: { md: 'sticky' }, top: { md: 96 } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Quick Actions</Typography>
              <Stack spacing={1} sx={{ mb: 2 }}>
                <Button variant="contained" color="primary" onClick={() => handleChangeStatus('in_progress')} disabled={statusMut.isLoading}>Start</Button>
                <Button variant="contained" color="success" onClick={() => handleChangeStatus('completed')} disabled={statusMut.isLoading}>Complete</Button>
                <Button variant="outlined" color="error" onClick={() => handleChangeStatus('cancelled')}>Cancel</Button>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ mb: 1 }}>Assign</Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <TextField select size="small" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} sx={{ minWidth: 160 }}>
                  <MenuItem value="">Select technician</MenuItem>
                  {(workOrder.potentialAssignees || []).map((u) => (
                    <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                  ))}
                </TextField>
                <Button variant="contained" onClick={handleAssign} disabled={assignMut.isLoading}>Assign</Button>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="text.secondary">Details</Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">Created</Typography>
                <Typography sx={{ fontWeight: 700 }}>{workOrder.createdAt ? new Date(workOrder.createdAt).toLocaleString() : '—'}</Typography>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Asset</Typography>
                <Typography sx={{ fontWeight: 700 }}>{workOrder.asset?.name || '—'}</Typography>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Priority</Typography>
                <Typography sx={{ fontWeight: 700 }}>{workOrder.priority || '—'}</Typography>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Due</Typography>
                <Typography sx={{ fontWeight: 700 }}>{workOrder.dueDate ? new Date(workOrder.dueDate).toLocaleString() : '—'}</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default WorkOrderDetail;


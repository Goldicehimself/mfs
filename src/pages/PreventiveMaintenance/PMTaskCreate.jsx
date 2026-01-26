import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useActivity } from '../../contexts/ActivityContext';

const PMTaskCreate = () => {
  const navigate = useNavigate();
  const { addActivity } = useActivity();
  const [form, setForm] = useState({
    title: '',
    asset: '',
    frequency: '',
    dueDate: '',
    priority: 'medium',
    assignee: '',
    estimatedHours: '',
    description: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = 'Title is required';
    if (!form.asset.trim()) nextErrors.asset = 'Asset is required';
    if (!form.frequency) nextErrors.frequency = 'Frequency is required';
    if (!form.dueDate) nextErrors.dueDate = 'Due date is required';
    if (!form.assignee.trim()) nextErrors.assignee = 'Assignee is required';
    if (form.estimatedHours && Number(form.estimatedHours) <= 0) {
      nextErrors.estimatedHours = 'Enter a valid number of hours';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    const newTask = {
      id: `pm-${Date.now()}`,
      ...form,
      createdAt: new Date().toISOString(),
      status: 'scheduled',
    };

    try {
      const existing = JSON.parse(localStorage.getItem('pm_tasks') || '[]');
      const next = [newTask, ...existing];
      localStorage.setItem('pm_tasks', JSON.stringify(next));
    } catch (error) {
      localStorage.setItem('pm_tasks', JSON.stringify([newTask]));
    }

    addActivity({
      type: 'pm_scheduled',
      action: 'created',
      title: `PM Task Created: ${form.title}`,
      description: `${form.asset} - ${form.frequency}`,
      user: 'Current User',
      status: 'pending',
    });

    alert('PM task created successfully.');
    navigate('/preventive-maintenance');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
          Create PM Task
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => navigate('/preventive-maintenance')}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Back to Preventive Maintenance
        </Button>
      </Box>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ p: 3, borderRadius: 2, border: '1px solid #e5e7eb', backgroundColor: '#fff' }}
      >
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Task Title"
              value={form.title}
              onChange={handleChange('title')}
              error={Boolean(errors.title)}
              helperText={errors.title}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Asset"
              value={form.asset}
              onChange={handleChange('asset')}
              error={Boolean(errors.asset)}
              helperText={errors.asset}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={Boolean(errors.frequency)}>
              <InputLabel>Frequency</InputLabel>
              <Select
                label="Frequency"
                value={form.frequency}
                onChange={handleChange('frequency')}
              >
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="biweekly">Biweekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="annually">Annually</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Due Date"
              type="date"
              value={form.dueDate}
              onChange={handleChange('dueDate')}
              error={Boolean(errors.dueDate)}
              helperText={errors.dueDate}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                label="Priority"
                value={form.priority}
                onChange={handleChange('priority')}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Assignee"
              value={form.assignee}
              onChange={handleChange('assignee')}
              error={Boolean(errors.assignee)}
              helperText={errors.assignee}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Estimated Hours"
              type="number"
              value={form.estimatedHours}
              onChange={handleChange('estimatedHours')}
              error={Boolean(errors.estimatedHours)}
              helperText={errors.estimatedHours}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              value={form.description}
              onChange={handleChange('description')}
              fullWidth
              multiline
              minRows={3}
            />
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/preventive-maintenance')}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Create Task
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default PMTaskCreate;

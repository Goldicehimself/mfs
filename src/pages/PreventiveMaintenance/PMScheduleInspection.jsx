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

const PMScheduleInspection = () => {
  const navigate = useNavigate();
  const { addActivity } = useActivity();
  const [form, setForm] = useState({
    title: '',
    asset: '',
    inspectionType: '',
    scheduledDate: '',
    inspector: '',
    priority: 'medium',
    notes: '',
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
    if (!form.inspectionType) nextErrors.inspectionType = 'Inspection type is required';
    if (!form.scheduledDate) nextErrors.scheduledDate = 'Scheduled date is required';
    if (!form.inspector.trim()) nextErrors.inspector = 'Inspector is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    const newInspection = {
      id: `pm-inspection-${Date.now()}`,
      ...form,
      createdAt: new Date().toISOString(),
      status: 'scheduled',
    };

    try {
      const existing = JSON.parse(localStorage.getItem('pm_inspections') || '[]');
      const next = [newInspection, ...existing];
      localStorage.setItem('pm_inspections', JSON.stringify(next));
    } catch (error) {
      localStorage.setItem('pm_inspections', JSON.stringify([newInspection]));
    }

    addActivity({
      type: 'inspection',
      action: 'created',
      title: `Inspection Scheduled: ${form.title}`,
      description: `${form.asset} - ${form.inspectionType}`,
      user: 'Current User',
      status: 'pending',
    });

    alert('Inspection scheduled successfully.');
    navigate('/preventive-maintenance');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
          Schedule Inspection
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
              label="Inspection Title"
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
            <FormControl fullWidth error={Boolean(errors.inspectionType)}>
              <InputLabel>Inspection Type</InputLabel>
              <Select
                label="Inspection Type"
                value={form.inspectionType}
                onChange={handleChange('inspectionType')}
              >
                <MenuItem value="safety">Safety</MenuItem>
                <MenuItem value="equipment">Equipment</MenuItem>
                <MenuItem value="environmental">Environmental</MenuItem>
                <MenuItem value="compliance">Compliance</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Scheduled Date"
              type="date"
              value={form.scheduledDate}
              onChange={handleChange('scheduledDate')}
              error={Boolean(errors.scheduledDate)}
              helperText={errors.scheduledDate}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Inspector"
              value={form.inspector}
              onChange={handleChange('inspector')}
              error={Boolean(errors.inspector)}
              helperText={errors.inspector}
              fullWidth
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
          <Grid item xs={12}>
            <TextField
              label="Notes"
              value={form.notes}
              onChange={handleChange('notes')}
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
              Schedule Inspection
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default PMScheduleInspection;

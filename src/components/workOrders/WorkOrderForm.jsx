import React, { useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Divider,
  IconButton,
  Autocomplete,
  CircularProgress,
  Avatar,
  Stack,
} from '@mui/material';
import { Plus, Delete } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createWorkOrder } from '../../services/workOrderService';
import { useQuery } from 'react-query';
import { getAssets } from '../../api/assets';

export default function WorkOrderForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { handleSubmit, control, watch, reset } = useForm({
    defaultValues: {
      title: '',
      priority: 'low',
      serviceCategory: '',
      asset: '',
      location: '',
      description: '',
      instructions: '',
      parts: [],
      requestedBy: user?.name || '',
      assignTo: '',
      scheduledDate: '',
      estimatedDuration: '',
      recurring: false,
    },
  });

  const [parts, setParts] = useState([]);
  const [files, setFiles] = useState([]);
  const [assetQuery, setAssetQuery] = useState('');

  // fetch assets for autocomplete, gracefully handle backend offline by returning []
  const { data: assets = [], isLoading: assetsLoading } = useQuery(
    ['assets', assetQuery],
    async () => {
      try {
        const res = await getAssets({ q: assetQuery });
        return Array.isArray(res) ? res : [];
      } catch (err) {
        return [];
      }
    },
    { keepPreviousData: true, staleTime: 1000 * 60 * 5 }
  );

  const onSubmit = async (data) => {
    const payload = { ...data, parts, attachments: files };
    try {
      // mock service will resolve
      await createWorkOrder(payload);
      toast.success('Work order created');
      reset();
      setParts([]);
      setFiles([]);
      navigate('/work-orders');
    } catch (err) {
      toast.error('Failed to create work order');
    }
  };

  const addPart = () => {
    setParts((p) => [...p, { name: '', qty: '' }]);
  };

  const updatePart = (index, key, value) => {
    setParts((p) => p.map((item, i) => i === index ? { ...item, [key]: value } : item));
  };

  const removePart = (index) => {
    setParts((p) => p.filter((_, i) => i !== index));
  };

  const onFilesChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Create New Work Order
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Fill out the form below to create a new work order for facility maintenance
            </Typography>

            {/* Basic Information */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Basic Information</Typography>

              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Work Order Title" fullWidth placeholder="Enter work order title..." sx={{ mb: 2 }} />
                )}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Priority Level</Typography>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup row {...field}>
                        <FormControlLabel value="low" control={<Radio />} label={<Box component="span" sx={{ color: 'success.main' }}>Low</Box>} />
                        <FormControlLabel value="medium" control={<Radio />} label={<Box component="span" sx={{ color: 'warning.main' }}>Medium</Box>} />
                        <FormControlLabel value="high" control={<Radio />} label={<Box component="span" sx={{ color: 'error.main' }}>High</Box>} />
                        <FormControlLabel value="critical" control={<Radio />} label={<Box component="span" sx={{ color: 'error.dark' }}>Critical</Box>} />
                      </RadioGroup>
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="serviceCategory"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Service Category</InputLabel>
                        <Select {...field} label="Service Category">
                          <MenuItem value="electrical">Electrical</MenuItem>
                          <MenuItem value="plumbing">Plumbing</MenuItem>
                          <MenuItem value="hvac">HVAC</MenuItem>
                          <MenuItem value="general">General</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Asset & Location */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Asset & Location</Typography>

              <Controller
                name="asset"
                control={control}
                render={({ field }) => {
                  // determine currently selected asset object
                  const current = (assets || []).find(a => a.id === field.value) || null;
                  return (
                    <Autocomplete
                      value={current}
                      onChange={(e, value) => field.onChange(value ? value.id : '')}
                      options={assets || []}
                      getOptionLabel={(opt) => opt.name || ''}
                      isOptionEqualToValue={(o, v) => o.id === v.id}
                      loading={assetsLoading}
                      renderOption={(props, option) => (
                        <Box component="li" {...props} key={option.id} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.light', color: 'primary.main', fontSize: 12 }}>{(option.name || 'A')[0]}</Avatar>
                          <Box>
                            <Typography variant="body2">{option.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{option.tagline || option.model || option.asset_code}</Typography>
                          </Box>
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Asset Selection"
                          placeholder="Search and select asset..."
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {assetsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                          sx={{ mb: 2 }}
                        />
                      )}
                        onInputChange={(e, v, reason) => {
                          if (reason === 'input') setAssetQuery(v);
                        }}
                    />
                  );
                }}
              />

              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth placeholder="Enter specific location details..." />
                )}
              />
            </Paper>

            {/* Problem Description */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Problem Description</Typography>

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth multiline rows={4} placeholder="Describe the problem in detail..." sx={{ mb: 2 }} />
                )}
              />

              <Controller
                name="instructions"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth multiline rows={2} placeholder="Any special instructions or notes..." />
                )}
              />
            </Paper>

            {/* Required Parts & Materials */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Required Parts & Materials</Typography>
                <Button size="small" startIcon={<Plus size={14} />} onClick={addPart}>Add Item</Button>
              </Box>

              {parts.map((part, idx) => (
                <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField placeholder="Part/Material name" value={part.name} onChange={(e) => updatePart(idx, 'name', e.target.value)} fullWidth />
                  <TextField placeholder="Quantity" value={part.qty} onChange={(e) => updatePart(idx, 'qty', e.target.value)} sx={{ width: 120 }} />
                  <IconButton onClick={() => removePart(idx)}><Delete size={16} /></IconButton>
                </Box>
              ))}
            </Paper>

            {/* Attach Photos & Documents */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Attach Photos & Documents</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Drag and drop files here or <Button variant="text" size="small" component="label">browse<input hidden type="file" multiple onChange={onFilesChange} /></Button></Typography>

              <Box sx={{ border: '1px dashed #d1d5db', borderRadius: 1, p: 3, minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {files.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">Drop files here or click Browse to select files. Supports: JPG, PNG, PDF (Max 10MB)</Typography>
                ) : (
                  <Stack spacing={1} sx={{ width: '100%' }}>
                    {files.map((f, i) => (
                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">{f.name}</Typography>
                        <IconButton onClick={() => setFiles(files.filter((_, idx) => idx !== i))}><Delete size={14} /></IconButton>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            </Paper>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2, borderRadius: 2, mb: 2, position: 'sticky', top: 88 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Assignment & Scheduling</Typography>

            <Controller
              name="requestedBy"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Requested By" fullWidth sx={{ mb: 2 }} />
              )}
            />

            <Controller
              name="assignTo"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Assign to Technician</InputLabel>
                  <Select {...field} label="Assign to Technician">
                    <MenuItem value="tech1">John Doe</MenuItem>
                    <MenuItem value="tech2">Jane Smith</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="scheduledDate"
              control={control}
              render={({ field }) => (
                <TextField {...field} type="date" label="Scheduled Date" InputLabelProps={{ shrink: true }} fullWidth sx={{ mb: 2 }} />
              )}
            />

            <Controller
              name="estimatedDuration"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Estimated Duration" placeholder="e.g., 2 hours" fullWidth sx={{ mb: 2 }} />
              )}
            />

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ mb: 1 }}>Maintenance Options</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2">Recurring Maintenance</Typography>
              <Controller
                name="recurring"
                control={control}
                render={({ field }) => (
                  <Switch {...field} checked={field.value} />
                )}
              />
            </Box>

            <Box sx={{ mt: 3 }}>
              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mb: 1, py: 1.2, fontWeight: 600 }}>Create Work Order</Button>
              <Button variant="outlined" color="primary" fullWidth onClick={() => toast.info('Saved as draft (local)')} sx={{ py: 1 }}>Save as Draft</Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </form>
  );
}
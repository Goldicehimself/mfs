import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, Grid, Avatar, Paper, Chip, Divider, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from '../../components/common/Modal';
import { deleteAsset, getAsset, updateAsset } from '../../api/assets';
import { getWorkOrders } from '../../api/workOrders';
import MaintenanceTimeline from '../../components/assets/MaintenanceTimeline';
import { toast } from 'react-toastify';

const AssetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [relatedWOs, setRelatedWOs] = useState([]);

  // Schedule & Parts editing state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleEditing, setScheduleEditing] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({ title: '', frequency: '', last: '', next: '', status: '' });

  const [partModalOpen, setPartModalOpen] = useState(false);
  const [partEditing, setPartEditing] = useState(null);
  const [partForm, setPartForm] = useState({ name: '', inStock: 0, minLevel: 0, lastReplaced: '' });

  const openScheduleModal = (item) => {
    if (item) { setScheduleEditing(item); setScheduleForm({ ...item }); }
    else { setScheduleEditing(null); setScheduleForm({ title: '', frequency: '', last: '', next: '', status: '' }); }
    setScheduleModalOpen(true);
  };

  const openPartModal = (item) => {
    if (item) { setPartEditing(item); setPartForm({ ...item }); }
    else { setPartEditing(null); setPartForm({ name: '', inStock: 0, minLevel: 0, lastReplaced: '' }); }
    setPartModalOpen(true);
  };

  const saveSchedule = async () => {
    const form = scheduleForm;
    if (!form.title) { toast.error('Title required'); return; }
    try {
      let newSchedule = asset.maintenanceSchedule ? [...asset.maintenanceSchedule] : [];
      let action = 'added';
      if (scheduleEditing && scheduleEditing.id) {
        newSchedule = newSchedule.map(s => (s.id === scheduleEditing.id ? { ...s, ...form } : s));
        action = 'updated';
      } else {
        const newItem = { id: `ms-${Date.now()}`, ...form };
        newSchedule.unshift(newItem);
        action = 'added';
      }

      const historyEntry = { id: `mh-${Date.now()}`, type: 'schedule_' + action, title: `Schedule ${action}: "${form.title}"`, timestamp: new Date().toISOString(), details: form };
      const updated = { ...asset, maintenanceSchedule: newSchedule, maintenanceHistory: [historyEntry, ...(asset.maintenanceHistory || [])] };
      await updateAsset(asset.id, updated);
      setAsset(updated);
      setScheduleModalOpen(false);
      toast.success('Schedule saved');
    } catch (err) { console.error(err); toast.error('Failed to save schedule'); }
  };

  const savePart = async () => {
    const form = partForm;
    if (!form.name) { toast.error('Name required'); return; }
    try {
      let newParts = asset.parts ? [...asset.parts] : [];
      let action = 'added';
      if (partEditing && partEditing.id) {
        newParts = newParts.map(p => (p.id === partEditing.id ? { ...p, ...form, inStock: Number(form.inStock), minLevel: Number(form.minLevel) } : p));
        action = 'updated';
      } else {
        const newItem = { id: `p-${Date.now()}`, ...form, inStock: Number(form.inStock), minLevel: Number(form.minLevel) };
        newParts.unshift(newItem);
        action = 'added';
      }

      const historyEntry = { id: `mh-${Date.now()}`, type: 'part_' + action, title: `Part ${action}: "${form.name}"`, timestamp: new Date().toISOString(), details: form };
      const updated = { ...asset, parts: newParts, maintenanceHistory: [historyEntry, ...(asset.maintenanceHistory || [])] };
      await updateAsset(asset.id, updated);
      setAsset(updated);
      setPartModalOpen(false);
      toast.success('Part saved');
    } catch (err) { console.error(err); toast.error('Failed to save part'); }
  };

  // Delete confirmation for schedule/part
  const [deleteConfirmOpen2, setDeleteConfirmOpen2] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteTargetType, setDeleteTargetType] = useState(null);

  const confirmDeleteSchedule = (s) => { setDeleteTarget(s); setDeleteTargetType('schedule'); setDeleteConfirmOpen2(true); };
  const confirmDeletePart = (p) => { setDeleteTarget(p); setDeleteTargetType('part'); setDeleteConfirmOpen2(true); };

  const handleDeleteTarget = async () => {
    if (!deleteTarget || !deleteTargetType) return;
    try {
      let updated = { ...asset };
      if (deleteTargetType === 'schedule') {
        updated.maintenanceSchedule = (asset.maintenanceSchedule || []).filter(s => s.id !== deleteTarget.id);
        const entry = { id: `mh-${Date.now()}`, type: 'schedule_deleted', title: `Deleted schedule "${deleteTarget.title || deleteTarget.name}"`, timestamp: new Date().toISOString(), details: deleteTarget };
        updated.maintenanceHistory = [entry, ...(asset.maintenanceHistory || [])];
      } else if (deleteTargetType === 'part') {
        updated.parts = (asset.parts || []).filter(p => p.id !== deleteTarget.id);
        const entry = { id: `mh-${Date.now()}`, type: 'part_deleted', title: `Deleted part "${deleteTarget.name}"`, timestamp: new Date().toISOString(), details: deleteTarget };
        updated.maintenanceHistory = [entry, ...(asset.maintenanceHistory || [])];
      }
      await updateAsset(asset.id, updated);
      setAsset(updated);
      toast.success(`${deleteTargetType === 'schedule' ? 'Schedule' : 'Part'} deleted`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete');
    } finally {
      setDeleteConfirmOpen2(false);
      setDeleteTarget(null);
      setDeleteTargetType(null);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAsset(id);
        if (mounted) {
          setAsset(res);
          setSelectedImage((res && (res.imageUrls && res.imageUrls.length > 0) ? res.imageUrls[0] : res?.imageUrl) || '/placeholder-asset.svg');
        }

        // Load related work orders
        try {
          const wos = await getWorkOrders();
          if (mounted) {
            const filtered = (wos || []).filter(w => (w.asset && (String(w.asset.id) === String(id) || String(w.asset.name).toLowerCase().includes((res && res.name || '').toLowerCase()))));
            setRelatedWOs(filtered.slice(0,5));
          }
        } catch (err) {
          // ignore
        }
      } catch (err) {
        console.error('Failed to load asset', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteAsset(id);
      navigate('/assets');
    } catch (err) {
      console.error('Failed to delete asset', err);
      alert('Failed to delete asset');
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  if (loading) {
    return <Typography>Loading asset...</Typography>;
  }

  if (!asset) {
    return <Typography>No asset found</Typography>;
  }

  const images = (asset.imageUrls && asset.imageUrls.length > 0) ? asset.imageUrls : [asset.imageUrl || '/placeholder-asset.svg'];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/assets')} sx={{ mr: 2 }}>Back</Button>
          <div>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{asset.name}</Typography>
            <Typography variant="body2" color="text.secondary">{asset.shortDescription || ''}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              {(asset.statusLabels || []).map((s, i) => <Chip key={i} label={s} size="small" color="success" />)}
            </Stack>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="outlined" onClick={() => navigate(`/assets/${id}/edit`)}>Edit Asset</Button>
          <Button variant="contained" onClick={() => navigate('/work-orders/new')}>Create Work Order</Button>
          <Button variant="outlined" onClick={() => window.print()}>Print</Button>
        </div>
      </Box>

      <Grid container spacing={3}>
        {/* Left - Overview + Specs + History */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <div style={{ borderRadius: 8, overflow: 'hidden', background: '#f8fafc' }}>
                  <img src={selectedImage} alt={asset.name} style={{ width: '100%', height: 220, objectFit: 'cover' }} />
                </div>
              </Grid>

              <Grid item xs={12} md={7}>
                <Typography variant="h6" sx={{ mb: 1 }}>{asset.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{asset.shortDescription}</Typography>

                <Grid container spacing={1}>
                  <Grid item xs={6}><Typography variant="caption" color="text.secondary">Equipment Category</Typography><Typography>{asset.category}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="caption" color="text.secondary">Equipment Type</Typography><Typography>{asset.type}</Typography></Grid>

                  <Grid item xs={6}><Typography variant="caption" color="text.secondary">Manufacturer</Typography><Typography>{asset.manufacturer}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="caption" color="text.secondary">Model Number</Typography><Typography>{asset.model}</Typography></Grid>

                  <Grid item xs={6}><Typography variant="caption" color="text.secondary">Serial Number</Typography><Typography>{asset.serial}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="caption" color="text.secondary">Installation Date</Typography><Typography>{asset.installationDate || asset.purchaseDate}</Typography></Grid>

                  <Grid item xs={6}><Typography variant="caption" color="text.secondary">Property Location</Typography><Typography>{asset.propertyLocation}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="caption" color="text.secondary">Building Location</Typography><Typography>{asset.buildingLocation}</Typography></Grid>

                  <Grid item xs={12}><Typography variant="caption" color="text.secondary">Service Area</Typography><Typography>{asset.serviceArea}</Typography></Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Specifications & Technical Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}><Typography color="text.secondary">Cooling Capacity</Typography><Typography>{asset.specs?.coolingCapacity}</Typography></Grid>
              <Grid item xs={6}><Typography color="text.secondary">Refrigerant Type</Typography><Typography>{asset.specs?.refrigerantType}</Typography></Grid>

              <Grid item xs={6}><Typography color="text.secondary">Power Consumption</Typography><Typography>{asset.specs?.powerConsumption}</Typography></Grid>
              <Grid item xs={6}><Typography color="text.secondary">SEER Rating</Typography><Typography>{asset.specs?.seerRating}</Typography></Grid>

              <Grid item xs={6}><Typography color="text.secondary">Dimensions</Typography><Typography>{asset.specs?.dimensions}</Typography></Grid>
              <Grid item xs={6}><Typography color="text.secondary">Weight</Typography><Typography>{asset.specs?.weight}</Typography></Grid>

              <Grid item xs={6}><Typography color="text.secondary">Operating Temperature Range</Typography><Typography>{asset.specs?.operatingTempRange}</Typography></Grid>
              <Grid item xs={6}><Typography color="text.secondary">Compliance Certifications</Typography><Typography>{asset.specs?.compliance}</Typography></Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Warranty & Documentation</Typography>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <Typography color="text.secondary">Warranty Status</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip label={`ACTIVE — Expires ${asset.warranty?.expires}`} color="success" />
                </Stack>
                <Typography sx={{ mt: 2 }}>{asset.warranty?.coverage}</Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography color="text.secondary">Warranty Provider</Typography>
                <Typography>{asset.warranty?.provider}</Typography>
                <Typography color="text.secondary" sx={{ mt: 2 }}>Purchase Date</Typography>
                <Typography>{asset.warranty?.purchaseDate}</Typography>
              </Grid>

              <Grid item xs={12} sx={{ mt: 2 }}>
                {asset.documents?.map(d => (
                  <Paper key={d.id} sx={{ p: 2, mb: 1 }} elevation={0}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Typography sx={{ fontWeight: 700 }}>{d.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{d.size || ''}</Typography>
                      </div>
                      <Button variant="outlined" size="small" onClick={() => window.open(d.url, '_blank')}>Download</Button>
                    </div>
                  </Paper>
                ))}
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" gutterBottom>Maintenance History</Typography>
              {/* Future: filter controls */}
            </Box>

            <div style={{ marginTop: 8 }}>
              <MaintenanceTimeline items={asset.maintenanceHistory} />
            </div>
          </Paper>

          {/* Edit Schedule Modal & Parts Modal will be rendered below */}
        </Grid>

        {/* Right - Sidebar */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Maintenance Schedule</Typography>
              <Button startIcon={<AddIcon />} size="small" onClick={() => openScheduleModal(null)}>Add Schedule</Button>
            </Box>
            <Stack spacing={1} sx={{ mt: 2 }}>
              {asset.maintenanceSchedule?.map(s => (
                <Paper key={s.id} sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} elevation={0}>
                  <div>
                    <Typography sx={{ fontWeight: 700 }}>{s.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{s.frequency} • Last: {s.last} • Next: {s.next}</Typography>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Chip label={s.status === 'due_soon' ? 'DUE SOON' : s.status === 'scheduled' ? 'SCHEDULED' : 'OK'} size="small" color={s.status === 'due_soon' ? 'warning' : 'info'} />
                    <IconButton size="small" onClick={() => openScheduleModal(s)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => confirmDeleteSchedule(s)}><DeleteIcon fontSize="small" /></IconButton>
                  </div>
                </Paper>
              ))}
            </Stack>
          </Paper>

          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6">Performance Metrics</Typography>
            <div style={{ marginTop: 12 }}>
              <Typography variant="caption" color="text.secondary">Total Downtime</Typography>
              <Typography sx={{ fontWeight: 700 }}>{asset.performanceMetrics?.totalDowntimeHours} hours</Typography>

              <Divider sx={{ my: 1 }} />

              <Typography variant="caption" color="text.secondary">Maintenance Incidents</Typography>
              <Typography sx={{ fontWeight: 700 }}>{asset.performanceMetrics?.maintenanceIncidents?.preventive} Preventive • {asset.performanceMetrics?.maintenanceIncidents?.corrective} Corrective</Typography>

              <Divider sx={{ my: 1 }} />

              <Typography variant="caption" color="text.secondary">Avg Repair Time</Typography>
              <Typography sx={{ fontWeight: 700 }}>{asset.performanceMetrics?.avgRepairTimeHrs} hrs</Typography>

              <Divider sx={{ my: 1 }} />

              <Typography variant="caption" color="text.secondary">Total Maintenance Cost</Typography>
              <Typography sx={{ fontWeight: 700 }}>${asset.performanceMetrics?.totalMaintenanceCost}</Typography>

              <Divider sx={{ my: 1 }} />

              <Typography variant="caption" color="text.secondary">Reliability Score</Typography>
              <Typography sx={{ fontWeight: 700 }}>{asset.performanceMetrics?.reliabilityScore}%</Typography>
            </div>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Related Work Orders</Typography>
            <Stack spacing={1} sx={{ mt: 2 }}>
              {relatedWOs.length > 0 ? relatedWOs.map(wo => (
                <Paper key={wo.id} sx={{ p: 1.25 }} elevation={0}>
                  <Typography sx={{ fontWeight: 700 }}>{wo.woNumber || wo.id}</Typography>
                  <Typography variant="caption" color="text.secondary">{wo.title || wo.description}</Typography>
                </Paper>
              )) : <Typography variant="body2" color="text.secondary">No related work orders</Typography>}
            </Stack>
          </Paper>

          <Paper sx={{ p: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Parts & Components</Typography>
              <Button startIcon={<AddIcon />} size="small" onClick={() => openPartModal(null)}>Add Part</Button>
            </Box>
            <Stack spacing={1} sx={{ mt: 2 }}>
              {asset.parts?.map(p => (
                <Paper key={p.id} sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} elevation={0}>
                  <div>
                    <Typography sx={{ fontWeight: 700 }}>{p.name}</Typography>
                    <Typography variant="caption" color="text.secondary">Last Replaced: {p.lastReplaced}</Typography>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div>
                      <Typography>{p.inStock} in stock</Typography>
                      <Typography variant="caption" color="text.secondary">Min Level: {p.minLevel}</Typography>
                    </div>
                    <IconButton size="small" onClick={() => openPartModal(p)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => confirmDeletePart(p)}><DeleteIcon fontSize="small" /></IconButton>
                  </div>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Schedule Edit Dialog */}
      <Dialog open={Boolean(scheduleModalOpen)} onClose={() => setScheduleModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{scheduleEditing?.id ? 'Edit Schedule' : 'Add Schedule'}</DialogTitle>
        <DialogContent>
          <TextField label="Title" fullWidth value={scheduleForm.title} onChange={(e) => setScheduleForm(s => ({ ...s, title: e.target.value }))} sx={{ mt: 1 }} />
          <TextField label="Frequency" fullWidth value={scheduleForm.frequency} onChange={(e) => setScheduleForm(s => ({ ...s, frequency: e.target.value }))} sx={{ mt: 2 }} />
          <TextField label="Last" fullWidth value={scheduleForm.last} onChange={(e) => setScheduleForm(s => ({ ...s, last: e.target.value }))} sx={{ mt: 2 }} />
          <TextField label="Next" fullWidth value={scheduleForm.next} onChange={(e) => setScheduleForm(s => ({ ...s, next: e.target.value }))} sx={{ mt: 2 }} />
          <TextField label="Status" fullWidth value={scheduleForm.status} onChange={(e) => setScheduleForm(s => ({ ...s, status: e.target.value }))} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleModalOpen(false)}>Cancel</Button>
          <Button onClick={saveSchedule} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Part Edit Dialog */}
      <Dialog open={Boolean(partModalOpen)} onClose={() => setPartModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{partEditing?.id ? 'Edit Part' : 'Add Part'}</DialogTitle>
        <DialogContent>
          <TextField label="Name" fullWidth value={partForm.name} onChange={(e) => setPartForm(s => ({ ...s, name: e.target.value }))} sx={{ mt: 1 }} />
          <TextField label="In Stock" fullWidth value={partForm.inStock} onChange={(e) => setPartForm(s => ({ ...s, inStock: e.target.value }))} sx={{ mt: 2 }} />
          <TextField label="Min Level" fullWidth value={partForm.minLevel} onChange={(e) => setPartForm(s => ({ ...s, minLevel: e.target.value }))} sx={{ mt: 2 }} />
          <TextField label="Last Replaced" fullWidth value={partForm.lastReplaced} onChange={(e) => setPartForm(s => ({ ...s, lastReplaced: e.target.value }))} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPartModalOpen(false)}>Cancel</Button>
          <Button onClick={savePart} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {deleteConfirmOpen2 && (
        <Modal>
          <div style={{ maxWidth: 480, padding: 16 }}>
            <h3>Confirm delete</h3>
            <p>Are you sure you want to delete this {deleteTargetType === 'schedule' ? 'schedule' : 'part'}? This action cannot be undone.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button variant="outlined" onClick={() => setDeleteConfirmOpen2(false)}>Cancel</Button>
              <Button color="error" variant="contained" onClick={handleDeleteTarget}>Delete</Button>
            </div>
          </div>
        </Modal>
      )}

      {confirmOpen && (
        <Modal>
          <div style={{ maxWidth: 480, padding: 16 }}>
            <h3>Delete asset?</h3>
            <p>Are you sure you want to delete this asset? This action cannot be undone.</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button variant="outlined" onClick={() => setConfirmOpen(false)} disabled={deleting}>Cancel</Button>
              <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</Button>
            </div>
          </div>
        </Modal>
      )}

      {viewerOpen && (
        <Modal>
          <div style={{ maxWidth: 900, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => setViewerOpen(false)}>Close</Button>
            </div>
            <img src={selectedImage} alt="viewer" style={{ width: '100%', height: '70vh', objectFit: 'contain', marginTop: 8 }} />
          </div>
        </Modal>
      )}
    </Box>
  );
};

export default AssetDetail;


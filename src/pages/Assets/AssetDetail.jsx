import React, { useState } from 'react';
import { Typography, Box, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from '../../components/common/Modal';
import { deleteAsset } from '../../api/assets';

const AssetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h4" gutterBottom>
            Asset Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Asset ID: {id}
          </Typography>
        </div>

        <div>
          <Button variant="outlined" sx={{ mr: 2 }} onClick={() => navigate(`/assets/${id}/edit`)}>
            Edit
          </Button>
          <Button color="error" variant="contained" onClick={() => setConfirmOpen(true)}>
            Delete
          </Button>
        </div>
      </Box>

      <Typography variant="body2" color="text.secondary">
        This page is under development.
      </Typography>

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
    </Box>
  );
};

export default AssetDetail;


import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  QrCode as QrCodeIcon,
  History as HistoryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Components
import AssetQRScanner from '../../components/assets/AssetQRScanner';

// API
import { getAssets } from '../../api/assets';

const Assets = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const { data: assets, isLoading } = useQuery(
    ['assets', { search, categoryFilter, statusFilter }],
    () => getAssets({ search, category: categoryFilter, status: statusFilter })
  );

  const handleMenuOpen = (event, asset) => {
    setAnchorEl(event.currentTarget);
    setSelectedAsset(asset);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAsset(null);
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      active: { color: 'success', label: 'Active', icon: <CheckCircleIcon /> },
      under_repair: { color: 'warning', label: 'Under Repair', icon: <BuildIcon /> },
      decommissioned: { color: 'error', label: 'Decommissioned', icon: <WarningIcon /> },
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

  const handleQRScan = (data) => {
    if (data) {
      // Find asset by QR code and navigate to it
      const asset = assets?.find(a => a.qrCode === data);
      if (asset) {
        navigate(`/assets/${asset.id}`);
      } else {
        toast.error('Asset not found');
      }
    }
    setQrScannerOpen(false);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              Assets
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage all equipment and facilities
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/assets/new')}
              sx={{ mr: 2 }}
            >
              Add Asset
            </Button>
            <Button
              variant="outlined"
              startIcon={<QrCodeIcon />}
              onClick={() => setQrScannerOpen(true)}
            >
              Scan QR
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search assets..."
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
              label="Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="all">All Categories</option>
              <option value="electrical">Electrical</option>
              <option value="plumbing">Plumbing</option>
              <option value="hvac">HVAC</option>
              <option value="fire_safety">Fire Safety</option>
              <option value="elevator">Elevator</option>
            </TextField>
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
              <option value="active">Active</option>
              <option value="under_repair">Under Repair</option>
              <option value="decommissioned">Decommissioned</option>
            </TextField>
          </Grid>
        </Grid>
      </Card>

      {/* Assets Grid */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Typography>Loading assets...</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {assets?.map((asset) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={asset.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {asset.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {asset.make} {asset.model}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, asset)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {asset.description}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={asset.category}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    {getStatusChip(asset.status)}
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    Location: {asset.location?.name || 'N/A'}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" display="block">
                    Serial: {asset.serialNumber || 'N/A'}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" display="block">
                    Installed: {new Date(asset.installDate).toLocaleDateString()}
                  </Typography>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<HistoryIcon />}
                    onClick={() => navigate(`/assets/${asset.id}`)}
                  >
                    View History
                  </Button>
                  <Button
                    size="small"
                    startIcon={<QrCodeIcon />}
                    onClick={() => navigate(`/assets/${asset.id}#qr`)}
                  >
                    QR Code
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/assets/${selectedAsset?.id}`);
          handleMenuClose();
        }}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/work-orders/new?assetId=${selectedAsset?.id}`);
          handleMenuClose();
        }}>
          <BuildIcon sx={{ mr: 1 }} fontSize="small" />
          Create Work Order
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* QR Scanner Modal */}
      {qrScannerOpen && (
        <AssetQRScanner
          open={qrScannerOpen}
          onClose={() => setQrScannerOpen(false)}
          onScan={handleQRScan}
        />
      )}
    </Box>
  );
};

export default Assets;
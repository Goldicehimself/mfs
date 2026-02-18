import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Switch,
  FormControlLabel,
  LinearProgress,
  Fade,
  Paper,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Edit,
  PhotoCamera,
  Save,
  Cancel,
  Person,
  Security,
  Email,
  Phone,
  Wc,
  Business,
  Lock,
  History,
  Shield,
  VerifiedUser,
  AccountCircle,
  ArrowBack,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { getHomeRoute } from '../../utils/roleHome';
import axios from 'axios';
import { updateProfile, uploadCertificates } from '../../api/profile';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    role: user?.role || '',
  });
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [certificates, setCertificates] = useState(user?.certificates || []);
  const fileInputRef = React.useRef(null);
  const certificateInputRef = React.useRef(null);

  // Keyboard shortcut to exit profile page
  useEffect(() => {
    if (user) {
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        gender: user?.gender || '',
        role: user?.role || '',
      });
      setCertificates(user?.certificates || []);
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        // Navigate back to dashboard or previous page
        navigate(getHomeRoute(user?.role));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, user]);

  useEffect(() => {
    if (selectedImage) {
      setAvatarPreview(selectedImage);
      return;
    }

    if (!user?.avatar) {
      setAvatarPreview(null);
      return;
    }

    if (user.avatar.startsWith('data:') || user.avatar.startsWith('http')) {
      setAvatarPreview(user.avatar);
      return;
    }

    let active = true;
    let objectUrl = null;

    const buildUploadUrl = (filePath) => {
      const apiBase = import.meta.env.VITE_API_URL || '/api';
      const base = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
      return `${base}/${filePath.replace(/^\/+/, '')}`;
    };

    const loadAvatar = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(buildUploadUrl(user.avatar), {
          responseType: 'blob',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        objectUrl = URL.createObjectURL(response.data);
        if (active) setAvatarPreview(objectUrl);
      } catch (error) {
        // Ignore fetch errors for protected assets
      }
    };

    loadAvatar();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [user?.avatar, selectedImage]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const fullName = formData.name?.trim() || '';
      const [firstName, ...rest] = fullName.split(' ');
      const lastName = rest.join(' ') || user?.lastName || '';
      const payload = {
        firstName: firstName || user?.firstName || '',
        lastName,
        phone: formData.phone,
      };

      const updated = await updateProfile(payload, selectedImageFile);
      updateUser(updated);
      setSelectedImage(null);
      setSelectedImageFile(null);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      gender: user?.gender || '',
      role: user?.role || '',
    });
    setSelectedImage(null); // Reset any uploaded image
    setSelectedImageFile(null);
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would call an API to change password
      toast.success('Password changed successfully');
      setPasswordDialog(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role) => {
    const roleMap = {
      facility_manager: 'Facility Manager',
      technician: 'Maintenance Technician',
      vendor: 'Vendor',
      staff: 'Staff',
      finance: 'Finance',
    };
    return roleMap[role] || role;
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setSelectedImageFile(file);
        // In a real app, you would upload to server here
        toast.success('Profile image updated successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCertificateUpload = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const validFiles = [];
    const rejectedFiles = [];

    files.forEach((file) => {
      const isPdf = file.type === 'application/pdf';
      const isImage = file.type.startsWith('image/');
      if (!isPdf && !isImage) {
        rejectedFiles.push(file.name);
      } else {
        validFiles.push(file);
      }
    });

    if (rejectedFiles.length > 0) {
      toast.error(`Unsupported files skipped: ${rejectedFiles.join(', ')}`);
    }

    if (validFiles.length === 0) return;

    const token = localStorage.getItem('token');
    if (!token || token.startsWith('local-')) {
      toast.error('Certificate upload requires a backend login');
      event.target.value = '';
      return;
    }

    setLoading(true);
    uploadCertificates(validFiles)
      .then((updatedUser) => {
        updateUser(updatedUser);
        setCertificates(updatedUser?.certificates || []);
        toast.success(
          validFiles.length > 1 ? 'Certificates uploaded' : 'Certificate uploaded'
        );
      })
      .catch(() => {
        toast.error('Failed to upload certificates');
      })
      .finally(() => {
        setLoading(false);
      });

    event.target.value = '';
  };

  const handleRemoveCertificate = (id) => {
    const token = localStorage.getItem('token');
    if (token && !token.startsWith('local-')) {
      toast.info('Certificate removal is not available yet.');
      return;
    }
    const next = certificates.filter((c) => (c?.id || c) !== id);
    setCertificates(next);
    updateUser({ certificates: next });
    toast.info('Certificate removed');
  };

  const buildUploadUrl = (filePath) => {
    const apiBase = import.meta.env.VITE_API_URL || '/api';
    const base = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
    return `${base}/${filePath.replace(/^\/+/, '')}`;
  };

  const openProtectedFile = async (filePath) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(buildUploadUrl(filePath), {
        responseType: 'blob',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const objectUrl = URL.createObjectURL(response.data);
      window.open(objectUrl, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch (error) {
      toast.error('Unable to open file');
    }
  };

  if (!user) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>
        <Alert severity="info">
          Please log in to view your profile.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={2}>
        <motion.div
          whileHover={{
            x: -4,
            scale: 1.02,
          }}
          whileTap={{ scale: 0.98 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 17
          }}
        >
          <Button
            variant="text"
            startIcon={
              <motion.div
                whileHover={{ x: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <ArrowBack />
              </motion.div>
            }
            onClick={() => navigate(getHomeRoute(user?.role))}
            sx={{
              color: 'primary.main',
              fontWeight: 500,
              borderRadius: 2,
              px: 2,
              py: 1,
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              }
            }}
          >
            Return to Dashboard
          </Button>
        </motion.div>
      </Box>
      <Typography variant="h4" gutterBottom>
        Profile Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={3}>
                <Box position="relative">
                  <Avatar
                    src={avatarPreview || '/avatar-placeholder.svg'}
                    sx={{ width: 80, height: 80 }}
                  >
                    {user.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <IconButton
                    size="small"
                    onClick={handleCameraClick}
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': { backgroundColor: 'primary.dark' }
                    }}
                  >
                    <PhotoCamera fontSize="small" />
                  </IconButton>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </Box>
                <Box flex={1}>
                  <Typography variant="h5">{user.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getRoleDisplayName(user.role)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!isEditing} variant={isEditing ? 'outlined' : 'filled'}>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      label="Gender"
                    >
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth disabled variant="filled">
                    <InputLabel>Role</InputLabel>
                    <Select value={formData.role} label="Role">
                      <MenuItem value="facility_manager">Facility Manager</MenuItem>
                      <MenuItem value="technician">Maintenance Technician</MenuItem>
                      <MenuItem value="vendor">Vendor</MenuItem>
                      <MenuItem value="staff">Staff</MenuItem>
                      <MenuItem value="finance">Finance</MenuItem>
                    </Select>
                  </FormControl>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Role changes must be requested through your administrator.
                  </Typography>
                </Grid>
              </Grid>

              {isEditing && (
                <Box mt={3} display="flex" gap={2}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Security
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Button
                fullWidth
                variant="outlined"
                onClick={() => setPasswordDialog(true)}
                sx={{ mb: 2 }}
              >
                Change Password
              </Button>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Last login: {new Date().toLocaleDateString()}
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Certificates */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Certificates
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<VerifiedUser />}
                  onClick={() => certificateInputRef.current?.click()}
                >
                  Upload Certificate
                </Button>
                <Typography variant="caption" color="text.secondary">
                  PDF or image files are supported.
                </Typography>
                <input
                  type="file"
                  ref={certificateInputRef}
                  onChange={handleCertificateUpload}
                  accept="application/pdf,image/*"
                  multiple
                  style={{ display: 'none' }}
                />
              </Box>

              {certificates.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No certificates uploaded yet.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {certificates.map((cert) => {
                    const certPath = typeof cert === 'string' ? cert : cert?.path || cert?.dataUrl || '';
                    const fileName = typeof cert === 'string'
                      ? certPath.split('/').pop()
                      : cert?.name || certPath.split('/').pop();
                    const isPdf = typeof cert === 'string'
                      ? fileName?.toLowerCase().endsWith('.pdf')
                      : cert?.type === 'application/pdf';
                    return (
                      <Grid item xs={12} sm={6} md={4} key={cert?.id || certPath}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                              {isPdf ? (
                                <Box
                                  sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 1,
                                    bgcolor: 'grey.100',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <DescriptionIcon />
                                </Box>
                              ) : (
                                <Avatar
                                  variant="rounded"
                                  src={typeof cert === 'string' ? undefined : cert?.dataUrl}
                                  sx={{ width: 48, height: 48 }}
                                />
                              )}
                              <Box flex={1}>
                                <Typography variant="body2" fontWeight={600} noWrap>
                                  {fileName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Uploaded
                                </Typography>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveCertificate(cert?.id || certPath)}
                                title="Remove"
                              >
                                <Cancel fontSize="small" />
                              </IconButton>
                            </Box>
                            <Box mt={1}>
                              <Button
                                size="small"
                                variant="text"
                                onClick={() =>
                                  typeof cert === 'string'
                                    ? openProtectedFile(certPath)
                                    : window.open(cert?.dataUrl, '_blank')
                                }
                              >
                                View
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Current Password"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;


import React from 'react';
import { Typography, Box } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Typography variant="body1">
        User: {user?.name || 'Not logged in'}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        This page is under development.
      </Typography>
    </Box>
  );
};

export default Profile;


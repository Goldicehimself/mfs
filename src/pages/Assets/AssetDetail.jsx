import React from 'react';
import { Typography, Box } from '@mui/material';
import { useParams } from 'react-router-dom';

const AssetDetail = () => {
  const { id } = useParams();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Asset Details
      </Typography>
      <Typography variant="body1">
        Asset ID: {id}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        This page is under development.
      </Typography>
    </Box>
  );
};

export default AssetDetail;


import React from 'react';
import { Typography, Box } from '@mui/material';
import { useParams } from 'react-router-dom';

const WorkOrderDetail = () => {
  const { id } = useParams();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Work Order Details
      </Typography>
      <Typography variant="body1">
        Work Order ID: {id}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        This page is under development.
      </Typography>
    </Box>
  );
};

export default WorkOrderDetail;


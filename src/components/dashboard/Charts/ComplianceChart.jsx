import React from 'react';
import { Box, Typography } from '@mui/material';

const ComplianceChart = ({ data }) => {
  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        Chart component - under development
      </Typography>
      {data && data.length === 0 && (
        <Typography variant="caption" color="text.secondary">
          No data available
        </Typography>
      )}
    </Box>
  );
};

export default ComplianceChart;


import React, { useMemo } from 'react';
import { Container, Box, Typography, Button, Card, CardContent, Chip, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PMOverdue = () => {
  const navigate = useNavigate();
  const overdueTasks = useMemo(() => {
    try {
      const tasks = JSON.parse(localStorage.getItem('pm_tasks') || '[]');
      return tasks.filter((task) => {
        if (!task.dueDate) return false;
        const due = new Date(task.dueDate);
        return due < new Date();
      });
    } catch (error) {
      return [];
    }
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827' }}>
          Overdue PM Tasks
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
      <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 2.5 }}>
          {overdueTasks.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No overdue PM tasks.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {overdueTasks.map((task) => (
                <Box
                  key={task.id}
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 1, bgcolor: '#f9fafb' }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem' }}>
                      {task.title}
                    </Typography>
                    <Typography variant="caption" color="#6b7280" sx={{ fontWeight: 500 }}>
                      {task.asset} • Due {task.dueDate}
                    </Typography>
                  </Box>
                  <Chip
                    label={(task.priority || 'medium').charAt(0).toUpperCase() + (task.priority || 'medium').slice(1)}
                    size="small"
                    color={task.priority === 'critical' || task.priority === 'high' ? 'error' : 'warning'}
                    variant="filled"
                    sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                  />
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default PMOverdue;

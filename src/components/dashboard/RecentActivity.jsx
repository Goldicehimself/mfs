import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const RecentActivity = ({ activities = [] }) => {
  if (!activities || activities.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No recent activity
        </Typography>
      </Box>
    );
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'work_order':
        return <AssignmentIcon />;
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'overdue':
        return <WarningIcon color="error" />;
      case 'maintenance':
        return <BuildIcon />;
      default:
        return <AssignmentIcon />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'completed':
        return 'success';
      case 'overdue':
        return 'error';
      case 'work_order':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <List>
      {activities.map((activity, index) => (
        <React.Fragment key={activity.id || index}>
          <ListItem alignItems="flex-start">
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: `${getActivityColor(activity.type)}.light`, color: `${getActivityColor(activity.type)}.main` }}>
                {getActivityIcon(activity.type)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={activity.title || activity.message}
              secondary={
                <React.Fragment>
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.primary"
                  >
                    {activity.description || activity.message}
                  </Typography>
                  {activity.timestamp && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </Typography>
                  )}
                </React.Fragment>
              }
            />
          </ListItem>
          {index < activities.length - 1 && <Divider variant="inset" component="li" />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default RecentActivity;

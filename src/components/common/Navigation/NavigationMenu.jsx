import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  Typography,
} from '@mui/material';
import { LayoutDashboard, Wrench, ClipboardList, Calendar, Building, Users, Boxes, BarChart, Settings2, ChevronUp, ChevronDown, PlusCircle, List as IconList } from 'lucide-react';
import './NavigationMenu.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

const NavigationMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [openWorkOrders, setOpenWorkOrders] = React.useState(false);
  const [openAssets, setOpenAssets] = React.useState(false);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
      path: '/dashboard',
      roles: ['facility_manager', 'admin'],
    },
    {
      title: 'Assets',
      icon: <Building size={18} />,
      children: [
        { title: 'Asset List', path: '/assets', icon: <IconList size={16} /> },
        { title: 'Add New Asset', path: '/assets/new', icon: <PlusCircle size={16} /> },
      ],
      roles: ['facility_manager', 'admin', 'technician'],
    },
    {
      title: 'Work Orders',
      icon: <ClipboardList size={18} />,
      children: [
        { title: 'All Work Orders', path: '/work-orders', icon: <IconList size={16} /> },
        { title: 'Create New', path: '/work-orders/new', icon: <PlusCircle size={16} /> },
        { title: 'My Assignments', path: '/work-orders?filter=my-tasks', icon: <Wrench size={16} /> },
      ],
      roles: ['facility_manager', 'admin', 'technician', 'vendor'],
    },
    {
      title: 'Preventive Maintenance',
      icon: <Calendar size={18} />,
      path: '/preventive-maintenance',
      roles: ['facility_manager', 'admin'],
    },
    {
      title: 'Service Requests',
      icon: <PlusCircle size={18} />,
      path: '/service-requests',
      roles: ['facility_manager', 'admin', 'staff'],
    },
    {
      title: 'Vendors',
      icon: <Users size={18} />,
      path: '/vendors',
      roles: ['facility_manager', 'admin', 'procurement'],
    },
    {
      title: 'Inventory',
      icon: <Boxes size={18} />,
      path: '/inventory',
      roles: ['facility_manager', 'admin', 'technician'],
    },
    {
      title: 'Reports',
      icon: <BarChart size={18} />,
      path: '/reports',
      roles: ['facility_manager', 'admin', 'finance'],
    },
    {
      title: 'Settings',
      icon: <Settings2 size={18} />,
      path: '/settings',
      roles: ['facility_manager', 'admin'],
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role) || user?.role === 'admin'
  );

  const renderMenuItem = (item) => {
    if (item.children) {
      const open = item.title === 'Work Orders' ? openWorkOrders : openAssets;
      const setOpen = item.title === 'Work Orders' ? setOpenWorkOrders : setOpenAssets;

      return (
        <React.Fragment key={item.title}>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setOpen(!open)}>
              <ListItemIcon sx={{ color: 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.title} />
              {open ? <ChevronUp size={14} /> : <ChevronDown size={14} /> }
            </ListItemButton>
          </ListItem>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child) => (
                <ListItem key={child.title} disablePadding>
                  <ListItemButton
                    sx={{ pl: 4 }}
                    onClick={() => navigate(child.path)}
                    selected={isActive(child.path)}
                  >
                    <ListItemIcon sx={{ color: 'text.secondary', minWidth: 40 }}>
                      {child.icon}
                    </ListItemIcon>
                    <ListItemText primary={child.title} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </React.Fragment>
      );
    }

    return (
      <ListItem key={item.title} disablePadding>
        <ListItemButton
          onClick={() => navigate(item.path)}
          selected={isActive(item.path)}
        >
          <ListItemIcon sx={{ color: 'text.secondary' }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText primary={item.title} />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Box className="navigation-menu">
      {/* Logo */}
      <Box className="logo" sx={{ p: 3, pb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
          SMMP
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Facility Maintenance Platform
        </Typography>
      </Box>

      {/* Menu Items */}
      <List>
        {filteredMenuItems.map(renderMenuItem)}
      </List>

      {/* Quick Actions for Technicians */}
      {user?.role === 'technician' && (
        <Box sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Quick Actions
          </Typography>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                }}
                onClick={() => navigate('/work-orders/new')}
              >
                <ListItemIcon sx={{ color: 'white' }}>
                  <PlusCircle size={18} />
                </ListItemIcon>
                <ListItemText primary="Report Issue" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      )}
    </Box>
  );
};

export default NavigationMenu;
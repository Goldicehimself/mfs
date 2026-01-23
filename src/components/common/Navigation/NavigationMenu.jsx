import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Divider,
  Avatar,
  IconButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Wrench,
  ClipboardList,
  Calendar,
  Building,
  Users,
  Boxes,
  BarChart,
  Settings2,
  ChevronUp,
  ChevronDown,
  PlusCircle,
  List as IconList,
  Users2,
  DollarSign,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

// This component now only renders the menu content.
// The layout (Drawer / aside) is controlled by the parent (MainLayout).
const NavigationMenu = ({ onCloseMobile = () => {} }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [openAssets, setOpenAssets] = React.useState(false);
  const [openWorkOrders, setOpenWorkOrders] = React.useState(false);
  const pendingLeaveCount = user?.role === 'staff' ? 1 : 0;

  // Auto-open based on current route
  React.useEffect(() => {
    if (location.pathname.startsWith('/assets')) setOpenAssets(true);
    if (location.pathname.startsWith('/work-orders')) setOpenWorkOrders(true);
  }, [location.pathname]);

  const isActive = (path) =>
    location.pathname === path ||
    location.pathname.startsWith(path + '/');

  const menuItems = [
    {
      title: 'Technician Portal',
      icon: <Wrench />,
      path: '/technician-portal',
      roles: ['technician'],
    },
    {
      title: 'My Assignments',
      icon: <ClipboardList />,
      path: '/work-orders/my-assignments',
      roles: ['technician'],
    },
    {
      title: 'Dashboard',
      icon: <LayoutDashboard />,
      path: '/dashboard',
      roles: ['facility_manager', 'admin'],
    },
    {
      title: 'Assets',
      icon: <Building />,
      roles: ['facility_manager', 'admin'],
      children: [
        { title: 'Asset List', path: '/assets', icon: <IconList /> },
        { title: 'Add New Asset', path: '/assets/new', icon: <PlusCircle /> },
      ],
    },
    {
      title: 'Work Orders',
      icon: <ClipboardList />,
      roles: ['facility_manager', 'admin'],
      children: [
        { title: 'All Work Orders', path: '/work-orders', icon: <IconList /> },
        { title: 'Create New', path: '/work-orders/new', icon: <PlusCircle /> },
        { title: 'My Assignments', path: '/work-orders/my-assignments', icon: <Wrench /> },
      ],
    },
    {
      title: 'Vendor Portal',
      icon: <Users />,
      path: '/vendor-portal',
      roles: ['vendor'],
    },
    {
      title: 'Staff Portal',
      icon: <Users2 />,
      path: '/staff-portal',
      roles: ['staff'],
    },
    {
      title: 'Staff Management',
      icon: <Users2 />,
      path: '/staff-management',
      roles: ['facility_manager', 'admin'],
    },
    {
      title: 'Leave Center',
      icon: <Calendar />,
      path: '/leave-center',
      roles: ['staff'],
    },
    {
      title: 'Finance Portal',
      icon: <DollarSign />,
      path: '/finance-portal',
      roles: ['facility_manager', 'admin', 'finance'],
    },
    {
      title: 'Preventive Maintenance',
      icon: <Calendar />,
      path: '/preventive-maintenance',
      roles: ['facility_manager', 'admin'],
    },
    {
      title: 'Service Requests',
      icon: <PlusCircle />,
      path: '/service-requests',
      roles: ['facility_manager', 'admin', 'staff'],
    },
    {
      title: 'Vendors',
      icon: <Users />,
      path: '/vendors',
      roles: ['facility_manager', 'admin', 'procurement'],
    },
    {
      title: 'Inventory',
      icon: <Boxes />,
      path: '/inventory',
      roles: ['facility_manager', 'admin'],
    },
    {
      title: 'Reports',
      icon: <BarChart />,
      path: '/reports',
      roles: ['facility_manager', 'admin', 'finance'],
    },
    {
      title: 'Settings',
      icon: <Settings2 />,
      path: '/settings',
      roles: ['facility_manager', 'admin'],
    },
  ];

  if (!user) return null;

  const filteredMenu = menuItems.filter(
    (item) => !item.roles || item.roles.includes(user.role)
  );

  const renderMenuItem = (item) => {
    const isAssets = item.title === 'Assets';
    const isWorkOrders = item.title === 'Work Orders';
    const open = isAssets ? openAssets : isWorkOrders ? openWorkOrders : false;
    const toggle = isAssets
      ? () => setOpenAssets(!openAssets)
      : () => setOpenWorkOrders(!openWorkOrders);
    const showLeaveCount = item.path === '/leave-center' && pendingLeaveCount > 0;

    if (item.children) {
      return (
        <React.Fragment key={item.title}>
          <ListItem disablePadding>
            <ListItemButton onClick={toggle} className={`mp-nav-item ${open ? 'open' : ''}`}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                {React.cloneElement(item.icon, { size: 18, className: 'icon' })}
              </ListItemIcon>
              <ListItemText primary={item.title} />
              {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </ListItemButton>
          </ListItem>

          <Collapse in={open} timeout="auto" unmountOnExit>
            <List disablePadding>
              {item.children.map((child) => (
                <ListItem key={child.title} disablePadding>
                  <ListItemButton
                    sx={{ pl: 4 }}
                    className={`mp-nav-item ${isActive(child.path) ? 'active' : ''}`}
                    onClick={() => {
                      navigate(child.path);
                      onCloseMobile();
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {React.cloneElement(child.icon, { size: 16, className: 'icon' })}
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
          className={`mp-nav-item ${isActive(item.path) ? 'active' : ''}`}
          onClick={() => {
            navigate(item.path);
            onCloseMobile();
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            {React.cloneElement(item.icon, { size: 18, className: 'icon' })}
          </ListItemIcon>
          <ListItemText
            primary={
              showLeaveCount ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{item.title}</span>
                  <Box
                    sx={{
                      minWidth: 20,
                      height: 20,
                      borderRadius: '999px',
                      bgcolor: '#ef4444',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 0.5,
                    }}
                  >
                    {pendingLeaveCount}
                  </Box>
                </Box>
              ) : (
                item.title
              )
            }
          />
        </ListItemButton>
      </ListItem>
    );
  };

  const drawerContent = (
    <Box className="h-full mp-sidebar">
      <Box className="mp-sidebar-header">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 1, overflow: 'hidden', bgcolor: '#fff', boxShadow: '0 1px 4px rgba(30,58,138,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 9, ease: 'linear', repeat: Infinity }} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wrench size={18} color="var(--mp-brand)" />
            </motion.div>
          </Box>

          <div style={{ flex: 1 }}>
            <Typography className="mp-sidebar-header-title">FacilityPro</Typography>
            <Typography className="mp-sidebar-header-subtitle">Maintenance made simple</Typography>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <IconButton size="small" onClick={() => navigate('/profile')} title="Profile">
              <Avatar sx={{ width: 28, height: 28 }}>{user?.name?.charAt(0) || 'U'}</Avatar>
            </IconButton>
            <IconButton size="small" onClick={() => navigate('/settings')} title="Settings">
              <Settings2 size={16} />
            </IconButton>
          </div>
        </Box>
      </Box>

      <List sx={{ mt: 1 }}>{filteredMenu.map(renderMenuItem)}</List>
    </Box>
  );

  return drawerContent;
};

export default NavigationMenu;

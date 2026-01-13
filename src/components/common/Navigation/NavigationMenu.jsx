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
} from '@mui/material';
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
      title: 'Dashboard',
      icon: <LayoutDashboard />,
      path: '/dashboard',
      roles: ['facility_manager', 'admin'],
    },
    {
      title: 'Assets',
      icon: <Building />,
      roles: ['facility_manager', 'admin', 'technician'],
      children: [
        { title: 'Asset List', path: '/assets', icon: <IconList /> },
        { title: 'Add New Asset', path: '/assets/new', icon: <PlusCircle /> },
      ],
    },
    {
      title: 'Work Orders',
      icon: <ClipboardList />,
      roles: ['facility_manager', 'admin', 'technician', 'vendor'],
      children: [
        { title: 'All Work Orders', path: '/work-orders', icon: <IconList /> },
        { title: 'Create New', path: '/work-orders/new', icon: <PlusCircle /> },
        { title: 'My Assignments', path: '/work-orders/my-assignments', icon: <Wrench /> },
      ],
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
      roles: ['facility_manager', 'admin', 'technician'],
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
          <ListItemText primary={item.title} />
        </ListItemButton>
      </ListItem>
    );
  };

  const drawerContent = (
    <Box className="h-full">
      <Box className="mp-sidebar-header">
        <Typography className="mp-sidebar-header-title">SMMP</Typography>
        <Typography className="mp-sidebar-header-subtitle">Facility Maintenance</Typography>
      </Box>

      <List>{filteredMenu.map(renderMenuItem)}</List>

      {user.role === 'technician' && (
        <>
          <Divider />
          <Box className="p-3">
            <ListItemButton
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                borderRadius: 1,
                '&:hover': { backgroundColor: 'primary.dark' },
              }}
              onClick={() => {
                navigate('/work-orders/new');
                onCloseMobile();
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                <PlusCircle size={18} />
              </ListItemIcon>
              <ListItemText primary="Report Issue" />
            </ListItemButton>
          </Box>
        </>
      )}
    </Box>
  );

  return drawerContent;
};

export default NavigationMenu;

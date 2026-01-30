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
  Popover,
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
  ChevronsLeft,
  ChevronsRight,
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
const NavigationMenu = ({ onCloseMobile = () => {}, collapsed = false, onToggleCollapse = () => {} }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [openAssets, setOpenAssets] = React.useState(false);
  const [openWorkOrders, setOpenWorkOrders] = React.useState(false);
  const pendingLeaveCount = user?.role === 'staff' ? 1 : 0;
  const [hoverAnchor, setHoverAnchor] = React.useState(null);
  const [hoverItems, setHoverItems] = React.useState([]);
  const [hoverTitle, setHoverTitle] = React.useState('');
  const hoverCloseRef = React.useRef(null);

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
      title: 'Assignment Summary',
      icon: <ClipboardList />,
      path: '/work-orders/my-assignments',
      roles: ['facility_manager', 'admin'],
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

  const isManager = ['facility_manager', 'admin'].includes(user?.role);

  const groupedMenu = [
    {
      label: 'Operations',
      items: ['Dashboard', 'Assets', 'Work Orders', 'Preventive Maintenance', 'Service Requests', 'Inventory'],
    },
    {
      label: 'People',
      items: ['Staff Management', 'Vendors', 'Vendor Portal', 'Staff Portal', 'Technician Portal', 'My Assignments', 'Assignment Summary', 'Leave Center'],
    },
    {
      label: 'Admin',
      items: ['Finance Portal', 'Reports', 'Settings'],
    },
  ];

  const primaryAction = {
    title: 'New Work Order',
    icon: <PlusCircle />,
    path: '/work-orders/new',
  };

  const renderMenuItem = (item) => {
    const isAssets = item.title === 'Assets';
    const isWorkOrders = item.title === 'Work Orders';
    const open = isAssets ? openAssets : isWorkOrders ? openWorkOrders : false;
    const toggle = isAssets
      ? () => setOpenAssets(!openAssets)
      : () => setOpenWorkOrders(!openWorkOrders);
    const showLeaveCount = item.path === '/leave-center' && pendingLeaveCount > 0;
    const isFlyout = collapsed && item.children && item.children.length > 0;

    const openHover = (event) => {
      if (!isFlyout) return;
      if (hoverCloseRef.current) {
        clearTimeout(hoverCloseRef.current);
        hoverCloseRef.current = null;
      }
      setHoverAnchor(event.currentTarget);
      setHoverItems(item.children);
      setHoverTitle(item.title);
    };

    const scheduleClose = () => {
      if (!isFlyout) return;
      if (hoverCloseRef.current) clearTimeout(hoverCloseRef.current);
      hoverCloseRef.current = setTimeout(() => {
        setHoverAnchor(null);
        setHoverItems([]);
        setHoverTitle('');
      }, 150);
    };

    if (item.children) {
      return (
        <React.Fragment key={item.title}>
          <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              if (collapsed && item.children?.[0]) {
                navigate(item.children[0].path);
                onCloseMobile();
                return;
              }
              toggle();
            }}
            onMouseEnter={openHover}
            onMouseLeave={scheduleClose}
            className={`mp-nav-item ${open ? 'open' : ''}`}
            title={collapsed ? item.title : undefined}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              {React.cloneElement(item.icon, { size: 18, className: 'icon' })}
            </ListItemIcon>
            {!collapsed && <ListItemText primary={item.title} />}
            {!collapsed && (open ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
          </ListItemButton>
        </ListItem>

          <Collapse in={open && !collapsed} timeout="auto" unmountOnExit>
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
                    title={collapsed ? child.title : undefined}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {React.cloneElement(child.icon, { size: 16, className: 'icon' })}
                    </ListItemIcon>
                    {!collapsed && <ListItemText primary={child.title} />}
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
        onMouseEnter={openHover}
        onMouseLeave={scheduleClose}
        title={collapsed ? item.title : undefined}
      >
        <ListItemIcon sx={{ minWidth: 36 }}>
          {React.cloneElement(item.icon, { size: 18, className: 'icon' })}
        </ListItemIcon>
        {!collapsed && (
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
        )}
      </ListItemButton>
    </ListItem>
  );
};

  const drawerContent = (
    <Box className="h-full mp-sidebar">
      <Box className="mp-sidebar-header">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 1, overflow: 'hidden', bgcolor: '#fff', boxShadow: '0 1px 4px rgba(30,58,138,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 9, ease: 'linear', repeat: Infinity }} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wrench size={18} color="var(--mp-brand)" />
            </motion.div>
          </Box>

          {!collapsed && (
            <div style={{ flex: 1 }}>
            <Typography className="mp-sidebar-header-title">FacilityPro</Typography>
            <Typography className="mp-sidebar-header-subtitle">Maintenance made simple</Typography>
            </div>
          )}

          {!collapsed && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <IconButton size="small" onClick={() => navigate('/profile')} title="Profile">
              <Avatar sx={{ width: 28, height: 28 }}>{user?.name?.charAt(0) || 'U'}</Avatar>
            </IconButton>
            <IconButton size="small" onClick={() => navigate('/settings')} title="Settings">
              <Settings2 size={16} />
            </IconButton>
            </div>
          )}
        </Box>
      </Box>

      <Box sx={{ px: collapsed ? 1 : 2, pt: 2 }}>
        {isManager && (
          <ListItemButton
            onClick={() => {
              navigate(primaryAction.path);
              onCloseMobile();
            }}
            className="mp-nav-item active"
            sx={{
              borderRadius: 2,
              bgcolor: '#2563eb',
              color: '#fff',
              '&:hover': { bgcolor: '#1d4ed8' },
              mb: 1,
            }}
            title={collapsed ? primaryAction.title : undefined}
          >
            <ListItemIcon sx={{ minWidth: 36, color: '#fff' }}>
              {React.cloneElement(primaryAction.icon, { size: 18 })}
            </ListItemIcon>
            {!collapsed && <ListItemText primary={primaryAction.title} />}
          </ListItemButton>
        )}
      </Box>

      {collapsed ? (
        <List sx={{ px: 1 }}>{filteredMenu.map(renderMenuItem)}</List>
      ) : (
        groupedMenu.map((group) => {
          const items = filteredMenu.filter((item) => group.items.includes(item.title));
          if (items.length === 0) return null;
          return (
            <Box key={group.label} sx={{ pb: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  px: 2,
                  pb: 0.5,
                  color: '#64748b',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {group.label}
              </Typography>
              <List sx={{ px: 1 }}>
                {items.map(renderMenuItem)}
              </List>
              <Divider sx={{ my: 1 }} />
            </Box>
          );
        })
      )}

      <Popover
        open={Boolean(hoverAnchor)}
        anchorEl={hoverAnchor}
        onClose={() => {
          setHoverAnchor(null);
          setHoverItems([]);
          setHoverTitle('');
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          onMouseEnter: () => {
            if (hoverCloseRef.current) {
              clearTimeout(hoverCloseRef.current);
              hoverCloseRef.current = null;
            }
          },
          onMouseLeave: () => {
            setHoverAnchor(null);
            setHoverItems([]);
            setHoverTitle('');
          },
          sx: {
            mt: -1,
            ml: 1,
            minWidth: 220,
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            boxShadow: '0 12px 30px rgba(15,23,42,0.12)',
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#475569', mb: 1 }}>
            {hoverTitle}
          </Typography>
          <List disablePadding>
            {hoverItems.map((child) => (
              <ListItem key={child.title} disablePadding>
                <ListItemButton
                  className={`mp-nav-item ${isActive(child.path) ? 'active' : ''}`}
                  onClick={() => {
                    navigate(child.path);
                    onCloseMobile();
                    setHoverAnchor(null);
                    setHoverItems([]);
                    setHoverTitle('');
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {React.cloneElement(child.icon, { size: 16, className: 'icon' })}
                  </ListItemIcon>
                  <ListItemText primary={child.title} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Popover>

      <Box sx={{ mt: 'auto', px: 2, py: 1.5, borderTop: '1px solid #e2e8f0' }}>
        <ListItemButton
          onClick={onToggleCollapse}
          className="mp-nav-item"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          sx={{
            justifyContent: collapsed ? 'center' : 'flex-start',
            px: collapsed ? 1 : 2,
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </ListItemIcon>
          {!collapsed && <ListItemText primary="Collapse" />}
        </ListItemButton>
      </Box>
    </Box>
  );

  return drawerContent;
};

export default NavigationMenu;

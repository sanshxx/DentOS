import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import {
  Box,
  Drawer,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  CalendarMonth as CalendarIcon,
  MedicalServices as MedicalServicesIcon,
  Receipt as ReceiptIcon,
  Inventory as InventoryIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  EventNote as EventNoteIcon,
  LocalHospital as LocalHospitalIcon,
  MonetizationOn as MonetizationOnIcon
} from '@mui/icons-material';
import AuthContext from '../../context/AuthContext';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const Sidebar = ({ open, handleDrawerClose, drawerWidth }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  
  const [openSubMenu, setOpenSubMenu] = React.useState({
    appointments: false,
    treatments: false,
    billing: false
  });

  const handleSubMenuClick = (menu) => {
    setOpenSubMenu({
      ...openSubMenu,
      [menu]: !openSubMenu[menu]
    });
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isSubActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      roles: ['admin', 'manager', 'dentist', 'receptionist', 'assistant']
    },
    {
      text: 'Patients',
      icon: <PeopleIcon />,
      path: '/patients',
      roles: ['admin', 'manager', 'dentist', 'receptionist', 'assistant']
    },
    {
      text: 'Appointments',
      icon: <CalendarIcon />,
      subMenu: true,
      roles: ['admin', 'manager', 'dentist', 'receptionist', 'assistant'],
      items: [
        {
          text: 'All Appointments',
          icon: <EventNoteIcon />,
          path: '/appointments',
          roles: ['admin', 'manager', 'dentist', 'receptionist', 'assistant']
        },
        {
          text: 'Calendar View',
          icon: <CalendarIcon />,
          path: '/calendar',
          roles: ['admin', 'manager', 'dentist', 'receptionist', 'assistant']
        }
      ]
    },
    {
      text: 'Treatments',
      icon: <MedicalServicesIcon />,
      subMenu: true,
      roles: ['admin', 'manager', 'dentist', 'assistant'],
      items: [
        {
          text: 'All Treatments',
          icon: <MedicalServicesIcon />,
          path: '/treatments',
          roles: ['admin', 'manager', 'dentist', 'assistant']
        },
        {
          text: 'Treatment Plans',
          icon: <LocalHospitalIcon />,
          path: '/treatments/plans',
          roles: ['admin', 'manager', 'dentist']
        }
      ]
    },
    {
      text: 'Billing',
      icon: <ReceiptIcon />,
      subMenu: true,
      roles: ['admin', 'manager', 'receptionist'],
      items: [
        {
          text: 'Invoices',
          icon: <ReceiptIcon />,
          path: '/billing',
          roles: ['admin', 'manager', 'receptionist']
        },
        {
          text: 'Create Invoice',
          icon: <MonetizationOnIcon />,
          path: '/billing/create',
          roles: ['admin', 'manager', 'receptionist']
        }
      ]
    },
    {
      text: 'Inventory',
      icon: <InventoryIcon />,
      path: '/inventory',
      roles: ['admin', 'manager', 'assistant']
    },
    {
      text: 'Drugs',
      icon: <MedicalServicesIcon />,
      path: '/drugs',
      roles: ['admin', 'manager', 'dentist']
    },
    {
      text: 'Prescriptions',
      icon: <MedicalServicesIcon />,
      path: '/prescriptions',
      roles: ['admin', 'manager', 'dentist', 'pharmacist']
    },
    {
      text: 'Clinics',
      icon: <BusinessIcon />,
      path: '/clinics',
      roles: ['admin', 'manager']
    },
    {
      text: 'Staff',
      icon: <GroupIcon />,
      path: '/staff',
      roles: ['admin', 'manager']
    },
    {
      text: 'Team',
      icon: <GroupIcon />,
      path: '/team',
      roles: ['admin']
    },
    {
      text: 'Reports',
      icon: <AssessmentIcon />,
      path: '/reports',
      roles: ['admin', 'manager']
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      roles: ['admin', 'manager']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (!user || !user.role) return false;
    return item.roles.includes(user.role);
  });

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
        },
      }}
      variant="persistent"
      anchor="left"
      open={open}
    >
      <DrawerHeader sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>D</Avatar>
          <Typography variant="h6" color="primary.main" fontWeight="bold">
            DentOS
          </Typography>
        </Box>
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </DrawerHeader>
      <Divider />
      
      {/* User Info */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        {user?.avatar ? (
          <Avatar src={user.avatar} alt={user.name} sx={{ width: 40, height: 40, mr: 2 }} />
        ) : (
          <Avatar sx={{ width: 40, height: 40, mr: 2, bgcolor: 'primary.main' }}>
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
        )}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {user?.name || 'User'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Role'}
          </Typography>
        </Box>
      </Box>
      
      <Divider />
      
      <List sx={{ pt: 1 }}>
        {filteredMenuItems.map((item) => {
          // If item has submenu
          if (item.subMenu) {
            return (
              <React.Fragment key={item.text}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleSubMenuClick(item.text.toLowerCase())}
                    sx={{
                      minHeight: 48,
                      px: 2.5,
                      bgcolor: isSubActive(`/${item.text.toLowerCase()}`) ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: 2,
                        color: isSubActive(`/${item.text.toLowerCase()}`) ? 'primary.main' : 'inherit',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{
                        fontWeight: isSubActive(`/${item.text.toLowerCase()}`) ? 'bold' : 'normal',
                        color: isSubActive(`/${item.text.toLowerCase()}`) ? 'primary.main' : 'inherit',
                      }}
                    />
                    {openSubMenu[item.text.toLowerCase()] ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={openSubMenu[item.text.toLowerCase()]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.items.map((subItem) => (
                      <ListItemButton
                        key={subItem.text}
                        sx={{
                          pl: 4,
                          bgcolor: isActive(subItem.path) ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                        }}
                        onClick={() => navigate(subItem.path)}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: 2,
                            color: isActive(subItem.path) ? 'primary.main' : 'inherit',
                          }}
                        >
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={subItem.text} 
                          primaryTypographyProps={{
                            fontWeight: isActive(subItem.path) ? 'bold' : 'normal',
                            color: isActive(subItem.path) ? 'primary.main' : 'inherit',
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            );
          }
          
          // Regular menu item
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  bgcolor: isActive(item.path) ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                }}
              >
                <Tooltip title={item.text} placement="right" arrow>
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 2,
                      color: isActive(item.path) ? 'primary.main' : 'inherit',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                </Tooltip>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontWeight: isActive(item.path) ? 'bold' : 'normal',
                    color: isActive(item.path) ? 'primary.main' : 'inherit',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Box sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          DentOS v2.0 © {new Date().getFullYear()}
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
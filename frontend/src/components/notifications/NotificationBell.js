import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  MedicalServices as TreatmentIcon,
  Settings as SystemIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../../api/notifications';

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const open = Boolean(anchorEl);

  // Fetch notifications and unread count
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const [notificationsData, unreadData] = await Promise.all([
        getNotifications(1, 10), // Get first 10 notifications
        getUnreadCount()
      ]);
      
      setNotifications(notificationsData.data || []);
      setUnreadCount(unreadData.count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications(); // Refresh when opening
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await markAsRead(notification._id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => 
          prev.map(n => 
            n._id === notification._id ? { ...n, isRead: true } : n
          )
        );
      }
      
      if (notification.actionUrl) {
        navigate(notification.actionUrl);
      }
      
      handleClose();
    } catch (error) {
      console.error('Error handling notification click:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <EventIcon fontSize="small" color="primary" />;
      case 'patient':
        return <PersonIcon fontSize="small" color="success" />;
      case 'inventory':
        return <InventoryIcon fontSize="small" color="warning" />;
      case 'billing':
        return <ReceiptIcon fontSize="small" color="error" />;
      case 'treatment':
        return <TreatmentIcon fontSize="small" color="info" />;
      case 'system':
        return <SystemIcon fontSize="small" color="action" />;
      default:
        return <NotificationsIcon fontSize="small" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ ml: 1 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Notifications</Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={handleMarkAllAsRead}>
                Mark all as read
              </Button>
            )}
          </Box>
        </Box>
        
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No notifications
              </Typography>
            </Box>
          ) : (
            notifications.map((notification) => (
              <MenuItem
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  p: 2,
                  borderBottom: 1,
                  borderColor: 'divider',
                  backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                  '&:hover': {
                    backgroundColor: 'action.selected'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                  {getNotificationIcon(notification.type)}
                  <Typography
                    variant="subtitle2"
                    sx={{ ml: 1, flexGrow: 1, fontWeight: notification.isRead ? 'normal' : 'bold' }}
                  >
                    {notification.title}
                  </Typography>
                  <Chip
                    label={notification.priority}
                    size="small"
                    color={getPriorityColor(notification.priority)}
                    sx={{ ml: 1 }}
                  />
                </Box>
                
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1, width: '100%' }}
                >
                  {notification.message}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(notification.createdAt)}
                  </Typography>
                  {!notification.isRead && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main'
                      }}
                    />
                  )}
                </Box>
              </MenuItem>
            ))
          )}
        </Box>
        
        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1 }}>
              <Button
                fullWidth
                size="small"
                onClick={() => {
                  navigate('/notifications');
                  handleClose();
                }}
              >
                View all notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;

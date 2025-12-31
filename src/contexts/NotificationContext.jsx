import React, { createContext, useState, useContext, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { toast } from 'react-toastify';

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const { subscribe, unsubscribe } = useWebSocket();

  useEffect(() => {
    // Subscribe to notification events
    const handleNotification = (data) => {
      const newNotification = {
        id: Date.now(),
        type: data.type,
        title: data.title,
        message: data.message,
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: data.actionUrl,
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast based on notification type
      switch (data.type) {
        case 'work_order_assigned':
          toast.info(`New work order assigned: ${data.title}`);
          break;
        case 'work_order_overdue':
          toast.error(`Work order overdue: ${data.title}`);
          break;
        case 'pm_due':
          toast.warning(`Preventive maintenance due: ${data.title}`);
          break;
        default:
          toast.info(data.message);
      }
    };

    subscribe('notification', handleNotification);

    return () => {
      unsubscribe('notification', handleNotification);
    };
  }, [subscribe, unsubscribe]);

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
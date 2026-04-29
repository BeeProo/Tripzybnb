import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from '../api';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  // Connect socket and fetch notifications when user logs in
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Fetch initial notifications
    fetchNotifications();
    fetchUnreadCount();

    // Connect to Socket.io
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    const socket = io(socketUrl, {
      withCredentials: true,
    });

    socket.on('connect', () => {
      socket.emit('user:online', user._id);
    });

    // Listen for new notifications
    socket.on('notification:new', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [user?._id]);

  const fetchNotifications = async () => {
    try {
      const { data } = await getNotifications();
      setNotifications(data.data);
      setUnreadCount(data.unreadCount);
    } catch {
      // silently fail
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const { data } = await getUnreadCount();
      setUnreadCount(data.count);
    } catch {
      // silently fail
    }
  };

  const markRead = useCallback(async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // silently fail
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markRead, markAllRead, fetchNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);

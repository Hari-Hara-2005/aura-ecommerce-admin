import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { productService, orderService, userService, notificationService } from '../services/api';
import { getSocket } from '../services/socket';
import { useAdminAuth } from './AuthContext';
import {
  setNotifications as setNotificationsAction,
  addNotification as addNotificationAction,
  markAsRead as markAsReadAction,
  markAllAsRead as markAllAsReadAction,
} from '../store/slices/notificationSlice';

import { formatINR } from '../utils/format';
import { formatTimeAgo } from '../utils/timeAgo';

const NotificationContext = createContext(null);

const STORAGE_KEY_READ = 'aura_admin_read_notifications';
const STORAGE_KEY_DISMISSED = 'aura_admin_dismissed_notifications';

function getStoredIds(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredIds(key, ids) {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {}
}

function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
  }
}

export function NotificationProvider({ children }) {
  const dispatch = useDispatch();
  const { user } = useAdminAuth() || {};
  const adminId = useMemo(() => {
    return (
      user?.primaryEmailAddress?.emailAddress ||
      user?.id ||
      'default_admin'
    );
  }, [user]);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [readIds, setReadIds] = useState(() => getStoredIds(STORAGE_KEY_READ));
  const [dismissedIds, setDismissedIds] = useState(() => getStoredIds(STORAGE_KEY_DISMISSED));

  const [socketConnected, setSocketConnected] = useState(false);

  const loadThreshold = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('aura_store_settings') || '{}');
      return Number(saved.lowStockThreshold) || 10;
    } catch {
      return 10;
    }
  };

  const fetchNotificationData = useCallback(async () => {
    setLoading(true);
    try {
      const lowStockThreshold = loadThreshold();

      const [prodsRes, ordsRes, usersRes, statusRes] = await Promise.allSettled([
        productService.getProducts({ limit: 100 }),
        orderService.getOrders(),
        userService.getUsers(),
        notificationService.getStatus(adminId),
      ]);

      if (statusRes.status === 'fulfilled' && statusRes.value) {
        const { readKeys = [], dismissedKeys = [] } = statusRes.value;

        setReadIds((prev) => {
          const merged = Array.from(new Set([...prev, ...readKeys]));
          saveStoredIds(STORAGE_KEY_READ, merged);
          return merged;
        });

        setDismissedIds((prev) => {
          const merged = Array.from(new Set([...prev, ...dismissedKeys]));
          saveStoredIds(STORAGE_KEY_DISMISSED, merged);
          return merged;
        });
      }

      const rawProducts = prodsRes.status === 'fulfilled' ? (prodsRes.value?.products || prodsRes.value || []) : [];
      const rawOrders = ordsRes.status === 'fulfilled' ? (Array.isArray(ordsRes.value) ? ordsRes.value : []) : [];
      const rawUsers = usersRes.status === 'fulfilled' ? (Array.isArray(usersRes.value) ? usersRes.value : []) : [];

      const items = [];

      rawProducts.forEach((p) => {
        const stockNum = Number(p.stock !== undefined ? p.stock : 0);
        const name = p.name || p.title || 'Product';
        const pId = p.id || p._id || name;

        if (stockNum <= 0) {
          items.push({
            id: `stock_out_${pId}`,
            type: 'inventory',
            subType: 'out_of_stock',
            severity: 'danger',
            priority: 1,
            title: `Out of Stock: ${name}`,
            message: `Inventory depleted (0 units remaining). Immediate restock recommended.`,
            meta: `Price: ${formatINR(p.price || 0)} • Category: ${p.category_name || p.category || 'General'}`,
            timestamp: p.updated_at || p.created_at || new Date().toISOString(),
            link: `/products?stock=OUT_OF_STOCK&search=${encodeURIComponent(name)}`,
            data: p,
          });
        } else if (stockNum <= lowStockThreshold) {
          items.push({
            id: `stock_low_${pId}`,
            type: 'inventory',
            subType: 'low_stock',
            severity: 'warning',
            priority: 2,
            title: `Low Stock Alert: ${name}`,
            message: `Only ${stockNum} unit${stockNum === 1 ? '' : 's'} remaining in catalog (Threshold: ${lowStockThreshold}).`,
            meta: `Price: ${formatINR(p.price || 0)} • Category: ${p.category_name || p.category || 'General'}`,
            timestamp: p.updated_at || p.created_at || new Date().toISOString(),
            link: `/products?stock=LOW_STOCK&search=${encodeURIComponent(name)}`,
            data: p,
          });
        }
      });

      rawOrders.forEach((o) => {
        const oId = o.id || o._id || 'unknown';
        const shortId = String(oId).slice(0, 8).toUpperCase();
        const customerName = o.customer?.name || o.customer_name || `${o.customer?.firstName || ''} ${o.customer?.lastName || ''}`.trim() || 'Client';
        const total = formatINR(o.total_amount || o.pricing?.total || 0);
        const status = o.status || 'Confirmed';
        const paymentStatus = o.payment_status || o.payment?.status || 'Pending';
        const itemCount = (o.items || []).length || 1;

        items.push({
          id: `order_${oId}`,
          type: 'order',
          subType: 'new_order',
          severity: status === 'Cancelled' ? 'neutral' : 'info',
          priority: 3,
          title: `New Order #${shortId}`,
          message: `${customerName} placed an order for ${total} (${itemCount} item${itemCount > 1 ? 's' : ''}).`,
          meta: `Status: ${status} • Payment: ${paymentStatus} • Gateway: ${o.payment_method || 'Razorpay'}`,
          timestamp: o.createdAt || o.created_at || new Date().toISOString(),
          link: `/orders?search=${encodeURIComponent(oId)}`,
          data: o,
        });
      });

      rawUsers.forEach((u) => {
        const uId = u.id || u.clerk_user_id || u.email;
        const name = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'New Shopper';
        const email = u.email || 'No email provided';
        const ordersCount = Number(u.orders_count || u.ordersCount || 0);
        const totalSpent = Number(u.total_spent || u.totalSpent || 0);

        items.push({
          id: `customer_${uId}`,
          type: 'customer',
          subType: 'new_customer',
          severity: 'success',
          priority: 4,
          title: `New Customer: ${name}`,
          message: `${email} registered in store.`,
          meta: `Tiers: ${ordersCount > 0 ? `${ordersCount} orders (${formatINR(totalSpent)})` : 'New account'}`,
          timestamp: u.created_at || u.createdAt || new Date().toISOString(),
          link: `/users?search=${encodeURIComponent(email !== 'No email provided' ? email : name)}`,
          data: u,
        });
      });

      items.sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime() || 0;
        const timeB = new Date(b.timestamp).getTime() || 0;
        return timeB - timeA;
      });

      setNotifications(items);
      dispatch(setNotificationsAction(items));
      setLastUpdated(new Date());
    } catch (err) {
      console.error('[NotificationContext] Failed to load notification feed:', err);
    } finally {
      setLoading(false);
    }
  }, [adminId]);

  useEffect(() => {
    fetchNotificationData();

    const interval = setInterval(() => {
      fetchNotificationData();
    }, 60000);

    const onFocus = () => {
      fetchNotificationData();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchNotificationData]);

  useEffect(() => {
    const s = getSocket();

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    if (s.connected) {
      setSocketConnected(true);
    }

    s.on('connect', handleConnect);
    s.on('disconnect', handleDisconnect);

    const handleIncomingNotification = (newNotif) => {
      if (!newNotif || !newNotif.id) return;
      playNotificationChime();

      setNotifications((prev) => {
        const exists = prev.some((n) => n.id === newNotif.id);
        if (exists) {
          return prev.map((n) => (n.id === newNotif.id ? { ...n, ...newNotif } : n));
        }
        return [newNotif, ...prev];
      });
    };

    const handleStateSync = (payload) => {
      if (!payload) return;
      if (payload.action === 'markRead') {
        setReadIds((prev) => Array.from(new Set([...prev, ...(payload.keys || [])])));
      } else if (payload.action === 'markUnread') {
        if (payload.key) {
          setReadIds((prev) => prev.filter((k) => k !== payload.key));
        }
      } else if (payload.action === 'dismiss') {
        setDismissedIds((prev) => Array.from(new Set([...prev, ...(payload.keys || [])])));
      } else if (payload.action === 'reset') {
        setReadIds([]);
        setDismissedIds([]);
      }
    };

    s.on('admin:notification', handleIncomingNotification);
    s.on('notification:state_synced', handleStateSync);

    return () => {
      s.off('connect', handleConnect);
      s.off('disconnect', handleDisconnect);
      s.off('admin:notification', handleIncomingNotification);
      s.off('notification:state_synced', handleStateSync);
    };
  }, []);

  const markAsRead = useCallback((id) => {
    dispatch(markAsReadAction(id));
    setReadIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      saveStoredIds(STORAGE_KEY_READ, next);
      return next;
    });
    notificationService.markRead(id, adminId);
  }, [adminId, dispatch]);

  const markAsUnread = useCallback((id) => {
    setReadIds((prev) => {
      const next = prev.filter((i) => i !== id);
      saveStoredIds(STORAGE_KEY_READ, next);
      return next;
    });
    notificationService.markUnread(id, adminId);
  }, [adminId]);

  const markAllAsRead = useCallback(() => {
    dispatch(markAllAsReadAction());
    setNotifications((current) => {
      const activeIds = current.map((n) => n.id);
      setReadIds((prev) => {
        const combined = Array.from(new Set([...prev, ...activeIds]));
        saveStoredIds(STORAGE_KEY_READ, combined);
        return combined;
      });
      notificationService.markRead(activeIds, adminId);
      return current;
    });
  }, [adminId, dispatch]);

  const dismissNotification = useCallback((id) => {
    setDismissedIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      saveStoredIds(STORAGE_KEY_DISMISSED, next);
      return next;
    });
    notificationService.dismiss(id, adminId);
  }, [adminId]);

  const clearAll = useCallback(() => {
    setNotifications((current) => {
      const ids = current.map((n) => n.id);
      setDismissedIds((prev) => {
        const combined = Array.from(new Set([...prev, ...ids]));
        saveStoredIds(STORAGE_KEY_DISMISSED, combined);
        return combined;
      });
      notificationService.dismiss(ids, adminId);
      return current;
    });
  }, [adminId]);

  const activeNotifications = useMemo(() => {
    const dismissedSet = new Set(dismissedIds);
    const readSet = new Set(readIds);

    return notifications
      .filter((n) => !dismissedSet.has(n.id))
      .map((n) => ({
        ...n,
        isRead: readSet.has(n.id),
        timeAgo: formatTimeAgo(n.timestamp),
      }));
  }, [notifications, dismissedIds, readIds]);

  const unreadCount = useMemo(() => {
    return activeNotifications.filter((n) => !n.isRead).length;
  }, [activeNotifications]);

  const countsByType = useMemo(() => {
    const counts = { all: activeNotifications.length, inventory: 0, order: 0, customer: 0 };
    activeNotifications.forEach((n) => {
      if (counts[n.type] !== undefined) {
        counts[n.type]++;
      }
    });
    return counts;
  }, [activeNotifications]);

  const value = {
    notifications: activeNotifications,
    unreadCount,
    countsByType,
    loading,
    lastUpdated,
    socketConnected,
    refresh: fetchNotificationData,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    dismissNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  unreadCount: 0,
  isMuted: false,
};

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload || [];
      state.unreadCount = state.notifications.filter((n) => !n.read).length;
    },
    addNotification: (state, action) => {
      const item = action.payload;
      state.notifications.unshift(item);
      if (!item.read) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action) => {
      const id = action.payload;
      const target = state.notifications.find((n) => n.id === id);
      if (target && !target.read) {
        target.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.read = true;
      });
      state.unreadCount = 0;
    },
    toggleMute: (state) => {
      state.isMuted = !state.isMuted;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  toggleMute,
} = notificationSlice.actions;

export const selectNotifications = (state) => state.notifications.notifications;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const selectIsMuted = (state) => state.notifications.isMuted;

export default notificationSlice.reducer;
